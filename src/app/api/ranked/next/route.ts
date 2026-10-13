import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { getMatch, serveNext } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ranked/next { id } — question suivante de la manche (le chrono démarre à l'envoi). */
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
    const r = await serveNext(m, session.pseudo);
    return Response.json("lost" in r ? { lost: r.lost } : { next: r.served }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return storageDown(error);
  }
}
