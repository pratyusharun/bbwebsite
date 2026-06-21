import { z } from "zod";

/** Indian mobile number: 10 digits, optionally prefixed by +91 / 0. */
const mobileRegex = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;

const name = (label: string, min = 2, max = 80) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} is too long`);

const optionalName = z
  .string()
  .trim()
  .max(80, "Name is too long")
  .optional()
  .or(z.literal(""));

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .optional()
  .or(z.literal(""));

const optionalPhone = z
  .string()
  .trim()
  .max(20)
  .optional()
  .or(z.literal(""));

export const REGISTRATION_TYPES = ["SOLO", "DUO", "TEAM"] as const;
export type RegistrationType = (typeof REGISTRATION_TYPES)[number];

/**
 * Registration schema with dynamic participant rules:
 *   • Participant 1 (name + email + phone) is always required.
 *   • Participant 2 / 3 are optional, BUT if a name is entered the matching
 *     email and phone become required (and vice-versa).
 * Participant 1's phone doubles as the team's lead contact number.
 * The stored registration_type is derived from how many participants are
 * actually filled in (1 → SOLO, 2 → DUO, 3 → TEAM).
 */
export const registrationSchema = z
  .object({
    team_name: name("Team name", 2, 80),
    registration_type: z.enum(REGISTRATION_TYPES).default("SOLO"),

    participant_1_name: name("Participant 1 name"),
    participant_1_email: z
      .string({ required_error: "Participant 1 email is required" })
      .trim()
      .toLowerCase()
      .email("Enter a valid email for Participant 1"),
    participant_1_phone: z
      .string({ required_error: "Participant 1 mobile number is required" })
      .trim()
      .regex(mobileRegex, "Enter a valid 10-digit mobile number for Participant 1"),

    participant_2_name: optionalName,
    participant_2_email: optionalEmail,
    participant_2_phone: optionalPhone,
    participant_3_name: optionalName,
    participant_3_email: optionalEmail,
    participant_3_phone: optionalPhone,

    college: name("College name", 2, 120),
    course: name("Course / Degree", 2, 120),
    agreed_terms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the competition rules" }),
    }),
  })
  .strict()
  .superRefine((data, ctx) => {
    const groups: Array<[string, string, string, number]> = [
      ["participant_2_name", "participant_2_email", "participant_2_phone", 2],
      ["participant_3_name", "participant_3_email", "participant_3_phone", 3],
    ];
    const get = (k: string) =>
      (data as unknown as Record<string, string | undefined>)[k];
    for (const [nameKey, emailKey, phoneKey, n] of groups) {
      const nm = get(nameKey)?.trim();
      const em = get(emailKey)?.trim();
      const ph = get(phoneKey)?.trim();
      // A participant is "present" if any of their fields is filled.
      const present = !!(nm || em || ph);
      if (present && !nm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [nameKey],
          message: `Participant ${n} name is required`,
        });
      }
      if (present && !em) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [emailKey],
          message: `Participant ${n} email is required`,
        });
      }
      if (present && !ph) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [phoneKey],
          message: `Participant ${n} mobile number is required`,
        });
      }
      if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [emailKey],
          message: `Enter a valid email for Participant ${n}`,
        });
      }
      if (ph && !mobileRegex.test(ph)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [phoneKey],
          message: `Enter a valid 10-digit mobile number for Participant ${n}`,
        });
      }
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type ParticipantPayload = {
  name: string;
  email: string;
  phone: string;
  slot: number;
};

/** Build the normalized participant array + derived registration type. */
export function buildParticipants(data: RegistrationInput): {
  participants: ParticipantPayload[];
  registration_type: RegistrationType;
  lead_mobile: string;
} {
  const participants: ParticipantPayload[] = [
    {
      name: data.participant_1_name.trim(),
      email: data.participant_1_email.trim().toLowerCase(),
      phone: data.participant_1_phone.trim(),
      slot: 1,
    },
  ];
  if (data.participant_2_name?.trim() && data.participant_2_email?.trim()) {
    participants.push({
      name: data.participant_2_name.trim(),
      email: data.participant_2_email.trim().toLowerCase(),
      phone: (data.participant_2_phone ?? "").trim(),
      slot: 2,
    });
  }
  if (data.participant_3_name?.trim() && data.participant_3_email?.trim()) {
    participants.push({
      name: data.participant_3_name.trim(),
      email: data.participant_3_email.trim().toLowerCase(),
      phone: (data.participant_3_phone ?? "").trim(),
      slot: 3,
    });
  }
  const registration_type: RegistrationType =
    participants.length === 1 ? "SOLO" : participants.length === 2 ? "DUO" : "TEAM";
  // Participant 1's number is the team's lead contact.
  return { participants, registration_type, lead_mobile: participants[0].phone };
}

// ── Database row shapes ───────────────────────────────────────────
export type TeamRow = {
  id: string;
  team_number: string;
  team_name: string;
  registration_type: "SOLO" | "DUO" | "TEAM" | "GROUPED";
  college: string | null;
  course: string | null;
  mobile_number: string | null;
  agreed_terms: boolean;
  is_grouped: boolean;
  status: "pending" | "approved";
  source: "registration" | "admin";
  created_at: string;
  updated_at: string;
};

export type ParticipantRow = {
  id: string;
  team_id: string;
  name: string;
  email: string;
  phone: string | null;
  slot: number;
  registration_type: "SOLO" | "DUO" | "TEAM" | "GROUPED";
  is_grouped: boolean;
  created_at: string;
};

/** A team joined with its members — primary admin data shape. */
export type TeamWithMembers = TeamRow & {
  participants: ParticipantRow[];
};

/** Flattened participant row (one per person) for the participants page. */
export type FlatParticipant = {
  participant_id: string;
  team_id: string;
  team_number: string;
  team_name: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string | null;
  slot: number;
  registration_type: "SOLO" | "DUO" | "TEAM" | "GROUPED";
  is_grouped: boolean;
  status: "pending" | "approved";
  college: string | null;
  course: string | null;
  created_at: string;
};
