# Swagger UI Setup for cmoxpert API

## Overview

This guide shows how to set up Swagger UI for interactive API documentation using the OpenAPI specification.

## Option 1: Hosted Swagger UI

### Using Swagger Hub

1. **Upload OpenAPI Spec**
   - Go to [SwaggerHub](https://swagger.io/tools/swaggerhub/)
   - Create new API project
   - Upload `docs/api/schemas/openapi.yaml`
   - Configure authentication settings

2. **Share Documentation**
   - Generate public documentation URL
   - Embed in your website or share with developers
   - Enable try-it-out functionality

### Using Redoc

```bash
# Install Redoc CLI
npm install -g redoc-cli

# Generate static documentation
redoc-cli build docs/api/schemas/openapi.yaml --output docs/api/index.html

# Serve documentation
npx http-server docs/api
```

## Option 2: Self-Hosted Swagger UI

### Docker Setup

```dockerfile
# Dockerfile for API docs
FROM swaggerapi/swagger-ui:latest

# Copy OpenAPI spec
COPY docs/api/schemas/openapi.yaml /usr/share/nginx/html/openapi.yaml

# Configure Swagger UI
ENV SWAGGER_JSON=/usr/share/nginx/html/openapi.yaml
ENV BASE_URL=/api-docs

EXPOSE 8080
```

```bash
# Build and run
docker build -t cmoxpert-api-docs .
docker run -p 8080:8080 cmoxpert-api-docs
```

### Node.js Integration

```javascript
// server.js - Express server for API docs
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const swaggerDocument = YAML.load('./docs/api/schemas/openapi.yaml');

// Customize Swagger UI
const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'cmoxpert API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true,
    filter: true,
    syntaxHighlight: {
      theme: 'tomorrow-night'
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.listen(3001, () => {
  console.log('API Documentation available at http://localhost:3001/api-docs');
});
```

## Option 3: Integrated Documentation

### Next.js Integration

```typescript
// pages/api-docs.tsx
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yamljs';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

interface ApiDocsProps {
  spec: any;
}

export default function ApiDocs({ spec }: ApiDocsProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">cmoxpert API Documentation</h1>
          <p className="text-gray-600 mt-2">
            Interactive API documentation for the cmoxpert marketing intelligence platform
          </p>
        </div>
        
        <SwaggerUI
          spec={spec}
          docExpansion="list"
          defaultModelsExpandDepth={2}
          tryItOutEnabled={true}
          filter={true}
          requestInterceptor={(request) => {
            // Add authentication automatically
            const token = localStorage.getItem('supabase.auth.token');
            if (token) {
              request.headers.Authorization = `Bearer ${token}`;
            }
            return request;
          }}
        />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const specPath = join(process.cwd(), 'docs/api/schemas/openapi.yaml');
  const specContent = readFileSync(specPath, 'utf8');
  const spec = YAML.parse(specContent);

  return {
    props: {
      spec
    }
  };
};
```

### React Component

```typescript
// components/ApiDocumentation.tsx
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

interface ApiDocumentationProps {
  specUrl?: string;
  spec?: any;
}

export function ApiDocumentation({ specUrl, spec }: ApiDocumentationProps) {
  const swaggerConfig = {
    dom_id: '#swagger-ui',
    url: specUrl,
    spec: spec,
    presets: [
      SwaggerUI.presets.apis,
      SwaggerUI.presets.standalone
    ],
    plugins: [
      SwaggerUI.plugins.DownloadUrl
    ],
    layout: 'StandaloneLayout',
    deepLinking: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (request) => {
      // Auto-inject auth token
      const token = getAuthToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    },
    responseInterceptor: (response) => {
      // Log responses for debugging
      console.log('API Response:', response);
      return response;
    }
  };

  return (
    <div className="api-documentation">
      <SwaggerUI {...swaggerConfig} />
    </div>
  );
}
```

## Customization

### Custom CSS for Swagger UI

```css
/* swagger-custom.css */
.swagger-ui {
  font-family: 'Assistant', sans-serif;
}

.swagger-ui .topbar {
  background-color: #22333B;
  padding: 1rem;
}

.swagger-ui .topbar .download-url-wrapper {
  display: none;
}

.swagger-ui .info {
  margin: 2rem 0;
}

.swagger-ui .info .title {
  color: #22333B;
  font-family: 'Archivo', sans-serif;
}

.swagger-ui .scheme-container {
  background: #EAE0D5;
  border: 1px solid #C6AC8F;
  border-radius: 8px;
  padding: 1rem;
}

.swagger-ui .btn.authorize {
  background-color: #5E503F;
  border-color: #5E503F;
}

.swagger-ui .btn.authorize:hover {
  background-color: #4A3F32;
  border-color: #4A3F32;
}

.swagger-ui .opblock.opblock-post {
  border-color: #22333B;
  background: rgba(34, 51, 59, 0.1);
}

.swagger-ui .opblock.opblock-post .opblock-summary {
  border-color: #22333B;
}

.swagger-ui .response-col_status {
  font-family: 'Archivo', sans-serif;
  font-weight: 600;
}

/* Error response styling */
.swagger-ui .response-col_status.response-400,
.swagger-ui .response-col_status.response-401,
.swagger-ui .response-col_status.response-403,
.swagger-ui .response-col_status.response-500 {
  color: #dc2626;
}

.swagger-ui .response-col_status.response-200,
.swagger-ui .response-col_status.response-201 {
  color: #059669;
}
```

### Authentication Plugin

```javascript
// swagger-auth-plugin.js
const AuthPlugin = function() {
  return {
    statePlugins: {
      auth: {
        wrapActions: {
          authorize: (oriAction, system) => (payload) => {
            // Custom authorization logic
            const token = localStorage.getItem('supabase.auth.token');
            if (token) {
              payload.Bearer = token;
            }
            return oriAction(payload);
          }
        }
      }
    }
  };
};

// Use in Swagger UI config
SwaggerUI({
  // ... other config
  plugins: [
    SwaggerUI.plugins.DownloadUrl,
    AuthPlugin
  ]
});
```

## Automation Scripts

### Generate Documentation

```bash
#!/bin/bash
# generate-docs.sh

echo "Generating API documentation..."

# Validate OpenAPI spec
npx swagger-codegen-cli validate -i docs/api/schemas/openapi.yaml

# Generate HTML documentation
redoc-cli build docs/api/schemas/openapi.yaml --output docs/api/index.html

# Generate Postman collection
openapi2postman -s docs/api/schemas/openapi.yaml -o docs/api/tools/postman-collection.json

# Generate client SDKs
npx swagger-codegen-cli generate \
  -i docs/api/schemas/openapi.yaml \
  -l typescript-fetch \
  -o sdk/typescript

npx swagger-codegen-cli generate \
  -i docs/api/schemas/openapi.yaml \
  -l python \
  -o sdk/python

echo "Documentation generated successfully!"
```

### Update Documentation

```bash
#!/bin/bash
# update-docs.sh

# Extract API routes from Edge Functions
echo "Extracting API routes..."

# Scan function directories
for func_dir in supabase/functions/*/; do
  func_name=$(basename "$func_dir")
  echo "Found function: $func_name"
  
  # Extract JSDoc comments for documentation
  grep -n "\/\*\*" "$func_dir/index.ts" || true
done

# Update OpenAPI spec with new endpoints
echo "Updating OpenAPI specification..."

# Validate updated spec
npx swagger-codegen-cli validate -i docs/api/schemas/openapi.yaml

echo "Documentation updated!"
```

## Deployment

### GitHub Actions for Documentation

```yaml
# .github/workflows/docs.yml
name: Generate API Documentation

on:
  push:
    branches: [main]
    paths: 
      - 'supabase/functions/**'
      - 'docs/api/**'

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
        run: |
          npm install -g redoc-cli swagger-codegen-cli
          
      - name: Validate OpenAPI spec
        run: swagger-codegen-cli validate -i docs/api/schemas/openapi.yaml
        
      - name: Generate documentation
        run: |
          redoc-cli build docs/api/schemas/openapi.yaml --output docs/api/index.html
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

### Netlify Deployment

```toml
# netlify.toml
[build]
  command = "npm run build:docs"
  publish = "docs/api"

[[redirects]]
  from = "/api-docs/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

## Maintenance

### Regular Updates

1. **Weekly**: Review and update error examples
2. **Monthly**: Validate all code examples
3. **Quarterly**: Update OpenAPI spec with new endpoints
4. **As needed**: Add new error scenarios and handling examples

### Documentation Quality Checklist

- [ ] All endpoints documented with examples
- [ ] Error responses include realistic scenarios
- [ ] Code examples are tested and working
- [ ] Authentication requirements clearly stated
- [ ] Rate limits and quotas documented
- [ ] Webhook payloads and events documented
- [ ] SDK examples provided for major languages
- [ ] Troubleshooting guides included