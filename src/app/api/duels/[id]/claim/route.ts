import { currentSession, jsonError, storageDown } from "@/lib/server/accounts";
import { getDuel, opponentProfiles, saveDuel, sideOf, viewDuel } from "@/lib/server/duels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/duels/:id/claim — réclame la récompense d'un duel terminé, une seule
 * fois par joueur (quel que soit l'appareil). Renvoie le résultat à appliquer.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en duel.", 401);
  const { id } = await params;
  try {
    const duel = await getDuel(id);
    const i = duel ? sideOf(duel, session.uid) : -1;
    if (!duel || i < 0) return jsonError("Duel introuvable.", 404);
    const view = viewDuel(duel, session.uid, await opponentProfiles([duel], session.uid));
    if (!view.outcome) return jsonError("Pas de récompense pour ce duel.", 409);
    if (duel.sides[i].rewarded) return jsonError("Récompense déjà reçue.", 409);
    duel.sides[i].rewarded = true;
    await saveDuel(duel);
    return Response.json({ outcome: view.outcome, duel: { ...view, rewarded: true } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
