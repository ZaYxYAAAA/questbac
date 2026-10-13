"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Play, Swords } from "lucide-react";
import { RankLadder } from "@/components/game/RankLadder";
import { HelpSheet } from "@/components/ranked/HelpSheet";
import { type MatchStart, RankedMatch } from "@/components/ranked/RankedMatch";
import { RankedBadge } from "@/components/ranked/RankedBadge";
import { FriendsStandings, GroupStandings, TopStandings } from "@/components/ranked/Standings";
import { StatusCard } from "@/components/ranked/StatusCard";
import { WeekResults } from "@/components/ranked/WeekResults";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { buildLeaderboard, realEntries } from "@/lib/game/leaderboard";
import { levelFromXp } from "@/lib/game/progression";
import { MATCH_SIZE, PLACEMENT_MATCHES, type RankedSubject, rankedSubjectMeta } from "@/lib/game/ranked";
import { activeTierReward, playerFrame } from "@/lib/game/ranks";
import { useCloud } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";
import { loadPlayers, usePlayers } from "@/lib/store/players-store";
import { type RankView, type RankedOverview, jokerRanked, loadRanked, nextRanked, startRanked, useRanked } from "@/lib/store/ranked-store";
import { useToasts } from "@/lib/store/toast-store";

type View = "jouer" | "classement";
type Board = "groupe" | "amis" | "top";

