import { useState } from 'react';
import { PharmacySidebar } from '@/components/pharmacy/PharmacySidebar';
import { PharmacyDashboard } from '@/components/pharmacy/PharmacyDashboard';
import { ProductsManager } from '@/components/pharmacy/ProductsManager';
import { OrdersManager } from '@/components/pharmacy/OrdersManager';

interface PharmacyIndexProps {
    onLogout: () => void;
}

const PharmacyIndex = ({ onLogout }: PharmacyIndexProps) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <PharmacyDashboard onNavigate={setActiveTab} />;
            case 'products':
                return <ProductsManager />;
            case 'orders':
                return <OrdersManager />;
            default:
                return <PharmacyDashboard onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <PharmacySidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default PharmacyIndex;
