import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import { site } from "@/content/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/10 pt-20 pb-10">
      <div className="container-wide">
        {/* Oversized wordmark */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider3 text-platinum-muted">
              {site.event}
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,11vw,9rem)] font-bold uppercase leading-[0.85] tracking-tightest text-platinum">
              Byte
              <br />
              Brainiacs
            </h2>
          </div>
          <Link
            href="/register"
            data-cursor="Register"
            className="btn-primary self-start lg:self-auto"
          >
            Register Now
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="hairline my-12" />

        <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="flex items-start gap-3">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-copper/40">
              <Image
                src="/logo.jpeg"
                alt="Byte Brainiacs"
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-platinum-muted">
              {site.org}, {site.college}.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:items-end">
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-platinum-soft sm:justify-end">
              <Link href="/#about" className="link-underline hover:text-platinum">About</Link>
              <Link href="/#timeline" className="link-underline hover:text-platinum">Timeline</Link>
              <Link href="/#tracks" className="link-underline hover:text-platinum">Tracks</Link>
              <Link href="/#prizes" className="link-underline hover:text-platinum">Prizes</Link>
              <Link href="/#faq" className="link-underline hover:text-platinum">FAQ</Link>
              <Link href="/register" className="link-underline hover:text-platinum">Register</Link>
            </nav>
            <div className="flex gap-3">
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-platinum-soft transition-colors hover:border-copper/40 hover:text-platinum"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={site.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-platinum-soft transition-colors hover:border-copper/40 hover:text-platinum"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 text-xs text-platinum-muted sm:flex-row">
          <p>© {year} Byte Brainiacs · ML Showdown. All rights reserved.</p>
          <p className="font-mono">Built for the love of machine learning.</p>
        </div>
      </div>
    </footer>
  );
}
