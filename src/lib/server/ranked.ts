import "server-only";
import { randomBytes } from "node:crypto";
import { questionKey } from "@/lib/content/generated";
import { rankedQuestions } from "@/lib/content/ranked-questions";
import {
  type GroupEntry,
  LATENCY_GRACE_MS,
  MATCH_SIZE,
  PLACEMENT_MATCHES,
  type RankedProfile,
  type RankedSubject,
  type SubjectRank,
  type WeekZone,
  applySeason,
  currentRank,
  entryOf,
  formGroups,
  matchScore,
  msUntilWeekEnd,
  newRankedProfile,
  parFor,
  publicQuestion,
  questionPoints,
  rankedSubjectsFor,
  rankedWeek,
  recordMatch,
  secondsFor,
  settleWeeks,
  standings,
  stepLabel,
  weeklyAverage,
  weeklyTotal,
  zoneFor,
} from "@/lib/game/ranked";
import type { PublicProfile } from "@/lib/game/save";
import { isCorrect } from "@/lib/game/session";
import type { Level, Question } from "@/lib/types";
import { getSave } from "./accounts";
import { publicPlayerId } from "./auth";
import { getStore } from "./store";

/**
 * Stockage du mode classé : hash `ranked` (id de compte → profil classé) et
 * `rkm:<id>` pour chaque manche (questions, réponses, chronos).
 * Le serveur tire les questions, envoie une question à la fois, chronomètre
 * et corrige : le téléphone ne connaît jamais la réponse avant d'avoir répondu.
 */

const HASH = "ranked";
const SEEN_KEPT = 300;
/** Au-delà, une manche abandonnée est close d'office. */
const MATCH_MAX_MS = 20 * 60_000;

export interface StoredMatch {
  id: string;
  uid: string;
  subject: RankedSubject;
  level: Level;
  step: number;
  questions: Question[];
  /** Question servie (ou prochaine à servir). */
  index: number;
  /** Heure d'envoi de la question en cours ; null entre deux questions. */
  servedAt: number | null;
  results: boolean[];
  points: number[];
  times: number[];
  startedAt: number;
  finishedAt?: number;
  score?: number;
  /** Fin anticipée (abandon, nouvelle manche lancée…). */
  forfeit?: string;
}

export interface MatchResult {
  subject: RankedSubject;
  score: number;
  results: boolean[];
  points: number[];
  forfeit?: string;
  rank: RankView;
}

export interface RankView {
  subject: RankedSubject;
  step: number;
  label: string;
  placed: boolean;
  placementLeft: number;
  peak: number;
  played: number;
  best: number[];
  total: number;
  avg: number;
  par: number;
  last?: SubjectRank["last"];
}

export interface GroupRow {
  id: string;
  pseudo: string;
  avatar: string;
  photoThumb?: string;
  label: string;
  total: number;
  played: number;
  zone: WeekZone;
  isMe: boolean;
}

const newId = () => randomBytes(9).toString("base64url");
const matchKey = (id: string) => `rkm:${id}`;

export const getMatch = (id: string) => getStore().get<StoredMatch>(matchKey(id));
export const saveMatch = (m: StoredMatch) => getStore().set(matchKey(m.id), m);
const putProfile = (uid: string, p: RankedProfile) => getStore().hset(HASH, uid, p);

/** Clôt les semaines terminées (une fois par semaine, au premier passage). */
export async function settleIfNeeded(now = new Date()) {
  const store = getStore();
  const week = rankedWeek(now);
  if (!(await store.create(`rk:settled:${week}`, { at: now.getTime() }))) return 0;
  const all = await store.hgetall<RankedProfile>(HASH);
  const changed = settleWeeks(all, now);
  for (const [uid, p] of Object.entries(changed)) await putProfile(uid, p);
  return Object.keys(changed).length;
}

/** Profil classé du joueur (créé au premier passage à partir de son rang actuel). */
export async function loadProfile(uid: string, pseudo: string, now = new Date()): Promise<{ profile: RankedProfile; level: Level }> {
  const store = getStore();
  const [stored] = await store.hmget<RankedProfile>(HASH, [uid]);
  const save = await getSave(uid);
  const level = save?.save.profile?.level ?? "seconde";
  let profile = stored ?? newRankedProfile(pseudo, save?.save.rp ?? 0, now);
  const seasoned = applySeason(profile, now);
  if (!stored || seasoned !== profile || profile.pseudo !== pseudo) {
    profile = { ...seasoned, pseudo };
    await putProfile(uid, profile);
  }
  return { profile, level };
}

