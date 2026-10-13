import { describe, expect, it } from "vitest";
import { buildLeaderboard, realEntries } from "./leaderboard";
import { weekKey } from "./progression";
import { MAX_PHOTO_CHARS } from "./photo";
import { type PublicProfile, SaveSchema, migrateSave, parseSave, publicProfileFrom, toGameData } from "./save";
import { createInitialData } from "./state";

const now = new Date(2026, 9, 12, 10);

describe("migration des sauvegardes", () => {
  it("complète une sauvegarde v1 sans rien perdre", () => {
    const v1 = { ...createInitialData(now), xp: 420, rp: 90, profile: { pseudo: "Lina", avatar: "🦊", level: "premiere", createdAt: 1 } } as Record<string, unknown>;
    delete v1.updatedAt;
    delete (v1.stats as Record<string, unknown>).missionsForged;
    const d = migrateSave(v1)!;
    expect(d.xp).toBe(420);
    expect(d.profile?.pseudo).toBe("Lina");
    expect(d.updatedAt).toBe(0);
    expect(d.stats.missionsForged).toBe(0);
  });

  it("ajoute ligue, coffre quotidien, fil et meilleur RP à une ancienne sauvegarde", () => {
    const v3 = { ...createInitialData(now), rp: 900, profile: { pseudo: "Lina", avatar: "🦊", level: "premiere", createdAt: 1 } } as Record<string, unknown>;
    delete v3.league;
    delete v3.daily;
    delete v3.feed;
    delete v3.peakRp;
    const d = migrateSave(v3)!;
    expect(d.peakRp).toBe(900);
    expect(d.league).toMatchObject({ tierId: "or", last: null });
    expect(d.daily).toEqual({ lastClaim: null, count: 0 });
    expect(d.feed).toEqual([]);
    expect(SaveSchema.safeParse(d).success).toBe(true);
    // Les champs existants sont conservés.
    const kept = migrateSave({ ...d, peakRp: 1200, daily: { lastClaim: "2026-10-11", count: 3 } })!;
    expect(kept.peakRp).toBe(1200);
    expect(kept.daily.count).toBe(3);
  });

  it("publie le titre choisi seulement s'il est débloqué", () => {
    const base = { ...createInitialData(now), rp: 900, peakRp: 900 };
    const withTitle = (titleId: string) => ({ ...base, profile: { pseudo: "Lina", avatar: "🦊", level: "premiere" as const, createdAt: 1, titleId, frameId: titleId } });
    expect(publicProfileFrom({ publicId: "a", pseudo: "Lina" }, withTitle("argent"))).toMatchObject({ titleId: "argent", frameId: "argent" });
    const locked = publicProfileFrom({ publicId: "a", pseudo: "Lina" }, withTitle("legende"));
    expect(locked.titleId).toBe("or");
    expect(locked.frameId).toBeUndefined();
  });

  it("ignore les champs inconnus et refuse ce qui n'est pas une sauvegarde", () => {
    const d = migrateSave({ ...createInitialData(now), recordSession: () => 1 })!;
    expect("recordSession" in d).toBe(false);
    expect(migrateSave(null)).toBeNull();
    expect(migrateSave([1, 2])).toBeNull();
    expect(Object.keys(toGameData({ ...d, extra: 1 } as never))).not.toContain("extra");
  });

  it("range la photo à part de l'emoji et retire les photos invalides", () => {
    const jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
    const old = migrateSave({ ...createInitialData(now), profile: { pseudo: "Lina", avatar: jpeg, level: "premiere", createdAt: 1 } })!;
    expect(old.profile).toMatchObject({ avatar: "🦊", photo: jpeg });
    const bad = migrateSave({ ...createInitialData(now), profile: { pseudo: "Lina", avatar: "🐼", photo: "javascript:alert(1)", photoThumb: jpeg, level: "premiere", createdAt: 1 } })!;
    expect(bad.profile).toMatchObject({ avatar: "🐼", photoThumb: jpeg });
    expect(bad.profile && "photo" in bad.profile).toBe(false);
  });

  it("refuse une photo trop lourde côté serveur", () => {
    const huge = `data:image/jpeg;base64,${"A".repeat(MAX_PHOTO_CHARS + 10)}`;
    const save = { ...createInitialData(now), profile: { pseudo: "Lina", avatar: "🐼", level: "premiere" as const, createdAt: 1 } };
    const parsed = parseSave({ ...save, profile: { ...save.profile, photo: huge } });
    expect(parsed.ok && parsed.data.profile?.photo).toBe(undefined);
    expect(SaveSchema.safeParse({ ...save, profile: { ...save.profile, photo: huge } }).success).toBe(false);
    expect(SaveSchema.safeParse({ ...save, profile: { ...save.profile, avatar: "x".repeat(100) } }).success).toBe(false);
  });

  it("valide la forme", () => {
    expect(parseSave(createInitialData(now)).ok).toBe(true);
    expect(parseSave({ ...createInitialData(now), xp: "beaucoup" }).ok).toBe(false);
    expect(parseSave("texte").ok).toBe(false);
  });
});

describe("classement réel", () => {
  const profile = (over: Partial<PublicProfile>): PublicProfile => ({
    id: "a", pseudo: "Alice", avatar: "🐼", level: "premiere", playerLevel: 3, rp: 100, xp: 500, weeklyXp: 300, week: weekKey(now), updatedAt: 1, ...over,
  });

  it("construit le profil public depuis une sauvegarde", () => {
    const save = { ...createInitialData(now), xp: 1000, rp: 250, profile: { pseudo: "x", avatar: "data:" + "a".repeat(30_000), level: "terminale" as const, createdAt: 1 } };
    const p = publicProfileFrom({ publicId: "u1", pseudo: "Lina" }, save);
    expect(p).toMatchObject({ id: "u1", pseudo: "Lina", level: "terminale", rp: 250, xp: 1000 });
    expect(p.avatar).toBe("🙂"); // l'avatar public reste un emoji
  });

  it("ne publie que la miniature de la photo", () => {
    const thumb = "data:image/jpeg;base64,AAAA";
    const save = { ...createInitialData(now), profile: { pseudo: "x", avatar: "🐼", photo: "data:image/jpeg;base64,BBBB", photoThumb: thumb, level: "premiere" as const, createdAt: 1 } };
    const p = publicProfileFrom({ publicId: "u1", pseudo: "Lina" }, save);
    expect(p.photoThumb).toBe(thumb);
    expect(JSON.stringify(p)).not.toContain("BBBB");
    expect(realEntries([p], null, now)[0].photo).toBe(thumb);
  });

  it("classe les vrais joueurs, sans doublon du joueur", () => {
    const players = [profile({ id: "me", pseudo: "Moi" }), profile({ id: "a", rp: 999_999, weeklyXp: 99_999 }), profile({ id: "b", pseudo: "Ancien", weeklyXp: 5000, week: "2020-W01" })];
    const others = realEntries(players, "me", now);
    expect(others.map((e) => e.pseudo)).toEqual(["Alice", "Ancien"]);
    expect(others.every((e) => e.isReal)).toBe(true);
    expect(others[1].weeklyXp).toBe(0); // semaine passée → remise à zéro

    const me = { pseudo: "Moi", avatar: "🦊", level: "premiere" as const, playerLevel: 1, weeklyXp: 10, rp: 10 };
    const global = buildLeaderboard(me, "global", others);
    expect(global[0].pseudo).toBe("Alice");
    expect(global.filter((e) => e.isPlayer)).toHaveLength(1);
    expect(global).toHaveLength(3); // aucun bot
    expect(buildLeaderboard(me, "global")).toHaveLength(1);
  });
});
