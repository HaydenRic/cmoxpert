# API Error Handling Examples

## Overview

This document provides comprehensive examples of handling errors when integrating with the cmoxpert API.

## Error Response Structure

All API errors follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "additional": "context"
    },
    "timestamp": "2025-01-08T14:30:00Z",
    "request_id": "req_123456789"
  }
}
```

## Common Error Scenarios

### 1. Authentication Errors

#### Missing Token
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-market-analysis \
  -H "Content-Type: application/json" \
  -d '{"clientId":"123","domain":"example.com"}'
```

**Response (401):**
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Missing authorization header",
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

#### Invalid Token
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"123","domain":"example.com"}'
```

**Response (401):**
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token",
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

### 2. Validation Errors

#### Missing Required Fields
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer valid_token" \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

**Response (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: reportId, clientId",
    "details": {
      "missing_fields": ["reportId", "clientId"],
      "provided_fields": ["domain"]
    },
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

#### Invalid Domain Format
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer valid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId":"550e8400-e29b-41d4-a716-446655440000",
    "clientId":"550e8400-e29b-41d4-a716-446655440001",
    "domain":"invalid-domain"
  }'
```

**Response (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid domain format",
    "details": {
      "field": "domain",
      "value": "invalid-domain",
      "expected_format": "Valid domain name (e.g., example.com)"
    },
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

### 3. Permission Errors

#### Client Access Denied
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer valid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId":"550e8400-e29b-41d4-a716-446655440000",
    "clientId":"other_user_client_id",
    "domain":"example.com"
  }'
```

**Response (403):**
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Client not found or access denied",
    "details": {
      "client_id": "other_user_client_id",
      "user_id": "current_user_id"
    },
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

### 4. Rate Limiting

#### Rate Limit Exceeded
```bash
# After making too many requests
curl -X POST https://your-project.supabase.co/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer valid_token" \
  -H "Content-Type: application/json" \
  -d '{"reportId":"123","clientId":"456","domain":"example.com"}'
```

**Response (429):**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait before trying again.",
    "details": {
      "limit": 5,
      "window": "1 hour",
      "reset_at": "2025-01-08T15:30:00Z"
    },
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

### 5. Service Errors

#### AI Service Unavailable
```json
{
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "Failed to generate market analysis",
    "details": "OpenAI API timeout",
    "timestamp": "2025-01-08T14:30:00Z",
    "request_id": "req_123456789"
  }
}
```

#### Database Error
```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to save analysis results",
    "details": "Connection timeout",
    "timestamp": "2025-01-08T14:30:00Z",
    "request_id": "req_123456789"
  }
}
```

## Error Handling Best Practices

### 1. Retry Logic with Exponential Backoff

```javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return await response.json();
      }
      
      const error = await response.json();
      
      // Don't retry client errors (4xx) except rate limiting
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(error.error.message);
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw new Error(error.error.message);
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}
```

### 2. Error Classification

```javascript
function classifyError(error) {
  const { code, message } = error.error || {};
  
  switch (code) {
    case 'AUTHENTICATION_ERROR':
      return {
        type: 'auth',
        severity: 'high',
        action: 'redirect_to_login',
        userMessage: 'Please log in again to continue.'
      };
      
    case 'VALIDATION_ERROR':
      return {
        type: 'validation',
        severity: 'low',
        action: 'show_form_errors',
        userMessage: 'Please check your input and try again.'
      };
      
    case 'RATE_LIMIT_EXCEEDED':
      return {
        type: 'rate_limit',
        severity: 'medium',
        action: 'retry_after_delay',
        userMessage: 'Too many requests. Please wait a moment.'
      };
      
    case 'AI_SERVICE_ERROR':
      return {
        type: 'service',
        severity: 'high',
        action: 'retry_later',
        userMessage: 'AI service is temporarily unavailable.'
      };
      
    default:
      return {
        type: 'unknown',
        severity: 'medium',
        action: 'contact_support',
        userMessage: 'An unexpected error occurred.'
      };
  }
}
```

### 3. React Error Handling Hook

```typescript
import { useState, useCallback } from 'react';

export function useApiError() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApiCall = useCallback(async (apiCall: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCallWithRetry(apiCall);
      return result;
    } catch (err: any) {
      const classified = classifyError(err);
      setError(classified.userMessage);
      
      // Handle specific error actions
      switch (classified.action) {
        case 'redirect_to_login':
          window.location.href = '/auth';
          break;
        case 'retry_after_delay':
          setTimeout(() => setError(null), 5000);
          break;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { error, loading, handleApiCall, clearError: () => setError(null) };
}
```

### 4. Error Monitoring Integration

```javascript
// Sentry integration
import * as Sentry from '@sentry/browser';

function reportApiError(error, context) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'api_error');
    scope.setContext('api_call', context);
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}

