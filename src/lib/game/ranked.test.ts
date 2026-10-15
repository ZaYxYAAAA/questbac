import { describe, expect, it } from "vitest";
import { OFFERED_KEPT, chooseChapters } from "./ranked";
import { seededRandom } from "./quests";

describe("thèmes proposés au vote", () => {
  const pool = Array.from({ length: 10 }, (_, i) => `ch-${i}`);
  it("ne repropose pas les thèmes vus récemment tant qu'il en reste d'autres", () => {
    const recent = pool.slice(0, 8);
    for (let s = 0; s < 30; s++) {
      const pick = chooseChapters(pool, recent, seededRandom(s));
      expect(pick.sort()).toEqual(["ch-8", "ch-9"]);
    }
  });
  it("tourne sur tous les thèmes au fil des parties", () => {
    let recent: string[] = [];
    const counts = new Map<string, number>();
    for (let g = 0; g < 50; g++) {
      const pick = chooseChapters(pool, recent, seededRandom(g + 1));
      expect(pick[0]).not.toBe(pick[1]);
      for (const c of pick) counts.set(c, (counts.get(c) ?? 0) + 1);
      recent = [...recent.filter((c) => !pick.includes(c)), ...pick].slice(-OFFERED_KEPT);
    }
    // 100 propositions sur 10 thèmes : chacun revient environ 10 fois, aucun n'est oublié ni sur-représenté.
    for (const c of pool) {
      expect(counts.get(c)).toBeGreaterThanOrEqual(8);
      expect(counts.get(c)).toBeLessThanOrEqual(12);
    }
  });
  it("si tout a été vu, propose les plus anciens", () => {
    expect(chooseChapters(["a", "b", "c"], ["c", "a", "b"], seededRandom(1)).sort()).toEqual(["a", "c"]);
  });
});
