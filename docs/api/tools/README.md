# API Documentation Tools

## Overview

This directory contains tools and configurations for generating, maintaining, and testing the cmoxpert API documentation.

## Available Tools

### 1. Documentation Generator (`documentation-generator.js`)

Automatically generates API documentation by scanning Edge Functions and extracting JSDoc comments.

```bash
# Generate complete documentation
node docs/api/tools/documentation-generator.js generate

# Validate existing documentation
node docs/api/tools/documentation-generator.js validate
```

**Features:**
- Scans Supabase Edge Functions for API endpoints
- Extracts JSDoc comments for documentation
- Updates OpenAPI specification automatically
- Generates endpoint-specific documentation
- Creates code examples in multiple languages

### 2. OpenAPI Specification (`openapi.yaml`)

Complete OpenAPI 3.0 specification for the cmoxpert API.

**Usage:**
- Import into Swagger UI for interactive documentation
- Generate client SDKs using swagger-codegen
- Validate API contracts during development

### 3. Postman Collection (`postman-collection.json`)

Ready-to-import Postman collection with all API endpoints.

**Features:**
- Pre-configured authentication
- Example requests and responses
- Environment variables for different stages
- Automated testing scripts

### 4. Insomnia Workspace (`insomnia-workspace.json`)

Insomnia REST client workspace for API testing.

**Import Instructions:**
1. Open Insomnia
2. Go to Application → Preferences → Data
3. Import Data → From File
4. Select `insomnia-workspace.json`

## Recommended Documentation Tools

### 1. Swagger UI (Interactive Documentation)

**Pros:**
- Interactive API explorer
- Built-in authentication support
- Try-it-out functionality
- Wide industry adoption

**Setup:**
```bash
npm install swagger-ui-express
```

**Integration:**
```javascript
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./docs/api/schemas/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

### 2. Redoc (Beautiful Static Documentation)

**Pros:**
- Clean, responsive design
- Fast loading and navigation
- Excellent for public documentation
- No JavaScript required for viewing

**Setup:**
```bash
npm install -g redoc-cli

# Generate static HTML
redoc-cli build docs/api/schemas/openapi.yaml --output docs/api/index.html
```

### 3. Stoplight Studio (API Design First)

**Pros:**
- Visual API designer
- Collaborative editing
- Mock server generation
- Git integration

**Usage:**
1. Import OpenAPI spec into Stoplight Studio
2. Use visual editor for modifications
3. Export updated specification
4. Generate documentation and mock servers

### 4. Insomnia Designer (Free Alternative)

**Pros:**
- Free and open source
- Visual OpenAPI editor
- Built-in validation
- Export to multiple formats

### 5. Postman (API Development Platform)

**Pros:**
- Complete API development lifecycle
- Automated testing capabilities
- Team collaboration features
- Monitoring and analytics

**Setup:**
1. Import `postman-collection.json`
2. Configure environment variables
3. Set up automated tests
4. Generate documentation from collection

## Automation Workflows

### 1. GitHub Actions for Documentation

```yaml
# .github/workflows/api-docs.yml
name: Generate API Documentation

on:
  push:
    branches: [main]
    paths: ['supabase/functions/**', 'docs/api/**']

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install -g redoc-cli swagger-codegen-cli js-yaml
        
      - name: Generate documentation
        run: |
          node docs/api/tools/documentation-generator.js generate
          redoc-cli build docs/api/schemas/openapi.yaml --output docs/api/index.html
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

### 2. Pre-commit Hooks

```bash
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: validate-openapi
        name: Validate OpenAPI Spec
        entry: swagger-codegen-cli validate -i docs/api/schemas/openapi.yaml
        language: system
        files: docs/api/schemas/openapi.yaml
        
      - id: generate-docs
        name: Generate API Documentation
        entry: node docs/api/tools/documentation-generator.js generate
        language: system
        files: supabase/functions/.*\.ts$
```

### 3. Documentation Deployment

#### Netlify
```toml
# netlify.toml
[build]
  command = "node docs/api/tools/documentation-generator.js generate && redoc-cli build docs/api/schemas/openapi.yaml --output docs/api/index.html"
  publish = "docs/api"

[[redirects]]
  from = "/api/*"
  to = "/index.html"
  status = 200
```

#### Vercel
```json
{
  "builds": [
    {
      "src": "docs/api/tools/documentation-generator.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api-docs/(.*)",
      "dest": "/docs/api/index.html"
    }
  ]
}
```

## Best Practices

### 1. Documentation Standards

- **Consistency**: Use consistent formatting and terminology
- **Examples**: Include realistic request/response examples
- **Error Scenarios**: Document all possible error conditions
- **Code Samples**: Provide working code examples
- **Versioning**: Maintain documentation versions alongside API versions

### 2. Maintenance Workflow

1. **Development**: Update JSDoc comments in Edge Functions
2. **Review**: Validate documentation changes in pull requests
3. **Generation**: Automatically generate docs on merge
4. **Testing**: Verify examples work with actual API
5. **Deployment**: Deploy updated documentation automatically

### 3. Quality Checklist

- [ ] All endpoints documented with examples
- [ ] Error responses include realistic scenarios
- [ ] Authentication requirements clearly stated
- [ ] Rate limits and quotas documented
- [ ] Code examples tested and working
- [ ] OpenAPI spec validates successfully
- [ ] Documentation builds without errors
- [ ] Links and references are working

## Monitoring and Analytics

### Documentation Usage Analytics

```javascript
// Track documentation usage
function trackDocumentationUsage() {
  // Track page views
  gtag('event', 'page_view', {
    page_title: 'API Documentation',
    page_location: window.location.href
  });
  
  // Track API endpoint interest
  document.querySelectorAll('.endpoint-link').forEach(link => {
    link.addEventListener('click', (e) => {
      gtag('event', 'documentation_interaction', {
        endpoint: e.target.dataset.endpoint,
        action: 'view_endpoint'
      });
    });
  });
  
  // Track try-it-out usage
  document.querySelectorAll('.try-out-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      gtag('event', 'documentation_interaction', {
        endpoint: e.target.dataset.endpoint,
        action: 'try_endpoint'
      });
    });
  });
}
```

### Feedback Collection

```html
<!-- Add to documentation pages -->
<div class="feedback-widget">
  <h4>Was this helpful?</h4>
  <button onclick="submitFeedback('helpful', window.location.pathname)">👍 Yes</button>
  <button onclick="submitFeedback('not-helpful', window.location.pathname)">👎 No</button>
</div>

<script>
function submitFeedback(type, page) {
  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, page, timestamp: new Date().toISOString() })
  });
}
</script>
```

## Support and Maintenance

### Regular Tasks

- **Weekly**: Review and update error examples
- **Monthly**: Validate all code examples
- **Quarterly**: Update OpenAPI spec with new endpoints
- **As needed**: Add new integration examples

### Documentation Issues

For documentation issues or suggestions:
1. Create GitHub issue with `documentation` label
2. Include specific page/section reference
3. Provide suggested improvements
4. Tag with appropriate priority level

### Contributing

1. Fork the repository
2. Create feature branch for documentation updates
3. Update relevant files in `docs/api/`
4. Run validation: `node docs/api/tools/documentation-generator.js validate`
5. Submit pull request with clear description