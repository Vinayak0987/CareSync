const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Return mock medicines for now
    const medicines = [
      { id: '1', name: 'Paracetamol 500mg', price: 25, category: 'Pain Relief', stock: 100 },
      { id: '2', name: 'Amoxicillin 250mg', price: 85, category: 'Antibiotics', stock: 50 },
      { id: '3', name: 'Omeprazole 20mg', price: 45, category: 'Digestive', stock: 75 },
      { id: '4', name: 'Vitamin D3 1000IU', price: 150, category: 'Vitamins', stock: 200 },
      { id: '5', name: 'Metformin 500mg', price: 35, category: 'Diabetes', stock: 80 }
    ];
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Return mock medicine
    res.json({ id: req.params.id, name: 'Medicine', price: 50 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

module.exports = router;
