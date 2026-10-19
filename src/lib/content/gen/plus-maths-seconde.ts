/**
 * Maths, Seconde : questions supplémentaires, une par notion du programme
 * (types d'exercices qu'on retrouve en contrôle), en plus de `maths-seconde.ts`.
 */
import { type Generator, cards, claims, frac, fracTex, gcd, int, mcq, nonZero, numeric, oneOf, par, pick, poly, sample, shift, tex, tf } from "./kit";

/** $ax + by$ bien écrit. */
const lin = (a: number, b: number) => `${poly([a, 0])} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y`;
const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;
const set = (...v: number[]) => `$\\{${[...v].sort((a, b) => a - b).map((x) => tex(x)).join("\\,;\\,")}\\}$`;
const sorted = (v: number[]) => [...v].sort((a, b) => a - b);
/** Facteur $(x - a)$, ou $x$ si $a = 0$. */
const fac = (a: number) => (a === 0 ? "x" : `(${shift(a)})`);
const sci = (m: number, e: number) => `$${tex(m)} \\times 10^{${e}}$`;

// ───────────── Nombres et calculs ─────────────

const nombres: Generator[] = [
  (r) => {
    // k ≠ 0 : sinon 9^k = 3^k = 1 et le leurre « 9^k » serait aussi juste.
    // b, c ≠ 0, b ≠ -a et c ∉ {a, b} : sinon un facteur se simplifie à vue et la réponse se lit directement.
    const a = int(r, 2, 9), b = pick(r, [-4, -3, -2, -1, 1, 2, 3, 4, 5, 6].filter((v) => v !== -a));
    const c = pick(r, [-3, -2, -1, 1, 2, 3, 4, 5].filter((v) => v !== a && v !== b && v !== a + b));
    const k = a + b - c;
    return mcq(r, `Simplifie $\\dfrac{3^{${a}} \\times 3^{${b}}}{3^{${c}}}$.`, `$3^{${k}}$`, [`$3^{${a * b - c}}$`, `$3^{${a + b + c}}$`, `$9^{${k}}$`, `$3^{${a - b - c}}$`],
      `$3^{${a}} \\times 3^{${b}} = 3^{${a + b}}$, puis $\\dfrac{3^{${a + b}}}{3^{${c}}} = 3^{${a + b} - ${par(c)}} = 3^{${k}}$.`, () => `$3^{${k + nonZero(r, 3)}}$`);
  },
  (r) => {
    const m = pick(r, [1.2, 2.5, 3.4, 4.05, 6.7, 7.25, 8.1, 9.9]), e = pick(r, [-5, -4, -3, -2, 3, 4, 5, 6]);
    const value = m * 10 ** e;
    const shown = tex(value, 9);
    return mcq(r, `Écriture scientifique de $${shown}$ ?`, sci(m, e), [sci(m, e + 1), sci(m, -e), sci(m * 10, e - 1)],
      `Un seul chiffre non nul avant la virgule : $${tex(m)}$, et la virgule s'est déplacée de $${Math.abs(e)}$ rang${Math.abs(e) > 1 ? "s" : ""} ${e > 0 ? "vers la gauche (puissance positive)" : "vers la droite (puissance négative)"}.`);
  },
  (r) => {
    const k = int(r, 2, 7), m = pick(r, [2, 3, 5, 6, 7]);
    return mcq(r, `Écris $\\sqrt{${k * k * m}}$ sous la forme $a\\sqrt{b}$ avec $b$ le plus petit possible.`, `$${k}\\sqrt{${m}}$`, [`$${m}\\sqrt{${k}}$`, `$${k * k}\\sqrt{${m}}$`, `$${k}\\sqrt{${m * k}}$`],
      `$${k * k * m} = ${k * k} \\times ${m}$, donc $\\sqrt{${k * k * m}} = \\sqrt{${k * k}} \\times \\sqrt{${m}} = ${k}\\sqrt{${m}}$.`, () => `$${int(r, 2, 9)}\\sqrt{${pick(r, [2, 3, 5, 6, 7])}}$`);
  },
  (r) => {
    // Au moins quatre facteurs dont deux premiers distincts (pas de « 10 = 2 × 5 », trop immédiat).
    let [a, b, c] = [int(r, 1, 4), int(r, 0, 3), int(r, 0, 2)];
    while (a + b + c < 4 || (b === 0 && c === 0)) [a, b, c] = [int(r, 1, 4), int(r, 0, 3), int(r, 0, 2)];
    const n = 2 ** a * 3 ** b * 5 ** c;
    const f = (x: number, y: number, z: number) => `$${[x ? `2^{${x}}` : "", y ? `3^{${y}}` : "", z ? `5^{${z}}` : ""].filter(Boolean).join(" \\times ")}$`.replace(/\^\{1\}/g, "");
    return mcq(r, `Décomposition de $${n}$ en produit de facteurs premiers ?`, f(a, b, c), [f(a + 1, b, c), f(a, b + 1, c), f(Math.max(1, a - 1), b, c + 1)],
      `On divise par 2 tant que possible (${a} fois), puis par 3${b ? ` (${b} fois)` : ""}${c ? `, puis par 5 (${c} fois)` : ""}.`);
  },
  (r) => {
    const g = int(r, 2, 9), q = int(r, 2, 12);
    let p = int(r, 1, 11);
    while (gcd(p, q) !== 1 || p === q) p = int(r, 1, 11);
    return mcq(r, `Forme irréductible de $\\dfrac{${g * p}}{${g * q}}$ ?`, frac(p, q), [`$\\dfrac{${p * 2}}{${q * 2}}$`, frac(p + 1, q), frac(q, p)].filter((x) => x !== frac(p, q)),
      `On divise numérateur et dénominateur par leur plus grand diviseur commun, $${g}$.`);
  },
  (r) => {
    const items: [string, string, string][] = [
      ["-7", "$\\mathbb{Z}$", "C'est un entier négatif : relatif, pas naturel."],
      ["\\dfrac{1}{3}", "$\\mathbb{Q}$", "$\\frac13 = 0{,}333\\ldots$ n'a pas d'écriture décimale finie : rationnel, pas décimal."],
      ["\\sqrt{2}", "$\\mathbb{R}$", "$\\sqrt2$ n'est pas une fraction : il est irrationnel."],
      ["\\dfrac{3}{4}", "$\\mathbb{D}$", "$\\frac34 = 0{,}75$ : décimal."],
      ["\\sqrt{49}", "$\\mathbb{N}$", "$\\sqrt{49} = 7$ : entier naturel."],
      ["-\\dfrac{12}{4}", "$\\mathbb{Z}$", "$-\\frac{12}{4} = -3$ : entier relatif."],
      ["\\pi", "$\\mathbb{R}$", "$\\pi$ est irrationnel."],
      ["2{,}75", "$\\mathbb{D}$", "Nombre fini de chiffres après la virgule."],
      ["\\dfrac{2}{7}", "$\\mathbb{Q}$", "Le développement de $\\frac27$ est infini et périodique."],
    ];
    const [x, ans, e] = pick(r, items);
    return mcq(r, `Plus petit ensemble de nombres contenant $${x}$ ?`, ans, ["$\\mathbb{N}$", "$\\mathbb{Z}$", "$\\mathbb{D}$", "$\\mathbb{Q}$", "$\\mathbb{R}$"].filter((s) => s !== ans), e);
  },
  (r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9), n = int(r, -5, 6), m = int(r, -5, 6);
    let mant = a * b, exp = n + m;
    if (mant >= 10) {
      mant /= 10;
      exp += 1;
    }
    return mcq(r, `Écriture scientifique de $(${a} \\times 10^{${n}}) \\times (${b} \\times 10^{${m}})$ ?`, sci(mant, exp), [sci(mant, exp + 1), sci(a * b, n * m), sci(mant, exp - 1)],
      `$${a} \\times ${b} = ${a * b}$ et $10^{${n}} \\times 10^{${m}} = 10^{${n + m}}$${a * b >= 10 ? `, puis $${a * b} = ${tex(a * b / 10)} \\times 10$` : ""}.`, () => sci(mant, exp + pick(r, [-3, -2, 2, 3])));
  },
  (r) => {
    const [a, b] = sample(r, [2, 3, 5, 6, 7, 10], 2);
    // √(ab) = k√m avec m sans facteur carré.
    let k = 1, m = a * b;
    for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) [k, m] = [k * d, m / (d * d)];
    const rad = (c: number, n: number) => (n === 1 ? `${c}` : `${c === 1 ? "" : c}\\sqrt{${n}}`);
    const ans = `$${a + b} + ${rad(2 * k, m)}$`;
    return oneOf(r, [
      () => mcq(r, `$(\\sqrt{${a}} + \\sqrt{${b}})^2 = \\;?$`, ans, [`$${a + b}$`, `$${a + b} + ${rad(k, m)}$`, `$${a * b} + 2\\sqrt{${a + b}}$`, `$${a + b} + 2\\sqrt{${a + b}}$`].filter((w) => w !== ans),
        `$(u + v)^2 = u^2 + 2uv + v^2$ avec $u^2 = ${a}$, $v^2 = ${b}$ et $uv = \\sqrt{${a * b}}${k > 1 ? ` = ${rad(k, m)}` : ""}$.`),
      () => numeric(`$(\\sqrt{${a + b}} - \\sqrt{${b}})(\\sqrt{${a + b}} + \\sqrt{${b}}) = \\;?$`, a, `$(u - v)(u + v) = u^2 - v^2 = ${a + b} - ${b} = ${a}$.`),
    ]);
  },
  cards([
    ["Un nombre rationnel est un nombre qui…", "s'écrit comme un quotient de deux entiers", ["a un nombre fini de décimales", "est positif", "a une racine carrée entière"], "Exemple : $\\frac{2}{7}$, $-5 = \\frac{-5}{1}$."],
    ["Lequel de ces nombres est premier ?", "$97$", ["$91$", "$51$", "$87$"], "$91 = 7 \\times 13$, $51 = 3 \\times 17$, $87 = 3 \\times 29$."],
    ["$10^{-3}$ est égal à…", "$0{,}001$", ["$-1\\,000$", "$-0{,}001$", "$0{,}0001$"], "$10^{-3} = \\frac{1}{10^3}$."],
    ["$a^0$ vaut (pour $a \\neq 0$)…", "$1$", ["$0$", "$a$", "n'existe pas"], "Par convention et pour que $a^n / a^n = a^0$."],
    ["Un multiple de 9 a toujours…", "une somme de chiffres multiple de 9", ["un dernier chiffre égal à 9", "un nombre pair de chiffres", "un chiffre 9"], "Critère de divisibilité par 9 (et par 3)."],
    ["$\\sqrt{a^2}$ est égal à…", "$|a|$", ["$a$", "$-a$", "$a^2$"], "Une racine carrée est positive : $\\sqrt{(-3)^2} = 3$."],
  ]),
  claims([
    ["La somme de deux nombres irrationnels est toujours irrationnelle.", false, "$\\sqrt2 + (-\\sqrt2) = 0$, qui est rationnel."],
    ["Tout nombre décimal est rationnel.", true, "$2{,}75 = \\frac{275}{100}$ : $\\mathbb{D} \\subset \\mathbb{Q}$."],
    ["$\\sqrt{9 + 16} = \\sqrt{9} + \\sqrt{16}$.", false, "$\\sqrt{25} = 5$ alors que $3 + 4 = 7$."],
    ["Le produit de deux nombres pairs est un multiple de 4.", true, "$2a \\times 2b = 4ab$."],
    ["1 est un nombre premier.", false, "Un nombre premier a exactement deux diviseurs ; 1 n'en a qu'un."],
  ]),
];

