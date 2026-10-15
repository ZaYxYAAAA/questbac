/**
 * Temps de réponse adapté à chaque question : un vrai/faux de cours se joue en
 * 10 s, un calcul en plusieurs étapes peut demander 45 à 60 s.
 * Partagé par le mode classé (serveur et bots) et les boss.
 */
import type { Question } from "@/lib/types";

/** Formule avec des nombres : la question demande un calcul. */
const MATH_WITH_NUMBER = /\$[^$]*\d[^$]*\$/;
/** Outils qui rallongent un calcul : fractions, racines, puissances, trigonométrie, logarithmes, intégrales… */
const MULTI_STEP = /\\d?frac|\\sqrt|\\cos|\\sin|\\tan|\\ln|\\log|e\^|\\int|\\sum|\\binom|\^\{?\d|\\Delta|discriminant/i;

const visibleLength = (s: string) => s.replace(/\$[^$]*\$/g, "xxxxxx").replace(/[*_`#>]/g, "").length;

/** Durée (ms) laissée pour répondre à une question. */
export function questionTimeMs(q: Pick<Question, "type" | "prompt" | "difficulty" | "calc">): number {
  const computing = q.type === "numeric" || q.calc || MATH_WITH_NUMBER.test(q.prompt);
  // Simple choix sans calcul : on reconnaît la réponse, pas besoin de s'attarder.
  let s = q.type === "numeric" ? 30 : q.type === "truefalse" ? (computing ? 18 : 10) : computing ? 28 : 12;
  if (computing && MULTI_STEP.test(q.prompt)) s += 10;
  if (q.calc) s += 10;
  s += ((q.difficulty ?? 1) - 1) * (computing ? 5 : 2);
  // Énoncés longs : du temps pour lire.
  s += Math.min(12, Math.max(0, Math.round((visibleLength(q.prompt) - 90) / 15)));
  return Math.min(60, Math.max(10, s)) * 1000;
}
