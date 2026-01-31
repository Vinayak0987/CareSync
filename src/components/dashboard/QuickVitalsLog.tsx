import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Heart, Droplet, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n'; // Updated import
import api from '@/lib/api'; // Ensure api is imported

interface QuickVitalsLogProps {
  onCriticalAlert: () => void;
  onLogSuccess?: () => void;
  conditions?: string[];
  recommendedVitals?: string[];
}

export function QuickVitalsLog({ onCriticalAlert, onLogSuccess, conditions = [], recommendedVitals }: QuickVitalsLogProps) {
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [bloodSugar, setBloodSugar] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [oxygenLevel, setOxygenLevel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useLanguage();

  // Determine visibility
  // If recommendedVitals provided (from smart analysis), use that.
  // Else fallback to conditions-based logic.

  const hasCondition = (keyword: string) => conditions.some(c => c.toLowerCase().includes(keyword));

  const showBP = recommendedVitals ? recommendedVitals.includes('blood_pressure') : (hasCondition('hypertension') || hasCondition('blood pressure') || conditions.length === 0);
  const showSugar = recommendedVitals ? recommendedVitals.includes('blood_sugar') : (hasCondition('diabetes') || hasCondition('sugar'));
  const showHeart = recommendedVitals ? recommendedVitals.includes('heart_rate') : (hasCondition('heart') || hasCondition('cardiac'));
  const showOxygen = recommendedVitals ? recommendedVitals.includes('oxygen') : (hasCondition('asthma') || hasCondition('respiratory') || hasCondition('lung') || hasCondition('oxygen'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);

    // Check for critical values
    if (showBP && (systolicNum > 160 || diastolicNum > 100)) {
      setIsSubmitting(false);
      onCriticalAlert();
      return;
    }

    try {
      const promises = [];

      // 1. Save Blood Pressure
      if (showBP) {
        const bpValue = `${systolic}/${diastolic}`;
        let bpStatus = 'Normal';
        if (systolicNum > 140 || diastolicNum > 90) bpStatus = 'High';
        if (systolicNum < 90 || diastolicNum < 60) bpStatus = 'Low';

        promises.push(api.post('/vitals', {
          type: 'blood_pressure',
          value: bpValue,
          unit: 'mmHg',
          status: bpStatus
        }));
      }

      // 2. Save Blood Sugar if provided and relevant
      if (showSugar && bloodSugar) {
        let sugarStatus = 'Normal';
        const sugarNum = parseInt(bloodSugar);
        if (sugarNum < 70) sugarStatus = 'Low';
        if (sugarNum > 140) sugarStatus = 'High'; // simplistic logic

        promises.push(api.post('/vitals', {
          type: 'blood_sugar',
          value: bloodSugar,
          unit: 'mg/dL',
          status: sugarStatus
        }));
      }

      // 3. Save Heart Rate if provided and relevant
      if (showHeart && heartRate) {
        let hrStatus = 'Normal';
        const hrNum = parseInt(heartRate);
        if (hrNum < 60) hrStatus = 'Low';
        if (hrNum > 100) hrStatus = 'High';

        promises.push(api.post('/vitals', {
          type: 'heart_rate',
          value: heartRate,
          unit: 'bpm',
          status: hrStatus
        }));
      }

      // 4. Save Oxygen Level if provided and relevant
      if (showOxygen && oxygenLevel) {
        let oxStatus = 'Normal';
        const oxNum = parseInt(oxygenLevel);
        if (oxNum < 95) oxStatus = 'Low'; // Standard warn level
        if (oxNum < 90) oxStatus = 'Critical';

        promises.push(api.post('/vitals', {
          type: 'oxygen',
          value: oxygenLevel,
          unit: '%',
          status: oxStatus
        }));
      }

      await Promise.all(promises);

      // Build vitals data for analysis
      const vitalsForAnalysis = [];
      if (showBP) {
        vitalsForAnalysis.push({
          type: 'Blood Pressure',
          value: `${systolic}/${diastolic}`,
          unit: 'mmHg'
        });
      }
      if (showSugar && bloodSugar) {
        vitalsForAnalysis.push({
          type: 'Blood Sugar',
          value: bloodSugar,
          unit: 'mg/dL'
        });
      }
      if (showHeart && heartRate) {
        vitalsForAnalysis.push({
          type: 'Heart Rate',
          value: heartRate,
          unit: 'bpm'
        });
      }
      if (showOxygen && oxygenLevel) {
        vitalsForAnalysis.push({
          type: 'Oxygen Level',
          value: oxygenLevel,
          unit: '%'
        });
      }

      // Call AI analysis
      try {
        const analysisResponse = await api.post('/vitals/analyze', {
          vitals: vitalsForAnalysis
        });
        setAnalysisResult(analysisResponse.data);
        toast.success('Analysis complete! 🤖');
      } catch (analysisError) {
        console.error('Analysis failed:', analysisError);
        toast.warning('Vitals saved, but analysis unavailable');
      }

      if (onLogSuccess) onLogSuccess();

      // Reset optional fields
      setBloodSugar('');
      setHeartRate('');
      setOxygenLevel('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* 
     REMOVED: Client-side BP Status Calculation 
     User wants analysis ONLY after clicking Save via Gemini.
  */
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // If no vitals to show, display a message
  if (!showBP && !showSugar && !showHeart && !showOxygen) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border shadow-sm text-center">
        <h3 className="font-display font-semibold text-lg mb-2">Health Log</h3>
        <p className="text-sm text-muted-foreground">No specific vitals monitoring required for your profile.</p>
      </div>
    );
  }

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
            {showBP && <p><strong>Blood Pressure (BP):</strong> Use a BP monitor on your arm. Sit quietly for 5 minutes before checking.</p>}
            {showSugar && <p><strong>Blood Sugar:</strong> Use a glucometer. Best to check before breakfast (fasting) or 2 hours after eating.</p>}
            {showHeart && <p><strong>Heart Rate:</strong> Count your pulse for 60 seconds.</p>}
            {showOxygen && <p><strong>Oxygen:</strong> Use a pulse oximeter on your finger.</p>}
          </div>
        </motion.div>
      )}

      {/* Result Display Section (Post-Save) */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-xl border ${analysisResult.status === 'Critical' ? 'bg-red-50 border-red-200' :
            analysisResult.status === 'Warning' ? 'bg-amber-50 border-amber-200' :
              'bg-emerald-50 border-emerald-200'
            }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1.5 rounded-full ${analysisResult.status === 'Critical' ? 'bg-red-100 text-red-600' :
              analysisResult.status === 'Warning' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
              {analysisResult.status === 'Critical' ? <AlertTriangle size={18} /> : <Activity size={18} />}
            </div>
            <div className="space-y-2">
              <h4 className={`font-semibold ${analysisResult.status === 'Critical' ? 'text-red-800' :
                analysisResult.status === 'Warning' ? 'text-amber-800' :
                  'text-emerald-800'
                }`}>
                Doctor's Feedback: {analysisResult.status}
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {analysisResult.feedback}
              </p>
              {analysisResult.action_items && (
                <ul className="text-xs list-disc list-inside mt-2 space-y-1 opacity-90">
                  {analysisResult.action_items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              <Button variant="ghost" size="sm" onClick={() => setAnalysisResult(null)} className="h-6 px-0 text-muted-foreground hover:text-foreground">
                Dismiss
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Blood Pressure Section */}
        {showBP && (
          <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-rose-500" fill="currentColor" />
              <span className="font-medium text-sm">Blood Pressure (BP)</span>
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
          </div>
        )}

        {/* Other Vitals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Blood Sugar */}
          {showSugar && (
            <div className="border border-border rounded-xl p-4 hover:border-amber-200 transition-colors bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <span className="text-lg">🩸</span>
                </div>
                <label className="font-medium text-foreground">Blood Sugar</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border-transparent rounded-lg focus:bg-background focus:border-amber-500 focus:ring-0 transition-all font-display font-semibold text-lg"
                  placeholder="e.g. 100"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">mg/dL</span>
              </div>
            </div>
          )}

          {/* Heart Rate */}
          {showHeart && (
            <div className="border border-border rounded-xl p-4 hover:border-emerald-200 transition-colors bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <label className="font-medium text-foreground">Heart Rate</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border-transparent rounded-lg focus:bg-background focus:border-emerald-500 focus:ring-0 transition-all font-display font-semibold text-lg"
                  placeholder="e.g. 72"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">BPM</span>
              </div>
            </div>
          )}

          {/* Oxygen */}
          {showOxygen && (
            <div className="border border-border rounded-xl p-4 hover:border-sky-200 transition-colors bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                  <span className="text-lg">🫁</span>
                </div>
                <label className="font-medium text-foreground">Oxygen</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={oxygenLevel}
                  onChange={(e) => setOxygenLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/30 border-transparent rounded-lg focus:bg-background focus:border-sky-500 focus:ring-0 transition-all font-display font-semibold text-lg"
                  placeholder="e.g. 98"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 btn-hero text-base"
          disabled={isSubmitting || (showBP && (!systolic || !diastolic))}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Activity size={18} className="mr-2" />
              Save & Analyze Vitals
            </>
          )}
        </Button>

        {/* Helpful Note */}
        <p className="text-center text-xs text-muted-foreground">
          💡 AI analysis provided after saving
        </p>
      </form>
    </motion.div >
  );
}
