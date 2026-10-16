"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Check, Swords, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { ProfileBanner } from "@/components/game/ProfileBanner";
import { RankEmblem } from "@/components/game/RankEmblem";
import { levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { rankFromRp } from "@/lib/game/progression";
import type { PublicProfile } from "@/lib/game/save";
import { addFriendById } from "@/lib/store/friends-store";
import { useToasts } from "@/lib/store/toast-store";
import type { PlayerCard } from "@/lib/server/players";
import type { SubjectId } from "@/lib/types";

/** Ce que la ligne cliquée sait déjà du joueur : affiché tout de suite, avant la réponse du serveur. */
export interface PlayerPreview {
  id: string;
  pseudo: string;
  avatar: string;
  photoThumb?: string;
  rp: number;
  titleId?: string;
  frameId?: string;
  bannerId?: string;
  bannerThumb?: string;
  friend?: boolean;
  isMe?: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const fmt = (n: number) => n.toLocaleString("fr-FR");

/** Fiche d'un joueur : bannière, rang, statistiques, dernières parties, ajout en ami. */
export function PlayerSheet({ player, onClose }: { player: PlayerPreview; onClose: () => void }) {
  const [card, setCard] = useState<PlayerCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [friend, setFriend] = useState(Boolean(player.friend));
  const push = useToasts((s) => s.push);

  useEffect(() => {
    let live = true;
    fetch(`/api/players/${encodeURIComponent(player.id)}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? `Erreur ${res.status}`);
        return json as PlayerCard;
      })
      .then((c) => {
        if (!live) return;
        setCard(c);
        setFriend(c.friend);
      })
      .catch((e) => live && setError(e instanceof Error ? e.message : "Profil indisponible."));
    return () => {
      live = false;
    };
  }, [player.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const p: Partial<PublicProfile & { banner: string }> & PlayerPreview = { ...player, ...(card?.player ?? {}) };
  const rp = card?.rank?.rp ?? p.rp;
  const info = rankFromRp(rp);
  const peak = rankFromRp(Math.max(card?.rank?.peak ?? 0, p.stats?.peakRp ?? 0, rp));
  const isMe = card?.isMe ?? player.isMe;
  const s = p.stats;
  const rank = card?.rank;
  const winRate = rank && rank.games ? Math.round((100 * rank.wins) / rank.games) : null;

  const add = async () => {
    setAdding(true);
    try {
      const r = await addFriendById(player.id);
      setFriend(true);
      push(r === "added" ? { emoji: "🤝", title: `Toi et ${p.pseudo} êtes amis !`, tone: "emerald" } : { emoji: "👥", title: "Vous êtes déjà amis.", tone: "violet" });
    } catch (e) {
      push({ emoji: "⚠️", title: e instanceof Error ? e.message : "Ajout impossible.", tone: "rose" });
    } finally {
      setAdding(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center" role="dialog" aria-label={`Profil de ${p.pseudo}`}>
      <div className="qb-backdrop absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className="qb-sheet relative flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border bg-slate-950 shadow-2xl sm:rounded-3xl"
        style={{ borderColor: `${info.tier.color}55`, boxShadow: `0 0 60px -10px ${info.tier.color}55` }}
      >
        <div className="overflow-y-auto overscroll-contain">
          <ProfileBanner bannerId={p.bannerId} image={p.banner ?? p.bannerThumb} peakRp={peak.tier.minRp} className="h-36 sm:h-40" shade={false}>
            <div className="h-36 sm:h-40" />
          </ProfileBanner>
          <button type="button" onClick={onClose} aria-label="Fermer" className="qb-press absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-slate-950/60 text-white backdrop-blur">
            <X size={18} />
          </button>

          <div className="relative px-4 pb-5">
            <div className="-mt-12 flex items-end gap-3">
              <Avatar emoji={p.avatar} photo={p.photoThumb} name={p.pseudo} size="xl" rp={rp} frame={p.frameId} emblem={false} className="ring-4 ring-slate-950" />
              <div className="min-w-0 flex-1 pb-1">
                <p className="truncate text-2xl font-black text-white drop-shadow">{p.pseudo}</p>
                <PlayerTitle titleId={p.titleId ?? info.tier.id} className="text-[11px]" />
              </div>
              <RankEmblem tierId={info.tier.id} division={info.division} size="lg" className="qb-emblem -mb-1 shrink-0" />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {card?.player.level ? levelLabel(card.player.level) : "…"}
              {p.playerLevel ? ` · Niveau ${p.playerLevel}` : ""}
              {p.xp ? ` · ${fmt(p.xp)} XP` : ""}
            </p>

            {/* Rang */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 p-3" style={{ background: `linear-gradient(135deg, ${info.tier.color}26, transparent 70%)` }}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rang actuel</p>
                  <p className="text-xl font-black" style={{ color: info.tier.color }}>{info.label}</p>
                  <p className="text-sm text-slate-300"><b className="text-white">{fmt(rp)}</b> points de rang</p>
                </div>
                {peak.label !== info.label && (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-950/50 px-2 py-1.5">
                    <RankEmblem tierId={peak.tier.id} size="xs" />
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-500">Record</p>
                      <p className="text-xs font-bold text-white">{peak.label}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className={clsx("h-full rounded-full bg-gradient-to-r", info.tier.gradient)} style={{ width: `${Math.round(info.progress * 100)}%` }} />
              </div>
              {info.nextLabel && <p className="mt-1 text-[11px] text-slate-500">{info.rpToNext} pts avant {info.nextLabel}</p>}
            </div>

            {/* Statistiques */}
            {error ? (
              <p className="mt-4 rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>
            ) : (
              <div className="qb-stagger mt-4 grid grid-cols-3 gap-2">
                <Tile emoji="⚔️" label="parties classées" value={rank ? fmt(rank.games) : card ? "0" : null} />
                <Tile emoji="🏆" label={winRate !== null ? `victoires · ${winRate} %` : "victoires"} value={rank ? fmt(rank.wins) : card ? "0" : null} />
                <Tile emoji="🔥" label="série record" value={s ? `${s.streakBest} j` : card ? "—" : null} />
                <Tile emoji="🎯" label="précision" value={s ? `${s.accuracy} %` : card ? "—" : null} />
                <Tile emoji="⚡" label="meilleur combo" value={s ? `×${s.bestCombo}` : card ? "—" : null} />
                <Tile emoji="📚" label="missions" value={s ? fmt(s.missions) : card ? "—" : null} />
                <Tile emoji="👹" label="boss vaincus" value={s ? String(s.bossesWon) : card ? "—" : null} />
                <Tile emoji="⭐" label="étoiles" value={s ? String(s.stars) : card ? "—" : null} />
                <Tile emoji="🎖️" label="succès" value={s ? String(s.achievements) : card ? "—" : null} />
              </div>
            )}

            {/* Dernières parties */}
            {rank && rank.history.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Dernières parties</p>
                <div className="flex flex-wrap gap-1.5">
                  {rank.history.map((h) => (
                    <span key={h.at} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/70 px-2 py-1 text-xs">
                      <span>{subjectMeta(h.subject as SubjectId)?.emoji}</span>
                      <span>{MEDALS[h.place - 1] ?? <b className="text-slate-300">{h.place}e</b>}</span>
                      <span className={clsx("font-black", h.delta >= 0 ? "text-emerald-300" : "text-rose-300")}>{h.delta >= 0 ? "+" : ""}{h.delta}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {!isMe && (
              <div className="mt-5 flex gap-2">
                {friend ? (
                  <>
                    <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-2.5 text-sm font-bold text-emerald-300">
                      <Check size={16} /> Ami
                    </span>
                    <Link href={`/duels?ami=${encodeURIComponent(player.id)}`} onClick={onClose} className="qb-press flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-violet-500">
                      <Swords size={16} /> Défier
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={add}
                    disabled={adding || !card}
                    className="qb-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 font-bold text-white shadow-lg disabled:opacity-60"
                  >
                    <UserPlus size={18} /> {adding ? "Ajout…" : "Ajouter en ami"}
                  </button>
                )}
              </div>
            )}
            {isMe && (
              <Link href="/profil?onglet=carte" onClick={onClose} className="qb-press mt-5 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-bold text-white hover:bg-white/15">
                🎨 Personnaliser ma carte
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Tile({ emoji, label, value }: { emoji: string; label: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/80 px-2 py-2.5 text-center">
      <p className="text-base leading-none">{emoji}</p>
      {value === null ? <p className="mx-auto mt-1.5 h-5 w-10 animate-pulse rounded bg-slate-800" /> : <p className="mt-1 text-lg font-black leading-tight text-white">{value}</p>}
      <p className="text-[10px] leading-tight text-slate-500">{label}</p>
    </div>
  );
}
