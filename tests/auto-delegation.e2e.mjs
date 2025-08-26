#!/usr/bin/env node
import { routeTask } from "../scripts/delegation-router.mjs";

const cases = [
  {task: "The success.js page enters an infinite render loop after payment. Need root cause and fix.", expect: "root_cause_analysis_master"},
  {task: "Scan for React/Next anti-patterns and suggest automated fixes with confidence.", expect: "ai_debugging_copilot_master"},
  {task: "Audit API endpoints for security gaps: auth, CSRF, XSS, rate limit.", expect: "api_security_master"},
];

let pass = 0;
for (const c of cases) {
  const res = JSON.parse(require("child_process").execSync(`node ./scripts/delegation-router.mjs "${c.task.replace(/"/g,'\\"')}"`).toString());
  const ok = res.agent === c.expect;
  console.log(`${ok ? "✅" : "❌"} route "${c.task.slice(0,60)}" -> ${res.agent} (expected ${c.expect})`);
  if (!ok) process.exitCode = 1; else pass++;
}
console.log(`\nSummary: ${pass}/${cases.length} passed`);