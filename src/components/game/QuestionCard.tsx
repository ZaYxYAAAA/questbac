"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, Check, Clock, Lightbulb, X } from "lucide-react";
import { Calculator } from "@/components/game/Calculator";
import { Markdown } from "@/components/ui/Markdown";
import { type GivenAnswer, isCorrect } from "@/lib/game/session";
import type { Question } from "@/lib/types";

type Status = "answering" | "checking" | "correct" | "wrong" | "timeout";

export function QuestionCard({
  question: incoming,
  onAnswered,
  onNext,
  timedOut = false,
  nextLabel = "Continuer",
  number,
  grade,
  noCopy = false,
}: {
  question: Question;
  /** Appelé une seule fois quand l'élève valide. */
  onAnswered: (correct: boolean, given: GivenAnswer) => void;
  onNext: () => void;
  /** Le parent signale que le temps est écoulé (mode boss). */
  timedOut?: boolean;
  nextLabel?: string;
  /** Numéro affiché dans l'en-tête de la carte. */
  number?: number;
  /**
   * Correction par le serveur (mode classé) : la question reçue n'a pas sa
   * réponse, le serveur renvoie la question complète après validation.
   */
  grade?: (given: GivenAnswer) => Promise<{ correct: boolean; question: Question }>;
  /** Texte non sélectionnable (mode classé). */
  noCopy?: boolean;
}) {
  const [status, setStatus] = useState<Status>("answering");
  const [revealedQuestion, setRevealedQuestion] = useState<Question | null>(null);
  // Une fois corrigée par le serveur, on affiche la question complète (réponse et explication).
  const question = revealedQuestion ?? incoming;
  const [given, setGiven] = useState<GivenAnswer | null>(null);
  const [numeric, setNumeric] = useState("");
  const nextRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!timedOut || status !== "answering") return;
    if (!grade) {
      setStatus("timeout");
      return;
    }
    setStatus("checking");
    grade("")
      .then((res) => {
        setRevealedQuestion(res.question);
        setStatus("timeout");
        onAnswered(false, "");
      })
      // Réseau coupé : on réessaie un peu plus tard plutôt qu'en boucle.
      .catch(() => setTimeout(() => setStatus("answering"), 2000));
  }, [timedOut, status, grade, onAnswered]);

  useEffect(() => {
    if (status !== "answering") nextRef.current?.focus();
  }, [status]);

  const submit = (answer: GivenAnswer) => {
    if (status !== "answering") return;
    if (grade) {
      setGiven(answer);
      setStatus("checking");
      grade(answer)
        .then((res) => {
          setRevealedQuestion(res.question);
          setStatus(res.correct ? "correct" : "wrong");
          onAnswered(res.correct, answer);
        })
        .catch(() => {
          setGiven(null);
          setStatus("answering");
        });
      return;
    }
    const ok = isCorrect(question, answer);
    setGiven(answer);
    setStatus(ok ? "correct" : "wrong");
    onAnswered(ok, answer);
  };

  // Raccourcis clavier : 1-4 ou A-D pour les QCM, V/F pour vrai-faux, Entrée pour continuer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      // Ctrl+F, Cmd+C, Ctrl+A… sont des raccourcis du navigateur, pas une réponse.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Labo ou calculatrice ouverts par-dessus : les touches leur appartiennent.
      if (document.querySelector('[role="dialog"]')) return;
      if (status !== "answering") return;
      if (question.type === "mcq") {
        const n = parseInt(e.key, 10) - 1;
        const i = Number.isNaN(n) ? "abcd".indexOf(e.key.toLowerCase()) : n;
        if (i >= 0 && i < question.choices.length) submit(i);
      } else if (question.type === "truefalse") {
        if (e.key.toLowerCase() === "v") submit(true);
        if (e.key.toLowerCase() === "f") submit(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const revealed = status !== "answering" && status !== "checking";
  const locked = status !== "answering";

  const choiceClass = (isAnswer: boolean, isGiven: boolean) =>
    clsx(
      "group flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-base transition active:scale-[0.98]",
      !revealed && !isGiven && "border-white/10 bg-slate-800/70 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-slate-800",
      !revealed && isGiven && "animate-pulse border-violet-400 bg-violet-600/20",
      revealed && isAnswer && "border-emerald-400 bg-emerald-500/15 qb-correct",
      revealed && isGiven && !isAnswer && "border-rose-400 bg-rose-500/15 qb-shake",
      revealed && !isAnswer && !isGiven && "border-white/5 bg-slate-800/40 opacity-60",
    );

  const typeLabel = question.type === "mcq" ? "QCM" : question.type === "truefalse" ? "Vrai ou faux" : "Réponse libre";
  const level = question.difficulty ?? 1;
  const insert = (text: string) => {
    setNumeric((v) => v + text);
    inputRef.current?.focus();
  };

  return (
    <div className={clsx("qb-slide-in space-y-4", noCopy && "select-none [-webkit-touch-callout:none]")} onCopy={noCopy ? (e) => e.preventDefault() : undefined} onContextMenu={noCopy ? (e) => e.preventDefault() : undefined}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
        {number !== undefined && <span className="rounded-full bg-violet-600/30 px-2.5 py-1 text-violet-200">Question {number}</span>}
        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">{typeLabel}</span>
        <span className="ml-auto text-amber-300" title={`Difficulté ${level} sur 3`}>{"★".repeat(level)}<span className="text-slate-700">{"★".repeat(3 - level)}</span></span>
      </div>
      <div className="text-lg leading-relaxed text-white sm:text-xl">
        <Markdown>{question.prompt}</Markdown>
      </div>
      {question.calc && !revealed && (
        <div>
          <Calculator onUse={question.type === "numeric" ? (v) => setNumeric(v) : undefined} />
        </div>
      )}

      {question.type === "mcq" && (
        <div className="qb-stagger grid gap-2.5 sm:grid-cols-2">
          {question.choices.map((choice, i) => (
            <button key={i} type="button" disabled={locked} onClick={() => submit(i)} className={choiceClass(i === question.answer, given === i)}>
              <span
                className={clsx(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black",
                  revealed && i === question.answer ? "bg-emerald-500 text-slate-950" : revealed && given === i ? "bg-rose-500 text-white" : "bg-slate-950/60 text-slate-400 group-hover:bg-violet-600 group-hover:text-white",
                )}
              >
                {"ABCD"[i] ?? i + 1}
              </span>
              <span className="min-w-0 flex-1 text-slate-100"><Markdown compact>{choice}</Markdown></span>
              {revealed && i === question.answer && <Check className="shrink-0 text-emerald-400" size={20} />}
              {revealed && given === i && i !== question.answer && <X className="shrink-0 text-rose-400" size={20} />}
            </button>
          ))}
        </div>
      )}

      {question.type === "truefalse" && (
        <div className="qb-stagger grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" disabled={locked} onClick={() => submit(v)} className={clsx(choiceClass(v === question.answer, given === v), "min-h-16 justify-center py-4 text-lg font-bold")}>
              {v ? "✅ Vrai" : "❌ Faux"}
            </button>
          ))}
        </div>
      )}

      {question.type === "numeric" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (numeric.trim()) submit(numeric);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              autoFocus
              value={numeric}
              disabled={locked}
              onChange={(e) => setNumeric(e.target.value)}
              inputMode="decimal"
              placeholder="Ta réponse…"
              className={clsx(
                "w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-lg text-white outline-none transition",
                status === "correct" ? "border-emerald-400" : status === "wrong" || status === "timeout" ? "border-rose-400" : "border-white/15 focus:border-violet-400",
              )}
            />
            {question.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{question.unit}</span>}
          </div>
          {!revealed && (
            <button type="submit" disabled={locked} className="rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-500 disabled:opacity-60">
              {status === "checking" ? "…" : "Valider"}
            </button>
          )}
        </form>
      )}
      {question.type === "numeric" && !revealed && (
        <div className="flex gap-2" aria-label="Symboles utiles">
          {[["−", "-"], [",", ","], ["/", "/"]].map(([label, text]) => (
            <button key={label} type="button" onClick={() => insert(text)} className="h-10 min-w-12 rounded-xl border border-white/10 bg-slate-800 px-3 font-mono text-lg font-bold text-slate-200 active:scale-95">
              {label}
            </button>
          ))}
          <button type="button" onClick={() => setNumeric((v) => v.slice(0, -1))} className="h-10 rounded-xl border border-white/10 bg-slate-800 px-3 text-sm font-semibold text-slate-300 active:scale-95">
            ⌫
          </button>
        </div>
      )}

      {revealed && (
        <div
          className={clsx(
            "qb-pop rounded-2xl border p-4",
            status === "correct" ? "border-emerald-500/40 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/10",
          )}
        >
          <div className="mb-2 flex items-center gap-2 font-bold">
            {status === "correct" && <><Check className="text-emerald-400" size={20} /><span className="text-emerald-300">Bonne réponse !</span></>}
            {status === "wrong" && <><X className="text-rose-400" size={20} /><span className="text-rose-300">Raté…</span></>}
            {status === "timeout" && <><Clock className="text-rose-400" size={20} /><span className="text-rose-300">Temps écoulé !</span></>}
          </div>
          {status !== "correct" && question.type === "numeric" && (
            <p className="mb-1 text-sm text-slate-200">
              Réponse attendue : <b className="font-mono">{String(Math.round(question.answer * 10000) / 10000).replace(".", ",")}</b> {question.unit}
            </p>
          )}
          {status !== "correct" && question.type === "mcq" && (
            <div className="mb-1 flex items-baseline gap-1.5 text-sm text-slate-200">
              <span className="shrink-0">Bonne réponse : <b>{"ABCD"[question.answer]}</b> —</span>
              <span className="min-w-0"><Markdown compact>{question.choices[question.answer]}</Markdown></span>
            </div>
          )}
          {status !== "correct" && question.type === "truefalse" && (
            <p className="mb-1 text-sm text-slate-200">La bonne réponse était : <b>{question.answer ? "Vrai" : "Faux"}</b></p>
          )}
          <div className="flex gap-2 rounded-xl bg-slate-950/40 p-2.5 text-sm text-slate-300">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-300" />
            <div className="min-w-0"><Markdown compact>{question.explanation}</Markdown></div>
          </div>
          <button
            ref={nextRef}
            type="button"
            onClick={onNext}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-base font-bold text-slate-900 hover:bg-violet-100 sm:w-auto sm:py-2 sm:text-sm"
          >
            {nextLabel} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
