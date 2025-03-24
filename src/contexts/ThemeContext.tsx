import { useState, useEffect, ReactNode, useContext } from 'react';
import { Theme } from '../types/theme.types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ThemeContext } from './context-objects/ThemeContext';

// Custom hook for accessing theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

type ThemeProviderProps = {
  children: ReactNode;
};

// Provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => {
    // First check if user has a saved preference in their profile
    if (profile?.theme_preference && (profile.theme_preference === 'light' || profile.theme_preference === 'dark')) {
      return profile.theme_preference as Theme;
    }
    
    // Then check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check for user's system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  });

  // Save theme to Supabase when it changes and user is logged in
  useEffect(() => {
    const saveThemeToProfile = async () => {
      if (user && profile) {
        try {
          // Cast to proper type to fix TypeScript error
          const typedClient = supabase as SupabaseClient<Database>;
          
          const { error } = await typedClient
            .from('profiles')
            .update({ theme_preference: theme })
            .eq('id', user.id);
            
          if (error) {
            console.error('Error saving theme preference:', error);
          }
        } catch (err) {
          console.error('Failed to save theme preference:', err);
        }
      }
    };
    
    saveThemeToProfile();
  }, [theme, user, profile]);

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', theme);
    
    // Update document class for CSS styling
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
