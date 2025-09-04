# AI Playbook Generation API

## Generate Marketing Playbook

Creates custom AI-powered marketing playbooks with actionable tactics.

### Endpoint
```http
POST /generate-playbook
```

### Authentication
Requires valid JWT token with user permissions.

### Request Body

```json
{
  "clientId": "uuid",
  "userId": "uuid",
  "playbookType": "string (optional)",
  "reportId": "uuid (optional)"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string (uuid) | Yes | Client identifier |
| `userId` | string (uuid) | Yes | User identifier (must match authenticated user) |
| `playbookType` | string | No | Type of playbook (default: "growth-strategy") |
| `reportId` | string (uuid) | No | Reference report for context |

#### Playbook Types

| Type | Description |
|------|-------------|
| `growth-strategy` | Comprehensive growth acceleration tactics |
| `demand-generation` | Lead generation and nurturing strategies |
| `brand-positioning` | Market positioning and differentiation |
| `content-marketing` | Content strategy and distribution |
| `competitive-analysis` | Competitor intelligence and response |
| `customer-retention` | Customer success and expansion |

### Request Example

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/generate-playbook \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "playbookType": "growth-strategy",
    "reportId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "AI playbook generated successfully",
  "playbookId": "550e8400-e29b-41d4-a716-446655440003",
  "playbook": {
    "name": "Growth Acceleration Playbook for Acme Corp",
    "description": "A comprehensive growth strategy designed specifically for Acme Corp...",
    "category": "growth-strategy",
    "tactics": [
      {
        "title": "Competitive Intelligence Dashboard",
        "description": "Set up automated monitoring of competitor pricing...",
        "timeline": "Week 1-2",
        "difficulty": "Medium",
        "impact": "High",
        "resources": ["SEMrush", "Ahrefs", "Google Alerts"],
        "kpis": ["Competitor updates tracked", "Market opportunities identified"]
      }
    ]
  }
}
```

### Error Responses

##### 400 Bad Request - Missing Fields
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: clientId and userId",
    "details": {
      "missing_fields": ["clientId", "userId"]
    },
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

##### 403 Forbidden - User Mismatch
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "User ID mismatch",
    "details": {
      "provided_user_id": "user_123",
      "authenticated_user_id": "user_456"
    },
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

##### 403 Forbidden - Client Access
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
    "message": "Failed to generate AI playbook",
    "details": "OpenAI API error: 429 Too Many Requests",
    "timestamp": "2025-01-08T14:30:00Z"
  }
}
```

### Playbook Structure

Generated playbooks follow this structure:

```typescript
interface Playbook {
  name: string;
  description: string;
  category: string;
  tactics: PlaybookTactic[];
}

interface PlaybookTactic {
  title: string;
  description: string;
  timeline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impact: 'Low' | 'Medium' | 'High';
  resources: string[];
  kpis: string[];
}
```

### Code Examples

#### JavaScript/TypeScript
```typescript
async function generatePlaybook(clientId: string, playbookType: string = 'growth-strategy') {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/functions/v1/generate-playbook', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientId,
      userId: session?.user?.id,
      playbookType
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return await response.json();
}
```

#### React Hook
```typescript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function usePlaybookGeneration() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlaybook = async (clientId: string, playbookType?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/functions/v1/generate-playbook', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          userId: user?.id,
          playbookType: playbookType || 'growth-strategy'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generatePlaybook, loading, error };
}
```

### Rate Limits

- **Standard**: 3 playbooks per hour
- **Premium**: 10 playbooks per hour
- **Enterprise**: 50 playbooks per hour

### Best Practices

1. **Context**: Include reportId when available for better AI context
2. **Type Selection**: Choose appropriate playbook type for client needs
3. **Error Handling**: Implement retry logic for AI service errors
4. **Caching**: Cache generated playbooks to avoid regeneration

### Testing

```javascript
// Jest test example
describe('Playbook Generation', () => {
  test('should generate growth strategy playbook', async () => {
    const result = await generatePlaybook('client_123', 'growth-strategy');
    
    expect(result.success).toBe(true);
    expect(result.playbook.category).toBe('growth-strategy');
    expect(result.playbook.tactics).toHaveLength.greaterThan(5);
  });
  
  test('should handle invalid client ID', async () => {
    await expect(generatePlaybook('invalid_id'))
      .rejects.toThrow('Client not found or access denied');
  });
});
```