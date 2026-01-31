const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, updateAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/:id', protect, updateAppointment);

module.exports = router;
