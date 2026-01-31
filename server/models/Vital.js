const mongoose = require('mongoose');

const vitalSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String, // blood_pressure, blood_sugar, heart_rate, oxygen
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Normal', 'High', 'Low', 'Critical'],
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

module.exports = mongoose.model('Vital', vitalSchema);
