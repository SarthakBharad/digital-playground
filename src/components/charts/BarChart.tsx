"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { ChartTooltip, EmptyChart, OTHER, SERIES, useTooltip } from "@/components/charts/shared";
import { formatTick, formatValue, niceTicks } from "@/lib/format";
import type { BarChartSpec, Row } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Bar {
  key: string;
  label: string;
  value: number;
}

function prepare(spec: BarChartSpec, rows: Row[]): Bar[] {
  const bars = rows
    .map((r, i) => ({ key: `${i}`, label: String(r[spec.x] ?? "—"), value: r[spec.y] }))
    .filter((b): b is Bar => typeof b.value === "number");
  const sort = spec.sort ?? "desc";
  if (sort === "desc") bars.sort((a, b) => b.value - a.value);
  if (sort === "asc") bars.sort((a, b) => a.value - b.value);
  return spec.limit ? bars.slice(0, spec.limit) : bars;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function BarChart({ spec, rows }: { spec: BarChartSpec; rows: Row[] }) {
  const bars = useMemo(() => prepare(spec, rows), [spec, rows]);
  const { tip, containerRef, showAtElement, hide } = useTooltip();
  const reduce = useReducedMotion();

  if (!bars.length) return <EmptyChart>No numeric values in “{spec.y}”.</EmptyChart>;

  const min = Math.min(0, ...bars.map((b) => b.value));
  const ticks = niceTicks(min, Math.max(...bars.map((b) => b.value)), 4);
  const lo = ticks[0] ?? 0;
  const hi = ticks[ticks.length - 1] ?? 1;
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const zero = pct(0);
  const highlight = new Set(spec.highlight ?? []);
  const colorFor = (b: Bar) => (highlight.size === 0 || highlight.has(b.label) ? SERIES[0] : OTHER);
  const unit = spec.unit ? ` ${spec.unit}` : "";
  const fmt = (v: number) => formatValue(v, spec.format);

  const focusProps = (b: Bar) => ({
    tabIndex: 0,
    "aria-label": `${b.label}: ${fmt(b.value)}${unit}`,
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) =>
      showAtElement(e.currentTarget, { title: b.label, rows: [{ label: spec.unit ?? spec.y, value: fmt(b.value) }] }),
    onFocus: (e: React.FocusEvent<HTMLElement>) =>
      showAtElement(e.currentTarget, { title: b.label, rows: [{ label: spec.unit ?? spec.y, value: fmt(b.value) }] }),
    onPointerLeave: hide,
    onBlur: hide,
  });

  /* ------------------------------------------------------------ vertical */
  if (spec.orientation === "vertical") {
    return (
      <div ref={containerRef} className="relative pt-4" onPointerLeave={hide}>
        <div className="flex gap-2">
          {/* y ticks */}
          <div className="relative h-60 w-10 flex-none">
            {ticks.map((t) => (
              <span
                key={t}
                className="nums absolute right-0 -translate-y-1/2 font-mono text-[0.65rem] text-fg-subtle"
                style={{ bottom: `${pct(t)}%` }}
              >
                {formatTick(t)}
              </span>
            ))}
          </div>
          <div className="relative h-60 flex-1">
            {ticks.map((t) => (
              <span
                key={t}
                aria-hidden
                className="absolute inset-x-0 h-px"
                style={{ bottom: `${pct(t)}%`, background: t === 0 ? "var(--chart-axis)" : "var(--chart-grid)" }}
              />
            ))}
            <div className="absolute inset-0 flex items-stretch justify-around gap-[2px]">
              {bars.map((b, i) => {
                const h = Math.abs(pct(b.value) - zero);
                const up = b.value >= 0;
                return (
                  <div
                    key={b.key}
                    {...focusProps(b)}
                    className="group relative flex min-w-0 flex-1 justify-center outline-none"
                  >
                    <motion.div
                      className="absolute w-full max-w-6 transition-[filter] group-hover:brightness-110 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent-2"
                      style={{
                        background: colorFor(b),
                        height: `${Math.max(h, 0.4)}%`,
                        bottom: up ? `${zero}%` : undefined,
                        top: up ? undefined : `${100 - zero}%`,
                        borderRadius: up ? "4px 4px 0 0" : "0 0 4px 4px",
                        transformOrigin: up ? "bottom" : "top",
                      }}
                      initial={reduce ? false : { scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.7, delay: i * 0.04, ease: EASE }}
                    />
                    <span
                      className="nums pointer-events-none absolute -translate-y-full pb-1 text-[0.7rem] font-medium text-fg-muted"
                      style={{ bottom: `${up ? zero + h : zero}%` }}
                    >
                      {formatTick(b.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="ml-12 mt-2 flex justify-around gap-[2px]">
          {bars.map((b) => (
            <span key={b.key} className="min-w-0 flex-1 truncate text-center text-[0.7rem] text-fg-muted" title={b.label}>
              {b.label}
            </span>
          ))}
        </div>
        <ChartTooltip tip={tip} />
      </div>
    );
  }

  /* ---------------------------------------------------------- horizontal */
  return (
    <div ref={containerRef} className="relative" onPointerLeave={hide}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
        {bars.map((b, i) => {
          const left = Math.min(pct(b.value), zero);
          const width = Math.abs(pct(b.value) - zero);
          const up = b.value >= 0;
          return (
            <div key={b.key} className="contents">
              <span className="max-w-[6.5rem] truncate py-[5px] text-right text-xs text-fg-muted sm:max-w-[10rem]" title={b.label}>
                {b.label}
              </span>
              <div {...focusProps(b)} className="group relative h-8 outline-none">
                {/* track reserves 4rem on the right for the value label */}
                <div className="absolute inset-y-0 left-0 right-16">
                  {i === 0 &&
                    ticks.map((t) => (
                      <span
                        key={t}
                        aria-hidden
                        className="absolute w-px"
                        style={{
                          left: `${pct(t)}%`,
                          top: 0,
                          height: `calc(${bars.length} * 2rem)`,
                          background: t === 0 ? "var(--chart-axis)" : "var(--chart-grid)",
                        }}
                      />
                    ))}
                  <motion.div
                    className={cn(
                      "absolute inset-y-[6px] transition-[filter] group-hover:brightness-110",
                      "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent-2",
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 0.4)}%`,
                      background: colorFor(b),
                      borderRadius: up ? "0 4px 4px 0" : "4px 0 0 4px",
                      transformOrigin: up ? "left" : "right",
                    }}
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: EASE }}
                  />
                  <span
                    className="nums pointer-events-none absolute top-1/2 -translate-y-1/2 pl-2 text-xs font-medium text-fg"
                    style={{ left: `${up ? left + width : zero}%` }}
                  >
                    {formatTick(b.value)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {/* x ticks */}
        <span />
        <div className="relative mt-1 h-4">
          <div className="absolute inset-y-0 left-0 right-16">
            {ticks.map((t, ti) => (
              <span
                key={t}
                className={cn(
                  "nums absolute -translate-x-1/2 font-mono text-[0.65rem] text-fg-subtle",
                  ti % 2 === 1 && "hidden sm:inline",
                )}
                style={{ left: `${pct(t)}%` }}
              >
                {formatTick(t)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ChartTooltip tip={tip} />
    </div>
  );
}
