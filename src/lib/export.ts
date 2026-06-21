import type { TeamWithMembers, FlatParticipant } from "@/lib/validation";
import { formatDate } from "@/lib/utils";

// ── low-level helpers ─────────────────────────────────────────────
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCsv(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(
  headers: readonly string[],
  rows: (string | number)[][],
  filename: string,
) {
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(r.map(escapeCsv).join(","));
  const blob = new Blob(["﻿" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, `${filename}.csv`);
}

async function downloadXlsx(
  headers: readonly string[],
  rows: (string | number)[][],
  cols: number[],
  sheet: string,
  filename: string,
) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([headers as unknown as string[], ...rows]);
  ws["!cols"] = cols.map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  XLSX.writeFile(wb, `${filename}.xlsx`, { compression: true });
}

// ── Teams export ──────────────────────────────────────────────────
const TEAM_HEADERS = [
  "Team Number",
  "Team Name",
  "Type",
  "Members",
  "Emails",
  "Mobile",
  "College",
  "Course",
  "Grouped",
  "Registered At",
] as const;
const TEAM_COLS = [12, 24, 10, 40, 44, 16, 28, 18, 10, 20];

function teamRow(t: TeamWithMembers): (string | number)[] {
  return [
    t.team_number,
    t.team_name,
    t.registration_type,
    t.participants.map((p) => p.name).join(" | "),
    t.participants.map((p) => p.email).join(" | "),
    t.mobile_number ?? "",
    t.college ?? "",
    t.course ?? "",
    t.is_grouped ? "Yes" : "No",
    formatDate(t.created_at),
  ];
}

export function exportTeamsCsv(teams: TeamWithMembers[], filename: string) {
  downloadCsv(TEAM_HEADERS, teams.map(teamRow), filename);
}

export async function exportTeamsXlsx(
  teams: TeamWithMembers[],
  filename: string,
) {
  await downloadXlsx(
    TEAM_HEADERS,
    teams.map(teamRow),
    TEAM_COLS,
    "Teams",
    filename,
  );
}

// ── Participants export ───────────────────────────────────────────
const PARTICIPANT_HEADERS = [
  "Team Number",
  "Participant Name",
  "Participant Email",
  "Participant Mobile",
  "Registration Type",
  "College",
  "Course",
  "Registered At",
] as const;
const PARTICIPANT_COLS = [12, 24, 28, 16, 16, 28, 18, 20];

function participantRow(p: FlatParticipant): (string | number)[] {
  return [
    p.team_number,
    p.participant_name,
    p.participant_email,
    p.participant_phone ?? "",
    p.registration_type,
    p.college ?? "",
    p.course ?? "",
    formatDate(p.created_at),
  ];
}

export function exportParticipantsCsv(
  rows: FlatParticipant[],
  filename: string,
) {
  downloadCsv(PARTICIPANT_HEADERS, rows.map(participantRow), filename);
}

export async function exportParticipantsXlsx(
  rows: FlatParticipant[],
  filename: string,
) {
  await downloadXlsx(
    PARTICIPANT_HEADERS,
    rows.map(participantRow),
    PARTICIPANT_COLS,
    "Participants",
    filename,
  );
}

export function stamp(prefix: string) {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}`;
}
