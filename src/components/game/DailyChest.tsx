"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import { celebrate } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { activeBoost } from "@/lib/game/boost";
import { type DailyReward, dailyCalendar } from "@/lib/game/daily";
import { formatCountdown } from "@/lib/game/league";
import { dayKey } from "@/lib/game/progression";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import { play } from "@/lib/sound";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function untilMidnight(now: number) {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - now;
}

/** Coffre de connexion quotidienne et son calendrier de 7 jours. */
export function DailyChest() {
  const daily = useGame((s) => s.daily);
  const boost = useGame((s) => s.boost);
  const claim = useGame((s) => s.claimDaily);
  const [now, setNow] = useState(() => Date.now());
  const [opening, setOpening] = useState(false);
  /** Coffre ouvert et XP réellement gagnée (dimanche ×2 et boosts compris). */
  const [won, setWon] = useState<{ reward: DailyReward; xp: number } | null>(null);
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
      setWon({ reward: result.reward, xp: result.summary.xpGained });
      play("coin");
      announce(result.summary);
      if (!reducedMotion()) void celebrate(result.reward.day === 7 ? "big" : "small");
    }, reducedMotion() ? 0 : 600);
  };

  const today = cal.days[cal.todayIndex];
  // Même calcul que la récompense : le dimanche (XP ×2) ou un boost en cours s'appliquent au coffre.
  const mult = activeBoost(boost, new Date(now))?.mult ?? 1;
  const todayXp = today.xp + Math.round(today.xp * (mult - 1));

  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-3">
      {cal.canClaim ? (
        <button
          type="button"
          onClick={open}
          aria-label="Ouvrir le coffre du jour"
          className={clsx("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-600/20 text-3xl ring-2 ring-amber-300/60", opening ? "qb-chest-open" : "qb-wiggle")}
        >
          🎁
        </button>
      ) : (
        <span className="qb-pop grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-800/70 text-3xl">{won ? won.reward.emoji : "📦"}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white">
          {cal.canClaim ? <>Coffre du jour · <span className="text-amber-200">+{todayXp} XP</span></> : won ? <span className="text-amber-200">+{won.xp} XP récupérés !</span> : "Coffre ouvert"}
        </p>
        <ol className="mt-1.5 flex gap-1" aria-label={`Calendrier des 7 jours, jour ${today.day}`}>
          {cal.days.map((d) => (
            <li
              key={d.day}
              title={`Jour ${d.day} : +${d.xp} XP`}
              className={clsx(
                "grid h-5 flex-1 place-items-center rounded-md text-[10px] font-bold",
                d.status === "claimed" && "bg-emerald-500/25 text-emerald-200",
                d.status === "today" && "bg-amber-400 text-slate-950",
                (d.status === "next" || d.status === "locked") && "bg-slate-800 text-slate-500",
              )}
            >
              {d.status === "claimed" ? <Check size={11} /> : d.day === 7 ? "👑" : d.day}
            </li>
          ))}
        </ol>
        {!cal.canClaim && <p className="mt-1 text-[11px] text-slate-500">Prochain dans <span className="tabular-nums">{formatCountdown(untilMidnight(now))}</span> · un jour manqué et ça repart à 1</p>}
      </div>
      {cal.canClaim && (
        <Button variant="gold" onClick={open} disabled={opening} className="shrink-0">{opening ? "…" : "Ouvrir"}</Button>
      )}
    </div>
  );
}
