/**
 * Fiches de révision — mathématiques.
 * Chaque formule est suivie de son explication en clair (« > ») et d'exemples corrigés (« ? » / « = »).
 */
export const MATHS = String.raw`
@maths-2-nombres
- Ensembles de nombres : $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{D} \subset \mathbb{Q} \subset \mathbb{R}$.
> $\mathbb{N}$ : entiers positifs (0, 1, 2…) ; $\mathbb{Z}$ : entiers relatifs (… −2, −1, 0, 1…) ; $\mathbb{D}$ : décimaux (nombre fini de chiffres après la virgule, ex. 3,25) ; $\mathbb{Q}$ : fractions $\frac ab$ (ex. $\frac13$) ; $\mathbb{R}$ : tous les nombres de la droite, y compris $\sqrt2$ et $\pi$ qui ne sont pas des fractions. Le symbole $\subset$ veut dire « est contenu dans ».
- Puissances : $a^n \times a^p = a^{n+p}$, $\dfrac{a^n}{a^p} = a^{n-p}$, $(a^n)^p = a^{np}$.
> $a^n$ veut dire « $a$ multiplié $n$ fois par lui-même ». Multiplier, c'est mettre les facteurs bout à bout : on **additionne** les exposants ($2^3 \times 2^2 = 2^5 = 32$). Diviser en retire : on **soustrait** ($\frac{2^5}{2^2} = 2^3$). Puissance de puissance : on **multiplie** ($(2^3)^2 = 2^6$).
- Exposants nuls et négatifs : $a^0 = 1$ et $a^{-n} = \dfrac{1}{a^n}$.
> Un exposant négatif ne rend pas le nombre négatif : il le « passe au dénominateur ». $10^{-3} = \frac{1}{1000} = 0{,}001$ et $2^{-1} = \frac12$.
- Racines carrées ($a, b \geq 0$) : $\sqrt{ab} = \sqrt{a}\,\sqrt{b}$, $\sqrt{\dfrac{a}{b}} = \dfrac{\sqrt a}{\sqrt b}$, $(\sqrt a)^2 = a$.
> $\sqrt a$ est le nombre positif qui, multiplié par lui-même, donne $a$ ($\sqrt{49} = 7$ car $7 \times 7 = 49$). Pour simplifier, on cherche un carré parfait caché : $\sqrt{50} = \sqrt{25 \times 2} = 5\sqrt2$.
- Écriture scientifique : $a \times 10^n$ avec $1 \leq a < 10$.
> Un seul chiffre non nul avant la virgule, puis la bonne puissance de 10 : $45\,000 = 4{,}5 \times 10^4$ et $0{,}003 = 3 \times 10^{-3}$. On compte de combien de rangs la virgule a bougé.
- Nombre premier : exactement deux diviseurs, 1 et lui-même (2, 3, 5, 7, 11, 13…).
> 1 n'est pas premier (un seul diviseur). Pour décomposer, on divise par 2, 3, 5… tant que c'est possible : $60 = 2^2 \times 3 \times 5$.
- Valeur absolue : $|x - a|$ est la distance entre $x$ et $a$ sur la droite des réels.
> Une distance est toujours positive : $|-5| = 5$ et $|3 - 7| = 4$. Ainsi $|x - 2| \leq 3$ veut dire « $x$ est à 3 au plus de 2 », soit $x \in [-1 ; 5]$.
? Simplifier $\dfrac{2^5 \times 2^{-2}}{2^4}$.
= Numérateur : $2^{5 + (-2)} = 2^3$.
= Division : $\dfrac{2^3}{2^4} = 2^{3 - 4} = 2^{-1}$.
= Résultat : $2^{-1} = \dfrac12$.
? Écrire $\sqrt{72}$ sous la forme $a\sqrt b$ avec $b$ le plus petit possible.
= On cherche le plus grand carré qui divise 72 : $72 = 36 \times 2$.
= $\sqrt{72} = \sqrt{36}\,\sqrt2 = 6\sqrt2$.
! $\sqrt{a + b} \neq \sqrt a + \sqrt b$ : $\sqrt{9 + 16} = \sqrt{25} = 5$, alors que $\sqrt9 + \sqrt{16} = 7$.
! $(a + b)^2 \neq a^2 + b^2$ : il manque le terme $2ab$.

@maths-2-equations
- Identités remarquables : $(a+b)^2 = a^2 + 2ab + b^2$, $(a-b)^2 = a^2 - 2ab + b^2$, $(a+b)(a-b) = a^2 - b^2$.
> Ce sont des raccourcis de développement. Dans $(x + 3)^2$ : $a = x$ et $b = 3$, donc $x^2 + 2 \times x \times 3 + 9 = x^2 + 6x + 9$. Lues de droite à gauche, elles servent à **factoriser** : $x^2 - 25 = (x - 5)(x + 5)$.
- Équation du premier degré : on isole $x$ en faisant la même opération des deux côtés.
> $3x + 5 = 17$ : on enlève 5 des deux côtés ($3x = 12$), puis on divise par 3 ($x = 4$). On vérifie : $3 \times 4 + 5 = 17$.
- Produit nul : $A \times B = 0 \iff A = 0$ ou $B = 0$.
> Le symbole $\iff$ veut dire « équivaut à ». Un produit ne peut valoir 0 que si l'un des facteurs vaut 0. D'où l'intérêt de **factoriser** avant de résoudre.
- Inéquation : on change le sens quand on multiplie ou divise par un nombre **négatif**.
> $-2x < 6$ : on divise par $-2$, donc $<$ devient $>$ : $x > -3$. Vérification avec $x = 0$ : $-2 \times 0 = 0 < 6$, et 0 est bien supérieur à $-3$.
- Signe de $ax + b$ : celui de $a$ à droite de $-\dfrac{b}{a}$, le contraire à gauche.
> $-\frac ba$ est la valeur qui annule $ax + b$. Pour $2x - 6$ : il s'annule en $x = 3$ ; $a = 2 > 0$ donc l'expression est négative avant 3 et positive après.
- Quotient : $\dfrac{A}{B}$ a le même signe que $A \times B$ ; valeur interdite quand $B = 0$.
> On fait un tableau de signes avec une ligne pour $A$, une pour $B$, et on applique la règle des signes. La valeur qui annule $B$ est marquée d'une double barre : on ne divise jamais par 0.
? Résoudre $(2x - 4)(x + 3) = 0$.
= Produit nul : $2x - 4 = 0$ ou $x + 3 = 0$.
= $2x = 4$ donc $x = 2$ ; ou $x = -3$.
= Solutions : $\{-3 ; 2\}$.
? Résoudre $x^2 = 9x$.
= On ramène tout d'un côté et on factorise : $x^2 - 9x = 0$, soit $x(x - 9) = 0$.
= Produit nul : $x = 0$ ou $x = 9$.
! Ne jamais diviser par une expression qui peut être nulle : diviser $x^2 = 9x$ par $x$ fait perdre la solution $x = 0$.

@maths-2-fonctions
- Une fonction $f$ associe à chaque nombre $x$ un **unique** nombre $f(x)$, appelé image de $x$.
> $f(x) = x^2 + 1$ est une « machine » : on met 3, il sort $3^2 + 1 = 10$. On dit que 10 est l'image de 3, et on écrit $f(3) = 10$.
- Un **antécédent** de $y$ est un nombre $x$ tel que $f(x) = y$.
> C'est le chemin inverse : quels nombres donnent 10 ? Avec $f(x) = x^2 + 1$, il y en a deux, 3 et $-3$. Une image est toujours unique ; un nombre peut avoir 0, 1 ou plusieurs antécédents.
- La courbe $\mathcal{C}_f$ est l'ensemble des points de coordonnées $(x ; f(x))$.
> Chaque point de la courbe se lit « abscisse = $x$, ordonnée = son image ». Le point $A(2 ; 5)$ est sur $\mathcal{C}_f$ si et seulement si $f(2) = 5$.
- Croissante sur $I$ : si $a < b$ alors $f(a) \leq f(b)$ ; décroissante : $f(a) \geq f(b)$.
> Croissante : la courbe **monte** quand on va vers la droite ; l'ordre est conservé. Décroissante : elle **descend** ; l'ordre est inversé.
- Résoudre $f(x) = k$ graphiquement : on trace la droite horizontale $y = k$ et on lit les abscisses des points d'intersection.
> Pour $f(x) > k$ : on garde les $x$ où la courbe est **au-dessus** de cette droite.
- Maximum sur $I$ : la plus grande valeur $M = f(x_0)$ prise par $f$ sur $I$.
> Le maximum est une valeur de $f$ (une ordonnée, en haut de la « bosse ») ; il est **atteint en** $x_0$ (une abscisse).
? Avec $f(x) = 2x^2 - 3$, calculer l'image de $-2$.
= On remplace $x$ par $-2$, avec des parenthèses : $f(-2) = 2 \times (-2)^2 - 3$.
= $(-2)^2 = 4$, donc $f(-2) = 8 - 3 = 5$.
! L'image se lit sur l'axe des ordonnées (vertical), l'antécédent sur l'axe des abscisses (horizontal).
! $-2^2 = -4$ mais $(-2)^2 = 4$ : toujours mettre des parenthèses en remplaçant.

@maths-2-affines
- Fonction affine : $f(x) = mx + p$ ; sa courbe est une droite.
> $p$ (l'ordonnée à l'origine) est la hauteur où la droite coupe l'axe vertical, car $f(0) = p$. $m$ (le coefficient directeur) dit de combien $f$ augmente quand $x$ augmente de 1.
- Coefficient directeur : $m = \dfrac{f(b) - f(a)}{b - a}$.
> C'est « variation des images ÷ variation des $x$ », le même calcul que la pente d'une route. Si $f(1) = 3$ et $f(4) = 9$ : $m = \frac{9 - 3}{4 - 1} = 2$.
- $m > 0$ : croissante ; $m < 0$ : décroissante ; $m = 0$ : constante (droite horizontale).
> $f(x) = -3x + 1$ descend : à chaque pas de 1 vers la droite, on perd 3.
- $f$ s'annule en $x = -\dfrac{p}{m}$.
> On résout $mx + p = 0$. Pour $f(x) = 2x - 8$ : $2x = 8$, donc $x = 4$, et $f$ est négative avant 4, positive après (car $m > 0$).
- Fonction linéaire : $p = 0$, soit $f(x) = mx$ ; c'est une situation de proportionnalité, la droite passe par l'origine.
> Exemple : le prix de $x$ kg de pommes à 2,50 € le kilo est $f(x) = 2{,}5x$.
? Trouver la fonction affine $f$ telle que $f(1) = 5$ et $f(3) = 11$.
= Coefficient directeur : $m = \dfrac{11 - 5}{3 - 1} = \dfrac62 = 3$.
= Donc $f(x) = 3x + p$ ; avec $f(1) = 5$ : $3 + p = 5$, d'où $p = 2$.
= $f(x) = 3x + 2$. Vérification : $f(3) = 9 + 2 = 11$.
! Le coefficient directeur se lit en avançant de 1 vers la droite et en regardant de combien on monte ; ce n'est pas l'endroit où la droite coupe l'axe vertical.

@maths-2-reference
- Fonction carré $x \mapsto x^2$ : décroissante sur $]-\infty ; 0]$, croissante sur $[0 ; +\infty[$.
> Sa courbe est une parabole en forme de U, symétrique par rapport à l'axe vertical car $(-3)^2 = 3^2 = 9$. Son minimum est 0, atteint en 0. La notation $x \mapsto x^2$ se lit « $x$ donne $x^2$ ».
- Fonction inverse $x \mapsto \dfrac1x$ : définie sur $\mathbb{R}^*$ (tous les réels sauf 0), décroissante sur $]-\infty ; 0[$ et sur $]0 ; +\infty[$.
> On ne peut pas diviser par 0. Plus $x$ est grand, plus $\frac1x$ est petit : $\frac1{10} = 0{,}1$, $\frac1{100} = 0{,}01$. La courbe est une hyperbole en deux morceaux.
- Racine carrée $x \mapsto \sqrt x$ : définie et croissante sur $[0 ; +\infty[$.
> Pas de racine d'un nombre négatif (aucun carré n'est négatif). $\sqrt 0 = 0$, $\sqrt 1 = 1$, $\sqrt 4 = 2$, $\sqrt 9 = 3$.
- Fonction cube $x \mapsto x^3$ : croissante sur $\mathbb{R}$.
> Le cube garde le signe : $(-2)^3 = -8$ et $2^3 = 8$.
- Comparer : si $0 < a < b$, alors $a^2 < b^2$, $\sqrt a < \sqrt b$, mais $\dfrac1a > \dfrac1b$.
> Une fonction croissante garde l'ordre, une fonction décroissante l'inverse. $2 < 5$ donne $\frac12 > \frac15$ (0,5 contre 0,2).
? Comparer $(-3)^2$ et $(-5)^2$ sans calculer.
= Sur $]-\infty ; 0]$, la fonction carré est décroissante : elle inverse l'ordre.
= $-5 < -3$ donne donc $(-5)^2 > (-3)^2$ (en effet $25 > 9$).
! L'inverse n'est pas décroissante sur $\mathbb{R}^*$ en entier : $-1 < 1$ et pourtant $\frac{1}{-1} = -1 < \frac11 = 1$.

@maths-2-vecteurs
- Coordonnées d'un vecteur : $\overrightarrow{AB}\,(x_B - x_A ; y_B - y_A)$.
> Un vecteur est un déplacement. Ses coordonnées disent de combien on bouge horizontalement puis verticalement pour aller de $A$ à $B$ : toujours « arrivée moins départ ».
- Milieu de $[AB]$ : $\left(\dfrac{x_A + x_B}{2} ; \dfrac{y_A + y_B}{2}\right)$.
> C'est la moyenne des abscisses et la moyenne des ordonnées.
- Distance dans un repère orthonormé : $AB = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.
> C'est le théorème de Pythagore : le déplacement horizontal et le déplacement vertical sont les deux côtés de l'angle droit, $AB$ est l'hypoténuse.
- Relation de Chasles : $\overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AC}$.
> Aller de $A$ à $B$ puis de $B$ à $C$, c'est aller de $A$ à $C$. Les lettres « intérieures » identiques se simplifient.
- Colinéarité : $\vec u(x ; y)$ et $\vec v(x' ; y')$ sont colinéaires $\iff xy' - x'y = 0$.
> Colinéaires = même direction (l'un est un multiple de l'autre). On fait un « produit en croix » : $\vec u(2 ; 3)$ et $\vec v(4 ; 6)$ donnent $2 \times 6 - 4 \times 3 = 0$, ils sont colinéaires ($\vec v = 2\vec u$). Sert à prouver que des droites sont parallèles ou que des points sont alignés.
- $ABCD$ est un parallélogramme $\iff \overrightarrow{AB} = \overrightarrow{DC}$.
> Les deux côtés opposés représentent le même déplacement. Attention à l'ordre : $\overrightarrow{DC}$, pas $\overrightarrow{CD}$.
? $A(1 ; 2)$ et $B(4 ; 6)$. Calculer $\overrightarrow{AB}$ et la distance $AB$.
= $\overrightarrow{AB}(4 - 1 ; 6 - 2)$, soit $\overrightarrow{AB}(3 ; 4)$.
= $AB = \sqrt{3^2 + 4^2} = \sqrt{9 + 16} = \sqrt{25} = 5$.
! $\overrightarrow{AB} = -\overrightarrow{BA}$ : l'ordre des points compte, c'est toujours « arrivée moins départ ».

@maths-2-droites
- Équation réduite : $y = mx + p$ (droite non verticale) ; une droite verticale a une équation $x = c$.
> Un point est sur la droite si ses coordonnées vérifient l'équation. Pour $y = 2x + 1$, le point $(3 ; 7)$ y est car $2 \times 3 + 1 = 7$.
- Coefficient directeur passant par $A$ et $B$ : $m = \dfrac{y_B - y_A}{x_B - x_A}$.
> « Variation verticale ÷ variation horizontale ». On trouve ensuite $p$ en remplaçant les coordonnées d'un point dans $y = mx + p$.
- Équation cartésienne : $ax + by + c = 0$, de vecteur directeur $\vec u(-b ; a)$.
> C'est une autre écriture de la même droite. $2x - y + 3 = 0$ revient à $y = 2x + 3$. Le vecteur directeur indique la direction de la droite.
- Deux droites sont parallèles $\iff$ elles ont le même coefficient directeur.
> Même pente, donc elles ne se croisent jamais (ou sont confondues si $p$ est aussi le même).
- Système de deux équations : chercher le point commun à deux droites.
> Par **substitution** : on isole une inconnue dans une équation et on la remplace dans l'autre. Par **combinaison** : on ajoute ou soustrait les équations pour éliminer une inconnue.
? Équation de la droite passant par $A(1 ; 3)$ et $B(3 ; 7)$.
= $m = \dfrac{7 - 3}{3 - 1} = \dfrac42 = 2$, donc $y = 2x + p$.
= $A$ est sur la droite : $3 = 2 \times 1 + p$, donc $p = 1$.
= Équation : $y = 2x + 1$.
? Résoudre le système $x + y = 10$ et $x - y = 4$.
= On additionne les deux équations : $2x = 14$, donc $x = 7$.
= Puis $y = 10 - 7 = 3$. Solution : $(7 ; 3)$.
! Pour $ax + by + c = 0$, le coefficient directeur vaut $-\dfrac{a}{b}$ (si $b \neq 0$), pas $a$.

@maths-2-stats
- Moyenne : $\bar x = \dfrac{n_1x_1 + n_2x_2 + \dots + n_px_p}{N}$.
> $x_i$ sont les valeurs, $n_i$ combien de fois chacune apparaît (effectif), $N$ l'effectif total. On multiplie chaque valeur par son effectif, on additionne, on divise par le total. Le trait sur $\bar x$ veut dire « moyenne de ».
- Médiane : valeur qui partage la série **rangée dans l'ordre** en deux moitiés de même effectif.
> Avec un nombre impair de valeurs, c'est celle du milieu. Avec un nombre pair, on prend la moyenne des deux du milieu.
- Quartiles : $Q_1$ est la plus petite valeur telle qu'au moins 25 % des données lui sont inférieures ou égales ; $Q_3$ pareil avec 75 %.
> Pour $N = 20$ valeurs rangées : $Q_1$ est la 5e ($20 \times 0{,}25 = 5$) et $Q_3$ la 15e. Si le calcul ne tombe pas juste, on arrondit au rang supérieur.
- Écart interquartile $Q_3 - Q_1$ et étendue (max − min) mesurent la dispersion.
> L'écart interquartile contient la moitié centrale des données, sans les valeurs extrêmes.
- Écart-type $\sigma$ : mesure si les valeurs sont serrées autour de la moyenne (petit $\sigma$) ou éparpillées (grand $\sigma$).
> $\sigma$ (sigma) est en quelque sorte « l'écart moyen à la moyenne ». Il a la même unité que les données.
- Données groupées en classes : on remplace chaque classe par son centre pour estimer la moyenne.
> Le centre de la classe $[10 ; 20[$ est $\frac{10 + 20}{2} = 15$.
? Notes : 8 (2 fois), 12 (5 fois), 15 (3 fois). Calculer la moyenne.
= Somme pondérée : $8 \times 2 + 12 \times 5 + 15 \times 3 = 16 + 60 + 45 = 121$.
= Effectif total : $2 + 5 + 3 = 10$.
= $\bar x = \dfrac{121}{10} = 12{,}1$.
? Médiane de 3 ; 7 ; 8 ; 12 ; 15 ; 20.
= 6 valeurs (nombre pair) : on prend les 3e et 4e, 8 et 12.
= Médiane $= \dfrac{8 + 12}{2} = 10$.
! La médiane résiste aux valeurs extrêmes, la moyenne non : un salaire très élevé fait monter la moyenne, pas la médiane.

@maths-2-probas
- Situation d'équiprobabilité : $P(A) = \dfrac{\text{nombre d'issues favorables}}{\text{nombre d'issues possibles}}$.
> Valable quand toutes les issues ont la même chance (dé équilibré, tirage au hasard). Obtenir un nombre pair avec un dé : 3 issues favorables (2, 4, 6) sur 6, soit $\frac36 = \frac12$.
- $0 \leq P(A) \leq 1$ et $P(\overline{A}) = 1 - P(A)$.
> $\overline A$ (« A barre ») est l'événement contraire : « A ne se réalise pas ». Si la probabilité de pluie est 0,3, celle de ne pas avoir de pluie est 0,7.
- Réunion : $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.
> $A \cup B$ (« A **ou** B ») : au moins l'un des deux. $A \cap B$ (« A **et** B ») : les deux à la fois. On retire $P(A \cap B)$ car ces issues ont été comptées deux fois.
- Incompatibles ($A \cap B = \emptyset$) : $P(A \cup B) = P(A) + P(B)$.
> $\emptyset$ désigne l'ensemble vide : A et B ne peuvent pas se produire en même temps (tirer un roi et une dame avec une seule carte).
- Arbre : on **multiplie** le long d'un chemin, on **additionne** les chemins qui mènent au résultat voulu.
> Deux lancers de pièce : $P(\text{PP}) = \frac12 \times \frac12 = \frac14$ ; « une pile et une face » = $P(\text{PF}) + P(\text{FP}) = \frac14 + \frac14 = \frac12$.
? Une carte est tirée dans un jeu de 32. Probabilité d'avoir un cœur **ou** un roi ?
= Cœur : $\frac{8}{32}$ ; roi : $\frac{4}{32}$ ; roi de cœur (les deux à la fois) : $\frac{1}{32}$.
= $P = \dfrac{8}{32} + \dfrac{4}{32} - \dfrac{1}{32} = \dfrac{11}{32}$.
! Pour « au moins un », passer par le contraire : $P(\text{au moins un 6 en 2 lancers}) = 1 - P(\text{aucun 6}) = 1 - \left(\frac56\right)^2 = \frac{11}{36}$.

@maths-2-probas-cond
- Fréquence conditionnelle : part de $B$ parmi $A$ $= \dfrac{\text{effectif de } A \cap B}{\text{effectif de } A}$.
> Dans un tableau croisé, on se restreint à une ligne ou une colonne. Si 30 élèves sur 120 font du latin, dont 12 filles, la fréquence des filles **parmi** les latinistes est $\frac{12}{30} = 0{,}4$.
- Probabilité conditionnelle : $P_A(B) = \dfrac{P(A \cap B)}{P(A)}$, donc $P(A \cap B) = P(A) \times P_A(B)$.
> $P_A(B)$ se lit « probabilité de B **sachant** A » : on sait déjà que A est réalisé, l'univers se réduit à A. Dans un arbre, c'est la probabilité écrite sur la branche qui part de A vers B.
- Arbre pondéré : la somme des probabilités des branches issues d'un même nœud vaut 1.
> Si $P_A(B) = 0{,}3$, alors $P_A(\overline B) = 0{,}7$. Cela permet de compléter un arbre.
- Probabilités totales : $P(B) = P(A) \times P_A(B) + P(\overline A) \times P_{\overline A}(B)$.
> Pour obtenir B, on passe soit par A, soit par non-A. On additionne les deux chemins de l'arbre qui finissent par B.
? 60 % des élèves prennent le bus. 10 % des usagers du bus sont en retard, contre 5 % des autres. Probabilité qu'un élève soit en retard ?
= Chemin « bus puis retard » : $0{,}6 \times 0{,}1 = 0{,}06$.
= Chemin « pas bus puis retard » : $0{,}4 \times 0{,}05 = 0{,}02$.
= $P(R) = 0{,}06 + 0{,}02 = 0{,}08$, soit 8 %.
! Ne pas confondre $P_A(B)$ (« B parmi A ») et $P(A \cap B)$ (« A et B ») : $P_A(B)$ se divise par $P(A)$.

@maths-2-automatismes
- Prendre $t\,\%$ de $x$ : $\dfrac{t}{100} \times x$.
> 15 % de 80 : $0{,}15 \times 80 = 12$. Astuce de tête : 10 % = diviser par 10 (8), 5 % = la moitié (4), total 12.
- Hausse de $t\,\%$ : multiplier par $1 + \dfrac{t}{100}$ ; baisse de $t\,\%$ : par $1 - \dfrac{t}{100}$.
> Ce nombre s'appelle le coefficient multiplicateur. +20 % : ×1,2 ; −30 % : ×0,7 ; +5 % : ×1,05.
- Évolutions successives : on **multiplie** les coefficients.
> +10 % puis −10 % donne $1{,}1 \times 0{,}9 = 0{,}99$, soit une baisse de 1 %, et pas 0 % !
- Évolution réciproque (revenir au prix de départ) : coefficient $\dfrac{1}{c}$.
> Après une hausse de 25 % (×1,25), il faut multiplier par $\frac{1}{1{,}25} = 0{,}8$, soit une baisse de 20 %.
- Fractions : $\dfrac ab + \dfrac cd = \dfrac{ad + bc}{bd}$ et $\dfrac ab \times \dfrac cd = \dfrac{ac}{bd}$ ; diviser par une fraction, c'est multiplier par son inverse.
> Pour additionner, il faut le même dénominateur : $\frac12 + \frac13 = \frac36 + \frac26 = \frac56$. Pour multiplier, on multiplie en haut et en bas : $\frac23 \times \frac45 = \frac{8}{15}$.
- Vitesse $v = \dfrac{d}{t}$ ; échelle = distance sur le plan ÷ distance réelle (dans la même unité).
> 150 km en 2 h : $v = 75$ km/h. Échelle $\frac{1}{25\,000}$ : 1 cm sur la carte = 25 000 cm = 250 m en vrai.
? Un article coûte 80 €. Il augmente de 25 %, puis baisse de 20 %. Prix final ?
= Coefficient global : $1{,}25 \times 0{,}8 = 1$.
= Prix final : $80 \times 1 = 80$ € : on revient exactement au départ.
? Calculer $\dfrac34 \div \dfrac32$.
= Diviser par $\frac32$, c'est multiplier par $\frac23$ : $\dfrac34 \times \dfrac23 = \dfrac{6}{12} = \dfrac12$.
! Une hausse de 20 % puis une baisse de 20 % ne ramènent pas au départ : $1{,}2 \times 0{,}8 = 0{,}96$, soit −4 %.

@maths-1-second-degre
- Trinôme : $f(x) = ax^2 + bx + c$ avec $a \neq 0$.
> $a$ est le nombre devant $x^2$, $b$ celui devant $x$, $c$ le nombre seul. Dans $2x^2 - 3x + 1$ : $a = 2$, $b = -3$, $c = 1$. Dans $x^2 - 4$ : $a = 1$, $b = 0$, $c = -4$. Si $a > 0$ la parabole est en U, si $a < 0$ elle est en ∩.
- Discriminant : $\Delta = b^2 - 4ac$.
> $\Delta$ (delta) est un nombre qu'on calcule pour savoir **combien de solutions** a l'équation $ax^2 + bx + c = 0$, c'est-à-dire combien de fois la parabole coupe l'axe horizontal. Attention aux signes : avec $b = -3$, $b^2 = (-3)^2 = 9$.
- Racines : si $\Delta > 0$, deux racines $x_1 = \dfrac{-b - \sqrt\Delta}{2a}$ et $x_2 = \dfrac{-b + \sqrt\Delta}{2a}$.
> Le symbole $\pm$ dans $\frac{-b \pm \sqrt\Delta}{2a}$ résume ces deux calculs : une fois avec « − », une fois avec « + ». Si $\Delta = 0$ : une seule racine (dite double) $x_0 = -\frac{b}{2a}$. Si $\Delta < 0$ : aucune racine réelle, car on ne peut pas prendre la racine d'un nombre négatif.
- Forme factorisée : si $\Delta > 0$, $f(x) = a(x - x_1)(x - x_2)$.
> Elle montre directement les racines : $(x - 2)(x - 3)$ s'annule pour $x = 2$ et $x = 3$.
- Forme canonique : $f(x) = a(x - \alpha)^2 + \beta$ avec $\alpha = -\dfrac{b}{2a}$ et $\beta = f(\alpha)$.
> $\alpha$ (alpha) et $\beta$ (bêta) sont les coordonnées du **sommet** $S(\alpha ; \beta)$ de la parabole : son point le plus bas (si $a > 0$) ou le plus haut (si $a < 0$). La parabole est symétrique par rapport à la droite verticale $x = \alpha$.
- Signe du trinôme : signe de $a$ à l'extérieur des racines, signe contraire entre les racines.
> Pour $x^2 - 5x + 6$ ($a = 1 > 0$, racines 2 et 3) : positif avant 2 et après 3, négatif entre 2 et 3. Si $\Delta < 0$, le trinôme a le signe de $a$ partout.
- Somme et produit des racines : $x_1 + x_2 = -\dfrac ba$ et $x_1 \times x_2 = \dfrac ca$.
> Utile pour trouver une racine de tête : pour $x^2 - 5x + 6$, on cherche deux nombres de somme 5 et de produit 6 : 2 et 3.
? Résoudre $x^2 - 5x + 6 = 0$.
= On identifie $a = 1$, $b = -5$, $c = 6$.
= $\Delta = (-5)^2 - 4 \times 1 \times 6 = 25 - 24 = 1$, positif : deux racines.
= $x_1 = \dfrac{5 - \sqrt1}{2} = \dfrac{4}{2} = 2$ et $x_2 = \dfrac{5 + 1}{2} = 3$.
= Vérification : $2^2 - 5 \times 2 + 6 = 4 - 10 + 6 = 0$.
? Sommet de la parabole $y = 2x^2 - 8x + 3$.
= $\alpha = -\dfrac{b}{2a} = -\dfrac{-8}{2 \times 2} = \dfrac{8}{4} = 2$.
= $\beta = f(2) = 2 \times 4 - 8 \times 2 + 3 = 8 - 16 + 3 = -5$.
= Sommet $S(2 ; -5)$ ; comme $a = 2 > 0$, c'est un minimum.
? Combien de solutions pour $x^2 + 2x + 5 = 0$ ?
= $\Delta = 2^2 - 4 \times 1 \times 5 = 4 - 20 = -16 < 0$.
= Aucune solution réelle : la parabole ne coupe pas l'axe des abscisses.
! Dans $\Delta = b^2 - 4ac$, $b^2$ est toujours positif ou nul : $(-5)^2 = 25$, pas $-25$.
! Le « $-b$ » de la formule change le signe de $b$ : si $b = -5$, alors $-b = 5$.

@maths-1-suites
- Une suite $(u_n)$ est une liste de nombres numérotés : $u_0$, $u_1$, $u_2$… ; $n$ est le rang.
> $u_n$ se lit « u indice n ». Une suite peut être donnée par une formule directe ($u_n = 3n + 1$, donc $u_5 = 16$) ou par récurrence (on calcule chaque terme à partir du précédent : $u_{n+1} = 2u_n$).
- Suite arithmétique de raison $r$ : $u_{n+1} = u_n + r$, et $u_n = u_0 + n \times r$.
> On **ajoute** toujours le même nombre $r$ : 3, 7, 11, 15… ($r = 4$). Pour aller de $u_0$ à $u_n$, on ajoute $n$ fois $r$.
- Suite géométrique de raison $q$ : $u_{n+1} = q \times u_n$, et $u_n = u_0 \times q^n$.
> On **multiplie** toujours par le même nombre $q$ : 2, 6, 18, 54… ($q = 3$). Une hausse de 5 % par an donne une suite géométrique de raison 1,05.
- Sommes : $1 + 2 + \dots + n = \dfrac{n(n+1)}{2}$ et $1 + q + q^2 + \dots + q^n = \dfrac{1 - q^{n+1}}{1 - q}$ (pour $q \neq 1$).
> Somme de termes d'une suite arithmétique : nombre de termes × $\frac{\text{premier} + \text{dernier}}{2}$. Exemple : $1 + 2 + \dots + 100 = \frac{100 \times 101}{2} = 5\,050$.
- Sens de variation : étudier le signe de $u_{n+1} - u_n$.
> Si la différence est positive, chaque terme est plus grand que le précédent : suite croissante. Pour une suite géométrique à termes positifs, croissante si $q > 1$, décroissante si $0 < q < 1$.
? $(u_n)$ arithmétique avec $u_0 = 5$ et $r = 3$. Calculer $u_{10}$.
= $u_{10} = u_0 + 10 \times r = 5 + 10 \times 3 = 35$.
? $(v_n)$ géométrique avec $v_0 = 2$ et $q = 3$. Calculer $v_4$.
= $v_4 = v_0 \times q^4 = 2 \times 3^4 = 2 \times 81 = 162$.
? Une population de 1 000 bactéries double chaque heure. Combien après 5 heures ?
= Doubler, c'est multiplier par 2 : suite géométrique, $u_0 = 1\,000$, $q = 2$.
= $u_5 = 1\,000 \times 2^5 = 1\,000 \times 32 = 32\,000$.
! Si la suite commence à $u_1$ : $u_n = u_1 + (n - 1)r$, car de $u_1$ à $u_n$ il n'y a que $n - 1$ pas.

@maths-1-derivation
- Nombre dérivé : $f'(a) = \lim\limits_{h \to 0} \dfrac{f(a + h) - f(a)}{h}$.
> C'est la **pente de la tangente** à la courbe au point d'abscisse $a$ : la vitesse à laquelle $f$ augmente à cet endroit. On calcule la pente entre deux points très proches ($a$ et $a + h$), puis on fait tendre $h$ vers 0. « lim » veut dire limite : la valeur dont on s'approche.
- Tangente au point d'abscisse $a$ : $y = f'(a)(x - a) + f(a)$.
> La droite qui « frôle » la courbe en ce point. Il faut deux nombres : $f(a)$ (la hauteur du point) et $f'(a)$ (la pente).
- Dérivées usuelles : $(k)' = 0$, $(x)' = 1$, $(x^n)' = nx^{n-1}$, $\left(\dfrac1x\right)' = -\dfrac{1}{x^2}$, $(\sqrt x)' = \dfrac{1}{2\sqrt x}$.
> Pour $x^n$ : on fait descendre l'exposant devant et on lui retire 1. $(x^3)' = 3x^2$, $(x^2)' = 2x$. Une constante ne varie pas, sa dérivée est 0.
- Opérations : $(u + v)' = u' + v'$, $(ku)' = ku'$.
> On dérive morceau par morceau, et un nombre devant reste devant : $(5x^2 + 3x - 7)' = 10x + 3$.
- Produit et quotient : $(uv)' = u'v + uv'$ et $\left(\dfrac uv\right)' = \dfrac{u'v - uv'}{v^2}$.
> On repère $u$ et $v$, on calcule $u'$ et $v'$, puis on remplace. Dans le quotient, l'ordre compte (« u'v **moins** uv' »).
- Fonction composée affine : $\big(g(ax + b)\big)' = a \times g'(ax + b)$.
> On dérive normalement puis on multiplie par $a$ : $\big((3x + 1)^2\big)' = 3 \times 2(3x + 1) = 6(3x + 1)$.
? Dériver $f(x) = 4x^3 - 5x^2 + 2x - 7$.
= Terme par terme : $(4x^3)' = 12x^2$, $(5x^2)' = 10x$, $(2x)' = 2$, $(7)' = 0$.
= $f'(x) = 12x^2 - 10x + 2$.
? Tangente à $f(x) = x^2$ au point d'abscisse 3.
= $f(3) = 9$ ; $f'(x) = 2x$ donc $f'(3) = 6$.
= $y = 6(x - 3) + 9 = 6x - 9$.
? Dériver $f(x) = (2x + 1)(x^2 - 3)$.
= $u = 2x + 1$, $u' = 2$ ; $v = x^2 - 3$, $v' = 2x$.
= $f'(x) = 2(x^2 - 3) + (2x + 1) \times 2x = 2x^2 - 6 + 4x^2 + 2x = 6x^2 + 2x - 6$.
! $(uv)' \neq u'v'$ : la dérivée d'un produit n'est pas le produit des dérivées.

@maths-1-variations
- Si $f'(x) \geq 0$ sur $I$ : $f$ est croissante sur $I$ ; si $f'(x) \leq 0$ : décroissante.
> La dérivée est la pente. Pente positive : la courbe monte ; pente négative : elle descend. On étudie donc le **signe** de $f'$.
- Extremum local en $a$ : $f'$ s'annule **en changeant de signe** en $a$.
> Un extremum est un maximum (sommet) ou un minimum (creux). $+$ puis $-$ : maximum ; $-$ puis $+$ : minimum. La tangente y est horizontale.
- Méthode : 1) calculer $f'(x)$ ; 2) étudier son signe (factoriser, tableau de signes, $\Delta$…) ; 3) dresser le tableau de variations.
> Si $f'$ est un trinôme du second degré, on utilise le discriminant pour trouver ses racines et son signe.
- Compléter le tableau avec les images des bornes et des extremums.
> On calcule $f$ (pas $f'$ !) aux valeurs où $f'$ s'annule, et aux bornes de l'intervalle.
? Variations de $f(x) = x^2 - 6x + 1$ sur $\mathbb{R}$.
= $f'(x) = 2x - 6$, qui s'annule en $x = 3$.
= $f'(x) < 0$ pour $x < 3$ et $f'(x) > 0$ pour $x > 3$.
= $f$ est décroissante sur $]-\infty ; 3]$ puis croissante sur $[3 ; +\infty[$ ; minimum $f(3) = 9 - 18 + 1 = -8$.
? Extremums de $f(x) = x^3 - 3x$.
= $f'(x) = 3x^2 - 3 = 3(x - 1)(x + 1)$, nulle en $-1$ et en $1$.
= Signe : $+$ avant $-1$, $-$ entre $-1$ et $1$, $+$ après $1$.
= Maximum local $f(-1) = 2$, minimum local $f(1) = -2$.
! $f'(a) = 0$ ne suffit pas : $f(x) = x^3$ a $f'(0) = 0$ mais aucun extremum en 0 ($f'$ reste positive).

@maths-1-exponentielle
- La fonction exponentielle est l'unique fonction telle que $f' = f$ et $f(0) = 1$. On note $e^x$, avec $e \approx 2{,}718$.
> C'est la fonction des croissances « en pourcentage » : plus elle est grande, plus elle grandit vite (sa pente est égale à sa valeur). $e^0 = 1$ et $e^1 = e$.
- Règles de calcul : $e^{a+b} = e^a \times e^b$, $e^{-a} = \dfrac{1}{e^a}$, $e^{a-b} = \dfrac{e^a}{e^b}$, $(e^a)^n = e^{na}$.
> Ce sont exactement les règles des puissances : un produit devient une somme d'exposants. $e^2 \times e^3 = e^5$ et $\frac{e^7}{e^4} = e^3$.
- $e^x > 0$ pour tout $x$, et $\exp$ est strictement croissante sur $\mathbb{R}$.
> Une exponentielle n'est jamais négative ni nulle. Sa courbe passe par $(0 ; 1)$, est proche de 0 à gauche et monte très vite à droite.
- Équations et inéquations : $e^a = e^b \iff a = b$ et $e^a < e^b \iff a < b$.
> On peut « enlever » les exponentielles des deux côtés. $e^{2x} = e^{x + 3}$ donne $2x = x + 3$, donc $x = 3$.
- Dérivées : $(e^x)' = e^x$, $(e^{kx})' = ke^{kx}$, $(e^u)' = u'e^u$.
> On recopie l'exponentielle et on multiplie par la dérivée de ce qu'il y a en haut : $(e^{3x})' = 3e^{3x}$ et $(e^{x^2})' = 2xe^{x^2}$.
? Simplifier $\dfrac{e^5 \times e^{-2}}{e}$.
= $e^5 \times e^{-2} = e^{5 - 2} = e^3$.
= $\dfrac{e^3}{e^1} = e^{3 - 1} = e^2$.
? Dériver $f(x) = (x + 1)e^x$.
= Produit : $u = x + 1$, $u' = 1$ ; $v = e^x$, $v' = e^x$.
= $f'(x) = 1 \times e^x + (x + 1)e^x = (x + 2)e^x$.
= Comme $e^x > 0$, $f'$ a le signe de $x + 2$.
! $e^{a+b} \neq e^a + e^b$ : c'est un **produit**, $e^a \times e^b$.

@maths-1-trigo
- Cercle trigonométrique : cercle de centre $O$ et de rayon 1. Au réel $x$ correspond un point $M$ de coordonnées $(\cos x ; \sin x)$.
> On part du point $(1 ; 0)$ et on tourne d'une longueur $x$ sur le cercle, dans le sens inverse des aiguilles d'une montre. Le **cosinus** est l'abscisse du point (lecture horizontale), le **sinus** son ordonnée (lecture verticale).
- Radians : $\pi$ rad $= 180°$, donc un tour complet vaut $2\pi$.
> Pour convertir des degrés en radians, on multiplie par $\frac{\pi}{180}$ : $90° = \frac\pi2$, $60° = \frac\pi3$, $45° = \frac\pi4$, $30° = \frac\pi6$. Longueur d'un arc = rayon × angle en radians.
- Relation fondamentale : $\cos^2 x + \sin^2 x = 1$.
> C'est Pythagore dans le cercle de rayon 1 : le cosinus et le sinus sont les deux côtés de l'angle droit, le rayon (1) l'hypoténuse. $\cos^2 x$ veut dire $(\cos x)^2$. On en déduit $-1 \leq \cos x \leq 1$ et $-1 \leq \sin x \leq 1$.
- Valeurs à connaître : $\cos 0 = 1$, $\cos\frac\pi6 = \frac{\sqrt3}{2}$, $\cos\frac\pi4 = \frac{\sqrt2}{2}$, $\cos\frac\pi3 = \frac12$, $\cos\frac\pi2 = 0$.
> Le sinus prend les mêmes valeurs **dans l'ordre inverse** : $\sin 0 = 0$, $\sin\frac\pi6 = \frac12$, $\sin\frac\pi4 = \frac{\sqrt2}{2}$, $\sin\frac\pi3 = \frac{\sqrt3}{2}$, $\sin\frac\pi2 = 1$. Repère : $\frac{\sqrt3}{2} \approx 0{,}87$ et $\frac{\sqrt2}{2} \approx 0{,}71$.
- Symétries : $\cos(-x) = \cos x$, $\sin(-x) = -\sin x$, $\cos(\pi - x) = -\cos x$, $\sin(\pi - x) = \sin x$.
> Elles se voient sur le cercle : $-x$ est le symétrique par rapport à l'axe horizontal (même abscisse, ordonnée opposée) ; $\pi - x$ est le symétrique par rapport à l'axe vertical (abscisse opposée, même ordonnée).
- Signe selon le quart de cercle : sur $\left[0 ; \frac\pi2\right]$, cos et sin positifs ; sur $\left[\frac\pi2 ; \pi\right]$, cos négatif et sin positif.
> En dessous de l'axe horizontal (entre $-\pi$ et 0), le sinus est négatif ; à gauche de l'axe vertical, le cosinus est négatif.
- Périodicité : $\cos(x + 2\pi) = \cos x$ et $\sin(x + 2\pi) = \sin x$.
> Faire un tour complet ramène au même point. On peut donc enlever ou ajouter des $2\pi$ : $\cos\frac{13\pi}{6} = \cos\left(\frac{\pi}{6} + 2\pi\right) = \frac{\sqrt3}{2}$.
? Sachant $\cos x = \dfrac{8}{17}$ et $x \in \left[0 ; \dfrac\pi2\right]$, calculer $\sin x$.
= Relation fondamentale : $\sin^2 x = 1 - \cos^2 x = 1 - \dfrac{64}{289} = \dfrac{289 - 64}{289} = \dfrac{225}{289}$.
= Donc $\sin x = \dfrac{15}{17}$ ou $\sin x = -\dfrac{15}{17}$ (car $15^2 = 225$ et $17^2 = 289$).
= Sur $\left[0 ; \frac\pi2\right]$, le sinus est positif : $\sin x = \dfrac{15}{17}$.
? Calculer $\cos\dfrac{2\pi}{3}$.
= $\dfrac{2\pi}{3} = \pi - \dfrac{\pi}{3}$, donc $\cos\dfrac{2\pi}{3} = -\cos\dfrac{\pi}{3} = -\dfrac12$.
? Convertir 135° en radians.
= $135 \times \dfrac{\pi}{180} = \dfrac{135\pi}{180} = \dfrac{3\pi}{4}$.
! Pour trouver $\sin x$ à partir de $\cos x$, on obtient deux valeurs opposées : le signe se choisit selon l'intervalle où se trouve $x$.
! La calculatrice doit être en mode radian si l'angle est en radians.

@maths-1-produit-scalaire
- Définition : $\vec u \cdot \vec v = \|\vec u\| \times \|\vec v\| \times \cos(\vec u, \vec v)$.
> $\|\vec u\|$ est la **norme** de $\vec u$ (sa longueur). Le produit scalaire mesure si deux vecteurs « vont dans le même sens » : positif si l'angle est aigu, négatif s'il est obtus, nul s'il est droit.
- En repère orthonormé : $\vec u(x ; y)$ et $\vec v(x' ; y')$ donnent $\vec u \cdot \vec v = xx' + yy'$, et $\|\vec u\| = \sqrt{x^2 + y^2}$.
> On multiplie les abscisses entre elles, les ordonnées entre elles, et on additionne : $(2 ; 3) \cdot (4 ; -1) = 8 - 3 = 5$.
- Orthogonalité : $\vec u \perp \vec v \iff \vec u \cdot \vec v = 0$.
> Le symbole $\perp$ veut dire « perpendiculaire ». C'est la façon la plus rapide de prouver un angle droit.
- Avec les normes : $\vec u \cdot \vec v = \dfrac12\left(\|\vec u + \vec v\|^2 - \|\vec u\|^2 - \|\vec v\|^2\right)$.
> Utile quand on connaît seulement des longueurs.
- Projection : $\overrightarrow{AB} \cdot \overrightarrow{AC} = \overrightarrow{AB} \cdot \overrightarrow{AH}$, où $H$ est le projeté orthogonal de $C$ sur $(AB)$.
> On « fait tomber » $C$ perpendiculairement sur la droite $(AB)$. Si $H$ est du même côté que $B$ : $AB \times AH$ ; sinon : $-AB \times AH$.
- Al-Kashi : $BC^2 = AB^2 + AC^2 - 2 \times AB \times AC \times \cos\widehat{A}$.
> C'est un Pythagore généralisé à tous les triangles : si l'angle $\widehat A$ est droit, $\cos\widehat A = 0$ et on retrouve Pythagore.
? $\vec u(3 ; -2)$ et $\vec v(4 ; 6)$ sont-ils orthogonaux ?
= $\vec u \cdot \vec v = 3 \times 4 + (-2) \times 6 = 12 - 12 = 0$.
= Le produit scalaire est nul : oui, ils sont orthogonaux.
? Triangle avec $AB = 5$, $AC = 8$ et $\widehat A = 60°$. Calculer $BC$.
= Al-Kashi : $BC^2 = 25 + 64 - 2 \times 5 \times 8 \times \cos 60° = 89 - 80 \times \frac12 = 49$.
= $BC = 7$.
! Le produit scalaire est un **nombre**, pas un vecteur.

@maths-1-probas-cond
- Probabilité conditionnelle : $P_A(B) = \dfrac{P(A \cap B)}{P(A)}$, donc $P(A \cap B) = P(A) \times P_A(B)$.
> $P_A(B)$ : « probabilité de B **sachant que** A est réalisé ». Dans un arbre, c'est le nombre écrit sur la branche de A vers B. Le chemin complet « A puis B » vaut $P(A) \times P_A(B)$.
- Probabilités totales : $P(B) = P(A \cap B) + P(\overline A \cap B)$.
> On additionne tous les chemins de l'arbre qui finissent par B.
- Indépendance : $A$ et $B$ indépendants $\iff P(A \cap B) = P(A) \times P(B)$, soit $P_A(B) = P(B)$.
> Savoir que A est réalisé ne change rien à la chance d'avoir B (deux lancers de dé différents, par exemple).
- Inverser le conditionnement : $P_B(A) = \dfrac{P(A \cap B)}{P(B)}$.
> Utile pour « sachant que le test est positif, quelle est la probabilité d'être malade ? » : on calcule d'abord $P(B)$ avec les probabilités totales.
? 2 % d'une population est malade. Un test détecte 95 % des malades et donne 3 % de faux positifs chez les non-malades. Probabilité d'être malade sachant que le test est positif ?
= $P(M \cap T) = 0{,}02 \times 0{,}95 = 0{,}019$ et $P(\overline M \cap T) = 0{,}98 \times 0{,}03 = 0{,}0294$.
= $P(T) = 0{,}019 + 0{,}0294 = 0{,}0484$.
= $P_T(M) = \dfrac{0{,}019}{0{,}0484} \approx 0{,}39$ : seulement 39 % !
! Incompatibles ($A \cap B = \emptyset$, ne peuvent pas arriver ensemble) et indépendants (l'un n'influence pas l'autre), ce n'est pas la même chose.

@maths-1-va
- Une variable aléatoire $X$ associe un nombre à chaque issue ; sa loi donne les valeurs $x_i$ et leurs probabilités $p_i$, avec $\sum p_i = 1$.
> $\sum$ (sigma majuscule) veut dire « somme de ». Exemple : on gagne 5 € avec un 6, on perd 1 € sinon : $X$ vaut 5 avec probabilité $\frac16$ et $-1$ avec probabilité $\frac56$.
- Espérance : $E(X) = \sum x_i p_i = x_1p_1 + x_2p_2 + \dots$
> C'est la **moyenne** que l'on obtiendrait en répétant l'expérience un très grand nombre de fois : chaque valeur pondérée par sa probabilité.
- Variance : $V(X) = \sum p_i\big(x_i - E(X)\big)^2 = E(X^2) - E(X)^2$ ; écart-type $\sigma(X) = \sqrt{V(X)}$.
> Elle mesure la dispersion des valeurs autour de l'espérance (le risque). L'écart-type remet le résultat dans l'unité de $X$.
- Transformation affine : $E(aX + b) = aE(X) + b$ et $V(aX + b) = a^2V(X)$.
> Ajouter $b$ décale tout mais ne change pas l'écart entre les valeurs, d'où l'absence de $b$ dans la variance.
- Jeu équitable : l'espérance du gain est nulle.
> Si $E(X) > 0$, le jeu est favorable au joueur à long terme ; si $E(X) < 0$, il est défavorable.
? Gain de 5 € avec un 6, perte de 1 € sinon. Le jeu est-il équitable ?
= $E(X) = 5 \times \dfrac16 + (-1) \times \dfrac56 = \dfrac56 - \dfrac56 = 0$.
= L'espérance est nulle : le jeu est équitable.
! Le $b$ disparaît dans la variance, et $a$ y est **au carré** : $V(-2X) = 4V(X)$.

@maths-1-automatismes
- Épreuve anticipée : questions rapides et QCM **sans calculatrice**.
> Chaque question demande une technique précise : reconnaître laquelle, puis l'appliquer proprement.
- Pourcentages : coefficient multiplicateur $1 + \frac{t}{100}$ pour une hausse et $1 - \frac{t}{100}$ pour une baisse ; on multiplie les coefficients des évolutions successives.
> +20 % puis +10 % : $1{,}2 \times 1{,}1 = 1{,}32$, soit +32 % (et pas +30 %).
- Fractions, puissances de 10, ordres de grandeur, écriture scientifique.
> $\frac{3 \times 10^5}{6 \times 10^2} = 0{,}5 \times 10^3 = 500$ : on traite les nombres et les puissances de 10 séparément.
- Calcul mental : $15^2 = 225$, $25^2 = 625$ ; $x \times 0{,}5$ = moitié, $x \times 0{,}25$ = quart, $x \div 0{,}5 = 2x$.
> Diviser par 0,5 revient à multiplier par 2 : $7 \div 0{,}5 = 14$.
- Lire une courbe ou un tableau de variations, résoudre graphiquement $f(x) = k$.
> Image : on part de l'axe horizontal et on lit sur l'axe vertical. Antécédent : chemin inverse.
- Équations et inéquations du premier degré ; développer, factoriser avec les identités remarquables.
> $(x - 3)^2 = x^2 - 6x + 9$ ; $4x^2 - 9 = (2x - 3)(2x + 3)$.
- Probabilités simples, tableaux croisés et arbres.
> Sur un arbre, on multiplie le long d'une branche et on additionne les branches.
? Sans calculatrice : $\dfrac{2{,}4 \times 10^{-3}}{8 \times 10^{-5}}$.
= $\dfrac{2{,}4}{8} = 0{,}3$ et $\dfrac{10^{-3}}{10^{-5}} = 10^{-3 - (-5)} = 10^2$.
= Résultat : $0{,}3 \times 10^2 = 30$.
! Vérifier l'ordre de grandeur du résultat avant de répondre : un prix après une baisse doit être plus petit que le prix de départ.

@maths-t-recurrence
- Raisonnement par récurrence pour prouver une propriété $P(n)$ vraie pour tout $n \geq n_0$ : **initialisation** puis **hérédité**, puis conclusion.
> Image des dominos : on vérifie que le premier tombe ($P(n_0)$ vraie), puis que si un domino tombe, le suivant tombe aussi ($P(n)$ vraie entraîne $P(n+1)$ vraie). Alors ils tombent tous.
- Dans l'hérédité, on **suppose** $P(n)$ vraie pour un $n$ fixé (hypothèse de récurrence) et on démontre $P(n + 1)$.
> On part de ce qu'on veut obtenir pour $n + 1$, et on fait apparaître l'expression de $P(n)$ pour pouvoir utiliser l'hypothèse.
- Suite majorée par $M$ : $u_n \leq M$ pour tout $n$ ; minorée par $m$ : $u_n \geq m$.
> Le majorant est un « plafond » que la suite ne dépasse jamais.
- Théorème de convergence monotone : toute suite croissante et majorée converge ; toute suite décroissante et minorée converge.
> Une suite qui monte sans jamais dépasser un plafond finit par se « tasser » vers une limite. Une suite croissante non majorée tend vers $+\infty$.
- Suites géométriques : $q^n \to 0$ si $-1 < q < 1$, et $q^n \to +\infty$ si $q > 1$.
> $0{,}5^n$ : 0,5 ; 0,25 ; 0,125… se rapproche de 0. $2^n$ : 2 ; 4 ; 8 ; 16… explose. La flèche $\to$ se lit « tend vers ».
- Théorème des gendarmes : si $v_n \leq u_n \leq w_n$ et si $v_n$ et $w_n$ tendent vers $\ell$, alors $u_n$ tend aussi vers $\ell$.
> Coincée entre deux suites qui vont au même endroit, $u_n$ n'a pas le choix.
? Montrer par récurrence que $2^n \geq n + 1$ pour tout $n \geq 0$.
= Initialisation : $n = 0$, $2^0 = 1$ et $0 + 1 = 1$ ; on a bien $1 \geq 1$.
= Hérédité : on suppose $2^n \geq n + 1$. Alors $2^{n+1} = 2 \times 2^n \geq 2(n + 1) = 2n + 2 \geq n + 2$.
= Donc $2^{n+1} \geq (n + 1) + 1$ : la propriété est vraie au rang $n + 1$.
= Conclusion : elle est vraie pour tout $n \geq 0$.
? Limite de $u_n = 3 \times 0{,}8^n + 2$.
= $-1 < 0{,}8 < 1$ donc $0{,}8^n \to 0$.
= Donc $u_n \to 3 \times 0 + 2 = 2$.
! Une suite majorée par $M$ ne converge pas forcément vers $M$ : $u_n = 1 - \frac1n$ est majorée par 5 mais tend vers 1.

@maths-t-limites
- $\lim\limits_{x \to +\infty} f(x) = \ell$ : quand $x$ devient très grand, $f(x)$ se rapproche de $\ell$.
> La droite $y = \ell$ est alors une **asymptote horizontale** : la courbe s'en approche sans fin. Si la limite en $a$ est infinie, la droite verticale $x = a$ est une **asymptote verticale**.
- Limites de référence : $\dfrac1x \to 0$ en $\pm\infty$ ; $x^2$, $x^3$, $\sqrt x$, $e^x \to +\infty$ en $+\infty$ ; $e^x \to 0$ en $-\infty$.
> Diviser 1 par un très grand nombre donne un nombre minuscule.
- Formes indéterminées : $\infty - \infty$, $0 \times \infty$, $\dfrac\infty\infty$, $\dfrac00$.
> Les règles d'opérations ne concluent pas : le résultat dépend de qui « gagne ». Il faut transformer l'expression (factoriser, simplifier).
- Polynôme ou quotient de polynômes en $\pm\infty$ : factoriser par le terme de plus haut degré.
> En $+\infty$, $x^3 - 100x^2$ se comporte comme $x^3$. Et $\frac{3x^2 + 1}{x^2 - 5}$ se comporte comme $\frac{3x^2}{x^2} = 3$.
- Croissances comparées : $\lim\limits_{x \to +\infty} \dfrac{e^x}{x^n} = +\infty$, $\lim\limits_{x \to +\infty} \dfrac{\ln x}{x} = 0$, $\lim\limits_{x \to -\infty} xe^x = 0$.
> L'exponentielle l'emporte sur toute puissance de $x$, qui l'emporte sur le logarithme : $\ln x \ll x^n \ll e^x$.
- Composée : on enchaîne les limites de l'intérieur vers l'extérieur.
> $e^{-x^2}$ en $+\infty$ : $-x^2 \to -\infty$ puis $e^X \to 0$ quand $X \to -\infty$, donc la limite est 0.
? Limite de $f(x) = \dfrac{2x^2 - 3}{x^2 + 1}$ en $+\infty$.
= Forme $\dfrac\infty\infty$ : on factorise par $x^2$ en haut et en bas.
= $f(x) = \dfrac{x^2\left(2 - \frac{3}{x^2}\right)}{x^2\left(1 + \frac{1}{x^2}\right)} = \dfrac{2 - \frac{3}{x^2}}{1 + \frac{1}{x^2}}$.
= $\frac{3}{x^2} \to 0$ et $\frac{1}{x^2} \to 0$, donc $f(x) \to 2$ : asymptote horizontale $y = 2$.
! $\dfrac{1}{0^+} = +\infty$ mais $\dfrac{1}{0^-} = -\infty$ : regarder de quel côté de 0 se trouve le dénominateur.

@maths-t-continuite
- $f$ est continue sur un intervalle si sa courbe se trace **sans lever le crayon**.
> Les polynômes, l'exponentielle, le logarithme, les fonctions dérivables sont continues sur leur ensemble de définition.
- Théorème des valeurs intermédiaires (TVI) : si $f$ est continue sur $[a ; b]$ et si $k$ est compris entre $f(a)$ et $f(b)$, l'équation $f(x) = k$ a **au moins une** solution dans $[a ; b]$.
> Pour passer de $f(a)$ à $f(b)$ sans lever le crayon, la courbe traverse forcément toutes les hauteurs intermédiaires. Souvent $k = 0$ : si $f(a) < 0 < f(b)$, $f$ s'annule entre $a$ et $b$.
- Si de plus $f$ est **strictement monotone** sur $[a ; b]$, la solution est **unique**.
> Monotone : toujours croissante ou toujours décroissante, donc la courbe ne traverse la hauteur $k$ qu'une seule fois.
- Dichotomie : on coupe l'intervalle en deux et on garde la moitié où $f$ change de signe.
> Chaque étape divise l'erreur par 2 : on encadre la solution de plus en plus précisément.
- Suite $u_{n+1} = f(u_n)$ : si elle converge vers $\ell$ et que $f$ est continue, alors $f(\ell) = \ell$.
> On trouve la limite en résolvant l'équation $f(x) = x$ (« point fixe »).
? Montrer que $x^3 + x - 1 = 0$ a une unique solution dans $[0 ; 1]$.
= $f(x) = x^3 + x - 1$ est continue et $f'(x) = 3x^2 + 1 > 0$, donc $f$ est strictement croissante.
= $f(0) = -1 < 0$ et $f(1) = 1 > 0$ : 0 est compris entre $f(0)$ et $f(1)$.
= D'après le TVI (cas strictement monotone), l'équation a une unique solution dans $[0 ; 1]$.
! Sans continuité, le TVI ne s'applique pas : la courbe pourrait « sauter » par-dessus la valeur $k$.

@maths-t-convexite
- Dérivée d'une composée : $\big(g(u(x))\big)' = u'(x) \times g'\big(u(x)\big)$.
> On dérive la fonction « extérieure » en gardant l'intérieur, puis on multiplie par la dérivée de l'intérieur. Cas utiles : $(\sqrt u)' = \dfrac{u'}{2\sqrt u}$, $(u^n)' = nu'u^{n-1}$, $(e^u)' = u'e^u$.
- Dérivée seconde $f''$ : la dérivée de la dérivée.
> $f(x) = x^3$ donne $f'(x) = 3x^2$ puis $f''(x) = 6x$.
- $f$ convexe sur $I$ $\iff f'$ croissante $\iff f'' \geq 0$ sur $I$.
> Convexe = courbe en forme de **U** (« creux »), située **au-dessus** de toutes ses tangentes. La pente augmente.
- $f$ concave sur $I$ $\iff f'' \leq 0$ sur $I$.
> Concave = courbe en forme de **∩** (« bosse »), située **en dessous** de ses tangentes.
- Point d'inflexion : $f''$ s'annule **en changeant de signe** ; la courbe traverse sa tangente.
> C'est le point où la courbe passe d'un creux à une bosse (ou l'inverse). Pour $x^3$, c'est l'origine.
- Exemples : $e^x$ et $x^2$ sont convexes ; $\ln x$ et $\sqrt x$ sont concaves.
> Une inégalité de convexité : $e^x \geq x + 1$ pour tout $x$ (la courbe est au-dessus de sa tangente en 0).
? Étudier la convexité de $f(x) = x^3 - 3x^2 + 2$.
= $f'(x) = 3x^2 - 6x$, puis $f''(x) = 6x - 6$.
= $f''(x) < 0$ si $x < 1$ (concave) et $f''(x) > 0$ si $x > 1$ (convexe).
= Point d'inflexion en $x = 1$, de coordonnées $(1 ; f(1)) = (1 ; 0)$.
! La convexité se lit sur le signe de $f''$, pas de $f'$ (qui donne les variations).

@maths-t-ln
- Le logarithme népérien $\ln$ est la fonction réciproque de $\exp$ : pour $x > 0$, $y = \ln x \iff x = e^y$.
> $\ln x$ répond à la question « à quelle puissance faut-il élever $e$ pour obtenir $x$ ? ». $\ln e = 1$ car $e^1 = e$, et $\ln 1 = 0$ car $e^0 = 1$. Donc $e^{\ln x} = x$ et $\ln(e^x) = x$.
- Domaine : $\ln$ n'est définie que sur $]0 ; +\infty[$.
> On ne prend le logarithme que de nombres **strictement positifs**. $\ln x < 0$ sur $]0 ; 1[$ et $\ln x > 0$ pour $x > 1$.
- Règles : $\ln(ab) = \ln a + \ln b$, $\ln\dfrac ab = \ln a - \ln b$, $\ln(a^n) = n\ln a$, $\ln\sqrt a = \dfrac12\ln a$.
> Le logarithme transforme les produits en sommes et les puissances en multiplications. $\ln 8 = \ln(2^3) = 3\ln 2$.
- Résoudre une équation avec exponentielle : $e^x = k$ (avec $k > 0$) $\iff x = \ln k$.
> Le logarithme « fait descendre » l'exposant : $e^{2x} = 5$ donne $2x = \ln 5$, puis $x = \frac{\ln 5}{2}$.
- Résoudre $a^n \geq b$ : $n\ln a \geq \ln b$ ; si $0 < a < 1$, $\ln a < 0$ et l'inégalité **change de sens** en divisant.
> Typique des suites : « à partir de quel rang $0{,}9^n < 0{,}01$ ? » : $n > \frac{\ln 0{,}01}{\ln 0{,}9} \approx 43{,}7$, donc dès $n = 44$.
- Dérivées : $(\ln x)' = \dfrac1x$ et $(\ln u)' = \dfrac{u'}{u}$.
> $\big(\ln(x^2 + 1)\big)' = \frac{2x}{x^2 + 1}$.
- Limites : $\lim\limits_{x \to 0^+} \ln x = -\infty$ et $\lim\limits_{x \to +\infty} \ln x = +\infty$.
> $0^+$ veut dire « on s'approche de 0 par la droite, avec des nombres positifs ». La courbe longe l'axe vertical vers le bas près de 0 et monte très lentement ensuite.
? Résoudre $e^{3x - 1} = 7$.
= On applique $\ln$ : $3x - 1 = \ln 7$.
= $x = \dfrac{1 + \ln 7}{3}$.
? Plus petit entier $n$ tel que $2^n > 1\,000$.
= On applique $\ln$ (croissante) : $n\ln 2 > \ln 1\,000$, donc $n > \dfrac{\ln 1\,000}{\ln 2} \approx 9{,}97$.
= Donc $n = 10$ (vérification : $2^{10} = 1\,024$).
! $\ln(a + b) \neq \ln a + \ln b$ : c'est $\ln(ab)$ qui vaut $\ln a + \ln b$.

@maths-t-primitives
- $F$ est une primitive de $f$ si $F' = f$.
> C'est le chemin inverse de la dérivation : on cherche une fonction dont la dérivée est $f$. Deux primitives d'une même fonction diffèrent d'une constante : $x^2$ et $x^2 + 7$ sont toutes deux des primitives de $2x$.
- Primitives usuelles : $a \to ax$, $x^n \to \dfrac{x^{n+1}}{n+1}$, $\dfrac1x \to \ln x$ ($x > 0$), $e^x \to e^x$, $\dfrac{1}{x^2} \to -\dfrac1x$.
> Pour $x^n$, on **ajoute 1** à l'exposant puis on **divise** par le nouvel exposant : une primitive de $x^3$ est $\frac{x^4}{4}$. On vérifie en dérivant.
- Formes composées : $u'e^u \to e^u$, $\dfrac{u'}{u} \to \ln u$ ($u > 0$), $u'u^n \to \dfrac{u^{n+1}}{n+1}$.
> On repère $u$ et sa dérivée $u'$ dans l'expression. Pour $2xe^{x^2}$ : $u = x^2$ et $u' = 2x$, donc une primitive est $e^{x^2}$.
- Équation différentielle $y' = ay$ : solutions $y(x) = Ce^{ax}$ ($C$ réel).
> Une équation différentielle a pour inconnue une **fonction**. « La variation est proportionnelle à la quantité » (population, radioactivité) mène à une exponentielle.
- $y' = ay + b$ ($a \neq 0$) : solutions $y(x) = Ce^{ax} - \dfrac ba$.
> $-\frac ba$ est la solution constante (celle où $y' = 0$). La constante $C$ se fixe avec une condition initiale.
? Primitive de $f(x) = 3x^2 - 4x + 5$.
= Terme par terme : $3 \times \dfrac{x^3}{3} - 4 \times \dfrac{x^2}{2} + 5x$.
= $F(x) = x^3 - 2x^2 + 5x$ (plus une constante éventuelle).
? Résoudre $y' = 2y$ avec $y(0) = 3$.
= Solutions générales : $y(x) = Ce^{2x}$.
= $y(0) = Ce^0 = C = 3$, donc $y(x) = 3e^{2x}$.
! La constante $C$ se fixe avec la condition initiale ; et toujours vérifier une primitive en la dérivant.

@maths-t-integrale
- Si $f$ est continue et positive sur $[a ; b]$, $\displaystyle\int_a^b f(x)\,dx$ est l'**aire** sous la courbe, entre $x = a$ et $x = b$.
> Le signe $\int$ est un S allongé (« somme ») : on additionne une infinité de fines bandes de hauteur $f(x)$ et de largeur $dx$. Le résultat est en unités d'aire.
- Calcul : $\displaystyle\int_a^b f(x)\,dx = F(b) - F(a)$, où $F$ est une primitive de $f$.
> On note aussi $\big[F(x)\big]_a^b$. On cherche une primitive, puis on calcule « valeur en haut moins valeur en bas ».
- Linéarité et relation de Chasles : $\displaystyle\int_a^b f + \int_b^c f = \int_a^c f$.
> On peut découper l'intervalle en morceaux, et sortir les constantes multiplicatives de l'intégrale.
- Positivité : si $f \geq 0$ sur $[a ; b]$ (avec $a \leq b$), alors $\displaystyle\int_a^b f \geq 0$.
> Plus généralement, si $f \leq g$, alors $\int_a^b f \leq \int_a^b g$ : on peut comparer des intégrales sans les calculer.
- Valeur moyenne : $\mu = \dfrac{1}{b - a}\displaystyle\int_a^b f(x)\,dx$.
> C'est la hauteur du rectangle de même base et de même aire que la surface sous la courbe.
- Aire entre deux courbes, si $f \geq g$ sur $[a ; b]$ : $\displaystyle\int_a^b \big(f(x) - g(x)\big)\,dx$.
> Toujours « courbe du dessus moins courbe du dessous ».
? Calculer $\displaystyle\int_0^2 (3x^2 + 1)\,dx$.
= Une primitive est $F(x) = x^3 + x$.
= $F(2) - F(0) = (8 + 2) - 0 = 10$.
? Valeur moyenne de $f(x) = 2x$ sur $[0 ; 3]$.
= $\displaystyle\int_0^3 2x\,dx = \big[x^2\big]_0^3 = 9$.
= $\mu = \dfrac{1}{3 - 0} \times 9 = 3$.
! Si $f$ est négative, l'intégrale vaut l'**opposé** de l'aire (elle est négative).

@maths-t-binomiale
- Épreuve de Bernoulli : expérience à deux issues, succès (probabilité $p$) ou échec (probabilité $1 - p$).
> Lancer une pièce, tirer une boule rouge ou non, réussir un tir ou non.
- Schéma de Bernoulli : on répète $n$ fois la même épreuve de façon **indépendante**. $X$ = nombre de succès suit la loi binomiale $\mathcal{B}(n ; p)$.
> $X \sim \mathcal{B}(n ; p)$ se lit « $X$ suit la loi binomiale de paramètres $n$ et $p$ ». $X$ peut valoir 0, 1, 2… jusqu'à $n$.
- Probabilité de $k$ succès : $P(X = k) = \dbinom nk p^k (1 - p)^{n - k}$.
> Chaque chemin de l'arbre avec $k$ succès et $n - k$ échecs a pour probabilité $p^k(1-p)^{n-k}$. Le coefficient $\binom nk$ (« k parmi n ») compte combien il y a de tels chemins.
- Coefficient binomial : $\dbinom nk = \dfrac{n!}{k!\,(n - k)!}$, avec $\dbinom n0 = \dbinom nn = 1$ et $\dbinom n1 = n$.
> $n!$ (« factorielle n ») vaut $1 \times 2 \times \dots \times n$ : $4! = 24$. Exemple : $\binom 42 = \frac{24}{2 \times 2} = 6$.
- Espérance et variance : $E(X) = np$, $V(X) = np(1 - p)$, $\sigma(X) = \sqrt{np(1 - p)}$.
> Sur 100 lancers d'une pièce, on attend en moyenne $100 \times 0{,}5 = 50$ piles.
? On lance 4 fois une pièce équilibrée. Probabilité d'obtenir exactement 2 piles ?
= $X \sim \mathcal{B}(4 ; 0{,}5)$ et $\dbinom 42 = 6$.
= $P(X = 2) = 6 \times 0{,}5^2 \times 0{,}5^2 = 6 \times 0{,}0625 = 0{,}375$.
? Un tireur réussit 70 % de ses tirs. Sur 10 tirs, combien de réussites en moyenne ?
= $E(X) = np = 10 \times 0{,}7 = 7$.
! « Au moins un succès » : $P(X \geq 1) = 1 - P(X = 0) = 1 - (1 - p)^n$.

@maths-t-denombrement
- Principe multiplicatif : pour des choix successifs, on **multiplie** les nombres de possibilités.
> 3 entrées, 4 plats et 2 desserts donnent $3 \times 4 \times 2 = 24$ menus.
- $k$-uplets (listes avec répétition possible, l'ordre compte) : $n^k$.
> Un code de 4 chiffres : $10^4 = 10\,000$ possibilités (chaque chiffre peut être répété).
- Factorielle : $n! = 1 \times 2 \times \dots \times n$, nombre de façons de ranger $n$ objets (permutations).
> 5 personnes sur un banc : $5! = 120$ rangements. Par convention $0! = 1$.
- Arrangements (l'ordre compte, sans répétition) : $\dfrac{n!}{(n - k)!} = n \times (n - 1) \times \dots$ ($k$ facteurs).
> Podium (or, argent, bronze) parmi 10 coureurs : $10 \times 9 \times 8 = 720$.
- Combinaisons (l'ordre ne compte pas) : $\dbinom nk = \dfrac{n!}{k!\,(n - k)!}$.
> Choisir 3 délégués parmi 10 sans rôle particulier : $\binom{10}{3} = \frac{720}{3!} = 120$. On divise les arrangements par $k!$ car chaque groupe a été compté $k!$ fois.
- Propriétés : $\dbinom nk = \dbinom n{n-k}$ ; relation de Pascal $\dbinom nk + \dbinom n{k+1} = \dbinom{n+1}{k+1}$ ; un ensemble à $n$ éléments a $2^n$ parties.
> Choisir les 3 qui partent revient à choisir les 7 qui restent : $\binom{10}{3} = \binom{10}{7}$.
? Combien de mains de 2 cartes dans un jeu de 32 ?
= L'ordre ne compte pas : $\dbinom{32}{2} = \dfrac{32 \times 31}{2} = 496$.
? Combien de mots de passe de 3 lettres distinctes (alphabet de 26) ?
= L'ordre compte, sans répétition : $26 \times 25 \times 24 = 15\,600$.
! Se demander si l'ordre compte : oui, arrangement (ou liste) ; non, combinaison.

@maths-t-espace
- Repère de l'espace : un point a trois coordonnées $(x ; y ; z)$, un vecteur aussi : $\overrightarrow{AB}(x_B - x_A ; y_B - y_A ; z_B - z_A)$.
> Mêmes règles que dans le plan avec une troisième coordonnée $z$ (la hauteur).
- Droite passant par $A$ et dirigée par $\vec u(a ; b ; c)$ : représentation paramétrique $x = x_A + ta$, $y = y_A + tb$, $z = z_A + tc$ ($t$ réel).
> Chaque valeur du paramètre $t$ donne un point de la droite : on part de $A$ et on avance de $t$ fois le vecteur $\vec u$.
- Plan : équation cartésienne $ax + by + cz + d = 0$, où $\vec n(a ; b ; c)$ est un vecteur **normal** au plan.
> Normal = perpendiculaire au plan (comme un mât planté droit sur un sol). On lit directement ses coordonnées devant $x$, $y$ et $z$.
- Produit scalaire : $\vec u \cdot \vec v = xx' + yy' + zz'$ ; $\vec u$ et $\vec v$ sont orthogonaux si ce produit est nul.
> Sert à vérifier qu'une droite est perpendiculaire à un plan, ou qu'un vecteur est normal à un plan.
- Distance : $AB = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$.
> Pythagore appliqué deux fois.
- Une droite est orthogonale à un plan si son vecteur directeur est colinéaire à un vecteur normal du plan.
> Pour savoir si une droite coupe un plan, on remplace $x$, $y$, $z$ de la représentation paramétrique dans l'équation du plan et on cherche $t$.
? Le point $A(1 ; 2 ; 3)$ appartient-il au plan $2x - y + z - 3 = 0$ ?
= On remplace : $2 \times 1 - 2 + 3 - 3 = 0$.
= L'équation est vérifiée : oui, $A$ est dans le plan.
? Intersection de la droite $x = t$, $y = 1 + t$, $z = 2t$ avec le plan $x + y + z = 9$.
= On remplace : $t + (1 + t) + 2t = 9$, donc $4t = 8$ et $t = 2$.
= Point d'intersection : $(2 ; 3 ; 4)$.
! Deux droites non parallèles de l'espace ne sont pas forcément sécantes : elles peuvent être non coplanaires.
`;
