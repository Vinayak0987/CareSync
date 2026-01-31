import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, dynamicTranslations, Language, TranslationKey, DynamicTranslationKey } from './translations';

// Re-export types for use in other components
export type { Language, TranslationKey, DynamicTranslationKey };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  // Dynamic translation for database content like specialties, status, etc.
  td: (key: string, fallback?: string) => string;
  // Format with variables: t('hello', { name: 'John' }) => "Hello John"
  tf: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Custom hook to use language context - defined before provider to avoid HMR issues
const useLanguageInternal = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider component
const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get initial language from localStorage or default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved && ['en', 'hi', 'mr', 'ta', 'te', 'bn'].includes(saved)) {
        return saved as Language;
      }
    } catch (error) {
      console.error('Error reading language from localStorage:', error);
    }
    return 'en';
  });

  // Static translation function with memoization
  const t = useCallback((key: TranslationKey): string => {
    try {
      return translations[language]?.[key] || translations.en?.[key] || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  }, [language]);

  // Dynamic translation function for database content
  // This handles things like doctor specialties, status values, etc.
  const td = useCallback((key: string, fallback?: string): string => {
    try {
      // Normalize the key to lowercase for matching
      const normalizedKey = key.toLowerCase().trim() as DynamicTranslationKey;
      
      // First try exact match in dynamic translations
      const dynamicTrans = dynamicTranslations[language];
      if (dynamicTrans && normalizedKey in dynamicTrans) {
        return dynamicTrans[normalizedKey] || key;
      }
      
      // Fallback to English dynamic translations
      const englishDynamic = dynamicTranslations.en;
      if (englishDynamic && normalizedKey in englishDynamic) {
        // If we're in English, return the English version
        if (language === 'en') {
          return englishDynamic[normalizedKey] || key;
        }
        // Otherwise, try to find in target language again or return original
        return dynamicTrans?.[normalizedKey] || fallback || key;
      }
      
      // Return fallback or original key
      return fallback || key;
    } catch (error) {
      console.error('Dynamic translation error:', error);
      return fallback || key;
    }
  }, [language]);

  // Translation with variable replacement
  const tf = useCallback((key: TranslationKey, vars?: Record<string, string | number>): string => {
    let text = t(key);
    if (vars) {
      Object.entries(vars).forEach(([varKey, value]) => {
        text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), String(value));
      });
    }
    return text;
  }, [t]);

  // Update language and save to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      // Dispatch a custom event so components can react to language change
      window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }, []);

  // Set initial HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const contextValue = React.useMemo(
    () => ({ language, setLanguage, t, td, tf }),
    [language, setLanguage, t, td, tf]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export hook with the expected name
const useLanguage = useLanguageInternal;

export { LanguageProvider, useLanguage };
