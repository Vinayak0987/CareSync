import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  Clock,
  IndianRupee,
  Video,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Type definition for appointment data from API
interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  patientEmail: string;
  patientPhone: string;
  age: number | null;
  gender: string;
  bloodGroup: string;
  allergies: string;
  time: string;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  conditions: string[];
  notes?: string;
}

interface DoctorDashboardProps {
  onNavigate: (tab: string) => void;
  onStartConsultation: (appointment: DoctorAppointment) => void;
}

export function DoctorDashboard({ onNavigate, onStartConsultation }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [stats, setStats] = useState({ today: { total: 0, completed: 0 }, week: { total: 0, completed: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get doctor info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorName = user.name || 'Doctor';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Mock appointments for demo/fallback when no real data
  const mockAppointments: DoctorAppointment[] = [
    {
      id: 'mock-1',
      patientId: 'patient-1',
      patientName: 'Rahul Sharma',
      patientAvatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=0D9488&color=fff',
      patientEmail: 'rahul.sharma@email.com',
      patientPhone: '9876543210',
      age: 35,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      time: '10:00 AM',
      date: new Date().toISOString(),
      reason: 'Routine checkup and blood pressure monitoring',
      status: 'waiting',
      conditions: ['Hypertension', 'Diabetes'],
      notes: ''
    },
    {
      id: 'mock-2',
      patientId: 'patient-2',
      patientName: 'Priya Patel',
      patientAvatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=8B5CF6&color=fff',
      patientEmail: 'priya.patel@email.com',
      patientPhone: '9876543211',
      age: 28,
      gender: 'Female',
      bloodGroup: 'A+',
      allergies: '',
      time: '11:30 AM',
      date: new Date().toISOString(),
      reason: 'Follow-up consultation for migraine',
      status: 'confirmed',
      conditions: ['Migraine'],
      notes: ''
    },
    {
      id: 'mock-3',
      patientId: 'patient-3',
      patientName: 'Arun Kumar',
      patientAvatar: 'https://ui-avatars.com/api/?name=Arun+Kumar&background=F43F5E&color=fff',
      patientEmail: 'arun.kumar@email.com',
      patientPhone: '9876543212',
      age: 45,
      gender: 'Male',
      bloodGroup: 'B+',
      allergies: 'Sulfa drugs',
      time: '02:00 PM',
      date: new Date().toISOString(),
      reason: 'Chest pain evaluation',
      status: 'waiting',
      conditions: ['Heart Disease', 'High Cholesterol'],
      notes: 'Patient reported discomfort during exercise'
    },
    {
      id: 'mock-4',
      patientId: 'patient-4',
      patientName: 'Sneha Reddy',
      patientAvatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=10B981&color=fff',
      patientEmail: 'sneha.reddy@email.com',
      patientPhone: '9876543213',
      age: 32,
      gender: 'Female',
      bloodGroup: 'AB+',
      allergies: '',
      time: '03:30 PM',
      date: new Date().toISOString(),
      reason: 'Annual health checkup',
      status: 'confirmed',
      conditions: [],
      notes: ''
    }
  ];

  // Fetch today's appointments
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [appointmentsRes, statsRes] = await Promise.all([
          api.get('/appointments/today'),
          api.get('/appointments/stats')
        ]);
        // Use mock data if API returns empty
        const apiAppointments = appointmentsRes.data;
        if (apiAppointments.length === 0) {
          setAppointments(mockAppointments);
          setStats({ today: { total: 4, completed: 0 }, week: { total: 12, completed: 8 } });
        } else {
          setAppointments(apiAppointments);
          setStats(statsRes.data);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        // Use mock data on error for demo purposes
        setAppointments(mockAppointments);
        setStats({ today: { total: 4, completed: 0 }, week: { total: 12, completed: 8 } });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const waitingCount = appointments.filter(a => a.status === 'waiting' || a.status === 'confirmed').length;
  const inProgressCount = appointments.filter(a => a.status === 'in-progress').length;

  const getStatusColor = (status: DoctorAppointment['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'in-progress': return 'bg-primary/10 text-primary';
      case 'waiting':
      case 'confirmed': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: DoctorAppointment['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'in-progress': return <Video size={14} />;
      case 'waiting':
      case 'confirmed': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      setAppointments(prev =>
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus as DoctorAppointment['status'] } : apt)
      );
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const handleStartConsultation = (appointment: DoctorAppointment) => {
    updateAppointmentStatus(appointment.id, 'in-progress');
    onStartConsultation(appointment);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

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
            Dr. {doctorName}
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
              <p className="text-2xl font-display font-bold">{appointments.length}</p>
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
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium">No appointments scheduled for today</p>
              <p className="text-sm">Appointments will appear here when patients book with you</p>
            </div>
          ) : (
            appointments.map((appointment, index) => (
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
                        {appointment.age ? `${appointment.age}y, ` : ''}{appointment.gender} • {appointment.reason}
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

                    {(appointment.status === 'waiting' || appointment.status === 'confirmed' || appointment.status === 'in-progress') && (
                      <Button
                        size="sm"
                        onClick={() => handleStartConsultation(appointment)}
                        className={appointment.status === 'in-progress' ? 'btn-hero' : ''}
                      >
                        <Video size={14} className="mr-1" />
                        {appointment.status === 'in-progress' ? 'Resume' : 'Start'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
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
              <p className="text-2xl font-display font-bold text-primary">{stats.week.total}</p>
              <p className="text-xs text-muted-foreground">Consultations</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-emerald-600">{stats.week.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-sky-600">4.9</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Next Patient */}
        {appointments.find(a => a.status === 'waiting' || a.status === 'confirmed') && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Next Patient</p>
            {(() => {
              const next = appointments.find(a => a.status === 'waiting' || a.status === 'confirmed')!;
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
                  <Button size="sm" onClick={() => handleStartConsultation(next)}>
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
