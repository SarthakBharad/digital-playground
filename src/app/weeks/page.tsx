import type { Metadata } from "next";
import { Archive } from "@/components/home/Archive";
import { Reveal } from "@/components/ui/Reveal";
import { getArchive, getTotals } from "@/lib/weeks";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every weekly question so far — searchable, filterable, with the analytics one click away.",
  alternates: { canonical: "/weeks" },
};

export default function WeeksPage() {
  const archive = getArchive();
  const totals = getTotals();

  return (
    <section className="relative overflow-hidden pb-24 pt-28">
      <div className="grid-backdrop mask-radial-soft pointer-events-none absolute inset-x-0 top-0 h-[28rem]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="mb-4 font-mono text-xs text-fg-subtle">
            <span className="text-accent-2">$</span> ls ./weeks <span className="text-fg-muted">--sort=newest</span>
          </p>
          <h1 className="font-heading text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.02]">
            The <span className="text-gradient">archive</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
            {totals.questions} question{totals.questions === 1 ? "" : "s"} asked, {totals.published} answered with data,{" "}
            {totals.rows.toLocaleString("en-GB")} rows of CSV behind the charts. One more every week.
          </p>
        </Reveal>
        <div className="mt-12">
          <Archive weeks={archive} />
        </div>
      </div>
    </section>
  );
}
