import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Play, RotateCcw, User, Gamepad2, Wind, ThumbsUp, Brain, Target, Grid3X3, Timer, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MemoryMatchGame } from './MemoryMatchGame';
import { WordPuzzleGame } from './WordPuzzleGame';
import { FocusTrainingGame } from './FocusTrainingGame';
import { PatternRecognitionGame } from './PatternRecognitionGame';
import { MeditationTimer } from './MeditationTimer';

type WellnessTab = 'breathPacer' | 'memoryMatch' | 'wordPuzzle' | 'focusTraining' | 'patternRecognition' | 'meditation';

const gameTabs = [
  { id: 'memoryMatch', label: 'Memory Match', icon: Gamepad2, color: 'text-pink-500' },
  { id: 'breathPacer', label: 'Mindful Breathing', icon: Wind, color: 'text-cyan-500' },
  { id: 'wordPuzzle', label: 'Word Puzzle', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'focusTraining', label: 'Focus Training', icon: Target, color: 'text-blue-500' },
  { id: 'patternRecognition', label: 'Pattern Recognition', icon: Grid3X3, color: 'text-purple-500' },
  { id: 'meditation', label: 'Meditation Timer', icon: Timer, color: 'text-amber-500' },
];

export function WellnessView() {
  const [activeTab, setActiveTab] = useState<WellnessTab>('memoryMatch');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [gameScore, setGameScore] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startBreathing = () => {
    setBreathPhase('inhale');
    setGameScore(0);

    let phase = 0;
    const phases = ['inhale', 'hold', 'exhale'] as const;

    intervalRef.current = setInterval(() => {
      phase = (phase + 1) % 3;
      setBreathPhase(phases[phase]);
      if (phase === 0) {
        setGameScore(s => s + 1);
      }
    }, 4000);
  };

  const stopBreathing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBreathPhase('idle');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Games & Activity</h1>
        <p className="text-muted-foreground">Train your mind with fun games and relaxation exercises</p>
      </motion.div>

      {/* Games Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {gameTabs.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              setActiveTab(game.id as WellnessTab);
              if (game.id !== 'breathPacer') stopBreathing();
            }}
            className={cn(
              "p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2",
              activeTab === game.id
                ? "bg-primary/5 border-primary shadow-md"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <game.icon
              size={24}
              className={activeTab === game.id ? "text-primary" : game.color}
            />
            <span className={cn(
              "text-xs font-medium",
              activeTab === game.id ? "text-primary" : "text-muted-foreground"
            )}>
              {game.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Breath Pacer Tab */}
      {activeTab === 'breathPacer' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-8 border border-border shadow-sm max-w-md mx-auto text-center"
        >
          <h2 className="font-display font-semibold text-xl mb-1">Mindful Breathing</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Follow the circle to practice deep breathing (4-4-4 technique)
          </p>

          {/* Breathing Circle */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : breathPhase === 'exhale' ? 1 : 1,
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: breathPhase === 'inhale' ? 1.3 : breathPhase === 'hold' ? 1.3 : breathPhase === 'exhale' ? 1 : 1,
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-full bg-primary/40 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Wind size={24} className="text-primary-foreground" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Phase Label */}
          <div className="mb-6">
            <p className="text-2xl font-display font-semibold capitalize text-primary">
              {breathPhase === 'idle' ? 'Ready' : breathPhase}
            </p>
            {breathPhase !== 'idle' && (
              <p className="text-sm text-muted-foreground mt-1">
                {breathPhase === 'inhale' && 'Breathe in slowly...'}
                {breathPhase === 'hold' && 'Hold your breath...'}
                {breathPhase === 'exhale' && 'Breathe out gently...'}
              </p>
            )}
          </div>

          {/* Score */}
          {gameScore > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Cycles completed: <span className="font-bold text-primary">{gameScore}</span>
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {breathPhase === 'idle' ? (
              <Button onClick={startBreathing} className="btn-hero">
                <Play size={18} className="mr-2" />
                Start Session
              </Button>
            ) : (
              <Button onClick={stopBreathing} variant="outline">
                <RotateCcw size={18} className="mr-2" />
                Stop & Reset
              </Button>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-8 p-4 bg-cyan-50 rounded-xl text-left">
            <p className="text-sm font-medium text-cyan-800 mb-2">🌬️ Benefits:</p>
            <ul className="text-xs text-cyan-700 space-y-1">
              <li>• Activates the parasympathetic nervous system</li>
              <li>• Reduces stress hormones like cortisol</li>
              <li>• Improves focus and mental clarity</li>
              <li>• Helps lower blood pressure naturally</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Memory Match Tab */}
      {activeTab === 'memoryMatch' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-6 border border-border shadow-sm"
        >
          <MemoryMatchGame />

          {/* Benefits */}
          <div className="mt-6 p-4 bg-pink-50 rounded-xl">
            <p className="text-sm font-medium text-pink-800 mb-2">🧠 Benefits:</p>
            <ul className="text-xs text-pink-700 space-y-1">
              <li>• Enhances short-term memory retention</li>
              <li>• Improves visual recognition skills</li>
              <li>• Trains concentration and focus</li>
              <li>• Helps prevent cognitive decline</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Word Puzzle Tab */}
      {activeTab === 'wordPuzzle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-6 border border-border shadow-sm"
        >
          <WordPuzzleGame />
        </motion.div>
      )}

      {/* Focus Training Tab */}
      {activeTab === 'focusTraining' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-6 border border-border shadow-sm"
        >
          <FocusTrainingGame />
        </motion.div>
      )}

      {/* Pattern Recognition Tab */}
      {activeTab === 'patternRecognition' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-6 border border-border shadow-sm"
        >
          <PatternRecognitionGame />
        </motion.div>
      )}

      {/* Meditation Timer Tab */}
      {activeTab === 'meditation' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-6 border border-border shadow-sm"
        >
          <MeditationTimer />
        </motion.div>
      )}
    </div>
  );
}
