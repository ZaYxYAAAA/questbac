"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Lock, Moon, Play, Star, Swords, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { PlayerSheet, type PlayerPreview } from "@/components/game/PlayerSheet";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { ProfileBanner } from "@/components/game/ProfileBanner";
import { RankEmblem } from "@/components/game/RankEmblem";
import { LiveMatch } from "@/components/ranked/LiveMatch";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { subjectMeta, subjectsForLevel } from "@/lib/content/curriculum";
import { MATCH_SIZES, type MatchSize, matchXp, ordinal, rpDelta } from "@/lib/game/match";
import { BOARD_SIZE, varietyBonus } from "@/lib/game/ranked";
import { RANK_TIERS, rankFromRp } from "@/lib/game/progression";
import { RANK_STEPS, stepIndex } from "@/lib/game/ranks";
import { useCloud } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";
import { type MyRank, loadRanked, useRanked } from "@/lib/store/match-store";
import type { SubjectId } from "@/lib/types";

type Board = "rangs" | "xp";
type Scope = "tous" | "amis";
type Period = "saison" | "semaine";

/** Classement de la semaine : trié sur les points (ou l'XP) gagnés depuis lundi, places recalculées. */
function weekly<T extends { place: number; isMe: boolean }>(rows: T[], key: (r: T) => number): T[] {
  return [...rows].sort((a, b) => key(b) - key(a) || a.place - b.place).map((r, i) => ({ ...r, place: i + 1 }));
}

/**
 * Lignes à afficher. Le serveur envoie le haut du général et celui de la semaine
 * (avec `weekPlace`), plus mes amis et moi même plus loin : entre amis, les places
 * sont recalculées ; sinon, ce sont celles du serveur.
 */
function boardView<T extends { place: number; weekPlace?: number; isMe: boolean; friend: boolean }>(rows: T[], scope: Scope, period: Period, key: (r: T) => number): T[] {
  if (scope === "amis") {
    const mine = rows.filter((r) => r.friend || r.isMe);
    return period === "semaine" ? weekly(mine.filter((r) => key(r) !== 0 || r.isMe), key) : mine.map((r, i) => ({ ...r, place: i + 1 }));
  }
  if (period === "semaine") {
    return rows
      .filter((r) => r.weekPlace !== undefined && (r.weekPlace <= BOARD_SIZE || r.isMe))
      .sort((a, b) => a.weekPlace! - b.weekPlace!)
      .map((r) => ({ ...r, place: r.weekPlace! }));
  }
  return rows.filter((r) => r.place <= BOARD_SIZE || r.isMe);
}
type Playing = { subject: SubjectId; size: number; matchId?: string | null; key: number };

/** Petite pastille sobre (bonus, malus, repos) sur les tuiles de matière. */
function Chip({ tone, icon: Icon, children }: { tone: "gold" | "up" | "down" | "rest"; icon: typeof Star; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums",
        tone === "gold" && "bg-black/30 text-amber-200",
        tone === "up" && "bg-black/30 text-emerald-200",
        tone === "down" && "bg-black/40 text-rose-200",
        tone === "rest" && "bg-black/30 text-white/90",
      )}
    >
      <Icon size={10} strokeWidth={2.5} />
      {children}
    </span>
  );
}
const SIZE_KEY = "qb-ranked-size";

const MEDALS = ["🥇", "🥈", "🥉"];
/** Noms courts pour les tuiles étroites. */
const SHORT: Partial<Record<SubjectId, string>> = { maths: "Maths", culture: "Culture G" };
const fmt = (n: number) => n.toLocaleString("fr-FR");

