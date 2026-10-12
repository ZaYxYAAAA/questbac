import type { Difficulty, Question } from "@/lib/types";

/**
 * Banque de questions locale (hors-ligne). Chaque chapitre sans entrée ici
 * peut être joué grâce à la génération IA (voir /api/missions).
 *
 * Les énoncés sont en Markdown ; les maths s'écrivent en LaTeX entre $...$.
 */

type Draft =
  | { type: "mcq"; prompt: string; choices: string[]; answer: number; explanation: string; difficulty?: Difficulty }
  | { type: "truefalse"; prompt: string; answer: boolean; explanation: string; difficulty?: Difficulty }
  | { type: "numeric"; prompt: string; answer: number; tolerance?: number; unit?: string; explanation: string; difficulty?: Difficulty };

const mcq = (prompt: string, choices: string[], answer: number, explanation: string, difficulty: Difficulty = 1): Draft => ({
  type: "mcq", prompt, choices, answer, explanation, difficulty,
});
const tf = (prompt: string, answer: boolean, explanation: string, difficulty: Difficulty = 1): Draft => ({
  type: "truefalse", prompt, answer, explanation, difficulty,
});
const num = (prompt: string, answer: number, explanation: string, difficulty: Difficulty = 1, tolerance = 0.01, unit?: string): Draft => ({
  type: "numeric", prompt, answer, explanation, difficulty, tolerance, unit,
});

