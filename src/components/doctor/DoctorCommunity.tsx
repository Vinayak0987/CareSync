import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Heart,
    Share2,
    Send,
    Image as ImageIcon,
    MoreHorizontal,
    ThumbsUp,
    Search,
    Filter,
    X,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface Comment {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    text: string;
    date: string;
}

interface Post {
    _id: string;
    author: {
        _id: string;
        name: string;
        avatar: string;
        role: string;
        specialty?: string;
    };
    content: string;
    image?: string;
    category: string;
    likes: string[]; // User IDs
    comments: Comment[];
    createdAt: string;
}

export function DoctorCommunity() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [image, setImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const categories = ['All', 'General', 'Case Study', 'Research', 'Announcement', 'Question'];
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            toast.error('Failed to load community posts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;

        try {
            const response = await api.post('/posts', {
                content: newPostContent,
                category: activeCategory === 'All' ? 'General' : activeCategory,
                image
            });

            setPosts([response.data, ...posts]);
            setNewPostContent('');
            setImage('');
            toast.success('Post created successfully!');
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error('Failed to create post');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImage(res.data);
            toast.success('Image uploaded');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const response = await api.put(`/posts/${postId}/like`);
            // Update local state primarily for instant feedback, though ideally we use the response
            const updatedLikes = response.data;

            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: updatedLikes } : post
            ));
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    const filteredPosts = activeCategory === 'All'
        ? posts
        : posts.filter(post => post.category === activeCategory);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Doctor's Community</h2>
                    <p className="text-muted-foreground">Connect, share, and discuss cases with peers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search posts..."
                            className="pl-9 w-[200px] md:w-[300px]"
                        />
                    </div>
                </div>
            </div>

            {/* Create Post */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 shadow-sm"
            >
                <div className="flex gap-4">
                    <img
                        src={currentUser.avatar || "https://github.com/shadcn.png"}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div className="flex-1 space-y-3">
                        <textarea
                            placeholder="Share a case, ask a question, or post an update..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="w-full bg-muted/30 min-h-[100px] p-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-primary"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <ImageIcon size={18} className="mr-2" />}
                                    Photo
                                </Button>
                                <select
                                    className="bg-transparent text-sm border-none focus:ring-0 text-muted-foreground cursor-pointer"
                                    value={activeCategory === 'All' ? 'General' : activeCategory}
                                    onChange={(e) => setActiveCategory(e.target.value)}
                                >
                                    {categories.filter(c => c !== 'All').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleCreatePost} disabled={!newPostContent.trim() && !image}>
                                <Send size={16} className="mr-2" />
                                Post
                            </Button>
                        </div>
                        {image && (
                            <div className="relative mt-2 inline-block">
                                <img src={image} alt="Upload preview" className="h-20 w-auto rounded-lg object-cover border border-border" />
                                <button
                                    onClick={() => setImage('')}
                                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm hover:bg-destructive/90"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                            activeCategory === category
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-10">Loading community posts...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl">
                        No posts found in this category. Be the first to post!
                    </div>
                ) : (
                    filteredPosts.map((post) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card border border-border rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}`}
                                        alt={post.author.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-sm">{post.author.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {post.author.specialty ? `${post.author.specialty} • ` : ''}{new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <MoreHorizontal size={16} />
                                </Button>
                            </div>

                            <div className="mb-4">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium mb-2">
                                    {post.category}
                                </span>
                                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="Post attachment"
                                        className="mt-3 rounded-lg w-full max-h-[400px] object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-3 border-t border-border">
                                <button
                                    onClick={() => handleLike(post._id)}
                                    className={cn(
                                        "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-red-500",
                                        post.likes.includes(currentUser._id) ? "text-red-500" : "text-muted-foreground"
                                    )}
                                >
                                    <Heart size={18} className={cn(post.likes.includes(currentUser._id) && "fill-current")} />
                                    {post.likes.length} Likes
                                </button>
                                <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                    <MessageSquare size={18} />
                                    {post.comments.length} Comments
                                </button>
                                <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors ml-auto">
                                    <Share2 size={18} />
                                    Share
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
