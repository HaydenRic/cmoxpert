// Comprehensive Error Handling Strategy
import { reportError } from './monitoring';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: any;
  timestamp: number;
  userId?: string;
  context?: Record<string, any>;
}

// Error classification and user-friendly messages
export class ErrorHandler {
  private static errorMessages: Record<string, { userMessage: string; severity: ErrorSeverity }> = {
    // Network errors
    'Failed to fetch': {
      userMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
      severity: ErrorSeverity.MEDIUM
    },
    'NetworkError': {
      userMessage: 'Network connection lost. Please check your internet connection.',
      severity: ErrorSeverity.MEDIUM
    },
    'TimeoutError': {
      userMessage: 'The request is taking longer than expected. Please try again.',
      severity: ErrorSeverity.MEDIUM
    },
    
    // API errors
    'Invalid API key': {
      userMessage: 'Service temporarily unavailable. Our team has been notified.',
      severity: ErrorSeverity.HIGH
    },
    'Rate limit exceeded': {
      userMessage: 'Too many requests. Please wait a moment and try again.',
      severity: ErrorSeverity.MEDIUM
    },
    'Service unavailable': {
      userMessage: 'Service temporarily unavailable. Please try again in a few minutes.',
      severity: ErrorSeverity.HIGH
    },
    
    // Authentication errors
    'Invalid login credentials': {
      userMessage: 'Invalid email or password. Please check your credentials and try again.',
      severity: ErrorSeverity.LOW
    },
    'Email not confirmed': {
      userMessage: 'Please check your email and click the confirmation link to complete registration.',
      severity: ErrorSeverity.LOW
    },
    'Session expired': {
      userMessage: 'Your session has expired. Please sign in again.',
      severity: ErrorSeverity.MEDIUM
    },
    
    // Validation errors
    'Invalid email format': {
      userMessage: 'Please enter a valid email address.',
      severity: ErrorSeverity.LOW
    },
    'Password too weak': {
      userMessage: 'Password must be at least 8 characters long and include numbers and letters.',
      severity: ErrorSeverity.LOW
    },
    'Required field missing': {
      userMessage: 'Please fill in all required fields.',
      severity: ErrorSeverity.LOW
    },
    
    // Permission errors
    'Access denied': {
      userMessage: 'You don\'t have permission to perform this action.',
      severity: ErrorSeverity.MEDIUM
    },
    'Insufficient permissions': {
      userMessage: 'You don\'t have the required permissions for this feature.',
      severity: ErrorSeverity.MEDIUM
    }
  };

  static classifyError(error: any): AppError {
    const timestamp = Date.now();
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let userMessage = 'An unexpected error occurred. Please try again.';
    let message = error?.message || 'Unknown error';
    let code = error?.code;

    // Network errors
    if (message.includes('Failed to fetch') || message.includes('NetworkError') || error?.name === 'TypeError') {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
    // Timeout errors
    else if (message.includes('timeout') || error?.name === 'TimeoutError') {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'The request is taking longer than expected. Please try again.';
    }
    // API errors
    else if (error?.status >= 400 && error?.status < 500) {
      type = ErrorType.API;
      severity = error.status === 401 || error.status === 403 ? ErrorSeverity.MEDIUM : ErrorSeverity.LOW;
      
      if (error.status === 401) {
        userMessage = 'Please sign in to continue.';
        type = ErrorType.AUTHENTICATION;
      } else if (error.status === 403) {
        userMessage = 'You don\'t have permission to perform this action.';
        type = ErrorType.PERMISSION;
      } else if (error.status === 429) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else {
        userMessage = 'Invalid request. Please check your input and try again.';
      }
    }
    // Server errors
    else if (error?.status >= 500) {
      type = ErrorType.API;
      severity = ErrorSeverity.HIGH;
      userMessage = 'Server error. Our team has been notified and is working on a fix.';
    }
    // Validation errors
    else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
      userMessage = 'Please check your input and try again.';
    }
    // Authentication errors
    else if (message.includes('auth') || message.includes('login') || message.includes('credential')) {
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'Authentication failed. Please sign in again.';
    }

    // Check for specific error messages
    for (const [errorKey, errorConfig] of Object.entries(this.errorMessages)) {
      if (message.toLowerCase().includes(errorKey.toLowerCase())) {
        userMessage = errorConfig.userMessage;
        severity = errorConfig.severity;
        break;
      }
    }

    return {
      type,
      severity,
      message,
      userMessage,
      code,
      details: error,
      timestamp,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };
  }

  static async handleError(error: any, context?: Record<string, any>): Promise<AppError> {
    const appError = this.classifyError(error);
    
    // Add additional context
    if (context) {
      appError.context = { ...appError.context, ...context };
    }

    // Report error for monitoring
    reportError(error, {
      errorType: appError.type,
      severity: appError.severity,
      userMessage: appError.userMessage,
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

  static shouldRetry(error: AppError): boolean {
    // Retry network errors and temporary API errors
    return (
      error.type === ErrorType.NETWORK ||
      (error.type === ErrorType.API && error.details?.status >= 500) ||
      error.message.includes('timeout')
    );
  }

  static getRetryDelay(attemptNumber: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s
    return Math.min(1000 * Math.pow(2, attemptNumber), 8000);
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

// Network status monitoring
export class NetworkMonitor {
  private static listeners: Array<(online: boolean) => void> = [];
  private static isOnline = navigator.onLine;

  static init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  static addListener(callback: (online: boolean) => void) {
    this.listeners.push(callback);
  }

  static removeListener(callback: (online: boolean) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private static notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  static get online() {
    return this.isOnline;
  }
}

// Form validation utilities
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    throw new ValidationError('Email is required', 'email', 'REQUIRED');
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please enter a valid email address', 'email', 'INVALID_FORMAT');
  }
};

export const validatePassword = (password: string): void => {
  if (!password) {
    throw new ValidationError('Password is required', 'password', 'REQUIRED');
  }
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long', 'password', 'TOO_SHORT');
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError('Password must contain both letters and numbers', 'password', 'WEAK');
  }
};

export const validateRequired = (value: any, fieldName: string): void => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase(), 'REQUIRED');
  }
};

export const validateUrl = (url: string, fieldName: string = 'URL'): void => {
  if (!url) {
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase(), 'REQUIRED');
  }
  
  try {
    new URL(url);
  } catch {
    throw new ValidationError(`Please enter a valid ${fieldName.toLowerCase()}`, fieldName.toLowerCase(), 'INVALID_FORMAT');
  }
};

// Safe API call wrapper
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await withRetry(apiCall, 2, context);
    return { data, error: null };
  } catch (error) {
    const appError = await ErrorHandler.handleError(error, context);
    return { data: null, error: appError };
  }
}