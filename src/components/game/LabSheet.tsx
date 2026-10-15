"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { LAB_COMPONENTS } from "@/components/math/labs";
import { labById } from "@/lib/content/labs";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import type { LabId } from "@/lib/types";

/** Labo ouvert par-dessus une mission : on manipule, puis on referme sans perdre sa partie. */
export function LabSheet({ lab, onClose }: { lab: LabId; onClose: () => void }) {
  const meta = labById(lab);
  const Lab = LAB_COMPONENTS[lab];
  const counted = useRef(false);

  // Ouvrir un labo compte pour les quêtes, comme depuis la page Labo.
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    announce(useGame.getState().recordActivity({ kind: "lab", labId: lab }), { questsOnly: true });
  }, [lab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center" role="dialog" aria-label={meta?.title ?? "Labo"}>
      <div className="qb-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="qb-sheet relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-950 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <span className="text-2xl">{meta?.emoji ?? "🧪"}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-black text-white">{meta?.title ?? "Labo"}</p>
            <p className="truncate text-xs text-slate-400">Manipule, puis reviens à ta question : ta mission t&apos;attend.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer le labo" className="qb-press grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-3 sm:p-4">
          <Lab />
        </div>
      </div>
    </div>,
    document.body,
  );
}
