const express = require('express');
const router = express.Router();
const { addVital, getVitals, getLatestVitals } = require('../controllers/vitalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addVital);
router.post('/analyze', protect, require('../controllers/vitalController').analyzeVitals);
router.get('/', protect, getVitals);
router.get('/latest', protect, getLatestVitals);

module.exports = router;
