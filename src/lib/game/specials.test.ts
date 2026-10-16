import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/types";
import { type Match, botVotes, limitMs, pointsFor, questionMs } from "./match";
import { MIX_CHAPTER, SPECIALS, specialOfDay, specialOfTomorrow } from "./specials";

const qs = Array.from({ length: 10 }, (_, i) => ({ id: `q${i}`, type: "mcq", prompt: `Question ${i} assez longue pour un temps normal ?`, choices: ["a", "b", "c", "d"], answer: 0, explanation: "" }) as Question);

describe("mode du jour", () => {
  it("change chaque jour, jamais deux jours de suite le même", () => {
    for (let d = 0; d < 30; d++) {
      const day = new Date(Date.UTC(2026, 9, 1 + d, 12));
      expect(SPECIALS[specialOfDay(day)]).toBeDefined();
      expect(specialOfTomorrow(day)).not.toBe(specialOfDay(day));
      expect(specialOfTomorrow(day)).toBe(specialOfDay(new Date(day.getTime() + 86_400_000)));
    }
  });

  it("Éclair : moitié moins de temps (6 s au moins)", () => {
    const m = { questions: qs, special: "eclair" } as Pick<Match, "questions" | "special">;
    expect(limitMs(m, 0)).toBeLessThan(questionMs(qs[0]));
    expect(limitMs(m, 0)).toBeGreaterThanOrEqual(6000);
    expect(limitMs({ questions: qs }, 0)).toBe(questionMs(qs[0]));
  });

  it("Grande finale : les 3 dernières comptent double ; Sans filet : −1 par erreur (pas sans réponse)", () => {
    const ok = { correct: true, ms: 3000 };
    const ko = { correct: false, ms: 3000 };
    const none = { correct: false, ms: null };
    expect(pointsFor({ questions: qs, special: "finale" }, 6, ok)).toBe(1);
    expect(pointsFor({ questions: qs, special: "finale" }, 7, ok)).toBe(2);
    expect(pointsFor({ questions: qs, special: "sansfilet" }, 2, ko)).toBe(-1);
    expect(pointsFor({ questions: qs, special: "sansfilet" }, 2, none)).toBe(0);
    expect(pointsFor({ questions: qs }, 2, ko)).toBe(0);
  });

  it("Mélange : pas de vote", () => {
    const m = { id: "x", createdAt: 100, chapters: [MIX_CHAPTER, MIX_CHAPTER], players: [{ id: "a", bot: false }, { id: "b", bot: true }] } as unknown as Match;
    const v = botVotes(m);
    expect(Object.keys(v)).toEqual(["a", "b"]);
    expect(v.b.at).toBe(100);
  });
});
