#!/usr/bin/env node

/**
 * Automatic API Documentation Generator
 * 
 * This script automatically generates and updates API documentation
 * by scanning Edge Functions and extracting JSDoc comments.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class DocumentationGenerator {
  constructor() {
    this.functionsDir = 'supabase/functions';
    this.docsDir = 'docs/api';
    this.openApiSpec = null;
  }

  /**
   * Main generation process
   */
  async generate() {
    console.log('🚀 Starting API documentation generation...');
    
    try {
      // Load existing OpenAPI spec
      await this.loadOpenApiSpec();
      
      // Scan Edge Functions
      const functions = await this.scanEdgeFunctions();
      
      // Update OpenAPI spec
      await this.updateOpenApiSpec(functions);
      
      // Generate endpoint documentation
      await this.generateEndpointDocs(functions);
      
      // Generate code examples
      await this.generateCodeExamples(functions);
      
      // Validate generated documentation
      await this.validateDocumentation();
      
      console.log('✅ Documentation generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Load existing OpenAPI specification
   */
  async loadOpenApiSpec() {
    const specPath = path.join(this.docsDir, 'schemas/openapi.yaml');
    
    if (fs.existsSync(specPath)) {
      const specContent = fs.readFileSync(specPath, 'utf8');
      this.openApiSpec = yaml.load(specContent);
      console.log('📄 Loaded existing OpenAPI spec');
    } else {
      // Create basic spec structure
      this.openApiSpec = {
        openapi: '3.0.3',
        info: {
          title: 'cmoxpert API',
          version: '1.0.0',
          description: 'AI-powered marketing intelligence API'
        },
        servers: [
          {
            url: 'https://your-project.supabase.co/functions/v1',
            description: 'Production server'
          }
        ],
        paths: {},
        components: {
          schemas: {},
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      };
      console.log('📄 Created new OpenAPI spec');
    }
  }

  /**
   * Scan Edge Functions for API endpoints
   */
  async scanEdgeFunctions() {
    const functions = [];
    
    if (!fs.existsSync(this.functionsDir)) {
      console.log('⚠️  No Edge Functions directory found');
      return functions;
    }

    const functionDirs = fs.readdirSync(this.functionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const functionName of functionDirs) {
      if (functionName.startsWith('_')) continue; // Skip shared directories
      
      const functionPath = path.join(this.functionsDir, functionName, 'index.ts');
      
      if (fs.existsSync(functionPath)) {
        const functionInfo = await this.parseFunction(functionName, functionPath);
        if (functionInfo) {
          functions.push(functionInfo);
          console.log(`📝 Parsed function: ${functionName}`);
        }
      }
    }

    return functions;
  }

  /**
   * Parse individual Edge Function
   */
  async parseFunction(name, filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract JSDoc comment block
    const jsdocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (!jsdocMatch) {
      console.log(`⚠️  No JSDoc found for ${name}`);
      return null;
    }

    const jsdoc = jsdocMatch[1];
    
    // Parse JSDoc content
    const description = this.extractJSDocTag(jsdoc, 'description') || 
                       this.extractJSDocDescription(jsdoc);
    const summary = this.extractJSDocTag(jsdoc, 'summary') || name;
    const tags = this.extractJSDocTags(jsdoc, 'tag');
    const params = this.extractJSDocTags(jsdoc, 'param');
    const returns = this.extractJSDocTag(jsdoc, 'returns');
    const examples = this.extractJSDocTags(jsdoc, 'example');

    // Extract request/response types from code
    const requestType = this.extractTypeFromCode(content, 'RequestPayload');
    const responseType = this.extractTypeFromCode(content, 'Response');

    return {
      name,
      path: `/${name}`,
      method: 'POST', // Most Edge Functions are POST
      summary,
      description,
      tags: tags.length > 0 ? tags : ['API'],
      parameters: params,
      requestType,
      responseType,
      examples,
      returns
    };
  }

  /**
   * Extract JSDoc tag content
   */
  extractJSDocTag(jsdoc, tag) {
    const regex = new RegExp(`@${tag}\\s+(.+?)(?=@|$)`, 's');
    const match = jsdoc.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract multiple JSDoc tags
   */
  extractJSDocTags(jsdoc, tag) {
    const regex = new RegExp(`@${tag}\\s+(.+?)(?=@|\\n|$)`, 'g');
    const matches = [];
    let match;
    
    while ((match = regex.exec(jsdoc)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches;
  }

  /**
   * Extract description from JSDoc
   */
  extractJSDocDescription(jsdoc) {
    const lines = jsdoc.split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .filter(line => !line.startsWith('@'));
    
    return lines.join('\n').trim();
  }

  /**
   * Extract TypeScript interface from code
   */
  extractTypeFromCode(content, typeName) {
    const regex = new RegExp(`interface\\s+${typeName}\\s*{([^}]+)}`, 's');
    const match = content.match(regex);
    
    if (!match) return null;

    const interfaceBody = match[1];
    const properties = {};

    // Parse interface properties
    const propertyRegex = /(\w+)(\?)?:\s*([^;]+);/g;
    let propertyMatch;

    while ((propertyMatch = propertyRegex.exec(interfaceBody)) !== null) {
      const [, name, optional, type] = propertyMatch;
      properties[name] = {
        type: this.mapTypeScriptToOpenApi(type.trim()),
        required: !optional,
        description: `${name} parameter`
      };
    }

    return {
      type: 'object',
      properties,
      required: Object.keys(properties).filter(key => properties[key].required)
    };
  }

  /**
   * Map TypeScript types to OpenAPI types
   */
  mapTypeScriptToOpenApi(tsType) {
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'any': 'object',
      'object': 'object',
      'array': 'array'
    };

    // Handle UUID type
    if (tsType.includes('uuid')) {
      return { type: 'string', format: 'uuid' };
    }

    // Handle array types
    if (tsType.includes('[]')) {
      const itemType = tsType.replace('[]', '');
      return {
        type: 'array',
        items: { type: typeMap[itemType] || 'string' }
      };
    }

    return typeMap[tsType] || 'string';
  }

  /**
   * Update OpenAPI specification
   */
  async updateOpenApiSpec(functions) {
    for (const func of functions) {
      const pathKey = func.path;
      const methodKey = func.method.toLowerCase();

      // Initialize path if it doesn't exist
      if (!this.openApiSpec.paths[pathKey]) {
        this.openApiSpec.paths[pathKey] = {};
      }

      // Create operation object
      const operation = {
        summary: func.summary,
        description: func.description,
        operationId: func.name,
        tags: func.tags,
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: func.responseType || { type: 'object' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      };

      // Add request body if function has request type
      if (func.requestType) {
        operation.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: func.requestType
            }
          }
        };
      }

      this.openApiSpec.paths[pathKey][methodKey] = operation;
    }

    // Add common response schemas
    this.openApiSpec.components.responses = {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    };

    // Save updated spec
    const specPath = path.join(this.docsDir, 'schemas/openapi.yaml');
    const yamlContent = yaml.dump(this.openApiSpec, { indent: 2 });
    fs.writeFileSync(specPath, yamlContent);
    
    console.log('📝 Updated OpenAPI specification');
  }

  /**
   * Generate individual endpoint documentation
   */
  async generateEndpointDocs(functions) {
    const endpointsDir = path.join(this.docsDir, 'endpoints');
    
    // Ensure endpoints directory exists
    if (!fs.existsSync(endpointsDir)) {
      fs.mkdirSync(endpointsDir, { recursive: true });
    }

    for (const func of functions) {
      const docContent = this.generateEndpointMarkdown(func);
      const docPath = path.join(endpointsDir, `${func.name}.md`);
      fs.writeFileSync(docPath, docContent);
      console.log(`📄 Generated docs for ${func.name}`);
    }
  }

  /**
   * Generate markdown documentation for endpoint
   */
  generateEndpointMarkdown(func) {
    return `# ${func.summary}

## Overview

${func.description}

### Endpoint
\`\`\`http
${func.method} ${func.path}
\`\`\`

### Authentication
Requires valid JWT token with appropriate permissions.

### Request

${func.requestType ? this.generateRequestSchema(func.requestType) : 'No request body required.'}

### Response

#### Success Response (200 OK)
\`\`\`json
${JSON.stringify(this.generateExampleResponse(func), null, 2)}
\`\`\`

### Error Responses

See [Error Handling Guide](../examples/error-handling.md) for complete error scenarios.

### Code Examples

#### JavaScript/TypeScript
\`\`\`typescript
${this.generateJavaScriptExample(func)}
\`\`\`

#### cURL
\`\`\`bash
${this.generateCurlExample(func)}
\`\`\`

### Rate Limits

- Standard: 10 requests per minute
- Premium: 100 requests per minute
- Enterprise: 1000 requests per minute

### Best Practices

1. Implement proper error handling with retry logic
2. Use exponential backoff for failed requests
3. Cache responses when appropriate
4. Monitor API usage and performance
`;
  }

  /**
   * Generate request schema documentation
   */
  generateRequestSchema(requestType) {
    if (!requestType || !requestType.properties) {
      return 'No request parameters.';
    }

    let markdown = '#### Parameters\n\n';
    markdown += '| Parameter | Type | Required | Description |\n';
    markdown += '|-----------|------|----------|-------------|\n';

    for (const [name, prop] of Object.entries(requestType.properties)) {
      const required = requestType.required?.includes(name) ? 'Yes' : 'No';
      const type = typeof prop.type === 'object' ? JSON.stringify(prop.type) : prop.type;
      markdown += `| \`${name}\` | ${type} | ${required} | ${prop.description || 'No description'} |\n`;
    }

    return markdown;
  }

  /**
   * Generate example response
   */
  generateExampleResponse(func) {
    return {
      success: true,
      message: `${func.summary} completed successfully`,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'completed'
      }
    };
  }

  /**
   * Generate JavaScript example
   */
  generateJavaScriptExample(func) {
    const functionName = func.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    return `async function ${functionName}(params) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/functions/v1${func.path}', {
    method: '${func.method}',
    headers: {
      'Authorization': \`Bearer \${session?.access_token}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return await response.json();
}`;
  }

  /**
   * Generate cURL example
   */
  generateCurlExample(func) {
    return `curl -X ${func.method} \\
  https://your-project.supabase.co/functions/v1${func.path} \\
  -H "Authorization: Bearer <your_jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "example": "request_data"
  }'`;
  }

  /**
   * Generate code examples for different languages
   */
  async generateCodeExamples(functions) {
    const examplesDir = path.join(this.docsDir, 'examples');
    
    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir, { recursive: true });
    }

    // Generate SDK examples
    const sdkExamples = this.generateSDKExamples(functions);
    fs.writeFileSync(
      path.join(examplesDir, 'sdk-examples.md'),
      sdkExamples
    );

    // Generate integration examples
    const integrationExamples = this.generateIntegrationExamples(functions);
    fs.writeFileSync(
      path.join(examplesDir, 'integration-examples.md'),
      integrationExamples
    );

    console.log('💻 Generated code examples');
  }

  /**
   * Generate SDK usage examples
   */
  generateSDKExamples(functions) {
    return `# SDK Examples

## JavaScript/TypeScript SDK

\`\`\`bash
npm install @cmoxpert/sdk
\`\`\`

\`\`\`typescript
import { CmoxpertClient } from '@cmoxpert/sdk';

const client = new CmoxpertClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://your-project.supabase.co/functions/v1'
});

${functions.map(func => `
// ${func.summary}
const ${func.name.replace(/-/g, '')}Result = await client.${func.name.replace(/-/g, '')}({
  // Add parameters here
});`).join('\n')}
\`\`\`

## Python SDK

\`\`\`bash
pip install cmoxpert-python
\`\`\`

\`\`\`python
from cmoxpert import CmoxpertClient

client = CmoxpertClient(api_key='your_api_key')

${functions.map(func => `
# ${func.summary}
result = client.${func.name.replace(/-/g, '_')}(
    # Add parameters here
)`).join('\n')}
\`\`\`
`;
  }

  /**
   * Generate integration examples
   */
  generateIntegrationExamples(functions) {
    return `# Integration Examples

## React Hook Integration

\`\`\`typescript
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useCmoxpertAPI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (endpoint: string, data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(\`/functions/v1\${endpoint}\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${session?.access_token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
      
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading, error };
}
\`\`\`

## Express.js Middleware

\`\`\`javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Middleware for cmoxpert API calls
async function cmoxpertProxy(req, res, next) {
  try {
    const response = await fetch(\`\${process.env.SUPABASE_URL}/functions/v1\${req.path}\`, {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'PROXY_ERROR',
        message: 'Failed to proxy request to cmoxpert API'
      }
    });
  }
}

app.use('/api/cmoxpert', cmoxpertProxy);
\`\`\`

## Webhook Handler

\`\`\`javascript
// Webhook endpoint for cmoxpert events
app.post('/webhooks/cmoxpert', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-cmoxpert-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  switch (event.event) {
    case 'analysis.completed':
      handleAnalysisCompleted(event.data);
      break;
    case 'playbook.generated':
      handlePlaybookGenerated(event.data);
      break;
    default:
      console.log('Unknown event type:', event.event);
  }
  
  res.status(200).send('OK');
});
\`\`\`
`;
  }

  /**
   * Validate generated documentation
   */
  async validateDocumentation() {
    try {
      // Validate OpenAPI spec
      const specPath = path.join(this.docsDir, 'schemas/openapi.yaml');
      
      if (fs.existsSync(specPath)) {
        const specContent = fs.readFileSync(specPath, 'utf8');
        yaml.load(specContent); // This will throw if invalid YAML
        console.log('✅ OpenAPI spec is valid');
      }

      // Check for required documentation files
      const requiredFiles = [
        'README.md',
        'examples/error-handling.md',
        'tools/postman-collection.json'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(this.docsDir, file);
        if (!fs.existsSync(filePath)) {
          console.warn(`⚠️  Missing required file: ${file}`);
        }
      }

      console.log('✅ Documentation validation completed');
      
    } catch (error) {
      console.error('❌ Documentation validation failed:', error);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const generator = new DocumentationGenerator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
      generator.generate();
      break;
    case 'validate':
      generator.validateDocumentation();
      break;
    default:
      console.log('Usage: node documentation-generator.js [generate|validate]');
      process.exit(1);
  }
}

module.exports = DocumentationGenerator;