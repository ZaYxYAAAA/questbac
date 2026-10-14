/**
 * Mode classé : profil de rang (points de rang gagnés en parties à 3),
 * calendrier (semaines à l'heure de Paris) et utilitaires partagés client / serveur.
 */
import type { Question } from "@/lib/types";
import { weekKey } from "./progression";

/**
 * Époque des rangs : l'augmenter remet tous les rangs à zéro (l'XP reste).
 * 3 : nouveau classé en parties à 3 joueurs.
 */
export const RANK_EPOCH = 3;

export interface MatchHistory {
  at: number;
  subject: string;
  place: number;
  correct: number;
  delta: number;
}

export interface RankProfile {
  pseudo: string;
  rp: number;
  peak: number;
  games: number;
  wins: number;
  /** Semaine en cours et points de rang gagnés ou perdus depuis lundi. */
  week: string;
  weekDelta: number;
  weekGames: number;
  history: MatchHistory[];
  /** Partie en cours. */
  active?: string;
  /** Empreintes des dernières informations posées (pas de répétition d'une partie à l'autre). */
  seen?: string[];
}

export function newRankProfile(pseudo: string, week: string): RankProfile {
  return { pseudo, rp: 0, peak: 0, games: 0, wins: 0, week, weekDelta: 0, weekGames: 0, history: [] };
}

/** Profil avec la semaine remise à zéro si on a changé de semaine. */
export function currentWeek(p: RankProfile, week: string): RankProfile {
  return p.week === week ? p : { ...p, week, weekDelta: 0, weekGames: 0 };
}

/** Résultat d'une partie appliqué au profil (les points de rang ne descendent pas sous 0). */
export function applyResult(p: RankProfile, r: Omit<MatchHistory, "delta"> & { delta: number }, week: string): RankProfile {
  const cur = currentWeek(p, week);
  const rp = Math.max(0, cur.rp + r.delta);
  return {
    ...cur,
    rp,
    peak: Math.max(cur.peak, rp),
    games: cur.games + 1,
    wins: cur.wins + (r.place === 1 ? 1 : 0),
    weekDelta: cur.weekDelta + (rp - cur.rp),
    weekGames: cur.weekGames + 1,
    history: [{ ...r, delta: rp - cur.rp }, ...cur.history].slice(0, 15),
    active: undefined,
  };
}

// ─────────────────────────── Calendrier ───────────────────────────

/** Date dont les champs « locaux » sont l'heure de Paris (les semaines suivent l'heure française). */
export function parisDate(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

export const rankedWeek = (now = new Date()) => weekKey(parisDate(now));

// ─────────────────────────── Questions ───────────────────────────

/** Question telle que le client la reçoit avant d'avoir répondu : sans réponse ni explication. */
export function publicQuestion(q: Question): Question {
  if (q.type === "mcq") return { ...q, answer: -1, explanation: "" };
  if (q.type === "truefalse") return { ...q, answer: false, explanation: "" };
  return { id: q.id, type: "numeric", prompt: q.prompt, unit: q.unit, difficulty: q.difficulty, answer: 0, explanation: "", ...(q.calc ? { calc: true } : {}) };
}

// ─────────────────────────── Variété des matières ───────────────────────────

/** Sur les 10 dernières parties, 3 au plus dans la même matière. */
export const DIVERSITY_WINDOW = 10;
export const MAX_SAME_SUBJECT = 3;
/** Bonus de points de rang gagnés dans la matière du jour. */
export const DAILY_SUBJECT_BONUS = 0.25;

/**
 * Parties à jouer dans d'autres matières avant de pouvoir rejouer celle-ci
 * (0 : jouable tout de suite). `history` va de la plus récente à la plus ancienne.
 */
export function subjectLock(history: readonly Pick<MatchHistory, "subject">[], subject: string): number {
  const recent = history.slice(0, DIVERSITY_WINDOW - 1);
  const hits = recent.flatMap((h, i) => (h.subject === subject ? [i] : []));
  if (hits.length < MAX_SAME_SUBJECT) return 0;
  return DIVERSITY_WINDOW - 1 - hits[MAX_SAME_SUBJECT - 1];
}

/** Matière du jour (heure de Paris), parmi celles du niveau : +25 % de points de rang gagnés. */
export function subjectOfDay(subjects: readonly string[], now = new Date()): string {
  const d = parisDate(now);
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return subjects[h % subjects.length];
}
