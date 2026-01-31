import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Heart, Droplets, Activity, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vital } from '@/lib/mockData';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { TranslationKey } from '@/lib/i18n';

interface VitalsCardProps {
  vital: Vital;
  index: number;
}

const vitalIcons = {
  blood_pressure: Activity,
  blood_sugar: Droplets,
  heart_rate: Heart,
  oxygen: Wind,
  temperature: Activity,
};

// Map vital types to translation keys
const vitalLabelKeys: Record<string, TranslationKey> = {
  blood_pressure: 'bloodPressure',
  blood_sugar: 'bloodSugar',
  heart_rate: 'heartRate',
  oxygen: 'oxygenLevel',
  temperature: 'temperature',
};

const statusColors = {
  normal: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-alert/10 text-alert border-alert/20',
};

export function VitalsCard({ vital, index }: VitalsCardProps) {
  const { t, td } = useLanguage();
  const Icon = vitalIcons[vital.type as keyof typeof vitalIcons] || Activity;
  const TrendIcon = vital.trend === 'up' ? TrendingUp : vital.trend === 'down' ? TrendingDown : Minus;

  // Get the translation key or fallback to a dynamic translation of the type
  const labelKey = vitalLabelKeys[vital.type];
  const label = labelKey ? t(labelKey) : td(vital.type.replace('_', ' '));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="vitals-card group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "p-2.5 rounded-xl border",
          statusColors[vital.status]
        )}>
          <Icon size={20} className={vital.type === 'heart_rate' ? 'animate-heartbeat' : ''} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
          vital.trend === 'up' && "bg-success/10 text-success",
          vital.trend === 'down' && "bg-primary/10 text-primary",
          vital.trend === 'stable' && "bg-muted text-muted-foreground"
        )}>
          <TrendIcon size={12} />
          <span className="capitalize">{td(vital.trend)}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-display font-bold">{vital.value}</span>
          <span className="text-sm text-muted-foreground">{vital.unit}</span>
        </div>
        <p className="text-xs text-muted-foreground">{vital.timestamp}</p>
      </div>
    </motion.div>
  );
}
