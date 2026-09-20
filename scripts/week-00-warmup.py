"""
Week 00 · Warm-up — "Is a seeded die actually fair?"

This is the tiny, reproducible dataset the site ships with so every chart type
has something real to render before the first Twitter question lands. It is
also a template for how a week's CSVs should look: tidy, one table per chart,
column names in snake_case.

    python scripts/week-00-warmup.py

writes into public/data/week-00/. Needs numpy + pandas.
"""

from pathlib import Path

import numpy as np
import pandas as pd

SEED = 2026
N_ROLLS = 10_000
OUT = Path(__file__).resolve().parent.parent / "public" / "data" / "week-00"
OUT.mkdir(parents=True, exist_ok=True)

rng = np.random.default_rng(SEED)
rolls = rng.integers(1, 7, size=N_ROLLS)

# 1 — how often each face came up ------------------------------------------------
expected = N_ROLLS / 6
counts = pd.Series(rolls).value_counts().sort_index()
faces = pd.DataFrame(
    {
        "face": [f"Face {f}" for f in counts.index],
        "count": counts.values,
        "expected": round(expected, 1),
    }
)
faces["deviation_pct"] = ((faces["count"] - expected) / expected * 100).round(2)
faces.to_csv(OUT / "face_counts.csv", index=False)

# 2 — running mean, sampled so the CSV stays small ---------------------------------
running = np.cumsum(rolls) / np.arange(1, N_ROLLS + 1)
checkpoints = np.unique(np.concatenate([np.arange(1, 101), np.linspace(100, N_ROLLS, 200).astype(int)]))
pd.DataFrame(
    {"roll": checkpoints, "running_mean": running[checkpoints - 1].round(4), "expected_mean": 3.5}
).to_csv(OUT / "running_mean.csv", index=False)

# 3 — low / mid / high buckets ----------------------------------------------------
bucket = pd.cut(rolls, bins=[0, 2, 4, 6], labels=["Low (1–2)", "Mid (3–4)", "High (5–6)"])
pd.Series(bucket).value_counts().reindex(["Low (1–2)", "Mid (3–4)", "High (5–6)"]).rename_axis(
    "bucket"
).reset_index(name="rolls").to_csv(OUT / "buckets.csv", index=False)

# 4 — longest run of the same face --------------------------------------------------
streaks, current = [], 1
for prev, nxt in zip(rolls[:-1], rolls[1:]):
    if nxt == prev:
        current += 1
    else:
        streaks.append(current)
        current = 1
streaks.append(current)
streak_table = pd.Series(streaks).value_counts().sort_index()
pd.DataFrame(
    {"streak_length": [f"{n}×" for n in streak_table.index], "occurrences": streak_table.values}
).to_csv(OUT / "streaks.csv", index=False)

# summary for the week file ---------------------------------------------------------
chi2 = float((((counts - expected) ** 2) / expected).sum())
print(f"rolls={N_ROLLS} mean={rolls.mean():.4f} chi2={chi2:.3f} longest_streak={max(streaks)}")
