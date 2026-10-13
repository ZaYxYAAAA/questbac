"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { CloudUpload, Download, LogOut, ShieldCheck, TriangleAlert, Upload, UserPlus } from "lucide-react";
import { FormError, LoginForm, PasswordInput, inputClass, labelClass } from "@/components/layout/AccountForms";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { passwordError, pseudoError } from "@/lib/account-rules";
import { parseSave, toGameData } from "@/lib/game/save";
import { logout, pushNow, register, useCloud } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";
import { useToasts } from "@/lib/store/toast-store";

const STATUS_LABEL = {
  checking: "Vérification…",
  saved: "Sauvegardé ✓",
  saving: "Sauvegarde…",
  offline: "Hors ligne : envoi dès le retour du réseau",
  error: "Échec de la sauvegarde",
  guest: "Sans compte",
} as const;

const formatDate = (ts: number) =>
  new Date(ts).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

function useStorageKind() {
  const [kind, setKind] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => alive && setKind(s.storage ?? null))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return kind;
}

function CreateAccountForm({ defaultPseudo }: { defaultPseudo: string }) {
  const [pseudo, setPseudo] = useState(defaultPseudo);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const invalid = pseudoError(pseudo) ?? passwordError(password);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError(null);
    const res = await register(pseudo.trim(), password);
    setBusy(false);
    if (res.ok) useToasts.getState().push({ emoji: "☁️", title: "Compte créé !", body: "Ta progression est maintenant sauvegardée en ligne.", tone: "emerald" });
    else setError(res.error);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="account-pseudo" className={labelClass}>Pseudo</label>
        <input id="account-pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} maxLength={20} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} className={inputClass} />
      </div>
      <div>
        <label htmlFor="account-password" className={labelClass}>Mot de passe</label>
        <PasswordInput id="account-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="6 caractères minimum" />
      </div>
      <FormError>{error}</FormError>
      <Button type="submit" disabled={busy} className="w-full">
        <UserPlus size={18} /> {busy ? "Création…" : "Créer un compte pour sauvegarder"}
      </Button>
      <p className="text-xs text-slate-500">Toute ta progression actuelle est envoyée sur ton nouveau compte.</p>
    </form>
  );
}

/** Reconnexion au compte dont la session a expiré : rien à remplacer, pas de confirmation. */
const sameAccount = (expired: string | null, pseudo: string) =>
  Boolean(expired) && expired!.trim().normalize("NFKC").toLowerCase() === pseudo.normalize("NFKC").toLowerCase();

