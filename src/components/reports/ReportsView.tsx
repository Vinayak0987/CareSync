<<<<<<< HEAD
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Heart, Droplet } from 'lucide-react';

export function ReportsView() {
  const stats = [
    {
      title: 'Average BP',
      value: '120/80',
      trend: '+2%',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Blood Sugar',
      value: '95 mg/dL',
      trend: '-5%',
      icon: Droplet,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Heart Rate',
      value: '72 bpm',
      trend: 'Stable',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];
=======
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Droplets,
  Wind,
  Calendar,
  Download,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

type ChartType = 'blood_pressure' | 'blood_sugar' | 'glucose' | 'heart_rate';

const chartTabs: { id: ChartType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'blood_pressure', label: 'Blood Pressure', icon: Activity, color: '#f43f5e' },
 { id: 'blood_sugar', label: 'Blood Sugar', icon: Droplets, color: '#f59e0b' },
  { id: 'glucose', label: 'Glucose', icon: Droplets, color: '#a855f7' },
  { id: 'heart_rate', label: 'Heart Rate', icon: Heart, color: '#10b981' },
];

export function ReportsView() {
  const [activeChart, setActiveChart] = useState<ChartType>('blood_pressure');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [vitals, setVitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      const response = await api.get('/vitals');
      setVitals(response.data);
    } catch (error) {
      console.error('Failed to fetch vitals', error);
      toast.error('Failed to load health data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter vitals by time range
  const getFilteredVitals = () => {
    const now = new Date();
    const daysToShow = timeRange === 'week' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - daysToShow * 24 * 60 * 60 * 1000);

    return vitals
      .filter((v: any) => new Date(v.createdAt) >= cutoffDate)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getChartData = () => {
    const filtered = getFilteredVitals();
    
    if (activeChart === 'blood_pressure') {
      return filtered
        .filter((v: any) => v.type === 'blood_pressure')
        .map((v: any) => {
          const [systolic, diastolic] = v.value.split('/').map(Number);
          return {
            date: new Date(v.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            systolic,
            diastolic,
          };
        });
    } else {
      return filtered
        .filter((v: any) => v.type === activeChart)
        .map((v: any) => ({
          date: new Date(v.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          value: parseFloat(v.value),
        }));
    }
  };

  const getLatestComparison = () => {
    const filtered = getFilteredVitals();
    
    const getBP = (vitals: any[]) => {
      const bp = vitals.find(v => v.type === 'blood_pressure');
      return bp ? parseInt(bp.value.split('/')[0]) : 0;
    };

    const getValue = (vitals: any[], type: string) => {
      const vital = vitals.find(v => v.type === type);
      return vital ? parseFloat(vital.value) : 0;
    };

    const latest = filtered.slice(-1)[0];
    const previous = filtered.slice(-2)[0];

    if (!latest || !previous) return { bp: 0, sugar: 0, hr: 0 };

    return {
      bp: getBP([latest]) - getBP([previous]),
      sugar: getValue([latest], 'blood_sugar') - getValue([previous], 'blood_sugar'),
      hr: getValue([latest], 'heart_rate') - getValue([previous], 'heart_rate'),
    };
  };

  const comparison = getLatestComparison();
  const chartData = getChartData();
  const activeTab = chartTabs.find(t => t.id === activeChart) || chartTabs[0];

  // Count appointments this month
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments');
        const now = new Date();
        const thisMonth = response.data.filter((apt: any) => {
          const aptDate = new Date(apt.date);
          return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
        });
        setAppointmentsCount(thisMonth.length);
      } catch (error) {
        console.error('Failed to fetch appointments', error);
      }
    };
    fetchAppointments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
>>>>>>> 078c66ed15c89c967b0b6deb11805a353b4c24b5

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Health Reports</h1>
        <p className="text-muted-foreground">Track your health trends and insights</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-5 border border-border shadow-sm"
            >
<<<<<<< HEAD
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <span className="text-xs px-2 py-1 bg-muted rounded-full">{stat.trend}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Placeholder */}
=======
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                timeRange === 'month' ? "bg-card shadow-sm" : "text-muted-foreground"
              )}
            >
              Month
            </button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info('Export feature coming soon!')}
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Vitals */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium">Total Vitals</span>
          </div>
          <p className="text-2xl font-display font-bold text-primary">{vitals.length}</p>
          <p className="text-xs text-muted-foreground">Recorded</p>
        </div>

        {/* BP Change */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Activity size={16} className="text-rose-600" />
            </div>
            <span className="text-sm font-medium">BP Change</span>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-display font-bold">
              {comparison.bp > 0 ? '+' : ''}{comparison.bp}
            </p>
            {comparison.bp > 0 ? (
              <TrendingUp size={18} className="text-amber-500" />
            ) : comparison.bp < 0 ? (
              <TrendingDown size={18} className="text-emerald-500" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">vs previous</p>
        </div>

        {/* Sugar Change */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Droplets size={16} className="text-amber-600" />
            </div>
            <span className="text-sm font-medium">Sugar Change</span>
          </div>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-display font-bold">
              {comparison.sugar > 0 ? '+' : ''}{comparison.sugar}
            </p>
            {comparison.sugar > 0 ? (
              <TrendingUp size={18} className="text-amber-500" />
            ) : comparison.sugar < 0 ? (
              <TrendingDown size={18} className="text-emerald-500" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">mg/dL</p>
        </div>

        {/* Checkups */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Calendar size={16} className="text-sky-600" />
            </div>
            <span className="text-sm font-medium">Checkups</span>
          </div>
          <p className="text-2xl font-display font-bold">{appointmentsCount}</p>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
      </motion.div>

      {/* Chart Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {/* Tab Header */}
        <div className="flex overflow-x-auto border-b border-border">
          {chartTabs
            .filter(tab => {
              // Only show charts that have data
              const hasData = vitals.some((v: any) => v.type === tab.id);
              return hasData;
            })
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px",
                  activeChart === tab.id 
                    ? "border-primary text-primary bg-primary/5" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
        </div>

        {/* Chart Content */}
        <div className="p-6">
          <h3 className="font-display font-semibold text-lg mb-4">
            {activeTab.label} - Last {timeRange === 'week' ? '7' : '30'} Days
          </h3>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No data available for this period</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'blood_pressure' ? (
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[60, 180]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
                      name="Systolic"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="Diastolic"
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <defs>
                      <linearGradient id={`gradient-${activeTab.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeTab.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={activeTab.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={activeTab.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${activeTab.id})`}
                      name={activeTab.label}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      {/* Health Summary */}
>>>>>>> 078c66ed15c89c967b0b6deb11805a353b4c24b5
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-6 border border-border shadow-sm"
      >
<<<<<<< HEAD
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Vitals Trends</h2>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>
        
        {/* Chart Placeholder */}
        <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Charts coming soon</p>
          </div>
        </div>
=======
        <h3 className="font-display font-semibold text-lg mb-3">📊 Health Summary</h3>
        {vitals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Start logging your vitals to see personalized health insights here!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {vitals.length} health metrics recorded
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Regular monitoring active
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {appointmentsCount} consultation{appointmentsCount !== 1 ? 's' : ''} this month
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Keep tracking for better insights
              </p>
            </div>
          </div>
        )}
>>>>>>> 078c66ed15c89c967b0b6deb11805a353b4c24b5
      </motion.div>
    </div>
  );
}
