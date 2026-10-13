/**
 * Sauvegarde : migration des anciennes versions, validation de forme et
 * profil public (classement). Code partagé client / serveur.
 */
import { z } from "zod";
import type { Level } from "@/lib/types";
import { levelFromXp, weekKey } from "./progression";
import { type GameData, createInitialData } from "./state";

const DATA_KEYS = Object.keys(createInitialData()) as (keyof GameData)[];

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
    merged[k] = isObject(b) && isObject(v) && (k === "streak" || k === "stats" || k === "quests" || k === "weekly") ? { ...b, ...v } : v;
  }
  merged.version = 1;
  merged.updatedAt = typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0;
  return merged as unknown as GameData;
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
      // Emoji ou image compressée (data URL).
      avatar: z.string().max(400_000),
      level,
      createdAt: num,
    })
    .nullable(),
  xp: num.min(0),
  rp: num.min(0),
  streak: z.looseObject({ count: num, lastDay: z.string().nullable(), best: num }),
  chapters: z.record(z.string(), z.unknown()),
  bosses: z.record(z.string(), z.unknown()),
  stats: z.looseObject({ answered: num, correct: num }),
  achievements: z.record(z.string(), z.unknown()),
  quests: z.looseObject({ day: z.string() }),
  weekly: z.looseObject({ week: z.string(), xp: num }),
  xpByDay: z.record(z.string(), num),
  fiches: z.array(z.unknown()).max(500),
  missions: z.array(z.unknown()).max(500),
  updatedAt: num.min(0),
});

export const MAX_SAVE_BYTES = 2_000_000;

// ───────────── Profil public (classement réel) ─────────────

export interface PublicProfile {
  id: string;
  pseudo: string;
  avatar: string;
  level: Level;
  playerLevel: number;
  rp: number;
  xp: number;
  weeklyXp: number;
  week: string;
  updatedAt: number;
}

/** Au-delà, l'avatar (photo) est jugé trop lourd pour le classement : on met un emoji. */
export const MAX_PUBLIC_AVATAR = 24_000;

export function publicProfileFrom(account: { id: string; pseudo: string }, save: GameData): PublicProfile {
  const avatar = save.profile?.avatar ?? "🙂";
  return {
    id: account.id,
    pseudo: account.pseudo,
    avatar: avatar.length <= MAX_PUBLIC_AVATAR ? avatar : "🙂",
    level: save.profile?.level ?? "premiere",
    playerLevel: levelFromXp(save.xp).level,
    rp: Math.round(save.rp),
    xp: Math.round(save.xp),
    weeklyXp: Math.round(save.weekly.xp),
    week: save.weekly.week,
    updatedAt: save.updatedAt,
  };
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
