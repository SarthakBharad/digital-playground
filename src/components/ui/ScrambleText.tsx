"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#________";

/**
 * Cycles through `phrases`, scrambling each character before it settles.
 * With reduced motion the phrase is simply swapped, no glyph churn.
 */
export function ScrambleText({
  phrases,
  interval = 2600,
  className,
}: {
  phrases: readonly string[];
  interval?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState<string | null>(null);
  const currentRef = useRef(phrases[0] ?? "");

  // Rotate the active phrase.
  useEffect(() => {
    if (phrases.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => window.clearInterval(id);
  }, [phrases.length, interval]);

  // Scramble into the active phrase.
  useEffect(() => {
    if (reduce) return;

    const target = phrases[index] ?? "";
    const from = currentRef.current;
    const length = Math.max(from.length, target.length);
    const queue = Array.from({ length }, (_, i) => ({
      from: from[i] ?? "",
      to: target[i] ?? "",
      start: Math.floor(Math.random() * 18),
      end: Math.floor(Math.random() * 18) + 18,
    }));

    let frame = 0;
    let raf = 0;

    const tick = () => {
      let settled = 0;
      const out = queue.map((item) => {
        if (frame >= item.end) {
          settled += 1;
          return item.to;
        }
        if (frame >= item.start) {
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? item.to;
        }
        return item.from;
      });

      const next = out.join("");
      currentRef.current = next;
      setScrambled(next);
      frame += 1;

      if (settled < queue.length) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, phrases, reduce]);

  const text = reduce ? (phrases[index] ?? "") : (scrambled ?? phrases[0] ?? "");

  return (
    <span className={className} aria-live="polite">
      {text}
    </span>
  );
}
