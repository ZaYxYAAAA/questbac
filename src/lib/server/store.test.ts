import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import { fileStore, redisConfig, redisStore } from "./store";

const dir = mkdtempSync(path.join(tmpdir(), "qb-store-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("stockage fichier", () => {
  const store = fileStore(dir);

  it("lit, écrit, supprime", async () => {
    expect(await store.get("user:lina")).toBeNull();
    await store.set("user:lina", { id: 1 });
    expect(await store.get("user:lina")).toEqual({ id: 1 });
    await store.del("user:lina");
    expect(await store.get("user:lina")).toBeNull();
  });

  it("create n'écrase jamais une clé existante", async () => {
    expect(await store.create("user:noe", { n: 1 })).toBe(true);
    expect(await store.create("user:noe", { n: 2 })).toBe(false);
    expect(await store.get("user:noe")).toEqual({ n: 1 });
  });

  it("garde tous les champs d'un hash en écritures concurrentes", async () => {
    await Promise.all(Array.from({ length: 20 }, (_, i) => store.hset("players", `p${i}`, { i })));
    expect(Object.keys(await store.hgetall("players"))).toHaveLength(20);
  });
});

describe("configuration Redis", () => {
  it("accepte les deux jeux de variables", () => {
    expect(redisConfig({ KV_REST_API_URL: "https://x.upstash.io/", KV_REST_API_TOKEN: "t" })).toEqual({ url: "https://x.upstash.io", token: "t" });
    expect(redisConfig({ UPSTASH_REDIS_REST_URL: "https://y", UPSTASH_REDIS_REST_TOKEN: "u" })).toEqual({ url: "https://y", token: "u" });
    expect(redisConfig({})).toBeNull();
  });
});

describe("stockage Redis (API REST Upstash)", () => {
  it("envoie les bonnes commandes et décode les réponses", async () => {
    const calls: unknown[] = [];
    const replies: unknown[] = ["OK", null, JSON.stringify({ a: 1 }), ["p1", JSON.stringify({ rp: 5 }), "p2", "illisible"]];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      expect(url).toBe("https://r.upstash.io");
      expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
      calls.push(JSON.parse(init.body as string));
      return new Response(JSON.stringify({ result: replies.shift() }));
    });
    const store = redisStore("https://r.upstash.io", "tok");
    expect(await store.create("user:x", { a: 1 })).toBe(true);
    expect(await store.create("user:x", { a: 1 })).toBe(false);
    expect(await store.get("user:x")).toEqual({ a: 1 });
    expect(await store.hgetall("players")).toEqual({ p1: { rp: 5 } });
    expect(calls[0]).toEqual(["SET", "user:x", '{"a":1}', "NX"]);
    expect(calls[3]).toEqual(["HGETALL", "players"]);
    vi.unstubAllGlobals();
  });
});
