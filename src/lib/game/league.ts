/**
 * Ligue hebdomadaire entre vrais joueurs : chaque semaine, le joueur est classé
 * avec les inscrits les plus proches de son rang (RP). Le haut du groupe est
 * promu (bonus), le bas relégué (petite pénalité) ; les places dépendent de la
 * taille du groupe. Le groupe est mémorisé dans la sauvegarde pour calculer le
 * résultat final au changement de semaine, même hors ligne.
 */
import type { PublicProfile } from "./save";
import { weekKey } from "./progression";
import { tierById } from "./ranks";

/** Taille maximale d'un groupe (joueur compris). */
export const LEAGUE_SIZE = 20;
/** En dessous, pas de récompense ni de zone : il faut au moins 3 joueurs. */
export const LEAGUE_MIN_SIZE = 3;

export type LeagueZone = "promotion" | "relegation" | "safe";

export interface LeagueResult {
  week: string;
  tierId: string;
  rank: number;
  size: number;
  xp: number;
  zone: LeagueZone;
  rewardXp: number;
  rewardRp: number;
  /** Le joueur a vu le message de fin de semaine. */
  seen: boolean;
}

export interface LeagueRow {
  id: string;
  pseudo: string;
  avatar: string;
  photo?: string;
  weeklyXp: number;
  isPlayer?: boolean;
}

export interface LeagueState {
  week: string;
  /** Palier du joueur au début de la semaine (nom de la ligue). */
  tierId: string;
  last: LeagueResult | null;
  /** Derniers adversaires connus de la semaine (vrais joueurs). */
  rivals?: LeagueRow[];
}

/** Places promues selon la taille du groupe. */
export const promotionSpots = (size: number) => (size < LEAGUE_MIN_SIZE ? 0 : size >= 10 ? 3 : size >= 5 ? 2 : 1);
/** Places reléguées selon la taille du groupe. */
export const relegationSpots = (size: number) => (size < 6 ? 0 : size >= 10 ? 3 : 1);

export const zoneOf = (rank: number, size: number): LeagueZone =>
  rank <= promotionSpots(size) ? "promotion" : rank > size - relegationSpots(size) ? "relegation" : "safe";

const PODIUM_REWARDS = [
  { xp: 300, rp: 60 },
  { xp: 200, rp: 40 },
  { xp: 120, rp: 25 },
];

/** Récompenses de fin de semaine selon la place et la taille du groupe. */
export function leagueReward(rank: number, size: number): { xp: number; rp: number; zone: LeagueZone } {
  const zone = zoneOf(rank, size);
  if (zone === "promotion") return { ...PODIUM_REWARDS[rank - 1], zone };
  if (zone === "relegation") return { xp: 0, rp: -10, zone };
  if (size >= LEAGUE_MIN_SIZE && rank <= Math.ceil(size / 2)) return { xp: 50, rp: 0, zone };
  return { xp: 0, rp: 0, zone };
}

/**
 * Groupe de la semaine : les vrais joueurs les plus proches de mon RP (moi exclu).
 * `withPhotos: false` pour la copie gardée dans la sauvegarde (plus légère).
 */
export function leagueRivals(players: PublicProfile[], selfId: string | null, rp: number, now = new Date(), withPhotos = true): LeagueRow[] {
  return players
    .filter((p) => p.id !== selfId)
    .sort((a, b) => Math.abs(a.rp - rp) - Math.abs(b.rp - rp))
    .slice(0, LEAGUE_SIZE - 1)
    .map((p) => ({ id: `real-${p.id}`, pseudo: p.pseudo, avatar: p.avatar, ...(withPhotos && p.photoThumb ? { photo: p.photoThumb } : {}), weeklyXp: p.week === weekKey(now) ? p.weeklyXp : 0 }));
}

/** Avancement de la semaine ISO (lundi 0 h → dimanche 24 h), entre 0 et 1. */
export function weekProgress(now = new Date()): number {
  const day = (now.getDay() + 6) % 7; // 0 = lundi
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return Math.min(1, (day * 86_400 + seconds) / (7 * 86_400));
}

/** Fin de la semaine (lundi suivant à minuit, heure locale). */
export function weekEnd(now = new Date()): Date {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  end.setDate(end.getDate() + (7 - ((now.getDay() + 6) % 7)));
  return end;
}

/** Compte à rebours lisible : « 2 j 5 h », « 3 h 12 min », « 45 s ». */
export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d} j ${h} h`;
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
  if (m > 0) return `${m} min ${String(s % 60).padStart(2, "0")} s`;
  return `${s % 60} s`;
}

/** Classement du groupe (à égalité, le joueur passe devant). */
export function leagueStandings(rivals: LeagueRow[], player: { pseudo: string; avatar: string; weeklyXp: number }): LeagueRow[] {
  const rows: LeagueRow[] = [...rivals, { id: "player", pseudo: player.pseudo, avatar: player.avatar, weeklyXp: player.weeklyXp, isPlayer: true }];
  return rows.sort((a, b) => b.weeklyXp - a.weeklyXp || (a.isPlayer ? -1 : b.isPlayer ? 1 : 0));
}

/** Résultat final d'une semaine terminée, d'après les derniers scores connus du groupe. */
export function finalLeagueResult(league: Pick<LeagueState, "week" | "tierId" | "rivals">, weeklyXp: number): LeagueResult {
  const rows = leagueStandings(league.rivals ?? [], { pseudo: "", avatar: "", weeklyXp });
  const rank = rows.findIndex((r) => r.isPlayer) + 1;
  const reward = leagueReward(rank, rows.length);
  return {
    week: league.week,
    tierId: league.tierId,
    rank,
    size: rows.length,
    xp: weeklyXp,
    zone: reward.zone,
    rewardXp: reward.xp,
    rewardRp: reward.rp,
    seen: false,
  };
}

export const leagueName = (tierId: string) => `Ligue ${tierById(tierId).name}`;
