/**
 * État du joueur et règles d'évolution, sous forme de fonctions pures
 * (testables, indépendantes du stockage). Le store Zustand ne fait que les appeler.
 */
import type { CustomMission, Level, QuizResult, SavedFiche, SubjectId } from "@/lib/types";
import { type BossRecord, bossState, fightInProgress, triesLeft } from "./boss-rules";
import { type XpBoost, activeBoost, fmtMult, grantBoost, replayFactor } from "./boost";
import { DUEL_REWARDS, type DuelOutcome } from "./duel";
import { matchXp, ordinal } from "./match";
import { type AchievementDef, newlyUnlocked } from "./achievements";
import { type DailyReward, type DailyState, claimDaily } from "./daily";
import type { LeagueState } from "./league";
import {
  dayKey,
  levelFromXp,
  missionRewards,
  nextStreak,
  rankFromRp,
  streakBonus,
  weekKey,
} from "./progression";
import { CHEST_XP, type QuestDef, type QuestEvent, dailyQuests } from "./quests";
import { type Promotion, promotionBetween } from "./ranks";

export interface Profile {
  pseudo: string;
  /** Emoji, affiché quand il n'y a pas de photo. */
  avatar: string;
  /** Photo de profil : JPEG 256 × 256 en data URL. */
  photo?: string;
  /** Miniature 64 × 64 de la photo, seule partagée dans le classement. */
  photoThumb?: string;
  level: Level;
  createdAt: number;
  /** Palier dont le titre est affiché sous le pseudo (par défaut : le meilleur atteint). */
  titleId?: string;
  /** Palier dont le cadre d'avatar est porté (par défaut : celui du rang actuel). */
  frameId?: string;
  /** Bannière choisie (voir banners.ts), ou « photo » pour l'image envoyée. */
  bannerId?: string;
  /** Bannière envoyée : JPEG 720 × 240 en data URL. */
  banner?: string;
  /** Miniature 240 × 80 de la bannière, partagée dans le classement. */
  bannerThumb?: string;
}

/** Événement du fil d'actualité, stocké sous forme de données (texte calculé à l'affichage). */
export interface FeedEvent {
  at: number;
  kind: "boss" | "rank" | "achievement" | "level" | "league";
  /** bossId, libellé du rang, id du succès, niveau, ou « place:palier » pour la ligue. */
  ref: string;
}

export const MAX_FEED = 20;

/** Ajoute des événements en gardant les plus récents. */
export function pushFeed(feed: FeedEvent[], events: FeedEvent[]): FeedEvent[] {
  if (events.length === 0) return feed;
  return [...events, ...feed].sort((a, b) => b.at - a.at).slice(0, MAX_FEED);
}

export interface ChapterProgress {
  stars: 0 | 1 | 2 | 3;
  bestScore: number; // 0..1
  attempts: number;
  lastPlayed: number;
  /** Thèmes à niveaux (Culture générale) : plus haut niveau réussi (0 à 3). */
  tier?: number;
}

/** Score à atteindre pour réussir un niveau et débloquer le suivant. */
export const TIER_PASS = 0.7;
/** Bonus d'XP selon le niveau joué (Basique, Intermédiaire, Expert). */
export const TIER_XP_BONUS = [0, 0, 0.25, 0.5] as const;
/** Niveaux accessibles : le Basique, puis chaque niveau dont le précédent est réussi. */
export const tierUnlocked = (progress: ChapterProgress | undefined, tier: number) => tier <= 1 || (progress?.tier ?? 0) >= tier - 1;

export type { BossRecord };

