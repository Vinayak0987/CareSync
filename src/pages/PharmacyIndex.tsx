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
            case 'settings':
                return (
                    <div className="bg-card rounded-xl border border-border p-8">
                        <h1 className="text-2xl font-display font-bold mb-4">Settings</h1>
                        <p className="text-muted-foreground">Pharmacy settings page coming soon...</p>
                    </div>
                );
            default:
                return <PharmacyDashboard onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <PharmacySidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

            <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="max-w-6xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default PharmacyIndex;
