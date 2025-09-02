```typescript
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
  ExternalLink,
  Clock,
  Shield,
  Bug,
  Zap,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AppError, ErrorSeverity, ErrorType, RecoveryAction } from '../lib/errorTypes';

interface Toast {
  id: string;
  error: AppError;
  autoClose?: boolean;
  duration?: number;
  showDetails?: boolean;
}

interface ErrorToastProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  onRetry?: (error: AppError) => void;
  onAction?: (error: AppError, action: string) => void;
  onFeedback?: (error: AppError, feedback: string) => void;
}

export function ErrorToast({ 
  toasts, 
  onClose, 
  onRetry, 
  onAction, 
  onFeedback 
}: ErrorToastProps) {
  const [expandedToasts, setExpandedToasts] = useState<Set<string>>(new Set());
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});

  const getIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return AlertCircle;
      case ErrorSeverity.HIGH:
        return AlertTriangle;
      case ErrorSeverity.MEDIUM:
        return Info;
      case ErrorSeverity.LOW:
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getTypeIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return WifiOff;
      case ErrorType.AUTHENTICATION:
        return Shield;
      case ErrorType.AI_SERVICE:
        return Zap;
      case ErrorType.VALIDATION:
        return AlertTriangle;
      default:
        return Bug;
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
          button: 'bg-red-600 hover:bg-red-700',
          accent: 'bg-red-100'
        };
      case ErrorSeverity.HIGH:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          text: 'text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700',
          accent: 'bg-orange-100'
        };
      case ErrorSeverity.MEDIUM:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          text: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          accent: 'bg-yellow-100'
        };
      case ErrorSeverity.LOW:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700',
          accent: 'bg-blue-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          text: 'text-gray-800',
          button: 'bg-gray-600 hover:bg-gray-700',
          accent: 'bg-gray-100'
        };
    }
  };

  const toggleExpanded = (toastId: string) => {
    setExpandedToasts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toastId)) {
        newSet.delete(toastId);
      } else {
        newSet.add(toastId);
      }
      return newSet;
    });
  };

  const copyErrorDetails = (error: AppError) => {
    const details = {
      id: error.id,
      type: error.type,
      message: error.message,
      timestamp: new Date(error.timestamp).toISOString(),
      context: error.context
    };
    
    navigator.clipboard.writeText(JSON.stringify(details, null, 2));
  };

  const submitFeedback = (error: AppError) => {
    const feedback = feedbackText[error.id];
    if (feedback && onFeedback) {
      onFeedback(error, feedback);
      setFeedbackText(prev => ({ ...prev, [error.id]: '' }));
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const SeverityIcon = getIcon(toast.error.severity);
          const TypeIcon = getTypeIcon(toast.error.type);
          const colors = getColors(toast.error.severity);
          const isExpanded = expandedToasts.has(toast.id);

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg backdrop-blur-sm overflow-hidden`}
            >
              {/* Main error content */}
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 flex items-center space-x-1">
                    <SeverityIcon className={`w-5 h-5 ${colors.icon}`} />
                    <TypeIcon className={`w-4 h-4 ${colors.icon} opacity-60`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {toast.error.userMessage}
                        </p>
                        
                        {toast.error.code && (
                          <p className={`text-xs ${colors.text} opacity-75 mt-1`}>
                            Error Code: {toast.error.code}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {(import.meta.env.DEV || toast.error.severity === ErrorSeverity.CRITICAL) && (
                          <button
                            onClick={() => toggleExpanded(toast.id)}
                            className={`${colors.icon} hover:opacity-75 transition-opacity p-1`}
                            title="Show details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => onClose(toast.id)}
                          className={`${colors.icon} hover:opacity-75 transition-opacity p-1`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Recovery actions */}
                    {toast.error.recoveryActions && toast.error.recoveryActions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {toast.error.recoveryActions.slice(0, 2).map((action) => (
                          <button
                            key={action.id}
                            onClick={() => action.action()}
                            className={`${action.primary ? colors.button : `${colors.accent} ${colors.text}`} text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors`}
                          >
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`border-t ${colors.border} ${colors.accent}`}
                  >
                    <div className="p-4 space-y-3">
                      {/* Error details */}
                      <div>
                        <h4 className={`text-xs font-medium ${colors.text} mb-1`}>
                          Technical Details
                        </h4>
                        <div className="bg-white/50 rounded p-2 text-xs font-mono text-slate-800 max-h-20 overflow-auto">
                          <div><strong>Type:</strong> {toast.error.type}</div>
                          <div><strong>Category:</strong> {toast.error.category}</div>
                          <div><strong>Message:</strong> {toast.error.message}</div>
                          {toast.error.context?.operation && (
                            <div><strong>Operation:</strong> {toast.error.context.operation}</div>
                          )}
                        </div>
                      </div>

                      {/* Copy error details */}
                      <button
                        onClick={() => copyErrorDetails(toast.error)}
                        className={`w-full ${colors.button} text-white px-3 py-2 rounded text-xs font-medium flex items-center justify-center space-x-1 transition-colors`}
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Error Details</span>
                      </button>

                      {/* User feedback */}
                      {toast.error.severity === ErrorSeverity.HIGH || toast.error.severity === ErrorSeverity.CRITICAL ? (
                        <div className="space-y-2">
                          <h4 className={`text-xs font-medium ${colors.text}`}>
                            Help us improve (optional)
                          </h4>
                          <textarea
                            value={feedbackText[toast.id] || ''}
                            onChange={(e) => setFeedbackText(prev => ({ 
                              ...prev, 
                              [toast.id]: e.target.value 
                            }))}
                            placeholder="What were you trying to do when this error occurred?"
                            className="w-full text-xs p-2 border border-slate-300 rounded resize-none"
                            rows={2}
                          />
                          <button
                            onClick={() => submitFeedback(toast.error)}
                            disabled={!feedbackText[toast.id]}
                            className={`w-full ${colors.button} disabled:opacity-50 text-white px-3 py-1 rounded text-xs font-medium transition-colors`}
                          >
                            Send Feedback
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Enhanced toast manager hook
export function useErrorToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showError = (
    error: AppError, 
    options?: { 
      autoClose?: boolean; 
      duration?: number;
      showDetails?: boolean;
    }
  ) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      id,
      error,
      autoClose: options?.autoClose ?? (error.severity === ErrorSeverity.LOW),
      duration: options?.duration ?? this.getDurationBySeverity(error.severity),
      showDetails: options?.showDetails ?? false
    };

    setToasts(prev => {
      // Limit number of toasts
      const newToasts = [toast, ...prev.slice(0, 4)];
      return newToasts;
    });

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

  const getDurationBySeverity = (severity: ErrorSeverity): number => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 0; // Never auto-close
      case ErrorSeverity.HIGH:
        return 10000; // 10 seconds
      case ErrorSeverity.MEDIUM:
        return 7000; // 7 seconds
      case ErrorSeverity.LOW:
        return 4000; // 4 seconds
      default:
        return 5000;
    }
  };

  return {
    toasts,
    showError,
    closeToast,
    clearAll
  };
}

// Network status indicator
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);

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

    // Check for pending operations periodically
    const checkPending = () => {
      try {
        const { OfflineManager } = require('../lib/offlineManager');
        setPendingOperations(OfflineManager.getPendingOperationsCount());
      } catch {
        // OfflineManager not available
      }
    };

    const interval = setInterval(checkPending, 5000);
    checkPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You're currently offline. Some features may not work properly.
                </span>
                {pendingOperations > 0 && (
                  <span className="text-xs bg-red-700 px-2 py-1 rounded">
                    {pendingOperations} operations queued
                  </span>
                )}
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Restored Banner */}
      <AnimatePresence>
        {isOnline && pendingOperations > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                Connection restored! Syncing {pendingOperations} operations...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Offline Indicator */}
      {!isOnline && !showOfflineMessage && (
        <div className="fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded-lg shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-medium">Offline</span>
            {pendingOperations > 0 && (
              <span className="text-xs bg-red-700 px-1 py-0.5 rounded">
                {pendingOperations}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Offline-capable component wrapper
export function withOfflineSupport<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallbackData?: any;
    cacheKey?: string;
    feature?: string;
  }
) {
  return function OfflineCapableComponent(props: T) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [cachedData, setCachedData] = useState(null);

    useEffect(() => {
      const handleNetworkChange = (online: boolean) => {
        setIsOnline(online);
        
        if (!online && options?.cacheKey) {
          const cached = OfflineManager.getCachedData(options.cacheKey);
          setCachedData(cached);
        }
      };

      OfflineManager.addNetworkListener(handleNetworkChange);
      
      // Load cached data if offline
      if (!isOnline && options?.cacheKey) {
        const cached = OfflineManager.getCachedData(options.cacheKey);
        setCachedData(cached);
      }

      return () => {
        OfflineManager.removeNetworkListener(handleNetworkChange);
      };
    }, []);

    // If offline and we have cached data, pass it to the component
    const enhancedProps = {
      ...props,
      isOnline,
      cachedData: cachedData || options?.fallbackData,
      offlineMode: !isOnline
    } as T & {
      isOnline: boolean;
      cachedData: any;
      offlineMode: boolean;
    };

    return <Component {...enhancedProps} />;
  };
}
```