// ───────────── Équations, inéquations, calcul littéral ─────────────

const equations: Generator[] = [
  (r) => {
    // Facteur commun le plus grand possible, signe « - » compris si le terme en x² est négatif : -6x² + 4x = -2x(3x - 2).
    const a = nonZero(r, 9, true), b = nonZero(r, 9), s = (a < 0 ? -1 : 1) * gcd(a, b);
    const gx = s === 1 ? "x" : s === -1 ? "-x" : `${s}x`, ans = `$${gx}(${poly([a / s, b / s])})$`;
    return mcq(r, `Factorise au maximum $${poly([a, b, 0])}$.`, ans, [`$${gx}(${poly([a / s, -b / s])})$`, `$${a}x(${poly([1, b])})$`, `$x^2(${poly([a, b])})$`, ...(Math.abs(s) > 1 ? [`$x(${poly([a, b])})$`] : [`$${a}(${poly([1, b, 0])})$`])].filter((w) => w !== ans),
      `Facteur commun $${gx}$ : en développant, $${gx}(${poly([a / s, b / s])}) = ${poly([a, b, 0])}$, et il ne reste plus de facteur commun dans la parenthèse.`);
  },
  (r) => {
    const a = int(r, -8, 8), b = int(r, -8, 8);
    if (a === b) return tf(`L'équation $\\dfrac{${shift(a)}}{${shift(b)}} = 0$ a pour solution $x = ${a}$.`, false, `$${a}$ est une valeur interdite (le dénominateur s'annule) : aucune solution.`);
    return numeric(`Résous $\\dfrac{${shift(a)}}{${shift(b)}} = 0$. $x = \\;?$`, a, `Un quotient est nul quand son numérateur est nul et son dénominateur non nul : $x = ${a}$ (valeur interdite : $${b}$).`);
  },
  (r) => {
    const k = int(r, -4, 12);
    // Racine écrite simplement : √4 = 2, √1 = 1.
    const rt = (n: number) => (Number.isInteger(Math.sqrt(n)) ? `${Math.sqrt(n)}` : `\\sqrt{${n}}`);
    if (k < 0) return mcq(r, `Solutions de $x^2 = ${k}$ ?`, "aucune solution réelle", [`$\\{-${rt(-k)}\\,;\\,${rt(-k)}\\}$`, `$\\{${tex(k / 2)}\\}$`, `$\\{0\\}$`], "Un carré est toujours positif ou nul : $x^2 = " + k + "$ n'a pas de solution réelle.");
    const s = Math.sqrt(k);
    const ans = Number.isInteger(s) ? (s === 0 ? "$\\{0\\}$" : set(-s, s)) : `$\\{-\\sqrt{${k}}\\,;\\,\\sqrt{${k}}\\}$`;
    const wrong = Number.isInteger(s) ? (s === 0 ? "$\\{0\\,;\\,1\\}$" : `$\\{${s}\\}$`) : `$\\{\\sqrt{${k}}\\}$`;
    return mcq(r, `Solutions de $x^2 = ${k}$ ?`, ans, [wrong, `$\\{${k / 2}\\}$`.replace(".", "{,}"), "aucune solution réelle", k === 0 ? "$\\{-1\\,;\\,1\\}$" : set(-k, k)], `Deux nombres opposés ont le même carré${k === 0 ? " ; ici seul 0 convient" : ""}.`);
  },
  (r) => {
    const x = int(r, -10, 10), a = nonZero(r, 6), c = nonZero(r, 6);
    if (a === c) return tf(`L'équation $${poly([a, 3])} = ${poly([c, 5])}$ a une solution.`, false, `Après simplification : $3 = 5$, impossible.`);
    const b = int(r, -12, 12), d = (a - c) * x + b;
    return numeric(`Résous $${poly([a, b])} = ${poly([c, d])}$. $x = \\;?$`, x, `On regroupe les $x$ à gauche : $${poly([a - c, 0])} = ${d - b}$, donc $x = ${x}$.`);
  },
  (r) => {
    const a = int(r, 2, 9), sign = pick(r, ["-", "+"]);
    return oneOf(r, [
      () => mcq(r, `Développe $(2x ${sign} ${a})^2$.`, `$${poly([4, sign === "-" ? -4 * a : 4 * a, a * a])}$`, [`$${poly([4, 0, a * a])}$`, `$${poly([2, sign === "-" ? -2 * a : 2 * a, a * a])}$`, `$${poly([4, sign === "-" ? -2 * a : 2 * a, a * a])}$`],
        `$(2x)^2 ${sign} 2 \\times 2x \\times ${a} + ${a}^2$.`),
      () => mcq(r, `Factorise $${poly([1, -2 * a, a * a])}$.`, `$(x - ${a})^2$`, [`$(x + ${a})^2$`, `$(x - ${a})(x + ${a})$`, `$(x - ${a * a})^2$`], `On reconnaît $a^2 - 2ab + b^2 = (a - b)^2$.`),
    ]);
  },
  (r) => {
    const x = int(r, 4, 30), k = int(r, 2, 4), c = int(r, 2, Math.min(15, (k - 1) * x - 1));
    // k x - c = x + d  →  d = (k - 1) x - c > 0
    const d = (k - 1) * x - c;
    return numeric(`Si on multiplie un nombre par $${k}$ et qu'on retire $${c}$, on obtient ce nombre augmenté de $${d}$. Quel est ce nombre ?`, x, `On pose $${k}x - ${c} = x + ${d}$, d'où $${k === 2 ? "" : k - 1}x = ${d + c}$ et $x = ${x}$.`);
  },
  (r) => {
    const a = int(r, -6, 2), b = a + int(r, 1, 6);
    const ge = r() < 0.5;
    const between = `$[${a}\\,;\\,${b}]$`, outside = `$]-\\infty\\,;\\,${a}]\\,\\cup\\,[${b}\\,;\\,+\\infty[$`;
    return mcq(r, `Solutions de $${fac(a)}${fac(b)} ${ge ? "\\geq" : "\\leq"} 0$ ?`, ge ? outside : between, [ge ? between : outside, `$[${-b}\\,;\\,${-a}]$`, `$[${a}\\,;\\,+\\infty[$`, ge ? `$]-\\infty\\,;\\,${a}[\\,\\cup\\,]${b}\\,;\\,+\\infty[$` : `$]${a}\\,;\\,${b}[$`],
      `Tableau de signes : le produit est négatif entre $${a}$ et $${b}$, positif à l'extérieur.`);
  },
  (r) => {
    const a = int(r, 2, 9), b = int(r, 1, 9);
    return mcq(r, `Réduis $${a}(x + ${b}) - (x - ${b})$.`, `$${poly([a - 1, a * b + b])}$`, [`$${poly([a - 1, a * b - b])}$`, `$${poly([a + 1, a * b + b])}$`, `$${poly([a - 1, b - a * b])}$`],
      `$${a}x + ${a * b} - x + ${b}$ : attention, le signe « − » devant la parenthèse change tous les signes.`);
  },
  cards([
    ["Pour résoudre $A(x) \\times B(x) = 0$, on…", "résout $A(x) = 0$ puis $B(x) = 0$", ["développe le produit", "divise par $A(x)$", "met tout au carré"], "Règle du produit nul."],
    ["Quand on multiplie une inégalité par un nombre négatif…", "on change son sens", ["elle reste identique", "elle devient une égalité", "on change les signes des deux membres seulement"], "$-2 < 3$ devient $4 > -6$ après multiplication par $-2$."],
    ["Factoriser $9x^2 - 25$ utilise…", "$a^2 - b^2 = (a - b)(a + b)$", ["$(a + b)^2$", "$(a - b)^2$", "la double distributivité"], "$9x^2 - 25 = (3x - 5)(3x + 5)$."],
    ["Une valeur interdite d'un quotient est une valeur qui…", "annule le dénominateur", ["annule le numérateur", "rend le quotient négatif", "rend le quotient égal à 1"], "On ne divise jamais par 0."],
  ]),
  claims([
    ["$(a + b)^2 = a^2 + b^2$.", false, "Il manque le double produit $2ab$."],
    ["Diviser les deux membres d'une équation par $x$ peut faire perdre une solution.", true, "Si $x = 0$ était solution, on la perd."],
    ["L'inéquation $x^2 < 0$ n'a aucune solution réelle.", true, "Un carré est toujours positif ou nul."],
    ["$-(x - 3) = -x - 3$.", false, "$-(x - 3) = -x + 3$."],
  ]),
];

