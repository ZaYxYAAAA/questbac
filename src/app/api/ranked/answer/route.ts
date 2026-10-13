import { z } from "zod";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { answerQuestion, getMatch } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  id: z.string().max(40),
  index: z.number().int().min(0).max(50),
  answer: z.union([z.number(), z.boolean(), z.string().max(100)]),
});

/** POST /api/ranked/answer { id, index, answer } — corrigé et chronométré par le serveur. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en classé.", 401);
  const read = await readJson(req, 2_000);
  if (!read.ok) return read.response;
  const parsed = Body.safeParse(read.body);
  if (!parsed.success) return jsonError("Réponse invalide.", 400);
  try {
    const m = await getMatch(parsed.data.id);
    if (!m || m.uid !== session.uid) return jsonError("Manche introuvable.", 404);
    if (m.finishedAt) return jsonError("Manche terminée.", 409);
    if (parsed.data.index !== m.index || m.servedAt === null) return jsonError("Question inattendue.", 409);
    return Response.json(await answerQuestion(m, parsed.data.index, parsed.data.answer, session.pseudo), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
