#!/bin/bash
# CVPerfect Pre-Response Hook
# Hook wykonywany PRZED każdą odpowiedzią Claude
# Wykrywa i wymusza wykonanie wszystkich flag użytkownika
# Created: 2025-08-25 for CVPerfect Command Enforcement System

set -e

echo "🔍 COMMAND FLAGS DETECTOR ACTIVE - Scanning user input..."

# Get user input (passed as argument or from environment)
USER_INPUT="${1:-${USER_INPUT:-}}"

if [ -z "$USER_INPUT" ]; then
    echo "⚠️  No user input provided to hook"
    exit 0
fi

echo "📝 User input length: ${#USER_INPUT} characters"

# Detect all command flags in user input
FLAGS=$(echo "$USER_INPUT" | grep -oE '\-[a-z]+' | sort -u || true)

if [ -z "$FLAGS" ]; then
    echo "✅ No command flags detected - normal execution mode"
    echo "📄 Proceeding with standard Claude response"
    exit 0
fi

# Flags detected - enforce mandatory execution
echo "⚡ MANDATORY FLAGS DETECTED!"
echo "🎯 The following commands MUST be executed:"
echo ""

# Counter for flags
FLAG_COUNT=0

# Process each detected flag
for flag in $FLAGS; do
    FLAG_COUNT=$((FLAG_COUNT + 1))
    echo "   $FLAG_COUNT. $flag"
    
    case $flag in
        # THINKING MODES (Priority 1-3)
        -ut)
            echo "      → ULTRATHINK MODE: ACTIVATE MAXIMUM ANALYSIS BUDGET"
            echo "      → This is CRITICAL - use deepest thinking for this task"
            echo "      → Consider ALL edge cases and potential problems"
            ;;
        -th)
            echo "      → THINK HARD MODE: ACTIVATE DEEP SYSTEMATIC ANALYSIS"
            echo "      → Use thorough reasoning and alternative solutions"
            ;;
        -t)
            echo "      → THINK MODE: ACTIVATE STRUCTURED THINKING"
            echo "      → Use basic analytical approach"
            ;;
        -td)
            echo "      → THINK DEEPER MODE: ACTIVATE VERY DEEP ANALYSIS"
            echo "      → Evaluate all consequences thoroughly"
            ;;
            
        # WORKFLOW SHORTCUTS (Priority 4-6)
        -p)
            echo "      → PLAN FIRST: CREATE DETAILED PLAN BEFORE CODING"
            echo "      → Do NOT start implementation until plan is complete"
            ;;
        -r)
            echo "      → RESEARCH: ANALYZE ENTIRE CODEBASE FIRST"
            echo "      → Study patterns, dependencies, and context"
            ;;
        -sa)
            echo "      → SUB-AGENT: DELEGATE TO SPECIALIZED AGENT IMMEDIATELY"
            echo "      → Use Task tool with general-purpose subagent"
            echo "      → This task requires specialized agent handling"
            ;;
        -todo)
            echo "      → TODO LIST: CREATE WITH TodoWrite TOOL"
            echo "      → Minimum 3-5 concrete actionable steps"
            echo "      → Track progress with pending/in_progress/completed"
            ;;
        -test)
            echo "      → TEST-DRIVEN: WRITE TESTS BEFORE IMPLEMENTATION"
            echo "      → Create mocks first, then implement functionality"
            ;;
        -mc)
            echo "      → MULTI-CLAUDE: SUGGEST PARALLEL INSTANCES"
            echo "      → Explain work division and setup instructions"
            ;;
            
        # SECURITY & DEBUGGING (Priority 2-5)
        -fix)
            echo "      → SAFE FIX: IMPLEMENT WITH FULL REGRESSION PROTECTION"
            echo "      → Read CLAUDE_BEST_PRACTICES.md first"
            echo "      → Check git status, create backups, test after changes"
            ;;
        -debug)
            echo "      → DEBUG LOOP: START SYSTEMATIC DEBUGGING"
            echo "      → Collect errors, analyze causes, test hypotheses"
            ;;
        -dm)
            echo "      → DEBUG MASTERS: ACTIVATE ALL 3 ADVANCED MASTERS"
            echo "      → Root Cause Analysis + AI Debugging + Systematic"
            echo "      → This is advanced debugging - use all methodologies"
            ;;
        -check)
            echo "      → REGRESSION CHECK: VERIFY NOTHING IS BROKEN"
            echo "      → Run npm lint + build + tests + functionality tests"
            ;;
            
        # SESSION MANAGEMENT (Priority 6-7)
        -clear)
            echo "      → CLEAR CONTEXT: SUGGEST /clear IF CONTEXT > 70%"
            echo "      → Explain importance of clean context"
            ;;
        -init)
            echo "      → SESSION INIT: FULL PROJECT SETUP"
            echo "      → Read CLAUDE.md + CLAUDE_BEST_PRACTICES.md + configs"
            ;;
            
        # Unknown flags
        *)
            echo "      → UNKNOWN FLAG: $flag (will be processed if defined)"
            echo "      → Check SHORTCUTS_HANDLER.md for definition"
            ;;
    esac
    echo ""
done

echo "📊 ENFORCEMENT SUMMARY:"
echo "   Total flags detected: $FLAG_COUNT"
echo "   All flags are MANDATORY and must be executed"
echo "   Failure to execute = COMPLIANCE VIOLATION"
echo ""

echo "⚠️  CLAUDE INSTRUCTION:"
echo "   1. Execute ALL detected flags in priority order"
echo "   2. Do NOT skip any flag - all are mandatory"
echo "   3. Use the specific instructions provided above"
echo "   4. Report completion of each flag"
echo ""

# Create enforcement log
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE=".claude/logs/enforcement-${TIMESTAMP}.log"

# Ensure logs directory exists
mkdir -p ".claude/logs"

# Log the enforcement event
echo "ENFORCEMENT EVENT: $TIMESTAMP" > "$LOG_FILE"
echo "User Input: $USER_INPUT" >> "$LOG_FILE"
echo "Detected Flags: $FLAGS" >> "$LOG_FILE"
echo "Flag Count: $FLAG_COUNT" >> "$LOG_FILE"
echo "Status: MANDATORY_EXECUTION_REQUIRED" >> "$LOG_FILE"

echo "📄 Enforcement logged to: $LOG_FILE"
echo ""

# Sequential thinking reminder (already enabled)
if [ -f ".claude/session-config.json" ]; then
    SEQUENTIAL_STATUS=$(cat ".claude/session-config.json" | grep -o '"enabled": true' || echo "not found")
    if [ "$SEQUENTIAL_STATUS" = '"enabled": true' ]; then
        echo "✅ Sequential thinking already enabled - complex tasks will be broken into steps"
    else
        echo "⚠️  Sequential thinking not detected - consider enabling for multi-step tasks"
    fi
fi

echo "🎯 READY FOR MANDATORY EXECUTION"
echo "🚀 Claude must now execute ALL detected flags"

exit 0