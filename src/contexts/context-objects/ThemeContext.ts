import { createContext } from 'react';
import { ThemeContextType } from '../../types/theme.types';

// Export the context object in its own file
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
