"use client";

import { useEffect, useRef } from "react";

/**
 * Premium custom cursor — a precise dot and a lerped trailing ring.
 * Desktop / fine-pointer only. Reacts to interactive elements and shows a
 * contextual label when an element declares `data-cursor="LABEL"`.
 *
 * Performance: the trailing-ring rAF loop is self-halting — it only runs while
 * the ring is still easing toward the cursor, then stops. A new pointer move
 * restarts it, so no frame is burned while the cursor is idle.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    document.body.classList.add("has-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let running = false;

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      // self-halt once the ring has caught up to the cursor
      if (Math.abs(mx - rx) < 0.3 && Math.abs(my - ry) < 0.3) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      label.style.transform = `translate(${mx}px, ${my + 2}px) translate(-50%, -50%)`;
      if (!reduce && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }

      const el = (e.target as HTMLElement)?.closest(
        "a, button, [data-cursor], input, textarea, select, label",
      ) as HTMLElement | null;

      if (el) {
        const labelText = el.getAttribute("data-cursor");
        if (labelText) {
          ring.classList.add("is-label");
          ring.classList.remove("is-hover");
          label.textContent = labelText;
          label.classList.add("is-visible");
        } else {
          ring.classList.add("is-hover");
          ring.classList.remove("is-label");
          label.classList.remove("is-visible");
        }
      } else {
        ring.classList.remove("is-hover", "is-label");
        label.classList.remove("is-visible");
      }
    };

    const onDown = () => ring.classList.add("is-hover");
    const onUp = () => ring.classList.remove("is-hover");
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.body.classList.remove("has-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={labelRef} className="cursor-label" aria-hidden />
    </>
  );
}
