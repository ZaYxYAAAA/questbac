import { after } from "next/server";
import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit";
import { DUEL_THEMES } from "@/lib/game/duel";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { publicPlayerId } from "@/lib/server/auth";
import { createDuel, listDuels, opponentProfiles, viewDuel } from "@/lib/server/duels";
import { friendIds } from "@/lib/server/friends";
import { sendPush } from "@/lib/server/push";
import { getStore } from "@/lib/server/store";
import type { PublicProfile } from "@/lib/game/save";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** GET /api/duels — mes duels (du plus récent au plus ancien). */
export async function GET() {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en duel.", 401);
  try {
    const duels = await listDuels(session.uid);
    const profiles = await opponentProfiles(duels, session.uid);
    return Response.json({ duels: duels.map((d) => viewDuel(d, session.uid, profiles)) }, { headers: NO_STORE });
  } catch (error) {
    return storageDown(error);
  }
}

const CreateBody = z.object({ friendId: z.string().min(1).max(64), chapterId: z.string().min(1).max(80) });
const PLAYABLE = new Set(DUEL_THEMES.map((t) => t.id));

/** POST /api/duels { friendId, chapterId } — défie un ami sur un thème (chapterId = id du thème). */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en duel.", 401);
  const limit = rateLimit(`duel:${session.uid}:${clientKey(req)}`, 15, 10 * 60_000);
  if (!limit.ok) return jsonError(`Trop de duels lancés. Réessaie dans ${limit.retryAfter} s.`, 429, { "Retry-After": String(limit.retryAfter) });

  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const parsed = CreateBody.safeParse(read.body);
  if (!parsed.success) return jsonError("Requête invalide.", 400);
  if (!PLAYABLE.has(parsed.data.chapterId)) return jsonError("Ce thème n'est pas disponible en duel.", 400);

  try {
    const friend = (await friendIds(session.uid)).find((id) => publicPlayerId(id) === parsed.data.friendId);
    if (!friend) return jsonError("Tu ne peux défier que tes amis.", 403);
    const [profile] = await getStore().hmget<PublicProfile>("players", [friend]);
    const duel = await createDuel({ uid: session.uid, pseudo: session.pseudo }, { uid: friend, pseudo: profile?.pseudo ?? "Ami" }, parsed.data.chapterId);
    after(() => sendPush(friend, { title: "⚔️ Nouveau défi !", body: `${session.pseudo} te défie : ${duel.chapterTitle}. 10 questions éclair, à toi de jouer !`, url: `/duels/${duel.id}`, tag: `duel-${duel.id}` }));
    return Response.json({ id: duel.id }, { status: 201, headers: NO_STORE });
  } catch (error) {
    return storageDown(error);
  }
}
