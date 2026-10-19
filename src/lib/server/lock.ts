import "server-only";
import { getStore } from "./store";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Au-delà, un verrou est considéré comme abandonné (requête interrompue). */
const STALE_MS = 5000;

/**
 * Petit verrou (Redis SET NX) : les lectures-modifications-écritures d'un même
 * document passent l'une après l'autre, même sur plusieurs instances du serveur.
 */
export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const store = getStore();
  for (let i = 0; i < 40; i++) {
    if (await store.create(key, Date.now())) {
      try {
        return await fn();
      } finally {
        await store.del(key);
      }
    }
    const at = await store.get<number>(key);
    if (at !== null && Date.now() - at > STALE_MS) await store.del(key); // verrou abandonné
    await sleep(80);
  }
  throw new Error("Serveur occupé, réessaie.");
}

/** Plusieurs verrous à la fois, toujours pris dans le même ordre (pas d'interblocage). */
export async function withLocks<T>(keys: string[], fn: () => Promise<T>): Promise<T> {
  const sorted = [...new Set(keys)].sort();
  const run = (i: number): Promise<T> => (i === sorted.length ? fn() : withLock(sorted[i], () => run(i + 1)));
  return run(0);
}
