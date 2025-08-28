# GitHub Secrets Configuration for CVPerfect CI/CD

This document lists all GitHub secrets required for the production deployment pipeline.

## Required GitHub Secrets

### Authentication & Deployment
```bash
GITHUB_TOKEN                    # Automatically provided by GitHub Actions
VERCEL_TOKEN                   # Vercel deployment token
VERCEL_ORG_ID                  # Vercel organization ID  
VERCEL_PROJECT_ID              # Vercel project ID
RAILWAY_TOKEN                  # Railway deployment token
SUPABASE_ACCESS_TOKEN          # Supabase project management token
SUPABASE_PROJECT_ID            # Supabase project identifier
```

### Monitoring & Notifications
```bash
MONITORING_WEBHOOK             # Performance monitoring webhook URL
SLACK_WEBHOOK                  # Slack notifications webhook
```

## Setup Instructions

### 1. Vercel Configuration
1. Login to Vercel dashboard
2. Go to Settings → Tokens
3. Create new token with deployment permissions
4. Add as `VERCEL_TOKEN` secret

Get organization and project IDs:
```bash
npx vercel whoami
npx vercel ls
```

### 2. Railway Configuration  
1. Login to Railway dashboard
2. Go to Account Settings → Tokens
3. Create deployment token
4. Add as `RAILWAY_TOKEN` secret

### 3. Supabase Configuration
1. Login to Supabase dashboard
2. Go to Settings → API → Management API
3. Create access token
4. Add as `SUPABASE_ACCESS_TOKEN` secret
5. Add project ID as `SUPABASE_PROJECT_ID`

### 4. Monitoring Setup
Configure webhooks for production monitoring:

**Slack Webhook:**
```bash
curl -X POST https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text": "CVPerfect monitoring test"}'
```

**Monitoring Webhook:**
```bash
curl -X POST https://your-monitoring-service.com/webhook \
  -H 'Content-Type: application/json' \
  -d '{"event": "test", "service": "cvperfect"}'
```

## Security Best Practices

1. **Token Rotation**: Rotate all tokens every 90 days
2. **Minimal Permissions**: Use least-privilege tokens
3. **Environment Separation**: Separate tokens for staging/production
4. **Access Auditing**: Regular audit of token usage
5. **Backup Secrets**: Store backup copies securely

## Validation Commands

Test secrets configuration:
```bash
# Test Vercel deployment
vercel deploy --prod --token $VERCEL_TOKEN

# Test Railway deployment
railway login --token $RAILWAY_TOKEN
railway status

# Test Supabase access
curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID
```

## Pipeline Validation

Run pipeline validation locally:
```bash
# Security validation
npm audit --audit-level high
npm run lint

# Build validation  
npm run build

# Test suite validation
node test-complete-functionality.js
node test-all-success-functions.js
node test-health-endpoint.js
node test-performance-monitoring.js
```

## Troubleshooting

### Common Issues:

**Token Expired:**
- Regenerate token in respective service
- Update GitHub secret immediately

**Permission Denied:**
- Verify token has deployment permissions
- Check organization/project access

**Build Failures:**
- Verify environment variables are set
- Check dependency versions

**Deployment Timeout:**
- Increase timeout in workflow
- Check service status pages

## Emergency Procedures

### Production Rollback:
```bash
# Manual rollback via GitHub Actions
# Go to Actions → Production Deploy → Re-run failed jobs → Rollback
```

### Emergency Contacts:
- **DevOps**: Immediate deployment issues
- **Security**: Token compromise
- **Infrastructure**: Service outages

## Compliance Notes

- All secrets are encrypted at rest
- Access logs are maintained for 90 days
- Token rotation schedule documented
- Security review quarterly