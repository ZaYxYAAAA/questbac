import { SUBJECTS } from "@/lib/content/curriculum";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { MATCH_PLAYERS, isMatchSize } from "@/lib/game/match";
import { cancelQueue, joinQueue, pollQueue } from "@/lib/server/match";
import type { SubjectId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

/** POST /api/match/queue { subject, size? } — chercher une partie classée (3, 5 ou 7 joueurs) dans une matière. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en classé.", 401);
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const body = read.body as { subject?: unknown; size?: unknown } | null;
  const subject = body?.subject;
  if (typeof subject !== "string" || !SUBJECTS.some((s) => s.id === subject)) return jsonError("Matière inconnue.", 400);
  const size = body?.size ?? MATCH_PLAYERS;
  if (!isMatchSize(size)) return jsonError("Format de partie inconnu.", 400);
  try {
    return Response.json(await joinQueue(session.uid, session.pseudo, subject as SubjectId, size), { headers: NO_STORE });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Tu as joué")) return jsonError(error.message, 409);
    return storageDown(error);
  }
}

/** GET /api/match/queue?ticket=… — partie trouvée ? (au bout de 3 s, complétée par des bots). */
export async function GET(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const ticket = new URL(req.url).searchParams.get("ticket");
  if (!ticket) return jsonError("Recherche inconnue.", 400);
  try {
    return Response.json(await pollQueue(session.uid, ticket), { headers: NO_STORE });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Recherche")) return jsonError(error.message, 404);
    return storageDown(error);
  }
}

/** DELETE /api/match/queue?ticket=… — annuler la recherche. */
export async function DELETE(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const ticket = new URL(req.url).searchParams.get("ticket");
  if (!ticket) return jsonError("Recherche inconnue.", 400);
  try {
    await cancelQueue(session.uid, ticket);
    return Response.json({ ok: true });
  } catch (error) {
    return storageDown(error);
  }
}
