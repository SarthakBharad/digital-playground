"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/ui/Icon";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative grid size-9 place-items-center overflow-hidden rounded-full border border-border",
        "bg-surface/60 text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? (isDark ? "dark" : "light") : "placeholder"}
          initial={{ y: 12, opacity: 0, rotate: -35 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -12, opacity: 0, rotate: 35 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inline-flex"
        >
          <Icon name={mounted && isDark ? "sun" : "moon"} size={16} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
