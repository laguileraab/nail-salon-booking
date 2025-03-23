import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error handling for React 18
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
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
            <p className="mb-6 text-neutral-600">The application has encountered an error. Please refresh the page.</p>
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

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element. Please check your HTML.');
}

const root = createRoot(rootElement);

// Apply hydration optimizations and error handling
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
