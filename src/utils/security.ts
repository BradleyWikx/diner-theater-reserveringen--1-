// Security and validation utilities for the admin system

// CSRF Token Management
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = (token: string) => {
  sessionStorage.setItem('csrf_token', token);
};

export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Basic XSS prevention
    .replace(/['"]/g, '') // SQL injection prevention
    .trim();
};

export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+31|0031|0)[1-9][0-9]{8}$/; // Dutch phone numbers
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Rate Limiting
interface RateLimit {
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
}

const rateLimits = new Map<string, RateLimit>();

export const checkRateLimit = (
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingAttempts: number; resetTime?: number } => {
  const now = Date.now();
  const limit = rateLimits.get(identifier) || { attempts: 0, lastAttempt: 0, blocked: false };
  
  // Reset if window has passed
  if (now - limit.lastAttempt > windowMs) {
    limit.attempts = 0;
    limit.blocked = false;
  }
  
  // Check if blocked
  if (limit.blocked || limit.attempts >= maxAttempts) {
    limit.blocked = true;
    rateLimits.set(identifier, { ...limit, lastAttempt: now });
    
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: limit.lastAttempt + windowMs
    };
  }
  
  // Increment attempts
  limit.attempts++;
  limit.lastAttempt = now;
  rateLimits.set(identifier, limit);
  
  return {
    allowed: true,
    remainingAttempts: maxAttempts - limit.attempts
  };
};

// Data Validation Schemas
export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'email' | 'phone' | 'date';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
}

export const validateData = (data: any, schema: ValidationSchema): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    
    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      return;
    }
    
    // Skip other validations if value is empty and not required
    if (!value) return;
    
    // Type validation
    switch (rules.type) {
      case 'email':
        if (!validateEmail(value)) {
          errors.push(`${field} must be a valid email address`);
        }
        break;
      case 'phone':
        if (!validatePhoneNumber(value)) {
          errors.push(`${field} must be a valid phone number`);
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        }
        break;
      case 'date':
        if (isNaN(Date.parse(value))) {
          errors.push(`${field} must be a valid date`);
        }
        break;
    }
    
    // Length validation for strings
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters long`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
      }
    }
    
    // Number range validation
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be no more than ${rules.max}`);
      }
    }
    
    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push(`${field} has an invalid format`);
    }
    
    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      errors.push(`${field} failed custom validation`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Common validation schemas
export const reservationValidationSchema: ValidationSchema = {
  customerName: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
  },
  email: {
    required: true,
    type: 'email'
  },
  phone: {
    required: true,
    type: 'phone'
  },
  guests: {
    required: true,
    type: 'number',
    min: 1,
    max: 20
  },
  date: {
    required: true,
    type: 'date'
  },
  showName: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200
  }
};

export const userValidationSchema: ValidationSchema = {
  email: {
    required: true,
    type: 'email'
  },
  displayName: {
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 50
  },
  role: {
    required: true,
    type: 'string',
    custom: (value) => ['admin', 'moderator', 'viewer'].includes(value)
  }
};

// Audit Logging
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  timestamp: string;
  ip: string;
  userAgent: string;
  success: boolean;
  error?: string;
}

export const createAuditLog = (
  userId: string,
  userEmail: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  success: boolean = true,
  error?: string
): AuditLog => {
  return {
    id: crypto.randomUUID(),
    userId,
    userEmail,
    action,
    resource,
    resourceId,
    details: details || {},
    timestamp: new Date().toISOString(),
    ip: 'unknown', // Would need server-side implementation
    userAgent: navigator.userAgent,
    success,
    error
  };
};

export const logAuditEvent = (auditLog: AuditLog) => {
  // Store in sessionStorage for demo (production should use secure backend)
  const existingLogs = JSON.parse(sessionStorage.getItem('auditLogs') || '[]');
  existingLogs.push(auditLog);
  
  // Keep only last 1000 logs
  if (existingLogs.length > 1000) {
    existingLogs.splice(0, existingLogs.length - 1000);
  }
  
  sessionStorage.setItem('auditLogs', JSON.stringify(existingLogs));
  
  // Also log to console for development
  console.log('🔍 Audit Log:', auditLog);
};

// Security Headers Helper
export const getSecurityHeaders = (): HeadersInit => {
  const csrfToken = getCSRFToken();
  
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(csrfToken && { 'X-CSRF-Token': csrfToken })
  };
};

// Secure API Request Wrapper
export const secureApiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  auditInfo?: { userId: string; userEmail: string; action: string; resource: string }
): Promise<T> => {
  const csrfToken = getCSRFToken();
  if (!csrfToken) {
    throw new Error('CSRF token not found. Please refresh and try again.');
  }
  
  const headers = {
    ...getSecurityHeaders(),
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Log successful API call
    if (auditInfo) {
      logAuditEvent(createAuditLog(
        auditInfo.userId,
        auditInfo.userEmail,
        auditInfo.action,
        auditInfo.resource,
        undefined,
        { url, method: options.method || 'GET' },
        true
      ));
    }
    
    return data;
  } catch (error) {
    // Log failed API call
    if (auditInfo) {
      logAuditEvent(createAuditLog(
        auditInfo.userId,
        auditInfo.userEmail,
        auditInfo.action,
        auditInfo.resource,
        undefined,
        { url, method: options.method || 'GET', error: error.message },
        false,
        error.message
      ));
    }
    
    throw error;
  }
};

// Password Security
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');
  
  // Common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 2;
    feedback.push('Avoid common patterns');
  }
  
  const isStrong = score >= 4;
  
  return { score, feedback, isStrong };
};

export default {
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  sanitizeInput,
  sanitizeHtml,
  validateEmail,
  validatePhoneNumber,
  checkRateLimit,
  validateData,
  createAuditLog,
  logAuditEvent,
  getSecurityHeaders,
  secureApiRequest,
  checkPasswordStrength,
  reservationValidationSchema,
  userValidationSchema
};
