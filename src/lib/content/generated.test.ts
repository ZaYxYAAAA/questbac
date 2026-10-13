import { describe, expect, it } from "vitest";
import { isCorrect } from "@/lib/game/session";
import { seededRandom } from "@/lib/game/quests";
import { CHAPTERS } from "./curriculum";
import { CHAPTER_GENERATORS, chapterQuestions, generatorsForTopic, questionKey } from "./generated";

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
            expect(isCorrect({ ...q, id: "x" }, String(Math.round(q.answer * 1000) / 1000).replace(".", ",")), where).toBe(true);
          }
        }
      });
    }
  });

  it("ne répètent pas une question sur 100 tirages d'un chapitre", () => {
    for (const id of Object.keys(CHAPTER_GENERATORS)) {
      const seen = new Set<string>();
      const r = seededRandom(7);
      // 10 missions de 10 questions, en évitant ce qui a déjà été vu.
      for (let m = 0; m < 10; m++) for (const q of chapterQuestions(id, 10, r, seen)) seen.add(questionKey(q));
      expect(seen.size, id).toBeGreaterThanOrEqual(100);
    }
  });

  it("trouvent des générateurs pour un sujet libre", () => {
    expect(generatorsForTopic("maths", "premiere", "les suites géométriques").generators.length).toBeGreaterThan(0);
    expect(generatorsForTopic("maths", "seconde", "zzz").generators.length).toBeGreaterThan(0);
  });
});
