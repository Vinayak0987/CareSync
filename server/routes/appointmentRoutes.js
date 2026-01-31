const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, updateAppointment, getTodaysAppointments, getDoctorStats } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/', protect, getMyAppointments); // Base route for fetching appointments
router.get('/my-appointments', protect, getMyAppointments);
router.get('/today', protect, getTodaysAppointments);
router.get('/stats', protect, getDoctorStats);
router.put('/:id', protect, updateAppointment);

module.exports = router;
