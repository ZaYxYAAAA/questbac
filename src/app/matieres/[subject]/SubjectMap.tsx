"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, FileText, FlaskConical, Lock, Play, Sparkles, Swords } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { bossesForLevel } from "@/lib/content/bosses";
import { LEVELS, chaptersFor, subjectMeta } from "@/lib/content/curriculum";
import { hasLocalQuestions } from "@/lib/content/questions";
import { bossStatus, chapterStars } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";
import type { Level, SubjectId } from "@/lib/types";

export function SubjectMap({ subject, initialLevel }: { subject: SubjectId; initialLevel: Level | null }) {
  const game = useGame();
  const meta = subjectMeta(subject);
  const playerLevel = game.profile!.level;
  const [level, setLevel] = useState<Level>(initialLevel ?? (meta.levels.includes(playerLevel) ? playerLevel : meta.levels[0]));
  const chapters = chaptersFor(subject, level);
  const boss = bossesForLevel(level).find((b) => b.subject === subject);
  const status = boss ? bossStatus(game, boss, level) : null;

  return (
    <div className="space-y-6">
      <Link href="/matieres" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft size={16} /> Carte des matières
      </Link>

      <div className={clsx("relative overflow-hidden rounded-3xl bg-gradient-to-br p-6", meta.gradient)}>
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{meta.emoji}</span>
            <div>
              <h1 className="text-3xl font-black text-white">{meta.name}</h1>
              <p className="text-white/80">{chapters.length} chapitres · fais 1 étoile pour valider un chapitre</p>
            </div>
          </div>
          {meta.levels.length > 1 && (
            <Tabs value={level} onChange={setLevel} options={LEVELS.filter((l) => meta.levels.includes(l.id)).map((l) => ({ value: l.id, label: l.label }))} />
          )}
        </div>
      </div>

      {/* Chemin des chapitres */}
      <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-7 before:top-6 before:w-0.5 before:bg-gradient-to-b before:from-violet-500/60 before:to-slate-800">
        {chapters.map((c, i) => {
          const stars = chapterStars(game, c.id);
          const local = hasLocalQuestions(c.id);
          return (
            <li key={c.id} className="relative flex gap-4">
              <div
                className={clsx(
                  "z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 text-lg font-black",
                  stars === 3 ? "border-amber-400 bg-amber-400/20 text-amber-200" : stars > 0 ? "border-violet-400 bg-violet-500/20 text-violet-100" : "border-slate-700 bg-slate-900 text-slate-400",
                )}
              >
                {stars === 3 ? "👑" : i + 1}
              </div>
              <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white">{c.title}</h3>
                    <p className="text-sm text-slate-400">{c.summary}</p>
                    <p className="mt-1 text-sm tracking-widest">{[1, 2, 3].map((s) => (s <= stars ? "⭐" : "☆")).join("")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/mission/${c.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500">
                      {local ? <Play size={14} /> : <Sparkles size={14} />} {local ? "Mission" : "Mission IA"}
                    </Link>
                    {c.lab && (
                      <Link href={`/labo/${c.lab}`} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700">
                        <FlaskConical size={14} /> Labo
                      </Link>
                    )}
                    <Link
                      href={`/prof?niveau=${level}&matiere=${subject}&sujet=${encodeURIComponent(c.title)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
                    >
                      <FileText size={14} /> Fiche
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {boss && status && (
          <li className="relative flex gap-4">
            <div className={clsx("z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 text-3xl", status.defeated ? "border-emerald-400 bg-emerald-500/20" : "border-red-500 bg-red-500/20")}>
              {status.defeated ? "🏆" : "💀"}
            </div>
            <div className={clsx("relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r p-4", boss.gradient)}>
              <div className="absolute inset-0 bg-slate-950/50" />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{boss.emoji}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">Boss du territoire</p>
                    <h3 className="text-lg font-black text-white">{boss.name}</h3>
                  </div>
                </div>
                {status.unlocked ? (
                  <Link href={`/boss/${boss.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900">
                    <Swords size={16} /> {status.defeated ? "Revanche" : "Affronter"}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2 text-sm text-white">
                    <Lock size={14} /> {status.completed}/{status.required} chapitres validés
                  </span>
                )}
              </div>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}
