import { describe, expect, it } from "vitest";
import { RANK_TIERS, rankFromRp } from "./progression";
import { RANK_STEPS, activeTierReward, formatShare, promotionBetween, stepIndex, tierPopulation, unlockedTiers } from "./ranks";

describe("échelle des rangs", () => {
  it("couvre toutes les divisions de Bronze III à Légende, sans trou", () => {
    expect(RANK_STEPS).toHaveLength(18);
    expect(RANK_STEPS[0].label).toBe("Bronze III");
    expect(RANK_STEPS.at(-1)!.label).toBe("Légende");
    expect(RANK_STEPS.at(-1)!.maxRp).toBeNull();
    for (let i = 1; i < RANK_STEPS.length; i++) expect(RANK_STEPS[i].minRp).toBe(RANK_STEPS[i - 1].maxRp);
  });

  it("chaque seuil correspond au rang calculé par rankFromRp", () => {
    for (const s of RANK_STEPS) {
      expect(rankFromRp(s.minRp).label).toBe(s.label);
      if (s.minRp > 0) expect(rankFromRp(s.minRp - 1).label).not.toBe(s.label);
    }
    expect(stepIndex(0)).toBe(0);
    expect(stepIndex(9000)).toBe(17);
  });

  it("répartit les joueurs à 100 % et les vrais joueurs s'ajoutent", () => {
    const now = new Date(2026, 9, 12);
    const pop = tierPopulation(now);
    expect(pop.reduce((n, p) => n + p.share, 0)).toBeCloseTo(100, 5);
    expect(pop[0].players).toBeGreaterThan(pop.at(-1)!.players);
    expect(tierPopulation(now, { legende: 2 }).at(-1)!.players).toBe(pop.at(-1)!.players + 2);
    expect(formatShare(0.42)).toBe("0,4 %");
    expect(formatShare(31.4)).toBe("31 %");
  });
});

describe("titres et cadres", () => {
  it("se débloquent selon le meilleur RP atteint", () => {
    expect(unlockedTiers(0)).toEqual(["bronze"]);
    expect(unlockedTiers(900)).toEqual(["bronze", "argent", "or"]);
    expect(unlockedTiers(9000)).toHaveLength(RANK_TIERS.length);
  });

  it("le titre choisi n'est actif que s'il est débloqué", () => {
    expect(activeTierReward(undefined, 900).title).toBe("Virtuose");
    expect(activeTierReward("bronze", 900).title).toBe("Recrue");
    expect(activeTierReward("legende", 900).title).toBe("Virtuose");
  });
});

describe("promotions", () => {
  it("fête une nouvelle division ou un nouveau palier, pas un retour", () => {
    expect(promotionBetween(0, 50)).toBeNull();
    expect(promotionBetween(90, 120)).toMatchObject({ step: { label: "Bronze II" }, newTier: false });
    expect(promotionBetween(290, 310)).toMatchObject({ step: { label: "Argent III" }, newTier: true });
    // Déjà atteint auparavant (meilleur RP) : pas de nouvelle fête.
    expect(promotionBetween(400, 310)).toBeNull();
  });
});
