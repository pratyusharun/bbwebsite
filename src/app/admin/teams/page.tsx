import AdminShell from "@/components/admin/AdminShell";
import TeamsView from "@/components/admin/TeamsView";
import { getTeamsWithMembers } from "@/lib/admin/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Teams",
  robots: { index: false, follow: false },
};

export default async function TeamsPage() {
  const { data: teams, error } = await getTeamsWithMembers();
  return (
    <AdminShell title="Team Management" subtitle="ML Showdown · Roster control">
      <TeamsView teams={teams} loadError={error} />
    </AdminShell>
  );
}
