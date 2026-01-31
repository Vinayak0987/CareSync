const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, getAllAppointments, updateAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/', protect, getAllAppointments);  // Get all user's appointments
router.get('/my-appointments', protect, getMyAppointments);  // Same as above, alias
router.put('/:id', protect, updateAppointment);

module.exports = router;
