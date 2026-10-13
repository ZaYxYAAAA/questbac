import { isRankedSubject, rankRewards } from "@/lib/game/ranked";
import { currentSession, jsonError, storageDown } from "@/lib/server/accounts";
import { activeMatch, groupFor, loadProfile, pendingLossInfo, profileViews, settleIfNeeded, weekInfo } from "@/lib/server/ranked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ranked?subject=maths — mes rangs par matière, mon groupe de la
 * semaine et le haut du classement de la matière demandée.
 */
export async function GET(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en classé.", 401);
  const asked = new URL(req.url).searchParams.get("subject") ?? "general";
  const subject = isRankedSubject(asked) ? asked : "general";
  try {
    await settleIfNeeded();
    const { profile, level } = await loadProfile(session.uid, session.pseudo);
    const [group, active, pendingLoss] = await Promise.all([groupFor(session.uid, subject), activeMatch(session.uid, session.pseudo), pendingLossInfo(profile)]);
    return Response.json(
      {
        level,
        subject,
        ranks: profileViews(profile, level),
        group: group.rows,
        top: group.top,
        friends: group.friends,
        players: group.players,
        pendingLoss,
        active: active ? { id: active.id, subject: active.subject, index: active.index, total: active.questions.length } : null,
        seasons: profile.seasons ?? {},
        ...rankRewards(profile),
        season: profile.season,
        ...weekInfo(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return storageDown(error);
  }
}
