"use server";

import { registrationSchema, buildParticipants } from "@/lib/validation";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type RegisterState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level validation errors keyed by field name. */
  errors?: Record<string, string>;
  /** Assigned team number (BB_<n>) on success. */
  teamNumber?: string;
  registrationType?: "SOLO" | "DUO" | "TEAM";
};

/**
 * Server action used by the registration form.
 * Validates input, prevents duplicate emails/team, and inserts the team +
 * participants atomically via the register_team RPC (server-side BB_<n>).
 */
export async function registerTeam(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    team_name: formData.get("team_name"),
    registration_type: (formData.get("registration_type") as string) || "SOLO",
    participant_1_name: formData.get("participant_1_name"),
    participant_1_email: formData.get("participant_1_email"),
    participant_1_phone: formData.get("participant_1_phone"),
    participant_2_name: formData.get("participant_2_name") ?? "",
    participant_2_email: formData.get("participant_2_email") ?? "",
    participant_2_phone: formData.get("participant_2_phone") ?? "",
    participant_3_name: formData.get("participant_3_name") ?? "",
    participant_3_email: formData.get("participant_3_email") ?? "",
    participant_3_phone: formData.get("participant_3_phone") ?? "",
    college: formData.get("college"),
    course: formData.get("course"),
    agreed_terms: formData.get("agreed_terms") === "on",
  };

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors,
    };
  }

  const { participants, registration_type, lead_mobile } =
    buildParticipants(parsed.data);
  const data = parsed.data;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return {
      status: "error",
      message:
        "Registration is temporarily unavailable. Please try again later or contact the organizers.",
    };
  }

  const emails = participants.map((p) => p.email);

  // Duplicate prevention (defense-in-depth; DB also has unique constraints).
  const [emailHit, teamHit] = await Promise.all([
    supabase.from("participants").select("email").in("email", emails).limit(1),
    supabase
      .from("teams")
      .select("id")
      .ilike("team_name", data.team_name)
      .limit(1),
  ]);

  if (emailHit.error || teamHit.error) {
    return {
      status: "error",
      message: "Something went wrong while checking your details. Try again.",
    };
  }
  if (emailHit.data && emailHit.data.length > 0) {
    return {
      status: "error",
      message: "One of the participant emails is already registered.",
      errors: { participant_1_email: "This email is already registered." },
    };
  }
  if (teamHit.data && teamHit.data.length > 0) {
    return {
      status: "error",
      message: "This team name is already taken. Please choose another.",
      errors: { team_name: "This team name is taken." },
    };
  }

  const { data: teamNumber, error: rpcErr } = await supabase.rpc(
    "register_team",
    {
      p_team_name: data.team_name,
      p_registration_type: registration_type,
      p_college: data.college,
      p_course: data.course,
      p_mobile: lead_mobile,
      p_agreed: data.agreed_terms,
      p_participants: participants,
    },
  );

  if (rpcErr) {
    // 23505 = unique violation (race with the duplicate check above)
    if (rpcErr.code === "23505") {
      return {
        status: "error",
        message:
          "A registration with this email or team name already exists.",
      };
    }
    return {
      status: "error",
      message: "We couldn't save your registration. Please try again.",
    };
  }

  return {
    status: "success",
    message: `Team "${data.team_name}" is registered for ML Showdown.`,
    teamNumber: typeof teamNumber === "string" ? teamNumber : undefined,
    registrationType: registration_type,
  };
}
