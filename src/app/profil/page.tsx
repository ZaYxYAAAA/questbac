"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankedProfileGrid } from "@/components/ranked/RankedProfileGrid";
import clsx from "clsx";
import { Lock } from "lucide-react";
import { AccountSection } from "@/components/layout/AccountSection";
import { Avatar } from "@/components/game/Avatar";
import { AccuracyBars, MasteryRadar, XpBarChart } from "@/components/game/Charts";
import { PhotoPicker } from "@/components/game/PhotoPicker";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { RankEmblem } from "@/components/game/RankEmblem";
import { RankBadge } from "@/components/game/RankBadge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Card, SectionTitle } from "@/components/ui/Card";
import { NotificationsCard } from "@/components/layout/NotificationsCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LEVELS, levelLabel, subjectsForLevel } from "@/lib/content/curriculum";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { RANK_TIERS, levelFromXp } from "@/lib/game/progression";
import { TIER_REWARDS, activeTierReward, playerFrame, unlockedTiers } from "@/lib/game/ranks";
import { subjectProgress, xpHistory } from "@/lib/game/selectors";
import { useCloud } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

const AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦄", "🐺", "🦅", "🐲", "🐧", "🦋", "🤖", "🧙", "🥷", "👾"];

export default function ProfilePage() {
  const game = useGame();
  const profile = game.profile!;
  const level = levelFromXp(game.xp);
  const [pseudo, setPseudo] = useState(profile.pseudo);
  const account = useCloud((s) => s.user);
  const subjects = subjectsForLevel(profile.level);
  const accuracy = game.stats.answered ? Math.round((game.stats.correct / game.stats.answered) * 100) : 0;
  const unlocked = Object.keys(game.achievements).length;
  const [tab, setTab] = useState<"stats" | "succes" | "reglages">("stats");
  // Lien « Créer mon compte » (?onglet=compte) : ouvre directement les réglages du compte.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("onglet") === "compte") setTab("reglages");
  }, []);

  const stats = [
    { label: "Missions", value: game.stats.missions, emoji: "🗺️" },
    { label: "Réussite", value: `${accuracy} %`, emoji: "🎯" },
    { label: "Meilleur combo", value: game.stats.bestCombo, emoji: "🔥" },
    { label: "Boss vaincus", value: Object.values(game.bosses).filter((b) => b.victories > 0).length, emoji: "💀" },
    { label: "Meilleure série", value: `${game.streak.best} j`, emoji: "📅" },
    { label: "XP totale", value: game.xp, emoji: "✨" },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-700/30 to-slate-950 p-4 sm:p-6">
        <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="lg" rp={game.rp} frame={playerFrame(profile, game.peakRp)} className="m-1" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-black text-white sm:text-3xl">{profile.pseudo}</h1>
          <PlayerTitle titleId={profile.titleId} peakRp={game.peakRp} />
          <p className="text-sm text-slate-400">{levelLabel(profile.level)} · inscrit le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}</p>
          <div className="mt-1.5"><RankBadge rp={game.rp} size="md" /></div>
        </div>
        <div className="w-full sm:max-w-xs">
          <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Niveau {level.level}</span><span>{level.current}/{level.needed} XP</span></div>
          <ProgressBar value={level.progress} height="h-3" />
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        className="w-full flex-nowrap sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none"
        options={[
          { value: "stats", label: "Stats" },
          { value: "succes", label: `Succès ${unlocked}/${ACHIEVEMENTS.length}` },
          { value: "reglages", label: "Réglages" },
        ]}
      />

      {tab === "stats" && (
        <>
      <RankedProfileGrid />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-2.5 text-center">
            <p className="text-lg font-black text-white">{s.emoji} {s.value}</p>
            <p className="text-[11px] text-slate-400">{s.label}</p>
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

        </>
      )}

      {tab === "succes" && (
        <>
      <TitlesAndFrames />

      <Card>
        <SectionTitle icon={<span>🏆</span>} action={<span className="text-sm text-slate-400">{unlocked}/{ACHIEVEMENTS.length}</span>}>Succès</SectionTitle>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const at = game.achievements[a.id];
            return (
              <div key={a.id} className={clsx("flex items-center gap-2 rounded-2xl border p-2.5", at ? "border-amber-400/30 bg-amber-400/10" : "border-white/5 bg-slate-900/40")}>
                <span className={clsx("text-2xl", !at && "opacity-30 grayscale")}>{a.emoji}</span>
                <div className="min-w-0">
                  <p className={clsx("truncate text-sm font-bold", at ? "text-amber-200" : "text-slate-400")}>{a.name}</p>
                  <p className="line-clamp-2 text-[11px] leading-tight text-slate-500">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

        </>
      )}

      {tab === "reglages" && (
        <>
      <AccountSection />

      <NotificationsCard variant="settings" />

      <Card>
        <SectionTitle icon={<span>⚙️</span>}>Réglages</SectionTitle>
        <div className="space-y-5">
          {account ? (
            <p className="text-sm text-slate-400">Ton pseudo <b className="text-white">{account.pseudo}</b> est celui de ton compte : il sert à te connecter et au classement.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} maxLength={20} className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white" aria-label="Pseudo" />
              <Button variant="secondary" disabled={pseudo.trim().length < 2 || pseudo === profile.pseudo} onClick={() => game.updateProfile({ pseudo: pseudo.trim() })}>Renommer</Button>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-300">Photo de profil</p>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <PhotoPicker
                  hasPhoto={Boolean(profile.photo)}
                  onChange={(p) => game.updateProfile(p ? { photo: p.photo, photoThumb: p.photoThumb } : { photo: undefined, photoThumb: undefined })}
                />
                <p className="text-xs text-slate-500">
                  Sans photo, c&apos;est ton emoji qui s&apos;affiche. Les autres joueurs voient une miniature de ta photo dans le classement.
                </p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-300">Emoji{profile.photo ? " (affiché si tu retires ta photo)" : ""}</p>
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
          <Button variant="danger" onClick={() => confirm("Remettre à zéro ta progression (XP, étoiles, succès, fiches…) ? Ton profil est conservé. Cette action est irréversible.") && game.resetAll()}>
            Réinitialiser ma progression
          </Button>
        </div>
      </Card>
        </>
      )}
    </div>
  );
}

