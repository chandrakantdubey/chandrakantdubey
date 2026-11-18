import { useEffect, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import { Pause, Play, RotateCcw, Sparkles, Trash2, Zap } from "lucide-react";
import type { ProjectId } from "./data";

const palettes = [
  ["#d9ff76", "#77d9ff", "#8b6dff", "#0a1232"],
  ["#ff936e", "#ffca72", "#e06af2", "#2c163d"],
  ["#8cf5d0", "#60b9ea", "#7e85ff", "#081d30"],
  ["#ff88aa", "#8a78ff", "#ffd67c", "#291332"],
];

function StudioDemo() {
  const [seed, setSeed] = useState(0);
  const [mode, setMode] = useState<"WAVES" | "ORBIT" | "GRID">("WAVES");
  const colors = palettes[seed % palettes.length];
  const curves = Array.from({length: 9}, (_, i) => {
    const y = 80 + i * 27;
    const amplitude = 32 + ((i * 11 + seed * 13) % 42);
    const phase = seed * 18 + i * 17;
    return "M -30 "+y+" C 125 "+(y-amplitude+phase%30)+", 220 "+(y+amplitude)+", 360 "+y+" S 540 "+(y-amplitude)+", 670 "+(y+5);
  });
  return <div className="demo-stage studio-demo">
    <div className="demo-chrome"><span>STYLESCAPE / PATTERN GENERATOR</span><span>SVG / {String(seed+1).padStart(3,"0")}</span></div>
    <div className="studio-art" style={{background:colors[3]}}>
      <svg viewBox="0 0 600 350" aria-label={"Generated "+mode.toLowerCase()+" illustration"} role="img" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="studio-glow"><stop stopColor={colors[0]} stopOpacity=".5"/><stop offset="1" stopColor={colors[2]} stopOpacity="0"/></radialGradient>
          <linearGradient id="studio-line" x1="0" y1="0" x2="1" y2="1"><stop stopColor={colors[0]}/><stop offset=".52" stopColor={colors[1]}/><stop offset="1" stopColor={colors[2]}/></linearGradient>
        </defs>
        <circle cx="350" cy="160" r="260" fill="url(#studio-glow)"/>
        {mode==="WAVES" && curves.map((d,i)=><path key={i} d={d} fill="none" stroke="url(#studio-line)" opacity={.35+i*.067} strokeWidth={1.3+i*.34}/>)}
        {mode==="ORBIT" && Array.from({length:12},(_,i)=><ellipse key={i} cx="300" cy="175" rx={65+i*17} ry={25+i*12} fill="none" stroke="url(#studio-line)" strokeWidth="2" opacity={.23+i*.058} transform={"rotate("+((i*19+seed*21)%180)+" 300 175)"}/>)}
        {mode==="GRID" && Array.from({length:14},(_,i)=><g key={i} transform={"translate("+(20+i*43)+" 0) rotate("+((seed%3)*5)+" 300 175)"}><path d={"M0 0 V350 M-600 "+(i*26)+" H600"} fill="none" stroke="url(#studio-line)" strokeWidth={1.6+(i%3)} opacity={.26+i*.045}/><circle cx="0" cy={40+(i*79)%290} r={6+i*2} fill={colors[i%3]} opacity=".6"/></g>)}
      </svg>
      <div className="studio-art-label"><span>GENERATIVE / {mode}</span><span>SEED {String(seed+1).padStart(4,"0")}</span></div>
    </div>
    <div className="demo-controls"><div className="mode-switch" role="group" aria-label="Pattern type">{(["WAVES","ORBIT","GRID"] as const).map(m=><button key={m} aria-pressed={mode===m} type="button" onClick={()=>setMode(m)}>{m}</button>)}</div><button className="demo-primary" type="button" onClick={()=>setSeed(x=>x+1)}><Sparkles size={15}/> REGENERATE</button></div>
  </div>;
}

type BattleState = { hero: number; enemy: number; turn: number; log: string };
const startBattle: BattleState = {hero:100,enemy:100,turn:0,log:"A wild rival approaches. Choose your move."};
function BattleDemo() {
  const [battle, setBattle] = useState<BattleState>(startBattle);
  const play=(guard:boolean)=>setBattle(current=>{
    if(current.enemy<=0||current.hero<=0)return current;
    const nextTurn=current.turn+1;
    const dealt=guard?6:[21,16,27,18][current.turn%4];
    const enemy=Math.max(0,current.enemy-dealt);
    const incoming=enemy===0?0:(guard?4:[9,13,7,11][current.turn%4]);
    const hero=Math.max(0,current.hero-incoming);
    return {hero,enemy,turn:nextTurn,log:enemy===0?"VICTORY! Rival defeated.":hero===0?"OUT OF ENERGY — restart to play again.":guard?"You guarded. Countered for "+dealt+" damage.":"Hit for "+dealt+". Rival countered for "+incoming+"."};
  });
  const done=battle.enemy===0||battle.hero===0;
  return <div className="demo-stage battle-demo">
    <div className="demo-chrome"><span>POKÉDEX RPG / MICRO ENCOUNTER</span><span>TURN {String(battle.turn+1).padStart(2,"0")}</span></div>
    <div className="battle-arena">
      <div className="battle-hud enemy-hud"><div><span>RIVAL</span><strong>WILD NODE</strong></div><div className="hp-bar"><i style={{width:battle.enemy+"%"}}/></div><span>{battle.enemy} HP</span></div>
      <div className={"battle-monster "+(battle.enemy<=0?"monster-down":"")} key={battle.turn} aria-label="Stylized rival creature"><span className="monster-ear ear-left"/><span className="monster-ear ear-right"/><span className="monster-body"><i/><i/><b/></span><span className="monster-shadow"/></div>
      <div className="battle-ground"/>
      <div className="battle-hud hero-hud"><div><span>YOU</span><strong>PLAYER 01</strong></div><div className="hp-bar hero-hp"><i style={{width:battle.hero+"%"}}/></div><span>{battle.hero} HP</span></div>
    </div>
    <div className="battle-dialogue" aria-live="polite">{battle.log}</div>
    <div className="demo-controls battle-controls"><button type="button" disabled={done} className="demo-primary" onClick={()=>play(false)}><Zap size={15}/> ATTACK</button><button type="button" className="demo-outline" disabled={done} onClick={()=>play(true)}>GUARD</button><button type="button" className="demo-quiet" onClick={()=>setBattle(startBattle)}><RotateCcw size={14}/> RESTART</button></div>
  </div>;
}

function RunDemo() {
  const [distance, setDistance] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(()=>{
    if(!running || distance>=100)return;
    const timer=setInterval(()=>setDistance(v=>Math.min(100,v+2)),180);
    return ()=>clearInterval(timer);
  },[running,distance]);
  const complete=distance>=100;
  const km=(distance*.042).toFixed(2);
  const elapsed=Math.floor(distance*.6);
  return <div className="demo-stage run-demo">
    <div className="demo-chrome"><span>FITSTREAM / ROUTE PREVIEW</span><span>SIMULATED ACTIVITY</span></div>
    <div className="run-map">
      <div className="run-grid"/>
      <svg viewBox="0 0 600 340" role="img" aria-label={"Illustrative running route with "+distance+" percent progress"} preserveAspectRatio="xMidYMid meet">
        <path className="route-street" d="M0 60 H600 M0 180 H600 M0 290 H600 M95 0 V340 M270 0 V340 M450 0 V340"/>
        <path d="M85 275 L105 202 L189 222 L260 163 L350 205 L418 115 L505 81" className="route-base" fill="none"/>
        <path d="M85 275 L105 202 L189 222 L260 163 L350 205 L418 115 L505 81" className="route-active" style={{strokeDasharray:"100",strokeDashoffset:100-distance}} fill="none" pathLength="100"/>
        <circle cx="85" cy="275" r="9" className="route-start"/><circle cx="505" cy="81" r="12" fill="none" stroke="#d6fc84" strokeWidth="2"/>
        <circle cx="85" cy="275" r="4" fill="#10191c"/>
      </svg>
      <div className="run-location"><span className="live-pip"/> ROUTE 004 / DEMO</div>
    </div>
    <div className="run-stats"><div><span>DISTANCE</span><strong>{km} <small>KM</small></strong></div><div><span>ELAPSED</span><strong>{String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}</strong></div><div><span>ROUTE</span><strong>{distance}<small>%</small></strong></div></div>
    <div className="demo-controls"><div className="demo-caption">{complete?"ROUTE COMPLETE":running?"ACTIVITY IN PROGRESS":"PRESS START TO PREVIEW THE ROUTE"}</div><button type="button" className="demo-primary" onClick={()=>{if(complete){setDistance(0);setRunning(true);}else setRunning(!running)}}>{complete?<RotateCcw size={15}/>:running?<Pause size={15}/>:<Play size={15}/>} {complete?"REPLAY":running?"PAUSE":"START"}</button></div>
  </div>;
}

type Stroke = { color: string; points: string };
const drawColors=["#d9ff76","#a29dff","#ff997c","#e7f5fb"];
function SketchDemo() {
  const [strokes,setStrokes]=useState<Stroke[]>([]);
  const [pen,setPen]=useState(drawColors[0]);
  const drawing=useRef(false);
  const coordinate=(event:PointerEvent<SVGSVGElement>)=>{
    const rect=event.currentTarget.getBoundingClientRect();
    const x=Math.min(500,Math.max(0,(event.clientX-rect.left)/rect.width*500));
    const y=Math.min(300,Math.max(0,(event.clientY-rect.top)/rect.height*300));
    return x.toFixed(1)+","+y.toFixed(1);
  };
  const down=(e:PointerEvent<SVGSVGElement>)=>{
    if(e.pointerType==="mouse"&&e.button!==0)return;
    drawing.current=true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setStrokes(prev=>[...prev.slice(-69),{color:pen,points:coordinate(e)}]);
  };
  const move=(e:PointerEvent<SVGSVGElement>)=>{
    if(!drawing.current)return;
    const point=coordinate(e);
    setStrokes(prev=>{
      const last=prev[prev.length-1];
      if(!last)return prev;
      const points=last.points.split(" ");
      if(points.length>=700||points[points.length-1]===point)return prev;
      return [...prev.slice(0,-1),{...last,points:last.points+" "+point}];
    });
  };
  const up=(e:PointerEvent<SVGSVGElement>)=>{
    drawing.current=false;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return <div className="demo-stage sketch-demo">
    <div className="demo-chrome"><span>MH15 / DRAWING SURFACE</span><span>LOCAL / NO SAVE</span></div>
    <div className="sketch-pad">
      <svg viewBox="0 0 500 300" preserveAspectRatio="none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="img" aria-label="Interactive drawing surface. Use a mouse, stylus or touch to sketch.">
        <defs><pattern id="sketch-dot-grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#b1c6a6" opacity=".25"/></pattern></defs>
        <rect width="500" height="300" fill="url(#sketch-dot-grid)"/>
        {strokes.map((stroke,i)=><polyline key={i} points={stroke.points} fill="none" stroke={stroke.color} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round"/> )}
        {!strokes.length&&<g pointerEvents="none" fill="#a4b29e"><text x="250" y="143" textAnchor="middle" fontSize="17" fontFamily="monospace">YOUR CANVAS</text><text x="250" y="167" textAnchor="middle" fontSize="11" fontFamily="monospace">DRAW WITH MOUSE · TOUCH · PEN</text></g>}
      </svg>
      <div className="sketch-page-number">PAGE 01 / UNTITLED</div>
    </div>
    <div className="demo-controls"><div className="pen-colors" role="group" aria-label="Pen color">{drawColors.map(c=><button key={c} type="button" aria-label={"Select pen color "+c} aria-pressed={pen===c} style={{"--pen":c} as CSSProperties} onClick={()=>setPen(c)}/>)}</div><button className="demo-outline" type="button" onClick={()=>setStrokes([])}><Trash2 size={15}/> CLEAR</button></div>
  </div>;
}

export function DemoStage({id}: {id:ProjectId}) {
  switch(id){
    case "stylescape":return <StudioDemo/>;
    case "pokedex":return <BattleDemo/>;
    case "fitstream":return <RunDemo/>;
    case "mh15":return <SketchDemo/>;
  }
}
