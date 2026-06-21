"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UsersRound,
  User,
  Building2,
  Network,
  Layers,
  Download,
  FileSpreadsheet,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Clock,
} from "lucide-react";
import type { TeamWithMembers, FlatParticipant } from "@/lib/validation";
import type { DashboardStats } from "@/lib/admin/data";
import { formatDate } from "@/lib/utils";
import {
  exportTeamsCsv,
  exportTeamsXlsx,
  exportParticipantsCsv,
  exportParticipantsXlsx,
  stamp,
} from "@/lib/export";
import {
  approveTeamAction,
  approveAllTeamsAction,
  setAutoApproveAction,
} from "@/app/actions/admin";
import { useToast } from "./Toast";
import Analytics from "./Analytics";

function flatten(teams: TeamWithMembers[]): FlatParticipant[] {
  const out: FlatParticipant[] = [];
  for (const t of teams) {
    for (const p of t.participants) {
      out.push({
        participant_id: p.id,
        team_id: t.id,
        team_number: t.team_number,
        team_name: t.team_name,
        participant_name: p.name,
        participant_email: p.email,
        participant_phone: p.phone,
        slot: p.slot,
        registration_type: p.registration_type ?? t.registration_type,
        is_grouped: t.is_grouped,
        status: t.status,
        college: t.college,
        course: t.course,
        created_at: p.created_at,
      });
    }
  }
  return out;
}

const TYPE_BADGE: Record<string, string> = {
  SOLO: "bg-orange/15 text-orange ring-orange/30",
  DUO: "bg-gold/15 text-gold ring-gold/30",
  TEAM: "bg-orange-400/15 text-orange-400 ring-orange-400/30",
  GROUPED: "bg-white/10 text-platinum-soft ring-white/20",
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        accent
          ? "border-copper/30 bg-gradient-to-br from-copper/[0.1] to-transparent"
          : "border-white/8 bg-white/[0.02] hover:border-white/15"
      }`}
    >
      <span
        className={`inline-grid h-10 w-10 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover:-rotate-6 ${
          accent
            ? "bg-copper/15 text-copper ring-copper/30"
            : "bg-white/5 text-platinum-soft ring-white/10"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-3xl font-bold tracking-tight text-platinum">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
        {label}
      </p>
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-copper/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </div>
  );
}

