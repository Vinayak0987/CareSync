import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Star, ChevronLeft, ChevronRight, Search, Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import { doctors, availableTimeSlots, type Doctor } from '@/lib/mockData';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

interface AppointmentsViewProps {
  onNavigate: (tab: string) => void;
}

export function AppointmentsView({ onNavigate }: AppointmentsViewProps) {
  const { t, td, language } = useLanguage();
  const [specialty, setSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
<<<<<<< HEAD
  const [isBooking, setIsBooking] = useState(false);

  // Track booked appointments - map of doctorId to appointment details
  const [bookedAppointments, setBookedAppointments] = useState<Record<string, {
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    avatar?: string;
    date: Date;
    time: string;
    reason: string;
  }>>({});

  useEffect(() => {
    fetchDoctors();
    fetchUserAppointments();
  }, []);

  const fetchUserAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      const appointments = response.data;

      // Convert appointments array to bookedAppointments map
      const appointmentsMap: Record<string, any> = {};
      appointments.forEach((appt: any) => {
        appointmentsMap[appt.doctorId._id || appt.doctorId] = {
          appointmentId: appt._id,
          doctorId: appt.doctorId._id || appt.doctorId,
          doctorName: appt.doctorId.name || 'Unknown',
          specialty: appt.doctorId.specialty || 'General',
          avatar: appt.doctorId.avatar,
          date: new Date(appt.date),
          time: appt.time,
          reason: appt.reason || 'General Consultation',
        };
      });

      setBookedAppointments(appointmentsMap);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };

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
=======
>>>>>>> 60c72ca4a7d0c757f60e62feb6bfebc01a893d72

  // Generate calendar dates
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  // Get locale for date formatting based on language
  const getLocale = () => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
    };
    return localeMap[language] || 'en-US';
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSpecialty = specialty === 'all' || doc.specialty.toLowerCase().includes(specialty.toLowerCase());
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
<<<<<<< HEAD
      (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()));
=======
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
>>>>>>> 60c72ca4a7d0c757f60e62feb6bfebc01a893d72
    return matchesSpecialty && matchesSearch;
  });

  const handleBook = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

<<<<<<< HEAD
  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) return;

    setIsBooking(true);
    try {
      const appointmentDate = dates[selectedDate];

      const response = await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date: appointmentDate,
        time: selectedTime,
        reason: reason || 'General Consultation',
      });

      // Store the booked appointment with the returned appointmentId
      setBookedAppointments(prev => ({
        ...prev,
        [selectedDoctor._id]: {
          appointmentId: response.data._id,
          doctorId: selectedDoctor._id,
          doctorName: selectedDoctor.name,
          specialty: selectedDoctor.specialty,
          avatar: selectedDoctor.avatar,
          date: appointmentDate,
          time: selectedTime,
          reason: reason || 'General Consultation',
        }
      }));

      setBookingConfirmed(true);
      toast.success('Appointment booked successfully!', {
        description: `With ${selectedDoctor?.name} on ${dates[selectedDate].toLocaleDateString()} at ${selectedTime}`,
      });

      // Close modal after a short delay
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingConfirmed(false);
        setSelectedDoctor(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setReason('');
      }, 1500);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
=======
  const confirmBooking = () => {
    if (!selectedDate || !selectedTime) return;
    
    setBookingConfirmed(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingConfirmed(false);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setReason('');
      toast.success(t('bookingConfirmed' as any) || 'Appointment booked successfully!', {
        description: `${selectedDoctor?.name} - ${dates[selectedDate].toLocaleDateString(getLocale())} ${selectedTime}`,
      });
    }, 2000);
