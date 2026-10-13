/**
 * État du joueur et règles d'évolution, sous forme de fonctions pures
 * (testables, indépendantes du stockage). Le store Zustand ne fait que les appeler.
 */
import type { CustomMission, Level, QuizResult, SavedFiche, SubjectId } from "@/lib/types";
import { type AchievementDef, newlyUnlocked } from "./achievements";
import { type DailyReward, type DailyState, claimDaily } from "./daily";
import { type LeagueState, finalLeagueResult } from "./league";
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
}

export interface BossRecord {
  victories: number;
  attempts: number;
  bestTimeMs: number | null;
}

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

/** Clé stable du joueur pour tirer son groupe de ligue. */
export const leagueKey = (d: Pick<GameData, "profile">) => String(d.profile?.createdAt ?? 0);

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
    let { xp, rp, peakRp, feed } = next;
    let last = next.league.last;
    // Classé seulement si le joueur a gagné de l'XP pendant la semaine de sa ligue.
    if (next.league.week !== week && next.league.week === next.weekly.week && next.weekly.xp > 0) {
      last = finalLeagueResult(next.league, leagueKey(next), next.weekly.xp);
      xp += last.rewardXp;
      rp = Math.max(0, rp + last.rewardRp);
      peakRp = Math.max(peakRp, rp);
      feed = pushFeed(feed, [{ at: now.getTime(), kind: "league", ref: `${last.rank}:${last.tierId}` }]);
    }
    next = {
      ...next,
      xp,
      rp,
      peakRp,
      feed,
      weekly: next.weekly.week === week ? next.weekly : { week, xp: 0 },
      league: next.league.week === week ? next.league : { week, tierId: rankFromRp(rp).tier.id, last },
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
  let d = addXp({ ...afterBase, rp: Math.max(0, afterBase.rp + base.rp) }, base.xp, now);
  const lines = [...base.lines];
  let xpGained = base.xp;

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
  | { kind: "chapter"; chapterId: string; subject: SubjectId; result: QuizResult; answerXp: number }
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
  let d = touchStreak(applyAnswerStats(before, session.subject, session.result), now);
  const { result } = session;
  const events: Partial<Record<QuestEvent, number>> = { correct: result.correct, combo: result.maxCombo };

  if (session.kind === "boss") {
    const record = d.bosses[session.bossId] ?? { victories: 0, attempts: 0, bestTimeMs: null };
    d = {
      ...d,
      bosses: {
        ...d.bosses,
        [session.bossId]: {
          attempts: record.attempts + 1,
          victories: record.victories + (session.won ? 1 : 0),
          bestTimeMs: session.won
            ? Math.min(record.bestTimeMs ?? Infinity, result.durationMs)
            : record.bestTimeMs,
        },
      },
    };
    const raw = session.won
      ? session.xpReward
      : Math.max(15, Math.round(session.xpReward * 0.3 * (1 - session.bossHpLeft)));
    const bonus = Math.round(raw * streakBonus(d.streak.count));
    // Une défaite coûte 15 RP, sans descendre sous 0.
    const rp = session.won ? session.rpReward : -Math.min(15, d.rp);
    if (session.won) events.boss_win = 1;
    const lines: RewardLine[] = [
      { label: session.won ? "Boss vaincu" : "Combat (prix de consolation)", value: `+${raw} XP` },
      ...(bonus > 0 ? [{ label: `Bonus de série (${d.streak.count} j)`, value: `+${bonus} XP` }] : []),
      { label: "Points de rang", value: `${rp >= 0 ? "+" : ""}${rp} RP` },
    ];
    const feed = session.won ? [{ kind: "boss" as const, ref: session.bossId }] : [];
    return finalize(before, d, { xp: raw + bonus, rp, lines, events, feed }, now);
  }

  const rewards = missionRewards(result, session.answerXp, d.streak.count);
  events.mission = 1;
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
    { label: "Points de rang", value: `+${rewards.rp} RP` },
  ];
  return finalize(before, d, { xp: rewards.xp, rp: rewards.rp, lines, stars: rewards.stars, events }, now);
}

export type ActivityInput =
  | { kind: "lab"; labId: string }
  | { kind: "fiche"; fiche: SavedFiche }
  | { kind: "forge"; mission: CustomMission };

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
  } else {
    d = { ...d, missions: [activity.mission, ...d.missions], stats: { ...d.stats, missionsForged: d.stats.missionsForged + 1 } };
    events.forge = 1;
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
  const { data, summary } = finalize(before, { ...before, daily: claimed.state }, { xp: reward.xp, rp: reward.rp, lines, events: {} }, now);
  return { data, summary, reward };
}
