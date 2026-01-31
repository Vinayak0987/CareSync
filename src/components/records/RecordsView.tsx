import { motion } from 'framer-motion';
import { FileText, Download, ShoppingBag, Calendar, Pill, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prescriptions, pastAppointments } from '@/lib/mockData';
import { toast } from 'sonner';

interface RecordsViewProps {
  onNavigate: (tab: string) => void;
}

export function RecordsView({ onNavigate }: RecordsViewProps) {
  const downloadPrescription = (id: string) => {
    toast.success('Prescription downloaded!', {
      description: 'PDF saved to your downloads folder',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">My Records</h1>
        <p className="text-muted-foreground">View your medical history and prescriptions</p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="vitals-card bg-gradient-to-r from-primary/5 via-transparent to-transparent"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Stethoscope size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">{pastAppointments.length + 1}</p>
            <p className="text-xs text-muted-foreground">Total Visits</p>
          </div>
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
              <FileText size={20} className="text-success" />
            </div>
            <p className="text-2xl font-display font-bold">{prescriptions.length}</p>
            <p className="text-xs text-muted-foreground">Prescriptions</p>
          </div>
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <Pill size={20} className="text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">4</p>
            <p className="text-xs text-muted-foreground">Active Medicines</p>
          </div>
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Calendar size={20} className="text-accent" />
            </div>
            <p className="text-2xl font-display font-bold">2</p>
            <p className="text-xs text-muted-foreground">This Year</p>
          </div>
        </div>
      </motion.div>

      {/* Past Appointments Timeline */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Visit History</h2>
        <div className="space-y-4">
          {pastAppointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="vitals-card flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{apt.doctorName}</h3>
                <p className="text-sm text-primary">{apt.specialty}</p>
                <p className="text-xs text-muted-foreground mt-1">{apt.date} • {apt.time}</p>
              </div>
              <span className="px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                Completed
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Prescriptions */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Prescriptions</h2>
        <div className="space-y-4">
          {prescriptions.map((rx, index) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="vitals-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold">{rx.diagnosis}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rx.doctorName} • {rx.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPrescription(rx.id)}
                  >
                    <Download size={14} className="mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onNavigate('store')}
                    className="bg-primary"
                  >
                    <ShoppingBag size={14} className="mr-1" />
                    Buy
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {rx.medicines.map((med, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Pill size={16} className="text-primary" />
                      <div>
                        <p className="font-medium text-sm">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{med.frequency}</p>
                      <p className="text-xs text-muted-foreground">{med.duration}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-sm">
                  <span className="font-medium">Advice:</span>{' '}
                  <span className="text-muted-foreground">{rx.advice}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
