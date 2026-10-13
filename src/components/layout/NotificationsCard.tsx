"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BellOff, Share, SquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { disablePush, enablePush, usePush } from "@/lib/push-client";
import { useCloud } from "@/lib/store/cloud-sync";

const DISMISS_KEY = "questbac-push-dismissed";

/**
 * Activation des notifications. `home` : invitation discrète sur l'accueil,
 * masquable ; `settings` : réglage complet dans le profil.
 */
export function NotificationsCard({ variant }: { variant: "home" | "settings" }) {
  const { state, busy, error } = usePush();
  const user = useCloud((s) => s.user);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignoré
    }
  };

  if (variant === "home" && (dismissed || !user || state === "on" || state === "checking" || state === "unsupported" || state === "denied")) return null;

  const perks = (
    <ul className="mt-2 space-y-1 text-sm text-slate-300">
      <li>⚔️ Quand un ami te défie ou a joué son tour</li>
      <li>🔥 Le soir, si ta série de jours va se perdre</li>
      <li>👥 Quand quelqu'un t'ajoute en ami</li>
    </ul>
  );

  return (
    <section className="relative rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-slate-900 p-4 sm:p-5">
      {variant === "home" && (
        <button type="button" onClick={dismiss} aria-label="Masquer" className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white">
          <X size={18} />
        </button>
      )}
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white">
          {state === "on" ? <Bell size={22} /> : <Bell size={22} className="animate-pulse" />}
        </span>
        <div className="min-w-0 flex-1 pr-6">
          <p className="font-bold text-white">{state === "on" ? "Notifications activées" : "Active les notifications"}</p>
          {state !== "on" && perks}
          {state === "on" && <p className="text-sm text-slate-300">Tu seras prévenu(e) des défis, des tours de duel et de ta série.</p>}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {!user ? (
          <p className="text-sm text-slate-300">
            <Link href="/profil" className="font-semibold text-violet-300 underline">Crée un compte</Link> pour recevoir des notifications.
          </p>
        ) : state === "ios-install" ? (
          <ol className="space-y-1.5 rounded-2xl bg-slate-950/50 p-3 text-sm text-slate-200">
            <li>Sur iPhone, il faut d&apos;abord installer l&apos;appli :</li>
            <li className="flex items-center gap-2">1. Dans Safari, touche <Share size={16} className="text-sky-300" /> <b>Partager</b></li>
            <li className="flex items-center gap-2">2. Choisis <SquarePlus size={16} className="text-sky-300" /> <b>Sur l&apos;écran d&apos;accueil</b></li>
            <li>3. Ouvre QuestBac depuis la nouvelle icône, puis reviens ici.</li>
          </ol>
        ) : state === "unsupported" ? (
          <p className="text-sm text-slate-400">Ce navigateur ne gère pas les notifications. Essaie Chrome, Firefox, Edge ou Safari (iOS 16.4 et plus, appli ajoutée à l&apos;écran d&apos;accueil).</p>
        ) : state === "denied" ? (
          <p className="text-sm text-amber-200">Les notifications sont bloquées pour QuestBac. Autorise-les dans les réglages du téléphone (Notifications → QuestBac), puis reviens ici.</p>
        ) : state === "on" ? (
          variant === "settings" && (
            <Button variant="secondary" onClick={() => void disablePush()} disabled={busy}>
              <BellOff size={16} /> Désactiver sur cet appareil
            </Button>
          )
        ) : (
          <Button onClick={() => void enablePush()} disabled={busy || state === "checking"} className="w-full py-3 text-base sm:w-auto">
            <Bell size={18} /> {busy ? "Activation…" : "Activer les notifications"}
          </Button>
        )}
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </div>
    </section>
  );
}
