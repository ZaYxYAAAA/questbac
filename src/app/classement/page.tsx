"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown, Lock, Play, Swords } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { PlayerSheet, type PlayerPreview } from "@/components/game/PlayerSheet";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { ProfileBanner } from "@/components/game/ProfileBanner";
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
  const [open, setOpen] = useState<PlayerPreview | null>(null);

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
          <MyRankCard rank={rank} onOpen={() => user && setOpen(myPreview(rank.rp))} />
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
          <RankBoard key={scope} rows={scope === "amis" ? board.filter((r) => r.friend || r.isMe) : board} onOpen={setOpen} />
        ) : (
          <XpBoard key={scope} rows={scope === "amis" ? xp.filter((r) => r.friend || r.isMe) : xp} onOpen={setOpen} />
        )}
        {tab === "rangs" && <Ladder rp={rank?.rp ?? 0} />}
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
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-950/60 ring-1 ring-white/10">
          <div
            className={clsx("relative h-full overflow-hidden rounded-full bg-gradient-to-r transition-[width] duration-1000 [transition-timing-function:var(--qb-ease)]", info.tier.gradient)}
            style={{ width: `${Math.round(fill * 100)}%` }}
          >
            <span className="qbb-fx qbb-shine" />
          </div>
        </div>
        {info.nextLabel && <p className="mt-1 text-xs text-white/70">{info.rpToNext} pts avant <b className="text-white">{info.nextLabel}</b></p>}
      </ProfileBanner>
      <div className="relative grid grid-cols-3 gap-2 p-3 text-center">
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
function Row({ r, onOpen, children }: { r: RankRow | XpRowT; onOpen: (p: PlayerPreview) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(previewOf(r))}
      className={clsx("group relative flex w-full items-center gap-2.5 overflow-hidden px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]", r.isMe && "bg-violet-500/15 ring-1 ring-inset ring-violet-400/40")}
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

function RankBoard({ rows, onOpen }: { rows: RankRow[]; onOpen: (p: PlayerPreview) => void }) {
  if (rows.length === 0) return <Empty text="Personne n'a encore joué en classé. Lance la première partie !" />;
  const podium = rows.length >= 3 && rows[0].place === 1;
  const rest = podium ? rows.slice(3) : rows;
  return (
    <div className="space-y-3">
      {podium && <Podium rows={rows.slice(0, 3)} onOpen={onOpen} value={(r) => `${fmt(r.rp)} pts`} />}
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

function XpBoard({ rows, onOpen }: { rows: XpRowT[]; onOpen: (p: PlayerPreview) => void }) {
  if (rows.length === 0) return <Empty text="Ajoute des amis pour comparer votre XP." />;
  const podium = rows.length >= 3 && rows[0].place === 1;
  const rest = podium ? rows.slice(3) : rows;
  return (
    <div className="space-y-3">
      {podium && <Podium rows={rows.slice(0, 3)} onOpen={onOpen} value={(r) => `${fmt((r as XpRowT).xp)} XP`} />}
      {rest.length > 0 && (
        <div className="qb-stagger divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
          {rest.map((r) => (
            <Row key={r.id} r={r} onOpen={onOpen}>
              <Place place={r.place} />
              <Avatar emoji={r.avatar} photo={r.photoThumb} rp={r.rp} frame={r.frameId} size="sm" name={r.pseudo} />
              <span className="relative min-w-0 flex-1">
                <span className="block truncate font-bold text-white">{r.pseudo}{r.isMe && <span className="ml-1.5 text-[10px] text-violet-300">toi</span>}{r.friend && !r.isMe && <span className="ml-1.5 text-[10px] text-emerald-300">ami</span>}</span>
                <span className="block text-[11px] text-slate-300">Niveau {r.playerLevel}</span>
              </span>
              <span className="relative text-right">
                <span className="block text-sm font-black text-violet-200">{fmt(r.xp)} XP</span>
                <span className={clsx("block text-[11px] font-bold", r.weeklyXp > 0 ? "text-emerald-400" : "text-slate-500")}>+{fmt(r.weeklyXp)} cette sem.</span>
              </span>
            </Row>
          ))}
        </div>
      )}
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
                <RankEmblem tierId={t.id} size="md" locked={t.minRp > rp && t.id !== current} />
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
