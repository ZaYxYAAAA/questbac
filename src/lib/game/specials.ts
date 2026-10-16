/**
 * Mode spécial du jour en classé : le même pour tout le monde, il change
 * chaque jour (rotation fixe, jamais deux jours de suite le même) et
 * rapporte +30 % de points de rang gagnés.
 */
import { parisDate } from "./ranked";

export type SpecialId = "eclair" | "sansfilet" | "expert" | "finale" | "melange";

export interface Special {
  id: SpecialId;
  name: string;
  emoji: string;
  /** Règle en une phrase. */
  rule: string;
  /** Couleurs de la carte. */
  gradient: string;
}

export const SPECIALS: Record<SpecialId, Special> = {
  eclair: { id: "eclair", name: "Éclair", emoji: "⚡", rule: "Deux fois moins de temps par question.", gradient: "from-yellow-400 to-orange-500" },
  sansfilet: { id: "sansfilet", name: "Sans filet", emoji: "💀", rule: "Une mauvaise réponse fait perdre 1 point.", gradient: "from-rose-500 to-red-700" },
  expert: { id: "expert", name: "Expert", emoji: "🧠", rule: "Que des questions difficiles.", gradient: "from-fuchsia-500 to-purple-700" },
  finale: { id: "finale", name: "Grande finale", emoji: "🎯", rule: "Les 3 dernières questions comptent double.", gradient: "from-sky-400 to-indigo-600" },
  melange: { id: "melange", name: "Mélange", emoji: "🎲", rule: "Pas de vote : des questions de tous les chapitres de la matière.", gradient: "from-emerald-400 to-teal-600" },
};

/** Ordre de rotation (un mode par jour). */
const ROTATION: SpecialId[] = ["eclair", "finale", "sansfilet", "melange", "expert"];

/** Bonus de points de rang gagnés en jouant le mode du jour. */
export const SPECIAL_BONUS = 0.3;

/** Chapitre fictif du mode Mélange (questions de toute la matière). */
export const MIX_CHAPTER = "__mix__";

const dayNumber = (now: Date) => {
  const d = parisDate(now);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
};

export const specialOfDay = (now = new Date()): SpecialId => ROTATION[dayNumber(now) % ROTATION.length];
export const specialOfTomorrow = (now = new Date()): SpecialId => ROTATION[(dayNumber(now) + 1) % ROTATION.length];

export const isSpecialId = (x: unknown): x is SpecialId => typeof x === "string" && x in SPECIALS;
