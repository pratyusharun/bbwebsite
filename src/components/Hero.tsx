"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, ArrowDown, Terminal } from "lucide-react";
import CountUp from "./CountUp";
import Magnetic from "./Magnetic";
import TerminalPanel from "./TerminalPanel";
import { site } from "@/content/site";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const lineWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const lineUp: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 1, ease: EASE } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

const MARQUEE = [
  "Computer Vision",
  "NLP",
  "Predictive Analytics",
  "Generative AI",
  "Open Innovation",
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const lowerY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const vizY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-10"
    >
      {/* purple ambient lighting — lighter blur radii for cheaper compositing */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[2%] top-[26%] -z-10 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-copper/20 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-6%] bottom-[4%] -z-10 h-[320px] w-[320px] rounded-full bg-amber/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 animate-grid-pan"
      />

      {/* Rotated side label */}
      <div className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 -rotate-90 lg:block">
        <span className="font-mono text-[10px] uppercase tracking-wider3 text-platinum-muted">
          Est. 2026 — {site.shortCollege}
        </span>
      </div>

      <div className="container-wide relative">
        {/* eyebrow row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-6 flex flex-wrap items-center gap-3"
        >
          <span className="sec-index">/ 2026</span>
          <span className="h-px w-10 bg-copper/50" />
          <span className="kicker">{site.org}</span>
        </motion.div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          {/* ── LEFT: kinetic headline + copy ── */}
          <div>
            {/* terminal handle — byte_brainiacs_ */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-5 inline-flex items-center gap-2 font-mono text-sm text-copper sm:text-base"
            >
              <Terminal className="h-4 w-4" />
              <span className="lowercase tracking-tight text-platinum">
                byte_brainiacs
              </span>
              <span className="term-caret h-[1.05em]" aria-hidden />
            </motion.div>

            {/* Giant kinetic headline */}
            <motion.h1
              style={reduce ? {} : { y: titleY, opacity: titleOpacity }}
              variants={lineWrap}
              initial="hidden"
              animate="show"
              className="font-display font-bold uppercase tracking-tightest text-platinum"
            >
              <span className="reveal-line text-giant">
                <motion.span variants={lineUp} className="inline-block">
                  Byte
                </motion.span>
              </span>
              <span className="reveal-line text-giant">
                <motion.span
                  variants={lineUp}
                  className="inline-block text-gradient"
                >
                  Brainiacs
                </motion.span>
              </span>
            </motion.h1>

            <motion.div style={reduce ? {} : { y: lowerY }} className="mt-2">
              <div className="reveal-line">
                <motion.span
                  variants={lineUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.45, duration: 1, ease: EASE }}
                  className="block font-display text-[clamp(1.9rem,5vw,4rem)] font-bold uppercase leading-[0.9] tracking-tightest text-outline-copper"
                >
                  ML Showdown
                </motion.span>
              </div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.7 }}
                className="mt-7 max-w-md"
              >
                <p className="text-base leading-relaxed text-platinum-soft">
                  {site.hero.sub}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Magnetic strength={0.4}>
                    <Link
                      href="/register"
                      data-cursor="Register"
                      className="btn-primary"
                    >
                      Register Now
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.3}>
                    <Link
                      href="/#about"
                      data-cursor="Explore"
                      className="btn-ghost"
                    >
                      View Details
                      <ArrowDown className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ── RIGHT: 2D command-center terminal ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            style={reduce ? {} : { y: vizY }}
            className="relative w-full"
          >
            <TerminalPanel className="h-full w-full" />
          </motion.div>
        </div>

        {/* Stats — editorial inline */}
        <motion.dl
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.9 }}
          className="mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-lilac/10 pt-7 sm:grid-cols-4"
        >
          {site.stats.map((s) => (
            <div key={s.label}>
              <dd className="font-display text-3xl font-bold text-platinum sm:text-4xl">
                <CountUp to={s.value} suffix={s.suffix ?? ""} />
              </dd>
              <dt className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                {s.label}
              </dt>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Bottom keyword marquee */}
      <div className="marquee-mask mt-12 select-none border-y border-lilac/10 py-3">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => (
            <span
              key={i}
              className="mx-6 flex items-center gap-6 font-display text-sm font-medium uppercase tracking-wider2 text-platinum-muted"
            >
              {w}
              <span className="h-1 w-1 rounded-full bg-copper" />
            </span>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: titleOpacity }}
        className="pointer-events-none absolute bottom-4 right-6 hidden items-center gap-2 sm:flex"
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
          Scroll
        </span>
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-lilac/20 p-1">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-copper"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
