"use client";

/**
 * Effets sonores courts et doux, synthétisés à la volée (Web Audio, aucun
 * fichier à télécharger) : bonne / mauvaise réponse, combo, chrono, partie
 * trouvée, victoire, niveau, promotion… Esprit applis mobiles : des notes
 * cristallines, brèves, jamais agressives.
 *
 * Sur iPhone, la session audio « ambient » respecte le bouton silencieux et
 * se mélange à la musique en cours. Désactivable dans les réglages.
 */

export type Sfx =
  | "tap"
  | "select"
  | "correct"
  | "wrong"
  | "tick"
  | "go"
  | "found"
  | "reward"
  | "coin"
  | "levelup"
  | "win"
  | "lose"
  | "promotion"
  | "pop";

const KEY = "qb-sound";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled: boolean | null = null;

export function soundEnabled(): boolean {
  if (enabled !== null) return enabled;
  try {
    enabled = localStorage.getItem(KEY) !== "off";
  } catch {
    enabled = true;
  }
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Réglage gardé pour cette visite seulement.
  }
  if (on) play("select");
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      // iOS 17+ : respecte le mode silencieux et ne coupe pas la musique.
      const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (session) session.type = "ambient";
    } catch {
      // Pas de session audio : comportement par défaut.
    }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1.1;
    // Léger compresseur : les accords restent doux, jamais saturés.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10;
    comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
  return ctx;
}

/** À appeler une fois : débloque l'audio au premier contact (exigé par les navigateurs mobiles). */
export function initSound() {
  if (typeof window === "undefined") return;
  const unlock = () => {
    const a = audio();
    if (a) {
      // Un son silencieux suffit à « réveiller » l'audio sur iOS.
      const o = a.createOscillator();
      const g = a.createGain();
      g.gain.value = 0;
      o.connect(g).connect(a.destination);
      o.start();
      o.stop(a.currentTime + 0.01);
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
}

interface Note {
  /** Fréquence (Hz), ou [début, fin] pour un glissé. */
  f: number | [number, number];
  /** Départ (s) après le début du son. */
  at?: number;
  /** Durée (s). */
  d: number;
  type?: OscillatorType;
  /** Volume (0..1). */
  v?: number;
  /** Harmonique douce ajoutée (cloche). */
  bell?: boolean;
}

function tone(a: AudioContext, n: Note, t0: number) {
  const start = t0 + (n.at ?? 0);
  const end = start + n.d;
  const v = n.v ?? 0.3;
  const voices: [number, number][] = [[1, v]];
  if (n.bell) voices.push([2.01, v * 0.25], [3.02, v * 0.08]);
  for (const [mult, vol] of voices) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = n.type ?? "sine";
    const [f1, f2] = Array.isArray(n.f) ? n.f : [n.f, n.f];
    o.frequency.setValueAtTime(f1 * mult, start);
    if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2 * mult, end);
    // Attaque très courte, puis décroissance exponentielle : son « perlé ».
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    o.connect(g).connect(master!);
    o.start(start);
    o.stop(end + 0.02);
  }
}

// Notes (Hz)
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, B5 = 987.77;
const C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98, C7 = 2093;
const semis = (f: number, n: number) => f * 2 ** (n / 12);

