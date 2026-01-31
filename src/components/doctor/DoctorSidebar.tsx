import { useState } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { currentDoctor } from '@/lib/mockData';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DoctorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function DoctorSidebar({ activeTab, onTabChange, onLogout }: DoctorSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t, td } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'consultation', label: t('consultation'), icon: Video },
    { id: 'patients', label: t('patientRecords'), icon: Users },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 w-64 bg-card border-r border-border z-40 flex flex-col transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope size={20} className="text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-lg gradient-text">CareSync</span>
              <p className="text-xs text-muted-foreground">{t('doctorPortal')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Doctor Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-3">
            <img
              src={currentDoctor.avatar}
              alt={currentDoctor.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentDoctor.name}</p>
              <p className="text-xs text-muted-foreground truncate">{td(currentDoctor.specialty)}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
