# 🧪 MANUAL TEST INSTRUCTIONS - CV Upload to Success Page

## ✅ What Has Been Fixed

1. **Stripe Integration** - Real price IDs configured:
   - Basic: `price_1Rwooh4FWb3xY5tDRxqQ4y69` (19.99 PLN)
   - Gold: `price_1RxuK64FWb3xY5tDOjAPfwRX` (49 PLN/month)
   - Premium: `price_1RxuKK4FWb3xY5tD28TyEG9e` (79 PLN/month)

2. **Session Storage** - CV data is saved to `.sessions/` directory before payment

3. **Success Page** - Updated to load user's actual CV from saved session:
   - Priority 1: Full CV data from saved session file
   - Priority 2: Metadata from Stripe (truncated)
   - No more hardcoded Anna Kowalska!

4. **Compilation Errors** - Removed duplicate function definitions

## 📋 Test Steps

### Step 1: Start the Development Server
```bash
npm run dev
```
Wait for: `✓ Compiled`

### Step 2: Open Browser
Navigate to: http://localhost:3000

### Step 3: Upload Your CV
1. Click "Sprawdź swoje CV" button
2. Upload a CV file (PDF, DOCX, or TXT)
   - **IMPORTANT**: Use a CV with your name (not Anna Kowalska)
   - CV should be at least 3 pages / 1000+ words
3. Enter your email address
4. Select a plan (Basic recommended for testing)

### Step 4: Complete Payment
1. You'll be redirected to Stripe Checkout
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date (e.g., 12/34)
4. Any CVC (e.g., 123)
5. Complete the payment

### Step 5: Verify Success Page
After payment, you should be redirected to `/success` page

**CHECK THESE POINTS:**
- [ ] ✅ Your name appears (not Anna Kowalska)
- [ ] ✅ Your CV content is displayed
- [ ] ✅ AI optimization processes YOUR CV
- [ ] ✅ Templates show YOUR information
- [ ] ✅ PDF export contains YOUR CV
- [ ] ✅ Email function sends YOUR CV

## 🔍 What to Look For in Console

Open browser DevTools (F12) and check Console tab:

**Good signs:**
- `✅ Using FULL CV data from saved session (BEST PRIORITY)`
- `🤖 Processing user's actual CV: [your CV text]...`
- `✅ Full CV data retrieved for session: sess_XXX`

**Bad signs:**
- `Using Anna Kowalska demo data`
- `No valid session data found`
- Any mention of "Anna Kowalska" in the CV content

## 🐛 Troubleshooting

### If you still see Anna Kowalska:
1. Check `.sessions/` directory for your session file
2. Look for a file named `sess_[timestamp]_[random].json`
3. Open it and verify it contains YOUR CV data

### If payment doesn't work:
1. Check browser console for errors
2. Verify Stripe price IDs in `/api/create-checkout-session.js`
3. Make sure `STRIPE_SECRET_KEY` is set in `.env.local`

### If success page shows error:
1. Check the URL has `session_id` parameter
2. Try refreshing the page once
3. Check browser console for specific error messages

## 📊 Expected Test Results

| Feature | Expected Result | Status |
|---------|----------------|---------|
| CV Upload | Saves to sessionStorage and .sessions/ | ✅ Fixed |
| Payment Flow | Redirects to Stripe with CV metadata | ✅ Fixed |
| Success Page | Loads user's actual CV from session | ✅ Fixed |
| AI Optimization | Processes user's CV, not demo | ✅ Fixed |
| PDF Export | Contains user's optimized CV | ✅ Fixed |
| Templates | Display user's information | ✅ Fixed |

## 🎯 Summary

The main issue "success page shows Anna Kowalska instead of uploaded CV" has been fixed by:
1. Saving full CV data to file system before payment
2. Passing session ID through Stripe metadata
3. Loading full CV from saved session on success page
4. Removing hardcoded demo data fallbacks

**The website should now work end-to-end as expected!**