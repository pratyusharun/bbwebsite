"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "../Reveal";
import TextReveal from "../TextReveal";
import { site } from "@/content/site";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const markX = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section
      ref={ref}
      id="about"
      className="relative scroll-mt-24 overflow-hidden py-28 sm:py-40"
    >
      {/* Oversized drifting watermark */}
      <motion.span
        aria-hidden
        style={{ x: markX }}
        className="watermark pointer-events-none absolute -top-6 right-0 -z-10 select-none text-[22vw] sm:text-[16vw]"
      >
        ABOUT
      </motion.span>

      <div className="container-wide">
        {/* Editorial masthead */}
        <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <div className="flex items-center gap-3">
            <span className="sec-index">01</span>
            <span className="h-px w-10 bg-copper/50" />
            <span className="eyebrow">{site.about.eyebrow}</span>
          </div>
          <h2 className="font-serif text-[clamp(2.4rem,6.5vw,5.2rem)] font-bold leading-[1.08] tracking-tight text-platinum sm:font-semibold sm:leading-[1.0] sm:tracking-tightest">
            <TextReveal text="An arena built for" className="block" />
            <TextReveal
              text="machine intelligence"
              className="block text-gradient-cyan pb-[0.12em]"
              delay={0.1}
            />
          </h2>
        </div>

        {/* Magazine body: oversized lead + supporting column */}
        <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="font-serif text-[clamp(1.4rem,2.6vw,2.1rem)] font-light leading-[1.35] text-platinum-soft">
              <span className="float-left mr-3 font-serif text-[5rem] font-semibold leading-[0.7] text-copper">
                {site.about.paragraphs[0].charAt(0)}
              </span>
              {site.about.paragraphs[0].slice(1)}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5 lg:pt-3">
            <p className="text-base leading-relaxed text-platinum-muted">
              {site.about.paragraphs[1]}
            </p>

            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-7">
              {META.map((m) => (
                <div key={m.k} className="border-t border-white/10 pt-3">
                  <dt className="font-display text-lg font-semibold text-platinum">
                    {m.k}
                  </dt>
                  <dd className="mt-0.5 font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                    {m.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Objectives — editorial numbered ledger, not cards */}
        <div className="mt-20 border-t border-white/10">
          {site.about.objectives.map((o, i) => {
            const Icon = o.icon;
            return (
              <Reveal key={o.title} delay={i * 0.06}>
                <div
                  data-cursor="Focus"
                  className="group grid grid-cols-[auto_1fr] items-start gap-5 border-b border-white/10 py-7 transition-colors hover:bg-white/[0.02] sm:grid-cols-[5rem_auto_1fr] sm:gap-8 sm:px-3"
                >
                  <span className="font-mono text-sm text-platinum-muted">
                    0{i + 1}
                  </span>
                  <span className="hidden h-11 w-11 place-items-center rounded-xl bg-copper/10 text-copper ring-1 ring-copper/20 transition-transform duration-300 group-hover:-rotate-6 sm:grid">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr] sm:items-baseline sm:gap-8">
                    <h3 className="font-display text-xl font-semibold text-platinum transition-transform duration-300 group-hover:translate-x-1.5 sm:text-2xl">
                      {o.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-platinum-muted">
                      {o.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const META = [
  { k: "Multi-stage", v: "competition format" },
  { k: "Solo · Duo · Team", v: "flexible entry" },
  { k: "5 tracks", v: "of applied ML" },
  { k: "Free", v: "to participate" },
];
