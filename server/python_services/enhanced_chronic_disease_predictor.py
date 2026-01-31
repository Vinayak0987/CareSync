import pandas as pd
import numpy as np
import json
from datetime import datetime
from pathlib import Path
import pickle
import warnings
warnings.filterwarnings('ignore')

# Machine Learning imports
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.impute import SimpleImputer

# Visualization imports
import matplotlib.pyplot as plt
import seaborn as sns

# Import our multi-API fetcher
from multi_api_dataset_fetcher import MultiAPIDatasetFetcher

class EnhancedChronicDiseasePredictor:
    def __init__(self):
        self.fetcher = MultiAPIDatasetFetcher()
        self.models = {}
        self.scalers = {}
        self.imputers = {}
        self.feature_selectors = {}
        self.label_encoders = {}
        self.feature_names = {}
        self.model_metadata = {}
        
        # Risk thresholds for different diseases
        self.risk_thresholds = {
            'diabetes': {'low': 0.25, 'moderate': 0.55, 'high': 0.75},
            'heart_disease': {'low': 0.30, 'moderate': 0.60, 'high': 0.80},
            'kidney_disease': {'low': 0.20, 'moderate': 0.50, 'high': 0.70},
            'stroke': {'low': 0.15, 'moderate': 0.45, 'high': 0.70},
            'hypertension': {'low': 0.35, 'moderate': 0.65, 'high': 0.85},
            'copd': {'low': 0.25, 'moderate': 0.55, 'high': 0.75}
        }
        
        # Disease-specific feature mappings
        self.feature_mappings = {
            'diabetes': {
                'required_features': ['glucose', 'bmi', 'age'],
                'optional_features': ['blood_pressure', 'insulin', 'pregnancies', 'skin_thickness', 'diabetes_pedigree']
            },
            'heart_disease': {
                'required_features': ['age', 'cholesterol', 'blood_pressure'],
                'optional_features': ['chest_pain_type', 'max_heart_rate', 'exercise_angina', 'st_depression']
            },
            'kidney_disease': {
                'required_features': ['age', 'blood_pressure', 'creatinine'],
                'optional_features': ['hemoglobin', 'albumin', 'sugar', 'red_blood_cells']
            },
            'stroke': {
                'required_features': ['age', 'hypertension', 'heart_disease'],
                'optional_features': ['avg_glucose_level', 'bmi', 'smoking_status', 'work_type']
            },
            'hypertension': {
                'required_features': ['age', 'sex', 'cp', 'trestbps', 'chol'],
                'optional_features': ['restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
            }
        }
    
    def fetch_and_prepare_dataset(self, disease, source_preference='kaggle', test_size=0.2):
        """Fetch dataset using multi-API fetcher and prepare for training"""
        print(f"🔍 Fetching {disease} dataset...")
        
        # Fetch dataset
        result = self.fetcher.fetch_dataset(disease, source_preference=source_preference)
        if result[0] is None:
            print(f"❌ Failed to fetch {disease} dataset")
            return None, None, None, None
        
        df, source_info = result
        print(f"✅ Dataset fetched from: {source_info['name']}")
        
        # Prepare dataset based on disease type
        X, y, target_column = self._prepare_disease_dataset(df, disease)
        
        if X is None or y is None:
            print(f"❌ Failed to prepare {disease} dataset")
            return None, None, None, None
        
        # Split dataset
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"✅ Dataset prepared: Train={X_train.shape}, Test={X_test.shape}")
        return X_train, X_test, y_train, y_test
    
    def _prepare_disease_dataset(self, df, disease):
        """Prepare dataset specific to disease type"""
        
        if disease == 'diabetes':
            return self._prepare_diabetes_dataset(df)
        elif disease == 'heart_disease':
            return self._prepare_heart_disease_dataset(df)
        elif disease == 'kidney_disease':
            return self._prepare_kidney_disease_dataset(df)
        elif disease == 'stroke':
            return self._prepare_stroke_dataset(df)
        elif disease == 'hypertension':
            return self._prepare_hypertension_dataset(df)
        elif disease == 'copd':
            return self._prepare_copd_dataset(df)
        else:
            print(f"❌ Unknown disease: {disease}")
            return None, None, None
    
    def _prepare_diabetes_dataset(self, df):
        """Prepare diabetes dataset"""
        # Standard diabetes dataset columns
        expected_columns = ['pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 
                          'insulin', 'bmi', 'diabetes_pedigree', 'age', 'outcome']
        
        # Check if we have the expected columns
        if all(col in df.columns for col in expected_columns):
            X = df.drop('outcome', axis=1)
            y = df['outcome']
            return X, y, 'outcome'
        
        # Alternative column names
        target_candidates = ['outcome', 'diabetes', 'target', 'class', 'diabetic']
        target_column = None
        
        for candidate in target_candidates:
            if candidate in df.columns:
                target_column = candidate
                break
        
        if target_column is None:
            print("❌ Could not identify target column for diabetes dataset")
            return None, None, None
        
        X = df.drop(target_column, axis=1)
        y = df[target_column]
        
        # Convert target to binary if needed
        if y.dtype == 'object' or len(y.unique()) > 2:
            le = LabelEncoder()
            y = le.fit_transform(y)
        
        return X, y, target_column
    
    def _prepare_heart_disease_dataset(self, df):
        """Prepare heart disease dataset"""
        # Common target column names for heart disease
        target_candidates = ['target', 'heart_disease', 'num', 'diagnosis', 'HeartDisease']
        target_column = None
        
        for candidate in target_candidates:
            if candidate in df.columns:
                target_column = candidate
                break
        
        if target_column is None:
            print("❌ Could not identify target column for heart disease dataset")
            return None, None, None
        
        X = df.drop(target_column, axis=1)
        y = df[target_column]
        
        # Convert target to binary if needed
        if y.dtype == 'object':
            le = LabelEncoder()
            y = le.fit_transform(y)
        elif len(y.unique()) > 2:
            # Convert multi-class to binary (0 = no disease, >0 = disease)
            y = (y > 0).astype(int)
        
        return X, y, target_column
    
    def _prepare_kidney_disease_dataset(self, df):
        """Prepare kidney disease dataset with proper handling of mixed data types"""
        target_candidates = ['classification', 'class', 'ckd', 'kidney_disease', 'target']
        target_column = None
        
        for candidate in target_candidates:
            if candidate in df.columns:
                target_column = candidate
                break
        
        if target_column is None:
            print("❌ Could not identify target column for kidney disease dataset")
            return None, None, None
        
        # Clean the dataset first
        df_clean = df.copy()
        
        # Remove the ID column if present
        if 'id' in df_clean.columns:
            df_clean = df_clean.drop('id', axis=1)
        
        # Replace '?' and other missing value indicators with NaN
        df_clean = df_clean.replace(['?', '\t?', 'ckd\t', ' yes', '\tno', '\tyes'], [None, None, 'ckd', 'yes', 'no', 'yes'])
        
        X = df_clean.drop(target_column, axis=1)
        y = df_clean[target_column]
        
        # Convert target to binary (ckd=1, notckd=0)
        if y.dtype == 'object':
            y = y.map({'ckd': 1, 'notckd': 0}).fillna(0)
        
        # Clean categorical columns that have inconsistent values
        categorical_cols = ['rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane']
        for col in categorical_cols:
            if col in X.columns:
                # Standardize categorical values
                X[col] = X[col].astype(str).str.strip()
                X[col] = X[col].replace({'abnormal': 'abnormal', 'normal': 'normal', 
                                       'present': 'present', 'notpresent': 'notpresent',
                                       'yes': 'yes', 'no': 'no',
                                       'good': 'good', 'poor': 'poor'})
        
        return X, y, target_column
    
    def _prepare_stroke_dataset(self, df):
        """Prepare stroke dataset"""
        target_candidates = ['stroke', 'target', 'outcome']
        target_column = None
        
        for candidate in target_candidates:
            if candidate in df.columns:
                target_column = candidate
                break
        
        if target_column is None:
            print("❌ Could not identify target column for stroke dataset")
            return None, None, None
        
        X = df.drop(target_column, axis=1)
        y = df[target_column]
        
        return X, y, target_column
    
    def _prepare_hypertension_dataset(self, df):
        """Prepare hypertension dataset"""
        target_candidates = ['hypertension', 'target', 'high_bp', 'bp_category']
        target_column = None
        
        for candidate in target_candidates:
            if candidate in df.columns:
                target_column = candidate
                break
        
        if target_column is None:
            print("❌ Could not identify target column for hypertension dataset")
            return None, None, None
        
        X = df.drop(target_column, axis=1)
        y = df[target_column]
        
        return X, y, target_column
    
    def _prepare_copd_dataset(self, df):
        """Prepare COPD dataset with binary classification"""
        target_candidates = ['copd', 'COPDSEVERITY', 'target', 'diagnosis', 'outcome']
        target_column = None
        
        for candidate in target_candidates:
            if candidate in df.columns:
                target_column = candidate
                break
        
        if target_column is None:
            print("❌ Could not identify target column for COPD dataset")
            return None, None, None
        
        # Clean the dataset first
        df_clean = df.copy()
        
        # Remove unnecessary columns
        columns_to_drop = ['Unnamed: 0', 'ID']
        for col in columns_to_drop:
            if col in df_clean.columns:
                df_clean = df_clean.drop(col, axis=1)
        
        if target_column == 'copd':
            # For 'copd' column: Convert multiclass (1,2,3,4) to binary (1,2 = 0, 3,4 = 1)
            X = df_clean.drop(target_column, axis=1)
            y = df_clean[target_column]
            # Convert to binary: 1,2 = mild/moderate (0), 3,4 = severe/very severe (1)
            y = (y >= 3).astype(int)
        elif target_column == 'COPDSEVERITY':
            # For severity: Convert text categories to binary
            X = df_clean.drop(target_column, axis=1)
            y = df_clean[target_column]
            # Convert to binary: MILD/MODERATE = 0, SEVERE/VERY SEVERE = 1
            severity_map = {'MILD': 0, 'MODERATE': 0, 'SEVERE': 1, 'VERY SEVERE': 1}
            y = y.map(severity_map).fillna(0)
        else:
            X = df_clean.drop(target_column, axis=1)
            y = df_clean[target_column]
        
        return X, y, target_column
    
    def preprocess_features(self, X_train, X_test, y_train, disease):
        """Advanced feature preprocessing with proper handling of mixed data types"""
        print("🔧 Preprocessing features...")
        
        # Make copies to avoid modifying original data
        X_train_copy = X_train.copy()
        X_test_copy = X_test.copy()
        
        # Identify column types
        numeric_columns = X_train_copy.select_dtypes(include=[np.number]).columns
        categorical_columns = X_train_copy.select_dtypes(include=['object', 'category']).columns
        
        # Handle missing values separately for numeric and categorical
        if len(numeric_columns) > 0:
            numeric_imputer = SimpleImputer(strategy='median')
            X_train_copy[numeric_columns] = numeric_imputer.fit_transform(X_train_copy[numeric_columns])
            X_test_copy[numeric_columns] = numeric_imputer.transform(X_test_copy[numeric_columns])
        else:
            numeric_imputer = None
            
        if len(categorical_columns) > 0:
            categorical_imputer = SimpleImputer(strategy='most_frequent')
            X_train_copy[categorical_columns] = categorical_imputer.fit_transform(X_train_copy[categorical_columns])
            X_test_copy[categorical_columns] = categorical_imputer.transform(X_test_copy[categorical_columns])
        else:
            categorical_imputer = None
        
        # Handle categorical variables with robust Label Encoding
        le_dict = {}
        for col in categorical_columns:
            le = LabelEncoder()
            
            # Fit on training data
            X_train_copy[col] = le.fit_transform(X_train_copy[col].astype(str))
            
            # Transform test data, handling unseen values
            test_col_values = X_test_copy[col].astype(str)
            # Replace unseen values with the most frequent training value
            most_frequent_train = X_train_copy[col].mode().iloc[0] if len(X_train_copy[col].mode()) > 0 else 0
            
            # Create mapping for test data
            test_encoded = []
            for val in test_col_values:
                if val in le.classes_:
                    test_encoded.append(le.transform([val])[0])
                else:
                    test_encoded.append(most_frequent_train)
            
            X_test_copy[col] = test_encoded
            le_dict[col] = le
        
        # Feature scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train_copy)
        X_test_scaled = scaler.transform(X_test_copy)
        
        # Feature selection
        selector = SelectKBest(f_classif, k=min(10, X_train_scaled.shape[1]))
        X_train_selected = selector.fit_transform(X_train_scaled, y_train)
        X_test_selected = selector.transform(X_test_scaled)
        
        # Store preprocessing objects
        self.imputers[disease] = {
            'numeric': numeric_imputer,
            'categorical': categorical_imputer
        }
        self.label_encoders[disease] = le_dict
        self.scalers[disease] = scaler
        self.feature_selectors[disease] = selector
        
        # Get selected feature names
        selected_features = X_train.columns[selector.get_support()].tolist()
        self.feature_names[disease] = selected_features
        
        print(f"✅ Features preprocessed. Selected {len(selected_features)} features: {selected_features}")
        return X_train_selected, X_test_selected
    
    def train_advanced_model(self, X_train, X_test, y_train, y_test, disease):
        """Train advanced ensemble model with hyperparameter tuning"""
        print(f"🤖 Training advanced model for {disease}...")
        
        # Preprocess features
        X_train_processed, X_test_processed = self.preprocess_features(X_train, X_test, y_train, disease)
        
        # Define models
        models = {
            'RandomForest': RandomForestClassifier(random_state=42),
            'GradientBoosting': GradientBoostingClassifier(random_state=42),
            'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
            'SVM': SVC(probability=True, random_state=42),
            'MLP': MLPClassifier(random_state=42, max_iter=500)
        }
        
        # Hyperparameter grids
        param_grids = {
            'RandomForest': {
                'n_estimators': [100, 200],
                'max_depth': [10, 20, None],
                'min_samples_split': [2, 5]
            },
            'GradientBoosting': {
                'n_estimators': [100, 200],
                'learning_rate': [0.1, 0.05],
                'max_depth': [3, 5]
            },
            'LogisticRegression': {
                'C': [0.1, 1.0, 10.0],
                'penalty': ['l1', 'l2']
            }
        }
        
        best_models = {}
        model_scores = {}
        
        # Train and tune each model
        for name, model in models.items():
            print(f"  Training {name}...")
            
            if name in param_grids:
                # Grid search for hyperparameter tuning
                grid_search = GridSearchCV(
                    model, param_grids[name], 
                    cv=5, scoring='roc_auc', 
                    n_jobs=-1, verbose=0
                )
                grid_search.fit(X_train_processed, y_train)
                best_model = grid_search.best_estimator_
                best_params = grid_search.best_params_
                print(f"    Best params: {best_params}")
            else:
                # Use default parameters
                best_model = model
                best_model.fit(X_train_processed, y_train)
            
            # Evaluate model
            y_pred = best_model.predict(X_test_processed)
            y_pred_proba = best_model.predict_proba(X_test_processed)[:, 1]
            
            accuracy = accuracy_score(y_test, y_pred)
            auc_score = roc_auc_score(y_test, y_pred_proba)
            
            model_scores[name] = {
                'accuracy': accuracy,
                'auc_score': auc_score,
                'model': best_model
            }
            
            print(f"    Accuracy: {accuracy:.4f}, AUC: {auc_score:.4f}")
        
        # Select best performing model
        best_model_name = max(model_scores.keys(), key=lambda x: model_scores[x]['auc_score'])
        best_model = model_scores[best_model_name]['model']
        
        print(f"🏆 Best model: {best_model_name} (AUC: {model_scores[best_model_name]['auc_score']:.4f})")
        
        # Create ensemble model with top 3 models
        top_models = sorted(model_scores.items(), key=lambda x: x[1]['auc_score'], reverse=True)[:3]
        ensemble_models = [(name, scores['model']) for name, scores in top_models]
        
        ensemble_model = VotingClassifier(
            estimators=ensemble_models,
            voting='soft'
        )
        ensemble_model.fit(X_train_processed, y_train)
        
        # Evaluate ensemble
        ensemble_pred = ensemble_model.predict(X_test_processed)
        ensemble_pred_proba = ensemble_model.predict_proba(X_test_processed)[:, 1]
        ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
        ensemble_auc = roc_auc_score(y_test, ensemble_pred_proba)
        
        print(f"🎯 Ensemble model - Accuracy: {ensemble_accuracy:.4f}, AUC: {ensemble_auc:.4f}")
        
        # Use ensemble if it performs better, otherwise use best individual model
        if ensemble_auc > model_scores[best_model_name]['auc_score']:
            final_model = ensemble_model
            final_score = ensemble_auc
            print(f"✅ Using ensemble model")
        else:
            final_model = best_model
            final_score = model_scores[best_model_name]['auc_score']
            print(f"✅ Using {best_model_name} model")
        
        # Store model and metadata
        self.models[disease] = final_model
        self.model_metadata[disease] = {
            'model_type': 'ensemble' if ensemble_auc > model_scores[best_model_name]['auc_score'] else best_model_name,
            'accuracy': ensemble_accuracy if ensemble_auc > model_scores[best_model_name]['auc_score'] else model_scores[best_model_name]['accuracy'],
            'auc_score': final_score,
            'training_date': datetime.now().isoformat(),
            'feature_count': X_train_processed.shape[1],
            'training_samples': X_train_processed.shape[0]
        }
        
        # Generate detailed report
        self._generate_model_report(y_test, ensemble_pred, ensemble_pred_proba, disease)
        
        return final_model
    
    def _generate_model_report(self, y_true, y_pred, y_pred_proba, disease):
        """Generate detailed model performance report"""
        print(f"\n📊 DETAILED MODEL REPORT - {disease.upper()}")
        print("="*60)
        
        # Basic metrics
        accuracy = accuracy_score(y_true, y_pred)
        auc_score = roc_auc_score(y_true, y_pred_proba)
        
        print(f"Accuracy: {accuracy:.4f}")
        print(f"AUC-ROC: {auc_score:.4f}")
        
        # Classification report
        print(f"\nClassification Report:")
        print(classification_report(y_true, y_pred))
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        print(f"\nConfusion Matrix:")
        print(cm)
        
        # Feature importance (if available)
        if hasattr(self.models[disease], 'feature_importances_'):
            self._plot_feature_importance(disease)
    
    def _plot_feature_importance(self, disease):
        """Plot feature importance"""
        if disease not in self.models or disease not in self.feature_names:
            return
        
        model = self.models[disease]
        
        # Get feature importance
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
        elif hasattr(model, 'named_estimators_'):
            # For voting classifier, average importance from tree-based models
            importance_list = []
            for name, estimator in model.named_estimators_.items():
                if hasattr(estimator, 'feature_importances_'):
                    importance_list.append(estimator.feature_importances_)
            
            if importance_list:
                importance = np.mean(importance_list, axis=0)
            else:
                print("No feature importance available")
                return
        else:
            print("No feature importance available")
            return
        
        feature_names = self.feature_names[disease]
        
        # Create feature importance DataFrame
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        # Plot
        plt.figure(figsize=(10, 6))
        sns.barplot(data=importance_df.head(10), x='importance', y='feature')
        plt.title(f'Top 10 Feature Importance - {disease.replace("_", " ").title()}')
        plt.xlabel('Importance')
        plt.tight_layout()
        
        # Save plot
        plot_file = f'feature_importance_{disease}.png'
        plt.savefig(plot_file)
        print(f"📊 Feature importance plot saved: {plot_file}")
        plt.show()
        
        return importance_df
    
    def predict_risk_score(self, patient_data, disease):
        """Predict risk score with enhanced preprocessing"""
        if disease not in self.models:
            print(f"❌ Model for {disease} not available")
            return None
        
        try:
            # Convert patient data to DataFrame
            if isinstance(patient_data, dict):
                patient_df = pd.DataFrame([patient_data])
            else:
                patient_df = patient_data
            
            # Apply same preprocessing pipeline
            # 1. Imputation (handle new structure)
            if disease in self.imputers:
                imputers = self.imputers[disease]
                
                # Handle numeric columns
                numeric_columns = patient_df.select_dtypes(include=[np.number]).columns
                categorical_columns = patient_df.select_dtypes(include=['object', 'category']).columns
                
                if len(numeric_columns) > 0 and imputers.get('numeric'):
                    patient_df[numeric_columns] = imputers['numeric'].transform(patient_df[numeric_columns])
                    
                if len(categorical_columns) > 0 and imputers.get('categorical'):
                    patient_df[categorical_columns] = imputers['categorical'].transform(patient_df[categorical_columns])
            
            # 2. Label encoding
            if disease in self.label_encoders:
                for col, le in self.label_encoders[disease].items():
                    if col in patient_df.columns:
                        patient_df[col] = le.transform(patient_df[col].astype(str))
            
            # 3. Scaling
            if disease in self.scalers:
                patient_scaled = self.scalers[disease].transform(patient_df)
            else:
                patient_scaled = patient_df.values
            
            # 4. Feature selection
            if disease in self.feature_selectors:
                patient_processed = self.feature_selectors[disease].transform(patient_scaled)
            else:
                patient_processed = patient_scaled
            
            # Get prediction
            model = self.models[disease]
            risk_prob = model.predict_proba(patient_processed)[0][1]
            
            # Determine risk category based on disease-specific thresholds
            thresholds = self.risk_thresholds.get(disease, {'low': 0.3, 'moderate': 0.6, 'high': 0.8})
            
            if risk_prob < thresholds['low']:
                risk_category = 'Low Risk'
            elif risk_prob < thresholds['moderate']:
                risk_category = 'Moderate Risk'
            elif risk_prob < thresholds['high']:
                risk_category = 'High Risk'
            else:
                risk_category = 'Very High Risk'
            
            return {
                'risk_score': risk_prob,
                'risk_category': risk_category,
                'risk_percentage': risk_prob * 100,
                'confidence': self._calculate_prediction_confidence(patient_processed, disease)
            }
            
        except Exception as e:
            print(f"❌ Error predicting risk for {disease}: {e}")
            return None
    
    def _calculate_prediction_confidence(self, patient_data, disease):
        """Calculate prediction confidence based on ensemble agreement"""
        model = self.models[disease]
        
        if hasattr(model, 'named_estimators_'):
            # For ensemble models, calculate agreement between estimators
            predictions = []
            for name, estimator in model.named_estimators_.items():
                pred_proba = estimator.predict_proba(patient_data)[0][1]
                predictions.append(pred_proba)
            
            # Calculate standard deviation as confidence measure
            std_dev = np.std(predictions)
            confidence = 1.0 - min(std_dev * 2, 1.0)  # Inverse of uncertainty
            return confidence
        else:
            # For single models, use distance from decision boundary
            if hasattr(model, 'decision_function'):
                decision_score = abs(model.decision_function(patient_data)[0])
                confidence = min(decision_score / 2.0, 1.0)
                return confidence
            else:
                # Default confidence for models without decision function
                return 0.8
    
    def train_all_diseases(self, source_preference='kaggle'):
        """Train models for all available diseases"""
        diseases = self.fetcher.list_available_diseases()
        trained_models = {}
        
        for disease in diseases:
            print(f"\n{'='*80}")
            print(f"🏥 TRAINING MODEL FOR: {disease.upper()}")
            print('='*80)
            
            try:
                # Fetch and prepare dataset
                X_train, X_test, y_train, y_test = self.fetch_and_prepare_dataset(
                    disease, source_preference
                )
                
                if X_train is not None:
                    # Train model
                    model = self.train_advanced_model(X_train, X_test, y_train, y_test, disease)
                    trained_models[disease] = model
                    
                    # Save model
                    self.save_model(disease)
                    
                    print(f"✅ {disease} model training completed successfully")
                else:
                    print(f"❌ Failed to prepare data for {disease}")
                    
            except Exception as e:
                print(f"❌ Error training {disease} model: {e}")
        
        print(f"\n🎉 Training completed! Successfully trained {len(trained_models)} models")
        return trained_models
    
    def save_model(self, disease, filename=None):
        """Save trained model with all preprocessing components"""
        if filename is None:
            filename = f'enhanced_chronic_disease_model_{disease}.pkl'
        
        model_data = {
            'model': self.models.get(disease),
            'scaler': self.scalers.get(disease),
            'imputer': self.imputers.get(disease),
            'feature_selector': self.feature_selectors.get(disease),
            'label_encoders': self.label_encoders.get(disease),
            'feature_names': self.feature_names.get(disease),
            'metadata': self.model_metadata.get(disease),
            'risk_thresholds': self.risk_thresholds.get(disease)
        }
        
        try:
            with open(filename, 'wb') as f:
                pickle.dump(model_data, f)
            print(f"💾 Model saved: {filename}")
            return True
        except Exception as e:
            print(f"❌ Error saving model: {e}")
            return False
    
    def load_model(self, filename, disease):
        """Load trained model with all preprocessing components"""
        try:
            with open(filename, 'rb') as f:
                model_data = pickle.load(f)
            
            self.models[disease] = model_data.get('model')
            self.scalers[disease] = model_data.get('scaler')
            self.imputers[disease] = model_data.get('imputer')
            self.feature_selectors[disease] = model_data.get('feature_selector')
            self.label_encoders[disease] = model_data.get('label_encoders', {})
            self.feature_names[disease] = model_data.get('feature_names', [])
            self.model_metadata[disease] = model_data.get('metadata', {})
            
            if disease in model_data.get('risk_thresholds', {}):
                self.risk_thresholds[disease] = model_data['risk_thresholds']
            
            print(f"✅ Model loaded: {filename}")
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    
    def get_model_summary(self):
        """Get summary of all trained models"""
        if not self.models:
            print("❌ No models trained yet")
            return None
        
        summary = {}
        for disease, model in self.models.items():
            metadata = self.model_metadata.get(disease, {})
            summary[disease] = {
                'model_type': metadata.get('model_type', 'Unknown'),
                'accuracy': metadata.get('accuracy', 'N/A'),
                'auc_score': metadata.get('auc_score', 'N/A'),
                'training_date': metadata.get('training_date', 'N/A'),
                'feature_count': metadata.get('feature_count', 'N/A'),
                'training_samples': metadata.get('training_samples', 'N/A')
            }
        
        # Print summary table
        print("\n🏥 MODEL SUMMARY")
        print("="*100)
        print(f"{'Disease':<15} {'Model Type':<20} {'Accuracy':<10} {'AUC Score':<10} {'Features':<10} {'Samples':<10}")
        print("-"*100)
        
        for disease, info in summary.items():
            print(f"{disease:<15} {info['model_type']:<20} {info['accuracy']:<10.4f} {info['auc_score']:<10.4f} {info['feature_count']:<10} {info['training_samples']:<10}")
        
        return summary

