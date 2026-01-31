const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadReport } = require('../controllers/reportController');

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
    const filetypes = /jpeg|jpg|png|pdf/; // PDF support in Tesseract.js can be tricky without workers, sticking to images usually safer for basic implementation, but users might upload PDFs. Tesseract.js handles images best. Let's allow images.
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Images Only! (jpeg, jpg, png)');
    }
  }
});

router.post('/upload', upload.single('report'), uploadReport);

module.exports = router;
