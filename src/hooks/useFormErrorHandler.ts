```typescript
import { useState, useCallback } from 'react';
import { AppError } from '../lib/errorTypes';
import { ErrorHandler } from '../lib/errorHandler';
import { 
  validateEmail, 
  validatePassword, 
  validateRequired, 
  validateUrl,
  validateFile,
  ValidationError
} from '../lib/validationUtils';

interface FormErrorState {
  errors: Record<string, AppError[]>;
  isValid: boolean;
  hasErrors: boolean;
}

export function useFormErrorHandler() {
  const [formErrors, setFormErrors] = useState<Record<string, AppError[]>>({});

  const addFieldError = useCallback(async (field: string, error: any) => {
    const appError = await ErrorHandler.handleError(error, {
      field,
      component: 'form',
      operation: 'validation'
    });

    setFormErrors(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), appError]
    }));

    return appError;
  }, []);

  const clearFieldErrors = useCallback((field: string) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearFieldError = useCallback((field: string, errorId: string) => {
    setFormErrors(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(error => error.id !== errorId)
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  const validateField = useCallback(async (
    field: string,
    value: any,
    validators: Array<(value: any) => void>
  ): Promise<boolean> => {
    // Clear existing errors for this field
    clearFieldErrors(field);

    try {
      // Run all validators
      for (const validator of validators) {
        validator(value);
      }
      return true;
    } catch (error) {
      await addFieldError(field, error);
      return false;
    }
  }, [addFieldError, clearFieldErrors]);

  const validateForm = useCallback(async (
    formData: Record<string, any>,
    validationRules: Record<string, Array<(value: any) => void>>
  ): Promise<boolean> => {
    clearAllErrors();

    const validationPromises = Object.entries(validationRules).map(
      ([field, validators]) => validateField(field, formData[field], validators)
    );

    const results = await Promise.all(validationPromises);
    return results.every(result => result);
  }, [validateField, clearAllErrors]);

  // Pre-built validation functions
  const validators = {
    email: (value: string) => validateEmail(value),
    password: (value: string) => validatePassword(value),
    required: (fieldName: string) => (value: any) => validateRequired(value, fieldName),
    url: (fieldName: string) => (value: string) => validateUrl(value, fieldName),
    file: (options?: { maxSize?: number; allowedTypes?: string[] }) => 
      (value: File) => validateFile(value, options),
    minLength: (min: number, fieldName: string) => (value: string) => {
      if (value && value.length < min) {
        throw new ValidationError(
          `${fieldName} must be at least ${min} characters`,
          fieldName.toLowerCase().replace(' ', '_'),
          'TOO_SHORT'
        );
      }
    },
    maxLength: (max: number, fieldName: string) => (value: string) => {
      if (value && value.length > max) {
        throw new ValidationError(
          `${fieldName} must be no more than ${max} characters`,
          fieldName.toLowerCase().replace(' ', '_'),
          'TOO_LONG'
        );
      }
    },
    numeric: (fieldName: string) => (value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        const num = Number(value);
        if (isNaN(num)) {
          throw new ValidationError(
            `${fieldName} must be a valid number`,
            fieldName.toLowerCase().replace(' ', '_'),
            'INVALID_NUMBER'
          );
        }
      }
    },
    positive: (fieldName: string) => (value: number) => {
      if (value !== null && value !== undefined && value < 0) {
        throw new ValidationError(
          `${fieldName} must be positive`,
          fieldName.toLowerCase().replace(' ', '_'),
          'NEGATIVE_VALUE'
        );
      }
    },
    oneOf: (options: any[], fieldName: string) => (value: any) => {
      if (value && !options.includes(value)) {
        throw new ValidationError(
          `${fieldName} must be one of: ${options.join(', ')}`,
          fieldName.toLowerCase().replace(' ', '_'),
          'INVALID_OPTION'
        );
      }
    }
  };

  const getFormState = useCallback((): FormErrorState => {
    const hasErrors = Object.values(formErrors).some(fieldErrors => fieldErrors.length > 0);
    return {
      errors: formErrors,
      isValid: !hasErrors,
      hasErrors
    };
  }, [formErrors]);

  return {
    formErrors,
    addFieldError,
    clearFieldErrors,
    clearFieldError,
    clearAllErrors,
    validateField,
    validateForm,
    validators,
    getFormState
  };
}

// Real-time validation hook
export function useRealTimeValidation(
  initialData: Record<string, any> = {},
  validationRules: Record<string, Array<(value: any) => void>> = {}
) {
  const [formData, setFormData] = useState(initialData);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const { validateField, formErrors, clearFieldErrors, getFormState } = useFormErrorHandler();

  const updateField = useCallback(async (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Only validate if field has been touched
    if (touchedFields.has(field) && validationRules[field]) {
      await validateField(field, value, validationRules[field]);
    }
  }, [validateField, validationRules, touchedFields]);

  const touchField = useCallback((field: string) => {
    setTouchedFields(prev => new Set([...prev, field]));
  }, []);

  const validateTouchedFields = useCallback(async (): Promise<boolean> => {
    const validationPromises = Array.from(touchedFields).map(field => {
      if (validationRules[field]) {
        return validateField(field, formData[field], validationRules[field]);
      }
      return Promise.resolve(true);
    });

    const results = await Promise.all(validationPromises);
    return results.every(result => result);
  }, [touchedFields, validationRules, formData, validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setTouchedFields(new Set());
    clearFieldErrors('');
  }, [initialData, clearFieldErrors]);

  return {
    formData,
    formErrors,
    touchedFields,
    updateField,
    touchField,
    validateTouchedFields,
    resetForm,
    formState: getFormState()
  };
}
```