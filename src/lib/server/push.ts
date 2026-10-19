import "server-only";
import { createECDH, createHmac } from "node:crypto";
import webpush, { type PushSubscription } from "web-push";
import { sessionSecret } from "./accounts";
import { withLock } from "./lock";
import { getStore } from "./store";

/**
 * Notifications push (Web Push). Les clés VAPID viennent de VAPID_PUBLIC_KEY /
 * VAPID_PRIVATE_KEY si elles sont définies, sinon elles sont dérivées du secret
 * de session : rien à configurer, et elles restent stables d'un déploiement à l'autre.
 *
 * Données : hash `pushsubs` (id de compte → abonnements de ses appareils).
 */

const SUBS = "pushsubs";
const MAX_DEVICES = 5;

export type StoredSubscription = PushSubscription;

export interface PushMessage {
  title: string;
  body: string;
  /** Page ouverte au clic sur la notification. */
  url: string;
  /** Une notification de même tag remplace la précédente. */
  tag?: string;
}

const b64url = (b: Buffer) => b.toString("base64url");

let cached: { publicKey: string; privateKey: string } | null = null;

export function vapidKeys() {
  if (cached) return cached;
  const envPublic = process.env.VAPID_PUBLIC_KEY, envPrivate = process.env.VAPID_PRIVATE_KEY;
  if (envPublic && envPrivate) return (cached = { publicKey: envPublic, privateKey: envPrivate });
  const priv = createHmac("sha256", sessionSecret()).update("questbac-vapid-v1").digest();
  const ecdh = createECDH("prime256v1");
  ecdh.setPrivateKey(priv);
  return (cached = { publicKey: b64url(ecdh.getPublicKey()), privateKey: b64url(priv) });
}

/** Abonnement valide reçu du navigateur ? */
export function isSubscription(v: unknown): v is StoredSubscription {
  if (typeof v !== "object" || v === null) return false;
  const s = v as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  return (
    typeof s.endpoint === "string" && s.endpoint.startsWith("https://") && s.endpoint.length < 1000 &&
    typeof s.keys?.p256dh === "string" && s.keys.p256dh.length < 200 && typeof s.keys?.auth === "string" && s.keys.auth.length < 100
  );
}

async function subsOf(uid: string): Promise<StoredSubscription[]> {
  const [subs] = await getStore().hmget<StoredSubscription[]>(SUBS, [uid]);
  return Array.isArray(subs) ? subs : [];
}

/** Les appareils d'un joueur changent sous verrou : deux appareils abonnés en même temps restent tous les deux. */
const subsLock = (uid: string) => `${SUBS}:lock:${uid}`;

export async function addSubscription(uid: string, sub: StoredSubscription) {
  await withLock(subsLock(uid), async () => {
    const subs = (await subsOf(uid)).filter((s) => s.endpoint !== sub.endpoint);
    await getStore().hset(SUBS, uid, [{ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, ...subs].slice(0, MAX_DEVICES));
  });
}

export async function removeSubscription(uid: string, endpoint: string) {
  await withLock(subsLock(uid), async () => {
    const subs = await subsOf(uid);
    const kept = subs.filter((s) => s.endpoint !== endpoint);
    if (kept.length !== subs.length) await getStore().hset(SUBS, uid, kept);
  });
}

export async function hasSubscription(uid: string, endpoint?: string) {
  const subs = await subsOf(uid);
  return endpoint ? subs.some((s) => s.endpoint === endpoint) : subs.length > 0;
}

/** Tous les comptes abonnés (pour les rappels quotidiens). */
export async function subscribedAccounts(): Promise<string[]> {
  const all = await getStore().hgetall<StoredSubscription[]>(SUBS);
  return Object.entries(all).filter(([, subs]) => Array.isArray(subs) && subs.length > 0).map(([uid]) => uid);
}

/**
 * Envoie une notification à tous les appareils d'un joueur. Ne lève jamais
 * d'erreur ; les abonnements expirés (404 / 410) sont retirés.
 */
export async function sendPush(uid: string, message: PushMessage): Promise<number> {
  try {
    const subs = await subsOf(uid);
    if (subs.length === 0) return 0;
    const { publicKey, privateKey } = vapidKeys();
    const options = {
      vapidDetails: { subject: process.env.VAPID_SUBJECT ?? "https://questbac.vercel.app", publicKey, privateKey },
      TTL: 12 * 3600,
      urgency: "normal" as const,
    };
    let sent = 0;
    const dead: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(s, JSON.stringify(message), options);
          sent++;
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410 || status === 401 || status === 403) dead.push(s.endpoint);
        }
      }),
    );
    for (const endpoint of dead) await removeSubscription(uid, endpoint);
    return sent;
  } catch {
    return 0;
  }
}
