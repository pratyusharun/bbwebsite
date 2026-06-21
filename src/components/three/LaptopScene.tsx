/**
 * DEPRECATED — the Three.js / WebGL laptop scene was removed in the 2D
 * performance refactor. This stub keeps any stale import resolvable without
 * pulling in three / @react-three. Use <TerminalPanel /> instead.
 */
import TerminalPanel from "../TerminalPanel";

export default function LaptopScene({ className = "" }: { className?: string }) {
  return <TerminalPanel className={className} />;
}
