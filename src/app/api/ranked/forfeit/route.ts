import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { forfeitMatch, getMatch } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ranked/forfeit { id } — abandon : la manche compte, questions restantes fausses. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en classé.", 401);
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const id = (read.body as { id?: unknown } | null)?.id;
  if (typeof id !== "string") return jsonError("Manche inconnue.", 400);
  try {
    const m = await getMatch(id);
    if (!m || m.uid !== session.uid) return jsonError("Manche introuvable.", 404);
    if (m.finishedAt) return jsonError("Manche terminée.", 409);
    return Response.json({ result: await forfeitMatch(m, session.pseudo) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
