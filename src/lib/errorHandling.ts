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
  AI_SERVICE = 'ai_service',
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
  retryable?: boolean;
  action?: string;
}

// Network status monitoring
export class NetworkMonitor {
  private static listeners: Array<(online: boolean) => void> = [];
  private static isOnline = navigator.onLine;
  private static initialized = false;

  static init() {
    if (this.initialized) return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      console.log('Network connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      console.warn('Network connection lost');
    });

    this.initialized = true;
  }

  static addListener(callback: (online: boolean) => void) {
    this.listeners.push(callback);
  }

  static removeListener(callback: (online: boolean) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private static notifyListeners(online: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(online);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  static get online() {
    return this.isOnline;
  }
}

// Error classification and user-friendly messages
export class ErrorHandler {
  private static errorMessages: Record<string, { userMessage: string; severity: ErrorSeverity; retryable: boolean; action?: string }> = {
    // Network errors
    'Failed to fetch': {
      userMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      action: 'retry'
    },
    'NetworkError': {
      userMessage: 'Network connection lost. Please check your internet connection.',
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      action: 'check_connection'
    },
    'TimeoutError': {
      userMessage: 'The request is taking longer than expected. Please try again.',
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      action: 'retry'
    },
    'ERR_NETWORK': {
      userMessage: 'Network error occurred. Please check your connection and try again.',
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      action: 'check_connection'
    },
    
    // API errors
    'Invalid API key': {
      userMessage: 'Service temporarily unavailable. Our team has been notified.',
      severity: ErrorSeverity.HIGH,
      retryable: false,
      action: 'contact_support'
    },
    'Rate limit exceeded': {
      userMessage: 'Too many requests. Please wait a moment and try again.',
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      action: 'wait_retry'
    },
    'Service unavailable': {
      userMessage: 'Service temporarily unavailable. Please try again in a few minutes.',
      severity: ErrorSeverity.HIGH,
      retryable: true,
      action: 'retry_later'
    },
    'Internal server error': {
      userMessage: 'Server error occurred. Our team has been notified.',
      severity: ErrorSeverity.HIGH,
      retryable: true,
      action: 'retry_later'
    },
    
    // Authentication errors
    'Invalid login credentials': {
      userMessage: 'Invalid email or password. Please check your credentials and try again.',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'check_credentials'
    },
    'Email not confirmed': {
      userMessage: 'Please check your email and click the confirmation link to complete registration.',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'check_email'
    },
    'Session expired': {
      userMessage: 'Your session has expired. Please sign in again.',
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      action: 'sign_in'
    },
    'User not found': {
      userMessage: 'Account not found. Please check your email or create a new account.',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'check_account'
    },
    
    // Validation errors
    'Invalid email format': {
      userMessage: 'Please enter a valid email address.',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'fix_input'
    },
    'Password too weak': {
      userMessage: 'Password must be at least 8 characters long and include numbers and letters.',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'fix_input'
    },
    'Required field missing': {
      userMessage: 'Please fill in all required fields.',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'fix_input'
    },
    
    // Permission errors
    'Access denied': {
      userMessage: 'You don\'t have permission to perform this action.',
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      action: 'contact_admin'
    },
    'Insufficient permissions': {
      userMessage: 'You don\'t have the required permissions for this feature.',
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      action: 'contact_admin'
    },
    
    // AI Service errors
    'AI service unavailable': {
      userMessage: 'AI analysis is temporarily unavailable. Please try again later.',
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      action: 'retry_later'
    },
    'AI generation failed': {
      userMessage: 'Content generation failed. Please try again with different parameters.',
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      action: 'retry'
    },
    
    // Storage errors
    'File too large': {
      userMessage: 'File is too large. Please choose a smaller file (max 5MB).',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'choose_smaller_file'
    },
    'Invalid file type': {
      userMessage: 'Invalid file type. Please choose a supported file format.',
      severity: ErrorSeverity.LOW,
      retryable: false,
      action: 'choose_valid_file'
    }
  };

  static classifyError(error: any): AppError {
    const timestamp = Date.now();
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let userMessage = 'An unexpected error occurred. Please try again.';
    let message = error?.message || error?.toString() || 'Unknown error';
    let code = error?.code || error?.status?.toString();
    let retryable = false;
    let action = 'retry';

    // Handle different error sources
    if (error?.name === 'TypeError' && message.includes('Failed to fetch')) {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.MEDIUM;
      userMessage = NetworkMonitor.online 
        ? 'Unable to connect to our servers. Please try again.'
        : 'You appear to be offline. Please check your internet connection.';
      retryable = true;
      action = NetworkMonitor.online ? 'retry' : 'check_connection';
    }
    // HTTP status codes
    else if (error?.status) {
      type = ErrorType.API;
      
      if (error.status >= 400 && error.status < 500) {
        severity = error.status === 401 || error.status === 403 ? ErrorSeverity.MEDIUM : ErrorSeverity.LOW;
        
        switch (error.status) {
          case 400:
            userMessage = 'Invalid request. Please check your input and try again.';
            action = 'fix_input';
            break;
          case 401:
            type = ErrorType.AUTHENTICATION;
            userMessage = 'Please sign in to continue.';
            action = 'sign_in';
            break;
          case 403:
            type = ErrorType.PERMISSION;
            userMessage = 'You don\'t have permission to perform this action.';
            action = 'contact_admin';
            break;
          case 404:
            userMessage = 'The requested resource was not found.';
            action = 'go_back';
            break;
          case 429:
            userMessage = 'Too many requests. Please wait a moment and try again.';
            retryable = true;
            action = 'wait_retry';
            break;
          default:
            userMessage = 'Request failed. Please try again.';
            retryable = true;
        }
      } else if (error.status >= 500) {
        severity = ErrorSeverity.HIGH;
        userMessage = 'Server error. Our team has been notified.';
        retryable = true;
        action = 'retry_later';
      }
    }
    // Supabase specific errors
    else if (error?.code) {
      type = ErrorType.API;
      
      switch (error.code) {
        case 'PGRST116':
          userMessage = 'No data found for your request.';
          severity = ErrorSeverity.LOW;
          action = 'check_data';
          break;
        case '23505':
          userMessage = 'This item already exists. Please use a different name.';
          severity = ErrorSeverity.LOW;
          action = 'fix_input';
          break;
        case '23503':
          userMessage = 'Invalid reference. Please check your selection.';
          severity = ErrorSeverity.LOW;
          action = 'fix_input';
          break;
        default:
          userMessage = 'Database error occurred. Please try again.';
          retryable = true;
      }
    }
    // Check for specific error patterns
    else {
      for (const [errorKey, errorConfig] of Object.entries(this.errorMessages)) {
        if (message.toLowerCase().includes(errorKey.toLowerCase())) {
          userMessage = errorConfig.userMessage;
          severity = errorConfig.severity;
          retryable = errorConfig.retryable;
          action = errorConfig.action || 'retry';
          
          // Determine error type based on message content
          if (errorKey.includes('network') || errorKey.includes('fetch')) {
            type = ErrorType.NETWORK;
          } else if (errorKey.includes('auth') || errorKey.includes('login') || errorKey.includes('credential')) {
            type = ErrorType.AUTHENTICATION;
          } else if (errorKey.includes('permission') || errorKey.includes('access')) {
            type = ErrorType.PERMISSION;
          } else if (errorKey.includes('validation') || errorKey.includes('invalid') || errorKey.includes('required')) {
            type = ErrorType.VALIDATION;
          } else if (errorKey.includes('AI') || errorKey.includes('generation')) {
            type = ErrorType.AI_SERVICE;
          }
          break;
        }
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
      retryable,
      action,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: NetworkMonitor.online,
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

    // Add user ID if available
    try {
      const { supabase } = await import('./supabase');
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          appError.userId = user.id;
        }
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
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase().replace(' ', '_'), 'REQUIRED');
  }
};

export const validateUrl = (url: string, fieldName: string = 'URL'): void => {
  if (!url) {
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase().replace(' ', '_'), 'REQUIRED');
  }
  
  try {
    new URL(url);
  } catch {
    throw new ValidationError(`Please enter a valid ${fieldName.toLowerCase()}`, fieldName.toLowerCase().replace(' ', '_'), 'INVALID_FORMAT');
  }
};

export const validateFileSize = (file: File, maxSizeMB: number = 5): void => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new ValidationError(`File is too large. Maximum size is ${maxSizeMB}MB.`, 'file', 'FILE_TOO_LARGE');
  }
};

