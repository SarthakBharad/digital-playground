"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Wordmark } from "@/components/layout/Wordmark";
import { Icon } from "@/components/ui/Icon";
import { navItems, type WeekLink } from "@/lib/nav";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar({ weeks }: { weeks: WeekLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 24));

  const isActive = (href: string) =>
    href === "/weeks" ? pathname.startsWith("/weeks") : false;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        scrolled || menuOpen ? "border-border bg-bg/90 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
      style={{ height: "var(--nav-h)" }}
    >
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark compact className="text-base sm:text-lg" />

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative rounded-full px-3 py-1.5 text-sm transition-colors duration-200",
                isActive(item.href) ? "bg-accent-soft text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              <span className="mr-1.5 font-mono text-[0.65rem] text-fg-subtle transition-colors group-hover:text-accent-2">
                {item.index}
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <CommandPalette weeks={weeks} />
          <a
            href={site.data.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Analytics CSVs on GitHub"
            className="hidden size-9 place-items-center rounded-full border border-border bg-surface/60 text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2 sm:grid"
          >
            <Icon name="github" size={15} />
          </a>
          <a
            href={site.data.kaggle}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Datasets on Kaggle"
            className="hidden size-9 place-items-center rounded-full border border-border bg-surface/60 text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2 sm:grid"
          >
            <Icon name="kaggle" size={15} />
          </a>
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-border bg-surface/60 text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2 lg:hidden"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={16} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-border bg-bg lg:hidden"
          >
            <div className="mx-auto grid max-w-6xl gap-1 px-4 py-4 sm:grid-cols-2 sm:px-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-[0.7rem] text-fg-subtle">{item.index}</span>
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 sm:col-span-2">
                <a
                  href={site.data.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-fg-muted"
                >
                  <Icon name="github" size={14} /> CSVs
                </a>
                <a
                  href={site.data.kaggle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-fg-muted"
                >
                  <Icon name="kaggle" size={14} /> Datasets
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
