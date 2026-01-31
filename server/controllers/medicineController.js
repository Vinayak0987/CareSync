const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({});
  res.json(medicines);
});

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Private
const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    res.json(medicine);
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

// @desc    Create a medicine (Admin only)
// @route   POST /api/medicines
// @access  Private/Admin
const createMedicine = asyncHandler(async (req, res) => {
  const { name, description, price, category, image, requiresPrescription } = req.body;

  const medicine = await Medicine.create({
    name,
    description,
    price,
    category,
    image,
    requiresPrescription,
  });

  res.status(201).json(medicine);
});

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
};
