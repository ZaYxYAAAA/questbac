import { describe, expect, it } from "vitest";
import { LEAGUE_SIZE, finalLeagueResult, formatCountdown, leagueReward, leagueRivals, leagueStandings, promotionSpots, relegationSpots, weekEnd, weekProgress, zoneOf } from "./league";
import type { PublicProfile } from "./save";

const league = { week: "2026-W42", tierId: "or" };
const now = new Date(2026, 9, 14, 12);
const row = (i: number, weeklyXp: number) => ({ id: `real-${i}`, pseudo: `J${i}`, avatar: "🐼", weeklyXp });
const player = (id: string, rp: number, weeklyXp = 100, week = "2026-W42") =>
  ({ id, pseudo: id, avatar: "🦊", level: "premiere", playerLevel: 1, rp, weeklyXp, week }) as unknown as PublicProfile;

describe("ligue hebdomadaire (vrais joueurs)", () => {
  it("regroupe les joueurs les plus proches de mon rang, sans moi", () => {
    const players = [player("me", 500), player("a", 520), player("b", 5000), player("c", 480, 50, "2026-W41"), ...Array.from({ length: 30 }, (_, i) => player(`x${i}`, 1000 + i))];
    const rivals = leagueRivals(players, "me", 500, now);
    expect(rivals).toHaveLength(LEAGUE_SIZE - 1);
    expect(rivals.map((r) => r.pseudo).slice(0, 2).sort()).toEqual(["a", "c"]);
    expect(rivals.some((r) => r.pseudo === "me" || r.pseudo === "b")).toBe(false);
    expect(rivals.find((r) => r.pseudo === "c")!.weeklyXp).toBe(0); // semaine passée
  });

  it("classe le joueur et calcule la récompense finale", () => {
    const rivals = Array.from({ length: 19 }, (_, i) => row(i, (i + 1) * 100));
    const top = finalLeagueResult({ ...league, rivals }, 1_000_000);
    expect(top).toMatchObject({ rank: 1, size: LEAGUE_SIZE, zone: "promotion", rewardXp: 300, rewardRp: 60, seen: false });
    const last = finalLeagueResult({ ...league, rivals }, 1);
    expect(last.rank).toBe(LEAGUE_SIZE);
    expect(last.zone).toBe("relegation");
    expect(last.rewardRp).toBeLessThan(0);
    expect(finalLeagueResult(league, 50)).toMatchObject({ rank: 1, size: 1, rewardXp: 0, rewardRp: 0 });
    expect(leagueStandings([row(1, 10)], { pseudo: "Moi", avatar: "🦊", weeklyXp: 10 })[0].isPlayer).toBe(true);
  });

  it("zones et récompenses selon la taille du groupe", () => {
    expect([promotionSpots(2), promotionSpots(3), promotionSpots(5), promotionSpots(20)]).toEqual([0, 1, 2, 3]);
    expect([relegationSpots(5), relegationSpots(6), relegationSpots(20)]).toEqual([0, 1, 3]);
    expect(zoneOf(3, 20)).toBe("promotion");
    expect(zoneOf(4, 20)).toBe("safe");
    expect(zoneOf(18, 20)).toBe("relegation");
    expect(zoneOf(3, 3)).toBe("safe");
    expect(leagueReward(2, 20)).toMatchObject({ xp: 200, rp: 40 });
    expect(leagueReward(8, 20)).toMatchObject({ xp: 50, rp: 0 });
    expect(leagueReward(15, 20)).toMatchObject({ xp: 0, rp: 0 });
    expect(leagueReward(1, 2)).toMatchObject({ xp: 0, rp: 0 });
  });

  it("compte à rebours jusqu'au lundi suivant", () => {
    const wed = new Date(2026, 9, 14, 12); // mercredi 14 octobre 2026, midi
    expect(weekEnd(wed)).toEqual(new Date(2026, 9, 19));
    expect(weekProgress(new Date(2026, 9, 12, 0))).toBe(0);
    expect(weekProgress(wed)).toBeCloseTo(2.5 / 7, 5);
    expect(weekEnd(new Date(2026, 9, 18, 23))).toEqual(new Date(2026, 9, 19));
    expect(formatCountdown((4 * 24 + 12) * 3600_000)).toBe("4 j 12 h");
    expect(formatCountdown(3 * 3600_000 + 5 * 60_000)).toBe("3 h 05 min");
  });
});
