import { motion } from 'framer-motion';
import { Calendar, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Appointment } from '@/lib/mockData';
import { doctors } from '@/lib/mockData';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface NextAppointmentProps {
  appointment: Appointment | undefined;
  onJoinCall: () => void;
}

export function NextAppointment({ appointment, onJoinCall }: NextAppointmentProps) {
  const { t, td } = useLanguage();
  
  if (!appointment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border shadow-sm"
      >
        <p className="text-muted-foreground text-center">{t('noData')}</p>
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
          <p className="text-xs text-muted-foreground mb-0.5">{t('nextAppointment')}</p>
          <h3 className="font-display font-semibold text-lg text-foreground">
            {appointment.doctorName}
          </h3>
          <p className="text-sm text-primary font-medium">{td(appointment.specialty)}</p>
          
          {appointment.reason && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{t('reason')}:</span> {appointment.reason}
            </p>
          )}
        </div>

        {/* Time and Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar size={16} />
              <span className="font-medium text-foreground">{t('today')}</span>
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
            {t('joinCall')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
