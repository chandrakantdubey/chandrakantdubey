import { motion, useReducedMotion } from "motion/react";

export function SectionHeading({
  number,
  label,
  title,
  description,
}: {
  number: string;
  label: string;
  title: string;
  description?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="mb-8 max-w-[760px] sm:mb-10">
      <motion.p className="mb-3 flex items-center gap-2.5 text-[12px] font-semibold text-[var(--accent)] sm:text-[13px]" initial={reduceMotion ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .8 }} transition={{ duration: .32 }}>
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">{number}</span>
        <span className="h-px w-5 bg-[var(--accent-line)]" aria-hidden="true" />
        {label}
      </motion.p>
      <motion.h2 className="text-[clamp(34px,4.8vw,48px)] font-semibold leading-[1.1] tracking-[-.045em] text-[var(--ink)]" initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .7 }} transition={{ duration: .42, delay: .04 }}>{title}</motion.h2>
      {description && <motion.p className="mt-4 max-w-[680px] text-[15px] leading-[1.72] text-[var(--muted)] sm:text-[16px]" initial={reduceMotion ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .75 }} transition={{ duration: .38, delay: .1 }}>{description}</motion.p>}
    </div>
  );
}