// ───────────── Fonctions : lectures, tableaux, parité ─────────────

const fonctions: Generator[] = [
  (r) => {
    const xs = sorted(sample(r, [-3, -2, -1, 0, 1, 2, 3, 4, 5], 5));
    const ys = xs.map(() => int(r, -9, 9));
    const table = `| $x$ | ${xs.join(" | ")} |\n|---|${xs.map(() => "---").join("|")}|\n| $f(x)$ | ${ys.join(" | ")} |`;
    const i = int(r, 0, 4);
    return oneOf(r, [
      () => numeric(`Tableau de valeurs de $f$ :\n\n${table}\n\nImage de $${xs[i]}$ par $f$ ?`, ys[i], `On lit la colonne $x = ${xs[i]}$ : $f(${xs[i]}) = ${ys[i]}$.`),
      () => {
        const y = ys[i], ants = xs.filter((_, j) => ys[j] === y);
        return ants.length === 1
          ? numeric(`Tableau de valeurs de $f$ :\n\n${table}\n\nAntécédent de $${y}$ dans ce tableau ?`, xs[i], `On cherche $${y}$ sur la ligne des images : il est sous $x = ${xs[i]}$.`)
          : numeric(`Tableau de valeurs de $f$ :\n\n${table}\n\nCombien d'antécédents a $${y}$ dans ce tableau ?`, ants.length, `$${y}$ apparaît $${ants.length}$ fois sur la ligne des images.`);
      },
    ]);
  },
  (r) => {
    const a = int(r, -6, -2), b = int(r, -1, 2), c = int(r, 4, 8);
    const fa = int(r, -5, 2), fb = fa + int(r, 2, 8), fc = fb - int(r, 1, 9);
    const table = `| $x$ | $${a}$ | | $${b}$ | | $${c}$ |\n|---|---|---|---|---|---|\n| $f$ | $${fa}$ | ↗ | $${fb}$ | ↘ | $${fc}$ |`;
    return oneOf(r, [
      () => numeric(`Tableau de variations de $f$ sur $[${a}\\,;\\,${c}]$ :\n\n${table}\n\nMaximum de $f$ sur cet intervalle ?`, fb, `$f$ monte jusqu'en $x = ${b}$ puis descend : le maximum est $f(${b}) = ${fb}$.`),
      () => numeric(`Tableau de variations de $f$ sur $[${a}\\,;\\,${c}]$ :\n\n${table}\n\nMinimum de $f$ sur cet intervalle ?`, Math.min(fa, fc), `Le minimum est la plus petite des valeurs aux bornes : $\\min(${fa}\\,;\\,${fc}) = ${Math.min(fa, fc)}$.`),
      () => mcq(r, `Tableau de variations de $f$ :\n\n${table}\n\nComparer $f(${b + 1})$ et $f(${c})$.`, `$f(${b + 1}) > f(${c})$`, [`$f(${b + 1}) < f(${c})$`, `$f(${b + 1}) = f(${c})$`, "on ne peut pas savoir"],
        `$f$ est décroissante sur $[${b}\\,;\\,${c}]$ et $${b + 1} < ${c}$, donc $f(${b + 1}) > f(${c})$.`),
    ]);
  },
  (r) => {
    const a = nonZero(r, 5), b = int(r, 1, 9);
    return oneOf(r, [
      () => tf(`La fonction $f(x) = ${poly([a, 0, b])}$ est paire.`, true, `$f(-x) = ${a === 1 ? "" : a === -1 ? "-" : a}(-x)^2 + ${b} = f(x)$ : sa courbe est symétrique par rapport à l'axe des ordonnées.`),
      () => tf(`La fonction $f(x) = ${poly([a, 0, 0, 0])}$ est impaire.`, true, `$f(-x) = ${a}(-x)^3 = -f(x)$ : courbe symétrique par rapport à l'origine.`),
      () => tf(`La fonction $f(x) = ${poly([1, b])}$ est paire.`, false, `$f(-1) = ${b - 1}$ mais $f(1) = ${b + 1}$ : elle n'est ni paire ni impaire.`),
      () => tf(`La fonction $f(x) = ${poly([a, b, 0])}$ est paire.`, false, `$f(1) = ${a + b}$ mais $f(-1) = ${a - b}$ : $f(-1) \\neq f(1)$ (le terme en $x$ change de signe), elle n'est pas paire.`),
      () => tf(`La fonction $f(x) = ${poly([a, 0, 0, b])}$ est impaire.`, false, `$f(0) = ${b} \\neq 0$, or une fonction impaire définie en 0 vérifie $f(0) = -f(0)$, donc $f(0) = 0$ : elle n'est pas impaire.`),
    ]);
  },
  (r) => {
    const a = int(r, -6, 6), b = a + int(r, 1, 7);
    const pos = r() < 0.5;
    return mcq(r, `$f(x) = ${fac(a)}${fac(b)}$. Sur quel intervalle $f(x) ${pos ? ">" : "<"} 0$ (entre les deux racines ou à l'extérieur) ?`, pos ? "à l'extérieur des racines" : `sur $]${a}\\,;\\,${b}[$`, [pos ? `sur $]${a}\\,;\\,${b}[$` : "à l'extérieur des racines", `sur $]${-b}\\,;\\,${-a}[$`, "nulle part", "partout"],
      `Les deux facteurs ont le même signe à l'extérieur de $[${a}\\,;\\,${b}]$ (produit positif) et des signes contraires entre $${a}$ et $${b}$.`);
  },
  (r) => {
    const k = int(r, -6, 6), a = int(r, -3, 3);
    return numeric(`$f(x) = ${poly([1, 0, k])}$ et $g(x) = ${poly([2 * a, k - a * a])}$. Abscisse du point commun aux deux courbes ?`, a, `$${poly([1, 0, k])} = ${poly([2 * a, k - a * a])}$ donne $${poly([1, -2 * a, a * a])} = 0$, soit $${a === 0 ? "x^2" : `(${shift(a)})^2`} = 0$ : $x = ${a}$.`);
  },
  cards([
    ["Sur une courbe, l'image de $x$ se lit sur…", "l'axe des ordonnées", ["l'axe des abscisses", "l'origine", "la tangente"], "On part de $x$ sur l'axe horizontal, on monte jusqu'à la courbe, on lit la hauteur."],
    ["Résoudre graphiquement $f(x) > g(x)$, c'est chercher les $x$ où…", "la courbe de $f$ est au-dessus de celle de $g$", ["les courbes se coupent", "$f$ est croissante", "$f(x)$ est positif"], "On lit les abscisses."],
    ["Une fonction paire a une courbe symétrique par rapport…", "à l'axe des ordonnées", ["à l'origine", "à l'axe des abscisses", "à la droite $y = x$"], "$f(-x) = f(x)$."],
    ["Dans un tableau de variations, les flèches indiquent…", "si la fonction croît ou décroît", ["le signe de la fonction", "les antécédents", "la valeur moyenne"], "Le signe se lit dans un tableau de signes, pas de variations."],
  ]),
];

