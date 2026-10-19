import "server-only";
import { randomBytes } from "node:crypto";
import { chaptersFor, subjectMeta, subjectsForLevel } from "@/lib/content/curriculum";
import { chapterQuestions, factKey, hasGenerators } from "@/lib/content/generated";
import {
  MATCH_PLAYERS,
  type Match,
  type MatchSize,
  type PlayerAnswer,
  type Vote,
  type MatchPlayer,
  QUEUE_WAIT_MS,
  VOTE_MS,
  botVotes,
  makeBot,
  markAway,
  matchXp,
  phaseAt,
  questionMs,
  resultOf,
  rpDelta,
  standings,
  submitAnswer,
  tick,
} from "@/lib/game/match";
import { hashString, seededRandom, shuffle } from "@/lib/game/quests";
import { BOARD_SIZE, DAILY_SUBJECT_BONUS, OFFERED_KEPT, type RankProfile, RANK_EPOCH, applyResult, chooseChapters, currentWeek, newRankProfile, publicQuestion, rankedWeek, subjectOfDay, subjectRestUntil, varietyBonus } from "@/lib/game/ranked";
import { rankFromRp } from "@/lib/game/progression";
import type { PublicProfile } from "@/lib/game/save";
import { isCorrect } from "@/lib/game/session";
import type { Level, SubjectId } from "@/lib/types";
import { getSave } from "./accounts";
import { publicPlayerId } from "./auth";
import { friendIds } from "./friends";
import { withLock } from "./lock";
import { indexPublicId } from "./players";
import { getStore } from "./store";

/**
 * Classé en parties à 3, 5 ou 7 : file d'attente par matière, niveau et format
 * (3 s, puis bots au niveau du joueur), parties `match:<id>` et profils de rang (hash `rank3`).
 * Le serveur tire les questions, chronomètre et corrige.
 */

const RANKS = `rank${RANK_EPOCH}`;
const SEEN_KEPT = 2000;
const TICKET_TTL_MS = 20_000;

interface Ticket {
  id: string;
  uid: string;
  pseudo: string;
  subject: SubjectId;
  level: Level;
  rp: number;
  at: number;
  /** Nombre de joueurs voulu (3, 5 ou 7). */
  size?: MatchSize;
  matchId?: string;
}

const newId = () => randomBytes(9).toString("base64url");

/** Refus attendu (pas une panne du stockage) : message pour le joueur et statut HTTP. */
export class RankedError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// ─────────────────────────── Profils de rang ───────────────────────────

let resetDone = false;
/** Nouvelle époque : rang retiré des profils publics (une seule fois). L'XP n'est pas touchée. */
export async function resetRanksIfNeeded() {
  if (resetDone) return;
  const store = getStore();
  if (await store.create(`rk:reset:${RANK_EPOCH}`, { at: Date.now() })) {
    const players = await store.hgetall<PublicProfile>("players");
    for (const [uid, p] of Object.entries(players)) {
      const { titleId: _t, frameId: _f, ...rest } = p;
      await store.hset("players", uid, { ...rest, rp: 0 });
    }
  }
  resetDone = true;
}

export async function getRank(uid: string, pseudo: string): Promise<RankProfile> {
  const [p] = await getStore().hmget<RankProfile>(RANKS, [uid]);
  return currentWeek(p ?? newRankProfile(pseudo, rankedWeek()), rankedWeek());
}
const putRank = (uid: string, p: RankProfile) => getStore().hset(RANKS, uid, p);

/**
 * Modifie le profil de rang sous verrou : la fin d'une partie (points) et le
 * lancement d'une autre (partie en cours, thèmes proposés) ne s'écrasent plus.
 * Indexe aussi l'identifiant public : le joueur apparaît aux classements dès sa
 * première partie, même s'il n'a jamais sauvegardé (fiche, ajout en ami).
 */
async function updateRank(uid: string, pseudo: string, change: (p: RankProfile) => RankProfile): Promise<RankProfile> {
  return withLock(`rkl:${uid}`, async () => {
    const next = change(await getRank(uid, pseudo));
    await Promise.all([putRank(uid, next), indexPublicId(uid)]);
    return next;
  });
}

