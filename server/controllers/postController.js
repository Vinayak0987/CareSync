const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate('author', 'name avatar role specialty')
        .sort({ createdAt: -1 });
    res.json(posts);
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { content, category, image } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Please add some content');
    }

    const post = await Post.create({
        author: req.user.id,
        content,
        category: category || 'General',
        image
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name avatar role specialty');

    res.status(201).json(populatedPost);
});

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    // Check if the post has already been liked
    if (post.likes.includes(req.user.id)) {
        // Unlike
        post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
        // Like
        post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post.likes);
});

// @desc    Add a comment
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    const comment = {
        user: req.user.id,
        text,
        date: Date.now()
    };

    post.comments.push(comment);
    await post.save();

    // Return comments with user details populated would be better, but for now return list
    // Ideally we should populate comment users before returning
    const updatedPost = await Post.findById(req.params.id)
        .populate('comments.user', 'name avatar')
        .populate('author', 'name avatar role specialty');

    res.json(updatedPost.comments);
});

module.exports = {
    getPosts,
    createPost,
    likePost,
    addComment
};
