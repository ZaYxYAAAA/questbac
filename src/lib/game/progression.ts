import type { Difficulty, QuizResult } from "@/lib/types";

// ─────────────────────────── Niveaux (XP) ───────────────────────────

/** XP nécessaire pour passer du niveau `level` au niveau suivant. */
export const xpToNext = (level: number) => Math.round(100 * Math.pow(level, 1.3));

export interface LevelInfo {
  level: number;
  /** XP accumulée dans le niveau courant. */
  current: number;
  /** XP nécessaire pour finir le niveau courant. */
  needed: number;
  progress: number; // 0..1
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
  }
  const needed = xpToNext(level);
  return { level, current: remaining, needed, progress: remaining / needed };
}

// ─────────────────────────── Rangs (RP) ───────────────────────────

export interface RankTier {
  id: string;
  name: string;
  minRp: number;
  emoji: string;
  color: string; // hex
  gradient: string; // Tailwind
  divisions: boolean;
}

export const RANK_TIERS: RankTier[] = [
  { id: "bronze", name: "Bronze", minRp: 0, emoji: "🥉", color: "#cd7f32", gradient: "from-orange-700 to-amber-900", divisions: true },
  { id: "argent", name: "Argent", minRp: 300, emoji: "🥈", color: "#c0c7d1", gradient: "from-slate-300 to-slate-500", divisions: true },
  { id: "or", name: "Or", minRp: 800, emoji: "🥇", color: "#facc15", gradient: "from-yellow-300 to-amber-500", divisions: true },
  { id: "platine", name: "Platine", minRp: 1600, emoji: "💠", color: "#2dd4bf", gradient: "from-teal-300 to-cyan-600", divisions: true },
  { id: "diamant", name: "Diamant", minRp: 2800, emoji: "💎", color: "#60a5fa", gradient: "from-sky-300 to-indigo-600", divisions: true },
  { id: "maitre", name: "Maître", minRp: 4500, emoji: "🔮", color: "#c084fc", gradient: "from-fuchsia-400 to-purple-700", divisions: false },
  { id: "grand-maitre", name: "Grand Maître", minRp: 6500, emoji: "🔥", color: "#f87171", gradient: "from-rose-400 to-red-700", divisions: false },
  { id: "legende", name: "Légende", minRp: 9000, emoji: "👑", color: "#fde047", gradient: "from-yellow-200 via-amber-400 to-orange-600", divisions: false },
];

export interface RankInfo {
  tier: RankTier;
  division: "III" | "II" | "I" | null;
  label: string;
  /** Progression vers la division / le palier suivant (0..1). */
  progress: number;
  nextLabel: string | null;
  rpToNext: number | null;
}

const DIVISIONS = ["III", "II", "I"] as const;

export function rankFromRp(rp: number): RankInfo {
  const value = Math.max(0, rp);
  let index = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) if (value >= RANK_TIERS[i].minRp) index = i;
  const tier = RANK_TIERS[index];
  const next = RANK_TIERS[index + 1];

  if (!next) {
    return { tier, division: null, label: tier.name, progress: 1, nextLabel: null, rpToNext: null };
  }

  const span = next.minRp - tier.minRp;
  if (!tier.divisions) {
    const progress = (value - tier.minRp) / span;
    return { tier, division: null, label: tier.name, progress, nextLabel: next.name, rpToNext: next.minRp - value };
  }

  const step = span / 3;
  const d = Math.min(2, Math.floor((value - tier.minRp) / step));
  const divStart = tier.minRp + d * step;
  const divEnd = divStart + step;
  const nextLabel = d < 2 ? `${tier.name} ${DIVISIONS[d + 1]}` : next.divisions ? `${next.name} III` : next.name;
  return {
    tier,
    division: DIVISIONS[d],
    label: `${tier.name} ${DIVISIONS[d]}`,
    progress: (value - divStart) / step,
    nextLabel,
    rpToNext: Math.ceil(divEnd - value),
  };
}

// ─────────────────────────── Récompenses ───────────────────────────

/** Multiplicateur de combo : +10 % par bonne réponse consécutive, plafonné à ×2. */
export const comboMultiplier = (combo: number) => 1 + Math.min(combo, 10) * 0.1;

const DIFFICULTY_MULT: Record<Difficulty, number> = { 1: 1, 2: 1.25, 3: 1.5 };

/** XP brute d'une bonne réponse (avant bonus de fin de session). */
export function xpForAnswer(difficulty: Difficulty = 1, comboBefore: number) {
  return Math.round(10 * DIFFICULTY_MULT[difficulty] * comboMultiplier(comboBefore));
}

export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total === 0) return 0;
  const ratio = correct / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.75) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

/** Bonus de série : +5 % par jour consécutif, plafonné à +50 %. */
export const streakBonus = (streak: number) => Math.min(Math.max(streak - 1, 0) * 0.05, 0.5);

export interface MissionRewards {
  stars: 0 | 1 | 2 | 3;
  baseXp: number;
  completionBonus: number;
  perfectBonus: number;
  streakBonusXp: number;
  xp: number;
  rp: number;
}

/**
 * Récompenses d'une mission classique.
 * `answerXp` = somme des XP par réponse déjà calculées pendant la partie (combo inclus).
 */
export function missionRewards(result: QuizResult, answerXp: number, streak: number): MissionRewards {
  const stars = starsFor(result.correct, result.total);
  const completionBonus = 20;
  const perfectBonus = stars === 3 ? Math.round(answerXp * 0.5) : 0;
  const subtotal = answerXp + completionBonus + perfectBonus;
  const streakBonusXp = Math.round(subtotal * streakBonus(streak));
  const rp = [0, 6, 12, 20][stars] + Math.min(result.maxCombo, 10);
  return {
    stars,
    baseXp: answerXp,
    completionBonus,
    perfectBonus,
    streakBonusXp,
    xp: subtotal + streakBonusXp,
    rp,
  };
}

// ─────────────────────────── Boss ───────────────────────────

export interface BossHitInput {
  combo: number;
  timeRatio: number; // temps utilisé / temps imparti (0..1)
  difficulty?: Difficulty;
}

export interface BossHit {
  damage: number;
  critical: boolean;
}

/** Dégâts infligés au boss par une bonne réponse. */
export function bossDamage({ combo, timeRatio, difficulty = 1 }: BossHitInput): BossHit {
  const critical = timeRatio <= 0.35;
  const base = 14 * DIFFICULTY_MULT[difficulty];
  const damage = Math.round(base * (1 + Math.min(combo, 8) * 0.15) * (critical ? 1.5 : 1));
  return { damage, critical };
}

// ─────────────────────────── Dates & séries ───────────────────────────

/** Clé de jour locale AAAA-MM-JJ. */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  const ta = Date.UTC(ya, ma - 1, da);
  const tb = Date.UTC(yb, mb - 1, db);
  return Math.round((tb - ta) / 86_400_000);
}

/** Met à jour une série de jours consécutifs. */
export function nextStreak(streak: { count: number; lastDay: string | null }, today: string) {
  if (!streak.lastDay) return { count: 1, lastDay: today };
  const gap = daysBetween(streak.lastDay, today);
  if (gap <= 0) return streak;
  if (gap === 1) return { count: streak.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

/** Clé de semaine ISO (AAAA-Wnn), utilisée pour le classement hebdomadaire. */
export function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
