import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Fallback values for development/testing only - NEVER use real credentials here
const FALLBACK_URL = 'https://placeholder-for-testing-only.supabase.co';
const FALLBACK_KEY = 'placeholder-key-for-testing-only';

// Safely access environment variables with fallbacks
function safeGetEnv(key: string, fallback: string): string {
  try {
    const value = import.meta.env[key];
    if (!value && import.meta.env.PROD) {
      console.warn(`Missing ${key} in production environment. Application may not function correctly.`);
    }
    return value || fallback;
  } catch (error) {
    console.error(`Error accessing environment variable ${key}:`, error);
    return fallback;
  }
}

// Get environment variables with fallbacks for resilience
const supabaseUrl = safeGetEnv('VITE_SUPABASE_URL', FALLBACK_URL);
const supabaseAnonKey = safeGetEnv('VITE_SUPABASE_ANON_KEY', FALLBACK_KEY);

// Create Supabase client with error handling
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

try {
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a dummy client that won't crash the app but will log errors
  if (import.meta.env.DEV) {
    console.warn('Using mock Supabase client in development mode. Data operations will fail.');
  }
}

// Export the supabase instance with fallback error handling
export const supabase = supabaseInstance || {
  // This is a minimal mock to prevent crashes when Supabase fails to initialize
  auth: {
    getUser: () => Promise.resolve({ data: null, error: new Error('Supabase client failed to initialize') }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase client failed to initialize') }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: new Error('Supabase client failed to initialize') })
  }),
  // Add other frequently used methods with mock implementations
};

// Helper function to check if we're in a production environment
export const isProduction = (): boolean => {
  try {
    return import.meta.env.PROD === true;
  } catch {
    return false; // Default to non-production if we can't determine
  }
};

// Helper for handling Supabase errors
export const handleSupabaseError = (error: unknown): string => {
  console.error('Supabase error:', error);
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as Error).message;
  }
  return 'An unknown error occurred';
};
