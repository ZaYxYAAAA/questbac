/**
 * Ligue hebdomadaire (façon Duolingo) : chaque semaine, le joueur affronte un
 * groupe d'adversaires simulés de son palier. Top 3 promu (bonus), 3 derniers
 * relégués (petite pénalité). Tout est déterministe : même semaine, même groupe.
 */
import { hashString, seededRandom, shuffle } from "./quests";
import { RIVAL_AVATARS, RIVAL_NAMES } from "./rivals";
import { tierById, tierIndex } from "./ranks";

export const LEAGUE_SIZE = 20; // joueur compris
export const PROMOTION_SPOTS = 3;
export const RELEGATION_SPOTS = 3;

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

export interface LeagueState {
  week: string;
  /** Palier du joueur au début de la semaine : fixe le niveau des adversaires. */
  tierId: string;
  last: LeagueResult | null;
}

export interface LeagueRow {
  id: string;
  pseudo: string;
  avatar: string;
  weeklyXp: number;
  isPlayer?: boolean;
}

/** Récompenses de fin de semaine selon la place. */
export function leagueReward(rank: number, size = LEAGUE_SIZE): { xp: number; rp: number; zone: LeagueZone } {
  if (rank === 1) return { xp: 300, rp: 60, zone: "promotion" };
  if (rank === 2) return { xp: 200, rp: 40, zone: "promotion" };
  if (rank === 3) return { xp: 120, rp: 25, zone: "promotion" };
  if (rank > size - RELEGATION_SPOTS) return { xp: 0, rp: -10, zone: "relegation" };
  if (rank <= 10) return { xp: 50, rp: 0, zone: "safe" };
  return { xp: 0, rp: 0, zone: "safe" };
}

export const zoneOf = (rank: number, size = LEAGUE_SIZE): LeagueZone =>
  rank <= PROMOTION_SPOTS ? "promotion" : rank > size - RELEGATION_SPOTS ? "relegation" : "safe";

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

/** Graine du groupe : semaine + palier + joueur (deux joueurs n'ont pas le même groupe). */
const groupSeed = (league: Pick<LeagueState, "week" | "tierId">, playerKey: string) => `league:${league.week}:${league.tierId}:${playerKey}`;

interface Opponent {
  id: string;
  pseudo: string;
  avatar: string;
  /** XP visée en fin de semaine. */
  target: number;
  /** Forme de la courbe : < 1 démarre fort, > 1 finit fort. */
  shape: number;
}

/** Les adversaires de la semaine (sans le joueur). */
export function leagueOpponents(league: Pick<LeagueState, "week" | "tierId">, playerKey: string): Opponent[] {
  const seed = groupSeed(league, playerKey);
  const rand = seededRandom(hashString(seed));
  const names = shuffle(RIVAL_NAMES, rand).slice(0, LEAGUE_SIZE - 1);
  // Plus le palier est haut, plus les adversaires sont actifs.
  const level = 1 + 0.4 * tierIndex(league.tierId);
  return names.map((pseudo, i) => {
    const r = seededRandom(hashString(`${seed}:${pseudo}`));
    const activity = r();
    // Environ 1 adversaire sur 6 joue très peu cette semaine.
    const target = activity < 0.16
      ? Math.round(20 + r() * 120)
      : Math.round((150 + 1900 * Math.pow(r(), 1.4)) * level);
    return {
      id: `league-${i}`,
      pseudo,
      avatar: RIVAL_AVATARS[hashString(pseudo) % RIVAL_AVATARS.length],
      target,
      shape: 0.6 + r() * 0.9,
    };
  });
}

/** XP d'un adversaire à un moment de la semaine (croissante, par paliers d'une heure). */
function opponentXp(o: Opponent, progress: number): number {
  if (progress >= 1) return o.target;
  const hour = Math.floor(progress * 168) / 168;
  return Math.round(o.target * Math.pow(hour, o.shape));
}

/** Classement du groupe à un instant donné (progress = 1 : classement final). */
export function leagueStandings(
  league: Pick<LeagueState, "week" | "tierId">,
  playerKey: string,
  player: { pseudo: string; avatar: string; weeklyXp: number },
  progress: number,
): LeagueRow[] {
  const rows: LeagueRow[] = leagueOpponents(league, playerKey).map((o) => ({
    id: o.id,
    pseudo: o.pseudo,
    avatar: o.avatar,
    weeklyXp: opponentXp(o, progress),
  }));
  rows.push({ id: "player", pseudo: player.pseudo, avatar: player.avatar, weeklyXp: player.weeklyXp, isPlayer: true });
  // À égalité, le joueur passe devant.
  return rows.sort((a, b) => b.weeklyXp - a.weeklyXp || (a.isPlayer ? -1 : b.isPlayer ? 1 : 0));
}

/** Résultat final d'une semaine terminée. */
export function finalLeagueResult(league: Pick<LeagueState, "week" | "tierId">, playerKey: string, weeklyXp: number): LeagueResult {
  const rows = leagueStandings(league, playerKey, { pseudo: "", avatar: "", weeklyXp }, 1);
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
