/**
 * Règles des boss : 3 essais pour toute la vie du compte. Vaincu, le boss
 * rapporte un coffre (XP, boost, trophée) puis ne se rejoue plus ; après
 * 3 défaites, il est perdu pour de bon.
 */

export const BOSS_MAX_TRIES = 3;

export interface BossRecord {
  victories: number;
  /** Combats joués depuis toujours (statistique). */
  attempts: number;
  bestTimeMs: number | null;
  /** Essais comptés pour la limite de 3 (règle en vigueur depuis la v2 des boss). */
  tries?: number;
  /** Vaincu au premier essai : trophée « Imbattable ». */
  flawless?: boolean;
  /** Début (ms) du combat en cours, pas encore terminé (l'essai est déjà compté). */
  pending?: number | boolean;
}

export type BossState = "available" | "defeated" | "lost";

/** Un combat non terminé au bout de 30 min est considéré comme abandonné. */
export const FIGHT_TIMEOUT_MS = 30 * 60_000;

export const fightInProgress = (record: BossRecord | undefined, now = Date.now()) =>
  typeof record?.pending === "number" && now - record.pending < FIGHT_TIMEOUT_MS;

/** Combat lancé (essai compté) et pas encore terminé, quelle que soit sa durée ; un boss déjà vaincu n'en a plus. */
export const fightStarted = (record: BossRecord | undefined) =>
  (record?.victories ?? 0) === 0 && (typeof record?.pending === "number" || record?.pending === true);

export function bossState(record: BossRecord | undefined, now = Date.now()): BossState {
  if ((record?.victories ?? 0) > 0) return "defeated";
  // Le dernier essai, tant que son combat est en cours, peut encore être gagné.
  if ((record?.tries ?? 0) >= BOSS_MAX_TRIES && !fightInProgress(record, now)) return "lost";
  return "available";
}

/** Essais restants (0 si le boss est vaincu ou perdu). */
export function triesLeft(record: BossRecord | undefined, now = Date.now()): number {
  return bossState(record, now) === "available" ? Math.max(0, BOSS_MAX_TRIES - (record?.tries ?? 0)) : 0;
}

const count = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

/** Meilleur temps connu des deux versions (null si aucune n'en a). */
function bestTime(a: unknown, b: unknown): number | null {
  const times = [a, b].filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
  return times.length ? Math.min(...times) : null;
}

/**
 * Fusion serveur : on garde toujours le plus grand nombre d'essais et de victoires
 * connus (réinstaller l'appli ou envoyer une vieille sauvegarde ne rend pas d'essais).
 */
export function keepBossProgress(stored: Record<string, unknown> | undefined, incoming: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...incoming };
  for (const [id, raw] of Object.entries(stored ?? {})) {
    if (!raw || typeof raw !== "object") continue;
    const old = raw as Record<string, unknown>;
    const now = (out[id] && typeof out[id] === "object" ? out[id] : {}) as Record<string, unknown>;
    out[id] = {
      ...old,
      ...now,
      victories: Math.max(count(old.victories), count(now.victories)),
      attempts: Math.max(count(old.attempts), count(now.attempts)),
      tries: Math.max(count(old.tries), count(now.tries)),
      flawless: Boolean(old.flawless || now.flawless),
      bestTimeMs: bestTime(old.bestTimeMs, now.bestTimeMs),
    };
  }
  return out;
}