const BANK: Record<string, Draft[]> = {
  // ═════════════ MATHS — SECONDE ═════════════
  "maths-2-nombres": [
    mcq("À quel plus petit ensemble appartient $\\sqrt{2}$ ?", ["$\\mathbb{N}$", "$\\mathbb{Q}$", "$\\mathbb{R}$", "$\\mathbb{Z}$"], 2, "$\\sqrt 2$ est irrationnel : il appartient à $\\mathbb{R}$ mais pas à $\\mathbb{Q}$."),
    num("Calcule $2^3 \\times 2^4$.", 128, "$a^m \\times a^n = a^{m+n}$ donc $2^3 \\times 2^4 = 2^7 = 128$."),
    mcq("$\\sqrt{50}$ est égal à :", ["$5\\sqrt{2}$", "$25\\sqrt{2}$", "$2\\sqrt{5}$", "$10\\sqrt{5}$"], 0, "$\\sqrt{50} = \\sqrt{25 \\times 2} = \\sqrt{25}\\times\\sqrt 2 = 5\\sqrt2$.", 2),
    tf("$\\frac{1}{3}$ est un nombre décimal.", false, "$\\frac13 = 0{,}333\\ldots$ a une écriture décimale illimitée : c'est un rationnel non décimal."),
    mcq("$(10^{-2})^3$ vaut :", ["$10^{-5}$", "$10^{-6}$", "$10^{1}$", "$10^{6}$"], 1, "$(a^m)^n = a^{m\\times n}$ donc $(10^{-2})^3 = 10^{-6}$."),
  ],
  "maths-2-equations": [
    mcq("Développer $(x+3)^2$ :", ["$x^2+9$", "$x^2+6x+9$", "$x^2+3x+9$", "$2x+6$"], 1, "Identité remarquable : $(a+b)^2 = a^2 + 2ab + b^2$, donc $x^2 + 6x + 9$."),
    num("Résoudre $3x - 7 = 11$. Donne $x$.", 6, "$3x = 18$ donc $x = 6$."),
    mcq("Factoriser $x^2 - 16$ :", ["$(x-4)^2$", "$(x-16)(x+1)$", "$(x-4)(x+4)$", "$(x-8)(x+8)$"], 2, "$a^2 - b^2 = (a-b)(a+b)$ avec $a = x$ et $b = 4$."),
    mcq("L'ensemble des solutions de $-2x > 6$ est :", ["$]-\\infty;-3[$", "$]-3;+\\infty[$", "$]3;+\\infty[$", "$]-\\infty;3[$"], 0, "On divise par $-2$ (négatif) : le sens de l'inégalité change. $x < -3$.", 2),
    tf("L'équation $x^2 = -4$ admet deux solutions réelles.", false, "Un carré est toujours positif ou nul : aucune solution réelle."),
  ],
  "maths-2-fonctions": [
    mcq("Soit $f(x) = x^2 - 3$. L'image de $-2$ par $f$ est :", ["$-7$", "$1$", "$7$", "$-1$"], 1, "$f(-2) = (-2)^2 - 3 = 4 - 3 = 1$."),
    mcq("Les antécédents de $1$ par $f(x) = x^2 - 3$ sont :", ["$-2$ et $2$", "$2$ seulement", "$-1$ et $1$", "$4$"], 0, "$x^2 - 3 = 1 \\iff x^2 = 4 \\iff x = -2$ ou $x = 2$.", 2),
    tf("Une fonction croissante sur $[0;5]$ vérifie $f(1) \\le f(4)$.", true, "Croissante : si $a \\le b$ alors $f(a) \\le f(b)$. Ici $1 \\le 4$."),
    mcq("Si le point $A(2;5)$ est sur la courbe de $f$, alors :", ["$f(5)=2$", "$f(2)=5$", "$f(2)=2$", "$f(0)=5$"], 1, "Un point $(x ; y)$ est sur la courbe si et seulement si $y = f(x)$."),
    num("Soit $g(x) = 2x^2 - x$. Calcule $g(3)$.", 15, "$g(3) = 2 \\times 9 - 3 = 15$."),
  ],
  "maths-2-affines": [
    mcq("Le coefficient directeur de la droite passant par $A(1;2)$ et $B(3;8)$ est :", ["$2$", "$3$", "$6$", "$\\frac{1}{3}$"], 1, "$m = \\frac{y_B - y_A}{x_B - x_A} = \\frac{8-2}{3-1} = 3$."),
    mcq("La fonction $f(x) = -2x + 5$ est :", ["croissante", "décroissante", "constante", "ni croissante ni décroissante"], 1, "Le coefficient directeur $-2$ est négatif : $f$ est décroissante."),
    num("Pour $f(x) = 4x - 3$, quelle est l'ordonnée à l'origine ?", -3, "Pour $f(x) = mx + p$, l'ordonnée à l'origine est $p = f(0) = -3$."),
    num("Résous $f(x) = 0$ pour $f(x) = 2x - 7$.", 3.5, "$2x = 7$ donc $x = 3{,}5$.", 1, 0.001),
    tf("Une fonction linéaire est une fonction affine dont l'ordonnée à l'origine est nulle.", true, "Linéaire : $f(x) = mx$, c'est le cas $p = 0$."),
  ],
  "maths-2-reference": [
    mcq("Sur $]-\\infty;0]$, la fonction carré est :", ["croissante", "décroissante", "constante", "positive puis négative"], 1, "La parabole $y = x^2$ descend jusqu'à $0$ puis remonte."),
    mcq("La fonction inverse est définie sur :", ["$\\mathbb{R}$", "$[0;+\\infty[$", "$\\mathbb{R}\\setminus\\{0\\}$", "$]0;+\\infty[$"], 2, "On ne peut pas diviser par $0$ : $\\frac1x$ existe pour tout $x \\neq 0$."),
    tf("Pour tout réel $x \\geq 0$, $\\sqrt{x^2} = x$.", true, "Pour $x \\ge 0$, $\\sqrt{x^2} = |x| = x$."),
    mcq("Si $0 < a < b$, alors :", ["$\\frac1a < \\frac1b$", "$\\frac1a > \\frac1b$", "$\\frac1a = \\frac1b$", "on ne peut pas conclure"], 1, "La fonction inverse est décroissante sur $]0;+\\infty[$ : elle inverse l'ordre.", 2),
    num("Combien de solutions réelles possède l'équation $x^3 = 8$ ?", 1, "La fonction cube est strictement croissante sur $\\mathbb{R}$ : seule solution $x = 2$.", 2),
  ],
  "maths-2-vecteurs": [
    mcq("Si $A(1;2)$ et $B(4;6)$, les coordonnées de $\\vec{AB}$ sont :", ["$(3;4)$", "$(5;8)$", "$(-3;-4)$", "$(4;3)$"], 0, "$\\vec{AB}(x_B - x_A ; y_B - y_A) = (3 ; 4)$."),
    num("Avec $A(1;2)$ et $B(4;6)$, calcule la distance $AB$.", 5, "$AB = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$."),
    mcq("Les vecteurs $\\vec u(2;3)$ et $\\vec v(4;6)$ sont :", ["orthogonaux", "colinéaires", "opposés", "de même norme"], 1, "$\\det(\\vec u, \\vec v) = 2\\times6 - 3\\times4 = 0$ : ils sont colinéaires ($\\vec v = 2\\vec u$).", 2),
    mcq("Le milieu de $[AB]$ avec $A(-2;4)$ et $B(6;0)$ est :", ["$(4;4)$", "$(2;2)$", "$(8;-4)$", "$(2;4)$"], 1, "$\\left(\\frac{-2+6}{2} ; \\frac{4+0}{2}\\right) = (2 ; 2)$."),
    tf("$\\vec{AB} + \\vec{BC} = \\vec{AC}$.", true, "C'est la relation de Chasles."),
  ],
  "maths-2-stats": [
    num("Moyenne de la série $8 ; 12 ; 10 ; 14 ; 6$ ?", 10, "$\\frac{8+12+10+14+6}{5} = \\frac{50}{5} = 10$."),
    mcq("Médiane de $3 ; 7 ; 9 ; 12 ; 20$ :", ["$7$", "$9$", "$10{,}2$", "$12$"], 1, "Série ordonnée de 5 valeurs : la médiane est la 3e, soit $9$."),
    tf("La moyenne est toujours une valeur de la série.", false, "Ex. : la moyenne de $1$ et $2$ est $1{,}5$."),
    mcq("L'écart interquartile se calcule par :", ["$Q_3 - Q_1$", "$\\max - \\min$", "$Q_3 + Q_1$", "$\\text{Me} - Q_1$"], 0, "$\\max - \\min$ est l'étendue ; l'écart interquartile est $Q_3 - Q_1$."),
  ],
  "maths-2-probas": [
    mcq("On lance un dé équilibré à 6 faces. $P(\\text{nombre pair}) =$", ["$\\frac16$", "$\\frac13$", "$\\frac12$", "$\\frac23$"], 2, "3 issues favorables (2, 4, 6) sur 6 : $\\frac36 = \\frac12$."),
    num("$P(A) = 0{,}3$. Calcule $P(\\bar A)$.", 0.7, "$P(\\bar A) = 1 - P(A) = 0{,}7$.", 1, 0.001),
    mcq("$P(A \\cup B) =$", ["$P(A)+P(B)$", "$P(A)+P(B)-P(A\\cap B)$", "$P(A)\\times P(B)$", "$P(A)-P(B)$"], 1, "On retire l'intersection, comptée deux fois.", 2),
    tf("Une probabilité peut valoir $1{,}2$.", false, "Une probabilité est toujours comprise entre $0$ et $1$."),
  ],

  // ═════════════ MATHS — PREMIÈRE ═════════════
  "maths-1-second-degre": [
    num("Calcule le discriminant de $2x^2 - 3x + 1$.", 1, "$\\Delta = b^2 - 4ac = 9 - 8 = 1$."),
    mcq("Si $\\Delta < 0$, l'équation $ax^2 + bx + c = 0$ admet :", ["deux solutions", "une solution double", "aucune solution réelle", "une infinité de solutions"], 2, "Si $\\Delta < 0$, la parabole ne coupe pas l'axe des abscisses."),
    mcq("La forme canonique de $x^2 - 4x + 7$ est :", ["$(x-2)^2+3$", "$(x+2)^2+3$", "$(x-4)^2+7$", "$(x-2)^2-3$"], 0, "$(x-2)^2 = x^2 - 4x + 4$, donc $x^2 - 4x + 7 = (x-2)^2 + 3$.", 2),
    mcq("Le sommet de la parabole $y = -(x-1)^2 + 4$ est :", ["$(1;4)$", "$(-1;4)$", "$(4;1)$", "$(1;-4)$"], 0, "Forme $a(x-\\alpha)^2 + \\beta$ : sommet $(\\alpha ; \\beta) = (1 ; 4)$."),
    mcq("Les racines de $x^2 - 5x + 6$ sont :", ["$1$ et $6$", "$2$ et $3$", "$-2$ et $-3$", "$-1$ et $6$"], 1, "$\\Delta = 1$, $x = \\frac{5 \\pm 1}{2}$ soit $2$ et $3$. (Somme $5$, produit $6$.)"),
    tf("Si $a > 0$, la parabole est tournée vers le haut et $f$ admet un minimum.", true, "Le sommet est alors le point le plus bas de la courbe."),
  ],
  "maths-1-suites": [
    mcq("$(u_n)$ est arithmétique avec $u_0 = 3$ et $r = 2$. $u_{10} =$", ["$20$", "$23$", "$13$", "$2048$"], 1, "$u_n = u_0 + nr = 3 + 10\\times2 = 23$."),
    num("$(v_n)$ géométrique, $v_0 = 5$ et $q = 2$. Calcule $v_3$.", 40, "$v_n = v_0 \\times q^n = 5 \\times 2^3 = 40$."),
    mcq("Une suite géométrique de raison $q = 0{,}5$ et de premier terme positif est :", ["croissante", "décroissante", "constante", "alternée"], 1, "$0 < q < 1$ et $u_0 > 0$ : chaque terme est la moitié du précédent."),
    num("Calcule $1 + 2 + 3 + \\dots + 100$.", 5050, "$\\frac{n(n+1)}{2} = \\frac{100 \\times 101}{2} = 5050$.", 2),
    tf("La suite définie par $u_n = n^2$ est arithmétique.", false, "Les écarts $1, 3, 5, \\ldots$ ne sont pas constants."),
  ],
  "maths-1-derivation": [
    mcq("La dérivée de $f(x) = x^3$ est :", ["$3x^2$", "$x^2$", "$3x^3$", "$\\frac{x^4}{4}$"], 0, "$(x^n)' = nx^{n-1}$."),
    mcq("La dérivée de $f(x) = \\frac{1}{x}$ sur $\\mathbb{R}^*$ est :", ["$\\ln x$", "$-\\frac{1}{x^2}$", "$\\frac{1}{x^2}$", "$-\\frac1x$"], 1, "Formule à connaître : $\\left(\\frac1x\\right)' = -\\frac{1}{x^2}$."),
    num("Soit $f(x) = x^2 + 3x$. Calcule $f'(2)$.", 7, "$f'(x) = 2x + 3$ donc $f'(2) = 7$."),
    mcq("L'équation de la tangente à $\\mathcal{C}_f$ au point d'abscisse $a$ est :", ["$y = f(a)(x-a)+f'(a)$", "$y = f'(a)(x-a)+f(a)$", "$y = f'(a)x + f(a)$", "$y = f(a)x + f'(a)$"], 1, "Le coefficient directeur de la tangente est $f'(a)$ et elle passe par $(a ; f(a))$.", 2),
    mcq("La dérivée de $\\sqrt{x}$ sur $]0;+\\infty[$ est :", ["$\\frac{1}{\\sqrt x}$", "$\\frac{1}{2\\sqrt x}$", "$2\\sqrt x$", "$\\frac{\\sqrt x}{2}$"], 1, "Formule à connaître : $(\\sqrt x)' = \\frac{1}{2\\sqrt x}$."),
    mcq("$(uv)' =$", ["$u'v'$", "$u'v + uv'$", "$u'v - uv'$", "$\\frac{u'v - uv'}{v^2}$"], 1, "Dérivée d'un produit. (La dernière proposition est celle du quotient.)", 2),
  ],
  "maths-1-variations": [
    tf("Si $f'(x) > 0$ sur un intervalle $I$, alors $f$ est strictement croissante sur $I$.", true, "Le signe de la dérivée donne le sens de variation."),
    mcq("Si $f'$ s'annule en $a$ en passant de $+$ à $-$, alors $f$ admet en $a$ :", ["un minimum local", "un maximum local", "un point d'inflexion", "une asymptote"], 1, "$f$ croît puis décroît : c'est un maximum local.", 2),
    mcq("$f(x) = x^2 - 6x + 1$ est décroissante sur :", ["$]-\\infty;3]$", "$[3;+\\infty[$", "$]-\\infty;-3]$", "$\\mathbb{R}$"], 0, "$f'(x) = 2x - 6 \\le 0 \\iff x \\le 3$."),
    num("Abscisse du minimum de $f(x) = x^2 - 6x + 1$ ?", 3, "$f'(3) = 0$ et $f'$ passe de $-$ à $+$."),
  ],
  "maths-1-exponentielle": [
    mcq("$e^{a} \\times e^{b} =$", ["$e^{ab}$", "$e^{a+b}$", "$e^{a-b}$", "$(e^a)^b$"], 1, "Relation fonctionnelle de l'exponentielle."),
    num("Combien vaut $e^0$ ?", 1, "Par définition, $\\exp(0) = 1$."),
    mcq("La dérivée de $e^{3x}$ est :", ["$e^{3x}$", "$3e^{3x}$", "$3xe^{3x-1}$", "$\\frac{e^{3x}}{3}$"], 1, "$(e^{ax+b})' = ae^{ax+b}$.", 2),
    tf("Pour tout réel $x$, $e^x > 0$.", true, "L'exponentielle est strictement positive sur $\\mathbb{R}$."),
    mcq("$\\frac{e^{5}}{e^{2}} =$", ["$e^{3}$", "$e^{7}$", "$e^{2{,}5}$", "$e^{10}$"], 0, "$\\frac{e^a}{e^b} = e^{a-b}$."),
  ],
  "maths-1-trigo": [
    mcq("$\\cos\\left(\\frac{\\pi}{3}\\right) =$", ["$\\frac12$", "$\\frac{\\sqrt3}{2}$", "$\\frac{\\sqrt2}{2}$", "$0$"], 0, "Valeur remarquable : $\\cos\\frac\\pi3 = \\frac12$ et $\\sin\\frac\\pi3 = \\frac{\\sqrt3}2$."),
    num("Convertis $\\pi$ radians en degrés.", 180, "$\\pi$ rad $= 180°$."),
    tf("Pour tout réel $x$, $\\cos^2 x + \\sin^2 x = 1$.", true, "C'est Pythagore dans le cercle trigonométrique de rayon 1."),
    mcq("$\\sin(-x) =$", ["$\\sin x$", "$-\\sin x$", "$\\cos x$", "$-\\cos x$"], 1, "Le sinus est une fonction impaire.", 2),
    mcq("$\\frac{\\pi}{4}$ rad correspond à :", ["$30°$", "$45°$", "$60°$", "$90°$"], 1, "$\\frac{180°}{4} = 45°$."),
  ],
  "maths-1-produit-scalaire": [
    num("$\\vec u(2;-1)$ et $\\vec v(3;4)$. Calcule $\\vec u\\cdot\\vec v$.", 2, "$xx' + yy' = 2\\times3 + (-1)\\times4 = 2$."),
    tf("Deux vecteurs non nuls sont orthogonaux si et seulement si leur produit scalaire est nul.", true, "Caractérisation de l'orthogonalité."),
    mcq("$\\vec u \\cdot \\vec v =$", ["$\\|\\vec u\\|\\|\\vec v\\|\\cos(\\vec u,\\vec v)$", "$\\|\\vec u\\|\\|\\vec v\\|\\sin(\\vec u,\\vec v)$", "$\\|\\vec u\\|+\\|\\vec v\\|$", "$\\|\\vec u + \\vec v\\|$"], 0, "Définition avec le cosinus de l'angle."),
    mcq("Formule d'Al-Kashi : $BC^2 =$", ["$AB^2 + AC^2$", "$AB^2 + AC^2 - 2\\,AB\\cdot AC\\cos\\hat A$", "$AB^2 - AC^2$", "$AB^2 + AC^2 + 2\\,AB\\cdot AC\\cos\\hat A$"], 1, "Généralise Pythagore (si $\\hat A = 90°$, $\\cos \\hat A = 0$).", 2),
  ],
  "maths-1-probas-cond": [
    mcq("$P_A(B) =$", ["$\\frac{P(A\\cap B)}{P(B)}$", "$\\frac{P(A\\cap B)}{P(A)}$", "$P(A)P(B)$", "$P(A)+P(B)$"], 1, "Probabilité de $B$ sachant $A$ : on divise par $P(A)$."),
    num("$P(A) = 0{,}4$ et $P_A(B) = 0{,}5$. Calcule $P(A\\cap B)$.", 0.2, "$P(A\\cap B) = P(A)\\times P_A(B) = 0{,}2$.", 1, 0.001),
    tf("$A$ et $B$ sont indépendants si et seulement si $P(A\\cap B) = P(A)\\times P(B)$.", true, "C'est la définition de l'indépendance."),
    mcq("Dans un arbre pondéré, la somme des probabilités issues d'un même nœud vaut :", ["$0$", "$0{,}5$", "$1$", "dépend de l'arbre"], 2, "Règle du nœud : la somme vaut toujours 1."),
  ],
  "maths-1-va": [
    num("$X$ vaut $0$ avec probabilité $0{,}7$ et $10$ avec probabilité $0{,}3$. Calcule $E(X)$.", 3, "$E(X) = 0\\times0{,}7 + 10\\times0{,}3 = 3$."),
    mcq("$V(X) =$", ["$E(X)^2$", "$E(X^2) - E(X)^2$", "$E(X^2)$", "$\\sqrt{E(X)}$"], 1, "Formule de König-Huygens.", 2),
    mcq("$E(aX + b) =$", ["$aE(X)$", "$aE(X)+b$", "$a^2E(X)$", "$E(X)+b$"], 1, "Linéarité de l'espérance."),
    tf("L'écart-type est la racine carrée de la variance.", true, "$\\sigma(X) = \\sqrt{V(X)}$."),
  ],

  // ═════════════ MATHS — TERMINALE ═════════════
  "maths-t-recurrence": [
    mcq("Un raisonnement par récurrence comporte :", ["une seule étape", "une initialisation et une hérédité", "uniquement une hérédité", "un contre-exemple"], 1, "Initialisation, hérédité, puis conclusion."),
    mcq("Si $|q| < 1$, $\\lim\\limits_{n\\to+\\infty} q^n =$", ["$0$", "$1$", "$+\\infty$", "n'existe pas"], 0, "Pour $-1 < q < 1$, $q^n \\to 0$."),
    tf("Toute suite croissante et majorée converge.", true, "Théorème de convergence monotone."),
    mcq("$\\lim\\limits_{n\\to+\\infty} \\frac{3n+1}{n+2} =$", ["$0$", "$\\frac12$", "$3$", "$+\\infty$"], 2, "On factorise par $n$ : $\\frac{3 + 1/n}{1 + 2/n} \\to 3$.", 2),
    mcq("Si $u_n \\le v_n$ pour tout $n$ et $\\lim u_n = +\\infty$, alors :", ["$\\lim v_n = +\\infty$", "$\\lim v_n = 0$", "on ne peut rien dire", "$v_n$ converge"], 0, "Théorème de comparaison.", 2),
  ],
  "maths-t-limites": [
    mcq("$\\lim\\limits_{x\\to+\\infty} \\frac{e^x}{x} =$", ["$0$", "$1$", "$+\\infty$", "$e$"], 2, "Croissances comparées : l'exponentielle l'emporte."),
    mcq("$\\lim\\limits_{x\\to0^+} \\frac1x =$", ["$0$", "$+\\infty$", "$-\\infty$", "$1$"], 1, "On divise $1$ par un nombre positif de plus en plus petit."),
    mcq("La droite $y = 2$ est asymptote horizontale à $\\mathcal C_f$ en $+\\infty$ si :", ["$f(2) = 0$", "$\\lim_{x\\to+\\infty} f(x) = 2$", "$\\lim_{x\\to2} f(x) = +\\infty$", "$f'(2)=0$"], 1, "Asymptote horizontale = limite finie à l'infini."),
    tf("$\\infty - \\infty$ est une forme indéterminée.", true, "Les 4 FI : $\\infty - \\infty$, $0\\times\\infty$, $\\frac\\infty\\infty$, $\\frac00$."),
    mcq("$\\lim\\limits_{x\\to+\\infty} x e^{-x} =$", ["$0$", "$+\\infty$", "$1$", "$-\\infty$"], 0, "$xe^{-x} = \\frac{x}{e^x} \\to 0$ par croissances comparées.", 2),
  ],
  "maths-t-continuite": [
    tf("Toute fonction dérivable sur un intervalle y est continue.", true, "Dérivable ⇒ continue (la réciproque est fausse : $|x|$ en $0$)."),
    mcq("$f$ continue sur $[a;b]$ avec $f(a) < 0 < f(b)$. Le TVI affirme que :", ["$f$ est croissante", "$f$ s'annule au moins une fois sur $[a;b]$", "$f$ s'annule exactement une fois", "$f(0)=0$"], 1, "Existence d'au moins une solution."),
    mcq("Pour l'unicité de la solution, il faut en plus que $f$ soit :", ["positive", "strictement monotone", "paire", "bornée"], 1, "C'est le corollaire du TVI (théorème de la bijection).", 2),
    tf("La fonction partie entière est continue sur $\\mathbb R$.", false, "Elle « saute » à chaque entier."),
  ],
  "maths-t-convexite": [
    mcq("Si $f''(x) \\ge 0$ sur $I$, alors $f$ est :", ["concave sur $I$", "convexe sur $I$", "décroissante sur $I$", "constante"], 1, "$f'' \\ge 0$ ⇔ $f'$ croissante ⇔ $f$ convexe."),
    mcq("Un point d'inflexion correspond à :", ["un changement de signe de $f''$", "un maximum", "$f(x)=0$", "$f'(x)=0$"], 0, "La courbe traverse sa tangente : la convexité change."),
    mcq("La dérivée de $e^{u(x)}$ est :", ["$e^{u'(x)}$", "$u'(x)e^{u(x)}$", "$u(x)e^{u(x)-1}$", "$e^{u(x)}$"], 1, "Dérivée d'une composée : $(e^u)' = u'e^u$.", 2),
    tf("Une fonction convexe a sa courbe au-dessus de ses tangentes.", true, "Caractérisation graphique de la convexité."),
    num("Abscisse du point d'inflexion de $f(x) = x^3$ ?", 0, "$f''(x) = 6x$ change de signe en $0$."),
  ],
  "maths-t-ln": [
    mcq("$\\ln(ab) =$ (pour $a, b > 0$)", ["$\\ln a \\times \\ln b$", "$\\ln a + \\ln b$", "$\\ln a - \\ln b$", "$b\\ln a$"], 1, "Le logarithme transforme les produits en sommes."),
    num("Combien vaut $\\ln(1)$ ?", 0, "$e^0 = 1$ donc $\\ln 1 = 0$."),
    mcq("La dérivée de $\\ln x$ est :", ["$e^x$", "$\\frac1x$", "$x\\ln x - x$", "$-\\frac{1}{x^2}$"], 1, "$(\\ln x)' = \\frac1x$ sur $]0;+\\infty[$."),
    mcq("La solution de $e^x = 5$ est :", ["$x = \\ln 5$", "$x = e^5$", "$x = 5e$", "$x = \\frac{5}{e}$"], 0, "$\\ln$ est la réciproque de $\\exp$."),
    tf("$\\ln$ est définie sur $\\mathbb{R}$.", false, "$\\ln$ est définie sur $]0;+\\infty[$ uniquement."),
    mcq("$\\lim\\limits_{x\\to+\\infty} \\frac{\\ln x}{x} =$", ["$0$", "$1$", "$+\\infty$", "$-\\infty$"], 0, "Croissances comparées : $x$ l'emporte sur $\\ln x$.", 2),
  ],
  "maths-t-primitives": [
    mcq("Une primitive de $f(x) = 2x$ est :", ["$2$", "$x^2 + 5$", "$2x^2$", "$\\frac{x^2}{2}$"], 1, "$(x^2 + 5)' = 2x$ : toute fonction $x^2 + C$ convient."),
    mcq("Une primitive de $\\frac1x$ sur $]0;+\\infty[$ est :", ["$-\\frac{1}{x^2}$", "$\\ln x$", "$e^x$", "$\\frac{x^2}{2}$"], 1, "$(\\ln x)' = \\frac1x$."),
    mcq("Les solutions de $y' = 3y$ sont :", ["$y = Ce^{3x}$", "$y = 3e^{x}$", "$y = Ce^{x/3}$", "$y = 3x + C$"], 0, "Les solutions de $y' = ay$ sont $x \\mapsto Ce^{ax}$.", 2),
    tf("Deux primitives d'une même fonction sur un intervalle diffèrent d'une constante.", true, "D'où le « $+ C$ »."),
  ],
  "maths-t-integrale": [
    num("Calcule $\\int_0^2 3x^2\\,dx$.", 8, "Primitive $x^3$ : $2^3 - 0^3 = 8$."),
    num("Calcule $\\int_1^3 2\\,dx$.", 4, "Aire d'un rectangle de largeur $2$ et hauteur $2$."),
    mcq("Si $f \\ge 0$ sur $[a;b]$, $\\int_a^b f(x)\\,dx$ représente :", ["la pente de $f$", "l'aire sous la courbe entre $a$ et $b$", "la valeur maximale de $f$", "la longueur de la courbe"], 1, "En unités d'aire."),
    mcq("La valeur moyenne de $f$ sur $[a;b]$ est :", ["$\\int_a^b f$", "$\\frac{1}{b-a}\\int_a^b f(x)\\,dx$", "$\\frac{f(a)+f(b)}{2}$", "$(b-a)\\int_a^b f$"], 1, "On divise l'intégrale par la longueur de l'intervalle.", 2),
    tf("$\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx$", true, "Échanger les bornes change le signe."),
  ],
  "maths-t-binomiale": [
    num("$X \\sim \\mathcal{B}(10 ; 0{,}3)$. Calcule $E(X)$.", 3, "$E(X) = np = 10 \\times 0{,}3 = 3$."),
    mcq("Pour $X \\sim \\mathcal B(n, p)$, $P(X = k) =$", ["$\\binom{n}{k}p^k(1-p)^{n-k}$", "$p^k(1-p)^{k}$", "$\\binom nk p^{n-k}$", "$np^k$"], 0, "$\\binom nk$ chemins à $k$ succès, chacun de probabilité $p^k(1-p)^{n-k}$."),
    num("Calcule $\\binom{5}{2}$.", 10, "$\\frac{5!}{2!\\,3!} = \\frac{5\\times4}{2} = 10$."),
    mcq("$V(X)$ pour $X \\sim \\mathcal B(n, p)$ :", ["$np$", "$np(1-p)$", "$n(1-p)$", "$\\sqrt{np}$"], 1, "Variance d'une loi binomiale.", 2),
    tf("Dans un schéma de Bernoulli, les répétitions sont indépendantes.", true, "Épreuves identiques et indépendantes."),
  ],
  "maths-t-denombrement": [
    num("Combien d'anagrammes (même sans sens) du mot « MATH » ?", 24, "4 lettres distinctes : $4! = 24$."),
    num("Nombre de façons de choisir 2 délégués parmi 5 élèves ?", 10, "Combinaisons : $\\binom52 = 10$."),
    mcq("Nombre de codes à 4 chiffres (0 à 9, répétitions autorisées) :", ["$40$", "$10\\,000$", "$5\\,040$", "$210$"], 1, "$10^4 = 10\\,000$ (4-uplets)."),
    tf("$\\binom{n}{k} = \\binom{n}{n-k}$", true, "Choisir les $k$ élus revient à choisir les $n-k$ exclus.", 2),
  ],

  // ═════════════ PHYSIQUE-CHIMIE ═════════════
  "pc-2-atome": [
    mcq("Le noyau d'un atome contient :", ["des électrons et des protons", "des protons et des neutrons", "uniquement des neutrons", "des électrons et des neutrons"], 1, "Protons + neutrons = nucléons. Les électrons forment le nuage électronique."),
    num("Combien de neutrons dans un atome de $^{12}_{6}\\text{C}$ ?", 6, "$N = A - Z = 12 - 6 = 6$."),
    tf("Deux isotopes ont le même nombre de protons mais un nombre de neutrons différent.", true, "Même $Z$, $A$ différent."),
    mcq("Un atome est électriquement neutre car :", ["il a autant de protons que de neutrons", "il a autant d'électrons que de protons", "il n'a pas d'électrons", "ses neutrons compensent les électrons"], 1, "Charges $+e$ (protons) et $-e$ (électrons) se compensent."),
  ],
  "pc-2-mole": [
    mcq("La constante d'Avogadro vaut environ :", ["$6{,}02\\times10^{23}\\ \\text{mol}^{-1}$", "$3{,}0\\times10^{8}\\ \\text{mol}^{-1}$", "$1{,}6\\times10^{-19}\\ \\text{mol}^{-1}$", "$9{,}81\\ \\text{mol}^{-1}$"], 0, "$N_A \\approx 6{,}02\\times10^{23}$ entités par mole."),
    num("Quantité de matière (en mol) dans $36$ g d'eau ($M = 18$ g/mol) ?", 2, "$n = \\frac mM = \\frac{36}{18} = 2$ mol.", 1, 0.01, "mol"),
    mcq("La relation entre $n$, $m$ et $M$ est :", ["$n = m \\times M$", "$n = \\frac{m}{M}$", "$n = \\frac{M}{m}$", "$n = m + M$"], 1, "$n$ en mol, $m$ en g, $M$ en g/mol."),
    num("Masse molaire de $\\text{CO}_2$ en g/mol ($M_C = 12$, $M_O = 16$) ?", 44, "$12 + 2\\times16 = 44$ g/mol.", 1, 0.01, "g/mol"),
  ],
  "pc-2-solutions": [
    num("On dissout $5$ g de sucre dans $0{,}25$ L d'eau. Concentration en masse (g/L) ?", 20, "$C_m = \\frac{m}{V} = \\frac{5}{0{,}25} = 20$ g/L.", 1, 0.01, "g/L"),
    mcq("Lors d'une dilution, ce qui se conserve est :", ["le volume", "la concentration", "la masse (ou quantité) de soluté", "la masse de solvant"], 2, "On ajoute du solvant, la quantité de soluté ne change pas : $C_0V_0 = C_1V_1$."),
    num("On dilue 10 fois une solution à $50$ g/L. Nouvelle concentration (g/L) ?", 5, "Facteur de dilution $F = 10$ : $\\frac{50}{10} = 5$ g/L.", 1, 0.01, "g/L"),
    tf("Le solvant est l'espèce chimique présente en plus petite quantité.", false, "C'est l'inverse : le solvant est majoritaire."),
  ],
  "pc-2-mouvement": [
    mcq("Selon le principe d'inertie, un corps soumis à des forces qui se compensent est :", ["forcément immobile", "immobile ou en mouvement rectiligne uniforme", "en mouvement circulaire", "en chute libre"], 1, "Première loi de Newton."),
    num("Un cycliste parcourt $30$ km en $1{,}5$ h. Vitesse moyenne (km/h) ?", 20, "$v = \\frac{d}{t} = \\frac{30}{1{,}5} = 20$ km/h.", 1, 0.01, "km/h"),
    num("Convertis $36$ km/h en m/s.", 10, "On divise par $3{,}6$.", 1, 0.01, "m/s"),
    tf("Le mouvement d'un objet dépend du référentiel choisi.", true, "Un passager est immobile dans le train mais en mouvement par rapport au quai."),
  ],
  "pc-1-avancement": [
    mcq("Le réactif limitant est celui qui :", ["est en excès", "est entièrement consommé en premier", "a la plus grande masse molaire", "ne réagit pas"], 1, "Sa disparition stoppe la transformation."),
    tf("À l'état final d'une transformation totale, l'avancement est maximal.", true, "$x_f = x_{max}$ pour une transformation totale."),
    num("$2\\text{H}_2 + \\text{O}_2 \\to 2\\text{H}_2\\text{O}$ avec 4 mol de $\\text{H}_2$ et 3 mol de $\\text{O}_2$. Avancement maximal (mol) ?", 2, "$4 - 2x = 0 \\Rightarrow x = 2$ ; $3 - x = 0 \\Rightarrow x = 3$. On garde le plus petit : $x_{max} = 2$ mol.", 2, 0.01, "mol"),
    mcq("Dans la réaction précédente, le réactif limitant est :", ["$\\text{H}_2$", "$\\text{O}_2$", "$\\text{H}_2\\text{O}$", "aucun"], 0, "C'est $\\text{H}_2$ qui donne le plus petit $x_{max}$.", 2),
  ],
  "pc-1-energie": [
    mcq("L'énergie cinétique d'un objet de masse $m$ et de vitesse $v$ vaut :", ["$mv$", "$\\frac12 mv^2$", "$mgh$", "$\\frac12 m v$"], 1, "$E_c = \\frac12mv^2$ en joules."),
    num("Énergie cinétique (J) d'une masse de $2$ kg à $3$ m/s ?", 9, "$\\frac12 \\times 2 \\times 3^2 = 9$ J.", 1, 0.01, "J"),
    tf("En l'absence de frottements, l'énergie mécanique se conserve.", true, "$E_m = E_c + E_{pp}$ reste constante."),
    num("Énergie potentielle de pesanteur (J) d'une masse de $1$ kg à $10$ m de haut ($g = 9{,}8$ N/kg) ?", 98, "$E_{pp} = mgh = 1 \\times 9{,}8 \\times 10 = 98$ J.", 1, 0.01, "J"),
  ],
  "pc-t-acides-bases": [
    mcq("Selon Brønsted, un acide est une espèce capable de :", ["capter un proton $\\text{H}^+$", "céder un proton $\\text{H}^+$", "céder un électron", "capter un électron"], 1, "Un acide cède un $\\text{H}^+$, une base le capte."),
    num("pH d'une solution où $[\\text{H}_3\\text{O}^+] = 10^{-3}$ mol/L ?", 3, "$\\text{pH} = -\\log[\\text{H}_3\\text{O}^+] = 3$."),
    tf("Une solution de pH 9 à 25 °C est basique.", true, "À 25 °C : pH > 7 ⇒ basique."),
    mcq("Si $\\text{pH} < \\text{p}K_a$, l'espèce prédominante est :", ["la forme basique", "la forme acide", "les deux en égale quantité", "aucune"], 1, "Diagramme de prédominance : la forme acide domine sous le $\\text{p}K_a$.", 2),
  ],
  "pc-t-newton": [
    mcq("La deuxième loi de Newton s'écrit :", ["$\\sum \\vec F = m\\vec v$", "$\\sum \\vec F = m\\vec a$", "$\\sum \\vec F = \\vec 0$", "$\\vec F = mg$"], 1, "Dans un référentiel galiléen."),
    tf("En chute libre, l'accélération d'un objet ne dépend pas de sa masse.", true, "$m\\vec a = m\\vec g \\Rightarrow \\vec a = \\vec g$."),
    num("Force (N) nécessaire pour donner une accélération de $2$ m/s² à une masse de $5$ kg ?", 10, "$F = ma = 5\\times2 = 10$ N.", 1, 0.01, "N"),
    mcq("Dans un champ de pesanteur uniforme, la trajectoire d'un projectile lancé obliquement est :", ["rectiligne", "circulaire", "parabolique", "hyperbolique"], 2, "Les équations horaires donnent $y$ comme fonction du second degré de $x$.", 2),
  ],
  "pc-t-radioactivite": [
    mcq("La demi-vie $t_{1/2}$ est la durée au bout de laquelle :", ["tous les noyaux ont disparu", "la moitié des noyaux initiaux s'est désintégrée", "l'activité double", "le noyau devient stable"], 1, "$N(t_{1/2}) = \\frac{N_0}{2}$."),
    num("Pourcentage de noyaux restants après 3 demi-vies ?", 12.5, "$\\left(\\frac12\\right)^3 = \\frac18 = 12{,}5\\,\\%$.", 2, 0.01, "%"),
    mcq("La loi de décroissance radioactive s'écrit :", ["$N(t) = N_0 e^{-\\lambda t}$", "$N(t) = N_0 e^{\\lambda t}$", "$N(t) = N_0 - \\lambda t$", "$N(t) = \\lambda N_0 t$"], 0, "Décroissance exponentielle de constante $\\lambda$."),
    tf("La radioactivité d'un noyau dépend de la température.", false, "C'est un phénomène aléatoire, spontané, indépendant des conditions extérieures."),
  ],

  // ═════════════ SVT ═════════════
  "svt-2-cellule": [
    mcq("Quel organite contient l'information génétique chez les eucaryotes ?", ["la mitochondrie", "le noyau", "la membrane", "le chloroplaste"], 1, "L'ADN est principalement dans le noyau."),
    tf("Les bactéries possèdent un noyau délimité par une enveloppe.", false, "Ce sont des procaryotes : pas de noyau."),
    mcq("La photosynthèse se déroule dans :", ["les mitochondries", "les chloroplastes", "le noyau", "les ribosomes"], 1, "Les chloroplastes contiennent la chlorophylle."),
    mcq("La membrane plasmique est principalement constituée :", ["de cellulose", "d'une bicouche de phospholipides et de protéines", "d'ADN", "d'amidon"], 1, "Modèle de la mosaïque fluide."),
  ],
  "svt-2-adn": [
    mcq("Les bases azotées de l'ADN sont :", ["A, U, C, G", "A, T, C, G", "A, T, U, G", "A, B, C, D"], 1, "L'uracile (U) remplace la thymine dans l'ARN."),
    mcq("Dans l'ADN, l'adénine s'associe avec :", ["la cytosine", "la guanine", "la thymine", "l'uracile"], 2, "Complémentarité : A–T et C–G."),
    tf("La molécule d'ADN a la même structure chez tous les êtres vivants.", true, "Universalité de l'ADN : argument d'une parenté commune."),
    mcq("Une mutation est :", ["une modification de la séquence de l'ADN", "un changement de cellule", "forcément une maladie", "une division cellulaire"], 0, "Elle peut être neutre, favorable ou défavorable."),
  ],
  "svt-1-expression": [
    mcq("La transcription produit :", ["une protéine", "un ARN messager", "de l'ADN", "un acide aminé"], 1, "L'ADN est transcrit en ARNm dans le noyau."),
    mcq("Chez les eucaryotes, la traduction se déroule :", ["dans le noyau", "dans le cytoplasme (ribosomes)", "dans la mitochondrie", "dans la membrane"], 1, "L'ARNm sort du noyau et est lu par les ribosomes."),
    num("Combien de nucléotides forment un codon ?", 3, "Un codon = triplet de nucléotides."),
    tf("Le code génétique est redondant : plusieurs codons peuvent coder le même acide aminé.", true, "64 codons pour 20 acides aminés."),
  ],
  "svt-1-immunite": [
    mcq("Les lymphocytes B (plasmocytes) produisent :", ["des anticorps", "des hormones", "des enzymes digestives", "de l'hémoglobine"], 0, "Les plasmocytes sécrètent les anticorps."),
    tf("La réaction inflammatoire fait partie de l'immunité innée.", true, "Rapide, non spécifique."),
    mcq("La vaccination repose sur :", ["la mémoire immunitaire", "la destruction des globules rouges", "les antibiotiques", "l'immunité innée uniquement"], 0, "Elle provoque la formation de cellules mémoire."),
    mcq("Les lymphocytes T CD8 (cytotoxiques) :", ["détruisent les cellules infectées", "produisent des anticorps", "transportent l'oxygène", "fabriquent les plaquettes"], 0, "Ils reconnaissent et éliminent les cellules infectées."),
  ],
  "svt-t-brassage": [
    mcq("La méiose produit :", ["2 cellules diploïdes", "4 cellules haploïdes", "4 cellules diploïdes", "2 cellules haploïdes"], 1, "Deux divisions successives à partir d'une cellule diploïde."),
    mcq("Le brassage interchromosomique a lieu :", ["en anaphase I", "en prophase I", "pendant la fécondation uniquement", "en mitose"], 0, "Séparation aléatoire des chromosomes homologues.", 2),
    mcq("Le crossing-over (brassage intrachromosomique) a lieu en :", ["prophase I", "anaphase II", "télophase II", "interphase"], 0, "Échanges entre chromatides de chromosomes homologues appariés.", 2),
    tf("La sélection naturelle favorise les individus les mieux adaptés à leur milieu.", true, "Ils survivent et se reproduisent davantage."),
  ],
  "svt-t-datation": [
    mcq("Le principe de superposition indique qu'une couche sédimentaire :", ["est plus récente que celle qu'elle recouvre", "est plus ancienne que celle qu'elle recouvre", "a le même âge que toutes les autres", "contient toujours des fossiles"], 0, "Sauf déformation, les couches se déposent les unes sur les autres."),
    tf("Le carbone 14 permet de dater des roches de plusieurs milliards d'années.", false, "Demi-vie ≈ 5 730 ans : utile jusqu'à ~50 000 ans."),
    mcq("Un bon fossile stratigraphique a :", ["une longue durée d'existence et une petite aire", "une courte durée d'existence et une large répartition géographique", "été une plante", "une taille importante"], 1, "Il caractérise précisément une période sur de grandes distances.", 2),
    mcq("La datation absolue utilise :", ["la radioactivité", "la couleur des roches", "la position des fossiles", "la superposition"], 0, "Décroissance radioactive de certains isotopes."),
  ],

  // ═════════════ HISTOIRE-GÉO ═════════════
  "hg-2-antiquite": [
    mcq("Qui dirige Athènes au Ve siècle av. J.-C. et symbolise son « âge d'or » ?", ["Périclès", "Auguste", "César", "Alexandre"], 0, "Périclès, stratège réélu de 443 à 429 av. J.-C."),
    tf("Dans la démocratie athénienne, les femmes étaient citoyennes.", false, "Femmes, esclaves et métèques étaient exclus de la citoyenneté politique."),
    mcq("Auguste devient le premier empereur romain en :", ["27 av. J.-C.", "476", "1492", "509 av. J.-C."], 0, "Début du Principat."),
    mcq("L'édit de Caracalla (212) :", ["accorde la citoyenneté romaine à presque tous les hommes libres de l'Empire", "interdit le christianisme", "fonde Constantinople", "divise l'Empire"], 0, "Extension de la citoyenneté.", 2),
  ],
  "hg-2-renaissance": [
    mcq("Gutenberg met au point l'imprimerie à caractères mobiles vers :", ["1450", "1789", "1200", "1610"], 0, "Vers 1450 à Mayence."),
    mcq("En 1492, Christophe Colomb :", ["atteint l'Amérique", "fait le tour du monde", "atteint l'Inde par l'Afrique", "fonde Québec"], 0, "Il pense avoir atteint les Indes."),
    tf("Martin Luther est à l'origine de la Réforme protestante (1517).", true, "Ses 95 thèses dénoncent notamment les indulgences."),
    mcq("L'humanisme place au centre de sa réflexion :", ["l'Homme et l'étude des textes antiques", "la guerre", "le commerce uniquement", "l'astrologie"], 0, "Érasme, Rabelais, Montaigne..."),
  ],
  "hg-1-revolution": [
    num("En quelle année a lieu la prise de la Bastille ?", 1789, "Le 14 juillet 1789.", 1, 0),
    mcq("La Déclaration des droits de l'homme et du citoyen est adoptée le :", ["26 août 1789", "14 juillet 1790", "21 janvier 1793", "2 décembre 1804"], 0, "Adoptée par l'Assemblée nationale constituante."),
    tf("Napoléon Bonaparte est sacré empereur en 1804.", true, "Le 2 décembre 1804 à Notre-Dame."),
    mcq("La Première République est proclamée en :", ["1789", "1792", "1799", "1815"], 1, "Le 21-22 septembre 1792."),
  ],
  "hg-1-ww1": [
    mcq("La Première Guerre mondiale se déroule de :", ["1914 à 1918", "1939 à 1945", "1870 à 1871", "1912 à 1916"], 0, "Juillet 1914 – novembre 1918."),
    mcq("La bataille de Verdun a lieu en :", ["1914", "1916", "1918", "1917"], 1, "De février à décembre 1916."),
    tf("L'armistice est signé le 11 novembre 1918.", true, "À Rethondes."),
    mcq("Le traité qui met fin à la guerre avec l'Allemagne est le traité de :", ["Versailles", "Rome", "Vienne", "Maastricht"], 0, "Signé le 28 juin 1919."),
  ],
  "hg-t-ww2": [
    mcq("La Seconde Guerre mondiale commence en Europe avec l'invasion de :", ["la France", "la Pologne", "l'URSS", "la Belgique"], 1, "Le 1er septembre 1939."),
    mcq("Le débarquement en Normandie a lieu le :", ["6 juin 1944", "8 mai 1945", "1er septembre 1939", "18 juin 1940"], 0, "Opération Overlord."),
    tf("La Shoah désigne l'extermination des Juifs d'Europe par les nazis.", true, "Près de 6 millions de victimes."),
    mcq("L'appel du 18 juin 1940 est lancé par :", ["Pétain", "de Gaulle", "Jean Moulin", "Churchill"], 1, "Depuis Londres, sur la BBC."),
  ],
  "hg-t-guerre-froide": [
    mcq("Le mur de Berlin est construit en :", ["1945", "1961", "1989", "1991"], 1, "Dans la nuit du 12 au 13 août 1961."),
    num("En quelle année le mur de Berlin tombe-t-il ?", 1989, "Le 9 novembre 1989.", 1, 0),
    mcq("La crise des missiles de Cuba a lieu en :", ["1948", "1962", "1973", "1956"], 1, "Octobre 1962, apogée des tensions."),
    tf("L'URSS disparaît en 1991.", true, "Le 26 décembre 1991."),
  ],

  // ═════════════ FRANÇAIS ═════════════
  "fr-2-figures": [
    mcq("« Cette faucille d'or dans le champ des étoiles » (Hugo) est :", ["une comparaison", "une métaphore", "une hyperbole", "une litote"], 1, "Rapprochement sans outil de comparaison (la lune = une faucille)."),
    mcq("« Je meurs de faim » est :", ["une hyperbole", "un oxymore", "une antithèse", "une anaphore"], 0, "Exagération."),
    mcq("« Cette obscure clarté » (Corneille) est :", ["un oxymore", "une périphrase", "une métonymie", "une allitération"], 0, "Deux termes contradictoires accolés.", 2),
    mcq("« Va, je ne te hais point » (Corneille) est :", ["une litote", "une hyperbole", "une comparaison", "un chiasme"], 0, "Dire moins pour suggérer plus (« je t'aime »).", 2),
    tf("La comparaison utilise obligatoirement un outil de comparaison (comme, tel, pareil à...).", true, "C'est ce qui la distingue de la métaphore."),
  ],
  "fr-2-poesie": [
    num("Combien de syllabes compte un alexandrin ?", 12, "Douze syllabes, souvent coupé à l'hémistiche (6/6)."),
    mcq("Un sonnet est composé de :", ["deux quatrains et deux tercets", "trois quatrains", "quatre tercets", "un nombre libre de strophes"], 0, "14 vers au total."),
    mcq("Des rimes ABAB sont dites :", ["plates", "croisées", "embrassées", "suivies"], 1, "AABB = plates, ABBA = embrassées."),
    tf("Un décasyllabe compte 10 syllabes.", true, "Déca = dix."),
  ],
  "fr-1-mouvements": [
    mcq("Victor Hugo est une figure majeure du :", ["classicisme", "romantisme", "surréalisme", "naturalisme"], 1, "La préface de *Cromwell* (1827) est un manifeste romantique."),
    mcq("Le naturalisme est associé à :", ["Zola", "Racine", "Ronsard", "Breton"], 0, "Cycle des *Rougon-Macquart*."),
    mcq("Le classicisme (XVIIe siècle) valorise :", ["la règle des trois unités au théâtre", "l'écriture automatique", "le vers libre", "le rejet de l'Antiquité"], 0, "Unités de temps, de lieu et d'action."),
    tf("André Breton est le chef de file du surréalisme.", true, "*Manifeste du surréalisme*, 1924."),
  ],

  "fr-1-grammaire": [
    mcq("Dans « Je pense qu'il viendra », la proposition « qu'il viendra » est une subordonnée :", ["relative", "conjonctive complétive", "circonstancielle", "indépendante"], 1, "Introduite par la conjonction « que », elle est COD du verbe « pense »."),
    mcq("Dans « Le livre que tu lis est passionnant », « que tu lis » est une subordonnée :", ["relative", "complétive", "circonstancielle de cause", "interrogative indirecte"], 0, "Introduite par le pronom relatif « que », elle complète l'antécédent « livre »."),
    mcq("« Je me demande s'il pleuvra » contient une subordonnée :", ["interrogative indirecte", "relative", "exclamative", "circonstancielle de condition"], 0, "« Si » introduit ici une interrogation indirecte (« Pleuvra-t-il ? »).", 2),
    tf("Dans « Il ne mange jamais de viande », la négation est partielle.", true, "« Ne… jamais » porte sur le temps : négation partielle. La négation totale est « ne… pas ».", 2),
    mcq("« Bien qu'il soit fatigué, il travaille » : la subordonnée exprime", ["la cause", "la concession", "le but", "la conséquence"], 1, "« Bien que » + subjonctif introduit une concession."),
  ],
  "fr-1-commentaire": [
    mcq("Dans un commentaire, la problématique est :", ["un résumé du texte", "une question qui guide l'analyse et à laquelle les axes répondent", "la biographie de l'auteur", "la liste des figures de style"], 1, "Elle donne un fil directeur : chaque axe y apporte un élément de réponse."),
    tf("Dans un commentaire, chaque procédé relevé doit être relié à son effet de sens.", true, "Relever un procédé sans l'interpréter ne rapporte presque aucun point."),
    mcq("L'introduction d'un commentaire se termine par :", ["une conclusion partielle", "l'annonce du plan", "une citation du texte", "le résumé de l'œuvre"], 1, "Amorce, présentation du texte, problématique, puis annonce du plan."),
  ],

  // ═════════════ PHILOSOPHIE ═════════════
  "philo-t-conscience": [
    mcq("« Je pense, donc je suis » est une formule de :", ["Kant", "Descartes", "Sartre", "Platon"], 1, "*Discours de la méthode* (1637)."),
    mcq("Freud distingue trois instances psychiques :", ["le ça, le moi, le surmoi", "l'âme, le corps, l'esprit", "la raison, la passion, la volonté", "le conscient, le corps, l'autre"], 0, "Seconde topique freudienne."),
    tf("Pour Freud, une grande partie de notre vie psychique échappe à la conscience.", true, "C'est l'hypothèse de l'inconscient."),
    mcq("Le « cogito » désigne :", ["la certitude de sa propre existence en tant que sujet pensant", "une méthode de calcul", "un concept politique", "un sentiment amoureux"], 0, "Première vérité indubitable chez Descartes."),
  ],
  "philo-t-liberte": [
    mcq("« L'homme est condamné à être libre » est de :", ["Sartre", "Spinoza", "Rousseau", "Hobbes"], 0, "*L'existentialisme est un humanisme* (1946)."),
    mcq("Pour Spinoza, les hommes se croient libres parce que :", ["ils sont conscients de leurs actions mais ignorants des causes qui les déterminent", "ils votent", "ils sont rationnels", "Dieu les a créés libres"], 0, "Critique du libre arbitre.", 2),
    tf("Le déterminisme affirme que tout événement a une cause.", true, "Principe de causalité universelle."),
    mcq("Pour Rousseau, « l'obéissance à la loi qu'on s'est prescrite est » :", ["liberté", "servitude", "tyrannie", "hasard"], 0, "*Du contrat social* : la liberté comme autonomie."),
  ],

  // ═════════════ SES ═════════════
  "ses-2-richesses": [
    mcq("La valeur ajoutée se calcule par :", ["chiffre d'affaires − consommations intermédiaires", "chiffre d'affaires + salaires", "profit − impôts", "production − salaires"], 0, "Richesse réellement créée par l'entreprise."),
    mcq("Le PIB mesure :", ["la richesse produite sur un territoire en un an", "le patrimoine des ménages", "les exportations", "la dette publique"], 0, "Somme des valeurs ajoutées (+ impôts sur les produits − subventions)."),
    tf("La production non marchande est fournie gratuitement ou à un prix inférieur à 50 % de son coût de production.", true, "Ex. : enseignement public."),
    num("Une entreprise vend pour 500 000 € et achète pour 200 000 € de consommations intermédiaires. Valeur ajoutée (en €) ?", 300000, "$500\\,000 - 200\\,000 = 300\\,000$ €.", 1, 0.5, "€"),
  ],
  "ses-2-marche": [
    mcq("Quand le prix augmente, en général la quantité demandée :", ["augmente", "diminue", "reste stable", "double"], 1, "La courbe de demande est décroissante."),
    mcq("Le prix d'équilibre correspond à :", ["l'égalité entre offre et demande", "le prix le plus bas", "le prix fixé par l'État", "la moyenne des prix"], 0, "Intersection des courbes d'offre et de demande."),
    tf("Une pénurie apparaît lorsque la demande est supérieure à l'offre au prix pratiqué.", true, "Excès de demande."),
    mcq("En situation d'excédent d'offre, le prix tend à :", ["augmenter", "baisser", "rester fixe", "s'annuler"], 1, "Les vendeurs baissent les prix pour écouler leurs stocks."),
  ],

  // ═════════════ ANGLAIS ═════════════
  "en-2-past": [
    mcq("« I ___ to London last year. »", ["have gone", "went", "go", "am going"], 1, "*Last year* = moment révolu ⇒ past simple."),
    mcq("« She ___ here since 2020. »", ["lives", "lived", "has lived", "is living"], 2, "*Since* + action qui dure jusqu'à maintenant ⇒ present perfect."),
    tf("On utilise le past simple avec un marqueur de temps révolu comme « yesterday ».", true, "Yesterday, last week, in 2010, ago..."),
    mcq("Le participe passé de « write » est :", ["wrote", "written", "writed", "writing"], 1, "write – wrote – written."),
  ],
  "en-1-modals": [
    mcq("« You ___ wear a seatbelt. It's the law. »", ["must", "might", "could", "would"], 0, "Obligation forte."),
    mcq("« It ___ rain later, take an umbrella. »", ["might", "must", "has to", "shall"], 0, "Éventualité."),
    mcq("Pour donner un conseil, on utilise :", ["should", "mustn't", "can't", "needn't"], 0, "*You should revise.*"),
    tf("« Mustn't » exprime une absence d'obligation.", false, "*Mustn't* = interdiction. L'absence d'obligation : *don't have to* / *needn't*.", 2),
  ],
  "en-t-conditionals": [
    mcq("« If I ___ rich, I would travel the world. »", ["am", "were", "will be", "have been"], 1, "Type 2 : If + prétérit, would + BV."),
    mcq("« If she had studied, she ___ the exam. »", ["would pass", "would have passed", "will pass", "passed"], 1, "Type 3 (irréel du passé) : would have + participe passé.", 2),
    mcq("« I wish I ___ more time. » (regret présent)", ["have", "had", "will have", "am having"], 1, "Wish + prétérit pour un souhait sur le présent."),
    tf("Le conditionnel de type 1 (If + présent, will + BV) exprime une situation probable.", true, "*If it rains, I will stay home.*"),
  ],
};

/** Questions d'un chapitre avec identifiants stables. */
export function questionsForChapter(chapterId: string): Question[] {
  const drafts = BANK[chapterId] ?? [];
  return drafts.map((d, i) => ({ ...d, id: `${chapterId}#${i}` }) as Question);
}

export function hasLocalQuestions(chapterId: string): boolean {
  return (BANK[chapterId]?.length ?? 0) > 0;
}

export const LOCAL_QUESTION_COUNT = Object.values(BANK).reduce((n, qs) => n + qs.length, 0);
