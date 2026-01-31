import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  IndianRupee,
  Video,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { currentDoctor, todaysAppointments, type DoctorAppointment } from '@/lib/mockData';

interface DoctorDashboardProps {
  onNavigate: (tab: string) => void;
  onStartConsultation: (appointment: DoctorAppointment) => void;
}

export function DoctorDashboard({ onNavigate, onStartConsultation }: DoctorDashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const completedCount = todaysAppointments.filter(a => a.status === 'completed').length;
  const waitingCount = todaysAppointments.filter(a => a.status === 'waiting').length;
  const inProgressCount = todaysAppointments.filter(a => a.status === 'in-progress').length;

  const getStatusColor = (status: DoctorAppointment['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'in-progress': return 'bg-primary/10 text-primary';
      case 'waiting': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: DoctorAppointment['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'in-progress': return <Video size={14} />;
      case 'waiting': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary via-primary/90 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            {currentDoctor.name}
          </h1>
          <p className="text-white/80">
            You have <span className="font-semibold text-white">{waitingCount} patients</span> waiting today
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{todaysAppointments.length}</p>
              <p className="text-xs text-muted-foreground">Total Today</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{waitingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <IndianRupee size={20} className="text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">₹{completedCount * 500}</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <h2 className="font-display font-semibold text-lg">Today's Schedule</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="divide-y divide-border">
          {todaysAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Time */}
                <div className="w-16 text-center flex-shrink-0">
                  <p className="font-medium text-sm">{appointment.time}</p>
                </div>

                {/* Patient Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={appointment.patientAvatar}
                    alt={appointment.patientName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-border"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{appointment.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {appointment.age}y, {appointment.gender} • {appointment.reason}
                    </p>
                  </div>
                </div>

                {/* Conditions */}
                <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
                  {appointment.conditions.slice(0, 2).map((condition) => (
                    <span
                      key={condition}
                      className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] rounded-full"
                    >
                      {condition}
                    </span>
                  ))}
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(appointment.status)
                  )}>
                    {getStatusIcon(appointment.status)}
                    <span className="hidden sm:inline capitalize">{appointment.status.replace('-', ' ')}</span>
                  </span>

                  {(appointment.status === 'waiting' || appointment.status === 'in-progress') && (
                    <Button
                      size="sm"
                      onClick={() => onStartConsultation(appointment)}
                      className={appointment.status === 'in-progress' ? 'btn-hero' : ''}
                    >
                      <Video size={14} className="mr-1" />
                      {appointment.status === 'in-progress' ? 'Resume' : 'Start'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid sm:grid-cols-2 gap-4"
      >
        {/* Weekly Performance */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="font-display font-semibold">This Week</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-display font-bold text-primary">32</p>
              <p className="text-xs text-muted-foreground">Consultations</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-emerald-600">28</p>
              <p className="text-xs text-muted-foreground">Prescriptions</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-sky-600">4.9</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Next Patient */}
        {todaysAppointments.find(a => a.status === 'waiting') && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Next Patient</p>
            {(() => {
              const next = todaysAppointments.find(a => a.status === 'waiting')!;
              return (
                <div className="flex items-center gap-3">
                  <img
                    src={next.patientAvatar}
                    alt={next.patientName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{next.patientName}</p>
                    <p className="text-sm text-muted-foreground">{next.time} • {next.reason}</p>
                  </div>
                  <Button size="sm" onClick={() => onStartConsultation(next)}>
                    <Video size={14} className="mr-1" />
                    Start
                  </Button>
                </div>
              );
            })()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
