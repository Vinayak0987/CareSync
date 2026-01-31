const express = require('express');
const router = express.Router();
const { getMedicines, getMedicineById, createMedicine } = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMedicines);
router.get('/:id', protect, getMedicineById);
router.post('/', protect, createMedicine);

module.exports = router;
