import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartCard } from "@/components/charts/ChartCard";
import { DataExplorer } from "@/components/charts/DataExplorer";
import { Icon, toolIcon, type IconKey } from "@/components/ui/Icon";
import { Inline } from "@/components/ui/Inline";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { StatusBadge } from "@/components/ui/Status";
import { Tag } from "@/components/ui/Tag";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import type { LoadedWeek, Week } from "@/lib/types";
import { cn, pad2 } from "@/lib/utils";
import { getNeighbours, getWeek, getWeeks, loadWeek } from "@/lib/weeks";

export const dynamicParams = false;

export function generateStaticParams() {
  return getWeeks().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const week = getWeek(slug);
  if (!week) return {};
  const title = `Week ${pad2(week.number)} — ${week.title}`;
  return {
    title,
    description: week.summary,
    alternates: { canonical: `/weeks/${week.slug}` },
    openGraph: { title, description: week.summary, type: "article" },
  };
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent-2">{index}</span>
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-fg-muted">{children}</span>
      <span className="h-px w-16 flex-none bg-[linear-gradient(90deg,var(--accent-2),transparent)]" />
    </div>
  );
}

function LinkButton({ href, icon, label, sub }: { href?: string; icon: IconKey; label: string; sub: string }) {
  const inner = (
    <>
      <span
        className={cn(
          "grid size-9 flex-none place-items-center rounded-xl border border-border bg-surface-2",
          href ? "text-accent-2" : "text-fg-subtle",
        )}
      >
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="block truncate font-mono text-[0.68rem] text-fg-subtle">{sub}</span>
      </span>
      {href && <Icon name="arrow-up-right" size={14} className="ml-auto flex-none text-fg-subtle transition-colors group-hover:text-accent-2" />}
    </>
  );
  const base = "group flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 transition-colors";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(base, "hover:border-accent-2")}>
      {inner}
    </a>
  ) : (
    <span className={cn(base, "opacity-60")} aria-disabled>
      {inner}
    </span>
  );
}

