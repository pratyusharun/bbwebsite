"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Pencil,
  Trash2,
  Scissors,
  GitMerge,
  ChevronDown,
  ArrowRightLeft,
  AlertTriangle,
  Check,
  Clock,
  BadgeCheck,
  Layers,
} from "lucide-react";
import type { TeamWithMembers } from "@/lib/validation";
import { cn } from "@/lib/utils";
import {
  updateTeamAction,
  deleteTeamAction,
  moveParticipantAction,
  mergeTeamsAction,
  splitTeamAction,
  approveTeamAction,
} from "@/app/actions/admin";
import { useToast } from "./Toast";
import { Modal, ConfirmDialog } from "./Modal";

const TYPE_BADGE: Record<string, string> = {
  SOLO: "bg-orange/15 text-orange ring-orange/30",
  DUO: "bg-gold/15 text-gold ring-gold/30",
  TEAM: "bg-orange-400/15 text-orange-400 ring-orange-400/30",
  GROUPED: "bg-white/10 text-platinum-soft ring-white/20",
};

export default function TeamsView({
  teams,
  loadError,
}: {
  teams: TeamWithMembers[];
  loadError: string | null;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [editTeam, setEditTeam] = useState<TeamWithMembers | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<TeamWithMembers | null>(null);
  const [splitTeam, setSplitTeam] = useState<TeamWithMembers | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) =>
      [t.team_number, t.team_name, t.college ?? "", ...t.participants.map((p) => p.name)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [teams, query]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function refresh() {
    router.refresh();
  }

  function doMove(participantId: string, targetTeamId: string) {
    if (!targetTeamId) return;
    startTransition(async () => {
      const res = await moveParticipantAction(participantId, targetTeamId);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) refresh();
    });
  }

  function doApprove(teamId: string) {
    startTransition(async () => {
      const res = await approveTeamAction(teamId);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) refresh();
    });
  }

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-platinum-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, members…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-orange/60 focus:ring-2 focus:ring-orange/20"
          />
        </div>
        <button
          onClick={() => setMergeOpen(true)}
          disabled={teams.length < 2}
          className="btn-ghost disabled:opacity-50"
        >
          <GitMerge className="h-4 w-4" /> Merge teams
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center text-sm text-platinum-muted">
          <Layers className="mb-3 h-7 w-7 opacity-40" />
          {teams.length === 0 ? "No teams yet." : "No teams match your search."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => {
            const open = expanded.has(t.id);
            return (
              <div
                key={t.id}
                className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]"
              >
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    onClick={() => toggle(t.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="font-mono text-sm font-bold text-orange">
                      {t.team_number}
                    </span>
                    <span className="font-display font-semibold text-white">
                      {t.team_name}
                    </span>
                    <span
                      className={`hidden rounded-md px-2 py-0.5 font-mono text-[10px] ring-1 sm:inline-flex ${TYPE_BADGE[t.registration_type]}`}
                    >
                      {t.registration_type}
                    </span>
                    {t.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-300 ring-1 ring-amber-400/30">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    ) : (
                      <span className="hidden items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300 ring-1 ring-emerald-400/30 sm:inline-flex">
                        <Check className="h-3 w-3" /> Approved
                      </span>
                    )}
                    <span className="text-xs text-platinum-muted">
                      {t.participants.length} member
                      {t.participants.length === 1 ? "" : "s"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-platinum-muted transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {t.status === "pending" && (
                      <IconBtn label="Approve" onClick={() => doApprove(t.id)}>
                        <BadgeCheck className="h-4 w-4" />
                      </IconBtn>
                    )}
                    <IconBtn label="Edit" onClick={() => setEditTeam(t)}>
                      <Pencil className="h-4 w-4" />
                    </IconBtn>
                    {t.participants.length > 1 && (
                      <IconBtn label="Split" onClick={() => setSplitTeam(t)}>
                        <Scissors className="h-4 w-4" />
                      </IconBtn>
                    )}
                    <IconBtn
                      label="Delete"
                      danger
                      onClick={() => setDeleteTeam(t)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-white/6 bg-black/20 p-4">
                    <div className="space-y-2">
                      {t.participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2.5"
                        >
                          <span className="grid h-6 w-6 place-items-center rounded bg-orange/15 font-mono text-[10px] text-orange">
                            {p.slot}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white">{p.name}</p>
                            <p className="truncate text-xs text-platinum-muted">
                              {p.email}
                              {p.phone ? ` · ${p.phone}` : ""}
                            </p>
                          </div>
                          <label className="flex items-center gap-1.5 text-xs text-platinum-muted">
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            <select
                              defaultValue=""
                              disabled={pending}
                              onChange={(e) => doMove(p.id, e.target.value)}
                              className="rounded-lg border border-white/10 bg-ink-700 px-2 py-1.5 text-xs text-white outline-none focus:border-orange/60"
                            >
                              <option value="">Move to…</option>
                              {teams
                                .filter((o) => o.id !== t.id)
                                .map((o) => (
                                  <option key={o.id} value={o.id}>
                                    {o.team_number} · {o.team_name}
                                  </option>
                                ))}
                            </select>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-platinum-muted">
                      <span>College: {t.college ?? "—"}</span>
                      <span>Course: {t.course ?? "—"}</span>
                      <span>Mobile: {t.mobile_number ?? "—"}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editTeam && (
        <EditTeamModal
          team={editTeam}
          onClose={() => setEditTeam(null)}
          onSaved={() => {
            setEditTeam(null);
            refresh();
          }}
        />
      )}

      {splitTeam && (
        <SplitTeamModal
          team={splitTeam}
          onClose={() => setSplitTeam(null)}
          onDone={() => {
            setSplitTeam(null);
            refresh();
          }}
        />
      )}

      {mergeOpen && (
        <MergeModal
          teams={teams}
          onClose={() => setMergeOpen(false)}
          onDone={() => {
            setMergeOpen(false);
            refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTeam}
        onClose={() => setDeleteTeam(null)}
        onConfirm={() => {
          if (!deleteTeam) return;
          const id = deleteTeam.id;
          startTransition(async () => {
            const res = await deleteTeamAction(id);
            toast(res.message, res.ok ? "success" : "error");
            setDeleteTeam(null);
            if (res.ok) refresh();
          });
        }}
        title="Delete team?"
        body={`Permanently deletes ${deleteTeam?.team_number ?? ""} (${deleteTeam?.team_name ?? ""}) and all its members. This cannot be undone.`}
        confirmLabel="Delete team"
        danger
        busy={pending}
      />
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-platinum-muted transition-colors",
        danger ? "hover:border-red-500/40 hover:text-red-400" : "hover:border-orange/40 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function EditTeamModal({
  team,
  onClose,
  onSaved,
}: {
  team: TeamWithMembers;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    team_name: team.team_name,
    college: team.college ?? "",
    course: team.course ?? "",
    mobile_number: team.mobile_number ?? "",
  });

  function save() {
    startTransition(async () => {
      const res = await updateTeamAction(team.id, form);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) onSaved();
    });
  }

  return (
    <Modal open onClose={onClose} title={`Edit ${team.team_number}`}>
      <div className="space-y-3">
        {(
          [
            ["team_name", "Team name"],
            ["college", "College"],
            ["course", "Course"],
            ["mobile_number", "Mobile"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
              {label}
            </label>
            <input
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-white outline-none focus:border-orange/60 focus:ring-2 focus:ring-orange/20"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost px-5 py-2.5">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={pending}
          className="btn-primary px-5 py-2.5 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Modal>
  );
}

function SplitTeamModal({
  team,
  onClose,
  onDone,
}: {
  team: TeamWithMembers;
  onClose: () => void;
  onDone: () => void;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function submit() {
    if (picked.size === 0 || picked.size === team.participants.length) {
      toast("Pick some (not all) members to peel into a new team.", "info");
      return;
    }
    startTransition(async () => {
      const res = await splitTeamAction(Array.from(picked), name.trim() || undefined);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) onDone();
    });
  }

  return (
    <Modal open onClose={onClose} title={`Split ${team.team_number}`}>
      <p className="mb-3 text-sm text-platinum-soft">
        Select members to move into a new team. Remaining members stay in{" "}
        {team.team_number}.
      </p>
      <div className="space-y-2">
        {team.participants.map((p) => {
          const active = picked.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                active ? "border-orange/60 bg-orange/10" : "border-white/10 bg-white/[0.02]",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-md border",
                  active ? "border-orange bg-orange text-ink" : "border-white/20",
                )}
              >
                {active && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="text-sm text-white">{p.name}</span>
            </button>
          );
        })}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New team name (optional)"
        className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-white outline-none focus:border-orange/60 focus:ring-2 focus:ring-orange/20"
      />
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost px-5 py-2.5">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={pending}
          className="btn-primary px-5 py-2.5 disabled:opacity-60"
        >
          {pending ? "Splitting…" : "Create new team"}
        </button>
      </div>
    </Modal>
  );
}

function MergeModal({
  teams,
  onClose,
  onDone,
}: {
  teams: TeamWithMembers[];
  onClose: () => void;
  onDone: () => void;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");

  function submit() {
    if (!source || !target || source === target) {
      toast("Pick two different teams.", "info");
      return;
    }
    startTransition(async () => {
      const res = await mergeTeamsAction(source, target);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) onDone();
    });
  }

  const opts = teams.map((t) => (
    <option key={t.id} value={t.id}>
      {t.team_number} · {t.team_name} ({t.participants.length})
    </option>
  ));

  return (
    <Modal open onClose={onClose} title="Merge teams">
      <p className="mb-4 text-sm text-platinum-soft">
        All members of the source team move into the destination team, then the
        source team is deleted.
      </p>
      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
            Source (will be emptied & deleted)
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white outline-none focus:border-orange/60"
          >
            <option value="">Select team…</option>
            {opts}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
            Destination
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white outline-none focus:border-orange/60"
          >
            <option value="">Select team…</option>
            {opts}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost px-5 py-2.5">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={pending}
          className="btn-primary px-5 py-2.5 disabled:opacity-60"
        >
          {pending ? "Merging…" : "Merge"}
        </button>
      </div>
    </Modal>
  );
}
