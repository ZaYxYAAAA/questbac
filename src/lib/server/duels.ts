import "server-only";
import { randomBytes } from "node:crypto";
import { chapterById } from "@/lib/content/curriculum";
import { DUEL_TTL_MS, type DuelOutcome, type DuelPlay, type DuelStatus, duelQuestions, duelState } from "@/lib/game/duel";
import type { PublicProfile } from "@/lib/game/save";
import type { Question, SubjectId } from "@/lib/types";
import { publicPlayerId } from "./auth";
import { getStore } from "./store";

/**
 * Duels : `duel:<id>` (questions figées + résultat de chaque joueur) et
 * `duels:<id de compte>` (liste des duels du joueur, du plus récent au plus ancien).
 */

const MAX_LISTED = 40;

interface DuelSide {
  uid: string;
  pseudo: string;
  play: DuelPlay | null;
  rewarded: boolean;
}

export interface StoredDuel {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: SubjectId;
  questions: Question[];
  createdAt: number;
  expiresAt: number;
  sides: [DuelSide, DuelSide];
}

/** Ce que le client voit d'un duel. */
export interface DuelView {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: SubjectId;
  createdAt: number;
  expiresAt: number;
  status: DuelStatus;
  outcome: DuelOutcome | null;
  rewarded: boolean;
  iChallenged: boolean;
  opponent: { id: string; pseudo: string; avatar: string; photoThumb?: string };
  mine: DuelPlay | null;
  /** Résultat de l'adversaire, visible seulement une fois que j'ai joué. */
  theirs: DuelPlay | null;
  /** L'adversaire a-t-il déjà joué ? */
  opponentPlayed: boolean;
}

const newId = () => randomBytes(9).toString("base64url");

export async function createDuel(from: { uid: string; pseudo: string }, to: { uid: string; pseudo: string }, chapterId: string, now = Date.now()) {
  const chapter = chapterById(chapterId)!;
  const id = newId();
  const duel: StoredDuel = {
    id,
    chapterId,
    chapterTitle: chapter.title,
    subject: chapter.subject,
    questions: duelQuestions(chapterId, id),
    createdAt: now,
    expiresAt: now + DUEL_TTL_MS,
    sides: [
      { uid: from.uid, pseudo: from.pseudo, play: null, rewarded: false },
      { uid: to.uid, pseudo: to.pseudo, play: null, rewarded: false },
    ],
  };
  const store = getStore();
  await store.set(`duel:${id}`, duel);
  for (const uid of [from.uid, to.uid]) {
    const ids = (await store.get<string[]>(`duels:${uid}`)) ?? [];
    await store.set(`duels:${uid}`, [id, ...ids].slice(0, MAX_LISTED));
  }
  return duel;
}

export const getDuel = (id: string) => getStore().get<StoredDuel>(`duel:${id}`);
export const saveDuel = (duel: StoredDuel) => getStore().set(`duel:${duel.id}`, duel);

/** Index du joueur dans le duel, ou -1 s'il n'y participe pas. */
export const sideOf = (duel: StoredDuel, uid: string) => duel.sides.findIndex((s) => s.uid === uid);

export async function listDuels(uid: string): Promise<StoredDuel[]> {
  const store = getStore();
  const ids = (await store.get<string[]>(`duels:${uid}`)) ?? [];
  return (await store.mget<StoredDuel>(ids.map((id) => `duel:${id}`))).filter((d): d is StoredDuel => d !== null);
}

/** Profils publics des adversaires (photo, avatar) en un seul appel. */
export async function opponentProfiles(duels: StoredDuel[], uid: string): Promise<Map<string, PublicProfile>> {
  const others = [...new Set(duels.map((d) => d.sides[1 - sideOf(d, uid)].uid))];
  const profiles = await getStore().hmget<PublicProfile>("players", others);
  return new Map(others.flatMap((o, i) => (profiles[i] ? [[o, profiles[i]!] as const] : [])));
}

export function viewDuel(duel: StoredDuel, uid: string, profiles: Map<string, PublicProfile>, now = Date.now()): DuelView {
  const i = sideOf(duel, uid);
  const me = duel.sides[i];
  const them = duel.sides[1 - i];
  const { status, outcome } = duelState(me.play, them.play, duel.expiresAt, now);
  const profile = profiles.get(them.uid);
  return {
    id: duel.id,
    chapterId: duel.chapterId,
    chapterTitle: duel.chapterTitle,
    subject: duel.subject,
    createdAt: duel.createdAt,
    expiresAt: duel.expiresAt,
    status,
    outcome,
    rewarded: me.rewarded,
    iChallenged: i === 0,
    opponent: {
      id: publicPlayerId(them.uid),
      pseudo: them.pseudo,
      avatar: profile?.avatar ?? "🙂",
      ...(profile?.photoThumb ? { photoThumb: profile.photoThumb } : {}),
    },
    mine: me.play,
    theirs: me.play ? them.play : null,
    opponentPlayed: them.play !== null,
  };
}
