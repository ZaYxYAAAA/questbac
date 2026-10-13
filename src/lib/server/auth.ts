import "server-only";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

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

// ───────────── Pseudos ─────────────

/** Clé d'unicité : insensible à la casse et aux variantes Unicode. */
export const pseudoKey = (pseudo: string) => pseudo.trim().normalize("NFKC").toLowerCase();

export { passwordError, pseudoError } from "@/lib/account-rules";
