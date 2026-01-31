const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    category: {
        type: String,
        enum: ['General', 'Case Study', 'Research', 'Announcement', 'Question', 'Experience', 'Support', 'Wellness'],
        default: 'General'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
