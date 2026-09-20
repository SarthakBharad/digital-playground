"use client";

import { useState } from "react";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { Icon } from "@/components/ui/Icon";
import { formatValue } from "@/lib/format";
import type { ChartSpec, Dataset } from "@/lib/types";
import { cn, pad2 } from "@/lib/utils";

export function Chart({ spec, dataset }: { spec: ChartSpec; dataset: Dataset }) {
  switch (spec.kind) {
    case "bar":
      return <BarChart spec={spec} rows={dataset.rows} />;
    case "line":
      return <LineChart spec={spec} rows={dataset.rows} />;
    case "donut":
      return <DonutChart spec={spec} rows={dataset.rows} />;
  }
}

function columnsFor(spec: ChartSpec): string[] {
  if (spec.kind === "bar") return [spec.x, spec.y];
  if (spec.kind === "line") return [spec.x, ...spec.series.map((s) => s.column)];
  return [spec.label, spec.value];
}

const KIND_ICON = { bar: "chart-bar", line: "chart-line", donut: "chart-pie" } as const;

export function ChartCard({ spec, dataset, index }: { spec: ChartSpec; dataset: Dataset; index: number }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const cols = columnsFor(spec);

  return (
    <figure
      id={`chart-${spec.id}`}
      className={cn("card-base flex scroll-mt-24 flex-col p-5 sm:p-6", spec.wide && "lg:col-span-2")}
    >
      <figcaption className="mb-5">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
            <Icon name={KIND_ICON[spec.kind]} size={12} className="text-accent-2" />
            Fig. {pad2(index + 1)}
          </p>
          <div className="flex items-center gap-1.5">
            <div role="tablist" aria-label="View" className="flex rounded-full border border-border bg-surface-2 p-0.5">
              {(["chart", "table"] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  type="button"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[0.65rem] transition-colors",
                    view === v ? "bg-surface text-fg shadow-sm" : "text-fg-subtle hover:text-fg",
                  )}
                >
                  <Icon name={v === "chart" ? KIND_ICON[spec.kind] : "table"} size={11} />
                  {v}
                </button>
              ))}
            </div>
            <a
              href={dataset.href}
              download
              aria-label={`Download ${dataset.file}`}
              title={`Download ${dataset.file}`}
              className="grid size-7 place-items-center rounded-full border border-border bg-surface-2 text-fg-subtle transition-colors hover:border-accent-2 hover:text-accent-2"
            >
              <Icon name="download" size={12} />
            </a>
          </div>
        </div>
        <h3 className="font-heading text-lg font-semibold leading-snug">{spec.title}</h3>
        {spec.caption && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-muted">{spec.caption}</p>}
      </figcaption>

      <div className="flex-1">
        {view === "chart" ? (
          <Chart spec={spec} dataset={dataset} />
        ) : (
          <div className="max-h-80 overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-2">
                <tr>
                  {cols.map((c) => (
                    <th key={c} className="px-3 py-2 text-left font-mono text-[0.7rem] font-medium text-fg-subtle">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    {cols.map((c) => (
                      <td key={c} className={cn("px-3 py-1.5", typeof r[c] === "number" ? "nums text-right" : "text-fg-muted")}>
                        {formatValue(r[c], "raw")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 border-t border-border pt-3 font-mono text-[0.65rem] text-fg-subtle">
        source · {dataset.file} · {dataset.rows.length.toLocaleString("en-GB")} rows
      </p>
    </figure>
  );
}
