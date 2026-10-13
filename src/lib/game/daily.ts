/**
 * Récompense de connexion quotidienne : un calendrier de 7 jours consécutifs.
 * Manquer un jour ramène au jour 1 ; après le 7e jour, le cycle recommence.
 */
import { daysBetween } from "./progression";

export interface DailyState {
  /** Dernier jour (AAAA-MM-JJ) où le coffre a été ouvert. */
  lastClaim: string | null;
  /** Nombre de coffres ouverts dans le cycle en cours (0..7). */
  count: number;
}

export interface DailyReward {
  day: number; // 1..7
  xp: number;
  rp: number;
  emoji: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, xp: 30, rp: 0, emoji: "🪙" },
  { day: 2, xp: 40, rp: 0, emoji: "🪙" },
  { day: 3, xp: 50, rp: 5, emoji: "💰" },
  { day: 4, xp: 60, rp: 0, emoji: "💰" },
  { day: 5, xp: 80, rp: 5, emoji: "💎" },
  { day: 6, xp: 100, rp: 5, emoji: "💎" },
  { day: 7, xp: 200, rp: 20, emoji: "👑" },
];

export type DailyStatus = "claimed" | "today" | "next" | "locked";

export interface DailyCalendar {
  /** Le coffre du jour peut être ouvert. */
  canClaim: boolean;
  /** Position (0..6) du coffre d'aujourd'hui (ouvert ou non). */
  todayIndex: number;
  days: (DailyReward & { status: DailyStatus })[];
}

/** Coffres déjà ouverts dans le cycle qui compte encore aujourd'hui. */
function activeCount(state: DailyState, today: string): number {
  if (!state.lastClaim) return 0;
  const gap = daysBetween(state.lastClaim, today);
  if (gap <= 0) return state.count; // déjà ouvert aujourd'hui
  if (gap === 1) return state.count >= 7 ? 0 : state.count; // cycle terminé hier : on repart
  return 0; // jour manqué
}

export function dailyCalendar(state: DailyState, today: string): DailyCalendar {
  const claimedToday = state.lastClaim !== null && daysBetween(state.lastClaim, today) <= 0;
  const count = activeCount(state, today);
  const todayIndex = claimedToday ? Math.max(0, count - 1) : count;
  return {
    canClaim: !claimedToday,
    todayIndex,
    days: DAILY_REWARDS.map((r, i) => ({
      ...r,
      status: i < count ? "claimed" : i === todayIndex && !claimedToday ? "today" : i === count ? "next" : "locked",
    })),
  };
}

/** Ouvre le coffre du jour : nouvel état et récompense, ou null si déjà ouvert. */
export function claimDaily(state: DailyState, today: string): { state: DailyState; reward: DailyReward } | null {
  const cal = dailyCalendar(state, today);
  if (!cal.canClaim) return null;
  const reward = DAILY_REWARDS[cal.todayIndex];
  return { state: { lastClaim: today, count: cal.todayIndex + 1 }, reward };
}
