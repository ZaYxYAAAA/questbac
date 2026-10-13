"use client";

import Link from "next/link";
import { NewsFeed } from "@/components/game/NewsFeed";
import { type FormEvent, useEffect, useState } from "react";
import { Copy, Share2, UserMinus, UserPlus } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { RankBadge } from "@/components/game/RankBadge";
import { Button } from "@/components/ui/Button";
import { levelLabel } from "@/lib/content/curriculum";
import { currentWeeklyXp } from "@/lib/game/save";
import { rankFromRp } from "@/lib/game/progression";
import { useCloud } from "@/lib/store/cloud-sync";
import { addFriend, loadFriends, removeFriend, shareInvite, useFriends } from "@/lib/store/friends-store";
import { useToasts } from "@/lib/store/toast-store";

export default function FriendsPage() {
  const { user, checked } = useCloud();
  const { code, friends, loaded, error } = useFriends();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    if (user) loadFriends();
  }, [user]);

  if (checked && !user) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <p className="text-6xl">👥</p>
        <h1 className="text-2xl font-black text-white">Joue avec tes amis</h1>
        <p className="text-slate-300">Pour ajouter des amis et comparer vos scores, crée un compte (ta progression actuelle sera conservée).</p>
        <Link href="/profil?onglet=compte" className="inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500">Créer mon compte</Link>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true);
    setFormError(null);
    try {
      const { result, friend } = await addFriend(input);
      setInput("");
      push(result === "added"
        ? { emoji: "🤝", title: friend ? `Toi et ${friend.pseudo} êtes amis !` : "Ami ajouté !", tone: "emerald" }
        : { emoji: "👥", title: "Vous êtes déjà amis.", tone: "violet" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Ajout impossible.");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!code) return;
    const done = await shareInvite(code);
    if (done === "copied") push({ emoji: "📋", title: "Lien d'invitation copié", body: "Envoie-le à tes amis !", tone: "emerald" });
    if (done === "failed") push({ emoji: "⚠️", title: "Copie impossible", body: `Donne-leur ton code : ${code}`, tone: "rose" });
  };

  const now = new Date();
  const sorted = [...friends].sort((a, b) => currentWeeklyXp(b, now) - currentWeeklyXp(a, now));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">👥 Amis</h1>
        <p className="text-sm text-slate-400">Invite-les, défie-les, suis leurs exploits.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-violet-500/30 bg-violet-600/10 p-5">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-200">Ton code d&apos;ami</p>
          <p className="my-2 font-mono text-3xl font-black tracking-widest text-white">{code ?? "…"}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={share} disabled={!code}><Share2 size={16} /> Inviter</Button>
            <Button variant="secondary" disabled={!code} onClick={() => code && navigator.clipboard?.writeText(code).then(() => push({ emoji: "📋", title: "Code copié", tone: "emerald" }))}>
              <Copy size={16} /> Copier le code
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Celui qui ouvre ton lien ou entre ton code devient ton ami.</p>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
          <label htmlFor="friend-code" className="block text-sm font-bold uppercase tracking-wider text-slate-400">Ajouter avec un code</label>
          <input
            id="friend-code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="QB-XXXXXX"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={20}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-lg uppercase text-white outline-none focus:border-violet-400"
          />
          <Button type="submit" disabled={busy || !input.trim()} className="w-full"><UserPlus size={16} /> Ajouter</Button>
          {formError && <p className="text-sm text-rose-300">{formError}</p>}
        </form>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-black text-white">Mes amis ({friends.length})</h2>
        {error && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
        {loaded && friends.length === 0 && !error && (
          <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">Pas encore d&apos;amis : partage ton lien d&apos;invitation !</p>
        )}
        {sorted.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
            <Avatar emoji={f.avatar} photo={f.photoThumb} name={f.pseudo} size="md" rp={f.rp} frame={f.frameId} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white">{f.pseudo}</p>
              <PlayerTitle titleId={f.titleId ?? rankFromRp(f.rp).tier.id} className="text-[10px]" />
              <p className="text-xs text-slate-500">Niv. {f.playerLevel} · {levelLabel(f.level)} · {currentWeeklyXp(f, now)} XP cette semaine</p>
            </div>
            <span className="hidden sm:block"><RankBadge rp={f.rp} size="sm" /></span>
            <Link href={`/duels?ami=${encodeURIComponent(f.id)}`} aria-label={`Défier ${f.pseudo}`} className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500">⚔️ Défier</Link>
            <button
              type="button"
              aria-label={`Retirer ${f.pseudo} de mes amis`}
              onClick={() => confirm(`Retirer ${f.pseudo} de tes amis ?`) && removeFriend(f.id).catch((e) => push({ emoji: "⚠️", title: e.message, tone: "rose" }))}
              className="rounded-xl p-2 text-slate-500 hover:bg-rose-600 hover:text-white"
            >
              <UserMinus size={18} />
            </button>
          </div>
        ))}
      </section>

      <NewsFeed />
    </div>
  );
}
