"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Flag, RotateCcw, Timer } from "lucide-react";
import { QuestionCard } from "@/components/game/QuestionCard";
import { celebrate } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { MATCH_SIZE, PLACEMENT_MATCHES, type RankedSubject, rankedSubjectMeta } from "@/lib/game/ranked";
import type { GivenAnswer } from "@/lib/game/session";
import { type AnswerReply, type MatchResult, type ServedQuestion, answerRanked, forfeitRanked, nextRanked } from "@/lib/store/ranked-store";
import { useToasts } from "@/lib/store/toast-store";
import { RankedBadge } from "./RankedBadge";

export interface MatchStart extends ServedQuestion {
  id: string;
  subject: RankedSubject;
}

/**
 * Manche classée en plein écran : une question à la fois, envoyée et corrigée
 * par le serveur, chrono visible. Le résultat s'affiche à la fin.
 */
export function RankedMatch({ start, onClose, onReplay }: { start: MatchStart; onClose: () => void; onReplay: (subject: RankedSubject) => void }) {
  const meta = rankedSubjectMeta(start.subject);
  const [served, setServed] = useState<ServedQuestion>(start);
  const [results, setResults] = useState<boolean[]>([]);
  const [score, setScore] = useState(start.score);
  const [reply, setReply] = useState<AnswerReply | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [remaining, setRemaining] = useState(start.seconds - start.elapsedMs / 1000);
  const [busy, setBusy] = useState(false);
  const receivedAt = useRef(Date.now() - start.elapsedMs);
  const answered = useRef(false);

  // Chrono de la question en cours (le serveur garde le sien, celui-ci n'est qu'un affichage).
  useEffect(() => {
    answered.current = false;
    setTimedOut(false);
    const limit = served.seconds * 1000;
    const tick = () => {
      if (answered.current) return;
      const left = limit - (Date.now() - receivedAt.current);
      setRemaining(Math.max(0, left / 1000));
      if (left <= 0) setTimedOut(true);
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [served]);

  const grade = useCallback(
    async (given: GivenAnswer) => {
      answered.current = true;
      try {
        const r = await answerRanked(start.id, served.index, given);
        setReply(r);
        setResults((x) => [...x, r.correct]);
        setScore((s) => s + r.points);
        if (r.result) setResult(r.result);
        return { correct: r.correct, question: r.question };
      } catch (e) {
        answered.current = false;
        useToasts.getState().push({ emoji: "⚠️", title: "Réponse non envoyée", body: e instanceof Error ? e.message : undefined, tone: "rose" });
        throw e;
      }
    },
    [start.id, served.index],
  );
  const onAnswered = useCallback(() => {}, []);

  const next = async () => {
    if (reply?.done) {
      setReply(null);
      if (result && result.score >= 80) celebrate("big");
      return;
    }
    setBusy(true);
    try {
      const n = await nextRanked(start.id);
      receivedAt.current = Date.now() - n.elapsedMs;
      setReply(null);
      setServed(n);
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: "Question suivante indisponible", body: e instanceof Error ? e.message : undefined, tone: "rose" });
    } finally {
      setBusy(false);
    }
  };

  const forfeit = async () => {
    if (!confirm("Abandonner ? La manche comptera quand même, avec les questions restantes fausses.")) return;
    setBusy(true);
    try {
      setResult(await forfeitRanked(start.id));
      setReply(null);
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: e instanceof Error ? e.message : "Erreur", tone: "rose" });
    } finally {
      setBusy(false);
    }
  };

  const showResult = result && !reply;
  const ratio = remaining / served.seconds;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950">
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-30" style={{ background: "radial-gradient(40rem 20rem at 50% -10%, #f59e0b55, transparent 70%)" }} />
      <div className="relative mx-auto max-w-2xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* En-tête : matière, avancement, score */}
        <div className="flex items-center gap-3">
          <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl", meta.gradient)}>{meta.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">⚔️ Manche classée</p>
            <p className="truncate font-black text-white">{meta.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-black text-white">{Math.round(score)}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">points</p>
          </div>
          {!showResult && (
            <button type="button" onClick={forfeit} disabled={busy} aria-label="Abandonner la manche" className="rounded-xl p-2 text-slate-500 hover:bg-rose-600 hover:text-white">
              <Flag size={18} />
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-1">
          {Array.from({ length: start.total || MATCH_SIZE }, (_, i) => (
            <span
              key={i}
              className={clsx(
                "h-1.5 flex-1 rounded-full",
                i < results.length ? (results[i] ? "bg-emerald-400" : "bg-rose-500") : i === served.index && !showResult ? "bg-amber-300" : "bg-slate-800",
              )}
            />
          ))}
        </div>

        {!showResult && (
          <>
            <div className="mt-4 flex items-center gap-2">
              <Timer size={16} className={ratio < 0.25 ? "text-rose-400" : "text-amber-300"} />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={clsx("h-full rounded-full transition-[width] duration-100 ease-linear", ratio < 0.25 ? "bg-rose-500" : ratio < 0.5 ? "bg-amber-400" : "bg-emerald-400")}
                  style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-sm font-bold text-slate-200">{Math.ceil(remaining)} s</span>
            </div>

            <div className="mt-5">
              <QuestionCard
                key={served.index}
                question={served.question}
                number={served.index + 1}
                grade={grade}
                onAnswered={onAnswered}
                onNext={next}
                timedOut={timedOut}
                noCopy
                nextLabel={reply?.done ? "Voir le résultat" : busy ? "…" : "Question suivante"}
              />
              {reply && (
                <p className="mt-2 text-center text-sm font-bold text-amber-200">
                  {reply.timedOut ? "Trop tard : 0 point" : reply.correct ? `+${reply.points.toString().replace(".", ",")} points` : "0 point"}
                </p>
              )}
            </div>
          </>
        )}

        {showResult && <MatchSummary result={result} onClose={onClose} onReplay={() => onReplay(start.subject)} />}
      </div>
    </div>
  );
}

function MatchSummary({ result, onClose, onReplay }: { result: MatchResult; onClose: () => void; onReplay: () => void }) {
  const r = result.rank;
  const good = result.results.filter(Boolean).length;
  return (
    <div className="qb-pop mt-8 space-y-5 text-center">
      <p className="text-6xl">{result.forfeit ? "🏳️" : result.score >= 80 ? "🏆" : result.score >= 50 ? "⚔️" : "💪"}</p>
      <div>
        <p className="font-mono text-6xl font-black text-white">{result.score}<span className="text-2xl text-slate-500">/100</span></p>
        <p className="text-slate-400">{good} bonne{good > 1 ? "s" : ""} réponse{good > 1 ? "s" : ""} sur {result.results.length}{result.forfeit ? ` · ${result.forfeit}` : ""}</p>
      </div>

      <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5 text-left">
        {!r.placed ? (
          <>
            <p className="font-bold text-white">Placement : {PLACEMENT_MATCHES - r.placementLeft}/{PLACEMENT_MATCHES}</p>
            <p className="text-sm text-slate-300">Encore {r.placementLeft} manche{r.placementLeft > 1 ? "s" : ""} pour obtenir ton rang dans cette matière.</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <RankedBadge step={r.step} />
              <span className="text-sm text-slate-300">{r.played} manche{r.played > 1 ? "s" : ""} cette semaine</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Points de la semaine : <b className="text-white">{r.total}</b> (tes {r.best.length} meilleure{r.best.length > 1 ? "s" : ""} manche{r.best.length > 1 ? "s" : ""}) · moyenne <b className="text-white">{r.avg}</b>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {r.played >= PLACEMENT_MATCHES && r.avg >= r.par
                ? `✅ Objectif de ta division atteint (moyenne ≥ ${r.par}) : promotion assurée dimanche soir si ça tient.`
                : `🎯 Objectif de ta division : moyenne ≥ ${r.par} sur au moins ${PLACEMENT_MATCHES} manches, ou finir dans le haut de ton groupe.`}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="gold" className="py-3" onClick={onReplay}><RotateCcw size={16} /> Rejouer</Button>
        <Button variant="secondary" className="py-3" onClick={onClose}>Terminer</Button>
      </div>
    </div>
  );
}
