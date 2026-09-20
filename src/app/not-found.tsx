import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[80svh] place-items-center overflow-hidden px-4 pt-16">
      <div className="grid-backdrop mask-radial-soft pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-lg">
        <div className="card-base overflow-hidden font-mono text-xs">
          <div className="border-b border-border bg-surface-2/70 px-4 py-2.5 text-fg-subtle">analysis.ipynb</div>
          <div className="space-y-2 p-5">
            <p>
              <span className="text-accent">In [404]:</span> <span className="text-fg">df.loc[&quot;this page&quot;]</span>
            </p>
            <p className="text-accent-2">KeyError: &apos;this page&apos;</p>
            <p className="text-fg-subtle"># No row with that label. Maybe it hasn&apos;t been asked yet.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--fill),var(--fill-2))] px-5 py-2.5 text-sm font-medium text-on-fill"
          >
            <Icon name="arrow-left" size={14} /> Back home
          </Link>
          <Link
            href="/weeks"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent-2 hover:text-accent-2"
          >
            <Icon name="grid" size={14} /> Browse the archive
          </Link>
        </div>
      </div>
    </section>
  );
}
