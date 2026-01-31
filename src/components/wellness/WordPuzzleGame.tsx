import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Lightbulb, Trophy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const words = [
  { scrambled: 'HTLAEH', answer: 'HEALTH', hint: 'State of physical well-being' },
  { scrambled: 'TRHEA', answer: 'HEART', hint: 'Organ that pumps blood' },
  { scrambled: 'DNIM', answer: 'MIND', hint: 'Center of thoughts' },
  { scrambled: 'ARETX', answer: 'RELAX', hint: 'To become less tense' },
  { scrambled: 'EREBTHA', answer: 'BREATHE', hint: 'Inhale and exhale' },
  { scrambled: 'EPSLE', answer: 'SLEEP', hint: 'Rest for the body' },
  { scrambled: 'ACLM', answer: 'CALM', hint: 'Feeling of peace' },
  { scrambled: 'YNEERG', answer: 'ENERGY', hint: 'Power to do activities' },
  { scrambled: 'CSEIEEXR', answer: 'EXERCISE', hint: 'Physical activity' },
  { scrambled: 'NOICSUF', answer: 'FOCUS', hint: 'Concentrate attention' },
];

export function WordPuzzleGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentWord = words[currentIndex];

  const checkAnswer = () => {
    if (guess.toUpperCase().trim() === currentWord.answer) {
      setSolved(true);
      setScore(score + (showHint ? 5 : 10));
      setTimeout(() => {
        nextWord();
      }, 1000);
    }
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setGuess('');
      setShowHint(false);
      setSolved(false);
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setGuess('');
    setScore(0);
    setShowHint(false);
    setSolved(false);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="text-center py-8">
        <Trophy size={64} className="mx-auto text-amber-500 mb-4" />
        <h3 className="text-2xl font-display font-bold mb-2">Congratulations!</h3>
        <p className="text-muted-foreground mb-4">You completed all {words.length} words!</p>
        <p className="text-3xl font-bold text-primary mb-6">Score: {score}</p>
        <Button onClick={resetGame} className="btn-hero">
          <RotateCcw size={16} className="mr-2" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="font-display font-semibold text-xl mb-1">Word Puzzle</h2>
        <p className="text-sm text-muted-foreground">Unscramble the letters to find the word</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted-foreground">
          Word {currentIndex + 1} of {words.length}
        </span>
        <span className="text-sm font-medium">
          Score: <span className="text-primary">{score}</span>
        </span>
      </div>

      {/* Scrambled Word */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 mb-6 text-center">
        <div className="flex justify-center gap-2 mb-4">
          {currentWord.scrambled.split('').map((letter, i) => (
            <motion.span
              key={i}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: solved ? 360 : 0 }}
              className="w-10 h-12 bg-card border-2 border-primary/30 rounded-lg flex items-center justify-center text-xl font-bold text-primary shadow-sm"
            >
              {letter}
            </motion.span>
          ))}
        </div>
        
        {showHint && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            💡 Hint: {currentWord.hint}
          </motion.p>
        )}
      </div>

      {/* Input */}
      <div className="space-y-4">
        <Input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="Type your answer..."
          className="text-center text-lg h-12"
          disabled={solved}
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowHint(true)}
            disabled={showHint || solved}
            className="flex-1"
          >
            <Lightbulb size={16} className="mr-2" />
            Hint (-5 pts)
          </Button>
          <Button onClick={checkAnswer} disabled={!guess.trim() || solved} className="flex-1 btn-hero">
            {solved ? (
              <>
                <CheckCircle size={16} className="mr-2" />
                Correct!
              </>
            ) : (
              'Check'
            )}
          </Button>
        </div>

        <Button variant="ghost" onClick={nextWord} className="w-full" disabled={solved}>
          Skip Word
        </Button>
      </div>

      {/* Benefits */}
      <div className="mt-8 p-4 bg-emerald-50 rounded-xl">
        <p className="text-sm font-medium text-emerald-800 mb-2">🧠 Benefits:</p>
        <ul className="text-xs text-emerald-700 space-y-1">
          <li>• Improves vocabulary and language skills</li>
          <li>• Enhances problem-solving abilities</li>
          <li>• Boosts cognitive flexibility</li>
          <li>• Keeps the brain active and sharp</li>
        </ul>
      </div>
    </div>
  );
}
