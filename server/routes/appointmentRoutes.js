const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  updateAppointment,
  cancelAppointment,
  getTodaysAppointments,
  getDoctorStats
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/', protect, getMyAppointments);
router.get('/my-appointments', protect, getMyAppointments);
router.get('/today', protect, getTodaysAppointments);
router.get('/stats', protect, getDoctorStats);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
