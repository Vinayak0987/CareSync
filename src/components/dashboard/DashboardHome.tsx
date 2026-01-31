import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { VitalsCard } from './VitalsCard';
import { NextAppointment } from './NextAppointment';
import { MedicineChecklist } from './MedicineChecklist';
import { QuickVitalsLog } from './QuickVitalsLog';
import { CriticalAlertModal } from './CriticalAlertModal';
import { currentPatient, currentVitals, upcomingAppointments } from '@/lib/mockData';

import api from '@/lib/api';
import { toast } from 'sonner';

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
};

const vitalLabels: Record<string, string> = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  heart_rate: 'Heart Rate',
  oxygen: 'Oxygen Level',
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
      // Fallback to mock data for demo if API fails or is empty initially?
      // For now just show nothing or maybe initial empty state is better.
      // Or maybe we load mock data if empty?
      // setVitals(currentVitals); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

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

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'Up';
      case 'down':
        return 'Down';
      default:
        return 'Stable';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend === 'stable' ? 'text-emerald-600' : 'text-amber-600';
  };

  return (
    <div className="space-y-6">
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
            Welcome back, <span className="gradient-text">{currentPatient.name.split(' ')[0]}</span>
          </h1>
        </div>

        <button className="relative p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors self-start">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
        </button>
      </motion.div>

      {/* Next Appointment */}
      <NextAppointment 
        appointment={upcomingAppointments[0]} 
        onJoinCall={() => onNavigate('consultation')}
      />

      {/* Vitals Grid */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Your Vitals</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {vitals.length === 0 && !isLoading && (
            <div className="col-span-4 text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              No recent vitals recorded. Add your first reading below! 👇
            </div>
          )}
          {vitals.map((vital, index) => (
            <motion.div
              key={vital._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-all"
            >
              {/* Icon and Trend */}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${vitalIcons[vital.type]?.bgColor || 'bg-gray-50'} flex items-center justify-center text-xl`}>
                  {vitalIcons[vital.type]?.icon || '📊'}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(vital.trend || 'stable')}`}>
                  {getTrendIcon(vital.trend || 'stable')}
                  <span>{getTrendLabel(vital.trend || 'stable')}</span>
                </div>
              </div>

              {/* Label */}
              <p className="text-sm text-muted-foreground mb-1">
                {vitalLabels[vital.type] || vital.type}
              </p>

              {/* Value */}
              <p className="text-2xl font-display font-bold text-foreground">
                {vital.value}{' '}
                <span className="text-sm font-normal text-muted-foreground">{vital.unit}</span>
              </p>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground mt-1">
                {vital.timestamp}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Grid - Medicines and Quick Vitals */}
      <div className="grid lg:grid-cols-2 gap-6">
        <MedicineChecklist />
        <QuickVitalsLog 
          onCriticalAlert={() => setShowCriticalAlert(true)} 
          onLogSuccess={fetchVitals}
        />
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
