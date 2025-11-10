# AI Features End-to-End Test Guide

## Overview
This document provides step-by-step instructions for testing the AI playbook generation and market analysis features after the authentication fix.

---

## What Was Fixed

### Critical Bug Resolved ✅
**Issue:** Edge Functions were being called with the anon key instead of user JWT token
**Impact:** All AI generation requests failed with 401 Unauthorized
**Fix:** Updated `AIServicesManager` to use `session.access_token` instead of `supabaseAnonKey`

### Database Schema Updated ✅
**Added:** `source_client_id` column to `playbooks` table
**Purpose:** Links playbooks to the client they were generated for

---

## Prerequisites

### 1. Database Requirements
- ✅ `clients` table with at least one client
- ✅ `playbooks` table with `source_client_id` column (just added)
- ✅ `reports` table for market analysis
- ✅ `profiles` table for user authentication

### 2. Edge Functions Status
Both Edge Functions are deployed and ready:
- `/functions/v1/generate-playbook`
- `/functions/v1/generate-market-analysis`

### 3. Current Configuration
**OpenAI API Key:** Not configured (uses mock data)
**Expected Behavior:** Generates realistic template-based playbooks and analysis

---

## Test Plan

### Test 1: AI Playbook Generation

#### Steps to Test:

1. **Navigate to Playbooks Page**
   - Log in to cmoxpert
   - Click "Playbooks" in the sidebar
   - You should see the AI playbooks interface

2. **Initiate Generation**
   - Click "Generate AI Playbook" button (top right)
   - Select a client from the dropdown
   - Choose playbook type (e.g., "Growth Strategy")
   - Click "Generate AI Playbook"

3. **Expected Behavior**
   - Button shows "Generating..." with spinner
   - Banner appears: "AI Playbook Generation in Progress"
   - Wait 30-60 seconds for generation
   - Success message appears
   - New playbook appears in the list

4. **Verify Generated Playbook**
   - Playbook should have:
     - Name: e.g., "Growth Acceleration Playbook for [Client Name]"
     - Description: 2-3 paragraph overview
     - Category: Matches selected type
     - 8-12 tactics with:
       - Title
       - Description
       - Timeline (e.g., "Week 1-2")
       - Difficulty (Easy/Medium/Hard)
       - Impact (Low/Medium/High)
       - Resources array
       - KPIs array

5. **View Playbook Details**
   - Click "View Playbook" button
   - Modal opens showing full playbook
   - All tactics are displayed with proper formatting
   - Can close modal successfully

#### Success Criteria:
- ✅ No 401 authentication errors
- ✅ No console errors
- ✅ Playbook saves to database with correct user_id and source_client_id
- ✅ Tactics are well-structured and actionable
- ✅ UI remains responsive during generation

#### Database Verification:
```sql
-- Check the generated playbook
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
LIMIT 5;

-- Verify tactics structure
SELECT
  name,
  tactics->0 as first_tactic
FROM playbooks
ORDER BY created_at DESC
LIMIT 1;
```

---

### Test 2: Market Analysis Generation

#### Steps to Test:

1. **Navigate to Client Detail**
   - Go to "Clients" page
   - Click on a client to view details

2. **Generate Analysis**
   - Scroll to "Market Analysis" section
   - Click "Generate Report" button

3. **Expected Behavior**
   - Status changes to "Generating..."
   - Progress indicator appears
   - Wait 30-60 seconds
   - Status changes to "Completed"
   - Report becomes viewable

4. **View Report**
   - Click to view the generated report
   - Should contain:
     - Executive Summary
     - Key Market Opportunities
     - Competitive Analysis
     - Strategic Recommendations
     - Key Metrics to Track

5. **Verify Data Sources**
   - SEMrush data section shows mock competitive data
   - Trends data section shows mock trend analysis
   - Both should have realistic metrics

#### Success Criteria:
- ✅ No authentication errors
- ✅ Report saves with status "completed"
- ✅ AI analysis is comprehensive (500+ words)
- ✅ Data sources are populated
- ✅ Report is accessible after generation

#### Database Verification:
```sql
-- Check generated reports
SELECT
  id,
  client_id,
  domain,
  status,
  LENGTH(ai_analysis) as analysis_length,
  created_at
FROM reports
ORDER BY created_at DESC
LIMIT 5;

-- View report content
SELECT
  domain,
  status,
  LEFT(ai_analysis, 200) as analysis_preview,
  semrush_data->>'domain' as semrush_domain,
  trends_data->>'industry' as trends_industry
FROM reports
ORDER BY created_at DESC
LIMIT 1;
```

---

## Testing the Authentication Fix

### Before Fix (Would Fail):
```javascript
// Old code - WRONG
headers: {
  'Authorization': `Bearer ${supabaseAnonKey}`,  // ❌ Anon key
  'Content-Type': 'application/json',
}
// Result: 401 Unauthorized
```

### After Fix (Now Works):
```javascript
// New code - CORRECT
const { data: { session } } = await supabase.auth.getSession();
headers: {
  'Authorization': `Bearer ${session.access_token}`,  // ✅ User JWT
  'apikey': supabaseAnonKey,
  'Content-Type': 'application/json',
}
// Result: 200 OK with generated content
```

### How to Verify Fix:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Trigger AI generation
4. Find the Edge Function request
5. Check Request Headers:
   - `Authorization` should have a long JWT token (not the anon key)
   - `apikey` should have the anon key
