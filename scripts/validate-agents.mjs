#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const NEW_8_AGENTS = [
  'root_cause_analysis_master.md',
  'ai_debugging_copilot_master.md', 
  'api_security_master.md',
  'performance_optimizer_master.md',
  'code_quality_inspector.md',
  'regression_tester_master.md',
  'api_endpoint_analyzer.md',
  'database_optimizer_master.md'
];

const ALLOWED_TOOLS = ['Read', 'Edit', 'Grep', 'Bash'];
const ALLOWED_MODELS = ['sonnet', 'opus', 'haiku'];
const REQUIRED_SECTIONS = ['Operating Procedure', 'Output / Handoff', 'Guardrails'];

console.log('🔍 CVPerfect Agent Validator - NEW 8 AGENTS ONLY');
console.log('=' .repeat(60));

let totalPassed = 0;
let totalFailed = 0;

for (const agentFile of NEW_8_AGENTS) {
  const agentPath = path.join('.claude', 'agents', agentFile);
  const agentName = agentFile.replace('.md', '');
  
  console.log(`\n### VALIDATING: ${agentName} ###`);
  
  if (!fs.existsSync(agentPath)) {
    console.log(`❌ FAIL: File not found: ${agentPath}`);
    totalFailed++;
    continue;
  }
  
  try {
    const content = fs.readFileSync(agentPath, 'utf8');
    const lines = content.split('\n');
    
    // Extract YAML frontmatter
    if (!lines[0].startsWith('---')) {
      console.log('❌ FAIL: No YAML frontmatter found');
      totalFailed++;
      continue;
    }
    
    let frontmatterEnd = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].startsWith('---')) {
        frontmatterEnd = i;
        break;
      }
    }
    
    if (frontmatterEnd === -1) {
      console.log('❌ FAIL: YAML frontmatter not closed');
      totalFailed++;
      continue;
    }
    
    const yamlContent = lines.slice(1, frontmatterEnd).join('\n');
    const frontmatter = yaml.load(yamlContent);
    
    let passed = true;
    
    // Check required fields
    const requiredFields = ['name', 'description', 'tools', 'model'];
    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        console.log(`❌ FAIL: Missing required field: ${field}`);
        passed = false;
      }
    }
    
    // Check model is allowed
    if (frontmatter.model && !ALLOWED_MODELS.includes(frontmatter.model)) {
      console.log(`❌ FAIL: Model "${frontmatter.model}" not in allowed set: ${ALLOWED_MODELS.join(', ')}`);
      passed = false;
    }
    
    // Check description contains "Use PROACTIVELY"
    if (frontmatter.description && !frontmatter.description.includes('Use PROACTIVELY')) {
      console.log('❌ FAIL: Description must contain "Use PROACTIVELY"');
      passed = false;
    }
    
    // Check tools are subset of allowed tools
    if (frontmatter.tools) {
      const toolsArray = Array.isArray(frontmatter.tools) ? frontmatter.tools : frontmatter.tools.split(', ');
      for (const tool of toolsArray) {
        if (!ALLOWED_TOOLS.includes(tool.trim())) {
          console.log(`❌ FAIL: Tool "${tool}" not in allowed set: ${ALLOWED_TOOLS.join(', ')}`);
          passed = false;
        }
      }
    }
    
    // Check required sections exist
    for (const section of REQUIRED_SECTIONS) {
      if (!content.includes(`# ${section}`)) {
        console.log(`❌ FAIL: Missing section: "${section}"`);
        passed = false;
      }
    }
    
    if (passed) {
      console.log('✅ PASS: All validations passed');
      totalPassed++;
    } else {
      totalFailed++;
    }
    
  } catch (error) {
    console.log(`❌ FAIL: Parse error: ${error.message}`);
    totalFailed++;
  }
}

console.log('\n' + '=' .repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log(`Total Agents: ${NEW_8_AGENTS.length}`);
console.log(`PASSED: ${totalPassed}`);
console.log(`FAILED: ${totalFailed}`);

if (totalFailed === 0) {
  console.log('\n🎉 ALL NEW 8 AGENTS VALIDATION PASSED!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalFailed} AGENT(S) FAILED VALIDATION`);
  process.exit(1);
}