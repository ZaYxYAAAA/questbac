import { isRankedSubject } from "@/lib/game/ranked";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { acknowledgeWeek } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/ranked/seen { subjects } — le joueur a vu le bilan de sa semaine. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const subjects = (read.body as { subjects?: unknown } | null)?.subjects;
  if (!Array.isArray(subjects) || !subjects.every(isRankedSubject)) return jsonError("Matières inconnues.", 400);
  try {
    for (const s of subjects) await acknowledgeWeek(session.uid, session.pseudo, s);
    return Response.json({ ok: true });
  } catch (error) {
    return storageDown(error);
  }
}
