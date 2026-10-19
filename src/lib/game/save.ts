/**
 * Sauvegarde : migration des anciennes versions, validation de forme et
 * profil public (classement). Code partagé client / serveur.
 */
import { z } from "zod";
import type { Level } from "@/lib/types";
import { type BannerContext, PHOTO_BANNER, bannerById, isBannerUnlocked } from "./banners";
import { MAX_BANNER_CHARS, MAX_BANNER_THUMB_CHARS, MAX_PHOTO_CHARS, MAX_THUMB_CHARS, isPhotoDataUrl } from "./photo";
import { levelFromXp, rankFromRp, weekKey } from "./progression";
import { activeTierReward, unlockedTiers } from "./ranks";
import { type GameData, createInitialData } from "./state";

const DATA_KEYS = Object.keys(createInitialData()) as (keyof GameData)[];

/** Sous-objets « fixes » : fusionnés avec les valeurs par défaut pour combler les champs ajoutés depuis. */
const FIXED_OBJECTS = new Set<keyof GameData>(["streak", "stats", "quests", "weekly", "league", "daily"]);

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Ne garde que les champs de données (le store Zustand contient aussi des actions). */
export function toGameData(state: GameData): GameData {
  const out = {} as Record<string, unknown>;
  for (const k of DATA_KEYS) out[k] = state[k];
  return out as unknown as GameData;
}

/**
 * Complète une sauvegarde ancienne ou partielle avec les valeurs par défaut,
 * sans rien perdre de ce qui existe. Renvoie null si ce n'est pas une sauvegarde.
 */
export function migrateSave(raw: unknown): GameData | null {
  if (!isObject(raw)) return null;
  const base = createInitialData();
  const merged = { ...base } as Record<string, unknown>;
  for (const k of DATA_KEYS) {
    if (!(k in raw) || raw[k] === undefined) continue;
    const b = base[k];
    const v = raw[k];
    // Sous-objets « fixes » : fusion pour combler les champs ajoutés depuis.
    merged[k] = isObject(b) && isObject(v) && FIXED_OBJECTS.has(k) ? { ...b, ...v } : v;
  }
  merged.version = 1;
  // Ajouts du lot « ligues » : meilleur RP, ligue de la semaine au palier actuel, fil d'actualité.
  const rp = typeof merged.rp === "number" && Number.isFinite(merged.rp) ? merged.rp : 0;
  merged.peakRp = Math.max(rp, typeof merged.peakRp === "number" && Number.isFinite(merged.peakRp) ? merged.peakRp : 0);
  if (!isObject(raw.league)) merged.league = { ...base.league, tierId: rankFromRp(rp).tier.id };
  if (!Array.isArray(merged.feed)) merged.feed = [];
  if (isObject(merged.profile)) merged.profile = migrateProfile(merged.profile);
  merged.boost = validBoost(merged.boost);
  if (!isObject(merged.missionPlays) || typeof merged.missionPlays.day !== "string" || !isObject(merged.missionPlays.counts)) merged.missionPlays = base.missionPlays;
  merged.updatedAt = typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0;
  return merged as unknown as GameData;
}

const BOOST_SOURCES = new Set(["boss", "quests", "daily"]);

/** Boost d'XP lisible, sinon aucun : un multiplicateur invalide rendrait toute l'XP gagnée NaN. */
function validBoost(v: unknown): GameData["boost"] {
  if (!isObject(v)) return null;
  const { mult, until, source } = v;
  if (typeof mult !== "number" || !Number.isFinite(mult) || mult < 1 || mult > 2) return null;
  if (typeof until !== "number" || !Number.isFinite(until) || typeof source !== "string" || !BOOST_SOURCES.has(source)) return null;
  return { mult, until, source: source as NonNullable<GameData["boost"]>["source"] };
}

/** Emoji par défaut quand l'avatar enregistré n'en est pas un. */
export const DEFAULT_AVATAR = "🦊";
const MAX_AVATAR_CHARS = 32;

/**
 * Photo rangée à part de l'emoji : une ancienne photo stockée dans `avatar`
 * passe dans `photo`, et une photo invalide ou trop lourde est retirée.
 */
