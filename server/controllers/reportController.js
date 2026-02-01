const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

// Initialize AI Clients
// We handle missing keys in the function to allow fallback even if one env var is missing at startup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'DUMMY_KEY');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'DUMMY_KEY' });

// @desc    Get all reports for a patient
// @route   GET /api/reports/patient/:id
// @access  Private
const getPatientReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ patientId: req.params.id })
    .sort({ createdAt: -1 })
    .populate('doctorId', 'name specialty');
  res.json(reports);
});

// @desc    Upload report and save metadata
// @route   POST /api/reports/upload
// @access  Private
const uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const { patientId, title, type, description, doctorId } = req.body;

  // req.file is handled by multer in routes
  const filename = req.file.filename;

  // In a real app, you might upload to S3/Cloudinary here.
  // Locally, it's in /server/reports/

  const report = await Report.create({
    patientId: patientId, // Should be passed from frontend
    doctorId: doctorId || (req.user && req.user.role === 'doctor' ? req.user._id : null),
    title: title || req.file.originalname,
    type: type || 'General',
    description: description || '',
    fileUrl: filename, // Store filename, serve via API
    fileName: req.file.originalname
  });

  res.status(201).json(report);
});

// @desc    Download/Serve report file
// @route   GET /api/reports/file/:filename
// @access  Private (should be)
const getReportFile = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../reports', filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404);
    throw new Error('File not found');
  }
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Delete file from filesystem
  const filePath = path.join(__dirname, '../reports', report.fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await report.deleteOne();

  res.json({ message: 'Report removed' });
});

// @desc    Analyze reports with AI (Gemini + Groq Fallback)
// @route   POST /api/reports/analyze
// @access  Private
const analyzeReports = asyncHandler(async (req, res) => {
  const { patientId, reportIds } = req.body;

  if (!patientId) {
    res.status(400);
    throw new Error('Patient ID is required');
  }

  // 1. Fetch Reports
  let reports;
  try {
    if (reportIds && Array.isArray(reportIds) && reportIds.length > 0) {
      reports = await Report.find({ _id: { $in: reportIds } }).sort({ createdAt: -1 });
    } else {
      reports = await Report.find({ patientId }).sort({ createdAt: -1 }).limit(15);
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500);
    throw new Error("Failed to fetch reports");
  }

  if (!reports || reports.length === 0) {
    return res.json({ analysis: "No medical reports found to analyze." });
  }

  // 2. Prepare Prompt
  const reportSummaries = reports.map(r =>
    `- ${r.date ? new Date(r.date).toDateString() : 'Unknown Date'}: ${r.title} [Type: ${r.type}]\n  Description: ${r.description || 'N/A'}`
  ).join('\n\n');

  console.log(`Analyzing ${reports.length} reports for patient ${patientId}`);

  const systemPrompt = `You are an expert medical AI assistant helping a doctor. Analyze the provided selected medical reports.
  1. **Summary**: Briefly summarize the key findings.
  2. **Trends & Alerts**: Identify any concerning trends or values.
  3. **Recommendations**: Suggest next steps or focus areas.
  Keep it professional, clinical, and concise using Markdown.`;

  const userPrompt = `Patient Reports:\n${reportSummaries}`;

  // 3. Try Gemini First
  try {
    // If you want to force Groq for testing, comment out this block or invalidate Gemini key
    if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API Key not configured");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ analysis: text, provider: 'Gemini' });

  } catch (geminiError) {
    console.error('Gemini Analysis failed:', geminiError.message);

    // 4. Fallback to Groq
    try {
      console.log("Attempting fallback to Groq...");

      if (!process.env.GROQ_API_KEY) throw new Error("Groq API Key not configured");

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        // Updated model name as per deprecation notice
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 1024,
      });

      const text = completion.choices[0]?.message?.content || "Analysis could not be generated.";
      return res.json({ analysis: text, provider: 'Groq' });

    } catch (groqError) {
      console.error('Groq Analysis also failed:', groqError.message);

      res.status(500).json({
        message: 'AI Analysis failed. Please check backend logs and API keys.',
        details: { gemini: geminiError.message, groq: groqError.message }
      });
    }
  }
});

module.exports = {
  getPatientReports,
  uploadReport,
  getReportFile,
  deleteReport,
  analyzeReports
};
