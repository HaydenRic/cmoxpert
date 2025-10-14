# AI Content Service - API Documentation

## Overview

The AI Content Service is the core engine powering Content Hub v2's intelligent content generation capabilities. It integrates with leading AI providers (OpenAI and Anthropic) to generate high-quality, SEO-optimized content that maintains brand consistency.

**Location:** `/src/lib/aiContentService.ts`

---

## Architecture

### Service Design

```
Client Request
    ↓
AI Content Service
    ├─→ Brand Voice Loader (if brandVoiceId provided)
    ├─→ Client Context Loader (if clientId provided)
    ├─→ Prompt Builder
    ├─→ AI Provider (OpenAI/Anthropic)
    ├─→ SEO Analyzer
    ├─→ Cost Calculator
    └─→ Response Formatter
```

### Provider Support

- **Primary:** OpenAI GPT-4
- **Secondary:** Anthropic Claude 3
- **Fallback:** Template-based generation (when API unavailable)

---

## API Reference

### Main Function: `generateContent`

Generates AI-powered content with SEO optimization and brand voice awareness.

#### Parameters

```typescript
interface GenerateContentParams {
  contentType: string;           // Required: Type of content to generate
  topic: string;                 // Required: Main topic/subject
  targetAudience?: string;       // Optional: Target audience description
  tone?: string;                 // Optional: Content tone (professional, casual, etc.)
  keywords?: string[];           // Optional: SEO keywords to include
  clientId?: string;             // Optional: Client UUID for context
  brandVoiceId?: string;         // Optional: Brand voice profile UUID
}
```

#### Return Value

```typescript
interface GeneratedContentResult {
  content: string;               // The generated content
  title: string;                 // Generated title
  seoScore: number;              // SEO score (0-100)
  wordCount: number;             // Total words
  readingTime: number;           // Estimated reading time (minutes)
  keywords: string[];            // Extracted/used keywords
  metaDescription: string;       // SEO meta description
  estimatedCost: number;         // API cost in USD
}
```

#### Example Usage

```typescript
import { generateContent } from '@/lib/aiContentService';

const result = await generateContent({
  contentType: 'blog_post',
  topic: 'Benefits of Marketing Automation',
  targetAudience: 'Small business owners',
  tone: 'professional yet approachable',
  keywords: ['marketing automation', 'small business', 'efficiency'],
  clientId: 'uuid-of-client',
  brandVoiceId: 'uuid-of-brand-voice'
});

console.log(result.content);        // Generated blog post
console.log(result.seoScore);       // 85 (Good SEO)
console.log(result.estimatedCost);  // 0.0234 (USD)
```

---

## Content Types

### Supported Types

| Content Type | Description | Typical Length | Use Case |
|--------------|-------------|----------------|----------|
| `blog_post` | Long-form article | 800-1500 words | Thought leadership, SEO |
| `social_media` | Short social post | 50-280 chars | Twitter, LinkedIn, Facebook |
| `email` | Email campaign | 200-500 words | Newsletters, promotions |
| `whitepaper` | In-depth report | 2000-5000 words | Lead generation, authority |
| `case_study` | Customer success story | 600-1200 words | Social proof, sales enablement |
| `landing_page` | Conversion-focused page | 300-800 words | PPC campaigns, product launches |

### Type-Specific Formatting

Each content type includes:
- Appropriate structure (headers, sections)
- Relevant call-to-action
- Optimized length
- Format-specific best practices

---

## Brand Voice Integration

### How It Works

1. Service fetches brand voice profile from database
2. Retrieves example content demonstrating the voice
3. Incorporates voice guidelines into AI prompt
4. AI generates content matching brand personality

### Brand Voice Profile Structure

```sql
brand_voice_profiles {
  id: uuid
  client_id: uuid
  name: string            -- e.g., "Professional & Approachable"
  description: text       -- Detailed voice guidelines
  tone_attributes: jsonb  -- { formal: 7, friendly: 8, technical: 5 }
  sample_phrases: text[]  -- Example phrases in brand voice
  do_list: text[]         -- What to do
  dont_list: text[]       -- What to avoid
}
```

### Example Integration

**Without Brand Voice:**
```
"Our product helps businesses save time."
```

**With Brand Voice (Casual & Friendly):**
```
"Imagine getting back 10 hours each week to focus on what you love.
That's exactly what our customers experience!"
```

---

## SEO Optimization

### SEO Scoring Algorithm

The service calculates an SEO score (0-100) based on:

1. **Readability (40%)** - Flesch Reading Ease score
2. **Keyword Density (30%)** - Target keyword usage (2-5% optimal)
3. **Meta Tags (20%)** - Title and description quality
4. **Content Length (10%)** - Appropriate word count for type

### SEO Score Calculation

