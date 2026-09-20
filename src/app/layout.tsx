import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import type { WeekLink } from "@/lib/nav";
import { site } from "@/lib/site";
import { getWeeks } from "@/lib/weeks";
import "./globals.css";

/** Fontshare serves Array, Chillax and Supreme. One stylesheet, three families. */
const FONTSHARE_CSS =
  "https://api.fontshare.com/v2/css?" +
  ["f[]=array@400,500,700", "f[]=chillax@400,500,600,700", "f[]=supreme@400,500,700,800"].join("&") +
  "&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.socials.portfolio }],
  creator: site.author.name,
  keywords: ["data analysis", "Jupyter", "pandas", "web development", "Next.js", "weekly question", "Sarthak Bharad"],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    creator: site.author.handle,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ee" },
    { media: "(prefers-color-scheme: dark)", color: "#140605" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const weekLinks: WeekLink[] = getWeeks().map(({ slug, number, title, status, tags }) => ({
    slug,
    number,
    title,
    status,
    tags,
  }));

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTSHARE_CSS} />
      </head>
      <body className="min-h-svh antialiased">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>
          <ScrollProgress />
          <Navbar weeks={weekLinks} />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
