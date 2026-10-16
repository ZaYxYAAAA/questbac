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
  limitMs,
  resultOf,
  rpDelta,
  standings,
  submitAnswer,
  tick,
} from "@/lib/game/match";
import { hashString, seededRandom, shuffle } from "@/lib/game/quests";
import { DAILY_SUBJECT_BONUS, OFFERED_KEPT, type RankProfile, RANK_EPOCH, applyResult, chooseChapters, currentWeek, newRankProfile, publicQuestion, rankedWeek, subjectOfDay, subjectRestUntil, varietyBonus } from "@/lib/game/ranked";
import { MIX_CHAPTER, SPECIAL_BONUS, type SpecialId } from "@/lib/game/specials";
import { rankFromRp } from "@/lib/game/progression";
import type { PublicProfile } from "@/lib/game/save";
import { isCorrect } from "@/lib/game/session";
import type { Level, SubjectId } from "@/lib/types";
import { getSave } from "./accounts";
import { publicPlayerId } from "./auth";
import { friendIds } from "./friends";
import { getStore } from "./store";

/**
 * Classé en parties à 3 : file d'attente par matière (3 s, puis bots au
 * niveau du joueur), parties `match:<id>` et profils de rang (hash `rank3`).
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
  /** Mode spécial du jour (absent : classique). */
  special?: SpecialId;
  matchId?: string;
}

const newId = () => randomBytes(9).toString("base64url");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

/** Retire les miniatures de bannière hors du haut du classement, de mes amis et de moi. */
function trimBanners<T extends RowLook & { place: number; isMe: boolean; friend: boolean }>(rows: T[]): T[] {
  return rows.map((r) => {
    if (!r.bannerThumb || r.place <= BANNER_ROWS || r.isMe || r.friend) return r;
    const { bannerThumb: _b, bannerId: _i, ...rest } = r;
    return rest as T;
  });
}

export interface BoardRow extends RowLook {
  id: string;
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

const BOARD_SIZE = 200;

/** Les `BOARD_SIZE` premiers, numérotés, plus ma ligne si je suis plus loin. */
function topWithMe<T extends { isMe: boolean }>(sorted: T[]): (T & { place: number })[] {
  const rows = sorted.map((r, i) => ({ ...r, place: i + 1 }));
  const top = rows.slice(0, BOARD_SIZE);
  const me = rows.find((r) => r.isMe);
  return me && me.place > BOARD_SIZE ? [...top, me] : top;
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
  return trimBanners(topWithMe(rows));
}

export interface XpRow extends RowLook {
  id: string;
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
  return trimBanners(topWithMe(rows));
}

// ─────────────────────────── File d'attente ───────────────────────────

/** Petit verrou (Redis SET NX) pour former les parties sans doublon. */
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const store = getStore();
  for (let i = 0; i < 40; i++) {
    if (await store.create(key, Date.now())) {
      try {
        return await fn();
      } finally {
        await store.del(key);
      }
    }
    const at = await store.get<number>(key);
    if (at !== null && Date.now() - at > 5000) await store.del(key); // verrou abandonné
    await sleep(80);
  }
  throw new Error("File d'attente occupée, réessaie.");
}

/** Une file par matière, par niveau (les chapitres en dépendent) et par format de partie. */
const sizeTag = (n: number, sp?: SpecialId) => (n === MATCH_PLAYERS ? "" : `:${n}`) + (sp ? `:${sp}` : "");
const queueKey = (s: SubjectId, l: Level, n: number = MATCH_PLAYERS, sp?: SpecialId) => `mmq:${s}:${l}${sizeTag(n, sp)}`;
const queueLock = (s: SubjectId, l: Level, n: number = MATCH_PLAYERS, sp?: SpecialId) => `mml:${s}:${l}${sizeTag(n, sp)}`;
const sizeOf = (t: Pick<Ticket, "size">) => t.size ?? MATCH_PLAYERS;
const ticketKey = (id: string) => `mmt:${id}`;
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

async function freshQueue(subject: SubjectId, level: Level, size: number, now: number, special?: SpecialId): Promise<Ticket[]> {
  const q = (await getStore().get<Ticket[]>(queueKey(subject, level, size, special))) ?? [];
  return q.filter((t) => !t.matchId && now - t.at < TICKET_TTL_MS);
}

