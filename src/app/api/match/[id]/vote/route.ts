import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { advance, getMatch, viewFor, vote } from "@/lib/server/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/match/:id/vote { chapter } — vote pour l'un des deux chapitres proposés. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const { id } = await params;
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const chapter = (read.body as { chapter?: unknown } | null)?.chapter;
  if (typeof chapter !== "string") return jsonError("Chapitre inconnu.", 400);
  try {
    const m = await getMatch(id);
    if (!m || !m.players.some((p) => p.id === session.uid)) return jsonError("Partie introuvable.", 404);
    await vote(m, session.uid, chapter);
    await advance(m);
    return Response.json(viewFor(m, session.uid), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
