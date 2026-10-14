"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Lock, Play, Swords } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { RankEmblem } from "@/components/game/RankEmblem";
import { LiveMatch } from "@/components/ranked/LiveMatch";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { subjectMeta, subjectsForLevel } from "@/lib/content/curriculum";
import { RANK_TIERS, rankFromRp } from "@/lib/game/progression";
import { useCloud } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";
import { type MyRank, loadRanked, useRanked } from "@/lib/store/match-store";
import type { SubjectId } from "@/lib/types";

type Board = "rangs" | "xp";
type Scope = "tous" | "amis";
type Playing = { subject: SubjectId; matchId?: string | null; key: number };

const MEDALS = ["🥇", "🥈", "🥉"];
/** Noms courts pour les tuiles étroites. */
const SHORT: Partial<Record<SubjectId, string>> = { maths: "Maths", culture: "Culture G" };
const fmt = (n: number) => n.toLocaleString("fr-FR");

export default function RankedPage() {
  const { user, checked } = useCloud();
  const profile = useGame((s) => s.profile);
  const { rank, board, xp, error, locks, daily } = useRanked();
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [tab, setTab] = useState<Board>("rangs");
  const [scope, setScope] = useState<Scope>("tous");

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
        matchId={playing.matchId}
        onClose={() => {
          setPlaying(null);
          void loadRanked();
        }}
        onReplay={(subject) => setPlaying({ subject, key: Date.now() })}
      />
    );
  }

  if (checked && !user) {
    return (
      <div className="space-y-3 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-slate-900 p-6 text-center">
        <p className="text-5xl">⚔️</p>
        <p className="text-xl font-black text-white">Mode classé</p>
        <p className="text-sm text-slate-300">
          Des parties à 3 joueurs en direct, un classement général des rangs et un classement de l&apos;XP. Il faut un compte : les parties sont arbitrées par le serveur.
        </p>
        <Link href="/profil?onglet=compte" className="inline-flex rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Créer mon compte</Link>
      </div>
    );
  }

  const level = profile?.level ?? "seconde";
  const play = (subject: SubjectId) => setPlaying({ subject, key: Date.now() });

  return (
    <div className="space-y-5">
      {error && !rank && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
      {!rank && !error && <div className="h-48 animate-pulse rounded-3xl bg-slate-900/60" />}

      {rank && (
        <>
          {rank.active && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3">
              <p className="flex-1 text-sm text-amber-100">⚔️ Tu as une partie en cours.</p>
              <Button variant="gold" onClick={() => setPlaying({ subject: subjectsForLevel(level)[0].id, matchId: rank.active, key: Date.now() })}>
                <Play size={16} /> Reprendre
              </Button>
            </div>
          )}
          <MyRankCard rank={rank} />
        </>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Swords size={18} className="text-amber-300" /> Lancer une partie</h2>
          <p className="text-sm text-slate-400">3 joueurs · 10 questions en même temps · les bonnes réponses d&apos;abord, la vitesse départage.</p>
        </div>
        {daily && (
          <p className="flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            <span className="text-lg">⭐</span>
            <span>
              Matière du jour : <b className="text-white">{subjectMeta(daily as SubjectId).name}</b> · +25 % de points de rang gagnés
            </span>
          </p>
        )}
        <div className="qb-stagger grid grid-cols-2 gap-2 sm:grid-cols-3">
          {subjectsForLevel(level).map((s) => {
            const lock = locks[s.id] ?? 0;
            const isDaily = daily === s.id;
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
                    <span className="block text-[10px] font-semibold leading-tight text-white/90">🔒 encore {lock} partie{lock > 1 ? "s" : ""} ailleurs</span>
                  ) : isDaily ? (
                    <span className="block text-[10px] font-bold leading-tight text-amber-100">⭐ +25 % aujourd&apos;hui</span>
                  ) : null}
                </span>
                {lock > 0 ? <Lock size={15} className="shrink-0 text-white/80" /> : <Play size={16} className="shrink-0 text-white/80 transition group-hover:scale-110" fill="currentColor" />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">Varie les matières : sur tes 10 dernières parties, 3 au plus dans la même.</p>
        {rank && rank.history.length > 0 && <History rank={rank} />}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black text-white">🏆 Classements</h2>
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
            { value: "rangs", label: "🏅 Rangs" },
            { value: "xp", label: "⭐ XP totale" },
          ]}
        />
        {!rank ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-900/60" />
        ) : tab === "rangs" ? (
          <RankBoard key={scope} rows={scope === "amis" ? board.filter((r) => r.friend || r.isMe) : board} />
        ) : (
          <XpBoard key={scope} rows={scope === "amis" ? xp.filter((r) => r.friend || r.isMe) : xp} />
        )}
        {tab === "rangs" && <Ladder rp={rank?.rp ?? 0} />}
      </section>
    </div>
  );
}

