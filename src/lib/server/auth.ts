import "server-only";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { redisConfig } from "./store";

/**
 * Briques d'authentification sans dépendance : mots de passe hachés avec
 * scrypt (sel aléatoire) et jetons de session signés HMAC-SHA256.
 */

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function scryptAsync(password: string, salt: Buffer, opts: { N: number; r: number; p: number; keylen: number }) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, opts.keylen, { N: opts.N, r: opts.r, p: opts.p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

/** Format stocké : scrypt$N$r$p$sel$hash (base64url). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, N, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const key = await scryptAsync(password, Buffer.from(salt, "base64url"), { N: +N, r: +r, p: +p, keylen: expected.length });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// ───────────── Jetons de session ─────────────

export interface SessionPayload {
  uid: string;
  pseudo: string;
  /** Expiration (ms depuis l'époque). */
  exp: number;
}

const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function signToken(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function verifyToken(token: string | undefined, secret: string, now = Date.now()): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number" || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

// ───────────── Secret de session ─────────────

/** Ne sert qu'en développement local : jamais en production. */
export const DEV_SESSION_SECRET = "questbac-dev-secret-ne-pas-utiliser-en-production";

type Env = Record<string, string | undefined>;

export const isProduction = (env: Env) => env.NODE_ENV === "production" || !!env.VERCEL;

/**
 * SESSION_SECRET, à défaut un secret dérivé du jeton Redis. Sans l'un ni l'autre :
 * en production, un secret aléatoire fourni par `fallback` (conservé dans le dossier
 * de données en stockage fichier, en mémoire en stockage éphémère) ; en
 * développement, une constante.
 */
export function resolveSessionSecret(env: Env, fallback: () => string): { secret: string; source: "env" | "redis" | "process" | "dev" } {
  if (env.SESSION_SECRET) return { secret: env.SESSION_SECRET, source: "env" };
  const redis = redisConfig(env);
  if (redis) return { secret: createHash("sha256").update(`questbac-session:${redis.token}`).digest("hex"), source: "redis" };
  if (isProduction(env)) return { secret: fallback(), source: "process" };
  return { secret: DEV_SESSION_SECRET, source: "dev" };
}

export const randomSecret = () => randomBytes(32).toString("hex");

const SECRET_FILE = "session-secret";

/**
 * Secret aléatoire créé une seule fois dans `dir` (mode 0600) puis relu à chaque
 * démarrage : les sessions survivent aux redémarrages du serveur.
 */
export function persistedSecret(dir: string): string {
  const file = path.join(dir, SECRET_FILE);
  const read = () => {
    try {
      const value = readFileSync(file, "utf8").trim();
      return /^[0-9a-f]{64}$/.test(value) ? value : null;
    } catch {
      return null;
    }
  };
  const existing = read();
  if (existing) return existing;
  mkdirSync(dir, { recursive: true });
  const secret = randomSecret();
  const tmp = `${file}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  writeFileSync(tmp, secret, { mode: 0o600 });
  try {
    // link échoue si le fichier existe déjà : création atomique, le premier gagne.
    linkSync(tmp, file);
  } catch {
    const other = read();
    if (other) return other;
    // Fichier présent mais illisible ou corrompu : on le remplace.
    writeFileSync(file, secret, { mode: 0o600 });
  } finally {
    rmSync(tmp, { force: true });
  }
  return read() ?? secret;
}

/** Identifiant public d'un joueur (classement) : empreinte non réversible de l'id de compte. */
export const publicPlayerId = (accountId: string) => createHash("sha256").update(`questbac-public:${accountId}`).digest("base64url").slice(0, 22);

// ───────────── Pseudos ─────────────

/** Clé d'unicité : insensible à la casse et aux variantes Unicode. */
export const pseudoKey = (pseudo: string) => pseudo.trim().normalize("NFKC").toLowerCase();

export { passwordError, pseudoError } from "@/lib/account-rules";
