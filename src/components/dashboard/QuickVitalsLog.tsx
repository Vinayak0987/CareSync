import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Heart, Droplet, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface QuickVitalsLogProps {
  onCriticalAlert: () => void;
}

export function QuickVitalsLog({ onCriticalAlert }: QuickVitalsLogProps) {
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [bloodSugar, setBloodSugar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useLanguage();

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
      toast.success(t('success') + ' ✅', {
        description: `${t('bloodPressure')}: ${systolic}/${diastolic}${bloodSugar ? ` | ${t('bloodSugar')}: ${bloodSugar}` : ''}`,
      });
    }, 1000);
  };

  // Determine BP status
  const getBPStatus = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    if (!sys || !dia) return null;
    
    if (sys < 90 || dia < 60) return { text: 'Low - Please consult doctor', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (sys <= 120 && dia <= 80) return { text: 'Normal - Great! 👍', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (sys <= 140 && dia <= 90) return { text: 'Slightly High - Monitor regularly', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (sys <= 160 && dia <= 100) return { text: 'High - See a doctor soon', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'Very High - Get help now! 🚨', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const bpStatus = getBPStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm"
    >
      {/* Header with Help */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">{t('checkYourVitals')}</h3>
            <p className="text-xs text-muted-foreground">{t('enterHealthNumbers')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {/* Help Section */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100"
        >
          <h4 className="font-medium text-sm text-blue-800 mb-2">📖 How to measure?</h4>
          <div className="space-y-2 text-xs text-blue-700">
            <p><strong>{t('bloodPressure')}:</strong> Use a BP monitor on your arm. Sit quietly for 5 minutes before checking.</p>
            <p><strong>{t('bloodSugar')}:</strong> Use a glucometer. Best to check before breakfast (fasting) or 2 hours after eating.</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Blood Pressure Section */}
        <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-rose-500" fill="currentColor" />
            <span className="font-medium text-sm">{t('bloodPressure')} (BP)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="systolic" className="text-xs text-muted-foreground flex items-center gap-1">
                Upper Number
                <span className="text-[10px] text-rose-400">(Systolic)</span>
              </Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="h-11 text-center text-lg font-medium"
                min={60}
                max={250}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diastolic" className="text-xs text-muted-foreground flex items-center gap-1">
                Lower Number
                <span className="text-[10px] text-rose-400">(Diastolic)</span>
              </Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="h-11 text-center text-lg font-medium"
                min={40}
                max={150}
              />
            </div>
          </div>

          {/* BP Status Indicator */}
          {bpStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 p-2 rounded-lg ${bpStatus.bg} text-center`}
            >
              <span className={`text-xs font-medium ${bpStatus.color}`}>
                {bpStatus.text}
              </span>
            </motion.div>
          )}
        </div>

        {/* Blood Sugar Section */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Droplet size={16} className="text-blue-500" />
            <span className="font-medium text-sm">{t('bloodSugar')}</span>
            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">Optional</span>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="bloodSugar" className="text-xs text-muted-foreground">
              Your sugar reading (mg/dL)
            </Label>
            <Input
              id="bloodSugar"
              type="number"
              placeholder="Example: 100 (before food) or 140 (after food)"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
              className="h-11"
              min={20}
              max={600}
            />
          </div>

          {bloodSugar && (
            <div className="mt-2 text-xs text-muted-foreground">
              {parseInt(bloodSugar) < 70 && '⚠️ Low sugar - eat something sweet'}
              {parseInt(bloodSugar) >= 70 && parseInt(bloodSugar) <= 100 && '✅ Normal fasting level'}
              {parseInt(bloodSugar) > 100 && parseInt(bloodSugar) <= 140 && '📊 Normal after meal'}
              {parseInt(bloodSugar) > 140 && parseInt(bloodSugar) <= 200 && '⚡ High - monitor closely'}
              {parseInt(bloodSugar) > 200 && '🚨 Very high - consult doctor'}
            </div>
          )}
        </div>

        {/* Important Warning */}
        {/* <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">
              ⚠️ High BP Alert
            </p>
            <p className="text-xs text-amber-700">
              If your BP is above <strong>160/100</strong>, we will immediately connect you with a doctor for urgent care!
            </p>
          </div>
        </div> */}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 btn-hero text-base"
          disabled={isSubmitting || !systolic || !diastolic}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Activity size={18} className="mr-2" />
              {t('save')}
            </>
          )}
        </Button>

        {/* Helpful Note */}
        <p className="text-center text-xs text-muted-foreground">
          💡 Check your vitals regularly to stay healthy
        </p>
      </form>
    </motion.div>
  );
}
