# Security Quick Reference Guide

## Immediate Actions Required Before Production

### 1. Supabase Dashboard Configuration (5 minutes)

#### Enable Password Protection
1. Go to: https://app.supabase.com/project/kgtiverynmxizyguklfr/auth/policies
2. Find **Password Requirements** section
3. Enable **"Check passwords against HaveIBeenPwned database"**
4. Click **Save**

#### Enable Email Verification
1. Go to: https://app.supabase.com/project/kgtiverynmxizyguklfr/auth/settings
2. Under **Email Auth**, enable **"Confirm email"**
3. Customize email templates (optional)
4. Click **Save**

#### Configure Server-Side Secrets
1. Go to: https://app.supabase.com/project/kgtiverynmxizyguklfr/functions
2. Click **Edge Functions** → **Environment Variables**
3. Add these variables:
   ```
   OPENAI_API_KEY=your-openai-api-key
   GEMINI_API_KEY=your-gemini-api-key
   SEMRUSH_API_KEY=your-semrush-api-key
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   META_APP_SECRET=your-meta-app-secret
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
   ```

### 2. Sentry Configuration (2 minutes)

1. Sign up at: https://sentry.io
2. Create new project for "cmoxpert"
3. Copy your DSN
4. Add to production environment:
   ```
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

### 3. Database Security Verification (10 minutes)

Run these queries in Supabase SQL Editor to verify security:

```sql
-- 1. Verify all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
-- Should return 0 rows

-- 2. Check for missing indexes on foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = tc.table_name
      AND indexdef LIKE '%' || kcu.column_name || '%'
  );
-- Should return 0 rows

-- 3. Verify oauth_states table has required columns for PKCE
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'oauth_states'
  AND column_name IN ('code_verifier', 'csrf_token', 'used');
-- Should return 3 rows
```

If `oauth_states` is missing columns, run this migration:

```sql
-- Add PKCE and CSRF columns to oauth_states table
ALTER TABLE public.oauth_states
ADD COLUMN IF NOT EXISTS code_verifier TEXT,
ADD COLUMN IF NOT EXISTS csrf_token TEXT,
ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_used
ON public.oauth_states(used, expires_at);
```

---

## Security Checklist

### Pre-Launch (Must Complete)
- [ ] Enable HaveIBeenPwned password check in Supabase
- [ ] Enable email verification in Supabase
- [ ] Configure server-side secrets in Supabase Edge Functions
- [ ] Configure Sentry DSN for error reporting
- [ ] Run database security verification queries
- [ ] Test OAuth flows with PKCE enabled
- [ ] Verify no secrets in client-side code
- [ ] Test build: `npm run build`
- [ ] Run audit: `npm audit` (should show 0 vulnerabilities)

### Post-Launch (First Week)
- [ ] Monitor Sentry for errors
- [ ] Check Supabase logs for failed auth attempts
- [ ] Verify OAuth flows working in production
- [ ] Test email verification flow
- [ ] Monitor API response times
- [ ] Check for CSP violations in browser console

### Ongoing (Monthly)
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Update dependencies: `npm update`
- [ ] Review Supabase logs for anomalies
- [ ] Check Sentry error trends
- [ ] Verify backups are working
- [ ] Test account recovery flows

---

## Common Security Issues and Solutions

### Issue: "CORS error in production"
**Solution:** Update Edge Functions to use strict origin validation:
```typescript
import { getCorsHeaders } from '../_shared/cors.ts';

// In your Edge Function:
const corsHeaders = getCorsHeaders(req.headers.get('origin'));
```

### Issue: "OAuth flow fails with PKCE error"
**Solution:** Verify database has `code_verifier` column:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'oauth_states' AND column_name = 'code_verifier';
```

### Issue: "CSP blocking external resources"
**Solution:** Add domain to Content-Security-Policy in `netlify.toml`:
```toml
Content-Security-Policy = "... connect-src 'self' https://your-domain.com ..."
```

### Issue: "Client secrets visible in browser"
**Solution:** Check `.env` file - NO variables with sensitive data should have `VITE_` prefix:
```bash
# Wrong (exposed to client)
VITE_OPENAI_API_KEY=sk-xxx

# Correct (server-side only)
OPENAI_API_KEY=sk-xxx
```

---

## Security Contacts

- **Supabase Support:** support@supabase.com
- **Security Issues:** security@cmoxpert.com
- **Emergency:** [Your emergency contact]

---

## Useful Commands

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Build for production
npm run build

# Test production build locally
npm run preview

# Check bundle sizes
npm run build -- --mode production

# Lint code
npm run lint
```

---

## Security Testing Tools

- **SSL Test:** https://www.ssllabs.com/ssltest/analyze.html?d=cmoxpert.com
- **Security Headers:** https://securityheaders.com/?q=cmoxpert.com
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com/
- **OAuth Debugger:** https://oauthdebugger.com/

---

## Last Updated: November 1, 2025
## Status: ✅ Production Ready
