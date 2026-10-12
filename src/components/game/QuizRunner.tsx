"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Flame, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { comboMultiplier, xpForAnswer } from "@/lib/game/progression";
import type { Question, QuizResult } from "@/lib/types";
import { QuestionCard } from "./QuestionCard";

export function QuizRunner({
  questions,
  title,
  subtitle,
  exitHref,
  onComplete,
}: {
  questions: Question[];
  title: string;
  subtitle?: string;
  exitHref: string;
  onComplete: (result: QuizResult, answerXp: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [floating, setFloating] = useState<{ id: number; text: string } | null>(null);
  const answers = useRef<QuizResult["answers"]>([]);
  const startedAt = useRef(Date.now());
  const questionStart = useRef(Date.now());

  const q = questions[index];
  const correctCount = answers.current.filter((a) => a.correct).length;

  const onAnswered = (correct: boolean) => {
    answers.current.push({ questionId: q.id, correct, timeMs: Date.now() - questionStart.current });
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
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span className="truncate font-semibold text-slate-200">{title}{subtitle && <span className="text-slate-500"> · {subtitle}</span>}</span>
            <span>{index + 1} / {questions.length}</span>
          </div>
          <ProgressBar value={(index + (answers.current.length > index ? 1 : 0)) / questions.length} />
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
          Combo ×{combo} {combo > 0 && <span className="text-xs font-medium opacity-80">(XP ×{comboMultiplier(combo).toFixed(1)})</span>}
        </div>
        <div className="relative flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-sm font-bold text-violet-200">
          <Sparkles size={16} /> {xp} XP
          {floating && (
            <span key={floating.id} className="qb-float pointer-events-none absolute -top-5 right-2 text-sm font-black text-amber-300">
              {floating.text}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl sm:p-7">
        <QuestionCard
          key={q.id + index}
          question={q}
          onAnswered={onAnswered}
          onNext={onNext}
          nextLabel={index + 1 >= questions.length ? "Voir mes récompenses" : "Question suivante"}
        />
      </div>

      <p className="text-center text-xs text-slate-500">
        {correctCount} bonne{correctCount > 1 ? "s" : ""} réponse{correctCount > 1 ? "s" : ""} · Raccourcis : touches 1-4, V/F, Entrée
      </p>
    </div>
  );
}
