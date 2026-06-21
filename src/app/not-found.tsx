import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center px-5 text-center">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-50"
      />
      <div>
        <p className="font-mono text-sm uppercase tracking-wider2 text-cyan-glow">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tightest text-white sm:text-6xl">
          Lost in the <span className="text-gradient-cyan">latent space</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-silver-soft">
          This page doesn&apos;t exist. Let&apos;s get you back to the showdown.
        </p>
        <Link href="/" className="btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
