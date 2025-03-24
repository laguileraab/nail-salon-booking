import { Session, User, AuthError } from '@supabase/supabase-js';
import { Database } from './database.types';

// Export the types so they can be imported where needed
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: AuthError | Error | null }>;
  authError: string | null;
  loading: boolean;
}
