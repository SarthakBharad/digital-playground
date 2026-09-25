/**
 * Identity + the two links every page points at.
 *
 * TODO: once the repos exist, replace `data.github` and `data.kaggle` below.
 * Individual weeks can point deeper (a folder, a single dataset) via their own
 * `links` field — see src/content/weeks/.
 */
export const site = {
  name: "Sarthak's Digital Playground",
  shortName: "Digital Playground",
  title: "Sarthak's Digital Playground - one question a week, answered with data",
  description:
    "A weekly web-dev and data-analysis practice log. Sarthak asks one question on X, analyses the answers in Jupyter, and publishes the results here as interactive analytics",
  /** Change to the real domain once deployed. Used for canonical URLs + sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sarthaks-digital-playground.vercel.app/",
  locale: "en_GB",
  author: {
    name: "Sarthak D. Bharad",
    firstName: "Sarthak",
    email: "sarthakbharad3105@gmail.com",
    handle: "@maybesarthak",
  },
  /** Where the analytics CSVs and the source data live. */
  data: {
    // TODO: point at the new analytics repo (the one holding the notebook CSVs)
    github: "https://github.com/SarthakBharad/digital-playground/tree/main/data-analysis",
    // TODO: point at your Kaggle profile or a collection of the weekly datasets
    kaggle: "https://www.kaggle.com/sarthakbharad",
  },
  socials: {
    github: "https://github.com/SarthakBharad",
    x: "https://x.com/maybesarthak",
    portfolio: "https://portfolio-sarthak-bharad.vercel.app/",
    email: "mailto:sarthakbharad3105@gmail.com",
  },
} as const;

export type Site = typeof site;
