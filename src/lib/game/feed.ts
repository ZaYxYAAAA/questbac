/**
 * Fil d'actualité : événements du joueur (enregistrés dans sa sauvegarde) mêlés
 * à des exploits de rivaux simulés, générés de façon déterministe à partir de l'heure.
 */
import { BOSSES, bossById } from "@/lib/content/bosses";
import { SUBJECTS } from "@/lib/content/curriculum";
import { ACHIEVEMENTS } from "./achievements";
import { leagueName } from "./league";
import { hashString, seededRandom } from "./quests";
import { RANK_STEPS } from "./ranks";
import { RIVAL_AVATARS, RIVAL_NAMES } from "./rivals";
import type { FeedEvent } from "./state";

export interface FeedItem {
  id: string;
  at: number;
  emoji: string;
  /** Auteur (rival) : null pour le joueur. */
  who: string | null;
  avatar: string;
  text: string;
  mine: boolean;
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

// ───────────── Rivaux simulés ─────────────

const SLOT_MS = 37 * 60_000;

type Template = (r: () => number) => { emoji: string; text: string };

const pick = <T,>(items: readonly T[], r: () => number) => items[Math.floor(r() * items.length)];

const TEMPLATES: Template[] = [
  (r) => {
    const b = pick(BOSSES, r);
    return { emoji: b.emoji, text: `vient de terrasser ${b.name}` };
  },
  (r) => {
    const s = pick(RANK_STEPS.slice(2, 16), r);
    return { emoji: s.tier.emoji, text: `a atteint le rang ${s.label}` };
  },
  (r) => ({ emoji: "🔥", text: `enchaîne un combo de ${8 + Math.floor(r() * 18)} bonnes réponses` }),
  (r) => ({ emoji: "📅", text: `tient une série de ${5 + Math.floor(r() * 40)} jours` }),
  (r) => {
    const s = pick(SUBJECTS, r);
    return { emoji: "🎯", text: `a réussi une mission de ${s.name} sans faute` };
  },
  (r) => {
    const a = pick(ACHIEVEMENTS.filter((x) => x.xp >= 50), r);
    return { emoji: a.emoji, text: `a débloqué le succès « ${a.name} »` };
  },
  () => ({ emoji: "🎁", text: "a ouvert son grand coffre du 7e jour" }),
];

/**
 * Exploits simulés des rivaux, du plus récent au plus ancien.
 * `names` : rivaux à mettre en scène (par exemple ceux de la ligue du joueur).
 */
export function rivalEvents(now: Date, count = 6, names: readonly string[] = RIVAL_NAMES): FeedItem[] {
  const pool = names.length > 0 ? names : RIVAL_NAMES;
  const out: FeedItem[] = [];
  const current = Math.floor(now.getTime() / SLOT_MS);
  for (let slot = current; out.length < count && slot > current - count * 3; slot--) {
    const r = seededRandom(hashString(`feed:${slot}`));
    // Environ un créneau sur quatre reste calme.
    if (r() < 0.25) continue;
    const at = slot * SLOT_MS + Math.floor(r() * SLOT_MS);
    if (at > now.getTime()) continue;
    const who = pick(pool, r);
    const { emoji, text } = pick(TEMPLATES, r)(r);
    out.push({ id: `rival-${slot}`, at, emoji, who, avatar: RIVAL_AVATARS[hashString(who) % RIVAL_AVATARS.length], text, mine: false });
  }
  return out;
}

/** Fil complet : événements du joueur et des rivaux, triés du plus récent au plus ancien. */
export function buildFeed(events: FeedEvent[], playerAvatar: string, now = new Date(), count = 8, names?: readonly string[]): FeedItem[] {
  const mine: FeedItem[] = events.map((e, i) => ({
    id: `me-${e.at}-${i}`,
    at: e.at,
    who: null,
    avatar: playerAvatar,
    mine: true,
    ...describeEvent(e),
  }));
  return [...mine, ...rivalEvents(now, count, names)].sort((a, b) => b.at - a.at).slice(0, count);
}

/** « à l'instant », « il y a 5 min », « il y a 3 h », « il y a 2 j ». */
export function timeAgo(at: number, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86_400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86_400)} j`;
}
