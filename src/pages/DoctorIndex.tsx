import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';

import { DoctorDashboard } from '@/components/doctor/DoctorDashboard';
import { DoctorAppointments } from '@/components/doctor/DoctorAppointments';
import { DoctorConsultation } from '@/components/doctor/DoctorConsultation';
import { PatientHistory } from '@/components/doctor/PatientHistory';
import { DoctorSettings } from '@/components/doctor/DoctorSettings';
import { DoctorCommunity } from '@/components/doctor/DoctorCommunity';
import { DoctorCallHistory } from '@/components/doctor/DoctorCallHistory';

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
  // Initialize from localStorage to persist state across refreshes
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('doctorActiveTab') || 'dashboard';
  });

  const [currentAppointment, setCurrentAppointment] = useState<DoctorAppointment | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);

  // Persist activeTab whenever it changes
  useEffect(() => {
    localStorage.setItem('doctorActiveTab', activeTab);
  }, [activeTab]);

  const handleStartConsultation = (appointment: DoctorAppointment) => {
    setCurrentAppointment(appointment);
    setActiveTab('consultation');
  };

  const handleEndCall = async () => {
    if (currentAppointment) {
      try {
        // Get auth token
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (user?.token) {
          // Update appointment status to completed
          const response = await fetch(`http://localhost:5000/api/appointments/${currentAppointment.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ status: 'completed' })
          });

          if (response.ok) {
            toast.success('Consultation ended', {
              description: 'Appointment has been marked as completed.'
            });
          } else {
            toast.error('Failed to update appointment status');
          }
        }
      } catch (error) {
        console.error('Error updating appointment status:', error);
      }
    }

    setCurrentAppointment(null);
    setActiveTab('dashboard');
  };

  const handleNavigateToPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  // Custom Logout handler to clean up simple persisted state
  const handleLogout = () => {
    localStorage.removeItem('doctorActiveTab');
    onLogout();
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
        return <DoctorCallHistory />;
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
      <DoctorSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>


    </div>
  );
};

export default DoctorIndex;
