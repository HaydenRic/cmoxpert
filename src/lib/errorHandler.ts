import { 
  AppError, 
  ErrorType, 
  ErrorSeverity, 
  ErrorCategory, 
  ERROR_PATTERNS, 
  USER_ERROR_MESSAGES,
  ErrorHandlerConfig,
  RecoveryAction
} from './errorTypes';
import { reportError } from './monitoring';

// Global error handler configuration
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableOfflineMode: true,
  enableUserFeedback: true,
  logLevel: import.meta.env.DEV ? 'debug' : 'error'
};

export class ErrorHandler {
  private static config: ErrorHandlerConfig = DEFAULT_CONFIG;
  private static errorHistory: AppError[] = [];
  private static maxHistorySize = 100;

  static configure(config: Partial<ErrorHandlerConfig>) {
    this.config = { ...this.config, ...config };
  }

  static async handleError(
    error: any, 
    context?: Record<string, any>
  ): Promise<AppError> {
    const appError = this.classifyError(error, context);
    
    // Add to error history
    this.addToHistory(appError);
    
    // Log error based on severity and configuration
    this.logError(appError);
    
    // Report to monitoring service
    if (appError.severity !== ErrorSeverity.LOW) {
      reportError(new Error(appError.message), {
        errorType: appError.type,
        severity: appError.severity,
        userMessage: appError.userMessage,
        context: appError.context,
        metadata: appError.metadata
      });
    }
    
    return appError;
  }

