import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Component to display the toast notification
const ToastNotification = ({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) => {
  const { id, message, type } = toast;

  // Background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} text-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

// Component to render all active toasts
const ToastContainer = ({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 w-72">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to remove a toast by id
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Function to add a new toast
  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Automatically remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast]);

  // Render the ToastContainer if there are toasts
  const ToastDisplay = useCallback(() => {
    return toasts.length > 0 ? (
      <ToastContainer toasts={toasts} onClose={removeToast} />
    ) : null;
  }, [toasts, removeToast]);

  return {
    showToast,
    removeToast,
    ToastDisplay
  };
};

export default useToast;