```typescript
function calculateSEOScore(content: string, keywords: string[]): number {
  const readabilityScore = calculateReadability(content);
  const keywordScore = calculateKeywordDensity(content, keywords);
  const metaScore = evaluateMetaTags(content);
  const lengthScore = evaluateContentLength(content);

  return (
    readabilityScore * 0.4 +
    keywordScore * 0.3 +
    metaScore * 0.2 +
    lengthScore * 0.1
  );
}
```

### Readability Calculation

Uses Flesch Reading Ease formula:

```
206.835 - 1.015 * (total words / total sentences)
        - 84.6 * (total syllables / total words)
```

**Score Interpretation:**
- 90-100: Very easy (5th grade)
- 80-89: Easy (6th grade)
- 70-79: Fairly easy (7th grade)
- 60-69: Standard (8th-9th grade)
- 50-59: Fairly difficult (10th-12th grade)
- 30-49: Difficult (college)
- 0-29: Very difficult (college graduate)

### Keyword Optimization

**Optimal Density:** 2-5% for primary keywords

**Keyword Placement:**
- Title (highest weight)
- First paragraph
- Subheadings
- Throughout content (natural distribution)
- Meta description

---

## AI Provider Configuration

### Environment Variables

```bash
# Choose provider
VITE_AI_PROVIDER=openai          # or 'anthropic'

# API Keys
VITE_OPENAI_API_KEY=sk-proj-...  # OpenAI API key
VITE_ANTHROPIC_API_KEY=sk-ant-... # Anthropic API key
```

### OpenAI Integration

**Model:** GPT-4 Turbo
**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Request Format:**
```typescript
{
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.7,
  max_tokens: 2000
}
```

**Cost:** ~$0.01-0.03 per request (varies by length)

### Anthropic Integration

**Model:** Claude 3 Opus
**Endpoint:** `https://api.anthropic.com/v1/messages`

**Request Format:**
```typescript
{
  model: "claude-3-opus-20240229",
  max_tokens: 2000,
  messages: [
    { role: "user", content: promptContent }
  ]
}
```

**Cost:** ~$0.015-0.075 per request (varies by length)

---

## Prompt Engineering

### System Prompt Structure

```
You are an expert content writer for [CLIENT_NAME].

BRAND VOICE:
[Brand voice guidelines]

CONTENT TYPE: [Content Type]
TARGET AUDIENCE: [Audience]
TONE: [Tone]

REQUIREMENTS:
- Include these keywords naturally: [Keywords]
- Maintain brand voice throughout
- Optimize for SEO
- [Type-specific requirements]

Generate compelling, high-quality content.
```

### Dynamic Prompt Building

The service dynamically constructs prompts based on:
- Content type requirements
- Client context (if available)
- Brand voice profile (if provided)
- Target audience specifications
- Keyword targets
- Tone preferences

---

## Cost Tracking

### Cost Calculation

```typescript
function estimateCost(provider: string, tokenCount: number): number {
  const rates = {
    openai: { input: 0.00001, output: 0.00003 },  // per token
    anthropic: { input: 0.000015, output: 0.000075 }
  };

  const rate = rates[provider];
  const inputCost = tokenCount * rate.input;
  const outputCost = (tokenCount * 0.7) * rate.output; // estimate

  return inputCost + outputCost;
}
```

### Cost Optimization Tips

1. **Use concise prompts** - Remove unnecessary instructions
2. **Limit output length** - Set appropriate max_tokens
3. **Cache client context** - Don't refetch on every request
4. **Batch requests** - Generate multiple pieces together
5. **Use appropriate models** - Not every task needs GPT-4

---

## Error Handling

### Error Types

```typescript
enum ContentGenerationError {
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_QUOTA = 'INSUFFICIENT_QUOTA',
  BRAND_VOICE_NOT_FOUND = 'BRAND_VOICE_NOT_FOUND',
  CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND'
}
```

### Fallback Behavior

When AI generation fails, the service:
1. Logs detailed error information
2. Falls back to template-based generation
3. Returns lower-quality content with warning flag
4. Includes error details in response metadata

### Retry Logic

