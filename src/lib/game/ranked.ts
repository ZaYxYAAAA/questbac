/**
 * Mode classé : profil de rang (points de rang gagnés en parties à 3),
 * calendrier (semaines à l'heure de Paris) et utilitaires partagés client / serveur.
 */
import type { Question } from "@/lib/types";
import { weekKey } from "./progression";
import { shuffle } from "./quests";

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
  /** Nombre de joueurs de la partie (3 si absent : anciennes parties). */
  size?: number;
  /** Mode spécial joué (absent : classique). */
  mode?: string;
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
  /** Derniers thèmes proposés au vote (du plus ancien au plus récent). */
  offered?: string[];
}

/** Nombre de thèmes proposés récemment dont on se souvient, par joueur. */
export const OFFERED_KEPT = 24;

/**
 * Deux thèmes à proposer au vote : tirés au hasard parmi ceux que les joueurs
 * n'ont pas vus proposés récemment ; s'il n'en reste pas assez, les plus anciens.
 */
export function chooseChapters(pool: readonly string[], recent: readonly string[], rand: () => number = Math.random): [string, string] {
  if (pool.length === 0) throw new Error("Aucun thème disponible");
  // Ancienneté : -1 = jamais proposé, sinon position (0 = le plus ancien).
  const age = (id: string) => recent.lastIndexOf(id);
  const shuffled = shuffle(pool, rand);
  const ordered = [...shuffled].sort((x, y) => age(x) - age(y));
  const fresh = ordered.filter((id) => age(id) === -1);
  const picks = fresh.length >= 2 ? shuffle(fresh, rand).slice(0, 2) : ordered.slice(0, 2);
  return [picks[0], picks[1] ?? picks[0]];
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

/** 3 parties d'affilée au plus dans la même matière… */
export const MAX_IN_A_ROW = 3;
/** …ensuite elle se repose : 1 partie dans une autre matière, ou 15 minutes, suffisent. */
export const REST_MS = 15 * 60_000;
/** Jauge de variété : −10 % de points gagnés par partie identique d'affilée (−30 % au plus)… */
export const ROUTINE_MALUS = 0.1;
export const ROUTINE_MAX = 3;
/** …et +15 % quand on change vraiment (différent de ses 2 dernières parties). */
export const VARIETY_BONUS = 0.15;
/** Bonus de points de rang gagnés dans la matière du jour. */
export const DAILY_SUBJECT_BONUS = 0.25;

/**
 * Heure (ms) jusqu'à laquelle la matière se repose, 0 si elle est jouable.
 * Elle se repose après 3 parties d'affilée dedans ; une partie ailleurs la libère
 * aussitôt. `history` va de la plus récente à la plus ancienne.
 */
export function subjectRestUntil(history: readonly Pick<MatchHistory, "subject" | "at">[], subject: string, now = Date.now()): number {
  const last = history.slice(0, MAX_IN_A_ROW);
  if (last.length < MAX_IN_A_ROW || last.some((h) => h.subject !== subject)) return 0;
  const until = (last[0].at ?? 0) + REST_MS;
  return until > now ? until : 0;
}

/** Ce qui fait qu'une partie est « la même » : matière, nombre de joueurs et mode (classique ou mode du jour). */
export interface PlayConfig {
  subject: string;
  size: number;
  mode: string;
}

export const sameConfig = (h: Pick<MatchHistory, "subject" | "size" | "mode">, c: PlayConfig) =>
  h.subject === c.subject && (h.size ?? 3) === c.size && (h.mode ?? "classique") === c.mode;

/**
 * Bonus (ou malus) de variété sur les points gagnés pour la prochaine partie :
 * −10 % par partie identique d'affilée juste avant (jusqu'à −30 %), +15 % si
 * elle ne ressemble à aucune des 2 dernières, 0 sinon.
 */
export function varietyBonus(history: readonly Pick<MatchHistory, "subject" | "size" | "mode">[], c: PlayConfig): number {
  let streak = 0;
  for (const h of history) {
    if (!sameConfig(h, c)) break;
    streak++;
  }
  if (streak > 0) return -ROUTINE_MALUS * Math.min(streak, ROUTINE_MAX);
  return history.length >= 2 && !history.slice(0, 2).some((h) => sameConfig(h, c)) ? VARIETY_BONUS : 0;
}

/** Matière du jour (heure de Paris), parmi celles du niveau : +25 % de points de rang gagnés. */
export function subjectOfDay(subjects: readonly string[], now = new Date()): string {
  const d = parisDate(now);
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return subjects[h % subjects.length];
}
