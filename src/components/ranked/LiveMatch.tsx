"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Check, Clock, Lightbulb, LogOut, RotateCcw, X } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { RankEmblem } from "@/components/game/RankEmblem";
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
  const offset = useRef(0);
  const ticket = useRef<string | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const receive = useCallback((v: MatchView, sentAt: number) => {
    // Décalage d'horloge avec le serveur (milieu de l'aller-retour).
    offset.current = v.serverNow - (sentAt + Date.now()) / 2;
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
    if (!already) useGame.getState().recordActivity({ kind: "ranked", place: me.place, correct: me.score });
    void loadRanked();
  }, [view?.phase, view?.id]);

  const meta = subjectMeta((view?.subject as SubjectId) ?? subject);
  const quit = () => {
    if (view && view.phase !== "done" && !window.confirm("Quitter la partie ? Les questions restantes compteront fausses.")) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950">
      <div className={clsx("pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-br opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]", meta.gradient)} />
      <div className="relative mx-auto flex min-h-full max-w-xl flex-col gap-4 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">
            {meta.name} <span className="font-medium text-slate-400">· classé</span>
          </p>
          {view && (view.phase === "question" || view.phase === "reveal") && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-white">{view.index + 1}/{view.total}</span>
          )}
          <button type="button" onClick={quit} aria-label="Quitter" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white">
            {view?.phase === "done" ? <X size={18} /> : <LogOut size={16} />}
          </button>
        </header>

        {!view ? (
          <Searching found={!!matchId} startedAt={searchStart} now={now} />
        ) : view.phase === "vote" ? (
          <Vote view={view} now={serverNow} onVote={async (c) => {
            const sentAt = Date.now();
            try {
              receive(await voteChapter(view.id, c), sentAt);
            } catch {
              // Le prochain rafraîchissement montrera l'état réel.
            }
          }} />
        ) : view.phase === "intro" ? (
          <Intro view={view} now={serverNow} />
        ) : view.phase === "question" ? (
          <Ask key={view.index} view={view} now={serverNow} onAnswered={(v, sentAt) => receive(v, sentAt)} />
        ) : view.phase === "reveal" ? (
          <Reveal view={view} now={serverNow} />
        ) : (
          <Results view={view} onClose={onClose} onReplay={() => onReplay(view.subject as SubjectId)} />
        )}
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
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="flex items-end gap-4">
        {profile && <Avatar emoji={profile.avatar} photo={profile.photoThumb} rp={rp} size="lg" />}
        {[0, 1].map((i) => (
          <span key={i} className={clsx("grid h-16 w-16 place-items-center rounded-full border-2 border-dashed text-2xl", found ? "border-emerald-400 text-emerald-300" : "animate-pulse border-white/20 text-slate-500")}>
            {found ? "✓" : "?"}
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
  const left = Math.max(0, view.voteEndsAt - now);
  const voted = view.players.filter((p) => p.voted).length;
  return (
    <div className="space-y-4">
      <PlayersRow players={view.players} mode="vote" />
      <div className="text-center">
        <p className="text-2xl font-black text-white">Choisis le chapitre</p>
        <p className="text-sm text-slate-400">La majorité l&apos;emporte · {voted}/{view.players.length} votes</p>
      </div>
      <TimeBar left={left} total={10_000} />
      <div className="grid gap-3">
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
                "rounded-2xl border-2 p-4 text-left transition active:scale-[0.98]",
                mine ? "border-amber-400 bg-amber-400/15" : view.myVote ? "border-white/5 bg-slate-900/60 opacity-60" : "border-white/10 bg-slate-900/80 hover:border-amber-300",
              )}
            >
              <p className="font-black text-white">{c?.title ?? id}</p>
              {c?.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{c.summary}</p>}
              {mine && <p className="mt-2 text-xs font-bold text-amber-300">✓ Ton vote</p>}
            </button>
          );
        })}
      </div>
      {view.myVote && <p className="text-center text-sm text-slate-400">En attente des autres joueurs…</p>}
    </div>
  );
}

function Intro({ view, now }: { view: MatchView; now: number }) {
  const left = view.startsAt ? Math.max(0, Math.ceil((view.startsAt - now) / 1000)) : 0;
  const c = view.chapterId ? chapterById(view.chapterId) : null;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center">
      <PlayersRow players={view.players} mode="vote" />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Chapitre choisi</p>
        <p className="mt-1 text-2xl font-black text-white">{c?.title ?? "…"}</p>
      </div>
      <p key={left} className="qb-pop text-7xl font-black text-white">{left || "Go"}</p>
      <p className="max-w-xs text-xs text-slate-400">⚠️ Reste dans l&apos;appli : si tu la quittes pendant une question, elle compte fausse.</p>
    </div>
  );
}

