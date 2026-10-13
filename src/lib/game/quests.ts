/** Quêtes du jour : 3 objectifs tirés de façon déterministe à partir de la date. */

export type QuestEvent =
  | "correct"
  | "mission"
  | "perfect"
  | "boss_win"
  | "lab"
  | "fiche"
  | "forge"
  | "combo";

export interface QuestDef {
  id: string;
  label: string;
  emoji: string;
  event: QuestEvent;
  target: number;
  xp: number;
}

const POOL: QuestDef[] = [
  { id: "correct-10", label: "Donne 10 bonnes réponses", emoji: "✅", event: "correct", target: 10, xp: 40 },
  { id: "correct-25", label: "Donne 25 bonnes réponses", emoji: "✅", event: "correct", target: 25, xp: 80 },
  { id: "mission-2", label: "Termine 2 missions", emoji: "🗺️", event: "mission", target: 2, xp: 50 },
  { id: "mission-4", label: "Termine 4 missions", emoji: "🗺️", event: "mission", target: 4, xp: 90 },
  { id: "perfect-1", label: "Réussis une mission sans faute", emoji: "🎯", event: "perfect", target: 1, xp: 60 },
  { id: "boss-1", label: "Terrasse un boss", emoji: "⚔️", event: "boss_win", target: 1, xp: 100 },
  { id: "lab-1", label: "Explore un labo interactif", emoji: "🧪", event: "lab", target: 1, xp: 25 },
  { id: "lab-3", label: "Explore 3 labos interactifs", emoji: "🧪", event: "lab", target: 3, xp: 50 },
  { id: "combo-6", label: "Atteins un combo de 6", emoji: "🔥", event: "combo", target: 6, xp: 50 },
];

export const CHEST_XP = 120;

/** PRNG déterministe (mulberry32). */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange de Fisher-Yates (non destructif). */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Les 3 quêtes du jour, sans doublon d'événement. */
export function dailyQuests(day: string): QuestDef[] {
  const shuffled = shuffle(POOL, seededRandom(hashString(`quests:${day}`)));
  const picked: QuestDef[] = [];
  for (const q of shuffled) {
    if (picked.some((p) => p.event === q.event)) continue;
    picked.push(q);
    if (picked.length === 3) break;
  }
  return picked;
}

export const questById = (id: string) => POOL.find((q) => q.id === id);
