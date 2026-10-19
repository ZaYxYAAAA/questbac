/** Générateurs de questions — Mathématiques, Seconde. */
import {
  type Generator,
  cards,
  claims,
  frac,
  fracTex,
  gcd,
  int,
  mcq,
  nonZero,
  numeric,
  oneOf,
  par,
  pick,
  poly,
  shift,
  term,
  tex,
  texMcq,
  tf,
} from "./kit";

const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;

// ───────────── Nombres et calculs ─────────────

const nombres: Generator[] = [
  (r) => {
    // Exposants différents de 0 et 1 (sinon le calcul est immédiat).
    const a = pick(r, [2, 3, 5, 10]), m = pick(r, [-4, -3, -2, -1, 2, 3, 4, 5, 6]), n = pick(r, [-3, -2, -1, 2, 3, 4, 5, 6]);
    return oneOf(r, [
      () => texMcq(r, `$${a}^{${m}} \\times ${a}^{${n}} = ${a}^{\\,?}$`, m + n, [m * n, m - n, n - m], `$a^m \\times a^n = a^{m+n}$ : $${m} + ${par(n)} = ${m + n}$.`),
      () => texMcq(r, `$\\dfrac{${a}^{${m}}}{${a}^{${n}}} = ${a}^{\\,?}$`, m - n, [m + n, m * n, n - m], `$\\dfrac{a^m}{a^n} = a^{m-n}$ : $${m} - ${par(n)} = ${m - n}$.`),
      () => texMcq(r, `$(${a}^{${m}})^{${n}} = ${a}^{\\,?}$`, m * n, [m + n, m - n, m ** 2], `$(a^m)^n = a^{m \\times n}$.`),
    ]);
  },
  (r) => {
    const d = int(r, 11, 99) / 10, k = int(r, -6, 6);
    const value = d * 10 ** k;
    const shown = tex(value, k >= 0 ? Math.max(0, 1 - k) : 8);
    const opt = (m: number, e: number) => `$${tex(m)} \\times 10^{${e}}$`;
    return mcq(r, `Écriture scientifique de $${shown}$ ?`, opt(d, k), [opt(d, k + 1), opt(d, k - 1), opt(d * 10, k - 1), opt(d, -k)],
      `La mantisse doit être entre 1 et 10 : $${shown} = ${tex(d)} \\times 10^{${k}}$.`);
  },
  (r) => {
    const k = int(r, 2, 9), m = pick(r, [2, 3, 5, 6, 7, 10, 11]);
    return mcq(r, `$\\sqrt{${k * k * m}}$ s'écrit plus simplement…`, `$${k}\\sqrt{${m}}$`, [`$${m}\\sqrt{${k}}$`, `$${k * k}\\sqrt{${m}}$`, ...(Number.isInteger(Math.sqrt(k * m)) ? [] : [`$${k}\\sqrt{${k * m}}$`]), `$${k + m}$`],
      `$${k * k * m} = ${k * k} \\times ${m}$ et $\\sqrt{${k * k}} = ${k}$.`, () => `$${int(r, 2, 9)}\\sqrt{${pick(r, [2, 3, 5, 6, 7, 10, 11])}}$`);
  },
  (r) => {
    // Deux fractions irréductibles (non entières) de dénominateurs différents : il faut réduire au même dénominateur.
    const b = int(r, 2, 9), d = pick(r, [2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== b));
    let a = nonZero(r, 9), c = nonZero(r, 9);
    while (gcd(a, b) !== 1) a = nonZero(r, 9);
    while (gcd(c, d) !== 1) c = nonZero(r, 9);
    const op = r() < 0.5 ? "+" : "-";
    const L = (b * d) / gcd(b, d), n = op === "+" ? a * (L / b) + c * (L / d) : a * (L / b) - c * (L / d);
    const second = c < 0 ? `\\left(${fracTex(c, d)}\\right)` : fracTex(c, d);
    return mcq(r, `$${fracTex(a, b)} ${op} ${second} = \\;?$`, frac(n, L),
      [frac(op === "+" ? a + c : a - c, b + d), frac(op === "+" ? a + c : a - c, L), frac(n + 1, L), frac(a * c, b * d)],
      `On réduit au même dénominateur $${L}$ : $\\dfrac{${a * (L / b)} ${op} ${par(c * (L / d))}}{${L}} = ${fracTex(n, L)}$.`, () => frac(nonZero(r, 30), int(r, 2, 40)));
  },
  (r) => {
    // p/q jamais entier (7/7 = 1 serait un entier naturel) ; q ne contient pas que des 2 et des 5 : pas décimal.
    const q = pick(r, [3, 9, 7, 11]), p0 = pick(r, [1, 2, 4, 5, 7, 8, 10]), p = p0 % q === 0 ? p0 + 1 : p0;
    const s = int(r, 2, 15), k = int(r, 2, 9), q2 = pick(r, [3, 4, 6, 7]), den = pick(r, [4, 8, 20, 25, 40]);
    const num0 = int(r, 1, 3 * den), num = num0 % den === 0 ? num0 + 1 : num0;
    const items: Array<[string, string, string]> = [
      [`$${int(r, 2, 400)}$`, "$\\mathbb{N}$", "C'est un entier naturel."],
      [`$-${int(r, 1, 400)}$`, "$\\mathbb{Z}$", "Entier négatif : entier relatif."],
      [`$${tex(int(r, 1, 99) + pick(r, [0.5, 0.25, 0.2, 0.75, 0.125]))}$`, "$\\mathbb{D}$", "Il s'écrit avec un nombre fini de décimales : décimal."],
      [`$\\dfrac{${p}}{${q}}$`, "$\\mathbb{Q}$", "Quotient d'entiers dont l'écriture décimale est infinie périodique : rationnel non décimal."],
      [`$\\sqrt{${pick(r, [2, 3, 5, 6, 7, 10, 11, 13])}}$`, "$\\mathbb{R}$", "La racine d'un entier non carré parfait est irrationnelle."],
      ["$\\pi$", "$\\mathbb{R}$", "$\\pi$ est irrationnel."],
      [`$\\sqrt{${s * s}}$`, "$\\mathbb{N}$", `$\\sqrt{${s * s}} = ${s}$ : c'est un entier naturel, malgré la racine.`],
      [`$-\\dfrac{${k * q2}}{${q2}}$`, "$\\mathbb{Z}$", `$-\\dfrac{${k * q2}}{${q2}} = -${k}$ : c'est un entier relatif, malgré l'écriture fractionnaire.`],
      [`$\\dfrac{${num}}{${den}}$`, "$\\mathbb{D}$", `$\\dfrac{${num}}{${den}} = ${tex(num / den)}$ : écriture décimale finie (le dénominateur ne contient que des facteurs 2 et 5).`],
    ];
    const [x, set, e] = pick(r, items);
    return mcq(r, `Plus petit ensemble contenant ${x} ?`, set, ["$\\mathbb{N}$", "$\\mathbb{Z}$", "$\\mathbb{D}$", "$\\mathbb{Q}$", "$\\mathbb{R}$"], e);
  },
  (r) => {
    const up = r() < 0.5;
    return oneOf(r, [
      () => {
        const p = int(r, 8, 80) * 5, t = pick(r, [8, 12, 15, 18, 24, 35, 45]);
        const c = 1 + (up ? t : -t) / 100, ans = p * c;
        return texMcq(r, `Un article à $${p}$ € ${up ? "augmente" : "baisse"} de $${t}\\,\\%$. Nouveau prix ?`, ans,
          [p + (up ? -1 : 1) * (p * t) / 100, p + (up ? t : -t), (p * t) / 100], `Coefficient multiplicateur : $1 ${up ? "+" : "-"} ${tex(t / 100)} = ${tex(c)}$, donc $${p} \\times ${tex(c)} = ${tex(ans)}$.`, "€");
      },
      () => {
        // Retrouver le prix de départ : on divise par le coefficient (piège : appliquer la baisse inverse).
        const p0 = int(r, 2, 20) * 20, t = pick(r, [5, 10, 20, 25, 50]);
        const c = 1 + (up ? t : -t) / 100, x = p0 * c;
        return texMcq(r, `Après une ${up ? "hausse" : "baisse"} de $${t}\\,\\%$, un article coûte $${tex(x)}$ €. Quel était son prix avant ${up ? "la hausse" : "la baisse"} ?`, p0,
          [x * (1 + (up ? -t : t) / 100), x + (up ? -t : t), x * c], `On divise par le coefficient multiplicateur : $${tex(x)} \\div ${tex(c)} = ${p0}$. Appliquer une ${up ? "baisse" : "hausse"} de $${t}\\,\\%$ ne ramène pas au prix de départ.`, "€");
      },
      () => {
        const a = int(r, 2, 20) * 20, t = pick(r, [-40, -35, -15, -5, 15, 35, 45, 60]);
        const b = a * (1 + t / 100);
        return texMcq(r, `Un prix passe de $${a}$ € à $${tex(b)}$ €. Taux d'évolution (en %) ?`, t, [-t, b - a, Math.round(((b - a) / b) * 1000) / 10],
          `$\\dfrac{${tex(b)} - ${a}}{${a}} = ${tex(t / 100)}$, soit $${tex(t)}\\,\\%$ : on divise toujours par la valeur de départ.`, "%");
      },
    ]);
  },
  (r) => {
    // Programme 2026 : multiples, diviseurs, parité (les nombres premiers ne sont plus exigés).
    const d = pick(r, [3, 4, 6, 7, 9, 12, 15]);
    const m = d * int(r, 12, 111) + (r() < 0.5 ? 0 : int(r, 1, d - 1));
    const a = int(r, 1, 30);
    const [p, q] = pick(r, [[4, 6], [3, 4], [2, 6], [3, 5], [6, 9], [4, 9]] as const);
    const lcm = (p * q) / gcd(p, q);
    return oneOf(r, [
      () => tf(`$${m}$ est un multiple de $${d}$.`, m % d === 0, m % d === 0 ? `$${m} = ${d} \\times ${m / d}$.` : `$${m} = ${d} \\times ${Math.floor(m / d)} + ${m % d}$ : le reste n'est pas nul.`),
      () => tf(`$${d}$ est un diviseur de $${m}$.`, m % d === 0, m % d === 0 ? `$${m} \\div ${d} = ${m / d}$.` : `La division de $${m}$ par $${d}$ ne tombe pas juste : il reste $${m % d}$.`),
      () => tf(`Pour tout entier $n$, $2n + ${2 * a + 1}$ est impair.`, true, `$2n + ${2 * a + 1} = 2(n + ${a}) + 1$ : c'est un nombre impair.`),
      () => tf(`Pour tout entier $n$, $2n + ${2 * a}$ est impair.`, false, `$2n + ${2 * a} = 2(n + ${a})$ : c'est un nombre pair.`),
      () => tf(`Pour tout entier $n$, $n^2 + n + ${2 * a + 1}$ est impair.`, true, `$n^2 + n = n(n + 1)$ est le produit de deux entiers consécutifs, donc pair ; en ajoutant l'impair $${2 * a + 1}$, on obtient un impair.`),
      () => tf(`Si un entier est multiple de $${p}$ et de $${q}$, alors il est multiple de $${p * q}$.`, lcm === p * q,
        lcm === p * q ? `Vrai : $${p}$ et $${q}$ n'ont pas d'autre diviseur commun que 1, donc le plus petit multiple commun est $${p * q}$.` : `Faux : $${lcm}$ est multiple de $${p}$ et de $${q}$ mais pas de $${p * q}$.`),
      () => pick(r, [
        () => tf("La somme de trois entiers consécutifs est toujours un multiple de 3.", true, "$n + (n + 1) + (n + 2) = 3n + 3 = 3(n + 1)$."),
        () => tf("Le produit de deux nombres impairs est pair.", false, "$(2a + 1)(2b + 1) = 2(2ab + a + b) + 1$ : il est impair."),
        () => tf("La somme de deux nombres impairs est impaire.", false, "$(2a + 1) + (2b + 1) = 2(a + b + 1)$ : elle est paire."),
        () => tf("Le carré d'un nombre impair est impair.", true, "$(2k + 1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$."),
        () => tf(`Si $a$ et $b$ sont des multiples de $${d}$, alors $a + b$ est un multiple de $${d}$.`, true, `$a = ${d}k$ et $b = ${d}k'$ donnent $a + b = ${d}(k + k')$.`),
      ])(),
    ]);
  },
  (r) => {
    // Valeur absolue (ajoutée au programme 2026). a ≠ 0 : |x| = b ne demande aucun calcul et rendait des leurres comme {b ; b}.
    const a = nonZero(r, 9), b = int(r, 1, 8);
    const set = (u: number, v: number) => `$\\{${Math.min(u, v)}\\,;\\,${Math.max(u, v)}\\}$`;
    return oneOf(r, [
      () => numeric(`$|${a} - ${par(b)}| = \\;?$`, Math.abs(a - b), `$|${a - b}| = ${Math.abs(a - b)}$ : une valeur absolue est toujours positive.`),
      () => mcq(r, `Solutions de $|${shift(a)}| = ${b}$ ?`, set(a - b, a + b), [set(-a - b, -a + b), `$\\{${a + b}\\}$`, ...(b === a ? [] : [set(b - a, a + b)]), set(-b, b)], `$${a < 0 ? `|${shift(a)}| = |x - (${a})|` : `|${shift(a)}|`}$ est la distance entre $x$ et $${a}$ : les nombres à distance $${b}$ de $${a}$ sont $${a} - ${b}$ et $${a} + ${b}$.`),
      () => mcq(r, `$|${shift(a)}| \\leq ${b}$ équivaut à $x \\in \\;?$`, `$[${a - b}\\,;\\,${a + b}]$`, [`$]${a - b}\\,;\\,${a + b}[$`, `$[${-b}\\,;\\,${b}]$`, `$[${a}\\,;\\,${a + b}]$`], `Distance à $${a}$ inférieure ou égale à $${b}$.`),
    ]);
  },
  (r) => {
    // Intervalle ↔ inégalité avec une valeur absolue : centre et rayon (le centre peut être décimal).
    const lo = int(r, -9, 6), hi = lo + int(r, 2, 11), c = (lo + hi) / 2, rad = (hi - lo) / 2;
    const abs = (center: number, radius: number) => `$|${shift(center)}| \\leq ${tex(radius)}$`;
    return mcq(r, `L'intervalle $[${lo}\\,;\\,${hi}]$ est l'ensemble des réels $x$ tels que…`, abs(c, rad), [abs(-c, rad), abs(c, hi - lo), abs(lo, rad), `$|x| \\leq ${hi}$`],
      `Centre $\\dfrac{${lo} + ${par(hi)}}{2} = ${tex(c)}$ et rayon $\\dfrac{${hi} - ${par(lo)}}{2} = ${tex(rad)}$ : $x$ est à une distance au plus $${tex(rad)}$ de $${tex(c)}$.`);
  },
];

