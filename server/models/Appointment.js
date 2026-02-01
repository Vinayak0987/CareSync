const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: 'General Checkup',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'waiting', 'in-progress', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    notes: {
      type: String,
    },
    // Voice booking tracking
    bookedVia: {
      type: String,
      enum: ['web', 'voice_call', 'mobile_app'],
      default: 'web',
    },
    // Reminder tracking
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
    },
    reminderConfirmed: {
      type: Boolean,
      default: false,
    },
    reminderConfirmedAt: {
      type: Date,
    },
    hourlyReminderSent: {
      type: Boolean,
      default: false,
    },
    hourlyReminderSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