export const validateFileType = (file: File, allowedTypes: string[]): void => {
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      'file',
      'INVALID_FILE_TYPE'
    );
  }
};

// Offline storage utilities
export class OfflineStorage {
  private static readonly STORAGE_KEY = 'cmoxpert_offline_data';
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

  static save(key: string, data: any): boolean {
    try {
      const storage = this.getStorage();
      storage[key] = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const serialized = JSON.stringify(storage);
      
      // Check storage size
      if (serialized.length > this.MAX_STORAGE_SIZE) {
        console.warn('Offline storage limit exceeded, cleaning old data');
        this.cleanup();
        return false;
      }
      
      localStorage.setItem(this.STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  static load(key: string): any | null {
    try {
      const storage = this.getStorage();
      const item = storage[key];
      
      if (!item) return null;
      
      // Check if data is too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - item.timestamp > maxAge) {
        delete storage[key];
        this.saveStorage(storage);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      const storage = this.getStorage();
      delete storage[key];
      this.saveStorage(storage);
    } catch (error) {
      console.error('Failed to remove offline data:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
    }
  }

  private static getStorage(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static saveStorage(storage: Record<string, any>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error('Failed to save storage:', error);
    }
  }

  private static cleanup(): void {
    try {
      const storage = this.getStorage();
      const entries = Object.entries(storage);
      
      // Sort by timestamp and keep only the 10 most recent items
      entries.sort((a, b) => (b[1] as any).timestamp - (a[1] as any).timestamp);
      const cleaned = Object.fromEntries(entries.slice(0, 10));
      
      this.saveStorage(cleaned);
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
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

// Global error handler initialization
export const initializeErrorHandling = () => {
  // Initialize network monitoring
  NetworkMonitor.init();

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    ErrorHandler.handleError(event.reason, {
      type: 'unhandled_promise_rejection',
      promise: event.promise
    });
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    ErrorHandler.handleError(event.error, {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  console.log('Error handling initialized');
};