// ───────────── Équations et inéquations ─────────────

const equations: Generator[] = [
  (r) => {
    const a = nonZero(r, 9, true), x = int(r, -12, 12), b = nonZero(r, 20);
    if (r() < 0.5) return numeric(`Résous : $${poly([a, b])} = ${tex(a * x + b)}$. $x = \\;?$`, x, `$${a}x = ${tex(a * x + b)} - ${par(b)} = ${a * x}$, donc $x = ${x}$.`);
    // Équation à coefficients fractionnaires : (ax + b) / d = c, on multiplie d'abord par d (solution entière, sans calculatrice).
    // a premier avec d : la fraction ne se simplifie pas d'emblée ; b2 ≠ 0 : il y a bien un terme constant.
    const d = pick(r, [2, 3, 4, 5, 6].filter((v) => gcd(a, v) === 1));
    let c = Math.round((a * x) / d) + int(r, -2, 2), b2 = c * d - a * x;
    if (b2 === 0) { c += 1; b2 = d; }
    return numeric(`Résous : $\\dfrac{${poly([a, b2])}}{${d}} = ${c}$. $x = \\;?$`, x, `On multiplie par $${d}$ : $${poly([a, b2])} = ${c * d}$, donc $${a}x = ${c * d} - ${par(b2)} = ${a * x}$ et $x = ${x}$.`);
  },
  (r) => {
    const a = nonZero(r, 9), k = pick(r, [1, 2, 3, 5]);
    const kx = k === 1 ? "x" : `${k}x`;
    return mcq(r, `Développe $(${kx} ${a < 0 ? "-" : "+"} ${Math.abs(a)})^2$.`, `$${poly([k * k, 2 * k * a, a * a])}$`,
      [`$${poly([k * k, 0, a * a])}$`, `$${poly([k * k, k * a, a * a])}$`, `$${poly([k * k, 2 * k * a, -a * a])}$`, `$${poly([k, 2 * k * a, a * a])}$`],
      `Identité remarquable : $(a ${a < 0 ? "-" : "+"} b)^2 = a^2 ${a < 0 ? "-" : "+"} 2ab + b^2$ avec $a = ${kx}$ et $b = ${Math.abs(a)}$ : le double produit vaut $2 \\times ${kx} \\times ${Math.abs(a)}$.`);
  },
  (r) => {
    const a = int(r, 1, 12), k = pick(r, [1, 1, 2, 3]);
    const left = k === 1 ? `x^2 - ${a * a}` : `${k * k}x^2 - ${a * a}`;
    const kx = k === 1 ? "x" : `${k}x`;
    return mcq(r, `Factorise $${left}$.`, `$(${kx} - ${a})(${kx} + ${a})$`, [`$(${kx} - ${a})^2$`, `$(${kx} + ${a})^2$`, `$(${kx} - ${a * a})(${kx} + ${a * a})$`, `$${k === 1 ? "" : k}(x - ${a})(x + ${a})$`],
      `$a^2 - b^2 = (a - b)(a + b)$ avec $a = ${kx}$ et $b = ${a}$.`);
  },
  (r) => {
    const a = nonZero(r, 6, true), b = int(r, -10, 10), c = int(r, -10, 10);
    const sign = pick(r, ["<", ">", "\\leq", "\\geq"]);
    const flip: Record<string, string> = { "<": ">", ">": "<", "\\leq": "\\geq", "\\geq": "\\leq" };
    const s = a < 0 ? flip[sign] : sign;
    const k = fracTex(c - b, a);
    const opp = flip[s];
    return mcq(r, `Résous $${poly([a, b])} ${sign} ${c}$.`, `$x ${s} ${k}$`, [`$x ${opp} ${k}$`, `$x ${s} ${fracTex(c + b, a)}$`, `$x ${opp} ${fracTex(b - c, a)}$`, `$x ${s} ${fracTex(b - c, a)}$`, `$x ${opp} ${fracTex(c + b, a)}$`],
      `$${a}x ${sign} ${c - b}$, puis on divise par $${a}$${a < 0 ? " (négatif : on change le sens !)" : ""}.`);
  },
  (r) => {
    const a = nonZero(r, 5), b = nonZero(r, 9), c = nonZero(r, 5), d = nonZero(r, 9);
    return mcq(r, `Développe $(${poly([a, b])})(${poly([c, d])})$.`, `$${poly([a * c, a * d + b * c, b * d])}$`,
      [`$${poly([a * c, b * d])}$`, `$${poly([a * c, a * d - b * c, b * d])}$`, `$${poly([a + c, a * d + b * c, b + d])}$`, `$${poly([a * c, a * d + b * c, -b * d])}$`],
      `Double distributivité : $${poly([a * c, 0, 0])}${term(a * d, "x")}${term(b * c, "x")}${term(b * d)}$, puis on réduit.`);
  },
  (r) => {
    // Facteurs (ax - b)(cx - d) : racines b/a et d/c, éventuellement fractionnaires.
    const a = pick(r, [1, 1, 2, 3]), c = pick(r, [1, 2, 5]), b = int(r, -9, 9), d = int(r, -9, 9);
    const f = (k: number, v: number) => (v === 0 ? (k === 1 ? "x" : `${k}x`) : `(${k === 1 ? "" : k}x ${v < 0 ? "+" : "-"} ${Math.abs(v)})`);
    const one = (k: number, v: number) => fracTex(v, k);
    // Complément : des ensembles d'entiers distincts, écrits dans l'ordre (perturb donnait des ensembles comme {9 ; 9}).
    const fill = () => {
      const u = int(r, -9, 9), v = int(r, -9, 9);
      return u === v ? `$\\{${u}\\}$` : `$\\{${Math.min(u, v)}\\,;\\,${Math.max(u, v)}\\}$`;
    };
    if (b * c === a * d) {
      const w = b / a, opp = b === 0 ? [] : [`$\\{${one(a, -b)}\\}$`, `$\\{${one(a, -Math.abs(b))}\\,;\\,${one(a, Math.abs(b))}\\}$`];
      return mcq(r, `Solutions de $${f(a, b)}${f(c, d)} = 0$ ?`, `$\\{${one(a, b)}\\}$`, [...opp, ...(w === 0 ? [] : [`$\\{${one(b, a)}\\}$`]), `$\\{${one(a, b)}\\,;\\,${one(a, b + a)}\\}$`],
        `Les deux facteurs s'annulent pour la même valeur : une seule solution, $${one(a, b)}$.`, fill);
    }
    const [lo, hi] = b / a <= d / c ? [[a, b], [c, d]] : [[c, d], [a, b]];
    // Ensemble écrit dans l'ordre croissant : deux écritures d'un même ensemble sont identiques.
    const set = (u: number[], v: number[]) => {
      const [s, t] = u[1] / u[0] <= v[1] / v[0] ? [u, v] : [v, u];
      if (s[1] / s[0] === t[1] / t[0]) return `$\\{${one(s[0], s[1])}\\}$`;
      return `$\\{${one(s[0], s[1])}\\,;\\,${one(t[0], t[1])}\\}$`;
    };
    return mcq(r, `Solutions de $${f(a, b)}${f(c, d)} = 0$ ?`, set(lo, hi), [set([hi[0], -hi[1]], [lo[0], -lo[1]]), set([lo[1] || 1, lo[0]], [hi[1] || 1, hi[0]]), set([1, lo[1]], [1, hi[1]]), set([1, -lo[1]], [1, -hi[1]])],
      `Un produit est nul si et seulement si l'un des facteurs est nul : $${a === 1 ? "x" : `${a}x`} = ${b}$ ou $${c === 1 ? "x" : `${c}x`} = ${d}$.`, fill);
  },
  (r) => {
    const a = nonZero(r, 8, true), x0 = int(r, -6, 6);
    const b = -a * x0;
    return mcq(r, `$${poly([a, b])} > 0$ pour…`, a > 0 ? `$x > ${x0}$` : `$x < ${x0}$`, [a > 0 ? `$x < ${x0}$` : `$x > ${x0}$`, `$x > ${-x0}$`, `$x < ${-x0}$`, `$x > ${x0 + 1}$`, `$x < ${x0 - 1}$`],
      `$${poly([a, b])}$ s'annule en $${x0}$ et est du signe de $a = ${a}$ à droite de ce zéro.`);
  },
];

