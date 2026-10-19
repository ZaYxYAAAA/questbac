"use client";

import { type CSSProperties, Fragment } from "react";
import { Markdown } from "@/components/ui/Markdown";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import type { Fiche } from "@/lib/content/fiches";
import { FONTS, type PaperId, type PaperLook, THEMES } from "@/lib/content/fiches/look";
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

/** Luminance relative (WCAG) d'une couleur « #RRGGBB ». */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Assombrit une couleur jusqu'à ce qu'elle soit lisible en texte sur papier blanc (contraste ≥ 4,5). */
export function readableOnWhite(hex: string): string {
  const n = parseInt(hex.slice(1, 7), 16);
  let rgb = [n >> 16, (n >> 8) & 255, n & 255];
  const toHex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  for (let i = 0; i < 30 && contrastRatio(toHex(rgb), "#FFFFFF") < 4.5; i++) rgb = rgb.map((v) => v * 0.92);
  return toHex(rgb);
}

interface Ink {
  accent: string;
  accent2: string;
  ink: string;
  onAccent: string;
  title: string;
}

function SectionTitle({ n, children, k }: { n: number; children: string; k: Ink }) {
  return (
    <h2 className="mb-3 flex items-center gap-2.5 text-[1.1em] font-black uppercase tracking-[0.06em]" style={{ color: k.ink, fontFamily: k.title }}>
      <span className="grid h-[1.6em] w-[1.6em] place-items-center rounded-md text-[0.8em]" style={{ background: k.accent, color: k.onAccent }}>{n}</span>
      {children}
      <span className="ml-1 h-px flex-1 bg-slate-300/70" />
    </h2>
  );
}

/** Fond du papier : Seyès (lignes et marge rouge), petits carreaux ou pointillés. */
function paperStyle(paper: PaperId): CSSProperties {
  if (paper === "seyes")
    return {
      backgroundImage:
        "linear-gradient(90deg, transparent var(--qb-mx), #F2A3A3 var(--qb-mx), #F2A3A3 calc(var(--qb-mx) + 1.2px), transparent calc(var(--qb-mx) + 1.2px)), repeating-linear-gradient(180deg, transparent 0 calc(8mm - 1px), #A9BDE6 calc(8mm - 1px) 8mm), repeating-linear-gradient(180deg, transparent 0 calc(2mm - 1px), #E1E9F7 calc(2mm - 1px) 2mm)",
    };
  if (paper === "carreaux")
    return {
      backgroundImage: "repeating-linear-gradient(180deg, transparent 0 calc(5mm - 1px), #DCE5F4 calc(5mm - 1px) 5mm), repeating-linear-gradient(90deg, transparent 0 calc(5mm - 1px), #DCE5F4 calc(5mm - 1px) 5mm)",
    };
  if (paper === "points") return { backgroundImage: "radial-gradient(circle, #BFC9DB 1px, transparent 1.3px)", backgroundSize: "5mm 5mm" };
  return {};
}

/**
 * Fiche de révision au format A4, pensée pour l'impression (et lisible à l'écran) :
 * l'essentiel numéroté, les symboles, les exemples corrigés, les pièges, un mini-test
 * avec ses réponses à l'envers, et des cases pour cocher ses révisions espacées.
 */
