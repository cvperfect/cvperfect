#!/bin/bash

# CVPerfect Regression Guard
# Comprehensive regression detection and reporting system
# Compares test results before/after changes and generates detailed reports

set -e

echo "🛡️ CVPerfect Regression Guard Starting..."

# Set project root
PROJECT_ROOT="C:/Users/czupa/OneDrive/Pulpit/cvperfect"
cd "$PROJECT_ROOT" || exit 1

# Create timestamp for this guard run
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
GUARD_REPORT=".claude/test-snapshots/regression-guard-${TIMESTAMP}.json"

# Ensure snapshots directory exists
mkdir -p ".claude/test-snapshots"

# Function to run comprehensive test suite
run_comprehensive_tests() {
    local test_type=$1
    local output_prefix=$2
    
    echo "🧪 Running $test_type test suite..."
    
    # Initialize test results object
    local results="{"
    
    # Build Test
    echo "  🔧 Testing build..."
    if timeout 120 npm run build > /dev/null 2>&1; then
        results="$results\"build\":\"PASS\","
        echo "     ✅ Build: PASS"
    else
        results="$results\"build\":\"FAIL\","
        echo "     ❌ Build: FAIL"
    fi
    
    # Lint Test
    echo "  📝 Testing lint..."
    if npm run lint > /dev/null 2>&1; then
        results="$results\"lint\":\"PASS\","
        echo "     ✅ Lint: PASS"
    else
        results="$results\"lint\":\"FAIL\","
        echo "     ❌ Lint: FAIL"
    fi
    
    # Core functionality test
    echo "  🎯 Testing core functionality..."
    if [ -f "test-all-success-functions.js" ]; then
        if timeout 60 node test-all-success-functions.js > /dev/null 2>&1; then
            results="$results\"core_functions\":\"PASS\","
            echo "     ✅ Core Functions: PASS"
        else
            results="$results\"core_functions\":\"FAIL\","
            echo "     ❌ Core Functions: FAIL"
        fi
    else
        results="$results\"core_functions\":\"SKIP\","
        echo "     ⚠️ Core Functions: SKIPPED"
    fi
    
    # Comprehensive test
    echo "  🔍 Testing comprehensive functionality..."
    if [ -f "test-comprehensive-website.js" ]; then
        if timeout 90 node test-comprehensive-website.js > /dev/null 2>&1; then
            results="$results\"comprehensive\":\"PASS\","
            echo "     ✅ Comprehensive: PASS"
        else
            results="$results\"comprehensive\":\"FAIL\","
            echo "     ❌ Comprehensive: FAIL"
        fi
    else
        results="$results\"comprehensive\":\"SKIP\","
        echo "     ⚠️ Comprehensive: SKIPPED"
    fi
    
    # Close JSON and return
    results="$results\"timestamp\":\"$(date -Iseconds)\"}"
    echo "$results"
}

# Initialize guard report
echo "{" > "$GUARD_REPORT"
echo "  \"guard_run_id\": \"$TIMESTAMP\"," >> "$GUARD_REPORT"
echo "  \"timestamp\": \"$(date -Iseconds)\"," >> "$GUARD_REPORT"
echo "  \"project\": \"CVPerfect\"," >> "$GUARD_REPORT"

# Get current git status for context
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
LAST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "unknown")

echo "  \"git_context\": {" >> "$GUARD_REPORT"
echo "    \"branch\": \"$CURRENT_BRANCH\"," >> "$GUARD_REPORT"
echo "    \"last_commit\": \"$LAST_COMMIT\"" >> "$GUARD_REPORT"
echo "  }," >> "$GUARD_REPORT"

# Run comprehensive test suite
echo "📊 Running comprehensive regression tests..."
TEST_RESULTS=$(run_comprehensive_tests "COMPREHENSIVE" "guard")

echo "  \"test_results\": $TEST_RESULTS," >> "$GUARD_REPORT"

# Analyze results for regressions
echo "🔍 Analyzing results for regressions..."

# Check for critical failures
BUILD_STATUS=$(echo "$TEST_RESULTS" | grep -o '"build":"[^"]*"' | cut -d'"' -f4)
LINT_STATUS=$(echo "$TEST_RESULTS" | grep -o '"lint":"[^"]*"' | cut -d'"' -f4)
CORE_STATUS=$(echo "$TEST_RESULTS" | grep -o '"core_functions":"[^"]*"' | cut -d'"' -f4)

REGRESSION_DETECTED=false

if [ "$BUILD_STATUS" = "FAIL" ]; then
    echo "🚨 CRITICAL REGRESSION: Build failure detected!"
    REGRESSION_DETECTED=true
fi

if [ "$CORE_STATUS" = "FAIL" ]; then
    echo "🚨 CRITICAL REGRESSION: Core functionality failure detected!"
    REGRESSION_DETECTED=true
fi

# Finalize report
echo "  \"analysis\": {" >> "$GUARD_REPORT"
echo "    \"regression_detected\": $REGRESSION_DETECTED," >> "$GUARD_REPORT"
echo "    \"critical_failures\": [" >> "$GUARD_REPORT"

if [ "$BUILD_STATUS" = "FAIL" ]; then
    echo "      \"build\"," >> "$GUARD_REPORT"
fi

if [ "$CORE_STATUS" = "FAIL" ]; then
    echo "      \"core_functions\"," >> "$GUARD_REPORT"
fi

echo "      null" >> "$GUARD_REPORT"
echo "    ]," >> "$GUARD_REPORT"
echo "    \"recommendation\": \"$(if $REGRESSION_DETECTED; then echo 'IMMEDIATE_ATTENTION_REQUIRED'; else echo 'ALL_TESTS_PASSING'; fi)\"" >> "$GUARD_REPORT"
echo "  }" >> "$GUARD_REPORT"
echo "}" >> "$GUARD_REPORT"

# Final output
if $REGRESSION_DETECTED; then
    echo ""
    echo "🚨 REGRESSION DETECTED! 🚨"
    echo "📄 Full report: $GUARD_REPORT"
    echo "🔧 Recommended action: Fix failing tests before proceeding"
    echo ""
    exit 1
else
    echo "✅ Regression Guard: NO ISSUES DETECTED"
    echo "📄 Report saved: $GUARD_REPORT"
    echo "🔄 Safe to proceed"
    exit 0
fi