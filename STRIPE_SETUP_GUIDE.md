# Stripe Payment Setup Guide

This guide will help you set up Stripe payments for the cmoxpert beta program.

---

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard
3. Access to your Supabase project

---

## Step 1: Create Stripe Products & Prices

### 1.1 Sign in to Stripe Dashboard

Go to https://dashboard.stripe.com and sign in.

### 1.2 Create Products

Navigate to **Products** in the left sidebar, then click **Add Product** for each tier:

#### Starter Tier (Early Adopter)
- **Name:** cmoxpert - Starter (Beta)
- **Description:** Early adopter beta pricing - Up to 3 clients
- **Pricing:**
  - **Price:** $99 USD
  - **Billing period:** Monthly recurring
  - Click **Add pricing** then **Save product**
- **Copy the Price ID** (starts with `price_...`) - you'll need this later

#### Professional Tier
- **Name:** cmoxpert - Professional (Beta)
- **Description:** Beta pricing - Up to 10 clients
- **Pricing:**
  - **Price:** $199 USD
  - **Billing period:** Monthly recurring
  - Click **Add pricing** then **Save product**
- **Copy the Price ID** (starts with `price_...`)

#### Agency Tier
- **Name:** cmoxpert - Agency (Beta)
- **Description:** Beta pricing - Up to 25 clients
- **Pricing:**
  - **Price:** $399 USD
  - **Billing period:** Monthly recurring
  - Click **Add pricing** then **Save product**
- **Copy the Price ID** (starts with `price_...`)

---

## Step 2: Get Your Stripe API Keys

### 2.1 Get Publishable Key (For Frontend)

1. Go to **Developers** → **API Keys** in Stripe Dashboard
2. Copy your **Publishable key** (starts with `pk_test_...` for test mode)
3. This is safe to expose in your frontend

### 2.2 Get Secret Key (For Backend)

1. In the same **API Keys** page
2. Copy your **Secret key** (starts with `sk_test_...` for test mode)
3. **NEVER expose this key in frontend code**

---

## Step 3: Configure Environment Variables

### 3.1 Frontend Environment Variables (Netlify)

Add these to your Netlify site settings:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_STRIPE_PRICE_STARTER=price_your_starter_price_id
VITE_STRIPE_PRICE_PROFESSIONAL=price_your_professional_price_id
VITE_STRIPE_PRICE_AGENCY=price_your_agency_price_id
```

**How to add in Netlify:**
1. Go to your Netlify site dashboard
2. Click **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add each variable one by one

### 3.2 Backend Environment Variables (Supabase Edge Functions)

Add these to your Supabase project:

```
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
```

**How to add in Supabase:**
1. Go to your Supabase project dashboard
2. Click **Edge Functions** in the sidebar
3. Click **Manage secrets**
4. Click **Add new secret**
5. Add:
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your actual Stripe secret key

---

## Step 4: Deploy the Stripe Checkout Function

Run this command to deploy the checkout function:

```bash
npx supabase functions deploy create-checkout-session
```

Or if you have the Supabase CLI installed:

```bash
supabase functions deploy create-checkout-session
```

---

## Step 5: Test the Integration

### 5.1 Use Test Cards

Stripe provides test card numbers for testing:

**Successful payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined payment:**
- Card: `4000 0000 0000 0002`

### 5.2 Test the Checkout Flow

1. Go to your beta landing page: https://your-site.netlify.app/beta
2. Scroll to the pricing section
3. Click "Get Started" on any paid tier
4. Fill in the form
5. Use a test card number
6. Verify the checkout completes successfully

---

## Step 6: Set Up Webhooks (Optional but Recommended)

Webhooks allow Stripe to notify your app when subscriptions are created, updated, or canceled.

### 6.1 Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-project-id.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

### 6.2 Add Webhook Secret to Supabase

Add the webhook secret to your Supabase Edge Functions:

```
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

---

## Step 7: Switch to Live Mode

When you're ready to accept real payments:

### 7.1 Activate Your Stripe Account

Complete the account activation in Stripe Dashboard (provide business details, bank account, etc.)

### 7.2 Create Live Mode Products

Repeat Step 1 but in **Live mode** (toggle in top right of Stripe Dashboard)

### 7.3 Update Environment Variables

Replace all test keys (`pk_test_...`, `sk_test_...`, `price_test_...`) with live keys (`pk_live_...`, `sk_live_...`, `price_live_...`)

### 7.4 Update Webhooks

Create a new webhook endpoint in Live mode with the same settings

---

## Troubleshooting

### "Stripe API key not configured" Error

**Problem:** The Edge Function can't find the Stripe secret key

**Solution:**
1. Verify you added `STRIPE_SECRET_KEY` to Supabase Edge Functions
2. Redeploy the function: `supabase functions deploy create-checkout-session`
3. Wait 1-2 minutes for the secret to propagate

### Checkout Session Creation Fails

**Problem:** Creating checkout session returns an error

**Solution:**
1. Check that your Price IDs are correct
2. Verify the Price IDs match the format `price_...`
3. Make sure the prices exist in the same Stripe mode (test/live) as your API key

### CORS Errors

**Problem:** Browser blocks the request with CORS error

**Solution:**
1. Verify the Edge Function has correct CORS headers
2. Check that you're calling the function from an allowed origin
3. Redeploy the function if needed

### Webhook Not Receiving Events

**Problem:** Stripe webhook events aren't being received

**Solution:**
1. Verify the webhook URL is correct
2. Check that the webhook is active in Stripe Dashboard
3. Test the webhook using Stripe's "Send test webhook" button
4. Check Supabase Edge Function logs for errors

---

## Security Best Practices

1. **Never expose Secret Keys:**
   - Only use secret keys in backend/Edge Functions
   - Never commit them to version control
   - Use environment variables

2. **Validate Webhooks:**
   - Always verify webhook signatures
   - Use the `STRIPE_WEBHOOK_SECRET` to validate

3. **Use HTTPS:**
   - Ensure your site uses HTTPS
   - Webhooks require HTTPS endpoints

4. **Test Thoroughly:**
   - Always test in test mode first
   - Use Stripe's test cards
   - Verify error handling

5. **Monitor Transactions:**
   - Check Stripe Dashboard regularly
   - Set up email notifications for failed payments
   - Monitor webhook delivery

---

## Additional Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe API Reference:** https://stripe.com/docs/api
- **Test Cards:** https://stripe.com/docs/testing
- **Webhooks Guide:** https://stripe.com/docs/webhooks
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions

---

## Support

If you encounter issues:

1. Check Stripe Dashboard logs
2. Check Supabase Edge Function logs
3. Review browser console for errors
4. Contact Stripe support for payment issues
5. Contact Supabase support for function issues

---

**Last Updated:** November 11, 2025
