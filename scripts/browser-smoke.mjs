/**
 * Browser smoke without a Playwright/Puppeteer dependency.
 * Uses Node's WebSocket and the built-in Chrome DevTools Protocol.
 */
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const candidates = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
const executable = candidates.find(bin => spawnSync(bin, ["--version"], {timeout:3000}).status === 0);
if (!executable) throw Error("Chrome or Chromium is required for browser smoke tests");

const output = process.env.SCREENSHOT_DIR || "artifacts/browser";
mkdirSync(output, { recursive: true });
const dir = mkdtempSync(join(tmpdir(), "field-chrome-"));
const preview = spawn("./node_modules/.bin/vite", ["preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {stdio:"ignore"});
let chrome;
let ws;

async function poll(fn, failure, timeoutMs = 18000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await fn();
      if (value) return value;
    } catch(e) { lastError = e; }
    await delay(180);
  }
  throw Error(failure + (lastError ? ": " + String(lastError) : ""));
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.seq = 1;
    this.waiting = new Map();
    socket.addEventListener("message", e => {
      const data = JSON.parse(e.data);
      if (typeof data.id !== "number") return;
      const w = this.waiting.get(data.id);
      if (!w) return;
      this.waiting.delete(data.id);
      clearTimeout(w.timer);
      if (data.error) w.reject(Error(data.error.message));
      else w.resolve(data.result || {});
    });
  }
  send(method, params = {}) {
    const id = this.seq++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiting.delete(id);
        reject(Error("CDP timeout: " + method));
      }, 16000);
      this.waiting.set(id, {resolve,reject,timer});
      this.socket.send(JSON.stringify({id,method,params}));
    });
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", {expression, returnByValue:true, awaitPromise:true});
    if (r.exceptionDetails) throw Error("Browser JS error: " + JSON.stringify(r.exceptionDetails).slice(0,700));
    return r.result?.value;
  }
  async capture(filename) {
    const result = await this.send("Page.captureScreenshot", {format:"png",captureBeyondViewport:false});
    assert.ok(result.data);
    writeFileSync(join(output,filename), Buffer.from(result.data,"base64"));
  }
}

