import AdminShell from "@/components/admin/AdminShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
import {
  getTeamsWithMembers,
  computeStats,
  registrationsByDay,
  topColleges,
  getAutoApprove,
} from "@/lib/admin/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Control Center",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { data: teams, error } = await getTeamsWithMembers();
  const stats = computeStats(teams);
  const byDay = registrationsByDay(teams);
  const colleges = topColleges(teams, 6);
  const autoApprove = await getAutoApprove();

  return (
    <AdminShell title="Control Center" subtitle="ML Showdown · Competition Operations">
      <AdminDashboard
        teams={teams}
        stats={stats}
        byDay={byDay}
        colleges={colleges}
        autoApprove={autoApprove}
        loadError={error}
      />
    </AdminShell>
  );
}
