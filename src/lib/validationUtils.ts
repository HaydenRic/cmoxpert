// Re-export from new modular error handling system
export * from './errorTypes';
export * from './errorHandler';
export * from './offlineManager';
export * from './validationUtils';

export * from './offlineManager';
export * from './validationUtils';
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

export const validateEmail = (email: string, fieldName: string = 'Email') => {
  if (!email || email.trim() === '') {
    throw new ValidationError(`${fieldName} is required`, 'email', 'REQUIRED');
  }
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