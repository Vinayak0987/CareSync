import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronUp } from 'lucide-react';
import { useLanguage, Language } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

// Map of "Select Language" in different languages for a nice touch
const selectLanguageText: Record<Language, string> = {
  en: 'Select Language',
  hi: 'भाषा चुनें',
  mr: 'भाषा निवडा',
  ta: 'மொழியை தேர்ந்தெடுக்கவும்',
  te: 'భాషను ఎంచుకోండి',
  bn: 'ভাষা নির্বাচন করুন',
};

export function FloatingLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <div 
      ref={dropdownRef}
      className="fixed top-6 right-6 z-50"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
          >
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
                {selectLanguageText[language]}
              </p>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                    language === lang.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span>{lang.nativeName}</span>
                  {language === lang.code && (
                    <Check size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg border transition-all",
          "bg-card hover:bg-muted border-border",
          isOpen && "ring-2 ring-primary/20"
        )}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={20} className="text-primary" />
        <span className="font-medium text-sm">{currentLanguage?.nativeName}</span>
        <ChevronUp 
          size={16} 
          className={cn(
            "text-muted-foreground transition-transform",
            !isOpen && "rotate-180"
          )} 
        />
      </motion.button>
    </div>
  );
}
