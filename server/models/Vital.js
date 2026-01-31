const mongoose = require('mongoose');

const vitalSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: [true, 'Please add vital type'],
      enum: [
        'blood_pressure',
        'heart_rate',
        'blood_sugar',
        'temperature',
        'oxygen_saturation',
        'weight',
        'respiratory_rate',
        'cholesterol',
        'hba1c'
      ],
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Can be number or string for BP like "120/80"
      required: [true, 'Please add vital value'],
    },
    unit: {
      type: String,
      required: [true, 'Please add vital unit'],
    },
    status: {
      type: String,
      enum: ['Normal', 'Low', 'High', 'Critical'],
      default: 'Normal',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
vitalSchema.index({ patientId: 1, createdAt: -1 });
vitalSchema.index({ patientId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Vital', vitalSchema);
