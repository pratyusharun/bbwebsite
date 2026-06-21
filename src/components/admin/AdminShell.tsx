"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Network,
  UsersRound,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "./Toast";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/participants", label: "Participants", icon: Users },
  { href: "/admin/grouping", label: "Grouping", icon: Network },
  { href: "/admin/teams", label: "Teams", icon: UsersRound },
];

export default function AdminShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <ToastProvider>
      <main className="relative min-h-screen px-4 py-6 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-copper/10 blur-[130px]"
        />
        <div className="mx-auto max-w-wide">
          {/* Header bar */}
          <header className="flex flex-col gap-4 rounded-2xl glass-strong px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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
                <h1 className="font-display text-xl font-bold tracking-tight text-platinum">
                  {title}
                </h1>
                <p className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 text-emerald-300 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
              <button
                onClick={logout}
                data-cursor="Sign out"
                className="btn-ghost self-start py-2.5 sm:self-auto"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </header>

          {/* Nav tabs */}
          <nav className="mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.02] p-1.5">
            {NAV.map((n) => {
              const active =
                n.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-platinum"
                      : "text-platinum-muted hover:text-platinum",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-active"
                      className="absolute inset-0 -z-10 rounded-xl bg-copper/15 ring-1 ring-copper/30"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6">{children}</div>
        </div>
      </main>
    </ToastProvider>
  );
}
