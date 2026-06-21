"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UserPlus,
  Check,
  Wand2,
  AlertTriangle,
  Network,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createGroupAction, autoGroupAction } from "@/app/actions/admin";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./Modal";

export type SoloEntry = {
  participantId: string;
  name: string;
  email: string;
  college: string | null;
  course: string | null;
  teamNumber: string;
  type: "SOLO" | "DUO";
  teammates: string[];
  createdAt: string;
};

export default function GroupingView({
  solos,
  grouped,
  loadError,
}: {
  solos: SoloEntry[];
  grouped: { team_number: string; team_name: string; members: string[] }[];
  loadError: string | null;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [teamName, setTeamName] = useState("");
  const [autoOpen, setAutoOpen] = useState(false);

  // Auto-create only acts on pure solos; duos are for manual combining.
  const soloOnly = solos.filter((s) => s.type === "SOLO");
  const duoCount = solos.length - soloOnly.length;
  const possibleTeams = Math.floor(soloOnly.length / 3);
  const remainder = soloOnly.length % 3;

  const selectedList = useMemo(
    () => solos.filter((s) => selected.has(s.participantId)),
    [solos, selected],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      else toast("A team can have at most 3 members.", "info");
      return next;
    });
  }

  function createTeam() {
    if (selected.size < 2) {
      toast("Select at least 2 participants to form a team.", "info");
      return;
    }
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await createGroupAction(ids, teamName.trim() || undefined);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setSelected(new Set());
        setTeamName("");
        router.refresh();
      }
    });
  }

  function autoGroup() {
    setAutoOpen(false);
    startTransition(async () => {
      const res = await autoGroupAction();
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Summary / auto bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-orange/25 bg-orange/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange/15 text-orange ring-1 ring-orange/30">
            <Network className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-white">
              {solos.length} ungrouped participant{solos.length === 1 ? "" : "s"}
              <span className="ml-2 font-mono text-xs font-normal text-platinum-muted">
                {soloOnly.length} solo · {duoCount} in duos
              </span>
            </p>
            <p className="text-sm text-platinum-muted">
              Auto-grouping forms{" "}
              <span className="text-orange">{possibleTeams}</span> team
              {possibleTeams === 1 ? "" : "s"} of 3 from solos
              {remainder ? ` · ${remainder} solo(s) would remain` : ""}. Mix
              solos and duos manually to build teams of up to 3.
            </p>
          </div>
        </div>
        <button
          onClick={() => setAutoOpen(true)}
          disabled={pending || soloOnly.length < 3}
          className="btn-primary justify-center disabled:opacity-50"
        >
          <Wand2 className="h-4 w-4" />
          Auto Create Teams
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Solo list */}
        <div>
          <p className="kicker mb-3">Solo &amp; duo participants — select to group</p>
          {solos.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center text-sm text-platinum-muted">
              <Users className="mb-3 h-7 w-7 opacity-40" />
              No ungrouped solo or duo participants.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {solos.map((s) => {
                const active = selected.has(s.participantId);
                return (
                  <button
                    key={s.participantId}
                    onClick={() => toggle(s.participantId)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      active
                        ? "border-orange/60 bg-orange/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                        active
                          ? "border-orange bg-orange text-ink"
                          : "border-white/20",
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-white">
                          {s.name}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 ring-1",
                            s.type === "DUO"
                              ? "bg-gold/15 text-gold ring-gold/30"
                              : "bg-orange/15 text-orange ring-orange/30",
                          )}
                        >
                          {s.type}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-platinum-muted">
                        {s.email}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                        {s.teamNumber} · {s.college ?? "—"}
                        {s.type === "DUO" && s.teammates.length > 0
                          ? ` · with ${s.teammates.join(", ")}`
                          : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Builder panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <p className="kicker mb-3">New team</p>
            <div className="mb-3 min-h-[88px] space-y-2">
              {selectedList.length === 0 ? (
                <p className="text-sm text-platinum-muted">
                  Pick 2–3 participants (solos and/or a duo) to form a team.
                </p>
              ) : (
                selectedList.map((s, i) => (
                  <div
                    key={s.participantId}
                    className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded bg-orange/15 font-mono text-[10px] text-orange">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm text-white">{s.name}</span>
                  </div>
                ))
              )}
            </div>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name (optional)"
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-white placeholder:text-platinum-muted/50 outline-none focus:border-orange/60 focus:ring-2 focus:ring-orange/20"
            />
            <button
              onClick={createTeam}
              disabled={pending || selected.size < 2}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {pending ? "Creating…" : "Create Team"}
            </button>
          </div>

          {grouped.length > 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <p className="kicker mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-gold" /> Grouped teams (
                {grouped.length})
              </p>
              <div className="space-y-2">
                {grouped.map((g) => (
                  <div
                    key={g.team_number}
                    className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-orange">
                        {g.team_number}
                      </span>
                      <span className="truncate text-xs text-platinum-muted">
                        {g.team_name}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-platinum-soft">
                      {g.members.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={autoOpen}
        onClose={() => setAutoOpen(false)}
        onConfirm={autoGroup}
        title="Auto-create teams?"
        body={`This will form ${possibleTeams} team(s) of 3 from the ${solos.length} ungrouped solo participants${remainder ? `, leaving ${remainder} unassigned` : ""}. You can still edit teams afterwards.`}
        confirmLabel="Create teams"
        busy={pending}
      />
    </div>
  );
}
