import { createContext } from 'react';
import { AuthContextType } from '../../types/auth.types';

// Export the context object in its own file
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
