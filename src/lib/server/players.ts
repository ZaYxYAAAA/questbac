import "server-only";
import { PHOTO_BANNER } from "@/lib/game/banners";
import { MAX_BANNER_CHARS, MAX_PHOTO_CHARS, isPhotoDataUrl } from "@/lib/game/photo";
import { rankFromRp } from "@/lib/game/progression";
import { type MatchHistory, RANK_EPOCH, type RankProfile, currentWeek, rankedWeek } from "@/lib/game/ranked";
import type { PublicProfile } from "@/lib/game/save";
import type { GameData } from "@/lib/game/state";
import { publicPlayerId } from "./auth";
import { friendIds } from "./friends";
import { getStore } from "./store";

/**
 * Fiche publique d'un joueur (ouverte depuis le classement ou les amis).
 * Index `pubids` : identifiant public → id de compte, rempli à chaque sauvegarde
 * et à chaque mise à jour du profil de rang (match.ts, updateRank).
 */

export const indexPublicId = (accountId: string) => getStore().hset("pubids", publicPlayerId(accountId), accountId);

/** Parcours complet des joueurs connus : au plus un par minute (un identifiant inventé ne relit pas toute la base). */
const SCAN_EVERY_MS = 60_000;
let lastScan = 0;

/** Retrouve le compte d'un identifiant public (index, sinon parcours des joueurs connus, qui complète l'index). */
export async function accountForPublicId(publicId: string, now = Date.now()): Promise<string | null> {
  const store = getStore();
  const [hit] = await store.hmget<string>("pubids", [publicId]);
  if (hit) return hit;
  if (now - lastScan < SCAN_EVERY_MS) return null;
  lastScan = now;
  const [players, ranks, indexed] = await Promise.all([store.hgetall("players"), store.hgetall(`rank${RANK_EPOCH}`), store.hgetall<string>("pubids")]);
  const known = new Set(Object.values(indexed));
  let found: string | null = null;
  for (const id of new Set([...Object.keys(players), ...Object.keys(ranks)])) {
    const pid = publicPlayerId(id);
    if (!known.has(id)) await store.hset("pubids", pid, id);
    if (pid === publicId) found = id;
  }
  return found;
}

export interface PlayerCard {
  /** `photo` : photo en 256 × 256 (la miniature serait floue en grand). */
  player: PublicProfile & { banner?: string; photo?: string };
  rank: { rp: number; peak: number; label: string; games: number; wins: number; weekDelta: number; history: MatchHistory[] } | null;
  isMe: boolean;
  friend: boolean;
}

export async function playerCard(viewer: string, publicId: string): Promise<PlayerCard | null> {
  const uid = await accountForPublicId(publicId);
  if (!uid) return null;
  const store = getStore();
  const [[pub], [rank], friends] = await Promise.all([
    store.hmget<PublicProfile>("players", [uid]),
    store.hmget<RankProfile>(`rank${RANK_EPOCH}`, [uid]),
    friendIds(viewer),
  ]);
  if (!pub && !rank) return null;
  const r = rank ? currentWeek(rank, rankedWeek()) : null;
  const base: PublicProfile = pub ?? {
    id: publicId,
    pseudo: r!.pseudo,
    avatar: "🙂",
    level: "premiere",
    playerLevel: 1,
    rp: r!.rp,
    xp: 0,
    weeklyXp: 0,
    week: "",
    updatedAt: 0,
  };
  let banner: string | undefined;
  let photo: string | undefined;
  if (base.bannerId === PHOTO_BANNER || base.photoThumb) {
    const saved = (await store.get<{ save: GameData }>(`save:${uid}`))?.save.profile;
    if (base.bannerId === PHOTO_BANNER && isPhotoDataUrl(saved?.banner, MAX_BANNER_CHARS)) banner = saved.banner;
    if (base.photoThumb && isPhotoDataUrl(saved?.photo, MAX_PHOTO_CHARS)) photo = saved.photo;
  }
  return {
    player: { ...base, id: publicId, ...(r ? { rp: r.rp } : {}), ...(banner ? { banner } : {}), ...(photo ? { photo } : {}) },
    rank: r
      ? { rp: r.rp, peak: Math.max(r.peak, r.rp), label: rankFromRp(r.rp).label, games: r.games, wins: r.wins, weekDelta: r.weekDelta, history: r.history.slice(0, 8) }
      : null,
    isMe: uid === viewer,
    friend: friends.includes(uid),
  };
}
