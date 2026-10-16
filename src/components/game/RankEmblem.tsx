"use client";

import { useId } from "react";
import clsx from "clsx";
import { tierById, tierIndex } from "@/lib/game/ranks";

const SIZES = {
  "2xs": "h-5 w-5",
  xs: "h-9 w-9",
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-36 w-36",
  "2xl": "h-48 w-48",
};
export type EmblemSize = keyof typeof SIZES;

/** Couleurs de chaque palier : clair, principal, sombre, reflet. */
const PALETTE: Record<string, [string, string, string, string]> = {
  bronze: ["#f3c08a", "#cd7f32", "#5b2f0e", "#ffdcb0"],
  argent: ["#f8fafc", "#a3adbb", "#3f4a5a", "#ffffff"],
  or: ["#fff3a3", "#f5b915", "#8a3b0b", "#fffbe0"],
  platine: ["#ccfbf1", "#2dd4bf", "#0b4f53", "#f0fffc"],
  diamant: ["#dbeafe", "#60a5fa", "#312e81", "#ffffff"],
  maitre: ["#f5d0fe", "#c084fc", "#4c1d70", "#fdf4ff"],
  "grand-maitre": ["#fecaca", "#ef4444", "#6b1414", "#fde68a"],
  legende: ["#fef9c3", "#fbbf24", "#8a2e0a", "#ffffff"],
};

/** Silhouettes de l'écu : classique, puis taillé, puis ouvragé. */
const SHIELDS = [
  "M60 20 L90 30 L90 62 C90 82 76 94 60 103 C44 94 30 82 30 62 L30 30 Z",
  "M60 15 L92 31 L92 68 L60 105 L28 68 L28 31 Z",
  "M60 17 L72 26 L92 23 L90 62 C90 84 75 96 60 105 C45 96 30 84 30 62 L28 23 L48 26 Z",
];
const shieldFor = (i: number) => SHIELDS[i >= 5 ? 2 : i >= 3 ? 1 : 0];

