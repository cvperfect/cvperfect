#!/bin/bash

# CVPerfect Post-Edit Hook
# Runs validation tests AFTER file modification to detect regressions
# Exit codes: 0 = success, 1 = regression detected, 2 = warning

set -e

echo "🔍 CVPerfect Post-Edit Validation Starting..."
echo "Modified file: $1"
echo "Edit type: $2"

# Set project root
PROJECT_ROOT="C:/Users/czupa/OneDrive/Pulpit/cvperfect"
cd "$PROJECT_ROOT" || exit 1

# Create timestamp for this validation run
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE=".claude/test-snapshots/post-edit-result-${TIMESTAMP}.json"

# Ensure snapshots directory exists
mkdir -p ".claude/test-snapshots"

echo "📊 Running post-edit validation..."

# Initialize result file
echo "{" > "$RESULT_FILE"
echo "  \"timestamp\": \"$TIMESTAMP\"," >> "$RESULT_FILE"
echo "  \"modified_file\": \"$1\"," >> "$RESULT_FILE"
echo "  \"edit_type\": \"$2\"," >> "$RESULT_FILE"
echo "  \"tests\": {" >> "$RESULT_FILE"

# Track if any critical tests fail
CRITICAL_FAILURE=false

# Test 1: Build Check
echo "🔧 Testing build after edit..."
if npm run build > /dev/null 2>&1; then
    echo "    \"build\": \"PASS\"," >> "$RESULT_FILE"
    echo "   ✅ Build: PASS"
else
    echo "    \"build\": \"FAIL\"," >> "$RESULT_FILE"
    echo "   ❌ Build: FAIL"
    echo "🚨 REGRESSION DETECTED: Build broken after edit!"
    CRITICAL_FAILURE=true
fi

# Test 2: Lint Check (Auto-fix if possible)
echo "📝 Testing lint compliance..."
if npm run lint > /dev/null 2>&1; then
    echo "    \"lint\": \"PASS\"," >> "$RESULT_FILE"
    echo "   ✅ Lint: PASS"
else
    echo "    \"lint\": \"FAIL\"," >> "$RESULT_FILE"
    echo "   ⚠️ Lint: FAIL - attempting auto-fix..."
    # Try to auto-fix lint issues
    if npm run lint -- --fix > /dev/null 2>&1; then
        echo "    \"lint_autofix\": \"SUCCESS\"," >> "$RESULT_FILE"
        echo "   ✅ Lint auto-fix: SUCCESS"
    else
        echo "    \"lint_autofix\": \"FAILED\"," >> "$RESULT_FILE"
        echo "   ⚠️ Lint auto-fix: FAILED (manual intervention needed)"
    fi
fi

# Test 3: Quick Smoke Test
echo "🧪 Running smoke tests..."
if [ -f "test-complete-functionality.js" ]; then
    if timeout 60 node test-complete-functionality.js > /dev/null 2>&1; then
        echo "    \"smoke_test\": \"PASS\"," >> "$RESULT_FILE"
        echo "   ✅ Smoke Test: PASS"
    else
        echo "    \"smoke_test\": \"FAIL\"," >> "$RESULT_FILE"
        echo "   ❌ Smoke Test: FAIL"
        echo "🚨 REGRESSION DETECTED: Core functionality broken after edit!"
        CRITICAL_FAILURE=true
    fi
else
    echo "    \"smoke_test\": \"SKIP\"," >> "$RESULT_FILE"
    echo "   ⚠️ Smoke Test: SKIPPED (test file not found)"
fi

