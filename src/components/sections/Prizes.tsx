"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Reveal from "../Reveal";
import TextReveal from "../TextReveal";
import SpotlightCard from "../SpotlightCard";
import { site } from "@/content/site";

const accentMap: Record<
  string,
  { foil: string; text: string; badge: string; glow: string }
> = {
  gold: {
    foil: "from-champagne/70 via-gold/40 to-transparent",
    text: "text-champagne",
    badge: "bg-champagne/10 text-champagne ring-champagne/30",
    glow: "bg-gold/20",
  },
  silver: {
    foil: "from-platinum/60 via-silver/30 to-transparent",
    text: "text-platinum-soft",
    badge: "bg-white/5 text-platinum-soft ring-white/20",
    glow: "bg-platinum/10",
  },
  violet: {
    foil: "from-copper/60 via-amber/30 to-transparent",
    text: "text-copper",
    badge: "bg-copper/10 text-copper ring-copper/30",
    glow: "bg-copper/20",
  },
};

export default function Prizes() {
  const [winner, ...rest] = site.prizes;
  const wa = accentMap[winner.accent] ?? accentMap.gold;
  const WinIcon = winner.icon;

  return (
    <section
      id="prizes"
      className="relative scroll-mt-24 overflow-hidden py-28 sm:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[60rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-gold/8 blur-[160px]"
      />
      <div className="container-wide">
        <div className="flex items-center gap-3">
          <span className="sec-index">04</span>
          <span className="h-px w-10 bg-copper/50" />
          <span className="eyebrow">Rewards</span>
        </div>
        <h2 className="mt-6 max-w-3xl font-serif text-[clamp(2.2rem,6vw,4.8rem)] font-semibold leading-[0.98] tracking-tightest text-platinum">
          <TextReveal text="Win more than" className="block" />
          <TextReveal
            text="a trophy"
            className="block text-gradient-gold"
            delay={0.08}
          />
        </h2>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          {/* Winner — feature panel */}
          <Reveal className="lg:col-span-7">
            <SpotlightCard
              data-cursor="Champion"
              className="relative flex h-full flex-col justify-between glass-strong p-8 sm:p-10"
            >
              <div
                aria-hidden
                className={`absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r ${wa.foil}`}
              />
              <div className="flex items-start justify-between">
                <span
                  className={`inline-flex rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider2 ring-1 ${wa.badge}`}
                >
                  {winner.rank}
                </span>
                <motion.span
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${wa.foil} ${wa.text} ring-1 ring-white/10`}
                >
                  <WinIcon className="h-8 w-8" />
                </motion.span>
              </div>

              <div className="mt-10">
                <p className="font-serif text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-none text-platinum">
                  {winner.amount}
                </p>
                <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                  {winner.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-sm text-platinum-soft"
                    >
                      <Check className={`h-4 w-4 shrink-0 ${wa.text}`} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                aria-hidden
                className={`pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full ${wa.glow} opacity-60 blur-[90px]`}
              />
            </SpotlightCard>
          </Reveal>

          {/* Runner-up + Special — stacked */}
          <div className="grid gap-4 lg:col-span-5">
            {rest.map((p, i) => {
              const a = accentMap[p.accent] ?? accentMap.violet;
              const Icon = p.icon;
              return (
                <Reveal key={p.rank} delay={0.08 + i * 0.08}>
                  <SpotlightCard
                    data-cursor="View"
                    className="relative flex h-full flex-col glass p-7"
                  >
                    <div
                      aria-hidden
                      className={`absolute inset-x-0 -top-px mx-auto h-px w-2/3 bg-gradient-to-r ${a.foil}`}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider2 ring-1 ${a.badge}`}
                      >
                        {p.rank}
                      </span>
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${a.foil} ${a.text} ring-1 ring-white/10`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-5 font-serif text-3xl font-semibold text-platinum">
                      {p.amount}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                      {p.perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-center gap-1.5 text-xs text-platinum-muted"
                        >
                          <Check className={`h-3.5 w-3.5 shrink-0 ${a.text}`} />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
        {site.prizePoolNote ? (
          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-wider2 text-platinum-muted">
            {site.prizePoolNote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
