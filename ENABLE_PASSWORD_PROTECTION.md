# Enable Leaked Password Protection in Supabase

## Overview
Supabase Auth can check user passwords against the HaveIBeenPwned database to prevent the use of compromised passwords. This is a critical security feature that should be enabled.

## Steps to Enable

### 1. Access Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project: **cmoxpert**
3. Navigate to **Authentication** → **Providers** → **Email**

### 2. Enable Leaked Password Protection
1. Scroll down to find **Password Protection** section
2. Toggle on: **"Enable leaked password protection"**
3. This will check passwords against HaveIBeenPwned.org database
4. Click **Save** to apply changes

### 3. What This Does
- **Sign Up**: Prevents users from creating accounts with compromised passwords
- **Password Reset**: Prevents users from resetting to compromised passwords
- **Password Change**: Prevents users from changing to compromised passwords
- **User Experience**: Shows clear error message: "This password has been found in a data breach. Please choose a different password."

### 4. Configuration Options

You can customize the behavior:

```typescript
// Default behavior (recommended)
{
  "leaked_password_protection": {
    "enabled": true,
    "block_compromised_passwords": true
  }
}
```

**Recommended Settings:**
- ✅ **Enabled**: true
- ✅ **Block compromised passwords**: true (prevents sign up with leaked passwords)

### 5. Testing

After enabling, test with a known compromised password:

1. Try to sign up with password: `password123`
2. Should receive error: "This password has been found in a data breach"
3. Try with a strong password: Should succeed

### 6. User Communication

Update your password requirements messaging:

**Before:**
```
Password must be at least 8 characters
```

**After:**
```
Password must be:
- At least 8 characters
- Not found in known data breaches
- Include a mix of letters, numbers, and symbols
```

## Why This Matters

### Security Benefits:
1. **Prevents Account Takeover**: Stops users from using passwords that have been leaked in breaches
2. **Reduces Credential Stuffing**: Makes automated attacks much harder
3. **Protects User Data**: Even if users reuse passwords, they won't be from known breaches
4. **Compliance**: Meets security best practices for SaaS applications

### Statistics:
- **23.2 million** passwords in "123456" variations
- **3.6 million** accounts use "password"
- **60%** of data breaches involve weak or compromised passwords

## Implementation Checklist

- [ ] Enable leaked password protection in Supabase Dashboard
- [ ] Test with known compromised password
- [ ] Update password requirements in UI
- [ ] Update Terms of Service / Privacy Policy
- [ ] Communicate change to existing users (optional)

## Additional Security Recommendations

While enabling password protection, consider these additional security measures:

### 1. Minimum Password Length
- Current: 8 characters (Supabase default)
- Recommended: Keep at 8+ for good balance

### 2. Rate Limiting
- Already enabled via Supabase Auth
- Default: 10 failed attempts per hour

### 3. Email Verification
- Status: Currently disabled
- Recommendation: Keep disabled for beta, enable for production

### 4. Two-Factor Authentication (2FA)
- Status: Available in Supabase
- Recommendation: Add as optional feature for admin users

## Troubleshooting

### Issue: "Too many requests" when checking passwords
**Solution**: HaveIBeenPwned API is rate-limited. Supabase caches results. Should resolve in a few minutes.

### Issue: Users can't create accounts
**Solution**: Ensure they're using strong, unique passwords. Provide clear error messaging.

### Issue: False positives
**Solution**: Very rare. If reported, verify with HaveIBeenPwned directly: https://haveibeenpwned.com/Passwords

## References

- [HaveIBeenPwned API Documentation](https://haveibeenpwned.com/API/v3)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Status

- [ ] **Action Required**: This feature must be enabled manually in Supabase Dashboard
- [ ] **Priority**: HIGH - Critical security feature
- [ ] **Effort**: 2 minutes
- [ ] **Impact**: Significantly improves security posture

---

**Last Updated**: 2025-11-26
**Responsible**: Platform Administrator
**Tracking**: Security Enhancement #001
