import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

function BrowserFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={"w-[76%] max-w-[345px] overflow-hidden rounded-lg border border-[#28332d]/15 bg-[#fbfaf5] shadow-[0_16px_42px_rgba(42,52,43,.12)] " + className}>
      <div className="flex h-7 items-center gap-1.5 border-b border-[#28332d]/10 px-3">
        <i className="h-1.5 w-1.5 rounded-full bg-[#c6c8bd]" /><i className="h-1.5 w-1.5 rounded-full bg-[#c6c8bd]" /><i className="h-1.5 w-1.5 rounded-full bg-[#c6c8bd]" />
        <span className="ml-2 h-1.5 w-20 rounded-full bg-[#e5e4da]" />
      </div>
      {children}
    </div>
  );
}

export function ProjectArtwork({ type }: { type: string }) {
  const reduceMotion = useReducedMotion();

  if (type === "wellness") {
    return (
      <div className="relative grid min-h-[220px] place-items-center overflow-hidden bg-[#eee4d9] sm:min-h-[240px]">
        <BrowserFrame className="p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#2d3931]">Your week</span><span className="rounded-full bg-[#e8eee2] px-2 py-1 text-[11px] text-[#50664e]">Overview</span></div>
          <div className="mt-4 grid grid-cols-[1fr_108px] items-end gap-3">
            <div><p className="m-0 text-[11px] text-[#778075]">Daily activity</p><div className="mt-2 flex h-[74px] items-end gap-1.5">{[34, 48, 42, 65, 56, 76, 58].map((height, index) => <motion.i className="w-full rounded-t-sm bg-[#829a7c]" key={index} initial={{ height: 0 }} whileInView={{ height }} viewport={{ once: true }} transition={{ duration: .5, delay: index * .05 }} />)}</div></div>
            <div className="rounded-md bg-[#f4f0e8] p-2.5"><span className="text-[11px] text-[#778075]">Next meal</span><div className="mt-2 h-3 w-4/5 rounded-full bg-[#d7ddd1]" /><div className="mt-1.5 h-2 w-3/5 rounded-full bg-[#e5e2d9]" /><div className="mt-3 h-7 w-full rounded bg-[#df9a78]/55" /></div>
          </div>
        </BrowserFrame>
        <span className="absolute bottom-3 left-4 text-[11px] font-medium text-[#5c645a]">Nutrition & daily activity</span>
      </div>
    );
  }

  if (type === "community") {
    return (
      <div className="relative grid min-h-[220px] place-items-center overflow-hidden bg-[#e5e8ee] sm:min-h-[240px]">
        <BrowserFrame className="p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#30374d]">Family connections</span><span className="text-[11px] text-[#767d91]">Tree view</span></div>
          <svg className="mt-3 h-[112px] w-full text-[#727d9d]" viewBox="0 0 300 112" fill="none" aria-hidden="true">
            <motion.path d="M150 22v22M150 44H82v20M150 44h68v20M82 64v19M218 64v19M82 83H39M82 83h43M218 83h-43M218 83h43" stroke="currentColor" strokeWidth="1.5" initial={reduceMotion ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .9 }} />
            {[[150, 18], [150, 45], [82, 65], [218, 65], [39, 84], [125, 84], [175, 84], [261, 84]].map(([x, y], index) => <motion.circle key={index} cx={x} cy={y} r={index < 2 ? 9 : 7} fill={index === 0 ? "#deddf0" : "#f8f7f2"} stroke="currentColor" strokeWidth="1.5" initial={reduceMotion ? false : { scale: .7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: .12 + index * .04 }} />)}
          </svg>
        </BrowserFrame>
        <span className="absolute bottom-3 left-4 text-[11px] font-medium text-[#5c6277]">Family stories & connections</span>
      </div>
    );
  }

  if (type === "commerce") {
    return (
      <div className="relative grid min-h-[220px] place-items-center overflow-hidden bg-[#e9e7d9] sm:min-h-[240px]">
        <BrowserFrame className="p-4">
          <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#34372d]">Featured collection</span><span className="text-[11px] text-[#77796b]">Shop</span></div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[{ bg: "bg-[#c7866e]" }, { bg: "bg-[#8eaa87]" }].map((item) => <motion.div className="rounded-md border border-[#31352d]/10 bg-white p-2" key={item.bg} whileHover={reduceMotion ? undefined : { y: -3 }}>
              <span className="grid h-[62px] place-items-center rounded-sm bg-[#f0ede3]"><i className={"h-9 w-9 rounded-full " + item.bg} /></span>
              <span className="mt-2 block h-2 w-3/4 rounded-full bg-[#d9d8cf]" /><span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-[#e7e5dd]" />
            </motion.div>)}
          </div>
        </BrowserFrame>
        <span className="absolute bottom-3 left-4 text-[11px] font-medium text-[#5d5e52]">Marketplace, rewards & retail</span>
      </div>
    );
  }

  return (
    <div className="relative grid min-h-[220px] place-items-center overflow-hidden bg-[#e5e9e0] sm:min-h-[240px]">
      <BrowserFrame className="p-4">
        <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#313a32]">Operations overview</span><span className="text-[11px] text-[#6e796e]">This month</span></div>
        <div className="mt-3 space-y-2">
          {["Performance reviews", "Risk inference", "Lead management", "Internal communications"].map((item, index) => <motion.div className="flex min-h-7 items-center gap-2 rounded border border-[#343c34]/10 bg-[#fffefa] px-2.5" key={item} initial={reduceMotion ? false : { opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }}><i className={"h-1.5 w-1.5 rounded-full " + (index === 0 ? "bg-[#bc7056]" : "bg-[#789374]")} /><span className="text-[11px] text-[#3c443c]">{item}</span><span className="ml-auto h-1 w-9 rounded-full bg-[#e1e5dd]" /></motion.div>)}
        </div>
      </BrowserFrame>
      <span className="absolute bottom-3 left-4 text-[11px] font-medium text-[#586255]">Enterprise workflow products</span>
    </div>
  );
}
