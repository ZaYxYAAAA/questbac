/**
 * Duels entre amis (asynchrones) : mêmes questions, même ordre, chacun joue
 * quand il veut. Le serveur note les réponses lui-même avec ces fonctions.
 */
import { CHAPTERS } from "@/lib/content/curriculum";
import { questionsForChapter } from "@/lib/content/questions";
import type { Level, Question } from "@/lib/types";
import { hashString, seededRandom } from "./quests";
import { isCorrect, prepareQuestions } from "./session";

/** Nombre de questions d'un duel : 6 au plus, 4 au moins (selon la banque du chapitre). */
export const DUEL_SIZE = 6;
export const DUEL_MIN_SIZE = 4;
export const DUEL_TTL_MS = 72 * 3_600_000;
/** Temps maximal compté par question (évite les durées absurdes). */
const MAX_QUESTION_MS = 5 * 60_000;
/** En dessous de cet écart de temps total, l'égalité de score reste une égalité. */
const TIE_MARGIN_MS = 500;

export type DuelOutcome = "win" | "loss" | "draw";

export const DUEL_REWARDS: Record<DuelOutcome, { xp: number; rp: number; label: string }> = {
  win: { xp: 120, rp: 25, label: "Duel gagné" },
  draw: { xp: 60, rp: 10, label: "Duel à égalité" },
  loss: { xp: 30, rp: 0, label: "Duel perdu (consolation)" },
};

export interface DuelPlay {
  correct: number;
  timeMs: number;
  /** Bonne ou mauvaise réponse, question par question. */
  results: boolean[];
  playedAt: number;
}

/** Chapitres jouables en duel (assez de questions dans la banque locale). */
export function duelChapters(level?: Level) {
  return CHAPTERS.filter((c) => (!level || c.level === level) && questionsForChapter(c.id).length >= DUEL_MIN_SIZE);
}

/** Questions figées d'un duel : tirage et ordre des choix dépendent de l'identifiant du duel. */
export function duelQuestions(chapterId: string, duelId: string): Question[] {
  return prepareQuestions(questionsForChapter(chapterId), DUEL_SIZE, seededRandom(hashString(`duel:${duelId}`)));
}

/** Note les réponses envoyées ; null si le format ne correspond pas au duel. */
export function gradeDuel(questions: Question[], given: unknown[], times: unknown[], now = Date.now()): DuelPlay | null {
  if (given.length !== questions.length || times.length !== questions.length) return null;
  const results: boolean[] = [];
  let timeMs = 0;
  for (let i = 0; i < questions.length; i++) {
    const g = given[i];
    const t = times[i];
    if (typeof t !== "number" || !Number.isFinite(t) || t < 0) return null;
    timeMs += Math.min(t, MAX_QUESTION_MS);
    const ok = (typeof g === "number" || typeof g === "boolean" || typeof g === "string") && String(g).length <= 100 && isCorrect(questions[i], g);
    results.push(ok);
  }
  return { correct: results.filter(Boolean).length, timeMs: Math.round(timeMs), results, playedAt: now };
}

/** Résultat du point de vue de `mine` : plus de bonnes réponses, puis le plus rapide. */
export function duelOutcome(mine: DuelPlay, theirs: DuelPlay): DuelOutcome {
  if (mine.correct !== theirs.correct) return mine.correct > theirs.correct ? "win" : "loss";
  const diff = mine.timeMs - theirs.timeMs;
  if (Math.abs(diff) < TIE_MARGIN_MS) return "draw";
  return diff < 0 ? "win" : "loss";
}

export type DuelStatus = "your_turn" | "waiting" | "done" | "expired";

/**
 * État d'un duel pour un joueur. Expiré avec un seul joueur ayant joué :
 * celui-ci gagne par forfait, l'autre n'obtient rien.
 */
export function duelState(
  mine: DuelPlay | null,
  theirs: DuelPlay | null,
  expiresAt: number,
  now = Date.now(),
): { status: DuelStatus; outcome: DuelOutcome | null } {
  if (mine && theirs) return { status: "done", outcome: duelOutcome(mine, theirs) };
  if (now > expiresAt) return { status: "expired", outcome: mine ? "win" : null };
  return { status: mine ? "waiting" : "your_turn", outcome: null };
}
