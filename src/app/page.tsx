"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, CheckCircle2, Flame, Gift, Lock, Play, Swords, Zap } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { BoostChip } from "@/components/game/BoostChip";
import { DailyChest } from "@/components/game/DailyChest";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { RankEmblem } from "@/components/game/RankEmblem";
import { NotificationsCard } from "@/components/layout/NotificationsCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { bossesForLevel } from "@/lib/content/bosses";
import { chaptersFor, levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { dayKey, levelFromXp, rankFromRp } from "@/lib/game/progression";
import { CHEST_XP, dailyQuests, hashString } from "@/lib/game/quests";
import { playerFrame } from "@/lib/game/ranks";
import { bossStatus, continueChapter } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";

export default function HomePage() {
  const game = useGame();
  const profile = game.profile!;
  const level = levelFromXp(game.xp);
  const rank = rankFromRp(game.rp);
  const next = continueChapter(game, profile.level);
  const quests = dailyQuests(game.quests.day);
  const questsDone = quests.filter((q) => game.quests.done.includes(q.id)).length;
  const bosses = bossesForLevel(profile.level).map((b) => ({ boss: b, status: bossStatus(game, b, profile.level) }));
  const nextBoss =
    bosses.find((b) => b.status.unlocked && !b.status.defeated && !b.status.lost) ?? bosses.find((b) => !b.status.unlocked && !b.status.lost) ?? null;
  const cultureThemes = chaptersFor("culture", profile.level);
  const cultureToday = cultureThemes[hashString(dayKey(new Date())) % cultureThemes.length];
  const hour = new Date().getHours();
  const hello = hour < 6 ? "Bonne nuit" : hour < 18 ? "Salut" : "Bonsoir";

  return (
    <div className="space-y-5">
      {/* ── Joueur ── */}
      <section className="qb-glow relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-700/40 via-slate-900 to-slate-950 p-4 sm:p-6">
        {profile.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- décor flouté
          <img src={profile.photo} alt="" aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full object-cover opacity-15 blur-md" />
        ) : (
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 text-[9rem] opacity-10">{profile.avatar}</div>
        )}
        <div className="relative flex items-center gap-3.5">
          <Link href="/profil" aria-label="Mon profil" className="shrink-0 rounded-full transition active:scale-95">
            <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="lg" rp={game.rp} frame={playerFrame(profile, game.peakRp)} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="line-clamp-2 break-words text-xl font-black leading-tight text-white sm:text-2xl">{hello} {profile.pseudo} !</h1>
            <PlayerTitle titleId={profile.titleId} peakRp={game.peakRp} />
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-violet-200/90">
              <span>{levelLabel(profile.level)}</span>
              <span className="flex items-center gap-1 font-bold text-orange-300">
                <Flame size={14} className={game.streak.count > 0 ? "fill-orange-400 text-orange-400" : ""} /> {game.streak.count} j
              </span>
            </p>
          </div>
          <Link href="/classement" aria-label={`Mon rang : ${rank.label}`} className="shrink-0 transition active:scale-95">
            <RankEmblem tierId={rank.tier.id} division={rank.division} size="md" className="qb-emblem" />
          </Link>
        </div>
        <div className="relative mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-black text-white">Niveau {level.level}</span>
            <span className="tabular-nums text-slate-400">{level.current} / {level.needed} XP</span>
          </div>
          <ProgressBar value={level.progress} height="h-2.5" />
        </div>
        <div className="relative mt-3 flex flex-wrap gap-2 empty:hidden">
          <BoostChip long />
        </div>
      </section>

      {/* ── Reprendre ── */}
      {next && (
        <Link
          href={`/mission/${next.id}`}
          className={clsx("qb-press group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r p-4 shadow-xl sm:p-5", subjectMeta(next.subject).gradient)}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black/25 text-3xl">{subjectMeta(next.subject).emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Reprendre · {subjectMeta(next.subject).name}</p>
            <p className="truncate text-lg font-black text-white">{next.title}</p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-slate-900 shadow-lg transition group-hover:scale-110">
            <Play size={22} className="ml-0.5" fill="currentColor" />
          </span>
        </Link>
      )}

      {/* ── Accès rapides ── */}
      <section className="qb-stagger grid grid-cols-2 gap-3">
        <Tile href="/classement" gradient="from-amber-500/25 to-orange-600/10" border="border-amber-400/30">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">⚔️ Classé</span>
          <span className="flex items-center gap-2">
            <RankEmblem tierId={rank.tier.id} division={rank.division} size="xs" />
            <span className="min-w-0 truncate text-base font-black text-white">{rank.label}</span>
          </span>
          <span className="text-[11px] text-slate-400">{rank.nextLabel ? `${rank.rpToNext} pts avant ${rank.nextLabel}` : "Sommet de l'échelle"}</span>
        </Tile>

        <Tile href={`/mission/${cultureThemes[0]?.id ?? "cg-capitales"}?melange=1`} gradient="from-teal-500/25 to-cyan-600/10" border="border-teal-400/30">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">🌍 Culture G</span>
          <span className="flex items-center gap-1.5 text-base font-black text-white">
            <Zap size={16} className="text-amber-300" fill="currentColor" /> Quiz éclair
          </span>
          <span className="truncate text-[11px] text-slate-400">Thème du jour : {cultureToday?.title}</span>
        </Tile>

        {nextBoss ? (
          <Tile href={nextBoss.status.unlocked ? `/boss/${nextBoss.boss.id}` : "/boss"} gradient="from-rose-600/25 to-fuchsia-700/10" border="border-rose-400/30">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">💀 Boss</span>
            <span className="flex items-center gap-2">
              <span className={clsx("text-2xl", nextBoss.status.unlocked && "qb-bob")}>{nextBoss.status.unlocked ? nextBoss.boss.emoji : "❔"}</span>
              <span className="min-w-0 truncate text-base font-black text-white">{nextBoss.boss.name}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {nextBoss.status.unlocked ? `${nextBoss.status.triesLeft}/3 essais · coffre + boost ×2` : <><Lock size={10} className="mr-1 inline" />{nextBoss.status.required - nextBoss.status.completed} chapitre(s) à valider</>}
            </span>
          </Tile>
        ) : (
          <Tile href="/boss" gradient="from-rose-600/25 to-fuchsia-700/10" border="border-rose-400/30">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">💀 Boss</span>
            <span className="text-base font-black text-white">Tous affrontés</span>
            <span className="text-[11px] text-slate-400">Vois tes trophées</span>
          </Tile>
        )}

        <Tile href="/duels" gradient="from-violet-600/25 to-indigo-700/10" border="border-violet-400/30">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-300">🤝 Duels</span>
          <span className="flex items-center gap-1.5 text-base font-black text-white">
            <Swords size={16} /> Défier un ami
          </span>
          <span className="text-[11px] text-slate-400">10 questions de tête</span>
        </Tile>
      </section>

      {/* ── Aujourd'hui ── */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-black text-white">Aujourd&apos;hui</h2>
          <span className="text-xs capitalize text-slate-500">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
        </div>

        <DailyChest />

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-black text-white">📜 Quêtes du jour <span className="text-sm font-semibold text-slate-400">{questsDone}/{quests.length}</span></p>
            <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-bold", game.quests.chest ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-400/10 text-amber-200")}>
              <Gift size={11} className="mr-1 inline" />
              {game.quests.chest ? "Coffre ouvert" : `Toutes : +${CHEST_XP} XP et boost ×1,5`}
            </span>
          </div>
          <ul className="space-y-3">
            {quests.map((q) => {
              const progress = Math.min(q.target, game.quests.progress[q.id] ?? 0);
              const done = game.quests.done.includes(q.id);
              return (
                <li key={q.id} className="flex items-center gap-3">
                  <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg", done ? "bg-emerald-500/15" : "bg-slate-800")}>{q.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className={clsx("truncate", done ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-slate-100")}>{q.label}</span>
                      <span className="shrink-0 text-xs tabular-nums text-slate-400">{progress}/{q.target}</span>
                    </div>
                    <ProgressBar value={progress / q.target} height="h-1.5" className="mt-1" barClassName={done ? "bg-emerald-400" : undefined} />
                  </div>
                  {done ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <span className="w-14 shrink-0 text-right text-xs font-bold text-amber-300">+{q.xp} XP</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <NotificationsCard variant="home" />

      <Link href="/matieres" className="flex items-center justify-center gap-1 py-1 text-sm font-semibold text-slate-400 transition hover:text-white">
        Toutes les matières <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/** Tuile d'accès rapide de l'accueil. */
function Tile({ href, gradient, border, children }: { href: string; gradient: string; border: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={clsx("qb-press flex min-h-[7.5rem] flex-col justify-between gap-1.5 rounded-3xl border bg-gradient-to-br p-3.5 transition hover:-translate-y-0.5", gradient, border)}>
      {children}
    </Link>
  );
}
