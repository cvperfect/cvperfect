# CVPerfect Debug Loop Command

## Description
Comprehensive debugging workflow for CVPerfect issues, particularly success.js infinite loops and session recovery problems.

## Usage
Use this command when encountering:
- Infinite loops in success.js
- Session data loading issues
- Payment flow interruptions
- CV data not displaying
- Template switching problems

## Debug Steps

### 1. Identify the Problem
```bash
# Check server logs
tail -f logs/error-$(date +%Y-%m-%d).log

# Monitor network requests
# Use browser DevTools Network tab

# Check React component state
# Add console.log in useEffect dependencies
```

### 2. Run Diagnostic Tests
```bash
# Test session recovery
node test-session-recovery.js

# Test success page functions
node test-all-success-functions.js

# Test debug agents system
node test-debug-agents.js
```

### 3. Analyze Root Cause
```bash
# Start debug agents for analysis
node start-debug-agents.js

# Use Root Cause Analysis Master
# - Five Whys methodology
# - Fishbone diagram analysis
# - FMEA analysis for failure modes
```

### 4. Apply Systematic Fix
```bash
# Create git branch for fix
git checkout -b fix/debug-$(date +%s)

# Run baseline tests
npm run lint && npm run build

# Apply fix systematically
# 1. Identify exact line causing issue
# 2. Understand why it's happening
# 3. Fix root cause, not symptoms
# 4. Add prevention measures
```

### 5. Verify Fix
```bash
# Test the specific fix
node test-specific-functionality.js

# Run regression tests
npm run lint
npm run build
node test-comprehensive-website.js
node test-all-success-functions.js
```

### 6. Document and Prevent
```bash
# Document the fix in commit message
git add .
git commit -m "fix: [specific issue] - [root cause] - [prevention]

- Root cause: [explain the real reason]
- Fix applied: [what was changed]
- Prevention: [how to avoid in future]
- Tests: [what tests were added/run]

✅ VERIFIED: Manual testing completed
✅ VERIFIED: Automated tests pass
✅ VERIFIED: No regressions detected"

# Update documentation if needed
# Add test case to prevent regression
```

## Common CVPerfect Debug Patterns

### Infinite Loop in useEffect
```javascript
// WRONG - causes infinite loop
useEffect(() => {
  fetchData();
}, [data]); // data changes, triggers fetchData, changes data again

// CORRECT - proper dependency management  
useEffect(() => {
  if (!data && sessionId) {
    fetchData();
  }
}, [sessionId]); // only trigger when sessionId changes
```

### Session Data Not Loading
```javascript
// Check API response
console.log('API Response:', response);

// Check session ID format
console.log('Session ID:', sessionId, 'Valid:', /^sess_\d{13}_[a-f0-9]{32}$/.test(sessionId));

// Check state updates
console.log('State before:', previousState);
console.log('State after:', newState);
```

### Memory Leaks
```javascript
// WRONG - no cleanup
useEffect(() => {
  const timer = setInterval(() => {
    fetchData();
  }, 1000);
}, []);

// CORRECT - proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    fetchData();
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

## Debug Agent Integration

### File Reader Agent
- Analyzes problematic files
- Identifies patterns and issues
- Provides context for debugging

### Bug Fixer Agent  
- Suggests specific code fixes
- Applies automated fixes for common patterns
- Validates fixes before application

### Supervisor Agent
- Coordinates debugging process
- Ensures all steps are followed
- Validates final results

### Advanced Masters
- **Root Cause Analysis Master**: Deep cause analysis
- **AI Debugging Copilot**: Pattern recognition and automated suggestions
- **Systematic Debugging Master**: 8-phase structured debugging

## Success Criteria

### Fix is Complete When:
- [ ] Original issue is resolved
- [ ] No new issues introduced
- [ ] All tests pass (lint, build, functional)
- [ ] Manual testing confirms fix
- [ ] Regression prevention added
- [ ] Documentation updated
- [ ] Git commit with full explanation

### Quality Gates:
- [ ] `npm run lint` - no errors
- [ ] `npm run build` - successful build
- [ ] `node test-all-success-functions.js` - all 6 functions working
- [ ] Manual browser test - issue no longer occurs
- [ ] No memory leaks or performance degradation

## Emergency Rollback
If fix causes more problems:
```bash
# Quick rollback
git checkout main
git branch -D fix/debug-[timestamp]

# Or restore backup
cp pages/success.js.backup-[timestamp] pages/success.js

# Verify rollback worked
npm run dev
# Test manually in browser
```

## Prevention
- Always backup critical files before editing
- Use proper useEffect dependencies
- Add cleanup functions for timers/intervals
- Validate session IDs before API calls
- Add error boundaries for React crashes
- Monitor for memory leaks in DevTools
- Use debug agents for complex issues