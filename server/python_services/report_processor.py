import pandas as pd
import numpy as np
import re
from datetime import datetime
import json
from pathlib import Path
import PyPDF2
import docx
from typing import Dict, List, Union, Optional

class HospitalReportProcessor:
    def __init__(self):
        self.medical_keywords = {
            # Diabetes markers
            'glucose': ['glucose', 'blood sugar', 'blood glucose', 'fasting glucose', 'random glucose'],
            'hba1c': ['hba1c', 'hemoglobin a1c', 'glycated hemoglobin', 'a1c'],
            'insulin': ['insulin', 'insulin level'],
            
            # Cardiovascular markers
            'blood_pressure': ['blood pressure', 'bp', 'systolic', 'diastolic', 'hypertension'],
            'cholesterol': ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'lipid profile'],
            'heart_rate': ['heart rate', 'pulse', 'bpm', 'beats per minute'],
            
            # Kidney function
            'creatinine': ['creatinine', 'serum creatinine', 'cr'],
            'urea': ['urea', 'bun', 'blood urea nitrogen'],
            'egfr': ['egfr', 'gfr', 'glomerular filtration rate'],
            'protein_urine': ['proteinuria', 'protein in urine', 'albumin urine'],
            
            # General health markers
            'bmi': ['bmi', 'body mass index', 'weight', 'obesity'],
            'age': ['age', 'years old', 'dob', 'date of birth'],
            'hemoglobin': ['hemoglobin', 'hb', 'hgb'],
            
            # Symptoms and conditions
            'chest_pain': ['chest pain', 'angina', 'cardiac pain'],
            'shortness_breath': ['shortness of breath', 'dyspnea', 'breathing difficulty'],
            'fatigue': ['fatigue', 'weakness', 'tiredness'],
            'frequent_urination': ['frequent urination', 'polyuria', 'excessive urination'],
            'excessive_thirst': ['excessive thirst', 'polydipsia', 'increased thirst']
        }
        
        self.unit_patterns = {
            'mg/dl': r'(\d+(?:\.\d+)?)\s*mg/dl',
            'mmol/l': r'(\d+(?:\.\d+)?)\s*mmol/l',
            'percentage': r'(\d+(?:\.\d+)?)\s*%',
            'mmhg': r'(\d+(?:\.\d+)?)\s*mmhg',
            'kg': r'(\d+(?:\.\d+)?)\s*kg',
            'bpm': r'(\d+(?:\.\d+)?)\s*bpm',
            'years': r'(\d+)\s*(?:years?|yrs?)',
        }
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"Error reading DOCX: {e}")
            return ""
    
    def extract_text_from_file(self, file_path: str) -> str:
        """Extract text from various file formats"""
        file_path = Path(file_path)
        
        if file_path.suffix.lower() == '.pdf':
            return self.extract_text_from_pdf(str(file_path))
        elif file_path.suffix.lower() in ['.docx', '.doc']:
            return self.extract_text_from_docx(str(file_path))
        elif file_path.suffix.lower() == '.txt':
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    return file.read()
            except Exception as e:
                print(f"Error reading text file: {e}")
                return ""
        else:
            print(f"Unsupported file format: {file_path.suffix}")
            return ""
    
    def extract_numerical_values(self, text: str, keyword: str, units: List[str]) -> List[float]:
        """Extract numerical values associated with a keyword"""
        values = []
        text_lower = text.lower()
        
        # Look for keyword followed by numerical value
        for unit in units:
            pattern = rf"{keyword}.*?(\d+(?:\.\d+)?)\s*{unit}"
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                try:
                    value = float(match.group(1))
                    values.append(value)
                except ValueError:
                    continue
        
        # Also look for standalone numerical values near keywords
        keyword_positions = [m.start() for m in re.finditer(keyword, text_lower)]
        for pos in keyword_positions:
            # Look for numbers within 50 characters of the keyword
            surrounding_text = text_lower[max(0, pos-25):pos+50]
            numbers = re.findall(r'\b(\d+(?:\.\d+)?)\b', surrounding_text)
            for num in numbers:
                try:
                    value = float(num)
                    if 0 < value < 1000:  # Basic sanity check
                        values.append(value)
                except ValueError:
                    continue
        
        return values
    
    def extract_blood_pressure(self, text: str) -> Dict[str, Optional[float]]:
        """Extract blood pressure readings"""
        bp_pattern = r'(\d{2,3})/(\d{2,3})\s*mmhg|(\d{2,3})/(\d{2,3})'
        matches = re.findall(bp_pattern, text.lower())
        
        systolic_values = []
        diastolic_values = []
        
        for match in matches:
            try:
                if match[0] and match[1]:  # First pattern match
                    systolic = int(match[0])
                    diastolic = int(match[1])
                elif match[2] and match[3]:  # Second pattern match
                    systolic = int(match[2])
                    diastolic = int(match[3])
                else:
                    continue
                
                # Sanity check for blood pressure values
                if 50 <= systolic <= 250 and 30 <= diastolic <= 150:
                    systolic_values.append(systolic)
                    diastolic_values.append(diastolic)
            except ValueError:
                continue
        
        return {
            'systolic': np.mean(systolic_values) if systolic_values else None,
            'diastolic': np.mean(diastolic_values) if diastolic_values else None
        }
    
    def extract_medical_data(self, text: str) -> Dict[str, Union[float, str, None]]:
        """Extract medical data from text"""
        extracted_data = {}
        
        # Extract specific medical values
        medical_mappings = {
            'glucose': (['glucose', 'blood sugar', 'fasting glucose'], ['mg/dl', 'mmol/l']),
            'hba1c': (['hba1c', 'hemoglobin a1c', 'a1c'], ['%', 'percentage']),
            'cholesterol': (['total cholesterol', 'cholesterol'], ['mg/dl']),
            'hdl': (['hdl', 'hdl cholesterol'], ['mg/dl']),
            'ldl': (['ldl', 'ldl cholesterol'], ['mg/dl']),
            'triglycerides': (['triglycerides', 'tg'], ['mg/dl']),
            'creatinine': (['creatinine', 'serum creatinine'], ['mg/dl']),
            'urea': (['urea', 'bun'], ['mg/dl']),
            'hemoglobin': (['hemoglobin', 'hb'], ['g/dl']),
            'heart_rate': (['heart rate', 'pulse'], ['bpm']),
            'bmi': (['bmi', 'body mass index'], ['kg/m2', '']),
        }
        
        for key, (keywords, units) in medical_mappings.items():
            values = []
            for keyword in keywords:
                keyword_values = self.extract_numerical_values(text, keyword, units)
                values.extend(keyword_values)
            
            if values:
                extracted_data[key] = np.mean(values)  # Take average if multiple values
            else:
                extracted_data[key] = None
        
        # Extract blood pressure separately
        bp_data = self.extract_blood_pressure(text)
        extracted_data.update(bp_data)
        
        # Extract age
        age_patterns = [
            r'age[:\s]*(\d+)',
            r'(\d+)\s*years?\s*old',
            r'patient.*?(\d+)\s*years?'
        ]
        
        for pattern in age_patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                try:
                    age = int(matches[0])
                    if 0 < age < 150:  # Sanity check
                        extracted_data['age'] = age
                        break
                except ValueError:
                    continue
        
        if 'age' not in extracted_data:
            extracted_data['age'] = None
        
        # Extract gender
        gender_patterns = [
            r'gender[:\s]*(male|female)',
            r'sex[:\s]*(male|female|m|f)',
            r'\b(male|female)\b'
        ]
        
        for pattern in gender_patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                gender = matches[0].lower()
                if gender in ['m', 'male']:
                    extracted_data['gender'] = 'male'
                elif gender in ['f', 'female']:
                    extracted_data['gender'] = 'female'
                break
        
        if 'gender' not in extracted_data:
            extracted_data['gender'] = None
        
        return extracted_data
    
    def process_multiple_reports(self, file_paths: List[str]) -> Dict[str, any]:
        """Process multiple hospital reports and aggregate data"""
        all_extracted_data = []
        
        for file_path in file_paths:
            print(f"Processing {file_path}...")
            text = self.extract_text_from_file(file_path)
            if text:
                data = self.extract_medical_data(text)
                data['source_file'] = Path(file_path).name
                data['extraction_date'] = datetime.now().isoformat()
                all_extracted_data.append(data)
        
        # Aggregate data from multiple reports
        aggregated_data = self.aggregate_medical_data(all_extracted_data)
        
        return {
            'individual_reports': all_extracted_data,
            'aggregated_data': aggregated_data,
            'report_count': len(all_extracted_data)
        }
    
    def aggregate_medical_data(self, data_list: List[Dict]) -> Dict[str, Union[float, str, None]]:
        """Aggregate medical data from multiple reports"""
        if not data_list:
            return {}
        
        aggregated = {}
        numerical_fields = ['glucose', 'hba1c', 'cholesterol', 'hdl', 'ldl', 'triglycerides', 
                           'creatinine', 'urea', 'hemoglobin', 'heart_rate', 'bmi', 
                           'systolic', 'diastolic']
        
        for field in numerical_fields:
            values = [data[field] for data in data_list if data.get(field) is not None]
            if values:
                aggregated[field] = {
                    'latest': values[-1],  # Most recent value
                    'average': np.mean(values),
                    'trend': 'stable',  # Could implement trend analysis
                    'values_count': len(values)
                }
            else:
                aggregated[field] = None
        
        # Take the most recent non-null value for categorical fields
        categorical_fields = ['gender', 'age']
        for field in categorical_fields:
            for data in reversed(data_list):  # Start from most recent
                if data.get(field) is not None:
                    aggregated[field] = data[field]
                    break
            if field not in aggregated:
                aggregated[field] = None
        
        return aggregated
    
    def generate_patient_profile(self, aggregated_data: Dict, disease_type: str = None) -> Dict[str, any]:
        """Generate patient profile for disease prediction with disease-specific mapping"""
        profile = {}
        
        # Base feature mapping (general medical data)
        base_mapping = {
            'age': aggregated_data.get('age'),
            'gender': 1 if aggregated_data.get('gender') == 'male' else 0,
            'glucose': aggregated_data.get('glucose', {}).get('latest') if isinstance(aggregated_data.get('glucose'), dict) else aggregated_data.get('glucose'),
            'blood_pressure_systolic': aggregated_data.get('systolic', {}).get('latest') if isinstance(aggregated_data.get('systolic'), dict) else aggregated_data.get('systolic'),
            'blood_pressure_diastolic': aggregated_data.get('diastolic', {}).get('latest') if isinstance(aggregated_data.get('diastolic'), dict) else aggregated_data.get('diastolic'),
            'cholesterol': aggregated_data.get('cholesterol', {}).get('latest') if isinstance(aggregated_data.get('cholesterol'), dict) else aggregated_data.get('cholesterol'),
            'hdl': aggregated_data.get('hdl', {}).get('latest') if isinstance(aggregated_data.get('hdl'), dict) else aggregated_data.get('hdl'),
            'heart_rate': aggregated_data.get('heart_rate', {}).get('latest') if isinstance(aggregated_data.get('heart_rate'), dict) else aggregated_data.get('heart_rate'),
            'bmi': aggregated_data.get('bmi', {}).get('latest') if isinstance(aggregated_data.get('bmi'), dict) else aggregated_data.get('bmi'),
        }
        
        # Disease-specific feature mappings
        disease_mappings = {
            'hypertension': {
                'age': base_mapping['age'],
                'sex': base_mapping['gender'],
                'cp': 0,  # chest pain type - assuming no chest pain
                'trestbps': base_mapping['blood_pressure_systolic'],
                'chol': base_mapping['cholesterol'],
                'fbs': 1 if base_mapping['glucose'] and base_mapping['glucose'] > 120 else 0,
                'restecg': 0,  # resting ECG - normal
                'thalach': base_mapping['heart_rate'],
                'exang': 0,  # exercise induced angina - assuming no
                'oldpeak': 0.0,  # ST depression - assuming normal
                'slope': 2,  # slope of peak exercise ST segment
                'ca': 0,  # number of major vessels - assuming 0
                'thal': 2  # thalassemia - normal
            },
            'heart_disease': {
                'age': base_mapping['age'],
                'sex': base_mapping['gender'],
                'cp': 0,  # chest pain type
                'trestbps': base_mapping['blood_pressure_systolic'],
                'chol': base_mapping['cholesterol'],
                'fbs': 1 if base_mapping['glucose'] and base_mapping['glucose'] > 120 else 0,
                'restecg': 0,
                'thalach': base_mapping['heart_rate'],
                'exang': 0,
                'oldpeak': 0.0,
                'slope': 2,
                'ca': 0,
                'thal': 2
            },
            'diabetes': {
                'pregnancies': 0,  # default for male patients
                'glucose': base_mapping['glucose'],
                'blood_pressure': base_mapping['blood_pressure_systolic'],
                'skin_thickness': 20,  # default value
                'insulin': 100,  # default value
                'bmi': base_mapping['bmi'],
                'diabetes_pedigree': 0.5,  # default value
                'age': base_mapping['age']
            },
            # Default to base mapping for other diseases
            'default': base_mapping
        }
        
        # Select appropriate mapping
        if disease_type and disease_type in disease_mappings:
            feature_mapping = disease_mappings[disease_type]
        else:
            feature_mapping = base_mapping
        
        # Remove None values and convert to appropriate types
        for key, value in feature_mapping.items():
            if value is not None:
                try:
                    if key in ['gender', 'sex', 'fbs', 'exang', 'cp', 'restecg', 'slope', 'ca', 'thal']:
                        profile[key] = int(value)
                    else:
                        profile[key] = float(value)
                except (ValueError, TypeError):
                    continue
        
        return profile
    
    def save_processed_data(self, processed_data: Dict, output_file: str):
        """Save processed data to JSON file"""
        try:
            with open(output_file, 'w') as f:
                json.dump(processed_data, f, indent=2, default=str)
            print(f"Processed data saved to {output_file}")
        except Exception as e:
            print(f"Error saving data: {e}")

# Example usage
if __name__ == "__main__":
    processor = HospitalReportProcessor()
    
    # Example with sample report files (you would replace with actual file paths)
    sample_files = [
        "patient_report_1.pdf",
        "lab_results.txt",
        "discharge_summary.docx"
    ]
    
    # Check if files exist before processing
    existing_files = [f for f in sample_files if Path(f).exists()]
    
    if existing_files:
        processed_data = processor.process_multiple_reports(existing_files)
        patient_profile = processor.generate_patient_profile(processed_data['aggregated_data'])
        
        print("\nExtracted Patient Profile:")
        print(json.dumps(patient_profile, indent=2))
        
        # Save processed data
        processor.save_processed_data(processed_data, "processed_patient_data.json")
    else:
        print("No sample files found. Please add your hospital report files to test the processor.")
