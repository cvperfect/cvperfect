# Safe Fix Command

**Usage**: `/safe-fix [issue-description]`

Implement a fix with full regression protection system. This command ensures that any fix is validated against current baseline and provides rollback options if regressions are detected.

## What This Command Does

1. **Pre-Fix Validation**:
   - Creates git branch: `fix/[issue-description-slug]`
   - Runs baseline tests and creates snapshot
   - Documents current working state
   - Identifies critical components that must remain functional

2. **Protected Implementation**:
   - Uses ultrathink approach: "Fix [issue] WITHOUT breaking [critical-invariants]"
   - Creates checkpoint commits after each working step
   - Validates changes incrementally
   - Maintains TodoWrite tracking

3. **Post-Fix Verification**:
   - Runs comprehensive regression suite
   - Compares against baseline snapshot
   - Generates detailed regression report
   - Provides rollback instructions if needed

## Command Template

```
I need you to implement a safe fix for: $ARGUMENTS

CRITICAL: Use the following regression-prevention protocol:

PHASE 1 - PRE-FIX PREPARATION:
1. Create git branch: git checkout -b fix/[issue-slug]
2. Run: node .claude/test-snapshots/snapshot-manager.js baseline
3. Identify which CVPerfect critical invariants this fix might affect:
   - CV Upload functionality
   - Payment processing (Stripe flow)
   - AI optimization (Groq API)
   - Template rendering system
   - File export (PDF/DOCX)
   - Session management
   - Agent system integration

PHASE 2 - ULTRATHINK IMPLEMENTATION:
1. Ultrathink prompt: "Fix [$ARGUMENTS] WITHOUT breaking: [list specific invariants from Phase 1]"
2. Use TodoWrite to track implementation steps
3. Create checkpoint commits: git commit -m "checkpoint: [step-description]"
4. Test each checkpoint with: npm run build && npm run lint

PHASE 3 - REGRESSION VALIDATION:
1. Run: node .claude/test-snapshots/snapshot-manager.js validate
2. If validation fails:
   - Review regression report
   - Either fix regressions or rollback: git checkout main && git branch -D fix/[issue-slug]
3. If validation passes:
   - Document what was fixed
   - Provide merge instructions

PHASE 4 - COMPLETION:
1. Run final test suite: npm run build && npm run lint
2. Create final summary of changes
3. List any new patterns learned for future CLAUDE.md updates
4. Provide merge command: git checkout main && git merge fix/[issue-slug]

IMPORTANT CONSTRAINTS:
- NEVER bypass the baseline validation
- ALWAYS create checkpoints after working changes
- IF ANY critical test fails, STOP and provide rollback instructions
- Use specific file paths in explanations (file.js:line)
- Focus on minimal changes that fix the issue without side effects
```

## Expected Outcome

This command will:
✅ Fix the specified issue safely
✅ Maintain all critical CVPerfect functionality
✅ Provide rollback path if problems arise
✅ Document lessons learned
✅ Generate merge-ready git branch