const Prescription = require('../models/Prescription');
const User = require('../models/User');

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = async (req, res) => {
    try {
        const { patientId, appointmentId, medicines, diagnosis, notes } = req.body;

        // Verify patient exists
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const prescription = await Prescription.create({
            patientId,
            doctorId: req.user._id,
            appointmentId,
            medicines,
            diagnosis,
            notes,
        });

        res.status(201).json(prescription);
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ error: 'Failed to create prescription' });
    }
};

// @desc    Get prescriptions for a patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
const getPatientPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.params.patientId })
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });

        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ error: 'Failed to fetch prescriptions' });
    }
};

module.exports = {
    createPrescription,
    getPatientPrescriptions,
};