export interface GameData {
  version: 1;
  profile: Profile | null;
  xp: number;
  rp: number;
  /** Meilleur total de RP jamais atteint : débloque titres et cadres, même après une défaite. */
  peakRp: number;
  streak: { count: number; lastDay: string | null; best: number };
  chapters: Record<string, ChapterProgress>;
  bosses: Record<string, BossRecord>;
  stats: {
    answered: number;
    correct: number;
    bestCombo: number;
    missions: number;
    perfects: number;
    labsOpened: string[];
    fichesGenerated: number;
    missionsForged: number;
    bySubject: Partial<Record<SubjectId, { answered: number; correct: number }>>;
  };
  achievements: Record<string, number>;
  quests: { day: string; progress: Record<string, number>; done: string[]; chest: boolean };
  weekly: { week: string; xp: number };
  league: LeagueState;
  daily: DailyState;
  feed: FeedEvent[];
  xpByDay: Record<string, number>;
  fiches: SavedFiche[];
  missions: CustomMission[];
  /** Boost d'XP en cours (boss, quêtes, coffre de série). */
  boost?: XpBoost | null;
  /** Missions jouées aujourd'hui (l'XP baisse quand on rejoue la même). */
  missionPlays?: { day: string; counts: Record<string, number> };
  /** Horodatage (ms) de la dernière modification : arbitre la synchronisation serveur. */
  updatedAt: number;
}

export function createInitialData(now = new Date()): GameData {
  return {
    version: 1,
    profile: null,
    xp: 0,
    rp: 0,
    peakRp: 0,
    streak: { count: 0, lastDay: null, best: 0 },
    chapters: {},
    bosses: {},
    stats: {
      answered: 0,
      correct: 0,
      bestCombo: 0,
      missions: 0,
      perfects: 0,
      labsOpened: [],
      fichesGenerated: 0,
      missionsForged: 0,
      bySubject: {},
    },
    achievements: {},
    quests: { day: dayKey(now), progress: {}, done: [], chest: false },
    weekly: { week: weekKey(now), xp: 0 },
    league: { week: weekKey(now), tierId: "bronze", last: null },
    daily: { lastClaim: null, count: 0 },
    feed: [],
    xpByDay: {},
    fiches: [],
    boost: null,
    missionPlays: { day: "", counts: {} },
    missions: [],
    updatedAt: 0,
  };
}

export interface RewardLine {
  label: string;
  value: string;
}

export interface RewardSummary {
  xpGained: number;
  rpDelta: number;
  levelBefore: number;
  levelAfter: number;
  rankBefore: string;
  rankAfter: string;
  rankUp: boolean;
  stars?: 0 | 1 | 2 | 3;
  lines: RewardLine[];
  achievements: AchievementDef[];
  quests: QuestDef[];
  chest: boolean;
  /** Nouveau meilleur rang atteint (à célébrer). */
  promotion: Promotion | null;
}


/**
 * Réinitialise quêtes et XP hebdomadaire si le jour / la semaine a changé.
 * Au changement de semaine, la ligue écoulée est close : place finale,
 * récompense (XP / RP) et nouveau groupe selon le rang actuel.
 */
export function refreshPeriods(d: GameData, now = new Date()): GameData {
  const today = dayKey(now);
  const week = weekKey(now);
  let next = d;
  if (d.quests.day !== today) next = { ...next, quests: { day: today, progress: {}, done: [], chest: false } };
  if (d.weekly.week !== week || d.league.week !== week) {
    // L'ancienne ligue d'XP est remplacée par les groupes du mode classé : plus de récompense ici.
    next = {
      ...next,
      weekly: next.weekly.week === week ? next.weekly : { week, xp: 0 },
      league: next.league.week === week ? next.league : { week, tierId: rankFromRp(next.rp).tier.id, last: next.league.last, rivals: [] },
    };
  }
  return next;
}

/** Le joueur a vu le résultat de sa dernière ligue. */
export function acknowledgeLeague(d: GameData): GameData {
  if (!d.league.last || d.league.last.seen) return d;
  return { ...d, league: { ...d.league, last: { ...d.league.last, seen: true } } };
}

/** Fait progresser les quêtes du jour. `combo` utilise la valeur max, les autres s'additionnent. */
function progressQuests(d: GameData, events: Partial<Record<QuestEvent, number>>) {
  const quests = dailyQuests(d.quests.day);
  const progress = { ...d.quests.progress };
  const done = [...d.quests.done];
  const completed: QuestDef[] = [];
  for (const q of quests) {
    const amount = events[q.event];
    if (!amount || done.includes(q.id)) continue;
    progress[q.id] = q.event === "combo" ? Math.max(progress[q.id] ?? 0, amount) : (progress[q.id] ?? 0) + amount;
    if (progress[q.id] >= q.target) {
      done.push(q.id);
      completed.push(q);
    }
  }
  const chest = !d.quests.chest && done.length === quests.length;
  return { quests: { ...d.quests, progress, done, chest: d.quests.chest || chest }, completed, chest };
}

