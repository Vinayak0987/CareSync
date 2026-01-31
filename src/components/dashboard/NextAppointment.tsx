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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Doctor Avatar */}
        <div className="flex-shrink-0">
          <img
            src={doctor?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'}
            alt={appointment.doctorName}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-primary/10"
          />
        </div>

        {/* Appointment Details */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">Next Appointment</p>
          <h3 className="font-display font-semibold text-lg text-foreground">
            {appointment.doctorName}
          </h3>
          <p className="text-sm text-primary font-medium">{appointment.specialty}</p>
          
          {appointment.reason && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">Reason:</span> {appointment.reason}
            </p>
          )}
        </div>

        {/* Time and Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar size={16} />
              <span className="font-medium text-foreground">{appointment.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock size={16} />
              <span className="font-medium text-foreground">{appointment.time}</span>
            </div>
          </div>

          <Button 
            onClick={onJoinCall}
            className="btn-hero flex items-center gap-2 whitespace-nowrap"
          >
            <Video size={18} />
            Join Call
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
