/** Original vector kinetic sculpture. Decorative and deliberately GPU-light. */
export default function Sculpture() {
 return <svg className="uni-sculpture" viewBox="0 0 700 700" aria-hidden="true" focusable="false">
 <defs>
  <linearGradient id="chrome" x1="0" y1="0" x2=".92" y2="1"><stop stopColor="#ffffff"/><stop offset=".12" stopColor="#8c9fb9"/><stop offset=".28" stopColor="#e7d9ff"/><stop offset=".44" stopColor="#26233c"/><stop offset=".58" stopColor="#faf7ff"/><stop offset=".76" stopColor="#5b5d89"/><stop offset="1" stopColor="#ece7ff"/></linearGradient>
  <radialGradient id="specGlow"><stop stopColor="#ffb8d9" stopOpacity=".86"/><stop offset=".42" stopColor="#9959ea" stopOpacity=".48"/><stop offset="1" stopColor="#0b1020" stopOpacity="0"/></radialGradient>
  <linearGradient id="glaze" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe9f4" stopOpacity=".8"/><stop offset=".34" stopColor="#7e6bb0" stopOpacity=".7"/><stop offset=".7" stopColor="#31274c" stopOpacity=".4"/><stop offset="1" stopColor="#daeffe" stopOpacity=".92"/></linearGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="21"/></filter>
 </defs>
 <circle cx="355" cy="355" r="260" fill="url(#specGlow)" filter="url(#soft)"/>
 <g className="uni-orbit-one"><ellipse cx="350" cy="350" rx="295" ry="102" transform="rotate(-37 350 350)" fill="none" stroke="#a19feb" strokeOpacity=".5" strokeWidth="2"/></g>
 <g className="uni-orbit-two"><ellipse cx="350" cy="350" rx="265" ry="75" transform="rotate(49 350 350)" fill="none" stroke="url(#chrome)" strokeWidth="23"/><ellipse cx="350" cy="350" rx="265" ry="75" transform="rotate(49 350 350)" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2"/></g>
 <g className="uni-orbit-three"><ellipse cx="350" cy="350" rx="228" ry="58" transform="rotate(-47 350 350)" fill="none" stroke="url(#chrome)" strokeWidth="17"/><ellipse cx="350" cy="350" rx="228" ry="58" transform="rotate(-47 350 350)" fill="none" stroke="#c1adf6" strokeWidth="1.5"/></g>
 <g className="uni-core">
 <path d="M350 156 C414 214 480 275 485 355 C486 440 430 499 350 550 C273 499 215 439 215 355 C218 275 281 214 350 156Z" fill="url(#glaze)" stroke="#eee8ff" strokeWidth="3"/>
 <path d="M350 198 C393 246 437 293 440 355 C440 414 405 462 350 502 C298 462 260 413 260 355 C261 296 305 244 350 198Z" fill="#160e2f" fillOpacity=".72" stroke="#d2b6ff" strokeOpacity=".6" strokeWidth="1.5"/>
 <path d="M350 204 L350 498 M270 350 H434" stroke="#d4b0ff" strokeOpacity=".38" strokeWidth="2"/>
 <circle cx="350" cy="355" r="67" fill="url(#specGlow)"/><circle cx="350" cy="355" r="16" fill="#f7e8ff" opacity=".93"/>
 </g>
 <g className="uni-orbit-front"><path d="M114 507 C245 626 492 174 592 212" fill="none" stroke="url(#chrome)" strokeWidth="25" strokeLinecap="round"/><path d="M114 507 C245 626 492 174 592 212" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2"/></g>
 </svg>
}
