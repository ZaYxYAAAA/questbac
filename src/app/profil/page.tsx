"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Lock } from "lucide-react";
import { AccountSection } from "@/components/layout/AccountSection";
import { Avatar } from "@/components/game/Avatar";
import { AccuracyBars, MasteryRadar, XpBarChart } from "@/components/game/Charts";
import { BannerUpload } from "@/components/game/BannerEditor";
import { PhotoPicker } from "@/components/game/PhotoPicker";
import { ProfileBanner } from "@/components/game/ProfileBanner";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { RankEmblem } from "@/components/game/RankEmblem";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Card, SectionTitle } from "@/components/ui/Card";
import { NotificationsCard } from "@/components/layout/NotificationsCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LEVELS, levelLabel, schoolSubjects } from "@/lib/content/curriculum";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { BANNERS, PHOTO_BANNER, RARITY_STYLE, isBannerUnlocked, unlockLabel } from "@/lib/game/banners";
import { RANK_TIERS, levelFromXp, rankFromRp } from "@/lib/game/progression";
import { activeBannerId, bannerContext } from "@/lib/game/save";
import { TIER_REWARDS, activeTierReward, playerFrame, unlockedTiers } from "@/lib/game/ranks";
import { BOSSES } from "@/lib/content/bosses";
import { bossState } from "@/lib/game/boss-rules";
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
  const subjects = schoolSubjects(profile.level);
  const accuracy = game.stats.answered ? Math.round((game.stats.correct / game.stats.answered) * 100) : 0;
  const unlocked = ACHIEVEMENTS.filter((a) => game.achievements[a.id]).length;
  const [tab, setTab] = useState<"stats" | "carte" | "succes" | "reglages">("stats");
  // Lien « Créer mon compte » (?onglet=compte) : ouvre directement les réglages du compte ; ?onglet=carte : la personnalisation.
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("onglet");
    if (asked === "compte") setTab("reglages");
    if (asked === "carte") setTab("carte");
  }, []);
  const bannerId = activeBannerId(profile, bannerContext(game));
  const rank = rankFromRp(game.rp);

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
      <section className="qb-fade-up overflow-hidden rounded-3xl border bg-slate-900/80" style={{ borderColor: `${rank.tier.color}55`, boxShadow: `0 0 50px -20px ${rank.tier.color}` }}>
        <ProfileBanner bannerId={bannerId} image={profile.banner ?? profile.bannerThumb} peakRp={game.peakRp} shade={false} className="h-28 sm:h-36">
          <button type="button" onClick={() => setTab("carte")} className="absolute right-3 top-3 rounded-full bg-slate-950/60 px-3 py-1 text-xs font-bold text-white backdrop-blur hover:bg-slate-950/80">
            🎨 Personnaliser
          </button>
          <div className="h-28 sm:h-36" />
        </ProfileBanner>
        <div className="space-y-3 px-4 pb-4 sm:px-6">
          <div className="flex items-end gap-3">
            <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="xl" rp={game.rp} frame={playerFrame(profile, game.peakRp)} emblem={false} className="-mt-12 shrink-0 ring-4 ring-slate-900" />
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="truncate text-2xl font-black text-white sm:text-3xl">{profile.pseudo}</h1>
              <PlayerTitle titleId={profile.titleId} peakRp={game.peakRp} />
            </div>
          </div>
          <p className="text-sm text-slate-400">{levelLabel(profile.level)} · inscrit le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/classement" className="flex shrink-0 items-center gap-2 rounded-2xl bg-slate-950/50 py-1 pl-1 pr-3 hover:bg-slate-950/80">
              <RankEmblem tierId={rank.tier.id} division={rank.division} size="md" />
              <span>
                <span className="block text-sm font-black" style={{ color: rank.tier.color }}>{rank.label}</span>
                <span className="block text-xs text-slate-400">{game.rp.toLocaleString("fr-FR")} pts</span>
              </span>
            </Link>
            <div className="min-w-[10rem] flex-1">
              <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Niveau {level.level}</span><span>{level.current}/{level.needed} XP</span></div>
              <ProgressBar value={level.progress} height="h-3" />
            </div>
          </div>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        className="w-full flex-nowrap sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none"
        options={[
          { value: "stats", label: "Stats" },
          { value: "carte", label: "🎨 Carte" },
          { value: "succes", label: `Succès ${unlocked}/${ACHIEVEMENTS.length}` },
          { value: "reglages", label: "Réglages" },
        ]}
      />

      {tab === "stats" && (
        <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-2.5 text-center">
            <p className="text-lg font-black text-white">{s.emoji} {s.value}</p>
            <p className="text-[11px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <BossTrophies />

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

      {tab === "carte" && (
        <>
          <BannerChooser />
          <TitlesAndFrames />
        </>
      )}

      {tab === "succes" && (
        <>

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

/** Choix de la bannière : libres, gagnées (rang, niveau, boss, série, succès) ou image envoyée. */
function BannerChooser() {
  const game = useGame();
  const profile = game.profile!;
  const ctx = bannerContext(game);
  const active = activeBannerId(profile, ctx);
  const owned = BANNERS.filter((b) => isBannerUnlocked(b, ctx)).length;
  const rank = rankFromRp(game.rp);

  return (
    <Card>
      <SectionTitle icon={<span>🖼️</span>} action={<span className="text-sm text-slate-400">{owned}/{BANNERS.length}</span>}>Bannière</SectionTitle>
      <p className="mb-3 text-sm text-slate-400">Elle s&apos;affiche en haut de ta fiche et derrière ta ligne dans le classement. Monte en rang, bats des boss et garde ta série pour en gagner.</p>

      {/* Aperçu : ta ligne dans le classement */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        <div className="relative flex items-center gap-2.5 px-3 py-2.5">
          <ProfileBanner bannerId={active} image={profile.bannerThumb} peakRp={game.peakRp} fx={false} shade={false} className="!absolute inset-y-0 right-0 w-2/3 opacity-40 [mask-image:linear-gradient(90deg,transparent,#000)]" />
          <span className="relative w-7 text-center text-sm font-black text-slate-400">12</span>
          <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="sm" rp={game.rp} frame={playerFrame(profile, game.peakRp)} />
          <span className="relative min-w-0 flex-1">
            <span className="block truncate font-bold text-white">{profile.pseudo}</span>
            <span className="flex items-center gap-1 text-[11px]"><RankEmblem tierId={rank.tier.id} size="2xs" /><span className="font-semibold" style={{ color: rank.tier.color }}>{rank.label}</span></span>
          </span>
          <span className="relative text-sm font-black text-white">{game.rp.toLocaleString("fr-FR")}</span>
        </div>
        <p className="border-t border-white/5 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-500">Aperçu dans le classement</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          aria-pressed={!active}
          onClick={() => game.updateProfile({ bannerId: undefined })}
          className={clsx("qb-press overflow-hidden rounded-2xl border text-left transition", !active ? "border-violet-400 ring-2 ring-violet-400/50" : "border-white/10 hover:border-white/30")}
        >
          <ProfileBanner peakRp={game.peakRp} shade={false} className="h-16" />
          <span className="block px-2 py-1.5">
            <span className="block truncate text-xs font-bold text-white">Selon mon rang</span>
            <span className="block text-[10px] text-slate-500">Change quand tu montes</span>
          </span>
        </button>
        {BANNERS.map((b) => {
          const open = isBannerUnlocked(b, ctx);
          const selected = active === b.id;
          return (
            <button
              key={b.id}
              type="button"
              disabled={!open}
              aria-pressed={selected}
              aria-label={open ? b.name : `${b.name} (verrouillée : ${unlockLabel(b.unlock)})`}
              onClick={() => game.updateProfile({ bannerId: b.id })}
              className={clsx(
                "qb-press relative overflow-hidden rounded-2xl border text-left transition",
                selected ? "border-violet-400 ring-2 ring-violet-400/50" : open ? "border-white/10 hover:border-white/30" : "cursor-not-allowed border-white/5",
              )}
            >
              <ProfileBanner bannerId={b.id} shade={false} fx={open} className={clsx("h-16", !open && "opacity-60 saturate-50")} />
              {!open && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-slate-950/70"><Lock size={14} className="text-white/90" /></span>}
              <span className="block px-2 py-1.5">
                <span className="block truncate text-xs font-bold text-white">{b.name}</span>
                <span className={clsx("block truncate text-[10px]", open ? RARITY_STYLE[b.rarity] : "text-slate-500")}>
                  {open ? b.rarity : unlockLabel(b.unlock)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-dashed border-white/15 p-3">
        <p className="text-sm font-bold text-white">📷 Ma propre image</p>
        {profile.bannerThumb && (
          <button
            type="button"
            aria-pressed={active === PHOTO_BANNER}
            onClick={() => game.updateProfile({ bannerId: PHOTO_BANNER })}
            className={clsx("qb-press block w-full overflow-hidden rounded-xl border", active === PHOTO_BANNER ? "border-violet-400 ring-2 ring-violet-400/50" : "border-white/10")}
          >
            <ProfileBanner bannerId={PHOTO_BANNER} image={profile.banner ?? profile.bannerThumb} shade={false} className="aspect-[3/1] w-full" />
          </button>
        )}
        <BannerUpload
          hasImage={Boolean(profile.bannerThumb)}
          onChange={(r) =>
            game.updateProfile(
              r
                ? { banner: r.banner, bannerThumb: r.bannerThumb, bannerId: PHOTO_BANNER }
                : { banner: undefined, bannerThumb: undefined, ...(profile.bannerId === PHOTO_BANNER ? { bannerId: undefined } : {}) },
            )
          }
        />
        <p className="text-xs text-slate-500">Format large (3 × 1). Reste correct : les autres joueurs la voient.</p>
      </div>
    </Card>
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
      <SectionTitle icon={<span>🏅</span>} action={<Link href="/classement" className="text-sm text-violet-300 hover:text-violet-200">Tous les rangs →</Link>}>
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
              <RankEmblem tierId={r.tierId} size="sm" locked={!open} />
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

/** Collection des trophées de boss : 🏆 vaincu, 🏅 vaincu au premier essai, 🪦 perdu. */
function BossTrophies() {
  const bosses = useGame((s) => s.bosses);
  const won = BOSSES.filter((b) => bossState(bosses[b.id]) === "defeated").length;
  return (
    <Card>
      <SectionTitle icon={<span>🏆</span>}>Trophées de boss · {won}/{BOSSES.length}</SectionTitle>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {BOSSES.map((b) => {
          const r = bosses[b.id];
          const state = bossState(r);
          return (
            <Link
              key={b.id}
              href={`/boss/${b.id}`}
              title={b.name}
              className={clsx(
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-3xl transition hover:-translate-y-0.5",
                state === "defeated" ? (r?.flawless ? "border-amber-300/60 bg-amber-400/15" : "border-emerald-400/40 bg-emerald-500/10") : "border-white/10 bg-slate-900/70",
              )}
            >
              <span className={clsx(state !== "defeated" && "opacity-40 grayscale")}>{state === "lost" ? "🪦" : state === "defeated" ? b.emoji : "❔"}</span>
              {state === "defeated" && <span className="absolute -right-1 -top-1 text-base">{r?.flawless ? "🏅" : "🏆"}</span>}
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">🏅 vaincu du premier coup · 🏆 vaincu · 🪦 perdu après 3 essais</p>
    </Card>
  );
}
