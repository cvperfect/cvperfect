#!/usr/bin/env node
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const AGENTS_DIR = path.join(process.cwd(), ".claude", "agents");

function loadAgents() {
  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith(".md"));
  return files.map(file => {
    const full = fs.readFileSync(path.join(AGENTS_DIR, file), "utf8");
    const fm = /^---\n([\s\S]*?)\n---/.exec(full);
    const front = fm ? yaml.load(fm[1]) : {};
    return { file, ...front };
  });
}

const agents = loadAgents();

// Reguły mapujące frazy → agent (NOWE 8 + istniejące)
const rules = [
  { agent: "root_cause_analysis_master",  match: [/infinite render|loop|crash|root cause/i] },
  { agent: "ai_debugging_copilot_master", match: [/anti-?pattern|useEffect|auto(?:mated)? fix/i] },
  { agent: "api_security_master",         match: [/security|auth|csrf|xss|rate.?limit/i] },
  { agent: "performance_optimizer_master",match: [/performance|latency|bundle|memory/i] },
  { agent: "code_quality_inspector",      match: [/refactor|style|lint|standards|technical debt/i] },
  { agent: "regression_tester_master",    match: [/regression|pre-?deploy|invariant/i] },
  { agent: "api_endpoint_analyzer",       match: [/endpoint|API design|Next\.js API|405|method/i] },
  { agent: "database_optimizer_master",   match: [/query|supabase|postgres|rls|index/i] },
];

function routeTask(text) {
  for (const r of rules) {
    if (r.match.some(rx => rx.test(text))) return r.agent;
  }
  return null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const task = process.argv.slice(2).join(" ").trim();
  const agent = routeTask(task || "");
  const found = agents.find(a => a?.name === agent);
  const ok = Boolean(found);
  const tools = found?.tools || "n/a";
  console.log(JSON.stringify({task, agent, ok, tools, file: found?.file}, null, 2));
}

export { routeTask };