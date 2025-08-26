#!/usr/bin/env node
import { spawn } from "child_process";
import http from "http";

const BASE = "http://localhost:3000";
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
function ready(path="/api/health", timeoutMs=60000) {
  const start=Date.now();
  return new Promise(async (resolve,reject)=>{
    while (Date.now()-start < timeoutMs) {
      try {
        const ok = await get(path);
        if (ok.code===200) return resolve();
      } catch {}
      await wait(1000);
    }
    reject(new Error("Server not ready in time"));
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

async function main() {
  // Build + start
  const build = spawn(process.platform.startsWith("win")?"npm.cmd":"npm", ["run","build"], {stdio:"inherit"});
  await new Promise((res,rej)=>build.on("exit",c=>c===0?res():rej(new Error("build failed"))));
  const srv = spawn(process.platform.startsWith("win")?"npm.cmd":"npm", ["run","start"], {stdio:"inherit"});
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
    // stop server
    if (srv && !srv.killed) srv.kill("SIGTERM");
  }
}
main().catch(e=>{ console.error("SMOKE ERROR", e.message); process.exit(1); });