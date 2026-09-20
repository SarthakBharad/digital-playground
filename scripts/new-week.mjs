#!/usr/bin/env node
/**
 * Scaffolds a new week:
 *   pnpm new-week 1 "What's the most overrated JS framework?"
 *
 * Creates src/content/weeks/week-01.ts, public/data/week-01/, and registers the
 * week in src/content/weeks/index.ts with status "collecting". Drop the CSVs
 * from your notebook into the data folder, fill in the charts, flip the status
 * to "published", done.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [, , rawNumber, ...questionParts] = process.argv;
const number = Number(rawNumber);
if (!Number.isInteger(number) || number < 0) {
  console.error('Usage: pnpm new-week <number> "<question>"');
  process.exit(1);
}

const nn = String(number).padStart(2, "0");
const slug = `week-${nn}`;
const ident = `week${nn}`;
const question = questionParts.join(" ").trim() || "TODO: the question, exactly as asked";
const today = new Date().toISOString().slice(0, 10);
const root = process.cwd();
const file = path.join(root, "src", "content", "weeks", `${slug}.ts`);
const dataDir = path.join(root, "public", "data", slug);
const index = path.join(root, "src", "content", "weeks", "index.ts");

if (existsSync(file)) {
  console.error(`${path.relative(root, file)} already exists.`);
  process.exit(1);
}

const q = JSON.stringify(question);
writeFileSync(
  file,
  `import type { Week } from "@/lib/types";

export const ${ident}: Week = {
  slug: "${slug}",
  number: ${number},
  title: "TODO: short title",
  question: ${q},
  summary: "TODO: one or two sentences for the cards.",
  // "collecting" → poll is live · "analysing" → notebook in progress · "published" → charts go live
  status: "collecting",
  askedOn: "${today}",
  // publishedOn: "YYYY-MM-DD",
  tags: [],
  tools: ["Python", "pandas", "Jupyter"],
  links: {
    // tweet: "https://x.com/maybesarthak/status/…",
    // github: "https://github.com/<you>/<analytics-repo>/tree/main/${slug}",
    // notebook: "https://github.com/<you>/<analytics-repo>/blob/main/${slug}/analysis.ipynb",
    // kaggle: "https://www.kaggle.com/datasets/<you>/<dataset>",
  },
  findings: [],
  methodology: [],
  stats: [
    // { label: "Responses", from: { csv: "responses.csv", column: "votes", agg: "sum" } },
    // { label: "Winner", value: "…" },
  ],
  charts: [
    // Put CSVs in public/data/${slug}/ first, then e.g.:
    // { kind: "bar", id: "ranking", title: "…", csv: "ranking.csv", x: "name", y: "votes", limit: 10 },
    // { kind: "line", id: "trend", title: "…", csv: "trend.csv", x: "date", series: [{ column: "count", label: "Count" }] },
    // { kind: "donut", id: "share", title: "…", csv: "share.csv", label: "group", value: "n" },
  ],
};
`,
);

mkdirSync(dataDir, { recursive: true });
writeFileSync(path.join(dataDir, ".gitkeep"), "");

let idx = readFileSync(index, "utf8");
idx = idx.replace(/(import \{ week\d+ \} from "\.\/week-\d+";\n)(?![\s\S]*import \{ week)/, `$1import { ${ident} } from "./${slug}";\n`);
idx = idx.replace(/export const weeks: Week\[\] = \[([^\]]*)\];/, (_, list) => {
  const items = list.split(",").map((s) => s.trim()).filter(Boolean);
  return `export const weeks: Week[] = [${[...items, ident].join(", ")}];`;
});
writeFileSync(index, idx);

console.log(`✓ ${path.relative(root, file)}`);
console.log(`✓ ${path.relative(root, dataDir)}/`);
console.log(`✓ registered in src/content/weeks/index.ts`);
