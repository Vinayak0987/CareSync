import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api'; // Assuming you have an api wrapper, otherwise axios

interface SmartHealthSetupProps {
    onComplete: (data: any) => void;
    onSkip: () => void;
}

export function SmartHealthSetup({ onComplete, onSkip }: SmartHealthSetupProps) {
    const [step, setStep] = useState<'disease-select' | 'upload' | 'results'>('disease-select');
    const [diseaseType, setDiseaseType] = useState<string>('General');
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const diseases = [
        { id: 'General', label: 'General / Non-Chronic', icon: Activity, desc: 'General health tracking' },
        { id: 'Diabetes', label: 'Diabetes', icon: Activity, desc: 'Track sugar & insulin' },
        { id: 'Heart Disease', label: 'Heart Disease', icon: Activity, desc: 'Track BP & Heart Rate' },
        { id: 'Hypertension', label: 'Hypertension', icon: Activity, desc: 'Track Blood Pressure' },
        { id: 'COPD', label: 'COPD / Respiratory', icon: Activity, desc: 'Track Oxygen & Breathing' }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('diseaseType', diseaseType); // Pass context FIRST for Multer
        formData.append('report', file);

        try {
            // Direct fetch if api wrapper doesn't support formData easily, 
            // but assuming standard usage. Use absolute URL if needed or proxy.
            // e.g. http://localhost:5000/api/upload-report
            const response = await fetch('http://localhost:5000/api/upload-report', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setAnalysisResult(data);
            setStep('results');
            toast.success('Report analyzed successfully!');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to analyze report.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = async () => {
        if (analysisResult) {
            try {
                // Persist configuration to backend
                await api.put('/auth/profile/health', {
                    chronicDisease: diseaseType,
                    monitoringConfig: analysisResult.recommended_vitals || [],
                    healthProfile: analysisResult.profile || {}
                });

                toast.success('Health profile updated!');
                onComplete(analysisResult);
            } catch (error) {
                console.error('Failed to save profile', error);
                toast.error('Failed to save health profile');
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-2xl mx-auto rounded-xl border border-border shadow-lg overflow-hidden"
        >
            <div className="p-6 border-b border-border bg-muted/30">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <Activity className="text-primary" />
                    Smart Health Setup
                </h2>
                <p className="text-muted-foreground mt-1">
                    {step === 'disease-select' && "First, tell us about your primary health focus."}
                    {step === 'upload' && "Upload your medical report to personalize your dashboard."}
                    {step === 'results' && "Review your health profile and risk assessment."}
                </p>
            </div>

            <div className="p-6 space-y-6">

                {/* Step 1: Disease Selection */}
                {step === 'disease-select' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {diseases.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setDiseaseType(d.id)}
                                    className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${diseaseType === d.id
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`mt-0.5 p-2 rounded-full ${diseaseType === d.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                        <d.icon size={16} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{d.label}</div>
                                        <div className="text-xs text-muted-foreground">{d.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStep('upload')}>
                                Next: Upload Report <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Upload */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/50 transition-colors">
                            <input
                                type="file"
                                id="report-upload"
                                className="hidden"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="report-upload" className="cursor-pointer block">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {file ? <FileText className="text-primary" size={32} /> : <Upload className="text-primary" size={32} />}
                                </div>
                                {file ? (
                                    <div>
                                        <p className="font-medium text-lg">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">Is this the correct file?</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-medium text-lg">Click to Upload Report</p>
                                        <p className="text-sm text-muted-foreground">PDF files supported</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setStep('disease-select')}>Back</Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isAnalyzing}
                                className="min-w-[120px]"
                            >
                                {isAnalyzing ? (
                                    <>Analyzing...</>
                                ) : (
                                    <>Analyze Report <ArrowRight size={16} className="ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 'results' && analysisResult && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-emerald-800">Analysis Complete</h3>
                                <p className="text-sm text-emerald-700">
                                    Based on your <strong>{diseaseType}</strong> profile, we've extracted the following:
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Identified Risks */}
                            <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-amber-500" />
                                    Identified Risks
                                </h4>
                                {analysisResult.risks && Object.keys(analysisResult.risks).length > 0 ? (
                                    <ul className="space-y-2">
                                        {Object.entries(analysisResult.risks).map(([disease, risk]: [string, any]) => {
                                            const score = analysisResult.risk_scores && analysisResult.risk_scores[disease]
                                                ? (analysisResult.risk_scores[disease] * 100).toFixed(1)
                                                : null;

                                            return (
                                                <li key={disease} className="mb-3 last:mb-0">
                                                    <div className="flex justify-between items-center text-sm mb-1">
                                                        <span className="capitalize font-medium">{disease.replace('_', ' ')}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${String(risk).includes('High') || Number(score) > 70 ? 'bg-red-100 text-red-700' :
                                                            String(risk).includes('Moderate') || Number(score) > 30 ? 'bg-amber-100 text-amber-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {String(risk)}
                                                        </span>
                                                    </div>
                                                    {score && (
                                                        <div className="w-full space-y-1">
                                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                                <span>Severity</span>
                                                                <span>{score}%</span>
                                                            </div>
                                                            <div className="w-full bg-secondary rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-500 ${Number(score) > 70 ? 'bg-red-500' :
                                                                            Number(score) > 40 ? 'bg-amber-500' :
                                                                                'bg-emerald-500'
                                                                        }`}
                                                                    style={{ width: `${score}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No significant risks detected.</p>
                                )}
                            </div>

                            {/* Recommended Vitals */}
                            <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Activity size={16} className="text-blue-500" />
                                    Recommended Daily Tracking
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.recommended_vitals && analysisResult.recommended_vitals.length > 0 ? (
                                        analysisResult.recommended_vitals.map((vital: string) => (
                                            <span
                                                key={vital}
                                                className="px-3 py-1 bg-white border border-border rounded-full text-sm capitalize shadow-sm"
                                            >
                                                {vital.replace('_', ' ')}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Standard vitals only</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
                            <Button onClick={handleConfirm} className="w-full sm:w-auto">
                                Confirm & Update Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
