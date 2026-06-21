"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import Reveal from "../Reveal";
import TextReveal from "../TextReveal";
import Magnetic from "../Magnetic";
import { site } from "@/content/site";

export default function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-24 py-28 sm:py-36">
      <div className="container-wide">
        {/* Closing CTA — full-bleed editorial */}
        <Reveal>
          <div className="ring-gradient relative overflow-hidden rounded-[2rem] glass-strong px-6 py-16 text-center sm:px-14 sm:py-24">
            <div
              aria-hidden
              className="cta-grid pointer-events-none absolute inset-0 -z-10 opacity-60"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-copper/20 blur-[100px]"
            />
            <span className="eyebrow">Get in touch</span>
            <h2 className="mx-auto mt-6 max-w-4xl font-serif text-[clamp(2.2rem,7vw,5.5rem)] font-semibold leading-[0.96] tracking-tightest text-platinum">
              <TextReveal text="Ready to enter" className="block" />
              <TextReveal
                text="the showdown?"
                className="block text-gradient-cyan"
                delay={0.08}
              />
            </h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-platinum-muted sm:text-base">
              Registration is free. All it takes is two to three minds and an idea
              worth competing for.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic strength={0.4}>
                <Link
                  href="/register"
                  data-cursor="Register"
                  className="btn-primary w-full sm:w-auto"
                >
                  Register Now
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <a
                  href={`mailto:${site.contact.email}`}
                  data-cursor="Email"
                  className="btn-ghost w-full sm:w-auto"
                >
                  Email the team
                </a>
              </Magnetic>
            </div>
          </div>
        </Reveal>

        {/* Contact ledger */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:grid-cols-3">
          <ContactItem icon={Mail} label="Email">
            <a
              href={`mailto:${site.contact.email}`}
              className="link-underline break-all text-sm text-platinum hover:text-copper"
              data-cursor="Copy"
            >
              {site.contact.email}
            </a>
          </ContactItem>
          <ContactItem icon={Phone} label="Phone">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="link-underline text-sm text-platinum hover:text-copper"
            >
              {site.contact.phone}
            </a>
          </ContactItem>
          <ContactItem icon={MapPin} label="Location">
            <p className="text-sm text-platinum">{site.contact.location}</p>
          </ContactItem>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <a
            href={site.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            data-cursor="Follow"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/12 text-platinum-soft transition-colors hover:border-copper/40 hover:text-platinum"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href={site.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            data-cursor="Connect"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/12 text-platinum-soft transition-colors hover:border-copper/40 hover:text-platinum"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group bg-ink-900/40 p-6 transition-colors hover:bg-white/[0.02]">
      <Icon className="h-5 w-5 text-copper transition-transform duration-300 group-hover:-translate-y-0.5" />
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
