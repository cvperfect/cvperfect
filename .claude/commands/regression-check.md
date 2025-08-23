# Regression Check Command

**Usage**: `/regression-check [scope]`

Perform comprehensive regression analysis comparing current state with established baseline. Detects broken functionality, performance degradation, and provides actionable recommendations.

## What This Command Does

1. **Baseline Comparison**:
   - Loads current baseline snapshot
   - Runs complete test suite in current state
   - Compares results test-by-test
   - Identifies specific regressions and improvements

2. **Deep Analysis**:
   - Analyzes critical file changes since baseline
   - Checks for common regression patterns
   - Evaluates performance impact
   - Assesses risk levels for detected changes

3. **Actionable Report**:
   - Lists specific tests that broke
   - Provides recommendations for fixes
   - Suggests rollback options if needed
   - Updates CLAUDE.md with new patterns if found

## Command Template

```
I need to perform a comprehensive regression check for: $ARGUMENTS scope

EXECUTE REGRESSION ANALYSIS:

STEP 1 - BASELINE VALIDATION:
1. Run: node .claude/test-snapshots/snapshot-manager.js validate
2. If no baseline exists: 
   - Warning: "No baseline found - creating emergency baseline"
   - Run: node .claude/test-snapshots/snapshot-manager.js baseline
3. Document baseline creation date and git commit

STEP 2 - COMPREHENSIVE COMPARISON:
1. Parse validation results from .claude/test-snapshots/validation-[latest].json
2. For each REGRESSION found:
   - Identify affected component (main page, success page, API, etc.)
   - Determine severity: CRITICAL (core user journey) vs WARNING (nice-to-have)
   - Provide specific file:line references where issues likely originate
3. For each IMPROVEMENT found:
   - Document what was fixed
   - Verify it's not a false positive

STEP 3 - ROOT CAUSE ANALYSIS:
1. Check git log since baseline for changes to critical files:
   - pages/index.js (main SPA)
   - pages/success.js (post-payment)
   - pages/api/*.js (backend endpoints)
   - .claude/settings.json (hook configuration)
2. Cross-reference file changes with failing tests
3. Look for known regression patterns from CLAUDE.md:
   - useEffect infinite loops in success.js
   - State management issues in index.js
   - API endpoint modifications breaking session flow
   - Payment flow interruptions

STEP 4 - RISK ASSESSMENT:
Categorize findings:
- 🚨 CRITICAL: Core user journey broken (CV upload, payment, optimization)
- ⚠️ HIGH: Important features not working (export, templates, responsive)
- 📝 MEDIUM: Non-essential functionality affected (animations, styling)
- ✅ LOW: Improvements or minor changes

STEP 5 - RECOMMENDATIONS:
For each CRITICAL and HIGH risk issue:
1. Suggest specific fix approach
2. Identify files to check/modify
3. Provide rollback option: "git reset --hard [safe-commit-hash]"
4. Recommend whether to proceed with fixes or rollback immediately

STEP 6 - ACTIONABLE SUMMARY:
Present results in this format:
```
🛡️ REGRESSION CHECK SUMMARY
📊 Tests: X passed, Y failed, Z improved
📍 Baseline: [date] (commit: [hash])

🚨 CRITICAL ISSUES (immediate action required):
- [Test name]: [specific issue description] → Fix: [recommendation]

⚠️ HIGH ISSUES (should fix soon):  
- [Test name]: [specific issue description] → Fix: [recommendation]

✅ IMPROVEMENTS:
- [Test name]: [improvement description]

🔄 RECOMMENDED ACTION:
[Either "SAFE TO PROCEED" or "ROLLBACK RECOMMENDED" with specific commands]
```

IMPORTANT CONSTRAINTS:
- ALWAYS provide specific file:line references  
- NEVER ignore CRITICAL regressions
- If >50% of tests fail, recommend immediate investigation
- Include git commands for rollback options
- Focus on CVPerfect-specific context (payment flow, CV processing, templates)
```

## Expected Outcome

This command will:
✅ Identify all regressions since baseline
✅ Provide specific fix recommendations  
✅ Categorize issues by severity
✅ Offer clear rollback options
✅ Generate actionable improvement plan