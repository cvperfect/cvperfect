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
    
    # Core Functionality Tests
    echo "  🏠 Testing main page functionality..."
    if [ -f "test-main-page.js" ]; then
        if timeout 60 node test-main-page.js > /dev/null 2>&1; then
            results="$results\"main_page\":\"PASS\","
            echo "     ✅ Main Page: PASS"
        else
            results="$results\"main_page\":\"FAIL\","
            echo "     ❌ Main Page: FAIL"
        fi
    else
        results="$results\"main_page\":\"SKIP\","
        echo "     ⚠️ Main Page: SKIP (test not found)"
    fi
    
    echo "  💳 Testing payment flow..."
    if [ -f "test-stripe-payment-flow.js" ]; then
        if timeout 90 node test-stripe-payment-flow.js > /dev/null 2>&1; then
            results="$results\"payment_flow\":\"PASS\","
            echo "     ✅ Payment Flow: PASS"
        else
            results="$results\"payment_flow\":\"FAIL\","
            echo "     ❌ Payment Flow: FAIL"
        fi
    else
        results="$results\"payment_flow\":\"SKIP\","
        echo "     ⚠️ Payment Flow: SKIP (test not found)"
    fi
    
    echo "  🎯 Testing success page functions..."
    if [ -f "test-all-success-functions.js" ]; then
        if timeout 60 node test-all-success-functions.js > /dev/null 2>&1; then
            results="$results\"success_functions\":\"PASS\","
            echo "     ✅ Success Functions: PASS"
        else
            results="$results\"success_functions\":\"FAIL\","
            echo "     ❌ Success Functions: FAIL"
        fi
    else
        results="$results\"success_functions\":\"SKIP\","
        echo "     ⚠️ Success Functions: SKIP (test not found)"
    fi
    
    echo "  🔌 Testing API endpoints..."
    if [ -f "test-api-endpoints.js" ]; then
        if timeout 75 node test-api-endpoints.js > /dev/null 2>&1; then
            results="$results\"api_endpoints\":\"PASS\","
            echo "     ✅ API Endpoints: PASS"
        else
            results="$results\"api_endpoints\":\"FAIL\","
            echo "     ❌ API Endpoints: FAIL"
        fi
    else
        results="$results\"api_endpoints\":\"SKIP\","
        echo "     ⚠️ API Endpoints: SKIP (test not found)"
    fi
    
    echo "  📱 Testing responsive design..."
    if [ -f "test-responsive.js" ]; then
        if timeout 45 node test-responsive.js > /dev/null 2>&1; then
            results="$results\"responsive\":\"PASS\","
            echo "     ✅ Responsive: PASS"
        else
            results="$results\"responsive\":\"FAIL\","
            echo "     ❌ Responsive: FAIL"
        fi
    else
        results="$results\"responsive\":\"SKIP\","
        echo "     ⚠️ Responsive: SKIP (test not found)"
    fi
    
    echo "  🤖 Testing agent integration..."
    if [ -f "test-agents-integration.js" ]; then
        if timeout 30 node test-agents-integration.js > /dev/null 2>&1; then
            results="$results\"agents\":\"PASS\","
            echo "     ✅ Agents: PASS"
        else
            results="$results\"agents\":\"FAIL\","
            echo "     ❌ Agents: FAIL"
        fi
    else
        results="$results\"agents\":\"SKIP\","
        echo "     ⚠️ Agents: SKIP (test not found)"
    fi
    
    # Remove trailing comma and close object
    results="${results%,}}"
    
    echo "$results"
}