>>>>>>> 60c72ca4a7d0c757f60e62feb6bfebc01a893d72
  };

  // Specialty options with translations
  const specialtyOptions = [
    { value: 'all', labelKey: 'allSpecialties' },
    { value: 'cardiology', labelKey: 'cardiology' },
    { value: 'general', labelKey: 'generalMedicine' },
    { value: 'orthopedics', labelKey: 'orthopedics' },
    { value: 'neurology', labelKey: 'neurology' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">{t('bookAppointment')}</h1>
        <p className="text-muted-foreground">{t('findAndBook' as any) || 'Find and book consultations with our specialists'}</p>
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
            placeholder={t('searchDoctors' as any) || 'Search doctors...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder={t('allSpecialties' as any)} />
          </SelectTrigger>
          <SelectContent>
            {specialtyOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.labelKey as any) || opt.labelKey}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Doctor Cards */}
      <div className="grid gap-4">
        {filteredDoctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="vitals-card"
          >
            <div className="flex flex-col sm:flex-row gap-4">
<<<<<<< HEAD
              <UserAvatar
                name={doctor.name}
                avatar={doctor.avatar}
                size="xl"
=======
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/10"
>>>>>>> 60c72ca4a7d0c757f60e62feb6bfebc01a893d72
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-primary text-sm font-medium">{td(doctor.specialty)}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded-full">
                    <Star size={14} className="text-warning fill-warning" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {doctor.experience} {td('years experience')}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 mt-4 pt-3 border-t border-border/50">
<<<<<<< HEAD
                  {bookedAppointments[doctor._id] ? (
                    // Show booked status and action buttons
                    <div className="w-full space-y-3">
                      {/* Booked Badge */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success text-sm font-semibold rounded-full">
                          <Check size={16} />
                          Booked
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {bookedAppointments[doctor._id].date.toLocaleDateString('en', { month: 'short', day: 'numeric' })} • {bookedAppointments[doctor._id].time}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const appt = bookedAppointments[doctor._id];
                            const [hours, minutes] = appt.time.split(':');
                            const startTime = new Date(appt.date);
                            startTime.setHours(parseInt(hours), parseInt(minutes), 0);

                            const endTime = new Date(startTime);
                            endTime.setHours(endTime.getHours() + 1);

                            const formatGoogleCalendarDate = (date: Date) => {
                              return date.toISOString().replace(/-|:|\.\d+/g, '');
                            };

                            const title = encodeURIComponent(`Appointment with Dr. ${appt.doctorName}`);
                            const details = encodeURIComponent(`${appt.specialty} consultation${appt.reason ? `\n\nReason: ${appt.reason}` : ''}`);
                            const location = encodeURIComponent('CareConnect Health Platform - Virtual');
                            const start = formatGoogleCalendarDate(startTime);
                            const end = formatGoogleCalendarDate(endTime);

                            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;

                            window.open(googleCalendarUrl, '_blank');
                            toast.success('Opening Google Calendar...');
                          }}
                          size="sm"
                          className="flex-1 text-xs"
                          variant="default"
                        >
                          <Calendar size={14} className="mr-1.5" />
                          Add to Calendar
                        </Button>

                        <Button
                          onClick={async () => {
                            try {
                              const appointmentId = bookedAppointments[doctor._id].appointmentId;

                              // Delete appointment from database
                              await api.delete(`/appointments/${appointmentId}`);

                              // Remove from local state
                              setBookedAppointments(prev => {
                                const newState = { ...prev };
                                delete newState[doctor._id];
                                return newState;
                              });

                              toast.success('Appointment cancelled successfully');
                            } catch (error) {
                              console.error('Failed to cancel appointment:', error);
                              toast.error('Failed to cancel appointment');
                            }
                          }}
                          size="sm"
                          className="flex-1 text-xs"
                          variant="outline"
                        >
                          <X size={14} className="mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Show available and book button
                    <>
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
                    </>
                  )}
=======
                  {doctor.available ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                      <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                      {td('available now')}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                      {t('nextAvailableAt' as any) || 'Next available:'} {doctor.nextAvailable}
                    </span>
                  )}
                  <Button 
                    onClick={() => handleBook(doctor)}
                    size="sm"
                    className={cn(
                      "w-full sm:w-auto min-w-[140px]",
                      doctor.available ? 'btn-hero text-sm py-2' : ''
                    )}
                    variant={doctor.available ? 'default' : 'outline'}
                  >
                    {t('bookAppointment')}
                  </Button>
>>>>>>> 60c72ca4a7d0c757f60e62feb6bfebc01a893d72
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !bookingConfirmed && setShowBookingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {bookingConfirmed ? (
                <div className="p-8 relative">
                  {/* Close button */}
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingConfirmed(false);
                      setSelectedDoctor(null);
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setReason('');
                    }}
                    className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check size={40} className="text-success-foreground" />
                  </motion.div>
