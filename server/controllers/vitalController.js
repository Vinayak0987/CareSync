const asyncHandler = require('express-async-handler');
const Vital = require('../models/Vital');

// @desc    Add new vital reading
// @route   POST /api/vitals
// @access  Private
const addVital = asyncHandler(async (req, res) => {
  const { type, value, unit, status } = req.body;

  if (!type || !value || !unit) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const vital = await Vital.create({
    patientId: req.user.id,
    type,
    value,
    unit,
    status: status || 'Normal',
  });

  res.status(201).json(vital);
});

// @desc    Get user vitals
// @route   GET /api/vitals
// @access  Private
const getVitals = asyncHandler(async (req, res) => {
  const vitals = await Vital.find({ patientId: req.user.id }).sort({ createdAt: -1 });
  res.json(vitals);
});

// @desc    Get latest vitals (one per type)
// @route   GET /api/vitals/latest
// @access  Private
const getLatestVitals = asyncHandler(async (req, res) => {
  // Aggregate to get unique types with latest date
  // For simplicity MVP, fetching all and filtering in memory, 
  // or just fetching the last 100 sort by date

  const vitals = await Vital.find({ patientId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);

  // Group by type manually to get latest of each
  const latestMap = {};
  vitals.forEach(v => {
    if (!latestMap[v.type]) {
      latestMap[v.type] = v;
    }
  });

  res.json(Object.values(latestMap));
});

// @desc    Analyze vitals using Gemini
// @route   POST /api/vitals/analyze
// @access  Private
const analyzeVitals = asyncHandler(async (req, res) => {
  const { vitals } = req.body;

  if (!vitals || vitals.length === 0) {
    res.status(400);
    throw new Error('No vitals provided for analysis');
  }

  const { spawn } = require('child_process');
  const path = require('path');

  const scriptPath = path.join(__dirname, '../python_services/vitals_feedback.py');
  const pythonProcess = spawn('python', [scriptPath, JSON.stringify(vitals)]);

  let dataString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (e) {
      console.error('Failed to parse Python output', dataString);
      res.status(500).json({ error: 'Analysis failed' });
    }
  });
});

module.exports = {
  addVital,
  getVitals,
  getLatestVitals,
  analyzeVitals
};
