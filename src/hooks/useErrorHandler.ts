```typescript
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorHandler, RetryManager, CircuitBreaker } from '../lib/errorHandler';
import { OfflineManager, GracefulDegradation } from '../lib/offlineManager';
import { useErrorToast } from '../components/ui/ErrorToast';
import { AppError, ErrorType, ErrorSeverity } from '../lib/errorTypes';

// Circuit breakers for different services
const circuitBreakers = {
  supabase: new CircuitBreaker('supabase', 5, 60000),
  ai: new CircuitBreaker('ai_services', 3, 120000),
  storage: new CircuitBreaker('storage', 5, 30000)
};

export function useErrorHandler() {
  const { showError } = useErrorToast();
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback(async (
    error: any, 
    context?: Record<string, any>
  ) => {
    const appError = await ErrorHandler.handleError(error, context);
    
    // Show toast notification with recovery actions
    const toastId = showError(appError, {
      autoClose: appError.severity === ErrorSeverity.LOW,
      duration: appError.severity === ErrorSeverity.CRITICAL ? 0 : undefined
    });

    return { appError, toastId };
  }, [showError]);

  const handleAction = useCallback((error: AppError, action: string) => {
    switch (action) {
      case 'sign_in':
        navigate('/auth');
        break;
      case 'contact_support':
        navigate('/contact');
        break;
      case 'check_email':
        window.open('mailto:', '_blank');
        break;
      case 'go_back':
        navigate(-1);
        break;
      case 'go_home':
        navigate('/');
        break;
      case 'reload':
        window.location.reload();
        break;
      default:
        console.log('Unhandled action:', action);
    }
  }, [navigate]);

  const safeExecute = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      context?: Record<string, any>;
      fallback?: T;
      cacheKey?: string;
      feature?: string;
      circuitBreaker?: keyof typeof circuitBreakers;
      timeout?: number;
    }
  ): Promise<{ data: T | null; error: AppError | null }> => {
    try {
      let result: T;

      // Use circuit breaker if specified
      if (options?.circuitBreaker) {
        const breaker = circuitBreakers[options.circuitBreaker];
        result = await breaker.execute(operation);
      } else {
        result = await operation();
      }

      // Cache successful result
      if (options?.cacheKey) {
        OfflineManager.cacheData(options.cacheKey, result);
      }

      return { data: result, error: null };
    } catch (error) {
      const appError = await handleError(error, options?.context);
      
      // Try fallback or cached data
      if (options?.fallback !== undefined) {
        return { data: options.fallback, error: appError };
      }
      
      if (options?.cacheKey) {
        const cached = OfflineManager.getCachedData<T>(options.cacheKey);
        if (cached) {
          return { data: cached, error: appError };
        }
      }
      
      return { data: null, error: appError };
    }
  }, [handleError]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      context?: Record<string, any>;
      onRetry?: (attempt: number, error: any) => void;
    }
  ): Promise<T> => {
    setIsRetrying(true);
    
    try {
      return await RetryManager.withRetry(operation, {
        maxRetries: options?.maxRetries,
        onRetry: options?.onRetry,
        context: options?.context
      });
    } catch (error) {
      await handleError(error, options?.context);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [handleError]);

  const executeWithGracefulDegradation = useCallback(async <T>(
    operation: () => Promise<T>,
    fallback: T | (() => T),
    options?: {
      feature?: string;
      cacheKey?: string;
      timeout?: number;
      context?: Record<string, any>;
    }
  ): Promise<T> => {
    try {
      return await GracefulDegradation.withFallback(
        operation,
        fallback,
        options
      );
    } catch (error) {
      await handleError(error, options?.context);
      return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
    }
  }, [handleError]);

  return {
    handleError,
    handleAction,
    safeExecute,
    executeWithRetry,
    executeWithGracefulDegradation,
    isRetrying
  };
}

// Specialized hooks for common operations
export function useApiCall() {
  const { safeExecute, executeWithRetry } = useErrorHandler();

  const apiCall = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      context?: Record<string, any>;
      retries?: number;
      fallback?: T;
      cacheKey?: string;
    }
  ): Promise<{ data: T | null; error: AppError | null }> => {
    if (options?.retries && options.retries > 0) {
      try {
        const data = await executeWithRetry(operation, {
          maxRetries: options.retries,
          context: options.context
        });
        return { data, error: null };
      } catch (error) {
        return { data: options?.fallback || null, error: error as AppError };
      }
    }

    return safeExecute(operation, {
      context: options?.context,
      fallback: options?.fallback,
      cacheKey: options?.cacheKey,
      circuitBreaker: 'supabase'
    });
  }, [safeExecute, executeWithRetry]);

  return { apiCall };
}

export function useFormValidation() {
  const { handleError } = useErrorHandler();

  const validateForm = useCallback(async (
    validationFn: () => void,
    context?: Record<string, any>
  ): Promise<boolean> => {
    try {
      validationFn();
      return true;
    } catch (error) {
      await handleError(error, { 
        ...context, 
        type: 'form_validation',
        component: 'form'
      });
      return false;
    }
  }, [handleError]);

  const validateField = useCallback(async (
    fieldName: string,
    value: any,
    validators: Array<(value: any) => void>,
    context?: Record<string, any>
  ): Promise<boolean> => {
    try {
      validators.forEach(validator => validator(value));
      return true;
    } catch (error) {
      await handleError(error, {
        ...context,
        type: 'field_validation',
        field: fieldName,
        value: typeof value === 'string' ? value.substring(0, 100) : value
      });
      return false;
    }
  }, [handleError]);

  return { validateForm, validateField };
}

export function useFileUpload() {
  const { handleError, safeExecute } = useErrorHandler();

  const uploadFile = useCallback(async (
    file: File,
    uploadFn: (file: File) => Promise<any>,
    options?: {
      maxSize?: number;
      allowedTypes?: string[];
      context?: Record<string, any>;
    }
  ) => {
    // Validate file before upload
    try {
      if (options?.maxSize && file.size > options.maxSize) {
        throw new Error(\`File too large. Maximum size is ${options.maxSize / 1024 / 1024}MB`);
      }
      
      if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(\`Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`);
      }
    } catch (error) {
      return await handleError(error, {
        ...options?.context,
        type: 'file_validation',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    }

    return safeExecute(() => uploadFn(file), {
      context: {
        ...options?.context,
        operation: 'file_upload',
        fileName: file.name,
        fileSize: file.size
      },
      circuitBreaker: 'storage'
    });
  }, [handleError, safeExecute]);

  return { uploadFile };
}
```