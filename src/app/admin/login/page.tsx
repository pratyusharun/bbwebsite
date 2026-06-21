"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Lock, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.replace(from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-5 py-16">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-copper/15 blur-[130px]"
      />
      <span
        aria-hidden
        className="watermark pointer-events-none absolute bottom-6 right-6 -z-10 select-none text-[12vw] leading-none"
      >
        ML
      </span>

      <div className="w-full max-w-sm">
        <Link
          href="/"
          data-cursor="Back"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-platinum-muted transition-colors hover:text-platinum"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <div className="ring-gradient rounded-3xl glass-strong p-8">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl ring-1 ring-copper/40">
              <Image
                src="/logo.jpeg"
                alt="Byte Brainiacs"
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold text-platinum">
                Admin Portal
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                ML Showdown · Console
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="group flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="font-mono text-[11px] uppercase tracking-wider2 text-platinum-muted transition-colors group-focus-within:text-copper"
              >
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-platinum outline-none transition-all focus:border-copper/60 focus:ring-2 focus:ring-copper/20"
              />
            </div>
            <div className="group flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="font-mono text-[11px] uppercase tracking-wider2 text-platinum-muted transition-colors group-focus-within:text-copper"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-platinum outline-none transition-all focus:border-copper/60 focus:ring-2 focus:ring-copper/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-cursor="Sign in"
              className="btn-primary w-full justify-center py-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
