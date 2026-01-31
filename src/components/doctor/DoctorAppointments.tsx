import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  time: string;
  reason?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment ${status}!`);
      fetchAppointments(); // Refresh list
    } catch (error) {
      console.error('Failed to update appointment', error);
      toast.error('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    filter === 'all' ? true : apt.status === filter
  );

  // Group by date
  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    const date = new Date(apt.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, label: 'Pending' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled' },
    };
    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', badge.bg, badge.text)}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your patient consultations</p>
        </div>

        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Appointments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-display font-bold">{appointments.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-display font-bold text-amber-600">
            {appointments.filter(a => a.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-display font-bold text-emerald-600">
            {appointments.filter(a => a.status === 'completed').length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Cancelled</p>
          <p className="text-2xl font-display font-bold text-red-600">
            {appointments.filter(a => a.status === 'cancelled').length}
          </p>
        </div>
      </motion.div>

      {/* Appointments List */}
      {Object.keys(groupedAppointments).length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-12 border border-border text-center"
        >
          <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">No appointments found</h3>
          <p className="text-muted-foreground">
            {filter === 'all' ? 'You have no scheduled appointments yet.' : `No ${filter} appointments.`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, apts], dateIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dateIndex * 0.1 }}
            >
              <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                {date}
              </h2>
              <div className="space-y-3">
                {apts.map((apt, index) => (
                  <motion.div
                    key={apt._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Patient Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <User size={18} className="text-primary" />
                              {apt.patientId?.name || 'Unknown Patient'}
                            </h3>
                            <p className="text-sm text-muted-foreground">{apt.patientId?.email}</p>
                            {apt.patientId?.phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone size={14} />
                                {apt.patientId.phone}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(apt.status)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {apt.time}
                          </span>
                        </div>

                        {apt.reason && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm">
                              <span className="font-medium">Reason:</span> {apt.reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {apt.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(apt._id, 'completed')}
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(apt._id, 'cancelled')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle size={16} className="mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
