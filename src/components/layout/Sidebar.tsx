import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Calendar,
  FileText,
  Video,
  ShoppingBag,
  Heart,
  BarChart3,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { currentPatient } from '@/lib/mockData';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}


export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('dashboard'), icon: Home },
    { id: 'appointments', label: t('appointments'), icon: Calendar },
    { id: 'records', label: t('records'), icon: FileText },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'consultation', label: t('consultation'), icon: Video },
    { id: 'store', label: t('medicalStore'), icon: ShoppingBag },
    { id: 'wellness', label: t('wellness'), icon: Heart },
    { id: 'community', label: 'Community', icon: MessageSquare },
  ];

  const displayName = user?.name || currentPatient.name;
  const displayRole = user?.role === 'patient' ? t('patient') : user?.role || t('patient');
  const displayAvatar = user?.avatar || currentPatient.avatar;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky lg:top-0 h-screen inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border",
        "transform transition-transform duration-300 lg:transform-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
                <img src="/CareSyncLogo.png" alt="CareSync Logo" className="h-28 w-auto object-contain" />
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "nav-link w-full",
                  activeTab === item.id && "active"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
              <img 
                src={currentPatient.avatar} 
                alt={currentPatient.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{currentPatient.name}</p>
                <p className="text-xs text-muted-foreground">{t('patient')}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
                title={t('logout')}
              >
                <LogOut size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
