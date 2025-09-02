import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  ExternalLink
} from 'lucide-react';
import { AppError, ErrorSeverity } from '../lib/errorHandling';

interface Toast {
  id: string;
  error: AppError;
  autoClose?: boolean;
  duration?: number;
}

interface ErrorToastProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  onRetry?: (error: AppError) => void;
  onAction?: (error: AppError, action: string) => void;
}

export function ErrorToast({ toasts, onClose, onRetry, onAction }: ErrorToastProps) {
  const getIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return AlertCircle;
      case ErrorSeverity.MEDIUM:
        return AlertTriangle;
      case ErrorSeverity.LOW:
        return Info;
      default:
        return AlertCircle;
    }
  };

  const getColors = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case ErrorSeverity.HIGH:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          text: 'text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case ErrorSeverity.MEDIUM:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          text: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case ErrorSeverity.LOW:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          text: 'text-gray-800',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const getActionButton = (error: AppError) => {
    switch (error.action) {
      case 'retry':
        return {
          label: 'Try Again',
          icon: RefreshCw,
          onClick: () => onRetry?.(error)
        };
      case 'check_connection':
        return {
          label: 'Check Connection',
          icon: WifiOff,
          onClick: () => window.open('https://www.google.com', '_blank')
        };
      case 'contact_support':
        return {
          label: 'Contact Support',
          icon: ExternalLink,
          onClick: () => onAction?.(error, 'contact_support')
        };
      case 'sign_in':
        return {
          label: 'Sign In',
          icon: ExternalLink,
          onClick: () => onAction?.(error, 'sign_in')
        };
      case 'check_email':
        return {
          label: 'Check Email',
          icon: ExternalLink,
          onClick: () => onAction?.(error, 'check_email')
        };
      default:
        if (error.retryable) {
          return {
            label: 'Try Again',
            icon: RefreshCw,
            onClick: () => onRetry?.(error)
          };
        }
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = getIcon(toast.error.severity);
          const colors = getColors(toast.error.severity);
          const actionButton = getActionButton(toast.error);

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4 backdrop-blur-sm`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {toast.error.userMessage}
                  </p>
                  
                  {import.meta.env.DEV && (
                    <details className="mt-2">
                      <summary className={`text-xs ${colors.text} cursor-pointer opacity-75 hover:opacity-100`}>
                        Debug Info
                      </summary>
                      <div className="mt-1 text-xs font-mono bg-white/50 rounded p-2 overflow-auto max-h-20">
                        <div><strong>Type:</strong> {toast.error.type}</div>
                        <div><strong>Code:</strong> {toast.error.code || 'N/A'}</div>
                        <div><strong>Message:</strong> {toast.error.message}</div>
                      </div>
                    </details>
                  )}
                  
                  {actionButton && (
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={actionButton.onClick}
                        className={`${colors.button} text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors`}
                      >
                        <actionButton.icon className="w-3 h-3" />
                        <span>{actionButton.label}</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onClose(toast.id)}
                  className={`${colors.icon} hover:opacity-75 transition-opacity`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Toast manager hook
export function useErrorToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showError = (error: AppError, options?: { autoClose?: boolean; duration?: number }) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      id,
      error,
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? 5000
    };

    setToasts(prev => [...prev, toast]);

    // Auto-close toast
    if (toast.autoClose) {
      setTimeout(() => {
        closeToast(id);
      }, toast.duration);
    }

    return id;
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    showError,
    closeToast,
    clearAll
  };
}

// Network status indicator component
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      
      // Hide offline message after 10 seconds
      setTimeout(() => setShowOfflineMessage(false), 10000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage && isOnline) return null;

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You're currently offline. Some features may not work properly.
            </span>
          </div>
        </motion.div>
      )}
      
      {!isOnline && !showOfflineMessage && (
        <div className="fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs">Offline</span>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}