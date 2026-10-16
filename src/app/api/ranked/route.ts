import { currentSession, getSave, jsonError, storageDown } from "@/lib/server/accounts";
import { dailySubject, getMatch, getRank, rankBoard, resetRanksIfNeeded, subjectLocks, xpBoard } from "@/lib/server/match";
import { phaseAt } from "@/lib/game/match";
import { specialOfDay, specialOfTomorrow } from "@/lib/game/specials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/ranked — mon rang, ma partie en cours, le classement général des rangs et celui de l'XP. */
export async function GET() {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en classé.", 401);
  try {
    await resetRanksIfNeeded();
    const me = await getRank(session.uid, session.pseudo);
    const active = me.active ? await getMatch(me.active) : null;
    const { seen: _seen, ...rank } = me;
    const level = (await getSave(session.uid))?.save.profile?.level ?? "seconde";
    return Response.json(
      { rank: { ...rank, active: active && phaseAt(active, Date.now()).phase !== "done" ? active.id : null }, board: await rankBoard(session.uid), xp: await xpBoard(session.uid), locks: subjectLocks(me, level), special: specialOfDay(), specialNext: specialOfTomorrow(), daily: dailySubject(level) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return storageDown(error);
  }
}
