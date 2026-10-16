/**
 * Partie classée à 3, 5 ou 7 joueurs : vote du chapitre, 10 questions jouées en même
 * temps, classement (bonnes réponses d'abord, puis temps total) et points de rang.
 *
 * Tout est pur et piloté par l'heure : `tick` fait avancer la partie d'après
 * les réponses reçues et l'heure courante. Les bots ont un « plan » tiré à
 * l'avance (bonne réponse ou non, temps de réponse) qui se dévoile avec le temps.
 */
import type { Level, Question, SubjectId } from "@/lib/types";
import { RANK_TIERS, rankFromRp } from "./progression";
import { hashString, seededRandom } from "./quests";
import { questionTimeMs } from "./timing";

export const MATCH_QUESTIONS = 10;
export const MATCH_PLAYERS = 3;
/** Formats de partie : toujours un nombre impair de joueurs (une place du milieu, autant de gagnants que de perdants). */
export const MATCH_SIZES = [3, 5, 7] as const;
export type MatchSize = (typeof MATCH_SIZES)[number];
export const isMatchSize = (n: unknown): n is MatchSize => MATCH_SIZES.includes(n as MatchSize);
/** Multiplicateur des enjeux : plus il y a de joueurs, plus la victoire rapporte et plus la dernière place coûte. */
export const stakes = (size: number) => 1 + (Math.max(3, size) - 3) * 0.2;
/** Attente maximale en file avant de compléter avec des bots. */
export const QUEUE_WAIT_MS = 3000;
export const VOTE_MS = 10_000;
export const INTRO_MS = 3500;
export const REVEAL_MS = 3500;
/** Marge pour le trajet réseau d'une réponse envoyée juste avant la fin du chrono. */
export const ANSWER_GRACE_MS = 1500;

/** Temps de réponse : adapté à la question (12 s pour un vrai/faux de cours, jusqu'à 60 s pour un calcul). */
export const questionMs = (q: Pick<Question, "type" | "prompt" | "difficulty" | "calc">) => questionTimeMs(q);

export interface MatchPlayer {
  id: string;
  bot: boolean;
  pseudo: string;
  avatar: string;
  photoThumb?: string;
  rp: number;
  /** Bots : justesse moyenne (0..1) et rapidité (0 lent .. 1 rapide). */
  skill?: number;
  speed?: number;
}

export interface PlayerAnswer {
  correct: boolean;
  /** Temps de réponse depuis le début de la question. */
  ms: number;
  /** Réponse donnée (affichée à la révélation). */
  given: string | number | boolean;
}

/** Réponse prévue d'un bot : null = il ne répond pas à temps. */
export interface BotPlan {
  correct: boolean;
  ms: number | null;
}

export interface Vote {
  chapter: string;
  at: number;
}

export interface Match {
  id: string;
  subject: SubjectId;
  level: Level;
  createdAt: number;
  players: MatchPlayer[];
  chapters: [string, string];
  votes: Record<string, Vote>;
  chapterId: string | null;
  voteEnd: number | null;
  questions: Question[];
  /** Début et fin de chaque question déjà lancée. */
  starts: number[];
  ends: number[];
  answers: Record<string, (PlayerAnswer | null)[]>;
  botPlans: Record<string, BotPlan[]>;
  /** Questions perdues parce que le joueur a quitté l'appli. */
  away: Record<string, number[]>;
  finishedAt: number | null;
  /** Partie dans la matière du jour : +25 % de points de rang gagnés. */
  bonus?: boolean;
  /** Jauge de variété de chaque joueur humain : bonus (ou malus) sur les points gagnés. */
  variety?: Record<string, number>;
}

// ─────────────────────────── Bots ───────────────────────────

const BOT_NAMES = [
  "Lina", "Yanis", "Chloé", "Adam", "Inès", "Noah", "Sarah", "Hugo", "Jade", "Rayan", "Léa", "Nathan", "Emma", "Sacha", "Manon", "Enzo", "Zoé", "Mehdi", "Camille", "Théo",
  "Maëlys", "Ilyes", "Louise", "Lucas", "Anaïs", "Nolan", "Clara", "Ayoub", "Lou", "Tom", "Amira", "Gabin", "Romane", "Kylian", "Eva", "Mathis", "Nina", "Samy", "Alice", "Léo",
];
const BOT_SUFFIX = ["", "", "_", "x", "du93", "pro", "77", "2008", "09", "lgd", "bzh", "13", "_off", "z", "06"];
const BOT_AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦄", "🐺", "🦅", "🐲", "🐧", "🦋", "🤖", "🧙", "🥷", "👾", "🐨", "🐻", "🦉", "🐬"];

