import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PRESETS = [
  { name: 'Quick Focus', duration: 5 * 60, color: 'bg-blue-500' },
  { name: 'Short Session', duration: 10 * 60, color: 'bg-emerald-500' },
  { name: 'Standard', duration: 15 * 60, color: 'bg-primary' },
  { name: 'Deep Calm', duration: 20 * 60, color: 'bg-purple-500' },
  { name: 'Extended', duration: 30 * 60, color: 'bg-amber-500' },
];

export function MeditationTimer() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[2]);
  const [timeLeft, setTimeLeft] = useState(PRESETS[2].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsRunning(false);
            setSessionComplete(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const selectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset);
    setTimeLeft(preset.duration);
    setIsRunning(false);
    setSessionComplete(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedPreset.duration);
    setSessionComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedPreset.duration - timeLeft) / selectedPreset.duration) * 100;

  if (sessionComplete) {
    return (
      <div className="text-center py-8 max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
        >
          <Bell size={48} className="text-emerald-600" />
        </motion.div>
        <h3 className="text-2xl font-display font-bold mb-2">Session Complete! 🧘</h3>
        <p className="text-muted-foreground mb-6">
          You completed a {selectedPreset.name.toLowerCase()} meditation.
        </p>

        <div className="bg-emerald-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-emerald-700">
            ✨ Take a moment to notice how you feel. Mindfulness practice can reduce stress and improve focus.
          </p>
        </div>

        <Button onClick={resetTimer} className="btn-hero">
          <RotateCcw size={16} className="mr-2" />
          Start Another Session
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="font-display font-semibold text-xl mb-1">Meditation Timer</h2>
        <p className="text-sm text-muted-foreground">
          Set your intention and find inner peace
        </p>
      </div>

      {/* Preset Selection */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => selectPreset(preset)}
            disabled={isRunning}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              selectedPreset.name === preset.name
                ? cn(preset.color, "text-white")
                : "bg-muted text-muted-foreground hover:bg-muted/80",
              isRunning && "opacity-50 cursor-not-allowed"
            )}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        {/* Progress Ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={2 * Math.PI * 120}
            animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            key={timeLeft}
            className="text-5xl font-display font-bold text-primary"
          >
            {formatTime(timeLeft)}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-2">
            {selectedPreset.name}
          </p>
        </div>

        {/* Breathing Pulse Animation */}
        {isRunning && (
          <motion.div
            className="absolute inset-4 rounded-full bg-primary/5"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-12 h-12 rounded-full"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>

        <Button
          onClick={toggleTimer}
          className={cn(
            "w-16 h-16 rounded-full",
            isRunning ? "bg-amber-500 hover:bg-amber-600" : "btn-hero"
          )}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw size={20} />
        </Button>
      </div>

      {/* Guidance */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-primary/5 rounded-xl"
        >
          <p className="text-sm text-primary">
            🧘 Breathe deeply... Focus on the present moment...
          </p>
        </motion.div>
      )}

      {/* Benefits */}
      {!isRunning && (
        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
          <p className="text-sm font-medium text-amber-800 mb-2">🕯️ Benefits:</p>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Reduces stress and anxiety levels</li>
            <li>• Improves emotional regulation</li>
            <li>• Enhances self-awareness and clarity</li>
            <li>• Promotes better sleep quality</li>
            <li>• Lowers blood pressure naturally</li>
          </ul>
        </div>
      )}
    </div>
  );
}