/** Rang à recopier dans la sauvegarde (badge affiché partout) : c'est le serveur qui fait foi. */
export async function rankForSave(uid: string): Promise<{ rp: number; peakRp: number }> {
  await resetRanksIfNeeded();
  const [p] = await getStore().hmget<RankProfile>(RANKS, [uid]);
  return { rp: p?.rp ?? 0, peakRp: p?.peak ?? 0 };
}

/** Habillage d'une ligne de classement : titre, cadre et bannière choisis par le joueur. */
export interface RowLook {
  titleId?: string;
  frameId?: string;
  bannerId?: string;
  bannerThumb?: string;
}

/** Nombre de premières lignes qui reçoivent la miniature de bannière envoyée (poids de la réponse). */
const BANNER_ROWS = 30;

function look(pub: PublicProfile | null | undefined): RowLook {
  if (!pub) return {};
  return {
    ...(pub.titleId ? { titleId: pub.titleId } : {}),
    ...(pub.frameId ? { frameId: pub.frameId } : {}),
    ...(pub.bannerId ? { bannerId: pub.bannerId } : {}),
    ...(pub.bannerThumb ? { bannerThumb: pub.bannerThumb } : {}),
  };
}

/** Retire les miniatures de bannière hors du haut des classements, de mes amis et de moi. */
function trimBanners<T extends RowLook & { place: number; weekPlace?: number; isMe: boolean; friend: boolean }>(rows: T[]): T[] {
  return rows.map((r) => {
    if (!r.bannerThumb || r.place <= BANNER_ROWS || (r.weekPlace ?? Infinity) <= BANNER_ROWS || r.isMe || r.friend) return r;
    const { bannerThumb: _b, bannerId: _i, ...rest } = r;
    return rest as T;
  });
}

export interface BoardRow extends RowLook {
  id: string;
  /** Place au classement de la semaine (lignes qui y figurent). */
  weekPlace?: number;
  pseudo: string;
  avatar: string;
  photoThumb?: string;
  rp: number;
  label: string;
  weekDelta: number;
  games: number;
  wins: number;
  isMe: boolean;
  friend: boolean;
  place: number;
}

/**
 * Lignes envoyées : les `BOARD_SIZE` premiers du général et ceux de la semaine
 * (classée sur `weekValue`, parmi les lignes où `inWeek` est vrai, plus la mienne),
 * ma ligne et celles de mes amis, même plus loin. `place` : place au général.
 */
export function boardRows<T extends { isMe: boolean; friend: boolean }>(sorted: T[], weekValue: (r: T) => number, inWeek: (r: T) => boolean): (T & { place: number; weekPlace?: number })[] {
  const rows = sorted.map((r, i) => ({ ...r, place: i + 1 }));
  const week = rows.filter((r) => r.isMe || inWeek(r)).sort((a, b) => weekValue(b) - weekValue(a) || a.place - b.place);
  const weekPlace = new Map(week.map((r, i) => [r, i + 1]));
  return rows
    .filter((r) => r.place <= BOARD_SIZE || (weekPlace.get(r) ?? Infinity) <= BOARD_SIZE || r.isMe || r.friend)
    .map((r) => (weekPlace.has(r) ? { ...r, weekPlace: weekPlace.get(r)! } : r));
}

/** Classement général des rangs (avec l'évolution de la semaine). */
export async function rankBoard(uid: string): Promise<BoardRow[]> {
  const store = getStore();
  const all = await store.hgetall<RankProfile>(RANKS);
  const ids = Object.keys(all);
  const publics = await store.hmget<PublicProfile>("players", ids);
  const friends = new Set(await friendIds(uid));
  const week = rankedWeek();
  const rows = ids
    .map((id, i) => {
      const p = currentWeek(all[id], week);
      const pub = publics[i];
      return {
        id: publicPlayerId(id),
        pseudo: p.pseudo,
        avatar: pub?.avatar ?? "🙂",
        ...(pub?.photoThumb ? { photoThumb: pub.photoThumb } : {}),
        ...look(pub),
        rp: p.rp,
        label: rankFromRp(p.rp).label,
        weekDelta: p.weekDelta,
        games: p.games,
        wins: p.wins,
        isMe: id === uid,
        friend: friends.has(id),
      };
    })
    .filter((r) => r.games > 0 || r.isMe)
    .sort((a, b) => b.rp - a.rp || b.weekDelta - a.weekDelta);
  return trimBanners(boardRows(rows, (r) => r.weekDelta, (r) => r.weekDelta !== 0));
}

