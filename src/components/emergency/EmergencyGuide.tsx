import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Phone, Heart, Droplet, Activity, X, 
  Ambulance, MapPin, Clock, CheckCircle, ChevronRight,
  Flame, Wind, Brain, Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmergencyGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const emergencyGuides = [
  {
    id: 'heart-attack',
    title: 'Heart Attack',
    icon: Heart,
    color: 'bg-red-500',
    symptoms: ['Chest pain or pressure', 'Pain in arm, jaw, or back', 'Shortness of breath', 'Cold sweat, nausea'],
    steps: [
      'Call 108 (Ambulance) immediately',
      'Make the person sit or lie down',
      'Loosen tight clothing',
      'Give aspirin if available (and not allergic)',
      'Be ready to perform CPR if unconscious',
    ],
  },
  {
    id: 'stroke',
    title: 'Stroke (Brain Attack)',
    icon: Brain,
    color: 'bg-purple-500',
    symptoms: ['Face drooping on one side', 'Arm weakness', 'Slurred speech', 'Sudden confusion'],
    steps: [
      'Remember FAST: Face, Arms, Speech, Time',
      'Call 108 immediately - time is critical!',
      'Note the time symptoms started',
      'Keep person still and comfortable',
      'Do NOT give food or water',
    ],
  },
  {
    id: 'choking',
    title: 'Choking',
    icon: Wind,
    color: 'bg-amber-500',
    symptoms: ['Cannot speak or cry', 'Difficulty breathing', 'Skin turning blue', 'Clutching throat'],
    steps: [
      'Ask "Are you choking?" - if they nod, act fast',
      'Stand behind them, make a fist above navel',
      'Give 5 quick upward thrusts (Heimlich)',
      'Repeat until object comes out',
      'Call 108 if person becomes unconscious',
    ],
  },
  {
    id: 'low-sugar',
    title: 'Low Blood Sugar',
    icon: Droplet,
    color: 'bg-blue-500',
    symptoms: ['Shakiness, sweating', 'Fast heartbeat', 'Confusion, dizziness', 'Hunger, weakness'],
    steps: [
      'Give something sweet immediately',
      '3-4 glucose tablets OR 4 oz juice OR candy',
      'Wait 15 minutes, check sugar if possible',
      'Repeat if still feeling unwell',
      'Seek medical help if not improving',
    ],
  },
  {
    id: 'high-bp',
    title: 'Very High BP Crisis',
    icon: Activity,
    color: 'bg-orange-500',
    symptoms: ['Severe headache', 'Chest pain', 'Blurred vision', 'Difficulty breathing'],
    steps: [
      'Make person lie down and relax',
      'Loosen any tight clothing',
      'Take BP medication if prescribed',
      'Call doctor or go to ER immediately',
      'Do NOT take extra doses without asking',
    ],
  },
  {
    id: 'burn',
    title: 'Burns & Scalds',
    icon: Flame,
    color: 'bg-rose-500',
    symptoms: ['Red, painful skin', 'Blisters', 'White or charred skin (severe)', 'Swelling'],
    steps: [
      'Cool under running water for 10-20 mins',
      'Remove jewelry near burn area',
      'Cover loosely with clean cloth',
      'Do NOT apply ice, butter, or toothpaste',
      'Seek medical help for large burns',
    ],
  },
];

export function EmergencyGuide({ isOpen, onClose }: EmergencyGuideProps) {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const guide = emergencyGuides.find(g => g.id === selectedGuide);

  const callEmergency = () => {
    window.location.href = 'tel:108';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5 text-white relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Emergency Guide</h2>
                  <p className="text-white/80 text-sm">Quick help for health emergencies</p>
                </div>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                {!selectedGuide ? (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Emergency Call Button */}
                    <button
                      onClick={callEmergency}
                      className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white mb-4 flex items-center justify-center gap-3 hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                    >
                      <Phone size={24} className="animate-pulse" />
                      <div className="text-left">
                        <p className="font-bold text-lg">Call 108 - Ambulance</p>
                        <p className="text-sm text-white/80">Tap to call emergency services</p>
                      </div>
                    </button>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-3 bg-blue-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-blue-600">108</p>
                        <p className="text-xs text-blue-700">Ambulance</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-green-600">112</p>
                        <p className="text-xs text-green-700">Police/Fire</p>
                      </div>
                    </div>

                    {/* Guide List */}
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Select emergency type for help:
                    </p>
                    <div className="space-y-2">
                      {emergencyGuides.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedGuide(item.id)}
                          className="w-full p-3 bg-muted/50 hover:bg-muted rounded-xl flex items-center gap-3 transition-colors text-left"
                        >
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", item.color)}>
                            <item.icon size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.symptoms[0]}</p>
                          </div>
                          <ChevronRight size={18} className="text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedGuide(null)}
                      className="flex items-center gap-2 text-primary mb-4 hover:underline text-sm font-medium"
                    >
                      ← Back to all guides
                    </button>

                    {guide && (
                      <>
                        {/* Guide Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", guide.color)}>
                            <guide.icon size={24} />
                          </div>
                          <h3 className="text-xl font-bold">{guide.title}</h3>
                        </div>

                        {/* Symptoms */}
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                            Signs to look for:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {guide.symptoms.map((symptom, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Steps */}
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            What to do:
                          </p>
                          <div className="space-y-2">
                            {guide.steps.map((step, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                              >
                                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {i + 1}
                                </span>
                                <p className="text-sm">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Call Button */}
                        <button
                          onClick={callEmergency}
                          className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white flex items-center justify-center gap-3 hover:from-red-600 hover:to-red-700 transition-all"
                        >
                          <Phone size={20} />
                          <span className="font-bold">Call 108 Now</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating Emergency Button Component
export function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center"
      >
        <AlertTriangle size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-red-500 animate-ping" />
      </motion.button>

      <EmergencyGuide isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
