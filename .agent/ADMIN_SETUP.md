# Admin Page Setup Guide

## Overview
The Admin page has been updated with the Horizon brand palette and now features a dark gradient background with translucent glassmorphic cards that match the sidebar and landing page aesthetics.

## Branding Updates Applied

### Visual Changes
1. **Root Container**: Dark gradient background (`bg-gradient-to-br from-horizon-900 via-horizon-800 to-horizon-700`)
2. **Header**: Wrapped in a translucent hero card with BrandLogo component
3. **Cards**: All stat and section cards use translucent styling (`bg-white/5 border border-white/10 shadow-glow hover:border-white/20`)
4. **Buttons**:
   - Primary buttons: `bg-horizon-600 hover:bg-horizon-500`
   - Secondary buttons: `bg-zinc-800`
5. **Text Colors**: Updated to brand palette (zinc-100, zinc-300, zinc-400, horizon-400)
6. **Icons**: Updated stat card icon backgrounds to horizon palette (horizon-600, horizon-500, horizon-400)

## Admin Access Setup

### Setting Up Admin Role

To access the Admin page, your user profile must have the `admin` role set in the database.

#### Step 1: Run SQL Command
In the Supabase SQL Editor, run the following command:

```sql
-- Replace 'your-email@example.com' with your actual email address
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

#### Step 2: Verify Role Assignment
Check that the role was set correctly:

```sql
SELECT id, email, role 
FROM profiles 
WHERE email = 'your-email@example.com';
```

You should see `role = 'admin'` in the result.

#### Step 3: Sign Out and Sign Back In
1. Sign out of the application
2. Sign back in with your admin account
3. You should be automatically redirected to `/admin`

### Troubleshooting Access Issues

If you see "Access Denied" after logging in:

1. **Check Profile Exists**: Verify your profile row exists in the database
   ```sql
   SELECT * FROM profiles WHERE email = 'your-email@example.com';
   ```

2. **Check Environment Variables**: Ensure these are set correctly:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Clear Browser Cache**: Sometimes cached auth state can cause issues

4. **Check Browser Console**: Look for any error messages related to profile fetching

## Brand Assets Upload

### Setting Up Branding Bucket

The Admin page includes a Branding tab where you can upload your logo and favicon.

#### Step 1: Ensure Branding Bucket Exists
In Supabase Storage, create a bucket named `branding` if it doesn't exist.

#### Step 2: Set Bucket Permissions
Make the bucket public so assets can be accessed:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

#### Step 3: Upload Assets
1. Navigate to Admin > Branding tab
2. Click "Upload Assets"
3. Upload your files:
   - **Logo**: PNG, JPG, or SVG (recommended: 200x50px or similar aspect ratio)
   - **Favicon**: ICO or PNG (recommended: 32x32px or 16x16px)

The system will automatically:
- Find and display the first `logo.*` file (png|jpg|jpeg|svg)
- Find and display the first `favicon.*` file (ico|png|jpg)
- Update the favicon in the browser tab
- Apply the logo to components that use BrandLogo

### File Naming
- Logo files must start with `logo.` (e.g., `logo.png`, `logo.svg`)
- Favicon files must start with `favicon.` (e.g., `favicon.ico`, `favicon.png`)

## Features Available in Admin

### 1. Client Portfolio
- Overview of all clients
- Performance tracking
- Client management

### 2. Videos
- Upload and manage educational videos
- Feature/unfeature videos
- View video statistics

### 3. Analytics
- Recent activity tracking
- Usage statistics
- Platform insights

### 4. Branding
- Upload logo and favicon
- Preview current brand assets
- Update brand identity

### 5. AI Settings
- Configure OpenAI API key
- Configure Google Gemini API key  
- Configure SEMrush API key
- Toggle AI features

### 6. Integrations
- Connect Google Search Console (FREE real SEO data)
- Manage third-party integrations
- View connected properties

## Next Steps

1. ✅ Apply admin role to your account
2. ✅ Upload logo.png or logo.svg to Supabase Storage > branding bucket
3. ✅ Upload favicon.png or favicon.ico to Supabase Storage > branding bucket  
4. Sign out and sign back in to test admin access
5. Navigate to Admin > Branding tab to verify assets appear
6. Configure AI settings (optional)
7. Connect Google Search Console (optional, but recommended for real SEO data)

## Security Notes

- Admin role check happens in the `useAuth` context using `profile.role === 'admin'`
- Only users with admin role can see and access the Admin page
- API keys in AI Settings should be stored securely server-side in production
- The current implementation shows API key inputs for demonstration; in production these would be encrypted and stored securely
