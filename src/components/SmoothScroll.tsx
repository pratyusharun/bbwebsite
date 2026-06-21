/**
 * Smooth scrolling — now handled natively via CSS `scroll-behavior: smooth`
 * (see globals.css), which is GPU-friendly, jank-free on mobile, and respects
 * prefers-reduced-motion automatically.
 *
 * The previous implementation used Lenis, which ran a permanent
 * requestAnimationFrame loop on every frame for the life of the page — a
 * constant main-thread cost and a common source of scroll jank. Removed.
 *
 * This component is now a no-op kept only so existing imports stay valid.
 */
export default function SmoothScroll() {
  return null;
}
