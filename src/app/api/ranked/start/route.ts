import { isRankedSubject } from "@/lib/game/ranked";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { startMatch } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ranked/start { subject } — lance une manche ; renvoie la première question (chrono lancé). */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en classé.", 401);
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const subject = (read.body as { subject?: unknown } | null)?.subject;
  if (!isRankedSubject(subject)) return jsonError("Matière inconnue.", 400);
  try {
    return Response.json({ match: await startMatch(session.uid, session.pseudo, subject) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Matière")) return jsonError(error.message, 400);
    return storageDown(error);
  }
}
