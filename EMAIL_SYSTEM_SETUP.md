# Email System Setup Guide

## Overview

This guide walks you through setting up the complete email delivery system using Resend.

## Prerequisites

1. **Resend Account**: Sign up at https://resend.com
2. **API Key**: Get your API key from Resend Dashboard
3. **Domain Verification**: Verify your sending domain in Resend

## Step 1: Install Dependencies

```bash
# The @resend/node package is already included in package.json
npm install
```

## Step 2: Configure Environment Variables

Add these to your `.env` file and Netlify environment variables:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=admin@yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

### Netlify Environment Variables

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add all three variables above
3. Deploy to apply changes

## Step 3: Deploy Edge Functions

The email edge functions are already created in `supabase/functions/`:
- `send-audit-notification` - Notifies admin of new audit submissions
- `send-lead-autoresponder` - Sends thank you email to leads

Deploy them using Supabase CLI or the provided scripts.

## Step 4: Verify Setup

### Test Admin Notification

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-audit-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "company_name": "Test Company",
    "monthly_ad_spend": 500000,
    "score": 65,
    "estimated_waste": 150000
  }'
```

### Test Auto-responder

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-lead-autoresponder \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "John Smith",
    "company_name": "Test Company"
  }'
```

## Email Templates

### Admin Notification Template

Located in: `supabase/functions/send-audit-notification/email-template.ts`

**Customization Points:**
- Subject line
- Header design
- Call-to-action button
- Footer content

### Lead Auto-responder Template

Located in: `supabase/functions/send-lead-autoresponder/email-template.ts`

**Customization Points:**
- Welcome message
- Next steps
- Contact information
- Branding elements

## Email Delivery Monitoring

### Resend Dashboard

1. Go to https://resend.com/emails
2. View sent emails, opens, clicks
3. Monitor delivery rates
4. Check bounce/complaint rates

### Database Logging

All email attempts are logged to `emails_log` table:

```sql
SELECT
  email_type,
  recipient_email,
  status,
  sent_at,
  error_message
FROM emails_log
ORDER BY sent_at DESC
LIMIT 50;
```

## Error Handling

### Retry Logic

The system automatically retries failed sends:
- Attempt 1: Immediate
- Attempt 2: After 1 minute
- Attempt 3: After 5 minutes

### Failure Notifications

If all retries fail:
1. Error logged to database
2. Console error logged
3. Admin can review failed sends in database

## Rate Limiting

Resend rate limits:
- **Free tier**: 100 emails/day
- **Pro tier**: 50,000 emails/month
- **Custom**: Contact Resend

Monitor your usage in Resend Dashboard.

## Testing Checklist

- [ ] Send test admin notification
- [ ] Verify email received in admin inbox
- [ ] Check email renders correctly in Gmail
- [ ] Check email renders correctly in Outlook
- [ ] Check email renders correctly on mobile
- [ ] Send test auto-responder
- [ ] Verify lead receives email
- [ ] Test with disposable email addresses (should be blocked)
- [ ] Verify failed sends are logged
- [ ] Check retry logic works for temporary failures
- [ ] Confirm rate limiting prevents abuse

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify RESEND_API_KEY is correct
2. **Check Domain**: Ensure domain is verified in Resend
3. **Check Logs**: Review `emails_log` table for errors
4. **Check Rate Limits**: Verify you haven't hit Resend limits

### Emails Going to Spam

1. **Verify Domain**: Complete SPF, DKIM setup in Resend
2. **Warm Up Domain**: Send gradually increasing volume
3. **Content**: Avoid spam trigger words
4. **Authentication**: Ensure proper email authentication

### Edge Function Errors

1. **Check Environment Variables**: Verify they're set in Supabase
2. **Check CORS**: Ensure CORS headers are present
3. **Check Logs**: View edge function logs in Supabase Dashboard
4. **Test Locally**: Use Supabase CLI to test locally

## Maintenance

### Weekly Tasks
- Review email delivery rates
- Check failed send logs
- Monitor bounce/complaint rates

### Monthly Tasks
- Review email templates for updates
- Check Resend usage vs. plan limits
- Test email rendering in major clients
- Update email content as needed

## Support

- **Resend Support**: support@resend.com
- **Resend Docs**: https://resend.com/docs
- **Resend Status**: https://status.resend.com
