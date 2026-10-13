import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { reportPlayer } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ranked/report { playerId } — signale un joueur (3 signalements : promotions bloquées). */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const playerId = (read.body as { playerId?: unknown } | null)?.playerId;
  if (typeof playerId !== "string" || playerId.length > 40) return jsonError("Joueur inconnu.", 400);
  try {
    return Response.json(await reportPlayer(session.uid, playerId));
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith("Redis")) return jsonError(error.message, 400);
    return storageDown(error);
  }
}
