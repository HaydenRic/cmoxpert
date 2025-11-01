# Manual Security Configuration Required

## Leaked Password Protection

**Status**: ⚠️ MUST BE ENABLED MANUALLY

**Action Required**: Enable HaveIBeenPwned password protection in Supabase Dashboard

### Steps to Enable:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `kgtiverynmxizyguklfr`
3. Navigate to **Authentication** → **Policies**
4. Find **Password Requirements** section
5. Enable **"Check passwords against HaveIBeenPwned database"**
6. Click **Save**

### What This Does:

- Prevents users from using compromised passwords that have appeared in data breaches
- Checks passwords against the HaveIBeenPwned.org database (70+ billion compromised passwords)
- Enhances security without requiring any code changes
- Users with compromised passwords will be prompted to choose a different password

### Priority:

**HIGH** - This should be enabled before production deployment to prevent account takeovers from credential stuffing attacks.

---

## Security Issues Fixed in Database Migration

✅ **RLS Policy Performance** - Optimized to use `(select auth.uid())` instead of `auth.uid()` to prevent per-row re-evaluation

✅ **Unused Indexes Removed** - Removed 90+ unused indexes to improve write performance and reduce storage

✅ **Multiple Permissive Policies** - Consolidated duplicate SELECT policies on videos table

✅ **Function Search Paths** - Made function search paths immutable with `SET search_path = public, pg_temp`

---

## Post-Migration Verification

Run these queries to verify the fixes:

```sql
-- Verify RLS policies are using (select auth.uid())
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'videos', 'video_views');

-- Verify unused indexes are removed
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verify function search paths are immutable
SELECT proname, prosecdef, proconfig
FROM pg_proc
WHERE proname IN (
  'auto_promote_first_admin',
  'get_pending_sync_mappings',
  'calculate_fintech_metrics_daily',
  'process_payment_event'
);
```
