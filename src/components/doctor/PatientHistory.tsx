import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Users,
  Brain,
  Eye,
  File,
  CheckSquare,
  X,
  Sparkles
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

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

interface Report {
  _id: string;
  title: string;
  type: string;
  description?: string;
  fileUrl: string;
  date: string;
  createdAt: string;
}

// Mock vitals history
const mockVitalsHistory = [
  { date: 'Mon', systolic: 120, diastolic: 80, heartRate: 72 },
  { date: 'Tue', systolic: 118, diastolic: 78, heartRate: 70 },
  { date: 'Wed', systolic: 122, diastolic: 82, heartRate: 75 },
  { date: 'Thu', systolic: 119, diastolic: 79, heartRate: 71 },
  { date: 'Fri', systolic: 121, diastolic: 81, heartRate: 73 },
  { date: 'Sat', systolic: 117, diastolic: 77, heartRate: 69 },
  { date: 'Sun', systolic: 120, diastolic: 80, heartRate: 72 },
];

interface PatientHistoryProps {
  initialPatientId?: string;
}

export function PatientHistory({ initialPatientId }: PatientHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);
  const [patientReports, setPatientReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false); // Modal state

  // Report Selection State
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/doctors/my-patients');
        setPatients(response.data);
        // Auto-select patient
        if (initialPatientId) {
          fetchPatientDetails(initialPatientId);
        } else if (response.data.length > 0) {
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
    setAiAnalysis(null); // Reset analysis on patient change
    setIsAnalysisOpen(false);
    setSelectedReportIds(new Set()); // Reset selection

    try {
      const response = await api.get(`/doctors/patient/${patientId}`);
      setSelectedPatient(response.data);

      // Parallel fetch for sub-data
      const [presRes, reportsRes] = await Promise.all([
        api.get(`/prescriptions/patient/${patientId}`),
        api.get(`/reports/patient/${patientId}`)
      ]);

      setPatientPrescriptions(presRes.data);
      setPatientReports(reportsRes.data);
    } catch (err: any) {
      console.error('Error fetching patient details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    fetchPatientDetails(patient.id);
  };

  // Toggle single report selection
  const toggleReportSelection = (id: string) => {
    const newSelected = new Set(selectedReportIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReportIds(newSelected);
  };

  // Toggle all reports
  const toggleAllReports = () => {
    if (selectedReportIds.size === patientReports.length && patientReports.length > 0) {
      setSelectedReportIds(new Set());
    } else {
      setSelectedReportIds(new Set(patientReports.map(r => r._id)));
    }
  };

  const handleAnalyzeReports = async () => {
    if (!selectedPatient) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setIsAnalysisOpen(true); // Open modal immediately to show loading state

    try {
      const payload: any = { patientId: selectedPatient.id };
      if (selectedReportIds.size > 0) {
        payload.reportIds = Array.from(selectedReportIds);
      }

      const res = await api.post('/reports/analyze', payload);
      setAiAnalysis(res.data.analysis);
      // toast.success('Analysis complete'); // Modal is enough feedback
    } catch (error: any) {
      console.error('Analysis failed', error);
      toast.error(error.response?.data?.message || 'Failed to analyze reports');
      setIsAnalysisOpen(false); // Close on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openReport = async (filename: string) => {
    try {
      const response = await api.get(`/reports/file/${filename}`, {
        responseType: 'blob'
      });
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Error opening report:', error);
      toast.error('Failed to open report');
    }
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
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Patient Records</h1>
        <p className="text-muted-foreground">View reports, vitals, and generate AI insights</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Left Sidebar: Patient List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 flex-shrink-0 bg-card rounded-xl border border-border shadow-sm flex flex-col"
        >
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

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {patients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users size={48} className="mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">No patients yet</p>
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
        </motion.div>

        {/* Right Content: Details & Tabs */}
        {isLoadingDetails ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : selectedPatient ? (
          <motion.div
            key={selectedPatient.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col min-h-0 bg-transparent gap-4"
          >
            {/* Top Card: Patient Info */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedPatient.avatar}
                    alt={selectedPatient.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-primary/10"
                  />
                  <div>
                    <h2 className="text-xl font-display font-bold">{selectedPatient.name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {selectedPatient.age ? `${selectedPatient.age} yrs` : 'N/A'}, {selectedPatient.gender}
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

                {/* Analyze Action Button in Header */}
                <Button
                  onClick={handleAnalyzeReports}
                  disabled={isAnalyzing}
                  className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90"
                >
                  <Sparkles size={16} />
                  {selectedReportIds.size > 0
                    ? `Analyze Selected (${selectedReportIds.size})`
                    : "Analyze Reports"}
                </Button>
              </div>
            </div>

            {/* Tabs for content organization */}
            <Tabs defaultValue="reports" className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="reports" className="gap-2"><FileText size={14} /> Reports</TabsTrigger>
                  <TabsTrigger value="vitals" className="gap-2"><Activity size={14} /> Vitals</TabsTrigger>
                  <TabsTrigger value="prescriptions" className="gap-2"><File size={14} /> Prescriptions</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <TabsContent value="reports" className="mt-0 space-y-4">
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm min-h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display font-semibold flex items-center gap-2">
                          Medical Reports Repository
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Select reports to analyze with AI</p>
                      </div>

                      {patientReports.length > 0 && (
                        <Button variant="outline" size="sm" onClick={toggleAllReports} className="text-xs h-8">
                          {selectedReportIds.size === patientReports.length ? "Deselect All" : "Select All"}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {patientReports.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-muted rounded-xl bg-muted/20">
                          <File size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                          <p>No reports uploaded yet</p>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {patientReports.map((report) => (
                            <div
                              key={report._id}
                              onClick={() => toggleReportSelection(report._id)}
                              className={cn(
                                "group relative p-4 border rounded-xl transition-all cursor-pointer hover:shadow-md",
                                selectedReportIds.has(report._id)
                                  ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                  : "bg-background border-border hover:border-primary/50"
                              )}
                            >
                              <div className="absolute top-3 right-3 z-10">
                                <Checkbox
                                  checked={selectedReportIds.has(report._id)}
                                  // Event default prevented by parent onClick, but we can keep standard behavior
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </div>

                              <div className="flex items-start gap-3 mb-3">
                                <div className={cn(
                                  "p-2.5 rounded-lg",
                                  selectedReportIds.has(report._id) ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                  <p className="font-semibold text-sm truncate" title={report.title}>{report.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{report.type}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                                  onClick={(e) => { e.stopPropagation(); openReport(report.fileUrl); }}
                                >
                                  <Eye size={12} className="mr-1" /> View
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vitals" className="mt-0">
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                    <div className="h-80">
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
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-0">
                  <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                    <div className="space-y-4">
                      {patientPrescriptions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <FileText size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                          <p>No prescription history found</p>
                        </div>
                      ) : (
                        patientPrescriptions.map((rx) => (
                          <div key={rx._id} className="p-4 bg-muted/30 rounded-xl border border-transparent hover:border-border transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="font-semibold text-primary block">{new Date(rx.createdAt).toLocaleDateString()}</span>
                                <span className="text-xs text-muted-foreground">Dr. {rx.doctorId?.name || 'Doctor'}</span>
                              </div>
                              <span className="px-2 py-1 bg-background border rounded text-xs font-medium">
                                Dx: {rx.diagnosis}
                              </span>
                            </div>

                            <div className="text-sm">
                              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Prescribed Medicines:</p>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {rx.medicines.map((med: any, idx: number) => (
                                  <div key={idx} className="bg-background p-2 rounded border border-border/50 text-xs">
                                    <span className="font-medium">{med.name}</span> - {med.dosage}
                                    <div className="text-muted-foreground">{med.frequency} x {med.duration}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border m-1">
            <div className="text-center">
              <User size={48} className="mx-auto mb-3 text-muted-foreground/30" />
              <p>Select a patient to view records</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="text-primary" size={24} />
              AI Health Analysis
            </DialogTitle>
            <DialogDescription>
              Analysis based on {selectedReportIds.size > 0 ? `${selectedReportIds.size} selected` : 'all available'} reports.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">Analyzing medical data...</p>
                <p className="text-xs text-muted-foreground">Using GenAI & Groq Inference</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="bg-muted/30 p-6 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap">
                  {aiAnalysis || "No analysis available. Please try again."}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsAnalysisOpen(false)}>Close Analysis</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
