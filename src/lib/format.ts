import type { Cell, ValueFormat } from "@/lib/types";

const nf = new Intl.NumberFormat("en-GB");
/**
 * Hand-rolled compact notation (12.9K, 4.2M). Intl's `notation: "compact"`
 * differs between Node and some browsers' ICU data, which breaks hydration.
 */
const compact = {
  format(v: number): string {
    const abs = Math.abs(v);
    const units: [number, string][] = [
      [1e9, "B"],
      [1e6, "M"],
      [1e3, "K"],
    ];
    for (const [size, suffix] of units) {
      if (abs >= size) {
        const n = v / size;
        return `${Number(n.toFixed(Math.abs(n) >= 100 ? 0 : 1))}${suffix}`;
      }
    }
    return nf.format(v);
  },
};
const decimal = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

export function formatValue(value: Cell | undefined, format: ValueFormat = "number"): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  switch (format) {
    case "compact":
      return Math.abs(value) >= 10_000 ? compact.format(value) : nf.format(value);
    case "percent":
      return `${decimal.format(value)}%`;
    case "decimal":
      return decimal.format(value);
    case "raw":
      return String(value);
    default:
      return Number.isInteger(value) ? nf.format(value) : decimal.format(value);
  }
}

/** Tick labels: short and round. */
export function formatTick(value: number): string {
  if (Math.abs(value) >= 10_000) return compact.format(value);
  return Number.isInteger(value) ? nf.format(value) : decimal.format(value);
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

/** Nice round ticks from 0 (or min) to max. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) {
    max = min + 1;
  }
  const span = max - min;
  const rough = span / count;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}
