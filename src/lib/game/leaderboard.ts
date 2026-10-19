/**
 * Classements : le joueur est classé parmi les vrais joueurs inscrits
 * (GET /api/leaderboard).
 */
import type { Level } from "@/lib/types";
import { type PublicProfile, currentWeeklyXp } from "./save";

export interface LeaderboardEntry {
  id: string;
  pseudo: string;
  avatar: string;
  /** Photo de profil (miniature pour les autres joueurs). */
  photo?: string;
  /** Palier du titre affiché (vrais joueurs) ; sinon celui du rang. */
  titleId?: string;
  /** Palier du cadre d'avatar choisi ; sinon celui du rang. */
  frameId?: string;
  level: Level;
  playerLevel: number;
  weeklyXp: number;
  rp: number;
  isPlayer?: boolean;
  /** Autre joueur inscrit (le joueur lui-même a `isPlayer`). */
  isReal?: boolean;
}

export type LeaderboardScope = "hebdo" | "global" | "niveau";

/** Ce que GET /api/leaderboard publie d'un joueur (route publique, sans session). */
export type PublicLeaderboardRow = Pick<PublicProfile, "id" | "pseudo" | "avatar" | "titleId" | "frameId" | "level" | "playerLevel" | "rp" | "xp" | "weeklyXp" | "week">;

/**
 * Liste blanche des champs publiés par le classement public : ni photo, ni
 * bannière, ni statistiques (les fiches détaillées passent par une session).
 */
export function publicLeaderboardRow(p: PublicProfile): PublicLeaderboardRow {
  return {
    id: p.id,
    pseudo: p.pseudo,
    avatar: p.avatar,
    ...(typeof p.titleId === "string" ? { titleId: p.titleId } : {}),
    ...(typeof p.frameId === "string" ? { frameId: p.frameId } : {}),
    level: p.level,
    playerLevel: p.playerLevel,
    rp: p.rp,
    xp: p.xp,
    weeklyXp: p.weeklyXp,
    week: p.week,
  };
}

/** Profils publics du serveur → entrées de classement (sans le joueur lui-même). */
export function realEntries(players: PublicProfile[], selfId: string | null, now = new Date()): LeaderboardEntry[] {
  return players
    .filter((p) => p.id !== selfId)
    .map((p) => ({
      id: `real-${p.id}`,
      pseudo: p.pseudo,
      avatar: p.avatar,
      photo: p.photoThumb,
      titleId: p.titleId,
      frameId: p.frameId,
      level: p.level,
      playerLevel: p.playerLevel,
      weeklyXp: currentWeeklyXp(p, now),
      rp: p.rp,
      isReal: true,
    }));
}

export function buildLeaderboard(
  player: Omit<LeaderboardEntry, "id" | "isPlayer">,
  scope: LeaderboardScope,
  others: LeaderboardEntry[] = [],
): LeaderboardEntry[] {
  let entries = [...others, { ...player, id: "player", isPlayer: true }];
  if (scope === "niveau") entries = entries.filter((e) => e.level === player.level);
  const key = scope === "hebdo" ? "weeklyXp" : "rp";
  return entries.sort((a, b) => b[key] - a[key] || (a.isPlayer ? -1 : 1));
}