export default function RankedPage() {
  const { user, checked } = useCloud();
  const profile = useGame((s) => s.profile);
  const { rank, board, xp, error, locks, daily } = useRanked();
  // Les repos se terminent tout seuls : l'écran se rafraîchit chaque minute.
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [tab, setTab] = useState<Board>("rangs");
  const [scope, setScope] = useState<Scope>("tous");
  const [period, setPeriod] = useState<Period>("saison");
  const [open, setOpen] = useState<PlayerPreview | null>(null);
  const [size, setSize] = useState<MatchSize>(3);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(SIZE_KEY));
      if (MATCH_SIZES.includes(saved as MatchSize)) setSize(saved as MatchSize);
    } catch {
      // Stockage indisponible : format par défaut.
    }
  }, []);
  const pickSize = (n: MatchSize) => {
    setSize(n);
    try {
      localStorage.setItem(SIZE_KEY, String(n));
    } catch {
      // Pas grave : le choix vaut pour cette visite.
    }
  };

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("vue");
    if (asked === "xp") setTab("xp");
  }, []);

  useEffect(() => {
    if (user) void loadRanked();
  }, [user]);

  if (playing) {
    return (
      <LiveMatch
        key={playing.key}
        subject={playing.subject}
        size={playing.size}
        matchId={playing.matchId}
        onClose={() => {
          setPlaying(null);
          void loadRanked();
        }}
        onReplay={(subject, n) => setPlaying({ subject, size: n, key: Date.now() })}
      />
    );
  }

  if (checked && !user) {
    return (
      <div className="space-y-3 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-slate-900 p-6 text-center">
        <p className="text-5xl">⚔️</p>
        <p className="text-xl font-black text-white">Mode classé</p>
        <p className="text-sm text-slate-300">
          Des parties à 3, 5 ou 7 joueurs en direct, un classement général des rangs et un classement de l&apos;XP. Il faut un compte : les parties sont arbitrées par le serveur.
        </p>
        <Link href="/profil?onglet=compte" className="inline-flex rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Créer mon compte</Link>
      </div>
    );
  }

  const level = profile?.level ?? "seconde";
  const play = (subject: SubjectId) => setPlaying({ subject, size, key: Date.now() });

  return (
    <div className="space-y-5">
      {error && !rank && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
      {!rank && !error && <div className="h-48 animate-pulse rounded-3xl bg-slate-900/60" />}

      {rank && (
        <>
          {rank.active && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3">
              <p className="flex-1 text-sm text-amber-100">⚔️ Tu as une partie en cours.</p>
              <Button variant="gold" onClick={() => setPlaying({ subject: subjectsForLevel(level)[0].id, size, matchId: rank.active, key: Date.now() })}>
                <Play size={16} /> Reprendre
              </Button>
            </div>
          )}
          <MyRankCard rank={rank} onOpen={() => user && setOpen(myPreview(rank.rp))} />
          <RankRoad rp={rank.rp} peak={rank.peak} />
        </>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Swords size={18} className="text-amber-300" /> Lancer une partie</h2>
          <p className="text-sm text-slate-400">{size} joueurs · 10 questions en même temps · les bonnes réponses d&apos;abord, la vitesse départage.</p>
        </div>
        <SizePicker size={size} onPick={pickSize} rp={rank?.rp ?? 0} />
        {daily && (
          <p className="flex items-center gap-2.5 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] px-3 py-2 text-sm text-slate-300">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400/15 text-amber-300"><Star size={14} fill="currentColor" /></span>
            <span className="min-w-0 flex-1">
              Matière du jour : <b className="text-white">{subjectMeta(daily as SubjectId).name}</b>
            </span>
            <span className="shrink-0 text-xs font-bold text-amber-300">+25 %</span>
          </p>
        )}
        <div className="qb-stagger grid grid-cols-2 gap-2 sm:grid-cols-3">
          {subjectsForLevel(level).map((s) => {
            const restMin = Math.max(0, Math.ceil(((locks[s.id] ?? 0) - clock) / 60_000));
            const lock = restMin;
            const isDaily = daily === s.id;
            const variety = rank ? varietyBonus(rank.history, { subject: s.id, size }) : 0;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!rank || !!rank.active || lock > 0}
                onClick={() => play(s.id)}
                className={clsx(
                  "group relative flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br p-3 text-left shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 disabled:saturate-50",
                  s.gradient,
                  isDaily && lock === 0 && "ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-950",
                )}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/25 text-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">{s.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black leading-tight text-white [hyphens:auto]" lang="fr">{SHORT[s.id] ?? s.name}</span>
                  {lock > 0 ? (
                    <span className="mt-1 flex"><Chip tone="rest" icon={Moon}>Repos · {restMin} min</Chip></span>
                  ) : isDaily || variety !== 0 ? (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {isDaily && <Chip tone="gold" icon={Star}>+25 %</Chip>}
                      {variety > 0 && <Chip tone="up" icon={TrendingUp}>+{Math.round(variety * 100)} %</Chip>}
                      {variety < 0 && <Chip tone="down" icon={TrendingDown}>−{Math.round(-variety * 100)} %</Chip>}
                    </span>
                  ) : null}
                </span>
                {lock > 0 ? <Lock size={15} className="shrink-0 text-white/80" /> : <Play size={16} className="shrink-0 text-white/80 transition group-hover:scale-110" fill="currentColor" />}
              </button>
            );
          })}
        </div>
        <div className="space-y-1.5 rounded-2xl border border-white/5 bg-slate-900/50 px-3 py-2.5 text-xs text-slate-400">
          <p className="flex items-start gap-2">
            <TrendingUp size={14} className="mt-px shrink-0 text-emerald-400" />
            <span><b className="text-slate-200">+15 %</b> si la partie est différente de tes 2 dernières.</span>
          </p>
          <p className="flex items-start gap-2">
            <TrendingDown size={14} className="mt-px shrink-0 text-rose-400" />
            <span><b className="text-slate-200">−10 %</b> par partie identique d&apos;affilée (même matière, même format), jusqu&apos;à −30 %.</span>
          </p>
          <p className="flex items-start gap-2">
            <Moon size={14} className="mt-px shrink-0 text-slate-500" />
            <span>Après 3 parties d&apos;affilée dans une matière, elle se repose 15 min.</span>
          </p>
        </div>
        {rank && rank.history.length > 0 && <History rank={rank} />}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Trophy size={18} className="text-amber-300" /> Classements</h2>
          <div className="flex gap-1 rounded-full bg-slate-900/80 p-1 text-xs font-bold">
            {(["tous", "amis"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setScope(s)} className={clsx("rounded-full px-3 py-1 transition", scope === s ? "bg-white text-slate-950" : "text-slate-400")}>
                {s === "tous" ? "Tous" : "Amis"}
              </button>
            ))}
          </div>
        </div>
        <Tabs<Board>
          value={tab}
          onChange={setTab}
          className="w-full [&>button]:flex-1"
          options={[
            { value: "rangs", label: "Rangs" },
            { value: "xp", label: "XP totale" },
          ]}
        />
        <div className="flex gap-1 rounded-full bg-slate-900/80 p-1 text-xs font-bold">
          {(["saison", "semaine"] as const).map((x) => (
            <button key={x} type="button" onClick={() => setPeriod(x)} className={clsx("flex-1 rounded-full px-3 py-1.5 transition", period === x ? "bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950" : "text-slate-400")}>
              {x === "saison" ? "Général" : "Cette semaine"}
            </button>
          ))}
        </div>
        {!rank ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-900/60" />
        ) : tab === "rangs" ? (
          (() => {
            const rows = boardView(board, scope, period, (r) => r.weekDelta);
            return (
              <>
                <MyPlace rows={rows} unit={period === "semaine" ? "cette semaine" : "au classement"} />
                <RankBoard key={scope + period} rows={rows} onOpen={setOpen} weekly={period === "semaine"} />
              </>
            );
          })()
        ) : (
          (() => {
            const rows = boardView(xp, scope, period, (r) => r.weeklyXp);
            return (
              <>
                <MyPlace rows={rows} unit={period === "semaine" ? "cette semaine" : "en XP"} />
                <XpBoard key={scope + period} rows={rows} onOpen={setOpen} weekly={period === "semaine"} />
              </>
            );
          })()
        )}
        {tab === "rangs" && <Ladder />}
      </section>
      {open && <PlayerSheet key={open.id} player={open} onClose={() => setOpen(null)} />}
    </div>
  );

  function myPreview(rp: number): PlayerPreview {
    return {
      id: user!.id,
      pseudo: profile?.pseudo ?? user!.pseudo,
      avatar: profile?.avatar ?? "🙂",
      photoThumb: profile?.photoThumb,
      rp,
      titleId: profile?.titleId,
      frameId: profile?.frameId,
      bannerId: profile?.bannerId,
      bannerThumb: profile?.bannerThumb,
      isMe: true,
    };
  }
}

