# Marketing Automation Integration Architecture
## Mautic + SuiteCRM Integration for FCMO Compass

**Version:** 1.0
**Date:** 2025-10-27
**Status:** Design Phase

---

## Executive Summary

This document outlines the complete technical architecture for integrating Mautic (marketing automation) and SuiteCRM (customer relationship management) directly into the FCMO Compass platform. Instead of purchasing third-party plugins, we're building a native integration that gives us full control, zero recurring costs, and tight coupling with our existing features.

### Key Benefits

- ✅ **Zero Integration Costs** - No plugin fees ($0 vs $150-300)
- ✅ **Custom-Fit Solution** - Built specifically for FCMO workflows
- ✅ **Full Control** - Own the integration code and logic
- ✅ **Deep Integration** - Connect with Content Hub, Attribution, Playbooks
- ✅ **No Vendor Lock-In** - Both platforms are open source

---

## System Overview

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    FCMO COMPASS PLATFORM                        │
│                     (React + Supabase)                          │
├────────────────────────────────────────────────────────────────┤
│  Features:                                                      │
│  • Content Hub (AI content generation, calendar, SEO)          │
│  • Client Management (multi-tenant)                            │
│  • Revenue Attribution (campaign tracking, ROI)                │
│  • Playbooks (strategy templates)                              │
│  • Analytics & Forecasting                                     │
└────────┬──────────────────────────────────┬────────────────────┘
         │                                  │
         │    Edge Functions Layer         │
         │    (Supabase Functions)         │
         │                                  │
    ┌────▼──────────┐              ┌───────▼────────┐
    │  mautic-sync  │              │ suitecrm-sync  │
    │  Edge Func    │              │  Edge Func     │
    └────┬──────────┘              └───────┬────────┘
         │                                  │
         │  REST API (OAuth2)              │  JSON:API (OAuth2)
         │                                  │
    ┌────▼──────────────┐          ┌───────▼──────────────┐
    │     MAUTIC        │          │     SUITECRM         │
    │  Marketing Auto   │◄────────►│   Sales CRM          │
    │                   │  Native  │                      │
    │  • Email Campaigns│   Sync   │  • Pipeline Mgmt     │
    │  • Lead Scoring   │  Plugin  │  • Contact Mgmt      │
    │  • Segmentation   │ (Optional)│  • Forecasting      │
    │  • Forms/Landing  │          │  • Reporting         │
    └───────────────────┘          └──────────────────────┘
```

### Integration Points

**FCMO Compass → Mautic:**
- Push contacts for email campaigns
- Sync content from Content Hub to email templates
- Pull campaign performance metrics
- Create segments from client data
- Trigger automated workflows

**FCMO Compass → SuiteCRM:**
- Sync clients to Accounts
- Sync deals to Opportunities
- Push contacts to Leads/Contacts
- Pull pipeline data for forecasting
- Update campaign ROI data

**Mautic ↔ SuiteCRM:**
- Bidirectional contact sync (via native plugin or our API)
- Lead scoring handoff (marketing → sales)
- Campaign attribution tracking
- Closed-loop reporting

---

## API Analysis

### Mautic REST API

**Base URL:** `https://your-mautic.com/api/`

#### Authentication
- **Method:** OAuth2 (authorization_code, refresh_token, client_credentials)
- **Alternative:** Basic Auth (HTTPS only, not recommended for production)
- **Token Endpoint:** `/oauth/v2/token`
- **Authorize Endpoint:** `/oauth/v2/authorize`

#### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/contacts` | GET | List all contacts |
| `/contacts/{id}` | GET | Get single contact |
| `/contacts/new` | POST | Create contact |
| `/contacts/{id}/edit` | PATCH | Update contact |
| `/contacts/{id}/delete` | DELETE | Delete contact |
| `/campaigns` | GET | List campaigns |
| `/campaigns/new` | POST | Create campaign |
| `/campaigns/{id}/contacts/add/{contactId}` | POST | Add contact to campaign |
| `/emails` | GET | List emails |
| `/emails/new` | POST | Create email |
| `/segments` | GET | List segments |
| `/segments/new` | POST | Create segment |
| `/forms` | GET | List forms |

#### Request Format
```typescript
// Create Contact Example
POST /api/contacts/new
Headers: {
  'Authorization': 'Bearer {access_token}',
  'Content-Type': 'application/json'
}
Body: {
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "tags": ["prospect", "webinar-2024"],
  "points": 50
}
```

