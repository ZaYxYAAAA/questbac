import { hashString, seededRandom, shuffle } from "@/lib/game/quests";
import { MATCH_SIZE, type RankedSubject } from "@/lib/game/ranked";
import type { Level, Question } from "@/lib/types";
import { subjectsForLevel } from "./curriculum";
import { mixQuestions } from "./generated";

/**
 * Questions d'une manche classée, tirées par le serveur : chapitres du niveau
 * pour une matière, ou un mélange de toutes les matières du niveau (Général).
 */
export function rankedQuestions(subject: RankedSubject, level: Level, seed: string, avoid?: ReadonlySet<string>): Question[] {
  const r = seededRandom(hashString(`ranked:${seed}`));
  if (subject !== "general") return mixQuestions(subject, level, MATCH_SIZE, r, avoid).map((q, i) => ({ ...q, id: `rk-${i}` }));
  const subjects = shuffle(subjectsForLevel(level).map((s) => s.id), r);
  const out: Question[] = [];
  for (let i = 0; out.length < MATCH_SIZE && i < MATCH_SIZE * 3; i++) {
    const [q] = mixQuestions(subjects[i % subjects.length], level, 1, r, avoid);
    if (q && !out.some((o) => o.prompt === q.prompt)) out.push(q);
  }
  return out.map((q, i) => ({ ...q, id: `rk-${i}` }));
}
