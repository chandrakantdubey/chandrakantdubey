import { useMotionValue, motion, useReducedMotion } from "motion/react";
import type { PointerEvent } from "react";

export function DragonIllustration({ motionEnabled }: { motionEnabled: boolean }) {
  const reduceMotion = useReducedMotion();
  const animate = motionEnabled && !reduceMotion;
  const detailX = useMotionValue(0);
  const detailY = useMotionValue(0);

  function reactToPointer(event: PointerEvent<HTMLDivElement>) {
    if (!animate || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    detailX.set(Math.max(-2.5, Math.min(2.5, ((event.clientX - bounds.left) / bounds.width - .5) * 5)));
    detailY.set(Math.max(-2.5, Math.min(2.5, ((event.clientY - bounds.top) / bounds.height - .5) * 5)));
  }

  function resetPointer() {
    detailX.set(0);
    detailY.set(0);
  }

  return <div className="pointer-events-none relative mx-auto aspect-square w-full max-w-[660px] select-none md:pointer-events-auto" onPointerMove={reactToPointer} onPointerLeave={resetPointer} aria-hidden="true">
    <div className="absolute inset-[9%] rounded-full bg-[radial-gradient(circle,var(--dragon-soft),transparent_68%)] blur-2xl" />
    <motion.svg viewBox="0 0 720 720" className="relative h-full w-full overflow-visible drop-shadow-[0_0_26px_var(--dragon-soft)]" fill="none" xmlns="http://www.w3.org/2000/svg" initial={false}>
      <defs>
        <linearGradient id="drakon-scales" x1="114" y1="601" x2="568" y2="147" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--cyan)" stopOpacity=".28" />
          <stop offset=".46" stopColor="var(--dragon)" stopOpacity=".96" />
          <stop offset="1" stopColor="var(--ember)" stopOpacity=".84" />
        </linearGradient>
        <linearGradient id="drakon-edge" x1="214" y1="528" x2="524" y2="199" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--dragon)" stopOpacity=".12" />
          <stop offset=".5" stopColor="var(--dragon)" />
          <stop offset="1" stopColor="var(--ember)" />
        </linearGradient>
        <filter id="drakon-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="drakon-grid" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <path d="M12 2 21 12 12 22 3 12 12 2Z" stroke="var(--dragon)" strokeOpacity=".13" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Fine detail plane reacts to a mouse by no more than 2.5px. */}
      <motion.g style={{ x: detailX, y: detailY }}>
        <circle className="hidden md:block" cx="360" cy="360" r="302" stroke="var(--dragon)" strokeOpacity=".12" strokeDasharray="2 10" />
        <circle className="hidden md:block" cx="360" cy="360" r="268" stroke="var(--dragon)" strokeOpacity=".08" />
        <path className="hidden md:block" d="M71 416h82l24-24h46M546 483h43l24-24h39M494 91v46l-18 18v32M192 566v-45l-18-18v-31" stroke="var(--dragon)" strokeOpacity=".28" strokeLinecap="round" />
        <circle className="hidden md:block" cx="175" cy="392" r="4" fill="var(--cyan)" />
        <circle className="hidden md:block" cx="613" cy="459" r="4" fill="var(--ember)" />
        <circle className="hidden md:block" cx="476" cy="155" r="4" fill="var(--dragon)" />
        <circle className="hidden md:block" cx="174" cy="502" r="4" fill="var(--dragon)" />
        <path id="dragon-signal-path" className="hidden md:block" d="M120 327h71l21-21h38" stroke="var(--cyan)" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
        <motion.circle id="dragon-signal-node" className="hidden md:block" cx="120" cy="327" r="3" fill="var(--cyan)" animate={animate ? { cx: [120, 191, 212, 250], cy: [327, 327, 306, 306], opacity: [0, .9, .9, 0] } : undefined} transition={{ duration: 6.8, repeat: Infinity, repeatDelay: 1.8, ease: "linear", delay: 1.2 }} />
      </motion.g>

      {/* The body's slow breathing stays local to the coil, never bobbing the whole drawing. */}
      <motion.g animate={animate ? { scale: [1, 1.006, 1] } : undefined} transition={{ duration: 10.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformBox: "fill-box", transformOrigin: "center center" }}>
        {/* Coiled neck and body: a continuous silhouette with a hand-drawn circuit edge. */}
        <motion.path id="dragon-body-contour" d="M411 223C392 280 365 321 309 354C249 390 205 430 211 484C216 536 263 570 320 559C388 546 441 489 462 426C486 355 458 301 425 270" stroke="url(#drakon-edge)" strokeWidth="55" strokeLinecap="round" initial={animate ? { pathLength: 0 } : false} animate={animate ? { pathLength: 1 } : undefined} transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }} />
        <motion.path id="dragon-scale-ridge" d="M411 223C392 280 365 321 309 354C249 390 205 430 211 484C216 536 263 570 320 559C388 546 441 489 462 426C486 355 458 301 425 270" stroke="url(#drakon-scales)" strokeWidth="47" strokeLinecap="round" strokeDasharray="2 3" opacity=".68" filter="url(#drakon-glow)" />
        <path d="M411 223C392 280 365 321 309 354C249 390 205 430 211 484C216 536 263 570 320 559C388 546 441 489 462 426C486 355 458 301 425 270" stroke="url(#drakon-scales)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 11" opacity=".95" />

        {/* Scale plates along the outside of the coil. */}
        <g className="hidden md:block" stroke="var(--dragon)" strokeOpacity=".52" strokeWidth="2" strokeLinecap="round">
          <path d="m262 380 8 11-9 10m23-34 8 11-9 10m24-35 8 11-9 10m26-35 8 11-9 10" />
          <path d="m227 425 12 6-7 12m-17 15 12 6-6 12m-1 22 13 1-2 13m18 17 12-5 5 12m25 14 9-10 9 9m24-3 2-13 13 1m22-13-5-12 11-7m22-8-9-9 8-11m18-14-12-5 4-13" />
        </g>
      </motion.g>

        {/* Wing, shoulder and recognizable dragon profile. */}
      <motion.g animate={animate ? { opacity: [.94, 1, .94] } : undefined} transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformBox: "fill-box", transformOrigin: "center center" }}>
        <motion.path id="dragon-wing-contour" d="M405 281C367 243 338 201 335 151C361 177 384 187 410 187C393 148 394 113 405 82C424 123 449 147 482 157C507 168 529 182 551 201L604 224L555 245C539 265 513 275 479 269L451 302" fill="url(#drakon-grid)" stroke="var(--dragon)" strokeWidth="2" strokeLinejoin="round" initial={animate ? { pathLength: 0 } : false} animate={animate ? { pathLength: 1 } : undefined} transition={{ duration: 1, delay: .04, ease: "easeOut" }} />
        <path d="M345 163C364 213 395 242 426 267M402 118C419 159 445 185 482 204M451 158C449 183 458 211 482 235M363 202 399 196M377 226 407 214M389 248 417 232" stroke="var(--dragon)" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

        <motion.path id="dragon-head-contour" d="M418 211C420 177 448 151 486 151C521 151 548 169 568 192L628 214L575 229C564 248 541 260 509 261L481 284L448 270L419 247L397 234L418 211Z" fill="var(--panel-solid)" stroke="url(#drakon-scales)" strokeWidth="3" strokeLinejoin="round" initial={animate ? { pathLength: 0 } : false} animate={animate ? { pathLength: 1 } : undefined} transition={{ duration: .9, delay: .14, ease: "easeOut" }} />
        <path d="M447 179C432 150 433 126 444 104C454 130 470 146 493 155M472 160C472 135 483 114 506 96C502 123 507 145 521 163" stroke="var(--dragon)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M494 184C510 176 526 180 536 192C523 188 513 190 505 198" stroke="var(--cyan)" strokeWidth="3" strokeLinecap="round" />
        <motion.circle id="dragon-eye-light" cx="523" cy="205" r="5" fill="var(--ember)" filter="url(#drakon-glow)" animate={animate ? { opacity: [.78, 1, .78], scale: [1, 1.04, 1] } : undefined} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }} />
        <path d="m590 215 14 1m-47 34-18 22m-42-20 7 29m-43-74-26-11" stroke="var(--dragon)" strokeOpacity=".78" strokeWidth="2" strokeLinecap="round" />

      <motion.circle className="hidden md:block" cx="588" cy="546" r="3" fill="var(--ember)" animate={animate ? { opacity: [.35, .8, .35] } : undefined} transition={{ duration: 8.2, repeat: Infinity, delay: 1.6, ease: "easeInOut" }} />
    </motion.svg>
  </div>;
}