/** Entrer en file : une partie se forme dès qu'il y a assez de joueurs ; sinon on attend (3 s max, puis bots). */
export async function joinQueue(uid: string, pseudo: string, subject: SubjectId, size: MatchSize = MATCH_PLAYERS, special?: SpecialId): Promise<{ ticket?: string; matchId?: string }> {
  await resetRanksIfNeeded();
  const rank = await getRank(uid, pseudo);
  if (rank.active) {
    const m = await getMatch(rank.active);
    if (m && phaseAt(m, Date.now()).phase !== "done") return { matchId: m.id };
  }
  const save = await getSave(uid);
  const until = subjectRestUntil(rank.history, subject);
  if (until > 0) {
    const min = Math.max(1, Math.ceil((until - Date.now()) / 60_000));
    throw new Error(`Tu as joué tes 3 dernières parties en ${subjectMeta(subject).name} : fais une partie dans une autre matière, ou reviens dans ${min} min.`);
  }
  const ticket: Ticket = { id: newId(), uid, pseudo, subject, level: save?.save.profile?.level ?? "seconde", rp: rank.rp, at: Date.now(), size, ...(special ? { special } : {}) };
  return withLock(queueLock(subject, ticket.level, size, special), async () => {
    const store = getStore();
    const queue = (await freshQueue(subject, ticket.level, size, ticket.at, special)).filter((t) => t.uid !== uid);
    if (queue.length >= size - 1) {
      const mates = queue.slice(0, size - 1);
      const m = await createMatch([ticket, ...mates], size, special);
      await store.set(queueKey(subject, ticket.level, size, special), queue.filter((t) => !mates.includes(t)));
      for (const t of mates) await store.set(ticketKey(t.id), { ...t, matchId: m.id });
      return { matchId: m.id };
    }
    await store.set(queueKey(subject, ticket.level, size, special), [...queue, ticket]);
    await store.set(ticketKey(ticket.id), ticket);
    return { ticket: ticket.id };
  });
}

/** Où en est la recherche : partie trouvée, ou au bout de 3 s, partie complétée par des bots. */
export async function pollQueue(uid: string, ticketId: string): Promise<{ matchId?: string; elapsedMs: number }> {
  const store = getStore();
  const t = await store.get<Ticket>(ticketKey(ticketId));
  if (!t || t.uid !== uid) throw new Error("Recherche introuvable.");
  if (t.matchId) return { matchId: t.matchId, elapsedMs: Date.now() - t.at };
  const elapsedMs = Date.now() - t.at;
  if (elapsedMs < QUEUE_WAIT_MS) return { elapsedMs };
  const size = sizeOf(t);
  return withLock(queueLock(t.subject, t.level, size, t.special), async () => {
    const again = await store.get<Ticket>(ticketKey(ticketId));
    if (again?.matchId) return { matchId: again.matchId, elapsedMs };
    const queue = (await freshQueue(t.subject, t.level, size, Date.now(), t.special)).filter((x) => x.id !== t.id && x.uid !== uid);
    const mates = queue.slice(0, size - 1);
    const m = await createMatch([t, ...mates], size, t.special);
    await store.set(queueKey(t.subject, t.level, size, t.special), queue.filter((x) => !mates.includes(x)));
    for (const x of [t, ...mates]) await store.set(ticketKey(x.id), { ...x, matchId: m.id });
    return { matchId: m.id, elapsedMs };
  });
}

export async function cancelQueue(uid: string, ticketId: string) {
  const store = getStore();
  const t = await store.get<Ticket>(ticketKey(ticketId));
  if (!t || t.uid !== uid || t.matchId) return;
  await withLock(queueLock(t.subject, t.level, sizeOf(t), t.special), async () => {
    const queue = (await store.get<Ticket[]>(queueKey(t.subject, t.level, sizeOf(t), t.special))) ?? [];
    await store.set(queueKey(t.subject, t.level, sizeOf(t), t.special), queue.filter((x) => x.id !== t.id));
  });
  await store.del(ticketKey(ticketId));
}

/** Deux chapitres au hasard (avec des questions) de la matière, en évitant ceux proposés récemment aux joueurs. */
function pickChapters(subject: SubjectId, level: Level, recent: string[]): [string, string] {
  const pool = chaptersFor(subject, level).filter((c) => hasGenerators(c.id));
  const list = pool.length >= 2 ? pool : chaptersFor(subject, level);
  return chooseChapters(list.map((c) => c.id), recent);
}

async function createMatch(tickets: Ticket[], size: number = MATCH_PLAYERS, special?: SpecialId): Promise<Match> {
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
    chapters: special === "melange" ? [MIX_CHAPTER, MIX_CHAPTER] : pickChapters(tickets[0].subject, tickets[0].level, recentOffers),
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
    ...(special ? { special } : {}),
    variety: Object.fromEntries(humans.map((h, i) => [h.id, varietyBonus(ranks[i].history, { subject: tickets[0].subject, size, mode: special ?? "classique" })])),
  };
  m.votes = botVotes(m);
  await saveMatch(m);
  for (const h of humans) {
    const p = await getRank(h.id, h.pseudo);
    await putRank(h.id, { ...p, active: id, offered: [...(p.offered ?? []).filter((c) => !m.chapters.includes(c)), ...m.chapters].slice(-OFFERED_KEPT) });
  }
  return m;
}

