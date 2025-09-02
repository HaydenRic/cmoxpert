import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';
import { AppError } from '../lib/errorTypes';
import { ErrorHandler } from '../lib/errorHandler';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  retryable?: boolean;
  context?: string;
  onError?: (error: AppError) => void;
}

export function ErrorBoundaryWrapper({ 
  children, 
  fallback, 
  retryable = true, 
  context,
  onError
}: ErrorBoundaryWrapperProps) {
  const [error, setError] = React.useState<AppError | null>(null);

  const handleError = React.useCallback(async (err: any) => {
    const appError = await ErrorHandler.handleError(err, {
      component: context,
      boundary: 'error_boundary_wrapper'
    });
    setError(appError);
    onError?.(appError);
  }, [context, onError]);

  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <LoadingFallback
            error={true}
            appError={error}
            message={`Error loading ${context || 'content'}`}
            onRetry={retryable ? () => window.location.reload() : undefined}
          />
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Wrapper for lazy-loaded components
export function LazyWrapper({ 
  children, 
  fallback, 
  context,
  onError
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
  context?: string;
  onError?: (error: AppError) => void;
}) {
  return (
    <React.Suspense
      fallback={
        fallback || (
          <LoadingFallback
            message={`Loading ${context || 'component'}...`}
            showOfflineSupport={true}
          />
        )
      }
    >
      <ErrorBoundaryWrapper context={context} onError={onError}>
        {children}
      </ErrorBoundaryWrapper>
    </React.Suspense>
  );
}