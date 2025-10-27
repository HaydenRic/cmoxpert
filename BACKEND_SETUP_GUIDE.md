# Backend Setup Guide - First Steps

This guide walks you through setting up the cmoxpert backend from scratch. Follow these steps in order.

---

## Prerequisites

Before you start, ensure you have:
- ✅ A GitHub account (or Git repository)
- ✅ A web browser
- ✅ Email address for Supabase account

**No coding required for initial setup!** Everything can be done through dashboards.

---

## Step 1: Create Supabase Project (5 minutes)

### 1.1 Sign Up for Supabase

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### 1.2 Create New Project

1. Click "New Project"
2. Choose your organization (create one if needed)
3. Fill in project details:
   ```
   Name: cmoxpert-production (or your preferred name)
   Database Password: [Generate a strong password - SAVE THIS!]
   Region: Choose closest to your users (e.g., US East, EU West)
   Pricing Plan: Free (to start)
   ```
4. Click "Create new project"
5. **Wait 2-3 minutes** for project to provision

### 1.3 Save Your Credentials

Once the project is ready, go to **Settings** → **API**:

You'll need these values (keep them safe):
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:**
- The `anon key` is safe to use in your frontend
- The `service_role key` should NEVER be exposed in frontend code

---

## Step 2: Run Database Migrations (10 minutes)

Your app includes 16 migration files that create the entire database schema. You need to run these.

### 2.1 Using Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Open each migration file from `supabase/migrations/` folder (in order):
   - Start with `20250607084901_navy_cottage.sql`
   - End with `20251027163955_revenue_attribution_system.sql`
4. Copy the entire content of the first migration
5. Paste into SQL Editor
6. Click "Run" (bottom right)
7. Verify success (should see "Success. No rows returned")
8. Repeat for all 16 migration files **in chronological order**

**⚠️ Run migrations in order!** The filename dates indicate the order.

### 2.2 What Gets Created

After running all migrations, you'll have:

**Core Tables:**
- ✅ `users` - User accounts (managed by Supabase Auth)
- ✅ `clients` - Client companies and contact information
- ✅ `reports` - Market analysis reports
- ✅ `playbooks` - Marketing playbooks and strategies
- ✅ `campaigns` - Marketing campaigns
- ✅ `performance_metrics` - Campaign performance data
- ✅ `integrations` - Third-party service connections
- ✅ `workflows` - Automation workflows
- ✅ `alert_rules` - Alert configurations

**Revenue Attribution Tables:**
- ✅ `deals` - Sales deals and opportunities
- ✅ `touchpoints` - Customer journey touchpoints
- ✅ `deal_touchpoints` - Attribution mapping
- ✅ `attribution_models` - Attribution model configurations

**Content Management:**
- ✅ `content_calendar` - Content planning
- ✅ `content_pieces` - Content items
- ✅ `content_performance` - Content analytics

**Security:**
- ✅ Row Level Security (RLS) enabled on ALL tables
- ✅ Policies ensure users only access their own data
- ✅ Service role bypasses RLS for admin operations

### 2.3 Verify Migrations

After running all migrations:

1. Go to **Table Editor** in Supabase
2. You should see all tables listed on the left
3. Click on a few tables to verify structure
4. Check that **RLS is enabled** (shield icon should be present)

---

## Step 3: Configure Authentication (5 minutes)

### 3.1 Basic Email Auth (Already Enabled)

Email/password authentication is enabled by default. No action needed!

### 3.2 Email Settings (Recommended)

**Option A: Use Supabase Email (Quick Start)**
- Default setup, works immediately
- Emails come from Supabase domain
- Limited to 3-4 emails per hour per user
- **Good for:** Development and testing

**Option B: Custom SMTP (Production)**
1. Go to **Authentication** → **Email Settings**
2. Enable "Custom SMTP"
3. Configure your email provider:
   ```
   SMTP Host: smtp.sendgrid.net (or your provider)
   SMTP Port: 587
   SMTP User: apikey (for SendGrid)
   SMTP Password: [Your SendGrid API key]
   Sender Email: noreply@cmoxpert.com
   Sender Name: cmoxpert
   ```
4. Test by sending a test email

