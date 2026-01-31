
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell, TrendingDown, TrendingUp, Minus, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VitalsCard } from './VitalsCard';
import { NextAppointment } from './NextAppointment';
import { MedicineChecklist } from './MedicineChecklist';
import { QuickVitalsLog } from './QuickVitalsLog';
import { DiseaseVitalsLog } from './DiseaseVitalsLog';
import { AIPredictions } from './AIPredictions';
import { CriticalAlertModal } from './CriticalAlertModal';
import { SmartHealthSetup } from '@/components/onboarding/SmartHealthSetup';
import { currentPatient, currentVitals, upcomingAppointments } from '@/lib/mockData';

import api from '@/lib/api';

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

interface Vital {
  _id: string;
  type: string;
  value: string;
  unit: string;
  status: string;
  createdAt: string;
  // mapped properties for display
  trend?: string;
  timestamp?: string;
}

// Icons for different vital types
const vitalIcons: Record<string, { icon: string; bgColor: string }> = {
  blood_pressure: { icon: '💓', bgColor: 'bg-rose-50' },
  blood_sugar: { icon: '🩸', bgColor: 'bg-amber-50' },
  heart_rate: { icon: '❤️', bgColor: 'bg-emerald-50' },
  oxygen: { icon: '🫁', bgColor: 'bg-sky-50' },
  glucose: { icon: '🍬', bgColor: 'bg-purple-50' },
  bmi: { icon: '⚖️', bgColor: 'bg-blue-50' },
  cholesterol: { icon: '🧈', bgColor: 'bg-yellow-50' },
  avg_glucose: { icon: '📊', bgColor: 'bg-indigo-50' },
  smoking_status: { icon: '🚭', bgColor: 'bg-gray-50' },
};

const vitalLabels: Record<string, string> = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  heart_rate: 'Heart Rate',
  oxygen: 'Oxygen Level',
  glucose: 'Glucose',
  bmi: 'BMI',
  cholesterol: 'Cholesterol',
  avg_glucose: 'Avg Glucose',
  smoking_status: 'Smoking Status',
};

