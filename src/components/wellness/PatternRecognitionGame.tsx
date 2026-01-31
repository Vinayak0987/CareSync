import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Grid3X3, Trophy, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export function PatternRecognitionGame() {
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'input' | 'success' | 'fail'>('idle');
  const [showingIndex, setShowingIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gridSize = Math.min(3 + Math.floor(level / 3), 5);

  const generatePattern = useCallback((length: number) => {
    const newPattern: number[] = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(Math.floor(Math.random() * (gridSize * gridSize)));
    }
    return newPattern;
  }, [gridSize]);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    startLevel(1);
  };

  const startLevel = (lvl: number) => {
    const patternLength = lvl + 2;
    const newPattern = generatePattern(patternLength);
    setPattern(newPattern);
    setUserPattern([]);
    setGameState('showing');
    setShowingIndex(-1);
    
    // Show pattern sequence
    let idx = 0;
    const showNext = () => {
      if (idx < newPattern.length) {
        setShowingIndex(newPattern[idx]);
        setTimeout(() => {
          setShowingIndex(-1);
          idx++;
          setTimeout(showNext, 200);
        }, 600);
      } else {
        setGameState('input');
      }
    };
    setTimeout(showNext, 500);
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'input') return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    if (index !== pattern[newUserPattern.length - 1]) {
      // Wrong!
      setGameState('fail');
      if (score > highScore) setHighScore(score);
      return;
    }

    if (newUserPattern.length === pattern.length) {
      // Correct!
      setScore(score + level * 10);
      setGameState('success');
      setTimeout(() => {
        setLevel(level + 1);
        startLevel(level + 1);
      }, 1000);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className="text-center py-8 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Grid3X3 size={40} className="text-primary" />
        </div>
        <h2 className="font-display font-semibold text-xl mb-2">Pattern Recognition</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Watch the pattern, then repeat it in the same order.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          High Score: <strong className="text-primary">{highScore}</strong>
        </p>
        <Button onClick={startGame} className="btn-hero">
          <Brain size={16} className="mr-2" />
          Start Game
        </Button>

        {/* Benefits */}
        <div className="mt-8 p-4 bg-purple-50 rounded-xl text-left">
          <p className="text-sm font-medium text-purple-800 mb-2">🧩 Benefits:</p>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• Strengthens short-term memory</li>
            <li>• Improves pattern recognition skills</li>
            <li>• Enhances visual-spatial processing</li>
            <li>• Boosts working memory capacity</li>
          </ul>
        </div>
      </div>
    );
  }

  if (gameState === 'fail') {
    return (
      <div className="text-center py-8 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">😔</span>
        </div>
        <h3 className="text-xl font-display font-bold mb-2">Game Over!</h3>
        <p className="text-muted-foreground mb-4">You reached level {level}</p>
        
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-muted/50 rounded-xl p-4 px-6">
            <p className="text-2xl font-bold text-primary">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 px-6">
            <p className="text-2xl font-bold text-amber-500">{highScore}</p>
            <p className="text-xs text-muted-foreground">High Score</p>
          </div>
        </div>

        <Button onClick={startGame} className="btn-hero">
          <RotateCcw size={16} className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm">Level: <strong className="text-primary">{level}</strong></span>
        <span className="text-sm">Score: <strong className="text-primary">{score}</strong></span>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        <motion.p
          key={gameState}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-sm font-medium",
            gameState === 'showing' && "text-amber-600",
            gameState === 'input' && "text-primary",
            gameState === 'success' && "text-emerald-600"
          )}
        >
          {gameState === 'showing' && '👀 Watch carefully...'}
          {gameState === 'input' && `🎯 Your turn! (${userPattern.length}/${pattern.length})`}
          {gameState === 'success' && '✨ Perfect!'}
        </motion.p>
      </div>

      {/* Grid */}
      <div 
        className="grid gap-2 p-4 bg-muted/30 rounded-2xl"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => handleCellClick(i)}
            disabled={gameState !== 'input'}
            animate={{
              scale: showingIndex === i ? 1.1 : 1,
              backgroundColor: showingIndex === i 
                ? COLORS[i % COLORS.length] 
                : userPattern.includes(i) 
                  ? '#0ea5e9'
                  : '#e5e7eb'
            }}
            className={cn(
              "aspect-square rounded-xl transition-colors",
              gameState === 'input' && "hover:opacity-80 cursor-pointer"
            )}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Pattern length: {pattern.length} tiles
      </p>
    </div>
  );
}