/** « Cadre de bronze » → « Bronze ». */
function shortFrame(frame: string) {
  const short = frame.replace(/^Cadre (de |d'|du )?/, "");
  return short.charAt(0).toUpperCase() + short.slice(1);
}

/** Choix du titre affiché sous le pseudo et du cadre d'avatar, parmi ceux débloqués. */
function TitlesAndFrames() {
  const game = useGame();
  const profile = game.profile!;
  const unlocked = unlockedTiers(game.peakRp);
  const activeTitle = activeTierReward(profile.titleId, game.peakRp).tierId;
  const activeFrame = playerFrame(profile, game.peakRp);
  const tierOf = (id: string) => RANK_TIERS.find((t) => t.id === id)!;

  return (
    <Card>
      <SectionTitle icon={<span>🏅</span>} action={<Link href="/classement?vue=rangs" className="text-sm text-violet-300 hover:text-violet-200">Tous les rangs →</Link>}>
        Titres et cadres
      </SectionTitle>
      <p className="mb-3 text-sm text-slate-400">
        Chaque palier atteint débloque un titre et un cadre d&apos;avatar, gardés même si tu redescends. Ils sont visibles dans le classement.
      </p>

      <p className="mb-2 text-sm font-bold text-slate-300">Titre affiché</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIER_REWARDS.map((r) => {
          const tier = tierOf(r.tierId);
          const open = unlocked.includes(r.tierId);
          const selected = activeTitle === r.tierId;
          return (
            <button
              key={r.tierId}
              type="button"
              disabled={!open}
              aria-pressed={selected}
              onClick={() => game.updateProfile({ titleId: r.tierId })}
              className={clsx(
                "flex items-center gap-2 rounded-2xl border p-2 text-left transition",
                selected ? "border-violet-400 bg-violet-600/20" : open ? "border-white/10 bg-slate-800/60 hover:border-white/25" : "cursor-not-allowed border-white/5 bg-slate-900/40",
              )}
            >
              <RankEmblem tierId={r.tierId} size="sm" locked={!open} className="!h-10 !w-10 !text-xl" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold" style={{ color: open ? tier.color : undefined }}>{open ? r.title : "???"}</span>
                <span className="block truncate text-[11px] text-slate-500">
                  {open ? tier.name : <><Lock size={10} className="mr-0.5 inline" />{tier.name}</>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-5 text-sm font-bold text-slate-300">Cadre d&apos;avatar</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          aria-pressed={!activeFrame}
          onClick={() => game.updateProfile({ frameId: undefined })}
          className={clsx("flex w-20 flex-col items-center gap-1 rounded-2xl border p-2 text-[11px]", !activeFrame ? "border-violet-400 bg-violet-600/20 text-white" : "border-white/10 bg-slate-800/60 text-slate-400")}
        >
          <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="md" rp={game.rp} emblem={false} />
          Selon mon rang
        </button>
        {TIER_REWARDS.map((r) => {
          const open = unlocked.includes(r.tierId);
          return (
            <button
              key={r.tierId}
              type="button"
              disabled={!open}
              aria-pressed={activeFrame === r.tierId}
              aria-label={open ? r.frame : `${r.frame} (verrouillé)`}
              onClick={() => game.updateProfile({ frameId: r.tierId })}
              className={clsx(
                "flex w-20 flex-col items-center gap-1 rounded-2xl border p-2 text-center text-[11px] leading-tight",
                activeFrame === r.tierId ? "border-violet-400 bg-violet-600/20 text-white" : open ? "border-white/10 bg-slate-800/60 text-slate-300" : "cursor-not-allowed border-white/5 bg-slate-900/40 text-slate-600",
              )}
            >
              <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="md" frame={r.tierId} emblem={false} className={clsx(!open && "opacity-50")} />
              {open ? shortFrame(r.frame) : <Lock size={12} />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
