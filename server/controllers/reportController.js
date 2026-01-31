const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

// @desc    Upload report and save to reports folder
// @route   POST /api/reports/upload
// @access  Public
const uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const { path: filePath, filename } = req.file;
  const reportsDir = path.join(__dirname, '../reports');

  console.log(`[Upload] Received file: ${filename}`);
  console.log(`[Upload] Saved to: ${filePath}`);

  try {
    // For now, create a simple text file with placeholder content
    // In production, you would integrate with OCR service like Google Vision API or Tesseract
    const txtFileName = `${filename.split('.')[0]}.txt`;
    const txtFilePath = path.join(reportsDir, txtFileName);

    // Mock extracted text (in production, replace with actual OCR)
    const mockExtractedText = `Medical Report Analysis
    
Patient Information:
- Name: [Extracted from report]
- Date: [Extracted from report]

Vital Signs:
- Blood Pressure: 120/80 mmHg
- Heart Rate: 72 bpm
- Temperature: 98.6°F
- Blood Sugar: 95 mg/dL

Diagnosis:
[This would be extracted via OCR in production]

Notes:
This is a placeholder text. In production, this would be actual OCR-extracted content.
Uploaded file: ${filename}
`;

    // Save text to file
    fs.writeFileSync(txtFilePath, mockExtractedText);

    console.log(`[Upload] Success. Text saved to: ${txtFilePath}`);

    res.status(200).json({
      message: 'Report uploaded and processed successfully',
      text: mockExtractedText,
      txtFilePath: txtFilePath,
      originalFile: filename,
      note: 'OCR processing simulated - integrate Tesseract.js client-side or use cloud OCR service for production'
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({
        message: 'Failed to process report',
        error: error.message
    });
  }
});

module.exports = {
  uploadReport
};
