import { currentSession, jsonError, storageDown } from "@/lib/server/accounts";
import { playerCard } from "@/lib/server/players";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/players/:id — fiche publique d'un joueur : profil, bannière, statistiques, rang. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour voir les profils.", 401);
  const { id } = await params;
  if (!/^[\w-]{6,64}$/.test(id)) return jsonError("Joueur introuvable.", 404);
  try {
    const card = await playerCard(session.uid, id);
    if (!card) return jsonError("Joueur introuvable.", 404);
    return Response.json(card, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