export interface XpRow extends RowLook {
  id: string;
  /** Place au classement de la semaine (lignes qui y figurent). */
  weekPlace?: number;
  pseudo: string;
  avatar: string;
  photoThumb?: string;
  xp: number;
  playerLevel: number;
  weeklyXp: number;
  rp: number;
  isMe: boolean;
  friend: boolean;
  place: number;
}

/** Classement général de l'XP : toute l'XP gagnée depuis l'inscription. */
export async function xpBoard(uid: string): Promise<XpRow[]> {
  const all = await getStore().hgetall<PublicProfile>("players");
  const friends = new Set(await friendIds(uid));
  const week = rankedWeek();
  const rows = Object.entries(all)
    .map(([id, p]) => ({
      id: publicPlayerId(id),
      pseudo: p.pseudo,
      avatar: p.avatar ?? "🙂",
      ...(p.photoThumb ? { photoThumb: p.photoThumb } : {}),
      ...look(p),
      xp: p.xp ?? 0,
      playerLevel: p.playerLevel ?? 1,
      weeklyXp: p.week === week ? p.weeklyXp ?? 0 : 0,
      rp: p.rp ?? 0,
      isMe: id === uid,
      friend: friends.has(id),
    }))
    .sort((a, b) => b.xp - a.xp);
  return trimBanners(boardRows(rows, (r) => r.weeklyXp, (r) => r.weeklyXp > 0));
}

// ─────────────────────────── File d'attente ───────────────────────────

/** Une file par matière, par niveau (les chapitres en dépendent) et par format de partie. */
const sizeTag = (n: number) => (n === MATCH_PLAYERS ? "" : `:${n}`);
const queueKey = (s: SubjectId, l: Level, n: number = MATCH_PLAYERS) => `mmq:${s}:${l}${sizeTag(n)}`;
const queueLock = (s: SubjectId, l: Level, n: number = MATCH_PLAYERS) => `mml:${s}:${l}${sizeTag(n)}`;
const sizeOf = (t: Pick<Ticket, "size">) => t.size ?? MATCH_PLAYERS;
const ticketKey = (id: string) => `mmt:${id}`;
/** Dernière recherche lancée par le joueur : une seule à la fois, toutes files confondues. */
const userTicketKey = (uid: string) => `mmu:${uid}`;
const matchKey = (id: string) => `match:${id}`;

/**
 * Actions des joueurs humains (réponses, sorties d'appli, votes) : chacune dans
 * son propre champ du hash `mact:<id>`, écrit une seule fois (HSETNX). Le
 * document de la partie n'est réécrit qu'aux changements de phase, sous verrou :
 * une requête concurrente ne peut donc plus effacer une réponse.
 */
const actsKey = (id: string) => `mact:${id}`;
const answerField = (uid: string, i: number) => `a:${uid}:${i}`;
const awayField = (uid: string, i: number) => `w:${uid}:${i}`;
const voteField = (uid: string) => `v:${uid}`;

/** Ajoute au document les actions enregistrées à part. */
export function mergeActions(m: Match, acts: Record<string, unknown>): Match {
  for (const [field, value] of Object.entries(acts)) {
    const kind = field.slice(0, 2);
    if (kind === "v:") {
      const uid = field.slice(2);
      if (!m.votes[uid]) m.votes[uid] = value as Vote;
      continue;
    }
    const cut = field.lastIndexOf(":");
    const uid = field.slice(2, cut);
    const i = Number(field.slice(cut + 1));
    if (!Number.isInteger(i) || i < 0) continue;
    if (kind === "a:") {
      const list = (m.answers[uid] ??= []);
      if (!list[i]) list[i] = value as PlayerAnswer;
    } else if (kind === "w:") {
      const list = (m.away[uid] ??= []);
      if (!list.includes(i)) list.push(i);
    }
  }
  // Une réponse enregistrée l'emporte sur une sortie signalée en même temps.
  for (const [uid, list] of Object.entries(m.away)) m.away[uid] = list.filter((i) => !m.answers[uid]?.[i]);
  return m;
}

