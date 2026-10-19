"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Check, RotateCcw, Shuffle, X } from "lucide-react";
import { Markdown } from "@/components/ui/Markdown";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Memo } from "@/lib/content/gen/kit";

const shuffled = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Cartes mémoire : on lit le recto, on retourne la carte, on dit si on savait.
 * Les cartes « à revoir » peuvent être rejouées à la fin.
 */
export function FlashDeck({ memos, onFinish }: { memos: Memo[]; onFinish?: () => void }) {
  const [order, setOrder] = useState<number[]>(() => memos.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState<number[]>([]);
  /** Carte en train de passer à la suivante : on ignore un second appui (double clic, touche Entrée répétée). */
  const moving = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = pos >= order.length;
  const card = done ? null : memos[order[pos]];

  useEffect(() => () => {
    if (moving.current) clearTimeout(moving.current);
  }, []);

  const restart = (next: number[]) => {
    if (moving.current) clearTimeout(moving.current);
    moving.current = null;
    setOrder(next);
    setPos(0);
    setFlipped(false);
    setKnown(0);
    setReview([]);
  };
  const answer = (ok: boolean) => {
    if (!flipped || moving.current) return;
    if (ok) setKnown((k) => k + 1);
    else setReview((r) => [...r, order[pos]]);
    setFlipped(false);
    if (pos + 1 >= order.length) onFinish?.();
    // Laisse la carte se retourner avant de passer à la suivante.
    moving.current = setTimeout(() => {
      moving.current = null;
      setPos((p) => p + 1);
    }, 180);
  };

  const ratio = useMemo(() => (order.length ? pos / order.length : 0), [pos, order.length]);

  if (memos.length === 0) return null;

  if (done) {
    return (
      <div className="qb-pop space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-center">
        <p className="text-5xl">{review.length === 0 ? "🏆" : known >= order.length / 2 ? "💪" : "📚"}</p>
        <p className="text-xl font-black text-white">
          {known}/{order.length} cartes sues
        </p>
        <p className="text-sm text-slate-400">{review.length === 0 ? "Tout est su, bravo !" : `${review.length} carte${review.length > 1 ? "s" : ""} à revoir.`}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {review.length > 0 && (
            <button type="button" onClick={() => restart(review)} className="qb-press inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950">
              <RotateCcw size={16} /> Revoir les {review.length}
            </button>
          )}
          <button type="button" onClick={() => restart(shuffled(memos.length))} className="qb-press inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white">
            <Shuffle size={16} /> Tout recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ProgressBar value={ratio} height="h-2" className="flex-1" barClassName="bg-gradient-to-r from-amber-300 to-orange-500" />
        <span className="text-xs tabular-nums text-slate-400">{pos + 1}/{order.length}</span>
        <button type="button" onClick={() => restart(shuffled(memos.length))} aria-label="Mélanger" className="qb-press grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-slate-300">
          <Shuffle size={14} />
        </button>
      </div>

      <button key={`${order[pos]}-${pos}`} type="button" onClick={() => !moving.current && setFlipped((f) => !f)} className="qb-flip qb-card-in block w-full text-left" aria-label={flipped ? "Voir la question" : "Voir la réponse"}>
        <div className={clsx("qb-flip-inner", flipped && "is-flipped")}>
          <div className="qb-face flex min-h-48 flex-col justify-between gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Question</span>
            <div className="text-lg font-bold leading-snug text-white"><Markdown compact>{card!.front}</Markdown></div>
            <span className="text-xs text-slate-500">Touche la carte pour la retourner</span>
          </div>
          <div className="qb-face qb-face-back flex min-h-48 flex-col justify-between gap-3 rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 p-5 shadow-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Réponse</span>
            <div className="space-y-2">
              <div className="text-xl font-black leading-snug text-white"><Markdown compact>{card!.back}</Markdown></div>
              {card!.note && card!.note !== card!.back && <div className="text-sm text-slate-300"><Markdown compact>{card!.note}</Markdown></div>}
            </div>
            <span className="text-xs text-slate-500">Alors, tu savais ?</span>
          </div>
        </div>
      </button>

      <div className={clsx("grid grid-cols-2 gap-2 transition-opacity duration-300", flipped ? "opacity-100" : "pointer-events-none opacity-30")}>
        <button type="button" disabled={!flipped} onClick={() => answer(false)} className="qb-press flex items-center justify-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/15 py-3 font-bold text-rose-200">
          <X size={18} /> À revoir
        </button>
        <button type="button" disabled={!flipped} onClick={() => answer(true)} className="qb-press flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 py-3 font-bold text-emerald-200">
          <Check size={18} /> Je savais
        </button>
      </div>
    </div>
  );
}
