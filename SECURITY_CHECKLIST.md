# cmoxpert Security & Production Checklist

## Pre-Launch Security Checklist

### 🔐 Authentication & Access Control

- [ ] **Enable Email Verification in Supabase**
  1. Go to Supabase Dashboard → Authentication → Settings
  2. Enable "Confirm email" under Email Auth
  3. Configure email templates (optional but recommended)
  4. Test signup flow to ensure verification emails are sent

- [ ] **Enable Multi-Factor Authentication (MFA)**
  1. Go to Supabase Dashboard → Authentication → Settings
  2. Enable "Phone Auth" or "TOTP" for 2FA
  3. Update UI to show MFA setup option in Settings page
  4. Test MFA flow end-to-end

- [ ] **Review Row Level Security (RLS) Policies**
  - Verify all tables have RLS enabled
  - Test each policy with different user roles
  - Ensure no data leakage between users
  - Check that admin-only tables are properly restricted

- [ ] **Password Security**
  - Minimum password length: 8 characters (currently enforced by Supabase)
  - Consider implementing password complexity requirements
  - Enable password breach detection (Supabase feature)

### 🌐 SSL/HTTPS Configuration

- [ ] **Custom Domain Setup**
  1. Purchase/configure custom domain (e.g., app.cmoxpert.com)
  2. Add domain to your hosting provider (Netlify/Vercel/etc.)
  3. Enable automatic HTTPS/SSL certificates
  4. Verify SSL certificate is valid and trusted

- [ ] **Force HTTPS**
  - Ensure all HTTP traffic redirects to HTTPS
  - Check that mixed content warnings don't appear
  - Verify WebSocket connections use WSS protocol

