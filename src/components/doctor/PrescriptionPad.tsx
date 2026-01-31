import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  commonMedicines, 
  dosageOptions, 
  frequencyOptions, 
  durationOptions 
} from '@/lib/mockData';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionPadProps {
  patientName: string;
  onIssuePrescription: (prescription: {
    diagnosis: string;
    medicines: Medicine[];
    advice: string;
  }) => void;
}

export function PrescriptionPad({ patientName, onIssuePrescription }: PrescriptionPadProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [advice, setAdvice] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '' }
    ]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = () => {
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis');
      return;
    }

    const validMedicines = medicines.filter(m => m.name.trim());
    if (validMedicines.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    onIssuePrescription({
      diagnosis,
      medicines: validMedicines,
      advice
    });

    toast.success('Prescription issued successfully!', {
      description: `Prescription sent to ${patientName}`
    });

    // Reset form
    setDiagnosis('');
    setMedicines([{ id: '1', name: '', dosage: '', frequency: '', duration: '' }]);
    setAdvice('');
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved', {
      description: 'You can continue editing later'
    });
  };

  const filteredSuggestions = (query: string) => 
    commonMedicines.filter(m => 
      m.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <FileText size={18} className="text-primary" />
        <h3 className="font-display font-semibold">Prescription Pad</h3>
      </div>

      {/* Diagnosis */}
      <div className="space-y-2">
        <Label htmlFor="diagnosis" className="text-sm font-medium">
          Diagnosis <span className="text-red-500">*</span>
        </Label>
        <Input
          id="diagnosis"
          placeholder="Enter diagnosis..."
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="bg-muted/50"
        />
      </div>

      {/* Medicines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Medicines</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addMedicine}
            className="text-primary hover:text-primary/80 h-7"
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>

        {medicines.map((medicine, index) => (
          <motion.div
            key={medicine.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-muted/30 rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground font-medium">#{index + 1}</span>
              {medicines.length > 1 && (
                <button
                  onClick={() => removeMedicine(medicine.id)}
                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Drug Name with autocomplete */}
            <div className="relative">
              <Input
                placeholder="Drug name"
                value={medicine.name}
                onChange={(e) => {
                  updateMedicine(medicine.id, 'name', e.target.value);
                  setShowSuggestions(medicine.id);
                }}
                onFocus={() => setShowSuggestions(medicine.id)}
                onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                className="text-sm h-9"
              />
              {showSuggestions === medicine.id && medicine.name && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg">
                  {filteredSuggestions(medicine.name).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        updateMedicine(medicine.id, 'name', suggestion);
                        setShowSuggestions(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dosage, Frequency, Duration */}
            <div className="grid grid-cols-3 gap-2">
              <select
                value={medicine.dosage}
                onChange={(e) => updateMedicine(medicine.id, 'dosage', e.target.value)}
                className="text-xs h-8 px-2 rounded-md border border-border bg-background"
              >
                <option value="">Dosage</option>
                {dosageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <select
                value={medicine.frequency}
                onChange={(e) => updateMedicine(medicine.id, 'frequency', e.target.value)}
                className="text-xs h-8 px-2 rounded-md border border-border bg-background"
              >
                <option value="">Frequency</option>
                {frequencyOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <select
                value={medicine.duration}
                onChange={(e) => updateMedicine(medicine.id, 'duration', e.target.value)}
                className="text-xs h-8 px-2 rounded-md border border-border bg-background"
              >
                <option value="">Duration</option>
                {durationOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advice */}
      <div className="space-y-2">
        <Label htmlFor="advice" className="text-sm font-medium">
          Advice / Notes
        </Label>
        <textarea
          id="advice"
          placeholder="Additional instructions for the patient..."
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-md border border-border bg-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          className="flex-1"
        >
          <Save size={14} className="mr-1" />
          Save Draft
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          className="flex-1 btn-hero"
        >
          <Send size={14} className="mr-1" />
          Issue Rx
        </Button>
      </div>
    </div>
  );
}