// ───────────── Généralités sur les fonctions ─────────────

const fonctions: Generator[] = [
  (r) => {
    const a = nonZero(r, 4), b = int(r, -6, 6), c = int(r, -9, 9), x = int(r, -4, 4);
    const v = a * x * x + b * x + c;
    return numeric(`$f(x) = ${poly([a, b, c])}$. Calcule $f(${x})$.`, v, `$f(${x}) = ${a} \\times ${par(x)}^2 + ${par(b)} \\times ${par(x)} + ${par(c)} = ${v}$.`);
  },
  (r) => {
    const a = nonZero(r, 7, true), b = int(r, -15, 15), x = int(r, -10, 10);
    return oneOf(r, [
      () => numeric(`$f(x) = ${poly([a, b])}$. Antécédent de $${a * x + b}$ par $f$ ?`, x, `On résout $${poly([a, b])} = ${a * x + b}$ : $x = ${x}$.`),
      () => {
        // Antécédents par une fonction du second degré : 0, 1 ou 2 selon le signe de k - c.
        const c = int(r, -9, 9), s = int(r, 1, 9), kind = pick(r, [2, 2, 1, 0]);
        const k = kind === 2 ? c + s * s : kind === 1 ? c : c - s;
        const ans = kind === 2 ? `$${-s}$ et $${s}$` : kind === 1 ? "$0$ seulement" : "aucun antécédent";
        return mcq(r, `$f(x) = ${poly([1, 0, c])}$. Antécédent(s) de $${k}$ par $f$ ?`, ans, [`$${s}$ seulement`, `$${-s}$ et $${s}$`, "aucun antécédent", "$0$ seulement", ...(kind === 2 ? [`$${-s * s}$ et $${s * s}$`] : [])],
          `On résout $${poly([1, 0, c])} = ${k}$, soit $x^2 = ${k - c}$ : ${kind === 2 ? `deux antécédents, $${-s}$ et $${s}$` : kind === 1 ? "seul $0$ convient" : "un carré n'est jamais négatif, aucun antécédent"}.`);
      },
    ]);
  },
  (r) => {
    // a ≠ b : sinon f serait constante égale à 1 (hors de la valeur interdite).
    const a = int(r, 1, 6), b0 = nonZero(r, 6), b = b0 === a ? -a : b0, k = int(r, -5, 5);
    if (k === -b) return tf(`$f(x) = \\dfrac{x + ${a}}{x ${b < 0 ? "-" : "+"} ${Math.abs(b)}}$ est définie en $x = ${k}$.`, false, `Le dénominateur s'annule en $${k}$.`);
    // Leurres sans dénominateur nul (pas de « 1/0 » ni de « 0/0 »).
    const wrongs = [[k + b, k + a], [k * a, k * b], [a, b], [k + a + 1, k + b], [k - a, k - b]].filter(([, den]) => den !== 0).map(([n, den]) => frac(n, den));
    return mcq(r, `$f(x) = \\dfrac{x + ${a}}{x ${b < 0 ? "-" : "+"} ${Math.abs(b)}}$. $f(${k}) = \\;?$`, frac(k + a, k + b), wrongs,
      `$f(${k}) = \\dfrac{${k} + ${a}}{${k} + ${par(b)}} = ${fracTex(k + a, k + b)}$.`, () => frac(int(r, -9, 9), int(r, 1, 9)));
  },
  (r) => {
    const a = nonZero(r, 3), b = int(r, -5, 5), x = int(r, -3, 3);
    const y = a * x * x + b;
    const on = r() < 0.5;
    const shown = on ? y : y + nonZero(r, 3);
    return tf(`Le point $A${pt(x, shown)}$ est sur la courbe de $f(x) = ${poly([a, 0, b])}$.`, on, `$f(${x}) = ${y}$${on ? "" : `, pas $${shown}$`}.`);
  },
  (r) => {
    const a = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Ensemble de définition de $f(x) = \\dfrac{1}{${shift(a)}}$ ?`, `$\\mathbb{R} \\setminus \\{${a}\\}$`, [`$\\mathbb{R}$`, `$\\mathbb{R} \\setminus \\{${-a}\\}$`, `$]${a}\\,;\\,+\\infty[$`], `Le dénominateur ne doit pas s'annuler : $x \\neq ${a}$.`),
      () => mcq(r, `Ensemble de définition de $f(x) = \\sqrt{${shift(a)}}$ ?`, `$[${a}\\,;\\,+\\infty[$`, [`$]${a}\\,;\\,+\\infty[$`, `$]-\\infty\\,;\\,${a}]$`, `$[${-a}\\,;\\,+\\infty[$`], `Sous la racine, il faut $${shift(a)} \\geq 0$, soit $x \\geq ${a}$ (borne comprise).`),
    ]);
  },
  claims([
    ["Un nombre peut avoir plusieurs antécédents par une fonction.", true, "Par exemple 4 a deux antécédents par la fonction carré : −2 et 2."],
    ["Un nombre peut avoir plusieurs images par une fonction.", false, "Une fonction associe à chaque $x$ une seule image."],
    ["Si $f$ est croissante sur $[a\\,;\\,b]$ et $a < b$, alors $f(a) \\leq f(b)$.", true, "Croissante : elle conserve l'ordre."],
    ["Si $f$ est décroissante, elle change l'ordre.", true, "$u < v \\Rightarrow f(u) \\geq f(v)$."],
    ["Le maximum d'une fonction sur un intervalle est toujours atteint en une borne.", false, "Il peut être atteint à l'intérieur (sommet d'une parabole)."],
    ["Résoudre graphiquement $f(x) = k$ revient à lire les abscisses des points d'intersection avec la droite $y = k$.", true, "On lit les abscisses, pas les ordonnées."],
  ]),
];

