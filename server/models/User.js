const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacy'],
      default: 'patient',
    },
    // Doctor specific fields
    specialty: { type: String },
    experience: { type: Number },
    bio: { type: String },
    licenseNumber: { type: String },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    // Patient specific fields
    dateOfBirth: { type: Date },
    gender: { type: String },
    bloodGroup: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },
    allergies: { type: String },
    // Chronic Disease Management
    chronicDisease: {
      type: String,
      enum: ['Diabetes', 'Hypertension', 'Heart Disease', 'COPD', 'Kidney Disease', 'None', 'General'],
      default: 'None'
    },
    // Extracted constants from reports (that don't change daily)
    healthProfile: {
      age: Number,
      gender: String, // 1/0 for ML models
      height: Number,
      weight: Number,
      base_hba1c: Number,
      base_cholesterol: Number,
      base_bp_systolic: Number,
      base_bp_diastolic: Number,
      risk_score: Number // Last calculated risk score
    },
    // Which vitals should this user track daily?
    monitoringConfig: {
      type: [String], // e.g. ['blood_sugar', 'blood_pressure']
      default: ['blood_pressure', 'heart_rate'] // Default for general
    },

    // Pharmacy/Medical Store specific fields
    storeName: { type: String },
    storeLicense: { type: String },
    gstNumber: { type: String },
    operatingHours: { type: String },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
