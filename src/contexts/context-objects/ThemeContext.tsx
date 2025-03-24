import { createContext } from 'react';
import { ThemeContextType } from '../../types/theme.types';

// Create the context object separate from the provider
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);