// ───────────── Fonctions affines ─────────────

const affines: Generator[] = [
  (r) => {
    const x1 = int(r, -6, 6), x2 = x1 + nonZero(r, 5), y1 = int(r, -8, 8), y2 = int(r, -8, 8);
    return mcq(r, `Coefficient directeur de la droite $(AB)$ avec $A${pt(x1, y1)}$ et $B${pt(x2, y2)}$ ?`, frac(y2 - y1, x2 - x1),
      [frac(x2 - x1, y2 - y1 || 1), frac(y2 + y1, x2 + x1 || 1), frac(y1 - y2 + 1, x2 - x1)],
      `$m = \\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{${y2 - y1}}{${x2 - x1}}${fracTex(y2 - y1, x2 - x1) === `\\dfrac{${y2 - y1}}{${x2 - x1}}` ? "" : ` = ${fracTex(y2 - y1, x2 - x1)}`}$.`, () => frac(nonZero(r, 9), int(r, 1, 6)));
  },
  (r) => {
    const m = nonZero(r, 9), p = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Ordonnée à l'origine de $f(x) = ${poly([m, p])}$ ?`, `$${p}$`, [`$${m}$`, `$${-p}$`, `$${fracTex(-p, m)}$`], `$f(0) = ${p}$.`, () => `$${int(r, -12, 12)}$`),
      () => mcq(r, `$f(x) = ${poly([m, p])}$ est…`, m > 0 ? "croissante" : "décroissante", ["croissante", "décroissante", "constante", "ni croissante ni décroissante"], `Le coefficient directeur $${m}$ est ${m > 0 ? "positif" : "négatif"}.`),
      () => mcq(r, `Pour quelle valeur $f(x) = ${poly([m, p])}$ s'annule-t-elle ?`, `$${fracTex(-p, m)}$`, [`$${fracTex(p, m)}$`, `$${fracTex(-m, p || 1)}$`, `$${-p}$`], `$${poly([m, p])} = 0 \\iff x = ${fracTex(-p, m)}$.`, () => `$${fracTex(nonZero(r, 9), int(r, 1, 5))}$`),
    ]);
  },
  (r) => {
    const m = nonZero(r, 5), p = int(r, -8, 8), a = int(r, -4, 4), b = a + nonZero(r, 4);
    return mcq(r, `$f$ est affine, $f(${a}) = ${m * a + p}$ et $f(${b}) = ${m * b + p}$. $f(x) = \\;?$`, `$${poly([m, p])}$`, [`$${poly([-m, p])}$`, `$${poly([m, -p])}$`, `$${poly([p || 1, m])}$`],
      `$m = \\dfrac{${m * b + p} - ${par(m * a + p)}}{${b} - ${par(a)}} = ${m}$, puis $p = f(${a}) - ${par(m)} \\times ${par(a)} = ${p}$.`, () => `$${poly([nonZero(r, 6), int(r, -9, 9)])}$`);
  },
  (r) => {
    // Accroissements : f(b) - f(a) = m(b - a), sans calculer f(a) ni f(b).
    const m = nonZero(r, 9), p = int(r, -9, 9), a = int(r, -8, 6), b = a + int(r, 2, 9);
    return numeric(`$f(x) = ${poly([m, p])}$. Que vaut $f(${b}) - f(${a})$ ?`, m * (b - a), `Pour une fonction affine, $f(b) - f(a) = m(b - a)$ : $${m} \\times (${b} - ${par(a)}) = ${m * (b - a)}$ (l'ordonnée à l'origine s'élimine).`);
  },
  claims([
    ["La courbe d'une fonction affine est une droite.", true, "C'est même la définition graphique."],
    ["Une fonction linéaire est une fonction affine.", true, "C'est le cas $p = 0$ : la droite passe par l'origine."],
    ["La fonction $f(x) = 3$ est affine.", true, "C'est le cas $m = 0$ : fonction constante."],
    ["$f(x) = x^2 + 1$ est affine.", false, "Le terme en $x^2$ en fait une fonction du second degré."],
    ["Deux droites de même coefficient directeur sont parallèles.", true, "Même pente, donc parallèles (ou confondues)."],
  ]),
];

