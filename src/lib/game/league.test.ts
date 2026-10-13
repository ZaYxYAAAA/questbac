import { describe, expect, it } from "vitest";
import { LEAGUE_SIZE, finalLeagueResult, formatCountdown, leagueOpponents, leagueReward, leagueStandings, weekEnd, weekProgress, zoneOf } from "./league";

const league = { week: "2026-W42", tierId: "or" };

describe("ligue hebdomadaire", () => {
  it("forme un groupe déterministe de 20 avec des pseudos distincts", () => {
    const a = leagueOpponents(league, "123");
    expect(a).toHaveLength(LEAGUE_SIZE - 1);
    expect(new Set(a.map((o) => o.pseudo)).size).toBe(a.length);
    expect(leagueOpponents(league, "123")).toEqual(a);
    expect(leagueOpponents(league, "456").map((o) => o.pseudo)).not.toEqual(a.map((o) => o.pseudo));
  });

  it("les adversaires progressent pendant la semaine sans jamais reculer", () => {
    const player = { pseudo: "Moi", avatar: "🦊", weeklyXp: 0 };
    const total = (p: number) => leagueStandings(league, "1", player, p).reduce((n, r) => n + r.weeklyXp, 0);
    expect(total(0)).toBe(0);
    expect(total(0.3)).toBeLessThanOrEqual(total(0.6));
    expect(total(0.6)).toBeLessThanOrEqual(total(1));
  });

  it("les paliers élevés sont plus disputés", () => {
    const sum = (tierId: string) => leagueOpponents({ ...league, tierId }, "1").reduce((n, o) => n + o.target, 0);
    expect(sum("legende")).toBeGreaterThan(sum("bronze"));
  });

  it("classe le joueur et calcule la récompense finale", () => {
    const top = finalLeagueResult(league, "1", 1_000_000);
    expect(top).toMatchObject({ rank: 1, size: LEAGUE_SIZE, zone: "promotion", rewardXp: 300, rewardRp: 60, seen: false });
    const last = finalLeagueResult(league, "1", 1);
    expect(last.rank).toBeGreaterThan(LEAGUE_SIZE - 3);
    expect(last.zone).toBe("relegation");
    expect(last.rewardRp).toBeLessThan(0);
  });

  it("zones et récompenses", () => {
    expect(zoneOf(3)).toBe("promotion");
    expect(zoneOf(4)).toBe("safe");
    expect(zoneOf(18)).toBe("relegation");
    expect(leagueReward(2)).toMatchObject({ xp: 200, rp: 40 });
    expect(leagueReward(8)).toMatchObject({ xp: 50, rp: 0 });
    expect(leagueReward(15)).toMatchObject({ xp: 0, rp: 0 });
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
