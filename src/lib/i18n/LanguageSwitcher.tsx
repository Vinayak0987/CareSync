import { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './LanguageContext';
import { Language } from './translations';
import { cn } from '@/lib/utils';

const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
};

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function LanguageSwitcher({ variant = 'default', className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)}>
        <button
          type="button"
          onClick={toggleDropdown}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
          aria-label="Change language"
          aria-expanded={isOpen}
        >
          <Globe size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium hidden sm:inline">{languageNames[language]}</span>
          <ChevronDown size={14} className={cn("transition-transform hidden sm:inline", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-card rounded-xl border border-border shadow-xl overflow-hidden z-50"
              >
                <div className="py-1">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between",
                        language === lang && "bg-primary/5 text-primary font-medium"
                      )}
                    >
                      <span>{languageNames[lang]}</span>
                      {language === lang && <Check size={16} className="flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border hover:border-primary/50 transition-all"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={18} className="text-primary flex-shrink-0" />
        <span className="font-medium text-sm">{languageNames[language]}</span>
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-card rounded-xl border border-border shadow-xl overflow-hidden z-50"
            >
              <div className="py-1">
                {(Object.keys(languageNames) as Language[]).map((lang) => (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between",
                      language === lang && "bg-primary/5 text-primary font-medium"
                    )}
                  >
                    <span>{languageNames[lang]}</span>
                    {language === lang && <Check size={16} className="flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
