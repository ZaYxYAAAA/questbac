"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { Flag } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { MIN_MATCHES, PLACEMENT_MATCHES, TOP_STEP, parFor, stepLabel } from "@/lib/game/ranked";
import { type GroupRow, reportRanked } from "@/lib/store/ranked-store";
import { useToasts } from "@/lib/store/toast-store";
import { RankedBadge } from "./RankedBadge";

/** Une ligne de classement : place, joueur, rang (et vers quel rang il va), points. */
function PlayerRow({ row, position, sub, right, tone }: { row: GroupRow; position: ReactNode; sub: ReactNode; right: ReactNode; tone?: "up" | "down" | "muted" }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5",
        row.isMe && "bg-amber-400/10 ring-1 ring-inset ring-amber-400/50",
        tone === "muted" && "opacity-70",
      )}
    >
      <span className={clsx("w-6 shrink-0 text-center text-sm font-black", tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-slate-500")}>{position}</span>
      <Avatar emoji={row.avatar} photo={row.photoThumb} name={row.pseudo} size="sm" />
      <div className="min-w-0 flex-1">
        <p className={clsx("flex items-center gap-1.5 truncate font-semibold", row.isMe ? "text-amber-100" : "text-white")}>
          <span className="truncate">{row.pseudo}</span>
          {row.isMe && <span className="shrink-0 rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-slate-950">TOI</span>}
        </p>
        <div className="truncate text-xs text-slate-400">{sub}</div>
      </div>
      <div className="shrink-0 text-right">{right}</div>
      {!row.isMe && <ReportButton row={row} />}
    </div>
  );
}

const Points = ({ row }: { row: GroupRow }) => (
  <>
    <p className="font-mono text-sm font-black text-white">{row.total}</p>
    <p className="text-[10px] text-slate-500">{row.played} manche{row.played > 1 ? "s" : ""}</p>
  </>
);

/** Rang actuel → rang visé, en couleur. */
const Move = ({ from, to }: { from: number; to: number }) => (
  <span>
    {stepLabel(from)}
    {to !== from && <b className={to > from ? "text-emerald-300" : "text-rose-300"}> → {stepLabel(to)}</b>}
  </span>
);

function Section({ title, hint, tone, children }: { title: string; hint?: string; tone: "up" | "stay" | "down" | "wait"; children: ReactNode }) {
  return (
    <section
      className={clsx(
        "overflow-hidden rounded-2xl border",
        tone === "up" && "border-emerald-500/40 bg-emerald-500/[0.07]",
        tone === "stay" && "border-white/10 bg-slate-900/70",
        tone === "down" && "border-rose-500/40 bg-rose-500/[0.07]",
        tone === "wait" && "border-dashed border-white/10 bg-slate-900/40",
      )}
    >
      <header
        className={clsx(
          "flex items-baseline justify-between gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider",
          tone === "up" && "bg-emerald-500/15 text-emerald-300",
          tone === "stay" && "bg-white/5 text-slate-300",
          tone === "down" && "bg-rose-500/15 text-rose-300",
          tone === "wait" && "text-slate-500",
        )}
      >
        <span>{title}</span>
        {hint && <span className="text-[10px] font-semibold normal-case tracking-normal opacity-80">{hint}</span>}
      </header>
      <div className="divide-y divide-white/5">{children}</div>
    </section>
  );
}

/**
 * Groupe de la semaine, découpé en zones : ceux qui montent, ceux qui restent,
 * ceux qui descendent, et ceux qui n'ont pas encore assez joué.
 */