function MyRankCard({ rank, onOpen }: { rank: MyRank; onOpen: () => void }) {
  const info = rankFromRp(rank.rp);
  const next = RANK_STEPS[stepIndex(rank.rp) + 1];
  const profile = useGame((s) => s.profile);
  const peakRp = useGame((s) => s.peakRp);
  // La barre se remplit à l'affichage.
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(info.progress));
    return () => cancelAnimationFrame(id);
  }, [info.progress]);
  const week = rank.weekDelta;
  return (
    <section
      className="qb-fade-up relative overflow-hidden rounded-3xl border bg-slate-900/80"
      style={{ borderColor: `${info.tier.color}66`, boxShadow: `0 0 50px -18px ${info.tier.color}` }}
    >
      <ProfileBanner bannerId={profile?.bannerId} image={profile?.banner ?? profile?.bannerThumb} peakRp={Math.max(peakRp, rank.rp)} className="p-4">
        <button type="button" onClick={onOpen} className="flex w-full items-center gap-4 text-left">
          <RankEmblem tierId={info.tier.id} division={info.division} size="xl" className="qb-emblem -my-2 -ml-2" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-white/70">Mon rang</span>
            <span className="block truncate text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">{info.label}</span>
            {profile && <PlayerTitle titleId={profile.titleId} peakRp={Math.max(peakRp, rank.rp)} className="text-[11px] drop-shadow" />}
            <span className="mt-1 block text-sm text-white/85"><b className="text-white">{fmt(rank.rp)}</b> points de rang</span>
          </span>
        </button>
        <div className="mt-3 flex items-center gap-2">
          <RankEmblem tierId={info.tier.id} division={info.division} size="xs" />
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-950/60 ring-1 ring-white/10">
            <div
              className={clsx("relative h-full overflow-hidden rounded-full bg-gradient-to-r transition-[width] duration-1000 [transition-timing-function:var(--qb-ease)]", info.tier.gradient)}
              style={{ width: `${Math.round(fill * 100)}%` }}
            >
              <span className="qbb-fx qbb-shine" />
            </div>
          </div>
          {next ? <RankEmblem tierId={next.tier.id} division={next.division} size="xs" className="opacity-80" /> : <span className="text-lg">👑</span>}
        </div>
        {info.nextLabel && (
          <p className="mt-1 flex justify-between text-xs text-white/70">
            <span><b className="text-white">{Math.round(fill * 100)} %</b> de la division</span>
            <span>{info.rpToNext} pts avant <b className="text-white">{info.nextLabel}</b></span>
          </p>
        )}
      </ProfileBanner>
      <div className="relative grid grid-cols-3 gap-2 p-3 text-center">
        <Stat label="cette semaine" value={`${week > 0 ? "+" : ""}${week}`} tone={week > 0 ? "up" : week < 0 ? "down" : undefined} />
        <Stat label={rank.games > 1 ? "parties" : "partie"} value={String(rank.games)} />
        <Stat label={rank.wins > 1 ? "victoires" : "victoire"} value={String(rank.wins)} />
      </div>
    </section>
  );
}