/** Niveau des bots selon le palier du joueur (justesse et rapidité moyennes). */
const BOT_SKILL = [0.5, 0.58, 0.66, 0.73, 0.8, 0.86, 0.9, 0.94];
const BOT_SPEED = [0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.82, 0.9];

const tierIndex = (rp: number) => Math.max(0, RANK_TIERS.findIndex((t) => t.id === rankFromRp(rp).tier.id));
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Un bot au niveau du rang du joueur, avec des écarts pour ne pas être monotone. */
export function makeBot(rp: number, r: () => number, taken: string[] = []): MatchPlayer {
  const t = tierIndex(rp);
  let pseudo = "";
  for (let guard = 0; guard < 20 && (!pseudo || taken.includes(pseudo)); guard++) {
    const name = BOT_NAMES[Math.floor(r() * BOT_NAMES.length)];
    pseudo = name + BOT_SUFFIX[Math.floor(r() * BOT_SUFFIX.length)];
  }
  return {
    id: `bot-${Math.floor(r() * 1e9).toString(36)}`,
    bot: true,
    pseudo,
    avatar: BOT_AVATARS[Math.floor(r() * BOT_AVATARS.length)],
    rp: Math.max(0, Math.round(rp + (r() - 0.5) * 240)),
    skill: clamp(BOT_SKILL[t] + (r() - 0.5) * 0.16, 0.3, 0.97),
    speed: clamp(BOT_SPEED[t] + (r() - 0.5) * 0.2, 0.1, 0.98),
  };
}

/** Tirage selon une loi log-normale (temps de réflexion humains : asymétriques, avec quelques longues hésitations). */
function logNormal(r: () => number, median: number, sigma: number) {
  const u = Math.max(1e-9, r());
  const v = r();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return median * Math.exp(sigma * z);
}

