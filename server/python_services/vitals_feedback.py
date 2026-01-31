
import sys
import json
import os

def analyze_vitals(vitals_data):
    """
    Analyze vitals using rule-based logic.
    Falls back gracefully if Gemini is unavailable.
    """
    try:
        # Try to use Gemini API if available
        try:
            import google.generativeai as genai
            GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
            
            if GEMINI_API_KEY and GEMINI_API_KEY.startswith("AIza"):
                genai.configure(api_key=GEMINI_API_KEY)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                Act as an empathetic but professional doctor. 
                Analyze the following patient vitals logged just now:
                {json.dumps(vitals_data, indent=2)}

                Provide a concise health assessment.
                
                Return STRICT JSON format:
                {{
                    "status": "Normal" | "Warning" | "Critical",
                    "feedback": "A short, user-friendly summary (2-3 sentences)",
                    "action_items": ["Action 1", "Action 2"],
                    "color": "green" | "amber" | "red"
                }}
                """
                
                response = model.generate_content(prompt)
                text = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(text)
        except Exception as gemini_error:
            print(f"Gemini unavailable, using fallback: {gemini_error}", file=sys.stderr)
        
        # Fallback: Rule-based analysis
        return analyze_vitals_fallback(vitals_data)
    
    except Exception as e:
        return {
            "status": "Error",
            "feedback": "Unable to analyze vitals at this moment.",
            "action_items": ["Please consult with your healthcare provider"],
            "error": str(e),
            "color": "amber"
        }

def analyze_vitals_fallback(vitals_data):
    """Rule-based vital analysis when Gemini is unavailable"""
    issues = []
    warnings = []
    status = "Normal"
    color = "green"
    
    for vital in vitals_data:
        vtype = vital.get('type', '').lower()
        value = vital.get('value', '')
        
        # Blood Pressure Analysis
        if 'pressure' in vtype:
            try:
                sys_val, dia_val = map(int, value.split('/'))
                if sys_val > 140 or dia_val > 90:
                    status = "Warning"
                    color = "amber"
                    warnings.append(f"Blood pressure is elevated ({value})")
                if sys_val > 160 or dia_val > 100:
                    status = "Critical"
                    color = "red"
                    issues.append(f"Blood pressure is critically high ({value})")
            except:
                pass
        
        # Blood Sugar Analysis
        elif 'sugar' in vtype or 'glucose' in vtype:
            try:
                sugar_val = int(value)
                if sugar_val > 140:
                    status = "Warning" if status == "Normal" else status
                    color = "amber" if color == "green" else color
                    warnings.append(f"Blood sugar is high ({sugar_val} mg/dL)")
                if sugar_val < 70:
                    status = "Warning" if status == "Normal" else status
                    warnings.append(f"Blood sugar is low ({sugar_val} mg/dL)")
            except:
                pass
        
        # Heart Rate Analysis
        elif 'heart' in vtype:
            try:
                hr_val = int(value)
                if hr_val > 100:
                    warnings.append(f"Heart rate is elevated ({hr_val} bpm)")
                if hr_val < 60:
                    warnings.append(f"Heart rate is low ({hr_val} bpm)")
            except:
                pass
        
        # Oxygen Analysis
        elif 'oxygen' in vtype:
            try:
                ox_val = int(value)
                if ox_val < 95:
                    status = "Warning" if status == "Normal" else status
                    warnings.append(f"Oxygen level is below normal ({ox_val}%)")
                if ox_val < 90:
                    status = "Critical"
                    color = "red"
                    issues.append(f"Oxygen level is critically low ({ox_val}%)")
            except:
                pass
    
    # Build feedback message
    if status == "Normal":
        feedback = "Your vitals look good! All readings are within normal range. Keep up the healthy lifestyle."
        action_items = ["Continue monitoring regularly", "Maintain healthy diet and exercise"]
    elif status == "Warning":
        feedback = f"Some of your vitals need attention: {', '.join(warnings)}. Please monitor closely."
        action_items = ["Monitor these vitals daily", "Consult your doctor if readings persist", "Review lifestyle factors"]
    else:  # Critical
        feedback = f"⚠️ Critical: {', '.join(issues)}. Seek medical attention immediately."
        action_items = ["Contact your doctor NOW", "Go to emergency if symptoms worsen", "Do not ignore these readings"]
    
    return {
        "status": status,
        "feedback": feedback,
        "action_items": action_items,
        "color": color
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No data provided"}))
        sys.exit(1)
        
    try:
        # Argument is a JSON string of vitals
        vitals_input = json.loads(sys.argv[1])
        result = analyze_vitals(vitals_input)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
