import { z } from "zod";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { answer, getMatch, viewFor } from "@/lib/server/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ index: z.number().int().min(0).max(20), answer: z.union([z.number(), z.boolean(), z.string().max(100)]) });

/** POST /api/match/:id/answer { index, answer } — corrigée et chronométrée par le serveur. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const { id } = await params;
  const read = await readJson(req, 2_000);
  if (!read.ok) return read.response;
  const parsed = Body.safeParse(read.body);
  if (!parsed.success) return jsonError("Réponse invalide.", 400);
  try {
    const m = await getMatch(id);
    if (!m || !m.players.some((p) => p.id === session.uid)) return jsonError("Partie introuvable.", 404);
    const r = await answer(m, session.uid, parsed.data.index, parsed.data.answer);
    return Response.json({ ...r, view: viewFor(m, session.uid) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
