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

// @desc    Get today's appointments for doctor
// @route   GET /api/appointments/today
// @access  Private (Doctor only)
const getTodaysAppointments = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can access this endpoint');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    doctorId: req.user.id,
    date: { $gte: today, $lt: tomorrow }
  })
    .populate('patientId', 'name email phone avatar dateOfBirth gender bloodGroup allergies')
    .sort({ time: 1 });

  // Transform the data to match frontend expectations
  const transformedAppointments = appointments.map(apt => {
    const patient = apt.patientId;
    const age = patient.dateOfBirth
      ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    return {
      id: apt._id,
      patientId: patient._id,
      patientName: patient.name,
      patientAvatar: patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0D9488&color=fff`,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      age,
      gender: patient.gender || 'Unknown',
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      time: apt.time,
      date: apt.date,
      reason: apt.reason,
      status: apt.status,
      conditions: patient.allergies ? patient.allergies.split(',').map(a => a.trim()) : [],
      notes: apt.notes
    };
  });

  res.json(transformedAppointments);
});

// @desc    Get doctor dashboard stats
// @route   GET /api/appointments/stats
// @access  Private (Doctor only)
const getDoctorStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can access this endpoint');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Week start (Monday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);

  // Today's stats
  const todayAppointments = await Appointment.countDocuments({
    doctorId: req.user.id,
    date: { $gte: today, $lt: tomorrow }
  });

  const completedToday = await Appointment.countDocuments({
    doctorId: req.user.id,
    date: { $gte: today, $lt: tomorrow },
    status: 'completed'
  });

  // Week stats
  const weekAppointments = await Appointment.countDocuments({
    doctorId: req.user.id,
    date: { $gte: weekStart, $lt: tomorrow }
  });

  const weekCompleted = await Appointment.countDocuments({
    doctorId: req.user.id,
    date: { $gte: weekStart, $lt: tomorrow },
    status: 'completed'
  });

  res.json({
    today: {
      total: todayAppointments,
      completed: completedToday
    },
    week: {
      total: weekAppointments,
      completed: weekCompleted
    }
  });
});

module.exports = {
  bookAppointment,
  getMyAppointments,
  updateAppointment,
  getTodaysAppointments,
  getDoctorStats,
};
