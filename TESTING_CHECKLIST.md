# AI Features Testing Checklist

## Quick Start
This is your go-to checklist for testing the AI features after the authentication fix.

---

## ✅ Pre-Testing Verification (Complete)

- [x] Authentication bug fixed in `src/lib/supabase.ts`
- [x] Database schema updated with `source_client_id` column
- [x] Build passing (no errors)
- [x] Edge Functions deployed and ready
- [x] Test documentation created

---

## 🧪 Manual Testing Steps

### 1. Login and Setup
- [ ] Navigate to cmoxpert application
- [ ] Log in with valid credentials
- [ ] Verify you see the dashboard
- [ ] Note: Browser DevTools (F12) open for debugging

### 2. Test AI Playbook Generation

#### Basic Flow:
- [ ] Navigate to "Playbooks" page (sidebar)
- [ ] Click "Generate AI Playbook" button (top right)
- [ ] Modal opens successfully
- [ ] Client dropdown shows your clients
- [ ] Select a client from dropdown
- [ ] Select playbook type (e.g., "Growth Strategy")
- [ ] Click "Generate AI Playbook" button in modal
- [ ] Modal closes
- [ ] Generation status banner appears
- [ ] Button shows "Generating..." with spinner
- [ ] Wait 30-60 seconds
- [ ] Success message appears
- [ ] New playbook appears in the list

#### Verify Generated Content:
- [ ] Playbook has a meaningful name
- [ ] Description is 2-3 paragraphs
- [ ] Category matches selected type
- [ ] Click "View Playbook" button
- [ ] Modal opens with full playbook
- [ ] Count tactics (should be 8-12)
- [ ] Each tactic has:
  - [ ] Title
  - [ ] Description
  - [ ] Timeline
  - [ ] Difficulty (Easy/Medium/Hard)
  - [ ] Impact (Low/Medium/High)
  - [ ] Resources list
  - [ ] KPIs list
- [ ] Close modal successfully
- [ ] Playbook persists in list after page refresh

#### Check Network Requests:
- [ ] Open DevTools → Network tab
- [ ] Generate another playbook
- [ ] Find request to `/functions/v1/generate-playbook`
- [ ] Click on request
- [ ] Check Request Headers:
  - [ ] `Authorization` header has JWT token (long string)
  - [ ] `apikey` header has anon key
- [ ] Check Response:
  - [ ] Status: 200 (not 401)
  - [ ] Body has `success: true`
  - [ ] Body has `playbookId`
  - [ ] Body has `playbook` object

### 3. Test Market Analysis Generation

#### Basic Flow:
- [ ] Navigate to "Clients" page
- [ ] Click on any client
- [ ] Scroll to "Market Analysis" section
- [ ] Click "Generate Report" button
- [ ] Generation starts (button shows loading)
- [ ] Wait 30-60 seconds
- [ ] Report status changes to "Completed"
- [ ] Report appears in list

#### Verify Generated Content:
- [ ] Click to view report details
- [ ] Modal or page opens with report
- [ ] Analysis has multiple sections:
  - [ ] Executive Summary
  - [ ] Key Market Opportunities
  - [ ] Competitive Analysis
  - [ ] Strategic Recommendations
  - [ ] Key Metrics to Track
- [ ] SEMrush data section visible
- [ ] Trends data section visible
- [ ] Both data sources have metrics
- [ ] Can download report
- [ ] Close report view

#### Check Database:
- [ ] Go to Reports page
- [ ] Find the generated report
- [ ] Status shows "completed"
- [ ] Domain matches client
- [ ] Click "View Report"
- [ ] Full analysis displays

#### Check Network Requests:
- [ ] Open DevTools → Network tab
- [ ] Generate another analysis
- [ ] Find request to `/functions/v1/generate-market-analysis`
- [ ] Check Request Headers:
  - [ ] `Authorization` has JWT token
  - [ ] `apikey` has anon key
- [ ] Check Response:
  - [ ] Status: 200
  - [ ] Body has `success: true`
  - [ ] Body has `reportId`

### 4. Test Error Handling

#### Session Expiry:
- [ ] Log out
- [ ] Try to access Playbooks page
- [ ] Redirected to login (good!)
- [ ] Log back in

#### Invalid Client:
- [ ] Generate playbook for a client
- [ ] Verify only your clients are accessible
- [ ] Cannot see other users' clients

#### Network Issues:
- [ ] Open DevTools → Network tab
- [ ] Set network throttling to "Slow 3G"
- [ ] Try generating playbook
- [ ] Should still work (just slower)
- [ ] Reset throttling to "No throttling"

