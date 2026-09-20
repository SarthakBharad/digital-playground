"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { ChartTooltip, EmptyChart, OTHER, SERIES, useTooltip } from "@/components/charts/shared";
import { formatValue } from "@/lib/format";
import type { DonutChartSpec, Row } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Slice {
  label: string;
  value: number;
  color: string;
}

const SIZE = 220;
const R = 96;
const THICK = 26;
/** Surface-coloured gap between segments, in px along the arc */
const GAP = 2;

function arcPath(a0: number, a1: number, r: number, t: number) {
  const ri = r - t;
  const p = (a: number, rad: number) => [SIZE / 2 + rad * Math.sin(a), SIZE / 2 - rad * Math.cos(a)] as const;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = p(a0, r);
  const [x1, y1] = p(a1, r);
  const [x2, y2] = p(a1, ri);
  const [x3, y3] = p(a0, ri);
  return `M${x0},${y0}A${r},${r} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${ri},${ri} 0 ${large} 0 ${x3},${y3}Z`;
}

export function DonutChart({ spec, rows }: { spec: DonutChartSpec; rows: Row[] }) {
  const { tip, containerRef, showAtEvent, showAtElement, hide } = useTooltip();
  const [hover, setHover] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const slices = useMemo<Slice[]>(() => {
    const raw = rows
      .map((r) => ({ label: String(r[spec.label] ?? "—"), value: r[spec.value] }))
      .filter((s): s is { label: string; value: number } => typeof s.value === "number" && s.value > 0);
    // Keep the source order — colour follows the entity, not its rank.
    const max = Math.min(spec.maxSlices ?? 4, 4);
    if (raw.length <= max) return raw.map((s, i) => ({ ...s, color: SERIES[i] ?? OTHER }));
    const sorted = [...raw].sort((a, b) => b.value - a.value);
    const keep = new Set(sorted.slice(0, max - 1).map((s) => s.label));
    const kept = raw.filter((s) => keep.has(s.label)).map((s, i) => ({ ...s, color: SERIES[i] ?? OTHER }));
    const rest = raw.filter((s) => !keep.has(s.label)).reduce((n, s) => n + s.value, 0);
    return [...kept, { label: "Other", value: rest, color: OTHER }];
  }, [rows, spec.label, spec.value, spec.maxSlices]);

  const total = slices.reduce((n, s) => n + s.value, 0);
  if (!slices.length || total <= 0) return <EmptyChart>No positive values in “{spec.value}”.</EmptyChart>;

  const pctOf = (v: number) => (v / total) * 100;
  const gapAngle = GAP / R;
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((n, s) => n + (s.value / total) * Math.PI * 2, 0));
  const pad = slices.length > 1 ? gapAngle / 2 : 0;
  const arcs = slices.map((s, i) => {
    const sweep = (s.value / total) * Math.PI * 2;
    const a0 = (starts[i] ?? 0) + pad;
    const a1 = (starts[i] ?? 0) + sweep - pad;
    return { ...s, d: sweep >= Math.PI * 2 - 1e-6 ? null : arcPath(a0, Math.max(a1, a0 + 0.001), R, THICK) };
  });

  const tipFor = (s: Slice) => ({
    title: s.label,
    rows: [
      { label: spec.unit ?? spec.value, value: formatValue(s.value, spec.format) },
      { label: "of total", value: `${pctOf(s.value).toFixed(1)}%` },
    ],
  });

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <motion.svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-44 flex-none sm:w-52"
        role="img"
        aria-label={`${spec.title}. ${slices.map((s) => `${s.label} ${pctOf(s.value).toFixed(1)}%`).join(", ")}.`}
        initial={reduce ? false : { rotate: -90, opacity: 0 }}
        whileInView={{ rotate: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {arcs.map((a) =>
          a.d ? (
            <path
              key={a.label}
              d={a.d}
              fill={a.color}
              className={cn("cursor-pointer transition-opacity duration-200", hover && hover !== a.label && "opacity-35")}
              onPointerMove={(e) => {
                setHover(a.label);
                showAtEvent(e, tipFor(a));
              }}
              onPointerLeave={() => {
                setHover(null);
                hide();
              }}
            />
          ) : (
            <circle key={a.label} cx={SIZE / 2} cy={SIZE / 2} r={R - THICK / 2} fill="none" stroke={a.color} strokeWidth={THICK} />
          ),
        )}
        <text x={SIZE / 2} y={SIZE / 2 - 4} textAnchor="middle" className="fill-fg font-heading text-[26px] font-semibold">
          {formatValue(total, "compact")}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" className="fill-fg-subtle font-mono text-[10px] uppercase tracking-[0.18em]">
          {spec.unit ?? "total"}
        </text>
      </motion.svg>

      <ul className="w-full min-w-0 flex-1 space-y-1">
        {slices.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                hover === s.label ? "bg-surface-2" : "hover:bg-surface-2",
              )}
              onPointerEnter={(e) => {
                setHover(s.label);
                showAtElement(e.currentTarget, tipFor(s));
              }}
              onFocus={(e) => {
                setHover(s.label);
                showAtElement(e.currentTarget, tipFor(s));
              }}
              onPointerLeave={() => {
                setHover(null);
                hide();
              }}
              onBlur={() => {
                setHover(null);
                hide();
              }}
            >
              <span aria-hidden className="size-2.5 flex-none rounded-[3px]" style={{ background: s.color }} />
              <span className="min-w-0 flex-1 truncate text-sm text-fg-muted">{s.label}</span>
              <span className="nums text-sm font-semibold text-fg">{pctOf(s.value).toFixed(1)}%</span>
            </button>
          </li>
        ))}
      </ul>
      <ChartTooltip tip={tip} />
    </div>
  );
}
