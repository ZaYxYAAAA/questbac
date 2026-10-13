import { describe, expect, it } from "vitest";
import { hashPassword, passwordError, pseudoError, pseudoKey, signToken, verifyPassword, verifyToken } from "./auth";

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
