"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { ChartTooltip, EmptyChart, Legend, seriesColor, useElementWidth, useTooltip } from "@/components/charts/shared";
import { formatTick, formatValue, niceTicks } from "@/lib/format";
import type { LineChartSpec, Row } from "@/lib/types";

const HEIGHT = 280;
const M = { top: 16, right: 64, bottom: 36, left: 44 };

function toX(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

export function LineChart({ spec, rows }: { spec: LineChartSpec; rows: Row[] }) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>();
  const { tip, containerRef, setTip, hide } = useTooltip();
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const series = spec.series.slice(0, 4);
  const isDate = typeof rows[0]?.[spec.x] === "string";

  const points = useMemo(
    () =>
      rows
        .map((r) => ({ x: toX(r[spec.x]), raw: r[spec.x], ys: series.map((s) => r[s.column]) }))
        .filter((p): p is { x: number; raw: Row[string]; ys: Row[string][] } => p.x !== null && (!spec.logX || p.x > 0))
        .sort((a, b) => a.x - b.x),
    [rows, spec.x, spec.logX, series],
  );

  if (points.length < 2) return <EmptyChart>Not enough points to draw a line.</EmptyChart>;

  const innerW = width - M.left - M.right;
  const innerH = HEIGHT - M.top - M.bottom;
  const xs = points.map((p) => p.x);
  const x0 = xs[0] ?? 0;
  const x1 = xs[xs.length - 1] ?? 1;
  const fx = spec.logX
    ? (v: number) => ((Math.log10(v) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0))) * innerW
    : (v: number) => ((v - x0) / (x1 - x0 || 1)) * innerW;

  const allY = points.flatMap((p) => p.ys.filter((y): y is number => typeof y === "number"));
  if (spec.reference) allY.push(spec.reference.value);
  const yTicks = niceTicks(Math.min(...allY), Math.max(...allY), 5);
  const yLo = yTicks[0] ?? 0;
  const yHi = yTicks[yTicks.length - 1] ?? 1;
  const fy = (v: number) => innerH - ((v - yLo) / (yHi - yLo || 1)) * innerH;

  const xTicks = spec.logX
    ? [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000].filter((t) => t >= x0 && t <= x1)
    : isDate
      ? [x0, x0 + (x1 - x0) / 2, x1]
      : niceTicks(x0, x1, Math.max(2, Math.floor(innerW / 110))).filter((t) => t >= x0 && t <= x1);
  const fmtX = (v: number) =>
    isDate ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : formatTick(v);

  const paths = series.map((_, si) => {
    let d = "";
    let pen = false;
    points.forEach((p) => {
      const y = p.ys[si];
      if (typeof y !== "number") {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${fx(p.x).toFixed(1)},${fy(y).toFixed(1)}`;
      pen = true;
    });
    return d;
  });

  const nearest = (px: number) => {
    let best = 0;
    let dist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(fx(p.x) - px);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  };

  const show = (i: number) => {
    const p = points[i];
    if (!p) return;
    setActive(i);
    const firstY = p.ys.find((y): y is number => typeof y === "number") ?? yLo;
    setTip({
      x: M.left + fx(p.x),
      y: M.top + fy(firstY),
      title: `${spec.xLabel ?? spec.x} ${isDate ? String(p.raw) : formatValue(p.x)}`,
      rows: [
        ...series.map((s, si) => ({
          label: s.label,
          value: formatValue(p.ys[si], spec.format),
          color: seriesColor(si),
        })),
        ...(spec.reference ? [{ label: spec.reference.label, value: formatValue(spec.reference.value, spec.format) }] : []),
      ],
    });
  };

  const last = points[points.length - 1];

  return (
    <div ref={containerRef} className="relative">
      {series.length > 1 && (
        <Legend className="mb-3" items={series.map((s, i) => ({ label: s.label, color: seriesColor(i), shape: "line" }))} />
      )}
      <div ref={wrapRef}>
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`${spec.title}. Line chart of ${series.map((s) => s.label).join(", ")} by ${spec.xLabel ?? spec.x}.`}
          className="block max-w-full overflow-visible"
        >
          <g transform={`translate(${M.left},${M.top})`}>
            {yTicks.map((t) => (
              <g key={t} transform={`translate(0,${fy(t)})`}>
                <line x2={innerW} stroke="var(--chart-grid)" />
                <text x={-10} dy="0.32em" textAnchor="end" className="nums fill-fg-subtle font-mono text-[10px]">
                  {formatTick(t)}
                </text>
              </g>
            ))}
            <line y1={innerH} y2={innerH} x2={innerW} stroke="var(--chart-axis)" />
            {xTicks.map((t) => (
              <text
                key={t}
                x={fx(t)}
                y={innerH + 18}
                textAnchor="middle"
                className="nums fill-fg-subtle font-mono text-[10px]"
              >
                {fmtX(t)}
              </text>
            ))}
            {spec.xLabel && (
              <text x={innerW} y={innerH + 32} textAnchor="end" className="fill-fg-subtle text-[10px]">
                {spec.xLabel}
                {spec.logX ? " (log scale)" : ""}
              </text>
            )}

            {spec.reference && (
              <g>
                <line
                  x2={innerW}
                  y1={fy(spec.reference.value)}
                  y2={fy(spec.reference.value)}
                  stroke="var(--fg-subtle)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={innerW + 6}
                  y={fy(spec.reference.value)}
                  dy="0.32em"
                  className="fill-fg-muted text-[10px]"
                >
                  {spec.reference.label}
                </text>
              </g>
            )}

            {series.length === 1 && (
              <path
                d={`${paths[0]}L${innerW},${innerH}L${fx(x0)},${innerH}Z`}
                fill={seriesColor(0)}
                opacity={0.1}
              />
            )}

            {paths.map((d, si) => (
              <motion.path
                key={series[si]?.column}
                d={d}
                fill="none"
                stroke={seriesColor(si)}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}

            {/* end labels + dots */}
            {last &&
              series.map((s, si) => {
                const y = last.ys[si];
                if (typeof y !== "number") return null;
                return (
                  <g key={s.column}>
                    <circle cx={fx(last.x)} cy={fy(y)} r={4} fill={seriesColor(si)} stroke="var(--surface)" strokeWidth={2} />
                    {!spec.reference && (
                      <text x={fx(last.x) + 8} y={fy(y)} dy="0.32em" className="nums fill-fg text-[11px] font-medium">
                        {formatValue(y, spec.format)}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* crosshair */}
            {active !== null && points[active] && (
              <g pointerEvents="none">
                <line
                  x1={fx(points[active].x)}
                  x2={fx(points[active].x)}
                  y2={innerH}
                  stroke="var(--fg-subtle)"
                  strokeWidth={1}
                />
                {series.map((s, si) => {
                  const y = points[active]?.ys[si];
                  if (typeof y !== "number") return null;
                  return (
                    <circle
                      key={s.column}
                      cx={fx(points[active]!.x)}
                      cy={fy(y)}
                      r={4.5}
                      fill={seriesColor(si)}
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                  );
                })}
              </g>
            )}

            <rect
              width={innerW}
              height={innerH}
              fill="transparent"
              tabIndex={0}
              aria-label="Chart area — use the left and right arrow keys to step through points"
              className="cursor-crosshair outline-none focus-visible:stroke-[var(--accent-2)]"
              onPointerMove={(e) => {
                const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
                show(nearest(e.clientX - r.left));
              }}
              onPointerLeave={() => {
                setActive(null);
                hide();
              }}
              onFocus={() => show(active ?? points.length - 1)}
              onBlur={() => {
                setActive(null);
                hide();
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const step = e.shiftKey ? 10 : 1;
                  const next = (active ?? 0) + (e.key === "ArrowRight" ? step : -step);
                  show(Math.max(0, Math.min(points.length - 1, next)));
                }
              }}
            />
          </g>
        </svg>
      </div>
      <ChartTooltip tip={tip} width={width} />
    </div>
  );
}
