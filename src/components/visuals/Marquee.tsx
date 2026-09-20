"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  items,
  reverse,
  speed = 48,
  className,
}: {
  items: readonly string[];
  reverse?: boolean;
  /** Seconds for one full loop. */
  speed?: number;
  className?: string;
}) {
  return (
    <div className={cn("mask-fade-x relative overflow-hidden py-3", className)}>
      <div
        className="marquee-track"
        style={{
          animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
        }}
      >
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {items.map((item, i) => (
              <span
                key={`${copy}-${item}`}
                aria-hidden={copy === 1}
                className="mx-5 inline-flex items-center gap-2 whitespace-nowrap font-mono text-xs font-medium"
                style={{
                  color: i % 3 === 0 ? "var(--accent)" : i % 3 === 1 ? "var(--accent-2)" : "var(--fg-subtle)",
                }}
              >
                <span className="inline-block size-1 rounded-full bg-current opacity-60" />
                {item}
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
