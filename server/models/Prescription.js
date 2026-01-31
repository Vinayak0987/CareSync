const mongoose = require('mongoose');

const prescriptionSchema = mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        medicines: [
            {
                name: { type: String, required: true },
                dosage: { type: String, required: true },
                frequency: { type: String, required: true },
                duration: { type: String, required: true },
                instructions: { type: String },
            },
        ],
        diagnosis: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
