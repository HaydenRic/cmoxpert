# Connecting cmoxpert.com to Your Netlify Deployment

This guide will walk you through connecting your custom domain cmoxpert.com to your Netlify-hosted application.

## Step 1: Deploy to Netlify (If Not Already Done)

If you haven't deployed yet:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git repository
5. Netlify will auto-detect the build settings from `netlify.toml`
6. Click "Deploy site"

## Step 2: Add Custom Domain in Netlify

1. Once deployed, go to your site dashboard in Netlify
2. Click on "Domain settings" or "Set up a custom domain"
3. Click "Add custom domain" or "Add domain alias"
4. Enter: `cmoxpert.com`
5. Click "Verify" - Netlify will indicate that you need to configure DNS
6. Also add: `www.cmoxpert.com` (optional, for www subdomain)

## Step 3: Configure DNS in Hostinger

Log in to your Hostinger control panel (hPanel) and follow these steps:

### Option A: Using Netlify's Nameservers (Recommended)

This is the easiest method:

1. In Netlify, under Domain settings, find "DNS panel" for cmoxpert.com
2. Note the Netlify nameservers (usually something like):
   - dns1.p01.nsone.net
   - dns2.p01.nsone.net
   - dns3.p01.nsone.net
   - dns4.p01.nsone.net

3. In Hostinger:
   - Go to Domains → cmoxpert.com → Nameservers
   - Select "Change nameservers"
   - Enter the Netlify nameservers
   - Save changes

### Option B: Using Hostinger DNS with A and CNAME Records

If you want to keep Hostinger as your DNS provider:

1. In Hostinger, go to: Domains → cmoxpert.com → DNS Zone
2. Delete any existing A or CNAME records for @ and www
3. Add these records:

   **A Record:**
   - Type: A
   - Name: @ (or leave blank)
   - Points to: 75.2.60.5
   - TTL: 14400 (or default)

   **CNAME Record (if using www):**
   - Type: CNAME
   - Name: www
   - Points to: your-site-name.netlify.app
   - TTL: 14400 (or default)

   Replace `your-site-name` with your actual Netlify subdomain.

## Step 4: Wait for DNS Propagation

- DNS changes can take 1-48 hours to propagate globally
- Usually happens within 1-4 hours
- Check propagation status at: https://www.whatsmydns.net/

## Step 5: Enable HTTPS in Netlify

1. Return to Netlify → Domain settings → cmoxpert.com
2. Once DNS propagates, Netlify will automatically provision an SSL certificate
3. This usually takes a few minutes after DNS is verified
4. Once complete, you'll see "HTTPS" with a green checkmark
5. Enable "Force HTTPS" to redirect all HTTP traffic to HTTPS

## Step 6: Update Supabase Settings

Important: Update your Supabase project to allow the new domain:

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Authentication → URL Configuration
4. Add these to "Site URL":
   - `https://cmoxpert.com`
   - `https://www.cmoxpert.com` (if using www)
5. Add these to "Redirect URLs":
   - `https://cmoxpert.com/**`
   - `https://www.cmoxpert.com/**` (if using www)
6. Save changes

## Step 7: Update Environment Variables (if needed)

If you have `VITE_SITE_URL` in your environment variables:

1. In Netlify, go to: Site settings → Environment variables
2. Add or update: `VITE_SITE_URL` = `https://cmoxpert.com`
3. Redeploy your site for changes to take effect

## Step 8: Test Your Domain

Once DNS propagates and SSL is active:

1. Visit https://cmoxpert.com
2. Test all routes and navigation
3. Try logging in/signing up to verify Supabase authentication works
4. Check that www redirects properly (if configured)
5. Verify SSL certificate is valid (green padlock in browser)

## Troubleshooting

### DNS Not Propagating
- Check DNS records are correct in Hostinger
- Clear your browser cache and DNS cache
- Try accessing in incognito/private mode
- Test from different networks (mobile data vs WiFi)

### SSL Certificate Not Provisioning
- Ensure DNS is fully propagated first
- Verify A record points to correct IP (75.2.60.5)
- Check that CAA records (if any) allow Let's Encrypt

### Authentication Not Working
- Verify Supabase redirect URLs include your custom domain
- Check browser console for CORS errors
- Ensure environment variables are updated in Netlify

### 404 Errors on Page Refresh
- This should be handled by the `_redirects` file and `netlify.toml`
- If issues persist, verify these files are in your repository

## Current Configuration

Your project now includes:

- **netlify.toml**: Build settings, redirects, headers, and caching rules
- **public/_redirects**: Fallback redirect rules for React Router
- **Security headers**: X-Frame-Options, CSP, and other security measures
- **Performance optimizations**: Cache control for static assets
- **HTTPS enforcement**: Automatic redirect from HTTP to HTTPS
- **WWW redirect**: Configured to redirect www to non-www (optional)

## Need Help?

- Netlify Support: https://answers.netlify.com/
- Hostinger Support: https://www.hostinger.com/contact
- Supabase Docs: https://supabase.com/docs