function addXp(d: GameData, xp: number, now: Date): GameData {
  const today = dayKey(now);
  const xpByDay = { ...d.xpByDay, [today]: (d.xpByDay[today] ?? 0) + xp };
  // On ne garde que les 60 derniers jours.
  const keys = Object.keys(xpByDay).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - 60))) delete xpByDay[k];
  return { ...d, xp: d.xp + xp, weekly: { ...d.weekly, xp: d.weekly.xp + xp }, xpByDay };
}

function touchStreak(d: GameData, now: Date): GameData {
  const s = nextStreak({ count: d.streak.count, lastDay: d.streak.lastDay }, dayKey(now));
  return { ...d, streak: { ...s, best: Math.max(d.streak.best, s.count) } };
}

/**
 * Étape commune : quêtes, succès, XP bonus et construction du résumé.
 */
function finalize(
  before: GameData,
  afterBase: GameData,
  base: {
    xp: number;
    rp: number;
    lines: RewardLine[];
    stars?: 0 | 1 | 2 | 3;
    events: Partial<Record<QuestEvent, number>>;
    feed?: Omit<FeedEvent, "at">[];
  },
  now: Date,
): { data: GameData; summary: RewardSummary } {
  // Le rang ne se gagne plus qu'en mode classé : l'entraînement rapporte de l'XP seulement.
  const lines = base.lines.filter((l) => l.label !== "Points de rang");
  // Boost en vigueur au début de l'activité (celui qu'elle fait gagner compte pour la suivante).
  const boost = activeBoost(before.boost, now);
  const boosted = boost && base.xp > 0 ? Math.round(base.xp * (boost.mult - 1)) : 0;
  if (boosted > 0) lines.push({ label: `🚀 ${boost!.label}`, value: `+${boosted} XP` });
  let d = addXp({ ...afterBase, rp: before.rp }, base.xp + boosted, now);
  let xpGained = base.xp + boosted;

  const q = progressQuests(d, base.events);
  d = { ...d, quests: q.quests };
  for (const quest of q.completed) {
    d = addXp(d, quest.xp, now);
    xpGained += quest.xp;
    lines.push({ label: `Quête : ${quest.label}`, value: `+${quest.xp} XP` });
  }
  if (q.chest) {
    d = addXp(d, CHEST_XP, now);
    xpGained += CHEST_XP;
    lines.push({ label: "Coffre des quêtes du jour", value: `+${CHEST_XP} XP` });
    d = { ...d, boost: grantBoost(d.boost, 1.5, 30, "quests", now) };
    lines.push({ label: "🚀 Boost XP ×1,5 activé", value: "30 min" });
  }

  // Les succès peuvent en débloquer d'autres (ex. niveau atteint grâce à l'XP d'un succès).
  const achievements: AchievementDef[] = [];
  for (let guard = 0; guard < 3; guard++) {
    const fresh = newlyUnlocked(d);
    if (fresh.length === 0) break;
    const unlocked = { ...d.achievements };
    for (const a of fresh) unlocked[a.id] = now.getTime();
    d = { ...d, achievements: unlocked };
    for (const a of fresh) {
      achievements.push(a);
      if (a.xp > 0) {
        d = addXp(d, a.xp, now);
        xpGained += a.xp;
      }
    }
  }

  const rankBefore = rankFromRp(before.rp);
  const rankAfter = rankFromRp(d.rp);
  const levelBefore = levelFromXp(before.xp).level;
  const levelAfter = levelFromXp(d.xp).level;
  const promotion = promotionBetween(before.peakRp, d.rp);
  const at = now.getTime();
  d = {
    ...d,
    peakRp: Math.max(d.peakRp, d.rp),
    feed: pushFeed(d.feed, [
      ...(base.feed ?? []).map((e) => ({ ...e, at })),
      ...achievements.map((a) => ({ at, kind: "achievement" as const, ref: a.id })),
      ...(levelAfter > levelBefore ? [{ at, kind: "level" as const, ref: String(levelAfter) }] : []),
      ...(promotion ? [{ at, kind: "rank" as const, ref: promotion.step.label }] : []),
    ]),
  };
  return {
    data: d,
    summary: {
      xpGained,
      rpDelta: d.rp - before.rp,
      levelBefore,
      levelAfter,
      rankBefore: rankBefore.label,
      rankAfter: rankAfter.label,
      rankUp: d.rp > before.rp && rankAfter.label !== rankBefore.label,
      stars: base.stars,
      lines,
      achievements,
      quests: q.completed,
      chest: q.chest,
      promotion,
    },
  };
}

