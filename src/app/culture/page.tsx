"use client";

import Link from "next/link";
import clsx from "clsx";
import { Play, Sparkles, Swords, Zap } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { chaptersFor, subjectMeta } from "@/lib/content/curriculum";
import { CULTURE_FACTS } from "@/lib/content/gen/culture";
import { dayKey } from "@/lib/game/progression";
import { hashString } from "@/lib/game/quests";
import { chapterStars } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";

/** Pictogramme de chaque thème. */
const THEME_EMOJI: Record<string, string> = {
  "cg-capitales": "🏙️",
  "cg-geo-monde": "🗺️",
  "cg-france": "🇫🇷",
  "cg-histoire": "📜",
  "cg-arts": "🎨",
  "cg-litterature": "📚",
  "cg-musique": "🎵",
  "cg-cinema": "🎬",
  "cg-sport": "⚽",
  "cg-sciences": "🔬",
  "cg-espace": "🚀",
  "cg-nature": "🦁",
  "cg-mythologie": "⚡",
  "cg-langue": "🗣️",
  "cg-institutions": "🏛️",
  "cg-gastronomie": "🍝",
};

const TOTAL_FACTS = Object.values(CULTURE_FACTS).reduce((n, t) => n + t[1] + t[2] + t[3], 0);
const TIER_NAMES = ["Basique", "Intermédiaire", "Expert"];

/** Culture générale : une matière à part, hors programme, la même pour tous les niveaux. */
export default function CulturePage() {
  const game = useGame();
  const meta = subjectMeta("culture");
  const themes = chaptersFor("culture", game.profile?.level ?? "seconde");
  const stars = themes.reduce((n, c) => n + chapterStars(game, c.id), 0);
  const validated = themes.filter((c) => chapterStars(game, c.id) > 0).length;
  const today = themes[hashString(dayKey(new Date())) % themes.length];

  return (
    <div className="space-y-6">
      <section className={clsx("relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 sm:p-6", meta.gradient)}>
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="pointer-events-none absolute -right-6 -top-6 text-[9rem] leading-none opacity-20">🌍</div>
        <div className="relative space-y-4">
          <div className="flex items-center gap-4">
            <span className="qb-bob text-5xl">🌍</span>
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-white">Culture générale</h1>
              <p className="text-sm text-white/85">{themes.length} thèmes · {Math.floor(TOTAL_FACTS / 50) * 50}+ faits · 3 niveaux : Basique, Intermédiaire, Expert</p>
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-white/85">
              <span>{validated}/{themes.length} thèmes validés</span>
              <span>⭐ {stars}/{themes.length * 3}</span>
            </div>
            <ProgressBar value={stars / (themes.length * 3)} barClassName="bg-gradient-to-r from-amber-300 to-yellow-200" className="bg-black/30" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={`/mission/${themes[0].id}?melange=1`}
              className="qb-press flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-base font-black text-slate-900 shadow-lg"
            >
              <Zap size={18} className="text-amber-500" fill="currentColor" /> Quiz éclair · 10 questions
            </Link>
            <Link href="/classement" className="qb-press flex items-center justify-center gap-2 rounded-2xl bg-black/30 px-4 py-3 text-sm font-bold text-white ring-1 ring-white/25">
              <Swords size={16} /> Défier d&apos;autres joueurs en classé
            </Link>
          </div>
        </div>
      </section>

      {today && (
        <Link href={`/mission/${today.id}`} className="qb-press group flex items-center gap-4 rounded-3xl border border-amber-400/40 bg-amber-400/10 p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-400/20 text-3xl transition group-hover:scale-110">{THEME_EMOJI[today.id] ?? "🌍"}</span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-300"><Sparkles size={12} /> Thème du jour</p>
            <p className="truncate text-lg font-black text-white">{today.title}</p>
            <p className="truncate text-sm text-slate-400">{today.summary}</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-950">
            <Play size={18} className="ml-0.5" fill="currentColor" />
          </span>
        </Link>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-black text-white">Tous les thèmes</h2>
        <div className="qb-stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
          {themes.map((c) => {
            const s = chapterStars(game, c.id);
            const level = game.chapters[c.id]?.tier ?? 0;
            return (
              <Link
                key={c.id}
                href={`/mission/${c.id}`}
                className={clsx(
                  "group relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-3 transition duration-200 hover:-translate-y-0.5 active:scale-[0.97]",
                  s === 3 ? "border-amber-400/50 bg-amber-400/10" : s > 0 ? "border-teal-400/40 bg-teal-500/10" : "border-white/10 bg-slate-900/70 hover:border-teal-400/50",
                )}
              >
                <span className="text-3xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">{THEME_EMOJI[c.id] ?? "🌍"}</span>
                <span className="text-sm font-black leading-tight text-white">{c.title}</span>
                <span className="line-clamp-2 text-[11px] leading-snug text-slate-400">{c.summary}</span>
                <span className="mt-auto flex items-center justify-between gap-1">
                  <span className="text-xs tracking-widest">{[1, 2, 3].map((n) => (n <= s ? "⭐" : "☆")).join("")}</span>
                  <span className="flex gap-0.5" title={level ? `Niveau ${TIER_NAMES[level - 1]} réussi` : "Aucun niveau réussi"} aria-label={`${level}/3 niveaux réussis`}>
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={clsx("h-1.5 w-3 rounded-full", n <= level ? ["bg-emerald-400", "bg-sky-400", "bg-fuchsia-400"][n - 1] : "bg-white/15")} />
                    ))}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
