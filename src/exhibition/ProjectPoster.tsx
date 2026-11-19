import type { ProjectCategory } from "../atelier/content";

export default function ProjectPoster({ category }: { category: ProjectCategory }) {
  if(category==="realtime")return <div className="poster-canvas poster-blackout" aria-hidden="true">
    <span className="poster-topline">B/PROTOCOL — LIVE GRID</span>
    <svg viewBox="0 0 620 540" className="poster-svg" preserveAspectRatio="xMidYMid meet">
      <defs><radialGradient id="bo-glow"><stop stopColor="#9a8cff" stopOpacity=".5"/><stop offset="1" stopColor="#9a8cff" stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="315" cy="260" rx="270" ry="220" fill="url(#bo-glow)"/>
      {Array.from({length:25},(_,i)=>{
        const x=132+(i%5)*89,y=86+Math.floor(i/5)*84;
        const active=[1,6,11,12,13,18,23].includes(i);
        return <g key={i} className={active?"powered-node":""}>
          <rect x={x} y={y} width="66" height="60" rx="7" fill={active?"#d9ff8e":"#201a4b"} stroke={active?"#eaffae":"#817cb5"} strokeWidth="1.8"/>
          <path d={"M"+(x+15)+" "+(y+18)+" h35 v25 h-35 z"} stroke={active?"#263414":"#8b80bc"} fill="none" strokeWidth="2" strokeDasharray={active?"0":"4 5"}/>
          {active&&<circle cx={x+33} cy={y+30} r="6" fill="#483ffa"/>}
        </g>;
      })}
      <path className="power-path" d="M254 116 V200 V284 H343 H432 V368 H432 V452" fill="none" stroke="#c6ff81" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <div className="poster-bottomline"><span>REAL-TIME / MULTIPLAYER</span><strong>01</strong></div>
  </div>;
  if(category==="operations")return <div className="poster-canvas poster-timesheet" aria-hidden="true">
    <span className="poster-topline">WORKFORCE / TIME</span>
    <div className="timecard timecard-back"><span>MON</span><strong>07</strong><small>WEEK 42</small></div>
    <div className="timecard timecard-front"><span className="timecard-label">CLOCK IN / LOG 004</span><strong>08<span>:</span>45</strong><div className="timecard-bar"><i/><i/><i/><i/><i/><i/><i/></div><small>OCT / 2026 — 09:12:45</small></div>
    <div className="timecard timecard-side"><span>TEAM</span><strong>04</strong></div>
    <div className="poster-bottomline"><span>ADMIN / APPLICATIONS</span><strong>02</strong></div>
  </div>;
  if(category==="creative")return <div className="poster-canvas poster-stylescape" aria-hidden="true">
    <span className="poster-topline">STYLESCAPE / GENERATOR</span>
    <svg viewBox="0 0 620 540" className="poster-svg" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="s-wave" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffec1"/><stop offset=".4" stopColor="#dd5ff0"/><stop offset="1" stopColor="#6538fb"/></linearGradient></defs>
      <g className="poster-shape-rotate" transform="translate(310 270)">
        {Array.from({length:15},(_,i)=>{const r=58+i*17;return <ellipse key={i} cx={Math.sin(i*.45)*8} cy={Math.cos(i*.45)*6} rx={r} ry={r*.62} fill="none" stroke={i%3===0?"#5b24c9":"url(#s-wave)"} strokeWidth={i%4===0?8:4} transform={"rotate("+(i*17)+")"}/>;})}
        <circle r="48" fill="#ffffbd"/><circle r="21" fill="#ff795b"/>
      </g>
    </svg>
    <span className="poster-sticker">MAKE<br/>SOMETHING<br/>DIFFERENT.</span>
    <div className="poster-bottomline"><span>SVG / PROCEDURAL</span><strong>03</strong></div>
  </div>;
  if(category==="mobile")return <div className="poster-canvas poster-pokedex" aria-hidden="true">
    <span className="poster-topline">POKÉDEX / ENCOUNTER</span>
    <svg viewBox="0 0 620 540" className="poster-svg" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="pk-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fdf3b5"/><stop offset=".6" stopColor="#efa1b4"/><stop offset="1" stopColor="#b57bf1"/></linearGradient></defs>
      <g className="poster-creature">
        <ellipse cx="319" cy="430" rx="153" ry="25" fill="#1e174d" opacity=".36"/>
        <path d="M233 223 L187 121 L270 189 L337 159 L427 126 L400 240 Q448 307 409 383 Q370 441 290 436 Q206 431 191 361 Q173 279 233 223Z" fill="url(#pk-fill)" stroke="#3d165a" strokeWidth="8" strokeLinejoin="round"/>
        <path d="M226 216 Q317 245 400 224" fill="none" stroke="#fff6ce" strokeWidth="17" opacity=".5"/>
        <ellipse cx="266" cy="308" rx="15" ry="26" fill="#32164b"/>
        <ellipse cx="361" cy="308" rx="15" ry="26" fill="#32164b"/>
        <path d="M302 345 Q317 365 332 346" fill="none" stroke="#32164b" strokeWidth="7" strokeLinecap="round"/>
        <ellipse cx="235" cy="342" rx="19" ry="11" fill="#ed7d94" opacity=".8"/>
        <ellipse cx="391" cy="342" rx="19" ry="11" fill="#ed7d94" opacity=".8"/>
      </g>
      <circle cx="460" cy="174" r="30" stroke="#fef6b0" strokeWidth="4" fill="none" strokeDasharray="3 12"/>
      <path d="M160 158 l-18 -20 m12 36 l-27 0" stroke="#e7ff91" strokeWidth="6" strokeLinecap="round"/>
    </svg>
    <div className="poster-bottomline"><span>ENCOUNTER / GAME API</span><strong>04</strong></div>
  </div>;
  if(category==="fullstack")return <div className="poster-canvas poster-fitstream" aria-hidden="true">
    <span className="poster-topline">FITSTREAM / ACTIVITY</span>
    <svg viewBox="0 0 620 540" className="poster-svg" preserveAspectRatio="xMidYMid meet">
      <g fill="none" stroke="#d9efd5" strokeWidth="2" opacity=".25">
        {Array.from({length:10},(_,i)=><path key={i} d={"M0 "+(i*59)+" Q 180 "+(120+i*35)+" 340 "+(i*39)+" T620 "+(i*50)}/>)}
      </g>
      <path className="route-path" d="M94 401 C130 378 199 394 208 314 C222 242 314 324 319 237 C324 157 403 194 421 138 C433 98 481 103 530 73" fill="none" stroke="#c8fe79" strokeWidth="14" strokeLinecap="round"/>
      <path d="M94 401 C130 378 199 394 208 314 C222 242 314 324 319 237 C324 157 403 194 421 138 C433 98 481 103 530 73" fill="none" stroke="#0d4e46" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 12"/>
      <circle cx="94" cy="401" r="22" fill="#ffffdc"/><circle cx="94" cy="401" r="9" fill="#12644d"/>
      <circle cx="530" cy="73" r="22" fill="#ff7458"/><circle cx="530" cy="73" r="9" fill="#fff9dd"/>
      <text x="350" y="425" fontSize="85" fontWeight="800" letterSpacing="-7" fill="#ebfae6" fontFamily="Arial, sans-serif">5.2</text>
      <text x="358" y="459" fontSize="20" letterSpacing="5" fill="#bce7bf" fontFamily="monospace">KILOMETRES</text>
    </svg>
    <div className="poster-bottomline"><span>ROUTES / PROGRESS</span><strong>05</strong></div>
  </div>;
  return <div className="poster-canvas poster-farmpulse" aria-hidden="true">
    <span className="poster-topline">FARMPULSE / SENSOR PROTOTYPE</span>
    <svg viewBox="0 0 620 540" className="poster-svg" preserveAspectRatio="xMidYMid meet">
      <g className="farm-rays" stroke="#d6fef4" opacity=".21" strokeWidth="2">{Array.from({length:13},(_,i)=><path key={i} d={"M"+(i*62-60)+" 540 L310 152"}/>)}</g>
      <circle cx="310" cy="170" r="102" fill="#bfe0c4"/><circle cx="310" cy="170" r="78" fill="#3a8d95"/><circle cx="310" cy="170" r="56" fill="#dafe8d"/>
      <path d="M0 400 Q120 270 250 395 T620 370 V540 H0Z" fill="#144c73"/>
      <path d="M0 448 Q120 330 250 439 T620 418 V540 H0Z" fill="#1e7997"/>
      <path d="M0 489 Q120 381 250 487 T620 460 V540 H0Z" fill="#61bca9"/>
      <g fill="none" stroke="#e8fbb5" strokeWidth="4" opacity=".8">
        <path d="M60 460 L110 425 L160 438 L215 382 L270 407 L325 355 L380 368 L445 288 L505 320 L570 258"/>
      </g>
      <circle cx="445" cy="288" r="9" fill="#fefdca"/>
    </svg>
    <div className="poster-bottomline"><span>SENSORS / TIME SERIES</span><strong>06</strong></div>
  </div>;
}
