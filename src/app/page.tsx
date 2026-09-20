import { Archive } from "@/components/home/Archive";
import { Hero } from "@/components/home/Hero";
import { LatestExperiment, Loop, OpenData } from "@/components/home/Sections";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import { getArchive, getLatestPublished, getPreviews, getTotals, getWeeks, loadWeek } from "@/lib/weeks";

export default function HomePage() {
  const latestWeek = getLatestPublished();
  const latest = latestWeek ? loadWeek(latestWeek) : undefined;
  const live = getWeeks().find((w) => w.status !== "published");
  const archive = getArchive();

  return (
    <>
      <Hero
        totals={getTotals()}
        latest={latest && { slug: latest.slug, number: latest.number, title: latest.title }}
        live={live && { slug: live.slug, number: live.number, title: live.title, status: live.status }}
        previews={latest ? getPreviews(latest) : []}
      />

      {latest && <LatestExperiment week={latest} />}

      <Loop />

      <section id="archive" className="relative scroll-mt-16 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader
            index="03"
            eyebrow="Archive"
            title="Every question so far"
            description="Search by keyword, filter by tag or status. Weeks still collecting answers show up here too."
            aside={
              <Link
                href="/weeks"
                className="group inline-flex items-center gap-2 font-mono text-xs text-fg-muted transition-colors hover:text-accent-2"
              >
                full archive
                <Icon name="arrow-right" size={12} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <Archive weeks={archive} limit={6} />
        </div>
      </section>

      <OpenData />
    </>
  );
}