const star = (cx: number, cy: number, r: number, inner: number, points = 5) => {
  const pts: string[] = [];
  for (let k = 0; k < points * 2; k++) {
    const a = (Math.PI * k) / points - Math.PI / 2;
    const rr = k % 2 ? inner : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
};
const sparkle = (x: number, y: number, r: number) =>
  `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;

/** Feuilles de laurier le long d'un arc, côté gauche (le droit est en miroir). */
const LAURELS = Array.from({ length: 6 }, (_, k) => {
  const a = ((118 + k * 15) * Math.PI) / 180;
  const x = 60 + 41 * Math.cos(a);
  const y = 62 + 41 * Math.sin(a);
  return { x, y, rot: (a * 180) / Math.PI + 90 - 25 };
});

/** Plumes d'aile, côté gauche. */
const FEATHERS = Array.from({ length: 4 }, (_, k) => {
  const by = 38 + k * 8;
  const tx = 3 + k * 6;
  const ty = 20 + k * 13;
  return `M31 ${by} Q${(tx + 31) / 2 - 4} ${ty - 6} ${tx} ${ty} Q${(tx + 31) / 2 + 2} ${ty + 6} 31 ${by + 8} Z`;
});

const FLAMES = [
  { x: 60, h: 4, d: 0 },
  { x: 46, h: 14, d: 0.3 },
  { x: 74, h: 14, d: 0.6 },
  { x: 35, h: 26, d: 0.15 },
  { x: 85, h: 26, d: 0.45 },
];
const flame = (x: number, top: number) => `M${x} 46 C${x - 10} 36 ${x - 5} ${top + 14} ${x} ${top} C${x + 5} ${top + 14} ${x + 10} 36 ${x} 46 Z`;

/**
 * Emblème d'un palier, de plus en plus ouvragé : écu simple (Bronze), biseau
 * (Argent), lauriers et reflet (Or), cristal et halo (Platine), ailes et
 * étincelles (Diamant), cercle de runes (Maître), flammes (Grand Maître),
 * couronne et rayons (Légende). `locked` : silhouette mystère.
 */
export function RankEmblem({
  tierId,
  size = "md",
  locked = false,
  division,
  className,
}: {
  tierId: string;
  size?: EmblemSize;
  locked?: boolean;
  division?: string | null;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tier = tierById(tierId);
  const i = tierIndex(tier.id);
  const [light, main, dark, glint] = PALETTE[tier.id] ?? PALETTE.bronze;
  const shield = shieldFor(i);
  const tiny = size === "2xs" || size === "xs";
  const id = (n: string) => `${n}${uid}`;
  const url = (n: string) => `url(#${id(n)})`;
  const pips = division === "III" ? 1 : division === "II" ? 2 : division === "I" ? 3 : 0;

  if (locked) {
    return (
      <span className={clsx("relative inline-block shrink-0", SIZES[size], className)} aria-hidden>
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <defs>
            <linearGradient id={id("lk")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#334155" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <path d={shield} fill={url("lk")} stroke="#475569" strokeWidth="3" />
          <text x="60" y="73" textAnchor="middle" fontSize="36" fontWeight="900" fill="#94a3b8">?</text>
        </svg>
      </span>
    );
  }

  return (
    <span
      className={clsx("relative inline-block shrink-0", SIZES[size], className)}
      style={i >= 3 && !tiny ? { filter: `drop-shadow(0 0 ${4 + i * 1.5}px ${main}99)` } : undefined}
      role="img"
      aria-label={`Rang ${tier.name}${division ? ` ${division}` : ""}`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="0.45" stopColor={main} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
          <linearGradient id={id("rim")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={glint} />
            <stop offset="0.5" stopColor={main} />
            <stop offset="1" stopColor={glint} />
          </linearGradient>
          <linearGradient id={id("core")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={dark} />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id={id("rainbow")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde047" />
            <stop offset="0.3" stopColor="#f472b6" />
            <stop offset="0.6" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id={id("aura")}>
            <stop offset="0" stopColor={main} stopOpacity="0.7" />
            <stop offset="1" stopColor={main} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id("orb")} cx="0.35" cy="0.3">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor={light} />
            <stop offset="1" stopColor={main} />
          </radialGradient>
          <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={id("clip")}>
            <path d={shield} />
          </clipPath>
        </defs>

        {/* Halo (Platine +) */}
        {i >= 3 && <circle cx="60" cy="60" r="56" fill={url("aura")} className={tiny ? undefined : "qbe-pulse"} />}

        {/* Rayons (Légende) */}
        {i >= 7 && (
          <g className={tiny ? undefined : "qbe-spin"} opacity="0.55">
            {Array.from({ length: 16 }, (_, k) => (
              <path key={k} d="M60 60 L57 2 L63 2 Z" fill={k % 2 ? light : main} transform={`rotate(${k * 22.5} 60 60)`} />
            ))}
          </g>
        )}

        {/* Cercle de runes (Maître +) */}
        {i >= 5 && !tiny && (
          <g className="qbe-spin-slow">
            <circle cx="60" cy="60" r="54" fill="none" stroke={light} strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="2 5" />
            {Array.from({ length: 8 }, (_, k) => (
              <path key={k} d="M60 2 L63 6 L60 10 L57 6 Z" fill={light} transform={`rotate(${k * 45} 60 60)`} />
            ))}
          </g>
        )}

        {/* Flammes (Grand Maître +) */}
        {i >= 6 && (
          <g>
            {FLAMES.map((f) => (
              <g key={f.x} className={tiny ? undefined : "qbe-flicker"} style={{ animationDelay: `${f.d}s` }}>
                <path d={flame(f.x, f.h)} fill={i >= 7 ? "#fb923c" : "#ef4444"} />
                <path d={flame(f.x, f.h + 12)} fill="#fde047" opacity="0.9" />
              </g>
            ))}
          </g>
        )}

        {/* Ailes (Diamant +) */}
        {i >= 4 && (
          <g>
            {[false, true].map((mirror) => (
              // Le miroir reste sur le groupe parent : l'animation CSS remplacerait l'attribut transform.
              <g key={String(mirror)} transform={mirror ? "translate(120 0) scale(-1 1)" : undefined}>
                <g className={tiny ? undefined : "qbe-wing"}>
                  {FEATHERS.map((d, k) => (
                    <path key={k} d={d} fill={url("body")} stroke={glint} strokeOpacity="0.7" strokeWidth="1" />
                  ))}
                </g>
              </g>
            ))}
          </g>
        )}

        {/* Lauriers (Or +) */}
        {i >= 2 && (
          <g>
            {[false, true].map((mirror) => (
              <g key={String(mirror)} transform={mirror ? "translate(120 0) scale(-1 1)" : undefined}>
                {LAURELS.map((l, k) => (
                  <ellipse key={k} cx={l.x} cy={l.y} rx="7" ry="3" fill={i >= 7 ? "#fde047" : light} stroke={dark} strokeWidth="0.8" transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
                ))}
              </g>
            ))}
          </g>
        )}

        {/* Écu : contour sombre (lisible sur tous les fonds), puis le métal */}
        <path d={shield} fill="none" stroke="#050816" strokeWidth={i >= 3 ? 9 : 8} strokeLinejoin="round" opacity="0.85" />
        <path d={shield} fill={url("body")} stroke={i >= 7 ? url("rainbow") : url("rim")} strokeWidth={i >= 3 ? 4 : 3} strokeLinejoin="round" />
        {/* Biseau intérieur (Argent +) */}
        {i >= 1 && (
          <path d={shield} fill={url("core")} fillOpacity="0.55" stroke={glint} strokeOpacity="0.6" strokeWidth="2" transform="translate(60 61) scale(0.78) translate(-60 -61)" />
        )}

        {/* Symbole central */}
        <g>
          {i === 0 && <path d="M43 62 L60 50 L77 62 L77 71 L60 59 L43 71 Z" fill={light} stroke={dark} strokeWidth="1.5" />}
          {i === 1 && (
            <>
              <path d="M44 54 L60 43 L76 54 L76 62 L60 51 L44 62 Z" fill={light} />
              <path d="M44 68 L60 57 L76 68 L76 76 L60 65 L44 76 Z" fill={light} />
            </>
          )}
          {i === 2 && <polygon points={star(60, 61, 19, 8)} fill={light} stroke={glint} strokeWidth="1.5" />}
          {i === 3 && (
            <>
              <polygon points="60,40 76,50 76,70 60,80 44,70 44,50" fill={url("orb")} stroke={glint} strokeWidth="1.5" />
              <path d="M60 40 L60 80 M44 50 L76 70 M76 50 L44 70" stroke={dark} strokeOpacity="0.35" strokeWidth="1" />
            </>
          )}
          {i === 4 && (
            <>
              <path d="M45 53 L52 44 L68 44 L75 53 L60 78 Z" fill={url("orb")} stroke={glint} strokeWidth="1.5" />
              <path d="M45 53 L75 53 M52 44 L56 53 L60 78 L64 53 L68 44 M60 44 L56 53 M60 44 L64 53" fill="none" stroke={dark} strokeOpacity="0.4" strokeWidth="1" />
            </>
          )}
          {i === 5 && (
            <>
              <circle cx="60" cy="61" r="15" fill={url("orb")} stroke={glint} strokeWidth="1.5" />
              <polygon points={star(60, 61, 8, 3, 4)} fill="#ffffff" className={tiny ? undefined : "qbe-twinkle"} />
            </>
          )}
          {i === 6 && (
            <>
              <path d="M60 41 C70 52 74 60 72 68 C70 76 64 80 60 80 C54 80 48 75 48 67 C48 60 53 56 55 50 C57 56 60 57 62 55 C62 50 61 46 60 41 Z" fill="#fde047" stroke="#fff7ed" strokeWidth="1.5" />
              <path d="M60 60 C64 64 66 68 64 73 C62 76 58 76 56 73 C55 69 58 66 60 60 Z" fill="#fb923c" />
            </>
          )}
          {i >= 7 && (
            <>
              <polygon points={star(60, 62, 20, 9)} fill={url("orb")} stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="60" cy="62" r="5" fill="#fff" opacity="0.9" />
            </>
          )}
        </g>

        {/* Brillance fixe en haut de l'écu */}
        <g clipPath={url("clip")}>
          <ellipse cx="48" cy="22" rx="40" ry="20" fill={url("gloss")} />
        </g>

        {/* Reflet qui balaie l'écu (Or +) */}
        {i >= 2 && !tiny && (
          <g clipPath={url("clip")}>
            <rect x="-40" y="0" width="22" height="130" fill="#ffffff" opacity="0.35" transform="skewX(-20)" className="qbe-shine" />
          </g>
        )}

        {/* Gemme du sommet (Platine, Diamant) / couronne (Légende) */}
        {i >= 3 && i < 7 && <polygon points="60,6 67,15 60,24 53,15" fill={url("orb")} stroke={glint} strokeWidth="1.5" />}
        {i >= 7 && (
          <g>
            <path d="M38 22 L42 4 L51 14 L60 0 L69 14 L78 4 L82 22 Z" fill="#fde047" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="60" cy="15" r="3" fill="#ec4899" />
            <circle cx="47" cy="17" r="2.2" fill="#22d3ee" />
            <circle cx="73" cy="17" r="2.2" fill="#a78bfa" />
          </g>
        )}

        {/* Étincelles (Diamant +) */}
        {i >= 4 && !tiny && (
          <g fill="#ffffff">
            {[
              [14, 16, 5, 0],
              [106, 24, 4, 0.7],
              [104, 98, 5, 1.3],
              [16, 94, 4, 1.9],
            ].map(([x, y, r, d]) => (
              <path key={x} d={sparkle(x, y, r)} className="qbe-twinkle" style={{ animationDelay: `${d}s` }} />
            ))}
          </g>
        )}

        {/* Divisions : III = 1 point, II = 2, I = 3 */}
        {pips > 0 && (
          <g>
            {[0, 1, 2].map((k) => (
              <polygon
                key={k}
                points={`${48 + k * 12},106 ${53 + k * 12},111 ${48 + k * 12},116 ${43 + k * 12},111`}
                fill={k < pips ? glint : "#0f172a"}
                stroke={k < pips ? main : "#475569"}
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}
      </svg>
    </span>
  );
}
