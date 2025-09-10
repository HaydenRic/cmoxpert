import React, { useState, useRef, useCallback } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea' | 'select';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  className?: string;
}

export function AccessibleFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  description,
  options = [],
  rows = 3,
  min,
  max,
  step,
  pattern,
  autoComplete,
  className
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  const helpId = `${fieldId}-help`;

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const baseInputClasses = cn(
    "w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500",
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : focused
      ? "border-slate-400"
      : "border-slate-300 focus:border-slate-500",
    disabled && "bg-slate-50 text-slate-500 cursor-not-allowed",
    className
  );

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange: handleChange,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      disabled,
      required,
      placeholder,
      autoComplete,
      'aria-invalid': !!error,
      'aria-describedby': cn(
        description && descriptionId,
        error && errorId
      ).trim() || undefined,
      className: baseInputClasses
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            ref={inputRef as React.RefObject<HTMLSelectElement>}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            {...commonProps}
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            min={min}
            max={max}
            step={step}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={getInputType()}
            pattern={pattern}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Description */}
      {description && (
        <p id={descriptionId} className="text-sm text-slate-600">
          {description}
        </p>
      )}

      {/* Input container */}
      <div className="relative">
        {renderInput()}

        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Field status indicator */}
        {(error || (required && value)) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id={errorId} className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Character count for text inputs */}
      {(type === 'text' || type === 'textarea') && max && (
        <div className="text-xs text-slate-500 text-right">
          {value.length}/{max} characters
        </div>
      )}
    </div>
  );
}

// Accessible form container with validation
interface AccessibleFormProps {
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  noValidate?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AccessibleForm({
  onSubmit,
  children,
  className,
  noValidate = true,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  disabled = false
}: AccessibleFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (loading || disabled) return;

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [onSubmit, loading, disabled]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate={noValidate}
      className={cn("space-y-6", className)}
    >
      {children}

      {/* Form actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading || disabled}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}