"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  Users,
} from "lucide-react";
import type { FlatParticipant } from "@/lib/validation";
import { formatDate } from "@/lib/utils";
import { exportParticipantsCsv, exportParticipantsXlsx, stamp } from "@/lib/export";
import { removeParticipantAction } from "@/app/actions/admin";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./Modal";

const TYPES = ["ALL", "SOLO", "DUO", "TEAM", "GROUPED"] as const;
const PAGE_SIZE = 15;

const TYPE_BADGE: Record<string, string> = {
  SOLO: "bg-orange/15 text-orange ring-orange/30",
  DUO: "bg-gold/15 text-gold ring-gold/30",
  TEAM: "bg-orange-400/15 text-orange-400 ring-orange-400/30",
  GROUPED: "bg-white/10 text-platinum-soft ring-white/20",
};

export default function ParticipantsView({
  rows,
  loadError,
}: {
  rows: FlatParticipant[];
  loadError: string | null;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("ALL");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<FlatParticipant | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (type !== "ALL" && r.registration_type !== type) return false;
      if (!q) return true;
      return [
        r.team_number,
        r.participant_name,
        r.participant_email,
        r.college ?? "",
        r.course ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, query, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function exportRows(kind: "csv" | "xlsx") {
    setBusy(kind);
    try {
      if (kind === "csv") exportParticipantsCsv(filtered, stamp("participants"));
      else await exportParticipantsXlsx(filtered, stamp("participants"));
      toast("Export ready.", "success");
    } catch {
      toast("Export failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    startTransition(async () => {
      const res = await removeParticipantAction(target.participant_id);
      toast(res.message, res.ok ? "success" : "error");
      setToDelete(null);
      if (res.ok) router.refresh();
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

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-platinum-muted" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, team #, college…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-orange/60 focus:ring-2 focus:ring-orange/20"
            />
          </div>
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
                  type === t
                    ? "bg-orange/15 text-orange"
                    : "text-platinum-muted hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportRows("csv")}
            disabled={busy !== null || filtered.length === 0}
            className="btn-ghost disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {busy === "csv" ? "…" : "CSV"}
          </button>
          <button
            onClick={() => exportRows("xlsx")}
            disabled={busy !== null || filtered.length === 0}
            className="btn-primary disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {busy === "xlsx" ? "…" : "XLSX"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="bg-white/[0.03]">
              <tr className="font-mono text-[10px] uppercase tracking-wider2 text-platinum-muted">
                <th className="px-4 py-3">Team #</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6 text-sm">
              {pageRows.map((r) => (
                <tr key={r.participant_id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-orange">{r.team_number}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.participant_name}</td>
                  <td className="px-4 py-3 text-platinum-soft">{r.participant_email}</td>
                  <td className="px-4 py-3 text-platinum-muted">{r.participant_phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] ring-1 ${TYPE_BADGE[r.registration_type]}`}
                    >
                      {r.registration_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-platinum-muted">{r.college ?? "—"}</td>
                  <td className="px-4 py-3 text-platinum-muted">{r.course ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-platinum-muted">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setToDelete(r)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-platinum-muted transition-colors hover:border-red-500/40 hover:text-red-400"
                      aria-label="Remove participant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-platinum-muted">
                    <Users className="mx-auto mb-3 h-7 w-7 opacity-40" />
                    {rows.length === 0
                      ? "No participants yet."
                      : "No participants match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-platinum-muted">
        <p>
          Showing{" "}
          <span className="text-white">
            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of <span className="text-white">{filtered.length}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border border-white/10 px-3 py-1.5 transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="font-mono text-xs">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-lg border border-white/10 px-3 py-1.5 transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove participant?"
        body={`This removes ${toDelete?.participant_name ?? "this participant"} from ${toDelete?.team_number ?? "their team"}. If it's the last member, the team is deleted too. This cannot be undone.`}
        confirmLabel="Remove"
        danger
        busy={pending}
      />
    </div>
  );
}