/** Les actions d'un document, au format du hash (pour les fusionner dans une autre version). */
function actionsOf(m: Match): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of m.players.filter((x) => !x.bot)) {
    if (m.votes[p.id]) out[voteField(p.id)] = m.votes[p.id];
    (m.answers[p.id] ?? []).forEach((a, i) => a && (out[answerField(p.id, i)] = a));
    for (const i of m.away[p.id] ?? []) out[awayField(p.id, i)] = 1;
  }
  return out;
}

export async function getMatch(id: string): Promise<Match | null> {
  const store = getStore();
  const [m, acts] = await Promise.all([store.get<Match>(matchKey(id)), store.hgetall<unknown>(actsKey(id))]);
  return m ? mergeActions(m, acts) : null;
}
const saveMatch = (m: Match) => getStore().set(matchKey(m.id), m);

/** Recherches encore valables d'une file : récentes, sans partie, et pas remplacées par une autre recherche du même joueur. */
async function freshQueue(subject: SubjectId, level: Level, size: number, now: number): Promise<Ticket[]> {
  const store = getStore();
  const q = ((await store.get<Ticket[]>(queueKey(subject, level, size))) ?? []).filter((t) => !t.matchId && now - t.at < TICKET_TTL_MS);
  const current = await store.mget<string>(q.map((t) => userTicketKey(t.uid)));
  return q.filter((t, i) => current[i] === t.id);
}

/** Partie pas encore terminée du joueur, s'il en a une. */
async function ongoingMatch(uid: string, pseudo: string): Promise<string | null> {
  const rank = await getRank(uid, pseudo);
  if (!rank.active) return null;
  const m = await getMatch(rank.active);
  return m && phaseAt(m, Date.now()).phase !== "done" ? m.id : null;
}

/** Entrer en file : une partie se forme dès qu'il y a assez de joueurs ; sinon on attend (3 s max, puis bots). */
export async function joinQueue(uid: string, pseudo: string, subject: SubjectId, size: MatchSize = MATCH_PLAYERS): Promise<{ ticket?: string; matchId?: string }> {
  await resetRanksIfNeeded();
  let rank = await getRank(uid, pseudo);
  if (rank.active) {
    const m = await getMatch(rank.active);
    if (m) {
      // Partie précédente finie mais pas encore comptée : on la compte d'abord (points, repos de la matière).
      await advance(m);
      if (phaseAt(m, Date.now()).phase !== "done") return { matchId: m.id };
      rank = await getRank(uid, pseudo);
    }
  }
  const save = await getSave(uid);
  const level = save?.save.profile?.level ?? "seconde";
  // Matière hors programme du niveau : pas de chapitre à proposer.
  if (!subjectsForLevel(level).some((s) => s.id === subject)) throw new RankedError(`${subjectMeta(subject).name} n'est pas au programme de ton niveau.`, 400);
  const until = subjectRestUntil(rank.history, subject);
  if (until > 0) {
    const min = Math.max(1, Math.ceil((until - Date.now()) / 60_000));
    throw new RankedError(`Tu as joué tes 3 dernières parties en ${subjectMeta(subject).name} : fais une partie dans une autre matière, ou reviens dans ${min} min.`, 409);
  }
  const ticket: Ticket = { id: newId(), uid, pseudo, subject, level, rp: rank.rp, at: Date.now(), size };
  // Cette recherche remplace les précédentes (autre matière, autre format) : pas plusieurs parties en même temps.
  await getStore().set(userTicketKey(uid), ticket.id);
  return withLock(queueLock(subject, ticket.level, size), async () => {
    const store = getStore();
    const queue = (await freshQueue(subject, ticket.level, size, ticket.at)).filter((t) => t.uid !== uid);
    if (queue.length >= size - 1) {
      const mates = queue.slice(0, size - 1);
      const m = await createMatch([ticket, ...mates], size);
      await store.set(queueKey(subject, ticket.level, size), queue.filter((t) => !mates.includes(t)));
      for (const t of mates) await store.set(ticketKey(t.id), { ...t, matchId: m.id });
      return { matchId: m.id };
    }
    await store.set(queueKey(subject, ticket.level, size), [...queue, ticket]);
    await store.set(ticketKey(ticket.id), ticket);
    return { ticket: ticket.id };
  });
}

