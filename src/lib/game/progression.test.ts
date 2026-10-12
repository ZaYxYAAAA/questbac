import { describe, expect, it } from "vitest";
import { bossDamage, levelFromXp, missionRewards, nextStreak, rankFromRp, starsFor, weekKey, xpToNext } from "./progression";

describe("niveaux", () => {
  it("convertit l'XP en niveau", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(xpToNext(1)).level).toBe(2);
    expect(levelFromXp(xpToNext(1) - 1).level).toBe(1);
    const l = levelFromXp(xpToNext(1) + xpToNext(2) + 10);
    expect(l.level).toBe(3);
    expect(l.current).toBe(10);
  });
});

describe("rangs", () => {
  it("place les divisions", () => {
    expect(rankFromRp(0).label).toBe("Bronze III");
    expect(rankFromRp(100).label).toBe("Bronze II");
    expect(rankFromRp(299).label).toBe("Bronze I");
    expect(rankFromRp(300).label).toBe("Argent III");
    expect(rankFromRp(5000).label).toBe("Maître");
    expect(rankFromRp(99999).label).toBe("Légende");
    expect(rankFromRp(99999).nextLabel).toBeNull();
  });
});

describe("récompenses", () => {
  it("attribue les étoiles", () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(8, 10)).toBe(2);
    expect(starsFor(5, 10)).toBe(1);
    expect(starsFor(4, 10)).toBe(0);
  });

  it("bonifie le sans-faute et la série", () => {
    const result = { correct: 4, total: 4, maxCombo: 4, durationMs: 1000, answers: [] };
    const r1 = missionRewards(result, 100, 1);
    expect(r1.perfectBonus).toBe(50);
    expect(r1.xp).toBe(170);
    const r2 = missionRewards(result, 100, 3);
    expect(r2.streakBonusXp).toBe(Math.round(170 * 0.1));
  });

  it("calcule les dégâts de boss", () => {
    const normal = bossDamage({ combo: 0, timeRatio: 0.8 });
    const crit = bossDamage({ combo: 0, timeRatio: 0.2 });
    expect(crit.critical).toBe(true);
    expect(crit.damage).toBeGreaterThan(normal.damage);
    expect(bossDamage({ combo: 4, timeRatio: 0.8 }).damage).toBeGreaterThan(normal.damage);
  });
});

describe("dates", () => {
  it("gère la série de jours", () => {
    expect(nextStreak({ count: 0, lastDay: null }, "2026-10-12")).toEqual({ count: 1, lastDay: "2026-10-12" });
    expect(nextStreak({ count: 3, lastDay: "2026-10-11" }, "2026-10-12").count).toBe(4);
    expect(nextStreak({ count: 3, lastDay: "2026-10-12" }, "2026-10-12").count).toBe(3);
    expect(nextStreak({ count: 3, lastDay: "2026-10-09" }, "2026-10-12").count).toBe(1);
  });

  it("calcule la semaine ISO", () => {
    expect(weekKey(new Date(2026, 0, 1))).toBe("2026-W01");
    expect(weekKey(new Date(2026, 9, 12))).toBe("2026-W42");
  });
});