export function FichePaper({ chapter, fiche, notations, quiz, options, look }: { chapter: Chapter; fiche: Fiche | null; notations: Notation[]; quiz: Memo[]; options: PaperOptions; look: PaperLook }) {
  const meta = subjectMeta(chapter.subject);
  const theme = THEMES[look.theme];
  const font = FONTS[look.font];
  const accent = theme.accent ?? meta.color;
  // Couleur de la matière (souvent claire : ambre, citron, cyan…) : chiffres en blanc ou en encre, selon le plus lisible.
  const onAccent = theme.accent ? theme.onAccent : contrastRatio("#FFFFFF", accent) >= contrastRatio(theme.ink, accent) ? "#FFFFFF" : theme.ink;
  // Texte écrit avec la couleur principale (étiquettes, numéros) : assez foncé pour se lire, aussi une fois imprimé.
  const accentText = theme.marker ? theme.ink : readableOnWhite(accent);
  const k: Ink = { accent, accent2: theme.accent2, ink: theme.ink, onAccent, title: font.title };
  let section = 0;
  const next = () => ++section;

  return (
    <article className="qb-paper mx-auto bg-white text-slate-800 shadow-2xl print:shadow-none" style={{ fontFamily: font.body, fontSize: `${13.5 * font.scale}px` }}>
      {/* À l'impression, la règle générale « texte Markdown en noir » ne doit pas effacer les couleurs choisies pour la fiche. */}
      <style>{"@media print { .qb-paper .qb-md, .qb-paper .qb-md * { color: inherit; } }"}</style>
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${accent}, ${theme.accent2})` }} />
      <div className="qb-paper-body" style={paperStyle(look.paper)}>
        {/* En-tête */}
        <header className="flex items-start gap-4 border-b-2 border-slate-100 pb-4">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.8em] font-bold uppercase tracking-wider" style={{ background: `${accent}22`, color: accentText, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
              {meta.emoji} {meta.name}{meta.extra ? "" : ` · ${levelLabel(chapter.level)}`}
            </p>
            <h1 className="mt-2 text-[1.95em] font-black leading-tight" style={{ color: theme.ink, fontFamily: font.title }}>
              <span style={theme.marker ? { backgroundImage: `linear-gradient(transparent 55%, ${accent}AA 55%, ${accent}AA 92%, transparent 92%)` } : undefined}>{chapter.title}</span>
            </h1>
            <p className="mt-1 text-[0.96em] leading-snug text-slate-500">{chapter.summary}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="flex items-center justify-end gap-1.5 text-[13px] font-black text-slate-900" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
              <Logo /> Quest<span style={{ color: "#6C47FF" }}>Bac</span>
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>Je révise</p>
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
            <SectionTitle n={next()} k={k}>L&apos;essentiel</SectionTitle>
            <ol className="space-y-2.5">
              {fiche.essentiel.map((p, i) => (
                <li key={i} className="qb-avoid-break flex gap-3">
                  <span className="mt-[0.15em] grid h-[1.45em] w-[1.45em] shrink-0 place-items-center rounded-full text-[0.8em] font-black" style={{ background: accent, color: onAccent, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[1em] font-medium leading-relaxed" style={{ color: theme.ink }}><Markdown compact>{p.text}</Markdown></div>
                    {options.explain && p.explain && (
                      <div className="mt-1 border-l-2 pl-2.5 text-[0.89em] leading-relaxed text-slate-600" style={{ borderColor: `${accent}77` }}>
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
          <section className="qb-avoid-break mt-5 rounded-xl bg-slate-50/90 p-3.5">
            <p className="mb-2 text-[0.8em] font-black uppercase tracking-wider text-slate-500">Les symboles de la fiche</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.89em] sm:grid-cols-[auto_1fr_auto_1fr]">
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
            <SectionTitle n={next()} k={k}>{options.corrections ? "Exemples corrigés" : "Exemples à chercher"}</SectionTitle>
            <div className="grid gap-3">
              {fiche.exemples.map((ex, i) => (
                <div key={i} className="qb-avoid-break rounded-xl border border-slate-200 bg-white/85 p-3.5">
                  <p className="text-[0.75em] font-black uppercase tracking-wider" style={{ color: accentText }}>Exemple {i + 1}</p>
                  <div className="mt-0.5 text-[1em] font-semibold leading-relaxed" style={{ color: theme.ink }}><Markdown compact>{ex.question}</Markdown></div>
                  {options.corrections ? (
                    <ol className="mt-2 space-y-1 border-t border-dashed border-slate-200 pt-2">
                      {ex.steps.map((s, k) => (
                        <li key={k} className="flex gap-2 text-[0.93em] leading-relaxed text-slate-700">
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
          <section className="qb-avoid-break mt-5 rounded-xl border-2 border-rose-200 bg-rose-50/90 p-3.5">
            <p className="mb-2 flex items-center gap-2 text-[1em] font-black uppercase tracking-[0.06em] text-rose-700" style={{ fontFamily: font.title }}>
              <span className="grid h-[1.4em] w-[1.4em] place-items-center rounded-full bg-rose-600 text-[0.8em] text-white">!</span>
              Pièges à éviter
            </p>
            <ul className="space-y-1.5">
              {fiche.pieges.map((p, i) => (
                <li key={i} className="flex gap-2 text-[0.93em] leading-relaxed text-rose-950">
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
            <SectionTitle n={next()} k={k}>Je me teste</SectionTitle>
            <ol className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 print:grid-cols-2">
              {quiz.map((q, i) => (
                <li key={i} className="flex gap-2 text-[0.93em] leading-snug" style={{ color: theme.ink }}>
                  <span className="font-black" style={{ color: accentText }}>{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <Markdown compact>{q.front}</Markdown>
                    <div className="mt-1 flex gap-3 text-[0.75em] font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border-2 border-slate-300" /> je sais</span>
                      <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border-2 border-slate-300" /> à revoir</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 rotate-180 rounded-lg bg-slate-50/90 px-3 py-2 text-[0.78em] leading-relaxed text-slate-500">
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

        <footer className="mt-6 flex items-center justify-between gap-3 border-t-2 border-slate-100 pt-3 text-[0.78em] text-slate-400" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
          <span className="flex items-center gap-1.5"><Logo size={14} /> Entraîne-toi sur ce chapitre : missions, boss et parties classées</span>
          <span className="font-semibold text-slate-500">questbac.vercel.app</span>
        </footer>
      </div>
    </article>
  );
}
