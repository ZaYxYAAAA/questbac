"use client";

import { Button } from "@/components/ui/Button";
import { COUNTED_MATCHES, MIN_MATCHES, PLACEMENT_MATCHES, parFor } from "@/lib/game/ranked";

const STEPS = [
  { emoji: "🎯", title: "Placement", text: `${PLACEMENT_MATCHES} manches dans une matière pour obtenir ton premier rang (jusqu'à Or III).` },
  { emoji: "👥", title: "Ton groupe de la semaine", text: `Tu affrontes des joueurs de rang proche. Tes ${COUNTED_MATCHES} meilleures manches comptent, il en faut ${MIN_MATCHES} pour être classé.` },
  { emoji: "📅", title: "Dimanche à minuit", text: "⬆️ Le haut du groupe monte d'une division, ➖ le milieu reste, ⬇️ le bas descend (groupes de 6 joueurs ou plus)." },
  { emoji: "🏁", title: "L'objectif", text: `Une moyenne ≥ ${parFor(0)} en Bronze (plus haut ensuite) sur ${PLACEMENT_MATCHES} manches fait monter, même si tu es seul.` },
  { emoji: "🎓", title: "Entraînement ≠ classé", text: "Les missions, boss et duels donnent de l'XP. Seul le classé fait bouger ton rang." },
  { emoji: "🔒", title: "Jeu loyal", text: "Questions corrigées par le serveur. Quitter l'appli pendant une manche : question fausse, puis manche perdue (1 joker par jour)." },
];

/** « Comment ça marche ? » du mode classé, en 6 points. */
export function HelpSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-slate-950/80 p-3 backdrop-blur-sm sm:place-items-center" onClick={onClose}>
      <div className="qb-pop max-h-[85dvh] w-full max-w-md space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-xl font-black text-white">Comment marche le classé ?</p>
        <ol className="space-y-2.5">
          {STEPS.map((s) => (
            <li key={s.title} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-800 text-lg">{s.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{s.title}</p>
                <p className="text-xs text-slate-400">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button className="w-full" onClick={onClose}>Compris</Button>
      </div>
    </div>
  );
}
