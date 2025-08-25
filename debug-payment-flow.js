#!/usr/bin/env node

/**
 * CVPerfect Payment Flow Debug Script
 * 
 * PROBLEM: Modal "Zapisywanie danych..." (3/5) gets stuck - no Stripe redirect
 * 
 * This script analyzes the handlePlanSelect function and identifies:
 * 1. Missing hideProgress() calls in error scenarios
 * 2. Logic paths that don't reach Stripe redirect
 * 3. Error handling issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CVPerfect Payment Flow Debug Analysis');
console.log('=========================================\n');

// Read the main index.js file
const indexPath = path.join(__dirname, 'pages', 'index.js');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Extract the handlePlanSelect function
const functionStart = indexContent.indexOf('const handlePlanSelect = async (plan) => {');
const functionEnd = indexContent.indexOf('};', functionStart) + 2;
const handlePlanSelectFunction = indexContent.slice(functionStart, functionEnd);

console.log('📋 ANALYSIS RESULTS:');
console.log('====================\n');

// 1. Check for hideProgress() calls
const hideProgressCalls = (handlePlanSelectFunction.match(/hideProgress\(\)/g) || []).length;
const showProgressCalls = (handlePlanSelectFunction.match(/showProgressStep\(/g) || []).length;

console.log('1️⃣ PROGRESS MANAGEMENT:');
console.log(`   - showProgressStep() calls: ${showProgressCalls}`);
console.log(`   - hideProgress() calls: ${hideProgressCalls}`);
console.log(`   - Balance: ${hideProgressCalls >= showProgressCalls ? '✅ Good' : '❌ ISSUE - Missing hideProgress() calls'}\n`);

// 2. Check error handling patterns
const errorPatterns = {
  'handlePaymentError calls': /handlePaymentError\(/g,
  'catch blocks': /catch \(/g,
  'hideProgress calls': /hideProgress\(\)/g,
  'setIsProcessingPayment(false)': /setIsProcessingPayment\(false\)/g
};

console.log('2️⃣ ERROR HANDLING ANALYSIS:');
Object.entries(errorPatterns).forEach(([name, pattern]) => {
  const matches = handlePlanSelectFunction.match(pattern) || [];
  console.log(`   - ${name}: ${matches.length} occurrences`);
});

// 3. Find potential stuck points
console.log('\n3️⃣ POTENTIAL STUCK POINTS:');

// Look for return statements without hideProgress()
const lines = handlePlanSelectFunction.split('\n');
let potentialIssues = [];

lines.forEach((line, index) => {
  // Check for early returns without hideProgress
  if (line.includes('return') && !line.includes('//')) {
    const lineNum = functionStart + index;
    // Check if hideProgress is called before this return
    const beforeReturn = lines.slice(0, index).join('\n');
    const afterLastProgress = beforeReturn.lastIndexOf('showProgressStep');
    const hideAfterProgress = beforeReturn.slice(afterLastProgress).includes('hideProgress');
    
    if (afterLastProgress !== -1 && !hideAfterProgress) {
      potentialIssues.push({
        line: lineNum,
        content: line.trim(),
        issue: 'Early return without hideProgress() - could leave modal stuck'
      });
    }
  }
  
  // Check for error scenarios without proper cleanup
  if (line.includes('throw new Error') && !line.includes('//')) {
    const beforeThrow = lines.slice(Math.max(0, index - 5), index).join('\n');
    if (!beforeThrow.includes('hideProgress') && beforeThrow.includes('showProgressStep')) {
      potentialIssues.push({
        line: functionStart + index,
        content: line.trim(),
        issue: 'Error thrown without hideProgress() cleanup'
      });
    }
  }
});

if (potentialIssues.length > 0) {
  console.log('   ❌ ISSUES FOUND:');
  potentialIssues.forEach((issue, i) => {
    console.log(`   ${i + 1}. Line ~${issue.line}: ${issue.issue}`);
    console.log(`      Code: ${issue.content}`);
  });
} else {
  console.log('   ✅ No obvious stuck points found');
}

// 4. Check Stripe redirect logic
console.log('\n4️⃣ STRIPE REDIRECT ANALYSIS:');
const stripeRedirects = handlePlanSelectFunction.match(/window\.location\.href = url/g) || [];
const stripeRedirectAlts = handlePlanSelectFunction.match(/redirectToCheckout/g) || [];

console.log(`   - Direct redirects (window.location.href): ${stripeRedirects.length}`);
console.log(`   - Stripe SDK redirects (redirectToCheckout): ${stripeRedirectAlts.length}`);

if (stripeRedirects.length === 0 && stripeRedirectAlts.length === 0) {
  console.log('   ❌ CRITICAL: No Stripe redirect logic found!');
} else {
  console.log('   ✅ Stripe redirect logic present');
}

// 5. Check for nested try-catch blocks
console.log('\n5️⃣ NESTED ERROR HANDLING:');
const tryBlocks = (handlePlanSelectFunction.match(/try \{/g) || []).length;
const catchBlocks = (handlePlanSelectFunction.match(/catch \(/g) || []).length;

console.log(`   - try blocks: ${tryBlocks}`);
console.log(`   - catch blocks: ${catchBlocks}`);

if (tryBlocks !== catchBlocks) {
  console.log('   ⚠️  WARNING: Mismatched try-catch blocks');
} else {
  console.log('   ✅ Try-catch blocks balanced');
}

console.log('\n🔧 RECOMMENDED FIXES:');
console.log('=====================');

if (potentialIssues.length > 0) {
  console.log('1. Add hideProgress() calls before early returns');
  console.log('2. Ensure setIsProcessingPayment(false) in all error paths');
  console.log('3. Add proper error cleanup in catch blocks');
}

console.log('4. Test each plan type (basic, gold, premium) individually');
console.log('5. Check browser console for API errors');
console.log('6. Verify Stripe API keys and session creation');

console.log('\n🧪 TESTING RECOMMENDATIONS:');
console.log('============================');
console.log('1. Open browser dev tools Console tab');
console.log('2. Try payment flow and watch for:');
console.log('   - API request failures (/api/save-session, /api/create-checkout-session)');
console.log('   - JavaScript errors in console');
console.log('   - Network tab for HTTP status codes');
console.log('3. Check if progress gets stuck at specific step (1-5)');
console.log('4. Verify sessionStorage/localStorage data persistence');

console.log('\n✅ Analysis complete. Check browser console during payment flow for specific errors.');