// ───────────── Fonctions de référence ─────────────

const reference: Generator[] = [
  (r) => {
    const a = int(r, 1, 6), b = a + int(r, 1, 5);
    const neg = r() < 0.5;
    const iv = neg ? `[-${b}\\,;\\,-${a}]` : `[${a}\\,;\\,${b}]`;
    return mcq(r, `Si $x \\in ${iv}$, alors $x^2$ appartient à…`, `$[${a * a}\\,;\\,${b * b}]$`, [`$[-${b * b}\\,;\\,-${a * a}]$`, `$[${a}\\,;\\,${b}]$`, `$[${2 * a}\\,;\\,${2 * b}]$`],
      `La fonction carré est ${neg ? "décroissante sur $]-\\infty\\,;\\,0]$ : elle inverse l'ordre" : "croissante sur $[0\\,;\\,+\\infty[$"}, et les carrés sont positifs.`);
  },
  (r) => {
    const a = pick(r, [1, 2, 4, 5]), b = a * pick(r, [2, 4, 5]);
    if (r() < 0.5) {
      // Intervalle négatif : la fonction inverse est aussi décroissante sur ]-∞ ; 0[.
      return mcq(r, `Si $x \\in [-${b}\\,;\\,-${a}]$, alors $\\dfrac{1}{x}$ appartient à…`, `$[-${fracTex(1, a)}\\,;\\,-${fracTex(1, b)}]$`, [`$]-${fracTex(1, a)}\\,;\\,-${fracTex(1, b)}[$`, `$[${fracTex(1, b)}\\,;\\,${fracTex(1, a)}]$`, `$[${a}\\,;\\,${b}]$`, `$[-${b}\\,;\\,-${a}]$`],
        `La fonction inverse est décroissante sur $]-\\infty\\,;\\,0[$ : $-${b} \\leq x \\leq -${a}$ donne $-${fracTex(1, a)} \\leq \\dfrac{1}{x} \\leq -${fracTex(1, b)}$.`);
    }
    return mcq(r, `Si $x \\in [${a}\\,;\\,${b}]$, alors $\\dfrac{1}{x}$ appartient à…`, `$[${fracTex(1, b)}\\,;\\,${fracTex(1, a)}]$`, [`$]${fracTex(1, b)}\\,;\\,${fracTex(1, a)}[$`, `$[-${fracTex(1, a)}\\,;\\,-${fracTex(1, b)}]$`, `$[-${b}\\,;\\,-${a}]$`, `$[${a}\\,;\\,${b}]$`],
      `La fonction inverse est décroissante sur $]0\\,;\\,+\\infty[$ : elle inverse l'ordre, $${a} \\leq x \\leq ${b}$ donne $${fracTex(1, b)} \\leq \\dfrac{1}{x} \\leq ${fracTex(1, a)}$ (bornes atteintes).`);
  },
  (r) => {
    // Carrés parfaits, nombres négatifs, et aussi des k non carrés (solutions ±√k).
    const k = pick(r, [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, -4, -9, 0, 2, 3, 5, 6, 7, 10]);
    const s = Math.sqrt(Math.abs(k)), whole = Number.isInteger(s);
    const root = whole ? `${s}` : `\\sqrt{${Math.abs(k)}}`;
    const ans = k < 0 ? "$\\varnothing$" : k === 0 ? "$\\{0\\}$" : `$\\{-${root}\\,;\\,${root}\\}$`;
    return mcq(r, `Solutions de $x^2 = ${k}$ ?`, ans, ["$\\varnothing$", "$\\{0\\}$", `$\\{${s ? root : 1}\\}$`, `$\\{-${s ? root : 1}\\,;\\,${s ? root : 1}\\}$`, `$\\{${Math.abs(k)}\\}$`, ...(k ? [`$\\{-${Math.abs(k)}\\,;\\,${Math.abs(k)}\\}$`] : [])],
      k < 0 ? "Un carré est toujours positif ou nul." : k === 0 ? "Seul $0$ a pour carré $0$." : `Deux nombres opposés ont pour carré $${k}$ : $-${root}$ et $${root}$.`);
  },
  (r) => {
    const k = pick(r, [4, 9, 16, 25, 36, 49, 3, 5, 7]);
    const s = Number.isInteger(Math.sqrt(k)) ? `${Math.sqrt(k)}` : `\\sqrt{${k}}`;
    const strict = r() < 0.5, [lt, gt] = strict ? ["<", ">"] : ["\\leq", "\\geq"], [o, c] = strict ? ["]", "["] : ["[", "]"];
    const inside = `$${o}-${s}\\,;\\,${s}${c}$`, outside = `$]-\\infty\\,;\\,-${s}${c}\\,\\cup\\,${o}${s}\\,;\\,+\\infty[$`;
    return oneOf(r, [
      () => mcq(r, `Solutions de $x^2 ${lt} ${k}$ ?`, inside, [`$]-\\infty\\,;\\,${s}${c}$`, outside, `$${o}0\\,;\\,${s}${c}$`], `Entre les deux nombres $-${s}$ et $${s}$ dont le carré vaut $${k}$${strict ? " (bornes exclues)" : " (bornes comprises)"}.`),
      () => mcq(r, `Solutions de $x^2 ${gt} ${k}$ ?`, outside, [inside, `$${o}${s}\\,;\\,+\\infty[$`, `$${o}${k}\\,;\\,+\\infty[$`], `À l'extérieur de $-${s}$ et $${s}$ : il ne faut pas oublier les nombres négatifs${strict ? "" : " (bornes comprises)"}.`),
    ]);
  },
  (r) => {
    // Piège classique : l'intervalle contient 0, le minimum de x² est donc 0 (et non a²).
    // a ≠ b : sinon les leurres [a² ; b²] et [min² ; max²] seraient réduits à un point.
    const a = int(r, 1, 7), b0 = int(r, 1, 6), b = b0 >= a ? b0 + 1 : b0;
    const top = Math.max(a, b) ** 2, low = Math.min(a, b) ** 2;
    return mcq(r, `Si $-${a} \\leq x \\leq ${b}$, alors $x^2$ appartient à…`, `$[0\\,;\\,${top}]$`, [`$[${low}\\,;\\,${top}]$`, `$[-${a * a}\\,;\\,${b * b}]$`, `$[0\\,;\\,${low}]$`, `$[-${2 * a}\\,;\\,${2 * b}]$`],
      `La fonction carré décroît sur $[-${a}\\,;\\,0]$ puis croît sur $[0\\,;\\,${b}]$ : le minimum est $0^2 = 0$, le maximum est $\\max(${a * a}\\,;\\,${b * b}) = ${top}$.`);
  },
  claims([
    ["La fonction carré est décroissante sur $]-\\infty\\,;\\,0]$.", true, "Puis croissante sur $[0\\,;\\,+\\infty[$."],
    ["La fonction inverse est décroissante sur $\\mathbb{R}$.", false, "Elle est décroissante sur $]-\\infty\\,;\\,0[$ et sur $]0\\,;\\,+\\infty[$, pas sur $\\mathbb{R}$ (non définie en 0)."],
    ["La fonction racine carrée est croissante sur $[0\\,;\\,+\\infty[$.", true, "Plus $x$ est grand, plus $\\sqrt{x}$ est grand."],
    ["La fonction cube est croissante sur $\\mathbb{R}$.", true, "$x^3$ conserve l'ordre."],
    ["Pour tout $x \\geq 0$, $\\sqrt{x} \\leq x$.", false, "Faux entre 0 et 1 : $\\sqrt{0{,}25} = 0{,}5 > 0{,}25$."],
    ["La courbe de la fonction carré est symétrique par rapport à l'axe des ordonnées.", true, "La fonction carré est paire."],
  ]),
];

