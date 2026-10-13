import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { getMatch, presenceEvent } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENTS = ["hidden", "visible", "beat"] as const;

/**
 * POST /api/ranked/event { id, type } — présence pendant une manche : l'appli
 * passe en arrière-plan (« hidden », envoyé par sendBeacon), revient, ou
 * signale qu'elle est toujours ouverte (« beat », toutes les 5 s).
 */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en classé.", 401);
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const body = read.body as { id?: unknown; type?: unknown; away?: unknown } | null;
  const type = EVENTS.find((e) => e === body?.type);
  if (typeof body?.id !== "string" || !type) return jsonError("Signal invalide.", 400);
  try {
    const m = await getMatch(body.id);
    if (!m || m.uid !== session.uid) return jsonError("Manche introuvable.", 404);
    const away = typeof body.away === "number" && Number.isFinite(body.away) ? body.away : 0;
    return Response.json(await presenceEvent(m, type, session.pseudo, new Date(), away), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
