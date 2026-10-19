import { publicLeaderboardRow } from "@/lib/game/leaderboard";
import { listPlayers, storageDown } from "@/lib/server/accounts";
import { resetRanksIfNeeded } from "@/lib/server/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/leaderboard — vrais joueurs (200 max, triés par RP), accessible sans
 * session (ligue des invités). Seuls les champs de `publicLeaderboardRow` sortent :
 * aucune photo ni bannière d'élève n'est publiée ici.
 */
export async function GET() {
  try {
    await resetRanksIfNeeded();
    return Response.json({ players: (await listPlayers(200)).map(publicLeaderboardRow) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