// ───────────── Vecteurs et repérage ─────────────

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]] as const;

const vecteurs: Generator[] = [
  (r) => {
    const xa = int(r, -8, 8), ya = int(r, -8, 8), xb = int(r, -8, 8), yb = int(r, -8, 8);
    return mcq(r, `$A${pt(xa, ya)}$ et $B${pt(xb, yb)}$. Coordonnées de $\\overrightarrow{AB}$ ?`, `$${pt(xb - xa, yb - ya)}$`, [`$${pt(xa - xb, ya - yb)}$`, `$${pt(xb + xa, yb + ya)}$`, `$${pt(yb - ya, xb - xa)}$`],
      `$\\overrightarrow{AB}\\,(x_B - x_A\\,;\\,y_B - y_A)$.`);
  },
  (r) => {
    const xa = int(r, -9, 9), ya = int(r, -9, 9), xb = xa + 2 * int(r, -5, 5), yb = ya + 2 * int(r, -5, 5);
    return mcq(r, `Milieu de $[AB]$ avec $A${pt(xa, ya)}$ et $B${pt(xb, yb)}$ ?`, `$${pt((xa + xb) / 2, (ya + yb) / 2)}$`, [`$${pt(xb - xa, yb - ya)}$`, `$${pt((xb - xa) / 2, (yb - ya) / 2)}$`, `$${pt(xa + xb, ya + yb)}$`],
      `$I\\left(\\dfrac{x_A + x_B}{2}\\,;\\,\\dfrac{y_A + y_B}{2}\\right)$.`);
  },
  (r) => {
    const [p, q, h] = pick(r, TRIPLES);
    const xa = int(r, -6, 6), ya = int(r, -6, 6);
    const [dx, dy] = r() < 0.5 ? [p, q] : [q, p];
    const xb = xa + (r() < 0.5 ? dx : -dx), yb = ya + (r() < 0.5 ? dy : -dy);
    return numeric(`Distance $AB$ avec $A${pt(xa, ya)}$ et $B${pt(xb, yb)}$ ?`, h, `$AB = \\sqrt{${par(xb - xa)}^2 + ${par(yb - ya)}^2} = \\sqrt{${h * h}} = ${h}$.`);
  },
  (r) => {
    const a = nonZero(r, 6), b = nonZero(r, 6), k = pick(r, [-3, -2, 2, 3, 4]);
    const col = r() < 0.5;
    const c = k * a, d = col ? k * b : k * b + nonZero(r, 2);
    return tf(`$\\vec{u}\\,${pt(a, b)}$ et $\\vec{v}\\,${pt(c, d)}$ sont colinéaires.`, col, `$\\det(\\vec{u}, \\vec{v}) = ${par(a)} \\times ${par(d)} - ${par(b)} \\times ${par(c)} = ${a * d - b * c}$${col ? " : nul, donc colinéaires" : " : non nul"}.`);
  },
  (r) => {
    const a = int(r, -7, 7), b = int(r, -7, 7), c = int(r, -7, 7), d = int(r, -7, 7), k = nonZero(r, 4, true);
    return oneOf(r, [
      () => mcq(r, `$\\vec{u}\\,${pt(a, b)}$, $\\vec{v}\\,${pt(c, d)}$. Coordonnées de $\\vec{u} + \\vec{v}$ ?`, `$${pt(a + c, b + d)}$`, [`$${pt(a - c, b - d)}$`, `$${pt(a * c, b * d)}$`, `$${pt(a + b, c + d)}$`], `On additionne les coordonnées.`),
      () => mcq(r, `$\\vec{u}\\,${pt(a, b)}$. Coordonnées de $${k}\\vec{u}$ ?`, `$${pt(k * a, k * b)}$`, [`$${pt(k + a, k + b)}$`, `$${pt(k * a, b)}$`, `$${pt(-k * a, -k * b)}$`], `On multiplie chaque coordonnée par $${k}$.`),
    ]);
  },
];

// ───────────── Équations de droites ─────────────

