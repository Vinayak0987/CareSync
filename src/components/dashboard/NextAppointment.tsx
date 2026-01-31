import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import api from '@/lib/api';

interface Appointment {
  _id: string;
  doctorId: any;
  date: string;
  time: string;
  reason?: string;
  status: string;
}

interface NextAppointmentProps {
  onJoinCall: () => void;
}

export function NextAppointment({ onJoinCall }: NextAppointmentProps) {
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNextAppointment = async () => {
      try {
        const response = await api.get('/appointments');
        const appointments = response.data;

        const now = new Date();

        // Find next upcoming appointment (confirmed or pending, in the future)
        const upcoming = appointments
          .filter((apt: Appointment) => {
            const aptDate = new Date(apt.date);
            return (apt.status === 'confirmed' || apt.status === 'pending') && aptDate >= now;
          })
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        setAppointment(upcoming);
      } catch (error) {
        console.error('Failed to fetch appointments', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextAppointment();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border shadow-sm"
      >
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (!appointment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border shadow-sm"
      >
        <p className="text-muted-foreground text-center">No upcoming appointments</p>
      </motion.div>
    );
  }

  // Format date
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm"
    >
      <div className="flex flex-col gap-4">
        {/* Top Section: Avatar & Info */}
        <div className="flex items-start gap-4">
          <UserAvatar
            name={appointment.doctorId?.name || 'Doctor'}
            avatar={appointment.doctorId?.avatar}
            size="lg"
          />

          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Next Appointment</p>
            <h3 className="font-display font-semibold text-lg text-foreground">
              Dr. {appointment.doctorId?.name || 'Unknown'}
            </h3>
            <p className="text-sm text-primary font-medium">{appointment.doctorId?.specialty || 'General'}</p>
          </div>
        </div>

        {/* Reason (if exists) */}
        {appointment.reason && (
          <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/50">
            <span className="font-medium text-foreground text-xs uppercase tracking-wider block mb-1">Reason</span>
            {appointment.reason}
          </div>
        )}

        {/* Time and Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar size={16} />
              <span className="font-medium text-foreground">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock size={16} />
              <span className="font-medium text-foreground">{appointment.time}</span>
            </div>
          </div>

          <Button
            onClick={() => {
              // Store appointment data for consultation
              localStorage.setItem('activeConsultation', JSON.stringify({
                appointmentId: appointment._id,
                doctorId: appointment.doctorId._id,
                doctorName: appointment.doctorId.name,
                doctorAvatar: appointment.doctorId.avatar,
                doctorSpecialty: appointment.doctorId.specialty,
              }));
              onJoinCall();
            }}
            size="sm"
            className="btn-hero flex items-center gap-2 shadow-sm"
          >
            <Video size={16} />
            Join Call
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