function migrateProfile(profile: Record<string, unknown>): Record<string, unknown> {
  const out = { ...profile };
  const avatar = out.avatar;
  if (typeof avatar === "string" && avatar.startsWith("data:")) {
    if (out.photo === undefined && isPhotoDataUrl(avatar)) out.photo = avatar;
    out.avatar = DEFAULT_AVATAR;
  } else if (typeof avatar !== "string" || !avatar || avatar.length > MAX_AVATAR_CHARS) {
    out.avatar = DEFAULT_AVATAR;
  }
  if (out.photo !== undefined && !isPhotoDataUrl(out.photo, MAX_PHOTO_CHARS)) delete out.photo;
  if (out.photoThumb !== undefined && !isPhotoDataUrl(out.photoThumb, MAX_THUMB_CHARS)) delete out.photoThumb;
  if (out.banner !== undefined && !isPhotoDataUrl(out.banner, MAX_BANNER_CHARS)) delete out.banner;
  if (out.bannerThumb !== undefined && !isPhotoDataUrl(out.bannerThumb, MAX_BANNER_THUMB_CHARS)) delete out.bannerThumb;
  if (out.bannerId !== undefined && (typeof out.bannerId !== "string" || out.bannerId.length > 40)) delete out.bannerId;
  return out;
}

/**
 * Au démarrage : faut-il remplacer l'état local par la sauvegarde du serveur ?
 * Oui si elle est plus récente (updatedAt) ou si l'appareil n'a pas encore de profil.
 */
export function serverSaveWins(local: Pick<GameData, "updatedAt" | "profile">, server: { save: unknown; updatedAt: number }): boolean {
  return Boolean(server.save) && (server.updatedAt > local.updatedAt || !local.profile);
}

// ───────────── Validation (côté serveur et import de fichier) ─────────────

const num = z.number(); // zod 4 refuse déjà NaN et Infinity
const level = z.enum(["seconde", "premiere", "terminale"]);

/** Forme attendue d'une sauvegarde : stricte sur l'essentiel, tolérante sur le reste. */
export const SaveSchema = z.looseObject({
  version: num,
  profile: z
    .looseObject({
      pseudo: z.string().min(1).max(40),
      avatar: z.string().min(1).max(MAX_AVATAR_CHARS),
      photo: z.string().refine((v) => isPhotoDataUrl(v, MAX_PHOTO_CHARS)).optional(),
      photoThumb: z.string().refine((v) => isPhotoDataUrl(v, MAX_THUMB_CHARS)).optional(),
      level,
      createdAt: num,
      titleId: z.string().max(40).optional(),
      frameId: z.string().max(40).optional(),
      bannerId: z.string().max(40).optional(),
      banner: z.string().refine((v) => isPhotoDataUrl(v, MAX_BANNER_CHARS)).optional(),
      bannerThumb: z.string().refine((v) => isPhotoDataUrl(v, MAX_BANNER_THUMB_CHARS)).optional(),
    })
    .nullable(),
  xp: num.min(0),
  rp: num.min(0),
  peakRp: num.min(0),
  streak: z.looseObject({ count: num, lastDay: z.string().nullable(), best: num }),
  chapters: z.record(z.string(), z.unknown()),
  bosses: z.record(z.string(), z.unknown()),
  stats: z.looseObject({ answered: num, correct: num }),
  achievements: z.record(z.string(), z.unknown()),
  quests: z.looseObject({ day: z.string() }),
  weekly: z.looseObject({ week: z.string(), xp: num }),
  league: z.looseObject({ week: z.string(), tierId: z.string().max(40), last: z.looseObject({ rank: num, size: num }).nullable() }),
  daily: z.looseObject({ lastClaim: z.string().nullable(), count: num }),
  feed: z.array(z.looseObject({ at: num, kind: z.string(), ref: z.string().max(80) })).max(100),
  xpByDay: z.record(z.string(), num),
  fiches: z.array(z.unknown()).max(500),
  missions: z.array(z.unknown()).max(500),
  updatedAt: num.min(0),
});

export const MAX_SAVE_BYTES = 2_000_000;

// ───────────── Profil public (classement réel) ─────────────

export interface PublicProfile {
  /** Identifiant public (empreinte de l'id de compte, qui reste secret). */
  id: string;
  pseudo: string;
  avatar: string;
  /** Miniature 64 × 64 de la photo de profil, s'il y en a une. */
  photoThumb?: string;
  /** Palier du titre affiché sous le pseudo. */
  titleId?: string;
  /** Palier du cadre d'avatar choisi (sinon : celui du rang). */
  frameId?: string;
  /** Bannière choisie (vérifiée : débloquée), ou « photo » avec sa miniature. */
  bannerId?: string;
  /** Miniature 240 × 80 de la bannière envoyée. */
  bannerThumb?: string;
  level: Level;
  playerLevel: number;
  rp: number;
  xp: number;
  weeklyXp: number;
  week: string;
  /** Résumé affiché sur la fiche du joueur. */
  stats?: PublicStats;
  updatedAt: number;
}

export interface PublicStats {
  missions: number;
  answered: number;
  /** Pourcentage de bonnes réponses (0 à 100). */
  accuracy: number;
  bestCombo: number;
  perfects: number;
  bossesWon: number;
  streak: number;
  streakBest: number;
  achievements: number;
  peakRp: number;
  /** Chapitres avec au moins une étoile. */
  chapters: number;
  stars: number;
}

