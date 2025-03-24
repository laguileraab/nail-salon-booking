import { useState, useEffect, ReactNode, useContext } from 'react';
import { translations, Language } from '../types/language.types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { LanguageContext } from './context-objects/LanguageContext';

// Export the type so it can be imported by the context object
export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: typeof translations;
}

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
  const { user, profile } = useAuth();
  const [language, setLanguage] = useState<Language>(() => {
    // First check if user has a saved preference in their profile
    if (profile?.language_preference && (profile.language_preference === 'en' || profile.language_preference === 'de' || profile.language_preference === 'es')) {
      return profile.language_preference as Language;
    }
    
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

  // Save language to Supabase when it changes and user is logged in
  useEffect(() => {
    const saveLanguageToProfile = async () => {
      if (user && profile) {
        try {
          // Cast to proper type to fix TypeScript error
          const typedClient = supabase as SupabaseClient<Database>;
          
          const { error } = await typedClient
            .from('profiles')
            .update({ language_preference: language })
            .eq('id', user.id);
            
          if (error) {
            console.error('Error saving language preference:', error);
          }
        } catch (err) {
          console.error('Failed to save language preference:', err);
        }
      }
    };
    
    saveLanguageToProfile();
  }, [language, user, profile]);

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
