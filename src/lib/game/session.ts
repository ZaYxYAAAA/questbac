import type { Question } from "@/lib/types";
import { compile } from "@/lib/math/parser";
import { shuffle } from "./quests";

/** Tire `count` questions au hasard et mélange les choix des QCM. */
export function prepareQuestions(questions: Question[], count = questions.length, rand: () => number = Math.random): Question[] {
  return shuffle(questions, rand)
    .slice(0, count)
    .map((q) => {
      if (q.type !== "mcq") return q;
      const order = shuffle(q.choices.map((_, i) => i), rand);
      return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
    });
}

export type GivenAnswer = number | boolean | string;

/** Lit une réponse numérique : « 3,5 », « 7/2 », « sqrt(2) », « 1e3 »… */
export function parseNumericAnswer(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "");
  // On tente l'expression brute, puis sans l'unité finale éventuelle (« 20g/L », « 12,5 % »).
  for (const candidate of [s, s.replace(/[a-zA-Z%°€$/·²³]+$/, "")]) {
    if (!candidate) continue;
    try {
      const expr = compile(candidate);
      if (expr.variables.length > 0) continue;
      const v = expr.evaluate({});
      if (Number.isFinite(v)) return v;
    } catch {
      // essai suivant
    }
  }
  return null;
}

export function isCorrect(q: Question, given: GivenAnswer): boolean {
  switch (q.type) {
    case "mcq":
      return given === q.answer;
    case "truefalse":
      return given === q.answer;
    case "numeric": {
      const v = typeof given === "number" ? given : parseNumericAnswer(String(given));
      if (v === null) return false;
      const tol = Math.max(q.tolerance ?? 0.01, Math.abs(q.answer) * 1e-6);
      return Math.abs(v - q.answer) <= tol + 1e-12;
    }
  }
}
