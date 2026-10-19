/**
 * Lexique des symboles : chaque fiche affiche la signification des notations
 * qu'elle utilise réellement (repérées dans son LaTeX).
 */
export interface Notation {
  /** Symbole à afficher (LaTeX, sans les dollars). */
  symbol: string;
  meaning: string;
}

/** Formules ($…$) de ces textes qui contiennent ce motif. */
const formulasWith = (all: string, re: RegExp) => (all.match(/\$[^$]+\$/g) ?? []).filter((f) => re.test(f));

/** `re` : motif à repérer (ou test sur tout le texte) ; `unless` : contexte où ce sens ne s'applique pas. */
const NOTATIONS: (Notation & { re: RegExp | ((all: string) => boolean); unless?: RegExp })[] = [
  { re: /\\mathbb\{N\}/, symbol: String.raw`\mathbb{N}`, meaning: "les entiers naturels : 0, 1, 2, 3…" },
  { re: /\\mathbb\{Z\}/, symbol: String.raw`\mathbb{Z}`, meaning: "les entiers relatifs : … −2, −1, 0, 1, 2…" },
  { re: /\\mathbb\{D\}/, symbol: String.raw`\mathbb{D}`, meaning: "les nombres décimaux (nombre fini de chiffres après la virgule)" },
  { re: /\\mathbb\{Q\}/, symbol: String.raw`\mathbb{Q}`, meaning: "les rationnels : les nombres qui s'écrivent comme une fraction" },
  { re: /\\mathbb\{R\}(?!\^)/, symbol: String.raw`\mathbb{R}`, meaning: "les réels : tous les nombres de la droite graduée" },
  { re: /\\mathbb\{R\}\^\*/, symbol: String.raw`\mathbb{R}^*`, meaning: "tous les réels sauf 0" },
  { re: /\\in\b/, symbol: String.raw`x \in I`, meaning: "« x appartient à I » : x est un élément de I" },
  { re: /\\subset/, symbol: String.raw`A \subset B`, meaning: "« A est inclus dans B » : tout élément de A est dans B" },
  { re: /\]-\\infty|\\infty\[|\[0 ; |\]0 ; /, symbol: String.raw`[a ; b[`, meaning: "intervalle de a à b ; crochet tourné vers le nombre : borne comprise, tourné vers l'extérieur : borne exclue" },
  { re: /\\iff/, symbol: String.raw`\iff`, meaning: "« équivaut à » : les deux affirmations sont vraies en même temps" },
  { re: /\\Rightarrow/, symbol: String.raw`\Rightarrow`, meaning: "« implique » : si la gauche est vraie, alors la droite aussi" },
  { re: /\\neq/, symbol: String.raw`\neq`, meaning: "« est différent de »" },
  { re: /\\approx/, symbol: String.raw`\approx`, meaning: "« environ égal à » (valeur arrondie)" },
  { re: /\\leq|\\geq/, symbol: String.raw`\leq \;\; \geq`, meaning: "inférieur ou égal ; supérieur ou égal" },
  { re: /\\pm/, symbol: String.raw`\pm`, meaning: "« plus ou moins » : on fait deux calculs, un avec +, un avec −" },
  { re: /(^|[^\\])\|[a-z-]/, symbol: String.raw`|x|`, meaning: "valeur absolue : le nombre sans son signe, c'est-à-dire sa distance à 0" },
  { re: /\\sqrt/, symbol: String.raw`\sqrt{a}`, meaning: "racine carrée : le nombre positif dont le carré vaut a" },
  { re: /\d!|n!/, symbol: "n!", meaning: "factorielle : 1 × 2 × 3 × … × n (ex. 4! = 24)" },
  { re: /binom/, symbol: String.raw`\binom{n}{k}`, meaning: "« k parmi n » : nombre de façons de choisir k éléments parmi n" },
  { re: /\\sum/, symbol: String.raw`\sum`, meaning: "« somme de » : on additionne tous les termes" },
  { re: /\\Delta/, symbol: String.raw`\Delta`, meaning: "delta : le discriminant d'un trinôme, ou une variation (valeur finale − valeur initiale)" },
  { re: /\\mapsto/, symbol: String.raw`x \mapsto f(x)`, meaning: "« x donne f(x) » : la fonction qui à x associe f(x)" },
  { re: /\\mathcal\{C\}/, symbol: String.raw`\mathcal{C}_f`, meaning: "la courbe représentative de f" },
  { re: /f''/, symbol: "f''", meaning: "dérivée seconde : la dérivée de la dérivée" },
  // En optique, f' est la distance focale et non une dérivée.
  { re: /(^|[^a-zA-Zéèàù])[fFuvg]'(?!')/, unless: /\\overline\{OF'\}/, symbol: "f'", meaning: "dérivée de f : la pente de la courbe en chaque point" },
  { re: /\\overline\{OF'\}/, symbol: "f'", meaning: "distance focale image : distance algébrique du centre O de la lentille à son foyer image F'" },
  { re: /\\lim/, symbol: String.raw`\lim`, meaning: "limite : la valeur dont on se rapproche" },
  // Flèche « mathématique » (limites, primitives) : hors des équations chimiques, qui s'écrivent avec \mathrm.
  { re: (all) => formulasWith(all, /\\to\b/).some((f) => !f.includes("\\mathrm")), symbol: String.raw`\to`, meaning: "« tend vers » (ou, pour les primitives, « a pour primitive »)" },
  { re: (all) => formulasWith(all, /\\to\b/).some((f) => f.includes("\\mathrm")), symbol: String.raw`\mathrm{A} \to \mathrm{B}`, meaning: "dans une équation de réaction : les réactifs (à gauche) donnent les produits (à droite)" },
  { re: /\\infty/, symbol: String.raw`+\infty`, meaning: "plus l'infini : plus grand que n'importe quel nombre" },
  { re: /0\^\+|0\^-/, symbol: "0^+", meaning: "on s'approche de 0 par des nombres positifs (0⁻ : par des négatifs)" },
  { re: /\\int/, symbol: String.raw`\int_a^b f(x)\,dx`, meaning: "intégrale de a à b : l'aire sous la courbe de f" },
  { re: /\\ln/, symbol: String.raw`\ln`, meaning: "logarithme népérien, réciproque de l'exponentielle" },
  { re: /\\log/, symbol: String.raw`\log`, meaning: "logarithme décimal : log(10ⁿ) = n" },
  { re: /e\^\{|e\^[x0-9a-z]/, symbol: "e^x", meaning: "exponentielle de x, avec e ≈ 2,718" },
  { re: /\\overrightarrow|\\vec/, symbol: String.raw`\overrightarrow{AB}`, meaning: "vecteur (ici de A vers B) : une flèche définie par une direction, un sens et une longueur (déplacement, force, vitesse…)" },
  { re: /\\\|/, symbol: String.raw`\|\vec u\|`, meaning: "norme : la longueur du vecteur" },
  { re: /\\cdot/, symbol: String.raw`\vec u \cdot \vec v`, meaning: "produit scalaire des deux vecteurs (un nombre)" },
  { re: /\\perp/, symbol: String.raw`\perp`, meaning: "« est perpendiculaire (orthogonal) à »" },
  { re: /\\overline\{?[ABM][}\s)]/, symbol: String.raw`\overline{A}`, meaning: "événement contraire : « A ne se réalise pas »" },
  { re: /\\overline\{O/, symbol: String.raw`\overline{OA}`, meaning: "distance algébrique : positive dans le sens de la lumière, négative sinon" },
  { re: /\\bar x/, symbol: String.raw`\bar x`, meaning: "la moyenne de la série" },
  { re: /\\cup/, symbol: String.raw`A \cup B`, meaning: "« A ou B » : au moins l'un des deux" },
  { re: /\\cap/, symbol: String.raw`A \cap B`, meaning: "« A et B » : les deux à la fois" },
  { re: /\\emptyset/, symbol: String.raw`\emptyset`, meaning: "l'ensemble vide : aucun élément" },
  { re: /P_(\{[^}]*\}|[A-Z])\(/, symbol: String.raw`P_A(B)`, meaning: "probabilité de B sachant que A est réalisé" },
  { re: /\\mathcal\{B\}/, symbol: String.raw`\mathcal{B}(n ; p)`, meaning: "loi binomiale : n répétitions, succès de probabilité p" },
  { re: /\\sim/, symbol: String.raw`X \sim \dots`, meaning: "« X suit la loi … »" },
  { re: /E\(X\)/, symbol: "E(X)", meaning: "espérance : la moyenne de X à long terme" },
  { re: /\\sigma/, symbol: String.raw`\sigma`, meaning: "sigma : l'écart-type, qui mesure la dispersion" },
  { re: /\\alpha/, symbol: String.raw`\alpha`, meaning: "alpha : lettre grecque utilisée pour un angle ou une abscisse" },
  { re: /\\beta/, symbol: String.raw`\beta`, meaning: "bêta : lettre grecque, ici une ordonnée ou une constante" },
  { re: /\\lambda/, symbol: String.raw`\lambda`, meaning: "lambda : la longueur d'onde (m) ; en radioactivité, la constante radioactive (s⁻¹)" },
  { re: /\\nu/, symbol: String.raw`\nu`, meaning: "nu : la fréquence d'une onde lumineuse (Hz)" },
  { re: /\\tau/, symbol: String.raw`\tau`, meaning: "tau : un retard ou une constante de temps (s)" },
  { re: /\\rho/, symbol: String.raw`\rho`, meaning: "rhô : la masse volumique (kg/m³)" },
  { re: /\\theta/, symbol: String.raw`\theta`, meaning: "thêta : un angle (souvent en radians)" },
  { re: /\\gamma/, symbol: String.raw`\gamma`, meaning: "gamma : le grandissement d'une lentille" },
  { re: /\\varepsilon/, symbol: String.raw`\varepsilon`, meaning: "epsilon : le coefficient d'absorption molaire" },
  { re: /\\Phi/, symbol: String.raw`\Phi`, meaning: "phi : le flux thermique (W)" },
  { re: /\\delta/, symbol: String.raw`\delta`, meaning: "delta minuscule : une différence de chemin, une charge partielle, ou la dioptrie (unité de vergence)" },
  { re: /\\mu/, symbol: String.raw`\mu`, meaning: "mu : la valeur moyenne d'une fonction" },
  { re: /\\d?frac\{d[^}]/, symbol: String.raw`\dfrac{dx}{dt}`, meaning: "dérivée par rapport au temps : la vitesse de variation" },
  { re: /\[\\mathrm/, symbol: String.raw`[\mathrm{X}]`, meaning: "concentration de l'espèce X (mol/L)" },
  { re: /\\rightleftharpoons/, symbol: String.raw`\rightleftharpoons`, meaning: "réaction qui peut se faire dans les deux sens" },
];

/** Les notations présentes dans ces textes, dans l'ordre du lexique. */
export function notationsIn(texts: string[]): Notation[] {
  const all = texts.join("\n");
  return NOTATIONS.filter((n) => (typeof n.re === "function" ? n.re(all) : n.re.test(all)) && !n.unless?.test(all)).map(({ symbol, meaning }) => ({ symbol, meaning }));
}
