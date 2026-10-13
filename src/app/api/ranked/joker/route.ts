import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { resolvePendingLoss } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ranked/joker { id, use } — manche perdue en quittant l'appli : joker du jour, ou 0 point accepté. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const body = read.body as { id?: unknown; use?: unknown } | null;
  if (typeof body?.id !== "string" || typeof body.use !== "boolean") return jsonError("Requête invalide.", 400);
  try {
    return Response.json(await resolvePendingLoss(session.uid, session.pseudo, body.id, body.use));
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith("Redis")) return jsonError(error.message, 409);
    return storageDown(error);
  }
}
