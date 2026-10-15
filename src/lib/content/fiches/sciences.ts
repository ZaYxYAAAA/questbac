/**
 * Fiches de révision — SVT (maths et physique-chimie : voir maths.ts et physique.ts).
 * Format : « @id-du-chapitre », puis « - » pour l'essentiel et « ! » pour les pièges.
 */
export const SCIENCES = String.raw`
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
