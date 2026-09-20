"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toCsv } from "@/lib/csv";
import { formatValue } from "@/lib/format";
import type { Cell, Dataset } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE = 12;

function compare(a: Cell | undefined, b: Cell | undefined) {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "en", { numeric: true });
}

/** Tabs across a week's CSVs, with search, sort, paging and "download this view". */
export function DataExplorer({ datasets }: { datasets: Dataset[] }) {
  const [active, setActive] = useState(datasets[0]?.file ?? "");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ col: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const ds = datasets.find((d) => d.file === active) ?? datasets[0];

  const filtered = useMemo(() => {
    if (!ds) return [];
    const q = query.trim().toLowerCase();
    let rows = q
      ? ds.rows.filter((r) => ds.columns.some((c) => String(r[c] ?? "").toLowerCase().includes(q)))
      : ds.rows;
    if (sort) rows = [...rows].sort((a, b) => compare(a[sort.col], b[sort.col]) * sort.dir);
    return rows;
  }, [ds, query, sort]);

  if (!ds) return null;

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE, current * PAGE + PAGE);
  const numericCols = new Set(ds.columns.filter((c) => ds.rows.some((r) => typeof r[c] === "number")));

  const downloadView = () => {
    const blob = new Blob([toCsv(ds.columns, filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ds.file.replace(/\.csv$/, "") + (query || sort ? "_view.csv" : ".csv");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-base overflow-hidden">
      {/* tabs */}
      <div role="tablist" aria-label="Datasets" className="flex gap-1 overflow-x-auto border-b border-border bg-surface-2/60 p-1.5">
        {datasets.map((d) => (
          <button
            key={d.file}
            role="tab"
            type="button"
            aria-selected={d.file === ds.file}
            onClick={() => {
              setActive(d.file);
              setQuery("");
              setSort(null);
              setPage(0);
            }}
            className={cn(
              "flex flex-none items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs transition-colors",
              d.file === ds.file ? "bg-surface text-fg shadow-sm" : "text-fg-subtle hover:text-fg",
            )}
          >
            <Icon name="csv" size={12} className={d.file === ds.file ? "text-accent-2" : undefined} />
            {d.file}
          </button>
        ))}
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5 focus-within:border-accent-2">
          <Icon name="search" size={13} className="text-fg-subtle" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={`Filter ${ds.rows.length.toLocaleString("en-GB")} rows…`}
            aria-label="Filter rows"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-fg-subtle"
          />
        </label>
        <span className="nums font-mono text-[0.7rem] text-fg-subtle">
          {filtered.length.toLocaleString("en-GB")} × {ds.columns.length}
        </span>
        <button
          type="button"
          onClick={downloadView}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 font-mono text-[0.7rem] text-fg-muted transition-colors hover:border-accent-2 hover:text-accent-2"
        >
          <Icon name="download" size={12} />
          {query || sort ? "download view" : "download csv"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2/40">
              <th className="w-10 px-3 py-2 text-right font-mono text-[0.65rem] font-normal text-fg-subtle">#</th>
              {ds.columns.map((c) => {
                const dir = sort?.col === c ? sort.dir : 0;
                return (
                  <th
                    key={c}
                    aria-sort={dir === 1 ? "ascending" : dir === -1 ? "descending" : "none"}
                    className={cn("px-3 py-2 font-medium", numericCols.has(c) ? "text-right" : "text-left")}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) => (s?.col !== c ? { col: c, dir: -1 } : s.dir === -1 ? { col: c, dir: 1 } : null))
                      }
                      className={cn(
                        "inline-flex items-center gap-1 font-mono text-[0.7rem] transition-colors hover:text-accent-2",
                        dir ? "text-accent-2" : "text-fg-subtle",
                      )}
                    >
                      {c}
                      <Icon name={dir === 1 ? "arrow-up" : dir === -1 ? "arrow-down" : "arrow-up-down"} size={11} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={i} className="border-t border-border transition-colors hover:bg-accent-soft">
                <td className="nums px-3 py-2 text-right font-mono text-[0.7rem] text-fg-subtle">
                  {current * PAGE + i + 1}
                </td>
                {ds.columns.map((c) => (
                  <td key={c} className={cn("whitespace-nowrap px-3 py-2", numericCols.has(c) ? "nums text-right text-fg" : "text-fg-muted")}>
                    {formatValue(r[c], "raw")}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={ds.columns.length + 1} className="px-3 py-10 text-center text-sm text-fg-subtle">
                  No rows match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 font-mono text-[0.7rem] text-fg-subtle">
          <span>
            page {current + 1} / {pages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              aria-label="Previous page"
              className="grid size-7 place-items-center rounded-full border border-border transition-colors hover:border-accent-2 hover:text-accent-2 disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon name="arrow-left" size={12} />
            </button>
            <button
              type="button"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
              aria-label="Next page"
              className="grid size-7 place-items-center rounded-full border border-border transition-colors hover:border-accent-2 hover:text-accent-2 disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon name="arrow-right" size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