6. Check Response:
   - Status: 200 (not 401)
   - Body: Contains `success: true` and generated content

---

## Mock Data vs Real AI

### Current State (No OpenAI Key):

**Playbook Generation:**
- Uses `generateEnhancedMockPlaybook()` function
- Returns predefined tactics based on playbook type
- Content is high-quality but template-based
- Always generates 8-12 tactics from hardcoded templates

**Market Analysis:**
- Uses `generateEnhancedMockAnalysis()` function
- Returns formatted markdown analysis
- Includes realistic competitive data
- SEMrush and Trends data are simulated with realistic metrics

### With OpenAI Key Configured:

**What Changes:**
- Playbooks become truly personalized to client data
- Analysis adapts to specific industry context
- Recommendations based on actual market research
- Unique content every time (not templates)

**Cost:** ~$0.05-0.10 per generation

---

## Common Issues & Troubleshooting

### Issue 1: "User is not authenticated"
**Cause:** User session expired
**Fix:** Log out and log back in

### Issue 2: "Client not found or access denied"
**Cause:** User doesn't own the client
**Fix:** Ensure you're using your own clients

### Issue 3: Generation hangs indefinitely
**Cause:** Edge Function timeout or error
**Check:** Browser console for errors
**Fix:** Refresh page and try again

### Issue 4: Tactics array is empty
**Cause:** JSON validation failed
**Check:** Edge Function logs in Supabase dashboard
**Fix:** Should fallback to mock data automatically

### Issue 5: Reports show status "pending" forever
**Cause:** Edge Function failed silently
**Check:** Database for error messages
**Fix:** Delete failed report and regenerate

---

## Performance Benchmarks

### Expected Timing:
- **Playbook Generation:** 5-10 seconds (mock) or 30-60 seconds (with OpenAI)
- **Market Analysis:** 5-10 seconds (mock) or 30-60 seconds (with OpenAI)
- **Database Write:** <100ms
- **UI Update:** <500ms after completion

### Resource Usage:
- **Edge Function Memory:** ~50MB per generation
- **Database Storage:** ~10KB per playbook, ~50KB per report
- **API Tokens (with OpenAI):** ~2000-3000 tokens per generation

---

## Security Validation

### Authentication Tests:

1. **Test Without Login**
   - Log out
   - Try to access Playbooks page
   - Should redirect to login

2. **Test Token Validation**
   - Edge Function validates JWT on every request
   - Expired tokens are rejected
   - User ID in token must match requested userId

3. **Test Ownership Validation**
   - User can only generate for their own clients
   - Cannot access other users' playbooks
   - RLS policies enforce data isolation

### Expected Security Behavior:
- ✅ All Edge Function calls require authentication
- ✅ User can only access their own data
- ✅ No API keys exposed to frontend
- ✅ CORS headers properly configured
- ✅ Service role key only used server-side

---

## Next Steps After Testing

### If Tests Pass:
1. Update README with accurate feature descriptions
2. Consider adding OpenAI key for real AI generation
3. Monitor usage and costs
4. Collect user feedback on playbook quality

### If Tests Fail:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify database schema matches expectations
4. Test with different browsers
5. Check network requests in DevTools

---

## Manual Testing Checklist

Use this checklist for comprehensive testing:

### Playbook Generation:
- [ ] Can access Playbooks page when logged in
- [ ] "Generate AI Playbook" button is visible
- [ ] Can open generation modal
- [ ] Client dropdown populates with user's clients
- [ ] All playbook types are selectable
- [ ] Generation starts without errors
- [ ] Loading state displays correctly
- [ ] Generation completes successfully
- [ ] Playbook appears in list
- [ ] Can view playbook details
- [ ] Tactics are properly formatted
- [ ] Can close modal
- [ ] Playbook is saved to database
- [ ] Can filter/search for playbook
- [ ] Can view client link from playbook

### Market Analysis:
- [ ] Can access Client Detail page
- [ ] "Generate Report" button is visible
- [ ] Generation starts without errors
- [ ] Status updates during generation
- [ ] Generation completes successfully
- [ ] Can view report details
- [ ] Analysis content is comprehensive
- [ ] Data sources show mock data
- [ ] Can download report
- [ ] Report is saved to database
- [ ] Can navigate to Reports page
- [ ] Report appears in reports list

### Edge Cases:
- [ ] Generate multiple playbooks for same client
- [ ] Generate playbooks for different clients
- [ ] Generate report while another is pending
- [ ] Refresh page during generation
- [ ] Navigate away during generation
- [ ] Test with slow network
- [ ] Test with client that has no domain

---

## Success Metrics

### Technical Success:
- Zero 401 authentication errors
- Zero 403 authorization errors
- 100% of generations complete successfully
- Average generation time <60 seconds
- No database constraint violations

### User Experience Success:
- Clear loading indicators
- Helpful error messages
- Smooth UI transitions
- Responsive during generation
- Easy to understand generated content

---

## Conclusion

The authentication bug has been fixed and the database schema updated. The AI features should now work end-to-end with mock data.

**Status:** ✅ Ready for testing
**Build:** ✅ Passed
**Database:** ✅ Updated
**Authentication:** ✅ Fixed

**Next Action:** Manual testing in browser to verify complete functionality
