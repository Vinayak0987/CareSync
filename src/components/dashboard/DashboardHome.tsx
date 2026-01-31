import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell } from 'lucide-react';
import { VitalsCard } from './VitalsCard';
import { NextAppointment } from './NextAppointment';
import { MedicineChecklist } from './MedicineChecklist';
import { QuickVitalsLog } from './QuickVitalsLog';
import { CriticalAlertModal } from './CriticalAlertModal';
import { currentPatient, currentVitals, upcomingAppointments } from '@/lib/mockData';

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

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
            <GreetingIcon size={18} className="text-warning" />
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
          {currentVitals.map((vital, index) => (
            <VitalsCard key={vital.id} vital={vital} index={index} />
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <MedicineChecklist />
        <QuickVitalsLog onCriticalAlert={() => setShowCriticalAlert(true)} />
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
