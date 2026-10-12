"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, FlaskConical, Loader2, Play, Sparkles } from "lucide-react";
import { AiBadge } from "@/components/game/AiBadge";
import { QuizRunner } from "@/components/game/QuizRunner";
import { RewardScreen } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { generateMission } from "@/lib/ai/client-api";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { questionsForChapter } from "@/lib/content/questions";
import { prepareQuestions } from "@/lib/game/session";
import type { RewardSummary } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import type { Chapter, Question } from "@/lib/types";

type Phase = { kind: "intro" } | { kind: "playing"; questions: Question[]; ai: boolean } | { kind: "done"; summary: RewardSummary; correct: number; total: number };

export function MissionPlayer({ chapter }: { chapter: Chapter }) {
  const recordSession = useGame((s) => s.recordSession);
  const progress = useGame((s) => s.chapters[chapter.id]);
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const local = questionsForChapter(chapter.id);
  const meta = subjectMeta(chapter.subject);
  const exitHref = `/matieres/${chapter.subject}?niveau=${chapter.level}`;

  const startLocal = () => setPhase({ kind: "playing", questions: prepareQuestions(local, Math.min(count, local.length)), ai: false });

  const startAi = async () => {
    setLoading(true);
    setError(null);
    try {
      const mission = await generateMission({
        level: chapter.level,
        subject: chapter.subject,
        mode: "sujet",
        topic: `${chapter.title} — ${chapter.summary}`,
        count,
        difficulty: "mixte",
      });
      setPhase({ kind: "playing", questions: prepareQuestions(mission.questions), ai: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de générer la mission.");
    } finally {
      setLoading(false);
    }
  };

  if (phase.kind === "playing") {
    return (
      <QuizRunner
        questions={phase.questions}
        title={chapter.title}
        subtitle={phase.ai ? "Mission IA" : meta.name}
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
        backLabel="Retour à la carte"
      >
        {ratio < 1 && (
          <Link href={`/prof?niveau=${chapter.level}&matiere=${chapter.subject}&sujet=${encodeURIComponent(chapter.title)}`} className="block rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-200 hover:bg-cyan-500/15">
            🎓 Revois les points faibles avec une fiche du Prof IA sur « {chapter.title} »
          </Link>
        )}
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
          <p className="mt-3 text-sm font-semibold text-white/80">{meta.name} · {levelLabel(chapter.level)}</p>
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
          <Button onClick={startLocal} disabled={local.length === 0} className="py-3">
            <Play size={16} /> {local.length ? `Lancer (${Math.min(count, local.length)} questions)` : "Pas de questions locales"}
          </Button>
          <Button variant="secondary" onClick={startAi} disabled={loading} className="py-3">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Le Prof IA prépare tes questions…" : "Nouvelles questions IA"}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <AiBadge />
          {chapter.lab && (
            <Link href={`/labo/${chapter.lab}`} className="inline-flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200">
              <FlaskConical size={14} /> Manipuler dans le labo
            </Link>
          )}
        </div>
        {error && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
      </div>
    </div>
  );
}