  private static classifyError(error: any, context?: Record<string, any>): AppError {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const message = this.extractErrorMessage(error);
    
    // Classify error type
    const type = this.determineErrorType(error, message);
    const category = this.determineErrorCategory(type, error);
    const severity = this.determineSeverity(type, error);
    
    // Generate user-friendly message
    const userMessage = this.generateUserMessage(type, error, message);
    
    // Determine if error is retryable
    const retryable = this.isRetryable(type, error);
    
    // Generate recovery actions
    const recoveryActions = this.generateRecoveryActions(type, error, context);
    
    return {
      id,
      type,
      category,
      severity,
      message,
      userMessage,
      code: error?.code || error?.status?.toString(),
      details: this.sanitizeErrorDetails(error),
      timestamp,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        timestamp: new Date().toISOString()
      },
      retryable,
      action: this.determineAction(type, error),
      recoveryActions,
      metadata: {
        component: context?.component,
        operation: context?.operation,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId()
      }
    };
  }

  private static extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.data?.message) return error.data.message;
    return error?.toString() || 'Unknown error occurred';
  }

  private static determineErrorType(error: any, message: string): ErrorType {
    // Check for specific error patterns
    for (const [type, patterns] of Object.entries(ERROR_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(message))) {
        return type as ErrorType;
      }
    }

    // Check HTTP status codes
    if (error?.status) {
      if (error.status === 401 || error.status === 403) return ErrorType.AUTHENTICATION;
      if (error.status === 422) return ErrorType.VALIDATION;
      if (error.status >= 400 && error.status < 500) return ErrorType.API;
      if (error.status >= 500) return ErrorType.API;
    }

    // Check error names
    if (error?.name === 'ValidationError') return ErrorType.VALIDATION;
    if (error?.name === 'TypeError' && message.includes('fetch')) return ErrorType.NETWORK;
    if (error?.name === 'AbortError') return ErrorType.NETWORK;

    return ErrorType.UNKNOWN;
  }

  private static determineErrorCategory(type: ErrorType, error: any): ErrorCategory {
    switch (type) {
      case ErrorType.VALIDATION:
      case ErrorType.FORM:
        return ErrorCategory.USER_ERROR;
      case ErrorType.NETWORK:
      case ErrorType.API:
      case ErrorType.AI_SERVICE:
        return ErrorCategory.EXTERNAL_ERROR;
      case ErrorType.AUTHENTICATION:
      case ErrorType.PERMISSION:
        return ErrorCategory.SYSTEM_ERROR;
      default:
        return ErrorCategory.SYSTEM_ERROR;
    }
  }

  private static determineSeverity(type: ErrorType, error: any): ErrorSeverity {
    // Critical errors that break core functionality
    if (type === ErrorType.AUTHENTICATION && error?.code === 'auth_session_missing') {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity errors
    if (type === ErrorType.API && error?.status >= 500) return ErrorSeverity.HIGH;
    if (type === ErrorType.PERMISSION) return ErrorSeverity.HIGH;
    
    // Medium severity errors
    if (type === ErrorType.NETWORK) return ErrorSeverity.MEDIUM;
    if (type === ErrorType.AI_SERVICE) return ErrorSeverity.MEDIUM;
    if (type === ErrorType.STORAGE) return ErrorSeverity.MEDIUM;
    
    // Low severity errors
    if (type === ErrorType.VALIDATION) return ErrorSeverity.LOW;
    if (type === ErrorType.FORM) return ErrorSeverity.LOW;
    
    return ErrorSeverity.MEDIUM;
  }

  private static generateUserMessage(type: ErrorType, error: any, message: string): string {
    const messages = USER_ERROR_MESSAGES[type];
    if (!messages) return "An unexpected error occurred. Please try again.";

    // Check for specific error conditions
    if (type === ErrorType.NETWORK) {
      if (!navigator.onLine) return messages.offline;
      if (message.includes('timeout')) return messages.timeout;
      if (error?.status === 0) return messages.slow;
    }

    if (type === ErrorType.API) {
      if (error?.status === 429) return messages.rateLimit;
      if (error?.status >= 500) return messages.serverError;
      if (message.includes('maintenance')) return messages.maintenance;
    }

    if (type === ErrorType.AUTHENTICATION) {
      if (message.includes('expired')) return messages.expired;
      if (message.includes('invalid')) return messages.invalid;
      if (message.includes('required')) return messages.required;
    }

    if (type === ErrorType.VALIDATION) {
      if (message.includes('email')) return messages.email;
      if (message.includes('password')) return messages.password;
      if (message.includes('required')) return messages.required;
      if (message.includes('format')) return messages.format;
    }

    return messages.default;
  }

  private static isRetryable(type: ErrorType, error: any): boolean {
    // Network errors are usually retryable
    if (type === ErrorType.NETWORK) return true;
    
    // API errors depend on status code
    if (type === ErrorType.API) {
      if (error?.status >= 500) return true; // Server errors
      if (error?.status === 429) return true; // Rate limiting
      if (error?.status === 408) return true; // Request timeout
      return false;
    }
    
    // AI service errors are often retryable
    if (type === ErrorType.AI_SERVICE) return true;
    
    // Storage errors might be retryable
    if (type === ErrorType.STORAGE && error?.code !== 'file_too_large') return true;
    
    // Authentication and validation errors are not retryable
    return false;
  }

  private static determineAction(type: ErrorType, error: any): string {
    switch (type) {
      case ErrorType.NETWORK:
        return navigator.onLine ? 'retry' : 'check_connection';
      case ErrorType.AUTHENTICATION:
        return 'sign_in';
      case ErrorType.PERMISSION:
        return 'contact_admin';
      case ErrorType.VALIDATION:
        return 'fix_input';
      case ErrorType.API:
        return error?.status >= 500 ? 'retry_later' : 'retry';
      case ErrorType.AI_SERVICE:
        return 'retry';
      default:
        return 'retry';
    }
  }

  private static generateRecoveryActions(
    type: ErrorType, 
    error: any, 
    context?: Record<string, any>
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Always provide a retry action for retryable errors
    if (this.isRetryable(type, error)) {
      actions.push({
        id: 'retry',
        label: 'Try Again',
        description: 'Retry the operation',
        action: () => window.location.reload(),
        primary: true
      });
    }

    // Type-specific actions
    switch (type) {
      case ErrorType.NETWORK:
        if (!navigator.onLine) {
          actions.push({
            id: 'check_connection',
            label: 'Check Connection',
            description: 'Verify your internet connection',
            action: () => window.open('https://www.google.com', '_blank')
          });
        }
        break;

      case ErrorType.AUTHENTICATION:
        actions.push({
          id: 'sign_in',
          label: 'Sign In',
          description: 'Go to sign in page',
          action: () => window.location.href = '/auth',
          primary: true
        });
        break;

      case ErrorType.PERMISSION:
        actions.push({
          id: 'contact_support',
          label: 'Contact Support',
          description: 'Get help with permissions',
          action: () => window.location.href = '/contact'
        });
        break;

      case ErrorType.STORAGE:
        if (error?.code === 'file_too_large') {
          actions.push({
            id: 'choose_smaller_file',
            label: 'Choose Smaller File',
            description: 'Select a file under 5MB',
            action: () => {} // This would be handled by the component
          });
        }
        break;
    }

    // Always provide a way to go home
    actions.push({
      id: 'go_home',
      label: 'Go Home',
      description: 'Return to the main page',
      action: () => window.location.href = '/'
    });

    return actions;
  }

  private static sanitizeErrorDetails(error: any): any {
    // Remove sensitive information from error details
    const sanitized = { ...error };
    
    // Remove potential sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;
    
    return sanitized;
  }

  private static getSessionId(): string {
    // Generate or retrieve session ID for error tracking
    let sessionId = sessionStorage.getItem('error_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error_session_id', sessionId);
    }
    return sessionId;
  }

  private static addToHistory(error: AppError): void {
    this.errorHistory.unshift(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  private static logError(error: AppError): void {
    const logLevel = this.config.logLevel;
    const logMessage = `[${error.severity.toUpperCase()}] ${error.type}: ${error.message}`;
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(logMessage, error);
        break;
      case ErrorSeverity.HIGH:
        console.error(logMessage, error);
        break;
      case ErrorSeverity.MEDIUM:
        if (logLevel === 'debug' || logLevel === 'info' || logLevel === 'warn') {
          console.warn(logMessage, error);
        }
        break;
      case ErrorSeverity.LOW:
        if (logLevel === 'debug' || logLevel === 'info') {
          console.info(logMessage, error);
        }
        break;
    }
  }

  // Public methods for error history and statistics
  static getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  static getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentErrors: AppError[];
  } {
    const byType = {} as Record<ErrorType, number>;
    const bySeverity = {} as Record<ErrorSeverity, number>;
    
    this.errorHistory.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorHistory.length,
      byType,
      bySeverity,
      recentErrors: this.errorHistory.slice(0, 10)
    };
  }

  static clearHistory(): void {
    this.errorHistory = [];
  }
}

