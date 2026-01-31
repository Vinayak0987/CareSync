import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { AppointmentsView } from '@/components/appointments/AppointmentsView';
import { RecordsView } from '@/components/records/RecordsView';
import { ReportsView } from '@/components/reports/ReportsView';
import { ConsultationRoom } from '@/components/consultation/ConsultationRoom';
import { MedicalStoreView } from '@/components/store/MedicalStoreView';
import { WellnessView } from '@/components/wellness/WellnessView';
import { EmergencyButton } from '@/components/emergency/EmergencyGuide';
import { PatientCommunity } from '@/components/community/PatientCommunity';

interface IndexProps {
  onLogout: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome onNavigate={setActiveTab} />;
      case 'appointments':
        return <AppointmentsView onNavigate={setActiveTab} />;
      case 'records':
        return <RecordsView onNavigate={setActiveTab} />;
      case 'reports':
        return <ReportsView />;
      case 'consultation':
        return <ConsultationRoom onNavigate={setActiveTab} />;
      case 'store':
        return <MedicalStoreView />;
      case 'community':
        return <PatientCommunity />;
      case 'wellness':
        return <WellnessView />;
      default:
        return <DashboardHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Floating Emergency Button - Always visible */}
      <EmergencyButton />
    </div>
  );
};

export default Index;
