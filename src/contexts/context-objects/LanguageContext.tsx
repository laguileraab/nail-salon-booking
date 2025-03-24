import { createContext } from 'react';
import { Language, translations } from '../../types/language.types';

// Use a consistent type definition
export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: typeof translations;
}

// Create the context object separate from the provider
export const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);
