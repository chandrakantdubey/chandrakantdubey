import { motion } from "motion/react";
import type { ThemeName } from "./theme";
import { themes } from "./theme";

export function ThemePicker({ theme, onChange }: { theme: ThemeName; onChange: (value: ThemeName) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--panel)] p-1" role="group" aria-label="Choose a color palette">
      {themes.map((item) => <motion.button
        key={item.id}
        type="button"
        className={"relative grid h-8 w-8 place-items-center rounded border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] " + (theme === item.id ? "border-[var(--line-strong)]" : "border-transparent")}
        aria-label={item.name + " color palette"}
        aria-pressed={theme === item.id}
        title={item.name}
        onClick={() => onChange(item.id)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: .92 }}
      >
        {theme === item.id && <motion.span className="absolute inset-0 rounded border border-[var(--accent-line)]" layoutId="selected-palette-ring" transition={{ type: "spring", stiffness: 360, damping: 26 }} aria-hidden="true" />}
        <span className={"h-4 w-4 rounded-full border border-black/10 " + item.swatchClass} />
      </motion.button>)}
    </div>
  );
}
