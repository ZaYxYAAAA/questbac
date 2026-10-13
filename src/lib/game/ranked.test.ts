import { describe, expect, it } from "vitest";
import { rankedQuestions } from "@/lib/content/ranked-questions";
import {
  type RankedProfile,
  applyPresence,
  applySeason,
  formGroups,
  matchScore,
  newRankedProfile,
  placementStep,
  publicQuestion,
  questionPoints,
  rankedWeek,
  recordMatch,
  seasonKey,
  settleGroup,
  settleWeeks,
  RANK_EPOCH,
  type WeekZone,
  groupStatus,
  rankRewards,
  stepLabel,
  stepMinRp,
  suspicion,
  underReview,
} from "./ranked";

const monday = new Date("2026-10-12T10:00:00+02:00");
const nextMonday = new Date("2026-10-19T10:00:00+02:00");

describe("scores", () => {
  it("donne 7 points par bonne réponse plus jusqu'à 3 pour la vitesse", () => {
    expect(questionPoints(false, 1000, 30_000)).toBe(0);
    expect(questionPoints(true, 2000, 30_000)).toBe(10);
    expect(questionPoints(true, 30_000, 30_000)).toBe(7);
    expect(matchScore(Array(10).fill(10))).toBe(100);
  });

  it("place entre Bronze III et Or III", () => {
    expect(stepLabel(placementStep([20, 30, 40, 35, 30]))).toBe("Bronze III");
    expect(stepLabel(placementStep([70, 70, 70, 70, 70]))).toBe("Argent II");
    expect(stepLabel(placementStep([100, 100, 100, 100, 100]))).toBe("Or III");
  });
});

describe("semaines classées", () => {
  it("suit l'heure de Paris : dimanche 23 h 30 est encore la même semaine", () => {
    expect(rankedWeek(new Date("2026-10-18T23:30:00+02:00"))).toBe("2026-W42");
    expect(rankedWeek(new Date("2026-10-19T00:10:00+02:00"))).toBe("2026-W43");
  });

  it("garde les 10 meilleures manches et termine le placement à 5", () => {
    let p = newRankedProfile("Lina", monday);
    let placed = false;
    for (const s of [80, 80, 80, 80, 80]) ({ profile: p, placedNow: placed } = recordMatch(p, "maths", s, monday));
    expect(placed).toBe(true);
    expect(p.subjects.maths).toMatchObject({ placed: true, played: 5 });
    for (let i = 0; i < 8; i++) p = recordMatch(p, "maths", 50 + i, monday).profile;
    expect(p.subjects.maths!.best).toHaveLength(10);
    expect(p.subjects.maths!.best[0]).toBe(80);
  });

  it("forme des groupes de 20 au plus, de rangs voisins", () => {
    const entries = Array.from({ length: 45 }, (_, i) => ({ id: `p${i}`, step: i % 9, total: i, played: 3, avg: 50 }));
    const groups = formGroups(entries);
    expect(groups.map((g) => g.length)).toEqual([15, 15, 15]);
    expect(Math.min(...groups[0].map((e) => e.step))).toBeGreaterThanOrEqual(Math.max(...groups[1].map((e) => e.step)));
  });

  it("promeut le haut du groupe, relègue le bas, ignore les non-classés", () => {
    const group = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, step: 4, total: 100 * (10 - i), played: 4, avg: 40 }));
    group.push({ id: "lazy", step: 4, total: 900, played: 2, avg: 450 });
    const res = settleGroup(group, "2026-W42");
    expect(res.get("p0")).toMatchObject({ zone: "promotion", rank: 1, size: 10, from: 4, to: 5 });
    expect(res.get("p9")).toMatchObject({ zone: "relegation", to: 3 });
    expect(res.get("p5")).toMatchObject({ zone: "safe", to: 4 });
    expect(res.get("lazy")).toMatchObject({ zone: "unranked", to: 4 });
  });

  it("l'objectif de la division suffit pour monter, même seul", () => {
    const res = settleGroup([{ id: "solo", step: 0, total: 300, played: 5, avg: 60 }], "2026-W42");
    expect(res.get("solo")).toMatchObject({ zone: "objective", to: 1 });
  });

  it("clôt la semaine une seule fois et fait baisser les hauts rangs inactifs", () => {
    const base = () => newRankedProfile("x", monday);
    const profiles: Record<string, RankedProfile> = {};
    for (let i = 0; i < 4; i++) {
      let p = base();
      p = { ...p, subjects: { general: { step: 3, placement: [], placed: true, week: "2026-W42", best: [], played: 0, peak: 3 } } };
      for (const s of [90 - i * 10, 90 - i * 10, 90 - i * 10]) p = recordMatch(p, "general", s, monday).profile;
      profiles[`p${i}`] = p;
    }
    profiles.idle = { ...base(), subjects: { general: { step: 10, placement: [], placed: true, week: "2026-W40", best: [], played: 0, peak: 10 } } };
    const changed = settleWeeks(profiles, nextMonday);
    expect(changed.p0.subjects.general).toMatchObject({ step: 4, settled: "2026-W42" });
    expect(changed.p0.subjects.general!.last).toMatchObject({ zone: "promotion", rank: 1 });
    expect(changed.idle.subjects.general).toMatchObject({ step: 9 });
    expect(settleWeeks({ ...profiles, ...changed }, nextMonday)).toEqual({});
  });
});

