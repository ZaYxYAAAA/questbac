import { currentSession, jsonError, storageDown } from "@/lib/server/accounts";
import { getDuel, opponentProfiles, sideOf, viewDuel } from "@/lib/server/duels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/duels/:id — le duel et ses questions (réservé aux deux joueurs). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en duel.", 401);
  const { id } = await params;
  try {
    const duel = await getDuel(id);
    if (!duel || sideOf(duel, session.uid) < 0) return jsonError("Duel introuvable.", 404);
    const view = viewDuel(duel, session.uid, await opponentProfiles([duel], session.uid));
    return Response.json({ duel: view, questions: duel.questions }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