const visibleLength = (s: string) => s.replace(/\$[^$]*\$/g, "xxxxxx").replace(/[*_`#>]/g, "").length;

/**
 * Comportement d'un bot sur une question, le plus humain possible : temps de
 * lecture selon la longueur, réflexion variable, réponses fausses parfois
 * précipitées ou hésitantes, distractions, et parfois pas de réponse à temps.
 */
export function planBotAnswer(bot: MatchPlayer, q: Question, r: () => number, momentum = 0): BotPlan {
  const limit = questionMs(q);
  const skill = bot.skill ?? 0.6;
  const speed = bot.speed ?? 0.5;
  const difficulty = q.difficulty ?? 1;
  const typePenalty = q.type === "numeric" ? 0.12 : q.type === "truefalse" ? -0.06 : 0;
  const pCorrect = clamp(skill - (difficulty - 1) * 0.07 - typePenalty + momentum, 0.12, 0.98);
  const correct = r() < pCorrect;

  const chars = visibleLength(q.prompt) + (q.type === "mcq" ? q.choices.reduce((n, c) => n + visibleLength(c), 0) * 0.6 : 0);
  const readSpeed = 13 + speed * 14; // caractères par seconde
  const reading = (chars / readSpeed) * 1000;
  // Réflexion proportionnelle au temps prévu pour la question (un calcul long prend plus de temps qu'une question de cours).
  const thinkMedian = (6500 - speed * 4500) * (limit / 20_000) * (q.type === "numeric" ? 1.25 : q.type === "truefalse" ? 0.75 : 1);
  let think = logNormal(r, thinkMedian, 0.45);
  if (!correct) think *= r() < 0.5 ? 0.65 : 1.4; // trop vite, ou après hésitation
  if (r() < 0.06) think += 2000 + r() * 4000; // distraction
  let ms = 450 + r() * 400 + reading + think;
  if (ms > limit * 0.97) {
    if (r() < 0.55) return { correct: false, ms: null };
    ms = limit * (0.82 + r() * 0.15);
  }
  return { correct, ms: Math.round(Math.max(1200, ms)) };
}

/** Plans des bots pour toute la partie (avec une petite dynamique de série, comme un humain en confiance ou déstabilisé). */
export function planBots(m: Pick<Match, "id" | "players" | "questions">): Record<string, BotPlan[]> {
  const r = seededRandom(hashString(`bots:${m.id}`));
  const out: Record<string, BotPlan[]> = {};
  for (const p of m.players.filter((x) => x.bot)) {
    let momentum = 0;
    out[p.id] = m.questions.map((q) => {
      const plan = planBotAnswer(p, q, r, momentum);
      momentum = clamp(momentum + (plan.correct ? 0.02 : -0.03), -0.08, 0.06);
      return plan;
    });
  }
  return out;
}

/** Votes des bots : un choix au hasard, au bout de 1,5 à 6,5 secondes. */
export function botVotes(m: Pick<Match, "id" | "players" | "chapters" | "createdAt">): Record<string, Vote> {
  const r = seededRandom(hashString(`votes:${m.id}`));
  return Object.fromEntries(
    m.players.filter((p) => p.bot).map((p) => [p.id, { chapter: m.chapters[r() < 0.5 ? 0 : 1], at: m.createdAt + 1500 + Math.round(r() * 5000) }]),
  );
}

// ─────────────────────────── Déroulé ───────────────────────────

export type MakeQuestions = (chapterId: string, seed: string, level: Level) => Question[];

/** Chapitre retenu : majorité des votes, sinon tirage (graine de la partie). */
export function voteWinner(m: Pick<Match, "id" | "chapters" | "votes">): string {
  const count = (c: string) => Object.values(m.votes).filter((v) => v.chapter === c).length;
  const [a, b] = m.chapters;
  if (count(a) !== count(b)) return count(a) > count(b) ? a : b;
  return seededRandom(hashString(`tie:${m.id}`))() < 0.5 ? a : b;
}

/** Heure à laquelle un joueur a fini la question i (null : pas encore / jamais avant la limite). */
function doneAt(m: Match, p: MatchPlayer, i: number): number | null {
  const start = m.starts[i];
  if (p.bot) {
    const plan = m.botPlans[p.id]?.[i];
    return plan && plan.ms !== null ? start + plan.ms : null;
  }
  const a = m.answers[p.id]?.[i];
  if (a) return start + a.ms;
  if (m.away[p.id]?.includes(i)) return start;
  return null;
}

/**
 * Fait avancer la partie jusqu'à `now` : fin du vote, génération des questions,
 * fin de chaque question (tout le monde a répondu, ou chrono écoulé), question
 * suivante après la révélation, fin de partie. Renvoie true si l'état a changé.
 */
export function tick(m: Match, now: number, make: MakeQuestions): boolean {
  let changed = false;
  for (let guard = 0; guard < 50; guard++) {
    if (!m.chapterId) {
      const voteStart = m.createdAt;
      const all = m.players.every((p) => m.votes[p.id] && m.votes[p.id].at <= now);
      if (!all && now < voteStart + VOTE_MS) break;
      const end = all ? Math.max(...m.players.map((p) => m.votes[p.id].at)) : voteStart + VOTE_MS;
      // Les votes des bots postérieurs à la fin du vote ne comptent pas.
      for (const [id, v] of Object.entries(m.votes)) if (v.at > end) delete m.votes[id];
      m.voteEnd = end;
      m.chapterId = voteWinner(m);
      m.questions = make(m.chapterId, m.id, m.level).slice(0, MATCH_QUESTIONS);
      m.botPlans = planBots(m);
      m.starts = [end + INTRO_MS];
      changed = true;
      continue;
    }
    const i = m.starts.length - 1;
    if (m.ends.length === m.starts.length) {
      if (i >= m.questions.length - 1) {
        if (m.finishedAt === null) {
          m.finishedAt = m.ends[i] + REVEAL_MS;
          changed = true;
        }
        break;
      }
      m.starts.push(m.ends[i] + REVEAL_MS);
      changed = true;
      continue;
    }
    const start = m.starts[i];
    if (now < start) break;
    const limit = questionMs(m.questions[i]);
    const times = m.players.map((p) => doneAt(m, p, i));
    let end: number | null = null;
    if (times.every((t) => t !== null) && Math.max(...(times as number[])) <= now) end = Math.min(start + limit, Math.max(...(times as number[])));
    else if (now >= start + limit) end = start + limit;
    if (end === null) break;
    m.ends.push(end);
    changed = true;
  }
  return changed;
}

export type Phase = "vote" | "intro" | "question" | "reveal" | "done";

/** Phase visible à `now` (après `tick`). */
export function phaseAt(m: Match, now: number): { phase: Phase; index: number } {
  if (!m.chapterId) return { phase: "vote", index: -1 };
  if (m.finishedAt !== null && now >= m.finishedAt) return { phase: "done", index: m.questions.length - 1 };
  const i = m.starts.length - 1;
  if (now < m.starts[i]) return i === 0 ? { phase: "intro", index: 0 } : { phase: "reveal", index: i - 1 };
  if (m.ends.length > i) return { phase: "reveal", index: i };
  return { phase: "question", index: i };
}

/** Enregistre la réponse d'un joueur humain (refusée si hors délai, déjà répondu ou joueur parti). */
export function submitAnswer(m: Match, playerId: string, index: number, given: string | number | boolean, correct: boolean, now: number): "ok" | "late" | "already" | "away" | "wrong-question" {
  const { phase, index: current } = phaseAt(m, now);
  if (phase !== "question" || current !== index) return now < (m.starts[index] ?? Infinity) ? "wrong-question" : "late";
  const start = m.starts[index];
  if (now > start + questionMs(m.questions[index]) + ANSWER_GRACE_MS) return "late";
  if (m.away[playerId]?.includes(index)) return "away";
  const list = (m.answers[playerId] ??= []);
  if (list[index]) return "already";
  list[index] = { correct, ms: Math.min(questionMs(m.questions[index]), now - start), given };
  return "ok";
}

/** Le joueur a quitté l'appli pendant une question : elle est perdue. */
export function markAway(m: Match, playerId: string, now: number) {
  const { phase, index } = phaseAt(m, now);
  if (phase !== "question" || m.answers[playerId]?.[index]) return false;
  const list = (m.away[playerId] ??= []);
  if (!list.includes(index)) list.push(index);
  return true;
}

// ─────────────────────────── Résultats ───────────────────────────

export interface Standing {
  playerId: string;
  place: number;
  correct: number;
  totalMs: number;
}

/** Résultat d'un joueur sur la question i (révélé à la fin de la question). */
export function resultOf(m: Match, p: MatchPlayer, i: number): { correct: boolean; ms: number | null } {
  if (p.bot) {
    const plan = m.botPlans[p.id]?.[i];
    return plan && plan.ms !== null ? { correct: plan.correct, ms: plan.ms } : { correct: false, ms: null };
  }
  const a = m.answers[p.id]?.[i];
  return a ? { correct: a.correct, ms: a.ms } : { correct: false, ms: null };
}

/** Classement sur les questions terminées : plus de bonnes réponses, puis temps total le plus court. */
export function standings(m: Match): Standing[] {
  const done = m.ends.length;
  const rows = m.players.map((p) => {
    let correct = 0;
    let totalMs = 0;
    for (let i = 0; i < done; i++) {
      const r = resultOf(m, p, i);
      if (r.correct) correct++;
      totalMs += r.ms ?? questionMs(m.questions[i]);
    }
    return { playerId: p.id, correct, totalMs };
  });
  rows.sort((a, b) => b.correct - a.correct || a.totalMs - b.totalMs);
  return rows.map((r, i) => ({ ...r, place: i + 1 }));
}

/**
 * Points de rang selon la place et le nombre de joueurs, plus durs à gagner et
 * plus coûteux à perdre en montant. La place du milieu rapporte un peu ; au-dessus
 * on gagne, en dessous on perd. À 5 ou 7, la 1re place rapporte plus (×1,4 / ×1,8)
 * et la dernière coûte plus, puisqu'il y a plus de perdants.
 */
export function rpDelta(place: number, rp: number, correct: number, total: number, size = MATCH_PLAYERS): number {
  const t = tierIndex(rp);
  const n = Math.max(3, size);
  const k = clamp(place - 1, 0, n - 1);
  const mid = (n - 1) / 2;
  const s = stakes(n);
  const win = (30 - t * 1.5) * s;
  const middle = Math.max(2, 9 - t * 1.2);
  const loss = -(6 + t * 3) * s;
  const base = k < mid ? middle + (win - middle) * (1 - k / mid) : k === mid ? middle : (loss * (k - mid)) / mid;
  const perfect = correct === total && total > 0 ? 5 : 0;
  return Math.round(base + perfect);
}

/** XP d'entraînement gagnée par une partie classée (jamais négative ; la victoire rapporte plus à 5 ou 7). */
export function matchXp(place: number, correct: number, size = MATCH_PLAYERS): number {
  const n = Math.max(3, size);
  const k = clamp(place - 1, 0, n - 1);
  const mid = (n - 1) / 2;
  const top = 80 * stakes(n);
  const bonus = k <= mid ? 40 + (top - 40) * (1 - k / mid) : 40 - 25 * ((k - mid) / mid);
  return correct * 12 + Math.round(bonus);
}

/** Gagnant, place du milieu ou perdant. */
export const placeOutcome = (place: number, size = MATCH_PLAYERS): "win" | "middle" | "loss" =>
  place - 1 < (size - 1) / 2 ? "win" : place - 1 === (size - 1) / 2 ? "middle" : "loss";

/** « 1re », « 2e »… */
export const ordinal = (n: number) => `${n}${n === 1 ? "re" : "e"}`;
