import type { WeekStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABEL: Record<WeekStatus, string> = {
  published: "Published",
  analysing: "Analysing",
  collecting: "Collecting answers",
};

/** Status always carries a label, never colour alone. */
export function StatusBadge({ status, className }: { status: WeekStatus; className?: string }) {
  const live = status !== "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] font-medium",
        live
          ? "border-[color-mix(in_oklab,var(--accent-2)_35%,transparent)] bg-accent-2-soft text-accent-2"
          : "border-border bg-surface-2 text-fg-muted",
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {live && <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-accent-2" />}
        <span className={cn("relative inline-flex size-1.5 rounded-full", live ? "bg-accent-2" : "bg-success")} />
      </span>
      {LABEL[status]}
    </span>
  );
}
