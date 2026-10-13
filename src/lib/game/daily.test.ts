import { describe, expect, it } from "vitest";
import { DAILY_REWARDS, claimDaily, dailyCalendar } from "./daily";

describe("coffre de connexion quotidienne", () => {
  it("s'ouvre une fois par jour et avance dans le calendrier", () => {
    const first = claimDaily({ lastClaim: null, count: 0 }, "2026-10-12")!;
    expect(first.reward.day).toBe(1);
    expect(claimDaily(first.state, "2026-10-12")).toBeNull();
    const cal = dailyCalendar(first.state, "2026-10-12");
    expect(cal.canClaim).toBe(false);
    expect(cal.days.map((d) => d.status).slice(0, 3)).toEqual(["claimed", "next", "locked"]);
    const second = claimDaily(first.state, "2026-10-13")!;
    expect(second.reward.day).toBe(2);
    expect(dailyCalendar(second.state, "2026-10-14").days[2].status).toBe("today");
  });

  it("revient au jour 1 après un jour manqué", () => {
    const state = { lastClaim: "2026-10-10", count: 4 };
    expect(dailyCalendar(state, "2026-10-12").todayIndex).toBe(0);
    expect(claimDaily(state, "2026-10-12")!.reward.day).toBe(1);
  });

  it("donne le grand coffre au 7e jour puis recommence le cycle", () => {
    const day7 = claimDaily({ lastClaim: "2026-10-11", count: 6 }, "2026-10-12")!;
    expect(day7.reward).toEqual(DAILY_REWARDS[6]);
    expect(day7.reward.rp).toBeGreaterThan(0);
    expect(claimDaily(day7.state, "2026-10-13")!.reward.day).toBe(1);
  });
});