describe("remise à zéro des rangs", () => {
  it("un profil neuf repasse par le placement, Général compris", () => {
    const p = newRankedProfile("x", monday);
    expect(p.epoch).toBe(RANK_EPOCH);
    expect(p.subjects.general).toBeUndefined();
    expect(rankRewards(p)).toEqual({ rp: 0, peakRp: 0 });
    expect(rankRewards(null)).toEqual({ rp: 0, peakRp: 0 });
  });

  it("recopie le rang Général et le meilleur rang atteint", () => {
    const p: RankedProfile = {
      ...newRankedProfile("x", monday),
      subjects: { general: { step: 4, placement: [], placed: true, week: "2026-W42", best: [], played: 0, peak: 7 } },
      seasons: { "2025-S3": { general: 9 } },
    };
    expect(rankRewards(p)).toEqual({ rp: stepMinRp(4), peakRp: stepMinRp(9) });
  });
});

describe("saisons", () => {
  it("suit les trimestres et redescend d'un palier en gardant le meilleur rang", () => {
    expect(seasonKey(new Date("2026-10-12T12:00:00Z"))).toBe("2026-S1");
    expect(seasonKey(new Date("2027-02-01T12:00:00Z"))).toBe("2026-S2");
    expect(seasonKey(new Date("2027-05-01T12:00:00Z"))).toBe("2026-S3");
    const p: RankedProfile = { ...newRankedProfile("x", monday), subjects: { general: { step: 6, placement: [], placed: true, week: "2026-W42", best: [], played: 0, peak: 6 } } };
    const next = applySeason(p, new Date("2027-01-05T12:00:00Z"));
    expect(next.season).toBe("2026-S2");
    expect(next.seasons?.["2026-S1"]?.general).toBe(p.subjects.general!.step);
    expect(next.subjects.general!.step).toBe(p.subjects.general!.step - 3);
  });
});

describe("questions classées", () => {
  it("tire 10 questions sans réponse visible côté client", () => {
    for (const s of ["general", "maths", "espagnol"] as const) {
      const qs = rankedQuestions(s, "premiere", `seed-${s}`);
      expect(qs).toHaveLength(10);
      expect(new Set(qs.map((q) => q.prompt)).size).toBe(10);
      for (const q of qs) {
        const pub = publicQuestion(q);
        expect(pub.explanation).toBe("");
        if (pub.type === "mcq") expect(pub.answer).toBe(-1);
        if (pub.type === "numeric") expect(pub.answer).toBe(0);
      }
    }
    expect(rankedQuestions("maths", "premiere", "a")).toEqual(rankedQuestions("maths", "premiere", "a"));
  });
});

describe("anti-triche", () => {
  const start = { exits: 0, lastBeat: 0 };

  it("première sortie : avertissement ; deuxième : manche perdue", () => {
    const a = applyPresence(start, "hidden", 1000);
    expect(a.outcome).toEqual({ kind: "strike", exits: 1 });
    const b = applyPresence(a.presence, "visible", 3000);
    expect(b.outcome.kind).toBe("ok");
    const c = applyPresence(b.presence, "hidden", 6000);
    expect(c.outcome.kind).toBe("lost");
  });

  it("plus de 10 s dehors fait perdre la manche", () => {
    const a = applyPresence(start, "hidden", 1000);
    expect(applyPresence(a.presence, "visible", 12_500).outcome.kind).toBe("lost");
  });

  it("des signaux interrompus valent une sortie, des signaux réguliers non", () => {
    let p = start;
    for (let t = 5000; t <= 30_000; t += 5000) {
      const r = applyPresence(p, "beat", t);
      expect(r.outcome.kind).toBe("ok");
      p = r.presence;
    }
    expect(applyPresence(p, "beat", 30_000 + 13_000).outcome.kind).toBe("lost");
  });

  it("repère les réponses impossibles à lire à temps", () => {
    const qs = Array.from({ length: 10 }, () => ({ type: "mcq" as const, prompt: "x".repeat(150) }));
    expect(suspicion(qs, Array(10).fill(true), Array(10).fill(400))).toMatch(/plus rapides/);
    expect(suspicion(qs, Array(10).fill(true), [3100, 5200, 4100, 6900, 2500, 3800, 7700, 4400, 5100, 3300])).toBeNull();
    expect(suspicion(qs, Array(10).fill(true), Array(10).fill(4000))).toMatch(/identiques/);
  });

  it("bloque les promotions d'un compte signalé 3 fois", () => {
    const now = Date.now();
    expect(underReview({ flags: [], reports: [{ by: "a", at: now }, { by: "a", at: now }, { by: "b", at: now }] }, now)).toBe(false);
    expect(underReview({ flags: [], reports: ["a", "b", "c"].map((by) => ({ by, at: now })) }, now)).toBe(true);
    expect(underReview({ flags: [1, 2, 3].map(() => ({ at: now - 20 * 86_400_000, reason: "x" })), reports: [] }, now)).toBe(false);
  });
});

describe("statut dans le groupe", () => {
  const row = (total: number, zone: WeekZone, isMe = false, played = 4) => ({ total, played, zone, isMe });
  it("indique l'avance, le retard sur la promotion ou sur le maintien", () => {
    const rows = [row(500, "promotion"), row(400, "promotion", true), row(380, "safe"), row(200, "safe"), row(100, "relegation")];
    expect(groupStatus(rows)).toEqual({ kind: "promotion", rank: 2, size: 5, lead: 20 });
    const safe = [row(500, "promotion"), row(400, "promotion"), row(380, "safe", true), row(100, "relegation")];
    expect(groupStatus(safe)).toEqual({ kind: "safe", rank: 3, size: 4, toPromotion: 21 });
    const releg = [row(500, "promotion"), row(380, "safe"), row(100, "relegation", true)];
    expect(groupStatus(releg)).toEqual({ kind: "relegation", rank: 3, size: 3, toSafety: 281 });
    expect(groupStatus([row(50, "unranked", true, 1)])).toEqual({ kind: "unranked", missing: 2 });
    expect(groupStatus([])).toEqual({ kind: "absent" });
  });
});