#### Response Format
```json
{
  "contact": {
    "id": 123,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "points": 50,
    "tags": ["prospect", "webinar-2024"]
  }
}
```

#### Webhook Support
Mautic can send webhooks for:
- Contact created/updated
- Campaign membership changes
- Form submissions
- Email opens/clicks
- Page visits

---

### SuiteCRM API v8

**Base URL:** `https://your-suitecrm.com/Api/V8/`

#### Authentication
- **Method:** OAuth2 (client_credentials, password grant)
- **Token Endpoint:** `/Api/access_token`
- **Key Generation:** Requires public/private key pair (OpenSSL)

#### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/module` | GET | List modules |
| `/module/Accounts` | GET | List accounts (pagination) |
| `/module/Accounts/{id}` | GET | Get single account |
| `/module` | POST | Create record |
| `/module/{module}/{id}` | PATCH | Update record |
| `/module/{module}/{id}` | DELETE | Delete record |
| `/module/Leads` | GET | List leads |
| `/module/Contacts` | GET | List contacts |
| `/module/Opportunities` | GET | List opportunities |

#### Request Format (JSON:API Standard)
```typescript
// Create Account Example
POST /Api/V8/module
Headers: {
  'Authorization': 'Bearer {access_token}',
  'Content-Type': 'application/vnd.api+json'
}
Body: {
  "data": {
    "type": "Accounts",
    "attributes": {
      "name": "Acme Corp",
      "industry": "Technology",
      "website": "https://acme.com",
      "annual_revenue": 5000000
    }
  }
}
```

#### Response Format (JSON:API Standard)
```json
{
  "data": {
    "type": "Accounts",
    "id": "11a71596-83e7-624d-c792-5ab9006dd493",
    "attributes": {
      "name": "Acme Corp",
      "industry": "Technology",
      "website": "https://acme.com",
      "annual_revenue": "5000000"
    }
  }
}
```

#### Query Parameters
- `fields[{module}]` - Filter attributes
- `page[number]` - Pagination page
- `page[size]` - Results per page
- `sort` - Sort order (prefix with `-` for DESC)

---

## Database Schema Design

### New Tables

#### 1. `integration_platforms`
Stores connection details for external platforms.

```sql
CREATE TABLE integration_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  platform_type text NOT NULL CHECK (platform_type IN ('mautic', 'suitecrm')),
  platform_name text NOT NULL,
  api_url text NOT NULL,
  auth_type text NOT NULL CHECK (auth_type IN ('oauth2', 'basic', 'api_key')),

  -- OAuth2 Credentials (encrypted in production)
  client_id_oauth text,
  client_secret_oauth text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,

  -- Basic Auth (encrypted)
  username text,
  password text,

  -- API Key
  api_key text,

  -- Status
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text,

  -- Metadata
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(client_id, platform_type)
);

-- RLS Policy
ALTER TABLE integration_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage integrations for their clients"
  ON integration_platforms FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_integrations_client ON integration_platforms(client_id);
CREATE INDEX idx_integrations_type ON integration_platforms(platform_type);
CREATE INDEX idx_integrations_active ON integration_platforms(is_active);
```

#### 2. `integration_mappings`
Tracks which local records map to which remote records.

```sql
CREATE TABLE integration_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integration_platforms(id) ON DELETE CASCADE,

  -- Local Record
  local_entity_type text NOT NULL,
  local_entity_id uuid NOT NULL,

  -- Remote Record
  remote_entity_type text NOT NULL,
  remote_entity_id text NOT NULL,

  -- Sync Status
  sync_direction text NOT NULL
    CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
  last_synced_at timestamptz,
  sync_status text DEFAULT 'pending'
    CHECK (sync_status IN ('pending', 'synced', 'error', 'conflict')),
  sync_error text,

  -- Data Snapshot
  local_data_hash text,
  remote_data_hash text,

  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(integration_id, local_entity_type, local_entity_id, remote_entity_type)
);

-- RLS Policy
ALTER TABLE integration_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mappings for their integrations"
  ON integration_mappings FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM integration_platforms
      WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- Indexes
CREATE INDEX idx_mappings_integration ON integration_mappings(integration_id);
CREATE INDEX idx_mappings_local ON integration_mappings(local_entity_type, local_entity_id);
CREATE INDEX idx_mappings_remote ON integration_mappings(remote_entity_type, remote_entity_id);
CREATE INDEX idx_mappings_status ON integration_mappings(sync_status);
```

