# 🚨 URGENT SECURITY ACTION REQUIRED

## CRITICAL: API Keys Exposed

**IMMEDIATE ACTIONS NEEDED:**

### 1. ROTATE ALL KEYS NOW
All API keys in `.env.local` have been exposed and MUST be rotated:

#### GROQ API
- Login to https://console.groq.com
- Revoke key: `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`
- Generate new key
- Update `.env.local`

#### STRIPE  
- Login to https://dashboard.stripe.com
- Revoke keys:
  - `pk_test_51RoeeU4FWb3xY5tD7fECWiIcEv4IqYlLNiKlQhTA7fFBhJ2MLqpYJCKrhduq0pui1gOypw0WIWu6OeMcyuBbgbwZ00Yxt6JWkl`
  - `sk_test_51RoeeU4FWb3xY5tDMB4wvFEwXQnJV7ptkaiw00MRTbPD1cpq19rwGteTm2o5K0by3D6qNkX7uDdP5SZzj0BjtERI00xXOGqCEx`
  - `whsec_xQGgR5yGoktCxj8AwbA8okVL3V4bxgHA`
- Generate new keys
- Update webhook endpoints

#### SUPABASE (MOST CRITICAL)
- Login to https://supabase.com/dashboard
- **SERVICE ROLE KEY IS EXTREMELY DANGEROUS** - has admin access
- Reset project if necessary
- Generate new keys:
  - New anon key
  - New service role key
- Update RLS policies

#### GMAIL
- Login to https://myaccount.google.com/apppasswords  
- Revoke password: `dttuwawkmgaiyvye`
- Generate new app password

### 2. SECURE CONFIGURATION

```bash
# 1. Remove exposed file
rm .env.local

# 2. Copy template
cp .env.example .env.local

# 3. Add your NEW keys
nano .env.local

# 4. Verify gitignore
git status  # .env.local should NOT appear
```

### 3. GIT HISTORY CLEANUP
If keys were ever committed to git:
```bash
# Remove from history (DANGEROUS - backup first)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (if shared repo, coordinate with team)
git push origin --force --all
```

### 4. MONITORING
- Monitor Stripe transactions for unauthorized usage
- Check Groq usage dashboard
- Review Supabase logs
- Monitor email sending

## POST-INCIDENT CHECKLIST
- [ ] All keys rotated
- [ ] New .env.local with new keys  
- [ ] Git history cleaned (if needed)
- [ ] Team notified
- [ ] Monitoring enabled
- [ ] Incident documented

## CONTACT
If unauthorized usage detected:
- Stripe: https://support.stripe.com
- Groq: support@groq.com  
- Supabase: https://supabase.com/support

**Time is critical - act within 1 hour of reading this!**