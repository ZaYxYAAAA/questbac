import { bossChapters } from "@/lib/content/bosses";
import { chaptersFor } from "@/lib/content/curriculum";
import { hasGenerators } from "@/lib/content/generated";
import { hasLocalQuestions } from "@/lib/content/questions";
import type { Boss, Level, SubjectId } from "@/lib/types";
import { dayKey } from "./progression";
import type { GameData } from "./state";
import { bossState, triesLeft } from "./boss-rules";

export const chapterStars = (d: GameData, chapterId: string) => d.chapters[chapterId]?.stars ?? 0;

export function subjectProgress(d: GameData, subject: SubjectId, level: Level) {
  const chapters = chaptersFor(subject, level);
  const stars = chapters.reduce((n, c) => n + chapterStars(d, c.id), 0);
  const done = chapters.filter((c) => chapterStars(d, c.id) > 0).length;
  return { total: chapters.length, done, stars, maxStars: chapters.length * 3, ratio: chapters.length ? stars / (chapters.length * 3) : 0 };
}

export function bossStatus(d: GameData, boss: Boss, level: Level) {
  const chapters = bossChapters(boss, level);
  const completed = chapters.filter((c) => chapterStars(d, c.id) > 0).length;
  const required = Math.min(boss.unlockChapters, chapters.length);
  const record = d.bosses[boss.id];
  const state = bossState(record);
  return {
    unlocked: completed >= required,
    completed,
    required,
    defeated: state === "defeated",
    /** 3 essais ratés : le boss ne peut plus être tenté. */
    lost: state === "lost",
    flawless: Boolean(record?.flawless),
    attempts: record?.attempts ?? 0,
    triesLeft: triesLeft(record),
  };
}

/** Missions conseillées : chapitres jouables hors-ligne les moins maîtrisés de la classe. */
export function recommendedChapters(d: GameData, level: Level, count = 3) {
  const subjects: SubjectId[] = ["maths", "physique", "svt", "histoire", "francais", "philo", "ses", "anglais", "espagnol"];
  return subjects
    .flatMap((s) => chaptersFor(s, level))
    .filter((c) => hasGenerators(c.id) || hasLocalQuestions(c.id))
    .map((c) => ({ chapter: c, stars: chapterStars(d, c.id), last: d.chapters[c.id]?.lastPlayed ?? 0 }))
    .sort((a, b) => a.stars - b.stars || a.last - b.last)
    .slice(0, count)
    .map((x) => x.chapter);
}

/** XP gagnée sur les `days` derniers jours (du plus ancien au plus récent). */
export function xpHistory(d: GameData, days = 7, now = new Date()) {
  const out: { day: string; label: string; xp: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = dayKey(date);
    out.push({ day: key, label: date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""), xp: d.xpByDay[key] ?? 0 });
  }
  return out;
}

/** Chapitre à reprendre : le dernier joué pas encore à 3 étoiles, sinon la première mission conseillée. */
export function continueChapter(d: GameData, level: Level) {
  const subjects: SubjectId[] = ["maths", "physique", "svt", "histoire", "francais", "philo", "ses", "anglais", "espagnol"];
  const last = subjects
    .flatMap((s) => chaptersFor(s, level))
    .filter((c) => (d.chapters[c.id]?.lastPlayed ?? 0) > 0 && chapterStars(d, c.id) < 3)
    .sort((a, b) => (d.chapters[b.id]?.lastPlayed ?? 0) - (d.chapters[a.id]?.lastPlayed ?? 0))[0];
  return last ?? recommendedChapters(d, level, 1)[0];
}
