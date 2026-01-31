import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface QuickVitalsLogProps {
  onCriticalAlert: () => void;
}

export function QuickVitalsLog({ onCriticalAlert }: QuickVitalsLogProps) {
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [bloodSugar, setBloodSugar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);

    // Check for critical values
    if (systolicNum > 160 || diastolicNum > 100) {
      setIsSubmitting(false);
      onCriticalAlert();
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Vitals logged successfully!', {
        description: `BP: ${systolic}/${diastolic} mmHg${bloodSugar ? `, Sugar: ${bloodSugar} mg/dL` : ''}`,
      });
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Activity size={20} className="text-primary" />
        <h3 className="font-display font-semibold text-lg">Quick Vitals Log</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Blood Pressure Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="systolic" className="text-sm font-medium text-muted-foreground">
              Systolic (mmHg)
            </Label>
            <Input
              id="systolic"
              type="number"
              placeholder="120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="h-11"
              min={60}
              max={250}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diastolic" className="text-sm font-medium text-muted-foreground">
              Diastolic (mmHg)
            </Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="h-11"
              min={40}
              max={150}
            />
          </div>
        </div>

        {/* Blood Sugar */}
        <div className="space-y-2">
          <Label htmlFor="bloodSugar" className="text-sm font-medium text-muted-foreground">
            Blood Sugar (mg/dL)
          </Label>
          <Input
            id="bloodSugar"
            type="number"
            placeholder="Enter blood sugar level"
            value={bloodSugar}
            onChange={(e) => setBloodSugar(e.target.value)}
            className="h-11"
            min={20}
            max={600}
          />
        </div>

        {/* Warning Message */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            If your BP is above 160/100, we'll connect you with a doctor immediately.
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-11 btn-hero"
          disabled={isSubmitting || !systolic || !diastolic}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Log Vitals'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
