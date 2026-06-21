"use client";

import {
  useRef,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Lightweight 2D "drift" wrapper (replaces the former 3D perspective tilt).
 *
 * The card nudges a few pixels toward the cursor via translate only — no
 * rotateX/rotateY, no transform-perspective. GPU-composited and cheap.
 * Springs back to rest on leave. Touch devices stay flat (no hover events).
 */
export default function Tilt({
  children,
  className = "",
  max = 3,
}: {
  children: ReactNode;
  className?: string;
  /** maximum drift in pixels (1–3 recommended) */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 22, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 180, damping: 22, mass: 0.4 });
  const x = useTransform(sx, [0, 1], [-max, max]);
  const y = useTransform(sy, [0, 1], [-max, max]);

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