const droites: Generator[] = [
  (r) => {
    const m = nonZero(r, 5), p = int(r, -8, 8), x1 = int(r, -4, 4), x2 = x1 + nonZero(r, 4);
    return mcq(r, `Équation réduite de la droite passant par $A${pt(x1, m * x1 + p)}$ et $B${pt(x2, m * x2 + p)}$ ?`, `$y = ${poly([m, p])}$`, [`$y = ${poly([-m, p])}$`, `$y = ${poly([m, -p])}$`, `$y = ${poly([p || 2, m])}$`],
      `$m = \\dfrac{${m * x2 + p} - ${par(m * x1 + p)}}{${x2} - ${par(x1)}} = ${m}$ puis $p = ${m * x1 + p} - ${par(m)} \\times ${par(x1)} = ${p}$.`, () => `$y = ${poly([m, int(r, -9, 9)])}$`);
  },
  (r) => {
    const m = nonZero(r, 6), p = int(r, -8, 8), q = p + nonZero(r, 5);
    const para = r() < 0.5;
    const m2 = para ? m : m + nonZero(r, 3);
    return tf(`Les droites $y = ${poly([m, p])}$ et $y = ${poly([m2, q])}$ sont parallèles.`, para, para ? `Même coefficient directeur $${m}$.` : `Coefficients directeurs différents : $${m}$ et $${m2}$.`);
  },
  (r) => {
    const a = nonZero(r, 7), b = nonZero(r, 7), c = int(r, -10, 10);
    const eq = `${poly([a, 0])}${term(b, "y")}${term(c)} = 0`;
    // Leurres non colinéaires à (-b ; a) : (a ; -b) l'est dès que |a| = |b|.
    const col = ([x, y]: number[]) => x * a - y * -b === 0;
    return oneOf(r, [
      () => mcq(r, `Coefficient directeur de la droite $${eq}$ ?`, frac(-a, b), [frac(a, b), frac(-b, a), frac(b, a)],
        `On isole $y$ : $${b === 1 ? "" : b === -1 ? "-" : b}y = ${poly([-a, -c])}$, donc $y = ${fracTex(-a, b) === "1" ? "" : fracTex(-a, b) === "-1" ? "-" : fracTex(-a, b)}x + \\dots$`, () => frac(nonZero(r, 9), int(r, 1, 7))),
      () => mcq(r, `Un vecteur directeur de la droite $${eq}$ ?`, `$${pt(-b, a)}$`, [[a, b], [b, a], [a, -b], [b, -a]].filter((v) => !col(v)).map((v) => `$${pt(v[0], v[1])}$`),
        `Pour $ax + by + c = 0$, $\\vec{u}\\,(-b\\,;\\,a)$ est directeur : ici $(${-b}\\,;\\,${a})$.`, () => {
          for (;;) {
            const v = [nonZero(r, 7), nonZero(r, 7)];
            if (!col(v)) return `$${pt(v[0], v[1])}$`;
          }
        }),
    ]);
  },
  (r) => {
    const x = int(r, -5, 5), y = int(r, -5, 5), a = nonZero(r, 4), b = nonZero(r, 4), c = nonZero(r, 4), d = nonZero(r, 4);
    if (a * d - b * c === 0) return tf(`Deux droites de coefficients directeurs égaux sont sécantes.`, false, `Elles sont parallèles (ou confondues).`);
    return mcq(r, `Solution du système $\\begin{cases} ${poly([a, 0])} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y = ${a * x + b * y} \\\\ ${poly([c, 0])} ${d < 0 ? "-" : "+"} ${Math.abs(d) === 1 ? "" : Math.abs(d)}y = ${c * x + d * y} \\end{cases}$ ?`,
      `$${pt(x, y)}$`, [`$${pt(y, x)}$`, `$${pt(-x, y)}$`, `$${pt(x, -y)}$`, `$${pt(x + 1, y)}$`], `On vérifie : $${a}\\times${par(x)} + ${par(b)}\\times${par(y)} = ${a * x + b * y}$ et $${c}\\times${par(x)} + ${par(d)}\\times${par(y)} = ${c * x + d * y}$.`);
  },
  (r) => {
    const m = nonZero(r, 5), p = int(r, -6, 6), x = int(r, -5, 5);
    const on = r() < 0.5;
    const y = on ? m * x + p : m * x + p + nonZero(r, 3);
    return tf(`Le point $${pt(x, y)}$ appartient à la droite $y = ${poly([m, p])}$.`, on, `$${m} \\times ${par(x)} + ${par(p)} = ${m * x + p}$.`);
  },
];

// ───────────── Statistiques ─────────────

const sorted = (v: number[]) => [...v].sort((a, b) => a - b);

/** « = x » si la valeur est exacte à d décimales, sinon « ≈ x » avec ses d décimales (9,10 au centième, pas 9,1). */
const eqApprox = (x: number, d = 2) => (Math.abs(Math.round(x * 10 ** d) / 10 ** d - x) < 1e-9 ? `= ${tex(x, d)}` : `\\approx ${x.toFixed(d).replace(".", "{,}")}`);

const stats: Generator[] = [
  (r) => {
    const n = pick(r, [4, 5]);
    const v = Array.from({ length: n }, () => int(r, 4, 20));
    const s = v.reduce((a, b) => a + b, 0);
    return numeric(`Moyenne de la série $${v.join("\\,;\\,")}$ ?`, s / n, `$\\dfrac{${s}}{${n}} = ${tex(s / n)}$.`, undefined, 0.01);
  },
  (r) => {
    const n = pick(r, [5, 7, 6]);
    const v = Array.from({ length: n }, () => int(r, 1, 30));
    const s = sorted(v);
    const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    return numeric(`Médiane de la série $${v.join("\\,;\\,")}$ ?`, med, `On range : $${s.join("\\,;\\,")}$. ${n % 2 ? `Valeur du milieu : $${med}$.` : `Moyenne des deux valeurs centrales : $${tex(med)}$.`}`, undefined, 0.01);
  },
  (r) => {
    // Moyennes : regroupement de deux groupes (moyenne pondérée, pas la moyenne des moyennes) ou valeur corrigée.
    const n1 = int(r, 8, 20), n2 = pick(r, [5, 6, 10, 12, 15, 24, 30].filter((v) => v !== n1)), m1 = int(r, 8, 15), m2 = int(r, 8, 15) + (r() < 0.5 ? 0.5 : 0);
    const n = int(r, 10, 25), m = int(r, 9, 14), old = int(r, 4, 12), neu = old + int(r, 3, 10);
    return oneOf(r, [
      () => numeric(`Un groupe de $${n1}$ élèves a $${tex(m1)}$ de moyenne, un autre de $${n2}$ élèves a $${tex(m2)}$. Moyenne de l'ensemble des élèves (au centième) ?`, Math.round(((n1 * m1 + n2 * m2) / (n1 + n2)) * 100) / 100,
        `Moyenne pondérée par les effectifs : $\\dfrac{${n1} \\times ${tex(m1)} + ${n2} \\times ${tex(m2)}}{${n1} + ${n2}} = \\dfrac{${tex(n1 * m1 + n2 * m2)}}{${n1 + n2}} ${eqApprox((n1 * m1 + n2 * m2) / (n1 + n2))}$, et non $\\dfrac{${tex(m1)} + ${tex(m2)}}{2}$.`, undefined, 0.011, 2),
      () => numeric(`Une série de $${n}$ notes a pour moyenne $${m}$. On corrige une erreur : une note de $${old}$ était en fait $${neu}$. Nouvelle moyenne (au centième) ?`, Math.round((m + (neu - old) / n) * 100) / 100,
        `La somme passe de $${n} \\times ${m} = ${n * m}$ à $${n * m} + ${neu - old} = ${n * m + neu - old}$ : moyenne $\\dfrac{${n * m + neu - old}}{${n}} ${eqApprox(m + (neu - old) / n)}$.`, undefined, 0.011, 2),
    ]);
  },
  (r) => {
    const vals = [int(r, 8, 12), int(r, 13, 16), int(r, 17, 20)], eff = [int(r, 1, 5), int(r, 1, 5), int(r, 1, 5)];
    const n = eff.reduce((a, b) => a + b, 0), s = vals.reduce((a, x, i) => a + x * eff[i], 0);
    return numeric(`Notes $${vals.join("\\,;\\,")}$ obtenues par $${eff.join("\\,;\\,")}$ élèves. Moyenne${(100 * s) % n === 0 ? "" : " (au centième)"} ?`, s / n, `$\\dfrac{${vals.map((x, i) => `${x} \\times ${eff[i]}`).join(" + ")}}{${n}} ${eqApprox(s / n)}$.`, undefined, 0.01);
  },
  (r) => {
    const m = int(r, 8, 15), k = int(r, 1, 5), c = pick(r, [2, 3]);
    return oneOf(r, [
      () => texMcq(r, `Une série a pour moyenne $${m}$. On ajoute $${k}$ à chaque valeur. Nouvelle moyenne ?`, m + k, [m, m * k, m + k * 2], `La moyenne augmente aussi de $${k}$.`),
      () => texMcq(r, `Une série a pour moyenne $${m}$. On multiplie chaque valeur par $${c}$. Nouvelle moyenne ?`, m * c, [m, m + c, m * c * c], `La moyenne est aussi multipliée par $${c}$.`),
    ]);
  },
  cards([
    ["Le premier quartile $Q_1$ est…", "la plus petite valeur telle qu'au moins 25 % des valeurs lui soient inférieures ou égales", ["la moyenne des 25 % plus petites valeurs", "la valeur qui coupe la série en deux", "le quart de l'étendue"], "Définition du programme de Seconde."],
    ["L'écart interquartile vaut…", "$Q_3 - Q_1$", ["$Q_3 + Q_1$", "$\\max - \\min$", "$\\dfrac{Q_1 + Q_3}{2}$"], "Il mesure la dispersion des 50 % centraux."],
    ["L'écart-type mesure…", "la dispersion des valeurs autour de la moyenne", ["la valeur la plus fréquente", "la valeur centrale", "le nombre de valeurs"], "Plus il est grand, plus la série est dispersée."],
    ["Quel indicateur est peu sensible aux valeurs extrêmes ?", "la médiane", ["la moyenne", "l'étendue", "le maximum"], "La médiane ne dépend que du rang des valeurs."],
  ]),
];

