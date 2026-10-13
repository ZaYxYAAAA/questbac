"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { Markdown } from "@/components/ui/Markdown";
import { type GivenAnswer, isCorrect } from "@/lib/game/session";
import type { Question } from "@/lib/types";

type Status = "answering" | "correct" | "wrong" | "timeout";

export function QuestionCard({
  question,
  onAnswered,
  onNext,
  timedOut = false,
  nextLabel = "Continuer",
}: {
  question: Question;
  /** Appelé une seule fois quand l'élève valide. */
  onAnswered: (correct: boolean, given: GivenAnswer) => void;
  onNext: () => void;
  /** Le parent signale que le temps est écoulé (mode boss). */
  timedOut?: boolean;
  nextLabel?: string;
}) {
  const [status, setStatus] = useState<Status>("answering");
  const [given, setGiven] = useState<GivenAnswer | null>(null);
  const [numeric, setNumeric] = useState("");
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (timedOut && status === "answering") setStatus("timeout");
  }, [timedOut, status]);

  useEffect(() => {
    if (status !== "answering") nextRef.current?.focus();
  }, [status]);

  const submit = (answer: GivenAnswer) => {
    if (status !== "answering") return;
    const ok = isCorrect(question, answer);
    setGiven(answer);
    setStatus(ok ? "correct" : "wrong");
    onAnswered(ok, answer);
  };

  // Raccourcis clavier : 1-4 pour les QCM, V/F pour vrai-faux, Entrée pour continuer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (status !== "answering") return;
      if (question.type === "mcq") {
        const i = parseInt(e.key, 10) - 1;
        if (i >= 0 && i < question.choices.length) submit(i);
      } else if (question.type === "truefalse") {
        if (e.key.toLowerCase() === "v") submit(true);
        if (e.key.toLowerCase() === "f") submit(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const revealed = status !== "answering";

  const choiceClass = (isAnswer: boolean, isGiven: boolean) =>
    clsx(
      "group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
      !revealed && "border-white/10 bg-slate-800/70 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-slate-800",
      revealed && isAnswer && "border-emerald-400 bg-emerald-500/15",
      revealed && isGiven && !isAnswer && "border-rose-400 bg-rose-500/15 qb-shake",
      revealed && !isAnswer && !isGiven && "border-white/5 bg-slate-800/40 opacity-60",
    );

  return (
    <div className="space-y-4">
      <div className="text-lg leading-relaxed text-white sm:text-xl">
        <Markdown>{question.prompt}</Markdown>
      </div>

      {question.type === "mcq" && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {question.choices.map((choice, i) => (
            <button key={i} type="button" disabled={revealed} onClick={() => submit(i)} className={choiceClass(i === question.answer, given === i)}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950/60 text-xs font-bold text-slate-400 group-hover:text-violet-300">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 text-slate-100"><Markdown compact>{choice}</Markdown></span>
              {revealed && i === question.answer && <Check className="shrink-0 text-emerald-400" size={20} />}
              {revealed && given === i && i !== question.answer && <X className="shrink-0 text-rose-400" size={20} />}
            </button>
          ))}
        </div>
      )}

      {question.type === "truefalse" && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" disabled={revealed} onClick={() => submit(v)} className={clsx(choiceClass(v === question.answer, given === v), "justify-center py-4 text-lg font-bold")}>
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
              autoFocus
              value={numeric}
              disabled={revealed}
              onChange={(e) => setNumeric(e.target.value)}
              inputMode="decimal"
              placeholder="Ta réponse (ex. 3,5 ou 7/2)"
              className={clsx(
                "w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-lg text-white outline-none transition",
                status === "correct" ? "border-emerald-400" : status === "wrong" || status === "timeout" ? "border-rose-400" : "border-white/15 focus:border-violet-400",
              )}
            />
            {question.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{question.unit}</span>}
          </div>
          {!revealed && (
            <button type="submit" className="rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-500">
              Valider
            </button>
          )}
        </form>
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
              Réponse attendue : <b className="font-mono">{String(question.answer).replace(".", ",")}</b> {question.unit}
            </p>
          )}
          {status !== "correct" && question.type === "truefalse" && (
            <p className="mb-1 text-sm text-slate-200">La bonne réponse était : <b>{question.answer ? "Vrai" : "Faux"}</b></p>
          )}
          <div className="text-sm text-slate-300"><Markdown compact>{question.explanation}</Markdown></div>
          <button
            ref={nextRef}
            type="button"
            onClick={onNext}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-violet-100"
          >
            {nextLabel} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
