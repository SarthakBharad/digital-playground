"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Row } from "@/lib/types";

export interface NotebookPreview {
  path: string;
  columns: string[];
  head: Row[];
  shape: [number, number];
}

/**
 * A faux Jupyter cell that "runs" against the real CSVs of the latest week:
 * types `pd.read_csv(...)`, prints the head, then cycles to the next file.
 */
export function NotebookCell({ previews }: { previews: NotebookPreview[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(reduce ? Infinity : 0);
  const preview = previews[index % Math.max(previews.length, 1)];

  const code = preview
    ? [
        `df = pd.read_csv("${preview.path}")`,
        `df.head(${preview.head.length})  # ${preview.shape[0].toLocaleString("en-GB")} rows × ${preview.shape[1]} cols`,
      ].join("\n")
    : "";

  useEffect(() => {
    if (reduce || !preview) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setTyped(i);
      if (i >= code.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [code, reduce, preview]);

  useEffect(() => {
    if (previews.length < 2) return;
    const id = window.setTimeout(
      () => {
        setIndex((n) => (n + 1) % previews.length);
        setTyped(reduce ? Infinity : 0);
      },
      reduce ? 7000 : code.length * 28 + 5200,
    );
    return () => window.clearTimeout(id);
  }, [index, previews.length, code.length, reduce]);

  if (!preview) return null;
  const done = typed >= code.length;
  const shown = code.slice(0, typed);

  return (
    <div className="card-base relative overflow-hidden shadow-[0_40px_100px_-50px_var(--glow-a)]">
      {/* window chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-2/70 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--brand-vermilion)_75%,transparent)]" />
          <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--brand-sand)_80%,transparent)]" />
          <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--fg-subtle)_60%,transparent)]" />
        </span>
        <span className="flex min-w-0 items-center gap-1.5 truncate font-mono text-[0.7rem] text-fg-subtle">
          <Icon name="jupyter" size={12} className="text-accent-2" />
          analysis.ipynb
        </span>
        <span className="ml-auto font-mono text-[0.65rem] text-fg-subtle">Python 3 · idle</span>
      </div>

      <div className="space-y-3 p-4 font-mono text-[0.72rem] leading-relaxed sm:text-xs">
        {/* input */}
        <div className="flex gap-3">
          <span className="flex-none select-none text-accent">In [{index + 1}]:</span>
          <pre className="min-h-[2.6em] min-w-0 flex-1 whitespace-pre-wrap break-all text-fg">
            {shown.split(/(pd\.read_csv|df\.head|"[^"]*"|#.*$)/m).map((part, i) =>
              part.startsWith('"') ? (
                <span key={i} className="text-accent-2">
                  {part}
                </span>
              ) : part.startsWith("#") ? (
                <span key={i} className="text-fg-subtle">
                  {part}
                </span>
              ) : part === "pd.read_csv" || part === "df.head" ? (
                <span key={i} className="text-accent">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
            {!done && <span className="ml-px inline-block h-3.5 w-[2px] translate-y-0.5 animate-blink bg-accent-2" />}
          </pre>
        </div>

        {/* output */}
        <AnimatePresence mode="wait">
          {done && (
            <motion.div
              key={preview.path}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex gap-3"
            >
              <span className="flex-none select-none text-fg-subtle">Out[{index + 1}]:</span>
              <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-[0.68rem]">
                  <thead>
                    <tr className="bg-surface-2/60">
                      <th className="px-2 py-1 text-left font-normal text-fg-subtle" />
                      {preview.columns.map((c) => (
                        <th key={c} className="whitespace-nowrap px-2 py-1 text-right font-semibold text-fg">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.head.map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1 text-fg-subtle">{i}</td>
                        {preview.columns.map((c) => (
                          <td key={c} className="nums whitespace-nowrap px-2 py-1 text-right text-fg-muted">
                            {r[c] ?? "NaN"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
