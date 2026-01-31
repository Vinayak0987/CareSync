import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare, 
  Send, FileText, Maximize2, Minimize2, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { doctors, mockChatMessages, currentPatient, type ChatMessage } from '@/lib/mockData';

interface ConsultationRoomProps {
  onNavigate: (tab: string) => void;
}

export function ConsultationRoom({ onNavigate }: ConsultationRoomProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const doctor = doctors[0]; // Using first doctor for demo

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'patient',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, msg]);
    setNewMessage('');

    // Simulate doctor response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        message: 'Thank you for sharing that. Let me review your information.',
        timestamp: new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
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
          {/* Doctor Video (main) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/20"
              />
              <p className="text-lg font-medium">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">Video consultation in progress</p>
            </div>
          </div>

          {/* Self view (PiP) */}
          <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-28 bg-foreground/10 rounded-xl overflow-hidden border-2 border-background shadow-lg">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <User size={32} className="text-muted-foreground" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={currentPatient.avatar}
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Call timer */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-foreground/80 text-background rounded-full text-sm font-medium">
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
