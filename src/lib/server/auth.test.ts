import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEV_SESSION_SECRET,
  hashPassword,
  persistedSecret,
  passwordError,
  pseudoError,
  pseudoKey,
  publicPlayerId,
  randomSecret,
  resolveSessionSecret,
  signToken,
  verifyPassword,
  verifyToken,
} from "./auth";

describe("mots de passe", () => {
  it("hache avec un sel et vérifie", async () => {
    const a = await hashPassword("secret123");
    const b = await hashPassword("secret123");
    expect(a).toMatch(/^scrypt\$/);
    expect(a).not.toBe(b);
    expect(await verifyPassword("secret123", a)).toBe(true);
    expect(await verifyPassword("secret124", a)).toBe(false);
    expect(await verifyPassword("secret123", "n'importe quoi")).toBe(false);
  });
});

describe("jetons de session", () => {
  const secret = "s3cr3t";
  const payload = { uid: "u1", pseudo: "Lina", exp: Date.now() + 60_000 };

  it("accepte un jeton valide", () => {
    expect(verifyToken(signToken(payload, secret), secret)).toEqual(payload);
  });

  it("refuse un jeton expiré", () => {
    const token = signToken({ ...payload, exp: 1000 }, secret);
    expect(verifyToken(token, secret)).toBeNull();
  });

  it("refuse un jeton falsifié ou signé avec un autre secret", () => {
    const token = signToken(payload, secret);
    const [, sig] = token.split(".");
    const forged = `${Buffer.from(JSON.stringify({ ...payload, uid: "admin" })).toString("base64url")}.${sig}`;
    expect(verifyToken(forged, secret)).toBeNull();
    expect(verifyToken(token, "autre")).toBeNull();
    expect(verifyToken("abc", secret)).toBeNull();
    expect(verifyToken(undefined, secret)).toBeNull();
  });
});

describe("pseudos", () => {
  it("valide longueur et caractères", () => {
    expect(pseudoError("Lina_Maths")).toBeNull();
    expect(pseudoError("Zoé.2009")).toBeNull();
    expect(pseudoError("a")).not.toBeNull();
    expect(pseudoError("x".repeat(21))).not.toBeNull();
    expect(pseudoError("pas d'espace")).not.toBeNull();
    expect(passwordError("12345")).not.toBeNull();
    expect(passwordError("123456")).toBeNull();
  });

  it("est unique sans tenir compte de la casse", () => {
    expect(pseudoKey(" Lina_MATHS ")).toBe(pseudoKey("lina_maths"));
  });
});

describe("secret de session", () => {
  const fallback = () => "aleatoire-du-processus";

  it("n'utilise jamais la constante de développement en production", () => {
    for (const env of [{ NODE_ENV: "production" }, { VERCEL: "1" }, { NODE_ENV: "production", QB_DATA_DIR: "/data" }]) {
      const { secret, source } = resolveSessionSecret(env, fallback);
      expect(secret).not.toBe(DEV_SESSION_SECRET);
      expect(source).toBe("process");
    }
  });

  it("privilégie SESSION_SECRET puis le jeton Redis", () => {
    expect(resolveSessionSecret({ NODE_ENV: "production", SESSION_SECRET: "x" }, fallback).secret).toBe("x");
    const redis = resolveSessionSecret({ NODE_ENV: "production", KV_REST_API_URL: "https://r", KV_REST_API_TOKEN: "t" }, fallback);
    expect(redis.source).toBe("redis");
    expect(redis.secret).not.toBe(DEV_SESSION_SECRET);
  });

  it("garde la constante pour le développement local uniquement", () => {
    expect(resolveSessionSecret({ NODE_ENV: "development" }, fallback).secret).toBe(DEV_SESSION_SECRET);
  });

  it("conserve le secret aléatoire dans le dossier de données d'un démarrage à l'autre", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "qb-secret-"));
    try {
      const env = { NODE_ENV: "production" };
      const first = resolveSessionSecret(env, () => persistedSecret(dir)).secret;
      const second = resolveSessionSecret(env, () => persistedSecret(dir)).secret;
      expect(first).toBe(second);
      expect(first).not.toBe(DEV_SESSION_SECRET);
      expect(first).toMatch(/^[0-9a-f]{64}$/);
      if (process.platform !== "win32") expect(statSync(path.join(dir, "session-secret")).mode & 0o777).toBe(0o600);
      // Un autre dossier donne un autre secret.
      const other = mkdtempSync(path.join(tmpdir(), "qb-secret-"));
      expect(persistedSecret(other)).not.toBe(first);
      rmSync(other, { recursive: true, force: true });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("remplace un fichier de secret corrompu", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "qb-secret-"));
    try {
      writeFileSync(path.join(dir, "session-secret"), "abc");
      const secret = persistedSecret(dir);
      expect(secret).toMatch(/^[0-9a-f]{64}$/);
      expect(persistedSecret(dir)).toBe(secret);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("produit un secret aléatoire de 32 octets", () => {
    expect(randomSecret()).toMatch(/^[0-9a-f]{64}$/);
    expect(randomSecret()).not.toBe(randomSecret());
  });
});

describe("identifiant public", () => {
  it("est stable, distinct de l'id de compte et non réversible", () => {
    const id = "3f2b6c1e-8a4d-4b7e-9c2a-1d5e6f7a8b9c";
    expect(publicPlayerId(id)).toBe(publicPlayerId(id));
    expect(publicPlayerId(id)).not.toContain(id);
    expect(publicPlayerId(id)).not.toBe(publicPlayerId("autre"));
  });
});