function Ask({ view, now, onAnswered }: { view: MatchView; now: number; onAnswered: (v: MatchView, sentAt: number) => void }) {
  const q = view.question!;
  const [sending, setSending] = useState<GivenAnswer | null>(null);
  const [numeric, setNumeric] = useState("");
  const mine = view.mine;
  const total = view.endsAt && view.startsAt ? view.endsAt - view.startsAt : 20_000;
  const left = view.endsAt ? Math.max(0, view.endsAt - now) : 0;
  const locked = !!mine || sending !== null || view.away || left === 0;

  const submit = async (given: GivenAnswer) => {
    if (locked) return;
    setSending(given);
    const sentAt = Date.now();
    try {
      const r = await sendAnswer(view.id, view.index, given);
      onAnswered(r.view, sentAt);
      if (r.status !== "ok" && r.status !== "already") setSending(null);
    } catch {
      setSending(null);
    }
  };

  const given = mine?.given ?? sending;
  const choice = (isAnswer: boolean, isGiven: boolean) =>
    clsx(
      "flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-base transition active:scale-[0.98]",
      !mine && !isGiven && "border-white/10 bg-slate-800/70 hover:border-violet-400",
      !mine && isGiven && "animate-pulse border-violet-400 bg-violet-600/20",
      mine && isAnswer && "border-emerald-400 bg-emerald-500/15",
      mine && isGiven && !isAnswer && "border-rose-400 bg-rose-500/15 qb-shake",
      mine && !isAnswer && !isGiven && "border-white/5 bg-slate-800/40 opacity-50",
    );

  return (
    <div className="space-y-4">
      <PlayersRow players={view.players} mode="question" />
      <TimeBar left={left} total={total} />
      <div className="select-none text-lg leading-relaxed text-white [-webkit-touch-callout:none] sm:text-xl" onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
        <Markdown>{q.prompt}</Markdown>
      </div>

      {q.type === "mcq" && (
        <div className="grid gap-2.5">
          {q.choices.map((c, i) => (
            <button key={i} type="button" disabled={locked} onClick={() => submit(i)} className={choice(i === q.answer, given === i)}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-950/60 text-sm font-black text-slate-300">{"ABCD"[i]}</span>
              <span className="min-w-0 flex-1 select-none text-slate-100"><Markdown compact>{c}</Markdown></span>
              {mine && i === q.answer && <Check className="shrink-0 text-emerald-400" size={20} />}
              {mine && given === i && i !== q.answer && <X className="shrink-0 text-rose-400" size={20} />}
            </button>
          ))}
        </div>
      )}
      {q.type === "truefalse" && (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" disabled={locked} onClick={() => submit(v)} className={clsx(choice(v === q.answer, given === v), "min-h-16 justify-center text-lg font-bold")}>
              {v ? "✅ Vrai" : "❌ Faux"}
            </button>
          ))}
        </div>
      )}
      {q.type === "numeric" && (
        <form
          className="flex gap-2"
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
                "w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-lg text-white outline-none",
                mine ? (mine.correct ? "border-emerald-400" : "border-rose-400") : "border-white/15 focus:border-violet-400",
              )}
            />
            {q.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{q.unit}</span>}
          </div>
          {!mine && (
            <button type="submit" disabled={locked} className="rounded-xl bg-violet-600 px-5 font-semibold text-white disabled:opacity-60">
              {sending !== null ? "…" : "OK"}
            </button>
          )}
        </form>
      )}

      {mine ? (
        <p className={clsx("qb-pop flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-bold", mine.correct ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300")}>
          {mine.correct ? <Check size={18} /> : <X size={18} />}
          {mine.correct ? `Juste en ${(mine.ms / 1000).toFixed(1)} s` : "Raté"}
          {q.type === "numeric" && !mine.correct && <span className="font-medium text-slate-300">· attendu {answerText(q)}</span>}
          <span className="font-medium text-slate-400">· on attend les autres</span>
        </p>
      ) : view.away ? (
        <p className="rounded-2xl bg-rose-500/15 p-3 text-center text-sm font-bold text-rose-300">🚪 Tu as quitté l&apos;appli : question perdue</p>
      ) : left === 0 ? (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500/15 p-3 text-sm font-bold text-rose-300"><Clock size={16} /> Temps écoulé</p>
      ) : null}
    </div>
  );
}

