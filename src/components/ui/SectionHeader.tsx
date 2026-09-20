"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  aside?: ReactNode;
  className?: string;
}

export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  aside,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12", className)}>
      <Reveal className="mb-8 flex items-center gap-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent-2">
          {index}
        </span>
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-fg-muted">
          {eyebrow}
        </span>
        <span className="h-px w-16 flex-none bg-[linear-gradient(90deg,var(--accent-2),transparent)]" />
      </Reveal>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <Reveal delay={0.06}>
          <h2 className="font-heading text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
          {description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
              {description}
            </p>
          )}
        </Reveal>
        {aside && <Reveal delay={0.12}>{aside}</Reveal>}
      </div>
    </div>
  );
}
