import React, { Component, ReactNode } from 'react';
import { LoadingFallback } from './LoadingFallback';
import { ErrorHandler, AppError } from '../lib/errorHandling';

interface SafeComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
  retryable?: boolean;
}

interface SafeComponentState {
  hasError: boolean;
  error?: AppError;
  retryCount: number;
}

// Higher-order component for safe rendering with error boundaries
export class SafeComponent extends Component<SafeComponentProps, SafeComponentState> {
  constructor(props: SafeComponentProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<SafeComponentState> {
    return { hasError: true };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = await ErrorHandler.handleError(error, {
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    this.setState({ error: appError });
    this.props.onError?.(appError);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      retryCount: this.state.retryCount + 1 
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <LoadingFallback
          error={true}
          message={this.state.error?.userMessage || 'Something went wrong'}
          onRetry={this.props.retryable ? this.handleRetry : undefined}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for safe async operations
export function useSafeAsync() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<AppError | null>(null);

  const execute = React.useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: AppError) => void;
      context?: Record<string, any>;
    }
  ): Promise<{ data: T | null; error: AppError | null }> => {
    setLoading(true);
    setError(null);

    try {
      const data = await operation();
      options?.onSuccess?.(data);
      return { data, error: null };
    } catch (err) {
      const appError = await ErrorHandler.handleError(err, options?.context);
      setError(appError);
      options?.onError?.(appError);
      return { data: null, error: appError };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError
  };
}