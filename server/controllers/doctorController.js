const asyncHandler = require('express-async-handler');
const User = require('../models/User');

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

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      specialty: updatedUser.specialty,
      experience: updatedUser.experience,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
};
