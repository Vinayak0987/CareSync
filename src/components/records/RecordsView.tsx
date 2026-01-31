import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Stethoscope, Pill } from 'lucide-react';

interface RecordsViewProps {
  onNavigate: (tab: string) => void;
}

interface Appointment {
  _id: string;
  doctorId: any;
  date: string;
  time: string;
  reason?: string;
  status: string;
}

export function RecordsView({ onNavigate }: RecordsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitalsCount, setVitalsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch appointments
      const appointmentsRes = await api.get('/appointments');
      setAppointments(appointmentsRes.data);

      // Fetch vitals to get count
      const vitalsRes = await api.get('/vitals');
      setVitalsCount(vitalsRes.data.length);
    } catch (error) {
      console.error('Failed to fetch records', error);
      toast.error('Failed to load medical records');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const completedVisits = appointments.filter((apt: Appointment) => apt.status === 'completed').length;
  const thisYearVisits = appointments.filter((apt: Appointment) => {
    const aptDate = new Date(apt.date);
    const now = new Date();
    return aptDate.getFullYear() === now.getFullYear();
  }).length;

  const records = [] as any[]; // Placeholder if we need mixed records

  const downloadPrescription = (id: string) => {
    toast.success('Prescription downloaded!', {
      description: 'PDF saved to your downloads folder',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Medical Records</h1>
        <p className="text-muted-foreground">View and download your medical documents</p>
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
            <p className="text-2xl font-display font-bold">{completedVisits}</p>
            <p className="text-xs text-muted-foreground">Total Visits</p>
          </div>
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
              <FileText size={20} className="text-success" />
            </div>
            <p className="text-2xl font-display font-bold">{vitalsCount}</p>
            <p className="text-xs text-muted-foreground">Vitals Logged</p>
          </div>
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <Pill size={20} className="text-warning" />
            </div>
            <p className="text-2xl font-display font-bold">{appointments.length}</p>
            <p className="text-xs text-muted-foreground">Total Appointments</p>
          </div>
          <div className="text-center p-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Calendar size={20} className="text-accent" />
            </div>
            <p className="text-2xl font-display font-bold">{thisYearVisits}</p>
            <p className="text-xs text-muted-foreground">This Year</p>
          </div>
        </div>
      </motion.div>

      {/* Past Appointments Timeline */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Visit History</h2>
        {completedVisits === 0 ? (
          <div className="vitals-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No completed appointments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Book your first consultation to get started</p>
            <Button onClick={() => onNavigate('appointments')} className="mt-4">
              Book Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments
              .filter((apt: Appointment) => apt.status === 'completed')
              .map((apt, index) => {
                const aptDate = new Date(apt.date);
                const formattedDate = aptDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <motion.div
                    key={apt._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="vitals-card flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">Dr. {apt.doctorId?.name || 'Unknown'}</h3>
                      <p className="text-sm text-primary">{apt.doctorId?.specialty || 'General'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formattedDate} • {apt.time}</p>
                      {apt.reason && (
                        <p className="text-xs text-muted-foreground mt-1">Reason: {apt.reason}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                      Completed
                    </span>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Prescriptions - Placeholder for future implementation */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Prescriptions</h2>
        <div className="vitals-card text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No prescriptions yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Prescriptions from your doctor consultations will appear here
          </p>
        </div>
      </div>

      {/* Empty State */}
      {records.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No records yet</h3>
          <p className="text-muted-foreground">Your medical records will appear here</p>
        </div>
      )}
    </div>
  );
}
