```typescript
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
  details?: any;
  timestamp: number;
  userId?: string;
  context?: Record<string, any>;
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

// Error classification patterns
export const ERROR_PATTERNS = {
  network: [
    /failed to fetch/i,
    /network error/i,
    /connection refused/i,
    /timeout/i,
    /err_network/i,
    /err_internet_disconnected/i
  ],
  api: [
    /api error/i,
    /server error/i,
    /internal server error/i,
    /service unavailable/i,
    /bad gateway/i,
    /gateway timeout/i
  ],
  authentication: [
    /unauthorized/i,
    /invalid.*credentials/i,
    /authentication.*failed/i,
    /token.*expired/i,
    /session.*expired/i,
    /access.*denied/i
  ],
  validation: [
    /validation.*failed/i,
    /invalid.*format/i,
    /required.*field/i,
    /missing.*parameter/i,
    /invalid.*input/i
  ],
  supabase: [
    /pgrst/i,
    /postgrest/i,
    /row.*level.*security/i,
    /rls.*policy/i,
    /foreign.*key.*constraint/i
  ]
};

// User-friendly error messages
export const USER_ERROR_MESSAGES = {
  [ErrorType.NETWORK]: {
    default: "Unable to connect to our servers. Please check your internet connection and try again.",
    offline: "You appear to be offline. Please check your internet connection.",
    timeout: "The request is taking longer than expected. Please try again.",
    slow: "Your connection seems slow. This might take a moment longer."
  },
  [ErrorType.API]: {
    default: "Our servers are experiencing issues. Please try again in a few moments.",
    rateLimit: "Too many requests. Please wait a moment and try again.",
    serverError: "Server error occurred. Our team has been notified.",
    maintenance: "We're performing maintenance. Please try again shortly."
  },
  [ErrorType.AUTHENTICATION]: {
    default: "Authentication failed. Please sign in again.",
    expired: "Your session has expired. Please sign in again.",
    invalid: "Invalid credentials. Please check your email and password.",
    required: "Please sign in to access this feature."
  },
  [ErrorType.VALIDATION]: {
    default: "Please check your input and try again.",
    email: "Please enter a valid email address.",
    password: "Password must be at least 8 characters with letters and numbers.",
    required: "Please fill in all required fields.",
    format: "Please check the format of your input."
  },
  [ErrorType.PERMISSION]: {
    default: "You don't have permission to perform this action.",
    admin: "This feature requires administrator privileges.",
    owner: "You can only access your own data."
  },
  [ErrorType.STORAGE]: {
    default: "File operation failed. Please try again.",
    size: "File is too large. Please choose a smaller file.",
    type: "Invalid file type. Please choose a supported format.",
    quota: "Storage quota exceeded. Please free up space."
  },
  [ErrorType.AI_SERVICE]: {
    default: "AI service is temporarily unavailable. Please try again.",
    quota: "AI service quota exceeded. Please try again later.",
    invalid: "AI request failed. Please try with different parameters."
  }
};
```