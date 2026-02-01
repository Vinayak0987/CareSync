import { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function DoctorCallHistory() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/appointments/my-appointments');
                // Filter for completed items. Sort by recent date.
                const completed = res.data
                    .filter((apt: any) => apt.status === 'completed')
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setHistory(completed);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(call =>
        (call.patientId?.name || call.patientName || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold font-display">Previous Consultations</h2>
                    <p className="text-muted-foreground">History of completed calls and appointments</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search patient..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Clock className="mx-auto mb-3 text-muted-foreground/30" size={48} />
                    <p className="text-muted-foreground">No completed consultations found.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredHistory.map(call => (
                        <div key={call._id} className="bg-card p-4 rounded-xl border border-border hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                    {(call.patientId?.name || call.patientName || 'P').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">{call.patientId?.name || call.patientName}</p>
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(call.date).toDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {call.time}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
                                    <CheckCircle size={14} /> Completed
                                </span>
                                {/* Future: Add 'View Notes' button here */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