// ─────────────────────────── Déroulé ───────────────────────────

/** Questions de la partie selon le mode : Mélange (un chapitre différent par question), Expert (les plus difficiles). */
function makeQuestions(m: Match, chapterId: string, r: () => number, seen: string[]) {
  if (chapterId === MIX_CHAPTER) {
    const pool = shuffle(chaptersFor(m.subject, m.level).filter((c) => hasGenerators(c.id)), r);
    const out = [];
    for (let i = 0; out.length < 10 && i < 40 && pool.length; i++) out.push(...chapterQuestions(pool[i % pool.length].id, 1, r, seen));
    return out.slice(0, 10);
  }
  if (m.special === "expert") {
    const all = chapterQuestions(chapterId, 30, r, seen);
    const hard = all.filter((q) => (q.difficulty ?? 1) >= 2);
    return [...hard, ...all.filter((q) => !hard.includes(q))].slice(0, 10);
  }
  return chapterQuestions(chapterId, 10, r, seen);
}

/** Fait avancer la partie, l'enregistre si elle a changé, et distribue les points à la fin (une seule fois). */
export async function advance(m: Match, now = Date.now()): Promise<Match> {
  let seen: string[] = [];
  if (!m.chapterId) {
    for (const p of m.players.filter((x) => !x.bot)) seen = seen.concat((await getRank(p.id, p.pseudo)).seen ?? []);
  }
  const make = (chapterId: string, seed: string) => makeQuestions(m, chapterId, seededRandom(hashString(`q:${seed}`)), seen).map((q, i) => ({ ...q, id: `mq-${i}` }));
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

/** Points de rang de fin de partie, pour chaque joueur humain. */
/** Matière du jour pour un niveau. */
export const dailySubject = (level: Level, now = new Date()) => subjectOfDay(subjectsForLevel(level).map((s) => s.id), now) as SubjectId;

/** Pour chaque matière : heure de fin de repos (0 = jouable) et bonus de fraîcheur. */
export function subjectLocks(rank: RankProfile, level: Level): Record<string, number> {
  return Object.fromEntries(subjectsForLevel(level).map((s) => [s.id, subjectRestUntil(rank.history, s.id)]));
}


export function deltas(m: Match): Record<string, number> {
  const s = standings(m);
  return Object.fromEntries(
    s.map((row) => {
      const p = m.players.find((x) => x.id === row.playerId)!;
      const d = rpDelta(row.place, p.rp, row.correct, m.questions.length, m.players.length);
      // Matière du jour (+25 %), mode du jour (+30 %), jauge de variété (−30 % à +15 %) : sur les points gagnés seulement.
      const boost = (m.bonus ? DAILY_SUBJECT_BONUS : 0) + (m.special ? SPECIAL_BONUS : 0) + (m.variety?.[p.id] ?? 0);
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
    const prof = await getRank(p.id, p.pseudo);
    const next = applyResult(prof, { at: Date.now(), subject: m.subject, place: row.place, correct: row.correct, delta: d[p.id], ...(m.players.length !== MATCH_PLAYERS ? { size: m.players.length } : {}), ...(m.special ? { mode: m.special } : {}) }, week);
    const facts = m.questions.map(factKey);
    await putRank(p.id, { ...next, seen: [...(prof.seen ?? []).filter((k) => !facts.includes(k)), ...facts].slice(-SEEN_KEPT) });
  }
}

export async function vote(m: Match, uid: string, chapter: string) {
  if (m.chapterId || !m.chapters.includes(chapter) || m.votes[uid]) return false;
  const v: Vote = { chapter, at: Date.now() };
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
      score: row.points,
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
    endsAt: q && index >= 0 && m.starts[index] !== undefined ? m.starts[index] + limitMs(m, index) : null,
    nextAt: phase === "reveal" ? m.starts[index + 1] ?? m.finishedAt : phase === "intro" ? m.starts[0] : null,
    question: q ? (phase === "question" && !mine ? publicQuestion(q) : q) : null,
    mine,
    away: q ? !!m.away[uid]?.includes(index) : false,
    bonus: !!m.bonus,
    special: m.special ?? null,
    variety: m.variety?.[uid] ?? 0,
  };
}

export type MatchView = ReturnType<typeof viewFor>;
