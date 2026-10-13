import "server-only";
import { randomBytes } from "node:crypto";
import { factKey } from "@/lib/content/generated";
import { rankedQuestions } from "@/lib/content/ranked-questions";
import {
  type GroupEntry,
  type Integrity,
  type Presence,
  type PresenceEvent,
  type PresenceOutcome,
  applyPresence,
  rankedDay,
  suspicion,
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
  RANK_EPOCH,
  MIN_MATCHES,
  newRankedProfile,
  parFor,
  rankRewards,
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
import { friendIds } from "./friends";
import { getStore } from "./store";

/**
 * Stockage du mode classé : hash `ranked` (id de compte → profil classé) et
 * `rkm:<id>` pour chaque manche (questions, réponses, chronos).
 * Le serveur tire les questions, envoie une question à la fois, chronomètre
 * et corrige : le téléphone ne connaît jamais la réponse avant d'avoir répondu.
 */

const HASH = "ranked";
const SEEN_KEPT = 2000;
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
  /** Présence du joueur (anti-triche). */
  presence?: Presence;
  /** Questions comptées fausses parce que le joueur a quitté l'appli. */
  voided?: number[];
  /** Manche perdue par sortie de l'appli (0 point, joker possible). */
  exitLoss?: boolean;
  /** Manche annulée par le joker du jour. */
  annulled?: boolean;
}

