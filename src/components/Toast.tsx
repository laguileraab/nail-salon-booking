import React from 'react';
import { useToast } from '../hooks/useToast';

// Toast component to be used in the app
const Toast: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`px-4 py-2 rounded shadow-lg flex justify-between items-center max-w-md ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          <p>{toast.message}</p>
          <button 
            onClick={() => dismissToast(toast.id)}
            className="ml-4 text-white hover:text-gray-200"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