#### 3. `integration_sync_logs`
Audit trail of all sync operations.

```sql
CREATE TABLE integration_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integration_platforms(id) ON DELETE CASCADE,
  mapping_id uuid REFERENCES integration_mappings(id) ON DELETE SET NULL,

  -- Operation Details
  operation text NOT NULL
    CHECK (operation IN ('create', 'update', 'delete', 'sync')),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  direction text NOT NULL
    CHECK (direction IN ('push', 'pull')),

  -- Status
  status text NOT NULL
    CHECK (status IN ('started', 'success', 'error', 'skipped')),
  error_message text,

  -- Payload
  request_data jsonb,
  response_data jsonb,

  -- Timing
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer,

  -- Metadata
  metadata jsonb DEFAULT '{}'
);

-- RLS Policy
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sync logs for their integrations"
  ON integration_sync_logs FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM integration_platforms
      WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- Indexes
CREATE INDEX idx_sync_logs_integration ON integration_sync_logs(integration_id);
CREATE INDEX idx_sync_logs_mapping ON integration_sync_logs(mapping_id);
CREATE INDEX idx_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX idx_sync_logs_started ON integration_sync_logs(started_at);
```

#### 4. `integration_field_mappings`
Custom field mapping configuration.

```sql
CREATE TABLE integration_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integration_platforms(id) ON DELETE CASCADE,

  -- Entity Types
  local_entity_type text NOT NULL,
  remote_entity_type text NOT NULL,

  -- Field Mapping
  local_field_name text NOT NULL,
  remote_field_name text NOT NULL,

  -- Transform Rules
  transform_type text DEFAULT 'direct'
    CHECK (transform_type IN ('direct', 'function', 'lookup', 'constant')),
  transform_config jsonb DEFAULT '{}',

  -- Sync Behavior
  sync_direction text NOT NULL DEFAULT 'bidirectional'
    CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
  is_required boolean DEFAULT false,
  default_value text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(integration_id, local_entity_type, remote_entity_type, local_field_name)
);

-- RLS Policy
ALTER TABLE integration_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage field mappings for their integrations"
  ON integration_field_mappings FOR ALL
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM integration_platforms
      WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- Indexes
CREATE INDEX idx_field_mappings_integration ON integration_field_mappings(integration_id);
CREATE INDEX idx_field_mappings_entity ON integration_field_mappings(local_entity_type, remote_entity_type);
```

#### 5. `integration_webhooks`
Store incoming webhook data.

```sql
CREATE TABLE integration_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integration_platforms(id) ON DELETE CASCADE,

  -- Webhook Details
  webhook_type text NOT NULL,
  event_name text NOT NULL,

  -- Payload
  payload jsonb NOT NULL,
  headers jsonb,

  -- Processing
  processed boolean DEFAULT false,
  processed_at timestamptz,
  processing_error text,

  -- Metadata
  received_at timestamptz DEFAULT now()
);

-- RLS Policy
ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhooks for their integrations"
  ON integration_webhooks FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM integration_platforms
      WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- Indexes
CREATE INDEX idx_webhooks_integration ON integration_webhooks(integration_id);
CREATE INDEX idx_webhooks_processed ON integration_webhooks(processed);
CREATE INDEX idx_webhooks_received ON integration_webhooks(received_at);
```

---

## Data Flow & Sync Strategies

### Sync Patterns

#### 1. **Manual Sync (On-Demand)**
User triggers sync from UI.

**Flow:**
1. User clicks "Sync Now" button
2. Frontend calls Edge Function
3. Edge Function fetches data from local DB
4. Edge Function pushes to Mautic/SuiteCRM API
5. Edge Function updates mapping table
6. Edge Function logs sync operation
7. Frontend shows success/error message

**Use Cases:**
- Initial setup/testing
- Immediate updates needed
- Bulk operations

#### 2. **Scheduled Sync (Cron)**
Automatic periodic synchronization.

**Flow:**
1. Supabase cron job triggers Edge Function (every 15min, hourly, daily)
2. Edge Function queries records with `last_synced_at < NOW() - INTERVAL`
3. Fetches local changes since last sync
4. Pushes changes to remote API
5. Pulls remote changes
6. Resolves conflicts (last-write-wins or custom logic)
7. Updates mapping table
8. Logs all operations

