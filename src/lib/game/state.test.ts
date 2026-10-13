import { describe, expect, it } from "vitest";
import { finalLeagueResult } from "./league";
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

describe("ligue hebdomadaire", () => {
  const profile = { pseudo: "Lina", avatar: "🦊", level: "premiere" as const, createdAt: 42 };
  const monday = new Date(2026, 9, 12, 9); // semaine 2026-W42
  const nextMonday = new Date(2026, 9, 19, 9);

  it("clôt la semaine écoulée : place, récompense et nouveau groupe", () => {
    const d0 = { ...createInitialData(monday), profile, rp: 250, peakRp: 250 };
    const rivals = [1, 2, 3, 4].map((i) => ({ id: `real-${i}`, pseudo: `J${i}`, avatar: "🐼", weeklyXp: i * 100 }));
    const played = { ...d0, weekly: { ...d0.weekly, xp: 1_000_000 }, league: { ...d0.league, rivals } };
    const next = refreshPeriods(played, nextMonday);
    expect(next.league.week).toBe("2026-W43");
    expect(next.weekly).toEqual({ week: "2026-W43", xp: 0 });
    expect(next.league.last).toMatchObject({ week: "2026-W42", rank: 1, size: 5, zone: "promotion", seen: false });
    expect(next.league.rivals).toEqual([]);
    expect(next.rp).toBe(310);
    expect(next.peakRp).toBe(310);
    expect(next.xp).toBe(300);
    // Le nouveau groupe est tiré au palier atteint grâce au bonus.
    expect(next.league.tierId).toBe("argent");
    expect(next.feed[0]).toMatchObject({ kind: "league", ref: "1:bronze" });
    // Déterministe et appliqué une seule fois.
    expect(refreshPeriods(next, nextMonday)).toBe(next);
    expect(next.league.last).toEqual({ ...finalLeagueResult(played.league, 1_000_000) });
    expect(acknowledgeLeague(next).league.last?.seen).toBe(true);
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

  it("la relégation coûte quelques RP sans descendre sous 0", () => {
    const d0 = { ...createInitialData(monday), profile, rp: 4, peakRp: 4 };
    const rivals = Array.from({ length: 9 }, (_, i) => ({ id: `real-${i}`, pseudo: `J${i}`, avatar: "🐼", weeklyXp: 100 + i }));
    const next = refreshPeriods({ ...d0, weekly: { ...d0.weekly, xp: 1 }, league: { ...d0.league, rivals } }, nextMonday);
    expect(next.league.last?.zone).toBe("relegation");
    expect(next.rp).toBe(0);
    expect(next.peakRp).toBe(4);
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

  it("note la promotion, le boss vaincu et garde le meilleur RP", () => {
    const d0 = { ...createInitialData(now), rp: 280, peakRp: 280 };
    const win = applySession(d0, { kind: "boss", bossId: "derivatus", subject: "maths", result: perfect, won: true, xpReward: 350, rpReward: 80, bossHpLeft: 0 }, now);
    expect(win.summary.promotion).toMatchObject({ step: { label: "Argent III" }, newTier: true });
    expect(win.data.peakRp).toBe(360);
    expect(win.data.feed.map((e) => e.kind)).toEqual(expect.arrayContaining(["boss", "rank", "achievement"]));
    const lose = applySession(win.data, { kind: "boss", bossId: "derivatus", subject: "maths", result: perfect, won: false, xpReward: 350, rpReward: 80, bossHpLeft: 0.5 }, now);
    expect(lose.data.rp).toBe(345);
    expect(lose.data.peakRp).toBe(360);
    expect(lose.summary.promotion).toBeNull();
  });
});
