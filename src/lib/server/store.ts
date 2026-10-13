import "server-only";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Petit stockage clé / valeur JSON.
 * - « redis » : Upstash Redis via son API REST (variables créées par l'intégration
 *   « Upstash for Redis » de l'onglet Storage de Vercel) — aucune dépendance.
 * - « file » : fichiers JSON dans `.data/` (développement local).
 * - « ephemeral » : même chose dans /tmp sur Vercel — effacé à chaque redémarrage !
 */
export type StorageKind = "redis" | "file" | "ephemeral";

export interface KvStore {
  kind: StorageKind;
  /** Dossier des fichiers (stockages « file » et « ephemeral »). */
  dir?: string;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  /** Écrit seulement si la clé n'existe pas encore ; renvoie false sinon. */
  create(key: string, value: unknown): Promise<boolean>;
  del(key: string): Promise<void>;
  hset(hash: string, field: string, value: unknown): Promise<void>;
  hgetall<T>(hash: string): Promise<Record<string, T>>;
  /** Plusieurs champs d'un hash (null pour un champ absent), dans l'ordre demandé. */
  hmget<T>(hash: string, fields: string[]): Promise<(T | null)[]>;
  /** Plusieurs clés d'un coup (null pour une clé absente), dans l'ordre demandé. */
  mget<T>(keys: string[]): Promise<(T | null)[]>;
}

export function redisConfig(env: Record<string, string | undefined> = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

const parse = <T>(raw: unknown): T | null => {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export function redisStore(url: string, token: string): KvStore {
  async function cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { result?: T; error?: string } | null;
    if (!res.ok || !json || json.error) throw new Error(`Redis : ${json?.error ?? res.status}`);
    return json.result as T;
  }
  return {
    kind: "redis",
    get: async (key) => parse(await cmd("GET", key)),
    set: async (key, value) => void (await cmd("SET", key, JSON.stringify(value))),
    create: async (key, value) => (await cmd("SET", key, JSON.stringify(value), "NX")) === "OK",
    del: async (key) => void (await cmd("DEL", key)),
    hset: async (hash, field, value) => void (await cmd("HSET", hash, field, JSON.stringify(value))),
    hgetall: async <T>(hash: string) => {
      const flat = (await cmd<string[] | null>("HGETALL", hash)) ?? [];
      const out: Record<string, T> = {};
      for (let i = 0; i + 1 < flat.length; i += 2) {
        const v = parse<T>(flat[i + 1]);
        if (v !== null) out[flat[i]] = v;
      }
      return out;
    },
    hmget: async <T>(hash: string, fields: string[]) => {
      if (fields.length === 0) return [];
      const raw = (await cmd<unknown[] | null>("HMGET", hash, ...fields)) ?? [];
      return fields.map((_, i) => parse<T>(raw[i]));
    },
    mget: async <T>(keys: string[]) => {
      if (keys.length === 0) return [];
      const raw = (await cmd<unknown[] | null>("MGET", ...keys)) ?? [];
      return keys.map((_, i) => parse<T>(raw[i]));
    },
  };
}

export function fileStore(dir: string, kind: StorageKind = "file"): KvStore {
  const fileOf = (key: string) => path.join(dir, `${encodeURIComponent(key)}.json`);
  // Les écritures passent l'une après l'autre (évite les pertes sur les hashes).
  let queue: Promise<unknown> = Promise.resolve();
  const serial = <T>(task: () => Promise<T>): Promise<T> => {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  };
  async function read<T>(key: string): Promise<T | null> {
    try {
      return parse<T>(await readFile(fileOf(key), "utf8"));
    } catch {
      return null;
    }
  }
  async function write(key: string, value: unknown) {
    await mkdir(dir, { recursive: true });
    const tmp = `${fileOf(key)}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(value));
    await rename(tmp, fileOf(key));
  }
  return {
    kind,
    dir,
    get: read,
    set: (key, value) => serial(() => write(key, value)),
    create: (key, value) =>
      serial(async () => {
        if ((await read(key)) !== null) return false;
        await write(key, value);
        return true;
      }),
    del: (key) => serial(() => rm(fileOf(key), { force: true })),
    hset: (hash, field, value) =>
      serial(async () => {
        const all = (await read<Record<string, unknown>>(`hash:${hash}`)) ?? {};
        all[field] = value;
        await write(`hash:${hash}`, all);
      }),
    hgetall: async <T>(hash: string) => (await read<Record<string, T>>(`hash:${hash}`)) ?? {},
    hmget: async <T>(hash: string, fields: string[]) => {
      const all = (await read<Record<string, T>>(`hash:${hash}`)) ?? {};
      return fields.map((f) => (Object.hasOwn(all, f) ? all[f] : null));
    },
    mget: <T>(keys: string[]) => Promise.all(keys.map((k) => read<T>(k))),
  };
}

let instance: KvStore | null = null;

export function getStore(): KvStore {
  if (instance) return instance;
  const redis = redisConfig();
  if (redis) instance = redisStore(redis.url, redis.token);
  else if (process.env.QB_DATA_DIR) instance = fileStore(process.env.QB_DATA_DIR);
  else if (process.env.VERCEL) instance = fileStore("/tmp/questbac-data", "ephemeral");
  else instance = fileStore(path.join(process.cwd(), ".data"));
  return instance;
}

export function storageKind(): StorageKind {
  return getStore().kind;
}
