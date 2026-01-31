const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  if (!doctorId || !date || !time) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const appointment = await Appointment.create({
    patientId: req.user.id,
    doctorId,
    date,
    time,
    reason,
  });

  if (appointment) {
    res.status(201).json(appointment);
  } else {
    res.status(400);
    throw new Error('Invalid appointment data');
  }
});

// @desc    Get user appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
const getMyAppointments = asyncHandler(async (req, res) => {
  let appointments;

  if (req.user.role === 'doctor') {
    appointments = await Appointment.find({ doctorId: req.user.id })
      .populate('patientId', 'name email')
      .sort({ date: 1 });
  } else {
    appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name specialty avatar')
      .sort({ date: 1 });
  }

  res.json(appointments);
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Doctor/Admin)
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Verify ownership or role
  if (
    appointment.doctorId.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedAppointment);
});

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAllAppointments: getMyAppointments,  // Alias for cleaner routing
  updateAppointment,
};