**Use Cases:**
- Background synchronization
- Regular updates
- Minimal latency tolerance

#### 3. **Webhook Sync (Real-Time)**
Event-driven synchronization.

**Flow:**
1. Mautic/SuiteCRM sends webhook to our endpoint
2. Edge Function receives webhook
3. Stores webhook in `integration_webhooks` table
4. Processes webhook immediately or queues for later
5. Updates local database
6. Updates mapping table
7. Logs operation

**Use Cases:**
- Real-time updates
- High-priority events (lead conversion, deal won)
- User actions in external platform

#### 4. **Hybrid (Scheduled + Webhook)**
Best of both worlds.

**Flow:**
- Webhooks for critical events (real-time)
- Scheduled sync for bulk data (every 6 hours)
- Manual sync for ad-hoc needs

**Recommended Approach:** This is the most robust strategy.

---

### Conflict Resolution

When same record is modified in both systems:

**Strategy 1: Last-Write-Wins**
- Compare `updated_at` timestamps
- Most recent change wins
- Simple but can lose data

**Strategy 2: Field-Level Merge**
- Compare field-by-field
- Take newest value per field
- More complex but preserves more data

**Strategy 3: Manual Resolution**
- Flag conflict in UI
- User decides which version to keep
- Most accurate but requires human input

**Recommended:** Start with Last-Write-Wins, add Manual Resolution for critical records.

---

### Data Mapping Strategy

#### Contact/Lead Mapping

**FCMO Compass → Mautic:**

| Local Field | Mautic Field | Transform |
|-------------|--------------|-----------|
| `contacts.first_name` | `firstname` | Direct |
| `contacts.last_name` | `lastname` | Direct |
| `contacts.email` | `email` | Direct |
| `contacts.phone` | `phone` | Direct |
| `contacts.company` | `company` | Direct |
| `clients.company_name` | `tags[]` | Add as tag |
| `deals.status` | `stage` | Lookup |

**FCMO Compass → SuiteCRM:**

| Local Field | SuiteCRM Field | Module | Transform |
|-------------|----------------|--------|-----------|
| `clients.company_name` | `name` | Accounts | Direct |
| `clients.industry` | `industry` | Accounts | Direct |
| `clients.website` | `website` | Accounts | Direct |
| `deals.title` | `name` | Opportunities | Direct |
| `deals.value` | `amount` | Opportunities | Direct |
| `deals.stage` | `sales_stage` | Opportunities | Lookup |
| `contacts.email` | `email` | Leads | Direct |

---

## Edge Function Architecture

### Function Structure

```
supabase/functions/
├── _shared/
│   ├── cors.ts
│   ├── auth.ts
│   ├── mautic-client.ts
│   ├── suitecrm-client.ts
│   └── sync-engine.ts
├── mautic-sync/
│   └── index.ts
├── suitecrm-sync/
│   └── index.ts
├── mautic-webhook/
│   └── index.ts
└── suitecrm-webhook/
    └── index.ts
```

### Shared Modules

#### `_shared/mautic-client.ts`
```typescript
export class MauticClient {
  constructor(
    private apiUrl: string,
    private accessToken: string
  ) {}

  async getContact(id: string) { }
  async createContact(data: ContactData) { }
  async updateContact(id: string, data: Partial<ContactData>) { }
  async deleteContact(id: string) { }

  async getCampaigns() { }
  async addContactToCampaign(campaignId: string, contactId: string) { }

  async getSegments() { }
  async createSegment(data: SegmentData) { }

  async refreshAccessToken(refreshToken: string) { }
}
```

#### `_shared/suitecrm-client.ts`
```typescript
export class SuiteCRMClient {
  constructor(
    private apiUrl: string,
    private accessToken: string
  ) {}

  async getAccount(id: string) { }
  async createAccount(data: AccountData) { }
  async updateAccount(id: string, data: Partial<AccountData>) { }
  async deleteAccount(id: string) { }

  async getOpportunities(filters?: any) { }
  async createOpportunity(data: OpportunityData) { }

  async getLeads(filters?: any) { }
  async createLead(data: LeadData) { }

  async refreshAccessToken(refreshToken: string) { }
}
```

