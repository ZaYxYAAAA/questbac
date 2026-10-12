import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/types";
import { isCorrect, parseNumericAnswer, prepareQuestions } from "./session";
import { seededRandom } from "./quests";

describe("session", () => {
  it("mélange les choix sans perdre la bonne réponse", () => {
    const q: Question = { id: "q", type: "mcq", prompt: "?", choices: ["a", "b", "c", "d"], answer: 2, explanation: "" };
    for (let seed = 1; seed < 30; seed++) {
      const [p] = prepareQuestions([q], 1, seededRandom(seed));
      if (p.type !== "mcq") throw new Error();
      expect(p.choices[p.answer]).toBe("c");
    }
  });

  it("lit les réponses numériques", () => {
    expect(parseNumericAnswer("3,5")).toBe(3.5);
    expect(parseNumericAnswer("7/2")).toBe(3.5);
    expect(parseNumericAnswer("20 g/L")).toBe(20);
    expect(parseNumericAnswer("12,5 %")).toBe(12.5);
    expect(parseNumericAnswer("abc")).toBeNull();
  });

  it("valide selon la tolérance", () => {
    const q: Question = { id: "n", type: "numeric", prompt: "?", answer: 3.5, tolerance: 0.01, explanation: "" };
    expect(isCorrect(q, "3,5")).toBe(true);
    expect(isCorrect(q, "3.51")).toBe(true);
    expect(isCorrect(q, "3.6")).toBe(false);
  });
});
