"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Check, Clock, Lightbulb, LogOut, RotateCcw, X } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { Calculator } from "@/components/game/Calculator";
import { RankEmblem } from "@/components/game/RankEmblem";
import { celebrate, useCountUp } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { chapterById, subjectMeta } from "@/lib/content/curriculum";
import { rankFromRp } from "@/lib/game/progression";
import type { GivenAnswer } from "@/lib/game/session";
import { useGame } from "@/lib/store/game-store";
import { type MatchView, cancelQueue, fetchMatch, joinQueue, loadRanked, pollQueue, reportAway, sendAnswer, voteChapter } from "@/lib/store/match-store";
import { useToasts } from "@/lib/store/toast-store";
import type { Question, SubjectId } from "@/lib/types";

type Player = MatchView["players"][number];

/**
 * Partie classée en direct, plein écran : recherche (3 s puis bots), vote du
 * chapitre, 10 questions en même temps pour les 3 joueurs, résultats.
 * Le serveur mène la partie ; l'écran l'interroge chaque seconde.
 */
export function LiveMatch({
  subject,
  matchId: resumeId,
  onClose,
  onReplay,
}: {
  subject: SubjectId;
  /** Reprendre une partie déjà lancée. */
  matchId?: string | null;
  onClose: () => void;
  onReplay: (subject: SubjectId) => void;
}) {
  const [matchId, setMatchId] = useState<string | null>(resumeId ?? null);
  const [view, setView] = useState<MatchView | null>(null);
  const [searchStart] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  /** Mes résultats question par question (bande de progression). */
  const [results, setResults] = useState<(boolean | null)[]>([]);
  /** Places gagnées (+) ou perdues (−) à la dernière question. */
  const [moves, setMoves] = useState<Record<string, number>>({});
  const places = useRef<{ index: number; byId: Record<string, number> } | null>(null);
  const offset = useRef(0);
  const ticket = useRef<string | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  /** Aller-retour le plus court mesuré : c'est lui qui donne le décalage d'horloge le plus fiable. */
  const bestRtt = useRef(Infinity);
  /** Heure d'envoi de la dernière vue affichée : une réponse plus ancienne arrivée en retard est ignorée. */
  const lastSent = useRef(0);

  const receive = useCallback((v: MatchView, sentAt: number) => {
    const rtt = Date.now() - sentAt;
    if (rtt <= bestRtt.current * 1.5) {
      // Décalage d'horloge avec le serveur (milieu de l'aller-retour).
      offset.current = v.serverNow - (sentAt + Date.now()) / 2;
      bestRtt.current = Math.min(bestRtt.current, rtt);
    }
    if (sentAt < lastSent.current) return;
    lastSent.current = sentAt;
    setView(v);
  }, []);

  // Horloge locale (alignée sur le serveur) pour les chronos.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);
  const serverNow = now + offset.current;

  // ── Recherche ──
  useEffect(() => {
    if (resumeId) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const fail = (e: unknown) => {
      useToasts.getState().push({ emoji: "⚠️", title: "Recherche impossible", body: e instanceof Error ? e.message : undefined, tone: "rose" });
      closeRef.current();
    };
    const poll = async () => {
      if (stop || !ticket.current) return;
      try {
        const r = await pollQueue(ticket.current);
        if (stop) return;
        if (r.matchId) {
          ticket.current = null;
          setMatchId(r.matchId);
        } else timer = setTimeout(poll, 500);
      } catch (e) {
        if (!stop) fail(e);
      }
    };
    joinQueue(subject)
      .then((r) => {
        if (stop) {
          if (r.ticket) void cancelQueue(r.ticket);
          return;
        }
        if (r.matchId) setMatchId(r.matchId);
        else if (r.ticket) {
          ticket.current = r.ticket;
          timer = setTimeout(poll, 500);
        }
      })
      .catch((e) => !stop && fail(e));
    return () => {
      stop = true;
      clearTimeout(timer);
      if (ticket.current) void cancelQueue(ticket.current);
    };
  }, [subject, resumeId]);

  // ── Suivi de la partie : chaque seconde, et pile aux changements de phase ──
  const viewRef = useRef(view);
  viewRef.current = view;
  useEffect(() => {
    if (!matchId) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      const sentAt = Date.now();
      try {
        const v = await fetchMatch(matchId);
        if (stop) return;
        receive(v, sentAt);
        if (v.phase === "done") return;
      } catch {
        // Réseau coupé : on réessaie.
      }
      if (stop) return;
      const v = viewRef.current;
      const t = Date.now() + offset.current;
      const boundary = [v?.phase === "vote" ? v.voteEndsAt : null, v?.endsAt, v?.nextAt, v?.startsAt].filter((x): x is number => typeof x === "number" && x > t);
      const soonest = boundary.length ? Math.min(...boundary) - t + 120 : Infinity;
      timer = setTimeout(loop, Math.max(250, Math.min(1000, soonest)));
    };
    void loop();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [matchId, receive]);

  // ── Anti-triche : quitter l'appli pendant une question la fait compter fausse ──
  useEffect(() => {
    if (!matchId) return;
    const leave = () => {
      if (document.visibilityState === "hidden" && viewRef.current?.phase !== "done") reportAway(matchId);
    };
    document.addEventListener("visibilitychange", leave);
    window.addEventListener("pagehide", leave);
    return () => {
      document.removeEventListener("visibilitychange", leave);
      window.removeEventListener("pagehide", leave);
    };
  }, [matchId]);

  // ── Mes résultats et mouvements au classement, question après question ──
  useEffect(() => {
    if (!view || view.index < 0) return;
    const me = view.players.find((p) => p.isMe);
    const known = view.mine ? view.mine.correct : view.away ? false : (view.phase === "reveal" || view.phase === "done") && me?.last ? me.last.correct : undefined;
    if (known !== undefined) {
      setResults((r) => {
        if (r[view.index] === known) return r;
        const next = [...r];
        next[view.index] = known;
        return next;
      });
    }
  }, [view]);
  useEffect(() => {
    if (!view || view.phase !== "reveal") return;
    const byId = Object.fromEntries(view.players.map((p) => [p.id, p.place]));
    const prev = places.current;
    if (prev?.index === view.index) return;
    setMoves(prev && prev.index === view.index - 1 ? Object.fromEntries(view.players.map((p) => [p.id, (prev.byId[p.id] ?? p.place) - p.place])) : {});
    places.current = { index: view.index, byId };
  }, [view]);

  // ── Fin : XP de la partie (une seule fois) et rang à jour ──
  useEffect(() => {
    if (view?.phase !== "done") return;
    const me = view.players.find((p) => p.isMe);
    if (!me) return;
    const key = `qb-match-done:${view.id}`;
    let already = false;
    try {
      already = localStorage.getItem(key) === "1";
      localStorage.setItem(key, "1");
    } catch {
      // Stockage indisponible : l'XP sera quand même comptée une fois pour cet écran.
    }
    if (!already) {
      useGame.getState().recordActivity({ kind: "ranked", place: me.place, correct: me.score });
      if (me.place === 1) void celebrate("big");
    }
    void loadRanked();
  }, [view?.phase, view?.id]);

  const meta = subjectMeta((view?.subject as SubjectId) ?? subject);
  const quit = () => {
    if (view && view.phase !== "done" && !window.confirm("Quitter la partie ? Les questions restantes compteront fausses.")) return;
    onClose();
  };
  const inGame = view && (view.phase === "question" || view.phase === "reveal");
  const screenKey = !view ? "search" : `${view.phase}-${view.phase === "question" || view.phase === "reveal" ? view.index : ""}`;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-950">
      <div className={clsx("pointer-events-none fixed inset-x-0 top-0 h-80 bg-gradient-to-br opacity-30 transition-opacity duration-700 [mask-image:linear-gradient(to_bottom,black,transparent)]", meta.gradient)} />
      <div className="relative mx-auto flex min-h-full max-w-xl flex-col gap-4 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lg">{meta.emoji}</span>
            <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">
              {meta.name} <span className="font-medium text-slate-400">· classé</span>
            </p>
            {inGame && (
              <span key={view.index} className="qb-pop rounded-full bg-white/10 px-2.5 py-1 text-xs font-black tabular-nums text-white">
                {view.index + 1}/{view.total}
              </span>
            )}
            <button type="button" onClick={quit} aria-label="Quitter" className="qb-press grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white">
              {view?.phase === "done" ? <X size={18} /> : <LogOut size={16} />}
            </button>
          </div>
          {inGame && <ProgressStrip total={view.total} current={view.index} results={results} />}
        </header>

        <div key={screenKey} className="qb-fade-up flex flex-1 flex-col gap-4">
          {!view ? (
            <Searching found={!!matchId} startedAt={searchStart} now={now} />
          ) : view.phase === "vote" ? (
            <Vote
              view={view}
              now={serverNow}
              onVote={async (c) => {
                const sentAt = Date.now();
                try {
                  receive(await voteChapter(view.id, c), sentAt);
                } catch {
                  // Le prochain rafraîchissement montrera l'état réel.
                }
              }}
            />
          ) : view.phase === "intro" ? (
            <Intro view={view} now={serverNow} />
          ) : view.phase === "question" ? (
            <Ask view={view} now={serverNow} onAnswered={(v, sentAt) => receive(v, sentAt)} />
          ) : view.phase === "reveal" ? (
            <Reveal view={view} now={serverNow} moves={moves} />
          ) : (
            <Results view={view} onClose={onClose} onReplay={() => onReplay(view.subject as SubjectId)} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Écrans ───────────────────────────

function Searching({ found, startedAt, now }: { found: boolean; startedAt: number; now: number }) {
  const profile = useGame((s) => s.profile);
  const rp = useGame((s) => s.rp);
  const secs = Math.floor((now - startedAt) / 1000);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
      <div className="relative grid h-40 w-40 place-items-center">
        {!found && [0, 1, 2].map((i) => <span key={i} className="qb-radar absolute inset-8 rounded-full border-2 border-amber-300/50" style={{ animationDelay: `${i * 0.73}s` }} />)}
        {found && <span className="qb-pop absolute inset-4 rounded-full bg-emerald-400/15 ring-2 ring-emerald-400/50" />}
        {profile && <Avatar emoji={profile.avatar} photo={profile.photoThumb} rp={rp} size="xl" />}
      </div>
      <div className="flex items-center gap-3">
        {[0, 1].map((i) => (
          <span
            key={`${i}-${found}`}
            className={clsx(
              "grid h-12 w-12 place-items-center rounded-full border-2 text-xl font-black",
              found ? "qb-drop border-emerald-400 bg-emerald-400/15 text-emerald-300" : "border-dashed border-white/20 text-slate-500",
            )}
            style={found ? { animationDelay: `${i * 0.12}s` } : undefined}
          >
            {found ? "✓" : <span className="animate-pulse">?</span>}
          </span>
        ))}
      </div>
      <div>
        <p className="text-2xl font-black text-white">{found ? "Partie trouvée !" : "Recherche de joueurs…"}</p>
        <p className="mt-1 text-sm text-slate-400">
          {found ? "Préparation de la partie" : secs < 3 ? `${secs + 1} s` : "Des joueurs de ton niveau complètent la partie"}
        </p>
      </div>
      <p className="max-w-xs text-xs text-slate-500">3 joueurs, 10 questions en même temps. Les bonnes réponses comptent d&apos;abord, la vitesse départage.</p>
    </div>
  );
}

function Vote({ view, now, onVote }: { view: MatchView; now: number; onVote: (chapter: string) => void }) {
  const voted = view.players.filter((p) => p.voted).length;
  return (
    <>
      <PlayersRow players={view.players} mode="vote" />
      <div className="text-center">
        <p className="text-2xl font-black text-white">Choisis le chapitre</p>
        <p className="mt-1 flex items-center justify-center gap-2 text-sm text-slate-400">
          La majorité l&apos;emporte
          <span className="flex gap-1">
            {view.players.map((p, i) => (
              <span key={p.id} className={clsx("h-2 w-2 rounded-full transition-colors duration-300", i < voted ? "bg-amber-300" : "bg-slate-700")} />
            ))}
          </span>
        </p>
      </div>
      <TimeBar startsAt={view.voteEndsAt - 10_000} endsAt={view.voteEndsAt} now={now} />
      <div className="qb-stagger grid gap-3">
        {view.chapters.map((id) => {
          const c = chapterById(id);
          const mine = view.myVote === id;
          return (
            <button
              key={id}
              type="button"
              disabled={!!view.myVote}
              onClick={() => onVote(id)}
              className={clsx(
                "qb-press relative overflow-hidden rounded-2xl border-2 p-4 text-left",
                mine ? "qb-glow-pulse border-amber-400 bg-amber-400/15" : view.myVote ? "scale-[0.98] border-white/5 bg-slate-900/60 opacity-50" : "border-white/10 bg-slate-900/80 hover:-translate-y-0.5 hover:border-amber-300",
              )}
            >
              <p className="font-black text-white">{c?.title ?? id}</p>
              {c?.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{c.summary}</p>}
              {mine && <p className="qb-pop mt-2 text-xs font-bold text-amber-300">✓ Ton vote</p>}
            </button>
          );
        })}
      </div>
      {view.myVote && <p className="qb-fade-up text-center text-sm text-slate-400">En attente des autres joueurs…</p>}
    </>
  );
}

function Intro({ view, now }: { view: MatchView; now: number }) {
  const left = view.startsAt ? Math.max(0, Math.ceil((view.startsAt - now) / 1000)) : 0;
  const c = view.chapterId ? chapterById(view.chapterId) : null;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center">
      <PlayersRow players={view.players} mode="vote" />
      <div className="qb-drop">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Chapitre choisi</p>
        <p className="mt-1 text-2xl font-black text-white">{c?.title ?? "…"}</p>
      </div>
      <div className="grid h-32 place-items-center">
        <p key={left} className="qb-count bg-gradient-to-b from-white to-amber-200 bg-clip-text text-8xl font-black text-transparent">{left || "Go !"}</p>
      </div>
      <p className="max-w-xs text-xs text-slate-400">⚠️ Reste dans l&apos;appli : si tu la quittes pendant une question, elle compte fausse. La calculatrice, si besoin, est intégrée.</p>
    </div>
  );
}

function Ask({ view, now, onAnswered }: { view: MatchView; now: number; onAnswered: (v: MatchView, sentAt: number) => void }) {
  const [sending, setSending] = useState<GivenAnswer | null>(null);
  /** Réponse confirmée par le serveur (gardée même si une vue en retard ne l'a pas encore). */
  const [confirmed, setConfirmed] = useState<{ answer: NonNullable<MatchView["mine"]>; question: Question } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [numeric, setNumeric] = useState("");
  const mine = view.mine ?? confirmed?.answer ?? null;
  const q = view.mine ? view.question! : confirmed?.question ?? view.question!;
  const left = view.endsAt ? Math.max(0, view.endsAt - now) : 0;
  const locked = !!mine || sending !== null || view.away || left === 0;

  const submit = async (given: GivenAnswer) => {
    if (locked) return;
    setSending(given);
    setProblem(null);
    // Réseau capricieux : on renvoie la réponse (le serveur ne garde que la première).
    for (let attempt = 0; attempt < 4; attempt++) {
      const sentAt = Date.now();
      try {
        const r = await sendAnswer(view.id, view.index, given);
        if (r.status === "ok" && r.question && r.correct !== undefined) {
          setConfirmed({ answer: { given, correct: r.correct, ms: r.view.mine?.ms ?? Math.max(0, sentAt - (view.startsAt ?? sentAt)) }, question: r.question });
        }
        onAnswered(r.view, sentAt);
        if (r.status === "ok" || r.status === "already") return;
        setSending(null);
        setProblem(r.status === "late" ? "Trop tard : le temps était écoulé." : r.status === "away" ? "Question perdue : tu as quitté l'appli." : "Cette question est terminée.");
        return;
      } catch {
        await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
      }
    }
    setSending(null);
    setProblem("Connexion perdue : ta réponse n'est pas partie. Réessaie !");
  };

  const given = mine?.given ?? sending;
  const choice = (isAnswer: boolean, isGiven: boolean) =>
    clsx(
      "qb-press flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-base",
      !mine && !isGiven && "border-white/10 bg-slate-800/70 hover:border-violet-400 hover:bg-slate-800",
      !mine && isGiven && "animate-pulse border-violet-400 bg-violet-600/20",
      mine && isAnswer && "qb-correct border-emerald-400 bg-emerald-500/15",
      mine && isGiven && !isAnswer && "qb-shake border-rose-400 bg-rose-500/15",
      mine && !isAnswer && !isGiven && "border-white/5 bg-slate-800/40 opacity-50",
    );

  return (
    <>
      <PlayersRow players={view.players} mode="question" />
      {view.startsAt && view.endsAt && <TimeBar startsAt={view.startsAt} endsAt={view.endsAt} now={now} />}
      <div className="select-none text-lg leading-relaxed text-white [-webkit-touch-callout:none] sm:text-xl" onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
        <Markdown>{q.prompt}</Markdown>
      </div>
      {q.calc && !mine && (
        <div>
          <Calculator onUse={q.type === "numeric" ? (v) => setNumeric(v) : undefined} />
        </div>
      )}

      {q.type === "mcq" && (
        <div className="qb-stagger grid gap-2.5">
          {q.choices.map((c, i) => (
            <button key={i} type="button" disabled={locked} onClick={() => submit(i)} className={choice(i === q.answer, given === i)}>
              <span className={clsx("grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black transition-colors", mine && i === q.answer ? "bg-emerald-500 text-slate-950" : mine && given === i ? "bg-rose-500 text-white" : "bg-slate-950/60 text-slate-300")}>
                {"ABCD"[i]}
              </span>
              <span className="min-w-0 flex-1 select-none text-slate-100"><Markdown compact>{c}</Markdown></span>
              {mine && i === q.answer && <Check className="qb-pop shrink-0 text-emerald-400" size={20} />}
              {mine && given === i && i !== q.answer && <X className="qb-pop shrink-0 text-rose-400" size={20} />}
            </button>
          ))}
        </div>
      )}
      {q.type === "truefalse" && (
        <div className="qb-stagger grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" disabled={locked} onClick={() => submit(v)} className={clsx(choice(v === q.answer, given === v), "min-h-20 justify-center text-lg font-bold")}>
              {v ? "✅ Vrai" : "❌ Faux"}
            </button>
          ))}
        </div>
      )}
      {q.type === "numeric" && (
        <form
          className="qb-fade-up flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (numeric.trim()) void submit(numeric.trim());
          }}
        >
          <div className="relative flex-1">
            <input
              autoFocus
              value={mine ? String(mine.given) : numeric}
              disabled={locked}
              onChange={(e) => setNumeric(e.target.value)}
              inputMode="decimal"
              placeholder="Ta réponse…"
              className={clsx(
                "w-full rounded-xl border-2 bg-slate-950 px-4 py-3 font-mono text-lg text-white outline-none transition-colors",
                mine ? (mine.correct ? "border-emerald-400" : "qb-shake border-rose-400") : "border-white/15 focus:border-violet-400",
              )}
            />
            {q.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{q.unit}</span>}
          </div>
          {!mine && (
            <button type="submit" disabled={locked} className="qb-press rounded-xl bg-violet-600 px-5 font-semibold text-white disabled:opacity-60">
              {sending !== null ? "…" : "OK"}
            </button>
          )}
        </form>
      )}

      {mine ? (
        <p className={clsx("qb-pop flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl p-3 text-sm font-bold", mine.correct ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300")}>
          {mine.correct ? <Check size={18} /> : <X size={18} />}
          {mine.correct ? `Juste en ${(mine.ms / 1000).toFixed(1)} s` : "Raté"}
          {q.type === "numeric" && !mine.correct && <span className="font-medium text-slate-300">· attendu {answerText(q)}</span>}
          <span className="font-medium text-slate-400">· on attend les autres</span>
        </p>
      ) : problem ? (
        <p className="qb-pop rounded-2xl bg-amber-500/15 p-3 text-center text-sm font-bold text-amber-200">⚠️ {problem}</p>
      ) : sending !== null ? (
        <p className="flex items-center justify-center gap-2 p-3 text-sm font-semibold text-slate-400"><span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-white" /> Envoi de ta réponse…</p>
      ) : view.away ? (
        <p className="qb-pop rounded-2xl bg-rose-500/15 p-3 text-center text-sm font-bold text-rose-300">🚪 Tu as quitté l&apos;appli : question perdue</p>
      ) : left === 0 ? (
        <p className="qb-pop flex items-center justify-center gap-2 rounded-2xl bg-rose-500/15 p-3 text-sm font-bold text-rose-300"><Clock size={16} /> Temps écoulé</p>
      ) : null}
    </>
  );
}

