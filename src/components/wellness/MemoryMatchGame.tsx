import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Clock, Zap, Heart, Brain, Smile, Sun, Moon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Card {
  id: number;
  icon: React.ElementType;
  isFlipped: boolean;
  isMatched: boolean;
}

const icons = [Heart, Brain, Smile, Sun, Moon, Star, Zap, Trophy];

type Difficulty = 'easy' | 'medium' | 'hard';

const difficultyConfig = {
  easy: { pairs: 4, gridCols: 4 },
  medium: { pairs: 6, gridCols: 4 },
  hard: { pairs: 8, gridCols: 4 },
};

export function MemoryMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const initializeGame = useCallback(() => {
    const { pairs } = difficultyConfig[difficulty];
    const selectedIcons = icons.slice(0, pairs);
    
    const cardPairs = [...selectedIcons, ...selectedIcons].map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false,
    }));

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    setCards(cardPairs);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
    setGameComplete(false);
    setTimer(0);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  // Check for match
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.icon === secondCard.icon) {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === first || idx === second
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatches(prev => prev + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map((card, idx) =>
              idx === first || idx === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  // Check for game complete
  useEffect(() => {
    const { pairs } = difficultyConfig[difficulty];
    if (matches === pairs && matches > 0) {
      setGameComplete(true);
      if (!bestTime || timer < bestTime) {
        setBestTime(timer);
      }
    }
  }, [matches, difficulty, timer, bestTime]);

  const handleCardClick = (index: number) => {
    if (!gameStarted) setGameStarted(true);
    
    if (
      flippedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    setCards(prev =>
      prev.map((card, idx) =>
        idx === index ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards(prev => [...prev, index]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { pairs, gridCols } = difficultyConfig[difficulty];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-lg">Memory Match</h3>
          <p className="text-sm text-muted-foreground">Match pairs to exercise your brain!</p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex p-1 bg-muted rounded-lg">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level);
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                difficulty === level 
                  ? "bg-card shadow-sm text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span className="font-mono font-medium">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <span className="font-medium">{moves} moves</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-emerald-500" />
            <span className="font-medium">{matches}/{pairs}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={initializeGame}>
          <RotateCcw size={16} className="mr-2" />
          Restart
        </Button>
      </div>

      {/* Game Grid */}
      <div 
        className={cn(
          "grid gap-3",
          gridCols === 4 ? "grid-cols-4" : "grid-cols-4"
        )}
      >
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={cn(
              "aspect-square rounded-xl transition-all cursor-pointer",
              card.isFlipped || card.isMatched
                ? "bg-primary text-white"
                : "bg-card border-2 border-border hover:border-primary/50"
            )}
            whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              rotateY: card.isFlipped || card.isMatched ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {(card.isFlipped || card.isMatched) && (
                <motion.div
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 180 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <card.icon size={28} className={card.isMatched ? "text-white" : "text-white"} />
                </motion.div>
              )}
            </AnimatePresence>
            {!card.isFlipped && !card.isMatched && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Game Complete Modal */}
      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={initializeGame}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-8 max-w-sm w-full text-center shadow-xl"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">Congratulations! 🎉</h3>
              <p className="text-muted-foreground mb-6">
                You completed the {difficulty} level in {formatTime(timer)} with {moves} moves!
              </p>
              
              {bestTime && (
                <p className="text-sm text-primary font-medium mb-4">
                  🏆 Best Time: {formatTime(bestTime)}
                </p>
              )}

              <div className="space-y-3">
                <Button className="w-full btn-hero" onClick={initializeGame}>
                  Play Again
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  const nextLevel = difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy';
                  setDifficulty(nextLevel);
                }}>
                  Try {difficulty === 'hard' ? 'Easy' : difficulty === 'easy' ? 'Medium' : 'Hard'} Level
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
