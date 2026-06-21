"use client";

import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  index,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Editorial section index, e.g. "01". */
  index?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      <Reveal>
        <div
          className={`mb-5 flex items-center gap-3 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          {index && <span className="sec-index">{index}</span>}
          {index && <span className="h-px w-8 bg-orange/40" />}
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-serif text-[clamp(2rem,5.4vw,3.5rem)] font-semibold leading-[1.04] tracking-tightest text-white">
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-sm leading-relaxed text-platinum-muted sm:text-base">
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
