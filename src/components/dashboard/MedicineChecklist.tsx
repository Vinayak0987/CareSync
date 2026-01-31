import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Medicine {
  id: string;
  nameKey: string;
  dosage: string;
  time: string;
  completed: boolean;
}

export function MedicineChecklist() {
  const { t } = useLanguage();
  
  const initialMedicines: Medicine[] = [
    { id: '1', nameKey: 'morningDose', dosage: 'Amlodipine 5mg', time: '8:00 AM', completed: true },
    { id: '2', nameKey: 'afternoonDose', dosage: 'Metformin 500mg', time: '2:00 PM', completed: false },
    { id: '3', nameKey: 'eveningDose', dosage: 'Aspirin 75mg', time: '8:00 PM', completed: false },
  ];
  
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);

  const toggleMedicine = (id: string) => {
    setMedicines(prev =>
      prev.map(med =>
        med.id === id ? { ...med, completed: !med.completed } : med
      )
    );
  };

  const completedCount = medicines.filter(m => m.completed).length;
  const totalCount = medicines.length;
  const progressPercent = (completedCount / totalCount) * 100;

  // Helper function to get medicine name translation
  const getMedicineName = (nameKey: string) => {
    const key = nameKey as 'morningDose' | 'afternoonDose' | 'eveningDose';
    return t(key);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm"
    >
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill size={20} className="text-primary" />
          <h3 className="font-display font-semibold text-lg">{t('todaysMedicines')}</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} {t('done')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Medicine List */}
      <div className="space-y-3">
        {medicines.map((medicine, index) => (
          <motion.div
            key={medicine.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => toggleMedicine(medicine.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
              medicine.completed 
                ? "bg-primary/5 border border-primary/20" 
                : "bg-muted/50 hover:bg-muted"
            )}
          >
            {/* Checkbox */}
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                medicine.completed
                  ? "bg-primary text-white"
                  : "border-2 border-muted-foreground/30"
              )}
            >
              {medicine.completed && <Check size={14} strokeWidth={3} />}
            </div>

            {/* Medicine Info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-sm flex items-center gap-2",
                medicine.completed && "text-primary"
              )}>
                {getMedicineName(medicine.nameKey)}
                {medicine.completed && <Check size={14} className="text-primary" />}
              </p>
              <p className="text-xs text-muted-foreground">
                {medicine.dosage} • {medicine.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
