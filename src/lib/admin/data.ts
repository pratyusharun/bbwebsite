import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  TeamRow,
  ParticipantRow,
  TeamWithMembers,
  FlatParticipant,
} from "@/lib/validation";

export type AdminLoad<T> = { data: T; error: string | null };

/** Fetch all teams with their participants joined (primary admin shape). */
export async function getTeamsWithMembers(): Promise<
  AdminLoad<TeamWithMembers[]>
> {
  try {
    const supabase = getSupabaseAdmin();
    const [teamsRes, partsRes] = await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("participants")
        .select("*")
        .order("slot", { ascending: true }),
    ]);
    if (teamsRes.error) throw teamsRes.error;
    if (partsRes.error) throw partsRes.error;

    const teams = (teamsRes.data as TeamRow[]) ?? [];
    const parts = (partsRes.data as ParticipantRow[]) ?? [];
    const byTeam = new Map<string, ParticipantRow[]>();
    for (const p of parts) {
      const arr = byTeam.get(p.team_id) ?? [];
      arr.push(p);
      byTeam.set(p.team_id, arr);
    }
    const data: TeamWithMembers[] = teams.map((t) => ({
      ...t,
      participants: (byTeam.get(t.id) ?? []).sort((a, b) => a.slot - b.slot),
    }));
    return { data, error: null };
  } catch (e) {
    return {
      data: [],
      error:
        e instanceof Error
          ? e.message
          : "Failed to load teams. Check Supabase configuration.",
    };
  }
}

/** Flattened participants (one row per person) for the participants page. */
export async function getFlatParticipants(): Promise<
  AdminLoad<FlatParticipant[]>
> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("participant_rows")
      .select("*")
      .order("team_number", { ascending: true });
    if (error) throw error;
    return { data: (data as FlatParticipant[]) ?? [], error: null };
  } catch (e) {
    return {
      data: [],
      error:
        e instanceof Error ? e.message : "Failed to load participants.",
    };
  }
}

/** Read the auto-approval setting (defaults to true if unset/unreadable). */
export async function getAutoApprove(): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "auto_approve")
      .maybeSingle();
    if (error) throw error;
    return (data?.value ?? "true") !== "false";
  } catch {
    return true;
  }
}

export type DashboardStats = {
  totalTeams: number;
  totalParticipants: number;
  solo: number;
  duo: number;
  team: number;
  grouped: number;
  colleges: number;
  ungroupedSolos: number;
  pending: number;
};

export function computeStats(teams: TeamWithMembers[]): DashboardStats {
  let totalParticipants = 0;
  let solo = 0,
    duo = 0,
    teamCount = 0,
    grouped = 0,
    ungroupedSolos = 0,
    pending = 0;
  const colleges = new Set<string>();
  for (const t of teams) {
    totalParticipants += t.participants.length;
    if (t.status === "pending") pending++;
    if (t.college) colleges.add(t.college.trim().toLowerCase());
    switch (t.registration_type) {
      case "SOLO":
        solo++;
        if (!t.is_grouped) ungroupedSolos++;
        break;
      case "DUO":
        duo++;
        break;
      case "TEAM":
        teamCount++;
        break;
      case "GROUPED":
        grouped++;
        break;
    }
  }
  return {
    totalTeams: teams.length,
    totalParticipants,
    solo,
    duo,
    team: teamCount,
    grouped,
    colleges: colleges.size,
    ungroupedSolos,
    pending,
  };
}

/** Registrations grouped by calendar day (ISO date → count). */
export function registrationsByDay(
  teams: TeamWithMembers[],
): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const t of teams) {
    const d = t.created_at.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Top colleges by participant count. */
export function topColleges(
  teams: TeamWithMembers[],
  limit = 6,
): { college: string; participants: number; teams: number }[] {
  const map = new Map<string, { participants: number; teams: number }>();
  for (const t of teams) {
    const c = (t.college ?? "").trim() || "—";
    const cur = map.get(c) ?? { participants: 0, teams: 0 };
    cur.participants += t.participants.length;
    cur.teams += 1;
    map.set(c, cur);
  }
  return Array.from(map.entries())
    .map(([college, v]) => ({ college, ...v }))
    .sort((a, b) => b.participants - a.participants)
    .slice(0, limit);
}
