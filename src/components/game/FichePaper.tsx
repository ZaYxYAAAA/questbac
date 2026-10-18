"use client";

import { Fragment } from "react";
import { Markdown } from "@/components/ui/Markdown";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import type { Fiche } from "@/lib/content/fiches";
import type { Notation } from "@/lib/content/fiches/notations";
import type { Memo } from "@/lib/content/gen/kit";
import type { Chapter } from "@/lib/types";

export interface PaperOptions {
  /** Explications « en clair » sous chaque point. */
  explain: boolean;
  /** Corrections des exemples (sinon : lignes pour chercher soi-même). */
  corrections: boolean;
  /** Rubrique « Je me teste » avec réponses à l'envers en bas de page. */
  quiz: boolean;
}

/** Petites questions retenues pour « Je me teste » : courtes, variées. */
export function quizFrom(memos: Memo[], count = 6): Memo[] {
  return memos.filter((m) => m.front.length <= 150 && m.back.length <= 80).slice(0, count);
}

/** Q du logo, en petit. */
function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} style={{ borderRadius: size * 0.22 }} aria-hidden="true">
      <rect width="512" height="512" fill="#6C47FF" />
      <circle cx="244" cy="240" r="118" fill="none" stroke="#fff" strokeWidth="68" />
      <path d="M327 323 L390 386" stroke="#fff" strokeWidth="68" strokeLinecap="round" />
    </svg>
  );
}

function SectionTitle({ n, children, color }: { n: number; children: string; color: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2.5 text-[15px] font-black uppercase tracking-[0.08em] text-slate-900">
      <span className="grid h-6 w-6 place-items-center rounded-md text-[12px] text-white" style={{ background: color }}>{n}</span>
      {children}
      <span className="ml-1 h-px flex-1 bg-slate-200" />
    </h2>
  );
}

/**
 * Fiche de révision au format A4, pensée pour l'impression (et lisible à l'écran) :
 * l'essentiel numéroté, les symboles, les exemples corrigés, les pièges, un mini-test
 * avec ses réponses à l'envers, et des cases pour cocher ses révisions espacées.
 */
