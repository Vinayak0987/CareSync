import { useState } from 'react';
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
  Pill
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
  BarChart,
  Bar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { vitalsHistory, medicationAdherence, currentVitals } from '@/lib/mockData';

type ChartType = 'bloodPressure' | 'bloodSugar' | 'heartRate' | 'oxygen';

const chartTabs: { id: ChartType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'bloodPressure', label: 'Blood Pressure', icon: Activity, color: '#f43f5e' },
  { id: 'bloodSugar', label: 'Blood Sugar', icon: Droplets, color: '#f59e0b' },
  { id: 'heartRate', label: 'Heart Rate', icon: Heart, color: '#10b981' },
  { id: 'oxygen', label: 'SpO2', icon: Wind, color: '#0ea5e9' },
];

export function ReportsView() {
  const [activeChart, setActiveChart] = useState<ChartType>('bloodPressure');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const getChartData = () => {
    switch (activeChart) {
      case 'bloodPressure':
        return vitalsHistory.map(v => ({
          date: v.date,
          systolic: v.systolic,
          diastolic: v.diastolic,
        }));
      case 'bloodSugar':
        return vitalsHistory.map(v => ({
          date: v.date,
          value: v.bloodSugar,
        }));
      case 'heartRate':
        return vitalsHistory.map(v => ({
          date: v.date,
          value: v.heartRate,
        }));
      case 'oxygen':
        return vitalsHistory.map(v => ({
          date: v.date,
          value: v.oxygen,
        }));
      default:
        return [];
    }
  };

  const getAdherencePercent = () => {
    const total = medicationAdherence.reduce((acc, curr) => acc + curr.total, 0);
    const taken = medicationAdherence.reduce((acc, curr) => acc + curr.taken, 0);
    return Math.round((taken / total) * 100);
  };

  const getLatestComparison = () => {
    const latest = vitalsHistory[vitalsHistory.length - 1];
    const previous = vitalsHistory[vitalsHistory.length - 2];
    
    return {
      bp: latest.systolic - previous.systolic,
      sugar: latest.bloodSugar - previous.bloodSugar,
      hr: latest.heartRate - previous.heartRate,
    };
  };

  const comparison = getLatestComparison();
  const chartData = getChartData();
  const activeTab = chartTabs.find(t => t.id === activeChart)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Health Reports</h1>
          <p className="text-muted-foreground">Track your health trends over time</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              onClick={() => setTimeRange('week')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                timeRange === 'week' ? "bg-card shadow-sm" : "text-muted-foreground"
              )}
            >
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
          <Button variant="outline" size="sm">
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
        {/* Medication Adherence */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pill size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium">Adherence</span>
          </div>
          <p className="text-2xl font-display font-bold text-primary">{getAdherencePercent()}%</p>
          <p className="text-xs text-muted-foreground">This week</p>
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
          <p className="text-xs text-muted-foreground">vs yesterday</p>
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
          <p className="text-2xl font-display font-bold">7</p>
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
          {chartTabs.map((tab) => (
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
            {activeTab.label} - Last 7 Days
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'bloodPressure' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[60, 150]} />
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
        </div>
      </motion.div>

      {/* Medication Adherence Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Medication Adherence</h3>
          <span className="text-sm text-muted-foreground">Daily doses taken</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={medicationAdherence} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 3]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number, name: string) => [value, name === 'taken' ? 'Doses Taken' : name]}
              />
              <Bar 
                dataKey="taken" 
                fill="hsl(168 84% 32%)" 
                radius={[4, 4, 0, 0]}
                name="Doses Taken"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-3">📊 Weekly Health Summary</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Blood pressure is within normal range
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Heart rate stable at 72 bpm average
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Missed 2 medication doses this week
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Oxygen levels consistently above 97%
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
