"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Reveal from "../Reveal";
import TextReveal from "../TextReveal";
import { site } from "@/content/site";

export default function Timeline() {
  return (
    <section id="timeline" className="relative scroll-mt-24 pb-28 sm:pb-36">
      {/* Heading */}
      <div className="container-wide pt-28 sm:pt-36">
        <div className="flex items-center gap-3">
          <span className="sec-index">02</span>
          <span className="h-px w-10 bg-copper/50" />
          <span className="eyebrow">The road to the title</span>
        </div>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-serif text-[clamp(2.2rem,6vw,4.8rem)] font-semibold leading-[0.98] tracking-tightest text-platinum">
            <TextReveal text="Five stages." className="block" />
            <TextReveal
              text="One champion."
              className="block text-gradient-cyan"
              delay={0.08}
            />
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-platinum-muted">
            From sign-up to the closing ceremony, here&apos;s how the showdown
            unfolds. Scroll through the journey.
          </p>
        </div>
      </div>

      {/* Desktop — pinned horizontal scroll */}
      <HorizontalTrack />

      {/* Mobile — vertical stack */}
      <div className="container-x mt-10 lg:hidden">
        <ol className="relative space-y-4 border-l border-white/12 pl-6">
          {site.timeline.map((step) => (
            <li key={step.phase} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-copper shadow-[0_0_0_4px_rgba(226,117,47,0.18)]" />
              <Reveal>
                <div className="rounded-2xl glass p-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-copper">
                      {step.phase}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                      {step.window}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold text-platinum">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-platinum-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function HorizontalTrack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["1vw", "-118vw"]);
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div ref={ref} className="relative hidden h-[420vh] lg:block">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* progress rail */}
        <div className="container-wide mb-10">
          <div className="relative h-px w-full bg-white/10">
            <motion.div
              style={{ scaleX: progress }}
              className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-copper via-amber to-champagne"
            />
          </div>
        </div>

        <motion.ol style={{ x }} className="flex gap-6 pl-[6vw]">
          {site.timeline.map((step, i) => (
            <li
              key={step.phase}
              data-cursor={`0${i + 1}`}
              className="group relative w-[42vw] shrink-0 xl:w-[34vw]"
            >
              <div className="ring-gradient relative h-full overflow-hidden rounded-3xl glass-strong p-9 transition-transform duration-500 group-hover:-translate-y-2">
                <span className="watermark block text-[7rem] leading-none text-copper/20">
                  {step.phase}
                </span>
                <span className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider2 text-platinum-soft">
                  {step.window}
                </span>
                <h3 className="mt-5 font-serif text-3xl font-semibold leading-tight text-platinum xl:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-platinum-muted">
                  {step.body}
                </p>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-copper/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />
              </div>
            </li>
          ))}
          {/* closing rail spacer */}
          <li className="flex w-[30vw] shrink-0 items-center">
            <span className="font-display text-2xl font-semibold tracking-tight text-platinum-muted">
              → The title awaits.
            </span>
          </li>
        </motion.ol>
      </div>
    </div>
  );
}
