/**
 * Bannières de profil : affichées en haut de la carte du joueur et derrière sa
 * ligne dans le classement. Certaines sont libres, les autres se gagnent
 * (palier de rang atteint, niveau, boss, série). On peut aussi envoyer sa propre image.
 */
import { RANK_TIERS } from "./progression";

export type BannerFx = "shine" | "shimmer" | "sparkle" | "aurora" | "embers" | "runes" | "stars" | "waves";
export type Rarity = "commune" | "rare" | "épique" | "légendaire";

export type Unlock =
  | { kind: "free" }
  | { kind: "tier"; tierId: string }
  | { kind: "level"; level: number }
  | { kind: "bosses"; count: number }
  | { kind: "streak"; days: number }
  | { kind: "achievements"; count: number };

export interface Banner {
  id: string;
  name: string;
  /** Fond CSS (dégradés superposés). */
  bg: string;
  /** Effet animé par-dessus. */
  fx?: BannerFx;
  rarity: Rarity;
  unlock: Unlock;
}

/** Ce qu'il faut savoir d'un joueur pour savoir quelles bannières il a débloquées. */
export interface BannerContext {
  peakRp: number;
  level: number;
  bossesWon: number;
  streakBest: number;
  achievements: number;
}

/** Identifiant réservé : l'image envoyée par le joueur. */
export const PHOTO_BANNER = "photo";

const dots = (c: string) => `radial-gradient(${c} 1px, transparent 1.5px) 0 0 / 14px 14px`;
const lines = (c: string, a = 45) => `repeating-linear-gradient(${a}deg, ${c} 0 2px, transparent 2px 14px)`;

export const BANNERS: Banner[] = [
  // ───── Libres ─────
  { id: "nuit", name: "Nuit violette", rarity: "commune", unlock: { kind: "free" }, bg: `${dots("#ffffff14")}, linear-gradient(120deg, #2e1065, #4c1d95 45%, #1e1b4b)` },
  { id: "ocean", name: "Océan", rarity: "commune", unlock: { kind: "free" }, fx: "waves", bg: `linear-gradient(160deg, #0c4a6e, #0e7490 50%, #164e63)` },
  { id: "foret", name: "Forêt", rarity: "commune", unlock: { kind: "free" }, bg: `${lines("#ffffff0d", 120)}, linear-gradient(135deg, #14532d, #166534 50%, #052e16)` },
  { id: "sunset", name: "Coucher de soleil", rarity: "commune", unlock: { kind: "free" }, bg: `radial-gradient(circle at 80% 120%, #fde68a 0 18%, transparent 19%), linear-gradient(180deg, #7c2d12, #db2777 60%, #f59e0b)` },
  // ───── Rangs (palier le plus haut atteint) ─────
  { id: "bronze", name: "Forge de bronze", rarity: "commune", unlock: { kind: "tier", tierId: "bronze" }, bg: `${lines("#00000026", 135)}, linear-gradient(120deg, #431407, #9a3412 45%, #cd7f32 70%, #431407)` },
  { id: "argent", name: "Acier poli", rarity: "rare", unlock: { kind: "tier", tierId: "argent" }, fx: "shine", bg: `linear-gradient(115deg, #334155, #94a3b8 35%, #e2e8f0 50%, #64748b 65%, #1e293b)` },
  { id: "or", name: "Trésor impérial", rarity: "rare", unlock: { kind: "tier", tierId: "or" }, fx: "shine", bg: `${dots("#fff7ae33")}, linear-gradient(120deg, #713f12, #ca8a04 35%, #fde047 50%, #b45309 70%, #451a03)` },
  { id: "platine", name: "Cristal de platine", rarity: "épique", unlock: { kind: "tier", tierId: "platine" }, fx: "shimmer", bg: `conic-gradient(from 200deg at 70% 50%, #134e4a, #2dd4bf, #ccfbf1, #0e7490, #134e4a)` },
  { id: "diamant", name: "Éclat de diamant", rarity: "épique", unlock: { kind: "tier", tierId: "diamant" }, fx: "sparkle", bg: `linear-gradient(60deg, transparent 40%, #ffffff22 50%, transparent 60%), linear-gradient(120deg, #1e1b4b, #3b82f6 40%, #93c5fd 55%, #4338ca 75%, #0f172a)` },
  { id: "maitre", name: "Arcanes", rarity: "légendaire", unlock: { kind: "tier", tierId: "maitre" }, fx: "runes", bg: `radial-gradient(circle at 75% 50%, #e879f966 0 20%, transparent 45%), linear-gradient(120deg, #2e1065, #7e22ce 50%, #3b0764)` },
  { id: "grand-maitre", name: "Brasier", rarity: "légendaire", unlock: { kind: "tier", tierId: "grand-maitre" }, fx: "embers", bg: `radial-gradient(ellipse at 50% 130%, #fbbf24 0 15%, #ef4444 35%, transparent 65%), linear-gradient(180deg, #1c0606, #7f1d1d 60%, #b91c1c)` },
  { id: "legende", name: "Aurore légendaire", rarity: "légendaire", unlock: { kind: "tier", tierId: "legende" }, fx: "aurora", bg: `linear-gradient(110deg, #f59e0b, #ec4899 30%, #8b5cf6 55%, #22d3ee 80%, #fde047)` },
  // ───── Exploits ─────
  { id: "constellation", name: "Constellation", rarity: "rare", unlock: { kind: "level", level: 10 }, fx: "stars", bg: `linear-gradient(160deg, #020617, #1e1b4b 60%, #312e81)` },
  { id: "galaxie", name: "Galaxie", rarity: "épique", unlock: { kind: "level", level: 25 }, fx: "stars", bg: `radial-gradient(ellipse at 30% 50%, #c084fc55, transparent 55%), radial-gradient(ellipse at 75% 40%, #38bdf855, transparent 50%), linear-gradient(160deg, #020617, #1e1b4b)` },
  { id: "chasseur", name: "Chasseur de boss", rarity: "rare", unlock: { kind: "bosses", count: 3 }, bg: `${lines("#ffffff10", 45)}, linear-gradient(120deg, #18181b, #450a0a 50%, #18181b)` },
  { id: "tueur", name: "Fléau des boss", rarity: "épique", unlock: { kind: "bosses", count: 10 }, fx: "embers", bg: `linear-gradient(120deg, #0a0a0a, #7f1d1d 45%, #f97316 60%, #0a0a0a)` },
  { id: "flamme", name: "Flamme éternelle", rarity: "épique", unlock: { kind: "streak", days: 30 }, fx: "embers", bg: `radial-gradient(ellipse at 20% 120%, #fde047, #f97316 30%, transparent 60%), linear-gradient(120deg, #431407, #c2410c)` },
  { id: "collection", name: "Collectionneur", rarity: "rare", unlock: { kind: "achievements", count: 15 }, fx: "shine", bg: `${dots("#ffffff1a")}, linear-gradient(120deg, #064e3b, #059669 50%, #065f46)` },
];

