import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { normalizeFriendCode } from "@/lib/friend-code";

// Stockage fichier temporaire, choisi avant le premier accès au store.
const dir = mkdtempSync(path.join(tmpdir(), "qb-friends-"));
process.env.QB_DATA_DIR = dir;
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const { accountIdForCode, addFriendship, friendCodeOf, friendIds, registerFriendCode, removeFriendship, MAX_FRIENDS } = await import("./friends");
const { publicPlayerId } = await import("./auth");
const { getStore } = await import("./store");

describe("codes d'ami", () => {
  it("sont stables, lisibles et normalisables", () => {
    const code = friendCodeOf("compte-a");
    expect(code).toMatch(/^QB-[A-HJ-NP-Z2-9]{6}$/);
    expect(friendCodeOf("compte-a")).toBe(code);
    expect(friendCodeOf("compte-b")).not.toBe(code);
    expect(normalizeFriendCode(code.toLowerCase())).toBe(code);
    expect(normalizeFriendCode(code.slice(3))).toBe(code);
    expect(normalizeFriendCode(` ${code.replace("-", " ")} `)).toBe(code);
    expect(normalizeFriendCode("QB-0O1I00")).toBeNull();
    expect(normalizeFriendCode("abc")).toBeNull();
  });

  it("retrouvent le compte une fois enregistrés", async () => {
    expect(await accountIdForCode(friendCodeOf("compte-x"))).toBeNull();
    await registerFriendCode("compte-x");
    expect(await accountIdForCode(friendCodeOf("compte-x"))).toBe("compte-x");
  });
});

describe("amitiés", () => {
  it("sont symétriques et sans doublon", async () => {
    expect(await addFriendship("a", "b")).toBe("added");
    expect(await addFriendship("a", "b")).toBe("already");
    expect(await addFriendship("b", "a")).toBe("already");
    expect(await addFriendship("a", "a")).toBe("self");
    expect(await friendIds("a")).toEqual(["b"]);
    expect(await friendIds("b")).toEqual(["a"]);
  });

  it("se retirent des deux côtés par identifiant public", async () => {
    expect(await removeFriendship("a", "inconnu")).toBe(false);
    expect(await removeFriendship("a", publicPlayerId("b"))).toBe(true);
    expect(await friendIds("a")).toEqual([]);
    expect(await friendIds("b")).toEqual([]);
  });

  it("ajoutées en même temps, ne s'effacent pas", async () => {
    const results = await Promise.all(["m1", "m2", "m3", "m4"].map((id) => addFriendship("simultane", id)));
    expect(results).toEqual(["added", "added", "added", "added"]);
    expect([...(await friendIds("simultane"))].sort()).toEqual(["m1", "m2", "m3", "m4"]);
  });

  it("respectent la limite", async () => {
    await getStore().set("friends:plein", Array.from({ length: MAX_FRIENDS }, (_, i) => `f${i}`));
    expect(await addFriendship("plein", "nouveau")).toBe("full");
    expect(await addFriendship("nouveau", "plein")).toBe("full");
  });
});
