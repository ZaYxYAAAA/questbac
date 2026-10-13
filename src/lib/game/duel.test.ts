import { describe, expect, it } from "vitest";
import { DUEL_SECONDS, DUEL_SIZE, DUEL_THEMES, duelOutcome, duelQuestions, duelState, gradeDuel } from "./duel";
import { isCorrect } from "./session";

const play = (correct: number, timeMs: number) => ({ correct, timeMs, results: [], playedAt: 0 });

describe("duels", () => {
  it("génèrent 10 questions variées, identiques pour un même duel", () => {
    for (const t of DUEL_THEMES) {
      const a = duelQuestions(t.id, "abc")!;
      expect(a).toHaveLength(DUEL_SIZE);
      expect(new Set(a.map((q) => q.prompt)).size).toBe(DUEL_SIZE);
      expect(duelQuestions(t.id, "abc")).toEqual(a);
      expect(duelQuestions(t.id, "xyz")!.map((q) => q.prompt)).not.toEqual(a.map((q) => q.prompt));
    }
    expect(duelQuestions("inconnu", "abc")).toBeNull();
  });

  it("ne produisent que des questions bien formées", () => {
    for (const t of DUEL_THEMES) {
      for (let i = 0; i < 60; i++) {
        for (const q of duelQuestions(t.id, `seed-${i}`)!) {
          expect(q.prompt).not.toMatch(/NaN|undefined|Infinity/);
          if (q.type === "mcq") {
            expect(q.choices.length, q.prompt).toBeGreaterThanOrEqual(3);
            expect(new Set(q.choices).size).toBe(q.choices.length);
            expect(q.choices[q.answer]).toBeDefined();
            for (const c of q.choices) expect(c).not.toMatch(/NaN|undefined|Infinity/);
          }
          if (q.type === "numeric") {
            expect(Number.isFinite(q.answer)).toBe(true);
            expect(isCorrect(q, String(q.answer).replace(".", ","))).toBe(true);
          }
        }
      }
    }
  });

  it("notent les réponses côté serveur", () => {
    const qs = duelQuestions("grand-melange", "x")!;
    const right = qs.map((q) => (q.type === "numeric" ? String(q.answer) : q.answer));
    const full = gradeDuel(qs, right, qs.map(() => 1000), 5)!;
    expect(full.correct).toBe(qs.length);
    expect(full.timeMs).toBe(qs.length * 1000);
    const wrong = qs.map((q) => (q.type === "mcq" ? (q.answer + 1) % q.choices.length : q.type === "truefalse" ? !q.answer : "999999"));
    expect(gradeDuel(qs, wrong, qs.map(() => 1000))!.correct).toBe(0);
    expect(gradeDuel(qs, right.slice(1), qs.map(() => 1000))).toBeNull();
    expect(gradeDuel(qs, right, qs.map(() => -1))).toBeNull();
    // Durée plafonnée par question
    expect(gradeDuel(qs, right, qs.map(() => 1e9))!.timeMs).toBe(qs.length * DUEL_SECONDS * 1000);
  });

  it("départagent au score puis au temps", () => {
    expect(duelOutcome(play(5, 9000), play(4, 1000))).toBe("win");
    expect(duelOutcome(play(3, 1000), play(4, 9000))).toBe("loss");
    expect(duelOutcome(play(4, 5000), play(4, 8000))).toBe("win");
    expect(duelOutcome(play(4, 5000), play(4, 5200))).toBe("draw");
  });

  it("gèrent les tours et l'expiration", () => {
    expect(duelState(null, null, 100, 50)).toEqual({ status: "your_turn", outcome: null });
    expect(duelState(play(3, 1), null, 100, 50)).toEqual({ status: "waiting", outcome: null });
    expect(duelState(play(3, 1), null, 100, 200)).toEqual({ status: "expired", outcome: "win" });
    expect(duelState(null, play(3, 1), 100, 200)).toEqual({ status: "expired", outcome: null });
    expect(duelState(play(3, 1), play(2, 1), 100, 200).status).toBe("done");
  });
});
