"use client";

import { useAiStatus } from "@/lib/ai/client-api";

export function AiBadge() {
  const status = useAiStatus();
  if (!status) return null;
  return status.ai ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
      <span className="h-2 w-2 rounded-full bg-emerald-400" /> IA connectée
    </span>
  ) : (
    <span title="Ajoute ANTHROPIC_API_KEY dans .env.local pour activer l'IA" className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
      <span className="h-2 w-2 rounded-full bg-amber-400" /> Mode démo
    </span>
  );
}
