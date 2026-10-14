import { currentSession, jsonError, storageDown } from "@/lib/server/accounts";
import { away, getMatch } from "@/lib/server/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/match/:id/away — l'appli est passée en arrière-plan (sendBeacon) : la question en cours est perdue. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const { id } = await params;
  try {
    const m = await getMatch(id);
    if (!m || !m.players.some((p) => p.id === session.uid)) return jsonError("Partie introuvable.", 404);
    await away(m, session.uid);
    return Response.json({ ok: true });
  } catch (error) {
    return storageDown(error);
  }
}
