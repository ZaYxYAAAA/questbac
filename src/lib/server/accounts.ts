import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { type PublicProfile, publicProfileFrom } from "@/lib/game/save";
import type { GameData } from "@/lib/game/state";
import { type SessionPayload, hashPassword, pseudoKey, signToken, verifyToken } from "./auth";
import { getStore, redisConfig } from "./store";

/**
 * Comptes joueurs : identifiants, sauvegardes et profils publics.
 * Clés : `user:<pseudo en minuscules>`, `save:<id>`, hash `players` (id → profil public).
 */

export const SESSION_COOKIE = "qb_session";
const SESSION_DAYS = 180;

export interface Account {
  id: string;
  pseudo: string;
  passwordHash: string;
  createdAt: number;
}

export interface StoredSave {
  save: GameData;
  updatedAt: number;
}

let warned = false;

/** SESSION_SECRET, à défaut un secret dérivé du jeton Redis, sinon une constante de développement. */
export function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const redis = redisConfig();
  if (redis) return createHash("sha256").update(`questbac-session:${redis.token}`).digest("hex");
  if (!warned) {
    warned = true;
    console.warn("[auth] SESSION_SECRET absent : secret de développement utilisé (à définir en production).");
  }
  return "questbac-dev-secret-ne-pas-utiliser-en-production";
}

export const getAccount = (pseudo: string) => getStore().get<Account>(`user:${pseudoKey(pseudo)}`);

/** Crée le compte ; renvoie null si le pseudo est déjà pris. */
export async function createAccount(pseudo: string, password: string): Promise<Account | null> {
  const account: Account = { id: randomUUID(), pseudo: pseudo.trim(), passwordHash: await hashPassword(password), createdAt: Date.now() };
  return (await getStore().create(`user:${pseudoKey(pseudo)}`, account)) ? account : null;
}

export const getSave = (userId: string) => getStore().get<StoredSave>(`save:${userId}`);

export async function putSave(account: { id: string; pseudo: string }, save: GameData) {
  const store = getStore();
  await store.set(`save:${account.id}`, { save, updatedAt: save.updatedAt } satisfies StoredSave);
  await store.hset("players", account.id, publicProfileFrom(account, save));
}

export async function listPlayers(limit = 200): Promise<PublicProfile[]> {
  const all = Object.values(await getStore().hgetall<PublicProfile>("players"));
  return all.sort((a, b) => b.rp - a.rp || b.xp - a.xp).slice(0, limit);
}

// ───────────── Cookie de session ─────────────

export async function openSession(account: { id: string; pseudo: string }) {
  const payload: SessionPayload = { uid: account.id, pseudo: account.pseudo, exp: Date.now() + SESSION_DAYS * 86_400_000 };
  (await cookies()).set(SESSION_COOKIE, signToken(payload, sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function closeSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentSession(): Promise<SessionPayload | null> {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value, sessionSecret());
}

export const publicUser = (a: { id: string; pseudo: string }) => ({ id: a.id, pseudo: a.pseudo });

export const jsonError = (error: string, status: number, headers?: HeadersInit) => Response.json({ error }, { status, headers });

/** Lit un corps JSON en refusant ce qui dépasse `maxBytes`. */
export async function readJson(req: Request, maxBytes: number): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return { ok: false, response: jsonError("Sauvegarde trop volumineuse.", 413) };
  const text = await req.text().catch(() => "");
  if (Buffer.byteLength(text) > maxBytes) return { ok: false, response: jsonError("Sauvegarde trop volumineuse.", 413) };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: jsonError("Requête invalide.", 400) };
  }
}

/** Réponse 503 commune quand le stockage ne répond pas. */
export function storageDown(error: unknown) {
  console.error("[sauvegarde] stockage indisponible", error);
  return jsonError("Le serveur de sauvegarde ne répond pas. Réessaie dans un instant.", 503);
}