export default function RankedPage() {
  const { user, checked } = useCloud();
  const { overview, error, fetchedAt } = useRanked();
  const [view, setView] = useState<View>("jouer");
  const [board, setBoard] = useState<Board>("groupe");
  const [subject, setSubject] = useState<RankedSubject>("general");
  const [match, setMatch] = useState<MatchStart | null>(null);
  const [starting, setStarting] = useState<RankedSubject | null>(null);
  /** Matière choisie, en attente de confirmation des règles. */
  const [ready, setReady] = useState<RankedSubject | null>(null);
  const [help, setHelp] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("vue");
    if (asked === "classement" || asked === "groupe" || asked === "rangs") setView("classement");
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (user) void loadRanked(subject);
  }, [user, subject]);

  const play = useCallback(async (s: RankedSubject) => {
    setStarting(s);
    try {
      setMatch(await startRanked(s));
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: "Manche impossible", body: e instanceof Error ? e.message : undefined, tone: "rose" });
    } finally {
      setStarting(null);
    }
  }, []);

  const resume = async () => {
    const active = overview?.active;
    if (!active) return;
    try {
      const r = await nextRanked(active.id);
      if ("lost" in r) {
        useToasts.getState().push({ emoji: "🚪", title: "Manche perdue", body: r.lost.outcome.kind === "lost" ? r.lost.outcome.reason : undefined, tone: "rose" });
        void loadRanked(subject);
        return;
      }
      setMatch({ ...r.next, id: active.id, subject: active.subject });
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: e instanceof Error ? e.message : "Erreur", tone: "rose" });
      void loadRanked(subject);
    }
  };

  if (match) {
    return (
      <RankedMatch
        key={match.id}
        start={match}
        onClose={() => {
          setMatch(null);
          void loadRanked(subject);
        }}
        onReplay={(s) => {
          setMatch(null);
          void play(s);
        }}
      />
    );
  }

  if (checked && !user) {
    return (
      <div className="space-y-3 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-slate-900 p-6 text-center">
        <p className="text-5xl">⚔️</p>
        <p className="text-xl font-black text-white">Mode classé</p>
        <p className="text-sm text-slate-300">Un rang par matière, des groupes chaque semaine. Il faut un compte : tes manches sont corrigées par le serveur pour que le classement reste juste.</p>
        <Link href="/profil?onglet=compte" className="inline-flex rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Créer mon compte</Link>
      </div>
    );
  }

  const loaded = overview && overview.subject === subject ? overview : null;
  const rank = overview?.ranks.find((r) => r.subject === subject);
  const endsIn = overview ? overview.endsInMs - (now - fetchedAt) : 0;
  const choose = (s: RankedSubject) => {
    setSubject(s);
    setReady(s);
  };

  return (
    <div className="space-y-4">
      {ready && <RulesSheet subject={ready} busy={starting !== null} onCancel={() => setReady(null)} onGo={() => { const s = ready; setReady(null); void play(s); }} />}
      {help && <HelpSheet onClose={() => setHelp(false)} />}

      {error && !overview && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
      {!overview && !error && <div className="h-64 animate-pulse rounded-3xl bg-slate-900/60" />}

      {overview && (
        <>
          <WeekResults ranks={overview.ranks} />
          {overview.pendingLoss && <PendingLoss loss={overview.pendingLoss} onDone={() => loadRanked(subject)} />}
          {overview.active && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3">
              <p className="flex-1 text-sm text-amber-100">
                Manche en cours : <b>{rankedSubjectMeta(overview.active.subject).name}</b> (question {overview.active.index + 1}/{overview.active.total})
              </p>
              <Button variant="gold" onClick={resume}><Play size={16} /> Reprendre</Button>
            </div>
          )}

          {rank && (
            <StatusCard
              subject={subject}
              rank={rank}
              rows={loaded?.group ?? []}
              endsIn={endsIn}
              busy={starting !== null}
              onPlay={() => setReady(subject)}
              onHelp={() => setHelp(true)}
            />
          )}

          <Tabs<View>
            value={view}
            onChange={setView}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "jouer", label: "🎮 Matières" },
              { value: "classement", label: "🏆 Classements" },
            ]}
          />

          {view === "jouer" && <SubjectList ranks={overview.ranks} current={subject} onChoose={choose} onSelect={setSubject} />}

          {view === "classement" && (
            <div className="space-y-3">
              <SubjectChips ranks={overview.ranks} value={subject} onChange={setSubject} />
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-900/80 p-1 text-sm font-semibold">
                {([["groupe", "Mon groupe"], ["amis", "Amis"], ["top", "Top"]] as const).map(([b, label]) => (
                  <button key={b} type="button" onClick={() => setBoard(b)} className={clsx("rounded-lg py-1.5 transition", board === b ? "bg-amber-400 text-slate-950" : "text-slate-400")}>
                    {label}
                  </button>
                ))}
              </div>
              {!loaded ? (
                <div className="h-40 animate-pulse rounded-2xl bg-slate-900/60" />
              ) : board === "groupe" ? (
                rank?.placed ? (
                  <GroupStandings rows={loaded.group} par={rank.par} />
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-400">
                    Termine tes {PLACEMENT_MATCHES} manches de placement en {rankedSubjectMeta(subject).name} pour rejoindre un groupe.
                  </p>
                )
              ) : board === "amis" ? (
                <FriendsStandings rows={loaded.friends} />
              ) : (
                <>
                  <TopStandings rows={loaded.top} players={loaded.players} />
                  <Ladder />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Toutes les matières : rang, avancement de la semaine, et un bouton pour jouer. */
function SubjectList({ ranks, current, onChoose, onSelect }: { ranks: RankView[]; current: RankedSubject; onChoose: (s: RankedSubject) => void; onSelect: (s: RankedSubject) => void }) {
  return (
    <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
      {ranks.map((r) => {
        const m = rankedSubjectMeta(r.subject);
        const line = !r.placed
          ? `Placement ${PLACEMENT_MATCHES - r.placementLeft}/${PLACEMENT_MATCHES}`
          : r.played === 0
            ? "Pas joué cette semaine"
            : `${r.played} manche${r.played > 1 ? "s" : ""} · moyenne ${r.avg}/${r.par}`;
        return (
          <div key={r.subject} className={clsx("flex items-center gap-3 px-3 py-2.5", current === r.subject && "bg-amber-400/[0.07]")}>
            <button type="button" onClick={() => onSelect(r.subject)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl", m.gradient)}>{m.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-white">{m.name}</span>
                <span className="block truncate text-xs text-slate-500">{line}</span>
              </span>
              {r.placed && <RankedBadge step={r.step} size="sm" />}
            </button>
            <button type="button" onClick={() => onChoose(r.subject)} aria-label={`Jouer en ${m.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 active:scale-95">
              <Play size={15} className="ml-0.5" fill="currentColor" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function SubjectChips({ ranks, value, onChange }: { ranks: RankView[]; value: RankedSubject; onChange: (s: RankedSubject) => void }) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
      {ranks.map((r) => {
        const m = rankedSubjectMeta(r.subject);
        return (
          <button
            key={r.subject}
            type="button"
            onClick={() => onChange(r.subject)}
            className={clsx("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition", value === r.subject ? "bg-white text-slate-950" : "bg-slate-800/70 text-slate-300")}
          >
            <span>{m.emoji}</span>
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

/** Échelle complète des rangs (repliée par défaut). */
function Ladder() {
  const [open, setOpen] = useState(false);
  const game = useGame();
  const profile = game.profile!;
  const selfId = useCloud((s) => s.user?.id ?? null);
  const players = usePlayers((s) => s.players);
  useEffect(() => {
    if (open) void loadPlayers(true);
  }, [open]);
  const entries = useMemo(
    () =>
      buildLeaderboard(
        {
          pseudo: profile.pseudo,
          avatar: profile.avatar,
          photo: profile.photo ?? profile.photoThumb,
          titleId: activeTierReward(profile.titleId, game.peakRp).tierId,
          frameId: playerFrame(profile, game.peakRp) ?? undefined,
          level: profile.level,
          playerLevel: levelFromXp(game.xp).level,
          weeklyXp: game.weekly.xp,
          rp: game.rp,
        },
        "global",
        realEntries(players, selfId),
      ),
    [profile, game.xp, game.weekly.xp, game.rp, game.peakRp, players, selfId],
  );
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-center gap-1 py-2 text-sm font-semibold text-slate-400 hover:text-white">
        Échelle des rangs, titres et cadres <ChevronDown size={16} className={clsx("transition", open && "rotate-180")} />
      </button>
      {open && <RankLadder entries={entries} />}
    </div>
  );
}

function RulesSheet({ subject, busy, onCancel, onGo }: { subject: RankedSubject; busy: boolean; onCancel: () => void; onGo: () => void }) {
  const m = rankedSubjectMeta(subject);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-slate-950/80 p-3 backdrop-blur-sm sm:place-items-center" onClick={onCancel}>
      <div className="qb-pop w-full max-w-md space-y-4 rounded-3xl border border-amber-400/40 bg-slate-900 p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{m.emoji} {m.name} · manche classée</p>
        <p className="text-2xl font-black text-white">Reste dans l&apos;appli jusqu&apos;à la fin</p>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>⏱️ {MATCH_SIZE} questions avec un chrono : plus tu réponds vite, plus tu marques.</li>
          <li>⚠️ <b className="text-white">1re sortie</b> de l&apos;appli : la question en cours compte fausse.</li>
          <li>🚪 <b className="text-white">2e sortie</b> ou plus de 10 s dehors : manche perdue (0 point).</li>
          <li>🃏 Un appel, une fausse manip ? <b className="text-white">1 joker par jour</b>.</li>
        </ul>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>Plus tard</Button>
          <Button variant="gold" className="flex-1 py-3" disabled={busy} onClick={onGo}>
            <Swords size={16} /> C&apos;est parti
          </Button>
        </div>
      </div>
    </div>
  );
}

function PendingLoss({ loss, onDone }: { loss: NonNullable<RankedOverview["pendingLoss"]>; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const decide = async (use: boolean) => {
    setBusy(true);
    try {
      await jokerRanked(loss.id, use);
      useToasts.getState().push({ emoji: use ? "🃏" : "✔️", title: use ? "Manche annulée par ton joker" : "Manche comptée (0 point)", tone: "emerald" });
      onDone();
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: e instanceof Error ? e.message : "Erreur", tone: "rose" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
      <p>
        🚪 Manche de <b>{rankedSubjectMeta(loss.subject).name}</b> perdue : {loss.reason}.
        {loss.jokerAvailable ? " Un appel, une fausse manip ? Ton joker du jour peut l'annuler." : " Ton joker du jour est déjà utilisé."}
      </p>
      <div className="flex flex-wrap gap-2">
        {loss.jokerAvailable && <Button variant="gold" disabled={busy} onClick={() => decide(true)}>🃏 Utiliser mon joker</Button>}
        <Button variant="secondary" disabled={busy} onClick={() => decide(false)}>Accepter le 0</Button>
      </div>
    </div>
  );
}