export function rankView(subject: RankedSubject, r: SubjectRank | undefined, now = new Date()): RankView {
  const cur = currentRank(r, now);
  const step = cur?.step ?? 0;
  const best = cur?.best ?? [];
  return {
    subject,
    step,
    label: stepLabel(step),
    placed: cur?.placed ?? false,
    placementLeft: cur?.placed ? 0 : PLACEMENT_MATCHES - (cur?.placement.length ?? 0),
    peak: cur?.peak ?? step,
    played: cur?.played ?? 0,
    best,
    total: weeklyTotal(best),
    avg: Math.round(weeklyAverage(best)),
    par: parFor(step),
    ...(cur?.last ? { last: cur.last } : {}),
  };
}

export const profileViews = (p: RankedProfile, level: Level, now = new Date()) => rankedSubjectsFor(level).map((s) => rankView(s, p.subjects[s], now));

/** Groupe de la semaine du joueur dans une matière (il y figure même sans avoir encore joué). */
export async function groupFor(uid: string, subject: RankedSubject, now = new Date()): Promise<{ rows: GroupRow[]; top: GroupRow[]; players: number }> {
  const store = getStore();
  const all = await store.hgetall<RankedProfile>(HASH);
  const week = rankedWeek(now);
  const ranks = Object.entries(all).flatMap(([id, p]) => {
    const r = currentRank(p.subjects[subject], now);
    return r && r.placed ? [[id, r] as const] : [];
  });
  const active = ranks.filter(([id, r]) => r.week === week && (r.played > 0 || id === uid)).map(([id, r]) => entryOf(id, r));
  const mine = all[uid]?.subjects[subject];
  if (mine?.placed && !active.some((e) => e.id === uid)) active.push(entryOf(uid, currentRank(mine, now)!));
  const group = formGroups(active).find((g) => g.some((e) => e.id === uid)) ?? [];

  const ids = [...new Set([...group.map((e) => e.id), ...ranks.map(([id]) => id)])];
  const publics = await store.hmget<PublicProfile>("players", ids);
  const pub = new Map(ids.map((id, i) => [id, publics[i]]));
  const row = (e: GroupEntry, zone: WeekZone): GroupRow => {
    const p = pub.get(e.id);
    return {
      id: publicPlayerId(e.id),
      pseudo: all[e.id]?.pseudo ?? p?.pseudo ?? "?",
      avatar: p?.avatar ?? "🙂",
      ...(p?.photoThumb ? { photoThumb: p.photoThumb } : {}),
      label: stepLabel(e.step),
      total: e.total,
      played: e.played,
      zone,
      isMe: e.id === uid,
    };
  };
  const ordered = standings(group);
  const classified = ordered.filter((e) => e.played >= 3);
  const rows = ordered.map((e) => row(e, zoneFor(e, classified.indexOf(e) + 1, classified.length)));
  const top = ranks
    .map(([id, r]) => entryOf(id, r))
    .sort((a, b) => b.step - a.step || b.total - a.total)
    .slice(0, 50)
    .map((e) => row(e, "safe"));
  return { rows, top, players: ranks.length };
}

// ─────────────────────────── Manches ───────────────────────────

/** Ce que le client reçoit pour la question en cours. */
export const servedQuestion = (m: StoredMatch, now = Date.now()) => ({
  index: m.index,
  total: m.questions.length,
  question: publicQuestion(m.questions[m.index]),
  seconds: secondsFor(m.step, m.questions[m.index]),
  /** Temps déjà écoulé sur cette question (reprise d'une manche). */
  elapsedMs: m.servedAt === null ? 0 : Math.max(0, now - m.servedAt),
  score: matchScore(m.points),
});

export async function startMatch(uid: string, pseudo: string, subject: RankedSubject, now = new Date()) {
  await settleIfNeeded(now);
  let { profile, level } = await loadProfile(uid, pseudo, now);
  if (!rankedSubjectsFor(level).includes(subject)) throw new Error("Matière indisponible pour ton niveau.");
  // Une manche laissée en plan compte telle quelle (pas de « je relance si ça se passe mal »).
  if (profile.active) {
    const old = await getMatch(profile.active);
    if (old && !old.finishedAt) profile = (await finishMatch(old, profile, "Nouvelle manche lancée avant la fin", now)).profile;
  }
  const id = newId();
  const step = currentRank(profile.subjects[subject], now)?.step ?? 0;
  const questions = rankedQuestions(subject, level, `${uid}:${id}`, new Set(profile.seen ?? []));
  const match: StoredMatch = { id, uid, subject, level, step, questions, index: 0, servedAt: now.getTime(), results: [], points: [], times: [], startedAt: now.getTime() };
  await saveMatch(match);
  profile = { ...profile, active: id, seen: [...(profile.seen ?? []), ...questions.map(questionKey)].slice(-SEEN_KEPT) };
  await putProfile(uid, profile);
  return { id, subject, ...servedQuestion(match) };
}

