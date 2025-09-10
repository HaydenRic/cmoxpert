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

export const validateEmail = (email: string): void => {
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