import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  Plus,
  File,
  Image as ImageIcon,
  Activity,
  X,
  Upload,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Report {
  _id: string;
  title: string;
  type: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  date: string; // ISO string
  doctorId?: {
    name: string;
    specialty: string;
  };
  createdAt: string;
}

const REPORT_TYPES = ['All', 'Blood', 'ECG', 'CT-Scan', 'X-Ray', 'MRI', 'Prescription', 'Lab', 'Other'];

export function ReportsView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('General');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        fetchReports(userData._id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const fetchReports = async (patientId: string) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/reports/patient/${patientId}`);
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !user) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('report', uploadFile);
      formData.append('patientId', user._id);
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('type', uploadType);
      formData.append('description', uploadDesc);

      // If user is a doctor, they are the uploader. If patient, doctorId stays null or we handle it in backend.
      if (user.role === 'doctor') {
        formData.append('doctorId', user._id);
      }

      const res = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setReports(prev => [res.data, ...prev]);
      toast.success('Report uploaded successfully');

      // Reset form
      setUploadFile(null);
      setUploadTitle('');
      setUploadType('General');
      setUploadDesc('');
      setShowUploadModal(false);

    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report deleted');
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to delete report');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.split('.')[0]);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blood': return <Activity className="text-rose-500" />;
      case 'ecg': return <Activity className="text-rose-500" />; // Heart icon maybe?
      case 'ct-scan':
      case 'x-ray':
      case 'mri': return <ImageIcon className="text-blue-500" />;
      case 'prescription': return <FileText className="text-amber-500" />;
      default: return <File className="text-gray-500" />;
    }
  };

  const openReport = async (filename: string) => {
    try {
      // Use axios to fetch with auth headers
      const response = await api.get(`/reports/file/${filename}`, {
        responseType: 'blob'
      });

      // Create object URL from blob
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');

      // Cleanup after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Error opening report:', error);
      toast.error('Failed to open report. You may not have permission.');
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Medical Reports Repository</h1>
          <p className="text-muted-foreground">Securely store and access all your medical documents</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="btn-hero shadow-lg shadow-primary/20">
          <Plus size={18} className="mr-2" />
          Upload Report
        </Button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports by name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {REPORT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                  selectedType === type
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Reports Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border mt-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No reports found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {searchQuery || selectedType !== 'All'
                ? "Try adjusting your search or filters"
                : "Upload your first medical report to get started"}
            </p>
            {(searchQuery || selectedType !== 'All') && (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedType('All'); }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-card hover:bg-muted/30 border border-border rounded-xl p-4 transition-all hover:shadow-md relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {getIconForType(report.type)}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openReport(report.fileUrl)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-medium truncate pr-2 mb-1" title={report.title}>{report.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {report.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(parseInt(report.fileUrl) ? "0 KB" : "File")} {/* Placeholder size */}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    {report.doctorId && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User size={12} />
                        <span>Dr. {report.doctorId.name}</span>
                      </div>
                    )}
                  </div>

                  {report.description && (
                    <div className="mt-2 text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                      {report.description}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openReport(report.fileUrl)}
                  >
                    View Report
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
            >
              <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold font-display">Upload New Report</h2>
                  <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-muted rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">

                  {/* File Input */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                      uploadFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    {uploadFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="text-primary w-6 h-6" />
                        </div>
                        <p className="font-medium text-foreground">{uploadFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}>
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="font-medium text-foreground">Click to upload report</p>
                        <p className="text-xs">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    )}
                  </div>

                  {/* Details Form */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Report Title</label>
                      <Input
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. Annual Blood Test"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Type</label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value)}
                        >
                          {REPORT_TYPES.filter(t => t !== 'All').map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      {/* More fields can go here */}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Description / Notes</label>
                      <textarea
                        className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm resize-none"
                        placeholder="Add any additional notes..."
                        value={uploadDesc}
                        onChange={(e) => setUploadDesc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
                  <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                  <Button onClick={handleUpload} disabled={!uploadFile || isUploading}>
                    {isUploading ? "Uploading..." : "Save Report"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

