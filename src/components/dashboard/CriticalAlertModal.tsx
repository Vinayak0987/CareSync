import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriticalAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencyConnect: () => void;
}

export function CriticalAlertModal({ isOpen, onClose, onEmergencyConnect }: CriticalAlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-md w-full"
          >
            <div className="bg-card rounded-2xl border-2 border-alert overflow-hidden shadow-2xl">
              {/* Alert header */}
              <div className="bg-gradient-to-r from-alert to-accent p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full animate-pulse">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg">CRITICAL HEALTH ALERT</h2>
                      <p className="text-sm text-white/80">Immediate attention required</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-center mb-6 text-muted-foreground">
                  Your vitals indicate potentially dangerous levels. We recommend connecting with a healthcare provider immediately.
                </p>

                <div className="space-y-3">
                  <Button 
                    onClick={onEmergencyConnect}
                    className="w-full h-12 bg-alert hover:bg-alert/90 text-alert-foreground font-semibold text-lg"
                  >
                    <Phone size={20} className="mr-2" />
                    Connect Doctor Now
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="w-full"
                  >
                    I'll monitor myself
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  If this is a life-threatening emergency, please call your local emergency services immediately.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