# File-specific regression tests
case "$1" in
    */pages/success.js)
        echo "🎯 Success page regression check..."
        if [ -f "test-all-success-functions.js" ]; then
            if timeout 30 node test-all-success-functions.js > /dev/null 2>&1; then
                echo "    \"success_functions\": \"PASS\"," >> "$RESULT_FILE"
                echo "   ✅ Success Functions: PASS"
            else
                echo "    \"success_functions\": \"FAIL\"," >> "$RESULT_FILE"
                echo "   ❌ Success Functions: FAIL"
                echo "🚨 REGRESSION DETECTED: Success page functions broken!"
                CRITICAL_FAILURE=true
            fi
        fi
        
        # Check for infinite loops (common regression)
        echo "🔄 Checking for infinite loop patterns..."
        if grep -q "useEffect.*\[\]" "$1" && grep -q "setState.*useEffect" "$1"; then
            echo "    \"infinite_loop_risk\": \"HIGH\"," >> "$RESULT_FILE"
            echo "   ⚠️ Infinite Loop Risk: HIGH (useEffect + setState pattern detected)"
        else
            echo "    \"infinite_loop_risk\": \"LOW\"," >> "$RESULT_FILE"
            echo "   ✅ Infinite Loop Risk: LOW"
        fi
        ;;
        
    */pages/index.js)
        echo "🏠 Main page regression check..."
        echo "   ⚠️ Main page modified - verifying critical state management..."
        
        # Check for critical state variables
        CRITICAL_STATES=("currentLanguage" "dragActive" "uploadedFile" "showModal")
        for state in "${CRITICAL_STATES[@]}"; do
            if grep -q "$state" "$1"; then
                echo "   ✅ State variable '$state' still present"
            else
                echo "   ⚠️ State variable '$state' missing or renamed"
                echo "    \"missing_state_${state}\": \"WARNING\"," >> "$RESULT_FILE"
            fi
        done
        ;;
        
    */api/*)
        echo "🔌 API endpoint regression check..."
        if [ -f "test-api-endpoints.js" ]; then
            if timeout 45 node test-api-endpoints.js > /dev/null 2>&1; then
                echo "    \"api_endpoints\": \"PASS\"," >> "$RESULT_FILE"
                echo "   ✅ API Endpoints: PASS"
            else
                echo "    \"api_endpoints\": \"FAIL\"," >> "$RESULT_FILE"
                echo "   ❌ API Endpoints: FAIL"
                echo "🚨 REGRESSION DETECTED: API endpoints broken after edit!"
                CRITICAL_FAILURE=true
            fi
        fi
        ;;
esac

# Agent system health check (if hooks are involved)
if [[ "$1" == *".claude/settings.json" ]]; then
    echo "⚙️ Claude settings modified - checking agent system..."
    if [ -f "test-agents-integration.js" ]; then
        if timeout 30 node test-agents-integration.js > /dev/null 2>&1; then
            echo "    \"agent_integration\": \"PASS\"," >> "$RESULT_FILE"
            echo "   ✅ Agent Integration: PASS"
        else
            echo "    \"agent_integration\": \"FAIL\"," >> "$RESULT_FILE"
            echo "   ❌ Agent Integration: FAIL"
            echo "🚨 REGRESSION DETECTED: Agent system broken!"
            CRITICAL_FAILURE=true
        fi
    fi
fi

# Compare with most recent pre-edit baseline
echo "📊 Comparing with baseline..."
LATEST_BASELINE=$(ls -t .claude/test-snapshots/pre-edit-baseline-*.json 2>/dev/null | head -1)
if [ -n "$LATEST_BASELINE" ]; then
    echo "    \"baseline_comparison\": \"$LATEST_BASELINE\"," >> "$RESULT_FILE"
    echo "   📄 Baseline: $LATEST_BASELINE"
    # Simple comparison logic could be added here
else
    echo "    \"baseline_comparison\": \"NO_BASELINE\"," >> "$RESULT_FILE"
    echo "   ⚠️ No baseline found for comparison"
fi

# Finalize result file
if $CRITICAL_FAILURE; then
    echo "    \"validation_complete\": \"FAIL\"" >> "$RESULT_FILE"
    echo "  }," >> "$RESULT_FILE"
    echo "  \"status\": \"REGRESSION_DETECTED\"," >> "$RESULT_FILE"
    echo "  \"recommendation\": \"IMMEDIATE_ROLLBACK_REQUIRED\"" >> "$RESULT_FILE"
    echo "}" >> "$RESULT_FILE"
    
    echo ""
    echo "🚨 CRITICAL REGRESSIONS DETECTED! 🚨"
    echo "📄 Results saved to: $RESULT_FILE"
    echo "🔄 Consider immediate rollback: git checkout -- $1"
    echo ""
    
    exit 1
else
    echo "    \"validation_complete\": \"PASS\"" >> "$RESULT_FILE"
    echo "  }," >> "$RESULT_FILE"
    echo "  \"status\": \"VALIDATION_SUCCESS\"" >> "$RESULT_FILE"
    echo "}" >> "$RESULT_FILE"
    
    echo "✅ Post-edit validation complete - no regressions detected!"
    echo "📄 Results saved to: $RESULT_FILE"
    echo "🔄 Safe to proceed with next changes"
    
    exit 0
fi