"use client";

/** Petits graphiques SVG du tableau de bord et du profil. */

export function XpBarChart({ data, height = 140 }: { data: { label: string; xp: number }[]; height?: number }) {
  const max = Math.max(50, ...data.map((d) => d.xp));
  const barW = 100 / data.length;
  return (
    <div>
      <svg viewBox={`0 0 100 ${height / 3}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="XP gagnée par jour">
        <defs>
          <linearGradient id="qb-xp-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const h = (d.xp / max) * (height / 3 - 2);
          return (
            <rect key={i} x={i * barW + barW * 0.18} width={barW * 0.64} y={height / 3 - h} height={Math.max(h, 0.4)} rx={1.2} fill={d.xp ? "url(#qb-xp-grad)" : "#1e293b"}>
              <title>{`${d.label} : ${d.xp} XP`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 grid text-center text-[10px] text-slate-500" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map((d, i) => (
          <span key={i}>
            <span className="block font-semibold text-slate-300">{d.xp || ""}</span>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AccuracyBars({ rows }: { rows: { label: string; emoji: string; color: string; answered: number; correct: number }[] }) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">Réponds à quelques questions pour voir tes statistiques.</p>;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const pct = r.answered ? r.correct / r.answered : 0;
        return (
          <div key={r.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-300">{r.emoji} {r.label}</span>
              <span className="font-mono text-slate-400">{Math.round(pct * 100)} % · {r.correct}/{r.answered}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct * 100}%`, background: r.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Radar de maîtrise par matière (0..1). */
export function MasteryRadar({ axes, size = 260 }: { axes: { label: string; value: number; color: string }[]; size?: number }) {
  const c = size / 2;
  const r = size / 2 - 38;
  const n = axes.length;
  const point = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v];
  };
  const poly = axes.map((ax, i) => point(i, Math.max(0.03, ax.value)).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[300px]" role="img" aria-label="Maîtrise par matière">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={axes.map((_, i) => point(i, k).join(",")).join(" ")} fill="none" stroke="#334155" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#334155" />;
      })}
      <polygon points={poly} fill="rgba(167,139,250,0.3)" stroke="#a78bfa" strokeWidth={2} />
      {axes.map((ax, i) => {
        const [x, y] = point(i, Math.max(0.03, ax.value));
        const [lx, ly] = point(i, 1.22);
        return (
          <g key={ax.label}>
            <circle cx={x} cy={y} r={4} fill={ax.color} />
            <text x={lx} y={ly} fill="#cbd5e1" fontSize={11} textAnchor="middle" dominantBaseline="middle">{ax.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
