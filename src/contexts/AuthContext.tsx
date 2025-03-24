import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Profile } from '../types/auth.types';
import { AuthContext, typedSupabase } from './AuthContextCore';

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
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Memoize fetchProfile function to avoid recreating it on each render
  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await typedSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Check if the error is "No rows found"
        if (error.message && error.message.includes('No rows found')) {
          console.log('No profile found, creating default profile');
          
          // Get user email from auth
          const { data: userData } = await typedSupabase.auth.getUser();
          const userEmail = userData?.user?.email || '';
          
          // Create a default profile for the user
          const { data: newProfile, error: insertError } = await typedSupabase
            .from('profiles')
            .insert([
              {
                id: userId,
                email: userEmail,
                first_name: 'User',
                last_name: 'Name',
                role: 'client' // Default role
              }
            ])
            .select()
            .single();
            
          if (insertError) {
            throw insertError;
          }
          
          if (newProfile) {
            // Type assertion to ensure correct profile type
            setProfile(newProfile as unknown as Profile);
            setIsAdmin(newProfile.role === 'admin');
            setIsLoading(false);
            return;
          }
        } else {
          throw error;
        }
      } else if (data) {
        // Type assertion to ensure correct profile type
        setProfile(data as unknown as Profile);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error: unknown) {
      handleError(error);
      // Important: Still set isLoading to false even if there's an error
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleError = (error: unknown): void => {
    console.error('Authentication error:', error);
    setAuthError(error instanceof Error ? error.message : 'An unknown error occurred');
  };

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      const { data: { session } } = await typedSupabase.auth.getSession();
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
    const { data: { subscription } } = typedSupabase.auth.onAuthStateChange(
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
    setLoading(true);
    try {
      const { error } = await typedSupabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setLoading(false);
      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      setLoading(false);
      return { error: error instanceof Error ? error : new Error('Unknown error during sign in') };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ error: AuthError | Error | null }> => {
    setLoading(true);
    try {
      // Create auth user
      const { data, error } = await typedSupabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await typedSupabase.from('profiles').insert([
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

      setLoading(false);
      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      setLoading(false);
      return { error: error instanceof Error ? error : new Error('Unknown error during sign up') };
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await typedSupabase.auth.signOut();
      setLoading(false);
    } catch (error: unknown) {
      handleError(error);
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | Error | null }> => {
    setLoading(true);
    try {
      const { error } = await typedSupabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setLoading(false);
      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      setLoading(false);
      return { error: error instanceof Error ? error : new Error('Unknown error during password reset') };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: AuthError | Error | null }> => {
    setLoading(true);
    try {
      const { data: userData } = await typedSupabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await typedSupabase
        .from('profiles')
        .update(updates)
        .eq('id', userData.user.id);

      if (error) throw error;

      // Update local profile state
      if (profile) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      setLoading(false);
      return { error: null };
    } catch (error: unknown) {
      handleError(error);
      setLoading(false);
      return { error: error instanceof Error ? error : new Error('Unknown error updating profile') };
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    loading: loading, // Ensure the loading property is properly passed to the context value object
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    authError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
