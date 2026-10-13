import { clientKey, rateLimit } from "@/lib/ai/rate-limit";
import { MAX_SAVE_BYTES, parseSave } from "@/lib/game/save";
import { createInitialData } from "@/lib/game/state";
import { passwordError, pseudoError } from "@/lib/server/auth";
import { createAccount, jsonError, openSession, publicUser, putSave, readJson, storageDown } from "@/lib/server/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/register — crée un compte et y range la progression actuelle. */
export async function POST(req: Request) {
  const limit = rateLimit(`register:${clientKey(req)}`, 5, 10 * 60_000);
  if (!limit.ok) return jsonError(`Trop de comptes créés d'ici. Réessaie dans ${limit.retryAfter} s.`, 429, { "Retry-After": String(limit.retryAfter) });

  const read = await readJson(req, MAX_SAVE_BYTES);
  if (!read.ok) return read.response;
  const body = (read.body ?? {}) as { pseudo?: unknown; password?: unknown; save?: unknown };
  const pseudo = typeof body.pseudo === "string" ? body.pseudo.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const invalid = pseudoError(pseudo) ?? passwordError(password);
  if (invalid) return jsonError(invalid, 400);

  let save = createInitialData();
  if (body.save !== undefined && body.save !== null) {
    const parsed = parseSave(body.save);
    if (!parsed.ok) return jsonError(parsed.error, 400);
    save = parsed.data;
  }
  const now = Date.now();
  save = {
    ...save,
    profile: { avatar: "🦊", level: "premiere", createdAt: now, ...save.profile, pseudo },
    updatedAt: Math.min(Math.max(save.updatedAt, now), now + 5 * 60_000),
  };

  try {
    const account = await createAccount(pseudo, password);
    if (!account) return jsonError("Ce pseudo est déjà pris. Choisis-en un autre (ou connecte-toi s'il est à toi).", 409);
    await putSave(account, save);
    await openSession(account);
    return Response.json({ user: publicUser(account), save, updatedAt: save.updatedAt });
  } catch (error) {
    return storageDown(error);
  }
}
