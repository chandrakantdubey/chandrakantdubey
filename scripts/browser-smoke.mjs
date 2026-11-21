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
const candidates=[process.env.CHROME_PATH,process.env.CHROMIUM_PATH,"google-chrome","google-chrome-stable","chromium","chromium-browser"].filter(Boolean);
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

// Audit actual computed sizes, not only stylesheet declarations. Capture
// direct text nodes so layout-only wrappers don't skew the results.
async function assertMinimumTextSize(cdp,viewport) {
  const offenders=await cdp.eval("(()=>{const out=[];for(const el of document.body.querySelectorAll('*')){if(out.length>=30)break;if(!Array.from(el.childNodes).some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent?.trim()))continue;const cs=getComputedStyle(el),box=el.getBoundingClientRect();if(cs.display==='none'||cs.visibility==='hidden'||box.width===0||box.height===0||!el.getClientRects().length)continue;const px=parseFloat(cs.fontSize);if(Number.isFinite(px)&&px<11.99)out.push({tag:el.tagName,className:typeof el.className==='string'?el.className.slice(0,65):'',font:cs.fontSize,text:el.textContent?.trim().slice(0,60)});}return out})()");
  assert.deepEqual(offenders,[],viewport+" has text smaller than 12px: "+JSON.stringify(offenders));
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
  await cdp.send("Page.addScriptToEvaluateOnNewDocument",{source:`
    (()=>{const data={lcp:null,cls:0,longTasks:[]};window.__cdVitals=data;
      const observe=(type,handle)=>{try{new PerformanceObserver(list=>{
        for(const entry of list.getEntries())handle(entry);
      }).observe({type,buffered:true});}catch{/* unsupported */}
      };
      observe('largest-contentful-paint',entry=>data.lcp=entry.startTime);
      observe('layout-shift',entry=>{if(!entry.hadRecentInput)data.cls+=entry.value;});
      observe('longtask',entry=>data.longTasks.push(entry.duration));
    })();`
  });
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
  const heroFrame=await cdp.eval("(()=>{const hero=document.querySelector('.exhibition-hero').getBoundingClientRect(),canvas=document.querySelector('.code-monument-canvas').getBoundingClientRect();return {heroLeft:hero.left,heroRight:hero.right,canvasLeft:canvas.left,canvasRight:canvas.right,width:document.documentElement.clientWidth,scale:Number(document.querySelector('.code-monument-canvas').dataset.fitScale)}})()");
  assert.ok(Math.abs(heroFrame.canvasLeft-heroFrame.heroLeft)<=1 && Math.abs(heroFrame.canvasRight-heroFrame.heroRight)<=1,
    "3D canvas must occupy the entire desktop hero, not an inset box: "+JSON.stringify(heroFrame));
  if(desktop.renderer==="webgl") assert.ok(heroFrame.scale>0,"WebGL monogram must have a fitted projection scale");
  await assertMinimumTextSize(cdp,"1440px desktop");
  const initialPerf=await cdp.eval("window.__cdVitals");
  console.log("Initial desktop Web Vitals / synthetic:",JSON.stringify(initialPerf));
  assert.ok(initialPerf.longTasks.every(ms=>ms<850),
    "Initial navigation has a catastrophic main-thread task over 850 ms: "+JSON.stringify(initialPerf.longTasks));
  const pageStory=await cdp.eval("(()=>{const main=document.querySelector('main');const ribbon=document.querySelector('.marquee-track');const copies=[...ribbon.querySelectorAll('.marquee-copy')];const arcade=document.querySelector('[data-experience=arcade]').getBoundingClientRect();const hex=document.querySelector('[data-experience=packet]').getBoundingClientRect();return {lastSection:main.lastElementChild?.id,sectionMarkers:document.querySelectorAll('.section-topline').length,oldCopy:document.body.innerText.includes('Two fully functional games, embedded into the exhibition'),ribbonCopies:copies.map(x=>({text:x.textContent,width:x.getBoundingClientRect().width})),animation:getComputedStyle(ribbon).animationName,arcade:{left:arcade.left,right:arcade.right},hex:{left:hex.left,right:hex.right},viewport:document.documentElement.clientWidth}})()");
  assert.equal(pageStory.lastSection,"final-boss","Packet Panic must finish the page after contact");
  assert.equal(pageStory.sectionMarkers,0,"no ordinal section divider UI");
  assert.equal(pageStory.oldCopy,false,"remove self-promotional game disclaimer");
  assert.equal(pageStory.ribbonCopies.length,2,"marquee must duplicate the exact same group");
  assert.equal(pageStory.ribbonCopies[0].text,pageStory.ribbonCopies[1].text);
  assert.ok(Math.abs(pageStory.ribbonCopies[0].width-pageStory.ribbonCopies[1].width)<1,"identical ticker widths ensure a seamless loop");
  assert.equal(pageStory.animation,"marquee-seamless","ticker must animate continuously");
  assert.ok(pageStory.arcade.left<=2 && pageStory.arcade.right>=pageStory.viewport-2,"arcade must be full bleed "+JSON.stringify(pageStory));
  assert.ok(pageStory.hex.left<=2 && pageStory.hex.right>=pageStory.viewport-2,"Packet Panic game must be full bleed "+JSON.stringify(pageStory));
  const tickerBefore=await cdp.eval("getComputedStyle(document.querySelector('.marquee-track')).transform");
  await delay(230);
  const tickerAfter=await cdp.eval("getComputedStyle(document.querySelector('.marquee-track')).transform");
  if(!await cdp.eval("matchMedia('(prefers-reduced-motion: reduce)').matches"))
    assert.notEqual(tickerBefore,tickerAfter,"marquee must physically move, not just declare an animation");
  assert.equal(desktop.hasOldMesh,false,"Remove mesh, inspector, and dev-tool clutter");
  assert.ok(desktop.source.includes("github.com/chandrakantdubey/blackout-protocol"));
  assert.ok(await cdp.eval("document.body.innerText.includes('Jan 2026')"));
  assert.ok(await cdp.eval("!document.body.innerText.includes('AI Concepts Atlas')"));
  assert.ok(await cdp.eval("!!document.querySelector('a[href^=\\\"mailto:\\\"]')"));
  assert.ok(await cdp.eval("document.querySelector('.submit-mail')?.textContent?.includes('Compose email')"));
  console.log("Desktop renderer and content:",JSON.stringify(desktop));
  await cdp.screenshot("hero-desktop.png");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"sealed",
    "portfolio starts in its complete professional form");
  assert.ok(await cdp.eval("!!document.querySelector('.specimen-discovery')"),"glass specimen is discoverable in the hero");
  assert.ok(await cdp.eval("!document.querySelector('.specimen-dock')"),"no transformation UI clutters first visit");
  await cdp.eval("document.querySelector('.specimen-discovery').click()");
  await poll(()=>cdp.eval("!!document.querySelector('[role=dialog].specimen-inspection')"),"specimen inspection opens");
  assert.ok(await cdp.eval("document.querySelector('.specimen-inspection-copy h2').textContent.includes('Still sealed')"));
  assert.ok(await cdp.eval("document.activeElement.classList.contains('specimen-close')"),"dialog focuses its close control");
  await delay(340);
  await cdp.screenshot("specimen-inspection-desktop.png");
  await cdp.eval("([...document.querySelectorAll('.specimen-inspection button:not(:disabled)')].at(-1)).focus()");
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  assert.ok(await cdp.eval("document.activeElement.classList.contains('specimen-close')"),
    "Tab from last modal action wraps to first action");
  assert.ok(await cdp.eval("!!document.querySelector('.specimen-announce[aria-live=polite]')"),
    "visitor state announcements are available without audio");
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
  await poll(()=>cdp.eval("!document.querySelector('.specimen-inspection')"),"Escape closes inspection");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"sealed");
  await cdp.eval("document.querySelector('.specimen-discovery').click()");
  await cdp.eval("document.querySelector('.specimen-primary').click()");
  await poll(()=>cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState==='awakened'"),
    "unsealing is explicitly opt-in");
  assert.ok(await cdp.eval("!!document.querySelector('.specimen-dock')"),"activated specimen exposes an unobtrusive control");
  assert.ok(await cdp.eval("document.querySelector('.specimen-dock-panel p').textContent.length>8"),
    "character makes a contextual remark");
  await delay(1730);
  assert.ok(await cdp.eval("!document.querySelector('.specimen-apparition')"),"cinematic overlay always completes");
  await cdp.screenshot("specimen-awakened-desktop.png");
  await cdp.eval("window.dispatchEvent(new Event('scroll'))");
  await poll(()=>cdp.eval("!document.querySelector('.specimen-dock-panel')"),
    "expanded companion must retract when the visitor scrolls");
  await cdp.eval("document.querySelector('.specimen-dock-toggle').click()");
  await cdp.eval("document.querySelector('.specimen-dock-links button[aria-label=\"Restore original experience\"]').click()");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"sealed",
    "restoration must reverse the transformation without a reload");
  assert.ok(await cdp.eval("!document.querySelector('.specimen-dock')"),"restoration removes the controls");


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
  const initial=await cdp.eval("({selected:document.querySelector('.gallery-row[aria-selected=true] strong')?.textContent,poster:document.querySelector('.poster-canvas')?.className,tabs:document.querySelectorAll('.gallery-buttons [role=tab]').length})");
  assert.equal(initial.selected,"Blackout Protocol");
  assert.equal(initial.tabs,6);
  assert.ok(await cdp.eval("!!document.querySelector('.gallery-world .gallery-scene-3d')"),"3D project stage should be embedded");
  assert.equal(await cdp.eval("document.querySelectorAll('.gallery-depth-sheet').length"),2,"two offset poster layers exist");
  await cdp.eval("(()=>{const e=document.querySelector('.gallery-world'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',bubbles:true,clientX:r.x+r.width*.6,clientY:r.y+r.height*.4}));return true})()");
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
  assert.equal(await cdp.eval("document.querySelectorAll('.reactor-rail [role=tab]').length"),4,"reactor must expose four technology disciplines");
  assert.equal(await cdp.eval("document.querySelectorAll('.reactor-node').length"),7,"initial reactor shows all seven real frontend technologies");
  await cdp.eval("document.querySelectorAll('.reactor-rail [role=tab]')[1].click()");
  assert.ok(await cdp.eval("document.querySelector('.reactor-top').textContent.includes('BACKEND')"),"reactor switches technology layers");
  assert.ok(await cdp.eval("Array.from(document.querySelectorAll('.reactor-node')).some(n=>n.textContent.includes('FastAPI'))"),"backend tool nodes update");
  await cdp.eval("document.querySelectorAll('.reactor-node')[1].click()");
  assert.ok(await cdp.eval("document.querySelector('.reactor-bottom strong').textContent.includes('FastAPI')"),"focus changes the selected tool readout");
  const reactorTypography=await cdp.eval("({family:getComputedStyle(document.querySelector('.reactor-rail-label')).fontFamily,body:getComputedStyle(document.querySelector('.play-header p')).fontFamily,node:getComputedStyle(document.querySelector('.reactor-node strong')).fontSize})");
  assert.ok(reactorTypography.family.includes('Bricolage Grotesque'),"display typography must be consistent");
  assert.ok(reactorTypography.body.includes('Manrope'),"body typography must be consistent");
  assert.ok(parseFloat(reactorTypography.node)>=14,"technology labels must be readable");
  await cdp.screenshot("skills-desktop.png");
  await cdp.eval("document.querySelector('.stack-reactor').scrollIntoView({behavior:'instant'})");
  await delay(1250);
  await cdp.screenshot("orbit-desktop.png");
  assert.ok(await cdp.eval("!!document.querySelector('#incident')"),"Interactive engineering case study must exist");
  await cdp.eval("document.querySelector('#incident').scrollIntoView({behavior:'instant'})");
  await delay(350);
  await cdp.screenshot("incident-detect-desktop.png");
  await poll(()=>cdp.eval("!!document.querySelector('.incident-phase-tabs [data-step=investigate]')"),
    "deferred incident module mounts near the viewport");
  await cdp.eval("document.querySelector('.incident-phase-tabs [data-step=investigate]').click()");
  assert.ok(await cdp.eval("!!document.querySelector('.incident-log')"),"investigation reveals telemetry");
  await cdp.eval("document.querySelectorAll('.incident-evidence-tabs button')[2].click()");
  assert.ok(await cdp.eval("document.querySelector('.incident-log').textContent.includes('DB_POOL_MAX')"),"deployment evidence is inspectable");
  await cdp.eval("document.querySelector('.incident-phase-tabs [data-step=remediate]').click()");
  await cdp.eval("document.querySelectorAll('.incident-remedies button')[0].click()");
  assert.ok(await cdp.eval("document.querySelector('.incident-verdict')?.textContent.includes('Wrong first move')"),"wrong remediation explains its consequences");
  await cdp.eval("document.querySelectorAll('.incident-remedies button')[2].click()");
  assert.ok(await cdp.eval("document.querySelector('.incident-verdict.correct')?.textContent.includes('Correct')"),"rollback is the verified mitigation");
  await cdp.eval("document.querySelector('.incident-primary').click()");
  assert.ok(await cdp.eval("!!document.querySelector('.incident-recovery')"),"recovery verification follows rollback");
  await cdp.screenshot("incident-recovery-desktop.png");

  assert.ok(await cdp.eval("!!document.querySelector('.root-discovery')"),"the secret terminal has an accessible discovery point");
  await cdp.eval("document.querySelector('.root-discovery').click()");
  await poll(()=>cdp.eval("!!document.querySelector('[role=dialog].root-terminal')"),"ROOT ACCESS opens");
  await cdp.eval("document.querySelector('#root-command').focus()");
  await cdp.send("Input.insertText",{text:"theme --chaos"});
  await delay(100);
  await cdp.eval("document.querySelector('.root-terminal-prompt').requestSubmit()");
  await poll(()=>cdp.eval("document.querySelector('.exhibition-site')?.classList.contains('root-chaos')"),"chaos mode applies only to the local site");
  await cdp.send("Input.insertText",{text:"restore"});
  await delay(100);
  await cdp.eval("document.querySelector('.root-terminal-prompt').requestSubmit()");
  await poll(()=>cdp.eval("!document.querySelector('.exhibition-site')?.classList.contains('root-chaos')"),"restore reverses all effects");
  await cdp.screenshot("root-access-desktop.png");
  await cdp.eval("document.querySelector('.root-terminal-close').click()");
  assert.ok(await cdp.eval("!document.querySelector('.root-terminal')"),"terminal closes without navigating");
  // Awakening now reveals source-backed notes rather than a purely cosmetic mode.
  assert.equal(await cdp.eval("!!document.querySelector('.signal-dossier')"),false,
    "normal portfolio never hides essential content behind an extra discovery widget");
  await cdp.eval("document.querySelector('.specimen-discovery').click()");
  await cdp.eval("document.querySelector('.specimen-primary').click()");
  await poll(()=>cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState==='awakened'"),
    "awakened signal trail activates");
  await delay(1740);
  await cdp.eval("document.querySelector('#work').scrollIntoView({behavior:'instant'})");
  await cdp.eval("document.querySelector('.signal-dossier-trigger').click()");
  assert.ok(await cdp.eval("document.querySelector('.signal-dossier-body').textContent.includes('DESIGN QUESTION')"),
    "archive note contains a project-specific technical question");
  assert.ok(await cdp.eval("document.querySelector('.signal-dossier-body a').href.includes('github.com')"),
    "archive notes link to actual repository code");
  await cdp.eval("document.querySelector('.signal-dossier-body').scrollIntoView({behavior:'instant',block:'center'})");
  await delay(220);
  await cdp.screenshot("signal-archive-desktop.png");
  await cdp.eval("document.querySelector('#incident').scrollIntoView({behavior:'instant'})");
  await cdp.eval("document.querySelector('.incident-phase-tabs [data-step=investigate]').click()");
  await cdp.eval("document.querySelector('.signal-lab-trigger').click()");
  assert.ok(await cdp.eval("document.querySelector('.signal-lab-analysis').textContent.includes('93.1%')"),
    "Lab note explains trace latency attribution");
  await cdp.eval("document.querySelector('.signal-lab-analysis').scrollIntoView({behavior:'instant',block:'center'})");
  await delay(220);
  await cdp.screenshot("signal-lab-desktop.png");
  await cdp.eval("document.querySelector('#final-boss').scrollIntoView({behavior:'instant'})");
  await cdp.eval("document.querySelector('.signal-arcade-trigger').click()");
  assert.ok(await cdp.eval("document.querySelector('.signal-arcade-manual').textContent.includes('520 ms')"),
    "arcade note documents deterministic fixed ticks");
  assert.ok(await cdp.eval("document.querySelector('.signal-arcade-manual').textContent.includes('not WebSocket')"),
    "game documentation accurately identifies synchronization model");
  assert.equal(await cdp.eval("JSON.parse(sessionStorage.getItem('cd-signal-trail')).length"),3,
    "all three distinct discoveries persist locally");
  assert.ok(await cdp.eval("!!document.querySelector('#consistency')"),
    "recovering all three notes unlocks the optional concurrency experiment");
  await cdp.eval("document.querySelector('#consistency').scrollIntoView({behavior:'instant'})");
  await poll(()=>cdp.eval("!!document.querySelector('.consistency-experiment')"),
    "consistency experiment lazily loads when opened");
  assert.ok(await cdp.eval("document.querySelector('.consistency-trace').textContent.includes('v12')"),
    "the fixture begins on a shared version");
  await cdp.eval("document.querySelector('.consistency-run').click()");
  assert.ok(await cdp.eval("document.querySelector('.consistency-verdict.negative')?.textContent.includes('409')"),
    "the stale write fails instead of overwriting the winning action");
  await cdp.eval("document.querySelector('.consistency-run').click()");
  assert.ok(await cdp.eval("document.querySelector('.consistency-verdict.positive')?.textContent.includes('v14')"),
    "a refreshed retry preserves both independent actions");
  await cdp.eval("document.querySelectorAll('.consistency-choice button')[1].click()");
  await cdp.eval("document.querySelector('.consistency-run').click()");
  assert.ok(await cdp.eval("document.querySelector('.consistency-event-stream').textContent.includes('EGRESS writes')"),
    "the visitor can reverse the order of concurrent writers");
  await cdp.screenshot("consistency-experiment-desktop.png");

  await cdp.eval("document.querySelector('.signal-arcade-manual').scrollIntoView({behavior:'instant',block:'center'})");
  await delay(220);
  await cdp.screenshot("signal-arcade-desktop.png");
  await cdp.eval("document.querySelector('.root-discovery').click()");
  await cdp.eval("document.querySelector('#root-command').focus()");
  await cdp.send("Input.insertText",{text:"signals"});
  await cdp.eval("document.querySelector('.root-terminal-prompt').requestSubmit()");
  assert.ok(await cdp.eval("document.querySelector('.root-terminal-history').textContent.includes('3/3 RECOVERED')"),
    "terminal reconstructs only collected evidence");
  await cdp.send("Input.insertText",{text:"cat /signals/report"});
  await cdp.eval("document.querySelector('.root-terminal-prompt').requestSubmit()");
  assert.ok(await cdp.eval("document.querySelector('.root-terminal-history').textContent.includes('Explicit state ownership')"),
    "terminal provides a coherent technical conclusion, not a joke-only unlock");
  assert.ok(await cdp.eval("document.querySelector('.root-terminal-unlock')?.getAttribute('href')==='#consistency'"),
    "recovered terminal index links to the working experiment");
  await cdp.screenshot("signal-index-desktop.png");
  await cdp.send("Input.insertText",{text:"theme --chaos"});
  await cdp.eval("document.querySelector('.root-terminal-prompt').requestSubmit()");
  assert.ok(await cdp.eval("document.querySelector('.exhibition-site').classList.contains('root-chaos') && document.querySelector('.exhibition-site').classList.contains('specimen-awakened')"),
    "ROOT effects and specimen state coexist without DOM mutation conflicts");
  await cdp.send("Input.insertText",{text:"signals --reset"});
  await cdp.eval("document.querySelector('.root-terminal-prompt').requestSubmit()");
  await poll(()=>cdp.eval("JSON.parse(sessionStorage.getItem('cd-signal-trail')).length===0"),
    "notes are explicitly reset without affecting the portfolio");
  assert.ok(await cdp.eval("!document.querySelector('#consistency')"),
    "reset removes only the optional experiment, not the rest of the portfolio");
  await cdp.eval("document.querySelector('.root-terminal-close').click()");
  await cdp.eval("if(!document.querySelector('.specimen-dock-panel'))document.querySelector('.specimen-dock-toggle').click()");
  await cdp.eval("document.querySelector('.specimen-dock-links button[aria-label=\\\"Restore original experience\\\"]').click()");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"sealed",
    "restoration works after the complete discovery circuit");
  assert.ok(await cdp.eval("document.querySelector('.exhibition-site').classList.contains('root-chaos')"),
    "restoring specimen must not silently erase an independent ROOT ACCESS effect");
  await cdp.eval("document.querySelector('.root-discovery').click()");
  await cdp.eval("document.querySelector('#root-command').focus()");
  await cdp.send("Input.insertText",{text:"restore"});
  await cdp.eval("document.querySelector('.root-terminal-prompt').requestSubmit()");
  assert.ok(await cdp.eval("!document.querySelector('.exhibition-site').classList.contains('root-chaos')"),
    "ROOT ACCESS restore reverses only the remaining fictional terminal visual mode");
  await cdp.eval("document.querySelector('.root-terminal-close').click()");

  await cdp.eval("document.querySelector('#play').scrollIntoView({behavior:'instant'})");
  await poll(()=>cdp.eval("!!document.querySelector('.flux-canvas')"),"Signal Shift loaded near viewport");
  await cdp.eval("document.querySelector('#final-boss').scrollIntoView({behavior:'instant'})");
  await poll(()=>cdp.eval("!!document.querySelector('.packet-board')"),"Packet Panic loaded near viewport");
  await cdp.eval("document.querySelector('#play').scrollIntoView({behavior:'instant'})");
  await delay(350);
  assert.ok(await cdp.eval("!!document.querySelector('.flux-canvas') && !!document.querySelector('.packet-board')"),"both lazy-loaded arcade games present");
  assert.equal(await cdp.eval("document.querySelectorAll('.packet-node').length"),35);
  assert.ok(await cdp.eval("!!document.querySelector('.packet-daily-button')"),"daily challenge is discoverable without an account");
  assert.equal(await cdp.eval("document.querySelectorAll('.duel-hex').length"),0,"retire Hex from page");
  const desktopFlux=await cdp.eval("(()=>{const stage=document.querySelector('.flux-stage').getBoundingClientRect();const content=document.querySelector('.flux-overlay-content').getBoundingClientRect();const title=document.querySelector('.flux-overlay h3');return {offset:Math.abs((stage.left+stage.width/2)-(content.left+content.width/2)),titleFont:parseFloat(getComputedStyle(title).fontSize),fit:getComputedStyle(document.querySelector('.flux-canvas')).objectFit}})()");
  assert.ok(desktopFlux.offset<4,"Signal Shift center aligned "+JSON.stringify(desktopFlux));
  assert.ok(desktopFlux.titleFont>=45,"hero title must be prominent "+JSON.stringify(desktopFlux));
  assert.ok(await cdp.eval("getComputedStyle(document.querySelector('.packet-arena')).backgroundImage.includes('gradient')"),"Packet Panic arena is fully art-directed");
  assert.equal(desktopFlux.fit,"contain","entire playable arena must remain in view");
  await cdp.eval("document.querySelector('.flux-stage').scrollIntoView({behavior:'instant',block:'center'})");
  await delay(180);
  await cdp.screenshot("arcade-intro-desktop.png");
  await cdp.eval("document.querySelector('.flux-play').click()");
  await delay(240);
  assert.ok(await cdp.eval("document.querySelector('.flux-overlay')===null"),"arcade starts");
  await cdp.screenshot("arcade-running-desktop.png");
  await cdp.eval("document.querySelector('.flux-actions button:first-child').click()");
  assert.ok(await cdp.eval("document.querySelector('.flux-overlay').textContent.includes('PAUSED')"),"arcade pauses");
  await cdp.eval("document.querySelector('.flux-actions button:last-child').click()");
  await cdp.eval("document.querySelector('.packet-arena').scrollIntoView({behavior:'instant'})");
  await delay(270);
  await cdp.screenshot("packet-intro-desktop.png");
  assert.equal(await cdp.eval("document.querySelector('.packet-experience').dataset.phase"),"ready");
  await cdp.eval("document.querySelector('.packet-experience .packet-start').click()");
  await poll(()=>cdp.eval("document.querySelector('.packet-experience').dataset.phase==='playing'"),"Packet Panic solo game starts");
  const beforeRouter=await cdp.eval("document.querySelector('.packet-node[data-node=\"8\"] .packet-wires').style.transform");
  await cdp.eval("document.querySelector('.packet-node[data-node=\"8\"]').click()");
  const afterRouter=await cdp.eval("document.querySelector('.packet-node[data-node=\"8\"] .packet-wires').style.transform");
  assert.notEqual(beforeRouter,afterRouter,"players rotate routers with one click");
  await delay(750);
  await poll(()=>cdp.eval("Number(document.querySelector('.packet-experience .packet-time')?.textContent.split(':').join('')) < 130"),"Packet Panic 90s timer must visibly count down",5000);
  await cdp.screenshot("packet-running-desktop.png");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/play/packet"});
  await poll(()=>cdp.eval("!!document.querySelector('.packet-fullpage')"),"Packet Panic standalone route");
  assert.equal(await cdp.eval("document.querySelectorAll('.packet-node').length"),35);
  await cdp.screenshot("packet-standalone-desktop.png");
  await assertMinimumTextSize(cdp,"standalone packet desktop");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/#incident"});
  await poll(()=>cdp.eval("!!document.querySelector('#incident')"),"deferred lab deep-link anchor exists before chunk");
  await poll(()=>cdp.eval("(()=>{const root=document.querySelector('#incident');if(!root||!document.querySelector('.incident-replay'))return false;const target=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;return Math.abs(root.getBoundingClientRect().top-target)<=16;})()"),
    "initial hash navigation opens the lazy-loaded Lab at the intended sticky-header offset");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/"});
  await poll(()=>cdp.eval("!!document.querySelector('#top')"),"exhibition after deep-link route");

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
  const mobileHeroFrame=await cdp.eval("(()=>{const hero=document.querySelector('.exhibition-hero').getBoundingClientRect(),canvas=document.querySelector('.code-monument-canvas').getBoundingClientRect();return {heroLeft:hero.left,heroRight:hero.right,canvasLeft:canvas.left,canvasRight:canvas.right,width:document.documentElement.clientWidth,scale:Number(document.querySelector('.code-monument-canvas').dataset.fitScale)}})()");
  assert.ok(Math.abs(mobileHeroFrame.canvasLeft-mobileHeroFrame.heroLeft)<=1 && Math.abs(mobileHeroFrame.canvasRight-mobileHeroFrame.heroRight)<=1,
    "3D monogram must occupy the full mobile hero width: "+JSON.stringify(mobileHeroFrame));
  if(desktop.renderer==="webgl") assert.ok(mobileHeroFrame.scale>0 && mobileHeroFrame.scale<=1.38,"Mobile scale must fit viewport");
  const mobileGames=await cdp.eval("(()=>{const a=document.querySelector('[data-experience=arcade]').getBoundingClientRect(),b=document.querySelector('[data-experience=packet]').getBoundingClientRect();return {aLeft:a.left,aRight:a.right,bLeft:b.left,bRight:b.right,width:document.documentElement.clientWidth}})()");
  assert.ok(mobileGames.aLeft<=2 && mobileGames.aRight>=mobileGames.width-2,"arcade fills mobile width");
  assert.ok(mobileGames.bLeft<=2 && mobileGames.bRight>=mobileGames.width-2,"Packet Panic fills mobile width");
  await assertMinimumTextSize(cdp,"390px mobile");
  await cdp.screenshot("hero-mobile.png");
  await cdp.eval("document.querySelector('.specimen-discovery').click()");
  await poll(()=>cdp.eval("!!document.querySelector('.specimen-inspection')"),"specimen inspection on phone");
  const vialMobile=await cdp.eval("(()=>{const r=document.querySelector('.specimen-inspection').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,height:innerHeight,page:document.documentElement.scrollWidth}})()");
  assert.ok(vialMobile.left>=-1&&vialMobile.right<=vialMobile.width+1,
    "vial inspection fits mobile width "+JSON.stringify(vialMobile));
  assert.ok(vialMobile.bottom<=vialMobile.height+2,"inspection fits 390px phone height "+JSON.stringify(vialMobile));
  await delay(340);
  await cdp.screenshot("specimen-inspection-mobile.png");
  await cdp.eval("document.querySelector('.specimen-primary').click()");
  await poll(()=>cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState==='awakened'"),
    "phone activation is responsive");
  await delay(1680);
  await cdp.screenshot("specimen-awakened-mobile.png");
  await cdp.eval("document.querySelector('.signal-dossier-trigger').click()");
  assert.ok(await cdp.eval("!!document.querySelector('.signal-dossier-body')"),
    "awakened project notes work on touch-sized displays");
  assert.ok(await cdp.eval("document.documentElement.scrollWidth<=innerWidth+3"),
    "engineering dossier cannot cause horizontal overflow on 390px phone");
  await cdp.eval("document.querySelector('.signal-dossier-body').scrollIntoView({behavior:'instant',block:'center'})");
  await delay(260);
  await cdp.screenshot("signal-archive-mobile.png");

  assert.ok(await cdp.eval("document.documentElement.scrollWidth<=innerWidth+3"),
    "activated mode cannot create horizontal overflow");
  await cdp.eval("if(!document.querySelector('.specimen-dock-panel'))document.querySelector('.specimen-dock-toggle').click()");
  await poll(()=>cdp.eval("!!document.querySelector('.specimen-dock-links button[aria-label=\\\"Restore original experience\\\"]')"),
    "visitor can reopen the collapsed companion after scrolling the note");
  await cdp.eval("document.querySelector('.specimen-dock-links button[aria-label=\"Restore original experience\"]').click()");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"sealed");

  await cdp.eval("document.querySelector('.mobile-nav-toggle').click()");
  assert.ok(await cdp.eval("document.querySelector('.nav-items').classList.contains('nav-items-open')"));
  await cdp.eval("document.querySelector('.nav-items a').click()");
  assert.equal(await cdp.eval("document.querySelector('.nav-items').classList.contains('nav-items-open')"),false);
  await cdp.eval("document.querySelector('#work').scrollIntoView({behavior:'instant'})");
  await delay(450);
  await cdp.screenshot("gallery-mobile.png");
  await cdp.eval("document.querySelector('.stack-reactor').scrollIntoView({behavior:'instant'})");
  await delay(310);
  await cdp.screenshot("orbit-mobile.png");
  const mobileReactor=await cdp.eval("(()=>{const view=document.querySelector('.reactor-view').getBoundingClientRect();const nodes=[...document.querySelectorAll('.reactor-node')].map(n=>n.getBoundingClientRect());return {viewLeft:view.left,viewRight:view.right,min:Math.min(...nodes.map(n=>n.left)),max:Math.max(...nodes.map(n=>n.right)),count:nodes.length}})()");
  assert.ok(mobileReactor.min>=mobileReactor.viewLeft-9 && mobileReactor.max<=mobileReactor.viewRight+9,"reactor nodes fit phone: "+JSON.stringify(mobileReactor));
  await cdp.eval("document.querySelector('.team-section').scrollIntoView({behavior:'instant'})");
  await delay(380);
  await cdp.screenshot("team-mobile.png");
  await cdp.eval("document.querySelector('#contact').scrollIntoView({behavior:'instant'})");
  await delay(380);
  await cdp.screenshot("contact-mobile.png");
  await cdp.eval("document.querySelector('#incident').scrollIntoView({behavior:'instant'})");
  await delay(330);
  await cdp.screenshot("incident-mobile.png");
  const incidentMobile=await cdp.eval("(()=>{const a=document.querySelector('.incident-workbench').getBoundingClientRect();return {left:a.left,right:a.right,width:innerWidth,scroll:document.documentElement.scrollWidth}})()");
  assert.ok(incidentMobile.scroll<=incidentMobile.width+3,"incident workbench must not create horizontal overflow "+JSON.stringify(incidentMobile));
  await cdp.eval("document.querySelector('.root-discovery').click()");
  await poll(()=>cdp.eval("!!document.querySelector('.root-terminal')"),"mobile ROOT ACCESS opens");
  const rootMobile=await cdp.eval("(()=>{const r=document.querySelector('.root-terminal').getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth}})()");
  assert.ok(rootMobile.left>=-1 && rootMobile.right<=rootMobile.width+1,"mobile terminal fits viewport "+JSON.stringify(rootMobile));
  await delay(260);
  assert.equal(await cdp.eval("getComputedStyle(document.querySelector('.root-terminal')).backgroundColor"),"rgb(8, 20, 30)","terminal must be opaque on mobile");
  await cdp.screenshot("root-access-mobile.png");
  await cdp.eval("document.querySelector('.root-terminal-close').click()");

  await cdp.eval("document.querySelector('#play').scrollIntoView({behavior:'instant'})");
  await delay(380);
  const mobileFlux=await cdp.eval("(()=>{const stage=document.querySelector('.flux-stage').getBoundingClientRect(),content=document.querySelector('.flux-overlay-content').getBoundingClientRect(),title=document.querySelector('.flux-overlay h3').getBoundingClientRect();return {offsetX:Math.abs((stage.left+stage.width/2)-(title.left+title.width/2)),offsetY:Math.abs((stage.top+stage.height/2)-(content.top+content.height/2)),titleWidth:title.width,stageWidth:stage.width,fit:getComputedStyle(document.querySelector('.flux-canvas')).objectFit}})()");
  assert.ok(mobileFlux.offsetX<4 && mobileFlux.offsetY<12,"mobile Signal Shift composition is centered "+JSON.stringify(mobileFlux));
  assert.ok(mobileFlux.titleWidth<mobileFlux.stageWidth-12,"mobile arcade title remains in frame "+JSON.stringify(mobileFlux));
  assert.equal(mobileFlux.fit,"contain","mobile arena cannot crop hazards");
  await cdp.eval("document.querySelector('.flux-stage').scrollIntoView({behavior:'instant',block:'center'})");
  await delay(160);
  await cdp.screenshot("arcade-mobile.png");
  await cdp.eval("document.querySelector('.flux-play')?.click()");
  await delay(460);
  await cdp.screenshot("arcade-running-mobile.png");
  await cdp.eval("document.querySelector('.packet-arena').scrollIntoView({behavior:'instant'})");
  await delay(350);
  await cdp.screenshot("packet-mobile.png");
  const gameMobile=await cdp.eval("({body:document.documentElement.scrollWidth,width:innerWidth,board:document.querySelector('.packet-board').getBoundingClientRect().width})");
  assert.ok(gameMobile.body<=gameMobile.width+3,"games must fit mobile "+JSON.stringify(gameMobile));
  assert.ok(gameMobile.board<=gameMobile.width,"Packet grid fits mobile "+JSON.stringify(gameMobile));
  const nodesVisible=await cdp.eval("(()=>{const arena=document.querySelector('.packet-arena').getBoundingClientRect();const rects=[...document.querySelectorAll('.packet-node')].map(x=>x.getBoundingClientRect());return {min:Math.min(...rects.map(r=>r.left)),max:Math.max(...rects.map(r=>r.right)),arenaLeft:arena.left,arenaRight:arena.right,visible:rects.length}})()");
  assert.equal(nodesVisible.visible,35);
  assert.ok(nodesVisible.min>=nodesVisible.arenaLeft-3 && nodesVisible.max<=nodesVisible.arenaRight+3,
    "All 35 Packet routers must stay inside the mobile arena "+JSON.stringify(nodesVisible));
  await cdp.send("Emulation.setDeviceMetricsOverride",{width:768,height:1024,deviceScaleFactor:1,mobile:true,screenWidth:768,screenHeight:1024});
  await delay(380);
  const tablet=await cdp.eval("({width:innerWidth,scroll:document.documentElement.scrollWidth})");
  assert.ok(tablet.scroll<=tablet.width+3,"768px tablet must avoid overflow "+JSON.stringify(tablet));
  await cdp.screenshot("tablet-layout.png");
  await cdp.send("Emulation.setDeviceMetricsOverride",{width:320,height:700,deviceScaleFactor:1,mobile:true,screenWidth:320,screenHeight:700});
  await delay(330);
  const narrow=await cdp.eval("({width:innerWidth,body:document.documentElement.scrollWidth})");
  assert.ok(narrow.body<=narrow.width+3,"Narrow 320px viewport must not horizontally overflow "+JSON.stringify(narrow));
  const narrowHero=await cdp.eval("(()=>{const h=document.querySelector('.exhibition-hero').getBoundingClientRect(),c=document.querySelector('.code-monument-canvas').getBoundingClientRect();return {left:h.left,right:h.right,canvasLeft:c.left,canvasRight:c.right}})()");
  assert.ok(Math.abs(narrowHero.left-narrowHero.canvasLeft)<=1 && Math.abs(narrowHero.right-narrowHero.canvasRight)<=1,
    "320px viewport must keep the sculpture full-bleed: "+JSON.stringify(narrowHero));
  await assertMinimumTextSize(cdp,"320px mobile");
  const narrowNodes=await cdp.eval("(()=>{const arena=document.querySelector('.packet-arena').getBoundingClientRect();const rs=[...document.querySelectorAll('.packet-node')].map(x=>x.getBoundingClientRect());return {min:Math.min(...rs.map(r=>r.left)),max:Math.max(...rs.map(r=>r.right)),left:arena.left,right:arena.right}})()");
  assert.ok(narrowNodes.min>=narrowNodes.left-3 && narrowNodes.max<=narrowNodes.right+3,
    "All Packet routers must fit a 320px screen "+JSON.stringify(narrowNodes));
  await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await delay(380);
  assert.ok(await cdp.eval("matchMedia('(prefers-reduced-motion: reduce)').matches"),"Reduced-motion preference supported");
  await cdp.eval("document.querySelector('.specimen-discovery').click()");
  await cdp.eval("document.querySelector('.specimen-primary').click()");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"awakened");
  assert.equal(await cdp.eval("!!document.querySelector('.specimen-apparition')"),false,
    "reduced motion must not render the apparition at all");
  await poll(()=>cdp.eval("!!document.querySelector('.specimen-dock')"),
    "compact companion remains available for reset on a narrow phone");
  await cdp.eval("if(!document.querySelector('.specimen-dock-panel'))document.querySelector('.specimen-dock-toggle').click()");
  await poll(()=>cdp.eval("!!document.querySelector('.specimen-dock-panel')"),
    "the companion can always be reopened after dismissal");
  await cdp.eval("document.querySelector('.specimen-dock-links button[aria-label=\"Restore original experience\"]').click()");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"sealed");
  assert.ok(await cdp.eval("document.documentElement.scrollWidth<=innerWidth+3"),
    "no 320px overflow after complete specimen cycle");

  // Synthetic mobile p75 is a regression signal, not a substitute for RUM field p75.
  await cdp.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});
  const mobileLcp=[];
  const mobileCls=[];
  for(let i=0;i<3;i++){
    await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/"});
    await poll(()=>cdp.eval("!!document.querySelector('.specimen-discovery')"),"synthetic mobile sample loaded");
    await delay(950);
    const metrics=await cdp.eval("window.__cdVitals");
    if(typeof metrics?.lcp==="number")mobileLcp.push(metrics.lcp);
    if(typeof metrics?.cls==="number")mobileCls.push(metrics.cls);
  }
  const percentile75=values=>values.length?[...values].sort((a,b)=>a-b)[Math.ceil(values.length*.75)-1]:null;
  const p75Lcp=percentile75(mobileLcp);
  const p75Cls=percentile75(mobileCls);
  console.log("Synthetic mobile sample (3 reloads; not real-user field metrics):",
    JSON.stringify({p75LcpMs:p75Lcp,p75Cls,longTasks:initialPerf.longTasks.length}));
  if(p75Lcp!==null)assert.ok(p75Lcp<4200,"Synthetic mobile p75 LCP should avoid critical regression "+p75Lcp);
  if(p75Cls!==null)assert.ok(p75Cls<.20,"Synthetic mobile p75 CLS should avoid critical regression "+p75Cls);
  // In an environment without speech synthesis, the entire experience remains usable.
  await cdp.send("Page.addScriptToEvaluateOnNewDocument",{source:`
    try{Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});}
    catch{/* speech API cannot be overridden in this browser */}
  `});
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/"});
  await poll(()=>cdp.eval("!!document.querySelector('.specimen-discovery')"),"fresh reduced-motion, speech-free visit");
  await poll(()=>cdp.eval("document.querySelector('.code-monument-canvas')?.dataset.renderer==='fallback'"),
    "reduced-motion loads a static hero without starting WebGL");
  await cdp.eval("document.querySelector('.specimen-discovery').click()");
  await poll(()=>cdp.eval("!!document.querySelector('.specimen-inspection')"),"voice-disabled modal opens normally");
  if(await cdp.eval("!window.speechSynthesis"))assert.ok(await cdp.eval("!document.querySelector('.specimen-voice-option')"),
    "unsupported speech synthesis must not expose a broken voice control");
  await cdp.eval("document.querySelector('.specimen-primary').click()");
  assert.equal(await cdp.eval("document.querySelector('.exhibition-site').dataset.specimenState"),"awakened");
  assert.ok(await cdp.eval("!document.querySelector('.specimen-apparition')"),"reduced motion still suppresses the effect");
  // Newly introduced standalone experience routes: check real browser load and interactions.
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/lab"});
  await poll(()=>cdp.eval("document.querySelectorAll('.universe .uni-card').length===4"),"lab landing cards render");
  assert.ok(await cdp.eval("document.documentElement.scrollWidth<=innerWidth+3"),"lab mobile width fits viewport");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/lab/disaster"});
  await poll(()=>cdp.eval("!!document.querySelector('.iw-action-grid button')"),"incident actions render");
  const initialTick=await cdp.eval("document.querySelector('.iw-statusline')?.textContent");
  await cdp.eval("document.querySelector('.iw-action-grid button').click()");
  await poll(()=>cdp.eval("document.querySelector('.iw-statusline')?.textContent!=="+JSON.stringify(initialTick)),"incident advances after operational command");
  assert.ok(await cdp.eval("document.querySelectorAll('.iw-node').length===6"),"incident topology exposes six selectable services");
  assert.ok(await cdp.eval("!!document.querySelector('#incident-tick')"),"incident includes accessible metric timeline scrubber");
  await cdp.eval("document.querySelectorAll('.iw-evidence-tabs button')[1].click()");
  await poll(()=>cdp.eval("document.querySelector('.iw-log')?.textContent.includes('SIMULATED LOGS')"),"log exploration reflects selected evidence view");
  await cdp.eval("document.querySelector('.iw-report-actions button').click()");
  await poll(()=>cdp.eval("!!document.querySelector('.iw-report-body')"),"incident report expands");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/lab/take-five"});
  await poll(()=>cdp.eval("!!document.querySelector('.uni-panel svg')"),"kinetic experience mounts");
  await cdp.eval("document.querySelectorAll('.uni-container > .uni-controls button')[1].click()");
  await poll(()=>cdp.eval("!!document.querySelector('#entropy-art')"),"garden can be entered");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/engineering"});
  await poll(()=>cdp.eval("document.querySelectorAll('input[type=range]').length===4"),"architecture model is interactive");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/access"});
  await poll(()=>cdp.eval("!!document.querySelector('#archive-command')"),"fictional archive terminal loads");
  await cdp.send("Page.navigate",{url:"http://127.0.0.1:4173/play/packet"});
  await poll(()=>cdp.eval("!!document.querySelector('.packet-daily-button')"),"Packet Panic route loads");
  assert.ok(await cdp.eval("document.body.textContent.includes('SIEGE MODE')"),"Siege mode appears in the game toolbar");
  console.log("Cinema, incident, garden, engineering, archive and Siege smoke checks PASS.");
  console.log("Experience, typed discovery, keyboard focus, static hero, lazy modules, tablet and 320/390px QA PASS.");
  console.log("Visual QA saved to "+out);
}finally{
  if(socket?.readyState===WebSocket.OPEN)socket.close();
  if(browser&&!browser.killed)browser.kill("SIGKILL");
  if(!preview.killed)preview.kill("SIGTERM");
  await delay(250);
  try{rmSync(dir,{recursive:true,force:true,maxRetries:10,retryDelay:150});}
  catch(e){console.warn("Chrome temporary profile cleanup deferred:",e.code||String(e));}
}