```typescript
async function generateWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateContent(params);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

---

## Performance Optimization

### Caching Strategy

**Brand Voice Profiles:** Cache for 1 hour
**Client Context:** Cache for 30 minutes
**Generated Content:** No caching (always fresh)

### Response Time Targets

- **Fast Content** (social media): < 3 seconds
- **Medium Content** (blog posts): < 8 seconds
- **Long Content** (whitepapers): < 15 seconds

### Optimization Techniques

1. **Parallel Fetching** - Load brand voice + client context simultaneously
2. **Token Limits** - Appropriate max_tokens per content type
3. **Streaming** (future) - Stream responses as they generate
4. **Edge Functions** - Run generation closer to AI APIs

---

## Testing

### Unit Tests

```typescript
describe('AI Content Service', () => {
  test('generates content with valid parameters', async () => {
    const result = await generateContent({
      contentType: 'blog_post',
      topic: 'Test Topic'
    });

    expect(result.content).toBeTruthy();
    expect(result.seoScore).toBeGreaterThan(0);
    expect(result.wordCount).toBeGreaterThan(100);
  });

  test('calculates SEO score correctly', () => {
    const score = calculateSEOScore(sampleContent, ['keyword']);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('handles missing API key gracefully', async () => {
    process.env.VITE_OPENAI_API_KEY = '';
    const result = await generateContent({
      contentType: 'blog_post',
      topic: 'Test'
    });

    expect(result.content).toContain('[Template]');
  });
});
```

### Integration Tests

Test with real API (requires keys):
```typescript
test('real OpenAI integration', async () => {
  const result = await generateContent({
    contentType: 'blog_post',
    topic: 'AI in Marketing',
    keywords: ['AI', 'marketing']
  });

  expect(result.content).not.toContain('[Template]');
  expect(result.estimatedCost).toBeGreaterThan(0);
});
```

---

## Monitoring & Analytics

### Metrics to Track

1. **Generation Success Rate** - % of successful generations
2. **Average Response Time** - Time per content type
3. **Cost Per Generation** - Total API spend
4. **SEO Score Distribution** - Quality metrics
5. **Error Rate** - By error type

### Logging

```typescript
// Successful generation
logger.info('Content generated', {
  contentType,
  wordCount,
  seoScore,
  cost: estimatedCost,
  provider: 'openai',
  duration: responseTime
});

// Error
logger.error('Content generation failed', {
  error: error.message,
  contentType,
  provider: 'openai',
  retryAttempt: 2
});
```

---

## Security Considerations

### API Key Protection

- **Never expose keys in frontend code**
- **Use environment variables only**
- **Rotate keys regularly**
- **Monitor usage for anomalies**

### Input Validation

```typescript
function validateParams(params: GenerateContentParams): void {
  if (!params.contentType || !params.topic) {
    throw new Error('Missing required parameters');
  }

  if (params.topic.length > 500) {
    throw new Error('Topic too long');
  }

  if (params.keywords && params.keywords.length > 20) {
    throw new Error('Too many keywords');
  }
}
```

### Rate Limiting

Implement rate limiting to prevent abuse:
```typescript
const rateLimiter = {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100
};
```

---

## Best Practices

### For Content Quality

1. **Always provide keywords** - Improves SEO and relevance
2. **Use brand voice** - Ensures consistency
3. **Specify target audience** - Better content targeting
4. **Include client context** - More personalized content
5. **Review and edit** - AI is a starting point, not final product

### For Cost Efficiency

1. **Set appropriate max_tokens** - Don't over-generate
2. **Use templates for simple content** - Save AI for complex tasks
3. **Batch similar requests** - Reduce API overhead
4. **Monitor spending** - Set budget alerts
5. **Optimize prompts** - Remove redundant instructions

### For Performance

1. **Cache brand voices** - Don't fetch on every request
2. **Use appropriate models** - GPT-3.5 for simple tasks
3. **Implement timeouts** - Prevent hanging requests
4. **Monitor response times** - Set SLA targets
5. **Use edge functions** - Reduce latency

---

## Troubleshooting

### Common Issues

**Issue:** "API key not configured"
**Solution:** Add `VITE_OPENAI_API_KEY` or `VITE_ANTHROPIC_API_KEY` to `.env`

**Issue:** Low SEO scores consistently
**Solution:** Provide more keywords, check content length, review readability

**Issue:** Generic/template content returned
**Solution:** Check API key validity, verify API quota, check network connectivity

**Issue:** High costs
**Solution:** Reduce max_tokens, use cheaper models, implement caching

**Issue:** Slow response times
**Solution:** Check API status, reduce content length, optimize prompts

### Debug Mode

Enable debugging:
```typescript
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('Prompt:', prompt);
  console.log('Response:', response);
  console.log('Tokens:', tokenCount);
  console.log('Cost:', estimatedCost);
}
```

---

## Future Enhancements

### Planned Features

1. **Streaming Responses** - Real-time content generation
2. **Multi-Language Support** - Generate in 50+ languages
3. **Content Refinement** - Iterative improvement loops
4. **Custom Fine-Tuning** - Client-specific AI models
5. **Automated A/B Testing** - Generate variants automatically
6. **Content Mixing** - Combine multiple sources
7. **Voice Cloning** - Match specific author styles
8. **Visual Content** - AI-generated images/infographics

---

## Conclusion

The AI Content Service provides enterprise-grade content generation with brand consistency, SEO optimization, and intelligent contextual awareness. By integrating leading AI providers with sophisticated prompt engineering and comprehensive quality analysis, it delivers production-ready content at scale.

**Key Strengths:**
- Real AI integration (not templates)
- Brand voice consistency
- Automatic SEO optimization
- Cost tracking and optimization
- Robust error handling
- Production-ready architecture