function applyAnswerStats(d: GameData, subject: SubjectId, result: QuizResult): GameData {
  const prev = d.stats.bySubject[subject] ?? { answered: 0, correct: 0 };
  return {
    ...d,
    stats: {
      ...d.stats,
      answered: d.stats.answered + result.total,
      correct: d.stats.correct + result.correct,
      bestCombo: Math.max(d.stats.bestCombo, result.maxCombo),
      bySubject: {
        ...d.stats.bySubject,
        [subject]: { answered: prev.answered + result.total, correct: prev.correct + result.correct },
      },
    },
  };
}

export type SessionInput =
  | { kind: "chapter"; chapterId: string; subject: SubjectId; result: QuizResult; answerXp: number; tier?: 1 | 2 | 3 }
  | { kind: "custom"; missionId: string; subject: SubjectId; result: QuizResult; answerXp: number }
  | {
      kind: "boss";
      bossId: string;
      subject: SubjectId;
      result: QuizResult;
      won: boolean;
      xpReward: number;
      rpReward: number;
      /** Fraction des PV restants du boss à la fin (0 = vaincu). */
      bossHpLeft: number;
    };

export function applySession(input: GameData, session: SessionInput, now = new Date()) {
  const before = refreshPeriods(input, now);
  // Boss déjà vaincu ou perdu (3 essais épuisés) : le combat ne compte pour rien.
  if (session.kind === "boss" && bossState(before.bosses[session.bossId], now.getTime()) !== "available") {
    return finalize(before, before, { xp: 0, rp: 0, lines: [], events: {} }, now);
  }
  let d = touchStreak(applyAnswerStats(before, session.subject, session.result), now);
  const { result } = session;
  const events: Partial<Record<QuestEvent, number>> = { correct: result.correct, combo: result.maxCombo };

  if (session.kind === "boss") {
    const record: BossRecord = d.bosses[session.bossId] ?? { victories: 0, attempts: 0, bestTimeMs: null };
    // Essai déjà compté au lancement du combat (startBossFight) ; sinon on le compte maintenant.
    const tries = fightInProgress(record, now.getTime()) ? record.tries ?? 1 : (record.tries ?? 0) + 1;
    const flawless = session.won && tries === 1;
    d = {
      ...d,
      bosses: {
        ...d.bosses,
        [session.bossId]: {
          ...record,
          attempts: record.attempts + 1,
          tries,
          pending: undefined,
          victories: record.victories + (session.won ? 1 : 0),
          bestTimeMs: session.won ? Math.min(record.bestTimeMs ?? Infinity, result.durationMs) : record.bestTimeMs,
          ...(flawless ? { flawless: true } : {}),
        },
      },
    };
    const raw = session.won
      ? session.xpReward
      : Math.max(15, Math.round(session.xpReward * 0.3 * (1 - session.bossHpLeft)));
    const chest = session.won ? Math.round(session.xpReward * 0.5) : 0;
    const perfect = flawless ? 150 : 0;
    const bonus = Math.round(raw * streakBonus(d.streak.count));
    if (session.won) {
      events.boss_win = 1;
      d = { ...d, boost: grantBoost(d.boost, 2, 30, "boss", now) };
    }
    const left = 3 - tries;
    const lines: RewardLine[] = [
      { label: session.won ? "Boss vaincu" : "Combat (prix de consolation)", value: `+${raw} XP` },
      ...(chest ? [{ label: "🎁 Coffre du boss", value: `+${chest} XP` }] : []),
      ...(perfect ? [{ label: "🏅 Trophée « Imbattable » (vaincu au 1er essai)", value: `+${perfect} XP` }] : []),
      ...(bonus > 0 ? [{ label: `Bonus de série (${d.streak.count} j)`, value: `+${bonus} XP` }] : []),
      ...(session.won ? [{ label: "🚀 Boost XP ×2 activé", value: "30 min" }] : []),
      ...(!session.won ? [{ label: left > 0 ? `Essais restants pour ce boss` : "💀 Boss perdu : plus aucun essai", value: left > 0 ? `${left}/3` : "0/3" }] : []),
    ];
    const feed = session.won ? [{ kind: "boss" as const, ref: session.bossId }] : [];
    return finalize(before, d, { xp: raw + chest + perfect + bonus, rp: 0, lines, events, feed }, now);
  }

  const rewards = missionRewards(result, session.answerXp, d.streak.count);
  events.mission = 1;
  // Rejouer la même mission le même jour rapporte de moins en moins d'XP.
  const today = dayKey(now);
  const playKey = session.kind === "chapter" ? session.chapterId : session.missionId;
  const plays = d.missionPlays?.day === today ? d.missionPlays.counts : {};
  const factor = replayFactor(plays[playKey] ?? 0);
  d = { ...d, missionPlays: { day: today, counts: { ...plays, [playKey]: (plays[playKey] ?? 0) + 1 } } };
  const baseMissionXp = Math.round(rewards.xp * factor);
  const tier = session.kind === "chapter" ? session.tier : undefined;
  const tierXp = tier ? Math.round(baseMissionXp * TIER_XP_BONUS[tier]) : 0;
  const missionXp = baseMissionXp + tierXp;
  if (rewards.stars === 3) events.perfect = 1;
  d = {
    ...d,
    stats: {
      ...d.stats,
      missions: d.stats.missions + 1,
      perfects: d.stats.perfects + (rewards.stars === 3 ? 1 : 0),
    },
  };

  const score = result.total ? result.correct / result.total : 0;
  if (session.kind === "chapter") {
    const prev = d.chapters[session.chapterId];
    d = {
      ...d,
      chapters: {
        ...d.chapters,
        [session.chapterId]: {
          stars: Math.max(prev?.stars ?? 0, rewards.stars) as ChapterProgress["stars"],
          bestScore: Math.max(prev?.bestScore ?? 0, score),
          attempts: (prev?.attempts ?? 0) + 1,
          lastPlayed: now.getTime(),
          ...(tier || prev?.tier ? { tier: Math.max(prev?.tier ?? 0, tier && score >= TIER_PASS && result.total >= 4 ? tier : 0) } : {}),
        },
      },
    };
  } else {
    d = {
      ...d,
      missions: d.missions.map((m) =>
        m.id === session.missionId
          ? { ...m, plays: (m.plays ?? 0) + 1, bestScore: Math.max(m.bestScore ?? 0, score) }
          : m,
      ),
    };
  }

  const lines: RewardLine[] = [
    { label: `Bonnes réponses (${result.correct}/${result.total}, combos inclus)`, value: `+${rewards.baseXp} XP` },
    { label: "Mission terminée", value: `+${rewards.completionBonus} XP` },
    ...(rewards.perfectBonus ? [{ label: "Sans faute !", value: `+${rewards.perfectBonus} XP` }] : []),
    ...(rewards.streakBonusXp ? [{ label: `Bonus de série (${d.streak.count} j)`, value: `+${rewards.streakBonusXp} XP` }] : []),
    ...(factor < 1 ? [{ label: `Mission déjà jouée aujourd'hui (XP ×${fmtMult(factor)})`, value: `−${rewards.xp - baseMissionXp} XP` }] : []),
    ...(tierXp ? [{ label: `Bonus niveau ${tier === 3 ? "Expert" : "Intermédiaire"}`, value: `+${tierXp} XP` }] : []),
    ...(tier && tier < 3 && score >= TIER_PASS && result.total >= 4 && (input.chapters[session.kind === "chapter" ? session.chapterId : ""]?.tier ?? 0) < tier
      ? [{ label: `🔓 Niveau ${tier === 1 ? "Intermédiaire" : "Expert"} débloqué`, value: "" }]
      : []),
  ];
  return finalize(before, d, { xp: missionXp, rp: 0, lines, stars: rewards.stars, events }, now);
}

