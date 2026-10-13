/**
 * Mode classé : manches de 10 questions corrigées par le serveur, groupes de
 * la semaine et promotions décidées le dimanche soir, un rang par matière
 * (plus un rang « Général » qui mélange les matières du niveau).
 *
 * Tout ici est pur (sans stockage) pour être testé et partagé client / serveur.
 */
import { SUBJECTS, subjectsForLevel } from "@/lib/content/curriculum";
import type { Level, Question, SubjectId } from "@/lib/types";
import { LEAGUE_MIN_SIZE, promotionSpots, relegationSpots, weekEnd } from "./league";
import { dayKey, weekKey } from "./progression";
import { RANK_STEPS, stepIndex } from "./ranks";

export type RankedSubject = SubjectId | "general";

export const RANKED_SUBJECTS: RankedSubject[] = ["general", ...SUBJECTS.map((s) => s.id)];
export const isRankedSubject = (s: unknown): s is RankedSubject => typeof s === "string" && (RANKED_SUBJECTS as string[]).includes(s);

/** Matières jouables en classé pour un niveau (la philo n'existe qu'en Terminale). */
export const rankedSubjectsFor = (level: Level): RankedSubject[] => ["general", ...subjectsForLevel(level).map((s) => s.id)];

export const rankedSubjectMeta = (s: RankedSubject) =>
  s === "general" ? { id: s, name: "Général", emoji: "⭐", gradient: "from-amber-400 to-orange-600", color: "#f59e0b" } : SUBJECTS.find((x) => x.id === s)!;

export const MATCH_SIZE = 10;
/** Seules les meilleures manches de la semaine comptent (jouer mieux plutôt que plus). */
export const COUNTED_MATCHES = 10;
/** Minimum de manches pour être classé dans la semaine. */
export const MIN_MATCHES = 3;
/** Manches de placement avant d'obtenir un rang dans une matière. */
export const PLACEMENT_MATCHES = 5;
/** Taille maximale d'un groupe de la semaine. */
export const GROUP_SIZE = 20;
/** À partir de Platine III, une semaine sans jouer fait perdre une division. */
export const DECAY_FROM_STEP = RANK_STEPS.findIndex((s) => s.tier.id === "platine");
/** Le placement ne peut pas dépasser Or III. */
const PLACEMENT_MAX_STEP = RANK_STEPS.findIndex((s) => s.tier.id === "or");
export const TOP_STEP = RANK_STEPS.length - 1;

const TIER_ORDER = ["bronze", "argent", "or", "platine", "diamant", "maitre", "grand-maitre", "legende"];
const tierOf = (step: number) => Math.max(0, TIER_ORDER.indexOf(RANK_STEPS[clampStep(step)].tier.id));
export const clampStep = (step: number) => Math.max(0, Math.min(TOP_STEP, Math.round(step)));
export const stepLabel = (step: number) => RANK_STEPS[clampStep(step)].label;
export const stepMinRp = (step: number) => RANK_STEPS[clampStep(step)].minRp;
export { stepIndex };

/** Objectif de score moyen d'une division : l'atteindre (sur 5 manches ou plus) suffit pour monter. */
const PARS = [50, 58, 65, 72, 80, 85, 90, 95];
export const parFor = (step: number) => PARS[tierOf(step)];

/** Chrono par question : de plus en plus court en montant. */
const SECONDS = [30, 27, 24, 21, 18, 16, 15, 15];
export const secondsFor = (step: number, q: Pick<Question, "type">) => SECONDS[tierOf(step)] + (q.type === "numeric" ? 15 : 0);
/** Marge pour le trajet réseau (la réponse part du téléphone avant la fin du chrono). */
export const LATENCY_GRACE_MS = 2500;