**Recommended Providers:**
- **SendGrid**: 100 emails/day free tier
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: Very cheap, requires AWS account

### 3.3 Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize these templates:
   - **Confirm signup** - Welcome email
   - **Magic Link** - Passwordless login
   - **Reset password** - Password reset
   - **Change Email** - Email change confirmation

Add your branding:
```html
<h2>Welcome to cmoxpert!</h2>
<p>Click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

### 3.4 Email Verification (Production Only)

**⚠️ Leave this DISABLED for development**

When ready for production:
1. Go to **Authentication** → **Settings**
2. Enable "Confirm email"
3. Test signup flow thoroughly
4. Users must verify email before accessing app

---

## Step 4: Deploy Edge Functions (10 minutes)

Your app has 2 AI-powered Edge Functions that need to be deployed.

### 4.1 Install Supabase CLI

**On Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

**On Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify installation:**
```bash
supabase --version
```

### 4.2 Login to Supabase

```bash
supabase login
```

This will open a browser window - authorize the CLI.

### 4.3 Link to Your Project

```bash
cd /path/to/cmoxpert
supabase link --project-ref your-project-ref
```

**Find your project-ref:**
- Go to Supabase Dashboard → **Settings** → **General**
- Look for "Reference ID"
- It's the part of your URL: `https://[THIS-PART].supabase.co`

### 4.4 Deploy Functions

```bash
# Deploy market analysis function
supabase functions deploy generate-market-analysis

# Deploy playbook generation function
supabase functions deploy generate-playbook
```

**Verify deployment:**
1. Go to Supabase Dashboard → **Edge Functions**
2. You should see both functions listed
3. Check that status shows as "Active"

### 4.5 Set Environment Variables (Optional - for Real AI)

If you want real AI (not mock data):

```bash
# Add OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-proj-your-key-here

# Optional: Add SEMrush API key
supabase secrets set SEMRUSH_API_KEY=your-semrush-key
```

**Or via Dashboard:**
1. Go to **Edge Functions** → **Settings**
2. Add secrets as environment variables
3. Click "Save"

---

## Step 5: Configure Frontend Environment (2 minutes)

### 5.1 Create `.env` File

In your project root, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

### 5.2 Update with Your Supabase Credentials

