# Session Start Command

**Usage**: `/session-start`

Perform complete session initialization with all safety checks and regression prevention validation.

## Command Template

```
CLAUDE SESSION START PROTOCOL

STEP 1 - READ CONTEXT:
First read these files to understand the current project state:
1. START_SESSION_CHECKLIST.md - session procedures  
2. CLAUDE_BEST_PRACTICES.md - best practices and error patterns
3. CLAUDE.md - project overview and regression prevention system

STEP 2 - STATUS CHECK:
Run these commands and report status:
```bash
# Check active workflows
node checkpoint-workflow.js status

# Quick regression test  
node test-regression-suite.js --quick

# Check if baseline exists
ls .claude/test-snapshots/baseline.json
```

STEP 3 - ANALYSIS:
Analyze results and provide recommendations:
- ✅ If all green: "Ready for work - no issues detected"
- ⚠️ If warnings: List specific issues and recommendations
- 🚨 If critical: Recommend immediate actions (rollback, fix, etc.)

STEP 4 - RECOMMENDATIONS:
Based on current state, suggest:
- Safe working mode for this session
- Whether to use /safe-fix or checkpoint-workflow
- Any maintenance tasks needed (baseline update, cleanup)

STEP 5 - SUMMARY:
Provide concise summary:
```
🚀 SESSION STATUS: [READY/WARNING/CRITICAL]
📊 Baseline: [date] ([commit])
🔄 Active workflow: [none/name]  
⚡ Recommended mode: [safe-fix/checkpoint/maintenance]

Ready for: [brief description of what can be safely done]
```

IMPORTANT:
- ALWAYS check regression prevention system first
- NEVER proceed if critical tests are failing
- Provide specific recommendations, not generic advice
- Focus on CVPerfect-specific context and patterns
```