"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { BookOpenCheck, ChevronDown, ChevronLeft, Eye, EyeOff, FlaskConical, Lightbulb, Play, Printer, TriangleAlert } from "lucide-react";
import { FlashDeck } from "@/components/game/FlashDeck";
import { LabSheet } from "@/components/game/LabSheet";
import { Markdown } from "@/components/ui/Markdown";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { type FicheExample, ficheFor, ficheTexts } from "@/lib/content/fiches";
import { notationsIn } from "@/lib/content/fiches/notations";
import { chapterMemos } from "@/lib/content/generated";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import type { Chapter } from "@/lib/types";

/** Exemple corrigé : on cherche d'abord, puis on dévoile la correction étape par étape. */
function WorkedExample({ example, index }: { example: FicheExample; index: number }) {
  const [shown, setShown] = useState(0);
  const total = example.steps.length;
  return (
    <div className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.07] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">Exemple {index + 1}</p>
      <div className="mt-1 text-[15px] font-semibold leading-relaxed text-white"><Markdown compact>{example.question}</Markdown></div>
      {shown > 0 && (
        <ol className="mt-3 space-y-2 border-l-2 border-sky-400/40 pl-3">
          {example.steps.slice(0, shown).map((step, i) => (
            <li key={i} className="qb-fade-up text-[15px] leading-relaxed text-slate-100">
              <Markdown compact>{step}</Markdown>
            </li>
          ))}
        </ol>
      )}
      {shown < total ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setShown((n) => n + 1)} className="qb-press rounded-xl bg-sky-400 px-3.5 py-2 text-sm font-bold text-slate-950">
            {shown === 0 ? "Voir la 1re étape" : "Étape suivante"}
          </button>
          {total - shown > 1 && (
            <button type="button" onClick={() => setShown(total)} className="qb-press rounded-xl bg-white/10 px-3.5 py-2 text-sm font-bold text-sky-100">
              Toute la correction
            </button>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => setShown(0)} className="mt-3 text-xs font-semibold text-sky-300/80 hover:text-sky-200">
          Masquer la correction
        </button>
      )}
    </div>
  );
}

/** Fiche de révision d'un chapitre : l'essentiel expliqué, des exemples corrigés, les pièges, puis les cartes mémoire. */
export function FicheView({ chapter }: { chapter: Chapter }) {
  const meta = subjectMeta(chapter.subject);
  const fiche = ficheFor(chapter.id);
  const memos = useMemo(() => chapterMemos(chapter.id), [chapter.id]);
  const recordActivity = useGame((s) => s.recordActivity);
  const [lab, setLab] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [explain, setExplain] = useState(true);
  const notations = useMemo(() => (fiche ? notationsIn(ficheTexts(fiche)) : []), [fiche]);
  const hasExplain = !!fiche?.essentiel.some((p) => p.explain);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/fiches?matiere=${chapter.subject}${meta.extra ? "" : `&niveau=${chapter.level}`}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
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
            {fiche && (
              <Link href={`/fiches/${chapter.id}/imprimer`} className="qb-press inline-flex items-center gap-1.5 rounded-xl bg-black/30 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/25">
                <Printer size={15} /> Version à imprimer
              </Link>
            )}
            {chapter.lab && (
              <button type="button" onClick={() => setLab(true)} className="qb-press inline-flex items-center gap-1.5 rounded-xl bg-black/30 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/25">
                <FlaskConical size={15} /> Ouvrir le labo
              </button>
            )}
          </div>
        </div>
      </header>

      {notations.length > 0 && (
        <details className="group rounded-2xl border border-white/10 bg-slate-900/70">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-3 font-bold text-white [&::-webkit-details-marker]:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-sm">∑</span>
            <span className="flex-1">Les symboles de cette fiche <span className="text-sm font-semibold text-slate-400">· {notations.length}</span></span>
            <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <dl className="grid gap-x-4 gap-y-2 border-t border-white/10 p-3 sm:grid-cols-[auto_1fr]">
            {notations.map((n) => (
              <div key={n.symbol} className="contents">
                <dt className="text-base text-emerald-200"><Markdown compact>{`$${n.symbol}$`}</Markdown></dt>
                <dd className="-mt-1 mb-1 text-sm text-slate-300 sm:mt-0 sm:mb-0">{n.meaning}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {fiche && fiche.essentiel.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="flex flex-1 items-center gap-2 text-lg font-black text-white"><Lightbulb size={18} className="text-amber-300" /> L&apos;essentiel</h2>
            {hasExplain && (
              <button type="button" onClick={() => setExplain((e) => !e)} className="qb-press inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                {explain ? <EyeOff size={14} /> : <Eye size={14} />} {explain ? "Formules seules" : "Avec explications"}
              </button>
            )}
          </div>
          <ol className="qb-stagger space-y-2">
            {fiche.essentiel.map((point, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet-500/20 text-xs font-black text-violet-200">{i + 1}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="text-[15px] leading-relaxed text-slate-100"><Markdown compact>{point.text}</Markdown></div>
                  {explain && point.explain && (
                    <div className="rounded-xl bg-amber-400/[0.08] px-3 py-2 text-sm leading-relaxed text-amber-50/90 ring-1 ring-amber-300/20 [&_strong]:text-amber-300">
                      <Markdown compact>{`**En clair :** ${point.explain}`}</Markdown>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {fiche && fiche.exemples.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><BookOpenCheck size={18} className="text-sky-300" /> Exemples corrigés</h2>
          <p className="text-sm text-slate-400">Cherche d&apos;abord sur une feuille, puis dévoile la correction étape par étape.</p>
          {fiche.exemples.map((ex, i) => (
            <WorkedExample key={i} example={ex} index={i} />
          ))}
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