// ───────────── Fonctions affines ─────────────

const affines: Generator[] = [
  (r) => {
    const m = nonZero(r, 5), p = int(r, -8, 8), x1 = int(r, -4, 2), x2 = x1 + int(r, 1, 4);
    const ans = `$f(x) = ${poly([m, p])}$`;
    return mcq(r, `$f$ est affine, $f(${x1}) = ${m * x1 + p}$ et $f(${x2}) = ${m * x2 + p}$. Expression de $f$ ?`, ans, [`$f(x) = ${poly([-m, p])}$`, `$f(x) = ${poly([m, -p])}$`, `$f(x) = ${poly([p || 1, m])}$`, `$f(x) = ${poly([m, p + m])}$`].filter((w) => w !== ans),
      `$m = \\dfrac{${m * x2 + p} - ${par(m * x1 + p)}}{${x2} - ${par(x1)}} = ${m}$, puis $p = f(${x1}) - ${par(m)} \\times ${par(x1)} = ${p}$.`, () => `$f(x) = ${poly([nonZero(r, 5), int(r, -8, 8)])}$`);
  },
  (r) => {
    const a = nonZero(r, 4), b = int(r, -6, 6), c = nonZero(r, 4), x = int(r, -5, 5);
    if (a === c) return tf(`Les droites $y = ${poly([a, b])}$ et $y = ${poly([c, b + 1])}$ se coupent.`, false, `Même coefficient directeur : elles sont parallèles.`);
    const d = (a - c) * x + b;
    return numeric(`Abscisse du point d'intersection des droites $y = ${poly([a, b])}$ et $y = ${poly([c, d])}$ ?`, x, `$${poly([a, b])} = ${poly([c, d])} \\iff ${poly([a - c, 0])} = ${d - b} \\iff x = ${x}$.`);
  },
  (r) => {
    const fixe = int(r, 2, 6) * 5, prix = int(r, 2, 5), autre = prix + int(r, 2, 4);
    // Formule A : fixe + prix·n ; formule B : autre·n. A moins chère dès que fixe + prix n < autre n  ⇔ n > fixe / (autre − prix)
    const seuil = Math.floor(fixe / (autre - prix)) + 1;
    return numeric(`Salle de sport : formule A à $${fixe}$ € par mois + $${prix}$ € la séance, formule B à $${autre}$ € la séance. À partir de combien de séances par mois la formule A est-elle strictement moins chère ?`, seuil,
      `A : $${fixe} + ${prix}n$ ; B : $${autre}n$. A < B $\\iff ${fixe} < ${autre - prix}n \\iff n > ${tex(fixe / (autre - prix))}$, soit dès $${seuil}$ séances.`);
  },
  (r) => {
    const num = nonZero(r, 7), den = int(r, 2, 5), p = int(r, -5, 5);
    const g = gcd(num, den);
    if (g !== 1) return tf(`$f(x) = ${poly([num / g, p])}$ est ${num > 0 ? "croissante" : "décroissante"} sur $\\mathbb{R}$.`, true, `Coefficient directeur ${num > 0 ? "positif" : "négatif"}.`);
    return tf(`$f(x) = ${p === 0 ? (num < 0 ? "-" : "") : `${p} ${num < 0 ? "-" : "+"} `}\\dfrac{${Math.abs(num)}}{${den}}x$ est croissante sur $\\mathbb{R}$.`, num > 0, `Le coefficient de $x$ est $${fracTex(num, den)}$, ${num > 0 ? "positif : croissante" : "négatif : décroissante"}.`);
  },
  (r) => {
    const m = nonZero(r, 4), p = int(r, -5, 5);
    return oneOf(r, [
      () => numeric(`La droite d'une fonction affine passe par $(0\\,;\\,${p})$ et $(1\\,;\\,${p + m})$. Coefficient directeur ?`, m, `Quand $x$ augmente de 1, $y$ varie de $${p + m} - ${par(p)} = ${m}$.`),
      () => numeric(`La droite d'une fonction affine passe par $(0\\,;\\,${p})$ et $(2\\,;\\,${p + 2 * m})$. Coefficient directeur ?`, m, `$\\dfrac{${p + 2 * m} - ${par(p)}}{2 - 0} = ${m}$.`),
    ]);
  },
  (r) => {
    const t = pick(r, [5, 10, 20, 25, 50]), x = int(r, 1, 9) * 20;
    return numeric(`$f(x) = ${tex(1 - t / 100)}x$ modélise un prix après réduction. Prix initial si le prix réduit est $${tex(x * (1 - t / 100))}$ € ?`, x, `On résout $${tex(1 - t / 100)}x = ${tex(x * (1 - t / 100))}$ : $x = ${x}$ €. (Réduction de $${t}\\,\\%$.)`);
  },
  claims([
    ["Une fonction linéaire est une fonction affine.", true, "C'est le cas $p = 0$."],
    ["La droite d'une fonction affine coupe toujours l'axe des abscisses.", false, "Pas si elle est constante non nulle ($y = 3$)."],
    ["Si $f(x) = mx + p$, alors $f(x + 1) - f(x) = m$.", true, "Augmenter $x$ de 1 ajoute $m$."],
    ["Une situation de proportionnalité se modélise par une fonction linéaire.", true, "Exemple : prix = prix unitaire × quantité."],
  ]),
];

// ───────────── Fonctions de référence ─────────────

const reference: Generator[] = [
  (r) => {
    const a = int(r, 1, 6), b = a + int(r, 1, 5);
    return oneOf(r, [
      () => mcq(r, `Si $${a} \\leq x \\leq ${b}$, alors $x^2$ est compris entre…`, `$${a * a}$ et $${b * b}$`, [`$${2 * a}$ et $${2 * b}$`, `$${a}$ et $${b}$`, `$${b * b}$ et $${a * a + b}$`], `La fonction carré est croissante sur $[0\\,;\\,+\\infty[$ : elle conserve l'ordre.`),
      () => mcq(r, `Si $${-b} \\leq x \\leq ${-a}$, alors $x^2$ est compris entre…`, `$${a * a}$ et $${b * b}$`, [`$${-b * b}$ et $${-a * a}$`, `$${b * b}$ et $${a * a}$ (dans cet ordre)`, `$0$ et $${b * b}$`], `La fonction carré est décroissante sur $]-\\infty\\,;\\,0]$ : elle inverse l'ordre.`),
      () => mcq(r, `Si $${a} \\leq x \\leq ${b}$, alors $\\dfrac{1}{x}$ est compris entre…`, `$${fracTex(1, b)}$ et $${fracTex(1, a)}$`, [`$${fracTex(1, a)}$ et $${fracTex(1, b)}$ (dans cet ordre)`, `$${a}$ et $${b}$`, `$${-b}$ et $${-a}$`], `La fonction inverse est décroissante sur $]0\\,;\\,+\\infty[$ : $${fracTex(1, b)} \\leq \\dfrac1x \\leq ${fracTex(1, a)}$.`),
    ]);
  },
  (r) => {
    const k = int(r, 1, 9);
    return oneOf(r, [
      () => mcq(r, `Solutions de $x^2 < ${k * k}$ ?`, `$]${-k}\\,;\\,${k}[$`, [`$]-\\infty\\,;\\,${k}[$`, `$]${k}\\,;\\,+\\infty[$`, `$]-\\infty\\,;\\,${-k}[\\,\\cup\\,]${k}\\,;\\,+\\infty[$`], `Les nombres dont le carré est inférieur à $${k * k}$ sont entre $${-k}$ et $${k}$.`),
      () => mcq(r, `Solutions de $x^2 \\geq ${k * k}$ ?`, `$]-\\infty\\,;\\,${-k}]\\,\\cup\\,[${k}\\,;\\,+\\infty[$`, [`$[${k}\\,;\\,+\\infty[$`, `$[${-k}\\,;\\,${k}]$`, `$]-\\infty\\,;\\,${-k}]$`], `Il ne faut pas oublier les négatifs : $(${-k - 1})^2 \\geq ${k * k}$.`),
      () => numeric(`Résous $\\sqrt{x} = ${k}$. $x = \\;?$`, k * k, `On élève au carré : $x = ${k}^2 = ${k * k}$ (et $x \\geq 0$).`),
    ]);
  },
  (r) => {
    const a = int(r, 2, 9), b = a + int(r, 1, 4);
    return oneOf(r, [
      () => mcq(r, `Compare $\\dfrac{1}{${a}}$ et $\\dfrac{1}{${b}}$.`, `$\\dfrac{1}{${a}} > \\dfrac{1}{${b}}$`, [`$\\dfrac{1}{${a}} < \\dfrac{1}{${b}}$`, `$\\dfrac{1}{${a}} = \\dfrac{1}{${b}}$`, "on ne peut pas comparer"], `$${a} < ${b}$ et l'inverse est décroissante sur $]0\\,;\\,+\\infty[$.`),
      () => mcq(r, `Compare $\\sqrt{${a}{,}5}$ et $\\sqrt{${b}}$.`, `$\\sqrt{${a}{,}5} < \\sqrt{${b}}$`, [`$\\sqrt{${a}{,}5} > \\sqrt{${b}}$`, `$\\sqrt{${a}{,}5} = \\sqrt{${b}}$`, "on ne peut pas comparer"], `La racine carrée est croissante : elle conserve l'ordre.`),
      () => mcq(r, `Compare $(-${a})^3$ et $(-${b})^3$.`, `$(-${a})^3 > (-${b})^3$`, [`$(-${a})^3 < (-${b})^3$`, `$(-${a})^3 = (-${b})^3$`, "on ne peut pas comparer"], `La fonction cube est croissante sur $\\mathbb{R}$ et $-${a} > -${b}$.`),
    ]);
  },
  (r) => {
    const k = pick(r, [0.5, 0.25, 2, 4, 5, 10]);
    return mcq(r, `Solutions de $\\dfrac{1}{x} = ${tex(k)}$ ?`, `$x = ${tex(1 / k)}$`, [`$x = ${tex(k)}$`, `$x = ${tex(-1 / k)}$`, "aucune solution"], `$x = \\dfrac{1}{${tex(k)}} = ${tex(1 / k)}$.`);
  },
  cards([
    ["Le minimum de la fonction carré sur $\\mathbb{R}$ est…", "$0$, atteint en $0$", ["$1$, atteint en $1$", "il n'y en a pas", "$-1$"], "Un carré est toujours positif ou nul."],
    ["La courbe de la fonction inverse s'appelle…", "une hyperbole", ["une parabole", "une droite", "une sinusoïde"], "Elle a deux branches."],
    ["Pour $0 < x < 1$, on a…", "$x^2 < x < \\sqrt{x}$", ["$\\sqrt{x} < x < x^2$", "$x < x^2 < \\sqrt{x}$", "$x^2 = x$"], "Exemple $x = 0{,}25$ : $0{,}0625 < 0{,}25 < 0{,}5$."],
    ["Quelle fonction n'est pas définie en 0 ?", "la fonction inverse", ["la fonction carré", "la fonction cube", "la racine carrée"], "On ne divise pas par 0."],
  ]),
];

