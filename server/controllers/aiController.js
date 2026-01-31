const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Vital = require('../models/Vital');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// @desc    Get AI predictions for vitals
// @route   POST /api/vitals/predict
// @access  Private
const predictVitals = asyncHandler(async (req, res) => {
  const { chronicDisease, recentVitals } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(400).json({
      message: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.',
      predictions: null
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a prompt based on disease and vitals
    const prompt = `You are a medical AI assistant specialized in chronic disease management.

Patient Condition: ${chronicDisease || 'General health monitoring'}

Recent Vital Signs:
${JSON.stringify(recentVitals, null, 2)}

Based on these vitals and the patient's condition, provide:
1. Which vitals are likely to be HIGH in the next 24-48 hours
2. Which vitals are likely to be LOW in the next 24-48 hours
3. Brief recommendations (max 2-3 sentences)

Respond in JSON format:
{
  "highRisk": ["vital1", "vital2"],
  "lowRisk": ["vital3"],
  "recommendations": "Brief advice here",
  "riskLevel": "low|moderate|high"
}

Be concise and focus on actionable insights.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    let predictions;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      predictions = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      predictions = {
        highRisk: [],
        lowRisk: [],
        recommendations: text,
        riskLevel: 'moderate'
      };
    }

    res.json({
      success: true,
      predictions,
      rawResponse: text
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      message: 'Failed to generate predictions',
      error: error.message
    });
  }
});

// @desc    Get personalized health insights
// @route   GET /api/vitals/insights
// @access  Private
const getHealthInsights = asyncHandler(async (req, res) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.json({
      insights: 'Please configure Gemini API key for AI-powered insights.'
    });
  }

  try {
    // Get user's recent vitals
    const vitals = await Vital.find({ patientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const user = req.user;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a compassionate health assistant.

Patient Profile:
- Chronic Condition: ${user.chronicDiseases?.join(', ') || 'None'}
- Blood Group: ${user.bloodGroup || 'Unknown'}
- Allergies: ${user.allergies || 'None'}

Recent Vital Readings (last 10):
${vitals.map(v => `- ${v.type}: ${v.value} ${v.unit} (${v.status}) - ${new Date(v.createdAt).toLocaleDateString()}`).join('\n')}

Provide 3-4 personalized health tips in a friendly, encouraging tone. Keep each tip to 1 sentence. Focus on actionable advice.

Format as JSON:
{
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let insights;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(text);
    } catch {
      insights = { tips: [text] };
    }

    res.json(insights);

  } catch (error) {
    console.error('Insights Error:', error);
    res.json({
      tips: ['Stay hydrated', 'Exercise regularly', 'Monitor your vitals daily']
    });
  }
});

module.exports = {
  predictVitals,
  getHealthInsights
};
