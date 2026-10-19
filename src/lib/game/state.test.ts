import { describe, expect, it } from "vitest";
import { acknowledgeLeague, applyActivity, applyDailyClaim, applySession, createInitialData, refreshPeriods } from "./state";
import { bossState, keepBossProgress, triesLeft } from "./boss-rules";
import { startBossFight, tierUnlocked } from "./state";
import { dayKey } from "./progression";
import { dailyQuests } from "./quests";

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

  it("boss vaincu : coffre, boost ×2 et plus rejouable", () => {
    const d0 = createInitialData(now);
    const boss = { kind: "boss" as const, bossId: "derivatus", subject: "maths" as const, result: perfect, xpReward: 350, rpReward: 80 };
    const win = applySession(d0, { ...boss, won: true, bossHpLeft: 0 }, now);
    expect(win.data.bosses.derivatus).toMatchObject({ victories: 1, tries: 1, flawless: true });
    expect(win.data.rp).toBe(0);
    expect(win.data.boost).toMatchObject({ mult: 2, source: "boss" });
    expect(win.summary.lines.some((l) => l.label.includes("Coffre du boss"))).toBe(true);
    expect(win.summary.lines.some((l) => l.label === "Points de rang")).toBe(false);
    // Rejouer un boss vaincu ne rapporte plus rien et ne compte pas d'essai.
    const again = applySession(win.data, { ...boss, won: true, bossHpLeft: 0 }, now);
    expect(again.summary.xpGained).toBe(0);
    expect(again.data.bosses.derivatus.tries).toBe(1);
  });

  it("boss : 3 défaites et il est perdu pour toujours", () => {
    let d = createInitialData(now);
    const lose = { kind: "boss" as const, bossId: "hydre-log", subject: "maths" as const, result: perfect, won: false, xpReward: 500, rpReward: 0, bossHpLeft: 0.5 };
    for (let i = 0; i < 3; i++) d = applySession(d, lose, now).data;
    expect(bossState(d.bosses["hydre-log"])).toBe("lost");
    expect(triesLeft(d.bosses["hydre-log"])).toBe(0);
    const fourth = applySession(d, { ...lose, won: true, bossHpLeft: 0 }, now);
    expect(fourth.summary.xpGained).toBe(0);
    expect(fourth.data.bosses["hydre-log"].victories).toBe(0);
  });

  it("boss : quitter en plein combat compte quand même l'essai", () => {
    let d = createInitialData(now);
    for (let i = 0; i < 3; i++) d = startBossFight(d, "sphinx-fonctions", now)!;
    expect(triesLeft(d.bosses["sphinx-fonctions"], now.getTime())).toBe(0);
    // Le 3e combat, encore en cours, peut être gagné…
    const win = applySession(d, { kind: "boss", bossId: "sphinx-fonctions", subject: "maths", result: perfect, won: true, xpReward: 250, rpReward: 0, bossHpLeft: 0 }, now);
    expect(win.data.bosses["sphinx-fonctions"]).toMatchObject({ victories: 1, tries: 3 });
    // …mais abandonné, le boss est perdu.
    const later = new Date(now.getTime() + 31 * 60_000);
    expect(bossState(d.bosses["sphinx-fonctions"], later.getTime())).toBe("lost");
    expect(startBossFight(d, "sphinx-fonctions", later)).toBeNull();
  });

  it("boss : un combat long (explications lues) compte un seul essai, et sa victoire", () => {
    let d = createInitialData(now);
    for (let i = 0; i < 3; i++) d = startBossFight(d, "sphinx-fonctions", now)!;
    const later = new Date(now.getTime() + 45 * 60_000);
    const win = applySession(d, { kind: "boss", bossId: "sphinx-fonctions", subject: "maths", result: perfect, won: true, xpReward: 250, rpReward: 0, bossHpLeft: 0 }, later);
    expect(win.data.bosses["sphinx-fonctions"]).toMatchObject({ victories: 1, tries: 3 });
    expect(win.summary.xpGained).toBeGreaterThan(0);
    // 1er essai long et perdu : toujours 1 essai compté, pas 2.
    const first = startBossFight(createInitialData(now), "derivatus", now)!;
    const lost = applySession(first, { kind: "boss", bossId: "derivatus", subject: "maths", result: perfect, won: false, xpReward: 350, rpReward: 0, bossHpLeft: 0.4 }, later);
    expect(lost.data.bosses.derivatus.tries).toBe(1);
    expect(triesLeft(lost.data.bosses.derivatus, later.getTime())).toBe(2);
  });

  it("un boost plus faible gagné pendant un boost ×2 n'est pas annoncé comme activé", () => {
    const boost = { mult: 2, until: now.getTime() + 10 * 60_000, source: "boss" as const };
    const d0 = { ...createInitialData(now), boost, daily: { lastClaim: "2026-10-11", count: 6 } };
    const claimed = applyDailyClaim(d0, now)!;
    expect(claimed.reward.day).toBe(7);
    expect(claimed.data.boost).toEqual(boost);
    expect(claimed.summary.lines.some((l) => l.label.includes("activé"))).toBe(false);
    expect(claimed.summary.lines).toContainEqual({ label: "Boost XP ×1,5 sans effet : un boost ×2 est déjà actif", value: "" });
    // Sans boost en cours, il est bien activé.
    const fresh = applyDailyClaim({ ...d0, boost: null }, now)!;
    expect(fresh.summary.lines).toContainEqual({ label: "🚀 Boost XP ×1,5 activé", value: "1 h" });
  });

  it("le serveur ne rend jamais d'essais de boss", () => {
    const merged = keepBossProgress({ derivatus: { victories: 0, attempts: 5, tries: 2 } }, { derivatus: { victories: 0, attempts: 1, tries: 0 } });
    expect(merged.derivatus).toMatchObject({ tries: 2, attempts: 5 });
    // Le meilleur temps d'un boss vaincu n'est pas effacé par une version qui n'en a pas.
    const timed = keepBossProgress({ derivatus: { victories: 1, attempts: 2, tries: 2, bestTimeMs: 41_000 } }, { derivatus: { victories: 0, attempts: 1, tries: 1, bestTimeMs: null } });
    expect(timed.derivatus).toMatchObject({ victories: 1, bestTimeMs: 41_000 });
  });

  it("une mission rejouée le même jour rapporte de moins en moins", () => {
    let d = createInitialData(now);
    const play = { kind: "chapter" as const, chapterId: "maths-2-nombres", subject: "maths" as const, result: perfect, answerXp: 100 };
    const gains = [0, 1, 2].map(() => {
      const r = applySession(d, play, now);
      d = r.data;
      return r.summary.lines.find((l) => l.label.startsWith("Mission déjà jouée"))?.value ?? null;
    });
    expect(gains[0]).toBeNull();
    expect(gains[1]).toMatch(/^−/);
    expect(gains[2]).toMatch(/^−/);
    const tomorrow = new Date(now.getTime() + 86_400_000);
    expect(applySession(d, play, tomorrow).summary.lines.some((l) => l.label.startsWith("Mission déjà jouée"))).toBe(false);
  });

  it("n'affiche plus une série interrompue, qui repart à 1", () => {
    const d0 = { ...createInitialData(now), streak: { count: 12, lastDay: "2026-10-12", best: 12 } };
    // Le lendemain : la série tient encore (il reste la journée pour réviser).
    expect(refreshPeriods(d0, new Date(2026, 9, 13, 10)).streak.count).toBe(12);
    // Deux jours plus tard : elle est cassée, le meilleur score reste.
    const broken = refreshPeriods(d0, new Date(2026, 9, 14, 10));
    expect(broken.streak).toEqual({ count: 0, lastDay: "2026-10-12", best: 12 });
    expect(refreshPeriods(broken, new Date(2026, 9, 14, 10))).toBe(broken);
    const back = applyActivity(broken, { kind: "lab", labId: "trigo" }, new Date(2026, 9, 14, 11)).data;
    expect(back.streak).toEqual({ count: 1, lastDay: "2026-10-14", best: 12 });
  });

  it("la quête « Explore 3 labos » demande 3 labos différents", () => {
    // Un jour où la quête lab-3 est tirée.
    const day = Array.from({ length: 60 }, (_, i) => new Date(2026, 9, 1 + i, 10)).find((d) => dailyQuests(dayKey(d)).some((q) => q.id === "lab-3"))!;
    let d = createInitialData(day);
    for (let i = 0; i < 3; i++) d = applyActivity(d, { kind: "lab", labId: "trigo" }, day).data;
    expect(d.quests.progress["lab-3"]).toBe(1);
    expect(d.quests.done).not.toContain("lab-3");
    d = applyActivity(d, { kind: "lab", labId: "suites" }, day).data;
    d = applyActivity(d, { kind: "lab", labId: "pendule" }, day).data;
    expect(d.quests.done).toContain("lab-3");
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

describe("niveaux de la Culture générale", () => {
  const play = (tier: 1 | 2 | 3, correct: number, total = 6) =>
    ({ kind: "chapter", chapterId: "cg-capitales", subject: "culture", result: { ...perfect, correct, total }, answerXp: 40, tier }) as const;

  it("débloque le niveau suivant à 70 %, pas en dessous", () => {
    const d0 = createInitialData(now);
    expect(tierUnlocked(d0.chapters["cg-capitales"], 2)).toBe(false);
    const fail = applySession(d0, play(1, 3), now).data;
    expect(tierUnlocked(fail.chapters["cg-capitales"], 2)).toBe(false);
    const pass = applySession(fail, play(1, 5), now);
    expect(tierUnlocked(pass.data.chapters["cg-capitales"], 2)).toBe(true);
    expect(tierUnlocked(pass.data.chapters["cg-capitales"], 3)).toBe(false);
    expect(pass.summary.lines.some((l) => l.label.includes("Intermédiaire débloqué"))).toBe(true);
    // Rater un niveau supérieur ne fait pas perdre le niveau acquis.
    const after = applySession(pass.data, play(2, 0), now).data;
    expect(after.chapters["cg-capitales"].tier).toBe(1);
  });
  it("les niveaux supérieurs rapportent plus d'XP", () => {
    const d0 = createInitialData(now);
    const basic = applySession(d0, play(1, 6), now).summary.xpGained;
    const expert = applySession(d0, play(3, 6), now).summary;
    expect(expert.xpGained).toBeGreaterThan(basic);
    expect(expert.lines.some((l) => l.label === "Bonus niveau Expert")).toBe(true);
  });
});