// ───────────── Vecteurs ─────────────

const vecteurs: Generator[] = [
  (r) => {
    const a = int(r, -5, 5), b = int(r, -5, 5), c = int(r, -5, 5), d = int(r, -5, 5), k = nonZero(r, 3, true);
    return oneOf(r, [
      () => mcq(r, `$\\vec u${pt(a, b)}$ et $\\vec v${pt(c, d)}$. Coordonnées de $\\vec u + \\vec v$ ?`, `$${pt(a + c, b + d)}$`, [`$${pt(a - c, b - d)}$`, `$${pt(a * c, b * d)}$`, `$${pt(a + d, b + c)}$`], "On additionne les abscisses entre elles et les ordonnées entre elles."),
      () => mcq(r, `$\\vec u${pt(a, b)}$. Coordonnées de $${k}\\vec u$ ?`, `$${pt(k * a, k * b)}$`, [`$${pt(k + a, k + b)}$`, `$${pt(k * a, b)}$`, `$${pt(a, k * b)}$`], `On multiplie chaque coordonnée par $${k}$.`),
      () => mcq(r, `$\\vec u${pt(a, b)}$ et $\\vec v${pt(c, d)}$. Coordonnées de $\\vec u - \\vec v$ ?`, `$${pt(a - c, b - d)}$`, [`$${pt(c - a, d - b)}$`, `$${pt(a + c, b + d)}$`, `$${pt(a - d, b - c)}$`], "On soustrait coordonnée par coordonnée."),
    ]);
  },
  (r) => {
    // A, B, C non alignés (déterminant de AB et AC non nul) : sinon le « parallélogramme » serait plat.
    const P = () => [int(r, -5, 5), int(r, -5, 5)];
    let A = P(), B = P(), C = P();
    while ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0) [A, B, C] = [P(), P(), P()];
    const D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];
    return mcq(r, `$A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$, $C${pt(C[0], C[1])}$. Coordonnées de $D$ pour que $ABCD$ soit un parallélogramme ?`, `$${pt(D[0], D[1])}$`,
      [`$${pt(B[0] + C[0] - A[0], B[1] + C[1] - A[1])}$`, `$${pt(A[0] + B[0] - C[0], A[1] + B[1] - C[1])}$`, `$${pt(D[0] + 1, D[1])}$`],
      `$\\overrightarrow{AB} = \\overrightarrow{DC}$, donc $D = A + C - B$ coordonnée par coordonnée.`);
  },
  (r) => {
    const a = nonZero(r, 4), b = nonZero(r, 5), k = pick(r, [2, 3, -1, -2, -3]);
    return numeric(`$\\vec u${pt(a, b)}$ et $\\vec v(${tex(k * a)}\\,;\\,y)$. Quelle valeur de $y$ rend ces deux vecteurs colinéaires ?`, k * b,
      `Colinéaires $\\iff ${a} \\times y - ${par(k * a)} \\times ${par(b)} = 0$, donc $y = ${k * b}$ ($\\vec v = ${k === -1 ? "-" : k}\\vec u$).`);
  },
  (r) => {
    const [x, y, n] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [-3, 4, 5], [-6, -8, 10], [0, 7, 7]] as const);
    return numeric(`Norme du vecteur $\\vec u${pt(x, y)}$ (repère orthonormé) ?`, n, `$\\|\\vec u\\| = \\sqrt{${par(x)}^2 + ${par(y)}^2} = \\sqrt{${x * x + y * y}} = ${n}$.`);
  },
  (r) => {
    const A = [int(r, -4, 4), int(r, -4, 4)], u = [nonZero(r, 3), nonZero(r, 3)], k = pick(r, [2, 3, -1, -2]);
    const aligned = r() < 0.5;
    const C = [A[0] + k * u[0], A[1] + k * u[1] + (aligned ? 0 : nonZero(r, 2))];
    const B = [A[0] + u[0], A[1] + u[1]];
    return tf(`Les points $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ et $C${pt(C[0], C[1])}$ sont alignés.`, aligned,
      `$\\overrightarrow{AB}${pt(u[0], u[1])}$ et $\\overrightarrow{AC}${pt(C[0] - A[0], C[1] - A[1])}$ : $${u[0]} \\times ${par(C[1] - A[1])} - ${par(C[0] - A[0])} \\times ${par(u[1])} = ${u[0] * (C[1] - A[1]) - (C[0] - A[0]) * u[1]}$${aligned ? ", colinéaires : alignés." : " ≠ 0 : non alignés."}`);
  },
  (r) =>
    oneOf(r, [
      () => mcq(r, "$\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CA} = \\;?$", "$\\vec 0$", ["$2\\overrightarrow{AC}$", "$\\overrightarrow{AB}$", "$\\overrightarrow{CA}$"], "Chasles : $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$, puis $\\overrightarrow{AC} + \\overrightarrow{CA} = \\vec 0$."),
      () => mcq(r, "$\\overrightarrow{AB} - \\overrightarrow{CB} = \\;?$", "$\\overrightarrow{AC}$", ["$\\overrightarrow{CA}$", "$\\overrightarrow{BC}$", "$\\vec 0$"], "$-\\overrightarrow{CB} = \\overrightarrow{BC}$, puis Chasles."),
      () => mcq(r, "$I$ est le milieu de $[AB]$. $\\overrightarrow{IA} + \\overrightarrow{IB} = \\;?$", "$\\vec 0$", ["$\\overrightarrow{AB}$", "$2\\overrightarrow{IA}$", "$\\overrightarrow{BA}$"], "$\\overrightarrow{IA}$ et $\\overrightarrow{IB}$ sont opposés."),
      () => mcq(r, "$\\overrightarrow{AM} = \\dfrac12\\overrightarrow{AB}$ signifie que $M$ est…", "le milieu de $[AB]$", ["le symétrique de $A$ par rapport à $B$", "un point quelconque de $(AB)$", "le centre de gravité"], "$M$ est à mi-chemin de $A$ vers $B$."),
    ]),
  claims([
    ["Deux vecteurs égaux ont même direction, même sens et même norme.", true, "C'est la définition."],
    ["Si $\\overrightarrow{AB} = \\overrightarrow{CD}$, alors $ABCD$ est un parallélogramme.", false, "C'est $ABDC$ (attention à l'ordre des lettres)."],
    ["Le vecteur nul est colinéaire à tout vecteur.", true, "$\\vec 0 = 0 \\times \\vec u$."],
    ["$\\|\\vec u + \\vec v\\| = \\|\\vec u\\| + \\|\\vec v\\|$ pour tous vecteurs.", false, "Seulement s'ils sont colinéaires et de même sens (inégalité triangulaire)."],
  ]),
];

// ───────────── Droites ─────────────