export function FichePaper({ chapter, fiche, notations, quiz, options }: { chapter: Chapter; fiche: Fiche | null; notations: Notation[]; quiz: Memo[]; options: PaperOptions }) {
  const meta = subjectMeta(chapter.subject);
  const accent = meta.color;
  let section = 0;
  const next = () => ++section;

  return (
    <article className="qb-paper mx-auto bg-white text-slate-800 shadow-2xl print:shadow-none">
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${accent}, #6C47FF)` }} />
      <div className="qb-paper-body">
        {/* En-tête */}
        <header className="flex items-start gap-4 border-b-2 border-slate-100 pb-4">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${accent}1A`, color: accent }}>
              {meta.emoji} {meta.name}{meta.extra ? "" : ` · ${levelLabel(chapter.level)}`}
            </p>
            <h1 className="mt-2 text-[26px] font-black leading-tight text-slate-900">{chapter.title}</h1>
            <p className="mt-1 text-[13px] leading-snug text-slate-500">{chapter.summary}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="flex items-center justify-end gap-1.5 text-[13px] font-black text-slate-900">
              <Logo /> Quest<span style={{ color: "#6C47FF" }}>Bac</span>
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Je révise</p>
            <div className="mt-1 flex justify-end gap-1.5">
              {["J", "J+3", "J+7", "J+30"].map((d) => (
                <span key={d} className="flex flex-col items-center gap-0.5">
                  <span className="h-4 w-4 rounded border-2 border-slate-300" />
                  <span className="text-[9px] font-semibold text-slate-400">{d}</span>
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* L'essentiel */}
        {fiche && fiche.essentiel.length > 0 && (
          <section className="mt-5">
            <SectionTitle n={next()} color={accent}>L&apos;essentiel</SectionTitle>
            <ol className="space-y-2.5">
              {fiche.essentiel.map((p, i) => (
                <li key={i} className="qb-avoid-break flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-black text-white" style={{ background: accent }}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium leading-relaxed text-slate-900"><Markdown compact>{p.text}</Markdown></div>
                    {options.explain && p.explain && (
                      <div className="mt-1 border-l-2 pl-2.5 text-[12px] leading-relaxed text-slate-600" style={{ borderColor: `${accent}55` }}>
                        <Markdown compact>{p.explain}</Markdown>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Symboles */}
        {notations.length > 0 && (
          <section className="qb-avoid-break mt-5 rounded-xl bg-slate-50 p-3.5">
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-500">Les symboles de la fiche</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px] sm:grid-cols-[auto_1fr_auto_1fr]">
              {notations.map((n) => (
                <Fragment key={n.symbol}>
                  <dt className="font-semibold text-slate-900"><Markdown compact>{`$${n.symbol}$`}</Markdown></dt>
                  <dd className="text-slate-600">{n.meaning}</dd>
                </Fragment>
              ))}
            </dl>
          </section>
        )}

        {/* Exemples */}
        {fiche && fiche.exemples.length > 0 && (
          <section className="mt-5">
            <SectionTitle n={next()} color={accent}>{options.corrections ? "Exemples corrigés" : "Exemples à chercher"}</SectionTitle>
            <div className="grid gap-3">
              {fiche.exemples.map((ex, i) => (
                <div key={i} className="qb-avoid-break rounded-xl border border-slate-200 p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>Exemple {i + 1}</p>
                  <div className="mt-0.5 text-[13.5px] font-semibold leading-relaxed text-slate-900"><Markdown compact>{ex.question}</Markdown></div>
                  {options.corrections ? (
                    <ol className="mt-2 space-y-1 border-t border-dashed border-slate-200 pt-2">
                      {ex.steps.map((s, k) => (
                        <li key={k} className="flex gap-2 text-[12.5px] leading-relaxed text-slate-700">
                          <span className="font-bold text-slate-400">{k + 1}.</span>
                          <div className="min-w-0 flex-1"><Markdown compact>{s}</Markdown></div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-3 space-y-5" aria-hidden="true">
                      {Array.from({ length: Math.min(4, Math.max(2, ex.steps.length)) }, (_, k) => (
                        <div key={k} className="border-b border-dotted border-slate-300" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pièges */}
        {fiche && fiche.pieges.length > 0 && (
          <section className="qb-avoid-break mt-5 rounded-xl border-2 border-rose-200 bg-rose-50/60 p-3.5">
            <p className="mb-2 flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.08em] text-rose-700">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-rose-600 text-[11px] text-white">!</span>
              Pièges à éviter
            </p>
            <ul className="space-y-1.5">
              {fiche.pieges.map((p, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-rose-950">
                  <span className="font-black text-rose-500">✗</span>
                  <div className="min-w-0 flex-1"><Markdown compact>{p}</Markdown></div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Je me teste */}
        {options.quiz && quiz.length > 0 && (
          <section className="qb-avoid-break mt-5">
            <SectionTitle n={next()} color={accent}>Je me teste</SectionTitle>
            <ol className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 print:grid-cols-2">
              {quiz.map((q, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-slate-800">
                  <span className="font-black" style={{ color: accent }}>{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <Markdown compact>{q.front}</Markdown>
                    <div className="mt-1 flex gap-3 text-[10px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border-2 border-slate-300" /> je sais</span>
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border-2 border-slate-300" /> à revoir</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 rotate-180 rounded-lg bg-slate-50 px-3 py-2 text-[10.5px] leading-relaxed text-slate-500">
              <span className="font-black text-slate-700">Réponses : </span>
              {quiz.map((q, i) => (
                <span key={i} className="mr-2 inline-flex gap-1">
                  <b>{i + 1}.</b> <span className="inline-block"><Markdown compact>{q.back}</Markdown></span>
                </span>
              ))}
            </div>
          </section>
        )}

        {!fiche && <p className="mt-6 text-center text-sm text-slate-500">La fiche de ce chapitre arrive bientôt.</p>}

        <footer className="mt-6 flex items-center justify-between gap-3 border-t-2 border-slate-100 pt-3 text-[10.5px] text-slate-400">
          <span className="flex items-center gap-1.5"><Logo size={14} /> Entraîne-toi sur ce chapitre : missions, boss et parties classées</span>
          <span className="font-semibold text-slate-500">questbac.vercel.app</span>
        </footer>
      </div>
    </article>
  );
}
