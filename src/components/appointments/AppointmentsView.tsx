import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Star, ChevronLeft, ChevronRight, Search, Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
// import { doctors, availableTimeSlots, type Doctor } from '@/lib/mockData';
import { availableTimeSlots } from '@/lib/mockData'; // Keep timeslots mock for now or move to backend config
import { toast } from 'sonner';
import api from '@/lib/api';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  role: string;
  avatar?: string;
  rating?: number;
  experience?: number;
  // available?: boolean; // dynamic from backend logic later
}

interface AppointmentsViewProps {
  onNavigate: (tab: string) => void;
}

export function AppointmentsView({ onNavigate }: AppointmentsViewProps) {
  const [specialty, setSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      // In a real app, you might want to filter by role=doctor
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate calendar dates
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const filteredDoctors = doctors.filter(doc => {
    const matchesSpecialty = specialty === 'all' || (doc.specialty && doc.specialty.toLowerCase().includes(specialty.toLowerCase()));
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpecialty && matchesSearch;
  });

  const handleBook = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) return;
    
    setIsBooking(true);
    try {
      const appointmentDate = dates[selectedDate];
      
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date: appointmentDate,
        time: selectedTime,
        reason: reason || 'General Consultation',
      });

      setBookingConfirmed(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingConfirmed(false);
        setSelectedDoctor(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setReason('');
        toast.success('Appointment booked successfully!', {
          description: `With ${selectedDoctor?.name} on ${dates[selectedDate].toLocaleDateString()} at ${selectedTime}`,
        });
      }, 2000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Book Appointment</h1>
        <p className="text-muted-foreground">Find and book consultations with our specialists</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            <SelectItem value="cardiology">Cardiology</SelectItem>
            <SelectItem value="general">General Medicine</SelectItem>
            <SelectItem value="orthopedics">Orthopedics</SelectItem>
            <SelectItem value="neurology">Neurology</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Doctor Cards */}
      <div className="grid gap-4">
        {filteredDoctors.map((doctor, index) => (
          <motion.div
            key={doctor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="vitals-card"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={doctor.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=faces'}
                alt={doctor.name}
                className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/10"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-primary text-sm font-medium">{doctor.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded-full">
                    <Star size={14} className="text-warning fill-warning" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {doctor.experience} years experience
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 mt-4 pt-3 border-t border-border/50">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    Available Now
                  </span>
                  <Button 
                    onClick={() => handleBook(doctor)}
                    size="sm"
                    className={cn(
                      "w-full sm:w-auto min-w-[140px]",
                      'btn-hero text-sm py-2'
                    )}
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedDoctor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
              onClick={() => !bookingConfirmed && setShowBookingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-card rounded-2xl border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {bookingConfirmed ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check size={40} className="text-success-foreground" />
                  </motion.div>
                  <h2 className="font-display font-bold text-2xl mb-2">Booking Confirmed!</h2>
                  <p className="text-muted-foreground">Your appointment has been scheduled</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedDoctor.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=faces'}
                          alt={selectedDoctor.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <h2 className="font-display font-semibold">{selectedDoctor.name}</h2>
                          <p className="text-sm text-primary">{selectedDoctor.specialty}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowBookingModal(false)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Date Selection */}
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar size={18} className="text-primary" />
                        Select Date
                      </h3>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {dates.slice(0, 7).map((date, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(idx)}
                            className={cn(
                              "flex-shrink-0 w-16 py-3 rounded-xl border text-center transition-all",
                              selectedDate === idx
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <p className="text-xs opacity-70">
                              {date.toLocaleDateString('en', { weekday: 'short' })}
                            </p>
                            <p className="font-display font-bold text-lg">
                              {date.getDate()}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Clock size={18} className="text-primary" />
                        Select Time
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "py-2.5 rounded-lg border text-sm font-medium transition-all",
                              selectedTime === slot
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <h3 className="font-medium mb-3">Reason for Visit</h3>
                      <Textarea
                        placeholder="Describe your symptoms or reason for consultation..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={confirmBooking}
                      disabled={!selectedDate || !selectedTime}
                      className="w-full btn-hero h-12"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
