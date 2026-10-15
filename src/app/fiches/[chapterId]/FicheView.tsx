"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, FlaskConical, Lightbulb, Play, TriangleAlert } from "lucide-react";
import { FlashDeck } from "@/components/game/FlashDeck";
import { LabSheet } from "@/components/game/LabSheet";
import { Markdown } from "@/components/ui/Markdown";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { ficheFor } from "@/lib/content/fiches";
import { chapterMemos } from "@/lib/content/generated";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import type { Chapter } from "@/lib/types";

/** Fiche de révision d'un chapitre : l'essentiel, les pièges, puis les cartes mémoire. */
export function FicheView({ chapter }: { chapter: Chapter }) {
  const meta = subjectMeta(chapter.subject);
  const fiche = ficheFor(chapter.id);
  const memos = useMemo(() => chapterMemos(chapter.id), [chapter.id]);
  const recordActivity = useGame((s) => s.recordActivity);
  const [lab, setLab] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/fiches?matiere=${chapter.subject}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft size={16} /> Fiches
      </Link>

      <header className={clsx("relative overflow-hidden rounded-3xl bg-gradient-to-br p-5", meta.gradient)}>
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="relative">
          <p className="text-sm font-semibold text-white/80">
            {meta.emoji} {meta.name}{meta.extra ? "" : ` · ${levelLabel(chapter.level)}`}
          </p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">{chapter.title}</h1>
          <p className="mt-1 text-sm text-white/80">{chapter.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/mission/${chapter.id}`} className="qb-press inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900">
              <Play size={15} fill="currentColor" /> S&apos;entraîner
            </Link>
            {chapter.lab && (
              <button type="button" onClick={() => setLab(true)} className="qb-press inline-flex items-center gap-1.5 rounded-xl bg-black/30 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/25">
                <FlaskConical size={15} /> Ouvrir le labo
              </button>
            )}
          </div>
        </div>
      </header>

      {fiche && fiche.essentiel.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Lightbulb size={18} className="text-amber-300" /> L&apos;essentiel</h2>
          <ol className="qb-stagger space-y-2">
            {fiche.essentiel.map((point, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet-500/20 text-xs font-black text-violet-200">{i + 1}</span>
                <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-slate-100"><Markdown compact>{point}</Markdown></div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {fiche && fiche.pieges.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><TriangleAlert size={18} className="text-rose-300" /> Pièges à éviter</h2>
          {fiche.pieges.map((p, i) => (
            <div key={i} className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-[15px] leading-relaxed text-rose-50">
              <Markdown compact>{p}</Markdown>
            </div>
          ))}
        </section>
      )}

      {memos.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-black text-white">🃏 Cartes mémoire <span className="text-sm font-semibold text-slate-400">· {memos.length}</span></h2>
          <p className="text-sm text-slate-400">Lis la question, retourne la carte, sois honnête : les cartes ratées reviennent à la fin.</p>
          <FlashDeck
            memos={memos}
            onFinish={() => {
              if (rewarded) return;
              setRewarded(true);
              announce(recordActivity({ kind: "revision", chapterId: chapter.id }), { questsOnly: true });
            }}
          />
        </section>
      )}

      {!fiche && memos.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-400">La fiche de ce chapitre arrive bientôt.</p>
      )}

      {lab && chapter.lab && <LabSheet lab={chapter.lab} onClose={() => setLab(false)} />}
    </div>
  );
}
