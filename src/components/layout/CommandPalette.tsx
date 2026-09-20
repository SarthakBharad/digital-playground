"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconKey } from "@/components/ui/Icon";
import { navItems, type WeekLink } from "@/lib/nav";
import { site } from "@/lib/site";
import { cn, pad2 } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: IconKey;
  group: "Weeks" | "Navigate" | "Data" | "Actions";
  keywords?: string;
  /** Actions keep the palette open (e.g. theme flip) */
  keepOpen?: boolean;
  run: () => void;
}

export function CommandPalette({ weeks }: { weeks: WeekLink[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const openUrl = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");

    const weekCmds: Command[] = weeks.map((w) => ({
      id: `week-${w.slug}`,
      label: w.title,
      hint: `Week ${pad2(w.number)} · ${w.status}`,
      icon: "flask",
      group: "Weeks",
      keywords: w.tags.join(" "),
      run: () => router.push(`/weeks/${w.slug}`),
    }));

    const nav: Command[] = [
      { id: "nav-home", label: "Home", hint: "/", icon: "chevron-right", group: "Navigate", run: () => router.push("/") },
      ...navItems.map<Command>((item) => ({
        id: `nav-${item.href}`,
        label: item.label,
        hint: item.href,
        icon: "chevron-right",
        group: "Navigate",
        run: () => router.push(item.href),
      })),
    ];

    const data: Command[] = [
      {
        id: "data-github",
        label: "Analytics CSVs on GitHub",
        hint: site.data.github.replace("https://", ""),
        icon: "github",
        group: "Data",
        keywords: "repo csv notebook",
        run: openUrl(site.data.github),
      },
      {
        id: "data-kaggle",
        label: "Raw datasets on Kaggle",
        hint: site.data.kaggle.replace("https://", ""),
        icon: "kaggle",
        group: "Data",
        keywords: "dataset raw",
        run: openUrl(site.data.kaggle),
      },
      {
        id: "data-x",
        label: "Ask me on X",
        hint: site.author.handle,
        icon: "x",
        group: "Data",
        keywords: "twitter question poll",
        run: openUrl(site.socials.x),
      },
    ];

    const actions: Command[] = [
      {
        id: "action-theme",
        label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        hint: "Theme",
        icon: resolvedTheme === "dark" ? "sun" : "moon",
        group: "Actions",
        keywords: "theme dark light appearance",
        keepOpen: true,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      {
        id: "action-portfolio",
        label: "Visit the portfolio",
        hint: site.socials.portfolio.replace("https://", ""),
        icon: "arrow-up-right",
        group: "Actions",
        run: openUrl(site.socials.portfolio),
      },
    ];

    return [...weekCmds, ...nav, ...data, ...actions];
  }, [weeks, router, resolvedTheme, setTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.hint} ${c.keywords ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "/" && !open) {
        const t = event.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("no-scroll");
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(id);
      document.body.classList.remove("no-scroll");
    };
  }, [open]);

  const runCommand = (command: Command | undefined) => {
    if (!command) return;
    command.run();
    if (!command.keepOpen) close();
  };

  const onListKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runCommand(results[cursor]);
    }
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  let lastGroup = "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface/60 py-1.5 pl-3.5 pr-2 font-mono text-xs text-fg-subtle transition-colors hover:border-accent-2 hover:text-accent-2 md:inline-flex"
      >
        <Icon name="search" size={13} />
        <span>Find a week…</span>
        <kbd className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[0.65rem]">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="grid size-9 place-items-center rounded-full border border-border bg-surface/60 text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2 md:hidden"
      >
        <Icon name="search" size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              aria-label="Close command palette"
              onClick={close}
              className="absolute inset-0 cursor-default bg-[color-mix(in_oklab,var(--brand-oxblood)_45%,rgba(0,0,0,0.35))] backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onKeyDown={onListKey}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <span className="font-mono text-sm text-accent-2">&gt;</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCursor(0);
                  }}
                  placeholder="Search weeks, tags, links…"
                  aria-label="Search commands"
                  className="w-full bg-transparent py-4 text-sm text-fg outline-none placeholder:text-fg-subtle"
                />
                <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-fg-subtle">
                  esc
                </kbd>
              </div>

              <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
                {results.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-fg-subtle">Nothing matches “{query}”.</p>
                )}

                {results.map((command, index) => {
                  const showGroup = command.group !== lastGroup;
                  lastGroup = command.group;
                  const activeRow = index === cursor;

                  return (
                    <div key={command.id}>
                      {showGroup && (
                        <p className="px-3 pb-1 pt-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
                          {command.group}
                        </p>
                      )}
                      <button
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setCursor(index)}
                        onClick={() => runCommand(command)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          activeRow ? "bg-accent-soft text-fg" : "text-fg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-7 flex-none place-items-center rounded-lg border border-border",
                            activeRow ? "border-transparent bg-accent-2-soft text-accent-2" : "bg-surface-2",
                          )}
                        >
                          <Icon name={command.icon} size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-fg">{command.label}</span>
                          <span className="block truncate font-mono text-[0.7rem] text-fg-subtle">{command.hint}</span>
                        </span>
                        {activeRow && <Icon name="enter" size={13} className="text-fg-subtle" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 font-mono text-[0.65rem] text-fg-subtle">
                <span className="flex items-center gap-3">
                  <span>↑↓ navigate</span>
                  <span>↵ open</span>
                  <span>/ search</span>
                </span>
                <span>playground</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