// Usage
try {
  await apiCall();
} catch (error) {
  reportApiError(error, {
    endpoint: '/generate-market-analysis',
    method: 'POST',
    user_id: user.id
  });
  throw error;
}
```

## Testing Error Scenarios

### Unit Tests

```javascript
describe('API Error Handling', () => {
  test('should handle authentication errors', async () => {
    // Mock failed auth response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid token'
        }
      })
    });

    await expect(generateAnalysis('client_123', 'example.com'))
      .rejects.toThrow('Invalid token');
  });

  test('should retry on server errors', async () => {
    // Mock server error followed by success
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: { code: 'SERVER_ERROR', message: 'Internal error' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

    const result = await apiCallWithRetry('/test-endpoint', {});
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Tests

```bash
#!/bin/bash
# Test error scenarios

echo "Testing authentication error..."
curl -X POST http://localhost:54321/functions/v1/generate-market-analysis \
  -H "Content-Type: application/json" \
  -d '{"clientId":"123","domain":"example.com"}' \
  --fail-with-body || echo "✓ Auth error handled correctly"

echo "Testing validation error..."
curl -X POST http://localhost:54321/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}' \
  --fail-with-body || echo "✓ Validation error handled correctly"
```

## Error Recovery Strategies

### 1. Graceful Degradation

```javascript
async function getMarketInsights(clientId) {
  try {
    // Try to get fresh AI analysis
    return await generateAnalysis(clientId);
  } catch (error) {
    console.warn('AI analysis failed, falling back to cached data');
    
    // Fallback to cached analysis
    const cached = localStorage.getItem(`analysis_${clientId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Final fallback to basic data
    return {
      success: false,
      message: 'Analysis temporarily unavailable',
      fallback: true
    };
  }
}
```

### 2. Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async call(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const aiServiceBreaker = new CircuitBreaker(3, 30000);

async function generateAnalysisWithBreaker(clientId, domain) {
  return aiServiceBreaker.call(() => 
    generateAnalysis(clientId, domain)
  );
}
```

### 3. Offline Support

```javascript
class OfflineApiManager {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async apiCall(url, options) {
    if (!this.isOnline) {
      // Queue for later processing
      return new Promise((resolve, reject) => {
        this.queue.push({ url, options, resolve, reject });
      });
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (!this.isOnline) {
        // Network went offline during request
        return new Promise((resolve, reject) => {
          this.queue.push({ url, options, resolve, reject });
        });
      }
      throw error;
    }
  }

  async processQueue() {
    while (this.queue.length > 0 && this.isOnline) {
      const { url, options, resolve, reject } = this.queue.shift();
      
      try {
        const result = await fetch(url, options);
        resolve(await result.json());
      } catch (error) {
        reject(error);
      }
    }
  }
}
```

## Error Monitoring and Alerting

### 1. Error Tracking Setup

```javascript
// Initialize error tracking
import { ErrorTracker } from './error-tracker';

const tracker = new ErrorTracker({
  apiKey: 'your_tracking_key',
  environment: process.env.NODE_ENV,
  userId: user?.id
});

// Track API errors
function trackApiError(error, context) {
  tracker.captureException(error, {
    tags: {
      error_type: 'api_error',
      endpoint: context.endpoint,
      method: context.method
    },
    extra: {
      request_body: context.requestBody,
      response_status: context.responseStatus,
      user_agent: navigator.userAgent
    }
  });
}
```

### 2. Performance Monitoring

```javascript
// Monitor API performance
function monitorApiCall(endpoint, operation) {
  const startTime = performance.now();
  
  return operation()
    .then(result => {
      const duration = performance.now() - startTime;
      
      // Track successful calls
      tracker.addBreadcrumb({
        message: `API call succeeded: ${endpoint}`,
        level: 'info',
        data: { duration, endpoint }
      });
      
      return result;
    })
    .catch(error => {
      const duration = performance.now() - startTime;
      
      // Track failed calls
      trackApiError(error, {
        endpoint,
        duration,
        method: 'POST'
      });
      
      throw error;
    });
}
```

### 3. Health Check Monitoring

```javascript
// Regular health checks
class ApiHealthMonitor {
  constructor(endpoints) {
    this.endpoints = endpoints;
    this.healthStatus = {};
    this.checkInterval = 60000; // 1 minute
    
    this.startMonitoring();
  }

  async checkHealth(endpoint) {
    try {
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: response.headers.get('x-response-time'),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  startMonitoring() {
    setInterval(async () => {
      for (const endpoint of this.endpoints) {
        this.healthStatus[endpoint] = await this.checkHealth(endpoint);
      }
    }, this.checkInterval);
  }

  getHealthStatus() {
    return this.healthStatus;
  }
}
```

## Debugging Tips

### 1. Enable Debug Logging

```javascript
// Add debug headers to requests
const debugHeaders = {
  'X-Debug-Mode': 'true',
  'X-Request-ID': crypto.randomUUID(),
  'X-Client-Version': '1.2.0'
};

// Include in API calls
fetch(url, {
  headers: {
    ...standardHeaders,
    ...debugHeaders
  }
});
```

### 2. Request/Response Logging

```javascript
// Log all API interactions
function logApiCall(url, options, response, error) {
  const logData = {
    timestamp: new Date().toISOString(),
    url,
    method: options.method,
    headers: options.headers,
    body: options.body,
    response: response ? {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    } : null,
    error: error ? error.message : null
  };
  
  console.group(`API Call: ${options.method} ${url}`);
  console.log('Request:', logData);
  console.groupEnd();
  
  // Send to logging service in production
  if (process.env.NODE_ENV === 'production') {
    sendToLoggingService(logData);
  }
}
```

### 3. Error Context Collection

```javascript
function collectErrorContext(error) {
  return {
    error_message: error.message,
    error_stack: error.stack,
    user_agent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    user_id: getCurrentUserId(),
    session_id: getSessionId(),
    browser_info: {
      language: navigator.language,
      platform: navigator.platform,
      cookie_enabled: navigator.cookieEnabled,
      online: navigator.onLine
    },
    performance: {
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize
      } : null
    }
  };
}
```