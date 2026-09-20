import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { weeks as allWeeks } from "@/content/weeks";
import { parseCsv } from "@/lib/csv";
import { formatValue } from "@/lib/format";
import type { Aggregate, ChartSpec, Dataset, LoadedWeek, Row, StatSpec, Week } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

/** Newest first. */
export function getWeeks(): Week[] {
  return [...allWeeks].sort((a, b) => b.number - a.number);
}

export function getWeek(slug: string): Week | undefined {
  return allWeeks.find((w) => w.slug === slug);
}

/** The newest week that has results to show. */
export function getLatestPublished(): Week | undefined {
  return getWeeks().find((w) => w.status === "published");
}

export function getNeighbours(slug: string) {
  const ordered = [...allWeeks].sort((a, b) => a.number - b.number);
  const i = ordered.findIndex((w) => w.slug === slug);
  return { prev: i > 0 ? ordered[i - 1] : undefined, next: i >= 0 ? ordered[i + 1] : undefined };
}

/* ---------------------------------------------------------------- loading */

function csvFilesFor(week: Week): string[] {
  const files = new Set<string>();
  week.charts.forEach((c) => files.add(c.csv));
  week.stats.forEach((s) => s.from && files.add(s.from.csv));
  return [...files];
}

function loadDataset(slug: string, file: string): Dataset {
  const full = path.join(DATA_DIR, slug, file);
  if (!existsSync(full)) {
    throw new Error(
      `[playground] ${slug}: "${file}" is referenced by a chart or stat but public/data/${slug}/${file} doesn't exist.`,
    );
  }
  const { columns, rows } = parseCsv(readFileSync(full, "utf8"));
  return { file, href: `/data/${slug}/${file}`, columns, rows };
}

function assertColumns(week: Week, chart: ChartSpec, ds: Dataset) {
  const needed =
    chart.kind === "bar"
      ? [chart.x, chart.y]
      : chart.kind === "line"
        ? [chart.x, ...chart.series.map((s) => s.column)]
        : [chart.label, chart.value];
  const missing = needed.filter((c) => !ds.columns.includes(c));
  if (missing.length) {
    throw new Error(
      `[playground] ${week.slug} › chart "${chart.id}": column(s) ${missing.join(", ")} not found in ${ds.file}. ` +
        `Available: ${ds.columns.join(", ")}`,
    );
  }
}

function aggregate(rows: Row[], column: string, agg: Aggregate): number {
  const nums = rows.map((r) => r[column]).filter((v): v is number => typeof v === "number");
  if (agg === "count") return rows.length;
  if (!nums.length) return 0;
  switch (agg) {
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "mean":
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    case "max":
      return Math.max(...nums);
    case "min":
      return Math.min(...nums);
  }
}

function resolveStat(stat: StatSpec, datasets: Record<string, Dataset>) {
  if (stat.from) {
    const ds = datasets[stat.from.csv];
    const v = ds ? aggregate(ds.rows, stat.from.column, stat.from.agg) : null;
    return { label: stat.label, value: formatValue(v, stat.format ?? "compact"), hint: stat.hint };
  }
  const value =
    typeof stat.value === "number" ? formatValue(stat.value, stat.format ?? "compact") : (stat.value ?? "—");
  return { label: stat.label, value, hint: stat.hint };
}

export function loadWeek(week: Week): LoadedWeek {
  const datasets: Record<string, Dataset> = {};
  for (const file of csvFilesFor(week)) {
    datasets[file] = loadDataset(week.slug, file);
  }
  for (const chart of week.charts) {
    const ds = datasets[chart.csv];
    if (ds) assertColumns(week, chart, ds);
  }
  const rowCount = Object.values(datasets).reduce((n, d) => n + d.rows.length, 0);
  return {
    ...week,
    datasets,
    rowCount,
    resolvedStats: week.stats.map((s) => resolveStat(s, datasets)),
  };
}

/** Numbers for the home page counters. */
export function getTotals() {
  const list = getWeeks();
  const published = list.filter((w) => w.status === "published");
  let rows = 0;
  let files = 0;
  let charts = 0;
  for (const w of published) {
    const loaded = loadWeek(w);
    rows += loaded.rowCount;
    files += Object.keys(loaded.datasets).length;
    charts += w.charts.length;
  }
  return { questions: list.length, published: published.length, rows, files, charts };
}

/** Serializable card data for the archive grid. */
export function getArchive() {
  return getWeeks().map((w) => {
    const loaded = w.status === "published" ? loadWeek(w) : undefined;
    return {
      slug: w.slug,
      number: w.number,
      title: w.title,
      question: w.question,
      summary: w.summary,
      status: w.status,
      askedOn: w.askedOn,
      tags: w.tags,
      charts: w.charts.length,
      rows: loaded?.rowCount ?? 0,
    };
  });
}

/** First rows of each CSV, for the hero's notebook cell. */
export function getPreviews(week: LoadedWeek) {
  return Object.values(week.datasets).map((d) => ({
    path: `${week.slug}/${d.file}`,
    columns: d.columns.slice(0, 4),
    head: d.rows.slice(0, 4),
    shape: [d.rows.length, d.columns.length] as [number, number],
  }));
}
