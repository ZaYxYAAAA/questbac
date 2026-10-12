import { MissionDetail } from "./MissionDetail";

export default async function ForgedMissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ missionId: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { missionId } = await params;
  const { onglet } = await searchParams;
  return <MissionDetail missionId={missionId} initialTab={onglet === "editer" ? "editer" : onglet === "fiche" ? "fiche" : "jouer"} />;
}
