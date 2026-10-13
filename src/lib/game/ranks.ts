/**
 * Échelle complète des rangs : divisions, récompenses de chaque palier
 * (titre + cadre d'avatar), répartition simulée des joueurs et promotions.
 */
import { RANK_TIERS, type RankTier, rankFromRp } from "./progression";

export interface RankStep {
  tier: RankTier;
  division: "III" | "II" | "I" | null;
  label: string;
  minRp: number;
  /** Seuil de l'étape suivante (null au sommet). */
  maxRp: number | null;
}

const DIVISIONS = ["III", "II", "I"] as const;

/** Toutes les étapes, de Bronze III à Légende (même découpage que `rankFromRp`). */
export const RANK_STEPS: RankStep[] = RANK_TIERS.flatMap((tier, i): RankStep[] => {
  const next = RANK_TIERS[i + 1];
  if (!tier.divisions || !next) {
    return [{ tier, division: null, label: tier.name, minRp: tier.minRp, maxRp: next?.minRp ?? null }];
  }
  const step = (next.minRp - tier.minRp) / 3;
  return DIVISIONS.map((division, d) => ({
    tier,
    division,
    label: `${tier.name} ${division}`,
    minRp: Math.ceil(tier.minRp + d * step),
    maxRp: d < 2 ? Math.ceil(tier.minRp + (d + 1) * step) : next.minRp,
  }));
});

/** Index de l'étape atteinte avec `rp` (0 = Bronze III). */
export function stepIndex(rp: number): number {
  const label = rankFromRp(rp).label;
  return Math.max(0, RANK_STEPS.findIndex((s) => s.label === label));
}

export const tierIndex = (tierId: string) => Math.max(0, RANK_TIERS.findIndex((t) => t.id === tierId));
export const tierById = (tierId: string) => RANK_TIERS[tierIndex(tierId)];

// ─────────────────────────── Récompenses ───────────────────────────

export interface TierReward {
  tierId: string;
  /** Titre affiché sous le pseudo. */
  title: string;
  /** Nom du cadre d'avatar débloqué. */
  frame: string;
  /** Couleurs du cadre (dégradé conique). */
  frameColors: string[];
  /** Halo lumineux autour du cadre. */
  glow: boolean;
}

export const TIER_REWARDS: TierReward[] = [
  { tierId: "bronze", title: "Recrue", frame: "Cadre de bronze", frameColors: ["#cd7f32", "#7c4a1e", "#e3a869", "#cd7f32"], glow: false },
  { tierId: "argent", title: "Stratège", frame: "Cadre d'argent", frameColors: ["#e2e8f0", "#64748b", "#f8fafc", "#94a3b8", "#e2e8f0"], glow: false },
  { tierId: "or", title: "Virtuose", frame: "Cadre doré", frameColors: ["#fde047", "#b45309", "#fef08a", "#f59e0b", "#fde047"], glow: false },
  { tierId: "platine", title: "Prodige", frame: "Cadre de platine", frameColors: ["#5eead4", "#0e7490", "#ccfbf1", "#14b8a6", "#5eead4"], glow: true },
  { tierId: "diamant", title: "Génie", frame: "Cadre de diamant", frameColors: ["#93c5fd", "#4338ca", "#e0f2fe", "#3b82f6", "#a5b4fc", "#93c5fd"], glow: true },
  { tierId: "maitre", title: "Sage", frame: "Cadre arcanique", frameColors: ["#e879f9", "#6b21a8", "#f5d0fe", "#a855f7", "#e879f9"], glow: true },
  { tierId: "grand-maitre", title: "Oracle", frame: "Cadre de braise", frameColors: ["#fca5a5", "#991b1b", "#fde68a", "#ef4444", "#fca5a5"], glow: true },
  { tierId: "legende", title: "Légende du Bac", frame: "Couronne de légende", frameColors: ["#fef08a", "#f97316", "#fde047", "#ec4899", "#a78bfa", "#fef08a"], glow: true },
];

export const rewardFor = (tierId: string) => TIER_REWARDS[tierIndex(tierId)];

/** Paliers débloqués (titres et cadres) avec le meilleur total de RP atteint. */
export function unlockedTiers(peakRp: number): string[] {
  return RANK_TIERS.filter((t) => peakRp >= t.minRp).map((t) => t.id);
}

/** Titre / cadre actif : le choix du joueur s'il est débloqué, sinon celui du meilleur palier atteint. */
export function activeTierReward(choice: string | undefined, peakRp: number): TierReward {
  const unlocked = unlockedTiers(peakRp);
  const id = choice && unlocked.includes(choice) ? choice : unlocked[unlocked.length - 1];
  return rewardFor(id);
}

/** Cadre porté par le joueur : son choix s'il est débloqué, sinon celui de son rang (null). */
export function playerFrame(profile: { frameId?: string } | null, peakRp: number): string | null {
  const id = profile?.frameId;
  return id && unlockedTiers(peakRp).includes(id) ? id : null;
}

// ─────────────────────────── Répartition simulée ───────────────────────────

/** Part des joueurs dans chaque palier (simulée, somme = 100 %). */
const SHARES: Record<string, number> = {
  bronze: 31.5,
  argent: 26,
  or: 19,
  platine: 12,
  diamant: 7,
  maitre: 3,
  "grand-maitre": 1.1,
  legende: 0.4,
};

const EPOCH = Date.UTC(2026, 0, 1);

export interface TierPopulation {
  tierId: string;
  share: number; // en %
  players: number;
}

/** Nombre de joueurs par palier : communauté simulée (qui grandit doucement) + vrais joueurs. */
export function tierPopulation(now = new Date(), realByTier: Record<string, number> = {}): TierPopulation[] {
  const days = Math.max(0, Math.floor((now.getTime() - EPOCH) / 86_400_000));
  const total = 12_400 + days * 37;
  const rows = RANK_TIERS.map((t) => ({ tierId: t.id, players: Math.max(1, Math.round((total * SHARES[t.id]) / 100)) + (realByTier[t.id] ?? 0) }));
  const sum = rows.reduce((n, r) => n + r.players, 0);
  return rows.map((r) => ({ ...r, share: (r.players / sum) * 100 }));
}

/** Pourcentage lisible : « 0,4 % », « 12 % ». */
export const formatShare = (share: number) =>
  `${share < 10 ? share.toFixed(1).replace(".", ",") : Math.round(share)} %`;

// ─────────────────────────── Promotions ───────────────────────────

export interface Promotion {
  step: RankStep;
  /** Nouveau palier (et pas seulement une nouvelle division). */
  newTier: boolean;
}

/**
 * Promotion à fêter : seulement quand on dépasse le meilleur rang jamais atteint
 * (redescendre puis remonter ne relance pas la célébration).
 */
export function promotionBetween(peakRpBefore: number, rpAfter: number): Promotion | null {
  const before = stepIndex(peakRpBefore);
  const after = stepIndex(rpAfter);
  if (after <= before) return null;
  const step = RANK_STEPS[after];
  return { step, newTier: RANK_STEPS[before].tier.id !== step.tier.id };
}
