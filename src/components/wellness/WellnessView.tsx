import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Play, RotateCcw, User, Gamepad2, Wind, ThumbsUp, Brain, Target, Grid3X3, Timer, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { communityPosts as initialCommunityPosts, type CommunityPost } from '@/lib/mockData';
import { MemoryMatchGame } from './MemoryMatchGame';
import { WordPuzzleGame } from './WordPuzzleGame';
import { FocusTrainingGame } from './FocusTrainingGame';
import { PatternRecognitionGame } from './PatternRecognitionGame';
import { MeditationTimer } from './MeditationTimer';

type WellnessTab = 'community' | 'breathPacer' | 'memoryMatch' | 'wordPuzzle' | 'focusTraining' | 'patternRecognition' | 'meditation';

const gameTabs = [
  { id: 'memoryMatch', label: 'Memory Match', icon: Gamepad2, color: 'text-pink-500' },
  { id: 'breathPacer', label: 'Mindful Breathing', icon: Wind, color: 'text-cyan-500' },
  { id: 'wordPuzzle', label: 'Word Puzzle', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'focusTraining', label: 'Focus Training', icon: Target, color: 'text-blue-500' },
  { id: 'patternRecognition', label: 'Pattern Recognition', icon: Grid3X3, color: 'text-purple-500' },
  { id: 'meditation', label: 'Meditation Timer', icon: Timer, color: 'text-amber-500' },
];

export function WellnessView() {
  const [activeTab, setActiveTab] = useState<WellnessTab>('community');
  const [posts, setPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [newPost, setNewPost] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('General');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [gameScore, setGameScore] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const topics = ['General', 'Heart Health', 'Diabetes', 'Mental Health', 'Anxiety', 'Fitness'];

  const createPost = () => {
    if (!newPost.trim()) return;
    const handles = ['SereneEagle', 'CalmBear', 'PeacefulDove', 'GentleWolf', 'KindFox'];
    const post: CommunityPost = {
      id: Date.now().toString(),
      username: handles[Math.floor(Math.random() * handles.length)] + '_' + Math.floor(Math.random() * 100),
      message: newPost,
      topic: selectedTopic,
      timestamp: 'Just now',
      likes: 0,
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const toggleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
    } else {
      newLiked.add(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    }
    setLikedPosts(newLiked);
  };

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
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Wellness Hub</h1>
        <p className="text-muted-foreground">Connect, relax, and train your mind</p>
      </motion.div>

      {/* Main Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('community')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'community' ? "bg-card shadow-sm" : "text-muted-foreground"
          )}
        >
          <MessageCircle size={16} />
          Community
        </button>
        <button
          onClick={() => setActiveTab('memoryMatch')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
            activeTab !== 'community' ? "bg-card shadow-sm" : "text-muted-foreground"
          )}
        >
          <Brain size={16} />
          Games & Wellness
        </button>
      </div>

      {/* Games Grid */}
      {activeTab !== 'community' && (
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
      )}

      {/* Community Tab */}
      {activeTab === 'community' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* New Post */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  placeholder="Share something with the community (anonymous)..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createPost()}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Topic:</span>
                  {topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full transition-colors",
                        selectedTopic === topic 
                          ? "bg-primary text-white" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                <Button onClick={createPost} disabled={!newPost.trim()} size="sm">
                  <Send size={14} className="mr-2" />
                  Post Anonymously
                </Button>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-5 border border-border shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {post.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-medium text-sm">{post.username}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {post.topic}
                    </span>
                    <span className="text-xs text-muted-foreground">• {post.timestamp}</span>
                  </div>
                  <p className="text-sm mb-3">{post.message}</p>
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm transition-colors",
                      likedPosts.has(post.id) 
                        ? "text-accent" 
                        : "text-muted-foreground hover:text-accent"
                    )}
                  >
                    <ThumbsUp size={16} className={likedPosts.has(post.id) ? "fill-current" : ""} />
                    <span>{post.likes}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
