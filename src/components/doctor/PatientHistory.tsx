import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  User, 
  FileText, 
  Activity, 
  Phone,
  Droplets,
  Calendar,
  AlertTriangle
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
import { patients, prescriptions, vitalsHistory, type Patient } from '@/lib/mockData';

export function PatientHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
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
                      {patient.age}y, {patient.gender} • {patient.bloodGroup}
                    </p>
                  </div>
                  {patient.conditions.length > 0 && (
                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Patient Details */}
        {selectedPatient && (
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
                      {selectedPatient.age} years, {selectedPatient.gender}
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
                  <p className="text-sm font-medium mb-2">Known Conditions</p>
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
                  <LineChart data={vitalsHistory}>
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

            {/* Past Prescriptions */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-primary" />
                <h3 className="font-display font-semibold">Prescription History</h3>
              </div>
              <div className="space-y-4">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{rx.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">{rx.doctorName}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {rx.date}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {rx.medicines.map((med) => (
                        <span
                          key={med.name}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg"
                        >
                          {med.name} {med.dosage} • {med.frequency} • {med.duration}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{rx.advice}"</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
