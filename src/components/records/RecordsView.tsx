import { motion } from 'framer-motion';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordsViewProps {
  onNavigate: (tab: string) => void;
}

export function RecordsView({ onNavigate }: RecordsViewProps) {
  const records = [
    {
      id: 1,
      title: 'Blood Test Results',
      date: '2024-01-25',
      doctor: 'Dr. Sarah Johnson',
      type: 'Lab Report',
    },
    {
      id: 2,
      title: 'X-Ray Chest',
      date: '2024-01-20',
      doctor: 'Dr. Michael Chen',
      type: 'Imaging',
    },
    {
      id: 3,
      title: 'Annual Checkup',
      date: '2024-01-15',
      doctor: 'Dr. Sarah Johnson',
      type: 'General',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Medical Records</h1>
        <p className="text-muted-foreground">View and download your medical documents</p>
      </motion.div>

      {/* Records List */}
      <div className="grid gap-4">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-lg mb-1">{record.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {record.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {record.doctor}
                    </span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {record.type}
                    </span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="flex-shrink-0">
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {records.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No records yet</h3>
          <p className="text-muted-foreground">Your medical records will appear here</p>
        </div>
      )}
    </div>
  );
}
