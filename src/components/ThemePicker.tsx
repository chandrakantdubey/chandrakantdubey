import { motion, useReducedMotion } from "motion/react";
import type { ThemeName } from "./theme";
import { themes } from "./theme";

export function ThemePicker({ theme, onChange }: { theme: ThemeName; onChange: (value: ThemeName) => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-[var(--line)] bg-[var(--panel)] p-1" role="group" aria-label="Choose a color theme">
      {themes.map((item) => <motion.button
        key={item.id}
        type="button"
        className={"relative grid min-h-11 min-w-11 place-items-center rounded border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] " + (theme === item.id ? "border-[var(--line-strong)]" : "border-transparent")}
        aria-label={item.name + " theme"}
        aria-pressed={theme === item.id}
        title={item.name}
        onClick={() => onChange(item.id)}
        whileHover={reduceMotion ? undefined : { scale: 1.06 }}
        whileTap={reduceMotion ? undefined : { scale: .96 }}
      >
        {theme === item.id && <motion.span className="absolute inset-0 rounded border border-[var(--accent-line)]" layoutId="selected-palette-ring" transition={{ type: "spring", stiffness: 360, damping: 26 }} aria-hidden="true" />}
        <span className={"relative h-4 w-4 rounded-full border border-black/20 " + item.swatchClass}>
          {theme === item.id && <span className="absolute inset-0 grid place-items-center text-[10px] font-bold leading-none text-[var(--accent-ink)]" aria-hidden="true">✓</span>}
        </span>
      </motion.button>)}
    </div>
  );
}
