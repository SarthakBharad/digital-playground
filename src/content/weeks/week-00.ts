import type { Week } from "@/lib/types";

/**
 * Week 00 is the warm-up: a reproducible dataset (scripts/week-00-warmup.py)
 * that exercises every chart type before the first real question goes out.
 * Keep it as the site's "hello world", or delete this file and its folder in
 * public/data/ once Week 01 is published.
 */
export const week00: Week = {
  slug: "week-00",
  number: 0,
  title: "Is a seeded die actually fair?",
  question: "If I roll a virtual die 10,000 times, does every face really come up one time in six?",
  summary:
    "The warm-up round. Ten thousand seeded rolls, four small tables, one chi-square test — and a check that every chart on this site renders real numbers.",
  status: "published",
  askedOn: "2026-09-14",
  publishedOn: "2026-09-18",
  tags: ["warm-up", "probability", "simulation"],
  tools: ["Python", "NumPy", "pandas", "Jupyter"],
  links: {
    github: undefined,
    notebook: undefined,
    kaggle: undefined,
    tweet: undefined,
  },
  findings: [
    "Every face landed within **±1.8%** of the expected 1,667 rolls — the biggest miss was Face 6, up by 29.",
    "A chi-square goodness-of-fit test gives **χ² = 1.03** (5 degrees of freedom, **p ≈ 0.96**). Nothing to see: the die is fair.",
    "The running mean swings wildly for the first few dozen rolls, then settles onto **3.5** — the law of large numbers, drawn as a line.",
    "The longest streak of one face repeating was **6 in a row**, and it happened exactly once.",
  ],
  methodology: [
    "Rolls come from NumPy's `default_rng(2026).integers(1, 7)` — a PCG64 generator with a fixed seed, so anyone re-running `scripts/week-00-warmup.py` gets the identical 10,000 values.",
    "Each chart reads its own tidy CSV: **face_counts** (count vs. expected per face), **running_mean** (sampled at 300 checkpoints so the file stays small), **buckets** (low / mid / high thirds) and **streaks** (how often a face repeated n times in a row).",
    "Fairness is judged with a chi-square goodness-of-fit test against a uniform distribution. A small χ² and a large p-value mean the observed counts are entirely consistent with a fair die.",
  ],
  caveats: [
    "This is simulated data, not a poll. It exists to prove the pipeline — notebook → CSV → chart — works end to end.",
  ],
  stats: [
    { label: "Rolls simulated", from: { csv: "face_counts.csv", column: "count", agg: "sum" }, hint: "seed 2026" },
    { label: "Chi-square", value: "1.03", hint: "5 degrees of freedom" },
    { label: "p-value", value: "0.96", hint: "no evidence of bias" },
    { label: "Longest streak", value: "6×", hint: "same face in a row" },
  ],
  charts: [
    {
      kind: "bar",
      id: "faces",
      title: "Rolls per face",
      caption: "Six bars, all within a whisker of the 1,667 a fair die expects.",
      csv: "face_counts.csv",
      x: "face",
      y: "count",
      orientation: "horizontal",
      sort: "none",
      unit: "rolls",
    },
    {
      kind: "donut",
      id: "buckets",
      title: "Low, mid or high?",
      caption: "Splitting the faces into thirds: each takes almost exactly a third of the rolls.",
      csv: "buckets.csv",
      label: "bucket",
      value: "rolls",
      unit: "rolls",
    },
    {
      kind: "line",
      id: "running-mean",
      title: "The running mean settles on 3.5",
      caption: "Average of all rolls so far. Log scale on x, so the chaotic first hundred rolls get room.",
      csv: "running_mean.csv",
      x: "roll",
      xLabel: "Roll number",
      series: [{ column: "running_mean", label: "Running mean" }],
      reference: { value: 3.5, label: "Expected 3.5" },
      format: "decimal",
      logX: true,
      wide: true,
    },
    {
      kind: "bar",
      id: "streaks",
      title: "How long do streaks last?",
      caption: "Repeats are rare: a face followed by itself happens about one time in six.",
      csv: "streaks.csv",
      x: "streak_length",
      y: "occurrences",
      orientation: "vertical",
      sort: "none",
      unit: "streaks",
      wide: true,
    },
  ],
};
