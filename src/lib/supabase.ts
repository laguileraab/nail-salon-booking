import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Environment variables are automatically loaded from .env.local in development
// and from Vercel's environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper function to check if we're in a production environment
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true;
};

// Helper for handling Supabase errors
export const handleSupabaseError = (error: unknown): string => {
  console.error('Supabase error:', error);
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as Error).message;
  }
  return 'An unexpected error occurred';
};
