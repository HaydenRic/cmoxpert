// Comprehensive error type definitions and classifications
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  STORAGE = 'storage',
  AI_SERVICE = 'ai_service',
  SUPABASE = 'supabase',
  FORM = 'form',
  FILE_UPLOAD = 'file_upload',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  USER_ERROR = 'user_error',
  SYSTEM_ERROR = 'system_error',
  EXTERNAL_ERROR = 'external_error',
  CONFIGURATION_ERROR = 'configuration_error'
}

export interface AppError {
  id: string;
  type: ErrorType;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: unknown;
  timestamp: number;
  userId?: string;
  context?: Record<string, unknown>;
  retryable: boolean;
  action?: string;
  recoveryActions?: RecoveryAction[];
  metadata?: {
    component?: string;
    operation?: string;
    url?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

export interface ErrorHandlerConfig {
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableOfflineMode: boolean;
  enableUserFeedback: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}