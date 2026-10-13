import { listPlayers, storageDown } from "@/lib/server/accounts";
import { resetRanksIfNeeded } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/leaderboard — profils publics des vrais joueurs (200 max, triés par RP). */
export async function GET() {
  try {
    await resetRanksIfNeeded();
    return Response.json({ players: await listPlayers(200) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
