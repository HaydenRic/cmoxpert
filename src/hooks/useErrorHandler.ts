import { useCallback } from 'react';
import { useErrorToast } from '../components/ui/ErrorToast';
import { ErrorHandler, AppError, safeApiCall, withRetry } from '../lib/errorHandling';
import { useNavigate } from 'react-router-dom';

export function useErrorHandler() {
  const { showError } = useErrorToast();
  const navigate = useNavigate();

  const handleError = useCallback(async (error: any, context?: Record<string, any>) => {
    const appError = await ErrorHandler.handleError(error, context);
    
    // Show toast notification
    const toastId = showError(appError, {
      autoClose: appError.severity === 'low',
      duration: appError.severity === 'critical' ? 10000 : 5000
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
        // Could open email client or show instructions
        window.open('mailto:', '_blank');
        break;
      case 'go_back':
        navigate(-1);
        break;
      default:
        console.log('Unhandled action:', action);
    }
  }, [navigate]);

  const safeExecute = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<{ data: T | null; error: AppError | null }> => {
    return safeApiCall(operation, context);
  }, []);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: Record<string, any>
  ): Promise<T> => {
    try {
      return await withRetry(operation, maxRetries, context);
    } catch (error) {
      await handleError(error, context);
      throw error;
    }
  }, [handleError]);

  return {
    handleError,
    handleAction,
    safeExecute,
    executeWithRetry
  };
}

// Specific hooks for common operations
export function useApiCall() {
  const { handleError, safeExecute } = useErrorHandler();

  const apiCall = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      context?: Record<string, any>;
      showError?: boolean;
      retries?: number;
    }
  ): Promise<{ data: T | null; error: AppError | null }> => {
    const { data, error } = await safeExecute(operation, options?.context);
    
    if (error && options?.showError !== false) {
      await handleError(error, options?.context);
    }
    
    return { data, error };
  }, [handleError, safeExecute]);

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
      await handleError(error, { ...context, type: 'form_validation' });
      return false;
    }
  }, [handleError]);

  return { validateForm };
}