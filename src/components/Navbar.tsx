"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Magnetic from "./Magnetic";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#timeline", label: "Timeline" },
  { href: "/#tracks", label: "Tracks" },
  { href: "/#prizes", label: "Prizes" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex max-w-wide items-center justify-between px-5 py-3 transition-all duration-500 sm:px-8 lg:px-10",
          scrolled
            ? "mt-2 sm:mx-4 sm:max-w-[calc(100%-2rem)] sm:rounded-full glass-strong"
            : "mt-0 bg-transparent",
        )}
      >
        <Link
          href="/"
          data-cursor="Home"
          className="group flex items-center gap-2.5"
          aria-label="Byte Brainiacs home"
        >
          <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full ring-1 ring-copper/40 transition-transform duration-500 group-hover:rotate-[10deg]">
            <Image
              src="/logo.jpeg"
              alt="Byte Brainiacs logo"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-tight text-platinum">
              BYTE BRAINIACS
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider2 text-platinum-muted">
              ML Showdown
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline rounded-full px-3.5 py-2 text-sm text-platinum-soft transition-colors hover:text-platinum"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic strength={0.35} className="hidden sm:inline-flex">
            <Link href="/register" data-cursor="Register" className="btn-primary">
              Register
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Magnetic>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-platinum lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-3 mt-2 overflow-hidden rounded-3xl glass-strong p-3 lg:hidden"
          >
            <nav className="flex flex-col">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium text-platinum-soft transition-colors hover:bg-white/5 hover:text-platinum"
                  >
                    {l.label}
                    <span className="font-mono text-[10px] text-platinum-muted">
                      0{i + 1}
                    </span>
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2 w-full"
              >
                Register Now
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
