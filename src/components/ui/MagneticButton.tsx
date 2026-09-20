"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(120deg,var(--fill),var(--fill-2))] text-on-fill shadow-[0_14px_40px_-18px_var(--glow-a)] hover:shadow-[0_18px_48px_-16px_var(--glow-b)]",
  secondary:
    "border border-border-strong bg-surface/70 text-fg hover:border-accent-2 hover:text-accent-2",
  ghost: "text-fg-muted hover:text-accent-2",
};

export interface MagneticProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  className?: string;
  download?: boolean;
  external?: boolean;
  disabled?: boolean;
  strength?: number;
  "aria-label"?: string;
}

export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  className,
  download,
  external,
  disabled,
  strength = 0.35,
  ...rest
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 18, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 260, damping: 18, mass: 0.4 });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    rawY.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const base = cn(
    "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5",
    "whitespace-nowrap font-sans text-sm font-medium tracking-tight transition-colors duration-300",
    "disabled:pointer-events-none disabled:opacity-60",
    VARIANTS[variant],
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] transition-transform duration-700 group-hover/btn:translate-x-full"
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="inline-flex"
    >
      {href && href.startsWith("/") && !download && !href.startsWith("/data/") ? (
        <Link href={href} className={base} {...rest}>
          {inner}
        </Link>
      ) : href ? (
        <a
          href={href}
          className={base}
          download={download}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          {...rest}
        >
          {inner}
        </a>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className={base} {...rest}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}
