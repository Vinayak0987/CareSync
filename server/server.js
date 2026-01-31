const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Configure Multer for temp uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/') }); // Store in local uploads folder for cleanup logic verification

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('CareSync API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/vitals', require('./routes/vitalRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
<<<<<<< HEAD

// Upload Report Endpoint
app.post('/api/upload-report', upload.single('report'), async (req, res) => {
  console.log('Received file upload request');
  if (!req.file) {
    console.error('No file in request');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Ensure absolute path and preserve extension for Python script detection
  const originalExt = path.extname(req.file.originalname);
  const tempPath = req.file.path; // Multer's random name
  const filePath = `${tempPath}${originalExt}`; // Append extension

  // Rename file synchronously
  try {
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error('Error renaming file:', err);
    return res.status(500).json({ error: 'Failed to process file upload' });
  }

  console.log('Processing file:', filePath);

  const pythonScript = path.join(__dirname, 'python_services', 'analyze_input.py');
  console.log('Using python script:', pythonScript);

  try {

    const diseaseType = req.body.diseaseType || 'General';
    console.log('Disease Type:', diseaseType);

    // Pass '-u' for unbuffered output to capture real-time logs if needed
    // Pass diseaseType as second argument
    const pythonProcess = spawn('python', ['-u', pythonScript, filePath, diseaseType]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      console.log('Python stdout:', data.toString());
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);

      // Cleanup uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });

      if (code !== 0) {
        console.error('Python script failure:', errorString);
        return res.status(500).json({
          error: 'Analysis failed',
          details: errorString,
          code: code
        });
      }

      try {
        // Robust parsing: Look for delimiters
        const startMarker = '__JSON_START__';
        const endMarker = '__JSON_END__';

        let jsonStr = '';
        const startIndex = dataString.indexOf(startMarker);
        const endIndex = dataString.indexOf(endMarker);

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          jsonStr = dataString.substring(startIndex + startMarker.length, endIndex).trim();
        } else {
          // Fallback to simple parse if markers missing (though they shouldn't be)
          console.warn('JSON markers not found, attempting raw parse');
          jsonStr = dataString.trim();
        }

        const result = JSON.parse(jsonStr);

        // Check for logical error returned by script
        if (result.error) {
          console.error('Python logic error:', result.error);
          return res.status(400).json({ error: result.error });
        }

        res.json(result);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.error('Raw stdout:', dataString);
        res.status(500).json({
          error: 'Invalid response from analysis engine',
          raw: dataString,
          parseError: e.toString()
        });
      }
    });

  } catch (error) {
    console.error('Spawn error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.toString() });
  }
});
=======
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use(require('./middleware/errorMiddleware').errorHandler);
>>>>>>> 078c66ed15c89c967b0b6deb11805a353b4c24b5

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});