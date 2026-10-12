import type { GameData } from "./state";
import { levelFromXp, rankFromRp } from "./progression";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xp: number;
  check: (d: GameData) => boolean;
}

const subjectsPlayed = (d: GameData) =>
  Object.values(d.stats.bySubject).filter((s) => s && s.answered > 0).length;

const bossVictories = (d: GameData) => Object.values(d.bosses).reduce((n, b) => n + b.victories, 0);

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "premiers-pas", name: "Premiers pas", description: "Termine ta première mission.", emoji: "👣", xp: 30, check: (d) => d.stats.missions >= 1 },
  { id: "sans-faute", name: "Sans faute", description: "Réussis une mission à 100 %.", emoji: "🎯", xp: 50, check: (d) => d.stats.perfects >= 1 },
  { id: "perfectionniste", name: "Perfectionniste", description: "Réussis 10 missions à 100 %.", emoji: "💯", xp: 150, check: (d) => d.stats.perfects >= 10 },
  { id: "combo-5", name: "En feu", description: "Enchaîne 5 bonnes réponses.", emoji: "🔥", xp: 30, check: (d) => d.stats.bestCombo >= 5 },
  { id: "combo-15", name: "Inarrêtable", description: "Enchaîne 15 bonnes réponses.", emoji: "☄️", xp: 120, check: (d) => d.stats.bestCombo >= 15 },
  { id: "tueur-de-boss", name: "Tueur de boss", description: "Terrasse ton premier boss.", emoji: "⚔️", xp: 100, check: (d) => bossVictories(d) >= 1 },
  { id: "chasseur", name: "Chasseur légendaire", description: "Remporte 5 combats de boss.", emoji: "🏹", xp: 250, check: (d) => bossVictories(d) >= 5 },
  { id: "serie-3", name: "Régulier", description: "Révise 3 jours d'affilée.", emoji: "📅", xp: 50, check: (d) => d.streak.best >= 3 },
  { id: "serie-7", name: "Discipline de fer", description: "Révise 7 jours d'affilée.", emoji: "🗓️", xp: 150, check: (d) => d.streak.best >= 7 },
  { id: "erudit", name: "Érudit", description: "Donne 100 bonnes réponses.", emoji: "📚", xp: 100, check: (d) => d.stats.correct >= 100 },
  { id: "sage", name: "Sage", description: "Donne 500 bonnes réponses.", emoji: "🧙", xp: 300, check: (d) => d.stats.correct >= 500 },
  { id: "polymathe", name: "Polymathe", description: "Réponds dans 4 matières différentes.", emoji: "🌐", xp: 80, check: (d) => subjectsPlayed(d) >= 4 },
  { id: "laborantin", name: "Laborantin", description: "Explore 5 labos interactifs.", emoji: "🧪", xp: 60, check: (d) => d.stats.labsOpened.length >= 5 },
  { id: "forgeron", name: "Forgeron", description: "Crée ta première mission dans la Forge.", emoji: "⚒️", xp: 60, check: (d) => d.stats.missionsForged >= 1 },
  { id: "bibliothecaire", name: "Bibliothécaire", description: "Génère 3 fiches avec le Prof IA.", emoji: "🗂️", xp: 60, check: (d) => d.stats.fichesGenerated >= 3 },
  { id: "niveau-5", name: "Apprenti", description: "Atteins le niveau 5.", emoji: "⭐", xp: 0, check: (d) => levelFromXp(d.xp).level >= 5 },
  { id: "niveau-10", name: "Vétéran", description: "Atteins le niveau 10.", emoji: "🌟", xp: 0, check: (d) => levelFromXp(d.xp).level >= 10 },
  { id: "rang-or", name: "Cœur d'or", description: "Atteins le rang Or.", emoji: "🥇", xp: 100, check: (d) => rankFromRp(d.rp).tier.minRp >= 800 },
  { id: "rang-diamant", name: "Esprit de diamant", description: "Atteins le rang Diamant.", emoji: "💎", xp: 300, check: (d) => rankFromRp(d.rp).tier.minRp >= 2800 },
];

/** Renvoie les succès nouvellement débloqués (non encore présents dans `d.achievements`). */
export function newlyUnlocked(d: GameData): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !d.achievements[a.id] && a.check(d));
}
