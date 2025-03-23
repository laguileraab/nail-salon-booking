import { useState, useEffect, useCallback, ReactNode, createContext, useContext } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, AuthContextType } from '../types/auth.types';

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

type AuthProviderProps = {
  children: ReactNode;
};

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Memoize fetchProfile function to avoid recreating it on each render
  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      } else if (data) {
        setProfile(data);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error: unknown) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleError = (error: unknown): void => {
    console.error('Authentication error:', error);
    setError(error instanceof Error ? error.message : 'An unknown error occurred');
    setLoading(false);
  };

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error('Unknown error during sign in') };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ error: AuthError | Error | null }> => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role: 'client' // Default role
          }
        ]);

        if (profileError) throw profileError;
      }

      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error('Unknown error during sign up') };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error('Unknown error during password reset') };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userData.user.id);

      if (error) throw error;

      // Update local profile state
      if (profile) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      return { error: error instanceof Error ? error : new Error('Unknown error updating profile') };
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    error,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
