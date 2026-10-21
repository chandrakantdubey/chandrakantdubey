import { useMotionValue, motion, useReducedMotion } from "motion/react";
import type { PointerEvent } from "react";

export function HeroIllustration({ motionEnabled }: { motionEnabled: boolean }) {
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
    <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_70%)] blur-2xl" />
    <motion.svg viewBox="0 0 640 640" className="relative h-full w-full overflow-visible drop-shadow-[0_18px_34px_var(--shadow-glass)]" fill="none" xmlns="http://www.w3.org/2000/svg" initial={false}>
      <defs>
        <linearGradient id="workspace-circuit" x1="104" y1="442" x2="521" y2="165" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--cyan)" />
          <stop offset=".52" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--ember)" />
        </linearGradient>
        <linearGradient id="workspace-window" x1="130" y1="185" x2="510" y2="455" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--panel-raised)" />
          <stop offset="1" stopColor="var(--panel-solid)" />
        </linearGradient>
        <linearGradient id="workspace-line" x1="225" y1="0" x2="470" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--cyan)" />
          <stop offset=".54" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
        <radialGradient id="workspace-halo" cx="0" cy="0" r="1" gradientTransform="translate(318 321) rotate(90) scale(258)" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-soft)" />
          <stop offset="1" stopColor="var(--page)" stopOpacity="0" />
        </radialGradient>
        <filter id="workspace-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="workspace-points" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="var(--accent)" fillOpacity=".38" />
        </pattern>
      </defs>

      <circle cx="320" cy="320" r="282" fill="url(#workspace-halo)" />
      <circle cx="320" cy="320" r="279" stroke="var(--accent)" strokeOpacity=".12" strokeDasharray="1 10" />
      <circle cx="320" cy="320" r="248" stroke="var(--line-strong)" strokeOpacity=".46" />
      <path d="M485 157C445 118 386 93 320 93C194 93 93 194 93 320S194 547 320 547C386 547 445 522 485 483" stroke="url(#workspace-circuit)" strokeWidth="13" strokeLinecap="round" opacity=".9" />
      <path d="M478 177C439 141 383 119 320 119C208 119 119 208 119 320S208 521 320 521C383 521 439 499 478 463" stroke="var(--accent)" strokeOpacity=".25" strokeWidth="1.5" strokeDasharray="2 9" />

      <motion.g
        animate={animate ? { rotate: [0, 360] } : undefined}
        transition={{ duration: 90, ease: "linear", repeat: Infinity }}
        style={{ transformOrigin: "320px 320px" }}
      >
        <path d="M320 41v28m0-28 5 8m-5-8-5 8M599 320h-27m27 0-8-5m8 5-8 5M320 599v-27m0 27 5-8m-5 8-5-8" stroke="var(--accent)" strokeOpacity=".52" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="320" cy="41" r="4" fill="var(--cyan)" />
        <circle cx="599" cy="320" r="4" fill="var(--ember)" />
        <circle cx="320" cy="599" r="4" fill="var(--accent)" />
      </motion.g>

      <motion.g style={{ x: detailX, y: detailY }}>
        <path d="M95 228h28l16 16h18m332 150h28l16 16h14M483 112v20l-14 14v18M160 531v-24l16-16v-16" stroke="var(--accent)" strokeOpacity=".48" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="123" cy="228" r="3.5" fill="var(--cyan)" />
        <circle cx="573" cy="394" r="3.5" fill="var(--ember)" />
        <circle cx="469" cy="164" r="3.5" fill="var(--accent)" />
        <circle cx="176" cy="475" r="3.5" fill="var(--violet)" />
      </motion.g>

      <motion.g
        animate={animate ? { y: [0, -2, 0] } : undefined}
        transition={{ duration: 7.5, ease: "easeInOut", repeat: Infinity }}
      >
        {/* One compact shell window gives the hero a clear Linux workstation identity. */}
        <rect x="130" y="185" width="380" height="270" rx="22" fill="url(#workspace-window)" stroke="var(--line-strong)" strokeWidth="1.5" />
        <rect x="131" y="186" width="378" height="53" rx="21" fill="var(--panel-raised)" />
        <path d="M131 239h378M212 239v215" stroke="var(--line)" strokeWidth="1.2" />
        <path d="M151 185h338a21 21 0 0 1 21 21v1H130v-1a21 21 0 0 1 21-21Z" fill="url(#workspace-points)" opacity=".8" />

        <rect x="145" y="202" width="21" height="20" rx="5" fill="var(--page)" stroke="var(--accent-line)" />
        <text x="155.5" y="215.5" textAnchor="middle" fill="var(--accent)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="10" fontWeight="700">$_</text>
        <text x="176" y="217" fill="var(--muted)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">chandrakant@drakon</text>
        <path d="M451 212h8m11-4v8h8v-8h-8Zm20-1 8 9m0-9-8 9" stroke="var(--dim)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />

        {/* File rail */}
        <text x="149" y="266" fill="var(--dim)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="11" letterSpacing="1.5">FILES</text>
        <rect x="145" y="280" width="58" height="27" rx="7" fill="var(--accent-soft)" />
        <path d="M154 294h5m-2.5-2.5v5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
        <text x="165" y="298" fill="var(--ink)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="12">src</text>
        <path d="m156 321 3 3-3 3m10 0h17" stroke="var(--dim)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="151" y="348" fill="var(--muted)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="11">api</text>
        <path d="m156 364 3 3-3 3m10 0h17" stroke="var(--dim)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="151" y="391" fill="var(--muted)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="11">data</text>
        <path d="m156 407 3 3-3 3m10 0h17" stroke="var(--dim)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="151" y="434" fill="var(--muted)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="11">ml</text>

        {/* A short, colorful code sample and a linked service map. */}
        <text x="231" y="265" fill="var(--dim)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="11" letterSpacing="1.1">~/WORKSPACE / ROUTER.TS</text>
        <text x="231" y="294" fill="var(--violet)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">export</text>
        <text x="287" y="294" fill="var(--cyan)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">function</text>
        <text x="356" y="294" fill="var(--ink)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">route()</text>
        <path d="M231 307h119" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />
        <text x="244" y="332" fill="var(--dim)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">connect</text>
        <text x="306" y="332" fill="var(--ember)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">api</text>
        <path d="M332 328h14" stroke="var(--line-strong)" strokeWidth="1.5" strokeLinecap="round" />
        <text x="357" y="332" fill="var(--accent)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">data</text>
        <path d="M389 328h14" stroke="var(--line-strong)" strokeWidth="1.5" strokeLinecap="round" />
        <text x="414" y="332" fill="var(--cyan)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">model</text>
        <text x="244" y="358" fill="var(--dim)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">return</text>
        <text x="306" y="358" fill="var(--ink)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">workspace</text>
        <path d="M231 375h66" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />
        <path d="M231 386h116" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />

        {/* Shell prompt */}
        <rect x="225" y="402" width="273" height="39" rx="9" fill="var(--page)" fillOpacity=".5" stroke="var(--line)" />
        <text x="239" y="426" fill="var(--accent)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="14">$</text>
        <text x="254" y="426" fill="var(--muted)" fontFamily="var(--font-mono, ui-monospace, monospace)" fontSize="13">open workbench</text>
        <motion.rect x="379" y="413" width="2" height="15" rx="1" fill="var(--cyan)" animate={animate ? { opacity: [1, 0, 1] } : undefined} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} />
      </motion.g>

      <motion.path
        d="M98 320h38l18 18h35"
        stroke="url(#workspace-line)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="5 7"
        animate={animate ? { strokeDashoffset: [0, -24] } : undefined}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle cx="98" cy="320" r="4" fill="var(--cyan)" filter="url(#workspace-glow)" animate={animate ? { opacity: [.4, 1, .4], scale: [1, 1.25, 1] } : undefined} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }} />
      <circle cx="542" cy="320" r="4" fill="var(--ember)" filter="url(#workspace-glow)" />
    </motion.svg>
  </div>;
}
