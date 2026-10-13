"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Gift, Lock, Swords } from "lucide-react";
import { XpBarChart } from "@/components/game/Charts";
import { Avatar } from "@/components/game/Avatar";
import { DailyChest } from "@/components/game/DailyChest";
import { LeagueCard, LeagueResultBanner } from "@/components/game/LeagueCard";
import { NewsFeed } from "@/components/game/NewsFeed";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { RankBadge } from "@/components/game/RankBadge";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { bossesForLevel } from "@/lib/content/bosses";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { levelFromXp, rankFromRp } from "@/lib/game/progression";
import { CHEST_XP, dailyQuests } from "@/lib/game/quests";
import { playerFrame } from "@/lib/game/ranks";
import { bossStatus, chapterStars, recommendedChapters, xpHistory } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";

const SHORTCUTS = [
  { href: "/labo", emoji: "📈", title: "Labo de maths", text: "Courbes et figures à manipuler", gradient: "from-violet-600/30 to-indigo-600/10" },
  { href: "/prof", emoji: "🎓", title: "Prof IA", text: "Une fiche sur n'importe quelle notion", gradient: "from-cyan-600/30 to-sky-600/10" },
  { href: "/forge", emoji: "⚒️", title: "Forge", text: "Ton cours en photo → un QCM", gradient: "from-amber-600/30 to-orange-600/10" },
  { href: "/classement?vue=rangs", emoji: "🏆", title: "Ligues & rangs", text: "De Bronze à Légende", gradient: "from-pink-600/30 to-rose-600/10" },
];

export default function HomePage() {
  const game = useGame();
  const profile = game.profile!;
  const level = levelFromXp(game.xp);
  const rank = rankFromRp(game.rp);
  const quests = dailyQuests(game.quests.day);
  const recos = recommendedChapters(game, profile.level);
  const bosses = bossesForLevel(profile.level).map((b) => ({ boss: b, status: bossStatus(game, b, profile.level) }));
  const nextBoss = bosses.find((b) => b.status.unlocked && !b.status.defeated) ?? bosses.find((b) => !b.status.unlocked) ?? bosses[0];

  return (
    <div className="space-y-6">
      {/* Bandeau joueur */}
      <section className="qb-glow relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-700/40 via-slate-900 to-slate-950 p-5 sm:p-7">
        {profile.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- décor flouté
          <img src={profile.photo} alt="" aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full object-cover opacity-15 blur-md" />
        ) : (
          <div aria-hidden className="absolute -right-10 -top-10 text-[10rem] opacity-10">{profile.avatar}</div>
        )}
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Link href="/profil" aria-label="Mon profil" className="self-start rounded-full sm:self-center">
            <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="xl" rp={game.rp} frame={playerFrame(profile, game.peakRp)} />
          </Link>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-violet-200">{levelLabel(profile.level)} · Série de {game.streak.count} jour{game.streak.count > 1 ? "s" : ""} 🔥</p>
            <div>
              <h1 className="text-3xl font-black text-white">Salut {profile.pseudo} !</h1>
              <PlayerTitle titleId={profile.titleId} peakRp={game.peakRp} />
            </div>
            <div className="max-w-md">
              <div className="mb-1 flex justify-between text-xs text-slate-300">
                <span className="font-bold">Niveau {level.level}</span>
                <span>{level.current} / {level.needed} XP</span>
              </div>
              <ProgressBar value={level.progress} height="h-3" />
            </div>
          </div>
          <div className="space-y-2 sm:text-right">
            <RankBadge rp={game.rp} size="lg" />
            {rank.nextLabel && (
              <p className="text-xs text-slate-400">Encore <b className="text-white">{rank.rpToNext} RP</b> pour {rank.nextLabel}</p>
            )}
            <Link href="/classement?vue=rangs" className="block text-xs font-semibold text-violet-300 hover:text-violet-200">Voir tous les rangs →</Link>
            <p className="text-xs text-slate-400">Cette semaine : <b className="text-white">{game.weekly.xp} XP</b></p>
          </div>
        </div>
      </section>

      <LeagueResultBanner />

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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Missions conseillées */}
        <Card className="lg:col-span-2">
          <SectionTitle icon={<span>🎯</span>} action={<Link href="/matieres" className="text-sm text-violet-300 hover:text-violet-200">Toute la carte →</Link>}>
            Missions conseillées
          </SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {recos.map((c) => {
              const s = subjectMeta(c.subject);
              const stars = chapterStars(game, c.id);
              return (
                <Link key={c.id} href={`/mission/${c.id}`} className="group rounded-2xl border border-white/10 bg-slate-800/40 p-4 transition hover:-translate-y-0.5 hover:border-violet-400/50">
                  <div className={clsx("mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-xl", s.gradient)}>{s.emoji}</div>
                  <p className="text-xs text-slate-400">{s.name}</p>
                  <p className="font-bold text-white">{c.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm tracking-widest">{[1, 2, 3].map((i) => (i <= stars ? "⭐" : "☆")).join("")}</span>
                    <ArrowRight size={16} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={<span>📊</span>}>Ton XP sur 7 jours</SectionTitle>
          <XpBarChart data={xpHistory(game, 7)} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><NewsFeed /></div>
        {/* Raccourcis */}
        <div className="grid grid-cols-2 content-start gap-3">
          {SHORTCUTS.map((s) => (
            <Link key={s.href} href={s.href} className={clsx("rounded-2xl border border-white/10 bg-gradient-to-br p-4 transition hover:-translate-y-0.5 hover:border-white/25", s.gradient)}>
              <div className="text-3xl">{s.emoji}</div>
              <p className="mt-2 font-bold text-white">{s.title}</p>
              <p className="text-xs text-slate-400">{s.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
