"use client";

import { ArrowUpRight } from "lucide-react";
import Reveal from "../Reveal";
import TextReveal from "../TextReveal";
import SpotlightCard from "../SpotlightCard";
import Tilt from "../Tilt";
import { site } from "@/content/site";

// Deliberately asymmetric composition — no two tiles share a size.
const SPAN = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-8",
];

export default function Tracks() {
  return (
    <section
      id="tracks"
      className="relative scroll-mt-24 overflow-hidden py-28 sm:py-36"
    >
      <div className="container-wide">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="sec-index">03</span>
              <span className="h-px w-10 bg-copper/50" />
              <span className="eyebrow">Competition tracks</span>
            </div>
            <h2 className="mt-6 max-w-3xl font-serif text-[clamp(2.2rem,6vw,4.8rem)] font-semibold leading-[0.98] tracking-tightest text-platinum">
              <TextReveal text="Pick your battlefield in" className="block" />
              <TextReveal
                text="applied machine learning"
                className="block text-gradient-cyan"
                delay={0.08}
              />
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-platinum-muted lg:pb-2">
            Five domains spanning the modern ML landscape. Choose where your team
            can go deepest.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          {site.tracks.map((t, i) => {
            const Icon = t.icon;
            const featured = i === 0;
            return (
              <Reveal
                key={t.title}
                delay={i * 0.05}
                className={SPAN[i] ?? "lg:col-span-4"}
              >
                <Tilt className="h-full">
                  <SpotlightCard
                    data-cursor="Explore"
                    className="group flex h-full flex-col justify-between glass p-7 transition-colors duration-300 hover:border-copper/30"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-copper/25 to-amber/15 text-copper ring-1 ring-white/10 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                        {t.tag} · 0{i + 1}
                      </span>
                    </div>

                    <div className={featured ? "mt-auto pt-16" : "mt-auto pt-10"}>
                      <h3
                        className={`font-serif font-semibold leading-tight text-platinum ${
                          featured
                            ? "text-3xl sm:text-5xl"
                            : "text-2xl sm:text-3xl"
                        }`}
                      >
                        {t.title}
                      </h3>
                      <p
                        className={`mt-3 leading-relaxed text-platinum-muted ${
                          featured ? "max-w-md text-base" : "text-sm"
                        }`}
                      >
                        {t.body}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-copper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Explore track
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>

                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-copper/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </SpotlightCard>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
