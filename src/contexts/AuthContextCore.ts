import { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { AuthContextType } from '../types/auth.types';

// Create a properly typed Supabase client
export const typedSupabase = supabase as ReturnType<typeof createClient>;

// Create the context
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Custom hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
