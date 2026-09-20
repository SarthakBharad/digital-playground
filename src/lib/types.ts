/** A parsed CSV cell. Numeric-looking strings are coerced to numbers. */
export type Cell = string | number | null;
export type Row = Record<string, Cell>;

export interface Dataset {
  /** File name inside public/data/<slug>/, e.g. "face_counts.csv" */
  file: string;
  /** Public URL, used for the download buttons */
  href: string;
  columns: string[];
  rows: Row[];
}

export type WeekStatus = "published" | "analysing" | "collecting";

export type ValueFormat = "number" | "compact" | "percent" | "decimal" | "raw";

/* ---------------------------------------------------------------- charts */

interface ChartBase {
  /** Stable id — used for anchors (#chart-<id>) */
  id: string;
  title: string;
  /** One sentence saying what the reader should see. */
  caption?: string;
  /** CSV file this chart reads, relative to the week's data folder */
  csv: string;
  /** Wider cards span both columns of the chart grid */
  wide?: boolean;
}

export interface BarChartSpec extends ChartBase {
  kind: "bar";
  /** Category column */
  x: string;
  /** Numeric column */
  y: string;
  orientation?: "horizontal" | "vertical";
  sort?: "desc" | "asc" | "none";
  /** Show only the first N rows after sorting */
  limit?: number;
  /** Category values drawn in the accent; the rest recede */
  highlight?: string[];
  format?: ValueFormat;
  /** Axis/tooltip label for the value, e.g. "votes" */
  unit?: string;
}

export interface LineChartSpec extends ChartBase {
  kind: "line";
  /** Numeric (or ISO date) column for the x-axis */
  x: string;
  /** One or more numeric columns — each becomes a series (max 4) */
  series: { column: string; label: string }[];
  /** Horizontal reference line, e.g. an expected value */
  reference?: { value: number; label: string };
  xLabel?: string;
  format?: ValueFormat;
  /** Log-scale the x-axis (handy for convergence plots) */
  logX?: boolean;
}

export interface DonutChartSpec extends ChartBase {
  kind: "donut";
  label: string;
  value: string;
  /** Anything past this many slices is folded into "Other" (max 4) */
  maxSlices?: number;
  format?: ValueFormat;
  unit?: string;
}

export type ChartSpec = BarChartSpec | LineChartSpec | DonutChartSpec;

/* ---------------------------------------------------------------- stats */

export type Aggregate = "sum" | "mean" | "max" | "min" | "count";

export interface StatSpec {
  label: string;
  /** Either a fixed value from the notebook… */
  value?: string | number;
  /** …or computed from a CSV at build time */
  from?: { csv: string; column: string; agg: Aggregate };
  format?: ValueFormat;
  /** Small line under the number */
  hint?: string;
}

/* ---------------------------------------------------------------- week */

export interface Week {
  /** URL segment, e.g. "week-01". Also the folder name in public/data/. */
  slug: string;
  number: number;
  /** The question, exactly as asked. */
  question: string;
  /** Short title for cards and the browser tab */
  title: string;
  /** One or two sentences for cards and meta descriptions */
  summary: string;
  status: WeekStatus;
  /** ISO date the question went out */
  askedOn: string;
  /** ISO date the analysis was published */
  publishedOn?: string;
  tags: string[];
  /** Tools used in the notebook — shown as chips */
  tools: string[];
  links?: {
    /** The tweet / X post that asked the question */
    tweet?: string;
    /** Folder in the analytics repo holding this week's CSVs */
    github?: string;
    /** The notebook itself (GitHub renders .ipynb) */
    notebook?: string;
    /** The Kaggle dataset with the raw data */
    kaggle?: string;
  };
  /** Pull-quote bullets — the answer, in plain words. `**bold**` and `code` work. */
  findings: string[];
  /** Paragraphs. `**bold**`, `code` and [links](https://…) work. */
  methodology: string[];
  /** Optional caveats shown under the methodology */
  caveats?: string[];
  stats: StatSpec[];
  charts: ChartSpec[];
}

/** What the pages receive: the week plus its parsed CSVs. */
export interface LoadedWeek extends Week {
  datasets: Record<string, Dataset>;
  resolvedStats: { label: string; value: string; hint?: string }[];
  rowCount: number;
}