/** Où en est la recherche : partie trouvée, ou au bout de 3 s, partie complétée par des bots. */
export async function pollQueue(uid: string, ticketId: string): Promise<{ matchId?: string; elapsedMs: number }> {
  const store = getStore();
  const t = await store.get<Ticket>(ticketKey(ticketId));
  if (!t || t.uid !== uid) throw new RankedError("Recherche introuvable.", 404);
  if (t.matchId) return { matchId: t.matchId, elapsedMs: Date.now() - t.at };
  const elapsedMs = Date.now() - t.at;
  if (elapsedMs < QUEUE_WAIT_MS) return { elapsedMs };
  const size = sizeOf(t);
  return withLock(queueLock(t.subject, t.level, size), async () => {
    const again = await store.get<Ticket>(ticketKey(ticketId));
    if (again?.matchId) return { matchId: again.matchId, elapsedMs };
    // Recherche annulée ou remplacée par une nouvelle (ici ou dans une autre file) : elle ne doit pas lancer de partie.
    const stored = (await store.get<Ticket[]>(queueKey(t.subject, t.level, size))) ?? [];
    if (!again || !stored.some((x) => x.id === t.id) || (await store.get<string>(userTicketKey(uid))) !== t.id) throw new RankedError("Recherche introuvable.", 404);
    // Déjà en partie (lancée depuis une autre recherche) : pas une deuxième en même temps.
    if (await ongoingMatch(uid, t.pseudo)) throw new RankedError("Recherche introuvable.", 404);
    const queue = (await freshQueue(t.subject, t.level, size, Date.now())).filter((x) => x.id !== t.id && x.uid !== uid);
    const mates = queue.slice(0, size - 1);
    const m = await createMatch([t, ...mates], size);
    await store.set(queueKey(t.subject, t.level, size), queue.filter((x) => !mates.includes(x)));
    for (const x of [t, ...mates]) await store.set(ticketKey(x.id), { ...x, matchId: m.id });
    return { matchId: m.id, elapsedMs };
  });
}

export async function cancelQueue(uid: string, ticketId: string) {
  const store = getStore();
  const t = await store.get<Ticket>(ticketKey(ticketId));
  if (!t || t.uid !== uid || t.matchId) return;
  await withLock(queueLock(t.subject, t.level, sizeOf(t)), async () => {
    const queue = (await store.get<Ticket[]>(queueKey(t.subject, t.level, sizeOf(t)))) ?? [];
    await store.set(queueKey(t.subject, t.level, sizeOf(t)), queue.filter((x) => x.id !== t.id));
  });
  await store.del(ticketKey(ticketId));
}

/** Deux chapitres au hasard (avec des questions) de la matière, en évitant ceux proposés récemment aux joueurs. */
function pickChapters(subject: SubjectId, level: Level, recent: string[]): [string, string] {
  const pool = chaptersFor(subject, level).filter((c) => hasGenerators(c.id));
  const list = pool.length >= 2 ? pool : chaptersFor(subject, level);
  return chooseChapters(list.map((c) => c.id), recent);
}

async function createMatch(tickets: Ticket[], size: number = MATCH_PLAYERS): Promise<Match> {
  const store = getStore();
  const id = newId();
  const now = Date.now();
  const publics = await store.hmget<PublicProfile>("players", tickets.map((t) => t.uid));
  const humans: MatchPlayer[] = tickets.map((t, i) => ({
    id: t.uid,
    bot: false,
    pseudo: t.pseudo,
    avatar: publics[i]?.avatar ?? "🙂",
    ...(publics[i]?.photoThumb ? { photoThumb: publics[i]!.photoThumb } : {}),
    rp: t.rp,
  }));
  const r = seededRandom(hashString(`mk:${id}`));
  const ranks = await Promise.all(humans.map((h) => getRank(h.id, h.pseudo)));
  // Thèmes proposés récemment à l'un des joueurs, les plus récents en dernier.
  const recentOffers = ranks.flatMap((p) => p.offered ?? []);
  const avgRp = humans.reduce((s, h) => s + h.rp, 0) / humans.length;
  const players = [...humans];
  while (players.length < size) players.push(makeBot(avgRp, r, players.map((p) => p.pseudo)));
  const m: Match = {
    id,
    subject: tickets[0].subject,
    level: tickets[0].level,
    createdAt: now,
    players,
    chapters: pickChapters(tickets[0].subject, tickets[0].level, recentOffers),
    votes: {},
    chapterId: null,
    voteEnd: null,
    questions: [],
    starts: [],
    ends: [],
    answers: {},
    botPlans: {},
    away: {},
    finishedAt: null,
    bonus: tickets[0].subject === dailySubject(tickets[0].level),
    variety: Object.fromEntries(humans.map((h, i) => [h.id, varietyBonus(ranks[i].history, { subject: tickets[0].subject, size })])),
  };
  m.votes = botVotes(m);
  await saveMatch(m);
  for (const h of humans) {
    await updateRank(h.id, h.pseudo, (p) => ({ ...p, active: id, offered: [...(p.offered ?? []).filter((c) => !m.chapters.includes(c)), ...m.chapters].slice(-OFFERED_KEPT) }));
  }
  return m;
}

