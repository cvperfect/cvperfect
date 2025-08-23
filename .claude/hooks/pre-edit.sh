#!/bin/bash

# CVPerfect Pre-Edit Hook
# Runs critical tests BEFORE any file modification to establish baseline
# Exit codes: 0 = success, 1 = critical failure (block edit), 2 = warning (allow edit)

set -e

echo "🔍 CVPerfect Pre-Edit Validation Starting..."
echo "Target file: $1"
echo "Edit type: $2"

# Set project root
PROJECT_ROOT="C:/Users/czupa/OneDrive/Pulpit/cvperfect"
cd "$PROJECT_ROOT" || exit 1

# Create timestamp for this validation run
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BASELINE_FILE=".claude/test-snapshots/pre-edit-baseline-${TIMESTAMP}.json"

# Ensure snapshots directory exists
mkdir -p ".claude/test-snapshots"

echo "📊 Creating test baseline snapshot..."

# Initialize baseline results
echo "{" > "$BASELINE_FILE"
echo "  \"timestamp\": \"$TIMESTAMP\"," >> "$BASELINE_FILE"
echo "  \"target_file\": \"$1\"," >> "$BASELINE_FILE"
echo "  \"edit_type\": \"$2\"," >> "$BASELINE_FILE"
echo "  \"tests\": {" >> "$BASELINE_FILE"

# Critical Path Test 1: Build Check
echo "🔧 Testing build process..."
if npm run build > /dev/null 2>&1; then
    echo "    \"build\": \"PASS\"," >> "$BASELINE_FILE"
    echo "   ✅ Build: PASS"
else
    echo "    \"build\": \"FAIL\"," >> "$BASELINE_FILE"
    echo "   ❌ Build: FAIL"
    echo "🚨 CRITICAL: Build failing before edit. Fix build issues first!"
    echo "  }," >> "$BASELINE_FILE"
    echo "  \"status\": \"CRITICAL_FAILURE\"" >> "$BASELINE_FILE"
    echo "}" >> "$BASELINE_FILE"
    exit 1
fi

# Critical Path Test 2: Lint Check
echo "📝 Testing lint compliance..."
if npm run lint > /dev/null 2>&1; then
    echo "    \"lint\": \"PASS\"," >> "$BASELINE_FILE"
    echo "   ✅ Lint: PASS"
else
    echo "    \"lint\": \"FAIL\"," >> "$BASELINE_FILE"
    echo "   ⚠️ Lint: FAIL (proceeding with warning)"
fi

# Critical Path Test 3: Quick Smoke Test
echo "🧪 Running smoke tests..."
if [ -f "test-complete-functionality.js" ]; then
    if timeout 60 node test-complete-functionality.js > /dev/null 2>&1; then
        echo "    \"smoke_test\": \"PASS\"," >> "$BASELINE_FILE"
        echo "   ✅ Smoke Test: PASS"
    else
        echo "    \"smoke_test\": \"FAIL\"," >> "$BASELINE_FILE"
        echo "   ❌ Smoke Test: FAIL"
        echo "🚨 CRITICAL: Core functionality failing before edit!"
        echo "  }," >> "$BASELINE_FILE"
        echo "  \"status\": \"CRITICAL_FAILURE\"" >> "$BASELINE_FILE"
        echo "}" >> "$BASELINE_FILE"
        exit 1
    fi
else
    echo "    \"smoke_test\": \"SKIP\"," >> "$BASELINE_FILE"
    echo "   ⚠️ Smoke Test: SKIPPED (test file not found)"
fi

# File-specific validations based on target file
case "$1" in
    */pages/success.js)
        echo "🎯 Success page specific validation..."
        if [ -f "test-all-success-functions.js" ]; then
            if timeout 30 node test-all-success-functions.js > /dev/null 2>&1; then
                echo "    \"success_functions\": \"PASS\"," >> "$BASELINE_FILE"
                echo "   ✅ Success Functions: PASS"
            else
                echo "    \"success_functions\": \"FAIL\"," >> "$BASELINE_FILE"
                echo "   ❌ Success Functions: FAIL"
                echo "🚨 CRITICAL: Success page functions failing before edit!"
                echo "  }," >> "$BASELINE_FILE"
                echo "  \"status\": \"CRITICAL_FAILURE\"" >> "$BASELINE_FILE"
                echo "}" >> "$BASELINE_FILE"
                exit 1
            fi
        fi
        ;;
    */pages/index.js)
        echo "🏠 Main page specific validation..."
        echo "   ⚠️ Main page edit detected - use extreme caution!"
        ;;
    */api/*)
        echo "🔌 API endpoint specific validation..."
        if [ -f "test-api-endpoints.js" ]; then
            if timeout 45 node test-api-endpoints.js > /dev/null 2>&1; then
                echo "    \"api_endpoints\": \"PASS\"," >> "$BASELINE_FILE"
                echo "   ✅ API Endpoints: PASS"
            else
                echo "    \"api_endpoints\": \"FAIL\"" >> "$BASELINE_FILE"
                echo "   ⚠️ API Endpoints: FAIL (warning)"
            fi
        fi
        ;;
esac

# Finalize baseline file
echo "    \"validation_complete\": \"PASS\"" >> "$BASELINE_FILE"
echo "  }," >> "$BASELINE_FILE"
echo "  \"status\": \"BASELINE_ESTABLISHED\"" >> "$BASELINE_FILE"
echo "}" >> "$BASELINE_FILE"

echo "✅ Pre-edit validation complete!"
echo "📄 Baseline saved to: $BASELINE_FILE"
echo "🔄 Ready for edit operation"

exit 0