export function GroupStandings({ rows, par }: { rows: GroupRow[]; par: number }) {
  const classified = rows.filter((r) => r.played >= MIN_MATCHES);
  const up = classified.filter((r) => r.zone === "promotion" || r.zone === "objective");
  const stay = classified.filter((r) => r.zone === "safe" || r.zone === "review" || r.zone === "inactive");
  const down = classified.filter((r) => r.zone === "relegation");
  const waiting = rows.filter((r) => r.played < MIN_MATCHES);
  const pos = (r: GroupRow) => classified.indexOf(r) + 1;

  return (
    <div className="space-y-2.5">
      {up.length > 0 && (
        <Section title="⬆️ Montent d'une division" hint="si ça tient dimanche" tone="up">
          {up.map((r) => (
            <PlayerRow
              key={r.id}
              row={r}
              tone="up"
              position={pos(r)}
              sub={<>{r.zone === "objective" && "🎯 "}<Move from={r.step} to={Math.min(TOP_STEP, r.step + 1)} /></>}
              right={<Points row={r} />}
            />
          ))}
        </Section>
      )}
      {stay.length > 0 && (
        <Section title="➖ Restent" tone="stay">
          {stay.map((r) => (
            <PlayerRow key={r.id} row={r} position={pos(r)} sub={r.zone === "review" ? `${r.label} · en vérification` : r.label} right={<Points row={r} />} />
          ))}
        </Section>
      )}
      {down.length > 0 && (
        <Section title="⬇️ Descendent d'une division" tone="down">
          {down.map((r) => (
            <PlayerRow key={r.id} row={r} tone="down" position={pos(r)} sub={<Move from={r.step} to={Math.max(0, r.step - 1)} />} right={<Points row={r} />} />
          ))}
        </Section>
      )}
      {waiting.length > 0 && (
        <Section title="⏳ Pas encore classés" hint={`${MIN_MATCHES} manches minimum`} tone="wait">
          {waiting.map((r) => (
            <PlayerRow
              key={r.id}
              row={r}
              tone="muted"
              position="–"
              sub={`${r.label} · ${r.played}/${MIN_MATCHES} manches`}
              right={<p className="font-mono text-sm font-bold text-slate-400">{r.total}</p>}
            />
          ))}
        </Section>
      )}
      {rows.length <= 1 && (
        <p className="rounded-2xl bg-slate-900/70 p-3 text-center text-xs text-slate-400">
          Personne d&apos;autre dans ton groupe pour l&apos;instant. Tu montes quand même si ta moyenne atteint <b className="text-white">{par}</b> sur {PLACEMENT_MATCHES} manches. Invite tes amis pour vous affronter !
        </p>
      )}
    </div>
  );
}

/** Mes amis dans la matière : rang puis points de la semaine. */
export function FriendsStandings({ rows }: { rows: GroupRow[] }) {
  if (rows.length <= 1) {
    return <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">Ajoute des amis (onglet Social) pour comparer vos rangs ici.</p>;
  }
  return (
    <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
      {rows.map((r, i) => (
        <PlayerRow
          key={r.id}
          row={r}
          position={r.placed ? i + 1 : "–"}
          tone={r.placed ? undefined : "muted"}
          sub={r.placed ? (r.played ? `${r.total} pts · ${r.played} manche${r.played > 1 ? "s" : ""}` : "Pas joué cette semaine") : `En placement : ${r.placement}/${PLACEMENT_MATCHES}`}
          right={r.placed ? <RankedBadge step={r.step} size="sm" /> : <span className="text-xs text-slate-500">—</span>}
        />
      ))}
    </div>
  );
}

/** Meilleurs joueurs de la matière. */
export function TopStandings({ rows, players }: { rows: GroupRow[]; players: number }) {
  if (rows.length === 0) return <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">Personne n&apos;est encore classé ici : sois le premier !</p>;
  return (
    <div className="space-y-2">
      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
        {rows.map((r, i) => (
          <PlayerRow
            key={r.id}
            row={r}
            position={i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
            sub={`${r.total} pts cette semaine`}
            right={<RankedBadge step={r.step} size="sm" />}
          />
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">{players} joueur{players > 1 ? "s" : ""} classé{players > 1 ? "s" : ""} · objectif de départ : moyenne {parFor(0)}</p>
    </div>
  );
}

function ReportButton({ row }: { row: GroupRow }) {
  const report = async () => {
    if (!window.confirm(`Signaler ${row.pseudo} pour triche ? Après 3 signalements de joueurs différents, ses promotions sont bloquées le temps d'une vérification.`)) return;
    try {
      const r = await reportRanked(row.id);
      useToasts.getState().push({ emoji: "🚩", title: r.already ? "Déjà signalé" : "Signalement envoyé", body: r.already ? undefined : "Merci, c'est pris en compte.", tone: "emerald" });
    } catch (e) {
      useToasts.getState().push({ emoji: "⚠️", title: e instanceof Error ? e.message : "Erreur", tone: "rose" });
    }
  };
  return (
    <button type="button" onClick={report} aria-label={`Signaler ${row.pseudo}`} className="shrink-0 rounded-lg p-1 text-slate-700 hover:bg-rose-600/20 hover:text-rose-300">
      <Flag size={13} />
    </button>
  );
}
