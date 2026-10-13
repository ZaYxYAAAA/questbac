"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Clock, Flag, Lock, Play, Swords } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { FriendsBoard } from "@/components/game/FriendsBoard";
import { RankLadder } from "@/components/game/RankLadder";
import { type MatchStart, RankedMatch } from "@/components/ranked/RankedMatch";
import { RankedBadge } from "@/components/ranked/RankedBadge";
import { WeekResults } from "@/components/ranked/WeekResults";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { buildLeaderboard, realEntries } from "@/lib/game/leaderboard";
import { formatCountdown } from "@/lib/game/league";
import { levelFromXp } from "@/lib/game/progression";
import { COUNTED_MATCHES, MATCH_SIZE, MIN_MATCHES, PLACEMENT_MATCHES, type RankedSubject, type WeekZone, rankedSubjectMeta } from "@/lib/game/ranked";
import { activeTierReward, playerFrame } from "@/lib/game/ranks";
import { useCloud } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";
import { loadPlayers, usePlayers } from "@/lib/store/players-store";
import { type GroupRow, type RankView, type RankedOverview, jokerRanked, loadRanked, nextRanked, reportRanked, startRanked, useRanked } from "@/lib/store/ranked-store";
import { useToasts } from "@/lib/store/toast-store";

type View = "jouer" | "groupe" | "rangs" | "amis";
const VIEWS: View[] = ["jouer", "groupe", "rangs", "amis"];

const ZONE_STYLE: Record<WeekZone, { row: string; label: string }> = {
  promotion: { row: "border-l-emerald-400 bg-emerald-500/10", label: "⬆️ Promotion" },
  objective: { row: "border-l-emerald-400 bg-emerald-500/10", label: "🎯 Objectif atteint" },
  safe: { row: "border-l-slate-600", label: "Maintien" },
  relegation: { row: "border-l-rose-500 bg-rose-500/10", label: "⬇️ Relégation" },
  unranked: { row: "border-l-slate-800 opacity-70", label: `Moins de ${MIN_MATCHES} manches` },
  inactive: { row: "border-l-slate-800", label: "Inactif" },
  review: { row: "border-l-slate-600", label: "En vérification" },
};

