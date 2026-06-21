"use client";

import { useEffect, useRef } from "react";

/**
 * Page-wide soft cursor spotlight. Fixed, behind content, pointer-events none.
 * Disabled for reduced-motion and touch devices.
 *
 * Performance: the rAF loop is *self-halting* — it only runs while the glow is
 * still easing toward the cursor, then stops completely once settled. A new
 * pointer move restarts it. This avoids burning a frame every 16ms while the
 * cursor is idle (the previous version looped forever).
 */
export default function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let raf = 0;
    let running = false;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `translate3d(${cx - 250}px, ${cy - 250}px, 0)`;
      if (Math.abs(tx - cx) < 0.5 && Math.abs(ty - cy) < 0.5) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 h-[500px] w-[500px] rounded-full opacity-60 blur-[90px] will-change-transform"
      style={{
        background:
          "radial-gradient(circle, rgba(185,140,255,0.18), rgba(255,99,196,0.08) 40%, transparent 70%)",
      }}
    />
  );
}
