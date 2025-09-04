# Market Analysis API

## Generate Market Analysis

Generates comprehensive AI-powered market analysis for a client's domain.

### Endpoint
```http
POST /generate-market-analysis
```

### Authentication
Requires valid JWT token with user permissions.

### Request Body

```json
{
  "reportId": "uuid",
  "clientId": "uuid", 
  "domain": "string",
  "industry": "string (optional)"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reportId` | string (uuid) | Yes | Unique identifier for the report |
| `clientId` | string (uuid) | Yes | Client identifier |
| `domain` | string | Yes | Domain to analyze (e.g., "example.com") |
| `industry` | string | No | Industry context for analysis |

### Request Example

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "550e8400-e29b-41d4-a716-446655440000",
    "clientId": "550e8400-e29b-41d4-a716-446655440001", 
    "domain": "example.com",
    "industry": "B2B SaaS"
  }'
```

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Market analysis completed successfully",
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "status": "completed",
    "analysis_url": "/reports/550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Error Responses

##### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: reportId, clientId, domain",
    "details": {
      "missing_fields": ["reportId", "clientId", "domain"]
    },
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

##### 401 Unauthorized
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR", 
    "message": "Invalid or expired token",
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

##### 403 Forbidden
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Client not found or access denied", 
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

##### 500 Internal Server Error
```json
{
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "Failed to generate market analysis",
    "details": "OpenAI API timeout",
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

### Analysis Process

The market analysis generation follows these steps:

1. **Validation**: Verify user permissions and input parameters
2. **Data Collection**: Fetch competitive intelligence from SEMrush API
3. **Trend Analysis**: Analyze market trends using Google Trends
4. **AI Processing**: Generate insights using OpenAI GPT-4
5. **Storage**: Save results to database with status updates

### Analysis Components

The generated analysis includes:

- **Executive Summary**: High-level insights and recommendations
- **Competitive Landscape**: Analysis of key competitors
- **Market Opportunities**: Identified growth opportunities
- **Strategic Recommendations**: Actionable next steps
- **Key Metrics**: Suggested KPIs to track

### Webhook Notifications

When analysis completes, a webhook is sent to registered endpoints:

```json
{
  "event": "analysis.completed",
  "data": {
    "reportId": "550e8400-e29b-41d4-a716-446655440000",
    "clientId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "completed",
    "analysis_url": "/reports/550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2025-01-08T14:30:00Z"
}
```

### Rate Limits

- **Standard**: 5 analyses per hour
- **Premium**: 20 analyses per hour  
- **Enterprise**: 100 analyses per hour

### Best Practices

1. **Polling**: Check report status every 30 seconds instead of continuous polling
2. **Caching**: Cache completed analyses to avoid regeneration
3. **Error Handling**: Implement exponential backoff for retries
4. **Validation**: Validate domain format before submission

### Code Examples

#### JavaScript/TypeScript
```typescript
import { supabase } from './supabase';

async function generateAnalysis(clientId: string, domain: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch('/functions/v1/generate-market-analysis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportId: crypto.randomUUID(),
        clientId,
        domain,
        industry: 'B2B SaaS'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Analysis generation failed:', error);
    throw error;
  }
}
```

#### Python
```python
import requests
import json

def generate_analysis(client_id: str, domain: str, token: str):
    url = "https://your-project.supabase.co/functions/v1/generate-market-analysis"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "reportId": str(uuid.uuid4()),
        "clientId": client_id,
        "domain": domain,
        "industry": "B2B SaaS"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Analysis generation failed: {e}")
        raise
```

### Testing

#### Unit Tests
```javascript
describe('Market Analysis API', () => {
  test('should generate analysis successfully', async () => {
    const result = await generateAnalysis('client_123', 'example.com');
    expect(result.success).toBe(true);
    expect(result.reportId).toBeDefined();
  });
  
  test('should handle invalid domain', async () => {
    await expect(generateAnalysis('client_123', 'invalid-domain'))
      .rejects.toThrow('Invalid domain format');
  });
});
```

#### Integration Tests
```bash
# Test with curl
curl -X POST \
  http://localhost:54321/functions/v1/generate-market-analysis \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"reportId":"test_123","clientId":"client_123","domain":"example.com"}'
```