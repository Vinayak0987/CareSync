const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...otherDetails } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Check if doctor provides license number
  if (role === 'doctor' && !otherDetails.licenseNumber) {
    res.status(400);
    throw new Error('License number is required for doctors');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'patient',
    ...otherDetails // Store extra details based on role
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Update user health profile (vitals & chronic info)
// @route   PUT /api/auth/profile/health
// @access  Private
const updateHealthProfile = asyncHandler(async (req, res) => {
  try {
    const user = req.user; // Already fetched by protect middleware

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    console.log('Improving Health Profile for:', user.email);
    console.log('Payload:', req.body);

    // Update fields if present
    if (req.body.chronicDisease) user.chronicDisease = req.body.chronicDisease;

    if (req.body.monitoringConfig) {
      // Ensure arrays
      user.monitoringConfig = Array.isArray(req.body.monitoringConfig)
        ? req.body.monitoringConfig
        : [req.body.monitoringConfig];
    }

    // Merge health profile data safely
    if (req.body.healthProfile) {
      // Handle case where healthProfile might be null/undefined in DB
      // If it's a Mongoose subdocument, toObject() helps merge.
      const currentProfile = user.healthProfile && typeof user.healthProfile.toObject === 'function'
        ? user.healthProfile.toObject()
        : (user.healthProfile || {});

      user.healthProfile = { ...currentProfile, ...req.body.healthProfile };
    }

    const updatedUser = await user.save();
    console.log('User saved successfully');

    res.status(200).json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      chronicDisease: updatedUser.chronicDisease,
      monitoringConfig: updatedUser.monitoringConfig,
      healthProfile: updatedUser.healthProfile
    });
  } catch (error) {
    console.error('Error updating health profile:', error);
    res.status(500);
    throw new Error(error.message); // Pass to error handler
  }
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateHealthProfile
};
