"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Gift, Lock, Play, Swords } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { DailyChest } from "@/components/game/DailyChest";
import { NotificationsCard } from "@/components/layout/NotificationsCard";
import { LeagueCard, LeagueResultBanner } from "@/components/game/LeagueCard";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { RankBadge } from "@/components/game/RankBadge";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { bossesForLevel } from "@/lib/content/bosses";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { levelFromXp, rankFromRp } from "@/lib/game/progression";
import { CHEST_XP, dailyQuests } from "@/lib/game/quests";
import { playerFrame } from "@/lib/game/ranks";
import { bossStatus, chapterStars, continueChapter, recommendedChapters } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";

export default function HomePage() {
  const game = useGame();
  const profile = game.profile!;
  const level = levelFromXp(game.xp);
  const rank = rankFromRp(game.rp);
  const quests = dailyQuests(game.quests.day);
  const next = continueChapter(game, profile.level);
  const otherRecos = recommendedChapters(game, profile.level, 3).filter((c) => c.id !== next?.id).slice(0, 2);
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
              {rank.nextLabel ? <><b className="text-white">{rank.rpToNext} RP</b> → {rank.nextLabel}</> : "Sommet de l'échelle !"}
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

      <LeagueResultBanner />
      <NotificationsCard variant="home" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><DailyChest /></div>
        <LeagueCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quêtes du jour */}
        <Card className="lg:col-span-2">
          <SectionTitle icon={<span>📜</span>} action={<span className="text-xs text-slate-500">Renouvelées chaque jour</span>}>
            Quêtes du jour
          </SectionTitle>
          <div className="space-y-3">
            {quests.map((q) => {
              const progress = Math.min(q.target, game.quests.progress[q.id] ?? 0);
              const done = game.quests.done.includes(q.id);
              return (
                <div key={q.id} className={clsx("flex items-center gap-3 rounded-2xl border p-3", done ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/5 bg-slate-800/40")}>
                  <span className="text-2xl">{q.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className={clsx("font-semibold", done ? "text-emerald-300" : "text-slate-100")}>{q.label}</span>
                      <span className="shrink-0 text-xs text-slate-400">{progress}/{q.target}</span>
                    </div>
                    <ProgressBar value={progress / q.target} height="h-1.5" barClassName={done ? "bg-emerald-400" : undefined} />
                  </div>
                  {done ? <CheckCircle2 className="text-emerald-400" /> : <span className="shrink-0 text-xs font-bold text-amber-300">+{q.xp} XP</span>}
                </div>
              );
            })}
            <div className={clsx("flex items-center gap-3 rounded-2xl p-3 text-sm", game.quests.chest ? "bg-amber-400/15 text-amber-200" : "bg-slate-800/40 text-slate-400")}>
              <Gift className={game.quests.chest ? "text-amber-300" : ""} />
              {game.quests.chest ? "Coffre du jour ouvert ! Reviens demain pour de nouvelles quêtes." : `Termine les 3 quêtes pour ouvrir le coffre (+${CHEST_XP} XP).`}
            </div>
          </div>
        </Card>

        {/* Boss */}
        {nextBoss && (
          <Link href={nextBoss.status.unlocked ? `/boss/${nextBoss.boss.id}` : "/boss"} className="group block">
            <div className={clsx("relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5", nextBoss.boss.gradient)}>
              <div className="absolute inset-0 bg-slate-950/50 transition group-hover:bg-slate-950/35" />
              <div className="relative flex h-full flex-col">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">Boss de la semaine</p>
                <div className="qb-bob my-3 text-7xl">{nextBoss.boss.emoji}</div>
                <h3 className="text-xl font-black text-white">{nextBoss.boss.name}</h3>
                <p className="text-sm text-white/80">{nextBoss.boss.title}</p>
                <div className="mt-auto pt-4">
                  {nextBoss.status.unlocked ? (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-900">
                      <Swords size={16} /> {nextBoss.status.defeated ? "Revanche" : "Combattre"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2 text-sm text-white">
                      <Lock size={14} /> Réussis {nextBoss.status.required - nextBoss.status.completed} chapitre(s) de plus
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Autres missions conseillées */}
      {otherRecos.length > 0 && (
        <Card>
          <SectionTitle icon={<span>🎯</span>} action={<Link href="/matieres" className="text-sm text-violet-300 hover:text-violet-200">Toute la carte →</Link>}>
            Aussi conseillé
          </SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {otherRecos.map((c) => {
              const s = subjectMeta(c.subject);
              const stars = chapterStars(game, c.id);
              return (
                <Link key={c.id} href={`/mission/${c.id}`} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/40 p-3 transition hover:border-violet-400/50">
                  <div className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl", s.gradient)}>{s.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">{s.name}</p>
                    <p className="truncate font-bold text-white">{c.title}</p>
                  </div>
                  <span className="shrink-0 text-xs tracking-widest">{[1, 2, 3].map((i) => (i <= stars ? "⭐" : "☆")).join("")}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
