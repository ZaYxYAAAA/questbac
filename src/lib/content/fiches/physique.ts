/**
 * Fiches de révision — physique-chimie.
 * Chaque formule est suivie de ce que représente chaque lettre, avec son unité (« > »),
 * et d'exemples corrigés (« ? » / « = »).
 */
export const PHYSIQUE = String.raw`
@pc-2-atome
- Notation d'un noyau : $_{Z}^{A}\mathrm{X}$, avec $Z$ le numéro atomique et $A$ le nombre de nucléons.
> $Z$ (en bas) = nombre de **protons** ; $A$ (en haut) = nombre de **nucléons** (protons + neutrons). Donc $N = A - Z$ neutrons. Un atome neutre a autant d'électrons que de protons : $Z$ électrons.
- Le noyau concentre presque toute la masse ; l'atome est surtout du vide (rayon environ 100 000 fois celui du noyau).
> Un proton ou un neutron pèse environ 2 000 fois plus qu'un électron.
- Isotopes : même $Z$, mais $A$ différents.
> Même élément chimique, nombre de neutrons différent : $^{12}_{6}\mathrm{C}$ et $^{14}_{6}\mathrm{C}$ sont deux isotopes du carbone.
- Configuration électronique : on remplit $1s^2\,2s^2\,2p^6\,3s^2\,3p^6$… dans cet ordre.
> Le chiffre est la couche, la lettre la sous-couche, l'exposant le nombre d'électrons ($s$ en contient 2 au maximum, $p$ 6). Les électrons de la dernière couche sont les électrons de **valence** : ce sont eux qui font la chimie.
- Ions : un atome perd (cation, +) ou gagne (anion, −) des électrons pour avoir la structure du gaz noble le plus proche.
> Le sodium Na ($Z = 11$) perd 1 électron et devient $\mathrm{Na^+}$ ; le chlore Cl ($Z = 17$) en gagne 1 et devient $\mathrm{Cl^-}$.
- Charge élémentaire : $e = 1{,}6 \times 10^{-19}$ C.
> C'est la charge d'un proton (celle d'un électron est $-e$). Le coulomb (C) est l'unité de charge électrique.
? Composition de $^{27}_{13}\mathrm{Al}$.
= $Z = 13$ : 13 protons et 13 électrons (atome neutre).
= $N = A - Z = 27 - 13 = 14$ neutrons.
? Configuration électronique de l'oxygène ($Z = 8$).
= On place 8 électrons : $1s^2\,2s^2\,2p^4$.
= Couche de valence : la 2e, avec $2 + 4 = 6$ électrons de valence.
! L'élément chimique est défini par $Z$, pas par $A$.

@pc-2-mole
- Une mole contient $N_A = 6{,}02 \times 10^{23}$ entités (constante d'Avogadro).
> La mole est un « paquet » d'atomes ou de molécules, comme une douzaine vaut 12. Ce nombre énorme permet de passer de l'échelle microscopique à des quantités qu'on peut peser.
- Quantité de matière à partir d'un nombre d'entités : $n = \dfrac{N}{N_A}$.
> $n$ : quantité de matière (mol) ; $N$ : nombre d'entités (sans unité) ; $N_A$ en $\text{mol}^{-1}$.
- Quantité de matière à partir d'une masse : $n = \dfrac{m}{M}$.
> $m$ : masse (g) ; $M$ : masse molaire, c'est-à-dire la masse d'une mole (g/mol) ; $n$ en mol.
- Masse molaire d'une molécule : somme des masses molaires des atomes qui la composent.
> $M(\mathrm{H_2O}) = 2 \times M(\mathrm{H}) + M(\mathrm{O}) = 2 \times 1 + 16 = 18$ g/mol.
- Masse d'une seule entité : $m_{\text{entité}} = \dfrac{M}{N_A}$.
> Une molécule d'eau pèse $\frac{18}{6{,}02 \times 10^{23}} \approx 3 \times 10^{-23}$ g.
? Quantité de matière dans 36 g d'eau.
= $M(\mathrm{H_2O}) = 18$ g/mol.
= $n = \dfrac{m}{M} = \dfrac{36}{18} = 2$ mol.
? Masse de 0,5 mol de dioxyde de carbone $\mathrm{CO_2}$ ($M = 44$ g/mol).
= On isole $m$ : $m = n \times M = 0{,}5 \times 44 = 22$ g.
! La masse doit être en grammes quand $M$ est en g/mol : convertir les kilogrammes ($1$ kg $= 1\,000$ g).

@pc-2-solutions
- Solution = solvant + soluté(s) ; elle est aqueuse si le solvant est l'eau.
> Le soluté est l'espèce dissoute (sel, sucre), le solvant celle qui dissout (souvent l'eau).
- Concentration en masse : $C_m = \dfrac{m}{V}$.
> $m$ : masse de soluté dissous (g) ; $V$ : volume de la **solution** (L) ; $C_m$ en g/L. Exemple : 10 g de sel dans 0,5 L donnent 20 g/L.
- Concentration en quantité de matière : $C = \dfrac nV$, et $C_m = C \times M$.
> $n$ en mol, $V$ en L, donc $C$ en mol/L ; $M$ est la masse molaire du soluté (g/mol).
- Dilution : $C_0 \times V_0 = C_1 \times V_1$.
> On ajoute de l'eau, mais la quantité de soluté prélevée ne change pas ($n = CV$ reste la même). $C_0$, $V_0$ : solution mère et volume prélevé ; $C_1$, $V_1$ : solution fille et volume final.
- Facteur de dilution : $F = \dfrac{C_0}{C_1} = \dfrac{V_1}{V_0}$.
> Diluer 10 fois : la concentration est divisée par 10, et le volume final est 10 fois le volume prélevé.
- Préparer une solution : peser le soluté, le verser dans une fiole jaugée, dissoudre, compléter avec de l'eau jusqu'au trait de jauge, agiter.
> Pour une dilution : on prélève $V_0$ avec une pipette jaugée.
? On veut 100 mL d'une solution à 0,1 mol/L à partir d'une solution à 1 mol/L. Quel volume prélever ?
= $V_0 = \dfrac{C_1 V_1}{C_0} = \dfrac{0{,}1 \times 100}{1} = 10$ mL.
= Facteur de dilution : $F = \dfrac{1}{0{,}1} = 10$.
! $C_m$ (masse de soluté par litre de solution) n'est pas la masse volumique de la solution (masse de la solution entière par litre).

@pc-2-transformations
- Transformation physique : changement d'état, les espèces chimiques ne changent pas.
> Solide → liquide : fusion ; liquide → solide : solidification ; liquide → gaz : vaporisation ; gaz → liquide : liquéfaction ; solide → gaz : sublimation ; gaz → solide : condensation.
- Transformation chimique : réactifs → produits, décrite par une équation **ajustée**.
> Ajuster, c'est placer des nombres devant les formules pour que chaque élément et les charges soient en même quantité des deux côtés : $\mathrm{CH_4} + 2\,\mathrm{O_2} \to \mathrm{CO_2} + 2\,\mathrm{H_2O}$.
- Transformation nucléaire : ce sont les noyaux qui changent (fission, fusion) ; $A$ et $Z$ se conservent.
> La fission casse un gros noyau (centrales nucléaires), la fusion assemble de petits noyaux (Soleil).
- Énergie d'un changement d'état : $Q = m \times L$.
> $Q$ : énergie échangée (J) ; $m$ : masse (kg) ; $L$ : énergie massique de changement d'état (J/kg). Faire fondre 1 kg de glace demande $L_{\text{fusion}} \approx 334$ kJ.
- Réactif limitant : celui qui est entièrement consommé le premier, ce qui arrête la réaction.
> L'autre réactif est alors en excès : il en reste à la fin.
? Énergie pour faire fondre 200 g de glace ($L = 334$ kJ/kg).
= On convertit : $m = 0{,}2$ kg.
= $Q = 0{,}2 \times 334 = 66{,}8$ kJ.
! Endothermique : le système absorbe de l'énergie (fusion, vaporisation) ; exothermique : il en libère (combustion, solidification).

@pc-2-mouvement
- Le mouvement dépend du référentiel : l'objet par rapport auquel on l'observe.
> Un passager assis dans un train est immobile par rapport au train, mais en mouvement par rapport au quai. Référentiels usuels : terrestre, géocentrique (centre de la Terre), héliocentrique (centre du Soleil).
- Vitesse moyenne : $v = \dfrac{d}{t}$.
> $d$ : distance (m) ; $t$ : durée (s) ; $v$ en m/s. Conversion : 1 m/s = 3,6 km/h, donc on multiplie par 3,6 pour passer en km/h.
- Poids : $P = m \times g$.
> $P$ : poids, une force (N, newtons) ; $m$ : masse (kg) ; $g$ : intensité de la pesanteur, environ 9,8 N/kg sur Terre (1,6 sur la Lune).
- Gravitation universelle : $F = G \times \dfrac{m_A \times m_B}{d^2}$.
> $G = 6{,}67 \times 10^{-11}$ N·m²/kg² ; $m_A$, $m_B$ : masses (kg) ; $d$ : distance entre les centres (m). Si la distance double, la force est divisée par 4.
- Principe d'inertie : si les forces se compensent, l'objet est immobile ou en mouvement rectiligne uniforme (et réciproquement).
> « Rectiligne uniforme » : en ligne droite, à vitesse constante. Sans force pour le freiner, un palet glisse indéfiniment.
- Principe des actions réciproques : $\vec F_{A/B} = -\vec F_{B/A}$.
> Si A pousse B, B pousse A avec une force de même valeur et de sens opposé.
? Une voiture parcourt 90 km en 1 h 30. Vitesse moyenne en km/h et en m/s ?
= $v = \dfrac{90}{1{,}5} = 60$ km/h.
= En m/s : $\dfrac{60}{3{,}6} \approx 16{,}7$ m/s.
? Poids d'un sac de 5 kg sur Terre.
= $P = m \times g = 5 \times 9{,}8 = 49$ N.
! Masse (kg, la quantité de matière, la même partout) et poids (N, une force, qui dépend de l'astre) sont deux grandeurs différentes.

@pc-2-ondes
- Période et fréquence : $f = \dfrac1T$.
> $T$ : période, durée d'un motif qui se répète (s) ; $f$ : fréquence, nombre de motifs par seconde (Hz). Une période de 0,01 s donne 100 Hz.
- Son : onde mécanique, $v \approx 340$ m/s dans l'air ; il ne se propage pas dans le vide ; audible de 20 Hz à 20 kHz.
> Il a besoin d'un milieu matériel (air, eau, solide) pour se propager. En dessous de 20 Hz : infrasons ; au-dessus de 20 kHz : ultrasons.
- Hauteur, timbre et niveau sonore.
> La **hauteur** (grave ou aigu) dépend de la fréquence ; le **timbre** (ce qui distingue un piano d'une guitare) dépend de la forme du signal ; le **niveau sonore** se mesure en décibels (dB).
- Lumière : $c = 3{,}0 \times 10^8$ m/s dans le vide ; visible de 400 nm (violet) à 800 nm (rouge).
> 1 nm (nanomètre) $= 10^{-9}$ m.
- Réfraction : $n_1 \sin i_1 = n_2 \sin i_2$ ; réflexion : $i = r$.
> La lumière change de direction en changeant de milieu. $n$ : indice de réfraction (sans unité, 1 pour l'air, 1,33 pour l'eau) ; $i_1$, $i_2$ : angles mesurés par rapport à la **normale** (la perpendiculaire à la surface).
- Spectre continu (corps chaud) ou spectre de raies (gaz), qui est la signature d'un élément.
> Plus un corps est chaud, plus son spectre s'étend vers le bleu.
? Lumière passant de l'air ($n_1 = 1$) à l'eau ($n_2 = 1{,}33$) avec $i_1 = 30°$. Angle de réfraction ?
= $\sin i_2 = \dfrac{n_1 \sin i_1}{n_2} = \dfrac{1 \times 0{,}5}{1{,}33} \approx 0{,}376$.
= $i_2 \approx 22°$ : le rayon se rapproche de la normale.
! Les angles se mesurent par rapport à la normale, pas par rapport à la surface.

@pc-2-electricite
- Loi des nœuds : la somme des intensités qui arrivent à un nœud est égale à la somme de celles qui en partent.
> Le courant ne se perd pas : s'il arrive 3 A et qu'il repart 1 A d'un côté, il repart 2 A de l'autre.
- Loi des mailles : dans un circuit en série, la tension du générateur est égale à la somme des tensions des récepteurs.
> Une tension se mesure entre deux points, en volts (V).
- Loi d'Ohm : $U = R \times I$.
> $U$ : tension aux bornes de la résistance (V) ; $R$ : résistance (Ω, ohms) ; $I$ : intensité du courant (A, ampères). Résistances en série : $R_{eq} = R_1 + R_2$.
- Ampèremètre branché en série ; voltmètre branché en dérivation.
> L'ampèremètre mesure le courant qui le traverse, le voltmètre compare deux points du circuit.
- Puissance électrique : $P = U \times I$ ; énergie : $E = P \times t$.
> $P$ en watts (W), $t$ en secondes donne $E$ en joules (J) ; avec $t$ en heures et $P$ en kW, $E$ est en kWh.
- Capteur : convertit une grandeur physique (température, lumière…) en grandeur électrique.
> Une thermistance voit sa résistance changer avec la température.
? Une résistance de 220 Ω est traversée par 0,05 A. Tension à ses bornes ?
= $U = R \times I = 220 \times 0{,}05 = 11$ V.
! En dérivation, la tension est la même sur chaque branche ; ce sont les intensités qui se partagent.

@pc-1-avancement
- Tableau d'avancement : état initial, état intermédiaire (avancement $x$), état final ($x_f$).
> L'avancement $x$ (en mol) mesure « combien de fois » la réaction a eu lieu. Il permet de suivre toutes les quantités avec une seule inconnue.
- Pour $a\,\mathrm{A} + b\,\mathrm{B} \to c\,\mathrm{C} + d\,\mathrm{D}$ : il reste $n_A - ax$ et $n_B - bx$ ; il s'est formé $cx$ et $dx$.
> Les coefficients $a$, $b$, $c$, $d$ de l'équation disent dans quelles proportions on consomme et on fabrique.
- Avancement maximal : $x_{max}$ est la plus petite des valeurs $\dfrac{n_A}{a}$ et $\dfrac{n_B}{b}$.
> On cherche quand chaque réactif serait épuisé ($n_A - ax = 0$) ; le premier épuisé est le **réactif limitant**.
- Mélange stœchiométrique : $\dfrac{n_A}{a} = \dfrac{n_B}{b}$.
> Les réactifs sont dans les proportions exactes de l'équation : ils s'épuisent en même temps.
- Transformation totale : $x_f = x_{max}$.
> Si $x_f < x_{max}$, la transformation est non totale (elle s'arrête avant, à l'équilibre).
? $2\,\mathrm{H_2} + \mathrm{O_2} \to 2\,\mathrm{H_2O}$ avec 3 mol de $\mathrm{H_2}$ et 2 mol de $\mathrm{O_2}$.
= $\mathrm{H_2}$ épuisé si $3 - 2x = 0$, soit $x = 1{,}5$ mol ; $\mathrm{O_2}$ épuisé si $2 - x = 0$, soit $x = 2$ mol.
= $x_{max} = 1{,}5$ mol : $\mathrm{H_2}$ est limitant.
= État final : 0 mol de $\mathrm{H_2}$, $2 - 1{,}5 = 0{,}5$ mol de $\mathrm{O_2}$ et $2 \times 1{,}5 = 3$ mol d'eau.
! Tenir compte des coefficients avant de comparer les quantités : le réactif en plus petite quantité n'est pas forcément le limitant.

@pc-1-redox
- Oxydant : espèce capable de **capter** des électrons ; réducteur : espèce capable d'en **céder**.
> Moyen mnémotechnique : « un oxydant est gourmand en électrons ».
- Couple oxydant/réducteur : demi-équation $\mathrm{Ox} + n\,e^- = \mathrm{Red}$.
> Exemple : $\mathrm{Cu^{2+}} + 2e^- = \mathrm{Cu}$ pour le couple $\mathrm{Cu^{2+}/Cu}$. On ajuste les éléments, puis les charges avec les électrons $e^-$.
- Oxydation = perte d'électrons ; réduction = gain d'électrons.
> « Le réducteur est oxydé » : il perd ses électrons.
- Équation bilan : on combine deux demi-équations (l'une à l'envers) pour que les électrons s'éliminent.
> On multiplie si besoin les demi-équations pour avoir le même nombre d'électrons : ceux cédés par l'un sont captés par l'autre.
- En milieu acide, on ajuste l'oxygène avec $\mathrm{H_2O}$ et l'hydrogène avec $\mathrm{H^+}$.
> $\mathrm{MnO_4^-} + 8\,\mathrm{H^+} + 5e^- = \mathrm{Mn^{2+}} + 4\,\mathrm{H_2O}$.
? Écrire la réaction entre $\mathrm{Cu^{2+}}$ et le zinc Zn (couples $\mathrm{Cu^{2+}/Cu}$ et $\mathrm{Zn^{2+}/Zn}$).
= Réduction : $\mathrm{Cu^{2+}} + 2e^- \to \mathrm{Cu}$.
= Oxydation : $\mathrm{Zn} \to \mathrm{Zn^{2+}} + 2e^-$.
= Bilan (2 électrons de chaque côté, ils s'éliminent) : $\mathrm{Cu^{2+}} + \mathrm{Zn} \to \mathrm{Cu} + \mathrm{Zn^{2+}}$.
! L'oxydant subit une réduction, le réducteur subit une oxydation.

@pc-1-lewis
- Schéma de Lewis : on représente les doublets **liants** (traits entre atomes) et **non liants** (traits autour d'un atome).
> Chaque atome cherche à s'entourer de 8 électrons (règle de l'**octet**) ; l'hydrogène seulement de 2 (règle du **duet**).
- Nombre de liaisons formées : H en forme 1, O 2, N 3, C 4.
> C'est le nombre d'électrons qui manquent pour compléter la couche externe : O a 6 électrons de valence, il lui en manque 2.
- Géométrie : $\mathrm{CH_4}$ tétraédrique, $\mathrm{NH_3}$ pyramidale, $\mathrm{H_2O}$ coudée, $\mathrm{CO_2}$ linéaire.
> Les doublets (liants et non liants) se repoussent et s'écartent au maximum.
- Électronégativité : capacité d'un atome à attirer les électrons d'une liaison.
> Si les deux atomes ont des électronégativités différentes, la liaison est **polarisée** : charge partielle $\delta^-$ sur le plus électronégatif, $\delta^+$ sur l'autre. O, N et Cl sont très électronégatifs.
- Molécule polaire : les charges partielles ne se compensent pas. « Qui se ressemble s'assemble » : une espèce polaire se dissout dans un solvant polaire (l'eau).
> Le sel et le sucre se dissolvent dans l'eau, l'huile non.
? Combien de liaisons et de doublets non liants pour l'oxygène dans $\mathrm{H_2O}$ ?
= O a 6 électrons de valence : il forme 2 liaisons (avec les 2 H).
= Il lui reste $6 - 2 = 4$ électrons, soit 2 doublets non liants.
! $\mathrm{CO_2}$ a des liaisons polarisées mais la molécule est apolaire : elle est linéaire, les deux effets se compensent.

@pc-1-energie
- Énergie cinétique : $E_c = \dfrac12 m v^2$.
> L'énergie liée à la vitesse. $m$ : masse (kg) ; $v$ : vitesse (m/s) ; $E_c$ en joules (J). Doubler la vitesse multiplie l'énergie par 4.
- Énergie potentielle de pesanteur : $E_{pp} = m \times g \times z$.
> L'énergie liée à l'altitude. $g \approx 9{,}8$ N/kg ; $z$ : altitude (m) par rapport à une référence choisie.
- Énergie mécanique : $E_m = E_c + E_{pp}$ ; elle est constante s'il n'y a pas de frottements.
> En tombant, l'objet perd de l'énergie potentielle et gagne autant d'énergie cinétique. Avec des frottements, $E_m$ diminue (l'énergie part en chaleur).
- Travail d'une force constante : $W_{AB}(\vec F) = F \times AB \times \cos\alpha$.
> $F$ : valeur de la force (N) ; $AB$ : déplacement (m) ; $\alpha$ : angle entre la force et le déplacement. $W > 0$ : la force aide le mouvement (travail moteur) ; $W < 0$ : elle le freine (résistant).
- Théorème de l'énergie cinétique : $\Delta E_c = E_c(B) - E_c(A) = \sum W_{AB}(\vec F)$.
> La variation d'énergie cinétique entre A et B est égale à la somme des travaux de toutes les forces. Le symbole $\Delta$ veut dire « variation » (final − initial).
? Une balle de 0,5 kg tombe de 5 m sans frottement. Vitesse à l'arrivée au sol ?
= Conservation : $E_{pp}$ perdue $= E_c$ gagnée, soit $mgz = \dfrac12 mv^2$.
= La masse se simplifie : $v = \sqrt{2gz} = \sqrt{2 \times 9{,}8 \times 5} = \sqrt{98} \approx 9{,}9$ m/s.
! $v$ en m/s et $m$ en kg pour obtenir des joules (une vitesse de 72 km/h vaut 20 m/s).

@pc-1-ondes
- Onde mécanique progressive : propagation d'une perturbation dans un milieu matériel, **sans transport de matière**.
> Une « ola » dans un stade : chaque spectateur se lève et se rassoit sur place, mais la vague avance.
- Célérité : $v = \dfrac{d}{\Delta t}$ ; retard : $\tau = \dfrac{d}{v}$.
> La célérité est la vitesse de propagation de l'onde (m/s). Le retard $\tau$ (tau) est le temps que met l'onde pour aller d'un point à un autre, distants de $d$.
- Onde périodique : période $T$ (dans le temps) et longueur d'onde $\lambda$ (dans l'espace).
> $\lambda$ (lambda) est la distance entre deux crêtes successives, en mètres.
- Relation fondamentale : $\lambda = v \times T = \dfrac{v}{f}$.
> Pendant une période, l'onde avance d'une longueur d'onde.
? Un son de 440 Hz se propage dans l'air à 340 m/s. Longueur d'onde ?
= $\lambda = \dfrac{v}{f} = \dfrac{340}{440} \approx 0{,}77$ m.
! D'un milieu à l'autre, la fréquence reste la même ; ce sont la célérité et $\lambda$ qui changent.

@pc-1-lentilles
- Lentille convergente : foyer image $F'$, distance focale $f' = \overline{OF'}$, vergence $C = \dfrac{1}{f'}$.
> $O$ est le centre de la lentille. Les rayons parallèles à l'axe convergent en $F'$. $f'$ en mètres donne $C$ en dioptries ($\delta$) : une lentille de 20 cm a une vergence de $\frac{1}{0{,}2} = 5\,\delta$.
- Relation de conjugaison : $\dfrac{1}{\overline{OA'}} - \dfrac{1}{\overline{OA}} = \dfrac{1}{f'}$.
> $A$ : objet ; $A'$ : son image. La barre au-dessus indique une distance **algébrique** : positive dans le sens de la lumière (vers la droite), négative sinon. Un objet réel placé avant la lentille a $\overline{OA} < 0$.
- Grandissement : $\gamma = \dfrac{\overline{A'B'}}{\overline{AB}} = \dfrac{\overline{OA'}}{\overline{OA}}$.
> $\gamma$ (gamma) compare la taille de l'image à celle de l'objet. $\gamma < 0$ : image renversée ; $|\gamma| > 1$ : image agrandie.
- Œil : le cristallin joue le rôle de lentille, la rétine celui d'écran ; l'accommodation change la vergence du cristallin.
> Elle permet de voir net de près comme de loin.
? Objet à 30 cm devant une lentille de focale 10 cm. Position de l'image ?
= $\overline{OA} = -30$ cm et $f' = 10$ cm : $\dfrac{1}{\overline{OA'}} = \dfrac{1}{10} + \dfrac{1}{-30} = \dfrac{3 - 1}{30} = \dfrac{2}{30}$.
= $\overline{OA'} = 15$ cm (image réelle, après la lentille).
= $\gamma = \dfrac{15}{-30} = -0{,}5$ : image renversée, deux fois plus petite.
! Distances algébriques : un objet réel a $\overline{OA} < 0$ ; oublier ce signe fausse tout le calcul.

@pc-1-organique
- Molécule organique : squelette carboné + groupe caractéristique, qui donne la famille.
> Le squelette est la chaîne d'atomes de carbone ; le groupe caractéristique est la partie qui réagit.
- Hydroxyle $-\mathrm{OH}$ : alcool (nom en -ol) ; carbonyle $\mathrm{C{=}O}$ : aldéhyde (-al) s'il est en bout de chaîne, cétone (-one) s'il est au milieu.
> Éthanol : alcool à 2 C ; propanone (acétone) : cétone à 3 C.
- Carboxyle $-\mathrm{COOH}$ : acide carboxylique (acide …-oïque) ; on trouve aussi les esters et les amines ($-\mathrm{NH_2}$).
> L'acide éthanoïque est l'acide du vinaigre.
- Préfixes selon le nombre de carbones : méth (1), éth (2), prop (3), but (4), pent (5), hex (6).
> Butan-2-ol : 4 carbones, groupe $-\mathrm{OH}$ sur le 2e carbone.
- Formules brute, semi-développée, topologique.
> En topologique, chaque sommet ou extrémité de ligne brisée est un carbone, et les H liés aux C ne sont pas écrits.
? Nommer $\mathrm{CH_3{-}CH_2{-}CH_2{-}OH}$.
= 3 carbones (prop), groupe $-\mathrm{OH}$ (alcool) sur le carbone 1.
= Propan-1-ol.
! Le groupe $-\mathrm{OH}$ d'un alcool n'est pas un ion hydroxyde $\mathrm{HO^-}$.

@pc-1-spectro
- Couleur perçue = couleur complémentaire de la couleur absorbée.
> Une solution qui absorbe le rouge apparaît bleu-vert. Sur le cercle chromatique, les couleurs complémentaires sont diamétralement opposées.
- Loi de Beer-Lambert : $A = \varepsilon \times \ell \times C$, soit $A = k \times C$.
> $A$ : absorbance (sans unité), mesurée au spectrophotomètre ; $\ell$ : épaisseur de solution traversée (cm) ; $C$ : concentration (mol/L) ; $\varepsilon$ (epsilon) dépend de l'espèce et de la longueur d'onde. L'absorbance est **proportionnelle** à la concentration.
- Dosage par étalonnage : on mesure $A$ pour des solutions de concentrations connues, on trace la droite $A = f(C)$, puis on y lit la concentration inconnue.
> La droite passe par l'origine (proportionnalité).
- On mesure à $\lambda_{max}$, la longueur d'onde où l'absorption est maximale.
> C'est là que la mesure est la plus précise.
? Étalonnage : $A = 0{,}8$ pour $C = 2 \times 10^{-3}$ mol/L. Une solution inconnue donne $A = 0{,}5$. Concentration ?
= $k = \dfrac{0{,}8}{2 \times 10^{-3}} = 400$ L/mol.
= $C = \dfrac{A}{k} = \dfrac{0{,}5}{400} = 1{,}25 \times 10^{-3}$ mol/L.
! Beer-Lambert n'est valable que pour des solutions diluées.

@pc-1-photon
- La lumière est à la fois une onde et un flux de particules, les photons.
> C'est la dualité onde-particule.
- Énergie d'un photon : $E = h \times \nu = \dfrac{h \times c}{\lambda}$.
> $E$ en joules ; $h = 6{,}63 \times 10^{-34}$ J·s (constante de Planck) ; $\nu$ (nu) : fréquence (Hz) ; $c = 3{,}0 \times 10^8$ m/s ; $\lambda$ : longueur d'onde (**en mètres**).
- Électronvolt : $1$ eV $= 1{,}6 \times 10^{-19}$ J ; raccourci : $E(\text{eV}) \approx \dfrac{1240}{\lambda(\text{nm})}$.
> L'eV est une unité adaptée aux toutes petites énergies des atomes.
- Les niveaux d'énergie d'un atome sont quantifiés : il émet ou absorbe un photon d'énergie $\Delta E = E_{\text{haut}} - E_{\text{bas}}$.
> « Quantifiés » : seules certaines valeurs sont possibles, d'où les raies des spectres.
- Plus $\lambda$ est petite, plus le photon est énergétique : UV > visible > IR.
> Les UV, très énergétiques, abîment la peau ; les infrarouges, moins.
? Énergie d'un photon de longueur d'onde 620 nm, en eV.
= $E \approx \dfrac{1240}{620} = 2{,}0$ eV.
= En joules : $2{,}0 \times 1{,}6 \times 10^{-19} = 3{,}2 \times 10^{-19}$ J.
! $\lambda$ doit être en mètres dans $E = \dfrac{hc}{\lambda}$ pour obtenir des joules (620 nm $= 620 \times 10^{-9}$ m).

@pc-1-fluides
- Pression : $P = \dfrac{F}{S}$.
> $F$ : force pressante (N) ; $S$ : surface (m²) ; $P$ en pascals (Pa). 1 bar $= 10^5$ Pa ; la pression atmosphérique vaut environ 1 bar. Même force sur une plus petite surface = plus de pression (talon aiguille).
- Loi de Mariotte (température constante) : $P \times V$ = constante, soit $P_1V_1 = P_2V_2$.
> Si on comprime un gaz pour diviser son volume par 2, sa pression double.
- Loi fondamentale de la statique des fluides : $P_B - P_A = \rho \times g \times (z_A - z_B)$.
> $\rho$ (rhô) : masse volumique du liquide (kg/m³, 1 000 pour l'eau) ; $z$ : altitudes (m). Plus on descend, plus la pression augmente.
- Dans l'eau : environ +1 bar tous les 10 m de profondeur.
> $\rho g h = 1\,000 \times 9{,}8 \times 10 \approx 10^5$ Pa = 1 bar. À 20 m, on subit environ 3 bar (1 d'air + 2 d'eau).
- Gaz parfait : $P \times V = n \times R \times T$.
> $P$ en Pa, $V$ en m³, $n$ en mol, $R = 8{,}31$ J/(mol·K), $T$ en **kelvins**.
? Un gaz occupe 6 L sous 1 bar. On le comprime à 2 L à température constante. Pression ?
= Mariotte : $P_2 = \dfrac{P_1V_1}{V_2} = \dfrac{1 \times 6}{2} = 3$ bar.
! $T(\text{K}) = T(°\text{C}) + 273$ : 20 °C correspondent à 293 K.

@pc-t-acides-bases
- Acide (selon Brønsted) : espèce capable de **céder** un proton $\mathrm{H^+}$ ; base : espèce capable d'en **capter** un.
> Couple acide/base $\mathrm{AH/A^-}$ : $\mathrm{AH} = \mathrm{A^-} + \mathrm{H^+}$. Exemple : $\mathrm{CH_3COOH/CH_3COO^-}$.
- $\mathrm{pH} = -\log[\mathrm{H_3O^+}]$ et $[\mathrm{H_3O^+}] = 10^{-\mathrm{pH}}$.
> $[\mathrm{H_3O^+}]$ : concentration en ions oxonium (mol/L). « log » est le logarithme décimal : $\log(10^{-3}) = -3$. Si $[\mathrm{H_3O^+}] = 10^{-3}$ mol/L, alors pH = 3. Quand le pH baisse de 1, la concentration est multipliée par 10.
- À 25 °C : pH < 7 acide, pH = 7 neutre, pH > 7 basique ; produit ionique de l'eau $K_e = [\mathrm{H_3O^+}][\mathrm{HO^-}] = 10^{-14}$.
> Dans une solution basique, il y a plus d'ions $\mathrm{HO^-}$ que d'ions $\mathrm{H_3O^+}$.
- Constante d'acidité : $\mathrm{pH} = \mathrm{p}K_a + \log\dfrac{[\mathrm{A^-}]}{[\mathrm{AH}]}$, avec $\mathrm{p}K_a = -\log K_a$.
> Le $\mathrm{p}K_a$ caractérise la force de l'acide : plus il est petit, plus l'acide est fort. Quand $[\mathrm{A^-}] = [\mathrm{AH}]$, le log vaut 0 et $\mathrm{pH} = \mathrm{p}K_a$.
- Domaines de prédominance : AH prédomine si $\mathrm{pH} < \mathrm{p}K_a$, $\mathrm{A^-}$ si $\mathrm{pH} > \mathrm{p}K_a$.
> On les représente sur un axe des pH coupé au niveau du $\mathrm{p}K_a$.
- Titrage : à l'équivalence, les réactifs ont été introduits dans les proportions de l'équation : $C_a V_a = C_b V_E$ (réaction mole à mole).
> $V_E$ : volume versé à l'équivalence, repéré par le saut de pH ou un changement de couleur de l'indicateur.
? pH d'une solution où $[\mathrm{H_3O^+}] = 2{,}5 \times 10^{-4}$ mol/L.
= $\mathrm{pH} = -\log(2{,}5 \times 10^{-4}) \approx 3{,}6$ : solution acide.
? 20 mL d'acide sont titrés par de la soude à 0,1 mol/L ; $V_E = 15$ mL. Concentration de l'acide ?
= $C_a = \dfrac{C_b V_E}{V_a} = \dfrac{0{,}1 \times 15}{20} = 0{,}075$ mol/L.
! Diluer 10 fois un acide fort augmente son pH d'une unité (et non le diviser par 10).

@pc-t-cinetique
- Vitesse volumique de disparition d'un réactif : $v = -\dfrac{d[\mathrm{R}]}{dt}$ ; d'apparition d'un produit : $v = \dfrac{d[\mathrm{P}]}{dt}$.
> $\frac{d[\mathrm{R}]}{dt}$ est la dérivée de la concentration par rapport au temps : la pente de la courbe $[\mathrm{R}](t)$. Le signe « − » rend la vitesse positive car $[\mathrm{R}]$ diminue. Unité : mol·L⁻¹·s⁻¹.
- Facteurs cinétiques : température, concentration des réactifs, catalyseur, surface de contact.
> Plus il fait chaud ou plus c'est concentré, plus les chocs entre molécules sont nombreux et efficaces.
- Temps de demi-réaction $t_{1/2}$ : durée au bout de laquelle l'avancement atteint la moitié de sa valeur finale, $x(t_{1/2}) = \dfrac{x_f}{2}$.
> Il se lit sur la courbe $x(t)$. Il donne un ordre de grandeur de la durée de la réaction.
- Loi de vitesse d'ordre 1 : $v = k[\mathrm{R}]$, d'où $[\mathrm{R}](t) = [\mathrm{R}]_0\,e^{-kt}$.
> $k$ : constante de vitesse (s⁻¹). La concentration décroît de façon exponentielle ; $t_{1/2} = \frac{\ln 2}{k}$.
- Catalyseur : accélère la réaction sans être consommé.
> Les enzymes sont des catalyseurs biologiques.
? Réaction d'ordre 1 avec $k = 0{,}01$ s⁻¹. Temps de demi-réaction ?
= $t_{1/2} = \dfrac{\ln 2}{k} = \dfrac{0{,}693}{0{,}01} \approx 69$ s.
! La vitesse instantanée est la pente de la **tangente** à la courbe à l'instant considéré, pas la valeur de la concentration.

@pc-t-newton
- Deuxième loi de Newton : $\sum \vec F = m\,\vec a$ (dans un référentiel galiléen).
> La somme des forces (N) est égale à la masse (kg) multipliée par l'accélération $\vec a$ (m/s²). L'accélération est la variation de la vitesse par seconde : $\vec a = \frac{d\vec v}{dt}$.
- Chute libre : seul le poids agit, donc $\vec a = \vec g$.
> Tous les objets tombent avec la même accélération ($g \approx 9{,}8$ m/s²) si l'on néglige l'air.
- Projectile lancé à la vitesse $v_0$ avec un angle $\alpha$ : $x(t) = v_0\cos\alpha \times t$ et $z(t) = -\dfrac12 g t^2 + v_0 \sin\alpha \times t + z_0$.
> Horizontalement, aucune force : vitesse constante. Verticalement, le poids : mouvement accéléré. La trajectoire est une parabole.
- Champ électrique uniforme : $\vec F = q\,\vec E$, avec $E = \dfrac{U}{d}$.
> $q$ : charge (C) ; $E$ : champ électrique (V/m) ; $U$ : tension entre deux plaques (V) ; $d$ : distance entre elles (m).
- Mouvement circulaire uniforme : accélération $a = \dfrac{v^2}{R}$, dirigée vers le centre.
> Même à vitesse constante, un objet qui tourne accélère, car la direction de sa vitesse change. Pour un satellite, c'est la gravitation qui fournit cette force.
- Lois de Kepler : orbites elliptiques, loi des aires, et $\dfrac{T^2}{a^3}$ = constante pour les planètes d'un même astre.
> $T$ : période de révolution ; $a$ : demi-grand axe de l'orbite.
? Une pierre est lâchée sans vitesse du haut d'une falaise de 45 m. Durée de chute ($g = 10$ m/s²) ?
= Chute libre : $z$ diminue de $\dfrac12 g t^2$, donc $45 = \dfrac12 \times 10 \times t^2 = 5t^2$.
= $t^2 = 9$, soit $t = 3$ s.
! En chute libre, l'accélération ne dépend pas de la masse : une bille et un boulet tombent ensemble.

@pc-t-ondes
- Diffraction par une fente de largeur $a$ : demi-angle de la tache centrale $\theta = \dfrac{\lambda}{a}$.
> L'onde s'étale après un obstacle ou une ouverture. $\theta$ (thêta) en radians ; le phénomène est marqué si $a$ est du même ordre que $\lambda$.
- Interférences : constructives si la différence de chemin $\delta = k\lambda$, destructives si $\delta = \left(k + \frac12\right)\lambda$ ($k$ entier).
> Deux ondes qui arrivent « en phase » s'additionnent (frange brillante) ; décalées d'une demi-longueur d'onde, elles s'annulent (frange sombre).
- Fentes d'Young : interfrange $i = \dfrac{\lambda D}{b}$.
> $i$ : distance entre deux franges brillantes ; $D$ : distance fentes-écran ; $b$ : distance entre les deux fentes.
- Effet Doppler : la fréquence perçue est plus élevée quand la source s'approche, plus basse quand elle s'éloigne.
> La sirène d'une ambulance paraît plus aiguë quand elle arrive. Sert aux radars de vitesse.
? Laser de 600 nm, fente de 0,1 mm. Demi-angle de diffraction ?
= $\theta = \dfrac{\lambda}{a} = \dfrac{600 \times 10^{-9}}{0{,}1 \times 10^{-3}} = 6 \times 10^{-3}$ rad.
! Plus la fente est étroite, plus la tache centrale est large ($a$ est au dénominateur).

@pc-t-thermo
- Premier principe : $\Delta U = W + Q$.
> $U$ : énergie interne du système (J) ; $W$ : travail reçu ; $Q$ : transfert thermique (chaleur) reçu. L'énergie ne se crée pas : elle s'échange.
- Corps solide ou liquide : $\Delta U = m \times c \times \Delta T$.
> $m$ : masse (kg) ; $c$ : capacité thermique massique, l'énergie pour chauffer 1 kg de 1 °C (eau : 4 180 J·kg⁻¹·K⁻¹) ; $\Delta T$ : variation de température (une variation de 1 °C vaut une variation de 1 K).
- Modes de transfert : conduction (contact), convection (mouvement du fluide), rayonnement (lumière, infrarouge) ; toujours du chaud vers le froid.
> Une casserole sur le feu chauffe par conduction ; le Soleil nous chauffe par rayonnement.
- Flux thermique : $\Phi = \dfrac{Q}{\Delta t}$ ; résistance thermique : $R_{th} = \dfrac{\Delta T}{\Phi}$.
> $\Phi$ (phi) en watts. Une paroi bien isolante a une grande résistance thermique.
- Loi de Newton : la température d'un corps se rapproche de celle de l'extérieur de façon exponentielle.
> Le café refroidit vite au début, puis de plus en plus lentement.
? Énergie pour chauffer 2 kg d'eau de 20 °C à 70 °C ($c = 4\,180$ J·kg⁻¹·K⁻¹).
= $Q = m c \Delta T = 2 \times 4\,180 \times 50 = 418\,000$ J $\approx 418$ kJ.
! $Q > 0$ : le système reçoit de l'énergie ; $Q < 0$ : il en cède.

@pc-t-rc
- Condensateur : $q = C \times u_C$ et $i = C\dfrac{du_C}{dt}$.
> $q$ : charge portée (C) ; $C$ : capacité (F, farads) ; $u_C$ : tension aux bornes (V). L'intensité dépend de la **variation** de la tension : en régime permanent, $i = 0$.
- Constante de temps : $\tau = R \times C$.
> $R$ en ohms et $C$ en farads donnent $\tau$ (tau) en secondes : elle donne la durée caractéristique de la charge.
- Charge sous la tension $E$ : $u_C(t) = E\left(1 - e^{-t/\tau}\right)$.
> À $t = \tau$, le condensateur est chargé à 63 % de $E$ ; à $t = 5\tau$, il est considéré comme chargé (plus de 99 %).
- Décharge : $u_C(t) = E\,e^{-t/\tau}$.
> À $t = \tau$, il reste 37 % de la tension initiale.
- Énergie stockée : $\mathcal{E} = \dfrac12 C u_C^2$.
> En joules. C'est ce qui alimente le flash d'un appareil photo.
? $R = 10$ kΩ et $C = 100$ µF. Constante de temps et durée de charge ?
= $\tau = 10 \times 10^3 \times 100 \times 10^{-6} = 1$ s.
= Charge quasi complète au bout de $5\tau = 5$ s.
! Convertir µF ($10^{-6}$ F) et kΩ ($10^3$ Ω) avant de calculer $\tau$.

@pc-t-radioactivite
- Désintégrations : α (émission d'un noyau d'hélium $^4_2\mathrm{He}$), β⁻ (d'un électron), β⁺ (d'un positon), souvent suivies d'un rayonnement γ.
> Un noyau instable se transforme spontanément en un autre noyau.
- Lois de conservation (Soddy) : le nombre de nucléons $A$ et le nombre de charge $Z$ se conservent.
> La somme des $A$ et la somme des $Z$ sont les mêmes avant et après : on en déduit le noyau formé.
- Loi de décroissance : $N(t) = N_0\,e^{-\lambda t}$.
> $N_0$ : nombre initial de noyaux ; $N(t)$ : nombre restant ; $\lambda$ : constante radioactive (s⁻¹). Ici $\lambda$ n'est pas une longueur d'onde !
- Demi-vie : $t_{1/2} = \dfrac{\ln 2}{\lambda}$ ; au bout de $n$ demi-vies, il reste $\dfrac{N_0}{2^n}$.
> La demi-vie est la durée au bout de laquelle la moitié des noyaux se sont désintégrés. Après 1 demi-vie : $\frac12$ ; après 2 : $\frac14$ ; après 3 : $\frac18$.
- Activité : $A = \lambda N$, en becquerels (Bq, 1 désintégration par seconde) ; carbone 14 : $t_{1/2} \approx 5\,730$ ans.
> L'activité diminue avec la même loi exponentielle que $N$.
? Un échantillon contient $8 \times 10^{6}$ noyaux de demi-vie 2 jours. Combien en reste-t-il après 6 jours ?
= 6 jours = 3 demi-vies.
= $N = \dfrac{8 \times 10^6}{2^3} = 10^6$ noyaux.
? Désintégration α de l'uranium $^{238}_{92}\mathrm{U}$ : quel noyau obtient-on ?
= $^{238}_{92}\mathrm{U} \to {}^{4}_{2}\mathrm{He} + {}^{A}_{Z}\mathrm{X}$, avec $238 = 4 + A$ et $92 = 2 + Z$.
= $A = 234$ et $Z = 90$ : c'est le thorium $^{234}_{90}\mathrm{Th}$.
! La loi est statistique : on ne peut pas prévoir quand un noyau donné va se désintégrer.

@pc-t-equilibre
- Quotient de réaction pour $a\,\mathrm{A} + b\,\mathrm{B} \rightleftharpoons c\,\mathrm{C} + d\,\mathrm{D}$ : $Q_r = \dfrac{[\mathrm{C}]^c\,[\mathrm{D}]^d}{[\mathrm{A}]^a\,[\mathrm{B}]^b}$.
> Produits en haut, réactifs en bas, chacun élevé à la puissance de son coefficient. Le solvant (l'eau) et les solides n'y figurent pas. La double flèche $\rightleftharpoons$ indique une réaction qui peut aller dans les deux sens.
- À l'équilibre : $Q_{r,eq} = K$, la constante d'équilibre (qui ne dépend que de la température).
> Plus $K$ est grand, plus la réaction est avancée à l'équilibre.
- Critère d'évolution : si $Q_r < K$, le système évolue dans le sens direct ; si $Q_r > K$, dans le sens inverse.
> Le système évolue toujours pour que $Q_r$ se rapproche de $K$.
- Pile : oxydation à l'anode (pôle −), réduction à la cathode (pôle +) ; les électrons circulent de l'anode vers la cathode dans les fils.
> Moyen mnémotechnique : « anode-oxydation » commencent toutes les deux par une voyelle, « cathode-réduction » par une consonne.
- Charge débitée : $Q = I \times \Delta t = n(e^-) \times F$, avec $F \approx 96\,500$ C/mol (constante de Faraday).
> $I$ en A et $\Delta t$ en s donnent $Q$ en coulombs ; $F$ est la charge d'une mole d'électrons.
? Une pile débite 0,2 A pendant 1 h. Quantité d'électrons échangée ?
= $Q = 0{,}2 \times 3\,600 = 720$ C.
= $n(e^-) = \dfrac{Q}{F} = \dfrac{720}{96\,500} \approx 7{,}5 \times 10^{-3}$ mol.
! Une pile usée est une pile à l'équilibre ($Q_r = K$) : plus aucune évolution, donc plus de courant.
`;
