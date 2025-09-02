```typescript
import React from 'react';
import { AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { AppError, ErrorSeverity } from '../lib/errorTypes';

interface FormErrorDisplayProps {
  errors: Record<string, AppError[]>;
  onClearError?: (field: string, errorId: string) => void;
  className?: string;
}

export function FormErrorDisplay({ errors, onClearError, className = '' }: FormErrorDisplayProps) {
  const getErrorIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return AlertCircle;
      case ErrorSeverity.MEDIUM:
        return AlertCircle;
      case ErrorSeverity.LOW:
        return Info;
      default:
        return AlertCircle;
    }
  };

  const getErrorColors = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'text-red-600 bg-red-50 border-red-200';
      case ErrorSeverity.MEDIUM:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case ErrorSeverity.LOW:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const hasErrors = Object.values(errors).some(fieldErrors => fieldErrors.length > 0);

  if (!hasErrors) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(errors).map(([field, fieldErrors]) => 
        fieldErrors.map((error) => {
          const Icon = getErrorIcon(error.severity);
          const colors = getErrorColors(error.severity);
          
          return (
            <div
              key={`${field}-${error.id}`}
              className={`flex items-start space-x-2 p-3 rounded-lg border ${colors}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {error.userMessage}
                </p>
                {error.code && (
                  <p className="text-xs opacity-75 mt-1">
                    Field: {field} • Code: {error.code}
                  </p>
                )}
              </div>
              {onClearError && (
                <button
                  onClick={() => onClearError(field, error.id)}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// Field-level error display
interface FieldErrorProps {
  error?: AppError;
  className?: string;
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null;

  const Icon = error.severity === ErrorSeverity.LOW ? Info : AlertCircle;
  const colorClass = error.severity === ErrorSeverity.LOW ? 'text-blue-600' : 'text-red-600';

  return (
    <div className={`flex items-center space-x-1 mt-1 ${className}`}>
      <Icon className={`w-3 h-3 ${colorClass}`} />
      <span className={`text-xs ${colorClass}`}>
        {error.userMessage}
      </span>
    </div>
  );
}

// Success message component
interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function SuccessMessage({ 
  message, 
  onClose, 
  autoClose = true, 
  duration = 3000 
}: SuccessMessageProps) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
      <CheckCircle className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-green-600 hover:text-green-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```