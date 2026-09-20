import Link from "next/link";
import { Wordmark } from "@/components/layout/Wordmark";
import { Icon, type IconKey } from "@/components/ui/Icon";
import { navItems } from "@/lib/nav";
import { site } from "@/lib/site";

const elsewhere: { label: string; href: string; icon: IconKey }[] = [
  { label: "Analytics CSVs", href: site.data.github, icon: "github" },
  { label: "Kaggle datasets", href: site.data.kaggle, icon: "kaggle" },
  { label: "Questions on X", href: site.socials.x, icon: "x" },
  { label: "Portfolio", href: site.socials.portfolio, icon: "arrow-up-right" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-soft">
      <div className="dot-backdrop pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark className="text-xl" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
              One question a week, answered with data. A practice log for web development and
              analysis — every notebook, CSV and chart made in public.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 font-mono text-[0.7rem] text-fg-subtle">
              <span className="size-1.5 rounded-full bg-accent-2" />
              new question every week on {site.author.handle}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">Explore</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-fg-muted transition-colors hover:text-accent-2">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">Elsewhere</p>
            <ul className="space-y-2 text-sm">
              {elsewhere.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-fg-muted transition-colors hover:text-accent-2"
                  >
                    <Icon name={l.icon} size={13} />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-fg-subtle sm:flex-row">
          <p>
            © {year} {site.author.name} · Data is shared for learning — check each week&apos;s licence on Kaggle
          </p>
          <p className="font-mono">
            Next.js · TypeScript · Tailwind · <span className="text-accent-2">⌘K</span> to jump around
          </p>
        </div>
      </div>
    </footer>
  );
}