const droites: Generator[] = [
  (r) => {
    const m = nonZero(r, 4), p = int(r, -6, 6), x1 = int(r, -4, 1), x2 = x1 + int(r, 1, 3);
    const ans = `$y = ${poly([m, p])}$`;
    return mcq(r, `Équation réduite de la droite passant par $A${pt(x1, m * x1 + p)}$ et $B${pt(x2, m * x2 + p)}$ ?`, ans, [`$y = ${poly([-m, p])}$`, `$y = ${poly([m, p + 1])}$`, `$y = ${poly([m, -p])}$`].filter((w) => w !== ans),
      `$m = \\dfrac{${m * x2 + p} - ${par(m * x1 + p)}}{${x2} - ${par(x1)}} = ${m}$ et $p = ${m * x1 + p} - ${par(m)} \\times ${par(x1)} = ${p}$.`, () => `$y = ${poly([nonZero(r, 5), int(r, -8, 8)])}$`);
  },
  (r) => {
    const a = nonZero(r, 6), b = nonZero(r, 6), c = int(r, -9, 9);
    const g = gcd(a, b);
    return oneOf(r, [
      () => mcq(r, `Un vecteur directeur de la droite $${lin(a, b)}${c === 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}`} = 0$ ?`, `$${pt(-b, a)}$`, [[a, b], [b, a], [a, -b]].filter(([x, y]) => x * a + y * b !== 0).map(([x, y]) => `$${pt(x, y)}$`), "Pour $ax + by + c = 0$, $\\vec u(-b\\,;\\,a)$ est directeur (tout vecteur colinéaire aussi)."),
      () => mcq(r, `Coefficient directeur de la droite $${lin(a, b)}${c === 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}`} = 0$ ?`, `$${fracTex(-a / g, b / g)}$`, [`$${fracTex(a / g, b / g)}$`, `$${fracTex(b / g, a / g)}$`, `$${a}$`].filter((w) => w !== `$${fracTex(-a / g, b / g)}$`), `On isole $y$ : $y = ${fracTex(-a, b) === "1" ? "" : fracTex(-a, b) === "-1" ? "-" : fracTex(-a, b)}x + \\ldots$`, () => frac(nonZero(r, 9), int(r, 1, 6))),
    ]);
  },
  (r) => {
    const m = nonZero(r, 4), xA = int(r, -4, 4), yA = int(r, -6, 6);
    const p = yA - m * xA;
    return mcq(r, `Équation de la parallèle à $y = ${poly([m, int(r, -5, 5) + 10])}$ passant par $A${pt(xA, yA)}$ ?`, `$y = ${poly([m, p])}$`, [`$y = ${poly([-m, yA + m * xA])}$`, `$y = ${poly([m, yA])}$`, `$y = ${poly([m, p + 2])}$`].filter((w) => w !== `$y = ${poly([m, p])}$`),
      `Même coefficient directeur $${m}$, puis $p = ${yA} - ${par(m)} \\times ${par(xA)} = ${p}$.`, () => `$y = ${poly([m, int(r, -9, 9)])}$`);
  },
  (r) => {
    const x = int(r, -5, 5), y = int(r, -5, 5), a = nonZero(r, 3), b = nonZero(r, 3), c = nonZero(r, 3), d = nonZero(r, 3);
    if (a * d - b * c === 0) return tf(`Le système $\\begin{cases} ${lin(a, b)} = 1 \\\\ ${lin(c, d)} = 5 \\end{cases}$ a une unique solution.`, false, "Les deux droites sont parallèles (coefficients proportionnels).");
    const e = a * x + b * y, f = c * x + d * y;
    return oneOf(r, [
      () => numeric(`Résous $\\begin{cases} ${lin(a, b)} = ${e} \\\\ ${lin(c, d)} = ${f} \\end{cases}$. Valeur de $x$ ?`, x, `Par combinaison ou substitution, on trouve $x = ${x}$ et $y = ${y}$.`),
      () => numeric(`Résous $\\begin{cases} ${lin(a, b)} = ${e} \\\\ ${lin(c, d)} = ${f} \\end{cases}$. Valeur de $y$ ?`, y, `Par combinaison ou substitution, on trouve $x = ${x}$ et $y = ${y}$.`),
    ]);
  },
  (r) => {
    const adult = int(r, 8, 15), child = int(r, 3, adult - 2), na = int(r, 2, 5);
    // na ≠ nc, sinon la 1re équation est un multiple de la 2e et le prix adulte est indéterminé.
    const nc = pick(r, [1, 2, 3, 4, 5, 6].filter((n) => n !== na));
    return numeric(`Au cinéma, ${na} adulte${na > 1 ? "s" : ""} et ${nc} enfant${nc > 1 ? "s" : ""} paient $${na * adult + nc * child}$ € ; 1 adulte et 1 enfant paient $${adult + child}$ €. Prix d'une place adulte (en €) ?`, adult,
      `On pose $${na === 1 ? "" : na}a + ${nc === 1 ? "" : nc}e = ${na * adult + nc * child}$ et $a + e = ${adult + child}$. En remplaçant $e = ${adult + child} - a$ : $${na - nc === 1 ? "" : na - nc === -1 ? "-" : na - nc}a = ${na * adult + nc * child - nc * (adult + child)}$, donc $a = ${adult}$ €.`);
  },
  cards([
    ["Une droite verticale a une équation de la forme…", "$x = c$", ["$y = c$", "$y = mx$", "$y = mx + p$"], "Elle n'a pas de coefficient directeur."],
    ["Deux droites d'équations $y = mx + p$ et $y = m'x + p'$ sont sécantes si…", "$m \\neq m'$", ["$p \\neq p'$", "$m = m'$", "$m \\times m' = -1$"], "Pentes différentes : elles finissent par se croiser."],
    ["Résoudre un système de deux équations linéaires à deux inconnues revient à…", "chercher le point d'intersection de deux droites", ["calculer une distance", "trouver un milieu", "tracer une parabole"], "Une solution unique si les droites sont sécantes."],
  ]),
];

// ───────────── Statistiques ─────────────

