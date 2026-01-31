const express = require('express');
const router = express.Router();
const { addVital, getVitals, getLatestVitals } = require('../controllers/vitalController');
const { predictVitals, getHealthInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addVital);
router.post('/analyze', protect, require('../controllers/vitalController').analyzeVitals);
router.get('/', protect, getVitals);
router.get('/latest', protect, getLatestVitals);
router.post('/predict', protect, predictVitals);
router.get('/insights', protect, getHealthInsights);

module.exports = router;
