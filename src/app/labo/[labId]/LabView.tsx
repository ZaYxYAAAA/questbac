"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { LAB_COMPONENTS } from "@/components/math/labs";
import { CHAPTERS } from "@/lib/content/curriculum";
import { labById } from "@/lib/content/labs";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import type { LabId } from "@/lib/types";

export function LabView({ labId }: { labId: LabId }) {
  const lab = labById(labId)!;
  const Lab = LAB_COMPONENTS[labId];
  const recordActivity = useGame((s) => s.recordActivity);
  const recorded = useRef(false);
  const related = CHAPTERS.filter((c) => c.lab === labId);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    announce(recordActivity({ kind: "lab", labId }));
  }, [labId, recordActivity]);

  return (
    <div className="space-y-5">
      <Link href="/labo" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft size={16} /> Tous les labos
      </Link>
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">{lab.emoji} {lab.title}</h1>
        <p className="text-slate-400">{lab.description}</p>
      </div>
      <Lab />
      {related.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <p className="mb-2 text-sm font-bold text-slate-300">Teste-toi sur ces chapitres :</p>
          <div className="flex flex-wrap gap-2">
            {related.map((c) => (
              <Link key={c.id} href={`/mission/${c.id}`} className="rounded-xl bg-violet-600/20 px-3 py-1.5 text-sm text-violet-200 hover:bg-violet-600/40">
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
