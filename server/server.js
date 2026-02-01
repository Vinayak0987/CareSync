const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Message = require('./models/Message');

// Configure Multer for temp uploads
const upload = multer({ dest: path.join(__dirname, 'uploads/') }); // Store in local uploads folder for cleanup logic verification

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io with CORS for production
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Make io available globally for controllers
global.io = io;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Logger for Twilio requests
app.use((req, res, next) => {
  if (req.url.includes('/api/voice')) {
    console.log(`[Twilio Request] ${req.method} ${req.url}`);
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});
app.use(express.urlencoded({ extended: true })); // For Twilio webhook form data

// Basic Route
app.get('/', (req, res) => {
  res.send('CareSync API is running...');
});

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/vitals', require('./routes/vitalRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes')); // Voice calling agent
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

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

// Additional Routes (Merged from Remote)
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use(require('./middleware/errorMiddleware').errorHandler);
const PORT = process.env.PORT || 5000;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join appointment room
  socket.on('join-appointment', (appointmentId) => {
    socket.join(appointmentId);
    console.log(`User ${socket.id} joined appointment: ${appointmentId}`);
  });

  // Handle chat messages
  socket.on('send-message', async (data) => {
    const { appointmentId, senderId, senderRole, message } = data;

    try {
      // Validate appointmentId is a valid ObjectId
      if (!appointmentId || appointmentId === 'demo' || !appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
        io.to(appointmentId).emit('receive-message', {
          id: Date.now().toString(),
          sender: senderRole,
          message: message,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          }),
          senderName: 'User',
        });
        return;
      }

      // Save message to database
      const newMessage = await Message.create({
        appointmentId,
        sender: senderId,
        senderRole,
        message,
      });

      // Populate sender details
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name avatar');

      // Emit to all users in the appointment room
      io.to(appointmentId).emit('receive-message', {
        id: populatedMessage._id,
        sender: senderRole,
        message: populatedMessage.message,
        timestamp: new Date(populatedMessage.timestamp).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }),
        senderName: populatedMessage.sender.name,
      });

      console.log(`Message sent in appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // WebRTC Signaling
  socket.on('call-user', (data) => {
    const { appointmentId, offer } = data;
    console.log(`Call offer in room ${appointmentId} from ${socket.id}`);
    socket.to(appointmentId).emit('call-made', { offer, socketId: socket.id });
  });

  socket.on('make-answer', (data) => {
    const { appointmentId, answer } = data;
    console.log(`Call answer in room ${appointmentId} from ${socket.id}`);
    socket.to(appointmentId).emit('answer-made', { answer, socketId: socket.id });
  });

  socket.on('ice-candidate', (data) => {
    const { appointmentId, candidate } = data;
    socket.to(appointmentId).emit('ice-candidateReceived', { candidate, socketId: socket.id });
  });

  // Leave appointment room
  socket.on('leave-appointment', (appointmentId) => {
    socket.leave(appointmentId);
    console.log(`User ${socket.id} left appointment: ${appointmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`✉️  Socket.IO ready for real-time chat`);

  // Initialize reminder scheduler
  const { initReminderScheduler } = require('./services/reminderScheduler');
  initReminderScheduler();
});