// Helper to format date
const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSmartSetup, setShowSmartSetup] = useState(false);
  const [smartVitals, setSmartVitals] = useState<string[] | undefined>(undefined);
  const [hasChronicDisease, setHasChronicDisease] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);

    if (user.chronicDiseases && user.chronicDiseases.length > 0) {
      const disease = user.chronicDiseases[0];
      setHasChronicDisease(disease === 'diabetes' || disease === 'heart_diseases' || disease === 'hypertension');
    }
  }, []);
  // Fetch Vitals
  const fetchVitals = async () => {
    try {
      const response = await api.get('/vitals/latest');
      setVitals(response.data.map((v: any) => ({
        ...v,
        timestamp: formatTime(v.createdAt),
        trend: 'stable' // backend doesn't calculate trend yet
      })));
    } catch (error) {
      console.error('Failed to fetch vitals', error);
      // setVitals(currentVitals); 
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch User Profile for Monitoring Config
  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.monitoringConfig && res.data.monitoringConfig.length > 0) {
        setSmartVitals(res.data.monitoringConfig);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  useEffect(() => {
    fetchVitals();
    fetchProfile();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const handleSmartSetupComplete = (data: any) => {
    if (data.recommended_vitals) {
      setSmartVitals(data.recommended_vitals);
      setShowSmartSetup(false);
    }
  };

  const getRelevantVitalTypes = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.chronicDiseases || user.chronicDiseases.length === 0) {
      return null; // Show all vitals for users without chronic disease
    }

    const disease = user.chronicDiseases[0];

    switch (disease) {
      case 'diabetes':
        return ['glucose', 'blood_pressure', 'bmi'];
      case 'heart_diseases':
        return ['blood_pressure', 'cholesterol', 'blood_sugar', 'heart_rate'];
      case 'hypertension':
        return ['avg_glucose', 'blood_pressure', 'bmi', 'smoking_status'];
      default:
        return null; // Show all for "other" or "none"
    }
  };

  // Filter vitals based on disease
  const getFilteredVitals = () => {
    const relevantTypes = getRelevantVitalTypes();
    if (!relevantTypes) return vitals; // Show all if no specific disease
    return vitals.filter(vital => relevantTypes.includes(vital.type));
  };

  const filteredVitals = getFilteredVitals();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-amber-500" />;
      case 'down':
        return <TrendingDown size={14} className="text-amber-500" />;
      default:
        return <Minus size={14} className="text-emerald-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'down':
        return 'text-amber-600';
      default:
        return 'text-emerald-600';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'Rising';
      case 'down':
        return 'Falling';
      default:
        return 'Stable';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 font-sans animate-in fade-in duration-500">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GreetingIcon size={18} className="text-amber-500" />
            <span className="text-sm">{greeting.text}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            Welcome back, <span className="gradient-text">{userData?.name?.split(' ')[0] || 'User'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSmartSetup(!showSmartSetup)}
            className="gap-2 hidden md:flex"
          >
            <Activity size={16} className="text-primary" />
            {smartVitals ? 'Update Health Profile' : 'Upload Medical Report'}
          </Button>

          <button className="relative p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
          </button>
        </div>
      </motion.div>

      {/* Mobile Smart Setup Button */}
      <div className="md:hidden">
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={() => setShowSmartSetup(!showSmartSetup)}
        >
          <Activity size={16} className="text-primary" />
          {smartVitals ? 'Update Health Profile' : 'Automate My Vitals'}
        </Button>
      </div>

      {/* Smart Analysis Section */}
      {showSmartSetup && (
        <div className="mb-6">
          <SmartHealthSetup
            onComplete={handleSmartSetupComplete}
            onSkip={() => setShowSmartSetup(false)}
          />
        </div>
      )}

      {/* Critical Alert Banner */}
      {showCriticalAlert && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-900 animate-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Vitals Detected</AlertTitle>
          <AlertDescription>
            Your recent readings indicate potential health risks. We recommend consulting a specialist immediately.
            <div className="mt-3">
              <Button variant="destructive" size="sm" onClick={() => onNavigate('appointments')}>
                Book Emergency Appointment
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vitals Entry & Status */}
        <div className="lg:col-span-2 space-y-6">

          {/* Vitals Overview Cards */}
          <div>
            <h2 className="font-display font-semibold text-lg mb-4">Your Vitals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                // Determine which vitals to show
                const allTypes = ['blood_pressure', 'blood_sugar', 'heart_rate', 'oxygen'];
                const typesToShow = smartVitals || allTypes;

                // Map types to card data (merging API data with default structure)
                return typesToShow.map((type, index) => {
                  // Find actual data from API state
                  const realData = vitals.find((v: any) => v.type === type);

                  // Or fallback to mock data / placeholder if needed
                  const mockData = {
                    id: `placeholder-${type}`,
                    type: type,
                    value: '--',
                    unit: type === 'blood_pressure' ? 'mmHg' : type === 'blood_sugar' ? 'mg/dL' : type === 'heart_rate' ? 'bpm' : '%',
                    status: 'normal',
                    trend: 'stable',
                    timestamp: 'No data yet'
                  };

                  const displayVital: any = realData ? { ...realData, id: realData._id || realData.id } : mockData;

                  return <VitalsCard key={displayVital.id || type} vital={displayVital} index={index} />;
                });
              })()}
            </div>
          </div>

          {/* Quick Vitals Log */}
          <QuickVitalsLog
            onCriticalAlert={() => setShowCriticalAlert(true)}
            onLogSuccess={fetchVitals}
            conditions={currentPatient.conditions}
            recommendedVitals={smartVitals}
          />
        </div>

        {/* Right Column - Appointments & Medicines */}
        <div className="space-y-6">
          {/* Next Appointment */}
          <NextAppointment
            onJoinCall={() => onNavigate('consultation')}
          />

          {/* MedicineChecklist */}
          <MedicineChecklist />
        </div>
      </div>

      {/* Critical Alert Modal */}
      <CriticalAlertModal
        isOpen={showCriticalAlert}
        onClose={() => setShowCriticalAlert(false)}
        onEmergencyConnect={() => {
          setShowCriticalAlert(false);
          onNavigate('consultation');
        }}
      />
    </div>
  );
}
