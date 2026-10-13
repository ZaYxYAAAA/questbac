"use client";

import Link from "next/link";
import clsx from "clsx";
import { Cloud, CloudOff, Loader2, TriangleAlert } from "lucide-react";
import { useCloud } from "@/lib/store/cloud-sync";

/** Petit témoin de sauvegarde dans l'en-tête (icône seule sur mobile). */
export function SaveIndicator() {
  const status = useCloud((s) => s.status);
  if (status === "checking") return null;

  const view = {
    saved: { icon: <Cloud size={15} />, label: "Sauvegardé ✓", tone: "text-emerald-300/80" },
    saving: { icon: <Loader2 size={15} className="animate-spin" />, label: "Sauvegarde…", tone: "text-slate-400" },
    offline: { icon: <CloudOff size={15} />, label: "Hors ligne", tone: "text-amber-300" },
    error: { icon: <TriangleAlert size={15} />, label: "Non sauvegardé", tone: "text-rose-300" },
    guest: { icon: <CloudOff size={15} />, label: "Sans compte", tone: "text-slate-500" },
  }[status];

  return (
    <Link
      href="/profil#compte"
      title={status === "guest" ? "Progression enregistrée sur cet appareil uniquement : crée un compte pour la sauvegarder" : view.label}
      aria-label={view.label}
      data-testid="save-indicator"
      data-status={status}
      className={clsx("flex items-center gap-1 rounded-full px-1.5 py-1 text-xs font-semibold transition hover:bg-white/5", view.tone)}
    >
      {view.icon}
      <span className="hidden md:inline">{view.label}</span>
    </Link>
  );
}
