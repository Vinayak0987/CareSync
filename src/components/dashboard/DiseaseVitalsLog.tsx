import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, Heart, Droplet, HelpCircle, TrendingUp, Weight, Cigarette, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';
import api from '@/lib/api';

interface DiseaseVitalsLogProps {
  onCriticalAlert: () => void;
  onLogSuccess?: () => void;
}

export function DiseaseVitalsLog({ onCriticalAlert, onLogSuccess }: DiseaseVitalsLogProps) {
  const [chronicDisease, setChronicDisease] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  // Diabetes fields
  const [glucose, setGlucose] = useState('');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [bmi, setBmi] = useState('');

  // Heart Disease fields
  const [cholesterol, setCholesterol] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');

  // Hypertension fields
  const [avgGlucose, setAvgGlucose] = useState('');
  const [smokingStatus, setSmokingStatus] = useState('never');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.chronicDiseases && user.chronicDiseases.length > 0) {
      setChronicDisease(user.chronicDiseases[0]);
    }
  }, []);

  // Risk Score Calculations
  const calculateDiabetesRisk = () => {
    const glucoseVal = parseFloat(glucose);
    const bmiVal = parseFloat(bmi);
    const sysVal = parseInt(systolic);
    
    let risk = 0;
    
    // Glucose risk (0-40 points)
    if (glucoseVal < 70) risk += 10;
    else if (glucoseVal >= 70 && glucoseVal <= 100) risk += 0;
    else if (glucoseVal > 100 && glucoseVal <= 125) risk += 15;
    else if (glucoseVal > 125 && glucoseVal <= 180) risk += 25;
    else if (glucoseVal > 180) risk += 40;

    // BMI risk (0-30 points)
    if (bmiVal < 18.5) risk += 5;
    else if (bmiVal >= 18.5 && bmiVal < 25) risk += 0;
    else if (bmiVal >= 25 && bmiVal < 30) risk += 10;
    else if (bmiVal >= 30) risk += 30;

    // BP risk (0-30 points)
    if (sysVal <= 120) risk += 0;
    else if (sysVal > 120 && sysVal <= 140) risk += 15;
    else if (sysVal > 140) risk += 30;

    return risk;
  };

  const calculateHeartDiseaseRisk = () => {
    const cholVal = parseFloat(cholesterol);
    const hrVal = parseInt(heartRate);
    const sysVal = parseInt(systolic);
    const bsVal = parseFloat(bloodSugar);

    let risk = 0;

    // Cholesterol risk (0-30 points)
    if (cholVal < 200) risk += 0;
    else if (cholVal >= 200 && cholVal < 240) risk += 15;
    else if (cholVal >= 240) risk += 30;

    // BP risk (0-25 points)
    if (sysVal <= 120) risk += 0;
    else if (sysVal > 120 && sysVal <= 140) risk += 12;
    else if (sysVal > 140) risk += 25;

    // Heart rate risk (0-25 points)
    if (hrVal < 60) risk += 10;
    else if (hrVal >= 60 && hrVal <= 100) risk += 0;
    else if (hrVal > 100) risk += 25;

    // Blood sugar risk (0-20 points)
    if (bsVal > 100 && bsVal <= 125) risk += 10;
    else if (bsVal > 125) risk += 20;

    return risk;
  };

  const calculateHypertensionRisk = () => {
    const avgGlucVal = parseFloat(avgGlucose);
    const bmiVal = parseFloat(bmi);
    const sysVal = parseInt(systolic);

    let risk = 0;

    // BP risk (0-40 points)
    if (sysVal <= 120) risk += 0;
    else if (sysVal > 120 && sysVal <= 140) risk += 20;
    else if (sysVal > 140 && sysVal <= 160) risk += 30;
    else if (sysVal > 160) risk += 40;

    // BMI risk (0-30 points)
    if (bmiVal < 25) risk += 0;
    else if (bmiVal >= 25 && bmiVal < 30) risk += 15;
    else if (bmiVal >= 30) risk += 30;

    // Smoking risk (0-20 points)
    if (smokingStatus === 'never') risk += 0;
    else if (smokingStatus === 'former') risk += 10;
    else if (smokingStatus === 'current') risk += 20;

    // Glucose risk (0-10 points)
    if (avgGlucVal > 100) risk += 10;

    return risk;
  };

  const getRiskLevel = (score: number) => {
    if (score < 20) return { level: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50', emoji: '✅' };
    if (score < 40) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', emoji: '⚠️' };
    if (score < 60) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50', emoji: '🔶' };
    return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-50', emoji: '🚨' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let calculatedRisk = 0;

      if (chronicDisease === 'diabetes') {
        calculatedRisk = calculateDiabetesRisk();
        // Save vitals
        await api.post('/vitals', { type: 'glucose', value: glucose, unit: 'mg/dL', status: parseFloat(glucose) > 125 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'blood_pressure', value: `${systolic}/${diastolic}`, unit: 'mmHg', status: parseInt(systolic) > 140 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'bmi', value: bmi, unit: 'kg/m²', status: parseFloat(bmi) > 25 ? 'High' : 'Normal' });
      } else if (chronicDisease === 'heart_diseases') {
        calculatedRisk = calculateHeartDiseaseRisk();
        await api.post('/vitals', { type: 'blood_pressure', value: `${systolic}/${diastolic}`, unit: 'mmHg', status: parseInt(systolic) > 140 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'cholesterol', value: cholesterol, unit: 'mg/dL', status: parseFloat(cholesterol) > 200 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'blood_sugar', value: bloodSugar, unit: 'mg/dL', status: parseFloat(bloodSugar) > 100 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'heart_rate', value: heartRate, unit: 'bpm', status: parseInt(heartRate) > 100 ? 'High' : 'Normal' });
      } else if (chronicDisease === 'hypertension') {
        calculatedRisk = calculateHypertensionRisk();
        await api.post('/vitals', { type: 'blood_pressure', value: `${systolic}/${diastolic}`, unit: 'mmHg', status: parseInt(systolic) > 140 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'avg_glucose', value: avgGlucose, unit: 'mg/dL', status: parseFloat(avgGlucose) > 100 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'bmi', value: bmi, unit: 'kg/m²', status: parseFloat(bmi) > 25 ? 'High' : 'Normal' });
        await api.post('/vitals', { type: 'smoking_status', value: smokingStatus, unit: '', status: smokingStatus === 'current' ? 'High' : 'Normal' });
      }

      setRiskScore(calculatedRisk);
      toast.success('Daily vitals saved successfully! 🎉');
      if (onLogSuccess) onLogSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!chronicDisease || chronicDisease === 'none' || chronicDisease === 'other') {
    return null; // Don't show this component for these conditions
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Daily Vitals Tracker</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {chronicDisease?.replace('_', ' ')} Monitoring
            </p>
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
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100"
          >
            <h4 className="font-medium text-sm text-blue-800 mb-2">📖 Daily Monitoring</h4>
            <p className="text-xs text-blue-700">
              Track your key health metrics daily to monitor your condition and get a personalized risk score!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Diabetes Fields */}
        {chronicDisease === 'diabetes' && (
          <>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <Droplet size={16} className="text-purple-500" />
                <span className="font-medium text-sm">Glucose Level</span>
              </div>
              <Input
                type="number"
                placeholder="Enter glucose (mg/dL)"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="h-11"
                required
                min={20}
                max={600}
              />
            </div>

            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={16} className="text-rose-500" fill="currentColor" />
                <span className="font-medium text-sm">Blood Pressure</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="h-11 text-center"
                  required
                />
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="h-11 text-center"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Weight size={16} className="text-blue-500" />
                <span className="font-medium text-sm">BMI</span>
              </div>
              <Input
                type="number"
                step="0.1"
                placeholder="Enter BMI"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="h-11"
                required
              />
            </div>
          </>
        )}

        {/* Heart Disease Fields */}
        {chronicDisease === 'heart_diseases' && (
          <>
            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={16} className="text-rose-500" fill="currentColor" />
                <span className="font-medium text-sm">Blood Pressure</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="h-11 text-center"
                  required
                />
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="h-11 text-center"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-amber-500" />
                <span className="font-medium text-sm">Cholesterol</span>
              </div>
              <Input
                type="number"
                placeholder="Enter cholesterol (mg/dL)"
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Droplet size={16} className="text-blue-500" />
                <span className="font-medium text-sm">Blood Sugar</span>
              </div>
              <Input
                type="number"
                placeholder="Enter blood sugar (mg/dL)"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={16} className="text-red-500" />
                <span className="font-medium text-sm">Heart Rate</span>
              </div>
              <Input
                type="number"
                placeholder="Enter heart rate (bpm)"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="h-11"
                required
              />
            </div>
          </>
        )}

        {/* Hypertension Fields */}
        {chronicDisease === 'hypertension' && (
          <>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <Droplet size={16} className="text-purple-500" />
                <span className="font-medium text-sm">Average Glucose Level</span>
              </div>
              <Input
                type="number"
                placeholder="Enter avg glucose (mg/dL)"
                value={avgGlucose}
                onChange={(e) => setAvgGlucose(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 mb-3">
                <Heart size={16} className="text-rose-500" fill="currentColor" />
                <span className="font-medium text-sm">Blood Pressure</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="h-11 text-center"
                  required
                />
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="h-11 text-center"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Weight size={16} className="text-blue-500" />
                <span className="font-medium text-sm">BMI</span>
              </div>
              <Input
                type="number"
                step="0.1"
                placeholder="Enter BMI"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Cigarette size={16} className="text-gray-500" />
                <span className="font-medium text-sm">Smoking Status</span>
              </div>
              <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never Smoked</SelectItem>
                  <SelectItem value="former">Former Smoker</SelectItem>
                  <SelectItem value="current">Current Smoker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Risk Score Display */}
        {riskScore !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border ${getRiskLevel(riskScore).bg} border-current`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Your Risk Score</span>
              <div className="flex items-center gap-2">
                <Gauge size={16} />
                <span className="text-2xl font-bold">{riskScore}/100</span>
              </div>
            </div>
            <div className={`text-center py-2 rounded-lg ${getRiskLevel(riskScore).color} font-semibold`}>
              {getRiskLevel(riskScore).emoji} {getRiskLevel(riskScore).level} Risk
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 btn-hero text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Activity size={18} className="mr-2" />
              Save & Calculate Risk
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          💡 Update daily for accurate risk assessment
        </p>
      </form>
    </motion.div>
  );
}