/** Envoie la question suivante (le chrono démarre maintenant). */
export async function serveNext(m: StoredMatch, now = Date.now()) {
  if (m.finishedAt) throw new Error("Manche terminée.");
  if (m.servedAt === null) {
    m.servedAt = now;
    await saveMatch(m);
  }
  return servedQuestion(m, now);
}

/** Corrige une réponse ; la manche se termine après la dernière question. */
export async function answerQuestion(m: StoredMatch, index: number, given: unknown, pseudo: string, now = new Date()) {
  if (m.finishedAt) throw new Error("Manche terminée.");
  if (index !== m.index || m.servedAt === null) throw new Error("Question inattendue.");
  const q = m.questions[index];
  const limit = secondsFor(m.step, q) * 1000;
  const elapsed = now.getTime() - m.servedAt;
  const inTime = elapsed <= limit + LATENCY_GRACE_MS;
  const valid = typeof given === "number" || typeof given === "boolean" || (typeof given === "string" && given.length <= 100);
  const correct = inTime && valid && given !== "" && isCorrect(q, given as number | boolean | string);
  const points = questionPoints(correct, Math.min(elapsed, limit), limit);
  m.results.push(correct);
  m.points.push(points);
  m.times.push(Math.min(elapsed, limit + LATENCY_GRACE_MS));
  m.index += 1;
  m.servedAt = null;
  const reply = { correct, timedOut: !inTime, points, question: q, done: m.index >= m.questions.length };
  if (!reply.done) {
    await saveMatch(m);
    return { ...reply, result: null };
  }
  const { profile } = await loadProfile(m.uid, pseudo, now);
  const { result } = await finishMatch(m, profile, undefined, now);
  return { ...reply, result };
}

/** Termine une manche (questions restantes comptées fausses) et l'inscrit dans la semaine. */
export async function finishMatch(m: StoredMatch, profile: RankedProfile, forfeit: string | undefined, now = new Date()) {
  while (m.results.length < m.questions.length) {
    m.results.push(false);
    m.points.push(0);
    m.times.push(0);
  }
  m.index = m.questions.length;
  m.servedAt = null;
  m.finishedAt = now.getTime();
  m.score = matchScore(m.points);
  if (forfeit) m.forfeit = forfeit;
  await saveMatch(m);
  const { profile: next } = recordMatch(profile, m.subject, m.score, now);
  const saved = { ...next, active: next.active === m.id ? undefined : next.active };
  await putProfile(m.uid, saved);
  const result: MatchResult = {
    subject: m.subject,
    score: m.score,
    results: m.results,
    points: m.points,
    ...(forfeit ? { forfeit } : {}),
    rank: rankView(m.subject, saved.subjects[m.subject], now),
  };
  return { profile: saved, result };
}

/** Abandon volontaire : la manche compte avec les questions restantes fausses. */
export async function forfeitMatch(m: StoredMatch, pseudo: string, reason = "Manche abandonnée", now = new Date()) {
  const { profile } = await loadProfile(m.uid, pseudo, now);
  return (await finishMatch(m, profile, reason, now)).result;
}

/** Manche en cours du joueur (close d'office si elle traîne depuis trop longtemps). */
export async function activeMatch(uid: string, pseudo: string, now = new Date()) {
  const { profile } = await loadProfile(uid, pseudo, now);
  if (!profile.active) return null;
  const m = await getMatch(profile.active);
  if (!m || m.finishedAt) return null;
  if (now.getTime() - m.startedAt > MATCH_MAX_MS) {
    await finishMatch(m, profile, "Manche abandonnée", now);
    return null;
  }
  return m;
}

export const weekInfo = (now = new Date()) => ({ week: rankedWeek(now), endsInMs: msUntilWeekEnd(now) });

/** Le joueur a vu le résultat de sa dernière semaine dans une matière. */
export async function acknowledgeWeek(uid: string, pseudo: string, subject: RankedSubject) {
  const { profile } = await loadProfile(uid, pseudo);
  const r = profile.subjects[subject];
  if (!r?.last || r.last.seen) return;
  await putProfile(uid, { ...profile, subjects: { ...profile.subjects, [subject]: { ...r, last: { ...r.last, seen: true } } } });
}

/** Rang Général à recopier dans la sauvegarde (le badge affiché partout). */
export async function generalStep(uid: string): Promise<number | null> {
  const [p] = await getStore().hmget<RankedProfile>(HASH, [uid]);
  return p?.subjects.general?.step ?? null;
}

export { MATCH_SIZE };