/** Choix du format : 3, 5 ou 7 joueurs, avec ce que rapportent la 1re et la dernière place à mon rang. */
function SizePicker({ size, onPick, rp }: { size: MatchSize; onPick: (n: MatchSize) => void; rp: number }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Nombre de joueurs">
        {MATCH_SIZES.map((n) => {
          const on = size === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${n} joueurs`}
              onClick={() => onPick(n)}
              className={clsx(
                "qb-press relative overflow-hidden rounded-2xl border-2 px-2 py-2.5 text-center transition",
                on ? "border-amber-300 bg-amber-400/15 shadow-[0_0_24px_-8px] shadow-amber-400" : "border-white/10 bg-slate-900/70 hover:border-white/25",
              )}
            >
              <span className={clsx("block text-2xl font-black leading-none tabular-nums", on ? "text-white" : "text-slate-300")}>{n}</span>
              <span className={clsx("mt-0.5 block text-xs font-semibold", on ? "text-amber-200" : "text-slate-500")}>joueurs</span>
              <span className="mt-1 flex justify-center gap-0.5" aria-hidden>
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} className={clsx("h-1.5 w-1.5 rounded-full", on ? (i < (n - 1) / 2 ? "bg-emerald-400" : i === (n - 1) / 2 ? "bg-slate-300" : "bg-rose-400") : "bg-slate-600")} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/5 rounded-xl bg-slate-900/70 py-2 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1re place</p>
          <p className="text-sm font-black text-emerald-300">+{rpDelta(1, rp, 7, 10, size)} pts <span className="font-bold text-violet-200">· {matchXp(1, 7, size)} XP</span></p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{ordinal(size)} place</p>
          <p className="text-sm font-black text-rose-300">{rpDelta(size, rp, 3, 10, size)} pts</p>
        </div>
      </div>
      {size > 3 && <p className="text-center text-[11px] text-slate-500">Les {(size - 1) / 2} premiers gagnent des points, les {(size - 1) / 2} derniers en perdent.</p>}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-2xl bg-slate-950/50 px-2 py-2">
      <p className={clsx("text-lg font-black", tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-white")}>{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function History({ rank }: { rank: MyRank }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      {rank.history.slice(0, 8).map((h) => (
        <div key={h.at} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-2.5 py-1.5 text-xs">
          <span>{subjectMeta(h.subject as SubjectId)?.emoji}</span>
          <span>{MEDALS[h.place - 1] ?? <b className="text-slate-300">{ordinal(h.place)}</b>}</span>
          {(h.size ?? 3) > 3 && <span className="rounded bg-white/10 px-1 text-[10px] font-bold text-slate-300">à {h.size}</span>}
          <span className="text-slate-300">{h.correct}/10</span>
          <span className={clsx("font-black", h.delta >= 0 ? "text-emerald-300" : "text-rose-300")}>{h.delta >= 0 ? "+" : ""}{h.delta}</span>
        </div>
      ))}
    </div>
  );
}

function Place({ place }: { place: number }) {
  return <span className={clsx("relative w-7 shrink-0 text-center font-black", place <= 3 ? "text-lg" : "text-sm text-slate-400")}>{MEDALS[place - 1] ?? place}</span>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-400">{text}</p>;
}

type RankRow = ReturnType<typeof useRanked.getState>["board"][number];
type XpRowT = ReturnType<typeof useRanked.getState>["xp"][number];

const previewOf = (r: RankRow | XpRowT): PlayerPreview => ({
  id: r.id,
  pseudo: r.pseudo,
  avatar: r.avatar,
  photoThumb: r.photoThumb,
  rp: r.rp,
  titleId: r.titleId,
  frameId: r.frameId,
  bannerId: r.bannerId,
  bannerThumb: r.bannerThumb,
  friend: r.friend,
  isMe: r.isMe,
});

/** Ligne de classement cliquable, avec la bannière du joueur en fond. */
function Row({ r, onOpen, children }: { r: RankRow | XpRowT; onOpen: (p: PlayerPreview) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      id={r.isMe ? "board-me" : undefined}
      onClick={() => onOpen(previewOf(r))}
      className={clsx("group relative flex w-full scroll-mt-24 items-center gap-2.5 overflow-hidden px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]", r.isMe && "bg-violet-500/15 ring-1 ring-inset ring-violet-400/40")}
    >
      <ProfileBanner
        bannerId={r.bannerId}
        image={r.bannerThumb}
        peakRp={r.rp}
        fx={false}
        shade={false}
        className="!absolute inset-y-0 right-0 w-2/3 opacity-30 transition-opacity [mask-image:linear-gradient(90deg,transparent,#000)] group-hover:opacity-50"
      />
      {children}
    </button>
  );
}

/** Ma place dans le classement affiché, avec un raccourci vers ma ligne. */
function MyPlace({ rows, unit }: { rows: { place: number; isMe: boolean }[]; unit: string }) {
  const me = rows.find((r) => r.isMe);
  if (!me || rows.length < 2) return null;
  const top = Math.max(1, Math.round((100 * me.place) / rows.length));
  return (
    <button
      type="button"
      onClick={() => document.getElementById("board-me")?.scrollIntoView({ behavior: "smooth", block: "center" })}
      className="qb-press flex w-full items-center gap-3 rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-600/25 to-fuchsia-600/10 px-3 py-2 text-left"
    >
      <span className="text-2xl font-black text-white">{MEDALS[me.place - 1] ?? `${me.place}e`}</span>
      <span className="min-w-0 flex-1 text-sm text-slate-200">
        Tu es <b className="text-white">{ordinal(me.place)}</b> sur {rows.length} {unit}
        <span className="block text-[11px] text-violet-200">{me.place <= 3 ? "Sur le podium 🔥" : `Top ${top} %`}</span>
      </span>
      <span className="text-xs font-bold text-violet-200">Voir ↓</span>
    </button>
  );
}

/** Pastille de niveau, de plus en plus précieuse avec le niveau. */
function LevelChip({ level, size = "sm" }: { level: number; size?: "sm" | "md" }) {
  const tone = level >= 40 ? "from-amber-300 to-orange-500 text-slate-950" : level >= 25 ? "from-fuchsia-400 to-violet-600 text-white" : level >= 10 ? "from-sky-400 to-indigo-600 text-white" : "from-slate-500 to-slate-700 text-white";
  return (
    <span className={clsx("qb-hex grid shrink-0 place-items-center bg-gradient-to-br font-black tabular-nums", tone, size === "md" ? "h-8 w-7 text-xs" : "h-5 w-[18px] text-[9px]")} title={`Niveau ${level}`}>
      {level}
    </span>
  );
}

function Podium({ rows, onOpen, value }: { rows: (RankRow | XpRowT)[]; onOpen: (p: PlayerPreview) => void; value: (r: RankRow | XpRowT) => string }) {
  const order = [rows[1], rows[0], rows[2]];
  return (
    <div className="qb-stagger grid grid-cols-3 items-end gap-2">
      {order.map((r, k) => {
        if (!r) return <div key={k} />;
        const first = r.place === 1;
        const tier = rankFromRp(r.rp).tier;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpen(previewOf(r))}
            className={clsx("qb-press relative overflow-hidden rounded-2xl border text-center shadow-lg", first ? "pb-3" : "pb-2.5")}
            style={{ borderColor: `${tier.color}88`, boxShadow: first ? `0 0 30px -8px ${tier.color}` : undefined }}
          >
            <ProfileBanner bannerId={r.bannerId} image={r.bannerThumb} peakRp={r.rp} shade={false} className={clsx("!absolute inset-x-0 top-0", first ? "h-20" : "h-14")} />
            <span className="absolute inset-0 -z-10 bg-slate-900" />
            <span className={clsx("relative mx-auto inline-block", first ? "mt-9" : "mt-6")}>
              <Avatar emoji={r.avatar} photo={r.photoThumb} rp={r.rp} frame={r.frameId} size={first ? "lg" : "md"} name={r.pseudo} className="ring-4 ring-slate-900" />
              <span className="absolute -bottom-1 -left-1 text-xl drop-shadow">{MEDALS[r.place - 1]}</span>
            </span>
            <span className="mt-1 block truncate px-1.5 text-sm font-black text-white">{r.pseudo}</span>
            <span className="mt-0.5 flex items-center justify-center gap-1 px-1">
              <RankEmblem tierId={tier.id} size="2xs" />
              <span className="truncate text-[11px] font-bold" style={{ color: tier.color }}>{value(r)}</span>
            </span>
            <span className="mt-1 block text-[10px] font-semibold text-slate-400">{rankFromRp(r.rp).label}</span>
          </button>
        );
      })}
    </div>
  );
}

function RankBoard({ rows, onOpen, weekly = false }: { rows: RankRow[]; onOpen: (p: PlayerPreview) => void; weekly?: boolean }) {
  if (rows.length === 0) return <Empty text={weekly ? "Personne n'a encore joué cette semaine." : "Personne n'a encore joué en classé. Lance la première partie !"} />;
  const podium = rows.length >= 3 && rows[0].place === 1;
  const rest = podium ? rows.slice(3) : rows;
  return (
    <div className="space-y-3">
      {podium && <Podium rows={rows.slice(0, 3)} onOpen={onOpen} value={(r) => (weekly ? `${(r as RankRow).weekDelta > 0 ? "+" : ""}${(r as RankRow).weekDelta} pts` : `${fmt(r.rp)} pts`)} />}
      {rest.length > 0 && (
        <div className="qb-stagger divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
          {rest.map((r) => {
            const info = rankFromRp(r.rp);
            return (
              <Row key={r.id} r={r} onOpen={onOpen}>
                <Place place={r.place} />
                <Avatar emoji={r.avatar} photo={r.photoThumb} rp={r.rp} frame={r.frameId} size="sm" name={r.pseudo} />
                <span className="relative min-w-0 flex-1">
                  <span className="block truncate font-bold text-white">{r.pseudo}{r.isMe && <span className="ml-1.5 text-[10px] text-violet-300">toi</span>}{r.friend && !r.isMe && <span className="ml-1.5 text-[10px] text-emerald-300">ami</span>}</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-300">
                    <RankEmblem tierId={info.tier.id} size="2xs" />
                    <span style={{ color: info.tier.color }} className="font-semibold">{r.label}</span> · {r.games} partie{r.games > 1 ? "s" : ""}
                  </span>
                </span>
                <span className="relative text-right">
                  <span className="block text-sm font-black text-white">{fmt(r.rp)}</span>
                  <span className={clsx("block text-[11px] font-bold", r.weekDelta > 0 ? "text-emerald-400" : r.weekDelta < 0 ? "text-rose-400" : "text-slate-500")}>
                    {r.weekDelta > 0 ? `▲ ${r.weekDelta}` : r.weekDelta < 0 ? `▼ ${-r.weekDelta}` : "= 0"}
                  </span>
                </span>
              </Row>
            );
          })}
        </div>
      )}
    </div>
  );
}

function XpBoard({ rows, onOpen, weekly = false }: { rows: XpRowT[]; onOpen: (p: PlayerPreview) => void; weekly?: boolean }) {
  if (rows.length === 0) return <Empty text={weekly ? "Personne n'a encore gagné d'XP cette semaine." : "Ajoute des amis pour comparer votre XP."} />;
  const podium = rows.length >= 3 && rows[0].place === 1;
  const rest = podium ? rows.slice(3) : rows;
  const maxWeek = Math.max(1, ...rows.map((r) => r.weeklyXp));
  return (
    <div className="space-y-3">
      {podium && <Podium rows={rows.slice(0, 3)} onOpen={onOpen} value={(r) => (weekly ? `+${fmt((r as XpRowT).weeklyXp)} XP` : `${fmt((r as XpRowT).xp)} XP`)} />}
      {rest.length > 0 && (
        <div className="qb-stagger divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
          {rest.map((r) => (
            <Row key={r.id} r={r} onOpen={onOpen}>
              <Place place={r.place} />
              <Avatar emoji={r.avatar} photo={r.photoThumb} rp={r.rp} frame={r.frameId} size="sm" name={r.pseudo} />
              <span className="relative min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <LevelChip level={r.playerLevel} />
                  <span className="truncate font-bold text-white">{r.pseudo}</span>
                  {r.isMe && <span className="text-[10px] text-violet-300">toi</span>}
                  {r.friend && !r.isMe && <span className="text-[10px] text-emerald-300">ami</span>}
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-800" title="XP gagnée cette semaine">
                  <span className="block h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${Math.round((100 * r.weeklyXp) / maxWeek)}%` }} />
                </span>
              </span>
              <span className="relative text-right">
                <span className="block text-sm font-black text-violet-200">{weekly ? `+${fmt(r.weeklyXp)}` : fmt(r.xp)} XP</span>
                <span className={clsx("block text-[11px] font-bold", r.weeklyXp > 0 ? "text-emerald-400" : "text-slate-500")}>{weekly ? `${fmt(r.xp)} au total` : `+${fmt(r.weeklyXp)} cette sem.`}</span>
              </span>
            </Row>
          ))}
        </div>
      )}
    </div>
  );
}

