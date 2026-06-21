import AdminShell from "@/components/admin/AdminShell";
import ParticipantsView from "@/components/admin/ParticipantsView";
import { getFlatParticipants } from "@/lib/admin/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Participants",
  robots: { index: false, follow: false },
};

export default async function ParticipantsPage() {
  const { data, error } = await getFlatParticipants();
  return (
    <AdminShell title="Participants" subtitle="ML Showdown · Individual entrants">
      <ParticipantsView rows={data} loadError={error} />
    </AdminShell>
  );
}
