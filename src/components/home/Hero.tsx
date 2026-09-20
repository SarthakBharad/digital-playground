"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { DataField } from "@/components/visuals/DataField";
import { Marquee } from "@/components/visuals/Marquee";
import { NotebookCell, type NotebookPreview } from "@/components/visuals/NotebookCell";
import { site } from "@/lib/site";
import { pad2 } from "@/lib/utils";

const phrases = [
  "one question a week",
  "asked on X",
  "answered in Jupyter",
  "cleaned with pandas",
  "shipped as a webpage",
] as const;

const tools = [
  "Python",
  "pandas",
  "NumPy",
  "Jupyter",
  "Kaggle",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "SVG charts",
  "Canvas",
  "pnpm",
  "Vercel",
] as const;

const parent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const child = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export interface HeroProps {
  totals: { questions: number; published: number; rows: number; files: number; charts: number };
  latest?: { slug: string; number: number; title: string };
  live?: { slug: string; number: number; title: string; status: string };
  previews: NotebookPreview[];
}

export function Hero({ totals, latest, live, previews }: HeroProps) {
  const counters = [
    { label: "questions asked", value: totals.questions },
    { label: "rows analysed", value: totals.rows },
    { label: "CSV files", value: totals.files },
    { label: "charts drawn", value: totals.charts },
  ];

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <DataField className="pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "var(--scrim)" }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
      />

      <motion.div
        variants={parent}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 pb-12 pt-28 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10"
      >
        <div className="flex min-w-0 flex-col gap-6">
          <motion.div variants={child}>
            {live ? (
              <Link
                href={`/weeks/${live.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--accent-2)_35%,transparent)] bg-accent-2-soft px-3 py-1.5 font-mono text-[0.7rem] font-medium text-accent-2 transition-colors hover:bg-accent-soft"
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-accent-2" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent-2" />
                </span>
                Week {pad2(live.number)} is open — {live.status}
                <Icon name="arrow-right" size={12} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--accent-2)_35%,transparent)] bg-accent-2-soft px-3 py-1.5 font-mono text-[0.7rem] font-medium text-accent-2">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-accent-2" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent-2" />
                </span>
                New question every week on {site.author.handle}
              </span>
            )}
          </motion.div>

          <motion.div variants={child} className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-fg-subtle">Sarthak&apos;s</p>
            <h1 className="font-display text-[clamp(2.9rem,9vw,5.5rem)] font-normal leading-[0.92] tracking-tight">
              <span className="block text-fg">Digital</span>
              <span className="text-gradient block">Playground</span>
            </h1>
          </motion.div>

          <motion.p variants={child} className="flex flex-wrap items-center gap-2 font-mono text-sm text-fg-muted">
            <span className="text-accent-2">&gt;&gt;&gt;</span>
            <ScrambleText phrases={phrases} className="text-fg" />
            <span className="inline-block h-4 w-[2px] animate-blink bg-accent-2" />
          </motion.p>

          <motion.p variants={child} className="max-w-xl text-base leading-relaxed text-fg-muted">
            A public practice log for web development and data analysis. Every week I ask one question on X,
            work through the answers in a Jupyter notebook, and publish the results here as interactive
            analytics — with the CSVs on GitHub and the raw data on Kaggle.
          </motion.p>

          <motion.div variants={child} className="flex flex-wrap items-center gap-3">
            {latest && (
              <MagneticButton href={`/weeks/${latest.slug}`}>
                <Icon name="flask" size={14} />
                Open week {pad2(latest.number)}
              </MagneticButton>
            )}
            <MagneticButton href="/weeks" variant="secondary">
              <Icon name="grid" size={14} />
              Browse the archive
            </MagneticButton>
          </motion.div>

          <motion.dl variants={child} className="grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {counters.map((c) => (
              <div key={c.label} className="bg-surface/85 px-4 py-3 backdrop-blur-sm">
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-fg-subtle">{c.label}</dt>
                <dd className="mt-1 font-heading text-2xl font-semibold text-fg">{c.value.toLocaleString("en-GB")}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div variants={child} className="min-w-0">
          <NotebookCell previews={previews} />
          <p className="mt-3 text-right font-mono text-[0.65rem] text-fg-subtle">
            ↑ running on the real CSVs from week {pad2(latest?.number ?? 0)} · move your cursor over the field
          </p>
        </motion.div>
      </motion.div>

      <div className="relative z-10 border-y border-border bg-surface/60 backdrop-blur-sm">
        <Marquee items={tools} speed={52} />
      </div>
    </section>
  );
}