/** Section « Compte & sauvegarde » du profil. */
export function AccountSection() {
  const { user, status, savedAt, error, expired } = useCloud();
  const profile = useGame((s) => s.profile);
  const storage = useStorageKind();
  const [panel, setPanel] = useState<"none" | "login" | "logout">("none");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToasts((s) => s.push);

  // Session perdue : on propose directement de se reconnecter au même compte.
  useEffect(() => {
    if (expired) setPanel("login");
  }, [expired]);

  function exportSave() {
    const data = toGameData(useGame.getState());
    const blob = new Blob([JSON.stringify({ app: "QuestBac", format: 1, exportedAt: new Date().toISOString(), save: data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questbac-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importSave(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      return toast({ emoji: "⚠️", title: "Fichier illisible", body: "Choisis un fichier de sauvegarde QuestBac (.json).", tone: "rose" });
    }
    const wrapped = raw && typeof raw === "object" && "save" in raw ? (raw as { save: unknown }).save : raw;
    const parsed = parseSave(wrapped);
    if (!parsed.ok || !parsed.data.profile) {
      return toast({ emoji: "⚠️", title: "Import impossible", body: parsed.ok ? "Cette sauvegarde ne contient pas de profil." : parsed.error, tone: "rose" });
    }
    const d = parsed.data;
    if (!confirm(`Remplacer ta progression actuelle par cette sauvegarde (${d.profile!.pseudo}, ${d.xp} XP) ?`)) return;
    // Nouvelle date : la version importée devient la plus récente et part sur le compte.
    useGame.getState().replaceAll({ ...d, updatedAt: Date.now() });
    toast({ emoji: "📦", title: "Sauvegarde importée", tone: "emerald" });
  }

  async function doLogout(keepLocal: boolean) {
    if (!keepLocal && !confirm("Effacer la progression de cet appareil ? Elle reste disponible sur ton compte.")) return;
    setBusy(true);
    await logout(keepLocal);
    setBusy(false);
    setPanel("none");
  }

  return (
    <section id="compte" className="scroll-mt-20">
    <Card>
      <SectionTitle icon={<span>☁️</span>}>Compte & sauvegarde</SectionTitle>
      <div className="space-y-5">
        {storage === "ephemeral" && (
          <p className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" />
            <span>Le serveur n&apos;a pas encore de base de données : les comptes peuvent être effacés à son redémarrage. Garde une copie avec « Exporter ». (Administrateur : voir le README, section « Sauvegarde et comptes ».)</span>
          </p>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <ShieldCheck className="text-emerald-300" />
              <div className="min-w-0 flex-1">
                <p className="text-white">Connecté en tant que <b>{user.pseudo}</b></p>
                <p className="text-xs text-slate-400" data-testid="save-status">
                  {STATUS_LABEL[status]}
                  {savedAt ? ` · dernière sauvegarde le ${formatDate(savedAt)}` : ""}
                </p>
              </div>
            </div>
            {error && <FormError>{error}</FormError>}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void pushNow()} disabled={status === "saving"}>
                <CloudUpload size={18} /> Sauvegarder maintenant
              </Button>
              <Button variant="ghost" onClick={() => setPanel(panel === "logout" ? "none" : "logout")}>
                <LogOut size={18} /> Se déconnecter
              </Button>
            </div>
            {panel === "logout" && (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-300">Que faire de la progression sur cet appareil ? Elle reste de toute façon sur ton compte.</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" disabled={busy} onClick={() => void doLogout(true)}>Garder sur cet appareil</Button>
                  <Button variant="danger" disabled={busy} onClick={() => void doLogout(false)}>Effacer de cet appareil</Button>
                  <Button variant="ghost" disabled={busy} onClick={() => setPanel("none")}>Annuler</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {expired ? (
              <p className="flex gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" data-testid="session-expired">
                <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                <span>
                  Session expirée : reconnecte-toi au compte <b>{expired}</b> pour continuer à sauvegarder. Rien n&apos;est perdu : ta progression est toujours sur cet appareil et sur ton compte.
                </span>
              </p>
            ) : (
              <>
                {error && <FormError>{error}</FormError>}
                <p className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                  <span>Tu joues sans compte : ta progression n&apos;existe que sur cet appareil et peut disparaître. Crée un compte pour la sauvegarder et la retrouver partout.</span>
                </p>
              </>
            )}
            {panel === "login" ? (
              <>
                <LoginForm
                  key={expired ?? ""}
                  idPrefix="profile-login"
                  defaultPseudo={expired ?? ""}
                  beforeSubmit={(pseudo) => sameAccount(expired, pseudo) || confirm("La progression de ton compte va remplacer celle de cet appareil. Continuer ?")}
                  onSuccess={() => setPanel("none")}
                />
                <button type="button" onClick={() => setPanel("none")} className="text-sm font-semibold text-violet-300 hover:underline">
                  Plutôt créer un compte
                </button>
              </>
            ) : (
              <>
                <CreateAccountForm defaultPseudo={profile?.pseudo ?? ""} />
                <button type="button" onClick={() => setPanel("login")} className="text-sm font-semibold text-violet-300 hover:underline">
                  J&apos;ai déjà un compte
                </button>
              </>
            )}
          </div>
        )}

        <div className="border-t border-white/5 pt-4">
          <p className="mb-2 text-sm font-semibold text-slate-300">Filet de sécurité</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportSave}>
              <Download size={18} /> Exporter ma sauvegarde
            </Button>
            <Button variant="secondary" onClick={() => fileInput.current?.click()}>
              <Upload size={18} /> Importer une sauvegarde
            </Button>
            <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void importSave(e)} aria-label="Fichier de sauvegarde" />
          </div>
          <p className="mt-2 text-xs text-slate-500">Un fichier .json avec toute ta progression, à garder où tu veux.</p>
        </div>
      </div>
    </Card>
    </section>
  );
}