const stats: Generator[] = [
  (r) => {
    const n = pick(r, [8, 12, 16, 20]);
    const v = sorted(Array.from({ length: n }, () => int(r, 2, 20)));
    const q1 = v[Math.ceil(n / 4) - 1], q3 = v[Math.ceil((3 * n) / 4) - 1];
    return oneOf(r, [
      () => numeric(`Série ordonnée de ${n} valeurs : $${v.join("\\,;\\,")}$. Premier quartile $Q_1$ ?`, q1, `$\\frac{${n}}{4} = ${tex(n / 4)}$ : $Q_1$ est la ${Math.ceil(n / 4)}e valeur, soit $${q1}$.`),
      () => numeric(`Série ordonnée de ${n} valeurs : $${v.join("\\,;\\,")}$. Troisième quartile $Q_3$ ?`, q3, `$\\frac{3 \\times ${n}}{4} = ${tex((3 * n) / 4)}$ : $Q_3$ est la ${Math.ceil((3 * n) / 4)}e valeur, soit $${q3}$.`),
      () => numeric(`Série ordonnée de ${n} valeurs : $${v.join("\\,;\\,")}$. Écart interquartile $Q_3 - Q_1$ ?`, q3 - q1, `$Q_1 = ${q1}$ (${Math.ceil(n / 4)}e valeur) et $Q_3 = ${q3}$ (${Math.ceil((3 * n) / 4)}e valeur).`),
    ]);
  },
  (r) => {
    const k = int(r, 3, 6), target = int(r, 10, 15), v = Array.from({ length: k }, () => int(r, 6, 18));
    const need = target * (k + 1) - v.reduce((s, x) => s + x, 0);
    if (need < 2 || need > 20) return numeric(`Moyenne de $${v.join("\\,;\\,")}$ ?`, v.reduce((s, x) => s + x, 0) / k, `Somme $${v.reduce((s, x) => s + x, 0)}$ divisée par $${k}$.`, undefined, 0.01);
    return numeric(`Notes : $${v.join("\\,;\\,")}$. Quelle note au prochain devoir pour obtenir exactement $${target}$ de moyenne (même coefficient) ?`, need,
      `Il faut une somme de $${target} \\times ${k + 1} = ${target * (k + 1)}$ ; on a déjà $${v.reduce((s, x) => s + x, 0)}$, il manque $${need}$.`);
  },
  (r) => {
    const c = int(r, 1, 5), m = int(r, 8, 14);
    return oneOf(r, [
      () => numeric(`La moyenne d'une série est $${m}$. On ajoute $${c}$ à chaque valeur. Nouvelle moyenne ?`, m + c, "La moyenne augmente de la même quantité."),
      () => numeric(`La moyenne d'une série est $${m}$. On multiplie chaque valeur par $2$. Nouvelle moyenne ?`, 2 * m, "La moyenne est multipliée par le même nombre."),
      () => tf(`Si on ajoute $${c}$ à chaque valeur d'une série, son écart-type augmente de $${c}$.`, false, "L'écart-type mesure la dispersion : décaler toutes les valeurs ne la change pas."),
    ]);
  },
  (r) => {
    const total = pick(r, [20, 25, 40, 50, 200, 400]), part = int(r, 2, total / 2);
    return numeric(`Sur $${total}$ élèves, $${part}$ viennent à vélo. Fréquence en pourcentage ?`, (part / total) * 100, `$\\dfrac{${part}}{${total}} = ${tex(part / total)}$, soit $${tex((part / total) * 100)}\\,\\%$.`, "%", 0.1);
  },
  (r) => {
    const v = Array.from({ length: 6 }, () => int(r, 5, 15)), out = int(r, 60, 120);
    const all = sorted([...v, out]);
    const sum = all.reduce((s, x) => s + x, 0), mean = sum / 7, fix = Math.max(...v) + int(r, 1, 3), mean2 = (sum - out + fix) / 7;
    // Moyenne et médiane d'une série connue (salaires : valeurs très élevées ; notes : valeurs très basses).
    const high = r() < 0.5, med = high ? 100 * int(r, 18, 24) : int(r, 11, 14), avg = high ? med + 100 * int(r, 6, 15) : med - int(r, 2, 4) + (r() < 0.5 ? 0.5 : 0);
    const reasons = ["quelques valeurs très élevées tirent la moyenne vers le haut", "quelques valeurs très faibles tirent la moyenne vers le bas"];
    return oneOf(r, [
      () => mcq(r, `Série : $${all.join("\\,;\\,")}$. Quel indicateur résume le mieux une valeur « typique » ?`, "la médiane", ["la moyenne", "l'étendue", "le maximum"],
        `La valeur extrême $${out}$ tire la moyenne vers le haut ($\\overline{x} ${Number.isInteger(mean * 10) ? "=" : "\\approx"} ${tex(mean, 1)}$) alors que la médiane ($${all[3]}$) n'est pas affectée.`),
      () => mcq(r, `Série : $${all.join("\\,;\\,")}$. On s'aperçoit que $${out}$ est une erreur de saisie : la vraie valeur est $${fix}$. Lequel de ces indicateurs change ?`, "la moyenne", ["la médiane", "le premier quartile $Q_1$", "le troisième quartile $Q_3$"],
        `$${fix}$ reste la plus grande valeur : les rangs ne changent pas, donc ni la médiane ($${all[3]}$) ni les quartiles ne bougent. La moyenne, elle, utilise toutes les valeurs : elle passe de $${tex(mean, 2)}$ à $${tex(mean2, 2)}$ environ.`, undefined, 2),
      () => mcq(r, high ? `Dans une entreprise, le salaire mensuel moyen est de $${tex(avg)}$ € et le salaire médian de $${tex(med)}$ €. Que peut-on en déduire ?` : `À un contrôle, la moyenne de la classe est $${tex(avg)}$ et la médiane $${tex(med)}$. Que peut-on en déduire ?`,
        reasons[high ? 0 : 1], [reasons[high ? 1 : 0], `plus de la moitié des valeurs sont ${high ? "supérieures" : "inférieures"} à la moyenne`, "la série est symétrique autour de sa moyenne"],
        `La médiane partage la série en deux moitiés : la moitié des valeurs sont ${high ? "inférieures" : "supérieures"} ou égales à $${tex(med)}$. Une moyenne ${high ? "bien plus grande" : "plus petite"} que la médiane vient donc de quelques valeurs ${high ? "très élevées" : "très faibles"}, auxquelles la moyenne est sensible et pas la médiane.`, undefined, 2),
    ]);
  },
  cards([
    ["L'écart-type mesure…", "la dispersion des valeurs autour de la moyenne", ["la valeur centrale", "la valeur la plus fréquente", "le nombre de valeurs"], "Plus il est grand, plus les valeurs sont éparpillées."],
    ["Pour calculer la médiane, il faut d'abord…", "ranger les valeurs dans l'ordre", ["calculer la moyenne", "supprimer les extrêmes", "calculer les fréquences"], "Elle partage la série ordonnée en deux moitiés."],
    ["La fréquence d'une valeur est…", "son effectif divisé par l'effectif total", ["son effectif", "la valeur divisée par le total", "la valeur la plus grande"], "Elle est comprise entre 0 et 1."],
    ["50 % des valeurs sont comprises entre…", "$Q_1$ et $Q_3$", ["le minimum et la médiane", "la moyenne et le maximum", "$Q_1$ et la médiane"], "L'intervalle interquartile contient la moitié centrale des données."],
  ]),
];

// ───────────── Probabilités ─────────────

const probas: Generator[] = [
  (r) => {
    const sums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const s = pick(r, sums);
    const ways = 6 - Math.abs(7 - s);
    return mcq(r, `On lance deux dés équilibrés et on additionne les résultats. Probabilité d'obtenir $${s}$ ?`, frac(ways, 36), [frac(1, 11), frac(ways + 1, 36), frac(1, 12), frac(ways, 12)].filter((w) => w !== frac(ways, 36)),
      `36 issues équiprobables (tableau 6 × 6) dont $${ways}$ donnent une somme de $${s}$.`);
  },
  (r) => {
    const items: [string, number, number, string][] = [
      ["un cœur", 8, 32, "8 cœurs sur 32 cartes"], ["un roi", 4, 32, "4 rois"], ["une figure (valet, dame ou roi)", 12, 32, "3 figures par couleur × 4 couleurs"],
      ["un as rouge", 2, 32, "as de cœur et as de carreau"], ["une carte rouge", 16, 32, "cœurs et carreaux"], ["le roi de pique", 1, 32, "une seule carte"],
    ];
    const [ev, k, n, e] = pick(r, items);
    return mcq(r, `On tire une carte au hasard dans un jeu de 32 cartes. Probabilité de tirer ${ev} ?`, frac(k, n), [frac(k + 1, n), frac(1, k + 1), frac(k, 52)].filter((w) => w !== frac(k, n)), `${e} : $\\dfrac{${k}}{${n}}$.`);
  },
  (r) => {
    const red = int(r, 2, 6), blue = int(r, 2, 6), n = red + blue;
    return oneOf(r, [
      () => mcq(r, `Une urne contient ${red} boules rouges et ${blue} bleues. On tire successivement deux boules avec remise. Probabilité d'obtenir deux rouges ?`, frac(red * red, n * n), [frac(red * (red - 1), n * (n - 1)), frac(red * blue, n * n), frac(red, n)].filter((w) => w !== frac(red * red, n * n)),
        `Avec remise, les tirages sont identiques : $\\dfrac{${red}}{${n}} \\times \\dfrac{${red}}{${n}}$.`, () => frac(int(r, 1, n * n - 1), n * n)),
      () => mcq(r, `Une urne contient ${red} boules rouges et ${blue} bleues. On tire successivement deux boules sans remise. Probabilité d'obtenir deux rouges ?`, frac(red * (red - 1), n * (n - 1)), [frac(red * red, n * n), frac(red - 1, n - 1), frac(red, n)].filter((w) => w !== frac(red * (red - 1), n * (n - 1))),
        `Sans remise, il reste une boule de moins : $\\dfrac{${red}}{${n}} \\times \\dfrac{${red - 1}}{${n - 1}}$.`, () => frac(int(r, 1, n * (n - 1) - 1), n * (n - 1))),
    ]);
  },
  (r) => {
    const a = int(r, 10, 40), b = int(r, 10, 40), ab = int(r, 2, Math.min(a, b) - 2), total = 100;
    const table = `| | Externe | Demi-pensionnaire | Total |\n|---|---|---|---|\n| Fille | ${ab} | ${a - ab} | ${a} |\n| Garçon | ${b - ab} | ${total - a - b + ab} | ${total - a} |\n| Total | ${b} | ${total - b} | ${total} |`;
    // Variante à cases manquantes : il faut d'abord compléter le tableau avec les totaux.
    const holes = `| | Externe | Demi-pensionnaire | Total |\n|---|---|---|---|\n| Fille | ? | ${a - ab} | ${a} |\n| Garçon | ${b - ab} | ? | ${total - a} |\n| Total | ${b} | ${total - b} | ${total} |`;
    return oneOf(r, [
      () => numeric(`${holes}\n\nOn choisit un élève au hasard. Probabilité (en %) que ce soit une fille externe ?`, ab, `On complète : filles externes $= ${b} - ${b - ab} = ${ab}$ (ou $${a} - ${a - ab}$), soit $\\dfrac{${ab}}{100} = ${ab}\\,\\%$.`, "%"),
      () => numeric(`${holes}\n\nOn choisit un élève au hasard. Probabilité (en %) que ce soit un garçon demi-pensionnaire ?`, total - a - b + ab, `On complète : garçons demi-pensionnaires $= ${total - a} - ${b - ab} = ${total - a - b + ab}$, soit $${total - a - b + ab}\\,\\%$.`, "%"),
      () => numeric(`${table}\n\nOn choisit un élève au hasard. Probabilité (en %) que ce soit une fille ou un externe ?`, a + b - ab, `$P(F \\cup E) = ${a} + ${b} - ${ab} = ${a + b - ab}\\,\\%$ (on ne compte pas deux fois les filles externes).`, "%"),
    ]);
  },
  (r) => {
    const n = pick(r, [2, 3, 4]);
    return mcq(r, `On lance une pièce équilibrée $${n}$ fois. Probabilité d'obtenir au moins un « pile » ?`, frac(2 ** n - 1, 2 ** n), [frac(1, 2 ** n), frac(n, n + 1), frac(1, 2)],
      `Contraire : « que des faces », de probabilité $\\left(\\frac12\\right)^{${n}} = ${fracTex(1, 2 ** n)}$. Donc $1 - ${fracTex(1, 2 ** n)} = ${fracTex(2 ** n - 1, 2 ** n)}$.`);
  },
  cards([
    ["Deux événements incompatibles sont deux événements qui…", "ne peuvent pas se réaliser en même temps", ["ont la même probabilité", "sont contraires", "se réalisent toujours ensemble"], "$A \\cap B = \\emptyset$."],
    ["La somme des probabilités de toutes les issues vaut…", "$1$", ["$0$", "$100$", "le nombre d'issues"], "Une loi de probabilité est complète."],
    ["Pour calculer « au moins un », le plus simple est souvent de…", "passer par l'événement contraire", ["additionner toutes les probabilités", "multiplier par le nombre d'essais", "faire un arbre infini"], "$P(\\text{au moins un}) = 1 - P(\\text{aucun})$."],
    ["Lancer un dé un très grand nombre de fois : la fréquence d'apparition du 6…", "se rapproche de $\\frac16$", ["vaut toujours exactement $\\frac16$", "augmente sans cesse", "tend vers 0"], "Loi des grands nombres (fluctuation d'échantillonnage)."],
  ]),
  claims([
    ["Un événement et son contraire sont incompatibles.", true, "Ils ne peuvent pas se réaliser ensemble."],
    ["Deux événements incompatibles sont forcément contraires.", false, "« Obtenir 1 » et « obtenir 2 » sont incompatibles sans être contraires."],
    ["Une probabilité peut valoir 1,2.", false, "Elle est toujours entre 0 et 1."],
  ]),
];