function Reveal({ view, now, moves }: { view: MatchView; now: number; moves: Record<string, number> }) {
  const q = view.question;
  const next = view.nextAt ? Math.max(0, Math.ceil((view.nextAt - now) / 1000)) : 0;
  const ranked = [...view.players].sort((a, b) => a.place - b.place);
  const me = view.players.find((p) => p.isMe);
  return (
    <>
      {q && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
          <div className="text-sm text-slate-400"><Markdown compact>{q.prompt}</Markdown></div>
          <p className="qb-pop flex items-baseline gap-2 font-bold text-emerald-300">
            <Check size={18} className="shrink-0 self-center" /> <span className="min-w-0"><Markdown compact>{answerText(q)}</Markdown></span>
          </p>
          {q.explanation && (
            <div className="flex gap-2 rounded-xl bg-slate-950/50 p-2.5 text-sm text-slate-300">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-300" />
              <div className="min-w-0"><Markdown compact>{q.explanation}</Markdown></div>
            </div>
          )}
        </div>
      )}
      <div className="qb-stagger space-y-2">
        {ranked.map((p) => {
          const move = moves[p.id] ?? 0;
          return (
            <div key={p.id} className={clsx("flex items-center gap-3 rounded-2xl border px-3 py-2.5", p.isMe ? "border-violet-400/40 bg-violet-500/10" : "border-white/10 bg-slate-900/70")}>
              <span className="flex w-6 flex-col items-center leading-none">
                <span className="font-black text-white">{p.place}</span>
                {move !== 0 && <span className={clsx("qb-pop text-[10px] font-black", move > 0 ? "text-emerald-400" : "text-rose-400")}>{move > 0 ? "▲" : "▼"}</span>}
              </span>
              <Avatar emoji={p.avatar} photo={p.photoThumb} rp={p.rp} size="sm" name={p.pseudo} />
              <Name p={p} />
              <span className={clsx("qb-pop shrink-0 rounded-lg px-2 py-1 text-xs font-bold", p.last?.correct ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/10 text-rose-300")}>
                {p.last?.ms == null ? "⏱ —" : `${p.last.correct ? "✓" : "✗"} ${(p.last.ms / 1000).toFixed(1)} s`}
              </span>
              <span key={p.score} className={clsx("w-8 text-right text-lg font-black text-white", p.last?.correct && "qb-bump")}>{p.score}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 pt-1 text-sm text-slate-400">
        {me && me.place === 1 && <span className="text-amber-300">Tu mènes ! ·</span>}
        {view.index + 1 >= view.total ? "Résultats" : "Question suivante"} dans <span key={next} className="qb-bump font-black tabular-nums text-white">{next}</span> s
      </div>
    </>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"];
/** Ordre du podium à l'écran : 2e, 1er, 3e. */
const PODIUM = [
  { place: 2, height: "h-20", delay: 0.25, color: "from-slate-300/30 to-slate-500/10" },
  { place: 1, height: "h-28", delay: 0.45, color: "from-amber-300/40 to-amber-600/10" },
  { place: 3, height: "h-14", delay: 0.1, color: "from-orange-400/30 to-orange-700/10" },
];

function Results({ view, onClose, onReplay }: { view: MatchView; onClose: () => void; onReplay: () => void }) {
  const me = view.players.find((p) => p.isMe)!;
  const delta = me.delta ?? 0;
  const before = rankFromRp(me.rp);
  const after = rankFromRp(Math.max(0, me.rp + delta));
  const promoted = after.label !== before.label && delta > 0;
  const rp = useCountUp(delta, 1100);
  const xp = useCountUp(me.xp ?? 0, 1100);
  // La barre de rang part de l'ancienne valeur puis glisse vers la nouvelle.
  const [bar, setBar] = useState(promoted ? 0 : before.progress);
  useEffect(() => {
    const id = setTimeout(() => setBar(after.progress), 600);
    return () => clearTimeout(id);
  }, [after.progress]);

  return (
    <div className="space-y-5">
      <div className="space-y-1 pt-1 text-center">
        <p className="qb-drop text-6xl">{MEDALS[me.place - 1]}</p>
        <p className="qb-fade-up text-3xl font-black text-white" style={{ animationDelay: "0.15s" }}>{me.place === 1 ? "Victoire !" : me.place === 2 ? "2e place" : "3e place"}</p>
        <p className="text-sm text-slate-400">{me.score}/{view.total} bonnes réponses · {(me.totalMs / 1000).toFixed(1)} s</p>
      </div>

      <div className="grid grid-cols-3 items-end gap-2">
        {PODIUM.map(({ place, height, delay, color }) => {
          const p = view.players.find((x) => x.place === place);
          if (!p) return <span key={place} />;
          return (
            <div key={place} className="flex flex-col items-center gap-1.5 text-center">
              <div className="qb-drop" style={{ animationDelay: `${delay + 0.35}s` }}>
                <Avatar emoji={p.avatar} photo={p.photoThumb} rp={p.rp} size={place === 1 ? "lg" : "md"} name={p.pseudo} />
              </div>
              <p className={clsx("max-w-full truncate text-xs font-bold", p.isMe ? "text-violet-200" : "text-white")}>{p.isMe ? "Toi" : p.pseudo}</p>
              <p className="text-[11px] text-slate-400">{p.score}/{view.total} · {(p.totalMs / 1000).toFixed(0)} s</p>
              <div className={clsx("qb-rise flex w-full flex-col items-center justify-start rounded-t-2xl border border-b-0 border-white/10 bg-gradient-to-b pt-2", height, color)} style={{ animationDelay: `${delay}s` }}>
                <span className="text-2xl">{MEDALS[place - 1]}</span>
                <span className={clsx("text-xs font-black", (p.delta ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300")}>{(p.delta ?? 0) >= 0 ? "+" : ""}{p.delta ?? 0}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={clsx("qb-pop rounded-2xl border p-3 text-center", delta >= 0 ? "border-emerald-400/30 bg-emerald-500/10" : "border-rose-400/30 bg-rose-500/10")} style={{ animationDelay: "0.5s" }}>
          <p className={clsx("text-3xl font-black tabular-nums", delta >= 0 ? "text-emerald-300" : "text-rose-300")}>{rp >= 0 ? "+" : ""}{rp}</p>
          <p className="text-xs text-slate-400">points de rang</p>
        </div>
        <div className="qb-pop rounded-2xl border border-violet-400/30 bg-violet-500/10 p-3 text-center" style={{ animationDelay: "0.6s" }}>
          <p className="text-3xl font-black tabular-nums text-violet-200">+{xp}</p>
          <p className="text-xs text-slate-400">XP</p>
        </div>
      </div>

      <div className={clsx("qb-fade-up flex items-center gap-3 rounded-2xl border p-3", promoted ? "qb-glow-pulse border-amber-300/50 bg-amber-400/10" : "border-white/10 bg-slate-900/80")} style={{ animationDelay: "0.7s" }}>
        <RankEmblem tierId={after.tier.id} division={after.division} size="sm" className={promoted ? "qb-emblem" : undefined} />
        <div className="min-w-0 flex-1">
          <p className="font-black text-white">{promoted ? `⬆️ Promu ${after.label} !` : after.label}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-1000 [transition-timing-function:var(--qb-ease)]" style={{ width: `${Math.round(bar * 100)}%` }} />
          </div>
          {after.nextLabel && <p className="mt-1 text-xs text-slate-500">{after.rpToNext} pts avant {after.nextLabel}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Retour</Button>
        <Button variant="gold" className="flex-1 py-3" onClick={onReplay}><RotateCcw size={16} /> Rejouer</Button>
      </div>
    </div>
  );
}

// ─────────────────────────── Morceaux ───────────────────────────

function Name({ p }: { p: Player }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-1.5">
        <span className="truncate font-bold text-white">{p.pseudo}</span>
        {p.isMe && <span className="text-[10px] font-bold text-violet-300">toi</span>}
        {p.bot && <span className="rounded bg-slate-700/80 px-1 text-[10px] font-bold text-slate-300">bot</span>}
      </span>
      <span className="block truncate text-[11px] text-slate-500">{p.label}</span>
    </span>
  );
}

/** Les 3 joueurs en haut de l'écran : score, et « a répondu » / « a voté ». */
function PlayersRow({ players, mode }: { players: Player[]; mode: "vote" | "question" }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {players.map((p) => {
        const done = mode === "vote" ? p.voted : p.answered;
        return (
          <div
            key={p.id}
            className={clsx(
              "relative flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 transition-colors duration-300",
              p.isMe ? "border-violet-400/40 bg-violet-500/10" : done ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/10 bg-slate-900/70",
            )}
          >
            <div className="relative">
              <Avatar emoji={p.avatar} photo={p.photoThumb} rp={p.rp} size="sm" name={p.pseudo} />
              {done && <span className="qb-pop absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950">✓</span>}
            </div>
            <p className="max-w-full truncate text-xs font-bold text-white">{p.isMe ? "Toi" : p.pseudo}</p>
            {mode === "question" ? (
              <p className="text-xs font-black text-amber-300">
                <span key={p.score} className="qb-bump tabular-nums">{p.score}</span> pt{p.score > 1 ? "s" : ""}
              </p>
            ) : (
              <p className="truncate text-[10px] text-slate-500">{p.label}</p>
            )}
            {mode === "question" && !done && !p.isMe && <span className="absolute bottom-1 right-2 animate-pulse text-[10px] text-slate-500">…</span>}
          </div>
        );
      })}
    </div>
  );
}

/** Mes 10 questions : juste (vert), fausse (rouge), en cours (pulse). */
function ProgressStrip({ total, current, results }: { total: number; current: number; results: (boolean | null)[] }) {
  return (
    <div className="flex gap-1" aria-label={`Question ${current + 1} sur ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const r = results[i];
        return (
          <span
            key={i}
            className={clsx(
              "h-1.5 flex-1 rounded-full transition-colors duration-500",
              r === true ? "bg-emerald-400" : r === false ? "bg-rose-500" : i === current ? "animate-pulse bg-white/60" : i < current ? "bg-slate-600" : "bg-slate-800",
            )}
          />
        );
      })}
    </div>
  );
}

/** Chrono : la barre se vide en continu (animation CSS calée sur l'heure du serveur). */
function TimeBar({ startsAt, endsAt, now }: { startsAt: number; endsAt: number; now: number }) {
  const total = Math.max(1, endsAt - startsAt);
  // Position de départ calculée une seule fois : ensuite, le navigateur anime seul.
  const [elapsed] = useState(() => Math.min(total, Math.max(0, now - startsAt)));
  const left = Math.max(0, endsAt - now);
  const urgent = left <= 5000;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div className="qb-drain h-full w-full rounded-full" style={{ "--qb-dur": `${total}ms`, "--qb-delay": `${-elapsed}ms` } as React.CSSProperties} />
      </div>
      <span key={urgent ? Math.ceil(left / 1000) : "calm"} className={clsx("w-8 text-right font-mono text-sm font-bold tabular-nums", urgent ? "qb-bump text-rose-400" : "text-slate-300")}>
        {Math.ceil(left / 1000)}
      </span>
    </div>
  );
}

function answerText(q: Question): string {
  if (q.type === "mcq") return q.choices[q.answer] ?? "";
  if (q.type === "truefalse") return q.answer ? "Vrai" : "Faux";
  return `${String(Math.round(q.answer * 10000) / 10000).replace(".", ",")}${q.unit ? ` ${q.unit}` : ""}`;
}