export default function AdminDashboard({
  teams,
  stats,
  byDay,
  colleges,
  autoApprove,
  loadError,
}: {
  teams: TeamWithMembers[];
  stats: DashboardStats;
  byDay: { date: string; count: number }[];
  colleges: { college: string; participants: number; teams: number }[];
  autoApprove: boolean;
  loadError: string | null;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const flat = useMemo(() => flatten(teams), [teams]);

  const pendingTeams = useMemo(
    () => teams.filter((t) => t.status === "pending"),
    [teams],
  );

  function approve(teamId: string) {
    startTransition(async () => {
      const res = await approveTeamAction(teamId);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  function approveAll() {
    startTransition(async () => {
      const res = await approveAllTeamsAction();
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  function toggleAuto() {
    startTransition(async () => {
      const res = await setAutoApproveAction(!autoApprove);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) router.refresh();
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) =>
      [
        t.team_number,
        t.team_name,
        t.college ?? "",
        t.course ?? "",
        ...t.participants.map((p) => `${p.name} ${p.email}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [teams, query]);

  const recent = filtered.slice(0, 12);

  async function run(key: string, fn: () => void | Promise<void>) {
    setBusy(key);
    try {
      await fn();
      toast("Export ready.", "success");
    } catch {
      toast("Export failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-7">
      {loadError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Couldn&apos;t load data: {loadError} — verify Supabase env vars and
            that the v2 schema has been applied.
          </span>
        </div>
      )}

      {/* Overview */}
      <section>
        <p className="kicker mb-3">Registrations overview</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={UsersRound} label="Total teams" value={stats.totalTeams} accent />
          <StatCard icon={Users} label="Participants" value={stats.totalParticipants} accent />
          <StatCard icon={User} label="Solo" value={stats.solo} />
          <StatCard icon={Users} label="Duo" value={stats.duo} />
          <StatCard icon={UsersRound} label="Team" value={stats.team} />
          <StatCard icon={Building2} label="Colleges" value={stats.colleges} />
        </div>
      </section>

      {/* Approvals */}
      <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-copper/15 text-copper ring-1 ring-copper/30">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-white">Approvals</p>
              <p className="text-sm text-platinum-muted">
                {pendingTeams.length === 0
                  ? "No teams awaiting approval."
                  : `${pendingTeams.length} team${pendingTeams.length === 1 ? "" : "s"} awaiting approval.`}
              </p>
            </div>
          </div>

          {/* Auto-approval toggle */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
              Auto-approval
            </span>
            <button
              role="switch"
              aria-checked={autoApprove}
              aria-label="Toggle auto-approval"
              onClick={toggleAuto}
              disabled={pending}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50 ${
                autoApprove
                  ? "border-emerald-400/40 bg-emerald-400/25"
                  : "border-white/15 bg-white/10"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  autoApprove ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider2 ${
                autoApprove ? "text-emerald-300" : "text-platinum-muted"
              }`}
            >
              {autoApprove ? "On" : "Off"}
            </span>
          </div>
        </div>

        {pendingTeams.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="kicker">Pending teams</p>
              <button
                onClick={approveAll}
                disabled={pending}
                className="btn-primary px-4 py-2 text-xs disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Approve all
              </button>
            </div>
            <div className="grid gap-2">
              {pendingTeams.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3"
                >
                  <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                  <span className="font-mono text-sm font-bold text-orange">
                    {t.team_number}
                  </span>
                  <span className="font-medium text-white">{t.team_name}</span>
                  <span className="text-xs text-platinum-muted">
                    {t.participants.map((p) => p.name).join(", ") || "—"}
                  </span>
                  <button
                    onClick={() => approve(t.id)}
                    disabled={pending}
                    className="btn-ghost ml-auto px-4 py-1.5 text-xs disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Analytics */}
      <section>
        <p className="kicker mb-3">Analytics</p>
        <Analytics
          mix={{
            solo: stats.solo,
            duo: stats.duo,
            team: stats.team,
            grouped: stats.grouped,
          }}
          byDay={byDay}
          colleges={colleges.map((c) => ({
            college: c.college,
            participants: c.participants,
          }))}
        />
      </section>

      {/* Exports + quick actions */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <p className="kicker mb-3">Exports</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                run("tc", () => exportTeamsCsv(teams, stamp("teams")))
              }
              disabled={busy !== null || teams.length === 0}
              className="btn-ghost justify-center disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Teams CSV
            </button>
            <button
              onClick={() =>
                run("tx", () => exportTeamsXlsx(teams, stamp("teams")))
              }
              disabled={busy !== null || teams.length === 0}
              className="btn-ghost justify-center disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" /> Teams XLSX
            </button>
            <button
              onClick={() =>
                run("pc", () =>
                  exportParticipantsCsv(flat, stamp("participants")),
                )
              }
              disabled={busy !== null || flat.length === 0}
              className="btn-ghost justify-center disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Participants CSV
            </button>
            <button
              onClick={() =>
                run("px", () =>
                  exportParticipantsXlsx(flat, stamp("participants")),
                )
              }
              disabled={busy !== null || flat.length === 0}
              className="btn-ghost justify-center disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" /> Participants XLSX
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <p className="kicker mb-3">Operations</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href="/admin/grouping"
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-platinum-soft transition-colors hover:border-orange/40 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Network className="h-4 w-4 text-orange" /> Group solos
              </span>
              <span className="font-mono text-xs text-orange">
                {stats.ungroupedSolos}
              </span>
            </Link>
            <Link
              href="/admin/teams"
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-platinum-soft transition-colors hover:border-orange/40 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-orange" /> Manage teams
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/participants"
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-platinum-soft transition-colors hover:border-orange/40 hover:text-white sm:col-span-2"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange" /> View all participants
              </span>
              <span className="font-mono text-xs text-platinum-muted">
                {stats.totalParticipants} rows
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent registrations */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="kicker">Recent registrations</p>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-platinum-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-orange/60 focus:ring-2 focus:ring-orange/20"
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-white/[0.03]">
                <tr className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                  <th className="px-4 py-3">Team #</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-sm">
                {recent.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-orange">{t.team_number}</td>
                    <td className="px-4 py-3 font-medium text-white">{t.team_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] ring-1 ${TYPE_BADGE[t.registration_type]}`}
                      >
                        {t.registration_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300 ring-1 ring-emerald-400/30">
                          <Check className="h-3 w-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-300 ring-1 ring-amber-400/30">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-platinum-soft">
                      {t.participants.map((p) => p.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-platinum-muted">{t.college ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-platinum-muted">
                      {formatDate(t.created_at)}
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-sm text-platinum-muted">
                      {teams.length === 0
                        ? "No registrations yet."
                        : "No teams match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {filtered.length > recent.length && (
          <p className="mt-3 text-center text-xs text-platinum-muted">
            Showing 12 of {filtered.length} —{" "}
            <Link href="/admin/teams" className="text-orange hover:underline">
              manage all teams
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
