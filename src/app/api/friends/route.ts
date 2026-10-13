import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit";
import { normalizeFriendCode } from "@/lib/friend-code";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { accountIdForCode, addFriendship, friendCodeOf, friendProfiles, registerFriendCode, removeFriendship } from "@/lib/server/friends";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const needLogin = () => jsonError("Connecte-toi à ton compte pour avoir des amis.", 401);

/** GET /api/friends — mon code d'ami et les profils publics de mes amis. */
export async function GET() {
  const session = await currentSession();
  if (!session) return needLogin();
  try {
    await registerFriendCode(session.uid);
    return Response.json({ code: friendCodeOf(session.uid), friends: await friendProfiles(session.uid) }, { headers: NO_STORE });
  } catch (error) {
    return storageDown(error);
  }
}

const AddBody = z.object({ code: z.string().max(20) });

/** POST /api/friends { code } — devient ami avec le titulaire du code. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return needLogin();
  const limit = rateLimit(`friends:${session.uid}:${clientKey(req)}`, 20, 10 * 60_000);
  if (!limit.ok) return jsonError(`Trop d'essais. Réessaie dans ${limit.retryAfter} s.`, 429, { "Retry-After": String(limit.retryAfter) });

  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const parsed = AddBody.safeParse(read.body);
  const code = parsed.success ? normalizeFriendCode(parsed.data.code) : null;
  if (!code) return jsonError("Code d'ami invalide (format QB-XXXXXX).", 400);

  try {
    const other = await accountIdForCode(code);
    if (!other) return jsonError("Aucun joueur n'a ce code.", 404);
    const result = await addFriendship(session.uid, other);
    if (result === "self") return jsonError("C'est ton propre code !", 400);
    if (result === "full") return jsonError("Limite de 100 amis atteinte.", 409);
    const friends = await friendProfiles(session.uid);
    return Response.json({ result, friends }, { headers: NO_STORE });
  } catch (error) {
    return storageDown(error);
  }
}

const RemoveBody = z.object({ id: z.string().min(1).max(64) });

/** DELETE /api/friends { id } — retire un ami (identifiant public). */
export async function DELETE(req: Request) {
  const session = await currentSession();
  if (!session) return needLogin();
  const read = await readJson(req, 1_000);
  if (!read.ok) return read.response;
  const parsed = RemoveBody.safeParse(read.body);
  if (!parsed.success) return jsonError("Requête invalide.", 400);
  try {
    if (!(await removeFriendship(session.uid, parsed.data.id))) return jsonError("Ce joueur n'est pas dans tes amis.", 404);
    return Response.json({ friends: await friendProfiles(session.uid) }, { headers: NO_STORE });
  } catch (error) {
    return storageDown(error);
  }
}