// ─────────────────────────── Déroulé ───────────────────────────

/** Fait avancer la partie, l'enregistre si elle a changé, et distribue les points à la fin (une seule fois). */
export async function advance(m: Match, now = Date.now()): Promise<Match> {
  let seen: string[] = [];
  if (!m.chapterId) {
    for (const p of m.players.filter((x) => !x.bot)) seen = seen.concat((await getRank(p.id, p.pseudo)).seen ?? []);
  }
  const make = (chapterId: string, seed: string) =>
    chapterQuestions(chapterId, 10, seededRandom(hashString(`q:${seed}`)), seen).map((q, i) => ({ ...q, id: `mq-${i}` }));
  if (tick(structuredClone(m), now, make)) {
    // Changement de phase : sous verrou, sur la version la plus récente (avec toutes les actions).
    await withLock(`mlk:${m.id}`, async () => {
      const fresh = (await getMatch(m.id)) ?? m;
      mergeActions(fresh, actionsOf(m));
      if (tick(fresh, now, make)) await saveMatch(fresh);
      Object.assign(m, fresh);
    });
  }
  if (m.finishedAt !== null && now >= m.finishedAt) await settle(m);
  return m;
}

/** Matière du jour pour un niveau. */
export const dailySubject = (level: Level, now = new Date()) => subjectOfDay(subjectsForLevel(level).map((s) => s.id), now) as SubjectId;

/** Pour chaque matière : heure de fin de repos (0 = jouable). */
export function subjectLocks(rank: RankProfile, level: Level): Record<string, number> {
  return Object.fromEntries(subjectsForLevel(level).map((s) => [s.id, subjectRestUntil(rank.history, s.id)]));
}

/** Points de rang de fin de partie, pour chaque joueur (bonus du jour et jauge de variété compris). */
export function deltas(m: Match): Record<string, number> {
  const s = standings(m);
  return Object.fromEntries(
    s.map((row) => {
      const p = m.players.find((x) => x.id === row.playerId)!;
      const d = rpDelta(row.place, p.rp, row.correct, m.questions.length, m.players.length);
      // Matière du jour (+25 %) et jauge de variété (−30 % à +15 %) : sur les points gagnés seulement.
      const boost = (m.bonus ? DAILY_SUBJECT_BONUS : 0) + (m.variety?.[p.id] ?? 0);
      return [p.id, boost && d > 0 ? Math.max(1, Math.round(d * (1 + boost))) : d];
    }),
  );
}

async function settle(m: Match) {
  const store = getStore();
  if (!(await store.create(`match:settled:${m.id}`, { at: Date.now() }))) return;
  const s = standings(m);
  const d = deltas(m);
  const week = rankedWeek();
  for (const row of s) {
    const p = m.players.find((x) => x.id === row.playerId)!;
    if (p.bot) continue;
    const facts = m.questions.map(factKey);
    await updateRank(p.id, p.pseudo, (prof) => {
      const next = applyResult(prof, { at: Date.now(), subject: m.subject, place: row.place, correct: row.correct, delta: d[p.id], ...(m.players.length !== MATCH_PLAYERS ? { size: m.players.length } : {}) }, week);
      // Une partie lancée entre-temps reste la partie en cours.
      return { ...next, active: prof.active === m.id ? undefined : prof.active, seen: [...(prof.seen ?? []).filter((k) => !facts.includes(k)), ...facts].slice(-SEEN_KEPT) };
    });
  }
}

