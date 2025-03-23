import { createContext } from 'react';
import { LanguageContextType } from '../../types/language.types';

// Export the context object in its own file
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
