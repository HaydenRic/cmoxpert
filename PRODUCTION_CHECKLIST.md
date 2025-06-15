# Production Deployment Checklist ✅

## Pre-Deployment Setup

### 1. Environment Variables
- [ ] Set up production Supabase project
- [ ] Configure environment variables in hosting platform:
  ```bash
  VITE_SUPABASE_URL=your_production_supabase_url
  VITE_SUPABASE_ANON_KEY=your_production_anon_key
  VITE_GA_TRACKING_ID=G-XXXXXXXXXX (optional)
  VITE_SITE_URL=https://cmoxpert.com
  ```

### 2. Supabase Edge Functions Environment
- [ ] Set OpenAI API key in Supabase dashboard
- [ ] Set SEMrush API key in Supabase dashboard
- [ ] Test edge functions in production environment

### 3. Domain & SSL
- [ ] Configure custom domain
- [ ] Ensure SSL certificate is active
- [ ] Update CORS settings in Supabase for production domain

## Content Setup

### 4. Admin User Creation
- [ ] Sign up with admin email
- [ ] Update user role to admin in Supabase:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@domain.com';
  ```

### 5. Brand Assets
- [ ] Upload logo via Admin Panel > Branding
- [ ] Upload favicon via Admin Panel > Branding
- [ ] Replace placeholder og-image.jpg with actual social media image

### 6. Content Management
- [ ] Upload demo/featured videos via Admin Panel
- [ ] Test video playback and view tracking
- [ ] Verify video analytics in admin dashboard

## SEO & Analytics

### 7. Search Engine Optimization
- [ ] Verify robots.txt is accessible at /robots.txt
- [ ] Verify sitemap.xml is accessible at /sitemap.xml
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (if using tracking ID)

### 8. Social Media
- [ ] Test Open Graph tags with Facebook Debugger
- [ ] Test Twitter Card with Twitter Card Validator
- [ ] Verify social sharing images display correctly

## Performance & Monitoring

### 9. Performance Testing
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test Core Web Vitals
- [ ] Verify lazy loading is working
- [ ] Test on mobile devices

### 10. Error Monitoring (Optional but Recommended)
- [ ] Set up Sentry or similar error tracking
- [ ] Configure error reporting in production
- [ ] Test error boundary functionality

## Security & Compliance

### 11. Security Verification
- [ ] Verify RLS policies are working correctly
- [ ] Test authentication flows
- [ ] Ensure API keys are not exposed in client code
- [ ] Verify HTTPS is enforced

### 12. Legal Compliance
- [ ] Review Privacy Policy for accuracy
- [ ] Review Terms of Service
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Set up cookie consent (if using analytics)

## Testing

### 13. User Journey Testing
- [ ] Test complete signup flow
- [ ] Test client creation and analysis generation
- [ ] Test playbook generation
- [ ] Test contact form submission
- [ ] Test admin panel functionality

### 14. Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile browsers

## Post-Deployment

### 15. Monitoring Setup
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Set up uptime monitoring
- [ ] Monitor conversion rates

### 16. Backup & Recovery
- [ ] Verify database backups are configured
- [ ] Test data recovery procedures
- [ ] Document rollback procedures

## Launch Checklist

### 17. Final Verification
- [ ] All environment variables set correctly
- [ ] All features working in production
- [ ] Analytics tracking properly
- [ ] Error monitoring active
- [ ] Performance metrics acceptable

### 18. Go-Live
- [ ] Update DNS records (if needed)
- [ ] Announce launch
- [ ] Monitor for issues in first 24 hours
- [ ] Gather user feedback

---

## Quick Commands for Common Tasks

### Create Admin User (after signup)
```sql
-- Run in Supabase SQL Editor
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@domain.com';
```

### Test Environment Variables
```bash
# Check if variables are set correctly
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Build for Production
```bash
npm run build
npm run preview  # Test production build locally
```

---

**Status: Ready for Production Deployment** 🚀

The application is now fully optimized for production with:
- ✅ SEO optimization
- ✅ Analytics integration
- ✅ Error monitoring
- ✅ Performance monitoring
- ✅ Security hardening
- ✅ Social media optimization