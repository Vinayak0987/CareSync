import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const medicines = [
  { id: 'morning', label: 'Morning Dose', time: '8:00 AM', medicines: 'Amlodipine 5mg' },
  { id: 'afternoon', label: 'Afternoon Dose', time: '2:00 PM', medicines: 'Metformin 500mg' },
  { id: 'evening', label: 'Evening Dose', time: '8:00 PM', medicines: 'Aspirin 75mg' },
];

export function MedicineChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    morning: true,
    afternoon: false,
    evening: false,
  });

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progress = (completedCount / medicines.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="vitals-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Pill size={18} className="text-primary" />
          </div>
          <h3 className="font-display font-semibold">Today's Medicines</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {completedCount}/{medicines.length} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      <div className="space-y-3">
        {medicines.map((med) => (
          <label
            key={med.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
              checked[med.id] 
                ? "bg-success/5 border-success/30" 
                : "bg-background border-border hover:border-primary/30"
            )}
          >
            <Checkbox
              checked={checked[med.id]}
              onCheckedChange={(c) => setChecked(prev => ({ ...prev, [med.id]: !!c }))}
              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium text-sm",
                  checked[med.id] && "line-through text-muted-foreground"
                )}>
                  {med.label}
                </span>
                {checked[med.id] && (
                  <Check size={14} className="text-success" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{med.medicines} • {med.time}</p>
            </div>
          </label>
        ))}
      </div>
    </motion.div>
  );
}
