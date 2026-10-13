"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, ChevronLeft, Gift, Swords, X } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { QuizRunner } from "@/components/game/QuizRunner";
import { celebrate } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { subjectMeta } from "@/lib/content/curriculum";
import { DUEL_REWARDS, DUEL_SECONDS, duelThemeById } from "@/lib/game/duel";
import { useCloud } from "@/lib/store/cloud-sync";
import { type DuelView, claimDuel, fetchDuel, playDuel } from "@/lib/store/duels-store";
import { useGame } from "@/lib/store/game-store";
import { announce, useToasts } from "@/lib/store/toast-store";
import type { Question } from "@/lib/types";

const fmtTime = (ms: number) => `${(ms / 1000).toFixed(1).replace(".", ",")} s`;

export default function DuelPage() {
  const { id } = useParams<{ id: string }>();
  const { user, checked } = useCloud();
  const profile = useGame((s) => s.profile);
  const recordActivity = useGame((s) => s.recordActivity);
  const [duel, setDuel] = useState<DuelView | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchDuel(id)
      .then((r) => {
        setDuel(r.duel);
        setQuestions(r.questions);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Duel introuvable."));
  }, [user, id]);

  if (checked && !user) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-5xl">⚔️</p>
        <p className="text-slate-300">Connecte-toi à ton compte pour jouer ce duel.</p>
        <Link href="/profil?onglet=compte" className="text-violet-300 underline">Aller au profil</Link>
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-5xl">🕳️</p>
        <p className="text-slate-300">{error}</p>
        <Link href="/duels" className="text-violet-300 underline">Retour aux duels</Link>
      </div>
    );
  }
  if (!duel || !profile) return <div className="h-64 animate-pulse rounded-3xl bg-slate-900/60" />;

  if (playing) {
    return (
      <QuizRunner
        questions={questions}
        title={`Duel contre ${duel.opponent.pseudo}`}
        subtitle={duel.chapterTitle}
        secondsPerQuestion={duelThemeById(duel.chapterId) ? DUEL_SECONDS : undefined}
        exitHref={`/duels/${duel.id}`}
        onComplete={async (result) => {
          setBusy(true);
          try {
            const byId = new Map(result.answers.map((a) => [a.questionId, a]));
            const answers = questions.map((q) => byId.get(q.id)?.given ?? "");
            const times = questions.map((q) => byId.get(q.id)?.timeMs ?? 0);
            setDuel(await playDuel(duel.id, answers, times));
          } catch (e) {
            useToasts.getState().push({ emoji: "⚠️", title: "Envoi impossible", body: e instanceof Error ? e.message : undefined, tone: "rose" });
          } finally {
            setPlaying(false);
            setBusy(false);
          }
        }}
      />
    );
  }

  const meta = subjectMeta(duel.subject);
  const claim = async () => {
    setBusy(true);
    try {
      const { outcome, duel: next } = await claimDuel(duel.id);
      setDuel(next);
      announce(recordActivity({ kind: "duel", outcome }));
      if (outcome === "win") celebrate("big");
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: e instanceof Error ? e.message : "Erreur", tone: "rose" });
    } finally {
      setBusy(false);
    }
  };

  const side = (name: string, avatar: string, photo: string | undefined, play: DuelView["mine"], hidden: boolean) => (
    <div className="flex-1 rounded-2xl bg-slate-950/50 p-4 text-center">
      <Avatar emoji={avatar} photo={photo} name={name} size="lg" className="mx-auto" />
      <p className="mt-2 truncate font-bold text-white">{name}</p>
      {play ? (
        <>
          <p className="text-3xl font-black text-white">{play.correct}<span className="text-base text-slate-500">/{play.results.length}</span></p>
          <p className="text-xs text-slate-400">{fmtTime(play.timeMs)}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">{hidden ? "A joué 🤫" : "Pas encore joué"}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/duels" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ChevronLeft size={16} /> Duels</Link>

      <div className={clsx("rounded-3xl bg-gradient-to-br p-5", meta.gradient)}>
        <p className="text-sm font-semibold text-white/80">
          {duelThemeById(duel.chapterId) ? `⚡ Duel éclair · ${questions.length || "…"} questions · ${DUEL_SECONDS} s chacune` : `${meta.emoji} ${meta.name} · ${questions.length || "…"} questions`}
        </p>
        <h1 className="text-2xl font-black text-white">{duel.chapterTitle}</h1>
        <div className="mt-4 flex items-stretch gap-3">
          {side(profile.pseudo, profile.avatar, profile.photoThumb ?? profile.photo, duel.mine, false)}
          <div className="grid place-items-center text-2xl font-black text-white">VS</div>
          {side(duel.opponent.pseudo, duel.opponent.avatar, duel.opponent.photoThumb, duel.theirs, duel.opponentPlayed && !duel.theirs)}
        </div>
      </div>

      {duel.status === "your_turn" && (
        <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5 text-center">
          <p className="text-slate-300">
            {duel.opponentPlayed ? `${duel.opponent.pseudo} a déjà joué : à toi de faire mieux !` : `${duel.opponent.pseudo} n'a pas encore joué.`} Plus de bonnes réponses gagne ; à égalité, le plus rapide. Réponds de tête, le chrono tourne !
          </p>
          <Button className="w-full py-3.5 text-base" disabled={busy || questions.length === 0} onClick={() => setPlaying(true)}><Swords size={18} /> Jouer mon tour</Button>
        </div>
      )}
      {duel.status === "waiting" && (
        <p className="rounded-2xl bg-slate-900/70 p-4 text-center text-slate-300">En attente de {duel.opponent.pseudo}… Tu seras prévenu à ta prochaine visite.</p>
      )}
      {duel.status === "expired" && !duel.outcome && <p className="rounded-2xl bg-slate-900/70 p-4 text-center text-slate-400">Ce duel a expiré.</p>}

      {duel.outcome && (
        <div className={clsx("space-y-3 rounded-3xl p-5 text-center", duel.outcome === "win" ? "bg-emerald-500/15" : duel.outcome === "draw" ? "bg-amber-500/15" : "bg-rose-500/15")}>
          <p className="text-4xl">{duel.outcome === "win" ? "🏆" : duel.outcome === "draw" ? "🤝" : "💪"}</p>
          <p className="text-2xl font-black text-white">
            {duel.outcome === "win" ? (duel.status === "expired" ? "Victoire par forfait !" : "Victoire !") : duel.outcome === "draw" ? "Égalité parfaite" : "Défaite… revanche ?"}
          </p>
          {!duel.rewarded ? (
            <Button variant="gold" disabled={busy} onClick={claim}>
              <Gift size={16} /> Récupérer +{DUEL_REWARDS[duel.outcome].xp} XP{DUEL_REWARDS[duel.outcome].rp ? ` et +${DUEL_REWARDS[duel.outcome].rp} RP` : ""}
            </Button>
          ) : (
            <p className="text-sm text-slate-400">Récompense récupérée.</p>
          )}
          <Link href={`/duels?ami=${duel.opponent.id}`} className="block text-sm text-violet-300 underline">Lancer une revanche</Link>
        </div>
      )}

      {duel.mine && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Question par question</h2>
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <div className="mb-1 flex items-center gap-3 text-xs">
                <span className="font-bold text-slate-400">Q{i + 1}</span>
                <span className={clsx("flex items-center gap-1", duel.mine!.results[i] ? "text-emerald-300" : "text-rose-300")}>
                  {duel.mine!.results[i] ? <Check size={14} /> : <X size={14} />} Toi
                </span>
                {duel.theirs && (
                  <span className={clsx("flex items-center gap-1", duel.theirs.results[i] ? "text-emerald-300" : "text-rose-300")}>
                    {duel.theirs.results[i] ? <Check size={14} /> : <X size={14} />} {duel.opponent.pseudo}
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-200"><Markdown compact>{q.prompt}</Markdown></div>
              <div className="mt-1 text-xs text-slate-400"><Markdown compact>{q.explanation}</Markdown></div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
