const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Blood', 'ECG', 'CT-Scan', 'X-Ray', 'MRI', 'Prescription', 'Lab', 'Other', 'General'],
        default: 'General'
    },
    description: {
        type: String,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Report', reportSchema);
