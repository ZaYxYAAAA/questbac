import { describe, expect, it } from "vitest";
import { isCorrect } from "@/lib/game/session";
import { seededRandom } from "@/lib/game/quests";
import { CHAPTERS } from "./curriculum";
import { CHAPTER_GENERATORS, chapterQuestions, factKey, generatorsForTopic } from "./generated";

const BAD = /NaN|undefined|Infinity|\[object/;

describe("questions générées", () => {
  it("couvrent chaque chapitre du programme", () => {
    for (const c of CHAPTERS) expect(CHAPTER_GENERATORS[c.id]?.length ?? 0, c.id).toBeGreaterThanOrEqual(4);
  });

  it("sont bien formées sur de nombreux tirages", () => {
    for (const [id, gens] of Object.entries(CHAPTER_GENERATORS)) {
      const r = seededRandom(42);
      gens.forEach((g, gi) => {
        for (let i = 0; i < 80; i++) {
          const q = g(r);
          const where = `${id}#${gi}: ${q.prompt}`;
          expect(q.prompt, where).not.toMatch(BAD);
          expect(q.explanation, where).not.toMatch(BAD);
          expect(q.prompt.length, where).toBeGreaterThan(5);
          if (q.type === "mcq") {
            expect(q.choices.length, where).toBeGreaterThanOrEqual(3);
            expect(new Set(q.choices).size, `${where} → ${q.choices.join(" | ")}`).toBe(q.choices.length);
            expect(q.answer, where).toBeGreaterThanOrEqual(0);
            for (const c of q.choices) expect(c, where).not.toMatch(BAD);
          }
          if (q.type === "numeric") {
            expect(Number.isFinite(q.answer), where).toBe(true);
            expect(isCorrect({ ...q, id: "x" }, String(q.answer).replace(".", ",")), where).toBe(true);
          }
        }
      });
    }
  }, 60_000);

  it("ne reposent pas une information (même sous une autre forme) avant d'avoir épuisé le chapitre", () => {
    const short: string[] = [];
    for (const id of Object.keys(CHAPTER_GENERATORS)) {
      const seen: string[] = [];
      const r = seededRandom(7);
      // 4 missions de 8 questions d'affilée : 32 informations toutes différentes.
      for (let m = 0; m < 4; m++) for (const q of chapterQuestions(id, 8, r, seen)) seen.push(factKey(q));
      if (new Set(seen).size < 32) short.push(`${id} (${new Set(seen).size})`);
    }
    expect(short).toEqual([]);
  });

  it("ne posent jamais deux fois la même information dans une mission", () => {
    for (const id of Object.keys(CHAPTER_GENERATORS)) {
      const qs = chapterQuestions(id, 10, seededRandom(11));
      expect(new Set(qs.map(factKey)).size, id).toBe(qs.length);
    }
  });

  it("trouvent des générateurs pour un sujet libre", () => {
    expect(generatorsForTopic("maths", "premiere", "les suites géométriques").generators.length).toBeGreaterThan(0);
    expect(generatorsForTopic("maths", "seconde", "zzz").generators.length).toBeGreaterThan(0);
  });
});
