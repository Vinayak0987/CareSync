import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Target, Trophy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FocusTrainingGame() {
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'result'>('idle');
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [targetSize, setTargetSize] = useState(60);

  const moveTarget = useCallback(() => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 70 + 15;
    setTargetPosition({ x, y });
    // Make target smaller as game progresses
    setTargetSize(Math.max(30, 60 - (hits * 2)));
  }, [hits]);

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      moveTarget();
    }
  }, [gameState, countdown, moveTarget]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('result');
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(30);
    setCountdown(3);
    setTargetSize(60);
    setGameState('countdown');
  };

  const handleTargetClick = () => {
    setHits(hits + 1);
    setScore(score + Math.ceil(targetSize / 2));
    moveTarget();
  };

  const handleMiss = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setMisses(misses + 1);
      setScore(Math.max(0, score - 5));
    }
  };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  if (gameState === 'idle') {
    return (
      <div className="text-center py-8 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Target size={40} className="text-primary" />
        </div>
        <h2 className="font-display font-semibold text-xl mb-2">Focus Training</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Click the moving targets as quickly as possible to train your focus and reaction time.
        </p>
        <Button onClick={startGame} className="btn-hero">
          <Eye size={16} className="mr-2" />
          Start Training
        </Button>

        {/* Benefits */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl text-left">
          <p className="text-sm font-medium text-blue-800 mb-2">🎯 Benefits:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Improves concentration and attention span</li>
            <li>• Enhances hand-eye coordination</li>
            <li>• Sharpens reflexes and reaction time</li>
            <li>• Reduces mental fatigue through engagement</li>
          </ul>
        </div>
      </div>
    );
  }

  if (gameState === 'countdown') {
    return (
      <div className="text-center py-16">
        <motion.div
          key={countdown}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          className="text-8xl font-display font-bold text-primary"
        >
          {countdown}
        </motion.div>
        <p className="text-muted-foreground mt-4">Get Ready!</p>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="text-center py-8 max-w-md mx-auto">
        <Trophy size={64} className="mx-auto text-amber-500 mb-4" />
        <h3 className="text-2xl font-display font-bold mb-2">Training Complete!</h3>
        
        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-2xl font-bold text-primary">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-600">{hits}</p>
            <p className="text-xs text-muted-foreground">Hits</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-2xl font-bold text-primary">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <Button onClick={startGame} className="btn-hero">
          <RotateCcw size={16} className="mr-2" />
          Train Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm">
          <span>Score: <strong className="text-primary">{score}</strong></span>
          <span>Hits: <strong className="text-emerald-600">{hits}</strong></span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          timeLeft <= 10 ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"
        )}>
          {timeLeft}s
        </div>
      </div>

      {/* Game Area */}
      <div
        onClick={handleMiss}
        className="relative bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl h-80 overflow-hidden cursor-crosshair"
      >
        <motion.button
          key={`${targetPosition.x}-${targetPosition.y}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handleTargetClick}
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            width: targetSize,
            height: targetSize,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/80 shadow-lg flex items-center justify-center transition-colors"
        >
          <Target size={targetSize * 0.5} className="text-white" />
        </motion.button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Click the targets as fast as you can! Targets get smaller as you score.
      </p>
    </div>
  );
}
