# 🤖 AI-Powered Vitals Prediction Setup

## Overview
Your CareConnect Hub now includes AI-powered predictions using Google's Gemini API! The system analyzes your vital signs and predicts which vitals might go HIGH or LOW in the next 24-48 hours.

## Setup Instructions

### 1. Get Your Gemini API Key (FREE!)

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure Your Backend

1. Open `server/.env`
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```
3. Save the file
4. Restart your backend server:
   ```bash
   cd server
   npm run dev
   ```

## Features

### ✨ AI Predictions
- **High Risk Detection**: Identifies vitals likely to spike
- **Low Risk Detection**: Predicts potential drops
- **Personalized Recommendations**: Disease-specific health tips
- **Risk Level Assessment**: Overall health risk score

### 🎯 Who Gets AI Predictions?
Only users with chronic diseases:
- ✅ Diabetes patients
- ✅ Heart disease patients
- ✅ Hypertension patients

### 📊 How It Works

1. **Log Your Vitals**: Enter your daily health metrics
2. **Click "Get Predictions"**: AI analyzes your data
3. **View Insights**: See predictions and recommendations
4. **Take Action**: Follow AI-recommended health tips

## API Endpoints

### POST `/api/vitals/predict`
Get AI predictions for vital trends.

**Request:**
```json
{
  "chronicDisease": "diabetes",
  "recentVitals": [
    { "type": "glucose", "value": "130", "unit": "mg/dL" },
    { "type": "blood_pressure", "value": "140/90", "unit": "mmHg" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "predictions": {
    "highRisk": ["glucose", "blood_pressure"],
    "lowRisk": [],
    "recommendations": "Monitor glucose closely, consider diet adjustments",
    "riskLevel": "moderate"
  }
}
```

### GET `/api/vitals/insights`
Get personalized health insights based on your profile and vitals.

## UI Components

### AIPredictions Component
- Located in `src/components/dashboard/AIPredictions.tsx`
- Shows on dashboard for chronic disease patients
- Updates with each vital log

### Features:
- 🧠 **Smart Analysis**: Uses your last 5 vitals
- 🔄 **Real-time Updates**: Refresh predictions anytime
- 🎨 **Color-coded Alerts**: Red (high), Blue (low), Amber (tips)
- ✨ **Beautiful UI**: Purple gradient design with animations

## Privacy & Security

- ✅ API calls are authenticated (user must be logged in)
- ✅ Only your data is analyzed
- ✅ Predictions are generated on-demand
- ✅ No data is stored on Gemini's servers permanently

## Cost

- **FREE TIER**: 60 requests per minute
- **Perfect for personal use!**
- Monitor usage at: https://aistudio.google.com/

## Troubleshooting

### "Gemini API key not configured" error
- Check that you've added the key to `.env`
- Make sure it's not `your_gemini_api_key_here`
- Restart the server after adding the key

### Predictions not showing
- Log at least 1 vital first
- Make sure you have a chronic disease selected
- Check browser console for errors

### API quota exceeded
- You've hit the free tier limit
- Wait 1 minute and try again
- Consider upgrading if needed (unlikely for personal use)

## Example Predictions

### Diabetes Patient
```
HIGH RISK: Glucose, Blood Pressure
LOW RISK: -
RECOMMENDATIONS: "Your glucose levels show an upward trend. 
Consider reducing sugar intake and checking after meals."
RISK LEVEL: Moderate
```

### Heart Disease Patient
```
HIGH RISK: Blood Pressure, Cholesterol
LOW RISK: -
RECOMMENDATIONS: "BP trending high. Practice stress reduction 
and monitor salt intake."
RISK LEVEL: High
```

## Future Enhancements

- 📈 Trend analysis graphs
- 🔔 Automatic alerts when risk is high
- 📱 Push notifications
- 🤖 Chatbot for health questions
- 📊 Weekly health reports

---

**Powered by Google Gemini Pro 🌟**