Edit `.env` and add your actual values:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Analytics (Optional - add later)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Reporting (Optional - add later)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Production Domain (Update before deploying)
VITE_SITE_URL=http://localhost:5173
```

**⚠️ NEVER commit `.env` to Git!** It's already in `.gitignore`.

### 5.3 Verify Connection

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 and try to sign up. If it works, backend is connected!

---

## Step 6: Test the Backend (5 minutes)

### 6.1 Create Test User

1. Open your app at http://localhost:5173
2. Click "Sign Up"
3. Enter email and password
4. Click "Create Account"
5. Check your email for confirmation (if email verification enabled)

### 6.2 Verify Database Entry

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. You should see your new user
3. Go to **Table Editor** → **clients** table
4. Should be empty (you'll create clients in the app)

### 6.3 Test Core Features

In the app:
1. ✅ **Create a Client** - Go to Clients page, add new client
2. ✅ **Generate Report** - Go to Reports, generate market analysis
3. ✅ **Create Playbook** - Go to Playbooks, generate playbook
4. ✅ **Check Database** - Verify data appears in Supabase tables

---

## Step 7: Security Configuration (10 minutes)

### 7.1 Verify RLS Policies

1. Go to **Authentication** → **Policies**
2. Check each table has policies enabled
3. Test that users can't access other users' data

**Quick Test:**
1. Create two user accounts
2. Create a client with User A
3. Login as User B
4. Try to access User A's client (should fail)

### 7.2 Configure Storage (If Using File Uploads)

1. Go to **Storage** in Supabase
2. Create a new bucket: `client-files`
3. Set bucket to "Private"
4. Add RLS policies:
   ```sql
   -- Allow users to upload their own files
   CREATE POLICY "Users can upload files"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow users to view their own files
   CREATE POLICY "Users can view own files"
   ON storage.objects
   FOR SELECT
   TO authenticated
   USING (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 7.3 API Rate Limiting (Production)

Upgrade to Supabase Pro ($25/month) to enable:
- Custom rate limits
- Priority support
- More database resources
- Daily backups

**Free Tier Limits:**
- 500MB database
- 50,000 monthly active users
- 2GB file storage
- 2GB bandwidth

---

## Step 8: Monitoring Setup (5 minutes)

### 8.1 Enable Realtime (Optional)

For live updates without page refresh:

1. Go to **Database** → **Replication**
2. Enable replication for tables:
   - `clients`
   - `reports`
   - `campaigns`
   - `performance_metrics`

### 8.2 Set Up Logging

1. Go to **Logs** in Supabase
2. Configure log retention (default: 7 days)
3. Set up log exports if needed (Pro plan)

### 8.3 Configure Alerts

In Supabase Dashboard:
1. Go to **Settings** → **Alerts** (Pro plan)
2. Set up alerts for:
   - High database usage
   - API errors
   - Slow queries

---

## Step 9: Backup Configuration (5 minutes)

### 9.1 Automatic Backups

**Free Tier:**
- Daily backups (7 days retention)
- Not downloadable

**Pro Tier ($25/month):**
- Daily backups (30 days retention)
- Point-in-time recovery
- Downloadable backups

### 9.2 Manual Backup

To backup now:

```bash
# Export schema
supabase db dump -f schema.sql --schema public

# Export data
supabase db dump -f data.sql --data-only
```

Save these files in a secure location (NOT in Git!).

---

## Step 10: Production Checklist

Before going live, complete:

### Database
- ✅ All migrations applied successfully
- ✅ RLS enabled on all tables
- ✅ RLS policies tested with multiple users
- ✅ Indexes added for performance
- ✅ Backup configured

### Authentication
- ✅ Email verification enabled (if desired)
- ✅ Custom SMTP configured
- ✅ Email templates customized
- ✅ Password requirements suitable
- ✅ MFA available (optional)

### Edge Functions
- ✅ Both functions deployed
- ✅ Functions tested and working
- ✅ OpenAI API key added (if using real AI)
- ✅ Error handling tested
- ✅ Logs monitored

### Security
- ✅ API keys not exposed in frontend
- ✅ HTTPS enabled (automatic with Netlify/Vercel)
- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ Security headers added

### Monitoring
- ✅ Error tracking configured (Sentry)
- ✅ Analytics configured (Google Analytics)
- ✅ Database usage monitored
- ✅ API usage monitored

---

## Common Issues & Solutions

### "Failed to connect to Supabase"
- Check `VITE_SUPABASE_URL` in `.env`
- Verify URL doesn't have trailing slash
- Ensure project is not paused (Supabase free tier)

### "JWT expired" or "Invalid token"
- Users need to refresh browser/re-login
- Check system clock is correct
- Verify Supabase project is active

### "Row level security policy violation"
- Check user is logged in
- Verify RLS policies are correct
- Test with service role key (temporarily)

### "Edge function timeout"
- Increase timeout in function code
- Check OpenAI API is responding
- Verify function logs for errors

### "Migration failed"
- Check if migration already applied
- Run migrations in correct order
- Check for syntax errors in SQL

---

## Estimated Costs

### Free Tier (Good for Development)
- **Cost:** $0/month
- **Limits:** 500MB DB, 50K users, 2GB storage
- **Perfect for:** Testing, MVP, small apps

### Pro Tier (Recommended for Production)
- **Cost:** $25/month
- **Benefits:** 8GB DB, unlimited users, daily backups
- **Good for:** Production apps with <1000 users

### Plus AI Costs (Optional)
- **OpenAI:** $30-250/month (based on usage)
- **SEMrush:** $125+/month (optional)

---

## Next Steps

After completing backend setup:

1. **Test Everything** - Create test users, clients, reports
2. **Deploy Frontend** - Follow `NETLIFY_SETUP.md`
3. **Configure Domain** - Set up custom domain
4. **Enable SSL** - Automatic with most hosts
5. **Go Live** - Share with first users!

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.com
- **Edge Functions:** https://supabase.com/docs/guides/functions
- **RLS Policies:** https://supabase.com/docs/guides/auth/row-level-security

---

**Last Updated:** January 27, 2025
**Estimated Total Time:** 45-60 minutes
**Difficulty:** ⭐⭐ (Intermediate - no coding required)
