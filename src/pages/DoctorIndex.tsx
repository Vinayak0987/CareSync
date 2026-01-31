import { useState } from 'react';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';
import { FloatingLanguageSwitcher } from '@/components/layout/FloatingLanguageSwitcher';
import { DoctorDashboard } from '@/components/doctor/DoctorDashboard';
import { DoctorAppointments } from '@/components/doctor/DoctorAppointments';
import { DoctorConsultation } from '@/components/doctor/DoctorConsultation';
import { PatientHistory } from '@/components/doctor/PatientHistory';
import { DoctorSettings } from '@/components/doctor/DoctorSettings';
import { DoctorCommunity } from '@/components/doctor/DoctorCommunity';

// Type definition for appointment data - matches API response
interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  patientEmail: string;
  patientPhone: string;
  age: number | null;
  gender: string;
  bloodGroup: string;
  allergies: string;
  time: string;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  conditions: string[];
  notes?: string;
}

interface DoctorIndexProps {
  onLogout: () => void;
}

const DoctorIndex = ({ onLogout }: DoctorIndexProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentAppointment, setCurrentAppointment] = useState<DoctorAppointment | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);

  const handleStartConsultation = (appointment: DoctorAppointment) => {
    setCurrentAppointment(appointment);
    setActiveTab('consultation');
  };

  const handleEndCall = () => {
    setCurrentAppointment(null);
    setActiveTab('dashboard');
  };

  const handleNavigateToPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DoctorDashboard
            onNavigate={setActiveTab}
            onStartConsultation={handleStartConsultation}
          />
        );
      case 'appointments':
        return <DoctorAppointments onNavigateToPatient={handleNavigateToPatient} />;
      case 'consultation':
        if (currentAppointment) {
          return (
            <DoctorConsultation
              appointment={currentAppointment}
              onEndCall={handleEndCall}
            />
          );
        }
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No active consultation. Start a call from the dashboard.</p>
          </div>
        );
      case 'patients':
        return <PatientHistory initialPatientId={selectedPatientId} />;
      case 'community':
        return <DoctorCommunity />;
      case 'settings':
        return <DoctorSettings />;
      default:
        return (
          <DoctorDashboard
            onNavigate={setActiveTab}
            onStartConsultation={handleStartConsultation}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DoctorSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Floating Language Switcher - Bottom Right */}
      <FloatingLanguageSwitcher />
    </div>
  );
};

export default DoctorIndex;

