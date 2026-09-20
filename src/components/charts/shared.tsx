"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Categorical slots, fixed order, never cycled. Values live in globals.css
 * (--chart-1…4) with separate light/dark steps — both validated for CVD
 * separation and 3:1 contrast against the card surface.
 */
export const SERIES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"] as const;
export const OTHER = "var(--chart-other)";

export function seriesColor(i: number) {
  return SERIES[i] ?? OTHER;
}

/** Width of an element, tracked with ResizeObserver. */
export function useElementWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(240, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export interface TooltipState {
  x: number;
  y: number;
  title: string;
  rows: { label: string; value: string; color?: string }[];
}

/** Tooltip positioning relative to a `relative` container. */
export function useTooltip() {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showAtEvent = useCallback((event: { clientX: number; clientY: number }, content: Omit<TooltipState, "x" | "y">) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ ...content, x: event.clientX - rect.left, y: event.clientY - rect.top });
  }, []);

  const showAtElement = useCallback((el: Element, content: Omit<TooltipState, "x" | "y">) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!rect) return;
    setTip({ ...content, x: r.left + r.width / 2 - rect.left, y: r.top - rect.top });
  }, []);

  const hide = useCallback(() => setTip(null), []);

  return { tip, containerRef, showAtEvent, showAtElement, hide, setTip };
}

/**
 * Values lead, labels follow; series keyed with a short line, not a box.
 * Text is rendered through React (never innerHTML), so CSV strings are safe.
 */
export function ChartTooltip({ tip, width }: { tip: TooltipState | null; width?: number }) {
  if (!tip) return null;
  const flip = width !== undefined && tip.x > width - 180;
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-20 min-w-36 max-w-60 rounded-xl border border-border-strong bg-surface/95 px-3 py-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.45)] backdrop-blur"
      style={{
        left: tip.x,
        top: tip.y,
        transform: `translate(${flip ? "calc(-100% - 12px)" : "12px"}, calc(-100% - 8px))`,
      }}
    >
      <p className="mb-1 truncate font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fg-subtle">{tip.title}</p>
      <ul className="space-y-0.5">
        {tip.rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2">
            {r.color && <span className="h-[3px] w-3 flex-none rounded-full" style={{ background: r.color }} />}
            <span className="nums text-sm font-semibold text-fg">{r.value}</span>
            <span className="truncate text-xs text-fg-muted">{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Legend({ items, className }: { items: { label: string; color: string; shape?: "rect" | "line" }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 text-xs text-fg-muted">
          <span
            aria-hidden
            className={cn(it.shape === "line" ? "h-[2px] w-4 rounded-full" : "size-2.5 rounded-[3px]")}
            style={{ background: it.color }}
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export function EmptyChart({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-48 place-items-center rounded-xl border border-dashed border-border-strong text-sm text-fg-subtle">
      {children}
    </div>
  );
}