/** La route des rangs : les 8 paliers, du Bronze à la Légende, avec ma position. */
function RankRoad({ rp, peak }: { rp: number; peak: number }) {
  const strip = useRef<HTMLDivElement>(null);
  const info = rankFromRp(rp);
  const cur = RANK_TIERS.findIndex((t) => t.id === info.tier.id);
  const nextTier = RANK_TIERS[cur + 1];
  const tierProgress = nextTier ? (rp - info.tier.minRp) / (nextTier.minRp - info.tier.minRp) : 1;
  // Centre le palier actuel (sans faire défiler la page).
  useEffect(() => {
    const el = strip.current;
    const card = el?.children[cur] as HTMLElement | undefined;
    if (el && card) el.scrollLeft = card.offsetLeft - el.clientWidth / 2 + card.clientWidth / 2;
  }, [cur]);
  return (
    <section className="qb-fade-up rounded-3xl border border-white/10 bg-slate-900/70 py-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">La route des rangs</h2>
        <span className="text-[11px] text-slate-500">record : <b className="text-slate-300">{rankFromRp(peak).label}</b></span>
      </div>
      <div ref={strip} className="relative mt-2 flex snap-x gap-1 overflow-x-auto px-4 pb-1 pt-2 [scrollbar-width:none]">
        {RANK_TIERS.map((t, i) => {
          const done = i < cur;
          const here = i === cur;
          const locked = i > cur && t.minRp > peak;
          const fillPct = done ? 100 : here ? Math.round(tierProgress * 100) : 0;
          return (
            <div key={t.id} className="relative flex w-[88px] shrink-0 snap-center flex-col items-center gap-1 text-center">
              {/* Tronçon de route vers le palier suivant */}
              {i < RANK_TIERS.length - 1 && (
                <span className="absolute left-1/2 top-9 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-slate-800">
                  <span className={clsx("block h-full rounded-full bg-gradient-to-r", t.gradient)} style={{ width: `${fillPct}%` }} />
                </span>
              )}
              <span className={clsx("relative z-[1] grid h-[72px] place-items-center", here && "qb-bob")}>
                <RankEmblem tierId={t.id} size={here ? "md" : "sm"} locked={locked} className={clsx(!here && !locked && !done && "opacity-60")} />
              </span>
              <span className={clsx("text-[11px] font-black", here ? "text-white" : done ? "text-slate-300" : "text-slate-500")} style={here ? { color: t.color } : undefined}>
                {t.name}
              </span>
              <span className="text-[10px] tabular-nums text-slate-500">{fmt(t.minRp)}</span>
              {here && <span className="qb-pop rounded-full bg-white px-1.5 text-[9px] font-black uppercase text-slate-950">toi</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Les règles des points (repliées par défaut). */
function Ladder() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-center gap-1 py-2 text-sm font-semibold text-slate-400 hover:text-white">
        Les rangs et comment monter <ChevronDown size={16} className={clsx("transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <ul className="space-y-1 text-sm text-slate-300">
            <li>À 3 : 1re place <b className="text-emerald-300">+20 à +30</b> pts · 2e <b className="text-emerald-300">+2 à +9</b> · 3e <b className="text-rose-300">−6 à −27</b></li>
            <li>À 5 et à 7 : la place du milieu rapporte un peu, au-dessus on gagne, en dessous on perd. La victoire rapporte <b className="text-emerald-300">×1,4</b> (à 5) ou <b className="text-emerald-300">×1,8</b> (à 7), la dernière place coûte autant de plus.</li>
            <li>Plus ton rang est haut, moins tu gagnes et plus tu perds. 10/10 : <b className="text-white">+5</b> bonus.</li>
            <li>Les flèches ▲▼ du classement montrent les points gagnés ou perdus depuis lundi.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
