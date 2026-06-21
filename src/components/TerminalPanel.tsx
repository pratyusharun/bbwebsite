import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * TerminalPanel — lightweight 2D "command center" hero centerpiece.
 *
 * Replaces the former Three.js / WebGL laptop scene. 100% server-rendered,
 * zero runtime JS: just HTML + CSS (grid overlay, scanlines, soft gradients).
 * Gives the same terminal/registration framing with none of the GPU cost.
 */
const BOOT = [
  { p: "$", t: "init byte_brainiacs --mode=showdown", k: "cmd" },
  { t: "› loading hackathon modules ........ ok", k: "ok" },
  { t: "› connecting participants .......... ok", k: "ok" },
  { t: "› calibrating ML tracks ............ ok", k: "ok" },
  { t: "› system ready.", k: "muted" },
] as const;

const STATS = [
  { k: "STATUS", v: "ONLINE" },
  { k: "TRACKS", v: "05" },
  { k: "ENTRY", v: "FREE" },
];

export default function TerminalPanel({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* soft ambient halo behind the panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 m-auto h-2/3 w-2/3 rounded-full bg-lilac/20 blur-[90px]"
      />

      <div className="term-window glass-strong relative h-full w-full overflow-hidden rounded-2xl ring-gradient">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-lilac/15 bg-lilac/[0.04] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-magenta/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-lilac/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-mist/80" />
          <span className="ml-2 font-mono text-[11px] uppercase tracking-wider2 text-platinum-muted">
            byte_brainiacs — /bin/showdown
          </span>
        </div>

        {/* body */}
        <div className="relative px-5 py-5 sm:px-7 sm:py-7">
          {/* subtle grid overlay inside the panel */}
          <div className="term-inner-grid pointer-events-none absolute inset-0" aria-hidden />

          <pre className="relative whitespace-pre-wrap font-mono text-[12.5px] leading-[1.85] sm:text-sm">
            {BOOT.map((line, i) => (
              <div key={i}>
                {"p" in line && line.p ? (
                  <span className="text-magenta">{line.p} </span>
                ) : null}
                <span
                  className={
                    line.k === "cmd"
                      ? "text-haze"
                      : line.k === "ok"
                        ? "text-[#9d7cff]"
                        : "text-platinum-muted"
                  }
                >
                  {line.t}
                </span>
              </div>
            ))}
            <div className="mt-1">
              <span className="text-magenta">$ </span>
              <span className="text-platinum-soft">register --now</span>
              <span className="term-caret ml-1 h-[1.05em] align-middle" aria-hidden />
            </div>
          </pre>

          {/* data panels */}
          <div className="relative mt-6 grid grid-cols-3 gap-2.5">
            {STATS.map((s) => (
              <div
                key={s.k}
                className="rounded-lg border border-lilac/15 bg-void-900/40 px-3 py-3 text-center"
              >
                <div className="font-display text-lg font-bold text-platinum sm:text-xl">
                  {s.v}
                </div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider2 text-platinum-muted">
                  {s.k}
                </div>
              </div>
            ))}
          </div>

          {/* register CTA inside the command center */}
          <Link
            href="/register"
            data-cursor="Register"
            className="btn-primary mt-6 w-full"
          >
            Execute Registration
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* CRT scanline sheen */}
        <div className="scanlines rounded-2xl" aria-hidden />
      </div>
    </div>
  );
}
