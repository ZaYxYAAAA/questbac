/**
 * Boosts d'XP : multiplicateurs temporaires gagnés en battant un boss, en
 * finissant les quêtes du jour ou en ouvrant le 7e coffre de la série, plus le
 * dimanche à XP ×2. Ils ne se cumulent pas (le plus fort s'applique) et ne
 * touchent jamais les points de rang.
 */

export type BoostSource = "boss" | "quests" | "daily";

export interface XpBoost {
  mult: number;
  /** Fin du boost (ms). */
  until: number;
  source: BoostSource;
}

const SOURCE_LABEL: Record<BoostSource, string> = {
  boss: "Boost de boss",
  quests: "Boost des quêtes",
  daily: "Boost du coffre de série",
};

export const isSunday = (now: Date) => now.getDay() === 0;

/** Multiplicateur en vigueur (null s'il n'y en a pas). */
export function activeBoost(boost: XpBoost | null | undefined, now: Date): { mult: number; label: string; until: number | null } | null {
  const candidates: { mult: number; label: string; until: number | null }[] = [];
  if (boost && boost.until > now.getTime()) candidates.push({ mult: boost.mult, label: `${SOURCE_LABEL[boost.source]} ×${fmtMult(boost.mult)}`, until: boost.until });
  if (isSunday(now)) candidates.push({ mult: 2, label: "Dimanche XP ×2", until: null });
  return candidates.sort((a, b) => b.mult - a.mult)[0] ?? null;
}

/** Nouveau boost : on garde le plus fort, et à force égale, le plus long. */
export function grantBoost(current: XpBoost | null | undefined, mult: number, minutes: number, source: BoostSource, now: Date): XpBoost {
  const until = now.getTime() + minutes * 60_000;
  if (current && current.until > now.getTime()) {
    if (current.mult > mult) return current;
    if (current.mult === mult) return { ...current, until: Math.max(current.until, until), source };
  }
  return { mult, until, source };
}

export const fmtMult = (m: number) => String(m).replace(".", ",");

/** XP d'une mission rejouée le même jour : 100 %, puis 50 %, puis 20 %. */
export const MISSION_REPLAY_FACTORS = [1, 0.5, 0.2] as const;
export const replayFactor = (playsToday: number) => MISSION_REPLAY_FACTORS[Math.min(playsToday, MISSION_REPLAY_FACTORS.length - 1)];