/** Ce qui débloque les bannières, calculé depuis la sauvegarde. */
export function bannerContext(save: Pick<GameData, "rp" | "peakRp" | "xp" | "bosses" | "streak" | "achievements">): BannerContext {
  return {
    peakRp: Math.max(save.rp, save.peakRp ?? 0),
    level: levelFromXp(save.xp).level,
    bossesWon: Object.values(save.bosses ?? {}).filter((b) => (b as { victories?: number })?.victories).length,
    streakBest: Math.max(save.streak?.best ?? 0, save.streak?.count ?? 0),
    achievements: Object.keys(save.achievements ?? {}).length,
  };
}

/** Bannière réellement portée : celle choisie si elle est débloquée (ou la photo si elle existe). */
export function activeBannerId(profile: { bannerId?: string; bannerThumb?: string } | null | undefined, ctx: BannerContext): string | undefined {
  const id = profile?.bannerId;
  if (!id) return undefined;
  if (id === PHOTO_BANNER) return isPhotoDataUrl(profile?.bannerThumb, MAX_BANNER_THUMB_CHARS) ? id : undefined;
  const b = bannerById(id);
  return b && isBannerUnlocked(b, ctx) ? id : undefined;
}

export function publicStatsFrom(save: GameData): PublicStats {
  const ctx = bannerContext(save);
  const chapters = Object.values(save.chapters ?? {});
  return {
    missions: save.stats.missions ?? 0,
    answered: save.stats.answered ?? 0,
    accuracy: save.stats.answered ? Math.round((100 * save.stats.correct) / save.stats.answered) : 0,
    bestCombo: save.stats.bestCombo ?? 0,
    perfects: save.stats.perfects ?? 0,
    bossesWon: ctx.bossesWon,
    streak: save.streak?.count ?? 0,
    streakBest: ctx.streakBest,
    achievements: ctx.achievements,
    peakRp: Math.round(ctx.peakRp),
    chapters: chapters.filter((c) => c?.stars > 0).length,
    stars: chapters.reduce((s, c) => s + (c?.stars ?? 0), 0),
  };
}

/** Seule la miniature est publiée (jamais la grande photo) ; l'avatar reste un emoji. */
export function publicProfileFrom(account: { publicId: string; pseudo: string }, save: GameData): PublicProfile {
  const avatar = save.profile?.avatar ?? "🙂";
  const thumb = save.profile?.photoThumb;
  const peakRp = Math.max(save.rp, save.peakRp ?? 0);
  const frame = save.profile?.frameId && unlockedTiers(peakRp).includes(save.profile.frameId) ? save.profile.frameId : undefined;
  return {
    id: account.publicId,
    pseudo: account.pseudo,
    avatar: avatar.length <= MAX_AVATAR_CHARS && !avatar.startsWith("data:") ? avatar : "🙂",
    ...(isPhotoDataUrl(thumb, MAX_THUMB_CHARS) ? { photoThumb: thumb } : {}),
    titleId: activeTierReward(save.profile?.titleId, peakRp).tierId,
    ...(frame ? { frameId: frame } : {}),
    ...banner(save),
    level: save.profile?.level ?? "premiere",
    playerLevel: levelFromXp(save.xp).level,
    rp: Math.round(save.rp),
    xp: Math.round(save.xp),
    weeklyXp: Math.round(save.weekly.xp),
    week: save.weekly.week,
    stats: publicStatsFrom(save),
    updatedAt: save.updatedAt,
  };
}

function banner(save: GameData): Pick<PublicProfile, "bannerId" | "bannerThumb"> {
  const id = activeBannerId(save.profile, bannerContext(save));
  if (!id) return {};
  return id === PHOTO_BANNER ? { bannerId: id, bannerThumb: save.profile!.bannerThumb } : { bannerId: id };
}

/** XP hebdomadaire réellement valable cette semaine (0 si la sauvegarde date d'une semaine passée). */
export function currentWeeklyXp(p: Pick<PublicProfile, "weeklyXp" | "week">, now = new Date()) {
  return p.week === weekKey(now) ? p.weeklyXp : 0;
}

/** Valide une sauvegarde reçue (serveur ou fichier importé) et la complète. */
export function parseSave(raw: unknown): { ok: true; data: GameData } | { ok: false; error: string } {
  const migrated = migrateSave(raw);
  if (!migrated) return { ok: false, error: "Ce n'est pas une sauvegarde QuestBac." };
  const checked = SaveSchema.safeParse(migrated);
  if (!checked.success) {
    const issue = checked.error.issues[0];
    return { ok: false, error: `Sauvegarde invalide (${issue?.path.join(".") || "format"}).` };
  }
  return { ok: true, data: migrated };
}
