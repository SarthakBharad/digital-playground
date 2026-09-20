import Link from "next/link";
import { cn } from "@/lib/utils";

/** "Sarthak's Digital Playground" in Array, with the blinking prompt caret. */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Sarthak's Digital Playground — home"
      className={cn("group flex items-baseline gap-1 font-display tracking-tight", className)}
    >
      <span className="text-gradient">Sarthak&apos;s</span>
      <span className="text-fg-muted transition-colors group-hover:text-fg">
        {compact ? (
          <>
            <span className="hidden sm:inline">Digital </span>Playground
          </>
        ) : (
          "Digital Playground"
        )}
      </span>
      <span className="ml-0.5 inline-block h-[1.05em] w-[2px] animate-blink bg-accent-2 align-middle" />
    </Link>
  );
}
