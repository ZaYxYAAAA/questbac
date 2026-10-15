"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FlaskConical, Flame, Sparkles, Timer, X } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { comboMultiplier, xpForAnswer } from "@/lib/game/progression";
import type { GivenAnswer } from "@/lib/game/session";
import type { LabId, Question, QuizResult } from "@/lib/types";
import { LabSheet } from "./LabSheet";
import { QuestionCard } from "./QuestionCard";
import { BoostChip } from "@/components/game/BoostChip";

export function QuizRunner({
  questions,
  title,
  subtitle,
  exitHref,
  onComplete,
  secondsPerQuestion,
  lab,
}: {
  questions: Question[];
  title: string;
  subtitle?: string;
  exitHref: string;
  onComplete: (result: QuizResult, answerXp: number) => void;
  /** Chrono par question (duels) : à zéro, la question compte comme ratée. */
  secondsPerQuestion?: number;
  /** Labo du chapitre, à ouvrir en pleine mission. */
  lab?: LabId;
}) {
  const [labOpen, setLabOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [floating, setFloating] = useState<{ id: number; text: string } | null>(null);
  const answers = useRef<QuizResult["answers"]>([]);
  const startedAt = useRef(Date.now());
  const questionStart = useRef(Date.now());
  /** Dernière question déjà répondue (ou expirée) : évite un double enregistrement. */
  const answeredIndex = useRef(-1);
  const [timedOut, setTimedOut] = useState(false);
  /** Nombre de réponses données : force le rendu des pastilles de progression. */
  const [, setAnswered] = useState(0);
  const [remaining, setRemaining] = useState(secondsPerQuestion ?? 0);

  const q = questions[index];
  const correctCount = answers.current.filter((a) => a.correct).length;

  useEffect(() => {
    if (!secondsPerQuestion) return;
    setTimedOut(false);
    setRemaining(secondsPerQuestion);
    const limit = secondsPerQuestion * 1000;
    const id = setInterval(() => {
      if (answeredIndex.current === index) return clearInterval(id);
      const left = limit - (Date.now() - questionStart.current);
      setRemaining(Math.max(0, left / 1000));
      if (left <= 0) {
        clearInterval(id);
        answeredIndex.current = index;
        answers.current.push({ questionId: questions[index].id, correct: false, timeMs: limit, given: "" });
        setAnswered((n) => n + 1);
        setCombo(0);
        setTimedOut(true);
      }
    }, 100);
    return () => clearInterval(id);
  }, [index, secondsPerQuestion, questions]);

  const onAnswered = (correct: boolean, given: GivenAnswer) => {
    if (answeredIndex.current === index) return;
    answeredIndex.current = index;
    answers.current.push({ questionId: q.id, correct, timeMs: Date.now() - questionStart.current, given });
    setAnswered((n) => n + 1);
    if (correct) {
      const gained = xpForAnswer(q.difficulty ?? 1, combo);
      setXp((x) => x + gained);
      setFloating({ id: Date.now(), text: `+${gained} XP` });
      const next = combo + 1;
      setCombo(next);
      setMaxCombo((m) => Math.max(m, next));
    } else {
      setCombo(0);
    }
  };

  const onNext = () => {
    if (index + 1 >= questions.length) {
      const result: QuizResult = {
        correct: answers.current.filter((a) => a.correct).length,
        total: questions.length,
        maxCombo,
        durationMs: Date.now() - startedAt.current,
        answers: answers.current,
      };
      onComplete(result, xp);
      return;
    }
    setIndex((i) => i + 1);
    questionStart.current = Date.now();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={exitHref} aria-label="Quitter la mission" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
          <X size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex justify-between gap-2 text-xs text-slate-400">
            <span className="min-w-0 truncate font-semibold text-slate-200">{title}{subtitle && <span className="text-slate-500"> · {subtitle}</span>}</span>
            <span className="shrink-0 tabular-nums">{index + 1} / {questions.length}</span>
          </div>
          {questions.length <= 20 ? (
            <div className="flex gap-1" aria-label={`Question ${index + 1} sur ${questions.length}`}>
              {questions.map((_, i) => {
                const a = answers.current[i];
                return (
                  <span
                    key={i}
                    className={clsx(
                      "h-2 flex-1 rounded-full transition-colors duration-500",
                      a ? (a.correct ? "bg-emerald-400" : "bg-rose-500") : i === index ? "animate-pulse bg-violet-400" : "bg-slate-800",
                    )}
                  />
                );
              })}
            </div>
          ) : (
            <ProgressBar value={(index + (answers.current.length > index ? 1 : 0)) / questions.length} />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div
          className={clsx(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold transition",
            combo >= 3 ? "qb-combo bg-orange-500/20 text-orange-300" : "bg-slate-800 text-slate-400",
          )}
        >
          <Flame size={16} className={combo >= 3 ? "text-orange-400" : ""} />
          Combo ×<span key={combo} className={combo > 0 ? "qb-bump" : undefined}>{combo}</span> {combo > 0 && <span className="text-xs font-medium opacity-80">(XP ×{comboMultiplier(combo).toFixed(1)})</span>}
        </div>
        <div className="flex items-center gap-2">
        {lab && (
          <button
            type="button"
            onClick={() => setLabOpen(true)}
            className="qb-press inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-sm font-bold text-cyan-100"
          >
            <FlaskConical size={15} /> Labo
          </button>
        )}
        <BoostChip />
        <div className="relative flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-sm font-bold text-violet-200">
          <Sparkles size={16} /> <span key={xp} className="qb-bump tabular-nums">{xp}</span> XP
          {floating && (
            <span key={floating.id} className="qb-float pointer-events-none absolute -top-5 right-2 text-sm font-black text-amber-300">
              {floating.text}
            </span>
          )}
        </div>
        </div>
      </div>

      {secondsPerQuestion && (
        <div className="flex items-center gap-2">
          <Timer size={18} className={remaining <= 5 ? "text-rose-400" : "text-amber-300"} />
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className={clsx("h-full rounded-full transition-[width] duration-100 ease-linear", remaining <= 5 ? "bg-rose-500" : "bg-amber-400")}
              style={{ width: `${(remaining / secondsPerQuestion) * 100}%` }}
            />
          </div>
          <span className={clsx("w-10 text-right font-mono text-sm font-bold tabular-nums", remaining <= 5 ? "text-rose-300" : "text-amber-200")}>{Math.ceil(remaining)} s</span>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl sm:p-7">
        <QuestionCard
          timedOut={timedOut}
          key={q.id + index}
          number={index + 1}
          question={q}
          onAnswered={onAnswered}
          onNext={onNext}
          nextLabel={index + 1 >= questions.length ? "Voir mes récompenses" : "Question suivante"}
        />
      </div>

      <p className="text-center text-xs text-slate-500">
        {correctCount} bonne{correctCount > 1 ? "s" : ""} réponse{correctCount > 1 ? "s" : ""}<span className="hidden sm:inline"> · Raccourcis clavier : 1-4 ou A-D, V/F, Entrée</span>
      </p>
      {labOpen && lab && <LabSheet lab={lab} onClose={() => setLabOpen(false)} />}
    </div>
  );
}
