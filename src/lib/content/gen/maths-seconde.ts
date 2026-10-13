/** Générateurs de questions — Mathématiques, Seconde. */
import {
  type Generator,
  cards,
  claims,
  frac,
  fracTex,
  int,
  mcq,
  nonZero,
  numeric,
  oneOf,
  par,
  pick,
  poly,
  shift,
  tex,
  texMcq,
  tf,
} from "./kit";

const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;

// ───────────── Nombres et calculs ─────────────

const nombres: Generator[] = [
  (r) => {
    const a = pick(r, [2, 3, 5, 10]), m = int(r, -4, 6), n = int(r, -3, 6);
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
    return mcq(r, `$\\sqrt{${k * k * m}}$ s'écrit plus simplement…`, `$${k}\\sqrt{${m}}$`, [`$${m}\\sqrt{${k}}$`, `$${k * k}\\sqrt{${m}}$`, `$${k}\\sqrt{${k * m}}$`, `$${k + m}$`],
      `$${k * k * m} = ${k * k} \\times ${m}$ et $\\sqrt{${k * k}} = ${k}$.`);
  },
  (r) => {
    const b = int(r, 2, 9), d = int(r, 2, 9), a = nonZero(r, 9), c = nonZero(r, 9);
    const op = r() < 0.5 ? "+" : "-";
    const n = op === "+" ? a * d + c * b : a * d - c * b;
    if (n === 0) return numeric(`$\\dfrac{${a}}{${b}} ${op} \\dfrac{${c}}{${d}} = \\;?$`, 0, `Même valeur des deux côtés : la différence est nulle.`);
    const second = c < 0 ? `\\left(${fracTex(c, d)}\\right)` : fracTex(c, d);
    return mcq(r, `$${fracTex(a, b)} ${op} ${second} = \\;?$`, frac(n, b * d),
      [frac(op === "+" ? a + c : a - c, b + d), frac(op === "+" ? a + c : a - c, b * d), frac(n + 1, b * d), frac(a * c, b * d)],
      `On réduit au même dénominateur $${b * d}$ : $\\dfrac{${a * d} ${op} ${par(c * b)}}{${b * d}}$, puis on simplifie.`, () => frac(nonZero(r, 30), int(r, 2, 40)));
  },
  (r) => {
    const items: Array<[string, string, string]> = [
      [`$${int(r, 2, 400)}$`, "$\\mathbb{N}$", "C'est un entier naturel."],
      [`$-${int(r, 1, 400)}$`, "$\\mathbb{Z}$", "Entier négatif : entier relatif."],
      [`$${tex(int(r, 1, 99) + pick(r, [0.5, 0.25, 0.2, 0.75, 0.125]))}$`, "$\\mathbb{D}$", "Il s'écrit avec un nombre fini de décimales : décimal."],
      [`$\\dfrac{${pick(r, [1, 2, 4, 5, 7, 8])}}{${pick(r, [3, 9, 7, 11])}}$`, "$\\mathbb{Q}$", "Quotient d'entiers dont l'écriture décimale est infinie périodique : rationnel non décimal."],
      [`$\\sqrt{${pick(r, [2, 3, 5, 6, 7, 10, 11, 13])}}$`, "$\\mathbb{R}$", "La racine d'un entier non carré parfait est irrationnelle."],
      ["$\\pi$", "$\\mathbb{R}$", "$\\pi$ est irrationnel."],
    ];
    const [x, set, e] = pick(r, items);
    return mcq(r, `Plus petit ensemble contenant ${x} ?`, set, ["$\\mathbb{N}$", "$\\mathbb{Z}$", "$\\mathbb{D}$", "$\\mathbb{Q}$", "$\\mathbb{R}$"], e);
  },
  (r) => {
    const p = int(r, 2, 40) * 5, t = pick(r, [5, 10, 15, 20, 25, 30, 40, 50]);
    const up = r() < 0.5;
    const ans = (p * (100 + (up ? t : -t))) / 100;
    return texMcq(r, `Un article à $${p}$ € ${up ? "augmente" : "baisse"} de $${t}\\,\\%$. Nouveau prix ?`, ans,
      [p + (up ? -1 : 1) * (p * t) / 100, p + (up ? t : -t), (p * t) / 100], `Coefficient multiplicateur : $1 ${up ? "+" : "-"} ${tex(t / 100)} = ${tex(1 + (up ? t : -t) / 100)}$, donc $${p} \\times ${tex(1 + (up ? t : -t) / 100)} = ${tex(ans)}$.`, "€");
  },
  (r) => {
    // Programme 2026 : multiples, diviseurs, parité (les nombres premiers ne sont plus exigés).
    const d = pick(r, [2, 3, 4, 5, 6, 7, 9, 11, 12, 15]), n = int(r, 12, 300);
    const isMultiple = r() < 0.5 ? true : n % d === 0;
    const m = isMultiple ? d * int(r, 3, 40) : n % d === 0 ? n + 1 : n;
    return oneOf(r, [
      () => tf(`$${m}$ est un multiple de $${d}$.`, m % d === 0, m % d === 0 ? `$${m} = ${d} \\times ${m / d}$.` : `$${m} = ${d} \\times ${Math.floor(m / d)} + ${m % d}$ : le reste n'est pas nul.`),
      () => tf(`$${m}$ est un nombre pair.`, m % 2 === 0, `Un nombre est pair s'il est multiple de 2 (chiffre des unités 0, 2, 4, 6 ou 8).`),
      () => tf(`$${d}$ est un diviseur de $${m}$.`, m % d === 0, m % d === 0 ? `$${m} \\div ${d} = ${m / d}$.` : `La division de $${m}$ par $${d}$ ne tombe pas juste.`),
      () => {
        const a = int(r, 1, 30);
        return tf(`Pour tout entier $n$, $2n + ${2 * a + 1}$ est impair.`, true, `$2n + ${2 * a + 1} = 2(n + ${a}) + 1$ : c'est un nombre impair.`);
      },
    ]);
  },
  (r) => {
    // Valeur absolue (ajoutée au programme 2026).
    const a = int(r, -9, 9), b = int(r, 1, 8);
    return oneOf(r, [
      () => numeric(`$|${a} - ${par(b)}| = \\;?$`, Math.abs(a - b), `$|${a - b}| = ${Math.abs(a - b)}$ : une valeur absolue est toujours positive.`),
      () => mcq(r, `Solutions de $|x - ${par(a)}| = ${b}$ ?`, `$\\{${a - b}\\,;\\,${a + b}\\}$`, [`$\\{${-a - b}\\,;\\,${-a + b}\\}$`, `$\\{${a + b}\\}$`, `$\\{${b - a}\\,;\\,${a + b}\\}$`], `Les nombres à distance $${b}$ de $${a}$ : $${a} - ${b}$ et $${a} + ${b}$.`),
      () => mcq(r, `$|x - ${par(a)}| \\leq ${b}$ équivaut à $x \\in \\;?$`, `$[${a - b}\\,;\\,${a + b}]$`, [`$]${a - b}\\,;\\,${a + b}[$`, `$[${-b}\\,;\\,${b}]$`, `$[${a}\\,;\\,${a + b}]$`], `Distance à $${a}$ inférieure ou égale à $${b}$.`),
    ]);
  },
  (r) => {
    const a = int(r, -15, 15), b = int(r, -15, 15);
    return numeric(`Distance entre $${a}$ et $${b}$ sur la droite des réels, c'est-à-dire $|${a} - ${par(b)}|$ ?`, Math.abs(a - b), `$|${a} - ${par(b)}| = |${a - b}| = ${Math.abs(a - b)}$.`);
  },
];

