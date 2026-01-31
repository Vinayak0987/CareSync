import { useState } from 'react';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';
import { DoctorDashboard } from '@/components/doctor/DoctorDashboard';
import { DoctorAppointments } from '@/components/doctor/DoctorAppointments';
import { DoctorConsultation } from '@/components/doctor/DoctorConsultation';
import { PatientHistory } from '@/components/doctor/PatientHistory';
import { DoctorSettings } from '@/components/doctor/DoctorSettings';

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

// Default mock appointment for demo consultation
const defaultMockAppointment: DoctorAppointment = {
  id: 'demo-consultation',
  patientId: 'demo-patient',
  patientName: 'Demo Patient',
  patientAvatar: 'https://ui-avatars.com/api/?name=Demo+Patient&background=0D9488&color=fff',
  patientEmail: 'demo.patient@email.com',
  patientPhone: '9876543210',
  age: 35,
  gender: 'Male',
  bloodGroup: 'O+',
  allergies: 'Penicillin',
  time: '10:00 AM',
  date: new Date().toISOString(),
  reason: 'Demo consultation - General checkup',
  status: 'in-progress',
  conditions: ['Hypertension', 'Diabetes'],
  notes: 'This is a demo consultation'
};

interface DoctorIndexProps {
  onLogout: () => void;
}

const DoctorIndex = ({ onLogout }: DoctorIndexProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentAppointment, setCurrentAppointment] = useState<DoctorAppointment | null>(null);

  const handleStartConsultation = (appointment: DoctorAppointment) => {
    setCurrentAppointment(appointment);
    setActiveTab('consultation');
  };

  const handleEndCall = () => {
    setCurrentAppointment(null);
    setActiveTab('dashboard');
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
        return <DoctorAppointments />;
      case 'consultation':
        // Use current appointment if set, otherwise use mock appointment for demo
        const appointment = currentAppointment || defaultMockAppointment;
        return (
          <DoctorConsultation
            appointment={appointment}
            onEndCall={handleEndCall}
          />
        );
      case 'patients':
        return <PatientHistory />;
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
    </div>
  );
};

export default DoctorIndex;

