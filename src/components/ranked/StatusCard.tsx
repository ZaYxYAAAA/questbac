"use client";

import clsx from "clsx";
import { CircleHelp, Clock, Play } from "lucide-react";
import { RankEmblem } from "@/components/game/RankEmblem";
import { formatCountdown } from "@/lib/game/league";
import { PLACEMENT_MATCHES, type RankedSubject, TOP_STEP, groupStatus, rankedSubjectMeta, stepLabel } from "@/lib/game/ranked";
import { RANK_STEPS } from "@/lib/game/ranks";
import type { GroupRow, RankView } from "@/lib/store/ranked-store";

const pts = (n: number) => `${n} pt${n > 1 ? "s" : ""}`;

/** Une phrase claire : où j'en suis cette semaine et ce qu'il me faut. */
function statusLine(rank: RankView, rows: GroupRow[]): { text: string; tone: "up" | "stay" | "down" | "info" } {
  if (!rank.placed) {
    const left = rank.placementLeft;
    return { text: `Placement : encore ${left} manche${left > 1 ? "s" : ""} pour obtenir ton rang`, tone: "info" };
  }
  const s = groupStatus(rows);
  const next = stepLabel(Math.min(TOP_STEP, rank.step + 1));
  const prev = stepLabel(Math.max(0, rank.step - 1));
  switch (s.kind) {
    case "absent":
    case "unranked": {
      const missing = s.kind === "unranked" ? s.missing : 3;
      return { text: `Joue encore ${missing} manche${missing > 1 ? "s" : ""} pour être classé cette semaine`, tone: "info" };
    }
    case "promotion":
      return { text: `${s.rank}${s.rank === 1 ? "er" : "e"}/${s.size} : tu passes ${next} dimanche${s.lead !== null ? ` (${pts(s.lead)} d'avance)` : ""}`, tone: "up" };
    case "objective":
      return { text: `Objectif atteint : tu passes ${next} dimanche`, tone: "up" };
    case "safe":
      return { text: `${s.rank}e/${s.size} : tu restes ${rank.label}${s.toPromotion ? ` · ${pts(s.toPromotion)} pour monter` : ""}`, tone: "stay" };
    case "relegation":
      return { text: `${s.rank}e/${s.size} : zone de descente (${prev}) · ${pts(s.toSafety)} pour te sauver`, tone: "down" };
  }
}

/** Ma division dans la matière choisie, mon statut de la semaine et le bouton pour jouer. */
export function StatusCard({ subject, rank, rows, endsIn, onPlay, onHelp, busy }: {
  subject: RankedSubject;
  rank: RankView;
  rows: GroupRow[];
  endsIn: number;
  onPlay: () => void;
  onHelp: () => void;
  busy: boolean;
}) {
  const meta = rankedSubjectMeta(subject);
  const step = RANK_STEPS[rank.step];
  const status = statusLine(rank, rows);
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 p-4">
      <div className="flex items-center gap-4">
        <RankEmblem tierId={step.tier.id} division={rank.placed ? step.division : null} locked={!rank.placed} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{meta.emoji} {meta.name}</p>
          <p className="text-2xl font-black text-white">{rank.placed ? rank.label : `Placement ${PLACEMENT_MATCHES - rank.placementLeft}/${PLACEMENT_MATCHES}`}</p>
          <p className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12} /> Promotions dans {formatCountdown(endsIn)}</p>
        </div>
        <button type="button" onClick={onHelp} aria-label="Comment ça marche ?" className="self-start rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
          <CircleHelp size={22} />
        </button>
      </div>

      <p
        className={clsx(
          "mt-3 rounded-xl px-3 py-2 text-sm font-semibold",
          status.tone === "up" && "bg-emerald-500/15 text-emerald-200",
          status.tone === "stay" && "bg-white/5 text-slate-200",
          status.tone === "down" && "bg-rose-500/15 text-rose-200",
          status.tone === "info" && "bg-amber-400/10 text-amber-100",
        )}
      >
        {status.tone === "up" ? "⬆️ " : status.tone === "down" ? "⬇️ " : status.tone === "stay" ? "➖ " : "🎯 "}
        {status.text}
      </p>

      {rank.placed && rank.played > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          Semaine : {rank.played} manche{rank.played > 1 ? "s" : ""} · {rank.total} pts · moyenne <b className={rank.avg >= rank.par ? "text-emerald-300" : "text-slate-200"}>{rank.avg}</b> (objectif {rank.par})
        </p>
      )}

      <button
        type="button"
        onClick={onPlay}
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-base font-black text-slate-950 shadow-lg shadow-amber-900/30 transition active:scale-[0.98] disabled:opacity-60"
      >
        <Play size={18} fill="currentColor" /> {busy ? "…" : `Jouer une manche · ${meta.name}`}
      </button>
    </section>
  );
}