// ───────────── Équations et inéquations ─────────────

const equations: Generator[] = [
  (r) => {
    const a = nonZero(r, 9, true), x = int(r, -12, 12), b = int(r, -20, 20);
    return numeric(`Résous : $${poly([a, b])} = ${tex(a * x + b)}$. $x = \\;?$`, x, `$${a}x = ${tex(a * x + b)} - ${par(b)} = ${a * x}$, donc $x = ${x}$.`);
  },
  (r) => {
    const a = nonZero(r, 9);
    return mcq(r, `Développe $(x ${a < 0 ? "-" : "+"} ${Math.abs(a)})^2$.`, `$${poly([1, 2 * a, a * a])}$`, [`$${poly([1, 0, a * a])}$`, `$${poly([1, a, a * a])}$`, `$${poly([1, 2 * a, -a * a])}$`, `$${poly([1, 0, -a * a])}$`],
      `Identité remarquable : $(a ${a < 0 ? "-" : "+"} b)^2 = a^2 ${a < 0 ? "-" : "+"} 2ab + b^2$.`);
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
    return mcq(r, `Résous $${poly([a, b])} ${sign} ${c}$.`, `$x ${s} ${k}$`, [`$x ${opp} ${k}$`, `$x ${s} ${fracTex(c + b, a)}$`, `$x ${opp} ${fracTex(b - c, a)}$`],
      `$${a}x ${sign} ${c - b}$, puis on divise par $${a}$${a < 0 ? " (négatif : on change le sens !)" : ""}.`);
  },
  (r) => {
    const a = nonZero(r, 5), b = nonZero(r, 9), c = nonZero(r, 5), d = nonZero(r, 9);
    return mcq(r, `Développe $(${poly([a, b])})(${poly([c, d])})$.`, `$${poly([a * c, a * d + b * c, b * d])}$`,
      [`$${poly([a * c, b * d])}$`, `$${poly([a * c, a * d - b * c, b * d])}$`, `$${poly([a + c, a * d + b * c, b + d])}$`, `$${poly([a * c, a * d + b * c, -b * d])}$`],
      `Double distributivité : $${a * c}x^2 + ${par(a * d)}x + ${par(b * c)}x + ${par(b * d)}$.`);
  },
  (r) => {
    const p = int(r, -9, 9), q = int(r, -9, 9);
    if (p === -q) return tf(`L'équation $(x ${p < 0 ? "+" : "-"} ${Math.abs(p)})^2 = 0$ a une seule solution.`, true, `Un carré est nul si et seulement si ce qu'il contient est nul : $x = ${p}$.`);
    const f = (v: number) => (v === 0 ? "x" : `(x ${v < 0 ? "+" : "-"} ${Math.abs(v)})`);
    const set = (u: number, v: number) => `$\\{${Math.min(u, v)}\\,;\\,${Math.max(u, v)}\\}$`;
    return mcq(r, `Solutions de $${f(p)}${f(q)} = 0$ ?`, set(p, q), [set(-p, -q), set(p, -q), set(-p, q), `$\\{${p * q}\\}$`],
      `Un produit est nul si et seulement si l'un des facteurs est nul.`);
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
    return numeric(`$f(x) = ${poly([a, b])}$. Antécédent de $${a * x + b}$ par $f$ ?`, x, `On résout $${poly([a, b])} = ${a * x + b}$ : $x = ${x}$.`);
  },
  (r) => {
    const a = int(r, 1, 6), b = nonZero(r, 6), k = int(r, -5, 5);
    if (k === -b) return tf(`$f(x) = \\dfrac{x + ${a}}{x ${b < 0 ? "-" : "+"} ${Math.abs(b)}}$ est définie en $x = ${k}$.`, false, `Le dénominateur s'annule en $${k}$.`);
    return mcq(r, `$f(x) = \\dfrac{x + ${a}}{x ${b < 0 ? "-" : "+"} ${Math.abs(b)}}$. $f(${k}) = \\;?$`, frac(k + a, k + b), [frac(k + b, k + a), frac(k * a, k * b), frac(a, b), frac(k + a + 1, k + b)],
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
      () => mcq(r, `Ensemble de définition de $f(x) = \\sqrt{${shift(a)}}$ ?`, `$[${a}\\,;\\,+\\infty[$`, [`$]${a}\\,;\\,+\\infty[$`, `$]-\\infty\\,;\\,${a}]$`, `$[${-a}\\,;\\,+\\infty[$`], `Sous la racine, il faut $x - ${par(a)} \\geq 0$.`),
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
      `$m = \\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{${y2 - y1}}{${x2 - x1}}$.`, () => frac(nonZero(r, 9), int(r, 1, 6)));
  },
  (r) => {
    const m = nonZero(r, 9), p = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Ordonnée à l'origine de $f(x) = ${poly([m, p])}$ ?`, `$${p}$`, [`$${m}$`, `$${-p}$`, `$${fracTex(-p, m)}$`], `$f(0) = ${p}$.`, () => `$${int(r, -12, 12)}$`),
      () => mcq(r, `$f(x) = ${poly([m, p])}$ est…`, m > 0 ? "croissante" : "décroissante", ["croissante", "décroissante", "constante", "ni croissante ni décroissante"], `Le coefficient directeur $${m}$ est ${m > 0 ? "positif" : "négatif"}.`),
      () => mcq(r, `Pour quelle valeur $f(x) = ${poly([m, p])}$ s'annule-t-elle ?`, `$${fracTex(-p, m)}$`, [`$${fracTex(p, m)}$`, `$${fracTex(-m, p || 1)}$`, `$${-p}$`], `$${m}x + ${par(p)} = 0 \\iff x = ${fracTex(-p, m)}$.`, () => `$${fracTex(nonZero(r, 9), int(r, 1, 5))}$`),
    ]);
  },
  (r) => {
    const m = nonZero(r, 5), p = int(r, -8, 8), a = int(r, -4, 4), b = a + nonZero(r, 4);
    return mcq(r, `$f$ est affine, $f(${a}) = ${m * a + p}$ et $f(${b}) = ${m * b + p}$. $f(x) = \\;?$`, `$${poly([m, p])}$`, [`$${poly([-m, p])}$`, `$${poly([m, -p])}$`, `$${poly([p || 1, m])}$`],
      `$m = \\dfrac{${m * b + p} - ${par(m * a + p)}}{${b} - ${par(a)}} = ${m}$, puis $p = f(${a}) - ${m} \\times ${par(a)} = ${p}$.`);
  },
  (r) => {
    const m = nonZero(r, 9), p = int(r, -9, 9), x = int(r, -5, 5);
    return numeric(`$f(x) = ${poly([m, p])}$. Que vaut $f(${x + 1}) - f(${x})$ ?`, m, `Pour une fonction affine, quand $x$ augmente de 1, $f(x)$ augmente du coefficient directeur $${m}$.`);
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
    return mcq(r, `Si $x \\in [${a}\\,;\\,${b}]$, alors $\\dfrac{1}{x}$ appartient à…`, `$[${fracTex(1, b)}\\,;\\,${fracTex(1, a)}]$`, [`$[${fracTex(1, a)}\\,;\\,${fracTex(1, b)}]$`, `$[-${fracTex(1, a)}\\,;\\,-${fracTex(1, b)}]$`, `$[${b}\\,;\\,${a}]$`],
      `La fonction inverse est décroissante sur $]0\\,;\\,+\\infty[$ : elle inverse l'ordre.`);
  },
  (r) => {
    const k = pick(r, [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, -4, -9, 0]);
    const s = Math.sqrt(Math.abs(k));
    const ans = k < 0 ? "$\\varnothing$" : k === 0 ? "$\\{0\\}$" : `$\\{-${s}\\,;\\,${s}\\}$`;
    return mcq(r, `Solutions de $x^2 = ${k}$ ?`, ans, ["$\\varnothing$", "$\\{0\\}$", `$\\{${s || 1}\\}$`, `$\\{-${s || 1}\\,;\\,${s || 1}\\}$`, `$\\{${Math.abs(k)}\\}$`],
      k < 0 ? "Un carré est toujours positif." : `Les deux nombres dont le carré vaut $${k}$.`);
  },
  (r) => {
    const k = pick(r, [4, 9, 16, 25, 36, 49]);
    const s = Math.sqrt(k);
    return oneOf(r, [
      () => mcq(r, `Solutions de $x^2 < ${k}$ ?`, `$]-${s}\\,;\\,${s}[$`, [`$]-\\infty\\,;\\,${s}[$`, `$]-\\infty\\,;\\,-${s}[\\,\\cup\\,]${s}\\,;\\,+\\infty[$`, `$]0\\,;\\,${s}[$`], `Entre les deux racines $-${s}$ et $${s}$.`),
      () => mcq(r, `Solutions de $x^2 > ${k}$ ?`, `$]-\\infty\\,;\\,-${s}[\\,\\cup\\,]${s}\\,;\\,+\\infty[$`, [`$]-${s}\\,;\\,${s}[$`, `$]${s}\\,;\\,+\\infty[$`, `$]${k}\\,;\\,+\\infty[$`], `À l'extérieur des racines $-${s}$ et $${s}$.`),
    ]);
  },
  (r) => {
    const a = int(r, 2, 6);
    return oneOf(r, [
      () => numeric(`$(-${a})^3 = \\;?$`, -(a ** 3), `Un cube garde le signe : $-${a ** 3}$.`),
      () => numeric(`$\\sqrt{${a * a * 4}} = \\;?$`, 2 * a, `$${2 * a}^2 = ${a * a * 4}$.`),
      () => numeric(`$(-${a})^2 = \\;?$`, a * a, `Un carré est toujours positif.`),
    ]);
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
    const a = int(r, -7, 7), b = int(r, -7, 7), c = int(r, -7, 7), d = int(r, -7, 7), k = nonZero(r, 4);
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
      `$m = \\dfrac{${m * x2 + p} - ${par(m * x1 + p)}}{${x2} - ${par(x1)}} = ${m}$ puis $p = ${m * x1 + p} - ${m} \\times ${par(x1)} = ${p}$.`);
  },
  (r) => {
    const m = nonZero(r, 6), p = int(r, -8, 8), q = p + nonZero(r, 5);
    const para = r() < 0.5;
    const m2 = para ? m : m + nonZero(r, 3);
    return tf(`Les droites $y = ${poly([m, p])}$ et $y = ${poly([m2, q])}$ sont parallèles.`, para, para ? `Même coefficient directeur $${m}$.` : `Coefficients directeurs différents : $${m}$ et $${m2}$.`);
  },
  (r) => {
    const a = nonZero(r, 7), b = nonZero(r, 7), c = int(r, -10, 10);
    return oneOf(r, [
      () => mcq(r, `Coefficient directeur de la droite $${poly([a, 0])} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y ${c < 0 ? "-" : "+"} ${Math.abs(c)} = 0$ ?`, frac(-a, b), [frac(a, b), frac(-b, a), frac(b, a)],
        `On isole $y$ : $y = ${fracTex(-a, b)}x + \\dots$`, () => frac(nonZero(r, 9), int(r, 1, 7))),
      () => mcq(r, `Un vecteur directeur de $${poly([a, 0])} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y ${c < 0 ? "-" : "+"} ${Math.abs(c)} = 0$ ?`, `$${pt(-b, a)}$`, [`$${pt(a, b)}$`, `$${pt(b, a)}$`, `$${pt(a, -b)}$`],
        `Pour $ax + by + c = 0$, $\\vec{u}\\,(-b\\,;\\,a)$ est directeur.`),
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
    const v = Array.from({ length: 6 }, () => int(r, 2, 40));
    return numeric(`Étendue de la série $${v.join("\\,;\\,")}$ ?`, Math.max(...v) - Math.min(...v), `Plus grande valeur moins plus petite : $${Math.max(...v)} - ${Math.min(...v)}$.`);
  },
  (r) => {
    const vals = [int(r, 8, 12), int(r, 13, 16), int(r, 17, 20)], eff = [int(r, 1, 5), int(r, 1, 5), int(r, 1, 5)];
    const n = eff.reduce((a, b) => a + b, 0), s = vals.reduce((a, x, i) => a + x * eff[i], 0);
    return numeric(`Notes $${vals.join("\\,;\\,")}$ obtenues par $${eff.join("\\,;\\,")}$ élèves. Moyenne ?`, s / n, `$\\dfrac{${vals.map((x, i) => `${x} \\times ${eff[i]}`).join(" + ")}}{${n}} = ${tex(s / n, 2)}$.`, undefined, 0.01);
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
    const a = int(r, 1, 9), b = int(r, 1, 9), c = int(r, 1, 9), n = a + b + c;
    const [color, k] = pick(r, [["rouge", a], ["bleue", b], ["verte", c]] as const);
    return mcq(r, `Une urne contient $${a}$ boules rouges, $${b}$ bleues et $${c}$ vertes. On tire une boule. $P(\\text{${color}}) = \\;?$`, frac(k, n), [frac(k, n - k || 1), frac(1, 3), frac(n - k, n), frac(k + 1, n)], `$${k}$ boules ${color}s sur $${n}$.`, () => frac(int(r, 1, n - 1), n));
  },
  (r) => {
    const p = int(r, 1, 99) / 100;
    return numeric(`$P(A) = ${tex(p)}$. Calcule $P(\\overline{A})$.`, 1 - p, `$P(\\overline{A}) = 1 - P(A) = ${tex(1 - p)}$.`, undefined, 0.001);
  },
  (r) => {
    const pa = int(r, 2, 6) / 10, pb = int(r, 2, 5) / 10, pab = int(r, 1, Math.round(Math.min(pa, pb) * 10)) / 10;
    return numeric(`$P(A) = ${tex(pa)}$, $P(B) = ${tex(pb)}$, $P(A \\cap B) = ${tex(pab)}$. $P(A \\cup B) = \\;?$`, pa + pb - pab, `$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${tex(pa + pb - pab)}$.`, undefined, 0.001);
  },
  (r) => {
    const n = int(r, 2, 5);
    return oneOf(r, [
      () => mcq(r, `On lance $${n}$ pièces équilibrées. Probabilité d'obtenir uniquement des « pile » ?`, frac(1, 2 ** n), [frac(1, 2 * n), frac(1, n), frac(n, 2 ** n)], `Chaque lancer donne pile avec probabilité $\\frac12$ : $\\left(\\frac12\\right)^{${n}}$.`),
      () => mcq(r, `On lance $${n}$ pièces équilibrées. Probabilité d'obtenir au moins un « pile » ?`, frac(2 ** n - 1, 2 ** n), [frac(1, 2 ** n), frac(n, 2 ** n), frac(1, 2)], `Contraire de « que des face » : $1 - \\frac{1}{${2 ** n}}$.`),
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
