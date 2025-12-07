import { supabase } from './supabase';

export interface ErrorLog {
  error_type: string;
  error_message: string;
  error_code?: string;
  stack_trace?: string;
  user_id?: string;
  page_url: string;
  user_agent: string;
  metadata?: Record<string, unknown>;
}

// Create error_logs table structure (migration needed)
export async function logError(error: Error | unknown, context?: Record<string, unknown>): Promise<void> {
  try {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    const errorLog: ErrorLog = {
      error_type: errorObj.name || 'UnknownError',
      error_message: errorObj.message || 'An unknown error occurred',
      stack_trace: errorObj.stack,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      metadata: context
    };

    // Try to get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      errorLog.user_id = user.id;
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }

    // Insert into database
    await supabase.from('error_logs').insert(errorLog);
  } catch (loggingError) {
    // Don't let logging errors break the app
    console.error('Failed to log error:', loggingError);
  }
}

export class AppError extends Error {
  code: string;
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, code: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed. Please check your connection.') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed. Please try again.') {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed. Please log in again.') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'The requested resource was not found.') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export function getUserFriendlyMessage(error: Error | unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    if (error.message.includes('duplicate') || error.message.includes('unique constraint')) {
      return 'This information already exists in our system.';
    }
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return 'You don\'t have permission to perform this action.';
    }

    // Return generic message for unknown errors
    return 'Something went wrong. Please try again or contact support if the problem persists.';
  }

  return 'An unexpected error occurred. Please try again.';
}

export async function handleError(
  error: Error | unknown,
  context?: Record<string, unknown>,
  showToUser: boolean = true
): Promise<string> {
  // Log the error
  await logError(error, context);

  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(error);

  // Show to user if requested
  if (showToUser && import.meta.env.DEV === false) {
    // In production, could integrate with toast notification system
    console.info('User message:', userMessage);
  }

  return userMessage;
}
