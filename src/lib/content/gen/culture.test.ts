import { describe, expect, it } from "vitest";
import { CHAPTERS } from "@/lib/content/curriculum";
import { chapterQuestions, factKey, mixedTierQuestions, tierMix, tierQuestions } from "@/lib/content/generated";
import { seededRandom } from "@/lib/game/quests";
import { CULTURE_FACTS, CULTURE_TIERS, TIERS, de } from "./culture";

const themes = CHAPTERS.filter((c) => c.subject === "culture").map((c) => c.id);

describe("culture générale à 3 niveaux", () => {
  it("chaque thème a ses 3 niveaux, assez fournis pour une mission de 10 questions", () => {
    expect(themes.length).toBeGreaterThanOrEqual(16);
    for (const id of themes) {
      for (const t of TIERS) expect(CULTURE_FACTS[id][t], `${id} niveau ${t}`).toBeGreaterThanOrEqual(10);
    }
    const total = Object.values(CULTURE_FACTS).reduce((n, f) => n + f[1] + f[2] + f[3], 0);
    expect(total).toBeGreaterThan(1000);
  });
  it("une mission de niveau donne 10 questions distinctes de ce niveau", () => {
    for (const id of themes) {
      for (const t of TIERS) {
        const qs = tierQuestions(id, t, 10, seededRandom(t * 97 + id.length));
        expect(qs.length, `${id} niveau ${t}`).toBe(10);
        expect(new Set(qs.map(factKey)).size).toBe(10);
        expect(qs.every((q) => q.difficulty === t)).toBe(true);
      }
    }
  });
  it("le classé mélange les niveaux, avec une majorité d'Intermédiaire", () => {
    for (let s = 0; s < 20; s++) {
      const m = tierMix(10, seededRandom(s));
      expect(m[1] + m[2] + m[3]).toBe(10);
      expect(m[2]).toBe(5);
      expect(m[1]).toBeGreaterThanOrEqual(2);
      expect(m[3]).toBeGreaterThanOrEqual(2);
    }
    for (const id of themes) {
      const qs = chapterQuestions(id, 10, seededRandom(id.length));
      expect(qs.length).toBe(10);
      expect(new Set(qs.map(factKey)).size).toBe(10);
      const byTier = [1, 2, 3].map((t) => qs.filter((q) => q.difficulty === t).length);
      expect(byTier[1]).toBe(5);
      expect(byTier[0] + byTier[2]).toBe(5);
    }
  });
  it("l'ordre des niveaux est aléatoire et reproductible avec la même graine", () => {
    const a = mixedTierQuestions("cg-histoire", 10, seededRandom(42)).map((q) => q.difficulty);
    const b = mixedTierQuestions("cg-histoire", 10, seededRandom(42)).map((q) => q.difficulty);
    expect(a).toEqual(b);
    const orders = new Set(Array.from({ length: 8 }, (_, s) => mixedTierQuestions("cg-histoire", 10, seededRandom(s + 1)).map((q) => q.difficulty).join("")));
    expect(orders.size).toBeGreaterThan(1);
    // Pas rangé du plus facile au plus dur.
    expect([...orders].some((o) => o !== [...o].sort().join(""))).toBe(true);
  });
  it("« de » est contracté ou élidé comme en français", () => {
    expect(de("le Japon")).toBe("du Japon");
    expect(de("les États-Unis")).toBe("des États-Unis");
    expect(de("la France")).toBe("de la France");
    expect(de("l'Inde")).toBe("de l'Inde");
    expect(de("Cuba")).toBe("de Cuba");
    expect(de("Oman")).toBe("d'Oman");
    expect(de("Israël")).toBe("d'Israël");
    expect(de("Haïti")).toBe("d'Haïti");
    expect(de("Uranus")).toBe("d'Uranus");
    expect(de("les Beatles")).toBe("des Beatles");
  });
  it("pas de « de » non élidé devant un nom propre à voyelle", () => {
    for (const id of Object.keys(CULTURE_TIERS)) {
      for (const t of TIERS) {
        for (const q of tierQuestions(id, t, 30, seededRandom(11))) {
          const texts = [q.prompt, q.explanation ?? "", ...(q.type === "mcq" ? q.choices : [])];
          for (const text of texts) expect(text, `${id} : ${text}`).not.toMatch(/(?<!\p{L})de [AEIOUÉÈÎ]|(?<!\p{L})de The /u);
        }
      }
    }
  });
  it("aucun énoncé vide et des leurres tous différents de la réponse", () => {
    for (const id of Object.keys(CULTURE_TIERS)) {
      for (const t of TIERS) {
        for (const q of tierQuestions(id, t, 30, seededRandom(7))) {
          expect(q.prompt.trim().length).toBeGreaterThan(3);
          if (q.type === "mcq") {
            expect(new Set(q.choices).size, `${id} : ${q.prompt}`).toBe(q.choices.length);
            expect(q.choices.length).toBe(4);
          }
        }
      }
    }
  });
});
