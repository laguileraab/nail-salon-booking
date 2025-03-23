import { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { translations, Language } from '../types/language.types';

// Define the context type here instead of importing it
export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: typeof translations;
}

// Create the context
export const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

// Custom hook for accessing language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

type LanguageProviderProps = {
  children: ReactNode;
};

// Provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de' || savedLanguage === 'es')) {
      return savedLanguage as Language;
    }
    
    // Try to get user's browser language
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'de' || browserLang === 'es') {
      return browserLang as Language;
    }
    
    // Default to English
    return 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
    // Set HTML lang attribute
    document.documentElement.lang = language;
  }, [language]);

  // Create a wrapper function to ensure type safety
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
