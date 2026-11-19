/**
 * Dependency-free Chromium smoke test using Chrome DevTools Protocol.
 * Verifies the real exhibition, responsive layouts, gallery interaction and
 * WebGL/fallback rendering, rather than asserting against removed mesh UI.
 */
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
const candidates=["google-chrome","google-chrome-stable","chromium","chromium-browser"];
const executable=candidates.find(bin=>spawnSync(bin,["--version"],{timeout:2500}).status===0);
if(!executable)throw Error("Chrome or Chromium required for visual CI.");
const out=process.env.SCREENSHOT_DIR||"artifacts/browser";
mkdirSync(out,{recursive:true});
const dir=mkdtempSync(join(tmpdir(),"chromatic-chrome-"));
const preview=spawn("./node_modules/.bin/vite",["preview","--host","127.0.0.1","--port","4173","--strictPort"],{stdio:"ignore"});
let browser=null,socket=null;

async function poll(fn,message,timeoutMs=18000){
  const started=Date.now();let last;
  while(Date.now()-started<timeoutMs){
    try{const v=await fn();if(v)return v;}catch(e){last=e;}
    await delay(190);
  }
  throw Error(message+(last?": "+String(last):""));
}
class Cdp {
  constructor(ws){
    this.socket=ws;this.seq=1;this.waiting=new Map();
    ws.addEventListener("message",e=>{
      const d=JSON.parse(e.data);
      if(typeof d.id!=="number")return;
      const w=this.waiting.get(d.id);
      if(!w)return;
      this.waiting.delete(d.id);clearTimeout(w.timer);
      if(d.error)w.reject(Error(d.error.message));
      else w.resolve(d.result||{});
    });
  }
  send(method,params={}){
    const id=this.seq++;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.waiting.delete(id);reject(Error("CDP timeout "+method));},16000);
      this.waiting.set(id,{resolve,reject,timer});
      this.socket.send(JSON.stringify({id,method,params}));
    });
  }
  async eval(expression){
    const r=await this.send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw Error("Browser exception: "+JSON.stringify(r.exceptionDetails).slice(0,900));
    return r.result?.value;
  }
  async screenshot(file){
    const r=await this.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    assert.ok(r.data,"Browser must return PNG screenshot");
    writeFileSync(join(out,file),Buffer.from(r.data,"base64"));
  }
}
try{
  await poll(async()=>{
    const r=await fetch("http://127.0.0.1:4173/",{signal:AbortSignal.timeout(1100)});
    return r.ok;
  },"Vite production preview did not start");

  browser=spawn(executable,[
    "--headless=new","--no-sandbox","--disable-dev-shm-usage",
    "--no-first-run","--disable-extensions","--disable-background-networking",
    "--remote-allow-origins=*","--enable-unsafe-swiftshader",
    "--remote-debugging-port=9222","--window-size=1440,920",
    "--user-data-dir="+dir,"about:blank",
  ],{stdio:"ignore"});
  const target=await poll(async()=>{
    const r=await fetch("http://127.0.0.1:9222/json/list",{signal:AbortSignal.timeout(1300)});
    if(!r.ok)return null;
    return(await r.json()).find(x=>x.type==="page"&&x.webSocketDebuggerUrl);
  },"Chrome DevTools did not start");
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await poll(()=>socket.readyState===WebSocket.OPEN,"CDP socket failed");
  const cdp=new Cdp(socket);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/"});
  await poll(()=>cdp.eval("document.querySelectorAll('.gallery-row').length===6"),"Exhibition failed to render");
  await delay(1100);

  const desktop=await cdp.eval("({heading:document.querySelector('h1')?.getAttribute('aria-label'),gallery:document.querySelectorAll('.gallery-row').length,work:document.querySelectorAll('.team-public-row').length,privateSystems:document.querySelectorAll('.team-private-items article').length,sculpture:!!document.querySelector('canvas.code-monument-canvas'),modules:Number(document.querySelector('canvas.code-monument-canvas')?.dataset.modules),renderer:document.querySelector('canvas.code-monument-canvas')?.dataset.renderer,overflow:document.documentElement.scrollWidth>innerWidth+3,theme:getComputedStyle(document.querySelector('.exhibition-hero')).backgroundColor,source:document.querySelector('.gallery-stage-footer a')?.href,hasOldMesh:!!document.querySelector('.field-canvas,.field-inspector,.inspect-toggle,.mode-switch')})");
  assert.equal(desktop.heading,"Chandrakant Dubey");
  assert.equal(desktop.gallery,6);
  assert.equal(desktop.work,6);
  assert.equal(desktop.privateSystems,4);
  assert.equal(desktop.sculpture,true);
  assert.ok(desktop.modules>=60,"procedurally assembled letter geometry is present");
  assert.ok(["webgl","fallback"].includes(desktop.renderer),"Canvas must run WebGL or a designed fallback: "+JSON.stringify(desktop));
  assert.equal(desktop.overflow,false,"Desktop must not overflow horizontally");
  assert.equal(desktop.hasOldMesh,false,"Remove mesh, inspector, and dev-tool clutter");
  assert.ok(desktop.source.includes("github.com/chandrakantdubey/blackout-protocol"));
  assert.ok(await cdp.eval("document.body.innerText.includes('Jan 2026')"));
  assert.ok(await cdp.eval("!document.body.innerText.includes('AI Concepts Atlas')"));
  assert.ok(await cdp.eval("!!document.querySelector('a[href^=\\\"mailto:\\\"]')"));
  assert.ok(await cdp.eval("document.querySelector('.submit-mail')?.textContent?.includes('Compose email')"));
  console.log("Desktop renderer and content:",JSON.stringify(desktop));
  await cdp.screenshot("hero-desktop.png");

  const pointer=await cdp.eval("(()=>{const r=document.querySelector('.code-monument-canvas').getBoundingClientRect();return{x:r.x+r.width*.5,y:r.y+r.height*.5}})()");
  await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:pointer.x,y:pointer.y});
  await cdp.send("Input.dispatchMouseEvent",{type:"mousePressed",x:pointer.x,y:pointer.y,button:"left",clickCount:1});
  await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:pointer.x+54,y:pointer.y+23,button:"left",buttons:1});
  await cdp.send("Input.dispatchMouseEvent",{type:"mouseReleased",x:pointer.x+54,y:pointer.y+23,button:"left",clickCount:1});
  await delay(300);
  await cdp.screenshot("hero-interacted.png");
  const previousBuilds=await cdp.eval("Number(document.querySelector('.code-monument-canvas').dataset.rebuilds||0)");
  await cdp.eval("document.querySelector('.monument-rebuild').click()");
  if(desktop.renderer==="webgl") {
    await poll(()=>cdp.eval("Number(document.querySelector('.code-monument-canvas').dataset.rebuilds||0)>"+previousBuilds),"Recompile action must restart assembly");
    await delay(2250);
    assert.equal(await cdp.eval("document.querySelector('.code-monument-canvas').dataset.assembly"),"assembled");
  } else {
    assert.ok(await cdp.eval("document.querySelector('.code-monument').classList.contains('code-pulse')"),"fallback is still interactive");
  }
  await cdp.screenshot("hero-recompiled.png");

  await cdp.eval("document.querySelector('#work').scrollIntoView({behavior:'instant'})");
  await delay(450);
  const initial=await cdp.eval("({selected:document.querySelector('.gallery-row[aria-selected=true] strong')?.textContent,poster:document.querySelector('.poster-canvas')?.className,tabs:document.querySelectorAll('[role=tab]').length})");
  assert.equal(initial.selected,"Blackout Protocol");
  assert.equal(initial.tabs,6);
  assert.ok(await cdp.eval("!!document.querySelector('.gallery-world .gallery-scene-3d')"),"3D project stage should be embedded");
  assert.equal(await cdp.eval("document.querySelectorAll('.gallery-depth-sheet').length"),2,"two offset poster layers exist");
  const stage=await cdp.eval("(()=>{const r=document.querySelector('.gallery-world').getBoundingClientRect();return{x:r.x+r.width*.6,y:r.y+r.height*.4}})()");
  await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:stage.x,y:stage.y});
  assert.ok(await cdp.eval("document.querySelector('.gallery-world').style.getPropertyValue('--gallery-ry').includes('deg')"),"gallery pointer tilt works");
  await cdp.screenshot("gallery-desktop.png");
  await cdp.eval("document.querySelectorAll('.gallery-row')[2].click()");
  await poll(()=>cdp.eval("document.querySelector('.gallery-row[aria-selected=true] strong')?.textContent==='StyleScape'"),"Gallery click didn't select StyleScape");
  assert.ok(await cdp.eval("!!document.querySelector('.poster-stylescape')"),"Gallery should replace real poster art");
  await delay(430);
  await cdp.screenshot("gallery-alternate.png");
  await cdp.eval("document.querySelector('.gallery-prev-next button:last-child').click()");
  assert.ok(await cdp.eval("document.querySelector('.gallery-row[aria-selected=true] strong')?.textContent==='Pokédex RPG'"));
  await cdp.eval("document.querySelectorAll('.gallery-row')[5].click()");
  assert.ok(await cdp.eval("document.querySelector('.gallery-summary').textContent.includes('IN DEVELOPMENT')"),"FarmPulse status must remain explicit");
  await cdp.eval("document.querySelectorAll('.gallery-row')[0].click()");
  await cdp.eval("document.querySelector('.gallery-row[aria-selected=true]').focus()");
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"ArrowDown",code:"ArrowDown",windowsVirtualKeyCode:40});
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"ArrowDown",code:"ArrowDown",windowsVirtualKeyCode:40});
  assert.ok(await cdp.eval("document.querySelector('.gallery-row[aria-selected=true] strong')?.textContent==='Timesheet'"),"Keyboard tabs must be operable");

  await cdp.eval("document.querySelector('#experience').scrollIntoView({behavior:'instant'})");
  await delay(400);
  await cdp.screenshot("career-desktop.png");
  await cdp.eval("document.querySelector('.team-section').scrollIntoView({behavior:'instant'})");
  await delay(400);
  await cdp.screenshot("team-work-desktop.png");
  await cdp.eval("document.querySelector('#skills').scrollIntoView({behavior:'instant'})");
  await delay(400);
  assert.equal(await cdp.eval("document.querySelectorAll('.stack-orbit-actions button').length"),4,"orbital skill categories");
  await cdp.eval("document.querySelectorAll('.stack-orbit-actions button')[1].click()");
  assert.ok(await cdp.eval("document.querySelector('#stack-details h3').textContent.includes('Backend')"),"skills interactive");
  assert.ok(await cdp.eval("document.querySelector('#stack-details').textContent.includes('FastAPI')"));
  await cdp.screenshot("skills-desktop.png");
  await cdp.eval("document.querySelector('#play').scrollIntoView({behavior:'instant'})");
  await delay(350);
  assert.ok(await cdp.eval("!!document.querySelector('.flux-canvas') && !!document.querySelector('.duel-board')"),"both real embedded games present");
  assert.equal(await cdp.eval("document.querySelectorAll('.duel-hex').length"),49);
  await cdp.screenshot("arcade-intro-desktop.png");
  await cdp.eval("document.querySelector('.flux-play').click()");
  await delay(240);
  assert.ok(await cdp.eval("document.querySelector('.flux-overlay')===null"),"arcade starts");
  await cdp.screenshot("arcade-running-desktop.png");
  await cdp.eval("document.querySelector('.flux-actions button:first-child').click()");
  assert.ok(await cdp.eval("document.querySelector('.flux-overlay').textContent.includes('PAUSED')"),"arcade pauses");
  await cdp.eval("document.querySelector('.flux-actions button:last-child').click()");
  await cdp.eval("document.querySelector('.duel-stage').scrollIntoView({behavior:'instant'})");
  await delay(300);
  await cdp.eval("document.querySelector('.duel-hex[data-cell=0]').click()");
  await poll(()=>cdp.eval("document.querySelectorAll('.duel-hex.owned-one').length===1"),"Hex practice move");
  await delay(850);
  assert.ok(await cdp.eval("document.querySelectorAll('.duel-hex.owned-two').length>=1"),"local CPU responds");
  await cdp.screenshot("hex-game-desktop.png");
  assert.ok(await cdp.eval("!!document.querySelector('a[href^=\\\"/play/duel\\\"]')"),"dedicated game link present");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/play/duel"});
  await poll(()=>cdp.eval("!!document.querySelector('.duel-fullpage')"),"dedicated route");
  assert.equal(await cdp.eval("document.querySelectorAll('.duel-hex').length"),49);
  await cdp.screenshot("hex-dedicated-desktop.png");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/"});
  await poll(()=>cdp.eval("!!document.querySelector('#top')"),"exhibition after route");

  await cdp.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});
  await delay(450);
  await cdp.eval("window.scrollTo({top:0,behavior:'instant'})");
  await delay(400);
  const mobile=await cdp.eval("({width:innerWidth,page:document.documentElement.scrollWidth,menu:getComputedStyle(document.querySelector('.mobile-nav-toggle')).display,gallery:document.querySelectorAll('.gallery-row').length,sculptureWidth:Math.round(document.querySelector('.code-monument-canvas').getBoundingClientRect().width)})");
  assert.equal(mobile.width,390);
  assert.ok(mobile.page<=393,"390px mobile must not overflow "+JSON.stringify(mobile));
  assert.notEqual(mobile.menu,"none");
  assert.equal(mobile.gallery,6);
  assert.ok(mobile.sculptureWidth>240);
  await cdp.screenshot("hero-mobile.png");
  await cdp.eval("document.querySelector('.mobile-nav-toggle').click()");
  assert.ok(await cdp.eval("document.querySelector('.nav-items').classList.contains('nav-items-open')"));
  await cdp.eval("document.querySelector('.nav-items a').click()");
  assert.equal(await cdp.eval("document.querySelector('.nav-items').classList.contains('nav-items-open')"),false);
  await cdp.eval("document.querySelector('#work').scrollIntoView({behavior:'instant'})");
  await delay(450);
  await cdp.screenshot("gallery-mobile.png");
  await cdp.eval("document.querySelector('.team-section').scrollIntoView({behavior:'instant'})");
  await delay(380);
  await cdp.screenshot("team-mobile.png");
  await cdp.eval("document.querySelector('#contact').scrollIntoView({behavior:'instant'})");
  await delay(380);
  await cdp.screenshot("contact-mobile.png");
  await cdp.eval("document.querySelector('#play').scrollIntoView({behavior:'instant'})");
  await delay(380);
  await cdp.screenshot("arcade-mobile.png");
  await cdp.eval("document.querySelector('.duel-stage').scrollIntoView({behavior:'instant'})");
  await delay(370);
  await cdp.screenshot("hex-mobile.png");
  const gameMobile=await cdp.eval("({body:document.documentElement.scrollWidth,width:innerWidth,board:document.querySelector('.duel-board').getBoundingClientRect().width})");
  assert.ok(gameMobile.body<=gameMobile.width+3,"games must fit mobile "+JSON.stringify(gameMobile));
  assert.ok(gameMobile.board<=gameMobile.width,"Hex board fits mobile "+JSON.stringify(gameMobile));

  await cdp.send("Emulation.setDeviceMetricsOverride",{width:320,height:700,deviceScaleFactor:1,mobile:true,screenWidth:320,screenHeight:700});
  await delay(330);
  const narrow=await cdp.eval("({width:innerWidth,body:document.documentElement.scrollWidth})");
  assert.ok(narrow.body<=narrow.width+3,"Narrow 320px viewport must not horizontally overflow "+JSON.stringify(narrow));
  await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await delay(380);
  assert.ok(await cdp.eval("matchMedia('(prefers-reduced-motion: reduce)').matches"),"Reduced-motion preference supported");
  console.log("Immersive portfolio QA PASS: 3D gallery, orbiting skills, arcade, Hex versus CPU, dedicated route and responsive viewport.");
  console.log("Visual QA saved to "+out);
}finally{
  if(socket?.readyState===WebSocket.OPEN)socket.close();
  if(browser&&!browser.killed)browser.kill("SIGKILL");
  if(!preview.killed)preview.kill("SIGTERM");
  await delay(250);
  try{rmSync(dir,{recursive:true,force:true,maxRetries:10,retryDelay:150});}
  catch(e){console.warn("Chrome temporary profile cleanup deferred:",e.code||String(e));}
}
