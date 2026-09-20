"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import type { WeekStatus } from "@/lib/types";
import { cn, pad2 } from "@/lib/utils";

export interface ArchiveWeek {
  slug: string;
  number: number;
  title: string;
  question: string;
  summary: string;
  status: WeekStatus;
  askedOn: string;
  tags: string[];
  charts: number;
  rows: number;
}

export function WeekCard({ week }: { week: ArchiveWeek }) {
  return (
    <Link
      href={`/weeks/${week.slug}`}
      className="group card-base relative flex h-full flex-col overflow-hidden p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] hover:shadow-[0_24px_60px_-30px_var(--glow-a)]"
    >
      <span
        aria-hidden
        className="text-outline pointer-events-none absolute -right-2 -top-6 select-none font-display text-[6.5rem] leading-none transition-[-webkit-text-stroke-color] duration-300 group-hover:[-webkit-text-stroke-color:var(--accent-2)]"
      >
        {pad2(week.number)}
      </span>

      <div className="relative mb-4 flex items-center gap-2">
        <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent-2">
          Week {pad2(week.number)}
        </span>
        <span className="font-mono text-[0.7rem] text-fg-subtle">· {formatDate(week.askedOn)}</span>
      </div>

      <h3 className="relative pr-10 font-heading text-xl font-semibold leading-snug">{week.title}</h3>
      <p className="relative mt-2 line-clamp-3 text-sm leading-relaxed text-fg-muted">{week.summary}</p>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {week.tags.map((t) => (
          <Tag key={t}>#{t}</Tag>
        ))}
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <StatusBadge status={week.status} />
        <span className="flex items-center gap-3 font-mono text-[0.68rem] text-fg-subtle">
          {week.status === "published" && (
            <>
              <span className="inline-flex items-center gap-1">
                <Icon name="chart-bar" size={11} /> {week.charts}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="table" size={11} /> {week.rows.toLocaleString("en-GB")}
              </span>
            </>
          )}
          <Icon name="arrow-up-right" size={14} className="text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-2" />
        </span>
      </div>
    </Link>
  );
}

const STATUSES: { id: "all" | WeekStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "analysing", label: "Analysing" },
  { id: "collecting", label: "Collecting" },
];

/** Filters sit in one row above the grid and scope everything below them. */
export function Archive({ weeks, limit }: { weeks: ArchiveWeek[]; limit?: number }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [status, setStatus] = useState<"all" | WeekStatus>("all");

  const tags = useMemo(() => [...new Set(weeks.flatMap((w) => w.tags))].sort(), [weeks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return weeks.filter(
      (w) =>
        (status === "all" || w.status === status) &&
        (!tag || w.tags.includes(tag)) &&
        (!q || `${w.title} ${w.question} ${w.summary} ${w.tags.join(" ")} week ${w.number}`.toLowerCase().includes(q)),
    );
  }, [weeks, query, tag, status]);

  const shown = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 focus-within:border-accent-2 lg:w-72">
          <Icon name="search" size={14} className="text-fg-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            aria-label="Search questions"
            className="w-full bg-transparent text-sm outline-none placeholder:text-fg-subtle"
          />
        </label>

        <div className="flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatus(s.id)}
              aria-pressed={status === s.id}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[0.7rem] transition-colors",
                status === s.id ? "bg-accent-soft text-fg" : "text-fg-subtle hover:text-fg",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag((cur) => (cur === t ? null : t))}
                aria-pressed={tag === t}
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-[0.68rem] transition-colors",
                  tag === t
                    ? "border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] bg-accent-2-soft text-accent-2"
                    : "border-border bg-surface-2 text-fg-muted hover:text-fg",
                )}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((w) => (
            <motion.div
              key={w.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <WeekCard week={w} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* The next question — always the last tile */}
        {!query && !tag && status === "all" && (
          <motion.a
            layout
            href={site.socials.x}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-56 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border-strong p-6 text-center transition-colors hover:border-accent-2"
          >
            <span className="grid size-11 place-items-center rounded-full border border-border bg-surface text-fg-muted transition-colors group-hover:text-accent-2">
              <Icon name="x" size={16} />
            </span>
            <span className="font-heading text-lg font-semibold">
              Week {pad2(Math.max(-1, ...weeks.map((w) => w.number)) + 1)}
            </span>
            <span className="max-w-[16rem] text-sm text-fg-muted">
              The next question drops on X. Reply, vote, or send me a dataset to dig into.
            </span>
          </motion.a>
        )}
      </motion.div>

      {shown.length === 0 && (
        <p className="py-16 text-center text-sm text-fg-subtle">No weeks match those filters yet.</p>
      )}
    </div>
  );
}
