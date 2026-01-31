
import sys
import json
import os
from pathlib import Path

# Redirect stdout to stderr to prevent library logs (like Kaggle API) from breaking JSON output
original_stdout = sys.stdout
sys.stdout = sys.stderr

# Add current directory to path so we can import local modules
current_dir = Path(__file__).parent.absolute()
sys.path.append(str(current_dir))

from report_processor import HospitalReportProcessor
from enhanced_chronic_disease_predictor import EnhancedChronicDiseasePredictor
import google.generativeai as genai

# Setup Gemini Fallback
# Try to get key from environment, fallback to hardcoded if testing standalone without env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AQ.Ab8RN6KAePRZ7IMaIVDnDSmhQgNld8UJOlWjd2ZqPvs-xDdGqA"

try:
    genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    sys.stderr.write(f"Gemini config error: {e}\n")

def call_gemini_fallback(text):
    """Fallback to Gemini for extraction if local models fail or find nothing."""
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Analyze this medical report text and extract or infer the following:
        1. Patient health metrics (age, gender, glucose, bp, etc) as 'profile'.
        2. Potential chronic disease risks (Diabetes, Heart Disease, etc) as 'risks'.
        3. Recommended vitals to monitor (must be from: blood_pressure, blood_sugar, heart_rate, oxygen) as 'recommended_vitals'.
        
        Return ONLY valid JSON in this format:
        {{
            "success": true,
            "profile": {{ ... }},
            "risks": {{ "DiseaseName": "RiskLevel" }},
            "risk_scores": {{ "DiseaseName": 0.XX }},
            "recommended_vitals": ["blood_pressure", ...]
        }}
        
        Report Text:
        {text[:5000]}
        """
        response = model.generate_content(prompt)
        # simplistic clean up
        content = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        sys.stderr.write(f"Gemini fallback failed: {e}\n")
        return None

# Restore stdout for final output
def print_json_result(data):
    sys.stdout = original_stdout
    print("__JSON_START__")
    print(json.dumps(data))
    print("__JSON_END__")
    sys.stdout = sys.stderr

def analyze_report(file_path, disease_context="General"):
    try:
        # Initialize processors
        report_processor = HospitalReportProcessor()
        predictor = EnhancedChronicDiseasePredictor()
        
        # 1. Extract Data from PDF
        text = report_processor.extract_text_from_file(file_path)
        if not text:
            return {"error": "Could not extract text from file"}
            
        extracted_data = report_processor.extract_medical_data(text)
        
        # 2. Generate Patient Profile
        patient_profile = {
            'age': extracted_data.get('age'),
            'gender': 1 if extracted_data.get('gender') == 'male' else 0,
            'glucose': extracted_data.get('glucose'),
            'blood_pressure_systolic': extracted_data.get('systolic'),
            'blood_pressure_diastolic': extracted_data.get('diastolic'),
            'cholesterol': extracted_data.get('cholesterol'),
            'hdl': extracted_data.get('hdl'),
            'heart_rate': extracted_data.get('heart_rate'),
            'bmi': extracted_data.get('bmi'),
        }

        # 3. Assess Risks
        models_dir = current_dir
        available_models = ['diabetes', 'heart_disease', 'kidney_disease', 'stroke', 'hypertension', 'copd']
        risks = {}
        
        for disease in available_models:
            model_path = models_dir / f'enhanced_chronic_disease_model_{disease}.pkl'
            
            if model_path.exists():
                predictor.load_model(str(model_path), disease)
                
                safe_profile = {}
                feature_names = predictor.feature_names.get(disease, [])
                if feature_names:
                    for feature in feature_names:
                        val = None
                        if feature == 'age': val = patient_profile.get('age')
                        elif feature == 'gender' or feature == 'sex': val = patient_profile.get('gender')
                        elif feature == 'glucose': val = patient_profile.get('glucose')
                        elif feature == 'bmi': val = patient_profile.get('bmi')
                        elif feature == 'systolic' or feature == 'trestbps': val = patient_profile.get('blood_pressure_systolic')
                        elif feature == 'diastolic': val = patient_profile.get('blood_pressure_diastolic')
                        elif feature == 'blood_pressure': val = patient_profile.get('blood_pressure_systolic')
                        elif feature == 'cholesterol' or feature == 'chol': val = patient_profile.get('cholesterol')
                        elif feature == 'heart_rate' or feature == 'thalach': val = patient_profile.get('heart_rate')
                        
                        safe_profile[feature] = val if val is not None else np.nan
                    
                    result = predictor.predict_risk_score(safe_profile, disease)
                    if result:
                        risks[disease] = result

        # 4. Determine Top Vitals
        # Strategy: 
        # 1. Start with vitals for the SELECTED disease (Primary focus)
        # 2. Add vitals for top detected risks
        
        required_vitals = set()
        
        # Map disease selection from UI to internal model names/vitals
        # UI: 'Diabetes', 'Heart Disease', 'Hypertension', 'COPD'
        # Internal: 'diabetes', 'heart_disease', 'hypertension', 'copd'
        
        context_map = {
            'Diabetes': 'diabetes',
            'Heart Disease': 'heart_disease',
            'Hypertension': 'hypertension',
            'COPD': 'copd',
            'Kidney Disease': 'kidney_disease'
        }
        
        normalized_context = context_map.get(disease_context, 'General')
        
        # REMOVED: Mocking logic. User wants real analysis.
        
        # Check if the selected disease was actually detected by local models
        # If not (or if we want a second opinion for the selected condition), use Gemini.
        
        context_risk_found = False
        if normalized_context != 'General':
            if normalized_context in risks:
                context_risk_found = True
            
            # If the selected disease wasn't found by local models (e.g. data missing from simple extraction), 
            # ask Gemini specifically to analyze the text for this condition.
            if not context_risk_found:
                sys.stderr.write(f"selected disease {normalized_context} not in local risks. Asking Gemini...\n")
                gemini_prompt = f"""
                Act as a Chief Medical Officer. The patient reports a history of {disease_context}. 
                Analyze the provided medical report text strictly for evidence of {disease_context} or related markers.
                
                Report Text:
                {text[:4000]}
                
                Task:
                1. Look for explicit diagnosis mentions (e.g. "known hypertensive").
                2. Look for medication indicators (e.g. taking Amlodipine).
                3. Look for biomarker values (e.g. BP 140/90).
                4. Estimate a clinical probability (0.00 to 0.99) that this patient has {disease_context} based on the text.
                   - If explicit diagnosis found: 0.95 - 0.99
                   - If indicative values/meds found: 0.70 - 0.90
                   - If no evidence found but patient claims it: 0.5 (Self-report weight)
                
                Return JSON:
                {{
                    "risk_score": <float>,
                    "risk_category": "High Risk" | "Moderate Risk" | "Low Risk" | "Self Reported Only"
                }}
                """
                
                try:
                    model = genai.GenerativeModel('gemini-pro')
                    response = model.generate_content(gemini_prompt)
                    clean_resp = response.text.replace('```json', '').replace('```', '').strip()
                    gemini_data = json.loads(clean_resp)
                    
                    if gemini_data.get('risk_score') is not None:
                         risks[normalized_context] = {
                             'risk_score': gemini_data['risk_score'],
                             'risk_category': gemini_data.get('risk_category', 'AI Assessment')
                         }
                except Exception as e:
                    sys.stderr.write(f"Gemini context analysis failed: {e}\n")
        
        # FINAL SAFEGUARD: Only use self-reported fallback if meaningful analysis failed entirely.
        if normalized_context != 'General' and normalized_context not in risks:
             # If we are here, Gemini failed to return valid JSON or crashed.
             # We must fallback to ensure the UX isn't broken (missing selection).
             risks[normalized_context] = {
                 'risk_score': 0.5, # Neutral score indicating "We took your word for it"
                 'risk_category': 'Self Reported (No Data)'
             }

        # Force add vitals for the selected chronic condition
        if normalized_context == 'diabetes':
            required_vitals.add('blood_sugar')
        elif normalized_context == 'hypertension':
            required_vitals.add('blood_pressure')
        elif normalized_context == 'heart_disease':
            required_vitals.add('heart_rate')
            required_vitals.add('blood_pressure')
        elif normalized_context == 'copd':
            required_vitals.add('oxygen')
        elif normalized_context == 'kidney_disease':
             required_vitals.add('blood_pressure')
        
        # Sort risks: Prioritize SELECTED Disease First, then by Score
        def sort_key(item):
            disease, data = item
            # Primary sort: Is this the disease the user selected? (1 = yes, 0 = no)
            is_selected = 1 if disease == normalized_context else 0
            # Secondary sort: Risk Score
            return (is_selected, data['risk_score']) 
            
        sorted_risks = sorted(risks.items(), key=sort_key, reverse=True)
        top_risks = sorted_risks[:3]
        
        for disease, risk_data in top_risks:
            if disease == 'diabetes':
                required_vitals.add('blood_sugar')
            elif disease == 'hypertension':
                required_vitals.add('blood_pressure')
            elif disease == 'heart_disease':
                required_vitals.add('heart_rate')
                required_vitals.add('blood_pressure')
            elif disease == 'copd':
                required_vitals.add('oxygen')
            elif disease == 'kidney_disease':
                required_vitals.add('blood_pressure')

        # Limit to top 4 features as requested
        # 'blood_pressure' counts as 1 item in set, but in UI might show 2 numbers. 
        # The list 'monitoringConfig' expects strings.
        
        final_vitals = list(required_vitals)
        if not final_vitals:
             final_vitals = ['blood_pressure', 'heart_rate'] # Default
             
        # Normalize list to 4 max?
        final_vitals = final_vitals[:4]

        return {
            "success": True,
            "profile": {k: v for k, v in patient_profile.items() if v is not None},
            "risks": {k: v['risk_category'] for k, v in risks.items()},
            "risk_scores": {k: v['risk_score'] for k, v in risks.items()},
            "recommended_vitals": final_vitals,
            "debug_context": disease_context
        }

    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print_json_result({"error": "No file path provided"})
            sys.exit(1)
            
        file_path = sys.argv[1]
        disease_context = sys.argv[2] if len(sys.argv) > 2 else "General"
        
        import numpy as np 
        
        result = analyze_report(file_path, disease_context)
        print_json_result(result)
        
    except Exception as e:
        import traceback
        error_response = {
            "error": "Critical script failure",
            "details": str(e),
            "trace": traceback.format_exc()
        }
        print_json_result(error_response)
        sys.exit(1)
