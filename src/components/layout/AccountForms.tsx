"use client";

import { type ComponentProps, type FormEvent, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { login } from "@/lib/store/cloud-sync";

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-base text-white outline-none placeholder:text-slate-600 focus:border-violet-400";

export const labelClass = "mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400";

export function PasswordInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={clsx(inputClass, "pr-12", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 hover:text-white"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function FormError({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
      {children}
    </p>
  );
}

/** Connexion à un compte existant : la progression du compte remplace celle de l'appareil. */
export function LoginForm({ onSuccess, beforeSubmit, idPrefix = "login" }: { onSuccess?: () => void; beforeSubmit?: () => boolean; idPrefix?: string }) {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || (beforeSubmit && !beforeSubmit())) return;
    setBusy(true);
    setError(null);
    const res = await login(pseudo.trim(), password);
    setBusy(false);
    if (res.ok) onSuccess?.();
    else setError(res.error);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-pseudo`} className={labelClass}>Pseudo</label>
        <input id={`${idPrefix}-pseudo`} value={pseudo} onChange={(e) => setPseudo(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={20} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-password`} className={labelClass}>Mot de passe</label>
        <PasswordInput id={`${idPrefix}-password`} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      <FormError>{error}</FormError>
      <Button type="submit" disabled={busy || pseudo.trim().length < 2 || password.length === 0} className="w-full py-3.5 text-base">
        <LogIn size={18} /> {busy ? "Connexion…" : "Récupérer ma progression"}
      </Button>
    </form>
  );
}
