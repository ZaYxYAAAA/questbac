/**
 * Classements.
 *
 * Fondation : en attendant un backend (voir README → « Passer en multijoueur »),
 * le joueur est classé parmi des rivaux simulés de façon déterministe. Leur
 * progression avance avec le temps pour que le classement reste vivant.
 * L'interface `LeaderboardEntry` est celle qu'un vrai backend devra renvoyer.
 */
import type { Level } from "@/lib/types";
import { hashString, seededRandom } from "./quests";
import { levelFromXp, weekKey } from "./progression";

export interface LeaderboardEntry {
  id: string;
  pseudo: string;
  avatar: string;
  level: Level;
  playerLevel: number;
  weeklyXp: number;
  rp: number;
  isPlayer?: boolean;
}

const NAMES = [
  "Lina_Maths", "Noé42", "Inès.exe", "Hugo_Newton", "Jade⚡", "Rayan_Bac", "Chloé_SVT", "Adam.ln",
  "Léa_Euler", "Sacha_RC", "Manon🦉", "Yanis_TVI", "Camille_π", "Nathan.dx", "Zoé_Kant", "Ilyes_Redox",
  "Emma∫", "Lucas_Δ", "Sarah_Hugo", "Théo_Bohr", "Maëlys_ADN", "Gabriel.exp", "Anaïs_1789", "Mehdi_Vect",
  "Louise_Zola", "Enzo_pH", "Romane_Gauss", "Ayoub_q^n", "Clara_Spinoza", "Tom_Kepler", "Nina_Lewis",
  "Mathis_cos", "Eva_Pascal", "Samy_Doppler", "Alice_Boole", "Kenzo_RNA", "Lou_Sartre", "Bilal_Bernoulli",
];
const AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦄", "🐺", "🦅", "🐲", "🐧", "🦋", "🐨", "🦖", "🐬", "🦉"];
const LEVELS: Level[] = ["seconde", "premiere", "terminale"];

const EPOCH = Date.UTC(2026, 0, 1);

function bots(now: Date): LeaderboardEntry[] {
  const week = weekKey(now);
  const day = now.getDay() || 7; // 1 (lundi) .. 7 (dimanche)
  const weekProgress = (day - 1 + now.getHours() / 24) / 7;
  const daysSinceEpoch = Math.max(0, (now.getTime() - EPOCH) / 86_400_000);

  return NAMES.map((pseudo, i) => {
    const r = seededRandom(hashString(`bot:${pseudo}`));
    const skill = r(); // talent stable du bot
    const wr = seededRandom(hashString(`bot:${pseudo}:${week}`))();
    const weeklyTarget = Math.round(200 + 2600 * Math.pow(skill, 1.6) * (0.6 + 0.8 * wr));
    const rp = Math.round(150 + 7500 * Math.pow(skill, 2.2) + daysSinceEpoch * 3 * skill);
    const totalXp = Math.round(rp * 4 + daysSinceEpoch * 40 * skill);
    return {
      id: `bot-${i}`,
      pseudo,
      avatar: AVATARS[i % AVATARS.length],
      level: LEVELS[Math.floor(r() * 3)],
      playerLevel: levelFromXp(totalXp).level,
      weeklyXp: Math.round(weeklyTarget * Math.min(1, weekProgress + 0.05)),
      rp,
    };
  });
}

export type LeaderboardScope = "hebdo" | "global" | "niveau";

export function buildLeaderboard(
  player: Omit<LeaderboardEntry, "id" | "isPlayer">,
  scope: LeaderboardScope,
  now = new Date(),
): LeaderboardEntry[] {
  let entries = [...bots(now), { ...player, id: "player", isPlayer: true }];
  if (scope === "niveau") entries = entries.filter((e) => e.level === player.level);
  const key = scope === "hebdo" ? "weeklyXp" : "rp";
  return entries.sort((a, b) => b[key] - a[key] || (a.isPlayer ? -1 : 1));
}
