/**
 * Fiches de révision — maths, physique-chimie, SVT.
 * Format : « @id-du-chapitre », puis « - » pour l'essentiel et « ! » pour les pièges.
 */
export const SCIENCES = String.raw`
@maths-2-nombres
- Ensembles : $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{D} \subset \mathbb{Q} \subset \mathbb{R}$ ; $\sqrt{2}$ et $\pi$ sont irrationnels.
- Puissances : $a^n \times a^p = a^{n+p}$, $\dfrac{a^n}{a^p} = a^{n-p}$, $(a^n)^p = a^{np}$, $a^{-n} = \dfrac{1}{a^n}$, $a^0 = 1$.
- Racines ($a, b \geq 0$) : $\sqrt{ab} = \sqrt{a}\sqrt{b}$, $\sqrt{\dfrac{a}{b}} = \dfrac{\sqrt a}{\sqrt b}$, $(\sqrt a)^2 = a$.
- Écriture scientifique : $a \times 10^n$ avec $1 \leq a < 10$.
- Un nombre premier a exactement deux diviseurs : 1 et lui-même (2, 3, 5, 7, 11…).
- Valeur absolue : $|x - a|$ est la distance entre $x$ et $a$ ; $|x - a| \leq r \iff x \in [a - r ; a + r]$.
! $\sqrt{a + b} \neq \sqrt a + \sqrt b$ et $(a + b)^2 \neq a^2 + b^2$.

@maths-2-equations
- Identités remarquables : $(a+b)^2 = a^2 + 2ab + b^2$, $(a-b)^2 = a^2 - 2ab + b^2$, $(a+b)(a-b) = a^2 - b^2$.
- Produit nul : $A \times B = 0 \iff A = 0$ ou $B = 0$.
- Inéquation : on change le sens quand on multiplie ou divise par un nombre négatif.
- Signe de $ax + b$ : celui de $a$ à droite de $-\dfrac{b}{a}$, le contraire à gauche.
- Quotient : $\dfrac{A}{B}$ a le signe de $A \times B$ ; valeur interdite quand $B = 0$.
! Ne jamais diviser par une expression qui peut être nulle : factoriser plutôt.

@maths-2-fonctions
- Une fonction associe à chaque $x$ de son ensemble de définition un unique nombre $f(x)$ : l'**image** de $x$.
- Un **antécédent** de $y$ est un $x$ tel que $f(x) = y$ (il peut y en avoir 0, 1 ou plusieurs).
- La courbe $\mathcal{C}_f$ est l'ensemble des points $(x ; f(x))$.
- $f$ croissante sur $I$ : si $a < b$ alors $f(a) \leq f(b)$ ; décroissante : $f(a) \geq f(b)$.
- Résoudre $f(x) = k$ graphiquement : abscisses des points de $\mathcal{C}_f$ d'ordonnée $k$.
- Maximum sur $I$ : $M = f(x_0)$ avec $f(x) \leq M$ pour tout $x$ de $I$.
! L'image se lit sur l'axe des ordonnées, l'antécédent sur l'axe des abscisses.

@maths-2-affines
- $f(x) = mx + p$ : $m$ coefficient directeur, $p$ ordonnée à l'origine ; la courbe est une droite.
- $m = \dfrac{f(b) - f(a)}{b - a}$ (taux d'accroissement constant).
- $m > 0$ : croissante ; $m < 0$ : décroissante ; $m = 0$ : constante.
- $f$ s'annule en $x = -\dfrac{p}{m}$ et a le signe de $m$ à droite de cette valeur.
- Fonction linéaire : $p = 0$ (proportionnalité, droite passant par l'origine).
! Le coefficient directeur se lit en avançant de 1 vers la droite, pas sur l'axe des ordonnées.

@maths-2-reference
- Carré $x^2$ : décroissante sur $]-\infty ; 0]$, croissante sur $[0 ; +\infty[$ ; parabole symétrique par rapport à l'axe des ordonnées.
- Inverse $\dfrac1x$ : définie sur $\mathbb{R}^*$, décroissante sur $]-\infty ; 0[$ et sur $]0 ; +\infty[$ (hyperbole).
- Racine carrée $\sqrt x$ : définie et croissante sur $[0 ; +\infty[$.
- Cube $x^3$ : croissante sur $\mathbb{R}$.
- Si $0 < a < b$ : $a^2 < b^2$, $\sqrt a < \sqrt b$ et $\dfrac1a > \dfrac1b$.
! L'inverse n'est pas décroissante sur $\mathbb{R}^*$ en entier : $-1 < 1$ et $\frac{1}{-1} < \frac11$.

@maths-2-vecteurs
- $\overrightarrow{AB}\,(x_B - x_A ; y_B - y_A)$.
- Milieu de $[AB]$ : $\left(\dfrac{x_A + x_B}{2} ; \dfrac{y_A + y_B}{2}\right)$.
- Distance (repère orthonormé) : $AB = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.
- Relation de Chasles : $\overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AC}$.
- $\vec u(x ; y)$ et $\vec v(x' ; y')$ colinéaires $\iff xy' - x'y = 0$.
- $ABCD$ est un parallélogramme $\iff \overrightarrow{AB} = \overrightarrow{DC}$.
! $\overrightarrow{AB} = -\overrightarrow{BA}$ : l'ordre des points compte.

@maths-2-droites
- Équation réduite : $y = mx + p$ (droite non verticale) ; droite verticale : $x = c$.
- Équation cartésienne : $ax + by + c = 0$, vecteur directeur $\vec u(-b ; a)$.
- Coefficient directeur : $m = \dfrac{y_B - y_A}{x_B - x_A}$.
- Deux droites sont parallèles $\iff$ elles ont le même coefficient directeur.
- Système de deux équations : une solution unique si les droites sont sécantes (substitution ou combinaison).
! Pour $ax + by + c = 0$, le coefficient directeur vaut $-\dfrac{a}{b}$ (si $b \neq 0$).

@maths-2-stats
- Moyenne : $\bar x = \dfrac{n_1x_1 + \dots + n_px_p}{N}$.
- Médiane : partage la série ordonnée en deux moitiés de même effectif.
- $Q_1$ : plus petite valeur telle qu'au moins 25 % des données lui sont inférieures ou égales ; $Q_3$ : 75 %.
- Écart interquartile $Q_3 - Q_1$ ; étendue = max − min.
- Écart-type $\sigma$ : dispersion autour de la moyenne.
- Données en classes : on prend le centre de chaque classe pour estimer la moyenne.
! La médiane résiste aux valeurs extrêmes, la moyenne non.

@maths-2-probas
- Loi équirépartie : $P(A) = \dfrac{\text{issues favorables}}{\text{issues possibles}}$.
- $0 \leq P(A) \leq 1$ ; $P(\overline{A}) = 1 - P(A)$.
- $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.
- Incompatibles ($A \cap B = \emptyset$) : $P(A \cup B) = P(A) + P(B)$.
- Arbre : on multiplie le long d'une branche, on additionne les chemins.
! « Au moins un » : passer par le contraire, « aucun ».

@maths-2-probas-cond
- Fréquence conditionnelle : part de $B$ parmi $A$ = $\dfrac{\text{effectif}(A \cap B)}{\text{effectif}(A)}$.
- $P_A(B) = \dfrac{P(A \cap B)}{P(A)}$, donc $P(A \cap B) = P(A) \times P_A(B)$.
- Arbre pondéré : la somme des branches issues d'un même nœud vaut 1.
- $P(B) = P(A)\,P_A(B) + P(\overline A)\,P_{\overline A}(B)$.
! Ne pas confondre $P_A(B)$ (« parmi A ») et $P(A \cap B)$ (« A et B »).

@maths-2-automatismes
- $t\,\%$ de $x$ : $\dfrac{t}{100} \times x$.
- Hausse de $t\,\%$ : coefficient $1 + \dfrac{t}{100}$ ; baisse : $1 - \dfrac{t}{100}$.
- Évolutions successives : on multiplie les coefficients (+10 % puis −10 % = ×0,99).
- Évolution réciproque d'un coefficient $c$ : $\dfrac{1}{c}$.
- Fractions : $\dfrac ab + \dfrac cd = \dfrac{ad + bc}{bd}$, $\dfrac ab \times \dfrac cd = \dfrac{ac}{bd}$ ; diviser, c'est multiplier par l'inverse.
- Vitesse $v = \dfrac{d}{t}$ ; échelle = distance sur le plan ÷ distance réelle.
! Une hausse de 20 % puis une baisse de 20 % ne ramènent pas au départ.

@maths-1-second-degre
- Forme développée $ax^2 + bx + c$ ($a \neq 0$) ; forme canonique $a(x - \alpha)^2 + \beta$ avec $\alpha = -\dfrac{b}{2a}$ et $\beta = f(\alpha)$.
- Discriminant : $\Delta = b^2 - 4ac$.
- $\Delta > 0$ : deux racines $\dfrac{-b \pm \sqrt\Delta}{2a}$ ; $\Delta = 0$ : une racine $-\dfrac{b}{2a}$ ; $\Delta < 0$ : aucune racine réelle.
- Somme et produit des racines : $x_1 + x_2 = -\dfrac ba$, $x_1x_2 = \dfrac ca$.
- Signe : celui de $a$ à l'extérieur des racines, le contraire entre elles.
- Sommet de la parabole : $S(\alpha ; \beta)$.
! Si $\Delta < 0$, le trinôme a le signe de $a$ partout.

@maths-1-suites
- Arithmétique : $u_{n+1} = u_n + r$, $u_n = u_0 + nr$.
- Géométrique : $u_{n+1} = q\,u_n$, $u_n = u_0\,q^n$.
- $1 + 2 + \dots + n = \dfrac{n(n+1)}{2}$ ; $1 + q + \dots + q^n = \dfrac{1 - q^{n+1}}{1 - q}$ ($q \neq 1$).
- Sens de variation : signe de $u_{n+1} - u_n$ (ou comparer $\dfrac{u_{n+1}}{u_n}$ à 1 si $u_n > 0$).
- Somme de termes arithmétiques : nombre de termes × $\dfrac{\text{premier} + \text{dernier}}{2}$.
! Si la suite commence à $u_1$ : $u_n = u_1 + (n - 1)r$.

@maths-1-derivation
- Nombre dérivé : $f'(a) = \lim\limits_{h \to 0} \dfrac{f(a + h) - f(a)}{h}$.
- Tangente en $a$ : $y = f'(a)(x - a) + f(a)$.
- $(x^n)' = nx^{n-1}$, $\left(\dfrac1x\right)' = -\dfrac{1}{x^2}$, $(\sqrt x)' = \dfrac{1}{2\sqrt x}$.
- $(u + v)' = u' + v'$, $(ku)' = ku'$, $(uv)' = u'v + uv'$, $\left(\dfrac uv\right)' = \dfrac{u'v - uv'}{v^2}$.
- $\big(f(ax + b)\big)' = a\,f'(ax + b)$.
! $(uv)' \neq u'v'$.

@maths-1-variations
- $f' \geq 0$ sur $I$ : $f$ croissante sur $I$ ; $f' \leq 0$ : décroissante.
- Extremum local en $a$ : $f'$ s'annule **en changeant de signe** en $a$.
- Méthode : calculer $f'$, étudier son signe, dresser le tableau de variations.
- Compléter le tableau avec les images des bornes et des extremums.
! $f'(a) = 0$ ne suffit pas : $x^3$ n'a pas d'extremum en 0.

@maths-1-exponentielle
- $\exp$ est l'unique fonction telle que $f' = f$ et $f(0) = 1$ ; on note $e^x$, avec $e \approx 2{,}718$.
- $e^{a+b} = e^a e^b$, $e^{-a} = \dfrac{1}{e^a}$, $e^{a-b} = \dfrac{e^a}{e^b}$, $(e^a)^n = e^{na}$.
- $e^x > 0$ pour tout $x$ ; $\exp$ est strictement croissante.
- $e^a = e^b \iff a = b$ ; $e^a < e^b \iff a < b$.
- $(e^{u})' = u'e^{u}$, en particulier $(e^{kx})' = ke^{kx}$.
! $e^{a+b} \neq e^a + e^b$.

@maths-1-trigo
- Cercle trigonométrique de rayon 1 : le point associé à $x$ a pour coordonnées $(\cos x ; \sin x)$.
- $\pi$ rad $= 180°$ ; longueur d'arc = rayon × angle en radians.
- $\cos^2 x + \sin^2 x = 1$ ; $-1 \leq \cos x \leq 1$ et $-1 \leq \sin x \leq 1$.
- $\cos 0 = 1$, $\cos\frac\pi6 = \frac{\sqrt3}{2}$, $\cos\frac\pi4 = \frac{\sqrt2}{2}$, $\cos\frac\pi3 = \frac12$, $\cos\frac\pi2 = 0$ (le sinus dans l'ordre inverse).
- $\cos(-x) = \cos x$, $\sin(-x) = -\sin x$, $\cos(\pi - x) = -\cos x$, $\sin(\pi - x) = \sin x$.
- Périodicité : $\cos(x + 2\pi) = \cos x$ et $\sin(x + 2\pi) = \sin x$.
! Pour $\sin x$ à partir de $\cos x$ : $\sin^2 x = 1 - \cos^2 x$, puis le signe selon l'intervalle.

@maths-1-produit-scalaire
- $\vec u \cdot \vec v = \|\vec u\|\,\|\vec v\| \cos(\vec u, \vec v)$.
- En repère orthonormé : $\vec u \cdot \vec v = xx' + yy'$.
- $\vec u \cdot \vec v = \dfrac12\left(\|\vec u + \vec v\|^2 - \|\vec u\|^2 - \|\vec v\|^2\right)$.
- $\vec u \perp \vec v \iff \vec u \cdot \vec v = 0$.
- Al-Kashi : $BC^2 = AB^2 + AC^2 - 2\,AB \times AC \cos\widehat{A}$.
- Projection : $\overrightarrow{AB} \cdot \overrightarrow{AC} = \overrightarrow{AB} \cdot \overrightarrow{AH}$ ($H$ projeté de $C$ sur $(AB)$).
! Le produit scalaire est un nombre, pas un vecteur.

@maths-1-probas-cond
- $P_A(B) = \dfrac{P(A \cap B)}{P(A)}$ et $P(A \cap B) = P(A) \times P_A(B)$.
- Probabilités totales : $P(B) = P(A \cap B) + P(\overline A \cap B)$.
- Indépendance : $P(A \cap B) = P(A) \times P(B)$, soit $P_A(B) = P(B)$.
- Inverser un conditionnement : $P_B(A) = \dfrac{P(A \cap B)}{P(B)}$.
! Incompatibles et indépendants, ce n'est pas la même chose.

@maths-1-va
- Loi de $X$ : valeurs $x_i$ et probabilités $p_i$, avec $\sum p_i = 1$.
- Espérance : $E(X) = \sum x_i p_i$ (moyenne à long terme).
- Variance : $V(X) = \sum p_i (x_i - E(X))^2 = E(X^2) - E(X)^2$ ; écart-type $\sigma = \sqrt{V(X)}$.
- $E(aX + b) = aE(X) + b$ et $V(aX + b) = a^2V(X)$.
- Jeu équitable : espérance du gain nulle.
! Le $b$ disparaît dans la variance.

@maths-1-automatismes
- Épreuve anticipée : questions rapides et QCM **sans calculatrice**.
- Pourcentages, évolutions successives et réciproques, proportionnalité, échelles.
- Fractions, puissances de 10, ordres de grandeur, écriture scientifique.
- Lire une courbe ou un tableau de variations, résoudre graphiquement $f(x) = k$.
- Équations et inéquations du premier degré ; développer et factoriser.
- Probabilités simples, tableaux croisés et arbres.
! Vérifier l'ordre de grandeur du résultat avant de répondre.

@maths-t-recurrence
- Récurrence : **initialisation** ($P(n_0)$ vraie), **hérédité** ($P(n) \Rightarrow P(n+1)$), conclusion.
- Toute suite croissante et majorée converge ; décroissante et minorée converge.
- Croissante non majorée : tend vers $+\infty$.
- $q^n \to 0$ si $-1 < q < 1$ ; $q^n \to +\infty$ si $q > 1$.
- Gendarmes : si $v_n \leq u_n \leq w_n$ et $v_n, w_n \to \ell$, alors $u_n \to \ell$.
! Une suite majorée par $M$ ne converge pas forcément vers $M$.

@maths-t-limites
- Asymptote horizontale $y = \ell$ si $\lim\limits_{x \to \pm\infty} f(x) = \ell$ ; verticale $x = a$ si la limite en $a$ est infinie.
- Formes indéterminées : $\infty - \infty$, $0 \times \infty$, $\dfrac\infty\infty$, $\dfrac00$.
- Polynôme ou quotient en $\pm\infty$ : factoriser par le terme de plus haut degré.
- Croissances comparées : $\lim\limits_{x \to +\infty} \dfrac{e^x}{x^n} = +\infty$, $\lim\limits_{x \to +\infty} \dfrac{\ln x}{x} = 0$, $\lim\limits_{x \to -\infty} xe^x = 0$.
- Composée : on enchaîne les limites.
! $\dfrac{1}{0^+} = +\infty$ mais $\dfrac{1}{0^-} = -\infty$ : regarder le signe.

@maths-t-continuite
- Les fonctions dérivables sont continues (polynômes, exp, ln… sur leur domaine).
- TVI : $f$ continue sur $[a ; b]$ et $k$ entre $f(a)$ et $f(b)$ : $f(x) = k$ a au moins une solution.
- Si de plus $f$ est strictement monotone : la solution est **unique**.
- Dichotomie : couper l'intervalle en deux et garder la moitié où le signe change.
- Si $u_{n+1} = f(u_n)$ converge vers $\ell$ et $f$ est continue : $f(\ell) = \ell$.
! Sans continuité, le TVI ne s'applique pas.

@maths-t-convexite
- Composée : $(g \circ u)' = u' \times (g' \circ u)$ ; ex. $(\sqrt u)' = \dfrac{u'}{2\sqrt u}$, $(u^n)' = nu'u^{n-1}$.
- $f$ convexe $\iff f'$ croissante $\iff f'' \geq 0$ : courbe au-dessus de ses tangentes.
- Concave $\iff f'' \leq 0$ : courbe en dessous de ses tangentes.
- Point d'inflexion : $f''$ s'annule en changeant de signe (la courbe traverse sa tangente).
- $e^x$ et $x^2$ sont convexes ; $\ln x$ et $\sqrt x$ sont concaves.
! La convexité se lit sur le signe de $f''$, pas de $f'$.

@maths-t-ln
- $\ln$ est la réciproque de $\exp$ : $e^{\ln x} = x$ ($x > 0$) et $\ln(e^x) = x$.
- $\ln(ab) = \ln a + \ln b$, $\ln\dfrac ab = \ln a - \ln b$, $\ln a^n = n\ln a$, $\ln\sqrt a = \dfrac12\ln a$.
- $\ln 1 = 0$, $\ln e = 1$ ; $\ln x < 0$ sur $]0 ; 1[$.
- $(\ln x)' = \dfrac1x$ ; $(\ln u)' = \dfrac{u'}{u}$.
- $\lim\limits_{x \to 0^+} \ln x = -\infty$ et $\lim\limits_{x \to +\infty} \ln x = +\infty$.
- $e^x = k$ ($k > 0$) $\iff x = \ln k$.
! $\ln(a + b) \neq \ln a + \ln b$ ; $\ln$ n'est définie que sur $]0 ; +\infty[$.

@maths-t-primitives
- $F$ est une primitive de $f$ si $F' = f$ ; deux primitives diffèrent d'une constante.
- $x^n \to \dfrac{x^{n+1}}{n+1}$, $\dfrac1x \to \ln x$, $e^x \to e^x$, $\dfrac{1}{x^2} \to -\dfrac1x$.
- $u'e^u \to e^u$, $\dfrac{u'}{u} \to \ln u$ ($u > 0$), $u'u^n \to \dfrac{u^{n+1}}{n+1}$.
- $y' = ay$ : solutions $y = Ce^{ax}$.
- $y' = ay + b$ ($a \neq 0$) : $y = Ce^{ax} - \dfrac ba$.
! La constante $C$ se fixe avec la condition initiale.

@maths-t-integrale
- $f$ continue et positive : $\int_a^b f(x)\,dx$ est l'aire sous la courbe (en unités d'aire).
- $\int_a^b f(x)\,dx = F(b) - F(a)$, où $F$ est une primitive de $f$.
- Linéarité ; Chasles : $\int_a^b f + \int_b^c f = \int_a^c f$.
- Positivité : $f \geq 0$ sur $[a ; b]$ donne $\int_a^b f \geq 0$.
- Valeur moyenne : $\mu = \dfrac{1}{b - a}\int_a^b f(x)\,dx$.
- Aire entre deux courbes ($f \geq g$) : $\int_a^b (f - g)$.
! Si $f$ est négative, l'intégrale vaut l'opposé de l'aire.

@maths-t-binomiale
- Épreuve de Bernoulli : deux issues, succès de probabilité $p$.
- $X \sim \mathcal{B}(n ; p)$ compte les succès de $n$ épreuves identiques et indépendantes.
- $P(X = k) = \dbinom nk p^k (1 - p)^{n - k}$.
- $E(X) = np$, $V(X) = np(1 - p)$, $\sigma = \sqrt{np(1 - p)}$.
- $\dbinom nk$ : nombre de chemins à $k$ succès dans l'arbre ; $\dbinom n0 = \dbinom nn = 1$.
! « Au moins un succès » : $1 - (1 - p)^n$.

@maths-t-denombrement
- Principe multiplicatif : $n_1 \times n_2 \times \dots$ pour des choix successifs.
- Listes avec répétition de $k$ éléments parmi $n$ : $n^k$.
- Arrangements (ordre, sans répétition) : $\dfrac{n!}{(n - k)!}$ ; permutations : $n!$.
- Combinaisons (sans ordre) : $\dbinom nk = \dfrac{n!}{k!(n - k)!}$.
- $\dbinom nk = \dbinom n{n-k}$ ; Pascal : $\dbinom nk + \dbinom n{k+1} = \dbinom{n+1}{k+1}$.
- Nombre de parties d'un ensemble à $n$ éléments : $2^n$.
! L'ordre compte : arrangement ; il ne compte pas : combinaison.

@maths-t-espace
- Droite : un point $A$ et un vecteur directeur $\vec u(a ; b ; c)$ ; représentation paramétrique $x = x_A + ta$, $y = y_A + tb$, $z = z_A + tc$.
- Plan : un point et deux vecteurs non colinéaires, ou une équation $ax + by + cz + d = 0$ avec $\vec n(a ; b ; c)$ normal.
- $\vec u \cdot \vec v = xx' + yy' + zz'$ ; orthogonaux si ce produit est nul.
- $AB = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$.
- Une droite est orthogonale à un plan si son vecteur directeur est colinéaire à $\vec n$.
! Deux droites non parallèles de l'espace ne sont pas forcément sécantes.

@pc-2-atome
- Atome $_{Z}^{A}\mathrm{X}$ : $Z$ protons, $A$ nucléons, $N = A - Z$ neutrons et $Z$ électrons s'il est neutre.
- Le noyau concentre presque toute la masse ; l'atome est surtout du vide (rayon environ 100 000 fois celui du noyau).
- Isotopes : même $Z$, $A$ différents.
- Configuration électronique : $1s^2\,2s^2\,2p^6\,3s^2\,3p^6$… ; électrons de valence = dernière couche.
- Ions : perte (cation) ou gain (anion) d'électrons pour atteindre la structure du gaz noble le plus proche.
- Charge élémentaire : $e = 1{,}6 \times 10^{-19}$ C.
! L'élément chimique est défini par $Z$, pas par $A$.

@pc-2-mole
- Une mole contient $N_A = 6{,}02 \times 10^{23}$ entités.
- $n = \dfrac{N}{N_A}$ et $n = \dfrac mM$ ($M$ en g/mol).
- Masse molaire moléculaire = somme des masses molaires atomiques (ex. $M(\mathrm{H_2O}) = 18$ g/mol).
- Masse d'une entité : $\dfrac{M}{N_A}$.
! Grammes avec g/mol : convertir les kilogrammes.

@pc-2-solutions
- Solution = solvant + soluté(s) ; aqueuse si le solvant est l'eau.
- Concentration en masse : $C_m = \dfrac{m}{V}$ (g/L).
- Concentration en quantité de matière : $C = \dfrac nV$ (mol/L) ; $C_m = C \times M$.
- Dilution : $C_0V_0 = C_1V_1$ ; facteur $F = \dfrac{C_0}{C_1} = \dfrac{V_1}{V_0}$.
- Dissolution : peser le soluté, fiole jaugée, compléter au trait de jauge.
! $C_m$ (masse de soluté par litre) ≠ masse volumique de la solution.

@pc-2-transformations
- Physique : changement d'état (fusion, solidification, vaporisation, liquéfaction, sublimation, condensation), les espèces ne changent pas.
- Chimique : réactifs → produits ; équation ajustée (conservation des éléments et des charges).
- Nucléaire : les noyaux changent (fission, fusion) ; conservation de $A$ et de $Z$.
- Énergie de changement d'état : $Q = m \times L$.
- Réactif limitant : entièrement consommé le premier.
! Endothermique : absorbe de l'énergie ; exothermique : en libère.

@pc-2-mouvement
- Le mouvement dépend du référentiel (terrestre, géocentrique, héliocentrique).
- Vitesse moyenne $v = \dfrac dt$ ; 1 m/s = 3,6 km/h.
- Poids $P = mg$ ($g \approx 9{,}8$ N/kg sur Terre) ; gravitation $F = G\dfrac{m_Am_B}{d^2}$.
- Principe d'inertie : forces qui se compensent $\iff$ mouvement rectiligne uniforme (ou repos).
- 3e loi : $\vec F_{A/B} = -\vec F_{B/A}$.
! Masse (kg) et poids (N) sont deux grandeurs différentes.

@pc-2-ondes
- Période $T$ (s), fréquence $f = \dfrac1T$ (Hz).
- Son : onde mécanique, $v \approx 340$ m/s dans l'air, pas de propagation dans le vide ; audible de 20 Hz à 20 kHz.
- Hauteur liée à la fréquence, timbre à la forme du signal ; niveau sonore en dB.
- Lumière : $c = 3{,}0 \times 10^8$ m/s dans le vide ; visible de 400 à 800 nm.
- Réfraction : $n_1 \sin i_1 = n_2 \sin i_2$ ; réflexion : $i = r$.
- Spectre continu (corps chaud) ou de raies (gaz, signature des éléments).
! Les angles se mesurent par rapport à la normale.

@pc-2-electricite
- Loi des nœuds : somme des intensités entrantes = somme des sortantes.
- Loi des mailles : en série, les tensions s'ajoutent.
- Loi d'Ohm : $U = RI$ ; en série $R_{eq} = R_1 + R_2$.
- Ampèremètre en série, voltmètre en dérivation.
- Capteur : convertit une grandeur physique en grandeur électrique.
! En dérivation, la tension est la même ; ce sont les intensités qui se partagent.

@pc-1-avancement
- Tableau d'avancement : état initial, intermédiaire ($x$), final ($x_f$).
- Pour $a\mathrm{A} + b\mathrm{B} \to \dots$ : il reste $n_A - ax$ et $n_B - bx$.
- $x_{max}$ = plus petite des valeurs $\dfrac{n_A}{a}$ et $\dfrac{n_B}{b}$ : on trouve ainsi le réactif limitant.
- Mélange stœchiométrique : $\dfrac{n_A}{a} = \dfrac{n_B}{b}$.
- Transformation totale : $x_f = x_{max}$.
! Tenir compte des coefficients avant de comparer les quantités.

@pc-1-redox
- Oxydant : capte des électrons ; réducteur : en cède.
- Couple : $\mathrm{Ox} + n\,e^- = \mathrm{Red}$.
- Oxydation = perte d'électrons ; réduction = gain.
- Bilan : combiner deux demi-équations pour que les électrons s'éliminent.
- Exemple : $\mathrm{Cu^{2+}} + \mathrm{Zn} \to \mathrm{Cu} + \mathrm{Zn^{2+}}$.
! L'oxydant subit une réduction, le réducteur une oxydation.

@pc-1-lewis
- Lewis : doublets liants et non liants ; règle du duet (H) et de l'octet.
- Liaisons : H en forme 1, O 2, N 3, C 4.
- Géométrie : $\mathrm{CH_4}$ tétraédrique, $\mathrm{NH_3}$ pyramidale, $\mathrm{H_2O}$ coudée, $\mathrm{CO_2}$ linéaire.
- Électronégativité : un atome plus électronégatif attire les électrons de la liaison (liaison polarisée).
- Molécule polaire si les charges partielles ne se compensent pas ; « qui se ressemble s'assemble » pour la solubilité.
! $\mathrm{CO_2}$ a des liaisons polarisées mais la molécule est apolaire.

@pc-1-energie
- Énergie cinétique : $E_c = \dfrac12 mv^2$.
- Énergie potentielle de pesanteur : $E_{pp} = mgz$.
- Énergie mécanique : $E_m = E_c + E_{pp}$, constante sans frottements.
- Travail d'une force constante : $W = F \times AB \times \cos\alpha$.
- Théorème de l'énergie cinétique : $\Delta E_c = \sum W(\vec F)$.
! $v$ en m/s et $m$ en kg pour obtenir des joules.

@pc-1-ondes
- Onde mécanique progressive : propagation d'une perturbation sans transport de matière.
- Célérité $v = \dfrac dt$ ; retard $\tau = \dfrac dv$.
- Onde périodique : période $T$ et longueur d'onde $\lambda$.
- $\lambda = vT = \dfrac vf$.
! D'un milieu à l'autre, la fréquence reste la même ; la célérité et $\lambda$ changent.

@pc-1-lentilles
- Lentille convergente : foyers $F$ et $F'$, distance focale $f' = \overline{OF'}$, vergence $C = \dfrac{1}{f'}$ (dioptries, $f'$ en m).
- Conjugaison : $\dfrac{1}{\overline{OA'}} - \dfrac{1}{\overline{OA}} = \dfrac{1}{f'}$.
- Grandissement : $\gamma = \dfrac{\overline{A'B'}}{\overline{AB}} = \dfrac{\overline{OA'}}{\overline{OA}}$.
- $\gamma < 0$ : image renversée ; $|\gamma| > 1$ : image agrandie.
- Œil : cristallin (lentille), rétine (écran), accommodation.
! Distances algébriques : un objet réel a $\overline{OA} < 0$.

@pc-1-organique
- Squelette carboné + groupe caractéristique = famille.
- Hydroxyle $-\mathrm{OH}$ : alcool (-ol) ; carbonyle : aldéhyde (-al) en bout de chaîne, cétone (-one) au milieu.
- Carboxyle $-\mathrm{COOH}$ : acide carboxylique ; ester ; amine.
- Préfixes : méth (1 C), éth (2), prop (3), but (4), pent (5), hex (6).
- Formules brute, semi-développée, topologique.
! Le groupe $-\mathrm{OH}$ d'un alcool n'est pas un ion hydroxyde.

@pc-1-spectro
- Couleur perçue = couleur complémentaire de la couleur absorbée.
- Absorbance $A = \varepsilon \ell C$ ; loi de Beer-Lambert : $A = kC$.
- Dosage par étalonnage : tracer $A = f(C)$ avec des solutions étalons, puis lire la concentration.
- Mesures à $\lambda_{max}$, la longueur d'onde d'absorption maximale.
! Beer-Lambert n'est valable que pour des solutions diluées.

@pc-1-photon
- La lumière est à la fois onde et particule (photon).
- Énergie d'un photon : $E = h\nu = \dfrac{hc}{\lambda}$, avec $h = 6{,}63 \times 10^{-34}$ J·s.
- 1 eV = $1{,}6 \times 10^{-19}$ J ; $hc \approx 1240$ eV·nm.
- Niveaux d'énergie quantifiés : émission ou absorption d'un photon d'énergie $\Delta E$.
- Plus $\lambda$ est petite, plus le photon est énergétique (UV > visible > IR).
! $\lambda$ en mètres dans $E = \dfrac{hc}{\lambda}$ (en joules).

@pc-1-fluides
- Pression $P = \dfrac FS$ (Pa) ; 1 bar = $10^5$ Pa.
- Loi de Mariotte (température constante) : $PV$ = constante.
- Statique des fluides : $P_B - P_A = \rho g (z_A - z_B)$ ; la pression augmente avec la profondeur.
- Dans l'eau : environ +1 bar tous les 10 m.
- Gaz parfait : $PV = nRT$ ($T$ en kelvins).
! $T(\text{K}) = T(°\text{C}) + 273$.

@pc-t-acides-bases
- Acide : cède un proton $\mathrm{H^+}$ ; base : en capte un.
- $\mathrm{pH} = -\log[\mathrm{H_3O^+}]$ et $[\mathrm{H_3O^+}] = 10^{-\mathrm{pH}}$.
- À 25 °C : pH < 7 acide, 7 neutre, > 7 basique ; $K_e = 10^{-14}$.
- $\mathrm{pH} = \mathrm{p}K_a + \log\dfrac{[\mathrm{A^-}]}{[\mathrm{AH}]}$ ; à la demi-équivalence, $\mathrm{pH} = \mathrm{p}K_a$.
- Titrage : à l'équivalence, $C_aV_a = C_bV_E$ (réaction mole à mole).
- AH prédomine si pH < pKa, A⁻ si pH > pKa.
! Diluer 10 fois un acide fort augmente son pH d'une unité.

@pc-t-cinetique
- Vitesse de disparition $v = -\dfrac{d[\mathrm{R}]}{dt}$ ; d'apparition $v = \dfrac{d[\mathrm{P}]}{dt}$.
- Facteurs cinétiques : température, concentrations, catalyseur, surface de contact.
- Temps de demi-réaction $t_{1/2}$ : $x(t_{1/2}) = \dfrac{x_f}{2}$.
- Ordre 1 : $v = k[\mathrm{R}]$, $[\mathrm{R}] = [\mathrm{R}]_0e^{-kt}$.
- Catalyseur : accélère la réaction sans être consommé.
! La vitesse instantanée est la pente de la tangente à la courbe.

@pc-t-newton
- 2e loi : $\sum \vec F = m\vec a$ (référentiel galiléen).
- Chute libre : seul le poids agit, $\vec a = \vec g$.
- Projectile : $x(t) = v_0\cos\alpha\,t$ et $z(t) = -\dfrac12gt^2 + v_0\sin\alpha\,t + z_0$.
- Champ électrique uniforme : $\vec F = q\vec E$, $E = \dfrac Ud$.
- Mouvement circulaire uniforme : $a = \dfrac{v^2}{R}$, vers le centre ; lois de Kepler pour les satellites.
! En chute libre, l'accélération ne dépend pas de la masse.

@pc-t-ondes
- Diffraction par une fente de largeur $a$ : $\theta = \dfrac{\lambda}{a}$ (marquée si $a$ est proche de $\lambda$).
- Interférences : constructives si $\delta = k\lambda$, destructives si $\delta = \left(k + \frac12\right)\lambda$.
- Fentes d'Young : interfrange $i = \dfrac{\lambda D}{b}$.
- Effet Doppler : fréquence perçue plus élevée quand la source s'approche, plus basse quand elle s'éloigne.
! Plus la fente est étroite, plus la tache centrale est large.

@pc-t-thermo
- Premier principe : $\Delta U = W + Q$.
- Corps condensé : $\Delta U = mc\Delta T$ (eau : $c = 4{,}18$ kJ·kg⁻¹·K⁻¹).
- Transferts thermiques : conduction, convection, rayonnement, toujours du chaud vers le froid.
- Flux $\Phi = \dfrac{Q}{\Delta t}$ ; résistance thermique $R_{th} = \dfrac{\Delta T}{\Phi}$.
- Loi de Newton : refroidissement exponentiel vers la température extérieure.
! $Q > 0$ : le système reçoit de l'énergie.

@pc-t-rc
- Condensateur : $q = Cu_C$ et $i = C\dfrac{du_C}{dt}$.
- Constante de temps : $\tau = RC$.
- Charge : $u_C(t) = E(1 - e^{-t/\tau})$ ; 63 % de $E$ à $t = \tau$, quasi chargé à $5\tau$.
- Décharge : $u_C(t) = E\,e^{-t/\tau}$.
- Énergie stockée : $\dfrac12Cu^2$.
! Convertir µF ($10^{-6}$ F) et kΩ ($10^3$ Ω) avant de calculer $\tau$.

@pc-t-radioactivite
- Désintégrations α (noyau d'hélium), β⁻ (électron), β⁺ (positon), émission γ.
- Conservation du nombre de nucléons $A$ et du nombre de charge $Z$.
- Décroissance : $N(t) = N_0e^{-\lambda t}$.
- Demi-vie $t_{1/2} = \dfrac{\ln 2}{\lambda}$ ; après $n$ demi-vies il reste $\dfrac{N_0}{2^n}$.
- Activité $A = \lambda N$ (Bq) ; carbone 14 : $t_{1/2} \approx 5\,730$ ans.
! La loi est statistique : on ne peut pas prévoir la désintégration d'un noyau donné.

@pc-t-equilibre
- Quotient de réaction $Q_r = \dfrac{[\mathrm{C}]^c[\mathrm{D}]^d}{[\mathrm{A}]^a[\mathrm{B}]^b}$ (sans solides ni solvant).
- À l'équilibre : $Q_{r,eq} = K$.
- $Q_r < K$ : évolution dans le sens direct ; $Q_r > K$ : sens inverse.
- Pile : oxydation à l'anode (−), réduction à la cathode (+) ; les électrons vont de l'anode à la cathode.
- Charge débitée : $Q = It = n(e^-)\,F$, avec $F \approx 96\,500$ C/mol.
! Une pile usée est une pile à l'équilibre.

@svt-2-cellule
- La cellule est l'unité structurale et fonctionnelle du vivant.
- Membrane plasmique (bicouche de phospholipides) : limite la cellule et contrôle les échanges.
- Eucaryotes : noyau et organites (mitochondries ; chloroplastes chez les végétaux) ; procaryotes (bactéries) : pas de noyau.
- Cellule végétale : paroi, grande vacuole, chloroplastes.
- Taille : de l'ordre de 10 à 100 µm, observation au microscope.
! Les virus ne sont pas des cellules.

@svt-2-adn
- ADN : double hélice de nucléotides (A, T, C, G) ; complémentarité A–T et C–G.
- Un gène est une portion d'ADN ; ses versions sont des allèles.
- Le code génétique est universel : argument d'une origine commune du vivant.
- Les mutations modifient la séquence et créent de la diversité.
- Biodiversité : écosystèmes, espèces, gènes ; elle évolue par sélection naturelle et dérive génétique.
! Dans l'ADN, A s'apparie avec T (l'uracile n'existe que dans l'ARN).

@svt-2-metabolisme
- Métabolisme : ensemble des réactions chimiques d'une cellule, catalysées par des enzymes.
- Photosynthèse (chloroplastes, lumière) : $6\,\mathrm{CO_2} + 6\,\mathrm{H_2O} \to \mathrm{C_6H_{12}O_6} + 6\,\mathrm{O_2}$.
- Respiration (mitochondries) : glucose + O₂ → CO₂ + H₂O, beaucoup d'ATP.
- Fermentation : sans O₂, peu d'ATP.
- Autotrophes (produisent leur matière organique) et hétérotrophes.
- Enzyme : spécifique de son substrat, efficace à température et pH optimaux.
! Les plantes respirent aussi, jour et nuit.

@svt-2-sols
- Le sol se forme en siècles par altération de la roche mère et décomposition de la matière organique (humus).
- Horizons : couches du sol ; complexe argilo-humique : retient les ions nutritifs.
- Agrosystème : les récoltes exportent de la matière, compensée par des intrants (engrais).
- Menaces : érosion, tassement, pollution, eutrophisation.
- Agroécologie : rotations, couverts végétaux, légumineuses, lutte biologique.
! Un sol détruit ne se reconstitue pas à l'échelle d'une vie humaine.

@svt-2-procreation
- Testicules : spermatozoïdes et testostérone ; ovaires : ovocytes, œstrogènes et progestérone.
- Hypothalamus (GnRH) → hypophyse (FSH, LH) → gonades, avec rétrocontrôle.
- Cycle féminin d'environ 28 jours ; ovulation vers le 14e jour.
- Pilule : bloque l'ovulation ; préservatif : seule contraception qui protège des IST.
- Sexe génétique XX / XY (gène SRY sur le Y).
! Sexualité et procréation sont distinctes : plaisir, consentement, respect.

@svt-2-paysages
- Altération (transformation des roches), érosion (enlèvement), transport, sédimentation (dépôt).
- L'eau est le principal agent d'érosion, avec le vent, la glace et le gel.
- Roches sédimentaires (calcaire, grès, argile) ; roches magmatiques (granite, basalte).
- Le granite s'altère en arène ; le calcaire est dissous par l'eau (karst).
- Vallée en V : rivière ; vallée en U : glacier.
! Le calcaire fait effervescence avec l'acide, pas le granite.

@svt-2-microorganismes
- Bactéries, levures, virus… beaucoup sont utiles (microbiote, fermentations).
- Microbiote intestinal : participe à la digestion et protège des pathogènes.
- Transmission : contact, air, eau, aliments, vecteurs (moustiques, tiques).
- Antibiotiques : efficaces contre les bactéries seulement ; leur abus crée l'antibiorésistance.
- Prévention : hygiène, vaccination, préservatif.
! Un antibiotique ne soigne pas un rhume (virus).

@svt-1-replication
- Cycle cellulaire : interphase (G1, S, G2) puis mitose.
- Réplication (phase S) semi-conservative : chaque nouvelle molécule garde un brin parental.
- Mitose : prophase, métaphase, anaphase, télophase ; deux cellules filles identiques.
- Mutations : erreurs de réplication non réparées, favorisées par des agents mutagènes (UV, tabac).
- Seules les mutations des cellules germinales sont transmises aux descendants.
! Après la phase S, chaque chromosome a deux chromatides.

@svt-1-expression
- Transcription (noyau) : ADN → ARN messager ; l'uracile remplace la thymine.
- Traduction (ribosomes, cytoplasme) : ARNm → protéine.
- Code génétique : un codon (3 nucléotides) = un acide aminé ; AUG initiateur, trois codons stop.
- Code redondant et universel.
- Le phénotype dépend des protéines et de l'environnement.
! Nombre d'acides aminés = nucléotides codants ÷ 3, moins 1 si le codon stop est compté.

@svt-1-tectonique
- Croûte, manteau, noyau ; lithosphère rigide sur l'asthénosphère ductile.
- Discontinuités : Moho (croûte/manteau), Gutenberg (manteau/noyau).
- Dorsale : divergence, création de lithosphère océanique, plus vieille en s'éloignant.
- Subduction : plongée de la lithosphère océanique (fosses, volcanisme explosif) ; collision : montagnes.
- Arguments : anomalies magnétiques, séismes et volcans aux limites de plaques, dérive des continents (Wegener).
! La lithosphère comprend la croûte et le manteau supérieur rigide.

@svt-1-ecosystemes
- Écosystème = biotope (milieu) + biocénose (êtres vivants).
- Interactions : compétition, prédation, parasitisme, symbiose, mutualisme.
- Réseau trophique : producteurs, consommateurs, décomposeurs.
- Services écosystémiques : pollinisation, épuration de l'eau, stockage du carbone…
- Pressions humaines : fragmentation, pollution, espèces invasives.
! L'énergie diminue d'un niveau trophique au suivant.

@svt-1-immunite
- Immunité innée : immédiate, non spécifique (inflammation, phagocytose).
- Immunité adaptative : lymphocytes B (anticorps) et T (cytotoxiques, auxiliaires CD4).
- Sélection clonale, amplification, différenciation, mémoire.
- Vaccin : antigène inoffensif, réponse secondaire plus rapide et plus forte.
- VIH : détruit les LT CD4 et provoque le sida.
! Les anticorps neutralisent l'antigène ; la destruction se fait par phagocytose.

@svt-1-genetique-sante
- Allèles dominants et récessifs ; génotype → phénotype.
- Mucoviscidose : maladie génétique récessive (gène CFTR).
- Cancer : accumulation de mutations dans une lignée cellulaire ; facteurs : tabac, UV, alcool.
- Antibiorésistance : sélection des bactéries résistantes.
- Thérapie génique, médecine personnalisée.
! Une mutation somatique ne se transmet pas aux enfants.

@svt-t-brassage
- Méiose : deux divisions, quatre cellules haploïdes ($n$ chromosomes).
- Brassage interchromosomique (anaphase I) et intrachromosomique (crossing-over, prophase I).
- Fécondation : rencontre aléatoire des gamètes, retour à $2n$.
- Évolution : mutations, sélection naturelle, dérive génétique (hasard, petites populations).
- Spéciation : isolement reproducteur.
! Le crossing-over a lieu entre chromosomes homologues.

@svt-t-datation
- Datation relative : superposition, recoupement, inclusion, continuité, fossiles stratigraphiques.
- Datation absolue : $N = N_0e^{-\lambda t}$.
- Carbone 14 pour la matière organique (jusqu'à ~50 000 ans) ; potassium-argon ou rubidium-strontium pour les roches.
- Crises biologiques : Permien-Trias, Crétacé-Paléogène (−66 Ma).
- La Terre a environ 4,57 milliards d'années.
! Ce qui recoupe une couche est plus récent qu'elle.

@svt-t-climat
- Effet de serre : CO₂, CH₄, vapeur d'eau absorbent l'infrarouge émis par la Terre.
- Cycle du carbone : atmosphère, océans, biomasse, roches.
- Réchauffement actuel causé par les émissions humaines (GIEC).
- Paléoclimats : carottes de glace (δ¹⁸O, bulles d'air), pollens, sédiments.
- Variations naturelles : paramètres orbitaux (Milankovitch), albédo.
! L'effet de serre est naturel et vital ; c'est son renforcement qui pose problème.

@svt-t-nerveux
- Réflexe myotatique : fuseau neuromusculaire → neurone sensitif → moelle épinière → motoneurone → muscle.
- Message nerveux codé en fréquence de potentiels d'action.
- Synapse chimique : neurotransmetteur (acétylcholine à la jonction neuromusculaire).
- Motricité volontaire : cortex moteur ; plasticité cérébrale.
- Vitesse de conduction $v = \dfrac dt$.
! Un stimulus plus fort augmente la fréquence des potentiels d'action, pas leur amplitude.

@svt-t-plantes
- Vie fixée : grandes surfaces d'échange (feuilles, racines).
- Sève brute (xylème : eau, ions) et sève élaborée (phloème : sucres).
- Reproduction : fleur, pollinisation (souvent par les insectes), graine, fruit.
- Reproduction asexuée : bouturage, stolons.
- Domestication : sélection de caractères (maïs issu de la téosinte).
! Le fruit vient de l'ovaire, la graine de l'ovule.

@svt-t-muscle
- Contraction : glissement de l'actine et de la myosine, consomme de l'ATP.
- ATP régénéré par la respiration (mitochondries) ou la fermentation.
- Respiration : environ 36 ATP par glucose ; fermentation lactique : 2 ATP.
- Les ions Ca²⁺ déclenchent la contraction.
- L'entraînement augmente le nombre de mitochondries.
! Sans ATP, le muscle reste contracté (rigidité cadavérique).

@svt-t-stress
- Stress : réponse de l'organisme à une agression.
- Réponse rapide : adrénaline (médullosurrénales), hausse du rythme cardiaque et de la glycémie.
- Réponse lente : hypothalamus (CRH) → hypophyse (ACTH) → corticosurrénales (cortisol).
- Rétrocontrôle négatif du cortisol.
- Stress chronique : effets délétères ; sommeil, activité physique, anxiolytiques.
! Le cortisol libère du glucose et freine l'immunité.
`;
