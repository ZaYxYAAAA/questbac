"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FlaskConical, GraduationCap, Hammer, Home, LayoutGrid, Map as MapIcon, Skull, Swords, Trophy, User, Users } from "lucide-react";
import { Onboarding } from "@/components/layout/Onboarding";
import { PendingInvite } from "@/components/layout/PendingInvite";
import { DuelNotifier } from "@/components/layout/DuelNotifier";
import { SaveIndicator } from "@/components/layout/SaveIndicator";
import { Avatar } from "@/components/game/Avatar";
import { PromotionCelebration } from "@/components/game/PromotionCelebration";
import { Toaster } from "@/components/game/Toaster";
import { RankBadge } from "@/components/game/RankBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { levelFromXp } from "@/lib/game/progression";
import { playerFrame } from "@/lib/game/ranks";
import { useCloud, useCloudSync } from "@/lib/store/cloud-sync";
import { useGame, useHydrated } from "@/lib/store/game-store";
import { usePlayersSync } from "@/lib/store/players-store";
import { initPush } from "@/lib/push-client";

const NAV = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/matieres", label: "Carte", icon: MapIcon },
  { href: "/boss", label: "Boss", icon: Skull },
  { href: "/labo", label: "Labo", icon: FlaskConical },
  { href: "/prof", label: "Prof IA", icon: GraduationCap },
  { href: "/forge", label: "Forge", icon: Hammer },
  { href: "/classement", label: "Classement", icon: Trophy },
  { href: "/amis", label: "Amis", icon: Users },
  { href: "/duels", label: "Duels", icon: Swords },
  { href: "/profil", label: "Profil", icon: User },
];

// Mobile : 4 onglets principaux + « Plus » qui ouvre le reste en grand.
const MOBILE_NAV = [NAV[0], NAV[1], NAV[7], { ...NAV[6], label: "Ligue" }];
const MOBILE_MORE = [NAV[8], NAV[2], NAV[5], NAV[4], NAV[3], NAV[9]];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

function Hud() {
  const { profile, xp, rp, peakRp, streak } = useGame();
  const level = levelFromXp(xp);
  if (!profile) return null;
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <SaveIndicator />
      <DuelNotifier />
      <div className="hidden items-center gap-2 sm:flex">
        <div className="w-28">
          <div className="mb-0.5 flex justify-between text-[10px] font-semibold text-slate-400">
            <span>Niv. {level.level}</span>
            <span>{Math.round(level.progress * 100)}%</span>
          </div>
          <ProgressBar value={level.progress} height="h-1.5" />
        </div>
      </div>
      <span className="grid h-8 min-w-8 place-items-center rounded-full bg-violet-600 px-2 text-xs font-black text-white sm:hidden">{level.level}</span>
      <span title="Série de jours" className={clsx("flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold", streak.count > 0 ? "bg-orange-500/15 text-orange-300" : "bg-slate-800 text-slate-500")}>
        🔥 {streak.count}
      </span>
      <Link href="/classement" className="hidden sm:block"><RankBadge rp={rp} size="sm" /></Link>
      <Link href="/profil" aria-label="Mon profil" className="rounded-full transition hover:brightness-110">
        <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="sm" rp={rp} frame={playerFrame(profile, peakRp)} />
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const profile = useGame((s) => s.profile);
  const refresh = useGame((s) => s.refresh);
  const cloudChecked = useCloud((s) => s.checked);
  const [moreOpen, setMoreOpen] = useState(false);
  useCloudSync(hydrated);
  usePlayersSync(hydrated && profile !== null);

  useEffect(() => {
    if (hydrated) refresh();
  }, [hydrated, refresh, pathname]);

  // Service worker + état des notifications (une fois la session connue).
  const userId = useCloud((s) => s.user?.id ?? null);
  useEffect(() => {
    if (cloudChecked) void initPush();
  }, [cloudChecked, userId]);

  // Fin de l'onboarding : l'accueil s'affiche depuis le haut, pas à la hauteur du formulaire.
  const onboarding = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    if (!profile) onboarding.current = true;
    else if (onboarding.current) {
      onboarding.current = false;
      window.scrollTo(0, 0);
    }
  }, [hydrated, profile]);

  return (
    <div className="flex min-h-dvh">
      {/* Barre latérale (ordinateur) */}
      <aside className="qb-no-print sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-white/5 bg-slate-950/60 p-4 backdrop-blur lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl shadow-lg shadow-violet-900/50">⚔️</span>
          <span className="text-xl font-black tracking-tight text-white">Quest<span className="text-violet-400">Bac</span></span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive(pathname, href) ? "bg-violet-600/20 text-white ring-1 ring-violet-500/40" : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs text-slate-600">Seconde · Première · Terminale</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="qb-no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/5 bg-slate-950/70 px-4 backdrop-blur lg:justify-end">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="text-xl">⚔️</span>
            <span className="text-lg font-black text-white">Quest<span className="text-violet-400">Bac</span></span>
          </Link>
          {hydrated && <Hud />}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 lg:pb-10">
          {/* Sans profil local, on attend la réponse du serveur : un compte connecté retrouve sa progression. */}
          {!hydrated || (!profile && !cloudChecked) ? (
            <div className="h-64 animate-pulse rounded-3xl bg-slate-900/60" />
          ) : !profile ? (
            <Onboarding />
          ) : (
            children
          )}
        </main>
      </div>

      {/* Navigation basse (mobile) */}
      {moreOpen && (
        <div className="qb-no-print fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="qb-pop absolute inset-x-3 rounded-3xl border border-white/10 bg-slate-900 p-4 shadow-2xl"
            style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_MORE.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={clsx(
                    "flex flex-col items-center gap-1.5 rounded-2xl py-4 text-sm font-semibold transition active:scale-95",
                    isActive(pathname, href) ? "bg-violet-600/25 text-white ring-1 ring-violet-500/40" : "bg-slate-800/70 text-slate-200",
                  )}
                >
                  <Icon size={26} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="qb-no-print fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-slate-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMoreOpen(false)}
            className={clsx("flex flex-col items-center gap-1 py-2.5 text-xs font-semibold", !moreOpen && isActive(pathname, href) ? "text-violet-300" : "text-slate-400")}
          >
            <Icon size={24} />
            {label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className={clsx(
            "flex flex-col items-center gap-1 py-2.5 text-xs font-semibold",
            moreOpen || MOBILE_MORE.some((n) => isActive(pathname, n.href)) ? "text-violet-300" : "text-slate-400",
          )}
        >
          <LayoutGrid size={24} />
          Plus
        </button>
      </nav>
      <PendingInvite />
      <Toaster />
      <PromotionCelebration />
    </div>
  );
}
