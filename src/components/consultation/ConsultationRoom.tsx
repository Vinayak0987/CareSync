import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare,
  Send, FileText, Maximize2, Minimize2, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { socketService } from '@/lib/socket';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  message: string;
  timestamp: string;
}

interface ConsultationRoomProps {
  onNavigate: (tab: string) => void;
  appointmentId?: string;
  doctorInfo?: {
    _id: string;
    name: string;
    avatar?: string;
    specialty?: string;
  };
}

export function ConsultationRoom({ onNavigate, appointmentId: propsAppointmentId, doctorInfo: propsDoctorInfo }: ConsultationRoomProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const processRef = useRef(true);

  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Get active consultation from localStorage (set when "Join Call" is clicked)
  const consultationStr = localStorage.getItem('activeConsultation');
  const consultation = consultationStr ? JSON.parse(consultationStr) : null;

  // Use props if provided, otherwise fall back to localStorage
  const appointmentId = propsAppointmentId || consultation?.appointmentId;
  const doctor = propsDoctorInfo || (consultation ? {
    _id: consultation.doctorId,
    name: consultation.doctorName,
    avatar: consultation.doctorAvatar,
    specialty: consultation.doctorSpecialty
  } : {
    _id: '',
    name: 'Doctor',
    avatar: '',
    specialty: 'General Physician'
  });

  // Validate we have a real appointment
  if (!appointmentId || !appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
    return (
      <div className="flex items-center justify-center min-h-[400px] flex-col gap-4">
        <p className="text-muted-foreground">No active consultation found.</p>
        <Button onClick={() => onNavigate('appointments')}>
          Go to Appointments
        </Button>
      </div>
    );
  }

  useEffect(() => {
    processRef.current = true;

    // Connect socket
    const socket = socketService.connect();

    // Join appointment room
    socketService.joinAppointment(appointmentId);

    // --- WebRTC Setup ---
    const startWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (!processRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Show local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true; // Avoid feedback
        }

        // Initialize PeerConnection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        });

        peerConnectionRef.current = peerConnection;

        // Add local tracks to PeerConnection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socketService.sendIceCandidate(appointmentId, event.candidate);
          }
        };

        // --- Signaling Listeners ---

        // Listen for incoming call (Offer)
        socketService.onCallMade(async ({ offer }) => {
          try {
            if ((peerConnection.signalingState as string) === 'closed') return;

            if (peerConnection.signalingState !== 'stable') {
              // Determine if we need to rollback to accept new offer or just ignore
              // Simple handling:
              await Promise.all([
                peerConnection.setLocalDescription({ type: "rollback" }),
                peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
              ]);
            } else {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            }

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketService.makeAnswer(appointmentId, answer);
          } catch (e) {
            console.error("Error handling call offer:", e);
          }
        });

        // Listen for Answer
        socketService.onAnswerMade(async ({ answer }) => {
          try {
            if ((peerConnection.signalingState as string) === 'closed') return;
            if (peerConnection.signalingState === 'have-local-offer') {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
          } catch (e) {
            console.error("Error setting remote description from answer:", e);
          }
        });

        // Listen for ICE Candidates
        socketService.onIceCandidateReceived(async ({ candidate }) => {
          try {
            if ((peerConnection.signalingState as string) === 'closed') return;
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding ice candidate:", e);
          }
        });

        // Auto-call (patient calls doctor)
        // Wait briefly for socket to maximize connect chance
        setTimeout(async () => {
          if (!processRef.current) return;
          if ((peerConnection.signalingState as string) === 'closed') return;

          try {
            const offer = await peerConnection.createOffer();
            if ((peerConnection.signalingState as string) === 'closed') return;
            await peerConnection.setLocalDescription(offer);
            socketService.callUser(appointmentId, offer);
          } catch (e) {
            console.error("Error creating offer:", e);
          }
        }, 1000);

      } catch (err: any) {
        console.error("Error accessing media devices.", err);
        setPermissionDenied(true);

        if (!navigator.mediaDevices) {
          toast.error("Media devices API not supported. Check HTTPS/Localhost.");
          return;
        }

        if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
          toast.error("Access Denied: Please allow camera/mic in BOTH Browser and System Settings.");
        } else if (err.name === 'NotFoundError') {
          toast.error("No camera or microphone found. Please connect a device.");
        } else if (err.name === 'NotReadableError') {
          toast.error("Camera/Mic is busy. Close other apps using it.");
        } else if (err.name === 'SecurityError') {
          toast.error("Security Error: Ensure you are using HTTPS or localhost.");
        } else {
          toast.error(`Camera Error: ${err.message || "Unknown error"}`);
        }
      }
    };

    startWebRTC();

    // Listen for incoming messages
    socketService.onReceiveMessage((message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Handle errors
    socketService.onMessageError((error) => {
      toast.error(error.error || 'Failed to send message');
    });

    // Cleanup
    return () => {
      processRef.current = false;
      // Stop all tracks
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socketService.leaveAppointment(appointmentId);
      socketService.offReceiveMessage();
      socketService.offWebRTC();
      socketService.disconnect();
    };
  }, [appointmentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle Mute/Video logic
  useEffect(() => {
    // Access stream from the video element directly or store in state
    // videoRef.current!.srcObject is strictly typed, casting needed or cleaner state mgmt
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      stream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    socketService.sendMessage({
      appointmentId,
      senderId: user._id,
      senderRole: 'patient',
      message: newMessage,
    });

    setNewMessage('');
  };

  const endCall = () => {
    onNavigate('home');
  };

  return (
    <div className={cn(
      "space-y-4",
      isFullscreen && "fixed inset-0 z-50 bg-background p-4"
    )}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background" />
          </div>
          <div>
            <h1 className="font-display font-semibold">{doctor.name}</h1>
            <p className="text-sm text-success">In consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={cn(showChat && "bg-primary text-primary-foreground")}
          >
            <MessageSquare size={18} />
          </Button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-4" style={{ height: isFullscreen ? 'calc(100vh - 140px)' : '70vh' }}>
        {/* Video Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "relative bg-foreground/5 rounded-2xl overflow-hidden",
            showChat ? "lg:col-span-2" : "lg:col-span-3"
          )}
        >
          {/* Remote Video (Doctor) */}
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Fallback/Loader if video not ready */}
            {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white/50">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 ring-4 ring-white/20 opacity-50"
                  />
                  <p className="text-lg font-medium">Connecting...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Self view PiP) */}
          <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-28 bg-foreground/10 rounded-xl overflow-hidden border-2 border-background shadow-lg z-10">
            {permissionDenied ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
                <VideoOff size={32} className="mb-2 text-alert" />
                <span className="font-semibold text-sm mb-1">Camera/Mic Access Denied</span>
                <p className="text-xs mb-3 max-w-[200px]">
                  Please enable camera access in your <strong>System Settings</strong> and <strong>Browser Permissions</strong>.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-primary"
                    onClick={() => {
                      setPermissionDenied(false);
                      // Re-trigger the useEffect dependecy or calling a ref-held function would be better, 
                      // but specific function calls inside render are tricky. 
                      // Best is to reload or reset state that triggers effect.
                      // For now, reload is safest for permission reset.
                      window.location.reload();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <User size={32} className="text-muted-foreground" />
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            )}
          </div>

          {/* Call timer */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-foreground/80 text-background rounded-full text-sm font-medium z-10">
            12:34
          </div>
        </motion.div>

        {/* Chat Panel */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-medium flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Chat
              </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === 'patient' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5",
                      msg.sender === 'patient'
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.sender === 'patient' ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-4"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "w-14 h-14 rounded-full",
            isMuted && "bg-alert/10 border-alert text-alert hover:bg-alert/20"
          )}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={cn(
            "w-14 h-14 rounded-full",
            isVideoOff && "bg-alert/10 border-alert text-alert hover:bg-alert/20"
          )}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </Button>

        <Button
          onClick={endCall}
          size="lg"
          className="w-14 h-14 rounded-full bg-alert hover:bg-alert/90"
        >
          <Phone size={22} className="rotate-[135deg]" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full"
        >
          <FileText size={22} />
        </Button>
      </motion.div>
    </div>
  );
}
