import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { type PublicProfile, publicProfileFrom } from "@/lib/game/save";
import type { GameData } from "@/lib/game/state";
import { type SessionPayload, hashPassword, persistedSecret, pseudoKey, publicPlayerId, randomSecret, resolveSessionSecret, signToken, verifyToken } from "./auth";
import { getStore } from "./store";

/**
 * Comptes joueurs : identifiants, sauvegardes et profils publics.
 * Clés : `user:<pseudo en minuscules>`, `save:<id>`, hash `players` (id → profil public).
 * L'id de compte ne quitte jamais le serveur : le client ne voit que `publicPlayerId(id)`.
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
/**
 * Production sans SESSION_SECRET ni Redis : secret aléatoire conservé dans le dossier
 * de données (stockage fichier), ou seulement en mémoire (stockage éphémère).
 */
let processSecret: string | null = null;

function fallbackSecret(): string {
  if (processSecret) return processSecret;
  const store = getStore();
  processSecret = store.kind === "file" && store.dir ? persistedSecret(store.dir) : randomSecret();
  return processSecret;
}

export function sessionSecret(): string {
  const { secret, source } = resolveSessionSecret(process.env, fallbackSecret);
  if (!warned && (source === "process" || source === "dev")) {
    warned = true;
    const kind = getStore().kind;
    console.warn(
      source === "dev"
        ? "[auth] SESSION_SECRET absent : secret de développement utilisé (à définir en production)."
        : kind === "file"
          ? "[auth] SESSION_SECRET absent : secret aléatoire conservé dans le dossier de données."
          : "[auth] SESSION_SECRET absent : secret aléatoire propre à ce processus (les sessions tombent au redémarrage).",
    );
  }
  return secret;
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
  await store.hset("players", account.id, publicProfileFrom({ publicId: publicPlayerId(account.id), pseudo: account.pseudo }, save));
}

export async function listPlayers(limit = 200): Promise<PublicProfile[]> {
  // L'identifiant publié est toujours recalculé (les anciens profils stockaient l'id brut).
  const all = Object.entries(await getStore().hgetall<PublicProfile>("players")).map(([id, p]) => ({ ...p, id: publicPlayerId(id) }));
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

/** Ce que le client connaît du compte : l'identifiant public, jamais l'id interne. */
export const publicUser = (a: { id: string; pseudo: string }) => ({ id: publicPlayerId(a.id), pseudo: a.pseudo });

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