export async function vote(m: Match, uid: string, chapter: string) {
  const now = Date.now();
  // Vote fermé (même si personne n'a encore fait avancer la partie) : il ne compte plus.
  if (m.chapterId || now >= m.createdAt + VOTE_MS || !m.chapters.includes(chapter) || m.votes[uid]) return false;
  const v: Vote = { chapter, at: now };
  if (!(await getStore().hcreate(actsKey(m.id), voteField(uid), v))) return false;
  m.votes[uid] = v;
  return true;
}

export async function answer(m: Match, uid: string, index: number, given: string | number | boolean) {
  const now = Date.now();
  await advance(m, now);
  const q = m.questions[index];
  if (!q) return { status: "wrong-question" as const };
  const correct = typeof given !== "string" || given.trim() !== "" ? isCorrect(q, given) : false;
  const status = submitAnswer(m, uid, index, given, correct, now);
  if (status !== "ok") return { status };
  if (!(await getStore().hcreate(actsKey(m.id), answerField(uid, index), m.answers[uid][index]))) return { status: "already" as const };
  await advance(m, Date.now());
  return { status, correct, question: q };
}

export async function away(m: Match, uid: string) {
  await advance(m);
  const { index } = phaseAt(m, Date.now());
  if (markAway(m, uid, Date.now())) await getStore().hcreate(actsKey(m.id), awayField(uid, index), 1);
}

// ─────────────────────────── Vue envoyée au téléphone ───────────────────────────

export function viewFor(m: Match, uid: string, now = Date.now()) {
  const { phase, index } = phaseAt(m, now);
  const revealed = phase === "reveal" || phase === "done" ? index + 1 : index;
  const s = standings({ ...m, ends: m.ends.slice(0, Math.max(0, revealed)) });
  const d = phase === "done" ? deltas(m) : {};
  const pid = (p: MatchPlayer) => (p.bot ? p.id : publicPlayerId(p.id));
  const players = m.players.map((p) => {
    const row = s.find((x) => x.playerId === p.id)!;
    const current = phase === "question" ? (p.bot ? (() => { const plan = m.botPlans[p.id]?.[index]; return !!plan && plan.ms !== null && m.starts[index] + plan.ms <= now; })() : !!m.answers[p.id]?.[index] || !!m.away[p.id]?.includes(index)) : false;
    const last = phase === "reveal" || phase === "done" ? resultOf(m, p, index) : null;
    return {
      id: pid(p),
      pseudo: p.pseudo,
      avatar: p.avatar,
      ...(p.photoThumb ? { photoThumb: p.photoThumb } : {}),
      bot: p.bot,
      label: rankFromRp(p.rp).label,
      rp: p.rp,
      isMe: p.id === uid,
      score: row.correct,
      totalMs: row.totalMs,
      place: row.place,
      answered: current,
      voted: !!m.votes[p.id] && m.votes[p.id].at <= now,
      last,
      ...(phase === "done" ? { delta: d[p.id] ?? 0, xp: p.id === uid ? matchXp(row.place, row.correct, m.players.length) : 0 } : {}),
    };
  });
  const q = index >= 0 ? m.questions[index] : undefined;
  const mine = q ? m.answers[uid]?.[index] ?? null : null;
  return {
    id: m.id,
    subject: m.subject,
    serverNow: now,
    phase,
    index,
    total: m.questions.length || 10,
    size: m.players.length,
    players,
    chapters: m.chapters,
    chapterId: m.chapterId,
    voteEndsAt: m.createdAt + VOTE_MS,
    myVote: m.votes[uid]?.chapter ?? null,
    startsAt: index >= 0 ? m.starts[index] ?? null : null,
    endsAt: q && index >= 0 && m.starts[index] !== undefined ? m.starts[index] + questionMs(q) : null,
    nextAt: phase === "reveal" ? m.starts[index + 1] ?? m.finishedAt : phase === "intro" ? m.starts[0] : null,
    // Pendant le compte à rebours, rien de la 1re question ; pendant la question, sans la réponse (sauf si j'ai répondu).
    question: q && phase !== "intro" ? (phase === "question" && !mine ? publicQuestion(q) : q) : null,
    mine,
    away: q ? !!m.away[uid]?.includes(index) : false,
    bonus: !!m.bonus,
    variety: m.variety?.[uid] ?? 0,
  };
}

export type MatchView = ReturnType<typeof viewFor>;
