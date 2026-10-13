"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import clsx from "clsx";
import { Swords } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { Button } from "@/components/ui/Button";
import { subjectMeta } from "@/lib/content/curriculum";
import { DUEL_REWARDS, DUEL_SECONDS, DUEL_SIZE, DUEL_THEMES, duelThemeById } from "@/lib/game/duel";
import { useCloud } from "@/lib/store/cloud-sync";
import { type DuelView, createDuel, loadDuels, useDuels } from "@/lib/store/duels-store";
import { loadFriends, useFriends } from "@/lib/store/friends-store";

const OUTCOME = {
  win: { label: "Victoire", className: "bg-emerald-500/20 text-emerald-300" },
  loss: { label: "Défaite", className: "bg-rose-500/20 text-rose-300" },
  draw: { label: "Égalité", className: "bg-amber-500/20 text-amber-300" },
} as const;

function DuelRow({ d }: { d: DuelView }) {
  const meta = subjectMeta(d.subject);
  const hoursLeft = Math.max(0, Math.round((d.expiresAt - Date.now()) / 3_600_000));
  return (
    <Link href={`/duels/${d.id}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 transition hover:border-violet-400/50">
      <Avatar emoji={d.opponent.avatar} photo={d.opponent.photoThumb} name={d.opponent.pseudo} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-white">{d.iChallenged ? "Toi" : d.opponent.pseudo} <span className="text-slate-500">vs</span> {d.iChallenged ? d.opponent.pseudo : "toi"}</p>
        <p className="truncate text-xs text-slate-400">{duelThemeById(d.chapterId) ? d.chapterTitle : `${meta.emoji} ${d.chapterTitle}`}</p>
        {d.status === "done" && d.mine && d.theirs && (
          <p className="text-xs text-slate-300">{d.mine.correct} – {d.theirs.correct}</p>
        )}
        {(d.status === "your_turn" || d.status === "waiting") && <p className="text-xs text-slate-500">Expire dans {hoursLeft} h</p>}
      </div>
      {d.status === "your_turn" && <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">À toi !</span>}
      {d.status === "waiting" && <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">En attente</span>}
      {d.outcome && (
        <span className={clsx("rounded-full px-3 py-1 text-xs font-bold", OUTCOME[d.outcome].className)}>
          {OUTCOME[d.outcome].label}{!d.rewarded && " 🎁"}
        </span>
      )}
      {d.status === "expired" && !d.outcome && <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-500">Expiré</span>}
    </Link>
  );
}

export default function DuelsPage() {
  const router = useRouter();
  const { user, checked } = useCloud();
  const { duels, loaded, error } = useDuels();
  const friends = useFriends((s) => s.friends);
  const [friendId, setFriendId] = useState("");
  const [chapterId, setChapterId] = useState(DUEL_THEMES[0].id);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadDuels();
    loadFriends();
    const ami = new URLSearchParams(window.location.search).get("ami");
    if (ami) setFriendId(ami);
  }, [user]);

  if (checked && !user) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <p className="text-6xl">⚔️</p>
        <h1 className="text-2xl font-black text-white">Duels entre amis</h1>
        <p className="text-slate-300">Crée un compte pour défier tes amis sur les mêmes questions.</p>
        <Link href="/profil" className="inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white">Créer mon compte</Link>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!friendId || !chapterId) return;
    setBusy(true);
    setFormError(null);
    try {
      const { id } = await createDuel(friendId, chapterId);
      router.push(`/duels/${id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible de lancer le duel.");
      setBusy(false);
    }
  };

  const groups = [
    { title: "À toi de jouer", items: duels.filter((d) => d.status === "your_turn") },
    { title: "Récompenses à récupérer", items: duels.filter((d) => d.outcome && !d.rewarded && d.status !== "your_turn") },
    { title: "En attente de ton adversaire", items: duels.filter((d) => d.status === "waiting") },
    { title: "Historique", items: duels.filter((d) => (d.status === "done" || d.status === "expired") && (d.rewarded || !d.outcome)) },
  ];
  const finished = duels.filter((d) => d.outcome);
  const wins = finished.filter((d) => d.outcome === "win").length;
  const draws = finished.filter((d) => d.outcome === "draw").length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">⚔️ Duels</h1>
          <p className="text-slate-400">Mêmes questions, chacun joue quand il veut. Le plus de bonnes réponses gagne, puis le plus rapide.</p>
        </div>
        {finished.length > 0 && (
          <p className="rounded-xl bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
            Bilan : <b className="text-emerald-300">{wins} V</b> · <b className="text-amber-300">{draws} N</b> · <b className="text-rose-300">{finished.length - wins - draws} D</b>
          </p>
        )}
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-3xl border border-violet-500/30 bg-violet-600/10 p-5">
        <p className="font-bold text-white">Lancer un duel</p>
        {friends.length === 0 ? (
          <p className="text-sm text-slate-300">Il te faut d&apos;abord des amis : <Link href="/amis" className="text-violet-300 underline">invite-les</Link>.</p>
        ) : (
          <>
            <select value={friendId} onChange={(e) => setFriendId(e.target.value)} aria-label="Ami à défier" className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-base text-white">
              <option value="">Choisis un ami…</option>
              {friends.map((f) => <option key={f.id} value={f.id}>{f.pseudo}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Thème du duel">
              {DUEL_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={chapterId === t.id}
                  onClick={() => setChapterId(t.id)}
                  className={clsx(
                    "rounded-2xl border p-3 text-left transition active:scale-95",
                    chapterId === t.id ? "border-violet-400 bg-violet-600/30" : "border-white/10 bg-slate-950/60 hover:border-violet-400/50",
                  )}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="block text-sm font-bold text-white">{t.title}</span>
                  <span className="block text-[11px] leading-tight text-slate-400">{t.description}</span>
                </button>
              ))}
            </div>
            <Button type="submit" disabled={busy || !friendId || !chapterId} className="w-full"><Swords size={16} /> Défier</Button>
            <p className="text-xs text-slate-400">
              Victoire +{DUEL_REWARDS.win.xp} XP et +{DUEL_REWARDS.win.rp} RP · égalité +{DUEL_REWARDS.draw.xp} XP · défaite +{DUEL_REWARDS.loss.xp} XP. {DUEL_SIZE} questions éclair, {DUEL_SECONDS} s chacune, à faire de tête. Le duel expire après 72 h.
            </p>
          </>
        )}
        {formError && <p className="text-sm text-rose-300">{formError}</p>}
      </form>

      {error && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
      {loaded && duels.length === 0 && !error && (
        <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">Aucun duel pour l&apos;instant. Lance le premier !</p>
      )}
      {groups.map((g) =>
        g.items.length ? (
          <section key={g.title} className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{g.title}</h2>
            {g.items.map((d) => <DuelRow key={d.id} d={d} />)}
          </section>
        ) : null,
      )}
    </div>
  );
}