<<<<<<< HEAD

                  <h2 className="font-display font-bold text-2xl mb-2 text-center">Appointment Booked!</h2>
                  <p className="text-muted-foreground text-center mb-6">
                    Your appointment has been confirmed
                  </p>

                  {/* Appointment Details Card */}
                  <div className="bg-muted/30 rounded-xl p-4 mb-6 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar
                        name={selectedDoctor.name}
                        avatar={selectedDoctor.avatar}
                        size="md"
                      />
                      <div>
                        <h3 className="font-semibold">{selectedDoctor.name}</h3>
                        <p className="text-sm text-primary">{selectedDoctor.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-muted-foreground" />
                        <span>{selectedDate !== null ? dates[selectedDate].toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span>{selectedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        if (selectedDate === null || !selectedTime) return;

                        const appointmentDate = dates[selectedDate];
                        const [hours, minutes] = selectedTime.split(':');
                        const startTime = new Date(appointmentDate);
                        startTime.setHours(parseInt(hours), parseInt(minutes), 0);

                        const endTime = new Date(startTime);
                        endTime.setHours(endTime.getHours() + 1); // 1 hour appointment

                        const formatGoogleCalendarDate = (date: Date) => {
                          return date.toISOString().replace(/-|:|\.\d+/g, '');
                        };

                        const title = encodeURIComponent(`Appointment with Dr. ${selectedDoctor.name}`);
                        const details = encodeURIComponent(`${selectedDoctor.specialty} consultation${reason ? `\n\nReason: ${reason}` : ''}`);
                        const location = encodeURIComponent('CareConnect Health Platform - Virtual');
                        const start = formatGoogleCalendarDate(startTime);
                        const end = formatGoogleCalendarDate(endTime);

                        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;

                        window.open(googleCalendarUrl, '_blank');
                        toast.success('Opening Google Calendar...');
                      }}
                      className="w-full btn-hero h-11"
                      variant="default"
                    >
                      <Calendar size={18} className="mr-2" />
                      Add to Google Calendar
                    </Button>

                    <Button
                      onClick={async () => {
                        try {
                          // In a real app, you'd make an API call to cancel the appointment
                          // await api.delete(`/appointments/${appointmentId}`);

                          toast.success('Appointment cancelled successfully');
                          setBookingConfirmed(false);
                          setShowBookingModal(false);
                          setSelectedDoctor(null);
                          setSelectedDate(null);
                          setSelectedTime(null);
                          setReason('');
                        } catch (error) {
                          toast.error('Failed to cancel appointment');
                        }
                      }}
                      className="w-full h-11"
                      variant="outline"
                    >
                      <X size={18} className="mr-2" />
                      Cancel Appointment
                    </Button>
                  </div>
=======
                  <h2 className="font-display font-bold text-2xl mb-2">{t('bookingConfirmed' as any) || 'Booking Confirmed!'}</h2>
                  <p className="text-muted-foreground">{t('appointmentScheduled' as any) || 'Your appointment has been scheduled'}</p>
>>>>>>> 60c72ca4a7d0c757f60e62feb6bfebc01a893d72
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
<<<<<<< HEAD
                        <UserAvatar
                          name={selectedDoctor.name}
                          avatar={selectedDoctor.avatar}
                          size="md"
=======
                        <img
                          src={selectedDoctor.avatar}
                          alt={selectedDoctor.name}
                          className="w-12 h-12 rounded-xl object-cover"
>>>>>>> 60c72ca4a7d0c757f60e62feb6bfebc01a893d72
                        />
                        <div>
                          <h2 className="font-display font-semibold">{selectedDoctor.name}</h2>
                          <p className="text-sm text-primary">{td(selectedDoctor.specialty)}</p>
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
                        {t('selectDate' as any) || 'Select Date'}
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
                              {date.toLocaleDateString(getLocale(), { weekday: 'short' })}
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
                        {t('selectTime' as any) || 'Select Time'}
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
                      <h3 className="font-medium mb-3">{t('reasonForVisit' as any) || 'Reason for Visit'}</h3>
                      <Textarea
                        placeholder={t('describeSymptomsPlaceholder' as any) || 'Describe your symptoms or reason for consultation...'}
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
                      {t('confirmBooking' as any) || 'Confirm Booking'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