function Header({ week }: { week: Week }) {
  const links = week.links ?? {};
  return (
    <section className="relative overflow-hidden border-b border-border pb-14 pt-28">
      <div className="grid-backdrop mask-radial-soft pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 85% 0%, var(--glow-a), transparent 70%)" }}
      />
      <span
        aria-hidden
        className="text-outline pointer-events-none absolute -right-4 top-16 select-none font-display text-[clamp(10rem,28vw,22rem)] leading-none opacity-70"
      >
        {pad2(week.number)}
      </span>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 font-mono text-xs text-fg-subtle">
          <Link href="/" className="transition-colors hover:text-accent-2">
            ~
          </Link>
          <span>/</span>
          <Link href="/weeks" className="transition-colors hover:text-accent-2">
            weeks
          </Link>
          <span>/</span>
          <span className="text-fg">{week.slug}</span>
        </nav>

        <Reveal>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-accent-2">
              Week {pad2(week.number)}
            </span>
            <StatusBadge status={week.status} />
          </div>
          <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">{week.title}</p>
          <h1 className="max-w-4xl font-heading text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05]">
            <span className="text-accent-2">“</span>
            {week.question}
            <span className="text-accent-2">”</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted">{week.summary}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={13} /> asked {formatDate(week.askedOn)}
            </span>
            {week.publishedOn && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={13} /> published {formatDate(week.publishedOn)}
              </span>
            )}
            <span className="flex flex-wrap gap-1.5">
              {week.tools.map((t) => {
                const ic = toolIcon(t);
                return (
                  <Tag key={t}>
                    {ic && <Icon name={ic} size={11} />}
                    {t}
                  </Tag>
                );
              })}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <LinkButton href={links.notebook} icon="jupyter" label="Notebook" sub={links.notebook ? "analysis.ipynb" : "not linked yet"} />
            <LinkButton href={links.github ?? site.data.github} icon="github" label="Result CSVs" sub={`${week.slug}/ on GitHub`} />
            <LinkButton href={links.kaggle ?? site.data.kaggle} icon="kaggle" label="Raw dataset" sub={links.kaggle ? "on Kaggle" : "Kaggle profile"} />
            <LinkButton href={links.tweet} icon="x" label="The question" sub={links.tweet ? "original post on X" : "not linked yet"} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pending({ week }: { week: Week }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="card-base relative overflow-hidden p-8 text-center sm:p-14">
        <div className="dot-backdrop pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-lg">
          <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-border-strong bg-surface text-accent-2">
            <Icon name={week.status === "collecting" ? "radio" : "notebook"} size={22} />
          </span>
          <h2 className="font-heading text-2xl font-semibold">
            {week.status === "collecting" ? "Answers are still coming in" : "The notebook is running"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            {week.status === "collecting"
              ? "The question is live on X. Reply or vote there — the analysis and charts land here once the poll closes."
              : "Data's in and being cleaned. Charts, findings and the CSVs will appear on this page when the analysis is done."}
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href={week.links?.tweet ?? site.socials.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--fill),var(--fill-2))] px-5 py-2.5 text-sm font-medium text-on-fill"
            >
              <Icon name="x" size={14} />
              {week.status === "collecting" ? "Answer on X" : "Follow along on X"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Results({ week }: { week: LoadedWeek }) {
  const datasets = Object.values(week.datasets);
  return (
    <>
      {/* stats */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-border bg-border lg:grid-cols-4">
          {week.resolvedStats.map((s) => (
            <StaggerItem key={s.label} className="bg-surface px-5 py-5">
              <p className="text-xs text-fg-subtle">{s.label}</p>
              <p className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</p>
              {s.hint && <p className="mt-1 font-mono text-[0.68rem] text-fg-subtle">{s.hint}</p>}
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* findings */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <SectionLabel index="01">The answer</SectionLabel>
        <Stagger className="grid gap-3 md:grid-cols-2">
          {week.findings.map((f, i) => (
            <StaggerItem key={f} className="card-base prose-lab flex gap-4 p-5">
              <span className="font-display text-2xl leading-none text-accent-2">{pad2(i + 1)}</span>
              <p className="text-[0.95rem] leading-relaxed text-fg-muted">
                <Inline text={f} />
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* charts */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionLabel index="02">Figures</SectionLabel>
          <nav aria-label="Figures" className="mb-6 flex flex-wrap gap-1.5">
            {week.charts.map((c, i) => (
              <a
                key={c.id}
                href={`#chart-${c.id}`}
                className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-[0.68rem] text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2"
              >
                fig.{pad2(i + 1)}
              </a>
            ))}
          </nav>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {week.charts.map((c, i) => {
            const ds = week.datasets[c.csv];
            return ds ? (
              <Reveal key={c.id} className={cn(c.wide && "lg:col-span-2")}>
                <ChartCard spec={c} dataset={ds} index={i} />
              </Reveal>
            ) : null;
          })}
        </div>
      </section>

      {/* data */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <SectionLabel index="03">The data</SectionLabel>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Every table behind the figures above. Sort a column, filter rows, and download exactly the view you&apos;re
          looking at — or grab the originals from{" "}
          <a
            href={week.links?.github ?? site.data.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-[color-mix(in_oklab,var(--accent)_40%,transparent)] underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
        <DataExplorer datasets={datasets} />
      </section>

      {/* method */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <SectionLabel index="04">Method</SectionLabel>
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="prose-lab text-[0.95rem] leading-relaxed text-fg-muted">
            {week.methodology.map((p) => (
              <p key={p}>
                <Inline text={p} />
              </p>
            ))}
          </div>
          {week.caveats && week.caveats.length > 0 && (
            <aside className="h-fit rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_30%,transparent)] bg-accent-2-soft p-5">
              <p className="mb-3 flex items-center gap-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent-2">
                <Icon name="flask" size={13} /> Caveats
              </p>
              <ul className="prose-lab space-y-2 text-sm leading-relaxed text-fg-muted">
                {week.caveats.map((c) => (
                  <li key={c}>
                    <Inline text={c} />
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}

function Neighbours({ slug }: { slug: string }) {
  const { prev, next } = getNeighbours(slug);
  const card = (w: Week | undefined, dir: "prev" | "next") =>
    w ? (
      <Link
        href={`/weeks/${w.slug}`}
        className={cn(
          "group card-base flex flex-1 flex-col gap-1 p-5 transition-colors hover:border-accent-2",
          dir === "next" && "text-right",
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-fg-subtle",
            dir === "next" && "justify-end",
          )}
        >
          {dir === "prev" && <Icon name="arrow-left" size={12} />}
          Week {pad2(w.number)}
          {dir === "next" && <Icon name="arrow-right" size={12} />}
        </span>
        <span className="font-heading text-lg font-semibold transition-colors group-hover:text-accent-2">{w.title}</span>
      </Link>
    ) : (
      <span className="hidden flex-1 sm:block" />
    );

  return (
    <nav aria-label="More weeks" className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-20 sm:flex-row sm:px-6">
      {(prev || next) && card(prev, "prev")}
      {(prev || next) && card(next, "next")}
      {!prev && !next && (
        <Link
          href="/weeks"
          className="card-base flex flex-1 items-center justify-center gap-2 p-5 text-sm text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2"
        >
          <Icon name="grid" size={14} /> Back to the archive
        </Link>
      )}
    </nav>
  );
}

export default async function WeekPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const week = getWeek(slug);
  if (!week) notFound();

  return (
    <article>
      <Header week={week} />
      {week.status === "published" ? <Results week={loadWeek(week)} /> : <Pending week={week} />}
      <Neighbours slug={week.slug} />
    </article>
  );
}
