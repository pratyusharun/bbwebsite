"use client";

import Image from "next/image";
import { Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import Reveal from "../Reveal";
import TextReveal from "../TextReveal";
import { site } from "@/content/site";

export default function Organizers() {
  return (
    <section
      id="organizers"
      className="relative scroll-mt-24 overflow-hidden border-y border-white/8 py-24 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-copper/10 blur-[140px]"
      />
      <div className="container-wide">
        <div className="flex items-center gap-3">
          <span className="sec-index">06</span>
          <span className="h-px w-10 bg-copper/50" />
          <span className="eyebrow">Organized by</span>
        </div>

        <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <Reveal direction="right">
              <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl ring-1 ring-copper/40">
                <Image
                  src="/logo.jpeg"
                  alt="Byte Brainiacs"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </span>
            </Reveal>
            <div>
              <h2 className="font-serif text-[clamp(1.8rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-tightest text-platinum">
                <TextReveal text={site.org} />
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-platinum-muted">
                {site.college}
              </p>
            </div>
          </div>

          <Reveal delay={0.1} className="flex flex-wrap gap-3">
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Follow"
              className="btn-ghost"
            >
              <Instagram className="h-4 w-4" />
              Instagram
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Connect"
              className="btn-ghost"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
