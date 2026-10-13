"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Gift, Lock, Play, Swords } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { DailyChest } from "@/components/game/DailyChest";
import { NotificationsCard } from "@/components/layout/NotificationsCard";
import { RankedHomeCard } from "@/components/ranked/RankedHomeCard";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { RankBadge } from "@/components/game/RankBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { bossesForLevel } from "@/lib/content/bosses";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { levelFromXp, rankFromRp } from "@/lib/game/progression";
import { CHEST_XP, dailyQuests } from "@/lib/game/quests";
import { playerFrame } from "@/lib/game/ranks";
import { bossStatus, continueChapter } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";

export default function HomePage() {
  const game = useGame();
  const profile = game.profile!;
  const level = levelFromXp(game.xp);
  const rank = rankFromRp(game.rp);
  const quests = dailyQuests(game.quests.day);
  const next = continueChapter(game, profile.level);
  const bosses = bossesForLevel(profile.level).map((b) => ({ boss: b, status: bossStatus(game, b, profile.level) }));
  const nextBoss = bosses.find((b) => b.status.unlocked && !b.status.defeated) ?? bosses.find((b) => !b.status.unlocked) ?? bosses[0];

  return (
    <div className="space-y-6">
      {/* Bandeau joueur : rang classé et niveau d'entraînement côte à côte */}
      <section className="qb-glow relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-700/40 via-slate-900 to-slate-950 p-5 sm:p-7">
        {profile.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- décor flouté
          <img src={profile.photo} alt="" aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full object-cover opacity-15 blur-md" />
        ) : (
          <div aria-hidden className="absolute -right-10 -top-10 text-[10rem] opacity-10">{profile.avatar}</div>
        )}
        <div className="relative flex items-center gap-4">
          <Link href="/profil" aria-label="Mon profil" className="shrink-0 rounded-full">
            <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="lg" rp={game.rp} frame={playerFrame(profile, game.peakRp)} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black text-white sm:text-3xl">Salut {profile.pseudo} !</h1>
            <PlayerTitle titleId={profile.titleId} peakRp={game.peakRp} />
            <p className="text-sm text-violet-200">{levelLabel(profile.level)} · Série de {game.streak.count} jour{game.streak.count > 1 ? "s" : ""} 🔥</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <Link href="/classement" className="group rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-orange-600/5 p-3 transition hover:border-amber-300/60 sm:p-4">
            <p className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-200/80">
              ⚔️ Classé <ArrowRight size={14} className="transition group-hover:translate-x-1" />
            </p>
            <div className="mt-2 flex items-center gap-3">
              <RankBadge rp={game.rp} size="sm" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {rank.nextLabel ? <>Prochain : <b className="text-white">{rank.nextLabel}</b></> : "Sommet de l'échelle !"}
            </p>
          </Link>
          <Link href="/matieres" className="group rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/15 to-indigo-600/5 p-3 transition hover:border-violet-300/60 sm:p-4">
            <p className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-violet-200/80">
              🎯 Niveau <ArrowRight size={14} className="transition group-hover:translate-x-1" />
            </p>
            <p className="mt-2 text-lg font-black leading-tight text-white">Niv. {level.level}</p>
            <ProgressBar value={level.progress} height="h-2" className="mt-1" />
            <p className="mt-2 text-xs text-slate-400">{level.current} / {level.needed} XP</p>
          </Link>
        </div>
      </section>

      {/* Reprendre */}
      {next && (
        <Link
          href={`/mission/${next.id}`}
          className={clsx("group flex items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-r p-4 transition hover:-translate-y-0.5 hover:border-white/25 sm:p-5", subjectMeta(next.subject).gradient)}
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black/25 text-3xl">{subjectMeta(next.subject).emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Continuer · {subjectMeta(next.subject).name}</p>
            <p className="truncate text-lg font-black text-white">{next.title}</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-slate-900 transition group-hover:scale-105">
            <Play size={20} className="ml-0.5" fill="currentColor" />
          </span>
        </Link>
      )}

      <NotificationsCard variant="home" />

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyChest />
        <RankedHomeCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quêtes du jour */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-black text-white">📜 Quêtes du jour</h2>
            <span className={clsx("text-xs", game.quests.chest ? "text-amber-300" : "text-slate-500")}>
              <Gift size={12} className="mr-1 inline" />{game.quests.chest ? "Coffre ouvert" : `3/3 → +${CHEST_XP} XP`}
            </span>
          </div>
          <ul className="space-y-2">
            {quests.map((q) => {
              const progress = Math.min(q.target, game.quests.progress[q.id] ?? 0);
              const done = game.quests.done.includes(q.id);
              return (
                <li key={q.id} className="flex items-center gap-3">
                  <span className="text-xl">{q.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className={clsx("truncate", done ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-slate-100")}>{q.label}</span>
                      <span className="shrink-0 text-xs text-slate-400">{progress}/{q.target}</span>
                    </div>
                    <ProgressBar value={progress / q.target} height="h-1" className="mt-1" barClassName={done ? "bg-emerald-400" : undefined} />
                  </div>
                  {done ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <span className="w-14 shrink-0 text-right text-xs font-bold text-amber-300">+{q.xp} XP</span>}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Boss à affronter */}
        {nextBoss && (
          <Link
            href={nextBoss.status.unlocked ? `/boss/${nextBoss.boss.id}` : "/boss"}
            className={clsx("relative flex items-center gap-3 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-4", nextBoss.boss.gradient)}
          >
            <div className="absolute inset-0 bg-slate-950/50" />
            <span className="qb-bob relative text-5xl">{nextBoss.boss.emoji}</span>
            <div className="relative min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">Boss à affronter</p>
              <p className="truncate text-lg font-black text-white">{nextBoss.boss.name}</p>
              <p className="text-xs text-white/75">
                {nextBoss.status.unlocked ? nextBoss.boss.title : `🔒 Encore ${nextBoss.status.required - nextBoss.status.completed} chapitre(s) à valider`}
              </p>
            </div>
            {nextBoss.status.unlocked ? (
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-slate-900"><Swords size={18} /></span>
            ) : (
              <Lock size={18} className="relative shrink-0 text-white/70" />
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
