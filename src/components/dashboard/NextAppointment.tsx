import { motion } from 'framer-motion';
import { Calendar, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Appointment } from '@/lib/mockData';
import { doctors } from '@/lib/mockData';

interface NextAppointmentProps {
  appointment: Appointment | undefined;
  onJoinCall: () => void;
}

export function NextAppointment({ appointment, onJoinCall }: NextAppointmentProps) {
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

  // Find doctor details
  const doctor = doctors.find(d => d.id === appointment.doctorId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm"
    >
      <div className="flex flex-col gap-4">
        {/* Top Section: Avatar & Info */}
        <div className="flex items-start gap-4">
          <img
            src={doctor?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'}
            alt={appointment.doctorName}
            className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary/10 flex-shrink-0"
          />

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Next Appointment</p>
            <h3 className="font-display font-semibold text-base text-foreground leading-tight mb-1">
              {appointment.doctorName}
            </h3>
            <p className="text-sm text-primary font-medium">{appointment.specialty}</p>
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
        <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span className="font-medium text-foreground">{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} />
              <span className="font-medium text-foreground">{appointment.time}</span>
            </div>
          </div>

          <Button
            onClick={onJoinCall}
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