export const bannerById = (id: string | undefined | null) => BANNERS.find((b) => b.id === id) ?? null;

const tierRank = (id: string) => RANK_TIERS.findIndex((t) => t.id === id);

export function isBannerUnlocked(b: Banner, ctx: BannerContext): boolean {
  const u = b.unlock;
  switch (u.kind) {
    case "free":
      return true;
    case "tier": {
      let reached = 0;
      RANK_TIERS.forEach((t, i) => (ctx.peakRp >= t.minRp ? (reached = i) : null));
      return reached >= tierRank(u.tierId);
    }
    case "level":
      return ctx.level >= u.level;
    case "bosses":
      return ctx.bossesWon >= u.count;
    case "streak":
      return ctx.streakBest >= u.days;
    case "achievements":
      return ctx.achievements >= u.count;
  }
}

/** Texte de la condition de déblocage. */
export function unlockLabel(u: Unlock): string {
  switch (u.kind) {
    case "free":
      return "Offerte";
    case "tier":
      return `Atteindre ${RANK_TIERS[tierRank(u.tierId)]?.name ?? u.tierId}`;
    case "level":
      return `Niveau ${u.level}`;
    case "bosses":
      return `${u.count} boss vaincus`;
    case "streak":
      return `Série de ${u.days} jours`;
    case "achievements":
      return `${u.count} succès`;
  }
}

/** Bannière par défaut : celle du meilleur palier atteint. */
export function defaultBannerId(peakRp: number): string {
  let id = "bronze";
  for (const t of RANK_TIERS) if (peakRp >= t.minRp && bannerById(t.id)) id = t.id;
  return id;
}

export const RARITY_STYLE: Record<Rarity, string> = {
  commune: "text-slate-300",
  rare: "text-sky-300",
  épique: "text-fuchsia-300",
  légendaire: "text-amber-300",
};
