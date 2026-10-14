import { currentSession, jsonError, storageDown } from "@/lib/server/accounts";
import { advance, getMatch, viewFor } from "@/lib/server/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/match/:id — état de la partie (interrogé environ chaque seconde par les joueurs). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const { id } = await params;
  try {
    const m = await getMatch(id);
    if (!m || !m.players.some((p) => p.id === session.uid)) return jsonError("Partie introuvable.", 404);
    await advance(m);
    return Response.json(viewFor(m, session.uid), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
