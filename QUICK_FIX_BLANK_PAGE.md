# 🔧 QUICK FIX: Blank Page Issue

## Problem
Your site shows a blank page because environment variables are not configured in Netlify.

## Solution (5 Minutes)

### Step 1: Go to Netlify Dashboard
1. Open https://app.netlify.com in your browser
2. Log in if you're not already logged in
3. You should see your site listed (named something like "cmoxpert" or auto-generated name)

### Step 2: Navigate to Environment Variables
```
Click your site → Site settings → Environment variables (left sidebar)
```

### Step 3: Add First Variable
1. Click the **"Add a variable"** or **"Add environment variable"** button
2. In the **Key** field, paste: `VITE_SUPABASE_URL`
3. In the **Value** field, paste: `https://kgtiverynmxizyguklfr.supabase.co`
4. Click **"Create variable"** or **"Save"**

### Step 4: Add Second Variable
1. Click **"Add a variable"** again
2. In the **Key** field, paste: `VITE_SUPABASE_ANON_KEY`
3. In the **Value** field, paste:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndGl2ZXJ5bm14aXp5Z3VrbGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDE3ODQsImV4cCI6MjA3NjAxNzc4NH0.Vku24xKdTCYwhvrGGwrQjz9fLseM-tIKcS8nuZkA2Q4
   ```
4. Click **"Create variable"** or **"Save"**

### Step 5: Trigger Redeploy
1. Click on **"Deploys"** tab at the top
2. Click the **"Trigger deploy"** button (top right)
3. Select **"Deploy site"**
4. Wait 2-3 minutes for the build to complete

### Step 6: Test Your Site
1. Once deploy shows "Published", click on your site URL
2. The landing page should now load correctly
3. If you still see issues, open browser console (F12) for error details

---

## Visual Reference

Your environment variables section should look like this:

```
┌─────────────────────────────────────────────────────────────┐
│ Environment variables                                        │
├─────────────────────────────────────────────────────────────┤
│ Key: VITE_SUPABASE_URL                                      │
│ Value: https://kgtiverynmxizyguklfr.supabase.co            │
│ Scopes: All scopes                                          │
├─────────────────────────────────────────────────────────────┤
│ Key: VITE_SUPABASE_ANON_KEY                                 │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...             │
│ Scopes: All scopes                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Mistakes to Avoid

❌ **DON'T** wrap values in quotes
✅ **DO** paste values directly

❌ **DON'T** use lowercase variable names
✅ **DO** use exact capitalization shown

❌ **DON'T** forget to redeploy after adding variables
✅ **DO** trigger a new deploy

---

## Verification Checklist

After redeploying, your site should:
- [ ] Load the landing page (not blank)
- [ ] Show the cmoxpert logo and navigation
- [ ] Allow you to click "Sign In" button
- [ ] Let you navigate to /beta page
- [ ] Show no console errors (press F12 to check)

---

## Still Having Issues?

If you still see a blank page after following these steps:

1. **Clear your browser cache**: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. **Try incognito/private mode**: To rule out caching issues
3. **Check browser console**: Press F12 and look for error messages
4. **Verify deploy completed**: Check Netlify "Deploys" tab shows "Published"
5. **Check deploy logs**: Look for any error messages in the deploy log

---

## Need the Values Again?

See `NETLIFY_ENV_VARIABLES.txt` in this project for easy copy-paste.

---

## Why This Happened

The `.env` file in your project works for **local development** but Netlify doesn't read it. Netlify requires environment variables to be set in the dashboard, where they're injected during the build process.

This is actually a **security feature** - it prevents sensitive credentials from being committed to your git repository.