// ───────────── Probabilités conditionnelles (seconde) ─────────────

const probasCond: Generator[] = [
  (r) => {
    const a = pick(r, [20, 25, 40, 50]), ab = int(r, 3, a - 3);
    return numeric(`Sur $${a}$ élèves inscrits à l'option théâtre, $${ab}$ sont en seconde. Fréquence (en %) des élèves de seconde parmi ceux de l'option ?`, (ab / a) * 100, `$\\dfrac{${ab}}{${a}} = ${tex(ab / a, 3)}$, soit $${tex((ab / a) * 100, 1)}\\,\\%$.`, "%", 0.01);
  },
  (r) => {
    const pa = pick(r, [0.2, 0.25, 0.4, 0.5, 0.6, 0.8]), pba = pick(r, [0.1, 0.2, 0.3, 0.5, 0.75]);
    return oneOf(r, [
      () => numeric(`$P(A) = ${tex(pa)}$ et $P_A(B) = ${tex(pba)}$. Calcule $P(A \\cap B)$.`, pa * pba, `$P(A \\cap B) = P(A) \\times P_A(B) = ${tex(pa)} \\times ${tex(pba)} = ${tex(pa * pba)}$.`, undefined, 0.001),
      () => numeric(`$P(A) = ${tex(pa)}$ et $P(A \\cap B) = ${tex(pa * pba)}$. Calcule $P_A(B)$.`, pba, `$P_A(B) = \\dfrac{P(A \\cap B)}{P(A)} = \\dfrac{${tex(pa * pba)}}{${tex(pa)}} = ${tex(pba)}$.`, undefined, 0.001),
    ]);
  },
  (r) => {
    const pa = pick(r, [0.3, 0.4, 0.6, 0.7]), pba = pick(r, [0.1, 0.2, 0.5]), pbna = pick(r, [0.3, 0.4, 0.6]);
    const pb = pa * pba + (1 - pa) * pbna;
    return numeric(`Arbre : $P(A) = ${tex(pa)}$, $P_A(B) = ${tex(pba)}$, $P_{\\overline A}(B) = ${tex(pbna)}$. Calcule $P(B)$.`, pb,
      `Deux chemins mènent à $B$ : $${tex(pa)} \\times ${tex(pba)} + ${tex(1 - pa)} \\times ${tex(pbna)} = ${tex(pb)}$.`, undefined, 0.001);
  },
  claims([
    ["$P_A(B)$ et $P_B(A)$ sont toujours égales.", false, "Parmi les malades, presque tous ont de la fièvre ; parmi ceux qui ont de la fièvre, peu sont gravement malades."],
    ["Dans un arbre, on multiplie les probabilités le long d'un chemin.", true, "$P(A \\cap B) = P(A) \\times P_A(B)$."],
  ]),
];

// ───────────── Automatismes (seconde) ─────────────

const automatismes: Generator[] = [
  (r) => {
    const v = pick(r, [18, 36, 54, 72, 90, 108, 126]);
    return oneOf(r, [
      () => numeric(`Convertis $${v}$ km/h en m/s.`, v / 3.6, `On divise par 3,6 : $${v} \\div 3{,}6 = ${tex(v / 3.6)}$ m/s.`, "m/s"),
      () => numeric(`Convertis $${tex(v / 3.6)}$ m/s en km/h.`, v, `On multiplie par 3,6 : $${tex(v / 3.6)} \\times 3{,}6 = ${v}$ km/h.`, "km/h"),
    ]);
  },
  (r) => {
    const a = int(r, 4, 40) * 5, t = pick(r, [10, 20, 25, 40, 50, -10, -20, -25, -50]);
    const b = a * (1 + t / 100);
    return numeric(`Un prix passe de $${a}$ € à $${tex(b)}$ €. Taux d'évolution en % ?`, t, `$\\dfrac{${tex(b)} - ${a}}{${a}} \\times 100 = ${t}\\,\\%$.`, "%");
  },
  (r) => {
    const h = int(r, 1, 3), m = pick(r, [15, 30, 45, 12, 6, 24, 36, 48]);
    return oneOf(r, [
      () => numeric(`Écris $${h}$ h $${m}$ min en heures décimales.`, h + m / 60, `$${m}$ min $= \\dfrac{${m}}{60}$ h $= ${tex(m / 60)}$ h.`, "h"),
      () => numeric(`$${tex(h + m / 60)}$ h correspond à $${h}$ h et combien de minutes ?`, m, `$${tex(m / 60)}$ h $\\times 60 = ${m}$ min.`, "min"),
    ]);
  },
  (r) => {
    const p = pick(r, [10, 20, 25, 50]), q = pick(r, [10, 20, 40, 50]);
    return numeric(`$${p}\\,\\%$ des élèves font du sport, et parmi eux $${q}\\,\\%$ font du football. Quel pourcentage de l'ensemble des élèves fait du football ?`, (p * q) / 100, `Proportion de proportion : $${tex(p / 100)} \\times ${tex(q / 100)} = ${tex((p * q) / 10000)}$, soit $${tex((p * q) / 100)}\\,\\%$.`, "%");
  },
  (r) => {
    const items: [string, string, string[], string][] = [
      ["Ordre de grandeur de $49 \\times 21$ ?", "$1\\,000$", ["$100$", "$10\\,000$", "$70$"], "$50 \\times 20 = 1\\,000$."],
      ["Ordre de grandeur de $\\dfrac{612}{0{,}49}$ ?", "$1\\,200$", ["$300$", "$120$", "$12\\,000$"], "$\\frac{600}{0{,}5} = 1\\,200$."],
      ["Ordre de grandeur de $3{,}1 \\times 10^{4} \\times 2{,}9 \\times 10^{-2}$ ?", "$900$", ["$90$", "$9\\,000$", "$9$"], "$3 \\times 3 \\times 10^{2} = 900$."],
      ["$1$ L $=$ ?", "$1$ dm³", ["$1$ m³", "$1$ cm³", "$10$ cm³"], "$1$ m³ $= 1\\,000$ L."],
      ["$1$ ha $=$ ?", "$10\\,000$ m²", ["$1\\,000$ m²", "$100$ m²", "$100\\,000$ m²"], "Un hectare est un carré de 100 m de côté."],
    ];
    const [q, a, w, e] = pick(r, items);
    return mcq(r, q, a, w, e);
  },
];

export const MATHS_SECONDE_PLUS: Record<string, Generator[]> = {
  "maths-2-nombres": nombres,
  "maths-2-equations": equations,
  "maths-2-fonctions": fonctions,
  "maths-2-affines": affines,
  "maths-2-reference": reference,
  "maths-2-vecteurs": vecteurs,
  "maths-2-droites": droites,
  "maths-2-stats": stats,
  "maths-2-probas": probas,
  "maths-2-probas-cond": probasCond,
  "maths-2-automatismes": automatismes,
};
