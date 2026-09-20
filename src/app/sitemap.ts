import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getWeeks } from "@/lib/weeks";

export default function sitemap(): MetadataRoute.Sitemap {
  const weeks = getWeeks().map((w) => ({
    url: `${site.url}/weeks/${w.slug}`,
    lastModified: new Date(`${w.publishedOn ?? w.askedOn}T12:00:00Z`),
  }));
  return [
    { url: site.url, lastModified: new Date() },
    { url: `${site.url}/weeks`, lastModified: new Date() },
    ...weeks,
  ];
}