export interface MatchResult {
  matchId: string;
  subject: RankedSubject;
  score: number;
  results: boolean[];
  points: number[];
  forfeit?: string;
  rank: RankView;
  /** Perdue en quittant l'appli : le joker du jour peut l'annuler. */
  exitLoss?: boolean;
  jokerAvailable?: boolean;
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
  step: number;
  label: string;
  /** Rang obtenu (sinon : en placement, `placement` manches jouées). */
  placed: boolean;
  placement: number;
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
let resetDone = false;
/**
 * Remise à zéro des rangs (une fois par époque) : profils classés effacés et
 * rang retiré des profils publics. L'XP n'est pas touchée.
 */
export async function resetRanksIfNeeded() {
  if (resetDone) return;
  const store = getStore();
  if (await store.create(`rk:reset:${RANK_EPOCH}`, { at: Date.now() })) {
    await store.del(HASH);
    const players = await store.hgetall<PublicProfile>("players");
    for (const [uid, p] of Object.entries(players)) {
      const { titleId: _t, frameId: _f, ...rest } = p;
      await store.hset("players", uid, { ...rest, rp: 0 });
    }
  }
  resetDone = true;
}

export async function settleIfNeeded(now = new Date()) {
  await resetRanksIfNeeded();
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
  const current = stored && stored.epoch === RANK_EPOCH ? stored : null;
  let profile = current ?? newRankedProfile(pseudo, now);
  const seasoned = applySeason(profile, now);
  if (!current || seasoned !== profile || profile.pseudo !== pseudo) {
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
export async function groupFor(
  uid: string,
  subject: RankedSubject,
  now = new Date(),
): Promise<{ rows: GroupRow[]; top: GroupRow[]; friends: GroupRow[]; players: number }> {
  const store = getStore();
  const all = Object.fromEntries(Object.entries(await store.hgetall<RankedProfile>(HASH)).filter(([, p]) => p.epoch === RANK_EPOCH));
  const week = rankedWeek(now);
  const ranks = Object.entries(all).flatMap(([id, p]) => {
    const r = currentRank(p.subjects[subject], now);
    return r && r.placed ? [[id, r] as const] : [];
  });
  const active = ranks.filter(([id, r]) => r.week === week && (r.played > 0 || id === uid)).map(([id, r]) => entryOf(id, r));
  const mine = all[uid]?.subjects[subject];
  if (mine?.placed && !active.some((e) => e.id === uid)) active.push(entryOf(uid, currentRank(mine, now)!));
  const group = formGroups(active).find((g) => g.some((e) => e.id === uid)) ?? [];
  const friendList = [uid, ...(await friendIds(uid))];

  const ids = [...new Set([...group.map((e) => e.id), ...ranks.map(([id]) => id), ...friendList])];
  const publics = await store.hmget<PublicProfile>("players", ids);
  const pub = new Map(ids.map((id, i) => [id, publics[i]]));
  const row = (e: GroupEntry, zone: WeekZone, placed = true, placement = PLACEMENT_MATCHES): GroupRow => {
    const p = pub.get(e.id);
    return {
      id: publicPlayerId(e.id),
      pseudo: all[e.id]?.pseudo ?? p?.pseudo ?? "?",
      avatar: p?.avatar ?? "🙂",
      ...(p?.photoThumb ? { photoThumb: p.photoThumb } : {}),
      step: e.step,
      label: stepLabel(e.step),
      placed,
      placement,
      total: e.total,
      played: e.played,
      zone,
      isMe: e.id === uid,
    };
  };
  const ordered = standings(group);
  const classified = ordered.filter((e) => e.played >= MIN_MATCHES);
  const rows = ordered.map((e) => row(e, zoneFor(e, classified.indexOf(e) + 1, classified.length)));
  const top = ranks
    .map(([id, r]) => entryOf(id, r))
    .sort((a, b) => b.step - a.step || b.total - a.total)
    .slice(0, 50)
    .map((e) => row(e, "safe"));
  // Amis : classés d'abord (rang puis points de la semaine), puis ceux en placement.
  const friends = friendList
    .map((id) => {
      const r = currentRank(all[id]?.subjects[subject], now);
      return row(r ? entryOf(id, r) : { id, step: 0, total: 0, played: 0, avg: 0 }, "safe", r?.placed ?? false, r?.placement.length ?? 0);
    })
    .sort((a, b) => Number(b.placed) - Number(a.placed) || b.step - a.step || b.total - a.total || b.placement - a.placement);
  return { rows, top, friends, players: ranks.length };
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
  // Manche perdue en quittant l'appli et laissée sans réponse au joker : elle compte (0 point).
  if (profile.pendingLoss) profile = await settlePendingLoss(uid, profile, false, now);
  // Une manche laissée en plan compte telle quelle (pas de « je relance si ça se passe mal »).
  if (profile.active) {
    const old = await getMatch(profile.active);
    if (old && !old.finishedAt) profile = (await finishMatch(old, profile, "Nouvelle manche lancée avant la fin", now)).profile;
  }
  const id = newId();
  const step = currentRank(profile.subjects[subject], now)?.step ?? 0;
  const questions = rankedQuestions(subject, level, `${uid}:${id}`, profile.seen ?? []);
  const match: StoredMatch = {
    id,
    uid,
    subject,
    level,
    step,
    questions,
    index: 0,
    servedAt: now.getTime(),
    results: [],
    points: [],
    times: [],
    startedAt: now.getTime(),
    presence: { exits: 0, lastBeat: now.getTime() },
  };
  await saveMatch(match);
  profile = { ...profile, active: id, seen: [...(profile.seen ?? []).filter((k) => !questions.some((q) => factKey(q) === k)), ...questions.map(factKey)].slice(-SEEN_KEPT) };
  await putProfile(uid, profile);
  return { id, subject, ...servedQuestion(match) };
}

/** Envoie la question suivante (le chrono démarre maintenant). */
export async function serveNext(m: StoredMatch, pseudo: string, now = Date.now()) {
  if (m.finishedAt) throw new Error("Manche terminée.");
  const check = await presenceEvent(m, "beat", pseudo, new Date(now));
  if (check.outcome.kind === "lost") return { lost: check };
  if (m.servedAt === null) {
    m.servedAt = now;
    await saveMatch(m);
  }
  return { served: servedQuestion(m, now) };
}

/** Corrige une réponse ; la manche se termine après la dernière question. */
export async function answerQuestion(m: StoredMatch, index: number, given: unknown, pseudo: string, now = new Date()) {
  if (m.finishedAt) throw new Error("Manche terminée.");
  if (index !== m.index || m.servedAt === null) throw new Error("Question inattendue.");
  const check = await presenceEvent(m, "beat", pseudo, now);
  if (check.outcome.kind !== "ok") return { lost: check };
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
    return { reply: { ...reply, result: null } };
  }
  const { profile } = await loadProfile(m.uid, pseudo, now);
  const { result } = await finishMatch(m, profile, undefined, now);
  return { reply: { ...reply, result } };
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
  const { profile: recorded } = recordMatch(profile, m.subject, m.score, now);
  const flag = forfeit ? null : suspicion(m.questions, m.results, m.times);
  const next = flag ? { ...recorded, integrity: withFlag(recorded.integrity, { at: now.getTime(), reason: flag }) } : recorded;
  const saved = { ...next, active: next.active === m.id ? undefined : next.active };
  await putProfile(m.uid, saved);
  const result: MatchResult = {
    matchId: m.id,
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

/** Rang à recopier dans la sauvegarde (le badge affiché partout) : c'est le serveur qui fait foi. */
export async function rankForSave(uid: string): Promise<{ rp: number; peakRp: number }> {
  await resetRanksIfNeeded();
  const [p] = await getStore().hmget<RankedProfile>(HASH, [uid]);
  return rankRewards(p && p.epoch === RANK_EPOCH ? p : null);
}

export { MATCH_SIZE };

// ─────────────────────────── Anti-triche ───────────────────────────

const withFlag = (i: Integrity | undefined, flag: Integrity["flags"][number]): Integrity => ({
  flags: [...(i?.flags ?? []), flag].slice(-20),
  reports: i?.reports ?? [],
});

export interface PresenceReply {
  outcome: PresenceOutcome;
  exits: number;
  /** La question en cours a été comptée fausse (sortie). */
  voided: boolean;
  /** La manche est finie (dernière question annulée, ou perdue). */
  result: MatchResult | null;
  /** Question en cours côté serveur (le téléphone rattrape une question annulée pendant son absence). */
  index: number;
}

/** Perd la manche (0 point) ; elle n'est inscrite qu'après le choix du joker. */
async function loseByExit(m: StoredMatch, reason: string, now: Date): Promise<MatchResult> {
  while (m.results.length < m.questions.length) {
    m.results.push(false);
    m.points.push(0);
    m.times.push(0);
  }
  m.index = m.questions.length;
  m.servedAt = null;
  m.finishedAt = now.getTime();
  m.score = 0;
  m.forfeit = reason;
  m.exitLoss = true;
  await saveMatch(m);
  const [stored] = await getStore().hmget<RankedProfile>(HASH, [m.uid]);
  const p = stored;
  if (p) await putProfile(m.uid, { ...p, active: p.active === m.id ? undefined : p.active, pendingLoss: m.id });
  return {
    matchId: m.id,
    subject: m.subject,
    score: 0,
    results: m.results,
    points: m.points,
    forfeit: reason,
    exitLoss: true,
    jokerAvailable: p?.jokerDay !== rankedDay(now),
    rank: rankView(m.subject, p?.subjects[m.subject], now),
  };
}

/**
 * Signal de présence du téléphone : sortie (la question en cours compte
 * fausse), retour, ou simple battement. Deux sorties, ou plus de 10 s dehors,
 * font perdre la manche.
 */
export async function presenceEvent(m: StoredMatch, event: PresenceEvent, pseudo: string, now = new Date(), awayMs = 0): Promise<PresenceReply> {
  let before = m.presence ?? { exits: 0, lastBeat: m.servedAt ?? m.startedAt };
  // Manche déjà finie (perdue pendant l'absence, signal parti par sendBeacon) : le téléphone découvre le résultat.
  if (m.finishedAt) return { outcome: m.exitLoss ? { kind: "lost", reason: m.forfeit ?? "Sortie de l'appli" } : { kind: "ok" }, exits: before.exits, voided: false, result: await storedResult(m, now), index: m.index };
  // Retour annoncé par le téléphone alors que le signal de sortie n'est jamais arrivé.
  if (event === "visible" && before.hiddenAt === undefined && awayMs > 500) {
    const hidden = applyPresence(before, "hidden", now.getTime() - Math.min(awayMs, 3_600_000));
    if (hidden.outcome.kind === "lost") {
      m.presence = hidden.presence;
      return { outcome: hidden.outcome, exits: hidden.presence.exits, voided: false, result: await loseByExit(m, hidden.outcome.reason, now), index: m.index };
    }
    before = hidden.presence;
    if (hidden.outcome.kind === "strike") {
      const back = applyPresence(before, "visible", now.getTime());
      if (back.outcome.kind === "lost") {
        m.presence = back.presence;
        return { outcome: back.outcome, exits: back.presence.exits, voided: false, result: await loseByExit(m, back.outcome.reason, now), index: m.index };
      }
      m.presence = back.presence;
      return voidCurrent(m, hidden.outcome, back.presence.exits, pseudo, now);
    }
  }
  const { presence, outcome } = applyPresence(before, event, now.getTime());
  m.presence = presence;
  if (outcome.kind === "lost") return { outcome, exits: presence.exits, voided: false, result: await loseByExit(m, outcome.reason, now), index: m.index };
  if (outcome.kind === "strike") return voidCurrent(m, outcome, presence.exits, pseudo, now);
  await saveMatch(m);
  return { outcome, exits: presence.exits, voided: false, result: null, index: m.index };
}

/** Sortie : la question en cours (s'il y en a une) compte fausse. */
async function voidCurrent(m: StoredMatch, outcome: PresenceOutcome, exits: number, pseudo: string, now: Date): Promise<PresenceReply> {
  if (m.servedAt !== null) {
    const limit = secondsFor(m.step, m.questions[m.index]) * 1000;
    m.voided = [...(m.voided ?? []), m.index];
    m.results.push(false);
    m.points.push(0);
    m.times.push(limit);
    m.index += 1;
    m.servedAt = null;
    if (m.index >= m.questions.length) {
      const { profile } = await loadProfile(m.uid, pseudo, now);
      const { result } = await finishMatch(m, profile, undefined, now);
      return { outcome, exits, voided: true, result, index: m.index };
    }
    await saveMatch(m);
    return { outcome, exits, voided: true, result: null, index: m.index };
  }
  await saveMatch(m);
  return { outcome, exits, voided: false, result: null, index: m.index };
}

/** Résultat d'une manche déjà terminée. */
async function storedResult(m: StoredMatch, now: Date): Promise<MatchResult> {
  const [p] = await getStore().hmget<RankedProfile>(HASH, [m.uid]);
  const pending = !!p && p.pendingLoss === m.id;
  return {
    matchId: m.id,
    subject: m.subject,
    score: m.score ?? 0,
    results: m.results,
    points: m.points,
    ...(m.forfeit ? { forfeit: m.forfeit } : {}),
    ...(m.exitLoss && pending ? { exitLoss: true, jokerAvailable: p.jokerDay !== rankedDay(now) } : {}),
    rank: rankView(m.subject, p?.subjects[m.subject], now),
  };
}

/** Manche perdue en quittant l'appli : joker (annulée, une fois par jour) ou 0 point inscrit. */
async function settlePendingLoss(uid: string, profile: RankedProfile, useJoker: boolean, now: Date): Promise<RankedProfile> {
  const id = profile.pendingLoss;
  if (!id) return profile;
  const m = await getMatch(id);
  const today = rankedDay(now);
  let next: RankedProfile = { ...profile, pendingLoss: undefined };
  if (m && useJoker && profile.jokerDay !== today) {
    m.annulled = true;
    await saveMatch(m);
    next = { ...next, jokerDay: today };
  } else if (m) {
    next = recordMatch(next, m.subject, 0, now).profile;
  }
  await putProfile(uid, next);
  return next;
}

export async function resolvePendingLoss(uid: string, pseudo: string, matchId: string, useJoker: boolean, now = new Date()) {
  const { profile } = await loadProfile(uid, pseudo, now);
  if (profile.pendingLoss !== matchId) throw new Error("Rien à annuler pour cette manche.");
  if (useJoker && profile.jokerDay === rankedDay(now)) throw new Error("Joker du jour déjà utilisé.");
  const m = await getMatch(matchId);
  const next = await settlePendingLoss(uid, profile, useJoker, now);
  return { annulled: useJoker, rank: m ? rankView(m.subject, next.subjects[m.subject], now) : null };
}

/** Manche perdue en attente de décision (affichée si le joueur revient plus tard). */
export async function pendingLossInfo(profile: RankedProfile, now = new Date()) {
  if (!profile.pendingLoss) return null;
  const m = await getMatch(profile.pendingLoss);
  if (!m) return null;
  return { id: m.id, subject: m.subject, reason: m.forfeit ?? "Sortie de l'appli", jokerAvailable: profile.jokerDay !== rankedDay(now) };
}

/** Signalement d'un joueur (un par joueur signalant). */
export async function reportPlayer(reporterUid: string, publicId: string, now = Date.now()) {
  const store = getStore();
  const all = await store.hgetall<RankedProfile>(HASH);
  const uid = Object.keys(all).find((id) => publicPlayerId(id) === publicId);
  if (!uid) throw new Error("Joueur introuvable.");
  if (uid === reporterUid) throw new Error("Tu ne peux pas te signaler toi-même.");
  const p = all[uid];
  const i = p.integrity ?? { flags: [], reports: [] };
  if (i.reports.some((r) => r.by === reporterUid)) return { already: true };
  await putProfile(uid, { ...p, integrity: { ...i, reports: [...i.reports, { by: reporterUid, at: now }].slice(-50) } });
  return { already: false };
}
