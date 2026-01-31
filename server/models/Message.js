const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Appointment',
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        senderRole: {
            type: String,
            enum: ['doctor', 'patient'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Message', messageSchema);
