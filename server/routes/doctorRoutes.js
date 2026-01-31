const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, updateDoctorProfile } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);
router.put('/profile', protect, updateDoctorProfile);

module.exports = router;