# Function to compare two test result objects
compare_results() {
    local before_results="$1"
    local after_results="$2"
    
    echo "📊 Comparing test results..."
    
    local regressions=0
    local improvements=0
    local comparison_details=""
    
    # Test categories to compare
    local tests=("build" "lint" "main_page" "payment_flow" "success_functions" "api_endpoints" "responsive" "agents")
    
    for test in "${tests[@]}"; do
        # Extract results using basic string operations (bash compatible)
        local before_status=$(echo "$before_results" | grep -o "\"$test\":\"[^\"]*" | cut -d'"' -f4)
        local after_status=$(echo "$after_results" | grep -o "\"$test\":\"[^\"]*" | cut -d'"' -f4)
        
        if [ "$before_status" != "$after_status" ]; then
            if [ "$before_status" = "PASS" ] && [ "$after_status" = "FAIL" ]; then
                echo "     ❌ REGRESSION: $test ($before_status → $after_status)"
                regressions=$((regressions + 1))
                comparison_details="$comparison_details\"$test\":{\"before\":\"$before_status\",\"after\":\"$after_status\",\"status\":\"REGRESSION\"},"
            elif [ "$before_status" = "FAIL" ] && [ "$after_status" = "PASS" ]; then
                echo "     ✅ IMPROVEMENT: $test ($before_status → $after_status)"
                improvements=$((improvements + 1))
                comparison_details="$comparison_details\"$test\":{\"before\":\"$before_status\",\"after\":\"$after_status\",\"status\":\"IMPROVEMENT\"},"
            elif [ "$before_status" = "SKIP" ] && [ "$after_status" = "PASS" ]; then
                echo "     🆕 NEW PASS: $test ($before_status → $after_status)"
                improvements=$((improvements + 1))
                comparison_details="$comparison_details\"$test\":{\"before\":\"$before_status\",\"after\":\"$after_status\",\"status\":\"NEW_PASS\"},"
            else
                echo "     ⚠️ CHANGE: $test ($before_status → $after_status)"
                comparison_details="$comparison_details\"$test\":{\"before\":\"$before_status\",\"after\":\"$after_status\",\"status\":\"CHANGE\"},"
            fi
        else
            echo "     ➡️ NO CHANGE: $test ($before_status)"
            comparison_details="$comparison_details\"$test\":{\"before\":\"$before_status\",\"after\":\"$after_status\",\"status\":\"NO_CHANGE\"},"
        fi
    done
    
    # Remove trailing comma
    comparison_details="${comparison_details%,}"
    
    echo "{\"regressions\":$regressions,\"improvements\":$improvements,\"details\":{$comparison_details}}"
}

# Main regression guard logic
main() {
    # Initialize guard report
    echo "{" > "$GUARD_REPORT"
    echo "  \"timestamp\": \"$TIMESTAMP\"," >> "$GUARD_REPORT"
    echo "  \"guard_type\": \"comprehensive_regression_check\"," >> "$GUARD_REPORT"
    
    # Find most recent baseline and result files
    local latest_baseline=$(ls -t .claude/test-snapshots/pre-edit-baseline-*.json 2>/dev/null | head -1)
    local latest_result=$(ls -t .claude/test-snapshots/post-edit-result-*.json 2>/dev/null | head -1)
    
    if [ -n "$latest_baseline" ] && [ -n "$latest_result" ]; then
        echo "📄 Found baseline: $latest_baseline"
        echo "📄 Found result: $latest_result"
        
        # Extract test results from files
        local before_tests=$(grep -A 20 '"tests":' "$latest_baseline" | sed -n '2,/}/p' | head -n -1 | tr -d ' \n')
        local after_tests=$(grep -A 20 '"tests":' "$latest_result" | sed -n '2,/}/p' | head -n -1 | tr -d ' \n')
        
        echo "  \"baseline_file\": \"$latest_baseline\"," >> "$GUARD_REPORT"
        echo "  \"result_file\": \"$latest_result\"," >> "$GUARD_REPORT"
        
        # Compare results
        local comparison_result=$(compare_results "$before_tests" "$after_tests")
        echo "  \"comparison\": $comparison_result," >> "$GUARD_REPORT"
        
        # Extract regression count for exit code
        local regression_count=$(echo "$comparison_result" | grep -o '"regressions":[0-9]*' | cut -d':' -f2)
        
        if [ "$regression_count" -gt 0 ]; then
            echo "  \"status\": \"REGRESSIONS_DETECTED\"," >> "$GUARD_REPORT"
            echo "  \"severity\": \"HIGH\"" >> "$GUARD_REPORT"
            echo "}" >> "$GUARD_REPORT"
            
            echo ""
            echo "🚨 REGRESSIONS DETECTED: $regression_count issues found! 🚨"
            echo "📄 Full report: $GUARD_REPORT"
            echo "🔄 Recommendation: Review changes and consider rollback"
            echo ""
            
            return 1
        else
            echo "  \"status\": \"NO_REGRESSIONS\"" >> "$GUARD_REPORT"
            echo "}" >> "$GUARD_REPORT"
            
            echo "✅ No regressions detected!"
            echo "📄 Report saved to: $GUARD_REPORT"
            
            return 0
        fi
        
    else
        echo "⚠️ No baseline or result files found - running fresh comprehensive test"
        
        # Run fresh comprehensive test as current state
        local current_results=$(run_comprehensive_tests "current" "guard")
        
        echo "  \"fresh_run\": true," >> "$GUARD_REPORT"
        echo "  \"current_results\": $current_results," >> "$GUARD_REPORT"
        echo "  \"status\": \"BASELINE_ESTABLISHED\"" >> "$GUARD_REPORT"
        echo "}" >> "$GUARD_REPORT"
        
        echo "📊 Fresh baseline established"
        echo "📄 Report saved to: $GUARD_REPORT"
        
        return 0
    fi
}

# Run main function
main "$@"