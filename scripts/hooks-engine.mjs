#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PROTECTED = new Set(["next.config.js","webpack.config.js",".env",".env.local","vite.config.ts","eslint.config.mjs"]);
const DESTRUCTIVE = [/rm -rf/i, /\bsudo\b/i];

export function preToolUse({agent, tool, target, cmd}) {
  if (tool === "Bash" && DESTRUCTIVE.some(rx => rx.test(cmd||""))) {
    throw new Error(`PreToolUse BLOCK: destructive command "${cmd}"`);
  }
  if (agent === "implementer" && tool === "Edit" && target && PROTECTED.has(path.basename(target))) {
    throw new Error(`PreToolUse BLOCK: implementer cannot edit ${target}`);
  }
}

export function postToolUse({agent, tool, target}) {
  try {
    const out = execSync("npm run -s lint", {stdio: "pipe"}).toString();
    return {lint: out};
  } catch (e) {
    return {lint: e.stdout?.toString() || e.message};
  }
}

// Minimalne adaptery narzędzi do testów
export function toolEdit(file, text) {
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.appendFileSync(file, text, "utf8");
}
export function toolRead(file) {
  return fs.readFileSync(file, "utf8");
}
export function toolBash(cmd) {
  return execSync(cmd, {stdio:"pipe"}).toString();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("hooks-engine ready");
}