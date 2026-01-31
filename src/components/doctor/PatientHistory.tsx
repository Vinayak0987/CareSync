import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  User,
  FileText,
  Activity,
  Phone,
  Droplets,
  Calendar,
  AlertTriangle,
  Loader2,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// Type definition for patient data from API
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  age: number | null;
  gender: string;
  bloodGroup: string;
  conditions: string[];
  dateOfBirth?: string;
}

interface PatientDetails extends Patient {
  appointmentHistory: {
    id: string;
    date: string;
    time: string;
    reason: string;
    status: string;
    notes?: string;
  }[];
}

// Mock vitals history for now - this would come from a vitals API in production
const mockVitalsHistory = [
  { date: 'Mon', systolic: 120, diastolic: 80, heartRate: 72 },
  { date: 'Tue', systolic: 118, diastolic: 78, heartRate: 70 },
  { date: 'Wed', systolic: 122, diastolic: 82, heartRate: 75 },
  { date: 'Thu', systolic: 119, diastolic: 79, heartRate: 71 },
  { date: 'Fri', systolic: 121, diastolic: 81, heartRate: 73 },
  { date: 'Sat', systolic: 117, diastolic: 77, heartRate: 69 },
  { date: 'Sun', systolic: 120, diastolic: 80, heartRate: 72 },
];

export function PatientHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/doctors/my-patients');
        setPatients(response.data);
        // Auto-select first patient if available
        if (response.data.length > 0) {
          fetchPatientDetails(response.data[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching patients:', err);
        setError(err.response?.data?.message || 'Failed to load patients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Fetch patient details
  const fetchPatientDetails = async (patientId: string) => {
    setIsLoadingDetails(true);
    try {
      const response = await api.get(`/doctors/patient/${patientId}`);
      setSelectedPatient(response.data);
    } catch (err: any) {
      console.error('Error fetching patient details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    fetchPatientDetails(patient.id);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Patient Records</h1>
        <p className="text-muted-foreground">View and manage patient medical history</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Patient List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 flex-shrink-0"
        >
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
              {patients.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">No patients yet</p>
                  <p className="text-sm">Patients will appear here after they book appointments with you</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">No matching patients</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={cn(
                      "w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left",
                      selectedPatient?.id === patient.id && "bg-primary/5 border-l-2 border-primary"
                    )}
                  >
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.age ? `${patient.age}y, ` : ''}{patient.gender} • {patient.bloodGroup}
                      </p>
                    </div>
                    {patient.conditions.length > 0 && (
                      <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Patient Details */}
        {isLoadingDetails ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : selectedPatient ? (
          <motion.div
            key={selectedPatient.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-4"
          >
            {/* Patient Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold">{selectedPatient.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {selectedPatient.age ? `${selectedPatient.age} years, ` : ''}{selectedPatient.gender}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets size={14} />
                      {selectedPatient.bloodGroup}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {selectedPatient.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              {selectedPatient.conditions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-2">Known Conditions/Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full flex items-center gap-1"
                      >
                        <AlertTriangle size={12} />
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vitals Chart */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-primary" />
                <h3 className="font-display font-semibold">Vitals History</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockVitalsHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[60, 150]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#8b5cf6" strokeWidth={2} name="Diastolic" />
                    <Line type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={2} name="Heart Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment History */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-primary" />
                <h3 className="font-display font-semibold">Appointment History</h3>
              </div>
              <div className="space-y-4">
                {selectedPatient.appointmentHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <Calendar size={32} className="mx-auto mb-2 text-muted-foreground/50" />
                    <p>No appointment history</p>
                  </div>
                ) : (
                  selectedPatient.appointmentHistory.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 bg-muted/50 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{apt.reason}</p>
                          <p className="text-sm text-muted-foreground capitalize">{apt.status}</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={12} />
                          {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {apt.notes && (
                        <p className="text-sm text-muted-foreground italic">"{apt.notes}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : patients.length > 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px] text-muted-foreground">
            <div className="text-center">
              <User size={48} className="mx-auto mb-3 text-muted-foreground/50" />
              <p>Select a patient to view their details</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
