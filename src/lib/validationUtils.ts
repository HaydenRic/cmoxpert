```typescript
import { ErrorType } from './errorTypes';

// Enhanced validation utilities with better error messages
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Email validation with detailed feedback
export const validateEmail = (email: string, fieldName: string = 'Email'): void => {
  if (!email || email.trim() === '') {
    throw new ValidationError(`${fieldName} is required`, 'email', 'REQUIRED');
  }
  
  const trimmedEmail = email.trim();
  
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new ValidationError('Please enter a valid email address', 'email', 'INVALID_FORMAT', trimmedEmail);
  }
  
  // Additional checks
  if (trimmedEmail.length > 254) {
    throw new ValidationError('Email address is too long', 'email', 'TOO_LONG', trimmedEmail);
  }
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = trimmedEmail.split('@')[1]?.toLowerCase();
  const suggestions = [];
  
  if (domain) {
    // Check for common typos in popular domains
    if (domain.includes('gmial') || domain.includes('gmai')) {
      suggestions.push('gmail.com');
    }
    if (domain.includes('yahooo') || domain.includes('yaho')) {
      suggestions.push('yahoo.com');
    }
    
    if (suggestions.length > 0) {
      throw new ValidationError(
        `Did you mean ${suggestions[0]}?`, 
        'email', 
        'POSSIBLE_TYPO', 
        trimmedEmail
      );
    }
  }
};

// Password validation with strength checking
export const validatePassword = (password: string, fieldName: string = 'Password'): void => {
  if (!password) {
    throw new ValidationError(`${fieldName} is required`, 'password', 'REQUIRED');
  }
  
  if (password.length < 8) {
    throw new ValidationError(
      'Password must be at least 8 characters long', 
      'password', 
      'TOO_SHORT',
      { length: password.length, required: 8 }
    );
  }
  
  if (password.length > 128) {
    throw new ValidationError('Password is too long (max 128 characters)', 'password', 'TOO_LONG');
  }
  
  // Check for required character types
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    throw new ValidationError(
      'Password must contain both letters and numbers', 
      'password', 
      'WEAK',
      { hasLetter, hasNumber, hasSpecial }
    );
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    throw new ValidationError(
      'Please choose a more secure password', 
      'password', 
      'TOO_COMMON'
    );
  }
};

// Required field validation
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase().replace(' ', '_'), 'REQUIRED');
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName.toLowerCase().replace(' ', '_'), 'EMPTY');
  }
  
  if (Array.isArray(value) && value.length === 0) {
    throw new ValidationError(`${fieldName} must have at least one item`, fieldName.toLowerCase().replace(' ', '_'), 'EMPTY_ARRAY');
  }
};

// URL validation with protocol checking
export const validateUrl = (url: string, fieldName: string = 'URL'): void => {
  if (!url || url.trim() === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName.toLowerCase().replace(' ', '_'), 'REQUIRED');
  }
  
  const trimmedUrl = url.trim();
  
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new ValidationError(
        'URL must start with http:// or https://', 
        fieldName.toLowerCase().replace(' ', '_'), 
        'INVALID_PROTOCOL'
      );
    }
    
    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      throw new ValidationError(
        'Please enter a valid domain name', 
        fieldName.toLowerCase().replace(' ', '_'), 
        'INVALID_HOSTNAME'
      );
    }
    
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    // Try to fix common URL issues
    let fixedUrl = trimmedUrl;
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      fixedUrl = 'https://' + trimmedUrl;
      
      try {
        new URL(fixedUrl);
        throw new ValidationError(
          `Did you mean ${fixedUrl}?`, 
          fieldName.toLowerCase().replace(' ', '_'), 
          'MISSING_PROTOCOL',
          fixedUrl
        );
      } catch {
        // If fixing doesn't work, throw original error
      }
    }
    
    throw new ValidationError(
      `Please enter a valid ${fieldName.toLowerCase()}`, 
      fieldName.toLowerCase().replace(' ', '_'), 
      'INVALID_FORMAT',
      trimmedUrl
    );
  }
};

// File validation
export const validateFile = (
  file: File, 
  options?: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }
): void => {
  if (!file) {
    throw new ValidationError('Please select a file', 'file', 'REQUIRED');
  }
  
  // Size validation
  if (options?.maxSize && file.size > options.maxSize) {
    const maxSizeMB = options.maxSize / 1024 / 1024;
    const fileSizeMB = file.size / 1024 / 1024;
    throw new ValidationError(
      `File is too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${maxSizeMB}MB`,
      'file',
      'FILE_TOO_LARGE',
      { size: file.size, maxSize: options.maxSize }
    );
  }
  
  // Type validation
  if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
      'file',
      'INVALID_FILE_TYPE',
      { type: file.type, allowedTypes: options.allowedTypes }
    );
  }
  
  // Extension validation
  if (options?.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      throw new ValidationError(
        `Invalid file extension. Allowed extensions: ${options.allowedExtensions.join(', ')}`,
        'file',
        'INVALID_EXTENSION',
        { extension, allowedExtensions: options.allowedExtensions }
      );
    }
  }
};

// Business logic validation
export const validateClientData = (data: {
  name?: string;
  domain?: string;
  industry?: string;
}): void => {
  validateRequired(data.name, 'Client name');
  validateRequired(data.domain, 'Domain');
  
  if (data.name && data.name.length > 100) {
    throw new ValidationError('Client name is too long (max 100 characters)', 'name', 'TOO_LONG');
  }
  
  if (data.domain) {
    validateUrl(data.domain, 'Domain');
  }
  
  if (data.industry && data.industry.length > 50) {
    throw new ValidationError('Industry is too long (max 50 characters)', 'industry', 'TOO_LONG');
  }
};

export const validateKPIData = (data: {
  name?: string;
  value?: number;
  target?: number;
  unit?: string;
  period?: string;
}): void => {
  validateRequired(data.name, 'KPI name');
  validateRequired(data.value, 'Current value');
  
  if (typeof data.value !== 'number' || isNaN(data.value)) {
    throw new ValidationError('Current value must be a valid number', 'value', 'INVALID_NUMBER');
  }
  
  if (data.value < 0) {
    throw new ValidationError('Current value cannot be negative', 'value', 'NEGATIVE_VALUE');
  }
  
  if (data.target !== undefined && data.target !== null) {
    if (typeof data.target !== 'number' || isNaN(data.target)) {
      throw new ValidationError('Target value must be a valid number', 'target', 'INVALID_NUMBER');
    }
    
    if (data.target < 0) {
      throw new ValidationError('Target value cannot be negative', 'target', 'NEGATIVE_VALUE');
    }
  }
  
  const validPeriods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  if (data.period && !validPeriods.includes(data.period)) {
    throw new ValidationError(
      `Invalid period. Must be one of: ${validPeriods.join(', ')}`,
      'period',
      'INVALID_OPTION'
    );
  }
};

// Content validation for AI generation
export const validateContentGeneration = (data: {
  title?: string;
  contentType?: string;
  tone?: string;
  length?: string;
}): void => {
  validateRequired(data.title, 'Title');
  validateRequired(data.contentType, 'Content type');
  
  if (data.title && data.title.length > 200) {
    throw new ValidationError('Title is too long (max 200 characters)', 'title', 'TOO_LONG');
  }
  
  const validContentTypes = ['blog_post', 'social_media_post', 'email_copy', 'ad_copy', 'landing_page', 'press_release'];
  if (data.contentType && !validContentTypes.includes(data.contentType)) {
    throw new ValidationError(
      `Invalid content type. Must be one of: ${validContentTypes.join(', ')}`,
      'contentType',
      'INVALID_OPTION'
    );
  }
  
  const validTones = ['professional', 'friendly', 'authoritative', 'conversational', 'urgent', 'educational'];
  if (data.tone && !validTones.includes(data.tone)) {
    throw new ValidationError(
      `Invalid tone. Must be one of: ${validTones.join(', ')}`,
      'tone',
      'INVALID_OPTION'
    );
  }
  
  const validLengths = ['short', 'medium', 'long'];
  if (data.length && !validLengths.includes(data.length)) {
    throw new ValidationError(
      `Invalid length. Must be one of: ${validLengths.join(', ')}`,
      'length',
      'INVALID_OPTION'
    );
  }
};
```