/** Points d'une question (sur 10) : 7 pour la bonne réponse, jusqu'à 3 pour la rapidité. */
export function questionPoints(correct: boolean, timeMs: number, limitMs: number): number {
  if (!correct) return 0;
  const ratio = Math.min(1, Math.max(0, timeMs) / limitMs);
  // Plein bonus dans le premier quart du temps, puis décroissance linéaire.
  const speed = ratio <= 0.25 ? 1 : 1 - (ratio - 0.25) / 0.75;
  return Math.round((7 + 3 * speed) * 10) / 10;
}

export const matchScore = (points: number[]) => Math.round(points.reduce((s, p) => s + p, 0));

/** Ajoute un score à la liste des meilleures manches (triée, limitée). */
export const pushBest = (best: number[], score: number) => [...best, score].sort((a, b) => b - a).slice(0, COUNTED_MATCHES);
export const weeklyTotal = (best: number[]) => best.reduce((s, x) => s + x, 0);
export const weeklyAverage = (best: number[]) => (best.length ? weeklyTotal(best) / best.length : 0);

/** Rang de départ après les manches de placement (de Bronze III à Or III). */
export function placementStep(scores: number[]): number {
  const avg = scores.length ? scores.reduce((s, x) => s + x, 0) / scores.length : 0;
  return Math.max(0, Math.min(PLACEMENT_MAX_STEP, Math.floor((avg - 40) / 7)));
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
export const rankedDay = (now = new Date()) => dayKey(parisDate(now));
/** Millisecondes avant la fin de la semaine classée (lundi 0 h, heure de Paris). */
export function msUntilWeekEnd(now = new Date()): number {
  const p = parisDate(now);
  return Math.max(0, weekEnd(p).getTime() - p.getTime());
}

/** Saisons = trimestres scolaires : septembre–décembre, janvier–mars, avril–août. */
export function seasonKey(now = new Date()): string {
  const p = parisDate(now);
  const m = p.getMonth() + 1;
  const y = p.getFullYear();
  return m >= 9 ? `${y}-S1` : m <= 3 ? `${y - 1}-S2` : `${y - 1}-S3`;
}
export function seasonLabel(key: string): string {
  const [y, s] = key.split("-S");
  const year = Number(y);
  return s === "1" ? `Saison 1 · ${year}-${year + 1}` : s === "2" ? `Saison 2 · ${year}-${year + 1}` : `Saison 3 · ${year}-${year + 1}`;
}

// ─────────────────────────── Profil classé ───────────────────────────

export type WeekZone = "promotion" | "objective" | "safe" | "relegation" | "unranked" | "inactive" | "review";

export interface WeekResult {
  week: string;
  zone: WeekZone;
  rank: number;
  size: number;
  total: number;
  from: number;
  to: number;
  seen: boolean;
}

export interface SubjectRank {
  step: number;
  /** Manches de placement jouées (rang définitif à PLACEMENT_MATCHES). */
  placement: number[];
  placed: boolean;
  /** Semaine des scores ci-dessous. */
  week: string;
  best: number[];
  played: number;
  /** Dernière semaine prise en compte pour les promotions. */
  settled?: string;
  peak: number;
  last?: WeekResult;
}

/**
 * Époque des rangs : l'augmenter remet tous les rangs à zéro (l'XP reste).
 * 2 : remise à zéro après la période où les questions se répétaient (rangs gagnés trop vite).
 */
export const RANK_EPOCH = 2;

export interface RankedProfile {
  pseudo: string;
  /** Époque des rangs du profil (un profil d'une époque passée repart de zéro). */
  epoch?: number;
  season: string;
  subjects: Partial<Record<RankedSubject, SubjectRank>>;
  /** Meilleur rang de chaque saison passée, par matière. */
  seasons?: Record<string, Partial<Record<RankedSubject, number>>>;
  /** Manche en cours. */
  active?: string;
  /** Empreintes des dernières questions posées (pas de répétition d'une manche à l'autre). */
  seen?: string[];
  /** Jour (Paris) du dernier joker utilisé. */
  jokerDay?: string;
  /** Manche perdue par sortie de l'appli, en attente (joker possible). */
  pendingLoss?: string;
  integrity?: Integrity;
}

export function newSubjectRank(week: string, step = 0, placed = false): SubjectRank {
  return { step, placement: [], placed, week, best: [], played: 0, peak: step };
}

/** Profil neuf : chaque matière, Général compris, passe par 5 manches de placement. */
export function newRankedProfile(pseudo: string, now = new Date()): RankedProfile {
  return { pseudo, epoch: RANK_EPOCH, season: seasonKey(now), subjects: {} };
}

/**
 * Rang recopié dans la sauvegarde (badge affiché partout) : rang Général actuel,
 * et meilleur rang Général atteint (titres et cadres), saisons passées comprises.
 */
export function rankRewards(p: RankedProfile | null | undefined): { rp: number; peakRp: number } {
  const g = p?.subjects.general;
  const rp = g?.placed ? stepMinRp(g.step) : 0;
  const pastPeaks = Object.values(p?.seasons ?? {}).map((s) => s.general ?? 0);
  const peakStep = Math.max(g?.placed ? g.peak : 0, ...pastPeaks, 0);
  return { rp, peakRp: Math.max(rp, g?.placed || pastPeaks.length ? stepMinRp(peakStep) : 0) };
}

/** Changement de saison : on garde le meilleur rang, puis chacun redescend d'un palier (3 divisions). */
export function applySeason(p: RankedProfile, now = new Date()): RankedProfile {
  const season = seasonKey(now);
  if (p.season === season) return p;
  const peaks: Partial<Record<RankedSubject, number>> = {};
  const subjects: RankedProfile["subjects"] = {};
  for (const [s, r] of Object.entries(p.subjects) as [RankedSubject, SubjectRank][]) {
    if (r.placed) peaks[s] = r.peak;
    const step = r.placed ? Math.max(0, r.step - 3) : r.step;
    subjects[s] = { ...r, step, peak: step };
  }
  return { ...p, season, subjects, seasons: { ...(p.seasons ?? {}), [p.season]: peaks } };
}

/** Enregistre une manche terminée dans le profil. */
export function recordMatch(p: RankedProfile, subject: RankedSubject, score: number, now = new Date()): { profile: RankedProfile; placedNow: boolean } {
  const week = rankedWeek(now);
  const prev = p.subjects[subject] ?? newSubjectRank(week);
  let r: SubjectRank = prev.week === week ? { ...prev } : { ...prev, week, best: [], played: 0 };
  r.best = pushBest(r.best, score);
  r.played += 1;
  let placedNow = false;
  if (!r.placed) {
    r.placement = [...r.placement, score];
    if (r.placement.length >= PLACEMENT_MATCHES) {
      r = { ...r, placed: true, step: placementStep(r.placement) };
      r.peak = Math.max(r.peak, r.step);
      placedNow = true;
    }
  }
  return { profile: { ...p, subjects: { ...p.subjects, [subject]: r } }, placedNow };
}

// ─────────────────────────── Groupes et promotions ───────────────────────────

export interface GroupEntry {
  id: string;
  step: number;
  total: number;
  played: number;
  avg: number;
}

/**
 * Répartit les joueurs de la semaine en groupes de 20 au plus, de rangs voisins
 * (tri par rang puis par points), de tailles équilibrées.
 */
export function formGroups<T extends GroupEntry>(entries: T[]): T[][] {
  const sorted = [...entries].sort((a, b) => b.step - a.step || b.total - a.total || a.id.localeCompare(b.id));
  const count = Math.max(1, Math.ceil(sorted.length / GROUP_SIZE));
  const groups: T[][] = [];
  let i = 0;
  for (let g = 0; g < count; g++) {
    const size = Math.floor(sorted.length / count) + (g < sorted.length % count ? 1 : 0);
    groups.push(sorted.slice(i, i + size));
    i += size;
  }
  return groups.filter((g) => g.length > 0);
}

/** Classement interne d'un groupe : points de la semaine, puis moyenne. */
export const standings = <T extends GroupEntry>(group: T[]) => [...group].sort((a, b) => b.total - a.total || b.avg - a.avg || a.id.localeCompare(b.id));

/** A atteint l'objectif de sa division (au moins 5 manches). */
export const reachedObjective = (e: Pick<GroupEntry, "played" | "avg" | "step">) => e.played >= PLACEMENT_MATCHES && e.avg >= parFor(e.step);

/** Zone d'un joueur à une place donnée de son groupe (les non-classés n'ont pas de zone). */
export function zoneFor(e: GroupEntry, rank: number, classified: number): WeekZone {
  if (e.played < MIN_MATCHES) return "unranked";
  if (classified >= LEAGUE_MIN_SIZE && rank <= promotionSpots(classified)) return "promotion";
  if (reachedObjective(e)) return "objective";
  // Personne ne descend sous Bronze III : pas de zone rouge au plus bas.
  if (rank > classified - relegationSpots(classified) && e.step > 0) return "relegation";
  return "safe";
}

/** Résultat de la semaine pour chaque joueur d'un groupe. */
export function settleGroup<T extends GroupEntry>(group: T[], week: string): Map<string, WeekResult> {
  const out = new Map<string, WeekResult>();
  const classified = standings(group.filter((e) => e.played >= MIN_MATCHES));
  classified.forEach((e, i) => {
    const zone = zoneFor(e, i + 1, classified.length);
    const to = zone === "promotion" || zone === "objective" ? clampStep(e.step + 1) : zone === "relegation" ? clampStep(e.step - 1) : e.step;
    out.set(e.id, { week, zone, rank: i + 1, size: classified.length, total: e.total, from: e.step, to, seen: false });
  });
  for (const e of group) {
    if (!out.has(e.id)) out.set(e.id, { week, zone: "unranked", rank: 0, size: classified.length, total: e.total, from: e.step, to: e.step, seen: false });
  }
  return out;
}

export const entryOf = (id: string, r: SubjectRank): GroupEntry => ({ id, step: r.step, total: weeklyTotal(r.best), played: r.played, avg: weeklyAverage(r.best) });

/**
 * Clôt toutes les semaines terminées : promotions / relégations dans chaque
 * groupe, et perte d'une division pour les hauts rangs inactifs.
 * Renvoie seulement les profils modifiés.
 */
export function settleWeeks(profiles: Record<string, RankedProfile>, now = new Date()): Record<string, RankedProfile> {
  const current = rankedWeek(now);
  const changed: Record<string, RankedProfile> = {};
  const get = (id: string) => changed[id] ?? profiles[id];
  const put = (id: string, s: RankedSubject, r: SubjectRank) => {
    const p = get(id);
    changed[id] = { ...p, subjects: { ...p.subjects, [s]: r } };
  };

  for (const s of RANKED_SUBJECTS) {
    // Semaines à clore pour cette matière.
    const weeks = new Set<string>();
    for (const p of Object.values(profiles)) {
      const r = p.subjects[s];
      if (r && r.placed && r.week < current && r.settled !== r.week && r.played > 0) weeks.add(r.week);
    }
    for (const week of [...weeks].sort()) {
      const entries = Object.entries(profiles)
        .map(([id]) => [id, get(id).subjects[s]] as const)
        .filter((x): x is readonly [string, SubjectRank] => !!x[1] && x[1].placed && x[1].week === week && x[1].settled !== week && x[1].played > 0)
        .map(([id, r]) => entryOf(id, r));
      for (const group of formGroups(entries)) {
        for (const [id, raw] of settleGroup(group, week)) {
          const r = get(id).subjects[s]!;
          // Compte en vérification : pas de promotion tant que les alertes sont récentes.
          const res = raw.to > raw.from && underReview(get(id).integrity, now.getTime()) ? { ...raw, zone: "review" as const, to: raw.from } : raw;
          put(id, s, { ...r, step: res.to, peak: Math.max(r.peak, res.to), settled: week, last: res });
        }
      }
      // Inactifs de haut rang : une division de moins.
      for (const id of Object.keys(profiles)) {
        const r = get(id).subjects[s];
        if (!r || !r.placed || r.step < DECAY_FROM_STEP || r.week >= week || (r.last && r.last.week >= week)) continue;
        put(id, s, { ...r, step: r.step - 1, last: { week, zone: "inactive", rank: 0, size: 0, total: 0, from: r.step, to: r.step - 1, seen: false } });
      }
    }
  }
  return changed;
}

/** Profil sans les semaines passées non jouées (scores remis à zéro au changement de semaine). */
export function currentRank(r: SubjectRank | undefined, now = new Date()): SubjectRank | undefined {
  if (!r) return r;
  const week = rankedWeek(now);
  return r.week === week ? r : { ...r, week, best: [], played: 0 };
}

// ─────────────────────────── Questions ───────────────────────────

/** Question telle que le client la reçoit avant d'avoir répondu : sans réponse ni explication. */
export function publicQuestion(q: Question): Question {
  if (q.type === "mcq") return { ...q, answer: -1, explanation: "" };
  if (q.type === "truefalse") return { ...q, answer: false, explanation: "" };
  return { id: q.id, type: "numeric", prompt: q.prompt, unit: q.unit, difficulty: q.difficulty, answer: 0, explanation: "" };
}

// ─────────────────────────── Anti-triche : présence ───────────────────────────

/** Le téléphone signale sa présence toutes les 5 s pendant une manche. */
export const BEAT_MS = 5000;
/** Sans signal pendant ce temps, on considère que le joueur a quitté l'appli. */
export const BEAT_GAP_MS = 12_000;
/** Absence au-delà de laquelle la manche est perdue d'office. */
export const AWAY_MAX_MS = 10_000;
/** Nombre de sorties qui font perdre la manche. */
export const MAX_EXITS = 2;

export interface Presence {
  exits: number;
  hiddenAt?: number;
  lastBeat: number;
}

export type PresenceEvent = "hidden" | "visible" | "beat";

export type PresenceOutcome =
  /** Rien à signaler. */
  | { kind: "ok" }
  /** Sortie : la question en cours compte fausse. */
  | { kind: "strike"; exits: number }
  /** Manche perdue (deuxième sortie ou absence trop longue). */
  | { kind: "lost"; reason: string };

/**
 * Applique un signal de présence. Une sortie est comptée à l'événement
 * « hidden » (l'appli passe en arrière-plan), ou quand les signaux se sont
 * interrompus (événement bloqué, appli tuée…). Revenir après plus de 10 s,
 * ou sortir une deuxième fois, fait perdre la manche.
 */
export function applyPresence(p: Presence, event: PresenceEvent, now: number): { presence: Presence; outcome: PresenceOutcome } {
  const gap = now - p.lastBeat;
  let presence: Presence = { ...p, lastBeat: now };
  // Signaux interrompus sans « hidden » : absence de toute la durée du trou.
  if (event !== "hidden" && p.hiddenAt === undefined && gap > BEAT_GAP_MS) {
    return { presence: { ...presence, exits: p.exits + 1 }, outcome: { kind: "lost", reason: "Signal perdu : l'appli a été quittée" } };
  }
  if (event === "hidden") {
    if (p.hiddenAt !== undefined) return { presence: { ...presence, lastBeat: p.lastBeat }, outcome: { kind: "ok" } };
    const exits = p.exits + 1;
    presence = { ...presence, exits, hiddenAt: now };
    return { presence, outcome: exits >= MAX_EXITS ? { kind: "lost", reason: "Deuxième sortie de l'appli" } : { kind: "strike", exits } };
  }
  // Retour (ou signal reçu alors que l'appli était cachée).
  if (p.hiddenAt !== undefined) {
    const away = now - p.hiddenAt;
    presence = { exits: p.exits, lastBeat: now };
    if (away > AWAY_MAX_MS) return { presence, outcome: { kind: "lost", reason: `Absent ${Math.round(away / 1000)} s pendant la manche` } };
  }
  return { presence, outcome: { kind: "ok" } };
}

// ─────────────────────────── Anti-triche : comportements suspects ───────────────────────────

/**
 * Manche suspecte : beaucoup de bonnes réponses données bien plus vite qu'il
 * n'est possible de lire l'énoncé, ou des temps de réponse quasi identiques.
 */
export function suspicion(questions: Pick<Question, "prompt" | "type">[], results: boolean[], times: number[]): string | null {
  const answered = times.map((t, i) => ({ t, ok: results[i], len: questions[i]?.prompt.length ?? 0 })).filter((x) => x.t > 0);
  const correct = answered.filter((x) => x.ok);
  if (correct.length < 7) return null;
  // Lecture minimale : environ 25 caractères par seconde, au moins 0,8 s.
  const tooFast = correct.filter((x) => x.t < Math.max(800, (x.len / 25) * 1000 * 0.35)).length;
  if (tooFast >= 6) return `${tooFast} bonnes réponses plus rapides que la lecture de l'énoncé`;
  const ts = correct.map((x) => x.t);
  const mean = ts.reduce((s, t) => s + t, 0) / ts.length;
  const sd = Math.sqrt(ts.reduce((s, t) => s + (t - mean) ** 2, 0) / ts.length);
  if (correct.length >= 9 && sd < 120) return "Temps de réponse identiques à chaque question";
  return null;
}

/** Signalements et alertes qui bloquent les promotions (vérification). */
export const REPORTS_FOR_REVIEW = 3;
export const FLAGS_FOR_REVIEW = 3;
export const REVIEW_WINDOW_MS = 14 * 86_400_000;

export interface Integrity {
  flags: { at: number; reason: string }[];
  reports: { by: string; at: number }[];
}

/** Compte à vérifier : promotions bloquées tant que les alertes sont récentes. */
export function underReview(i: Integrity | undefined, now = Date.now()): boolean {
  if (!i) return false;
  const flags = i.flags.filter((f) => now - f.at < REVIEW_WINDOW_MS).length;
  const reporters = new Set(i.reports.filter((r) => now - r.at < REVIEW_WINDOW_MS).map((r) => r.by)).size;
  return flags >= FLAGS_FOR_REVIEW || reporters >= REPORTS_FOR_REVIEW;
}

// ─────────────────────────── Statut dans le groupe (affichage) ───────────────────────────

export interface StatusRow {
  total: number;
  played: number;
  zone: WeekZone;
  isMe: boolean;
}

export type GroupStatus =
  | { kind: "absent" }
  | { kind: "unranked"; missing: number }
  | { kind: "promotion" | "objective"; rank: number; size: number; lead: number | null }
  | { kind: "safe"; rank: number; size: number; toPromotion: number | null }
  | { kind: "relegation"; rank: number; size: number; toSafety: number };

/** Où en est le joueur dans son groupe : zone, et points qui le séparent de la zone voisine. */
export function groupStatus(rows: StatusRow[]): GroupStatus {
  const me = rows.find((r) => r.isMe);
  if (!me) return { kind: "absent" };
  if (me.played < MIN_MATCHES) return { kind: "unranked", missing: MIN_MATCHES - me.played };
  const classified = rows.filter((r) => r.played >= MIN_MATCHES);
  const rank = classified.indexOf(me) + 1;
  const size = classified.length;
  const promo = classified.filter((r) => r.zone === "promotion");
  if (me.zone === "promotion" || me.zone === "objective") {
    const next = classified[promo.length];
    return { kind: me.zone, rank, size, lead: me.zone === "promotion" && next ? me.total - next.total : null };
  }
  if (me.zone === "relegation") {
    const lastSafe = [...classified].reverse().find((r) => r.zone !== "relegation");
    return { kind: "relegation", rank, size, toSafety: lastSafe ? Math.max(1, lastSafe.total - me.total + 1) : 1 };
  }
  const lastPromo = promo[promo.length - 1];
  return { kind: "safe", rank, size, toPromotion: lastPromo ? Math.max(1, lastPromo.total - me.total + 1) : null };
}
