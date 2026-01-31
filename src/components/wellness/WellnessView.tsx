import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Play, RotateCcw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CommunityPost {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  likes: number;
}

const initialPosts: CommunityPost[] = [
  { id: '1', author: 'User_847', message: 'Just completed my 30-day walking challenge! Feel so much better.', timestamp: '2 hours ago', likes: 12 },
  { id: '2', author: 'User_392', message: 'Any tips for managing stress? Work has been overwhelming lately.', timestamp: '4 hours ago', likes: 8 },
  { id: '3', author: 'User_156', message: 'The breathing exercises really help with my anxiety. Highly recommend!', timestamp: '6 hours ago', likes: 15 },
];

export function WellnessView() {
  const [activeTab, setActiveTab] = useState<'community' | 'games'>('community');
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [gameScore, setGameScore] = useState(0);

  const createPost = () => {
    if (!newPost.trim()) return;
    const post: CommunityPost = {
      id: Date.now().toString(),
      author: `User_${Math.floor(Math.random() * 1000)}`,
      message: newPost,
      timestamp: 'Just now',
      likes: 0,
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const startBreathing = () => {
    setBreathPhase('inhale');
    setGameScore(0);
    
    const cycle = () => {
      setBreathPhase('inhale');
      setGameScore(s => s + 1);
      
      setTimeout(() => {
        setBreathPhase('hold');
        setTimeout(() => {
          setBreathPhase('exhale');
          setTimeout(cycle, 4000);
        }, 4000);
      }, 4000);
    };
    
    cycle();
  };

  const stopBreathing = () => {
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
        <p className="text-muted-foreground">Connect with the community and practice mindfulness</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('community')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'community' ? "bg-card shadow-sm" : "text-muted-foreground"
          )}
        >
          <MessageCircle size={16} className="inline mr-2" />
          Community
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === 'games' ? "bg-card shadow-sm" : "text-muted-foreground"
          )}
        >
          <Heart size={16} className="inline mr-2" />
          Mindfulness
        </button>
      </div>

      {activeTab === 'community' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* New Post */}
          <div className="vitals-card">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Share something with the community (anonymous)..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-3"
                />
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
              className="vitals-card"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{post.author}</span>
                    <span className="text-xs text-muted-foreground">• {post.timestamp}</span>
                  </div>
                  <p className="text-sm mb-3">{post.message}</p>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
                    <Heart size={16} />
                    <span>{post.likes}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="vitals-card max-w-md mx-auto text-center"
        >
          <h2 className="font-display font-semibold text-xl mb-2">Breath Pacer</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Follow the circle to practice deep breathing
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
                  <Heart size={24} className="text-primary-foreground" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Phase Label */}
          <p className="text-lg font-medium mb-6 capitalize">
            {breathPhase === 'idle' ? 'Ready to start' : breathPhase}
          </p>

          {/* Score */}
          {breathPhase !== 'idle' && (
            <p className="text-sm text-muted-foreground mb-4">
              Cycles completed: <span className="font-bold text-primary">{gameScore}</span>
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {breathPhase === 'idle' ? (
              <Button onClick={startBreathing} className="btn-hero">
                <Play size={18} className="mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={stopBreathing} variant="outline">
                <RotateCcw size={18} className="mr-2" />
                Reset
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
