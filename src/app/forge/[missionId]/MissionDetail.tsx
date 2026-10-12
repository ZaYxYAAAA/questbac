"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, Play } from "lucide-react";
import { QuizRunner } from "@/components/game/QuizRunner";
import { RewardScreen } from "@/components/game/RewardScreen";
import { Button, LinkButton } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { Tabs } from "@/components/ui/Tabs";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { prepareQuestions } from "@/lib/game/session";
import type { RewardSummary } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import type { Question } from "@/lib/types";
import { MissionEditor } from "./MissionEditor";

type Tab = "jouer" | "fiche" | "editer";
type Phase = { kind: "menu" } | { kind: "playing"; questions: Question[] } | { kind: "done"; summary: RewardSummary; correct: number; total: number };

export function MissionDetail({ missionId, initialTab }: { missionId: string; initialTab: Tab }) {
  const mission = useGame((s) => s.missions.find((m) => m.id === missionId));
  const recordSession = useGame((s) => s.recordSession);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [phase, setPhase] = useState<Phase>({ kind: "menu" });

  if (!mission) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-5xl">🕳️</p>
        <p className="text-slate-300">Cette mission n&apos;existe pas (ou plus) sur cet appareil.</p>
        <LinkButton href="/forge">Retour à la Forge</LinkButton>
      </div>
    );
  }

  const meta = subjectMeta(mission.subject);

  if (phase.kind === "playing") {
    return (
      <QuizRunner
        questions={phase.questions}
        title={mission.title}
        subtitle="Mission forgée"
        exitHref={`/forge/${mission.id}`}
        onComplete={(result, answerXp) => {
          const summary = recordSession({ kind: "custom", missionId: mission.id, subject: mission.subject, result, answerXp });
          announce(summary, { questsOnly: true });
          setPhase({ kind: "done", summary, correct: result.correct, total: result.total });
        }}
      />
    );
  }

  if (phase.kind === "done") {
    return (
      <RewardScreen
        summary={phase.summary}
        emoji={phase.correct === phase.total ? "🏆" : "⚒️"}
        heading={phase.correct === phase.total ? "Mission maîtrisée !" : "Mission terminée"}
        subheading={`${phase.correct} / ${phase.total} · ${mission.title}`}
        onReplay={() => setPhase({ kind: "playing", questions: prepareQuestions(mission.questions) })}
        backHref={`/forge/${mission.id}`}
        backLabel="Retour à la mission"
      />
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/forge" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft size={16} /> La Forge
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={clsx("grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl", meta.gradient)}>{meta.emoji}</span>
          <div>
            <h1 className="text-2xl font-black text-white">{mission.title}</h1>
            <p className="text-sm text-slate-400">
              {meta.name} · {levelLabel(mission.level)} · {mission.questions.length} questions{mission.demo ? " · mode démo" : ""}
            </p>
          </div>
        </div>
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "jouer", label: "🎮 Jouer" },
            { value: "fiche", label: "📄 Fiche" },
            { value: "editer", label: "✏️ Éditer" },
          ]}
        />
      </div>

      {tab === "jouer" && (
        <div className="mx-auto max-w-xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center">
          <div className="qb-bob text-6xl">⚒️</div>
          {mission.summary && <p className="text-slate-300">{mission.summary}</p>}
          <p className="text-sm text-slate-500">
            {mission.plays ?? 0} partie(s){mission.bestScore !== undefined && ` · record ${Math.round(mission.bestScore * 100)} %`}
          </p>
          {mission.questions.length > 0 ? (
            <Button className="w-full py-3.5 text-base" onClick={() => setPhase({ kind: "playing", questions: prepareQuestions(mission.questions) })}>
              <Play size={18} /> Lancer la mission
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" onClick={() => setTab("editer")}>Ajoute des questions pour jouer</Button>
          )}
        </div>
      )}

      {tab === "fiche" && (
        <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-8">
          {mission.fiche.trim() ? <Markdown>{mission.fiche}</Markdown> : <p className="text-slate-500">Pas encore de fiche : écris-la dans l&apos;onglet « Éditer ».</p>}
          {mission.fiche.trim() && (
            <div className="qb-no-print mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => window.print()}>Imprimer / PDF</Button>
            </div>
          )}
        </article>
      )}

      {tab === "editer" && <MissionEditor mission={mission} onSaved={() => setTab("jouer")} />}
    </div>
  );
}