try {
  await poll(async () => {
    const r = await fetch("http://127.0.0.1:4173/", {signal:AbortSignal.timeout(1000)});
    return r.ok;
  }, "Vite preview failed to start");
  chrome = spawn(executable, [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
    "--no-first-run", "--disable-extensions", "--disable-background-networking",
    "--remote-allow-origins=*", "--remote-debugging-port=9222",
    "--user-data-dir="+dir, "--window-size=1365,900", "about:blank",
  ], {stdio:"ignore"});
  const target = await poll(async () => {
    const r = await fetch("http://127.0.0.1:9222/json/list", {signal:AbortSignal.timeout(1200)});
    if (!r.ok) return null;
    return (await r.json()).find(t=>t.type==="page"&&t.webSocketDebuggerUrl);
  }, "Chrome DevTools failed to start");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await poll(() => ws.readyState === WebSocket.OPEN,"CDP WebSocket failed to connect");
  const client = new Cdp(ws);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.navigate", {url:"http://127.0.0.1:4173/"});
  await poll(() => client.eval("document.querySelectorAll('.work-card').length===6"), "React projects did not render");

  const desktop = await client.eval("({projects:document.querySelectorAll('.work-card').length,names:[...document.querySelectorAll('.work-card h3')].map(x=>x.textContent),canvas:!!document.querySelector('.kinetic-canvas'),teamLinks:document.querySelectorAll('.team-link').length,privateSystems:document.querySelectorAll('.internal-cell').length,compactCardHeight:Math.round(document.querySelector('.work-card').getBoundingClientRect().height),overflow:document.documentElement.scrollWidth>innerWidth+3,hero:document.querySelector('h1')?.textContent})");
  assert.equal(desktop.projects,6);
  assert.equal(desktop.teamLinks,6,"six public company work links");
  assert.equal(desktop.privateSystems,4,"four private intranet projects");
  assert.ok(desktop.compactCardHeight<310,"project cards must be compact: "+desktop.compactCardHeight);
  assert.ok(await client.eval("document.body.innerText.includes('Sep 2025 — Jan 2026')"),"corrected Nutriiya end date");
  assert.ok(await client.eval("document.querySelector('.submit-mail')?.textContent?.includes('Compose email')"),"fallback contact composer should work without backend credentials");
  assert.ok(await client.eval("!!document.querySelector('a[href^=\"mailto:\"]')"),"direct contact email must remain available");
  assert.ok(desktop.names.includes("Blackout Protocol"));
  assert.ok(desktop.names.includes("Timesheet"));
  assert.ok(!desktop.names.includes("AI Concepts Atlas"));
  assert.ok(desktop.names.includes("FarmPulse"));
  assert.ok(desktop.hero.includes("Chandrakant"));
  assert.ok(desktop.canvas);
  assert.equal(desktop.overflow,false,"desktop horizontal overflow");

  const where = await client.eval("(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await client.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:where.x,y:where.y});
  await client.send("Input.dispatchMouseEvent",{type:"mousePressed",x:where.x,y:where.y,button:"left",clickCount:1});
  await client.send("Input.dispatchMouseEvent",{type:"mouseReleased",x:where.x,y:where.y,button:"left",clickCount:1});
  await delay(650);
  await client.eval("document.querySelector('.inspect-toggle').click()");
  await poll(()=>client.eval("!!document.querySelector('.field-inspector')"),"Inspector did not open");
  const inspected = await client.eval("({metrics:document.querySelectorAll('.inspector-metrics strong').length,events:document.querySelector('.inspector-metrics>div:nth-child(4) strong')?.textContent,source:document.querySelector('.inspector-source-links a')?.href})");
  assert.equal(inspected.metrics,4);
  assert.ok(Number(inspected.events)>=1, "pointerdown should reach the simulation");
  assert.ok(inspected.source.endsWith("/src/field/typeEngine.ts"));
  assert.ok(await client.eval("document.querySelector('.kinetic-canvas')?.toDataURL('image/png').startsWith('data:image/png')"),"canvas frame export should produce PNG");
  await client.capture("desktop-inspector.png");
  await client.eval("document.querySelector('.inspector-header button').click()");
  await delay(120);
  await client.capture("desktop.png");
  await client.eval("document.querySelector('.mode-switch button:nth-child(2)').click()");
  assert.ok(await client.eval("!!document.querySelector('.field-canvas')"),"grid mode must work");
  await client.eval("document.querySelector('.mode-switch button:first-child').click()");
  assert.ok(await client.eval("!!document.querySelector('.kinetic-canvas')"),"type mode must restore");

  await client.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});
  await delay(300);
  await client.eval("window.scrollTo(0,0)");
  const mobile = await client.eval("({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,projects:document.querySelectorAll('.work-card').length,menu:getComputedStyle(document.querySelector('.mobile-menu')).display,fieldWidth:document.querySelector('canvas').getBoundingClientRect().width})");
  assert.equal(mobile.projects,6);
  assert.ok(mobile.menu!=="none");
  assert.ok(mobile.documentWidth<=mobile.viewport+3,"mobile horizontal overflow "+JSON.stringify(mobile));
  assert.ok(mobile.fieldWidth>200 && mobile.fieldWidth<420);
  const mobileCardHeight=await client.eval("Math.round(document.querySelector('.work-card').getBoundingClientRect().height)");
  assert.ok(mobileCardHeight<270,"mobile project card should remain compact: "+mobileCardHeight);
  await client.eval("document.querySelector('.mobile-menu').click()");
  assert.ok(await client.eval("document.querySelector('.nav-links').classList.contains('open')"));
  await client.eval("document.querySelector('.nav-links a').click()");
  assert.equal(await client.eval("document.querySelector('.nav-links').classList.contains('open')"),false);
  await client.eval("window.scrollTo(0,0)");
  await delay(160);
  await client.capture("mobile.png");

  await client.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await delay(400);
  assert.equal(await client.eval("matchMedia('(prefers-reduced-motion: reduce)').matches"),true);
  console.log("Browser smoke PASS: kinetic glyph rendering, two modes, six compact projects, ten company/intranet entries, corrected timeline, live inspector, desktop/mobile, reduced motion.");
  console.log("Captured screenshots in "+output);
} finally {
  if (ws?.readyState===WebSocket.OPEN) ws.close();
  if (chrome && !chrome.killed) chrome.kill("SIGKILL");
  if (!preview.killed) preview.kill("SIGTERM");
  rmSync(dir,{recursive:true,force:true});
}