### 5. Test Multiple Generations

#### Concurrent Generations:
- [ ] Generate playbook for Client A
- [ ] While generating, try to generate for Client B
- [ ] Both should queue properly
- [ ] Both complete successfully

#### Multiple Playbooks Per Client:
- [ ] Generate 3 playbooks for same client
- [ ] All 3 should save
- [ ] All 3 should be visible in list
- [ ] Each should be unique (check tactics)

---

## 🔍 Database Verification

### Run These Queries:

```sql
-- Check playbooks
SELECT
  id,
  name,
  category,
  source_client_id,
  user_id,
  jsonb_array_length(tactics) as tactic_count,
  created_at
FROM playbooks
ORDER BY created_at DESC
LIMIT 10;

-- Check reports
SELECT
  id,
  domain,
  status,
  LENGTH(ai_analysis) as analysis_length,
  created_at
FROM reports
ORDER BY created_at DESC
LIMIT 10;

-- Verify source_client_id column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'playbooks'
AND column_name = 'source_client_id';
```

Expected Results:
- [ ] Playbooks have `source_client_id` populated
- [ ] Tactic count is 8-12
- [ ] Reports have `ai_analysis` with 500+ characters
- [ ] All records have your `user_id`

---

## 🚨 Known Issues to Check

### Should NOT See These Errors:
- ❌ 401 Unauthorized
- ❌ 403 Forbidden
- ❌ "Invalid or expired token"
- ❌ "Missing authorization header"
- ❌ "User ID mismatch"
- ❌ Console errors about authentication

### Should See These Behaviors:
- ✅ Clear loading indicators
- ✅ Success messages
- ✅ Generated content saves to database
- ✅ UI updates after generation
- ✅ Can view generated content

---

## 📊 Success Criteria

### Must Pass (Critical):
- [ ] No authentication errors (401/403)
- [ ] Playbooks generate and save successfully
- [ ] Reports generate and save successfully
- [ ] Content is properly structured
- [ ] Database records created correctly

### Should Pass (Important):
- [ ] Loading states display correctly
- [ ] Error messages are helpful
- [ ] UI remains responsive
- [ ] Can generate multiple items
- [ ] Network requests are secure

### Nice to Have (Enhancement):
- [ ] Generation completes in <60 seconds
- [ ] Content is high quality
- [ ] UI animations are smooth
- [ ] No console warnings

---

## 🐛 If Something Fails

### Authentication Errors (401/403):
1. Check browser console for exact error
2. Verify you're logged in
3. Check DevTools → Application → Local Storage
4. Look for `cmoxpert-auth` session
5. Try logging out and back in

### Generation Fails:
1. Check browser console
2. Check Network tab for failed request
3. Look at response body for error message
4. Check Supabase Edge Function logs
5. Try with a different client

### Content Issues:
1. Verify Edge Functions are deployed
2. Check if OpenAI key is configured (optional)
3. Look at database records
4. Check JSON structure of tactics

### Database Issues:
1. Verify column exists: `source_client_id`
2. Check foreign key constraints
3. Verify user owns the clients
4. Check RLS policies

---

## 📝 Report Your Results

### Create a Test Report:
- [ ] List all tests performed
- [ ] Note any failures
- [ ] Include error messages
- [ ] Screenshots of issues
- [ ] Browser console logs
- [ ] Network request details

### Share Results:
- Document what works
- Document what doesn't work
- Suggest improvements
- Report any UX issues

---

## ✨ Optional: Test with OpenAI

If you add an OpenAI API key:

### Configuration:
- [ ] Get OpenAI API key
- [ ] Add to Supabase Edge Functions settings
- [ ] Key: `OPENAI_API_KEY`
- [ ] Value: Your API key

### Testing:
- [ ] Generate new playbook
- [ ] Should take 30-60 seconds (longer than mock)
- [ ] Content should be unique
- [ ] Content should reference client data
- [ ] Check OpenAI usage dashboard for costs

### Comparison:
- [ ] Compare AI vs mock playbooks
- [ ] AI should be more personalized
- [ ] AI should reference industry specifics
- [ ] AI should adapt to client context

---

## 🎯 Final Checklist

Before marking as complete:
- [ ] All critical tests pass
- [ ] No authentication errors
- [ ] Database records created correctly
- [ ] UI works as expected
- [ ] Documentation is accurate
- [ ] Ready for production use

---

**Status After Testing:** ⬜ Pass / ⬜ Fail / ⬜ Needs Review

**Tester Name:** ________________

**Date:** ________________

**Browser:** ________________

**Notes:**
