import { describe, expect, it } from "vitest";
import { BOSSES, bossQuestionPool } from "./bosses";
import { CHAPTERS } from "./curriculum";
import { LABS } from "./labs";
import { questionsForChapter } from "./questions";

describe("contenu pédagogique", () => {
  it("a des identifiants de chapitre uniques", () => {
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(CHAPTERS.length);
  });

  it("n'a que des questions cohérentes", () => {
    for (const c of CHAPTERS) {
      for (const q of questionsForChapter(c.id)) {
        expect(q.prompt.length, q.id).toBeGreaterThan(5);
        expect(q.explanation.length, q.id).toBeGreaterThan(5);
        if (q.type === "mcq") {
          expect(q.choices.length, q.id).toBeGreaterThanOrEqual(2);
          expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
          expect(q.answer, q.id).toBeLessThan(q.choices.length);
          expect(new Set(q.choices).size, q.id).toBe(q.choices.length);
        }
        if (q.type === "numeric") expect(Number.isFinite(q.answer), q.id).toBe(true);
      }
    }
  });

  it("donne une réserve de questions à chaque boss", () => {
    for (const b of BOSSES) {
      const level = b.level === "all" ? "premiere" : b.level;
      expect(bossQuestionPool(b, level).length, b.id).toBeGreaterThanOrEqual(6);
    }
  });

  it("relie les chapitres à des labos existants", () => {
    const ids = new Set(LABS.map((l) => l.id));
    for (const c of CHAPTERS) if (c.lab) expect(ids.has(c.lab), c.id).toBe(true);
  });
});
