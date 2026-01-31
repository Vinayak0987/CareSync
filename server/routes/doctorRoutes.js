const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, updateDoctorProfile, getMyPatients, getPatientDetails } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDoctors);
router.get('/my-patients', protect, getMyPatients);
router.get('/patient/:patientId', protect, getPatientDetails);
router.get('/:id', protect, getDoctorById);
router.put('/profile', protect, updateDoctorProfile);

module.exports = router;
