import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  User,
  Activity,
  FileText,
  Clock,
  AlertTriangle,
  Heart,
  Droplets
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PrescriptionPad } from './PrescriptionPad';

// Type definition for appointment data - matches API response
interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  patientEmail?: string;
  patientPhone?: string;
  age: number | null;
  gender: string;
  bloodGroup?: string;
  allergies?: string;
  time: string;
  date?: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  conditions: string[];
  notes?: string;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  message: string;
  timestamp: string;
}

interface DoctorConsultationProps {
  appointment: DoctorAppointment;
  onEndCall: () => void;
}

export function DoctorConsultation({ appointment, onEndCall }: DoctorConsultationProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'vitals' | 'history' | 'prescription'>('vitals');
  const [callDuration, setCallDuration] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Start webcam
  useEffect(() => {
    if (!isVideoOff && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error('Webcam error:', err));
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isVideoOff]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'doctor',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleIssuePrescription = (prescription: { diagnosis: string; medicines: any[]; advice: string }) => {
    console.log('Prescription issued:', prescription);
    // In a real app, this would save to the database
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4">
      {/* Left Panel - Video & Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative bg-gray-900 rounded-xl overflow-hidden mb-4"
          style={{ height: '50%' }}
        >
          {/* Patient Video (Main) */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center text-white/50">
              <img
                src={appointment.patientAvatar}
                alt={appointment.patientName}
                className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white/20"
              />
              <p className="font-medium">{appointment.patientName}</p>
              <p className="text-sm text-white/40">Video call in progress</p>
            </div>
          </div>

          {/* Doctor Video (PiP) */}
          <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-gray-800">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <User size={32} className="text-white/50" />
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Call Duration */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-medium">{formatDuration(callDuration)}</span>
          </div>

          {/* Patient Info Overlay */}
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
            <p className="text-white text-sm font-medium">{appointment.patientName}</p>
            <p className="text-white/60 text-xs">{appointment.age}y, {appointment.gender}</p>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isMuted ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              )}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isVideoOff ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              )}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            <button
              onClick={onEndCall}
              className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </motion.div>

        {/* Chat Section */}
        <div className="flex-1 bg-card rounded-xl border border-border flex flex-col min-h-0">
          <div className="p-3 border-b border-border">
            <h3 className="font-medium text-sm">Chat with {appointment.patientName}</h3>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-3"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender === 'doctor' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                    msg.sender === 'doctor'
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-muted rounded-bl-none"
                  )}>
                    <p>{msg.message}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      msg.sender === 'doctor' ? "text-white/70" : "text-muted-foreground"
                    )}>{msg.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 h-9"
              />
              <Button size="sm" onClick={sendMessage} className="h-9">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Patient Data & Prescription */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-96 flex flex-col min-h-0"
      >
        {/* Patient Summary */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={appointment.patientAvatar}
              alt={appointment.patientName}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1">
              <h3 className="font-medium">{appointment.patientName}</h3>
              <p className="text-sm text-muted-foreground">
                {appointment.age}y, {appointment.gender}
                {appointment.bloodGroup && ` • ${appointment.bloodGroup}`}
              </p>
            </div>
          </div>

          {/* Conditions/Allergies */}
          {appointment.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {appointment.conditions.map((condition) => (
                <span
                  key={condition}
                  className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1"
                >
                  <AlertTriangle size={10} />
                  {condition}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            <Clock size={12} className="inline mr-1" />
            Reason: {appointment.reason}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
          {[
            { id: 'vitals', label: 'Vitals', icon: Activity },
            { id: 'history', label: 'History', icon: FileText },
            { id: 'prescription', label: 'Rx Pad', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all",
                activeTab === tab.id
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-card rounded-xl border border-border p-4 overflow-y-auto">
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                Vitals History (7 Days)
              </h4>
              <div className="h-48 flex items-center justify-center border border-dashed rounded-lg">
                <span className="text-muted-foreground text-sm">No vitals data available</span>
              </div>

              {/* Quick Vitals */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart size={12} className="text-rose-500" />
                    Blood Pressure
                  </p>
                  <p className="font-display font-bold text-lg">--/--</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Droplets size={12} className="text-blue-500" />
                    Blood Sugar
                  </p>
                  <p className="font-display font-bold text-lg">-- mg/dL</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity size={12} className="text-emerald-500" />
                    Heart Rate
                  </p>
                  <p className="font-display font-bold text-lg">-- bpm</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">SpO2</p>
                  <p className="font-display font-bold text-lg">--%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                Past Prescriptions
              </h4>
              <div className="text-center py-8 text-muted-foreground">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p>No prescription history</p>
              </div>
            </div>
          )}

          {activeTab === 'prescription' && (
            <PrescriptionPad
              patientName={appointment.patientName}
              onIssuePrescription={handleIssuePrescription}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
