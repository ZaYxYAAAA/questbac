"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { BookOpen, ChevronLeft, FlaskConical, Infinity as InfinityIcon, Lock, Play, Shuffle } from "lucide-react";
import { QuizRunner } from "@/components/game/QuizRunner";
import { RewardScreen } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { TIER_LABELS, type Tier, chapterQuestions, hasTiers, mixQuestions, tierQuestions } from "@/lib/content/generated";
import { prepareQuestions } from "@/lib/game/session";
import { TIER_PASS, TIER_XP_BONUS, type RewardSummary, tierUnlocked } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";
import { rememberSeen, seenFor } from "@/lib/store/seen-questions";
import { announce } from "@/lib/store/toast-store";
import type { Chapter, Question } from "@/lib/types";

type Phase = { kind: "intro" } | { kind: "playing"; questions: Question[]; label: string; mix?: boolean } | { kind: "done"; summary: RewardSummary; correct: number; total: number };

const TIER_STYLE: Record<Tier, string> = {
  1: "border-emerald-400/60 bg-emerald-500/20 text-emerald-100",
  2: "border-sky-400/60 bg-sky-500/20 text-sky-100",
  3: "border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100",
};

export function MissionPlayer({ chapter, autoMix = false }: { chapter: Chapter; autoMix?: boolean }) {
  const recordSession = useGame((s) => s.recordSession);
  const progress = useGame((s) => s.chapters[chapter.id]);
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [count, setCount] = useState(6);
  const tiered = hasTiers(chapter.id);
  // Par défaut : le plus haut niveau débloqué.
  const [tier, setTier] = useState<Tier>(() => Math.min(3, (progress?.tier ?? 0) + 1) as Tier);
  const meta = subjectMeta(chapter.subject);
  // La Culture générale a sa propre page, hors de la carte des matières.
  const exitHref = meta.extra ? "/culture" : `/matieres/${chapter.subject}?niveau=${chapter.level}`;
  const mixScope = `mix:${chapter.subject}:${chapter.level}`;

  // Questions générées : jamais deux fois le même énoncé tant qu'il en reste de nouveaux.
  const startLocal = () => {
    const scope = tiered ? `${chapter.id}:n${tier}` : chapter.id;
    const drawn = tiered ? tierQuestions(chapter.id, tier, count, Math.random, seenFor(scope)) : chapterQuestions(chapter.id, count, Math.random, seenFor(scope));
    const questions = prepareQuestions(drawn);
    rememberSeen(scope, questions);
    setPhase({ kind: "playing", questions, label: tiered ? `${meta.name} · ${TIER_LABELS[tier]}` : meta.name });
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
        lab={phase.mix ? undefined : chapter.lab}
        subtitle={phase.label}
        exitHref={exitHref}
        onComplete={(result, answerXp) => {
          const summary = recordSession({ kind: "chapter", chapterId: chapter.id, subject: chapter.subject, result, answerXp, ...(tiered && !phase.mix ? { tier } : {}) });
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
        {tiered && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-300">Niveau</p>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as Tier[]).map((t) => {
                const open = tierUnlocked(progress, t);
                const passed = (progress?.tier ?? 0) >= t;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!open}
                    onClick={() => setTier(t)}
                    aria-pressed={tier === t}
                    className={clsx(
                      "qb-press relative flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-2.5 text-center transition",
                      !open ? "cursor-not-allowed border-white/5 bg-slate-900 text-slate-600" : tier === t ? TIER_STYLE[t] : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700",
                    )}
                  >
                    <span className="text-sm tracking-tight">{open ? "★".repeat(t) + "☆".repeat(3 - t) : <Lock size={14} className="inline" />}</span>
                    <span className="text-sm font-black">{TIER_LABELS[t]}</span>
                    <span className="text-[10px] font-semibold opacity-80">{passed ? "✓ réussi" : TIER_XP_BONUS[t] ? `+${TIER_XP_BONUS[t] * 100} % XP` : "pour démarrer"}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {tier === 3 && tierUnlocked(progress, 3) ? "Questions pointues : à toi de prouver que tu es un expert." : `Réussis ${Math.round(TIER_PASS * 100)} % des questions (4 au moins) pour débloquer le niveau suivant.`}
            </p>
          </div>
        )}

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
            <Play size={18} /> Lancer ({count} questions{tiered ? ` · ${TIER_LABELS[tier]}` : ""})
          </Button>
          <Button variant="secondary" onClick={() => startMix()} className="py-3.5">
            <Shuffle size={16} /> {meta.extra ? "Mélange de tous les thèmes" : "Mélange de tout le niveau"}
          </Button>
        </div>
        <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          <InfinityIcon size={16} className="shrink-0 text-emerald-300" />
          Questions générées à chaque partie : valeurs, exemples et pièges changent, et tu ne retombes pas sur une question déjà vue.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={`/fiches/${chapter.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-amber-300 hover:text-amber-200">
            <BookOpen size={14} /> Revoir la fiche avant de jouer
          </Link>
          {chapter.lab && (
            <Link href={`/labo/${chapter.lab}`} className="inline-flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200">
              <FlaskConical size={14} /> Labo (aussi pendant la mission)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