const SOUNDS: Record<Sfx, (combo: number) => Note[]> = {
  tap: () => [{ f: 1700, d: 0.04, v: 0.16, type: "triangle" }],
  select: () => [{ f: [900, 1250], d: 0.07, v: 0.22, type: "triangle" }],
  pop: () => [{ f: [600, 1150], d: 0.1, v: 0.28 }],
  // Deux notes montantes, plus aiguës à chaque bonne réponse d'affilée.
  correct: (combo) => {
    const up = Math.min(Math.max(combo - 1, 0), 7);
    return [
      { f: semis(B5, up), d: 0.12, v: 0.22, bell: true },
      { f: semis(E6, up), at: 0.075, d: 0.28, v: 0.24, bell: true },
    ];
  },
  wrong: () => [
    { f: [311, 233], d: 0.2, v: 0.22, type: "triangle" },
    { f: [233, 175], at: 0.11, d: 0.24, v: 0.18, type: "triangle" },
  ],
  tick: () => [{ f: 1500, d: 0.05, v: 0.25, type: "triangle" }],
  go: () => [
    { f: C6, d: 0.1, v: 0.16, bell: true },
    { f: G6, at: 0.08, d: 0.3, v: 0.2, bell: true },
  ],
  found: () => [
    { f: G5, d: 0.16, v: 0.2, bell: true },
    { f: C6, at: 0.1, d: 0.16, v: 0.2, bell: true },
    { f: E6, at: 0.2, d: 0.34, v: 0.22, bell: true },
  ],
  coin: () => [
    { f: B5, d: 0.07, v: 0.16, type: "square" },
    { f: E6, at: 0.06, d: 0.28, v: 0.14, type: "square" },
  ],
  reward: () => [
    { f: C6, d: 0.12, v: 0.18, bell: true },
    { f: E6, at: 0.09, d: 0.12, v: 0.18, bell: true },
    { f: G6, at: 0.18, d: 0.4, v: 0.2, bell: true },
  ],
  levelup: () => [
    { f: C5, d: 0.14, v: 0.18, bell: true },
    { f: E5, at: 0.1, d: 0.14, v: 0.18, bell: true },
    { f: G5, at: 0.2, d: 0.14, v: 0.18, bell: true },
    { f: C6, at: 0.3, d: 0.6, v: 0.22, bell: true },
    { f: E6, at: 0.3, d: 0.6, v: 0.12, bell: true },
    { f: C7, at: 0.45, d: 0.35, v: 0.06 },
  ],
  win: () => [
    { f: G5, d: 0.12, v: 0.18, bell: true },
    { f: C6, at: 0.1, d: 0.12, v: 0.18, bell: true },
    { f: E6, at: 0.2, d: 0.12, v: 0.2, bell: true },
    { f: G6, at: 0.3, d: 0.55, v: 0.22, bell: true },
    { f: C6, at: 0.3, d: 0.55, v: 0.12, bell: true },
  ],
  lose: () => [
    { f: E5, d: 0.18, v: 0.16, type: "triangle" },
    { f: D5, at: 0.16, d: 0.18, v: 0.15, type: "triangle" },
    { f: C5, at: 0.32, d: 0.4, v: 0.14, type: "triangle" },
  ],
  promotion: () => [
    { f: C5, d: 0.12, v: 0.16, bell: true },
    { f: G5, at: 0.1, d: 0.12, v: 0.16, bell: true },
    { f: C6, at: 0.2, d: 0.12, v: 0.18, bell: true },
    { f: E6, at: 0.3, d: 0.12, v: 0.18, bell: true },
    { f: G6, at: 0.4, d: 0.8, v: 0.2, bell: true },
    { f: D6, at: 0.4, d: 0.8, v: 0.1, bell: true },
    { f: B5, at: 0.4, d: 0.8, v: 0.08, bell: true },
  ],
};

/** Petite vibration (Android) qui accompagne certains sons. */
const HAPTIC: Partial<Record<Sfx, number | number[]>> = { correct: 12, wrong: [30, 40, 30], win: [20, 60, 20], promotion: [20, 60, 20, 60, 40] };

/** Joue un effet (sans effet si le son est coupé ou indisponible). `combo` : rang de la bonne réponse d'affilée. */
export function play(sfx: Sfx, combo = 0) {
  if (!soundEnabled()) return;
  const a = audio();
  if (!a || !master) return;
  const t0 = a.currentTime + 0.005;
  for (const n of SOUNDS[sfx](combo)) tone(a, n, t0);
  const h = HAPTIC[sfx];
  if (h) {
    try {
      navigator.vibrate?.(h);
    } catch {
      // Pas de vibreur : rien.
    }
  }
}
