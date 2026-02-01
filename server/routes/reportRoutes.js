const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  getPatientReports,
  uploadReport,
  getReportFile,
  deleteReport,
  analyzeReports
} = require('../controllers/reportController');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../reports');
    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (extname) {
      // mimetype check can be tricky for docs, trusting extname for now + basic MIME
      return cb(null, true);
    } else {
      cb('Supported files: Images, PDF, Word');
    }
  }
});

// Protect all routes
router.use(protect);

router.post('/upload', upload.single('report'), uploadReport);
router.post('/analyze', analyzeReports);
router.get('/patient/:id', getPatientReports);
router.get('/file/:filename', getReportFile);
router.delete('/:id', deleteReport);

module.exports = router;
