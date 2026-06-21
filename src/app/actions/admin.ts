"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export type ActionResult = {
  ok: boolean;
  message: string;
  teamNumber?: string;
  created?: number;
};

function revalidateAdmin() {
  for (const p of [
    "/admin",
    "/admin/participants",
    "/admin/teams",
    "/admin/grouping",
  ]) {
    revalidatePath(p);
  }
}

/** Recompute a team's registration_type from its current member count. */
async function recomputeType(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  teamId: string,
) {
  const { data: team } = await supabase
    .from("teams")
    .select("is_grouped")
    .eq("id", teamId)
    .single();
  if (!team) return;
  if (team.is_grouped) return; // grouped teams keep their type
  const { count } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);
  const n = count ?? 0;
  if (n === 0) return;
  const type = n === 1 ? "SOLO" : n === 2 ? "DUO" : "TEAM";
  await supabase.from("teams").update({ registration_type: type }).eq("id", teamId);
}

/** Combine selected participants into a NEW grouped team. Also powers split. */
export async function createGroupAction(
  participantIds: string[],
  teamName?: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!participantIds.length)
      return { ok: false, message: "Select at least one participant." };
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("group_solos", {
      p_participant_ids: participantIds,
      p_team_name: teamName ?? null,
    });
    if (error) throw error;
    revalidateAdmin();
    return {
      ok: true,
      message: `Team ${data} created with ${participantIds.length} members.`,
      teamNumber: typeof data === "string" ? data : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to create team.",
    };
  }
}

/** Auto-create teams of 3 from all ungrouped solo participants. */
export async function autoGroupAction(): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    const { data: soloTeams, error: tErr } = await supabase
      .from("teams")
      .select("id, created_at")
      .eq("registration_type", "SOLO")
      .eq("is_grouped", false)
      .order("created_at", { ascending: true });
    if (tErr) throw tErr;
    const teamIds = (soloTeams ?? []).map((t) => t.id);
    if (teamIds.length < 3)
      return {
        ok: false,
        message: "Need at least 3 ungrouped solo participants to auto-create a team.",
      };

    const { data: parts, error: pErr } = await supabase
      .from("participants")
      .select("id, team_id, created_at")
      .in("team_id", teamIds)
      .order("created_at", { ascending: true });
    if (pErr) throw pErr;

    const ids = (parts ?? []).map((p) => p.id);
    let created = 0;
    for (let i = 0; i + 3 <= ids.length; i += 3) {
      const chunk = ids.slice(i, i + 3);
      const { error } = await supabase.rpc("group_solos", {
        p_participant_ids: chunk,
        p_team_name: null,
      });
      if (error) throw error;
      created++;
    }
    revalidateAdmin();
    const remainder = ids.length % 3;
    return {
      ok: true,
      created,
      message: `Created ${created} team${created === 1 ? "" : "s"}.${
        remainder ? ` ${remainder} participant(s) left unassigned.` : ""
      }`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Auto-grouping failed.",
    };
  }
}

export async function updateTeamAction(
  teamId: string,
  fields: {
    team_name?: string;
    college?: string;
    course?: string;
    mobile_number?: string;
  },
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v === "string") patch[k] = v.trim();
    }
    if (patch.team_name !== undefined && patch.team_name.length < 2)
      return { ok: false, message: "Team name must be at least 2 characters." };
    const { error } = await supabase.from("teams").update(patch).eq("id", teamId);
    if (error) throw error;
    revalidateAdmin();
    return { ok: true, message: "Team updated." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to update team.",
    };
  }
}

/** Approve a single pending team. */
export async function approveTeamAction(teamId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("teams")
      .update({ status: "approved" })
      .eq("id", teamId);
    if (error) throw error;
    revalidateAdmin();
    return { ok: true, message: "Team approved." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to approve team.",
    };
  }
}

