# Netlify Environment Variables Setup

## CRITICAL: Production Deployment Issue

If you're seeing errors like `net::ERR_NAME_NOT_RESOLVED` or connections to `https://placeholder.supabase.co`, it means your **Netlify environment variables are not configured**.

The `.env` file in this repository is **ONLY for local development**. For production deployments on Netlify, you must configure environment variables in the Netlify dashboard.

---

## Quick Fix Steps

### 1. Log into Netlify Dashboard

Go to [https://app.netlify.com](https://app.netlify.com) and select your site.

### 2. Navigate to Environment Variables

- Click on **Site settings** in the left sidebar
- Scroll down and click **Environment variables**
- Or go directly to: `https://app.netlify.com/sites/YOUR_SITE_NAME/settings/deploys#environment`

### 3. Add Required Environment Variables

Click **"Add a variable"** and add the following:

#### Required Variables:

| Variable Name | Value | Notes |
|--------------|--------|-------|
| `VITE_SUPABASE_URL` | `https://kgtiverynmxizyguklfr.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your Supabase anon/public key |

**IMPORTANT:** Use the exact values from your `.env` file:
- VITE_SUPABASE_URL: `https://kgtiverynmxizyguklfr.supabase.co`
- VITE_SUPABASE_ANON_KEY: (your full anon key from .env)

#### Optional Variables (for full functionality):

| Variable Name | Value | Notes |
|--------------|--------|-------|
| `VITE_GA_TRACKING_ID` | `G-XXXXXXXXXX` | Google Analytics tracking ID |
| `VITE_SENTRY_DSN` | `https://...` | Sentry error reporting DSN |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID | For Google Ads integration |
| `VITE_META_APP_ID` | Your Meta app ID | For Facebook/Meta Ads integration |
| `VITE_LINKEDIN_CLIENT_ID` | Your LinkedIn client ID | For LinkedIn Ads integration |
| `VITE_SITE_URL` | `https://cmoxpert.com` | Your production domain |

### 4. Deploy Settings

After adding environment variables:

1. **Save Changes**: Click "Save" on each variable
2. **Trigger New Deploy**: Go to **Deploys** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait for the deploy to complete (usually 2-5 minutes)

### 5. Verify Deployment

Once deployed:

1. Visit your site: `https://cmoxpert.com`
2. Open browser console (F12)
3. You should see: `[SUPABASE] Configuration validated successfully`
4. Try logging in - authentication should now work

---

## Troubleshooting

### Still Seeing Placeholder URL?

**Problem:** Site still connects to `placeholder.supabase.co`

**Solution:**
1. Clear your browser cache completely
2. Check Netlify deploy logs for environment variable confirmation
3. Verify variables are set in the correct environment (production)
4. Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Environment Variables Not Working?

**Problem:** Variables added but site still doesn't work

**Possible causes:**
1. **Scoped to wrong environment**: Ensure variables are available to "Production" branch
2. **Not redeployed**: You MUST trigger a new deploy after adding variables
3. **Typo in variable names**: Variable names are case-sensitive and must match exactly
4. **Missing VITE_ prefix**: All client-side variables MUST start with `VITE_`

**Solution:**
```bash
# Variable names MUST be exactly:
VITE_SUPABASE_URL          ✅ Correct
vite_supabase_url          ❌ Wrong (case)
SUPABASE_URL               ❌ Wrong (missing VITE_ prefix)
VITE_SUPABASE_URI          ❌ Wrong (typo)
```

### Connection Still Failing?

**Problem:** Getting network errors or timeouts

**Steps to diagnose:**

1. **Check Supabase project status:**
   - Go to [https://status.supabase.com](https://status.supabase.com)
   - Verify your project is active in Supabase dashboard

2. **Verify Supabase credentials:**
   - Go to Supabase dashboard → Settings → API
   - Copy the exact URL and anon key
   - Update Netlify environment variables with these exact values

3. **Check Content Security Policy:**
   - Our `netlify.toml` allows connections to `*.supabase.co`
   - Verify this hasn't been modified

4. **Test locally first:**
   ```bash
   npm install
   npm run dev
   ```
   If it works locally but not in production, it's definitely an environment variable issue.

---

## How Environment Variables Work

### Local Development (.env file)
```bash
# File: .env (in project root)
VITE_SUPABASE_URL=https://kgtiverynmxizyguklfr.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```
- Used when running `npm run dev`
- NOT included in Git (in .gitignore)
- NOT used by Netlify deployments

### Production (Netlify Dashboard)
```
Netlify Dashboard → Site settings → Environment variables
```
- Used when Netlify builds your site
- Injected during build time
- Required for production to work

### Why This Is Necessary

Vite (our build tool) only includes environment variables that:
1. Start with `VITE_` prefix
2. Are available at **build time**

When Netlify builds your site, it needs these variables **before** creating the static files. That's why they must be in Netlify dashboard, not just in your repository.

---

## Security Notes

### Safe to Expose (Public)
These variables are **safe** to expose in client-side code:
- ✅ `VITE_SUPABASE_URL` - Public URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Public key with RLS protection
- ✅ OAuth Client IDs - Designed to be public

### Never Expose (Private)
These should **NEVER** have `VITE_` prefix and should be configured in Supabase Edge Functions:
- ❌ `OPENAI_API_KEY`
- ❌ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ OAuth Client Secrets
- ❌ Any API keys or secrets

---

## Testing After Setup

### 1. Test Authentication
```
1. Go to https://cmoxpert.com/auth
2. Try signing up with a new email
3. Try signing in with existing credentials
4. Should work without errors
```

### 2. Check Browser Console
```
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for:
   ✅ "[SUPABASE] Configuration validated successfully"
   ✅ "[AUTH] Initializing authentication..."
   ❌ "CRITICAL: Supabase environment variables are not configured!"
   ❌ "net::ERR_NAME_NOT_RESOLVED"
```

### 3. Verify Network Requests
```
1. Open Developer Tools → Network tab
2. Try logging in
3. Verify requests go to:
   ✅ https://kgtiverynmxizyguklfr.supabase.co
   ❌ https://placeholder.supabase.co
```

---

## Need Help?

### Netlify Support
- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Support](https://www.netlify.com/support/)

### Supabase Support
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Dashboard](https://app.supabase.com)

### Project Issues
If you've followed all steps and authentication still doesn't work:
1. Check the browser console for specific error messages
2. Verify Supabase project is active and accessible
3. Ensure RLS policies are properly configured in database
4. Check that profiles are being created (database trigger should handle this)

---

## Summary Checklist

- [ ] Logged into Netlify Dashboard
- [ ] Added `VITE_SUPABASE_URL` environment variable
- [ ] Added `VITE_SUPABASE_ANON_KEY` environment variable
- [ ] Saved all environment variables
- [ ] Triggered a new deploy
- [ ] Waited for deploy to complete
- [ ] Cleared browser cache
- [ ] Tested login functionality
- [ ] Verified no console errors
- [ ] Confirmed requests go to correct Supabase URL

Once all items are checked, your production site should be fully functional!
