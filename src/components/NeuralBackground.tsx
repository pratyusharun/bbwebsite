/**
 * DEPRECATED — the animated <canvas> neural particle field was removed in the
 * 2D performance refactor (it ran a permanent requestAnimationFrame loop with
 * O(n²) edge math every frame). Replaced by the pure-CSS `.cta-grid` backdrop.
 *
 * Kept as a no-op stub so any stale import stays resolvable. Renders nothing.
 */
export default function NeuralBackground(_props: {
  className?: string;
  density?: number;
}) {
  return null;
}
