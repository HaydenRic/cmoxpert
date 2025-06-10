# cmoxpert Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Set up production Supabase project
- [ ] Configure production environment variables
- [ ] Set up domain and SSL certificate
- [ ] Configure CDN (Cloudflare/AWS CloudFront)

### 2. Database Setup
- [ ] Run all migrations on production database
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Create first admin user

### 3. AI Services Configuration
- [ ] Obtain OpenAI API key
- [ ] Set up SEMrush API access
- [ ] Configure edge function environment variables
- [ ] Test AI services in production

### 4. Content Management
- [ ] Upload brand assets (logo, favicon)
- [ ] Create initial video content
- [ ] Set up email templates
- [ ] Configure SMTP for transactional emails

### 5. Monitoring & Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring

### 6. SEO & Marketing
- [ ] Add meta tags and Open Graph data
- [ ] Create sitemap.xml
- [ ] Set up Google Search Console
- [ ] Configure social media accounts

## Environment Variables

```bash
# Production Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Edge Function Environment Variables (Supabase Dashboard)
OPENAI_API_KEY=sk-your-openai-key
SEMRUSH_API_KEY=your-semrush-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment Commands

```bash
# Build for production
npm run build

# Deploy to Netlify (or your preferred platform)
netlify deploy --prod --dir=dist

# Or deploy to Vercel
vercel --prod
```

## Post-Deployment Tasks

### 1. Create Admin User
1. Sign up through the normal flow
2. In Supabase dashboard, update the user's role:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@domain.com';
```

### 2. Upload Brand Assets
1. Log in as admin
2. Go to Admin Panel > Branding
3. Upload logo and favicon

### 3. Configure AI Services
1. Go to Admin Panel > AI Settings
2. Enter API keys for OpenAI and SEMrush
3. Test AI features

### 4. Content Setup
1. Upload demo videos
2. Create sample clients and reports
3. Generate sample playbooks

## Monitoring Setup

### Error Tracking with Sentry
```bash
npm install @sentry/react @sentry/tracing
```

### Analytics with Google Analytics
```bash
npm install gtag
```

### Performance Monitoring
- Set up Lighthouse CI
- Configure Core Web Vitals monitoring
- Set up uptime monitoring (Pingdom, UptimeRobot)

## Security Checklist

- [ ] Enable HTTPS everywhere
- [ ] Configure security headers
- [ ] Set up rate limiting
- [ ] Enable CSRF protection
- [ ] Configure CORS properly
- [ ] Set up backup and disaster recovery

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize images and assets
- [ ] Set up CDN
- [ ] Monitor Core Web Vitals

## Legal & Compliance

- [ ] Ensure GDPR compliance
- [ ] Set up cookie consent
- [ ] Configure data retention policies
- [ ] Set up privacy controls
- [ ] Document data processing activities