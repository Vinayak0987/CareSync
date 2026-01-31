const express = require('express');
const router = express.Router();
const { getPosts, createPost, likePost, addComment } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPosts)
    .post(protect, createPost);

router.route('/:id/like').put(protect, likePost);
router.route('/:id/comment').post(protect, addComment);

module.exports = router;