export default function RankedPage() {
  const game = useGame();
  const profile = game.profile!;
  const { user, checked } = useCloud();
  const { overview, error, fetchedAt } = useRanked();
  const [view, setView] = useState<View>("jouer");
  const [subject, setSubject] = useState<RankedSubject>("general");
  const [match, setMatch] = useState<MatchStart | null>(null);
  const [starting, setStarting] = useState<RankedSubject | null>(null);
  /** Matière choisie, en attente de confirmation des règles. */
  const [ready, setReady] = useState<RankedSubject | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("vue") as View | null;
    if (asked && VIEWS.includes(asked)) setView(asked);
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (user) void loadRanked(subject);
  }, [user, subject]);

  const changeView = (v: View) => {
    setView(v);
    window.history.replaceState(null, "", v === "jouer" ? "/classement" : `/classement?vue=${v}`);
  };

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

  // Classement des amis et échelle des rangs (profils publics).
  const selfId = useCloud((s) => s.user?.id ?? null);
  const players = usePlayers((s) => s.players);
  useEffect(() => {
    void loadPlayers(true);
  }, []);
  const player = useMemo(
    () => ({
      pseudo: profile.pseudo,
      avatar: profile.avatar,
      photo: profile.photo ?? profile.photoThumb,
      titleId: activeTierReward(profile.titleId, game.peakRp).tierId,
      frameId: playerFrame(profile, game.peakRp) ?? undefined,
      level: profile.level,
      playerLevel: levelFromXp(game.xp).level,
      weeklyXp: game.weekly.xp,
      rp: game.rp,
    }),
    [profile, game.xp, game.weekly.xp, game.rp, game.peakRp],
  );
  const globalEntries = useMemo(() => buildLeaderboard(player, "global", realEntries(players, selfId)), [player, players, selfId]);

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

  const general = overview?.ranks.find((r) => r.subject === "general");
  const rulesModal = ready && (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-slate-950/80 p-3 backdrop-blur-sm sm:place-items-center" onClick={() => setReady(null)}>
      <div className="qb-pop w-full max-w-md space-y-4 rounded-3xl border border-amber-400/40 bg-slate-900 p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{rankedSubjectMeta(ready).emoji} {rankedSubjectMeta(ready).name} · manche classée</p>
        <p className="text-2xl font-black text-white">Reste dans l&apos;appli jusqu&apos;à la fin</p>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>⏱️ {MATCH_SIZE} questions, une à la fois, avec un chrono. Plus tu réponds vite, plus tu marques.</li>
          <li>⚠️ <b className="text-white">1re sortie</b> de l&apos;appli : la question en cours compte fausse.</li>
          <li>🚪 <b className="text-white">2e sortie</b>, ou plus de 10 s dehors : la manche est perdue (0 point).</li>
          <li>🃏 Un appel, une fausse manip ? Un <b className="text-white">joker par jour</b> annule une manche perdue.</li>
          <li>🔒 Texte non copiable, réponses corrigées par le serveur.</li>
        </ul>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setReady(null)}>Plus tard</Button>
          <Button
            variant="gold"
            className="flex-1 py-3"
            disabled={starting !== null}
            onClick={() => {
              const s = ready;
              setReady(null);
              void play(s);
            }}
          >
            <Swords size={16} /> C&apos;est parti
          </Button>
        </div>
      </div>
    </div>
  );
  const endsIn = overview ? overview.endsInMs - (now - fetchedAt) : 0;

  return (
    <div className="space-y-5">
      {rulesModal}
      {/* En-tête : ambiance compétition, distincte de l'entraînement */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 p-5 sm:p-6">
        <div aria-hidden className="absolute -right-6 -top-8 text-[8rem] opacity-10">⚔️</div>
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Mode classé</p>
            <h1 className="text-3xl font-black text-white">Chaque manche compte</h1>
            <p className="max-w-md text-sm text-slate-300">
              Ton rang ne monte qu&apos;ici. Les missions de l&apos;onglet Entraînement rapportent de l&apos;XP, pas de rang.
            </p>
          </div>
          {general && (
            <div className="space-y-1 sm:text-right">
              <p className="text-xs text-slate-400">Rang général</p>
              <RankedBadge step={general.step} size="lg" />
              <p className="flex items-center gap-1 text-xs text-amber-200 sm:justify-end"><Clock size={12} /> Promotions dans {formatCountdown(endsIn)}</p>
            </div>
          )}
        </div>
      </section>

      {checked && !user ? (
        <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center">
          <p className="text-4xl">🔐</p>
          <p className="text-slate-200">Le mode classé se joue avec un compte : tes manches sont corrigées par le serveur pour que le classement reste juste.</p>
          <Link href="/profil" className="inline-flex rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Créer mon compte</Link>
        </div>
      ) : (
        <>
          {overview && <WeekResults ranks={overview.ranks} />}

          {overview?.pendingLoss && <PendingLoss loss={overview.pendingLoss} onDone={() => loadRanked(subject)} />}

          {overview?.active && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4">
              <p className="flex-1 text-sm text-amber-100">
                Manche en cours en <b>{rankedSubjectMeta(overview.active.subject).name}</b> (question {overview.active.index + 1}/{overview.active.total}).
              </p>
              <Button variant="gold" onClick={resume}><Play size={16} /> Reprendre</Button>
            </div>
          )}

          <Tabs<View>
            value={view}
            onChange={changeView}
            className="w-full flex-nowrap sm:w-auto [&>button]:flex-1 [&>button]:whitespace-nowrap [&>button]:px-2 sm:[&>button]:flex-none sm:[&>button]:px-3"
            options={[
              { value: "jouer", label: "Jouer" },
              { value: "groupe", label: "Mon groupe" },
              { value: "rangs", label: "Rangs" },
              { value: "amis", label: "Amis" },
            ]}
          />

          {error && !overview && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
          {!overview && !error && <div className="h-48 animate-pulse rounded-3xl bg-slate-900/60" />}

          {overview && view === "jouer" && <PlayView ranks={overview.ranks} starting={starting} onPlay={setReady} />}
          {overview && view === "groupe" && (
            <>
              <SubjectChips ranks={overview.ranks} value={subject} onChange={setSubject} />
              <GroupView rank={overview.ranks.find((r) => r.subject === subject)} rows={overview.subject === subject ? overview.group : []} endsIn={endsIn} onPlay={() => setReady(subject)} />
            </>
          )}
          {overview && view === "rangs" && (
            <>
              <SubjectChips ranks={overview.ranks} value={subject} onChange={setSubject} />
              <TopView rows={overview.subject === subject ? overview.top : []} players={overview.players} />
              <RankLadder entries={globalEntries} />
            </>
          )}
          {view === "amis" && <FriendsBoard player={player} />}
        </>
      )}
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
            className={clsx("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition", value === r.subject ? "bg-amber-400 text-slate-950" : "bg-slate-800/70 text-slate-300")}
          >
            <span>{m.emoji}</span>
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

function PlayView({ ranks, starting, onPlay }: { ranks: RankView[]; starting: RankedSubject | null; onPlay: (s: RankedSubject) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
        <p className="rounded-2xl bg-slate-900/70 p-3"><b className="block text-lg text-white">{MATCH_SIZE}</b>questions chronométrées</p>
        <p className="rounded-2xl bg-slate-900/70 p-3"><b className="block text-lg text-white">{COUNTED_MATCHES}</b>meilleures manches comptent</p>
        <p className="rounded-2xl bg-slate-900/70 p-3"><b className="block text-lg text-white">Dimanche</b>promotions à minuit</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ranks.map((r) => {
          const m = rankedSubjectMeta(r.subject);
          return (
            <div key={r.subject} className={clsx("rounded-3xl border bg-slate-900/70 p-4", r.subject === "general" ? "border-amber-400/40 sm:col-span-2" : "border-white/10")}>
              <div className="flex items-center gap-3">
                <span className={clsx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl", m.gradient)}>{m.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-white">{m.name}{r.subject === "general" && <span className="ml-1 text-xs font-normal text-slate-400">toutes les matières</span>}</p>
                  <RankedBadge step={r.step} placementLeft={r.placed ? 0 : r.placementLeft} size="sm" />
                </div>
                <Button variant="gold" disabled={starting !== null} onClick={() => onPlay(r.subject)} className="shrink-0">
                  {starting === r.subject ? "…" : <><Swords size={16} /> Jouer</>}
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                {r.placed ? (
                  <>
                    <span>{r.played} manche{r.played > 1 ? "s" : ""} cette semaine · {r.total} pts</span>
                    <span className={r.played >= PLACEMENT_MATCHES && r.avg >= r.par ? "font-bold text-emerald-300" : ""}>moyenne {r.avg} / objectif {r.par}</span>
                  </>
                ) : (
                  <span>{r.placementLeft} manche{r.placementLeft > 1 ? "s" : ""} de placement pour obtenir ton rang (jusqu&apos;à Or III)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="flex items-center gap-2 rounded-2xl bg-slate-900/70 p-3 text-xs text-slate-400">
        <Lock size={14} className="shrink-0 text-amber-300" />
        Les questions arrivent une par une et sont corrigées par le serveur. Ne quitte pas l&apos;appli pendant une manche.
      </p>
    </div>
  );
}

function GroupView({ rank, rows, endsIn, onPlay }: { rank?: RankView; rows: GroupRow[]; endsIn: number; onPlay: () => void }) {
  if (!rank?.placed) {
    return (
      <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center">
        <p className="text-4xl">🎯</p>
        <p className="text-slate-300">Termine tes {PLACEMENT_MATCHES} manches de placement dans cette matière pour rejoindre un groupe.</p>
        <Button variant="gold" onClick={onPlay}><Swords size={16} /> Jouer une manche</Button>
      </div>
    );
  }
  const me = rows.find((r) => r.isMe);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-slate-300">
          Groupe de <b className="text-white">{rows.length}</b> joueur{rows.length > 1 ? "s" : ""} · fin dans <b className="text-amber-200">{formatCountdown(endsIn)}</b>
        </p>
        {me && me.played === 0 && <Button variant="gold" onClick={onPlay}><Swords size={16} /> Entrer dans la course</Button>}
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
        {rows.map((r, i) => (
          <div key={r.id} className={clsx("flex items-center gap-3 border-b border-l-4 border-b-white/5 px-3 py-2.5 last:border-b-0", ZONE_STYLE[r.zone].row, r.isMe && "ring-1 ring-inset ring-amber-400/60")}>
            <span className="w-6 text-center font-black text-slate-400">{i + 1}</span>
            <Avatar emoji={r.avatar} photo={r.photoThumb} name={r.pseudo} size="sm" />
            <div className="min-w-0 flex-1">
              <p className={clsx("truncate font-semibold", r.isMe ? "text-amber-200" : "text-white")}>{r.pseudo}{r.isMe && " (toi)"}</p>
              <p className="text-xs text-slate-500">{r.label} · {r.played} manche{r.played > 1 ? "s" : ""} · {ZONE_STYLE[r.zone].label}</p>
            </div>
            <span className="font-mono text-sm font-bold text-slate-100">{r.total}</span>
            {!r.isMe && <ReportButton row={r} />}
          </div>
        ))}
      </div>
      <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        <p className="rounded-xl bg-emerald-500/10 p-2.5"><b className="text-emerald-300">Vert</b> : tu montes d&apos;une division dimanche soir. Atteindre l&apos;objectif (moyenne ≥ {rank.par} sur {PLACEMENT_MATCHES} manches) fait aussi monter.</p>
        <p className="rounded-xl bg-slate-800/60 p-2.5"><b className="text-slate-200">Gris</b> : tu restes. Il faut au moins {MIN_MATCHES} manches dans la semaine pour être classé.</p>
        <p className="rounded-xl bg-rose-500/10 p-2.5"><b className="text-rose-300">Rouge</b> : tu descends d&apos;une division (groupes de 6 joueurs ou plus).</p>
      </div>
    </div>
  );
}

function TopView({ rows, players }: { rows: GroupRow[]; players: number }) {
  if (rows.length === 0) return <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">Personne n&apos;est encore classé dans cette matière : sois le premier !</p>;
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400">{players} joueur{players > 1 ? "s" : ""} classé{players > 1 ? "s" : ""} dans cette matière.</p>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
        {rows.map((r, i) => (
          <div key={r.id} className={clsx("flex items-center gap-3 border-b border-white/5 px-3 py-2.5 last:border-0", r.isMe && "bg-amber-500/10")}>
            <span className={clsx("w-6 text-center font-black", i < 3 ? "text-amber-300" : "text-slate-500")}>{i + 1}</span>
            <Avatar emoji={r.avatar} photo={r.photoThumb} name={r.pseudo} size="sm" />
            <p className={clsx("min-w-0 flex-1 truncate font-semibold", r.isMe ? "text-amber-200" : "text-white")}>{r.pseudo}{r.isMe && " (toi)"}</p>
            <span className="text-xs font-bold text-slate-300">{r.label}</span>
            {!r.isMe && <ReportButton row={r} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportButton({ row }: { row: GroupRow }) {
  const report = async () => {
    if (!window.confirm(`Signaler ${row.pseudo} pour triche ? Après 3 signalements de joueurs différents, ses promotions sont bloquées le temps d'une vérification.`)) return;
    try {
      const r = await reportRanked(row.id);
      useToasts.getState().push({ emoji: "🚩", title: r.already ? "Déjà signalé" : "Signalement envoyé", body: r.already ? undefined : "Merci, c'est pris en compte.", tone: "emerald" });
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: e instanceof Error ? e.message : "Erreur", tone: "rose" });
    }
  };
  return (
    <button type="button" onClick={report} aria-label={`Signaler ${row.pseudo}`} className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-600/20 hover:text-rose-300">
      <Flag size={14} />
    </button>
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
