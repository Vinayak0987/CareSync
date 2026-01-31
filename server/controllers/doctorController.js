const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: 'doctor' }).select('-password');
  res.json(doctors);
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id).select('-password');

  if (doctor && doctor.role === 'doctor') {
    res.json(doctor);
  } else {
    res.status(404);
    throw new Error('Doctor not found');
  }
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.specialty = req.body.specialty || user.specialty;
    user.experience = req.body.experience || user.experience;
    user.bio = req.body.bio || user.bio;

    // Allow updating basic info too
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      specialty: updatedUser.specialty,
      experience: updatedUser.experience,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all patients who have appointments with this doctor
// @route   GET /api/doctors/my-patients
// @access  Private (Doctor only)
const getMyPatients = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can access this endpoint');
  }

  // Get all unique patient IDs from appointments with this doctor
  const appointments = await Appointment.find({ doctorId: req.user.id })
    .distinct('patientId');

  // Fetch patient details
  const patients = await User.find({
    _id: { $in: appointments },
    role: 'patient'
  }).select('-password');

  // Transform the data to match frontend expectations
  const transformedPatients = patients.map(patient => {
    const age = patient.dateOfBirth
      ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    return {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone || 'Not provided',
      avatar: patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0D9488&color=fff`,
      age,
      gender: patient.gender || 'Unknown',
      bloodGroup: patient.bloodGroup || 'Unknown',
      conditions: patient.allergies ? patient.allergies.split(',').map(a => a.trim()) : [],
      dateOfBirth: patient.dateOfBirth
    };
  });

  res.json(transformedPatients);
});

// @desc    Get patient details by ID (for doctor view)
// @route   GET /api/doctors/patient/:patientId
// @access  Private (Doctor only)
const getPatientDetails = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can access this endpoint');
  }

  const patient = await User.findById(req.params.patientId).select('-password');

  if (!patient || patient.role !== 'patient') {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get appointment history with this doctor for this patient
  const appointmentHistory = await Appointment.find({
    doctorId: req.user.id,
    patientId: req.params.patientId
  }).sort({ date: -1 });

  const age = patient.dateOfBirth
    ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  res.json({
    id: patient._id,
    name: patient.name,
    email: patient.email,
    phone: patient.phone || 'Not provided',
    avatar: patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0D9488&color=fff`,
    age,
    gender: patient.gender || 'Unknown',
    bloodGroup: patient.bloodGroup || 'Unknown',
    conditions: patient.allergies ? patient.allergies.split(',').map(a => a.trim()) : [],
    dateOfBirth: patient.dateOfBirth,
    appointmentHistory: appointmentHistory.map(apt => ({
      id: apt._id,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      notes: apt.notes
    }))
  });
});

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getMyPatients,
  getPatientDetails,
};
