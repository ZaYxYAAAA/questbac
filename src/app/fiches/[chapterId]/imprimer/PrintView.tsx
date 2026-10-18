"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, Printer } from "lucide-react";
import { FichePaper, type PaperOptions, quizFrom } from "@/components/game/FichePaper";
import { ficheFor, ficheTexts } from "@/lib/content/fiches";
import { notationsIn } from "@/lib/content/fiches/notations";
import { chapterMemos } from "@/lib/content/generated";
import type { Chapter } from "@/lib/types";

const TOGGLES: { key: keyof PaperOptions; label: string }[] = [
  { key: "explain", label: "Explications" },
  { key: "corrections", label: "Corrections" },
  { key: "quiz", label: "Je me teste" },
];

/** Fiche au format A4 : aperçu à l'écran, options, et impression (ou PDF via « Enregistrer en PDF »). */
export function PrintView({ chapter }: { chapter: Chapter }) {
  const fiche = ficheFor(chapter.id);
  const notations = useMemo(() => (fiche ? notationsIn(ficheTexts(fiche)) : []), [fiche]);
  const quiz = useMemo(() => quizFrom(chapterMemos(chapter.id)), [chapter.id]);
  const [options, setOptions] = useState<PaperOptions>({ explain: true, corrections: true, quiz: true });

  return (
    <div className="space-y-4 print:space-y-0">
      <div className="qb-no-print mx-auto flex max-w-[210mm] flex-wrap items-center gap-2">
        <Link href={`/fiches/${chapter.id}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
          <ChevronLeft size={16} /> Fiche
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {TOGGLES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={options[key]}
              onClick={() => setOptions((o) => ({ ...o, [key]: !o[key] }))}
              className={clsx("rounded-full px-3 py-1.5 text-xs font-bold transition", options[key] ? "bg-white text-slate-900" : "bg-white/10 text-slate-400")}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={() => window.print()} className="qb-press inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500">
            <Printer size={16} /> Imprimer / PDF
          </button>
        </div>
      </div>
      <p className="qb-no-print mx-auto max-w-[210mm] text-xs text-slate-500">
        Astuce : sans corrections, les exemples deviennent des exercices avec des lignes pour chercher. Pour un PDF, choisis « Enregistrer en PDF » comme imprimante.
      </p>
      <FichePaper chapter={chapter} fiche={fiche} notations={notations} quiz={quiz} options={options} />
    </div>
  );
}
