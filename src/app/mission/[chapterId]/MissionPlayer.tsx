"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, FlaskConical, Infinity as InfinityIcon, Play, Shuffle } from "lucide-react";
import { QuizRunner } from "@/components/game/QuizRunner";
import { RewardScreen } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { chapterQuestions, mixQuestions } from "@/lib/content/generated";
import { prepareQuestions } from "@/lib/game/session";
import type { RewardSummary } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";
import { rememberSeen, seenFor } from "@/lib/store/seen-questions";
import { announce } from "@/lib/store/toast-store";
import type { Chapter, Question } from "@/lib/types";

type Phase = { kind: "intro" } | { kind: "playing"; questions: Question[]; label: string; mix?: boolean } | { kind: "done"; summary: RewardSummary; correct: number; total: number };

export function MissionPlayer({ chapter, autoMix = false }: { chapter: Chapter; autoMix?: boolean }) {
  const recordSession = useGame((s) => s.recordSession);
  const progress = useGame((s) => s.chapters[chapter.id]);
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [count, setCount] = useState(6);
  const meta = subjectMeta(chapter.subject);
  // La Culture générale a sa propre page, hors de la carte des matières.
  const exitHref = meta.extra ? "/culture" : `/matieres/${chapter.subject}?niveau=${chapter.level}`;
  const mixScope = `mix:${chapter.subject}:${chapter.level}`;

  // Questions générées : jamais deux fois le même énoncé tant qu'il en reste de nouveaux.
  const startLocal = () => {
    const questions = prepareQuestions(chapterQuestions(chapter.id, count, Math.random, seenFor(chapter.id)));
    rememberSeen(chapter.id, questions);
    setPhase({ kind: "playing", questions, label: meta.name });
  };
  const startMix = (n = count) => {
    const questions = prepareQuestions(mixQuestions(chapter.subject, chapter.level, n, Math.random, seenFor(mixScope)));
    rememberSeen(mixScope, questions);
    setPhase({ kind: "playing", questions, label: meta.extra ? "Tous les thèmes" : `Mélange ${meta.name}`, mix: true });
  };

  // Lien « Quiz éclair » : on lance directement un mélange de 10 questions.
  useEffect(() => {
    if (autoMix) startMix(10);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois, à l'arrivée sur la page
  }, []);

  if (phase.kind === "playing") {
    return (
      <QuizRunner
        questions={phase.questions}
        title={phase.mix ? (meta.extra ? "Quiz éclair" : "Mélange") : chapter.title}
        subtitle={phase.label}
        exitHref={exitHref}
        onComplete={(result, answerXp) => {
          const summary = recordSession({ kind: "chapter", chapterId: chapter.id, subject: chapter.subject, result, answerXp });
          announce(summary, { questsOnly: true });
          setPhase({ kind: "done", summary, correct: result.correct, total: result.total });
        }}
      />
    );
  }

  if (phase.kind === "done") {
    const ratio = phase.correct / phase.total;
    return (
      <RewardScreen
        summary={phase.summary}
        emoji={ratio === 1 ? "🏆" : ratio >= 0.5 ? "🎉" : "💪"}
        heading={ratio === 1 ? "Sans faute !" : ratio >= 0.5 ? "Mission réussie !" : "Mission terminée"}
        subheading={`${phase.correct} / ${phase.total} bonnes réponses · ${chapter.title}`}
        onReplay={() => setPhase({ kind: "intro" })}
        backHref={exitHref}
        backLabel={meta.extra ? "Retour à la Culture G" : "Retour à la carte"}
      >
      </RewardScreen>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href={exitHref} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft size={16} /> {meta.name}
      </Link>

      <div className={clsx("relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-center", meta.gradient)}>
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="relative">
          <div className="qb-bob text-6xl">{meta.emoji}</div>
          <p className="mt-3 text-sm font-semibold text-white/80">{meta.name}{meta.extra ? " · tous niveaux" : ` · ${levelLabel(chapter.level)}`}</p>
          <h1 className="text-3xl font-black text-white">{chapter.title}</h1>
          <p className="mt-1 text-white/80">{chapter.summary}</p>
          {progress && (
            <p className="mt-3 text-sm text-white/90">
              Record : {[1, 2, 3].map((s) => (s <= progress.stars ? "⭐" : "☆")).join("")} · {Math.round(progress.bestScore * 100)} % · {progress.attempts} essai(s)
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-300">Nombre de questions</p>
          <div className="flex gap-2">
            {[4, 6, 8, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={clsx("flex-1 rounded-xl py-2 text-sm font-bold transition", count === n ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-1 text-sm text-slate-400">
          <li>🔥 Enchaîne les bonnes réponses : chaque combo augmente ton XP (jusqu&apos;à ×2).</li>
          <li>⭐ 50 % = 1 étoile, 75 % = 2 étoiles, sans faute = 3 étoiles et bonus de 50 %.</li>
        </ul>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={startLocal} className="py-3.5 text-base">
            <Play size={18} /> Lancer ({count} questions)
          </Button>
          <Button variant="secondary" onClick={() => startMix()} className="py-3.5">
            <Shuffle size={16} /> {meta.extra ? "Mélange de tous les thèmes" : "Mélange de tout le niveau"}
          </Button>
        </div>
        <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          <InfinityIcon size={16} className="shrink-0 text-emerald-300" />
          Questions générées à chaque partie : valeurs, exemples et pièges changent, et tu ne retombes pas sur une question déjà vue.
        </p>
        <div className="flex items-center justify-end gap-2">
          {chapter.lab && (
            <Link href={`/labo/${chapter.lab}`} className="inline-flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200">
              <FlaskConical size={14} /> Manipuler dans le labo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
