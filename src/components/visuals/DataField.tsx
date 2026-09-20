"use client";

import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * The playground's hero backdrop: a field of data points sampled from a slowly
 * drifting surface — think a scatter plot of a function that's still being
 * computed. The pointer is a lens: nearby points swell and a crosshair reads
 * out coordinates, like hovering a chart.
 *
 * Plain 2D canvas (the portfolio uses WebGL — this one is deliberately a
 * "chart" instead of a "shader"). Pauses offscreen and in hidden tabs, and
 * renders a single still frame for reduced motion.
 */

interface Palette {
  dot: [number, number, number];
  hot: [number, number, number];
  ink: string;
  line: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    dot: hexToRgb(get("--fg-subtle", "#a48876")),
    hot: hexToRgb(get("--brand-vermilion", "#d53e0f")),
    ink: get("--fg-muted", "#cdb29a"),
    line: get("--border-strong", "rgba(238,217,185,0.22)"),
  };
}

export function DataField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette | null>(null);
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();

  // Re-read colours when the theme flips (after next-themes swaps the class).
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      paletteRef.current = readPalette();
    });
    return () => window.cancelAnimationFrame(id);
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    paletteRef.current ??= readPalette();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const SPACING = 28;
    let w = 0;
    let h = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const field = (x: number, y: number, t: number) => {
      const nx = x / 220;
      const ny = y / 220;
      const v =
        Math.sin(nx * 1.3 + t * 0.35) * Math.cos(ny * 1.1 - t * 0.25) +
        0.55 * Math.sin((nx + ny) * 0.9 + t * 0.5) +
        0.35 * Math.cos(Math.hypot(nx - 2.4, ny - 1.2) * 2.1 - t * 0.7);
      return (v + 1.9) / 3.8; // ~0..1
    };

    const draw = (time: number) => {
      const pal = paletteRef.current;
      if (!pal) return;
      const t = time / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const ox = (w - (cols - 1) * SPACING) / 2;
      const oy = (h - (rows - 1) * SPACING) / 2;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = ox + i * SPACING;
          const y = oy + j * SPACING;
          const v = field(x, y, t);
          const d = pointer.active ? Math.hypot(x - pointer.x, y - pointer.y) : 9999;
          const lens = Math.max(0, 1 - d / 150);
          const heat = Math.min(1, Math.max(0, (v - 0.55) * 2.4) + lens * 0.9);
          const r = 0.7 + v * 1.5 + lens * 2.6;
          const a = 0.18 + v * 0.35 + lens * 0.45;
          const c0 = pal.dot;
          const c1 = pal.hot;
          const rr = Math.round(c0[0] + (c1[0] - c0[0]) * heat);
          const gg = Math.round(c0[1] + (c1[1] - c0[1]) * heat);
          const bb = Math.round(c0[2] + (c1[2] - c0[2]) * heat);
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (pointer.active) {
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(pointer.x, 0);
        ctx.lineTo(pointer.x, h);
        ctx.moveTo(0, pointer.y);
        ctx.lineTo(w, pointer.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const fx = (pointer.x / Math.max(w, 1)).toFixed(2);
        const fy = (1 - pointer.y / Math.max(h, 1)).toFixed(2);
        const fv = field(pointer.x, pointer.y, t).toFixed(3);
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillStyle = pal.ink;
        const label = `x ${fx}  y ${fy}  f ${fv}`;
        const tx = pointer.x + 12 + 150 > w ? pointer.x - 162 : pointer.x + 12;
        ctx.fillText(label, tx, pointer.y - 10);
      }
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(canvas);

    if (reduce) {
      // One still frame, drawn once the palette is ready.
      const id = window.requestAnimationFrame(() => draw(12_000));
      return () => {
        window.cancelAnimationFrame(id);
        ro.disconnect();
      };
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
      pointer.active = inside && e.pointerType !== "touch";
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (pointer.x < -1000) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let running = false;
    const loop = (now: number) => {
      draw(now);
      raf = window.requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      if (onScreen && document.visibilityState === "visible") start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (document.visibilityState === "visible" && onScreen) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return (
    <div className={className} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 15% 10%, var(--glow-a) 0%, transparent 55%)," +
            "radial-gradient(70% 60% at 90% 40%, var(--glow-b) 0%, transparent 60%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
