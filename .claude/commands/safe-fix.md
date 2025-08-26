# CVPerfect Safe Fix Command

## Description
Implement fixes with full regression protection and verification protocol.

## Usage
```
/safe-fix [description of issue to fix]
```

Example:
```
/safe-fix infinite loop in success.js fetchUserDataFromSession
```

## Safe Fix Protocol

### Phase 1: Pre-Fix Analysis
```bash
# 1. Create isolated branch
git checkout -b safe-fix/$(date +%s)-[issue-slug]

# 2. Run baseline tests (document current state)
echo "=== BASELINE TESTS ===" > fix-log.txt
npm run lint >> fix-log.txt 2>&1
npm run build >> fix-log.txt 2>&1
node test-all-success-functions.js >> fix-log.txt 2>&1

# 3. Backup critical files
cp pages/success.js pages/success.js.backup-$(date +%s)
cp pages/index.js pages/index.js.backup-$(date +%s)

# 4. Document impact analysis
echo "=== IMPACT ANALYSIS ===" >> fix-log.txt
echo "Files to modify: [list]" >> fix-log.txt
echo "APIs affected: [list]" >> fix-log.txt
echo "Components affected: [list]" >> fix-log.txt
```

### Phase 2: Systematic Implementation
```bash
# 1. Use ultrathink for analysis
# Prompt: "Ultrathink: Fix [issue] WITHOUT breaking [critical-invariants-list]"

# 2. Start debug agents if needed
node start-debug-agents.js

# 3. Apply fix incrementally
# - Make ONE change at a time
# - Test after each change
# - Commit working checkpoints

# 4. Checkpoint commits
git add .
git commit -m "checkpoint: [specific change made] - working"
```

### Phase 3: Verification Protocol
```bash
# 1. Compile and build
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ LINT FAILED - fix before proceeding"
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  echo "❌ BUILD FAILED - fix before proceeding" 
  exit 1
fi

# 2. Run specific fix test
node test-specific-fix-[issue].js
if [ $? -ne 0 ]; then
  echo "❌ FIX TEST FAILED - issue not resolved"
  exit 1
fi

# 3. Run regression tests
echo "=== REGRESSION TESTS ===" >> fix-log.txt
node test-all-success-functions.js >> fix-log.txt 2>&1
node test-comprehensive-website.js >> fix-log.txt 2>&1
node test-agents-integration.js >> fix-log.txt 2>&1

# 4. Manual verification
echo "🧪 MANUAL TEST REQUIRED:"
echo "1. Open http://localhost:3001"
echo "2. Test the specific functionality that was broken"
echo "3. Verify fix works as expected"
echo "4. Test surrounding functionality for regressions"
read -p "Manual test completed successfully? (y/n): " manual_test

if [ "$manual_test" != "y" ]; then
  echo "❌ MANUAL TEST FAILED"
  exit 1
fi
```

### Phase 4: Safety Validation
```bash
# 1. Compare with baseline
echo "=== SAFETY COMPARISON ===" >> fix-log.txt
echo "Before fix:" >> fix-log.txt
cat baseline-results.txt >> fix-log.txt
echo "After fix:" >> fix-log.txt
# Run same tests and compare

# 2. Performance check
echo "=== PERFORMANCE CHECK ===" >> fix-log.txt
# Check memory usage, load times, etc.

# 3. Critical invariants check
echo "=== CRITICAL INVARIANTS ===" >> fix-log.txt
echo "✓ CV Upload working" >> fix-log.txt
echo "✓ Payment flow working" >> fix-log.txt  
echo "✓ AI optimization working" >> fix-log.txt
echo "✓ Template rendering working" >> fix-log.txt
echo "✓ File export working" >> fix-log.txt
echo "✓ Session management working" >> fix-log.txt
```

### Phase 5: Final Commit and Documentation
```bash
# 1. Create comprehensive commit
git add .
git commit -m "✅ SAFE-FIX: [Issue Description]

## Problem
[Describe the original issue]

## Root Cause  
[Explain the underlying cause]

## Solution
[Describe what was changed and why]

## Testing
- ✅ Lint: No errors
- ✅ Build: Successful  
- ✅ Unit tests: All pass
- ✅ Regression tests: No regressions
- ✅ Manual testing: Issue resolved
- ✅ Performance: No degradation

## Safety Measures
- Created isolated branch: $(git branch --show-current)
- Backed up critical files: [list backups]
- Ran full test suite: $(date)
- Verified critical invariants: All working

## Prevention
[What was done to prevent this issue in future]

🤖 Generated with Claude Code Safe-Fix Protocol
Co-Authored-By: Claude <noreply@anthropic.com>"

# 2. Tag the fix
git tag -a "safe-fix-$(date +%s)" -m "Safe fix: [issue description]"
```

## Critical Invariants (NEVER BREAK)

### Core User Journey:
1. **CV Upload** - Users can upload PDF/DOCX via drag-drop or file picker
2. **Payment Processing** - Stripe checkout flow works for all plans  
3. **AI Optimization** - Groq API integration processes CVs correctly
4. **Template Rendering** - All CV templates render with user data
5. **File Export** - PDF and DOCX export functions work
6. **Session Management** - Session persistence works through entire flow

### Technical Invariants:
- `pages/index.js` main SPA (6000+ lines) - state management works
- `pages/success.js` post-payment - template switching and exports work
- API endpoints respond correctly: `/api/analyze`, `/api/create-checkout-session`
- Supabase connection works for user/session management
- Environment variables are accessible
- Agent systems can be started without errors

## Rollback Procedures

### Emergency Rollback (if fix breaks something):
```bash
# Immediate rollback
git checkout main
git branch -D safe-fix/[timestamp]-[issue-slug]

# Restore from backup if needed
cp pages/success.js.backup-[timestamp] pages/success.js

# Verify rollback
npm run dev
# Test manually - should be back to working state
```

### Selective Rollback (keep some changes):
```bash
# Reset to specific commit
git reset --hard [last-good-commit-hash]

# Or restore specific files
git checkout HEAD~1 -- pages/success.js
```

## Integration with CVPerfect Systems

### Use CVPerfect Agents:
- Delegate complex analysis to specialized agents
- Use debug masters for root cause analysis
- Leverage testing QA agent for validation

### Use MCP Puppeteer:
- Automated browser testing during fix
- Visual regression testing
- User flow validation

### Use TodoWrite:
- Track fix progress through multiple steps
- Ensure all validation steps completed
- Document what's working vs broken

## Success Criteria

### Fix is COMPLETE and SAFE when:
- [ ] Original issue completely resolved
- [ ] All tests pass (lint, build, functional, regression)
- [ ] Manual testing confirms fix works
- [ ] No new issues introduced
- [ ] Performance not degraded
- [ ] All critical invariants still working
- [ ] Documentation updated
- [ ] Prevention measures added
- [ ] Comprehensive commit message written
- [ ] Fix tagged in git
- [ ] Rollback plan tested

### Quality Gates:
- [ ] `npm run lint` → 0 errors
- [ ] `npm run build` → successful
- [ ] `node test-all-success-functions.js` → 6/6 pass
- [ ] `node test-comprehensive-website.js` → all systems working
- [ ] Manual browser test → specific issue resolved
- [ ] Regression check → no functionality lost
- [ ] Performance check → response times similar
- [ ] Memory check → no leaks introduced

Only when ALL criteria met is the fix considered safe and complete.