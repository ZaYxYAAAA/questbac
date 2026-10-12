"use client";

import { useState } from "react";
import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LEVELS } from "@/lib/content/curriculum";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

const AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦄", "🐺", "🦅", "🐲", "🐧", "🦋", "🤖", "🧙", "🥷", "👾"];

const FEATURES = [
  { emoji: "🗺️", title: "Missions", text: "Des quiz par chapitre, avec combos et étoiles." },
  { emoji: "💀", title: "Boss", text: "Affronte un boss par matière, chrono en main." },
  { emoji: "📈", title: "Labos", text: "Manipule les maths : tout bouge en direct." },
  { emoji: "🎓", title: "Prof IA", text: "Des fiches claires sur n'importe quelle notion." },
  { emoji: "⚒️", title: "Forge", text: "Photographie ton cours, obtiens un QCM." },
  { emoji: "🏆", title: "Classements", text: "Monte du Bronze à Légende." },
];

export function Onboarding() {
  const completeOnboarding = useGame((s) => s.completeOnboarding);
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [level, setLevel] = useState<Level>("premiere");

  const valid = pseudo.trim().length >= 2;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div className="text-center">
        <div className="qb-bob mb-4 text-6xl">⚔️</div>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Bienvenue dans <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">QuestBac</span>
        </h1>
        <p className="mt-3 text-lg text-slate-400">Révise le lycée comme un jeu : gagne de l&apos;XP, terrasse des boss et grimpe dans le classement.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
            <div className="text-2xl">{f.emoji}</div>
            <p className="mt-1 font-bold text-white">{f.title}</p>
            <p className="text-xs text-slate-400">{f.text}</p>
          </div>
        ))}
      </div>

      <form
        className="qb-glow space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) completeOnboarding({ pseudo: pseudo.trim().slice(0, 20), avatar, level });
        }}
      >
        <div>
          <label htmlFor="pseudo" className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Ton pseudo</label>
          <input
            id="pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={20}
            placeholder="ex. Newton2009"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-lg text-white outline-none focus:border-violet-400"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Ton avatar</p>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                aria-label={`Avatar ${a}`}
                className={clsx("grid aspect-square place-items-center rounded-xl text-2xl transition", avatar === a ? "scale-110 bg-violet-600 ring-2 ring-violet-300" : "bg-slate-800 hover:bg-slate-700")}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Ta classe</p>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                className={clsx(
                  "rounded-2xl border p-4 text-center transition",
                  level === l.id ? "border-violet-400 bg-violet-600/25 text-white" : "border-white/10 bg-slate-800/60 text-slate-300 hover:border-white/30",
                )}
              >
                <span className="block text-2xl font-black">{l.short}</span>
                <span className="text-xs">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={!valid} className="w-full py-3.5 text-base">
          <Sparkles size={18} /> Commencer l&apos;aventure
        </Button>
        <p className="text-center text-xs text-slate-500">Ta progression est enregistrée sur cet appareil.</p>
      </form>
    </div>
  );
}
