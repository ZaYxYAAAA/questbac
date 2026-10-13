"use client";

import { type FormEvent, useState } from "react";
import clsx from "clsx";
import { Sparkles, TriangleAlert } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import type { PhotoResult } from "@/components/game/PhotoEditor";
import { PhotoPicker } from "@/components/game/PhotoPicker";
import { FormError, LoginForm, PasswordInput, inputClass, labelClass } from "@/components/layout/AccountForms";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { passwordError, pseudoError } from "@/lib/account-rules";
import { LEVELS } from "@/lib/content/curriculum";
import { createInitialData } from "@/lib/game/state";
import { register } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

const AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦄", "🐺", "🦅", "🐲", "🐧", "🦋", "🤖", "🧙", "🥷", "👾"];

const FEATURES = [
  { emoji: "🗺️", title: "Missions", text: "Des quiz par chapitre, avec combos et étoiles." },
  { emoji: "💀", title: "Boss", text: "Affronte un boss par matière, chrono en main." },
  { emoji: "📈", title: "Labos", text: "Manipule les maths : tout bouge en direct." },
  { emoji: "⚔️", title: "Classé", text: "Un rang par matière, des promotions chaque semaine." },
  { emoji: "👥", title: "Duels", text: "Défie tes amis sur les mêmes questions." },
  { emoji: "🏆", title: "Classements", text: "Monte du Bronze à Légende." },
];

type Mode = "nouveau" | "compte";

export function Onboarding() {
  const completeOnboarding = useGame((s) => s.completeOnboarding);
  const [mode, setMode] = useState<Mode>("nouveau");
  const [guest, setGuest] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [level, setLevel] = useState<Level>("premiere");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = guest ? pseudo.trim().length >= 2 : !pseudoError(pseudo) && !passwordError(password);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const profile = { pseudo: pseudo.trim().slice(0, 20), avatar, level, ...(photo ?? {}) };
    if (guest) {
      if (valid) completeOnboarding(profile);
      return;
    }
    const invalid = pseudoError(pseudo) ?? passwordError(password);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError(null);
    const now = Date.now();
    const res = await register(profile.pseudo, password, { ...createInitialData(), profile: { ...profile, createdAt: now }, updatedAt: now });
    setBusy(false);
    if (!res.ok) setError(res.error);
  }

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

      <div className="qb-glow space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
        <Tabs<Mode>
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
          className="w-full [&>button]:flex-1"
          options={[
            { value: "nouveau", label: "Nouveau joueur" },
            { value: "compte", label: "J'ai déjà un compte" },
          ]}
        />

        {mode === "compte" ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Connecte-toi pour retrouver ta progression sur cet appareil.</p>
            <LoginForm idPrefix="onboarding-login" />
          </div>
        ) : (
          <form className="space-y-6" onSubmit={submit}>
            <div>
              <label htmlFor="pseudo" className={labelClass}>Ton pseudo</label>
              <input
                id="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                maxLength={20}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ex. Newton2009"
                className={clsx(inputClass, "text-lg")}
              />
            </div>

            {!guest && (
              <div>
                <label htmlFor="password" className={labelClass}>Mot de passe</label>
                <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="6 caractères minimum" />
                <p className="mt-1.5 text-xs text-slate-500">Il te permettra de retrouver ta progression sur n&apos;importe quel appareil.</p>
              </div>
            )}

            <div>
              <p className={labelClass}>Ton avatar</p>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <Avatar emoji={avatar} photo={photo?.photo} name={pseudo.trim() || undefined} size="lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <PhotoPicker hasPhoto={Boolean(photo)} onChange={setPhoto} />
                  <p className="text-xs text-slate-500">Facultatif : ajoute ta photo, ou choisis simplement un emoji.</p>
                </div>
              </div>
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
              <p className={labelClass}>Ta classe</p>
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

            {guest && (
              <p className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                <span>Sans compte, ta progression reste uniquement sur cet appareil : elle peut disparaître (navigation privée, nettoyage du navigateur, appli ajoutée à l&apos;écran d&apos;accueil…). Tu pourras créer un compte plus tard depuis ton profil.</span>
              </p>
            )}

            <FormError>{error}</FormError>

            <Button type="submit" disabled={!valid || busy} className="w-full py-3.5 text-base">
              <Sparkles size={18} /> {busy ? "Création du compte…" : guest ? "Jouer sans compte" : "Créer mon compte et jouer"}
            </Button>
            <p className="text-center text-xs text-slate-500">
              {guest ? (
                <button type="button" onClick={() => setGuest(false)} className="font-semibold text-violet-300 underline-offset-2 hover:underline">
                  Finalement, créer un compte (recommandé)
                </button>
              ) : (
                <>
                  Ta progression sera sauvegardée en ligne.{" "}
                  <button type="button" onClick={() => { setGuest(true); setError(null); }} className="font-semibold text-slate-400 underline underline-offset-2 hover:text-white">
                    Jouer sans compte
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
