"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, Palette, Printer } from "lucide-react";
import { FichePaper, type PaperOptions, quizFrom } from "@/components/game/FichePaper";
import { subjectMeta } from "@/lib/content/curriculum";
import { ficheFor, ficheTexts } from "@/lib/content/fiches";
import { DEFAULT_LOOK, FONTS, type FontId, PAPERS, PAPER_FONTS_URL, type PaperId, type PaperLook, THEMES, type ThemeId, parseLook } from "@/lib/content/fiches/look";
import { notationsIn } from "@/lib/content/fiches/notations";
import { chapterMemos } from "@/lib/content/generated";
import type { Chapter } from "@/lib/types";

const TOGGLES: { key: keyof PaperOptions; label: string }[] = [
  { key: "explain", label: "Explications" },
  { key: "corrections", label: "Corrections" },
  { key: "quiz", label: "Je me teste" },
];
const LOOK_KEY = "qb-fiche-look";

/** Aperçu miniature d'un papier, pour le choix. */
const PAPER_SWATCH: Record<PaperId, string> = {
  blanc: "none",
  seyes: "linear-gradient(90deg, transparent 6px, #F2A3A3 6px, #F2A3A3 7px, transparent 7px), repeating-linear-gradient(180deg, transparent 0 7px, #A9BDE6 7px 8px), repeating-linear-gradient(180deg, transparent 0 1px, #E1E9F7 1px 2px)",
  carreaux: "repeating-linear-gradient(180deg, transparent 0 4px, #CBD8EE 4px 5px), repeating-linear-gradient(90deg, transparent 0 4px, #CBD8EE 4px 5px)",
  points: "radial-gradient(circle, #AEB9CE 0.8px, transparent 1px) 0 0 / 5px 5px",
};

/** Fiche au format A4 : aperçu, personnalisation (couleurs, écriture, papier), impression ou PDF. */
export function PrintView({ chapter }: { chapter: Chapter }) {
  const fiche = ficheFor(chapter.id);
  const notations = useMemo(() => (fiche ? notationsIn(ficheTexts(fiche)) : []), [fiche]);
  const quiz = useMemo(() => quizFrom(chapterMemos(chapter.id)), [chapter.id]);
  const [options, setOptions] = useState<PaperOptions>({ explain: true, corrections: true, quiz: true });
  const [look, setLook] = useState<PaperLook>(DEFAULT_LOOK);
  const subjectColor = subjectMeta(chapter.subject).color;

  useEffect(() => {
    try {
      setLook(parseLook(JSON.parse(localStorage.getItem(LOOK_KEY) ?? "null")));
    } catch {
      // Rien d'enregistré (ou stockage indisponible) : style par défaut.
    }
  }, []);
  const change = (patch: Partial<PaperLook>) =>
    setLook((l) => {
      const next = { ...l, ...patch };
      try {
        localStorage.setItem(LOOK_KEY, JSON.stringify(next));
      } catch {
        // Le choix vaut pour cette visite.
      }
      return next;
    });

  return (
    <div className="space-y-4 print:space-y-0">
      {/* Polices manuscrites et à empattements, pour la fiche. */}
      <link rel="stylesheet" href={PAPER_FONTS_URL} precedence="default" />

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

      <section className="qb-no-print mx-auto max-w-[210mm] space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4" aria-label="Personnaliser la fiche">
        <p className="flex items-center gap-2 text-sm font-black text-white"><Palette size={16} className="text-violet-300" /> Personnaliser la fiche</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="w-20 text-xs font-bold uppercase tracking-wider text-slate-500">Couleurs</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Couleurs">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const t = THEMES[id];
              const on = look.theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => change({ theme: id })}
                  className={clsx("flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-semibold transition", on ? "bg-white text-slate-900" : "bg-white/5 text-slate-300 hover:bg-white/10")}
                >
                  <span className="h-5 w-5 rounded-full ring-2 ring-white/40" style={{ background: `linear-gradient(135deg, ${t.accent ?? subjectColor} 50%, ${t.accent2} 50%)` }} />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="w-20 text-xs font-bold uppercase tracking-wider text-slate-500">Écriture</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Écriture">
            {(Object.keys(FONTS) as FontId[]).map((id) => {
              const f = FONTS[id];
              const on = look.font === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => change({ font: id })}
                  className={clsx("rounded-xl px-3 py-1.5 text-left transition", on ? "bg-white text-slate-900" : "bg-white/5 text-slate-200 hover:bg-white/10")}
                >
                  <span className="block text-lg leading-none" style={{ fontFamily: f.title }}>Aa</span>
                  <span className="block text-[10px] font-semibold opacity-70">{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="w-20 text-xs font-bold uppercase tracking-wider text-slate-500">Papier</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Papier">
            {(Object.keys(PAPERS) as PaperId[]).map((id) => {
              const on = look.paper === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => change({ paper: id })}
                  className={clsx("flex items-center gap-2 rounded-xl py-1 pl-1 pr-2.5 text-xs font-semibold transition", on ? "bg-white text-slate-900" : "bg-white/5 text-slate-300 hover:bg-white/10")}
                >
                  <span className="h-7 w-6 rounded-sm ring-1 ring-slate-300" style={{ background: PAPER_SWATCH[id] === "none" ? "#fff" : `${PAPER_SWATCH[id]}, #fff` }} />
                  {PAPERS[id].name}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Ton style est gardé pour toutes tes fiches. Sans corrections, les exemples deviennent des exercices avec des lignes ; pour un PDF, choisis « Enregistrer en PDF » comme imprimante.
        </p>
      </section>

      <FichePaper chapter={chapter} fiche={fiche} notations={notations} quiz={quiz} options={options} look={look} />
    </div>
  );
}
