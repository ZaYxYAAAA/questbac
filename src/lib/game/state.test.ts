import { describe, expect, it } from "vitest";
import { acknowledgeLeague, applyActivity, applyDailyClaim, applySession, createInitialData, refreshPeriods } from "./state";

const now = new Date(2026, 9, 12, 10);
const perfect = { correct: 5, total: 5, maxCombo: 5, durationMs: 30_000, answers: [] };

describe("applySession", () => {
  it("enregistre une mission et ses récompenses", () => {
    const d0 = createInitialData(now);
    const { data, summary } = applySession(d0, { kind: "chapter", chapterId: "maths-1-suites", subject: "maths", result: perfect, answerXp: 80 }, now);
    expect(data.chapters["maths-1-suites"].stars).toBe(3);
    expect(data.stats.missions).toBe(1);
    expect(data.stats.perfects).toBe(1);
    expect(data.streak.count).toBe(1);
    expect(summary.xpGained).toBeGreaterThan(0);
    expect(data.xp).toBe(summary.xpGained);
    expect(data.weekly.xp).toBe(summary.xpGained);
    expect(summary.achievements.map((a) => a.id)).toEqual(expect.arrayContaining(["premiers-pas", "sans-faute", "combo-5"]));
    // Le rang ne se gagne qu'en mode classé.
    expect(data.rp).toBe(0);
  });

  it("ne baisse jamais les étoiles d'un chapitre", () => {
    const d0 = createInitialData(now);
    const a = applySession(d0, { kind: "chapter", chapterId: "c", subject: "maths", result: perfect, answerXp: 50 }, now).data;
    const b = applySession(a, { kind: "chapter", chapterId: "c", subject: "maths", result: { ...perfect, correct: 1 }, answerXp: 10 }, now).data;
    expect(b.chapters.c.stars).toBe(3);
    expect(b.chapters.c.attempts).toBe(2);
  });

  it("gère victoire et défaite contre un boss", () => {
    const d0 = createInitialData(now);
    const win = applySession(d0, { kind: "boss", bossId: "derivatus", subject: "maths", result: perfect, won: true, xpReward: 350, rpReward: 80, bossHpLeft: 0 }, now);
    expect(win.data.bosses.derivatus.victories).toBe(1);
    expect(win.data.rp).toBe(0);
    const lose = applySession(win.data, { kind: "boss", bossId: "derivatus", subject: "maths", result: perfect, won: false, xpReward: 350, rpReward: 80, bossHpLeft: 0.5 }, now);
    expect(lose.data.rp).toBe(0);
    expect(lose.data.bosses.derivatus.attempts).toBe(2);
    expect(win.summary.lines.some((l) => l.label === "Points de rang")).toBe(false);
  });

  it("réinitialise les quêtes quand le jour change", () => {
    const d0 = createInitialData(now);
    const day1 = applyActivity(d0, { kind: "lab", labId: "trigo" }, now).data;
    const tomorrow = new Date(2026, 9, 13, 10);
    const day2 = applyActivity(day1, { kind: "lab", labId: "suites" }, tomorrow).data;
    expect(day2.quests.day).toBe("2026-10-13");
    expect(day2.stats.labsOpened).toEqual(["trigo", "suites"]);
    expect(day2.streak.count).toBe(2);
  });
});

describe("ligue hebdomadaire", () => {
  const profile = { pseudo: "Lina", avatar: "🦊", level: "premiere" as const, createdAt: 42 };
  const monday = new Date(2026, 9, 12, 9); // semaine 2026-W42
  const nextMonday = new Date(2026, 9, 19, 9);

  it("change de semaine sans récompense de ligue (remplacée par le classé)", () => {
    const d0 = { ...createInitialData(monday), profile, rp: 250, peakRp: 250 };
    const rivals = [1, 2, 3, 4].map((i) => ({ id: `real-${i}`, pseudo: `J${i}`, avatar: "🐼", weeklyXp: i * 100 }));
    const played = { ...d0, weekly: { ...d0.weekly, xp: 1_000_000 }, league: { ...d0.league, rivals } };
    const next = refreshPeriods(played, nextMonday);
    expect(next.league.week).toBe("2026-W43");
    expect(next.weekly).toEqual({ week: "2026-W43", xp: 0 });
    expect(next.league.last).toBeNull();
    expect(next.rp).toBe(250);
    expect(next.xp).toBe(0);
    expect(refreshPeriods(next, nextMonday)).toBe(next);
    expect(acknowledgeLeague(next)).toBe(next);
  });

  it("pas de résultat de ligue sans au moins 3 vrais joueurs", () => {
    const d0 = { ...createInitialData(monday), profile, rp: 40, peakRp: 40 };
    const played = { ...d0, weekly: { ...d0.weekly, xp: 500 }, league: { ...d0.league, rivals: [{ id: "real-1", pseudo: "A", avatar: "🐼", weeklyXp: 10 }] } };
    const next = refreshPeriods(played, nextMonday);
    expect(next.league.last).toBeNull();
    expect(next.rp).toBe(40);
  });

  it("ne classe pas un joueur absent toute la semaine", () => {
    const d0 = { ...createInitialData(monday), profile, rp: 40, peakRp: 40 };
    const next = refreshPeriods(d0, nextMonday);
    expect(next.league.last).toBeNull();
    expect(next.rp).toBe(40);
    expect(next.league.week).toBe("2026-W43");
  });
});

describe("coffre quotidien, meilleur rang et fil", () => {
  it("ouvre le coffre une fois par jour et compte l'XP dans la semaine", () => {
    const d0 = createInitialData(now);
    const claimed = applyDailyClaim(d0, now)!;
    expect(claimed.reward.day).toBe(1);
    expect(claimed.data.xp).toBe(claimed.summary.xpGained);
    expect(claimed.data.weekly.xp).toBe(claimed.data.xp);
    expect(claimed.data.daily).toEqual({ lastClaim: "2026-10-12", count: 1 });
    expect(applyDailyClaim(claimed.data, now)).toBeNull();
  });

  it("note le boss vaincu sans toucher au rang (gagné en classé)", () => {
    const d0 = { ...createInitialData(now), rp: 280, peakRp: 280 };
    const win = applySession(d0, { kind: "boss", bossId: "derivatus", subject: "maths", result: perfect, won: true, xpReward: 350, rpReward: 80, bossHpLeft: 0 }, now);
    expect(win.summary.promotion).toBeNull();
    expect(win.data.rp).toBe(280);
    expect(win.data.peakRp).toBe(280);
    expect(win.data.feed.map((e) => e.kind)).toEqual(expect.arrayContaining(["boss", "achievement"]));
  });
});
