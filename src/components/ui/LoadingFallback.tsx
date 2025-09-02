import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff, Clock, Info } from 'lucide-react';
import { AppError, ErrorSeverity } from '../lib/errorTypes';

interface LoadingFallbackProps {
  error?: boolean;
  appError?: AppError;
  message?: string;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showOfflineSupport?: boolean;
  offlineData?: any;
}

export function LoadingFallback({ 
  error = false, 
  appError,
  message, 
  onRetry, 
  size = 'md',
  showOfflineSupport = false,
  offlineData
}: LoadingFallbackProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  // Show offline data if available
  if (!navigator.onLine && offlineData && showOfflineSupport) {
    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]} text-center`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <WifiOff className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Offline Mode
        </h3>
        <p className="text-slate-600 mb-4 max-w-md">
          You're currently offline. Showing cached data from your last session.
        </p>
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
          <Clock className="w-4 h-4" />
          <span>Data may not be current</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Connection</span>
          </button>
        )}
      </div>
    );
  }
  if (error) {
    const errorIcon = appError?.severity === ErrorSeverity.CRITICAL ? AlertCircle : 
                     appError?.severity === ErrorSeverity.HIGH ? AlertCircle :
                     Info;
    const errorColor = appError?.severity === ErrorSeverity.CRITICAL ? 'text-red-600' :
                      appError?.severity === ErrorSeverity.HIGH ? 'text-orange-600' :
                      'text-yellow-600';
    const bgColor = appError?.severity === ErrorSeverity.CRITICAL ? 'bg-red-100' :
                    appError?.severity === ErrorSeverity.HIGH ? 'bg-orange-100' :
                    'bg-yellow-100';

    return (
      <div className={`flex flex-col items-center justify-center ${containerClasses[size]} text-center`}>
        <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-4`}>
          {React.createElement(errorIcon, { className: `w-8 h-8 ${errorColor}` })}
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {appError?.severity === ErrorSeverity.CRITICAL ? 'Critical Error' :
           appError?.severity === ErrorSeverity.HIGH ? 'Service Error' :
           'Something went wrong'}
        </h3>
        <p className="text-slate-600 mb-4 max-w-md">
          {appError?.userMessage || message || 'We encountered an error while loading this content. Please try again.'}
        </p>
        
        {/* Show error type and code for debugging */}
        {appError && (import.meta.env.DEV || appError.severity === ErrorSeverity.CRITICAL) && (
          <div className="mb-4 p-3 bg-slate-100 rounded-lg text-left max-w-md">
            <div className="text-xs text-slate-600 space-y-1">
              <div><strong>Type:</strong> {appError.type}</div>
              <div><strong>Code:</strong> {appError.code || 'N/A'}</div>
              {appError.context?.operation && (
                <div><strong>Operation:</strong> {appError.context.operation}</div>
              )}
            </div>
          </div>
        )}
        
        {/* Recovery actions */}
        {appError?.recoveryActions && appError.recoveryActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {appError.recoveryActions.slice(0, 3).map((action) => (
              <button
                key={action.id}
                onClick={() => action.action()}
                className={`${action.primary ? 
                  'bg-slate-600 hover:bg-slate-700 text-white' : 
                  'bg-slate-200 hover:bg-slate-300 text-slate-700'
                } px-3 py-2 rounded-lg text-sm font-medium transition-colors`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        
        {onRetry && (
          <button
            onClick={onRetry}
            className={`${appError?.retryable ? 
              'bg-slate-600 hover:bg-slate-700' : 
              'bg-gray-400 cursor-not-allowed'
            } text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors`}
            disabled={appError && !appError.retryable}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{appError?.retryable ? 'Try Again' : 'Reload Page'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} text-center`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} text-slate-600 mb-4`}
      >
        <Loader2 className="w-full h-full" />
      </motion.div>
      <p className="text-slate-600">
        {message || 'Loading...'}
      </p>
      
      {/* Show network status if relevant */}
      {!navigator.onLine && (
        <div className="flex items-center space-x-2 text-sm text-slate-500 mt-2">
          <WifiOff className="w-4 h-4" />
          <span>Working offline</span>
        </div>
      )}
    </div>
  );
}

// Skeleton loading components
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
      </div>
      <div className="h-64 bg-slate-100 rounded-lg flex items-end justify-between p-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-200 rounded-t"
            style={{
              height: `${Math.random() * 80 + 20}%`,
              width: '12%'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}