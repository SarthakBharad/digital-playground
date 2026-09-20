import Link from "next/link";
import { Chart } from "@/components/charts/ChartCard";
import { Icon, type IconKey } from "@/components/ui/Icon";
import { Inline } from "@/components/ui/Inline";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import type { LoadedWeek } from "@/lib/types";
import { pad2 } from "@/lib/utils";

/* ================================================================ latest */

export function LatestExperiment({ week }: { week: LoadedWeek }) {
  const chart = week.charts[0];
  const dataset = chart ? week.datasets[chart.csv] : undefined;

  return (
    <section id="latest" className="relative scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          index="01"
          eyebrow="Latest experiment"
          title={
            <>
              This week&apos;s <span className="text-gradient">answer</span>
            </>
          }
          description="The newest published week, at a glance. Every number below is read straight from the notebook's CSVs when the site builds."
        />

        <Reveal>
          <div className="card-base grid overflow-hidden lg:grid-cols-[1fr_1.15fr]">
            <div className="flex flex-col gap-5 border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">
                  Week {pad2(week.number)}
                </span>
                <StatusBadge status={week.status} />
              </div>
              <div>
                <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-fg-subtle">The question</p>
                <h3 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">“{week.question}”</h3>
              </div>

              <ul className="space-y-2.5">
                {week.findings.slice(0, 2).map((f) => (
                  <li key={f} className="prose-lab flex gap-3 text-sm leading-relaxed text-fg-muted">
                    <Icon name="sparkles" size={14} className="mt-1 flex-none text-accent-2" />
                    <span>
                      <Inline text={f} />
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="grid grid-cols-2 gap-3">
                {week.resolvedStats.slice(0, 2).map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-surface-2/60 px-4 py-3">
                    <dt className="text-xs text-fg-subtle">{s.label}</dt>
                    <dd className="mt-0.5 font-heading text-2xl font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/weeks/${week.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--fill),var(--fill-2))] px-5 py-2.5 text-sm font-medium text-on-fill shadow-[0_14px_40px_-18px_var(--glow-a)]"
                >
                  Full analysis
                  <Icon name="arrow-right" size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <span className="font-mono text-[0.7rem] text-fg-subtle">
                  {week.charts.length} charts · {week.rowCount.toLocaleString("en-GB")} rows · {formatDate(week.publishedOn)}
                </span>
              </div>
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              {chart && dataset ? (
                <>
                  <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">Fig. 01</p>
                  <p className="font-heading text-lg font-semibold">{chart.title}</p>
                  {chart.caption && <p className="mb-6 mt-1 text-sm text-fg-muted">{chart.caption}</p>}
                  <div className="flex-1">
                    <Chart spec={chart} dataset={dataset} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-fg-subtle">Charts arrive once the notebook is done.</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================ loop */

const steps: { icon: IconKey; title: string; body: string; artifact: string }[] = [
  {
    icon: "x",
    title: "Ask",
    body: "A random question goes out on X — a poll, a reply thread, or a “send me your…” call.",
    artifact: "tweet",
  },
  {
    icon: "database",
    title: "Collect",
    body: "Replies, votes and any public data that helps answer it get scraped and saved raw.",
    artifact: "raw_data.csv",
  },
  {
    icon: "jupyter",
    title: "Analyse",
    body: "Cleaning, joining and counting happen in a Jupyter notebook with pandas.",
    artifact: "analysis.ipynb",
  },
  {
    icon: "github",
    title: "Publish",
    body: "Tidy result tables go to GitHub; the raw dataset goes to Kaggle for anyone to reuse.",
    artifact: "week-NN/*.csv",
  },
  {
    icon: "chart-line",
    title: "Visualise",
    body: "This site reads the CSVs at build time and turns them into interactive charts.",
    artifact: "/weeks/week-NN",
  },
];

export function Loop() {
  return (
    <section id="loop" className="relative scroll-mt-16 overflow-hidden border-y border-border bg-bg-soft py-24">
      <div className="grid-backdrop mask-radial-soft pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          index="02"
          eyebrow="The loop"
          title={
            <>
              From a tweet to a <span className="text-gradient">chart</span>, every week
            </>
          }
          description="Five steps, repeated weekly. The web half is practice in building data interfaces; the notebook half is practice in finding the answer."
        />

        <div className="relative">
          {/* connecting line — desktop only */}
          <svg aria-hidden className="absolute left-0 right-0 top-7 hidden h-px w-full lg:block" preserveAspectRatio="none">
            <line x1="10%" x2="90%" y1="0.5" y2="0.5" stroke="var(--border-strong)" strokeDasharray="4 4" className="animate-dash" />
          </svg>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <StaggerItem key={s.title} className="relative flex flex-col items-start lg:items-center lg:text-center">
                <span className="relative z-10 mb-4 grid size-14 place-items-center rounded-2xl border border-border-strong bg-surface text-accent-2 shadow-[0_12px_30px_-18px_var(--glow-a)]">
                  <Icon name={s.icon} size={20} />
                  <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-[linear-gradient(120deg,var(--fill),var(--fill-2))] font-mono text-[0.6rem] font-semibold text-on-fill">
                    {i + 1}
                  </span>
                </span>
                <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.body}</p>
                <code className="mt-3 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[0.68rem] text-accent">
                  {s.artifact}
                </code>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ open data */

export function OpenData() {
  const cards = [
    {
      icon: "github" as const,
      label: "GitHub",
      title: "Analytics CSVs & notebooks",
      body: "Every week's cleaned result tables and the Jupyter notebook that produced them, one folder per week. Fork it, rerun it, prove me wrong.",
      href: site.data.github,
      cta: "Open the repo",
      meta: ["week-NN/", "*.csv", "analysis.ipynb"],
    },
    {
      icon: "kaggle" as const,
      label: "Kaggle",
      title: "The raw datasets",
      body: "The data as it was collected — before cleaning — published as Kaggle datasets so anyone can run their own analysis on it.",
      href: site.data.kaggle,
      cta: "Browse on Kaggle",
      meta: ["raw", "documented", "reusable"],
    },
  ];

  return (
    <section id="open-data" className="relative scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          index="04"
          eyebrow="Open data"
          title={
            <>
              Take the data, <span className="text-gradient">check my work</span>
            </>
          }
          description="Nothing here is a screenshot. The numbers behind every chart are public, versioned and downloadable."
        />
        <Stagger className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <StaggerItem key={c.label}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group card-base relative flex h-full flex-col overflow-hidden p-6 transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] hover:shadow-[0_30px_80px_-40px_var(--glow-a)] sm:p-8"
              >
                <Icon
                  name={c.icon === "kaggle" ? "kaggle-wordmark" : c.icon}
                  size={160}
                  className="pointer-events-none absolute -bottom-8 -right-6 text-[color-mix(in_oklab,var(--fg)_5%,transparent)] transition-colors duration-500 group-hover:text-[color-mix(in_oklab,var(--accent-2)_12%,transparent)]"
                />
                <span className="mb-5 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">
                  <Icon name={c.icon} size={14} className="text-accent-2" />
                  {c.label}
                </span>
                <h3 className="font-heading text-2xl font-semibold">{c.title}</h3>
                <p className="relative mt-2 max-w-md text-sm leading-relaxed text-fg-muted">{c.body}</p>
                <div className="relative mt-5 flex flex-wrap gap-1.5">
                  {c.meta.map((m) => (
                    <Tag key={m}>{m}</Tag>
                  ))}
                </div>
                <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent">
                  {c.cta}
                  <Icon name="arrow-up-right" size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