function Reveal({ view, now }: { view: MatchView; now: number }) {
  const q = view.question;
  const next = view.nextAt ? Math.max(0, Math.ceil((view.nextAt - now) / 1000)) : 0;
  const ranked = [...view.players].sort((a, b) => a.place - b.place);
  return (
    <div className="space-y-4">
      {q && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
          <div className="text-sm text-slate-400"><Markdown compact>{q.prompt}</Markdown></div>
          <p className="flex items-baseline gap-2 font-bold text-emerald-300">
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
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
        {ranked.map((p) => (
          <div key={p.id} className={clsx("flex items-center gap-3 px-3 py-2.5", p.isMe && "bg-violet-500/10")}>
            <span className="w-5 text-center font-black text-slate-400">{p.place}</span>
            <Avatar emoji={p.avatar} photo={p.photoThumb} rp={p.rp} size="sm" name={p.pseudo} />
            <Name p={p} />
            <span className={clsx("shrink-0 text-sm font-bold", p.last?.correct ? "text-emerald-300" : "text-rose-300")}>
              {p.last?.ms == null ? "⏱ —" : `${p.last.correct ? "✓" : "✗"} ${(p.last.ms / 1000).toFixed(1)} s`}
            </span>
            <span className="w-10 text-right font-black text-white">{p.score}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-slate-400">{view.index + 1 >= view.total ? "Résultats" : "Question suivante"} dans {next} s</p>
    </div>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"];

function Results({ view, onClose, onReplay }: { view: MatchView; onClose: () => void; onReplay: () => void }) {
  const me = view.players.find((p) => p.isMe)!;
  const ranked = [...view.players].sort((a, b) => a.place - b.place);
  const before = rankFromRp(me.rp);
  const after = rankFromRp(Math.max(0, me.rp + (me.delta ?? 0)));
  const promoted = after.label !== before.label && (me.delta ?? 0) > 0;
  const delta = me.delta ?? 0;
  return (
    <div className="space-y-4">
      <div className="qb-pop space-y-2 py-2 text-center">
        <p className="text-6xl">{MEDALS[me.place - 1]}</p>
        <p className="text-3xl font-black text-white">{me.place === 1 ? "Victoire !" : me.place === 2 ? "2e place" : "3e place"}</p>
        <p className="text-sm text-slate-400">{me.score}/{view.total} bonnes réponses · {(me.totalMs / 1000).toFixed(1)} s</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={clsx("rounded-2xl border p-3 text-center", delta >= 0 ? "border-emerald-400/30 bg-emerald-500/10" : "border-rose-400/30 bg-rose-500/10")}>
          <p className={clsx("text-2xl font-black", delta >= 0 ? "text-emerald-300" : "text-rose-300")}>{delta >= 0 ? "+" : ""}{delta}</p>
          <p className="text-xs text-slate-400">points de rang</p>
        </div>
        <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-3 text-center">
          <p className="text-2xl font-black text-violet-200">+{me.xp ?? 0}</p>
          <p className="text-xs text-slate-400">XP</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-3">
        <RankEmblem tierId={after.tier.id} division={after.division} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-white">{promoted ? `⬆️ Promu ${after.label} !` : after.label}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500" style={{ width: `${Math.round(after.progress * 100)}%` }} />
          </div>
          {after.nextLabel && <p className="mt-1 text-xs text-slate-500">{after.rpToNext} pts avant {after.nextLabel}</p>}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
        {ranked.map((p) => (
          <div key={p.id} className={clsx("flex items-center gap-3 px-3 py-2.5", p.isMe && "bg-violet-500/10")}>
            <span className="w-6 text-center text-lg">{MEDALS[p.place - 1]}</span>
            <Avatar emoji={p.avatar} photo={p.photoThumb} rp={p.rp} size="sm" name={p.pseudo} />
            <Name p={p} />
            <span className="text-right text-sm">
              <b className="text-white">{p.score}/{view.total}</b>
              <span className="block text-[11px] text-slate-500">{(p.totalMs / 1000).toFixed(0)} s</span>
            </span>
            <span className={clsx("w-12 text-right text-sm font-black", (p.delta ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300")}>
              {(p.delta ?? 0) >= 0 ? "+" : ""}{p.delta ?? 0}
            </span>
          </div>
        ))}
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
          <div key={p.id} className={clsx("relative flex flex-col items-center gap-1 rounded-2xl border px-1 py-2", p.isMe ? "border-violet-400/40 bg-violet-500/10" : "border-white/10 bg-slate-900/70")}>
            <div className="relative">
              <Avatar emoji={p.avatar} photo={p.photoThumb} rp={p.rp} size="sm" name={p.pseudo} />
              {done && <span className="qb-pop absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950">✓</span>}
            </div>
            <p className="max-w-full truncate text-xs font-bold text-white">{p.isMe ? "Toi" : p.pseudo}</p>
            {mode === "question" ? <p className="text-xs font-black text-amber-300">{p.score} pt{p.score > 1 ? "s" : ""}</p> : <p className="truncate text-[10px] text-slate-500">{p.label}</p>}
          </div>
        );
      })}
    </div>
  );
}

function TimeBar({ left, total }: { left: number; total: number }) {
  const ratio = Math.max(0, Math.min(1, left / total));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={clsx("h-full rounded-full transition-[width] duration-200 ease-linear", ratio > 0.5 ? "bg-emerald-400" : ratio > 0.2 ? "bg-amber-400" : "bg-rose-500")}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className={clsx("w-8 text-right font-mono text-sm font-bold tabular-nums", ratio > 0.2 ? "text-slate-300" : "text-rose-400")}>{Math.ceil(left / 1000)}</span>
    </div>
  );
}

function answerText(q: Question): string {
  if (q.type === "mcq") return q.choices[q.answer] ?? "";
  if (q.type === "truefalse") return q.answer ? "Vrai" : "Faux";
  return `${String(Math.round(q.answer * 10000) / 10000).replace(".", ",")}${q.unit ? ` ${q.unit}` : ""}`;
}
