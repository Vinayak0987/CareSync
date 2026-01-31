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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-6 border border-border shadow-sm"
      >
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
      </motion.div>
    </div>
  );
}