function MyRankCard({ rank }: { rank: MyRank }) {
  const info = rankFromRp(rank.rp);
  // La barre se remplit à l'affichage.
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(info.progress));
    return () => cancelAnimationFrame(id);
  }, [info.progress]);
  const week = rank.weekDelta;
  return (
    <section className="qb-fade-up relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-4">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: info.tier.color }} />
      <div className="relative flex items-center gap-4">
        <RankEmblem tierId={info.tier.id} division={info.division} size="lg" className="qb-emblem" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mon rang</p>
          <p className="truncate text-2xl font-black text-white">{info.label}</p>
          <p className="text-sm text-slate-300"><b className="text-white">{fmt(rank.rp)}</b> points de rang</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-1000 [transition-timing-function:var(--qb-ease)]" style={{ width: `${Math.round(fill * 100)}%` }} />
          </div>
          {info.nextLabel && <p className="mt-1 text-xs text-slate-500">{info.rpToNext} pts avant {info.nextLabel}</p>}
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="cette semaine" value={`${week > 0 ? "+" : ""}${week}`} tone={week > 0 ? "up" : week < 0 ? "down" : undefined} />
        <Stat label={rank.games > 1 ? "parties" : "partie"} value={String(rank.games)} />
        <Stat label={rank.wins > 1 ? "victoires" : "victoire"} value={String(rank.wins)} />
      </div>
    </section>
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
          <span>{MEDALS[h.place - 1]}</span>
          <span className="text-slate-300">{h.correct}/10</span>
          <span className={clsx("font-black", h.delta >= 0 ? "text-emerald-300" : "text-rose-300")}>{h.delta >= 0 ? "+" : ""}{h.delta}</span>
        </div>
      ))}
    </div>
  );
}

function Place({ place }: { place: number }) {
  return <span className={clsx("w-7 shrink-0 text-center font-black", place <= 3 ? "text-lg" : "text-sm text-slate-500")}>{MEDALS[place - 1] ?? place}</span>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-400">{text}</p>;
}

function RankBoard({ rows }: { rows: ReturnType<typeof useRanked.getState>["board"] }) {
  if (rows.length === 0) return <Empty text="Personne n'a encore joué en classé. Lance la première partie !" />;
  return (
    <div className="qb-stagger divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
      {rows.map((r) => (
        <div key={r.id} className={clsx("flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-white/[0.03]", r.isMe && "bg-violet-500/15")}>
          <Place place={r.place} />
          <Avatar emoji={r.avatar} photo={r.photoThumb} rp={r.rp} size="sm" name={r.pseudo} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-white">{r.pseudo}{r.isMe && <span className="ml-1.5 text-[10px] text-violet-300">toi</span>}</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <RankEmblem tierId={rankFromRp(r.rp).tier.id} size="xs" className="!h-4 !w-4 !text-[9px]" />
              {r.label} · {r.games} partie{r.games > 1 ? "s" : ""}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-sm font-black text-white">{fmt(r.rp)}</span>
            <span className={clsx("block text-[11px] font-bold", r.weekDelta > 0 ? "text-emerald-400" : r.weekDelta < 0 ? "text-rose-400" : "text-slate-600")}>
              {r.weekDelta > 0 ? `▲ ${r.weekDelta}` : r.weekDelta < 0 ? `▼ ${-r.weekDelta}` : "= 0"}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function XpBoard({ rows }: { rows: ReturnType<typeof useRanked.getState>["xp"] }) {
  if (rows.length === 0) return <Empty text="Ajoute des amis pour comparer votre XP." />;
  return (
    <div className="qb-stagger divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
      {rows.map((r) => (
        <div key={r.id} className={clsx("flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-white/[0.03]", r.isMe && "bg-violet-500/15")}>
          <Place place={r.place} />
          <Avatar emoji={r.avatar} photo={r.photoThumb} rp={r.rp} size="sm" name={r.pseudo} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-white">{r.pseudo}{r.isMe && <span className="ml-1.5 text-[10px] text-violet-300">toi</span>}</span>
            <span className="block text-[11px] text-slate-400">Niveau {r.playerLevel}</span>
          </span>
          <span className="text-right">
            <span className="block text-sm font-black text-violet-200">{fmt(r.xp)} XP</span>
            <span className={clsx("block text-[11px] font-bold", r.weeklyXp > 0 ? "text-emerald-400" : "text-slate-600")}>+{fmt(r.weeklyXp)} cette sem.</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Les paliers de rang (repliés par défaut). */
function Ladder({ rp }: { rp: number }) {
  const [open, setOpen] = useState(false);
  const current = useMemo(() => rankFromRp(rp).tier.id, [rp]);
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-center gap-1 py-2 text-sm font-semibold text-slate-400 hover:text-white">
        Les rangs et comment monter <ChevronDown size={16} className={clsx("transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <ul className="space-y-1 text-sm text-slate-300">
            <li>🥇 1re place : <b className="text-emerald-300">+20 à +30</b> pts · 🥈 2e : <b className="text-emerald-300">+2 à +9</b> · 🥉 3e : <b className="text-rose-300">−6 à −27</b></li>
            <li>Plus ton rang est haut, moins tu gagnes et plus tu perds. 10/10 : <b className="text-white">+5</b> bonus.</li>
            <li>Les flèches ▲▼ du classement montrent les points gagnés ou perdus depuis lundi.</li>
          </ul>
          <div className="grid grid-cols-4 gap-2">
            {RANK_TIERS.map((t) => (
              <div key={t.id} className={clsx("flex flex-col items-center gap-1 rounded-xl p-2 text-center", t.id === current && "bg-white/10 ring-1 ring-amber-300/50")}>
                <RankEmblem tierId={t.id} size="sm" locked={t.minRp > rp && t.id !== current} />
                <span className="text-[11px] font-bold text-white">{t.name}</span>
                <span className="text-[10px] text-slate-500">{fmt(t.minRp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