/** Approve every currently-pending team at once. */
export async function approveAllTeamsAction(): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("teams")
      .update({ status: "approved" })
      .eq("status", "pending")
      .select("id");
    if (error) throw error;
    revalidateAdmin();
    const n = data?.length ?? 0;
    return {
      ok: true,
      message: n === 0 ? "No pending teams." : `Approved ${n} team${n === 1 ? "" : "s"}.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to approve teams.",
    };
  }
}

/** Turn auto-approval of new registrations on or off. */
export async function setAutoApproveAction(
  enabled: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key: "auto_approve", value: enabled ? "true" : "false" },
        { onConflict: "key" },
      );
    if (error) throw error;
    revalidateAdmin();
    return {
      ok: true,
      message: enabled
        ? "Auto-approval is ON — new teams are approved automatically."
        : "Auto-approval is OFF — new teams await your approval.",
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to update setting.",
    };
  }
}

export async function deleteTeamAction(teamId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) throw error;
    revalidateAdmin();
    return { ok: true, message: "Team deleted." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to delete team.",
    };
  }
}

/** Move one participant into another team. */
export async function moveParticipantAction(
  participantId: string,
  targetTeamId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { data: cur, error: cErr } = await supabase
      .from("participants")
      .select("team_id")
      .eq("id", participantId)
      .single();
    if (cErr) throw cErr;
    const sourceTeamId = cur?.team_id as string;
    if (sourceTeamId === targetTeamId)
      return { ok: false, message: "Participant is already in that team." };

    const { count } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("team_id", targetTeamId);
    const nextSlot = (count ?? 0) + 1;

    const { error } = await supabase
      .from("participants")
      .update({ team_id: targetTeamId, slot: nextSlot })
      .eq("id", participantId);
    if (error) throw error;

    // Clean up an empty source team, else recompute its type.
    const { count: srcCount } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("team_id", sourceTeamId);
    if ((srcCount ?? 0) === 0) {
      await supabase.from("teams").delete().eq("id", sourceTeamId);
    } else {
      await recomputeType(supabase, sourceTeamId);
    }
    await recomputeType(supabase, targetTeamId);

    revalidateAdmin();
    return { ok: true, message: "Participant moved." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to move participant.",
    };
  }
}

/** Merge all members of source into target, then delete source. */
export async function mergeTeamsAction(
  sourceTeamId: string,
  targetTeamId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (sourceTeamId === targetTeamId)
      return { ok: false, message: "Pick two different teams." };
    const supabase = getSupabaseAdmin();

    const { count } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("team_id", targetTeamId);
    let slot = count ?? 0;

    const { data: srcParts, error: sErr } = await supabase
      .from("participants")
      .select("id")
      .eq("team_id", sourceTeamId)
      .order("slot", { ascending: true });
    if (sErr) throw sErr;

    for (const p of srcParts ?? []) {
      slot++;
      const { error } = await supabase
        .from("participants")
        .update({ team_id: targetTeamId, slot })
        .eq("id", p.id);
      if (error) throw error;
    }
    await supabase.from("teams").delete().eq("id", sourceTeamId);
    await recomputeType(supabase, targetTeamId);

    revalidateAdmin();
    return { ok: true, message: "Teams merged." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to merge teams.",
    };
  }
}

/** Split: move selected participants out into a new team (leaves the rest). */
export async function splitTeamAction(
  participantIds: string[],
  newTeamName?: string,
): Promise<ActionResult> {
  // group_solos creates a new team from the selected members and leaves
  // non-empty origin teams intact — exactly the split behaviour we want.
  return createGroupAction(participantIds, newTeamName);
}

/** Delete a single participant. */
export async function removeParticipantAction(
  participantId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const { data: cur } = await supabase
      .from("participants")
      .select("team_id")
      .eq("id", participantId)
      .single();
    const teamId = cur?.team_id as string | undefined;
    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantId);
    if (error) throw error;
    if (teamId) {
      const { count } = await supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .eq("team_id", teamId);
      if ((count ?? 0) === 0) {
        await supabase.from("teams").delete().eq("id", teamId);
      } else {
        await recomputeType(supabase, teamId);
      }
    }
    revalidateAdmin();
    return { ok: true, message: "Participant removed." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Failed to remove participant.",
    };
  }
}