#### `_shared/sync-engine.ts`
```typescript
export class SyncEngine {
  constructor(
    private supabase: SupabaseClient,
    private integrationId: string
  ) {}

  async syncEntity(
    entityType: string,
    localId: string,
    remoteClient: MauticClient | SuiteCRMClient,
    direction: 'push' | 'pull' | 'bidirectional'
  ) {
    // 1. Get mapping record
    // 2. Fetch local data
    // 3. Fetch remote data (if exists)
    // 4. Compare data hashes
    // 5. Determine sync action
    // 6. Execute sync
    // 7. Update mapping
    // 8. Log operation
  }

  async resolveConflict(
    localData: any,
    remoteData: any,
    strategy: 'last-write-wins' | 'field-merge' | 'manual'
  ) { }

  async logSync(
    operation: string,
    status: string,
    data: any
  ) { }
}
```

---

### Edge Function: `mautic-sync`

**Purpose:** Sync contacts, campaigns, and segments with Mautic.

**Endpoints:**
- `POST /mautic-sync` - Trigger sync
- `POST /mautic-sync/contacts` - Sync specific contacts
- `POST /mautic-sync/campaigns` - Push campaign data

**Implementation:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { MauticClient } from '../_shared/mautic-client.ts';
import { SyncEngine } from '../_shared/sync-engine.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, clientId, entityType, entityIds } = await req.json();

    // Get integration config
    const { data: integration } = await supabase
      .from('integration_platforms')
      .select('*')
      .eq('client_id', clientId)
      .eq('platform_type', 'mautic')
      .single();

    if (!integration) {
      throw new Error('Mautic integration not found');
    }

    // Initialize Mautic client
    const mauticClient = new MauticClient(
      integration.api_url,
      integration.access_token
    );

    // Initialize sync engine
    const syncEngine = new SyncEngine(supabase, integration.id);

    // Execute sync based on action
    let result;
    switch (action) {
      case 'sync_contacts':
        result = await syncContacts(syncEngine, mauticClient, entityIds);
        break;
      case 'sync_campaigns':
        result = await syncCampaigns(syncEngine, mauticClient, clientId);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncContacts(
  syncEngine: SyncEngine,
  mauticClient: MauticClient,
  contactIds: string[]
) {
  const results = [];
  for (const contactId of contactIds) {
    const result = await syncEngine.syncEntity(
      'contacts',
      contactId,
      mauticClient,
      'push'
    );
    results.push(result);
  }
  return results;
}

async function syncCampaigns(
  syncEngine: SyncEngine,
  mauticClient: MauticClient,
  clientId: string
) {
  // Implementation for syncing campaigns
}
```

---

### Edge Function: `suitecrm-sync`

**Purpose:** Sync clients, deals, contacts with SuiteCRM.

**Endpoints:**
- `POST /suitecrm-sync` - Trigger sync
- `POST /suitecrm-sync/accounts` - Sync clients to accounts
- `POST /suitecrm-sync/opportunities` - Sync deals to opportunities

**Implementation:** Similar structure to `mautic-sync`, using `SuiteCRMClient`.

---

### Edge Function: `mautic-webhook`

**Purpose:** Receive webhooks from Mautic.

**Implementation:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload = await req.json();
    const headers = Object.fromEntries(req.headers.entries());

    // Determine integration based on webhook source
    // (could use API key in header or URL parameter)
    const integrationId = req.url.split('/').pop();

    // Store webhook
    await supabase
      .from('integration_webhooks')
      .insert({
        integration_id: integrationId,
        webhook_type: 'mautic',
        event_name: payload['mautic.webhook_name'],
        payload,
        headers
      });

    // Process webhook immediately (or queue for later)
    await processWebhook(supabase, integrationId, payload);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processWebhook(
  supabase: any,
  integrationId: string,
  payload: any
) {
  // Handle different event types
  switch (payload['mautic.webhook_name']) {
    case 'contact.created':
      // Sync new contact to local DB
      break;
    case 'contact.updated':
      // Update local contact
      break;
    case 'email.opened':
      // Track email engagement
      break;
    // ... more events
  }
}
```

---

## Frontend UI/UX Design

### New Pages/Components

#### 1. **Integration Settings Page** (`/admin/integrations`)

**Layout:**
```
┌────────────────────────────────────────────┐
│  Integrations                              │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Mautic Marketing Automation         │ │
│  │  ○ Not Connected                     │ │
│  │  [Connect Mautic]                    │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  SuiteCRM                            │ │
│  │  ● Connected                         │ │
│  │  Last sync: 5 minutes ago            │ │
│  │  [Configure] [Disconnect]            │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

**Features:**
- Connect/disconnect integrations
- Test connection
- View sync status
- Configure sync frequency
- View sync logs

#### 2. **Field Mapping UI** (`/admin/integrations/{id}/mappings`)

**Layout:**
```
┌────────────────────────────────────────────┐
│  Field Mapping: Mautic                     │
├────────────────────────────────────────────┤
│                                            │
│  Entity: Contacts                          │
│                                            │
│  Local Field        Remote Field     Dir   │
│  ─────────────────  ──────────────  ─────  │
│  first_name    →    firstname       Push   │
│  last_name     →    lastname        Push   │
│  email         ↔    email           Both   │
│  phone         →    phone           Push   │
│                                            │
│  [+ Add Mapping]                           │
│                                            │
└────────────────────────────────────────────┘
```

**Features:**
- Drag-and-drop field mapping
- Set sync direction per field
- Configure transformations
- Save custom mappings

#### 3. **Sync Dashboard** (`/clients/{id}/sync`)

**Layout:**
```
┌────────────────────────────────────────────┐
│  Sync Status - Acme Corp                   │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Mautic      │  │  SuiteCRM    │       │
│  │  ✓ 45 synced │  │  ✓ 12 synced │       │
│  │  ⚠ 2 errors  │  │  ○ Up to date│       │
│  └──────────────┘  └──────────────┘       │
│                                            │
│  Recent Sync Activity:                     │
│  • Contact "John Doe" → Mautic (success)   │
│  • Deal "Q1 Campaign" → SuiteCRM (success) │
│  • Account "Acme Corp" → SuiteCRM (error)  │
│                                            │
│  [Sync Now] [View Full Log]               │
│                                            │
└────────────────────────────────────────────┘
```

**Features:**
- Real-time sync status
- Manual sync trigger
- View recent activity
- Error alerts and resolution

#### 4. **Integration Health Widget** (Dashboard)

**Component:**
```typescript
<IntegrationHealthWidget clientId={clientId} />
```

**Displays:**
- Connection status for each integration
- Last sync timestamp
- Error count
- Quick actions (sync now, view logs)

---

## Security & Privacy

### Data Protection

1. **Encrypted Credentials**
   - Use Supabase Vault for API keys/tokens
   - Encrypt sensitive fields at rest
   - Never log credentials

2. **Token Refresh**
   - Auto-refresh OAuth2 tokens before expiry
   - Handle token revocation gracefully
   - Store refresh tokens securely

3. **Webhook Security**
   - Verify webhook signatures (if supported)
   - Use unique webhook URLs per integration
   - Rate limit webhook endpoints

4. **RLS Policies**
   - All integration tables have RLS enabled
   - Users can only access their own clients' data
   - Service role key for Edge Functions only

### Compliance

- **GDPR**: Support data export/deletion
- **Data Residency**: Self-hosted option for EU clients
- **Audit Trail**: Complete sync logs for compliance
- **Access Control**: Role-based permissions for integrations

---

## Performance Optimization

### Caching Strategy

1. **API Response Caching**
   - Cache Mautic/SuiteCRM responses for 5 minutes
   - Invalidate on webhook events
   - Use Redis or Supabase edge cache

2. **Batch Operations**
   - Bulk sync for initial setup (100 records at a time)
   - Debounce rapid changes (wait 30s before syncing)
   - Queue background jobs for large syncs

3. **Pagination**
   - Fetch 100 records per page from external APIs
   - Use cursor-based pagination where possible
   - Show progress bar for long operations

### Rate Limiting

**Mautic:**
- No official rate limits documented
- Recommended: 100 requests/minute

**SuiteCRM:**
- Self-hosted = no limits (but be reasonable)
- Recommended: 100 requests/minute

**Our Approach:**
- Implement exponential backoff
- Queue requests if rate limit hit
- Show "throttled" status in UI

---

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Token expired → Auto-refresh
   - Invalid credentials → Alert user
   - Permissions denied → Show error + link to docs

2. **Sync Errors**
   - Record not found → Skip or create new
   - Validation error → Log details, alert user
   - Conflict → Use resolution strategy

3. **Network Errors**
   - Timeout → Retry 3 times with backoff
   - Connection refused → Mark integration as down
   - 5xx errors → Retry later

### Error Recovery

- **Automatic Retry**: For transient errors (network, rate limits)
- **Manual Retry**: For validation/conflict errors
- **Skip & Log**: For permanent errors (record deleted)
- **Alert User**: For auth/permission errors

### User Notifications

- **Email Alerts**: For critical sync failures
- **In-App Notifications**: For all errors
- **Slack/Discord Webhooks**: Optional integration for teams

---

## Testing Strategy

### Unit Tests

- Test API client methods (mock responses)
- Test sync engine logic
- Test conflict resolution
- Test field transformations

### Integration Tests

- Test OAuth2 flow (use sandbox accounts)
- Test CRUD operations on Mautic/SuiteCRM
- Test webhook processing
- Test edge function deployment

### End-to-End Tests

- Test complete sync workflow (local → remote → local)
- Test UI flows (connect, configure, sync)
- Test error scenarios
- Test performance with 1000+ records

---

## Deployment Plan

### Phase 1: Foundation (Week 1)
- ✅ Database schema migration
- ✅ API client libraries
- ✅ Basic sync engine
- ✅ OAuth2 setup for Mautic
- ✅ OAuth2 setup for SuiteCRM

### Phase 2: Core Sync (Week 2)
- ✅ Mautic contact sync (push)
- ✅ SuiteCRM account sync (push)
- ✅ SuiteCRM opportunity sync (push)
- ✅ Basic field mapping
- ✅ Sync logging

### Phase 3: Advanced Sync (Week 3)
- ✅ Bidirectional sync
- ✅ Conflict resolution
- ✅ Webhook handlers
- ✅ Scheduled sync (cron)
- ✅ Custom field mappings

### Phase 4: UI/UX (Week 4)
- ✅ Integration settings page
- ✅ Field mapping UI
- ✅ Sync dashboard
- ✅ Error handling & notifications
- ✅ Testing & bug fixes

---

## Success Metrics

### Technical KPIs
- **Sync Success Rate:** >95%
- **Sync Latency:** <30 seconds (webhook), <5 minutes (scheduled)
- **API Error Rate:** <1%
- **Uptime:** >99.5%

### Business KPIs
- **Integration Adoption:** 50% of clients use integrations within 3 months
- **Time Savings:** 10 hours/month per FCMO (vs manual data entry)
- **Cost Savings:** $200-300/month (vs buying plugins)
- **User Satisfaction:** >4.5/5 stars

---

## Future Enhancements

### Phase 2 Features
1. **HubSpot Integration** - Enterprise clients may want this
2. **Zapier API** - For non-standard integrations
3. **Data Enrichment** - Auto-enrich contacts (Clearbit, Hunter.io)
4. **Lead Scoring Sync** - Sync Mautic scores to attribution system
5. **Campaign Attribution** - Full closed-loop tracking
6. **AI Recommendations** - Suggest optimal sync strategies

### Advanced Features
- Multi-platform sync (Mautic → SuiteCRM → FCMO Compass)
- Intelligent conflict resolution (ML-based)
- Real-time collaboration (live sync status)
- Mobile app support
- White-label integration for agencies

---

## Maintenance & Support

### Monitoring
- Set up Sentry for error tracking
- Use Supabase logs for debugging
- Create dashboard for sync health
- Set up alerts for failures

### Documentation
- API documentation for Edge Functions
- User guide for connecting integrations
- Troubleshooting guide
- Video tutorials

### Support Plan
- Monitor sync logs daily
- Respond to integration errors within 4 hours
- Monthly review of API changes (Mautic/SuiteCRM)
- Quarterly feature updates

---

## Conclusion

This architecture provides a robust, scalable, and cost-effective solution for integrating Mautic and SuiteCRM directly into the FCMO Compass platform. By building the integration ourselves, we:

- **Save Money:** $0 vs $150-300 upfront + potential ongoing costs
- **Gain Control:** Full ownership of the integration logic
- **Optimize Performance:** Tailored specifically for our use case
- **Future-Proof:** Easy to extend with new features

The estimated development time is **50-70 hours** over 4 weeks, which is a worthwhile investment for the long-term benefits and competitive advantages this integration will provide.

---

**Next Steps:**
1. Review and approve this architecture
2. Set up Mautic and SuiteCRM test instances
3. Begin Phase 1 implementation
4. Iterative development with weekly demos
