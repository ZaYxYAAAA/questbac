"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import clsx from "clsx";
import { SECTIONS, isActive, sectionOf, subPagesFor } from "@/components/layout/nav";
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
  const section = sectionOf(pathname);
  const subPages = subPagesFor(pathname);
  useCloudSync(hydrated);
  usePlayersSync(hydrated && profile !== null);

  useEffect(() => {
    if (hydrated) refresh();
  }, [hydrated, refresh, pathname]);

  // Remise à zéro des rangs (nouvelle époque) : une seule fois par appareil.
  const applyRankEpoch = useGame((s) => s.applyRankEpoch);
  useEffect(() => {
    if (hydrated) applyRankEpoch();
  }, [hydrated, applyRankEpoch]);

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
          {SECTIONS.map(({ id, label, icon: Icon, pages }) => {
            const open = section?.id === id;
            return (
              <div key={id}>
                <Link
                  href={pages[0].href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    id === "classe" && !open && "text-amber-300 hover:bg-amber-400/10",
                    open
                      ? id === "classe" ? "bg-amber-400/15 text-amber-100 ring-1 ring-amber-400/40" : "bg-violet-600/20 text-white ring-1 ring-violet-500/40"
                      : id !== "classe" && "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon size={19} />
                  {label}
                </Link>
                {pages.length > 1 && (
                  <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                    {pages.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className={clsx("rounded-lg px-2 py-1.5 text-sm transition", isActive(pathname, p.href) ? "font-semibold text-white" : "text-slate-500 hover:text-slate-200")}
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

        {hydrated && profile && subPages && (
          <div className="qb-no-print sticky top-14 z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur lg:hidden">
            <div className="flex gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
              {subPages.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                    isActive(pathname, href) ? "bg-violet-600 text-white" : "bg-slate-800/70 text-slate-300",
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

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

      {/* Navigation basse (mobile) : 5 onglets, le mode classé au centre */}
      <nav className="qb-no-print fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-slate-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {SECTIONS.map(({ id, label, icon: Icon, pages }) => {
          const active = section?.id === id;
          if (id === "classe") {
            return (
              <Link key={id} href={pages[0].href} className="flex flex-col items-center gap-0.5 pb-2 text-xs font-bold">
                <span
                  className={clsx(
                    "-mt-5 grid h-14 w-14 place-items-center rounded-2xl border-4 border-slate-950 bg-gradient-to-br shadow-lg transition active:scale-95",
                    active ? "from-amber-300 to-orange-500 text-slate-950 shadow-amber-500/40" : "from-amber-400/90 to-orange-600/90 text-slate-950 shadow-amber-900/40",
                  )}
                >
                  <Icon size={26} />
                </span>
                <span className={active ? "text-amber-200" : "text-amber-300/80"}>{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={id}
              href={pages[0].href}
              className={clsx("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", active ? "text-violet-300" : "text-slate-400")}
            >
              <Icon size={23} />
              {label}
            </Link>
          );
        })}
      </nav>
      <PendingInvite />
      <Toaster />
      <PromotionCelebration />
    </div>
  );
}
