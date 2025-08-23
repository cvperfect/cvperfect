# Rollback to Safe State Command

**Usage**: `/rollback-to-safe [severity]`

Emergency rollback to last known working state when critical regressions are detected. Preserves work in progress while restoring functionality.

## What This Command Does

1. **Safe State Identification**:
   - Analyzes recent snapshots to find last PASS validation
   - Identifies corresponding git commit hash
   - Verifies that rollback target is actually safer
   - Preserves current work in emergency branch

2. **Controlled Rollback**:
   - Creates backup branch with current changes
   - Resets to safe commit or baseline
   - Validates that rollback fixed the issues
   - Provides instructions to recover work

3. **Post-Rollback Analysis**:
   - Documents what was lost in rollback
   - Analyzes why regressions occurred
   - Updates prevention strategies
   - Creates recovery plan

## Command Template

```
EMERGENCY ROLLBACK PROCEDURE for: $ARGUMENTS severity level

CRITICAL: This is an emergency rollback to restore CVPerfect functionality.

PHASE 1 - SAFETY ASSESSMENT:
1. Confirm rollback is needed:
   - Are core user journeys broken? (CV upload, payment, AI optimization)
   - Is the application completely non-functional?
   - Are there data corruption risks?
2. If severity is HIGH but not critical, suggest trying targeted fixes first
3. If CRITICAL confirmed, proceed with rollback

PHASE 2 - BACKUP CURRENT WORK:
1. Create emergency backup branch:
   ```bash
   git checkout -b emergency-backup-$(date +%Y%m%d-%H%M%S)
   git add -A
   git commit -m "Emergency backup before rollback - $(date)"
   ```
2. Document what was being worked on:
   - List modified files with: git status
   - Capture current state with: git log --oneline -5

PHASE 3 - FIND SAFE ROLLBACK TARGET:
1. Check recent snapshots:
   ```bash
   node .claude/test-snapshots/snapshot-manager.js report
   ```
2. Identify last successful validation or baseline
3. Get corresponding git commit:
   - From snapshot JSON: system_info.git_commit  
   - Or use: git log --oneline --since="24 hours ago" 
4. Verify target commit exists: git show [commit-hash]

PHASE 4 - EXECUTE ROLLBACK:
1. Switch back to main/working branch:
   ```bash
   git checkout main  # or current working branch
   ```
2. Hard reset to safe commit:
   ```bash
   git reset --hard [safe-commit-hash]
   ```
3. If no specific commit found, reset to last baseline:
   ```bash
   git reset --hard HEAD~[number-of-commits-to-safe-point]
   ```

PHASE 5 - VALIDATE ROLLBACK SUCCESS:
1. Immediate functionality test:
   ```bash
   npm run build
   npm run lint
   ```
2. Quick smoke test:
   ```bash  
   node test-complete-functionality.js
   ```
3. Run critical path validation:
   ```bash
   node .claude/test-snapshots/snapshot-manager.js validate
   ```
4. If still failing, consider rolling back further or manual intervention

PHASE 6 - RECOVERY PLANNING:
1. Create rollback report:
   - What was lost in rollback
   - Why regressions occurred  
   - How to prevent similar issues
   - Plan to recover valuable work from backup branch
   
2. Provide recovery instructions:
   ```bash
   # To recover specific files from backup:
   git checkout emergency-backup-[timestamp] -- [specific-file]
   
   # To see what was lost:
   git diff [safe-commit] emergency-backup-[timestamp]
   
   # To cherry-pick good commits:
   git cherry-pick [specific-commit-hash]
   ```

PHASE 7 - PREVENTION UPDATES:
1. Analyze what caused the need for rollback
2. Update CLAUDE.md with new regression patterns
3. Suggest improvements to prevention system
4. Document lessons learned

ROLLBACK DECISION MATRIX:
- 🚨 IMMEDIATE ROLLBACK: Core functionality completely broken
- ⚠️ PLANNED ROLLBACK: Major features broken, but app somewhat functional  
- 📝 FIX INSTEAD: Minor issues that can be addressed quickly
- ✅ NO ROLLBACK: Issues are acceptable or already being fixed

EXPECTED COMPLETION STATUS:
```
🔄 ROLLBACK COMPLETED SUCCESSFULLY
📍 Restored to: [commit-hash] ([date])
💾 Work backed up to: emergency-backup-[timestamp] 
🧪 Validation: [PASS/FAIL] 
📋 Recovery plan: [specific instructions]

Next Steps:
1. Verify all critical functions work
2. Plan recovery of valuable changes
3. Implement additional safeguards
```

IMPORTANT CONSTRAINTS:
- ALWAYS backup current work before rollback
- NEVER rollback without confirming target is actually safer
- Test immediately after rollback to verify success
- Provide specific git commands for all operations
- Focus on preserving as much work as possible while restoring functionality
```

## Expected Outcome

This command will:
✅ Safely restore working functionality
✅ Preserve current work in backup branch
✅ Validate rollback success
✅ Provide clear recovery instructions
✅ Update prevention strategies