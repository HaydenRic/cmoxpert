import { AppError, ErrorType, ErrorSeverity } from './errorTypes';
import { NetworkMonitor } from './offlineManager';

// Error reporting function (placeholder)
const reportError = (error: any, context: any) => {
  // This would integrate with your error reporting service
  console.log('Reporting error:', error, context);
};

// Main error handler
export class ErrorHandler {
  static async handleError(error: any, context?: Record<string, any>): Promise<AppError> {
    let appError: AppError;

    if (error instanceof Error && 'type' in error) {
      appError = error as AppError;
    } else {
      appError = this.createAppError(error, context);
    }

    // Add additional context
    try {
      if (context) {
        appError.context = { ...appError.context, ...context };
      }
    } catch {
      // Ignore errors when getting user context
    }

    // Report error for monitoring
    reportError(error, {
      errorType: appError.type,
      severity: appError.severity,
      userMessage: appError.userMessage,
      retryable: appError.retryable,
      action: appError.action,
      ...appError.context
    });

    // Log error based on severity
    if (appError.severity === ErrorSeverity.CRITICAL || appError.severity === ErrorSeverity.HIGH) {
      console.error('Critical/High severity error:', appError);
    } else if (appError.severity === ErrorSeverity.MEDIUM) {
      console.warn('Medium severity error:', appError);
    } else {
      console.log('Low severity error:', appError);
    }

    return appError;
  }

  private static createAppError(error: any, context?: Record<string, any>): AppError {
    const baseError = error instanceof Error ? error : new Error(String(error));
    
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let userMessage = 'An unexpected error occurred';
    let retryable = false;
    let action = '';

    // Determine error type and properties based on error characteristics
    if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
      userMessage = 'Network connection error. Please check your internet connection.';
      retryable = true;
      action = 'retry';
    } else if (error?.status === 401) {
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
      userMessage = 'Authentication required. Please log in again.';
      retryable = false;
      action = 'login';
    } else if (error?.status === 403) {
      type = ErrorType.PERMISSION;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'You do not have permission to perform this action.';
      retryable = false;
    } else if (error?.status === 404) {
      type = ErrorType.API;
      severity = ErrorSeverity.LOW;
      userMessage = 'The requested resource was not found.';
      retryable = false;
    } else if (error?.status >= 500) {
      type = ErrorType.API;
      severity = ErrorSeverity.HIGH;
      userMessage = 'Server error. Please try again later.';
      retryable = true;
      action = 'retry';
    } else if (error?.status >= 400) {
      type = ErrorType.API;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'Invalid request. Please check your input.';
      retryable = false;
    }

    return Object.assign(baseError, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      category: 'SYSTEM_ERROR',
      severity,
      userMessage,
      retryable,
      action,
      context,
      timestamp: Date.now()
    });
  }

  static shouldRetry(error: AppError): boolean {
    return error.retryable === true;
  }

  static getRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    return Math.min(1000 * Math.pow(2, attemptNumber), 30000);
  }
}

// Retry wrapper with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  context?: Record<string, any>
): Promise<T> {
  let lastError: AppError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = await ErrorHandler.handleError(error, {
        ...context,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1
      });
      
      if (attempt === maxRetries || !ErrorHandler.shouldRetry(lastError)) {
        throw lastError;
      }
      
      const delay = ErrorHandler.getRetryDelay(attempt);
      console.log(`Retrying operation in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Safe API call wrapper
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await withRetry(apiCall, 2, context);
    return { data, error: null };
  } catch (error) {
    const appError = error instanceof Error ? await ErrorHandler.handleError(error, context) : error;
    return { data: null, error: appError };
  }
}

// Circuit breaker pattern for API calls
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  get isOpen(): boolean {
    return this.state === 'OPEN';
  }
}