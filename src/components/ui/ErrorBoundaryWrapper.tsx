import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { SafeComponent } from './SafeComponent';
import { LoadingFallback } from './LoadingFallback';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  retryable?: boolean;
  context?: string;
}

export function ErrorBoundaryWrapper({ 
  children, 
  fallback, 
  retryable = true, 
  context 
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <LoadingFallback
            error={true}
            message={`Error loading ${context || 'content'}`}
            onRetry={retryable ? () => window.location.reload() : undefined}
          />
        )
      }
    >
      <SafeComponent
        fallback={fallback}
        retryable={retryable}
      >
        {children}
      </SafeComponent>
    </ErrorBoundary>
  );
}

// Wrapper for lazy-loaded components
export function LazyWrapper({ 
  children, 
  fallback, 
  context 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
  context?: string; 
}) {
  return (
    <React.Suspense
      fallback={
        fallback || (
          <LoadingFallback
            message={`Loading ${context || 'component'}...`}
          />
        )
      }
    >
      <ErrorBoundaryWrapper context={context}>
        {children}
      </ErrorBoundaryWrapper>
    </React.Suspense>
  );
}