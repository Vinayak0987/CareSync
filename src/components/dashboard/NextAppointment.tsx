import { motion } from 'framer-motion';
import { Calendar, Clock, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/lib/mockData';
import { doctors } from '@/lib/mockData';

interface NextAppointmentProps {
  appointment: Appointment | null;
  onJoinCall: () => void;
}

export function NextAppointment({ appointment, onJoinCall }: NextAppointmentProps) {
  const doctor = appointment ? doctors.find(d => d.id === appointment.doctorId) : null;

  if (!appointment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="vitals-card col-span-full lg:col-span-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg mb-1">No Upcoming Appointments</h3>
            <p className="text-muted-foreground text-sm">Schedule a consultation with your doctor</p>
          </div>
          <Button className="btn-hero">
            Book Now <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="vitals-card col-span-full lg:col-span-2 overflow-hidden relative"
    >
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {doctor && (
            <img 
              src={doctor.avatar} 
              alt={doctor.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary/20"
            />
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Next Appointment</p>
            <h3 className="font-display font-semibold text-lg">{appointment.doctorName}</h3>
            <p className="text-sm text-primary font-medium">{appointment.specialty}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-muted-foreground" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-muted-foreground" />
            <span className="font-medium">{appointment.time}</span>
          </div>
          <Button onClick={onJoinCall} className="btn-hero">
            <Video size={16} className="mr-2" />
            Join Call
          </Button>
        </div>
      </div>

      {appointment.reason && (
        <div className="relative mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Reason:</span> {appointment.reason}
          </p>
        </div>
      )}
    </motion.div>
  );
}