/**
 * Lancement d'un combat de boss : l'essai est compté tout de suite (quitter en
 * plein combat ne le rend pas). Renvoie null si le boss ne peut plus être tenté.
 */
export function startBossFight(input: GameData, bossId: string, now = new Date()): GameData | null {
  const record: BossRecord = input.bosses[bossId] ?? { victories: 0, attempts: 0, bestTimeMs: null };
  if (bossState(record, now.getTime()) !== "available" || triesLeft(record, now.getTime()) <= 0) return null;
  return { ...input, bosses: { ...input.bosses, [bossId]: { ...record, tries: (record.tries ?? 0) + 1, pending: now.getTime() } } };
}

export type ActivityInput =
  | { kind: "lab"; labId: string }
  | { kind: "fiche"; fiche: SavedFiche }
  | { kind: "forge"; mission: CustomMission }
  | { kind: "duel"; outcome: DuelOutcome }
  | { kind: "ranked"; place: number; correct: number; size?: number }
  /** Cartes mémoire d'une fiche révisées jusqu'au bout (quête du jour, pas d'XP directe). */
  | { kind: "revision"; chapterId: string };

/** Activités hors quiz : ouverture d'un labo, fiche générée, mission forgée. */
export function applyActivity(input: GameData, activity: ActivityInput, now = new Date()) {
  const before = refreshPeriods(input, now);
  let d = touchStreak(before, now);
  const events: Partial<Record<QuestEvent, number>> = {};

  if (activity.kind === "lab") {
    const firstTime = !d.stats.labsOpened.includes(activity.labId);
    if (firstTime) d = { ...d, stats: { ...d.stats, labsOpened: [...d.stats.labsOpened, activity.labId] } };
    events.lab = 1;
  } else if (activity.kind === "fiche") {
    d = { ...d, fiches: [activity.fiche, ...d.fiches], stats: { ...d.stats, fichesGenerated: d.stats.fichesGenerated + 1 } };
    events.fiche = 1;
  } else if (activity.kind === "forge") {
    d = { ...d, missions: [activity.mission, ...d.missions], stats: { ...d.stats, missionsForged: d.stats.missionsForged + 1 } };
    events.forge = 1;
  } else if (activity.kind === "revision") {
    events.fiche = 1;
  } else if (activity.kind === "ranked") {
    const size = activity.size ?? 3;
    const xp = matchXp(activity.place, activity.correct, size);
    const lines: RewardLine[] = [{ label: `Partie classée à ${size} : ${ordinal(activity.place)} place, ${activity.correct}/10`, value: `+${xp} XP` }];
    return finalize(before, d, { xp, rp: 0, lines, events }, now);
  } else {
    const reward = DUEL_REWARDS[activity.outcome];
    const lines: RewardLine[] = [
      { label: reward.label, value: `+${reward.xp} XP` },
      ...(reward.rp ? [{ label: "Points de rang", value: `+${reward.rp} RP` }] : []),
    ];
    return finalize(before, d, { xp: reward.xp, rp: reward.rp, lines, events }, now);
  }

  return finalize(before, d, { xp: 0, rp: 0, lines: [], events }, now);
}

/** Ouvre le coffre de connexion du jour (XP et RP du calendrier). Null s'il est déjà ouvert. */
export function applyDailyClaim(input: GameData, now = new Date()): { data: GameData; summary: RewardSummary; reward: DailyReward } | null {
  const before = refreshPeriods(input, now);
  const claimed = claimDaily(before.daily, dayKey(now));
  if (!claimed) return null;
  const { reward } = claimed;
  const lines: RewardLine[] = [
    { label: `Coffre du jour ${reward.day}/7`, value: `+${reward.xp} XP` },
    ...(reward.rp ? [{ label: "Points de rang", value: `+${reward.rp} RP` }] : []),
  ];
  let after: GameData = { ...before, daily: claimed.state };
  if (reward.day === 7) {
    after = { ...after, boost: grantBoost(after.boost, 1.5, 60, "daily", now) };
    lines.push({ label: "🚀 Boost XP ×1,5 activé", value: "1 h" });
  }
  const { data, summary } = finalize(before, after, { xp: reward.xp, rp: reward.rp, lines, events: {} }, now);
  return { data, summary, reward };
}
