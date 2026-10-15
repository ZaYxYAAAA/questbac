"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronRight, FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { LEVELS, chaptersFor, subjectsForLevel } from "@/lib/content/curriculum";
import { ficheFor } from "@/lib/content/fiches";
import { chapterMemos } from "@/lib/content/generated";
import { useGame } from "@/lib/store/game-store";
import type { Level, SubjectId } from "@/lib/types";

/** Fiches de révision : l'essentiel de chaque chapitre et ses cartes mémoire. */
export default function FichesPage() {
  const game = useGame();
  const [level, setLevel] = useState<Level>(game.profile!.level);
  const subjects = subjectsForLevel(level);
  const [subject, setSubject] = useState<SubjectId>(subjects[0].id);

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("matiere") as SubjectId | null;
    if (asked && subjects.some((s) => s.id === asked)) setSubject(asked);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = subjects.some((s) => s.id === subject) ? subject : subjects[0].id;
  const chapters = useMemo(
    () => chaptersFor(current, level).map((c) => ({ chapter: c, fiche: ficheFor(c.id), cards: chapterMemos(c.id).length })),
    [current, level],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="📖 Fiches"
        subtitle="L'essentiel du cours, les pièges et des cartes mémoire."
        action={<Tabs value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l.id, label: l.label }))} />}
      />

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {subjects.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSubject(s.id)}
            className={clsx("qb-press flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors", current === s.id ? "bg-white text-slate-950" : "bg-slate-800/70 text-slate-300")}
          >
            <span>{s.emoji}</span>
            {s.id === "culture" ? "Culture G" : s.name}
          </button>
        ))}
      </div>

      <div key={`${current}-${level}`} className="qb-stagger grid gap-2.5 sm:grid-cols-2">
        {chapters.map(({ chapter, fiche, cards }) => (
          <Link
            key={chapter.id}
            href={`/fiches/${chapter.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 transition hover:-translate-y-0.5 hover:border-violet-400/40 active:scale-[0.99]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-xl">📄</span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-bold text-white">{chapter.title}</h2>
              <p className="flex flex-wrap gap-x-2 text-xs text-slate-400">
                {fiche && <span>{fiche.essentiel.length} points clés</span>}
                {fiche && fiche.exemples.length > 0 && <span>{fiche.exemples.length} exemple{fiche.exemples.length > 1 ? "s" : ""} corrigé{fiche.exemples.length > 1 ? "s" : ""}</span>}
                {cards > 0 && <span>🃏 {cards} cartes</span>}
                {chapter.lab && <span className="text-cyan-300"><FlaskConical size={11} className="mr-0.5 inline" />labo</span>}
              </p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
