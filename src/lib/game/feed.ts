/** Fil d'actualité : les événements du joueur, enregistrés dans sa sauvegarde. */
import { bossById } from "@/lib/content/bosses";
import { ACHIEVEMENTS } from "./achievements";
import { leagueName } from "./league";
import type { FeedEvent } from "./state";

export interface FeedItem {
  id: string;
  at: number;
  emoji: string;
  text: string;
}

export function describeEvent(e: FeedEvent): { emoji: string; text: string } {
  switch (e.kind) {
    case "boss": {
      const boss = bossById(e.ref);
      return { emoji: boss?.emoji ?? "⚔️", text: `Tu as terrassé ${boss?.name ?? "un boss"} !` };
    }
    case "rank":
      return { emoji: "🏅", text: `Promotion : te voilà ${e.ref} !` };
    case "achievement": {
      const a = ACHIEVEMENTS.find((x) => x.id === e.ref);
      return { emoji: a?.emoji ?? "🏆", text: `Succès débloqué : ${a?.name ?? e.ref}` };
    }
    case "level":
      return { emoji: "⬆️", text: `Tu as atteint le niveau ${e.ref}.` };
    case "league": {
      const [rank, tierId] = e.ref.split(":");
      return { emoji: Number(rank) <= 3 ? "🏆" : "📊", text: `Tu as fini ${rank === "1" ? "1er" : `${rank}e`} de ta ${leagueName(tierId)}.` };
    }
  }
}

/** Fil du joueur, du plus récent au plus ancien. */
export function buildFeed(events: FeedEvent[], count = 8): FeedItem[] {
  return events
    .map((e, i) => ({ id: `me-${e.at}-${i}`, at: e.at, ...describeEvent(e) }))
    .sort((a, b) => b.at - a.at)
    .slice(0, count);
}

/** « à l'instant », « il y a 5 min », « il y a 3 h », « il y a 2 j ». */
export function timeAgo(at: number, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86_400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86_400)} j`;
}
