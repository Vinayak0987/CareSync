import os
import pandas as pd
import numpy as np
import requests
import json
import zipfile
from pathlib import Path
from datetime import datetime
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi
import warnings
warnings.filterwarnings('ignore')

class MultiAPIDatasetFetcher:
    def __init__(self):
        self.datasets_config = {
            'diabetes': {
                'sources': [
                    {
                        'name': 'pima_indians_uci',
                        'type': 'direct_url',
                        'url': 'https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv',
                        'columns': ['pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 'insulin', 'bmi', 'diabetes_pedigree', 'age', 'outcome']
                    },
                    {
                        'name': 'diabetes_kaggle',
                        'type': 'kaggle',
                        'dataset_id': 'uciml/pima-indians-diabetes-database',
                        'file_name': 'diabetes.csv'
                    },
                    {
                        'name': 'diabetes_prediction_dataset',
                        'type': 'kaggle',
                        'dataset_id': 'iammustafatz/diabetes-prediction-dataset',
                        'file_name': 'diabetes_prediction_dataset.csv'
                    }
                ]
            },
            'heart_disease': {
                'sources': [
                    {
                        'name': 'cleveland_heart_disease',
                        'type': 'direct_url',
                        'url': 'https://raw.githubusercontent.com/kk289/ML-Data-Science-Projects/master/Heart%20Disease%20Prediction/dataset.csv'
                    },
                    {
                        'name': 'heart_disease_kaggle',
                        'type': 'kaggle',
                        'dataset_id': 'johnsmith88/heart-disease-dataset',
                        'file_name': 'heart.csv'
                    },
                    {
                        'name': 'heart_failure_prediction',
                        'type': 'kaggle',
                        'dataset_id': 'fedesoriano/heart-failure-prediction',
                        'file_name': 'heart.csv'
                    }
                ]
            },
            'kidney_disease': {
                'sources': [
                    {
                        'name': 'kidney_disease_uci',
                        'type': 'direct_url',
                        'url': 'https://raw.githubusercontent.com/mpuig/chronic-kidney-disease/master/data/kidney_disease.csv'
                    },
                    {
                        'name': 'kidney_disease_kaggle',
                        'type': 'kaggle',
                        'dataset_id': 'mansoordaku/ckdisease',
                        'file_name': 'kidney_disease.csv'
                    }
                ]
            },
            'stroke': {
                'sources': [
                    {
                        'name': 'stroke_prediction_kaggle',
                        'type': 'kaggle',
                        'dataset_id': 'fedesoriano/stroke-prediction-dataset',
                        'file_name': 'healthcare-dataset-stroke-data.csv'
                    },
                    {
                        'name': 'stroke_data_github',
                        'type': 'direct_url',
                        'url': 'https://raw.githubusercontent.com/StatsGirl21/strokeprediction/main/brain_stroke.csv'
                    }
                ]
            },
            'hypertension': {
                'sources': [
                    {
                        'name': 'hypertension_kaggle',
                        'type': 'kaggle',
                        'dataset_id': 'prosperchuks/health-dataset',
                        'file_name': 'hypertension_data.csv'
                    },
                    {
                        'name': 'blood_pressure_github',
                        'type': 'direct_url',
                        'url': 'https://raw.githubusercontent.com/Sapphirine/HealthCare_ML/master/blood_pressure_dataset.csv'
                    }
                ]
            },
            'copd': {
                'sources': [
                    {
                        'name': 'copd_kaggle',
                        'type': 'kaggle',
                        'dataset_id': 'prakharrathi25/copd-student-dataset'
                    }
                ]
            }
        }
        
        self.api_configs = {
            'kaggle': self._setup_kaggle_api(),
            'cdc': {
                'base_url': 'https://chronicdata.cdc.gov/api/views',
                'endpoints': {
                    'brfss': 'waxm-p5qv',
                    'diabetes': 'vt4j-ke6b',
                    'heart_disease': '6yys-xh4v'
                }
            },
            'who': {
                'base_url': 'https://ghoapi.azureedge.net/api',
                'endpoints': {
                    'diabetes': 'NCD_BMI_30A',
                    'cardiovascular': 'NCD_PAH_B'
                }
            }
        }
        
        self.cache_dir = Path('dataset_cache')
        self.cache_dir.mkdir(exist_ok=True)
    
    def _setup_kaggle_api(self):
        """Setup Kaggle API with authentication"""
        try:
            api = KaggleApi()
            api.authenticate()
            print("✓ Kaggle API authenticated successfully")
            return api
        except Exception as e:
            print(f"⚠️ Kaggle API setup failed: {e}")
            print("To use Kaggle datasets:")
            print("1. Install kaggle: pip install kaggle")
            print("2. Get API token from https://www.kaggle.com/account")
            print("3. Place kaggle.json in ~/.kaggle/ directory")
            return None
    
    def fetch_from_direct_url(self, url, columns=None):
        """Fetch dataset from direct URL"""
        try:
            print(f"Fetching from URL: {url}")
            
            # Handle different file formats
            if url.endswith('.csv'):
                if columns:
                    df = pd.read_csv(url, names=columns)
                else:
                    df = pd.read_csv(url)
            elif url.endswith('.json'):
                response = requests.get(url)
                data = response.json()
                df = pd.json_normalize(data)
            else:
                # Try CSV as default
                df = pd.read_csv(url)
            
            print(f"✓ Dataset loaded: {df.shape}")
            return df
            
        except Exception as e:
            print(f"❌ Error fetching from URL: {e}")
            return None
    
    def fetch_from_kaggle(self, dataset_id, file_name=None):
        """Fetch dataset from Kaggle"""
        if not self.api_configs['kaggle']:
            print("❌ Kaggle API not available")
            return None
        
        try:
            print(f"Fetching Kaggle dataset: {dataset_id}")
            
            # Download dataset
            cache_path = self.cache_dir / dataset_id.replace('/', '_')
            cache_path.mkdir(exist_ok=True)
            
            self.api_configs['kaggle'].dataset_download_files(
                dataset_id, 
                path=str(cache_path),
                unzip=True,
                quiet=True
            )
            
            # Find and load the dataset file
            if file_name:
                file_path = cache_path / file_name
                if file_path.exists():
                    df = pd.read_csv(file_path)
                else:
                    print(f"❌ File {file_name} not found in dataset")
                    return None
            else:
                # Find the first CSV file
                csv_files = list(cache_path.glob('*.csv'))
                if csv_files:
                    df = pd.read_csv(csv_files[0])
                else:
                    print("❌ No CSV files found in dataset")
                    return None
            
            print(f"✓ Kaggle dataset loaded: {df.shape}")
            return df
            
        except Exception as e:
            print(f"❌ Error fetching from Kaggle: {e}")
            return None
    
    def fetch_from_cdc_api(self, endpoint, limit=10000):
        """Fetch data from CDC API"""
        try:
            base_url = self.api_configs['cdc']['base_url']
            endpoint_id = self.api_configs['cdc']['endpoints'].get(endpoint, endpoint)
            
            url = f"{base_url}/{endpoint_id}/rows.json?$limit={limit}"
            print(f"Fetching from CDC API: {endpoint}")
            
            response = requests.get(url)
            response.raise_for_status()
            
            data = response.json()
            if 'data' in data:
                df = pd.DataFrame(data['data'], columns=data.get('meta', {}).get('view', {}).get('columns', []))
            else:
                df = pd.json_normalize(data)
            
            print(f"✓ CDC data loaded: {df.shape}")
            return df
            
        except Exception as e:
            print(f"❌ Error fetching from CDC API: {e}")
            return None
    
    def fetch_from_who_api(self, indicator, country='all'):
        """Fetch data from WHO API"""
        try:
            base_url = self.api_configs['who']['base_url']
            url = f"{base_url}/{indicator}"
            
            if country != 'all':
                url += f"?$filter=SpatialDim eq '{country}'"
            
            print(f"Fetching from WHO API: {indicator}")
            
            response = requests.get(url)
            response.raise_for_status()
            
            data = response.json()
            df = pd.json_normalize(data.get('value', []))
            
            print(f"✓ WHO data loaded: {df.shape}")
            return df
            
        except Exception as e:
            print(f"❌ Error fetching from WHO API: {e}")
            return None
    
    def fetch_dataset(self, disease, source_preference=None, fallback=True):
        """
        Fetch dataset for a specific disease with multiple source options
        
        Args:
            disease: Disease type (diabetes, heart_disease, etc.)
            source_preference: Preferred source type ('kaggle', 'direct_url', 'cdc', 'who')
            fallback: Whether to try other sources if preferred fails
        """
        if disease not in self.datasets_config:
            print(f"❌ Disease '{disease}' not configured")
            return None
        
        sources = self.datasets_config[disease]['sources']
        
        # Sort sources by preference
        if source_preference:
            sources = sorted(sources, key=lambda x: 0 if x['type'] == source_preference else 1)
        
        for source in sources:
            print(f"\n🔍 Trying source: {source['name']} ({source['type']})")
            
            try:
                if source['type'] == 'direct_url':
                    df = self.fetch_from_direct_url(
                        source['url'], 
                        source.get('columns')
                    )
                elif source['type'] == 'kaggle':
                    df = self.fetch_from_kaggle(
                        source['dataset_id'],
                        source.get('file_name')
                    )
                elif source['type'] == 'cdc':
                    df = self.fetch_from_cdc_api(source['endpoint'])
                elif source['type'] == 'who':
                    df = self.fetch_from_who_api(source['indicator'])
                else:
                    print(f"❌ Unknown source type: {source['type']}")
                    continue
                
                if df is not None and not df.empty:
                    print(f"✅ Successfully loaded dataset from {source['name']}")
                    
                    # Cache the dataset
                    cache_file = self.cache_dir / f"{disease}_{source['name']}.csv"
                    df.to_csv(cache_file, index=False)
                    print(f"💾 Dataset cached to: {cache_file}")
                    
                    return df, source
                
            except Exception as e:
                print(f"❌ Failed to load from {source['name']}: {e}")
                
            if not fallback:
                break
        
        print(f"❌ All sources failed for disease: {disease}")
        return None, None
    
    def fetch_all_datasets(self, source_preference=None):
        """Fetch all available datasets"""
        datasets = {}
        
        for disease in self.datasets_config.keys():
            print(f"\n{'='*50}")
            print(f"🔍 FETCHING DATASET: {disease.upper()}")
            print('='*50)
            
            result = self.fetch_dataset(disease, source_preference)
            if result[0] is not None:
                datasets[disease] = {
                    'data': result[0],
                    'source': result[1],
                    'fetched_at': datetime.now().isoformat()
                }
            else:
                print(f"❌ Failed to fetch {disease} dataset")
        
        return datasets
    
    def get_dataset_info(self, disease=None):
        """Get information about available datasets"""
        if disease:
            if disease in self.datasets_config:
                return self.datasets_config[disease]
            else:
                print(f"❌ Disease '{disease}' not available")
                return None
        else:
            return self.datasets_config
    
    def add_custom_dataset_source(self, disease, source_config):
        """Add a custom dataset source"""
        if disease not in self.datasets_config:
            self.datasets_config[disease] = {'sources': []}
        
        self.datasets_config[disease]['sources'].append(source_config)
        print(f"✅ Added custom source for {disease}: {source_config['name']}")
    
    def list_available_diseases(self):
        """List all available diseases"""
        diseases = list(self.datasets_config.keys())
        print("🏥 Available Diseases:")
        for i, disease in enumerate(diseases, 1):
            source_count = len(self.datasets_config[disease]['sources'])
            print(f"  {i}. {disease.replace('_', ' ').title()} ({source_count} sources)")
        return diseases
    
    def test_all_sources(self):
        """Test connectivity to all data sources"""
        print("🔍 Testing all data sources...")
        
        results = {
            'working': [],
            'failed': [],
            'total_sources': 0
        }
        
        for disease, config in self.datasets_config.items():
            for source in config['sources']:
                results['total_sources'] += 1
                source_id = f"{disease}:{source['name']}"
                
                try:
                    if source['type'] == 'direct_url':
                        response = requests.head(source['url'], timeout=10)
                        if response.status_code == 200:
                            results['working'].append(source_id)
                        else:
                            results['failed'].append(source_id)
                    
                    elif source['type'] == 'kaggle':
                        if self.api_configs['kaggle']:
                            # Test by getting dataset info
                            try:
                                self.api_configs['kaggle'].dataset_list_files(source['dataset_id'])
                                results['working'].append(source_id)
                            except:
                                results['failed'].append(source_id)
                        else:
                            results['failed'].append(source_id)
                    
                    else:
                        results['working'].append(source_id)  # Assume working for other types
                        
                except Exception:
                    results['failed'].append(source_id)
        
        # Print results
        print(f"\n📊 Source Connectivity Test Results:")
        print(f"✅ Working: {len(results['working'])}/{results['total_sources']}")
        print(f"❌ Failed: {len(results['failed'])}/{results['total_sources']}")
        
        if results['failed']:
            print(f"\n❌ Failed Sources:")
            for source in results['failed']:
                print(f"  - {source}")
        
        return results

# Example usage and testing
if __name__ == "__main__":
    # Initialize fetcher
    fetcher = MultiAPIDatasetFetcher()
    
    # List available diseases
    diseases = fetcher.list_available_diseases()
    
    # Test all sources
    fetcher.test_all_sources()
    
    # Example: Add custom dataset source
    custom_source = {
        'name': 'my_custom_diabetes_data',
        'type': 'direct_url',
        'url': 'https://example.com/my_diabetes_data.csv'
    }
    # fetcher.add_custom_dataset_source('diabetes', custom_source)
    
    # Fetch specific dataset
    print(f"\n{'='*60}")
    print("🔍 FETCHING DIABETES DATASET")
    print('='*60)
    
    diabetes_data, source = fetcher.fetch_dataset('diabetes', source_preference='kaggle')
    
    if diabetes_data is not None:
        print(f"\n📊 Dataset Preview:")
        print(f"Shape: {diabetes_data.shape}")
        print(f"Columns: {list(diabetes_data.columns)}")
        print(f"\nFirst 5 rows:")
        print(diabetes_data.head())
        print(f"\nData types:")
        print(diabetes_data.dtypes)
        print(f"\nMissing values:")
        print(diabetes_data.isnull().sum())
    
    # Example: Fetch all datasets
    # all_datasets = fetcher.fetch_all_datasets(source_preference='kaggle')
