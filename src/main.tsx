// Import polyfill first to resolve initialization issues
import './polyfill';

import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import './index.css'
import App from './App.tsx'

// Simple error boundary for production
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('React getDerivedStateFromError:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-primary-600">Something went wrong</h1>
            <p className="mb-6 text-neutral-600">Error: {this.state.error?.message || 'Unknown error'}</p>
            <button 
              className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Production check for missing variables
const checkRequiredVariables = () => {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

try {
  console.log('Initializing MärchenNails application...');
  const envCheck = checkRequiredVariables();
  if (!envCheck) {
    console.error('Environment variables missing, but attempting to continue anyway');
  }
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Failed to find the root element. Please check your HTML.');
  }

  const root = createRoot(rootElement);

  // Apply simplified provider chain
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <HelmetProvider>
          <Router>
            <AuthProvider>
              <ThemeProvider>
                <LanguageProvider>
                  <App />
                  <Toaster position="top-right" />
                </LanguageProvider>
              </ThemeProvider>
            </AuthProvider>
          </Router>
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('MärchenNails application initialized successfully!');
} catch (error) {
  console.error('Fatal error during initialization:', error);
  // Show error to user in DOM if possible
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui, sans-serif;">
        <h1 style="color: #d32f2f;">Application Failed to Load</h1>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #f8b4d9; border: none; border-radius: 4px; cursor: pointer;">
          Reload
        </button>
      </div>
    `;
  }
}