# Example usage
if __name__ == "__main__":
    # Initialize enhanced predictor
    predictor = EnhancedChronicDiseasePredictor()
    
    # Train a specific disease model
    print("🔍 Training diabetes model with Kaggle data...")
    X_train, X_test, y_train, y_test = predictor.fetch_and_prepare_dataset('diabetes', source_preference='direct_url')
    
    if X_train is not None:
        model = predictor.train_advanced_model(X_train, X_test, y_train, y_test, 'diabetes')
        
        # Test prediction
        sample_patient = {
            'pregnancies': 2,
            'glucose': 120,
            'blood_pressure': 80,
            'skin_thickness': 20,
            'insulin': 100,
            'bmi': 25.5,
            'diabetes_pedigree': 0.5,
            'age': 35
        }
        
        risk_result = predictor.predict_risk_score(sample_patient, 'diabetes')
        if risk_result:
            print(f"\n🎯 Sample Risk Assessment:")
            print(f"Risk Score: {risk_result['risk_score']:.4f}")
            print(f"Risk Category: {risk_result['risk_category']}")
            print(f"Risk Percentage: {risk_result['risk_percentage']:.1f}%")
            print(f"Confidence: {risk_result['confidence']:.1f}")
    
    # Get model summary
    predictor.get_model_summary()
