import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface VitalsFormData {
  systolic: string;
  diastolic: string;
  sugar: string;
}

interface QuickVitalsLogProps {
  onCriticalAlert?: () => void;
}

export function QuickVitalsLog({ onCriticalAlert }: QuickVitalsLogProps) {
  const [vitals, setVitals] = useState<VitalsFormData>({
    systolic: '',
    diastolic: '',
    sugar: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const systolicNum = parseInt(vitals.systolic);
    const diastolicNum = parseInt(vitals.diastolic);
    const sugarNum = parseInt(vitals.sugar);

    // Check for critical values
    if (systolicNum > 180 || diastolicNum > 120 || sugarNum > 300) {
      onCriticalAlert?.();
      return;
    }

    toast.success('Vitals logged successfully!', {
      description: `BP: ${vitals.systolic}/${vitals.diastolic} mmHg, Sugar: ${vitals.sugar} mg/dL`,
    });

    setVitals({ systolic: '', diastolic: '', sugar: '' });
  };

  const isHighBP = parseInt(vitals.systolic) > 140 || parseInt(vitals.diastolic) > 90;
  const isHighSugar = parseInt(vitals.sugar) > 180;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="vitals-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity size={18} className="text-primary" />
        </div>
        <h3 className="font-display font-semibold">Quick Vitals Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="systolic" className="text-xs">Systolic (mmHg)</Label>
            <Input
              id="systolic"
              type="number"
              placeholder="120"
              value={vitals.systolic}
              onChange={(e) => setVitals(v => ({ ...v, systolic: e.target.value }))}
              className={isHighBP ? 'border-warning focus-visible:ring-warning' : ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diastolic" className="text-xs">Diastolic (mmHg)</Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              value={vitals.diastolic}
              onChange={(e) => setVitals(v => ({ ...v, diastolic: e.target.value }))}
              className={isHighBP ? 'border-warning focus-visible:ring-warning' : ''}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sugar" className="text-xs">Blood Sugar (mg/dL)</Label>
          <Input
            id="sugar"
            type="number"
            placeholder="100"
            value={vitals.sugar}
            onChange={(e) => setVitals(v => ({ ...v, sugar: e.target.value }))}
            className={isHighSugar ? 'border-warning focus-visible:ring-warning' : ''}
          />
        </div>

        {(isHighBP || isHighSugar) && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 text-warning text-xs">
            <AlertTriangle size={14} />
            <span>Values are higher than normal range</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={!vitals.systolic || !vitals.diastolic || !vitals.sugar}>
          <Save size={16} className="mr-2" />
          Log Vitals
        </Button>
      </form>
    </motion.div>
  );
}
