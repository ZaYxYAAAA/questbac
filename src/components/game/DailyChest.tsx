"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { celebrate } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { type DailyReward, dailyCalendar } from "@/lib/game/daily";
import { formatCountdown } from "@/lib/game/league";
import { dayKey } from "@/lib/game/progression";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function untilMidnight(now: number) {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - now;
}

/** Coffre de connexion quotidienne et son calendrier de 7 jours. */
export function DailyChest() {
  const daily = useGame((s) => s.daily);
  const claim = useGame((s) => s.claimDaily);
  const [now, setNow] = useState(() => Date.now());
  const [opening, setOpening] = useState(false);
  const [won, setWon] = useState<DailyReward | null>(null);
  const cal = dailyCalendar(daily, dayKey(new Date(now)));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const open = () => {
    if (opening) return;
    setOpening(true);
    // Petite attente pour laisser le coffre s'animer avant la récompense.
    setTimeout(() => {
      const result = claim();
      setOpening(false);
      if (!result) return;
      setWon(result.reward);
      announce(result.summary);
      if (!reducedMotion()) void celebrate(result.reward.day === 7 ? "big" : "small");
    }, reducedMotion() ? 0 : 600);
  };

  const today = cal.days[cal.todayIndex];

  return (
    <Card className="relative overflow-hidden">
      <SectionTitle icon={<span>🎁</span>} action={<span className="text-xs text-slate-500">Jour {today.day}/7</span>}>
        Coffre quotidien
      </SectionTitle>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 sm:w-56 sm:shrink-0 sm:flex-col sm:text-center">
          {cal.canClaim ? (
            <button
              type="button"
              onClick={open}
              aria-label="Ouvrir le coffre du jour"
              className={clsx("grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-amber-400/30 to-orange-600/20 text-5xl ring-2 ring-amber-300/60", opening ? "qb-chest-open" : "qb-wiggle")}
            >
              🎁
            </button>
          ) : (
            <span className="qb-pop grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-slate-800/70 text-5xl">{won ? won.emoji : "📦"}</span>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            {cal.canClaim ? (
              <>
                <p className="text-sm text-slate-300">Ton coffre du jour {today.day} t&apos;attend : <b className="text-amber-200">+{today.xp} XP{today.rp ? `, +${today.rp} RP` : ""}</b></p>
                <Button variant="gold" onClick={open} disabled={opening}>{opening ? "Ouverture…" : "Ouvrir le coffre"}</Button>
              </>
            ) : won ? (
              <p className="qb-pop text-sm text-slate-200">
                <b className="block text-2xl font-black text-amber-200">+{won.xp} XP{won.rp ? ` · +${won.rp} RP` : ""}</b>
                Reviens demain pour le jour {won.day === 7 ? 1 : won.day + 1} !
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Coffre ouvert. Le suivant dans <b className="tabular-nums text-white">{formatCountdown(untilMidnight(now))}</b>.
              </p>
            )}
          </div>
        </div>

        <ol className="grid flex-1 grid-cols-7 gap-1.5" aria-label="Calendrier des 7 jours">
          {cal.days.map((d) => (
            <li
              key={d.day}
              className={clsx(
                "relative flex flex-col items-center gap-0.5 rounded-xl border px-0.5 py-2 text-center",
                d.status === "claimed" && "border-emerald-500/30 bg-emerald-500/10",
                d.status === "today" && "qb-here border-amber-300/70 bg-amber-400/15",
                d.status === "next" && "border-white/15 bg-slate-800/60",
                d.status === "locked" && "border-white/5 bg-slate-900/50 opacity-60",
                d.day === 7 && d.status !== "claimed" && "border-amber-300/40 bg-gradient-to-b from-amber-500/20 to-transparent",
              )}
            >
              <span className="text-[10px] font-bold text-slate-400">J{d.day}</span>
              <span className={clsx("text-xl leading-none sm:text-2xl", d.status === "claimed" && "opacity-40")}>{d.emoji}</span>
              <span className="text-[10px] font-bold text-amber-200">+{d.xp}</span>
              {d.status === "claimed" && <Check size={14} className="absolute right-0.5 top-0.5 text-emerald-300" aria-label="Récupéré" />}
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-xs text-slate-500">Un jour manqué et le calendrier repart du jour 1. Le 7e jour : grand coffre (+250 XP).</p>
    </Card>
  );
}
