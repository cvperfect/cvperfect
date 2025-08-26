#!/bin/bash

# CVPerfect Pre-Response Hook
# Runs before each Claude response to ensure system readiness
# and apply SuperClaude enforcement

echo "🔍 CVPerfect Pre-Response Check Starting..."

# Set project root
PROJECT_ROOT="C:/Users/czupa/OneDrive/Pulpit/cvperfect"
cd "$PROJECT_ROOT" || exit 1

# Quick system health check
echo "📊 Quick system health check..."

# Check if critical files exist
CRITICAL_FILES=("pages/index.js" "pages/success.js" "package.json" ".claude/settings.json")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "⚠️ WARNING: Missing critical files: ${MISSING_FILES[*]}"
else
    echo "✅ All critical files present"
fi

# Check if CVPerfect agents are running (if they should be)
if pgrep -f "start-agents-system" > /dev/null; then
    echo "✅ CVPerfect agents: RUNNING"
else
    echo "ℹ️ CVPerfect agents: NOT RUNNING (will start if needed)"
fi

# Log pre-response check
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "$TIMESTAMP | PRE_RESPONSE_CHECK | COMPLETE" >> ".claude/pre-response.log"

echo "✅ Pre-response check complete - system ready"

exit 0