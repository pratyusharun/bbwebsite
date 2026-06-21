import AdminShell from "@/components/admin/AdminShell";
import GroupingView, { type SoloEntry } from "@/components/admin/GroupingView";
import { getTeamsWithMembers } from "@/lib/admin/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Grouping",
  robots: { index: false, follow: false },
};

export default async function GroupingPage() {
  const { data: teams, error } = await getTeamsWithMembers();

  // Ungrouped solos AND duos are eligible to be combined, so admins can form
  // e.g. solo + duo (3) or solo + solo + solo (3).
  const solos: SoloEntry[] = teams
    .filter(
      (t) =>
        (t.registration_type === "SOLO" || t.registration_type === "DUO") &&
        !t.is_grouped,
    )
    .flatMap((t) =>
      t.participants.map((p) => ({
        participantId: p.id,
        name: p.name,
        email: p.email,
        college: t.college,
        course: t.course,
        teamNumber: t.team_number,
        type: t.registration_type as "SOLO" | "DUO",
        teammates: t.participants
          .filter((o) => o.id !== p.id)
          .map((o) => o.name),
        createdAt: p.created_at,
      })),
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const grouped = teams
    .filter((t) => t.is_grouped)
    .map((t) => ({
      team_number: t.team_number,
      team_name: t.team_name,
      members: t.participants.map((p) => p.name),
    }));

  return (
    <AdminShell title="Solo Grouping" subtitle="ML Showdown · Build teams from solo entrants">
      <GroupingView solos={solos} grouped={grouped} loadError={error} />
    </AdminShell>
  );
}
