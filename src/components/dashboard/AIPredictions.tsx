import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Lightbulb, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AIPredictionsProps {
  recentVitals: any[];
  chronicDisease?: string;
}

export function AIPredictions({ recentVitals, chronicDisease }: AIPredictionsProps) {
  const [predictions, setPredictions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);

  const fetchPredictions = async () => {
    if (recentVitals.length === 0) {
      toast.info('Please log some vitals first to get AI predictions!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/vitals/predict', {
        chronicDisease,
        recentVitals: recentVitals.slice(0, 5) // Send last 5 vitals
      });

      if (response.data.success) {
        setPredictions(response.data.predictions);
        setShowPredictions(true);
      } else {
        toast.error(response.data.message || 'Could not generate predictions');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to get AI predictions');
    } finally {
      setIsLoading(false);
    }
  };

  if (!predictions && !showPredictions) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Brain size={20} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">AI Health Predictions</h4>
              <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={fetchPredictions}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                Get Predictions
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {showPredictions && predictions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Brain size={18} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-sm">AI Predictions (Next 24-48h)</h4>
            </div>
            <button
              onClick={() => setShowPredictions(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Hide
            </button>
          </div>

          {/* Risk Level Badge */}
          {predictions.riskLevel && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3 ${
              predictions.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
              predictions.riskLevel === 'moderate' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {predictions.riskLevel.toUpperCase()} RISK
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {/* High Risk Vitals */}
            {predictions.highRisk && predictions.highRisk.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-red-600" />
                  <span className="text-xs font-semibold text-red-700">May Go HIGH</span>
                </div>
                <div className="space-y-1">
                  {predictions.highRisk.map((vital: string, idx: number) => (
                    <p key={idx} className="text-xs text-red-600 capitalize">• {vital.replace('_', ' ')}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Low Risk Vitals */}
            {predictions.lowRisk && predictions.lowRisk.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={16} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">May Go LOW</span>
                </div>
                <div className="space-y-1">
                  {predictions.lowRisk.map((vital: string, idx: number) => (
                    <p key={idx} className="text-xs text-blue-600 capitalize">• {vital.replace('_', ' ')}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {predictions.recommendations && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">AI Recommendations</p>
                  <p className="text-xs text-amber-600">{predictions.recommendations}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={fetchPredictions}
            disabled={isLoading}
            className="mt-3 w-full text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            {isLoading ? 'Updating...' : '🔄 Refresh Predictions'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
