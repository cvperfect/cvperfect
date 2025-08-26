#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { preToolUse, postToolUse, toolEdit } from "../scripts/hooks-engine.mjs";

const repo = process.cwd();
const cfg = path.join(repo, "next.config.js");
const readme = path.join(repo, "README.md");

// 4.1 Próba zabronionej edycji configu
try {
  preToolUse({agent:"implementer", tool:"Edit", target: cfg});
  toolEdit(cfg, "\n// forbidden edit\n");
  console.log("❌ Expected BLOCK on config edit, but was allowed");
  process.exitCode = 1;
} catch (e) {
  console.log("✅ BLOCKED config edit:", e.message);
}

// 4.2 Próba niebezpiecznej komendy Bash
try {
  preToolUse({agent:"implementer", tool:"Bash", cmd: "rm -rf /tmp/should_be_blocked"});
  console.log("❌ Expected BLOCK on rm -rf, but was allowed");
  process.exitCode = 1;
} catch (e) {
  console.log("✅ BLOCKED destructive bash:", e.message);
}

// 4.3 Legalna edycja README + post-hook lint
try {
  preToolUse({agent:"implementer", tool:"Edit", target: readme});
  toolEdit(readme, "\nHook test line\n");
  const post = postToolUse({agent:"implementer", tool:"Edit", target: readme});
  console.log("✅ README edit allowed. Lint output (first 20 lines):");
  console.log(post.lint.split("\n").slice(0,20).join("\n"));
} catch (e) {
  console.log("❌ README edit flow failed:", e.message);
  process.exitCode = 1;
}