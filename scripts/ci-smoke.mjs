#!/usr/bin/env node
import { spawn, exec } from "child_process";
import http from "http";
import os from "os";

const isWin = process.platform === "win32";
const BASE = "http://localhost:3000";

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

function spawnShell(cmd) {
  // Windows często nie ogarnia spawn bez shell:true; użyj powłoki
  return spawn(cmd, { shell: true, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
}

function killTree(proc) {
  return new Promise(resolve => {
    if (!proc || proc.killed) return resolve();
    if (isWin) {
      // Ładnie zabij proces i dzieci
      const killer = spawn("taskkill", ["/pid", String(proc.pid), "/f", "/t"], { stdio: "ignore", shell: true });
      killer.on("exit", () => resolve());
    } else {
      try { process.kill(proc.pid, "SIGTERM"); } catch {}
      setTimeout(() => { try { process.kill(proc.pid, "SIGKILL"); } catch {} ; resolve(); }, 3000);
    }
  });
}

function get(pathname){ return new Promise((resolve,reject)=>{
  const req=http.request(`${BASE}${pathname}`, res=>{ let d=""; res.on("data",c=>d+=c); res.on("end",()=>resolve({code:res.statusCode, body:d})); });
  req.on("error",reject); req.end();
});}

function post(pathname, json){ return new Promise((resolve,reject)=>{
  const data=JSON.stringify(json);
  const req=http.request(`${BASE}${pathname}`, { method:"POST", headers:{ "Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}}, res=>{
    let d=""; res.on("data",c=>d+=c); res.on("end",()=>resolve({code:res.statusCode, body:d, headers:res.headers}));
  });
  req.on("error",reject); req.write(data); req.end();
});}

async function ready(path="/api/health", timeoutMs=60000) {
  const start=Date.now();
  while (Date.now()-start < timeoutMs) {
    try {
      const ok = await get(path);
      if (ok.code===200) return true;
    } catch {}
    await wait(1000);
  }
  throw new Error("Server not ready in time");
}

async function main() {
  // build
  const build = spawnShell("npm run build");
  await new Promise((res,rej)=>build.on("exit",c=>c===0?res():rej(new Error("build failed"))));

  // start
  const srv = spawnShell("npm run start");
  try {
    await ready("/api/health", 60000);
    const a = await get("/api/health");
    const b = await get("/api/ping");
    const c = await post("/api/export",{format:"pdf",paymentStatus:"completed",plan:"premium"});
    const d = await post("/api/export",{format:"html",paymentStatus:"completed",plan:"basic"});
    console.log("SMOKE RESULTS:");
    console.log("health:", a.code);
    console.log("ping:", b.code);
    console.log("export premium pdf:", c.code);
    console.log("export basic html:", d.code);
    if (a.code!==200 || b.code!==200 || c.code!==200 || d.code!==403) process.exitCode=1;
  } finally {
    await killTree(srv);
  }
}

main().catch(e=>{ console.error("SMOKE ERROR", e.message); process.exit(1); });