// ───────────── Probabilités ─────────────

const probas: Generator[] = [
  (r) => {
    const items: Array<[string, number, string]> = [
      ["un nombre pair", 3, "2, 4, 6"],
      ["un multiple de 3", 2, "3, 6"],
      ["un nombre premier", 3, "2, 3, 5"],
      ["un 6", 1, "6"],
      ["un nombre supérieur ou égal à 5", 2, "5, 6"],
      ["un nombre strictement inférieur à 5", 4, "1, 2, 3, 4"],
      ["un diviseur de 6", 4, "1, 2, 3, 6"],
    ];
    const [ev, k, list] = pick(r, items);
    return mcq(r, `On lance un dé équilibré à 6 faces. Probabilité d'obtenir ${ev} ?`, frac(k, 6), [frac(k + 1, 6), frac(k, 5), frac(6 - k, 6), frac(1, k + 1)], `Issues favorables : ${list}, soit $${k}$ sur $6$.`, () => frac(int(r, 1, 5), 6));
  },
  (r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9), n = a + b + c;
    const [color, k] = pick(r, [["rouge", a], ["bleue", b], ["verte", c]] as const);
    // Leurres : des probabilités (strictement entre 0 et 1), pas de « 1 » ni de quotient supérieur à 1.
    const wrongs = [[k, n - k], [1, 3], [n - k, n], [k + 1, n], [k, n + 1]].filter(([u, v]) => u < v).map(([u, v]) => frac(u, v));
    return mcq(r, `Une urne contient $${a}$ boules rouges, $${b}$ bleues et $${c}$ vertes. On tire une boule. $P(\\text{${color}}) = \\;?$`, frac(k, n), wrongs, `$${k}$ boules ${color}s sur $${n}$.`, () => frac(int(r, 1, n - 1), n));
  },
  (r) => {
    // Formule d'union et événement contraire, à l'envers ou combinés (plus que le simple 1 - p).
    const i = int(r, 1, 3) / 10, pa = i + int(r, 1, 4) / 10, pb = i + int(r, 1, 3) / 10, u = pa + pb - i;
    return oneOf(r, [
      () => numeric(`$P(A) = ${tex(pa)}$, $P(B) = ${tex(pb)}$ et $P(A \\cup B) = ${tex(u)}$. $P(A \\cap B) = \\;?$`, i, `$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$, donc $P(A \\cap B) = ${tex(pa)} + ${tex(pb)} - ${tex(u)} = ${tex(i)}$.`, undefined, 0.001),
      () => numeric(`$P(A) = ${tex(pa)}$, $P(A \\cap B) = ${tex(i)}$ et $P(A \\cup B) = ${tex(u)}$. $P(B) = \\;?$`, pb, `$P(B) = P(A \\cup B) - P(A) + P(A \\cap B) = ${tex(u)} - ${tex(pa)} + ${tex(i)} = ${tex(pb)}$.`, undefined, 0.001),
      () => {
        const na = int(r, 50, 90) / 100, b = int(r, 5, Math.round((na) * 100) - 5) / 100;
        return numeric(`$A$ et $B$ sont incompatibles, $P(\\overline{A}) = ${tex(na)}$ et $P(B) = ${tex(b)}$. $P(A \\cup B) = \\;?$`, 1 - na + b, `$P(A) = 1 - ${tex(na)} = ${tex(1 - na)}$ ; incompatibles : $P(A \\cup B) = P(A) + P(B) = ${tex(1 - na + b)}$.`, undefined, 0.001);
      },
    ]);
  },
  (r) => {
    const pa = int(r, 2, 6) / 10, pb = int(r, 2, 5) / 10, pab = int(r, 1, Math.round(Math.min(pa, pb) * 10)) / 10;
    return numeric(`$P(A) = ${tex(pa)}$, $P(B) = ${tex(pb)}$, $P(A \\cap B) = ${tex(pab)}$. $P(A \\cup B) = \\;?$`, pa + pb - pab, `$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${tex(pa + pb - pab)}$.`, undefined, 0.001);
  },
  (r) => {
    const n = int(r, 3, 6), fill = () => frac(int(r, 1, 2 ** n - 1), 2 ** n);
    return oneOf(r, [
      () => mcq(r, `On lance $${n}$ pièces équilibrées. Probabilité d'obtenir uniquement des « pile » ?`, frac(1, 2 ** n), [frac(1, 2 * n), frac(1, n), frac(n, 2 ** n)], `Chaque lancer donne pile avec probabilité $\\frac12$ : $\\left(\\frac12\\right)^{${n}}$.`, fill),
      () => mcq(r, `On lance $${n}$ pièces équilibrées. Probabilité d'obtenir au moins un « pile » ?`, frac(2 ** n - 1, 2 ** n), [frac(1, 2 ** n), frac(n, 2 ** n), frac(1, 2)], `Contraire de « que des face » : $1 - \\frac{1}{${2 ** n}}$.`, fill),
    ]);
  },
  (r) => {
    const deck = pick(r, [32, 52]);
    const items: Array<[string, number]> = [["un roi", 4], ["un cœur", deck / 4], ["une figure (valet, dame, roi)", 12], ["un as rouge", 2], ["une carte noire", deck / 2]];
    const [ev, k] = pick(r, items);
    return mcq(r, `On tire une carte d'un jeu de $${deck}$ cartes. Probabilité de tirer ${ev} ?`, frac(k, deck), [frac(k, 52 + 32 - deck), frac(1, 4), frac(k + 1, deck), frac(1, 13)], `$${k}$ cartes favorables sur $${deck}$.`, () => frac(int(r, 1, 12), deck));
  },
];

export const MATHS_SECONDE: Record<string, Generator[]> = {
  "maths-2-nombres": nombres,
  "maths-2-equations": equations,
  "maths-2-fonctions": fonctions,
  "maths-2-affines": affines,
  "maths-2-reference": reference,
  "maths-2-vecteurs": vecteurs,
  "maths-2-droites": droites,
  "maths-2-stats": stats,
  "maths-2-probas": probas,
};
