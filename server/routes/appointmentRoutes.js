const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  getMyAppointments, 
  updateAppointment,
  getTodaysAppointments,
  getDoctorStats 
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/', protect, getMyAppointments);  // Get all user's appointments
router.get('/my-appointments', protect, getMyAppointments);  // Alias
router.get('/today', protect, getTodaysAppointments);  // Today's appointments for doctor
router.get('/stats', protect, getDoctorStats);  // Doctor dashboard stats
router.put('/:id', protect, updateAppointment);

module.exports = router;
