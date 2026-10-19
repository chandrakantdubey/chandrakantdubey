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
    <div className="mb-6 max-w-[760px] sm:mb-8">
      <motion.p className="mb-3 flex items-center gap-2.5 font-[family-name:var(--font-mono)] text-[13px] text-[var(--accent)]" initial={reduceMotion ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .8 }} transition={{ duration: .32 }}>
        <span className="text-[var(--dim)]">{number} /</span>
        <span>{label.toLowerCase().replaceAll(" ", "_")}</span>
      </motion.p>
      <motion.h2 className="text-[clamp(27px,3.6vw,36px)] font-semibold leading-[1.1] tracking-[-.04em] text-[var(--ink)]" initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .7 }} transition={{ duration: .42, delay: .04 }}>{title}</motion.h2>
      {description && <motion.p className="mt-3 max-w-[680px] text-[15px] leading-[1.65] text-[var(--muted)] sm:text-[16px]" initial={reduceMotion ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .75 }} transition={{ duration: .38, delay: .1 }}>{description}</motion.p>}
    </div>
  );
}
