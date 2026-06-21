import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Users, Trophy, CalendarClock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationForm from "@/components/RegistrationForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Register your team",
  description:
    "Register your team for Byte Brainiacs: ML Showdown — India's premier machine learning competition. Free to enter.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen overflow-hidden pt-28 pb-28">
        <span
          aria-hidden
          className="watermark pointer-events-none absolute -left-4 top-24 -z-10 select-none text-[26vw] leading-none sm:text-[18vw]"
        >
          ENTER
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-4%] top-24 -z-10 h-96 w-96 rounded-full bg-copper/12 blur-[150px]"
        />

        <div className="container-wide">
          <Link
            href="/"
            data-cursor="Back"
            className="inline-flex items-center gap-1.5 text-sm text-platinum-muted transition-colors hover:text-platinum"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            {/* Info panel */}
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <div className="flex items-center gap-3">
                <span className="sec-index">/ Registration</span>
                <span className="h-px w-10 bg-copper/50" />
              </div>
              <h1 className="mt-6 font-serif text-[clamp(2.4rem,5.5vw,4.2rem)] font-semibold leading-[0.98] tracking-tightest text-platinum">
                Join the{" "}
                <span className="text-gradient-cyan">ML Showdown</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-platinum-muted sm:text-base">
                Lock in your entry in under two minutes. Registration is free —
                enter solo, as a duo, or as a team of three.
              </p>

              <ul className="mt-10 space-y-px overflow-hidden rounded-2xl border border-white/10">
                <InfoRow
                  icon={Users}
                  title="Solo · Duo · Team"
                  body="Enter alone or with up to two teammates. Solo entrants can be grouped into teams by the organizers."
                />
                <InfoRow
                  icon={CalendarClock}
                  title={`Season ${site.hero.season}`}
                  body="Shortlisting and round details are emailed after you register."
                />
                <InfoRow
                  icon={Trophy}
                  title="₹1,00,000+ prize pool"
                  body="Winner, runner-up, and special awards across five tracks."
                />
              </ul>

              <div className="mt-8 hidden rounded-2xl glass p-5 lg:block">
                <p className="text-sm text-platinum-soft">
                  Questions before registering?{" "}
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="link-underline text-copper"
                  >
                    {site.contact.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Form panel */}
            <div className="ring-gradient rounded-[2rem] glass-strong p-6 sm:p-8 lg:p-10">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoRow({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <li className="group flex gap-4 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]">
      <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-copper/10 text-copper ring-1 ring-copper/20 transition-transform duration-300 group-hover:-rotate-6">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-platinum">{title}</p>
        <p className="mt-0.5 text-sm text-platinum-muted">{body}</p>
      </div>
    </li>
  );
}