// Retry mechanism with exponential backoff
export class RetryManager {
  private static retryAttempts = new Map<string, number>();

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      retryCondition?: (error: any) => boolean;
      onRetry?: (attempt: number, error: any) => void;
      context?: Record<string, any>;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      retryCondition = (error) => this.isRetryableError(error),
      onRetry,
      context
    } = options;

    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Clear retry count on success
        if (context?.operationId) {
          this.retryAttempts.delete(context.operationId);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (attempt === maxRetries || !retryCondition(error)) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );
        
        // Track retry attempts
        if (context?.operationId) {
          this.retryAttempts.set(context.operationId, attempt + 1);
        }
        
        // Call retry callback
        onRetry?.(attempt + 1, error);
        
        console.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries}) in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  private static isRetryableError(error: any): boolean {
    // Network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) return true;
    if (error?.name === 'AbortError') return true;
    
    // HTTP status codes
    if (error?.status >= 500) return true; // Server errors
    if (error?.status === 429) return true; // Rate limiting
    if (error?.status === 408) return true; // Request timeout
    
    // Supabase specific errors
    if (error?.code === 'PGRST301') return true; // Connection error
    
    return false;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static getRetryCount(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0;
  }

  static clearRetryCount(operationId: string): void {
    this.retryAttempts.delete(operationId);
  }
}

// Circuit breaker for preventing cascading failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly name: string,
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 60000, // 1 minute
    private readonly monitorWindow = 300000 // 5 minutes
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log(`Circuit breaker ${this.name} transitioning to HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN - service temporarily unavailable`);
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
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`Circuit breaker ${this.name} recovered - state: CLOSED`);
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker ${this.name} opened due to ${this.failures} failures`);
    }
  }

  get isOpen(): boolean {
    return this.state === 'OPEN';
  }

  get status(): { state: string; failures: number; lastFailure: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime
    };
  }
}