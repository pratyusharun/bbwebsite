"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "../Reveal";
import TextReveal from "../TextReveal";
import { site } from "@/content/site";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 py-28 sm:py-36">
      <div className="container-wide grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Sticky editorial heading */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <div className="flex items-center gap-3">
            <span className="sec-index">05</span>
            <span className="h-px w-10 bg-copper/50" />
            <span className="eyebrow">Questions</span>
          </div>
          <h2 className="mt-6 font-serif text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[1] tracking-tightest text-platinum">
            <TextReveal text="Everything you" className="block" />
            <TextReveal
              text="need to know"
              className="block text-gradient-cyan"
              delay={0.08}
            />
          </h2>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-platinum-muted">
            Can&apos;t find an answer?{" "}
            <a
              href="/#contact"
              className="link-underline text-copper"
              data-cursor="Ask"
            >
              Reach out
            </a>{" "}
            — we usually reply within a day.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col border-t border-white/12">
          {site.faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.03}>
                <div className="border-b border-white/12">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    data-cursor={isOpen ? "Close" : "Open"}
                    className="group flex w-full items-center gap-5 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`font-mono text-xs transition-colors ${
                        isOpen ? "text-copper" : "text-platinum-muted"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className={`flex-1 font-display text-lg font-medium transition-colors sm:text-xl ${
                        isOpen ? "text-platinum" : "text-platinum-soft group-hover:text-platinum"
                      }`}
                    >
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 135 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
                        isOpen
                          ? "border-copper/50 text-copper"
                          : "border-white/15 text-platinum-muted group-hover:border-white/35"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 pl-10 pr-10 text-sm leading-relaxed text-platinum-muted sm:text-base">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
