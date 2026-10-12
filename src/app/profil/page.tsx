"use client";

import { useState } from "react";
import clsx from "clsx";
import { AccuracyBars, MasteryRadar, XpBarChart } from "@/components/game/Charts";
import { RankBadge } from "@/components/game/RankBadge";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LEVELS, levelLabel, subjectsForLevel } from "@/lib/content/curriculum";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { RANK_TIERS, levelFromXp, rankFromRp } from "@/lib/game/progression";
import { subjectProgress, xpHistory } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

const AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦄", "🐺", "🦅", "🐲", "🐧", "🦋", "🤖", "🧙", "🥷", "👾"];

export default function ProfilePage() {
  const game = useGame();
  const profile = game.profile!;
  const level = levelFromXp(game.xp);
  const rank = rankFromRp(game.rp);
  const [pseudo, setPseudo] = useState(profile.pseudo);
  const subjects = subjectsForLevel(profile.level);
  const accuracy = game.stats.answered ? Math.round((game.stats.correct / game.stats.answered) * 100) : 0;
  const unlocked = Object.keys(game.achievements).length;

  const stats = [
    { label: "Niveau", value: level.level, emoji: "⭐" },
    { label: "XP totale", value: game.xp, emoji: "✨" },
    { label: "Missions", value: game.stats.missions, emoji: "🗺️" },
    { label: "Réussite", value: `${accuracy} %`, emoji: "🎯" },
    { label: "Meilleur combo", value: game.stats.bestCombo, emoji: "🔥" },
    { label: "Boss vaincus", value: Object.values(game.bosses).filter((b) => b.victories > 0).length, emoji: "💀" },
    { label: "Meilleure série", value: `${game.streak.best} j`, emoji: "📅" },
    { label: "Fiches IA", value: game.stats.fichesGenerated, emoji: "🎓" },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-700/30 to-slate-950 p-6 text-center sm:flex-row sm:text-left">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-slate-950/60 text-6xl ring-2 ring-violet-400/50">{profile.avatar}</div>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white">{profile.pseudo}</h1>
          <p className="text-slate-400">{levelLabel(profile.level)} · inscrit le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}</p>
          <div className="mt-2"><RankBadge rp={game.rp} size="lg" /></div>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Niveau {level.level}</span><span>{level.current}/{level.needed} XP</span></div>
          <ProgressBar value={level.progress} height="h-3" />
          {rank.nextLabel && (
            <>
              <div className="mb-1 mt-3 flex justify-between text-xs text-slate-400"><span>{rank.label}</span><span>{rank.nextLabel}</span></div>
              <ProgressBar value={rank.progress} height="h-2" barClassName="bg-gradient-to-r from-cyan-400 to-blue-500" />
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-xl">{s.emoji}</p>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={<span>🕸️</span>}>Maîtrise par matière ({levelLabel(profile.level)})</SectionTitle>
          <MasteryRadar axes={subjects.map((s) => ({ label: s.emoji, value: subjectProgress(game, s.id, profile.level).ratio, color: s.color }))} />
          <p className="text-center text-xs text-slate-500">Proportion d&apos;étoiles obtenues dans chaque matière.</p>
        </Card>
        <Card>
          <SectionTitle icon={<span>🎯</span>}>Taux de réussite</SectionTitle>
          <AccuracyBars
            rows={subjects
              .map((s) => ({ label: s.name, emoji: s.emoji, color: s.color, ...(game.stats.bySubject[s.id] ?? { answered: 0, correct: 0 }) }))
              .filter((r) => r.answered > 0)}
          />
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-slate-300">XP des 14 derniers jours</p>
            <XpBarChart data={xpHistory(game, 14)} height={110} />
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={<span>🏅</span>}>Échelle des rangs</SectionTitle>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {RANK_TIERS.map((t) => {
            const reached = game.rp >= t.minRp;
            const current = rank.tier.id === t.id;
            return (
              <div key={t.id} className={clsx("min-w-24 flex-1 rounded-2xl border p-3 text-center", current ? "border-violet-400 bg-violet-600/20" : reached ? "border-white/15 bg-slate-800/60" : "border-white/5 bg-slate-900/40 opacity-50")}>
                <div className="text-3xl">{t.emoji}</div>
                <p className="text-sm font-bold" style={{ color: t.color }}>{t.name}</p>
                <p className="text-xs text-slate-500">{t.minRp} RP</p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">Gagne des RP en réussissant tes missions (selon tes étoiles et ton combo) et en battant des boss. Une défaite contre un boss coûte 15 RP.</p>
      </Card>

      <Card>
        <SectionTitle icon={<span>🏆</span>} action={<span className="text-sm text-slate-400">{unlocked}/{ACHIEVEMENTS.length}</span>}>Succès</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const at = game.achievements[a.id];
            return (
              <div key={a.id} className={clsx("flex items-center gap-3 rounded-2xl border p-3", at ? "border-amber-400/30 bg-amber-400/10" : "border-white/5 bg-slate-900/40")}>
                <span className={clsx("text-3xl", !at && "opacity-30 grayscale")}>{a.emoji}</span>
                <div className="min-w-0">
                  <p className={clsx("font-bold", at ? "text-amber-200" : "text-slate-400")}>{a.name}</p>
                  <p className="text-xs text-slate-500">{a.description}{a.xp ? ` · +${a.xp} XP` : ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={<span>⚙️</span>}>Réglages</SectionTitle>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} maxLength={20} className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white" aria-label="Pseudo" />
            <Button variant="secondary" disabled={pseudo.trim().length < 2 || pseudo === profile.pseudo} onClick={() => game.updateProfile({ pseudo: pseudo.trim() })}>Renommer</Button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((a) => (
              <button key={a} type="button" onClick={() => game.updateProfile({ avatar: a })} className={clsx("grid aspect-square place-items-center rounded-xl text-2xl", profile.avatar === a ? "bg-violet-600 ring-2 ring-violet-300" : "bg-slate-800 hover:bg-slate-700")} aria-label={`Avatar ${a}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button key={l.id} type="button" onClick={() => game.setLevel(l.id as Level)} className={clsx("rounded-xl px-4 py-2 text-sm font-semibold", profile.level === l.id ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-300")}>
                {l.label}
              </button>
            ))}
          </div>
          <Button variant="danger" onClick={() => confirm("Effacer toute ta progression ? Cette action est irréversible.") && game.resetAll()}>
            Réinitialiser ma progression
          </Button>
        </div>
      </Card>
    </div>
  );
}
