/**
 * This file helps resolve circular dependency and initialization order issues
 * by ensuring that commonly used dependencies are pre-loaded in the correct order.
 * 
 * It should be imported first in the entry point file (main.tsx).
 */

// Import essential libraries that might cause circular dependency issues
import 'react';
import 'react-dom';
import 'react-router-dom';
import '@supabase/supabase-js';

// Fix for potential 'z is not defined' errors in dependencies
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Export a dummy function to ensure this file is not tree-shaken
export function ensureDependencies() {
  return true;
}
