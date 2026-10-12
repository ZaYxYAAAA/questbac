import { describe, expect, it } from "vitest";
import { applyActivity, applySession, createInitialData } from "./state";

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
    expect(data.rp).toBeGreaterThan(0);
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
    expect(win.data.rp).toBe(80);
    const lose = applySession(win.data, { kind: "boss", bossId: "derivatus", subject: "maths", result: perfect, won: false, xpReward: 350, rpReward: 80, bossHpLeft: 0.5 }, now);
    expect(lose.data.rp).toBe(65);
    expect(lose.data.bosses.derivatus.attempts).toBe(2);
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