- [ ] **Security Headers**
  Add these headers to your deployment configuration:
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline';
  Referrer-Policy: strict-origin-when-cross-origin
  ```

### 🛡️ Rate Limiting & DDoS Protection

- [ ] **Implement Rate Limiting**
  - Add rate limiting to signup/login endpoints
  - Limit API requests per user/IP
  - Consider using Supabase Edge Functions with rate limiting
  - Monitor for suspicious traffic patterns

- [ ] **CAPTCHA Protection**
  - Add CAPTCHA to signup form (Google reCAPTCHA v3 recommended)
  - Add CAPTCHA to login form after failed attempts
  - Consider adding to contact form

### 📊 Database Security

- [ ] **Backup Configuration**
  1. Enable automatic daily backups in Supabase (included in paid plans)
  2. Test backup restoration process
  3. Document backup retention policy
  4. Set up offsite backup storage (optional but recommended)

- [ ] **Connection Security**
  - Verify database uses SSL/TLS connections
  - Use connection pooling (Supabase handles this)
  - Never expose database credentials in client code
  - Rotate service role keys if they've been exposed

- [ ] **Data Encryption**
  - Verify encryption at rest is enabled (Supabase default)
  - Ensure sensitive fields use additional encryption if needed
  - Document what data is encrypted and how

### 🔍 Monitoring & Logging

- [ ] **Error Monitoring**
  - Set up error tracking (Sentry is already configured)
  - Configure alert thresholds
  - Test error reporting in production
  - Set up Slack/email notifications for critical errors

- [ ] **Security Monitoring**
  1. Enable Supabase audit logging
  2. Monitor failed login attempts
  3. Track unusual API usage patterns
  4. Set up alerts for suspicious activity

- [ ] **Performance Monitoring**
  - Monitor API response times
  - Track database query performance
  - Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

### 🚫 Content Security

- [ ] **Input Validation**
  - All user inputs are validated client-side
  - All user inputs are validated server-side via RLS
  - SQL injection protection (Supabase handles this)
  - XSS protection enabled

- [ ] **File Upload Security** (if applicable)
  - Validate file types and sizes
  - Scan uploaded files for malware
  - Store files in secure bucket with proper access controls
  - Use signed URLs for file access

### 🔑 API & Integration Security

- [ ] **API Key Management**
  - Never commit API keys to Git (already using .env)
  - Rotate API keys regularly
  - Use different keys for dev/staging/production
  - Document which services use which keys

- [ ] **Third-Party Integrations**
  - Review privacy policies of all integrated services
  - Ensure OAuth2 flows are properly implemented
  - Validate webhook signatures
  - Use HTTPS for all external API calls

### 📱 Client-Side Security

- [ ] **Environment Variables**
  - Verify `.env` is in `.gitignore`
  - Use `VITE_` prefix only for public variables
  - Keep sensitive keys server-side only
  - Document all required environment variables

- [ ] **Dependency Security**
  ```bash
  npm audit
  npm audit fix
  ```
  - Review and fix all high/critical vulnerabilities
  - Update dependencies regularly
  - Use Dependabot for automated updates

### 📝 Legal & Compliance

- [x] **Privacy Policy**
  - ✅ Privacy Policy page created at `/privacy`
  - [ ] Review with legal counsel
  - [ ] Add cookie consent banner (if using cookies)
  - [ ] Ensure GDPR compliance (if serving EU users)
  - [ ] Ensure CCPA compliance (if serving California users)

- [x] **Terms of Service**
  - ✅ Terms of Service page created at `/terms`
  - [ ] Review with legal counsel
  - [ ] Add jurisdiction information
  - [ ] Define SLA and uptime guarantees

- [ ] **Data Processing Agreement**
  - Create DPA for enterprise customers
  - Document data retention policies
  - Define data deletion procedures

### 🚀 Deployment Configuration

- [ ] **Production Environment**
  ```bash
  # Required environment variables
  VITE_SUPABASE_URL=your-production-url
  VITE_SUPABASE_ANON_KEY=your-production-anon-key
  VITE_GA_TRACKING_ID=your-analytics-id (optional)
  ```

- [ ] **Build Optimization**
  - Verify production build succeeds: `npm run build`
  - Check bundle sizes are reasonable
  - Enable gzip/brotli compression
  - Configure CDN for static assets

- [ ] **DNS & Domain**
  - Configure A/AAAA records for domain
  - Set up CNAME for www subdomain
  - Configure MX records for email (if needed)
  - Add SPF, DKIM, DMARC records for email security

### 📧 Email Configuration

- [ ] **Supabase Email Settings**
  1. Configure custom SMTP provider (SendGrid, Mailgun, etc.)
  2. Set up custom email templates
  3. Add your domain to "From" email address
  4. Test all email flows (signup, password reset, etc.)

- [ ] **Email Security**
  - Enable SPF records
  - Configure DKIM signing
  - Set up DMARC policy
  - Test emails don't go to spam

### 👥 User Management

- [ ] **Admin Controls**
  - Review admin user list
  - Remove test/demo accounts
  - Set up proper role hierarchy
  - Document admin procedures

- [ ] **User Data Rights**
  - Implement data export functionality
  - Implement account deletion flow
  - Create process for data access requests
  - Document data retention periods

## Post-Launch Monitoring

### Week 1
- [ ] Monitor error rates daily
- [ ] Check server resource usage
- [ ] Review security logs
- [ ] Test all critical user flows
- [ ] Monitor signup/login success rates

### Month 1
- [ ] Run full security audit
- [ ] Review all monitoring alerts
- [ ] Check backup integrity
- [ ] Update dependencies
- [ ] Review user feedback for security concerns

### Quarterly
- [ ] Penetration testing (recommended)
- [ ] Security policy review
- [ ] Compliance audit (if required)
- [ ] Disaster recovery drill
- [ ] Access control review

## Incident Response Plan

### Security Incident Procedure

1. **Detect & Assess**
   - Monitor alerts and logs
   - Determine severity and scope
   - Document incident details

2. **Contain**
   - Isolate affected systems
   - Disable compromised accounts
   - Block malicious traffic

3. **Investigate**
   - Determine root cause
   - Identify affected data/users
   - Collect forensic evidence

4. **Remediate**
   - Apply security patches
   - Reset compromised credentials
   - Update security policies

5. **Communicate**
   - Notify affected users (if required by law)
   - Update status page
   - Document lessons learned

6. **Review**
   - Post-mortem meeting
   - Update procedures
   - Implement preventive measures

## Quick Reference

### Supabase Dashboard
- URL: https://app.supabase.com/project/YOUR_PROJECT_ID
- Enable email verification: Authentication → Settings
- View logs: Logs → Database/Auth/API
- Manage users: Authentication → Users

### Emergency Contacts
- Supabase Support: support@supabase.com
- Hosting Provider: [Your hosting support]
- Security Team: security@cmoxpert.com

### Important Commands
```bash
# Check for security vulnerabilities
npm audit

# Update dependencies safely
npm update

# Build for production
npm run build

# Test production build locally
npm run preview
```

## Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#security-best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Netlify Security](https://docs.netlify.com/security/security-features/)
- [GDPR Compliance Guide](https://gdpr.eu/checklist/)
- [Web.dev Security](https://web.dev/secure/)

---

**Last Updated:** January 27, 2025

**Next Review:** Before production launch

**Status:** 🟡 In Progress - Complete checklist before launch
