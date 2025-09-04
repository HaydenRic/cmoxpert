# cmoxpert API Documentation

## Overview

The cmoxpert API provides AI-powered marketing intelligence and automation services for B2B SaaS companies. This documentation covers all available endpoints, authentication methods, and integration patterns.

## Base URL

```
Production: https://your-project.supabase.co/functions/v1
Development: http://localhost:54321/functions/v1
```

## Authentication

All API endpoints require authentication using Supabase JWT tokens.

### Authentication Methods

#### 1. Bearer Token (Recommended)
```http
Authorization: Bearer <your_jwt_token>
```

#### 2. API Key (For server-to-server)
```http
apikey: <your_supabase_anon_key>
Authorization: Bearer <your_supabase_anon_key>
```

### Getting Authentication Tokens

```javascript
// Client-side authentication
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use in API calls
const response = await fetch('/functions/v1/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Rate Limiting

- **Standard Plan**: 100 requests per minute per user
- **Enterprise Plan**: 1000 requests per minute per user
- **Burst Limit**: 20 requests per second

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "domain",
      "reason": "Invalid domain format"
    },
    "timestamp": "2025-01-08T14:30:00Z",
    "request_id": "req_123456789"
  }
}
```

### HTTP Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily down |

### Error Codes

| Code | Description | Retryable |
|------|-------------|-----------|
| `VALIDATION_ERROR` | Input validation failed | No |
| `AUTHENTICATION_ERROR` | Authentication failed | No |
| `PERMISSION_DENIED` | Insufficient permissions | No |
| `RESOURCE_NOT_FOUND` | Requested resource not found | No |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Yes |
| `AI_SERVICE_ERROR` | AI service unavailable | Yes |
| `NETWORK_ERROR` | Network connectivity issue | Yes |
| `SERVER_ERROR` | Internal server error | Yes |

## Pagination

For endpoints that return lists, pagination is supported:

### Request Parameters
```http
GET /endpoint?page=1&limit=20&sort=created_at&order=desc
```

### Response Format
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

## Webhooks

cmoxpert supports webhooks for real-time notifications:

### Supported Events
- `analysis.completed` - Market analysis finished
- `playbook.generated` - AI playbook created
- `alert.created` - Competitive alert triggered

### Webhook Payload Format
```json
{
  "event": "analysis.completed",
  "data": {
    "id": "report_123",
    "client_id": "client_456",
    "status": "completed"
  },
  "timestamp": "2025-01-08T14:30:00Z",
  "signature": "sha256=..."
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @cmoxpert/sdk
```

```javascript
import { CmoxpertClient } from '@cmoxpert/sdk';

const client = new CmoxpertClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://your-project.supabase.co/functions/v1'
});

// Generate market analysis
const analysis = await client.analysis.generate({
  clientId: 'client_123',
  domain: 'example.com'
});
```

### Python SDK
```bash
pip install cmoxpert-python
```

```python
from cmoxpert import CmoxpertClient

client = CmoxpertClient(api_key='your_api_key')
analysis = client.analysis.generate(
    client_id='client_123',
    domain='example.com'
)
```

## Testing

### Test Environment
```
Base URL: https://your-project-test.supabase.co/functions/v1
```

### Test Data
Use the following test data for development:
- Test Client ID: `test_client_123`
- Test Domain: `test-company.com`
- Test User ID: `test_user_456`

## Support

- **Documentation**: [https://docs.cmoxpert.com](https://docs.cmoxpert.com)
- **Support Email**: api-support@cmoxpert.com
- **Status Page**: [https://status.cmoxpert.com](https://status.cmoxpert.com)
- **Community**: [https://community.cmoxpert.com](https://community.cmoxpert.com)

## Changelog

### v1.2.0 (2025-01-08)
- Added AI playbook generation endpoint
- Enhanced error handling and validation
- Improved rate limiting

### v1.1.0 (2024-12-15)
- Added competitive intelligence endpoints
- Webhook support for real-time notifications
- Performance improvements

### v1.0.0 (2024-11-01)
- Initial API release
- Market analysis generation
- Basic client management