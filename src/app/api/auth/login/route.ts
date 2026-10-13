import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { createInitialData } from "@/lib/game/state";
import { pseudoKey, verifyPassword } from "@/lib/server/auth";
import { getAccount, getSave, jsonError, openSession, publicUser, readJson, storageDown } from "@/lib/server/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hash factice : un pseudo inconnu prend autant de temps qu'un mauvais mot de passe.
const DUMMY = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

/** POST /api/auth/login — ouvre une session et renvoie la sauvegarde du joueur. */
export async function POST(req: Request) {
  const read = await readJson(req, 10_000);
  if (!read.ok) return read.response;
  const body = (read.body ?? {}) as { pseudo?: unknown; password?: unknown };
  const pseudo = typeof body.pseudo === "string" ? body.pseudo.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!pseudo || !password) return jsonError("Indique ton pseudo et ton mot de passe.", 400);

  for (const key of [`login:${clientKey(req)}`, `login:pseudo:${pseudoKey(pseudo)}`]) {
    const limit = rateLimit(key, 10, 5 * 60_000);
    if (!limit.ok) return jsonError(`Trop de tentatives. Réessaie dans ${limit.retryAfter} s.`, 429, { "Retry-After": String(limit.retryAfter) });
  }

  try {
    const account = await getAccount(pseudo);
    const ok = await verifyPassword(password, account?.passwordHash ?? DUMMY);
    if (!account || !ok) return jsonError("Pseudo ou mot de passe incorrect.", 401);
    const stored = await getSave(account.id);
    const save = stored?.save ?? { ...createInitialData(), profile: { pseudo: account.pseudo, avatar: "🦊", level: "premiere" as const, createdAt: account.createdAt } };
    await openSession(account);
    return Response.json({ user: publicUser(account), save, updatedAt: stored?.updatedAt ?? 0 });
  } catch (error) {
    return storageDown(error);
  }
}
