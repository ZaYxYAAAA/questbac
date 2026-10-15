/**
 * SVT : questions supplémentaires par chapitre (mécanismes, expériences,
 * vocabulaire précis, interprétation de résultats), en complément des banques existantes.
 */
import { type Card, type Claim, type Generator, cards, claims } from "./kit";

const bank = (c: Card[], v: Claim[] = []): Generator[] => (v.length ? [cards(c), claims(v)] : [cards(c)]);

export const SVT_PLUS: Record<string, Generator[]> = {
  "svt-2-cellule": bank(
    [
      ["Quelle structure est présente chez une bactérie et absente chez une cellule animale ?", "une paroi", ["un noyau", "des mitochondries", "un réticulum endoplasmique"], "Les bactéries ont une paroi mais pas de noyau."],
      ["Pour observer une cellule d'épiderme d'oignon au microscope, on utilise souvent…", "un colorant comme le bleu de méthylène ou l'eau iodée", ["de l'eau de Javel", "de l'huile", "un aimant"], "La coloration fait ressortir le noyau."],
      ["Grossissement d'un microscope avec un oculaire ×10 et un objectif ×40 ?", "×400", ["×50", "×4", "×4 000"], "On multiplie les deux grossissements."],
      ["La théorie cellulaire affirme notamment que…", "toute cellule provient d'une autre cellule", ["les cellules apparaissent spontanément", "seuls les animaux ont des cellules", "les virus sont des cellules"], "Virchow : « Omnis cellula e cellula »."],
      ["Un virus est…", "un parasite qui n'est pas une cellule et se multiplie dans une cellule hôte", ["une bactérie de petite taille", "une cellule sans membrane", "un organite"], "Il n'a pas de métabolisme propre."],
    ],
    [
      ["Les cellules d'un même organisme contiennent la même information génétique.", true, "Mais elles n'en expriment pas les mêmes parties."],
      ["La cellule végétale possède des chloroplastes dans toutes ses parties, y compris les racines.", false, "Les cellules des racines n'en ont généralement pas."],
    ],
  ),
  "svt-2-adn": bank(
    [
      ["Si un brin d'ADN porte la séquence ATGC, le brin complémentaire porte…", "TACG", ["ATGC", "GCAT", "UACG"], "A–T et G–C."],
      ["Un gène est…", "une portion d'ADN qui porte une information pour une protéine", ["un chromosome entier", "une protéine", "un organite"], "Les différentes versions d'un gène sont les allèles."],
      ["Des allèles sont…", "différentes versions d'un même gène", ["deux gènes différents", "deux chromosomes", "des protéines"], "Ils diffèrent par quelques nucléotides (mutations)."],
      ["La biodiversité s'observe à trois échelles :", "écosystèmes, espèces et gènes", ["atomes, molécules et cellules", "pays, régions et villes", "jour, mois et année"], "Diversité des écosystèmes, spécifique et génétique."],
      ["La dérive génétique, c'est…", "la variation aléatoire de la fréquence des allèles, forte dans les petites populations", ["la sélection des meilleurs allèles", "le déplacement des continents", "une mutation provoquée"], "Elle peut faire disparaître des allèles par hasard."],
      ["La sélection naturelle favorise…", "les individus dont les caractères augmentent la survie et la reproduction dans un milieu", ["toujours les plus grands", "les individus au hasard", "les mutations récentes"], "Les allèles avantageux deviennent plus fréquents."],
    ],
    [
      ["L'ADN est présent dans le noyau des cellules eucaryotes.", true, "Et aussi dans les mitochondries et les chloroplastes."],
      ["L'universalité de l'ADN est un argument en faveur d'une origine commune des êtres vivants.", true, "Même molécule, même code."],
    ],
  ),
  "svt-2-metabolisme": bank(
    [
      ["Dans l'expérience d'Engelmann, les bactéries se regroupent près des zones d'une algue éclairées en…", "rouge et en bleu", ["vert uniquement", "jaune", "noir"], "Ce sont les radiations absorbées par la chlorophylle, qui produit alors du dioxygène."],
      ["Pigment principal de la photosynthèse ?", "la chlorophylle", ["l'hémoglobine", "la mélanine", "l'amidon"], "Elle absorbe la lumière rouge et bleue."],
      ["Dans une feuille éclairée, l'amidon se met en évidence avec…", "l'eau iodée (coloration bleu-noir)", ["la liqueur de Fehling", "le bleu de méthylène", "l'eau de chaux"], "La liqueur de Fehling révèle les sucres réducteurs (glucose)."],
      ["L'eau de chaux qui se trouble révèle la présence de…", "dioxyde de carbone", ["dioxygène", "glucose", "amidon"], "Test classique de la respiration."],
      ["La température optimale de la plupart des enzymes humaines est d'environ…", "37 °C", ["0 °C", "60 °C", "100 °C"], "Au-delà, elles se dénaturent."],
    ],
    [
      ["Une enzyme est spécifique de son substrat et de la réaction catalysée.", true, "Double spécificité, liée au site actif."],
      ["La photosynthèse consomme du dioxygène.", false, "Elle en libère ; elle consomme du CO₂."],
    ],
  ),
  "svt-2-sols": bank(
    [
      ["Un sol se forme à partir…", "de l'altération de la roche mère et de la décomposition de matière organique", ["uniquement de la matière organique", "de la lave refroidie", "des pluies seulement"], "Cela prend des milliers d'années."],
      ["Les légumineuses (pois, trèfle) enrichissent le sol en…", "azote, grâce à des bactéries de leurs racines", ["calcium", "pétrole", "sel"], "Les nodosités fixent l'azote de l'air."],
      ["L'eutrophisation d'un lac est souvent causée par…", "un excès de nitrates et de phosphates venant des engrais", ["un manque d'eau", "une baisse de température", "la présence de poissons"], "Les algues prolifèrent puis l'eau manque de dioxygène."],
      ["Une haie en bordure de champ permet notamment de…", "limiter l'érosion et abriter la biodiversité", ["augmenter l'érosion", "polluer les nappes", "remplacer les engrais"], "Elle sert aussi de brise-vent."],
    ],
    [["Les pesticides peuvent nuire à des espèces utiles comme les pollinisateurs.", true, "Exemple : les néonicotinoïdes et les abeilles."]],
  ),
  "svt-2-procreation": bank(
    [
      ["La puberté est déclenchée par…", "l'augmentation de la sécrétion de GnRH par l'hypothalamus", ["la naissance", "la fécondation", "la ménopause"], "La GnRH stimule l'hypophyse, qui stimule les gonades."],
      ["L'ovulation est déclenchée par…", "un pic de LH", ["une chute de testostérone", "la progestérone seule", "l'insuline"], "Vers le 14e jour d'un cycle de 28 jours."],
      ["La pilule contraceptive combinée agit principalement en…", "bloquant l'ovulation par rétrocontrôle sur l'hypothalamus et l'hypophyse", ["détruisant les spermatozoïdes", "empêchant la nidation uniquement", "provoquant les règles"], "Elle contient des hormones de synthèse."],
      ["Le préservatif est le seul moyen de contraception qui protège aussi…", "des infections sexuellement transmissibles", ["des grossesses extra-utérines uniquement", "du cancer", "de toutes les maladies"], "D'où son importance."],
      ["La fécondation a lieu normalement dans…", "la trompe (oviducte)", ["l'utérus", "l'ovaire", "le vagin"], "L'embryon migre ensuite vers l'utérus pour s'y implanter."],
    ],
    [["Le sexe génétique dépend des chromosomes sexuels (XX ou XY).", true, "Le gène SRY du chromosome Y oriente vers le développement masculin."]],
  ),
  "svt-2-paysages": bank(
    [
      ["L'altération chimique du granite par l'eau produit notamment…", "de l'argile et du sable (arène granitique)", ["du calcaire", "du charbon", "du basalte"], "Les feldspaths deviennent argiles, le quartz reste en grains."],
      ["Une roche sédimentaire se forme…", "par accumulation et compaction de sédiments", ["par refroidissement d'un magma", "par fusion d'une roche", "sous l'effet de la foudre"], "Exemple : le grès, le calcaire."],
      ["Le transport des sédiments se fait principalement par…", "l'eau, le vent et la glace", ["les animaux", "les volcans", "les séismes"], "Ils se déposent quand l'énergie du courant baisse."],
      ["Une roche qui fait effervescence avec l'acide chlorhydrique est…", "un calcaire", ["un granite", "un basalte", "un quartz"], "Elle contient du carbonate de calcium."],
    ],
    [["Le relief d'une montagne s'use au cours du temps sous l'effet de l'érosion.", true, "Les chaînes anciennes sont plus basses (Massif central vs Alpes)."]],
  ),
  "svt-2-microorganismes": bank(
    [
      ["Un antibiotique agit contre…", "les bactéries", ["les virus", "les champignons uniquement", "toutes les maladies"], "Il est inefficace contre les virus (grippe, rhume…)."],
      ["Le microbiote intestinal est…", "l'ensemble des micro-organismes qui vivent dans l'intestin", ["un organe", "une maladie", "un médicament"], "Il participe à la digestion et à l'immunité."],
      ["La pénicilline a été découverte par…", "Alexander Fleming", ["Louis Pasteur", "Robert Koch", "Edward Jenner"], "En 1928, grâce à une moisissure."],
      ["La résistance aux antibiotiques se développe surtout à cause…", "d'une utilisation excessive ou inadaptée des antibiotiques", ["des vaccins", "du lavage des mains", "de l'alimentation végétarienne"], "Les bactéries résistantes sont sélectionnées."],
      ["Le papillomavirus (HPV) peut provoquer…", "des cancers, notamment du col de l'utérus", ["le diabète", "la grippe", "la tuberculose"], "Un vaccin existe, recommandé dès 11 ans."],
    ],
    [["La pasteurisation consiste à chauffer un aliment pour détruire une grande partie des micro-organismes.", true, "Méthode mise au point par Pasteur."]],
  ),
  "svt-1-replication": bank(
    [
      ["La réplication de l'ADN a lieu…", "pendant la phase S de l'interphase", ["pendant la mitose", "après la division", "seulement chez les bactéries"], "Chaque chromosome passe de 1 à 2 chromatides."],
      ["La réplication est dite semi-conservative car…", "chaque nouvelle molécule contient un brin ancien et un brin nouveau", ["l'ADN est à moitié détruit", "seule la moitié du génome est copiée", "elle conserve la moitié des protéines"], "Démontré par Meselson et Stahl (1958)."],
      ["L'enzyme qui synthétise le nouveau brin d'ADN est…", "l'ADN polymérase", ["l'ARN polymérase", "l'amylase", "la ligase seulement"], "Elle ajoute des nucléotides complémentaires."],
      ["La mitose permet d'obtenir…", "deux cellules filles génétiquement identiques", ["quatre cellules différentes", "des gamètes", "une seule cellule plus grosse"], "C'est une reproduction conforme."],
      ["Ordre des étapes de la mitose ?", "prophase, métaphase, anaphase, télophase", ["métaphase, prophase, télophase, anaphase", "anaphase, prophase, métaphase, télophase", "télophase, anaphase, métaphase, prophase"], "En métaphase, les chromosomes s'alignent au centre."],
      ["Lors de l'anaphase de mitose…", "les chromatides sœurs se séparent et migrent vers les pôles", ["les chromosomes s'alignent", "l'ADN se réplique", "le noyau se forme"], "Chaque pôle reçoit un lot complet."],
      ["Un clone est…", "un ensemble de cellules génétiquement identiques issues d'une même cellule", ["une mutation", "un gamète", "une espèce"], "Issu de mitoses successives."],
      ["Un agent mutagène, comme les UV, …", "augmente la fréquence des mutations", ["répare l'ADN", "empêche toute division", "supprime les mutations"], "Les UV favorisent les cancers de la peau."],
    ],
    [
      ["Les erreurs de réplication sont une source de mutations.", true, "Elles sont rares, la plupart étant réparées."],
      ["Une mutation dans une cellule de la peau est transmise aux enfants.", false, "Seules les mutations des cellules germinales sont héréditaires."],
    ],
  ),
  "svt-1-expression": bank(
    [
      ["La transcription a lieu…", "dans le noyau", ["dans le cytoplasme, sur les ribosomes", "dans les mitochondries uniquement", "hors de la cellule"], "Elle produit un ARN messager."],
      ["La traduction a lieu…", "dans le cytoplasme, au niveau des ribosomes", ["dans le noyau", "dans l'ADN", "dans la membrane"], "L'ARNm est traduit en protéine."],
      ["Dans l'ARN, la thymine est remplacée par…", "l'uracile", ["l'adénine", "la cytosine", "la guanine"], "L'ARN est simple brin et contient du ribose."],
      ["Un codon est…", "un triplet de nucléotides de l'ARNm correspondant à un acide aminé", ["un gène entier", "une protéine", "un chromosome"], "Il y a 64 codons pour 20 acides aminés."],
      ["Le code génétique est dit redondant car…", "plusieurs codons peuvent coder le même acide aminé", ["chaque codon code plusieurs acides aminés", "il change selon les espèces", "il n'a pas de codon stop"], "Une mutation peut donc être silencieuse."],
      ["Le codon initiateur (début de la traduction) est…", "AUG", ["UAA", "UGA", "GGG"], "Il code la méthionine."],
      ["Une mutation « faux-sens » entraîne…", "le remplacement d'un acide aminé par un autre", ["l'arrêt de la protéine", "aucun changement", "la duplication du gène"], "Une mutation non-sens crée un codon stop."],
      ["Si un brin d'ADN transcrit porte TAC, le codon de l'ARNm est…", "AUG", ["ATG", "TAC", "UAC"], "Complémentarité avec U à la place de T."],
    ],
    [["Le phénotype dépend des protéines produites et aussi de l'environnement.", true, "Exemple : le bronzage."]],
  ),
  "svt-1-tectonique": bank(
    [
      ["La lithosphère est…", "l'enveloppe rigide formée de la croûte et du manteau supérieur", ["le noyau terrestre", "l'atmosphère", "le manteau inférieur entier"], "Elle est découpée en plaques."],
      ["Au niveau d'une dorsale océanique…", "les plaques s'écartent et de la lithosphère océanique se forme", ["les plaques se rapprochent", "une plaque plonge sous l'autre", "il ne se passe rien"], "Exemple : la dorsale médio-atlantique."],
      ["Au niveau d'une zone de subduction…", "une plaque océanique plonge sous une autre plaque", ["deux plaques s'écartent", "de la croûte se forme", "les plaques glissent sans contact"], "Volcanisme explosif et séismes profonds."],
      ["Wegener (1912) proposait…", "la dérive des continents", ["la théorie de l'évolution", "la datation au carbone 14", "l'existence du noyau"], "Arguments : formes des côtes, fossiles, traces de glaciers."],
      ["Les anomalies magnétiques symétriques de part et d'autre des dorsales prouvent…", "l'expansion des fonds océaniques", ["l'existence des volcans", "la rotation de la Terre", "le réchauffement climatique"], "Le champ magnétique terrestre s'inverse régulièrement."],
      ["Les ondes sismiques ont permis de montrer…", "que le globe est formé d'enveloppes de propriétés différentes", ["que la Terre est creuse", "que le noyau est solide en entier", "l'âge de la Terre"], "Discontinuités de Moho et de Gutenberg."],
    ],
    [
      ["La lithosphère océanique est plus âgée loin de la dorsale.", true, "Elle s'en éloigne en vieillissant."],
      ["Les plaques se déplacent de plusieurs mètres par an.", false, "De quelques centimètres par an."],
    ],
  ),
  "svt-1-ecosystemes": bank(
    [
      ["Un service écosystémique est…", "un bénéfice que les humains tirent des écosystèmes", ["un service public", "une espèce protégée", "un parc national"], "Pollinisation, épuration de l'eau, stockage du carbone…"],
      ["Une relation de mutualisme est…", "une relation à bénéfice réciproque entre deux espèces", ["une relation où l'un exploite l'autre", "une compétition", "une prédation"], "Exemple : le lichen (algue + champignon)."],
      ["Le parasitisme est une relation où…", "une espèce vit aux dépens d'une autre", ["les deux espèces y gagnent", "aucune n'est affectée", "les espèces se mangent"], "Exemple : le ténia."],
      ["Un réseau trophique représente…", "les relations alimentaires entre les êtres vivants d'un écosystème", ["les cours d'eau", "les relations familiales", "les migrations"], "Les flèches vont du mangé vers le mangeur."],
      ["Les producteurs primaires d'un écosystème sont…", "les végétaux chlorophylliens", ["les herbivores", "les carnivores", "les décomposeurs"], "Ils fabriquent la matière organique par photosynthèse."],
    ],
    [["La disparition d'une espèce peut perturber tout un écosystème.", true, "Effets en cascade dans le réseau trophique."]],
  ),
  "svt-1-immunite": bank(
    [
      ["La réaction inflammatoire se manifeste par…", "rougeur, chaleur, gonflement et douleur", ["fièvre uniquement", "production d'anticorps immédiate", "paralysie"], "C'est une réponse de l'immunité innée."],
      ["La phagocytose est réalisée par…", "des cellules comme les macrophages et les granulocytes", ["les lymphocytes B uniquement", "les globules rouges", "les plaquettes"], "Elles englobent et digèrent les agents pathogènes."],
      ["Les anticorps sont produits par…", "des plasmocytes, issus de lymphocytes B", ["les lymphocytes T", "les macrophages", "les globules rouges"], "Ils neutralisent les antigènes."],
      ["Les lymphocytes T cytotoxiques…", "détruisent les cellules infectées", ["produisent des anticorps", "transportent l'oxygène", "fabriquent des vaccins"], "Réponse à médiation cellulaire."],
      ["Un vaccin permet…", "de développer une mémoire immunitaire sans tomber malade", ["de guérir une infection en cours", "de tuer directement les bactéries", "de remplacer les anticorps de la mère"], "La réponse secondaire est ensuite plus rapide et plus forte."],
      ["Le VIH détruit principalement…", "les lymphocytes T CD4", ["les globules rouges", "les plaquettes", "les neurones"], "Le système immunitaire s'effondre (sida)."],
    ],
    [
      ["L'immunité innée est présente dès la naissance et agit rapidement.", true, "L'immunité adaptative met plusieurs jours."],
      ["Un anticorps reconnaît n'importe quel antigène.", false, "Il est spécifique d'un antigène."],
    ],
  ),
  "svt-1-genetique-sante": bank(
    [
      ["La mucoviscidose est due à…", "des mutations du gène CFTR", ["un virus", "une mauvaise alimentation", "un excès de sport"], "Maladie autosomique récessive."],
      ["Une maladie autosomique récessive se manifeste quand…", "l'individu possède deux allèles mutés", ["un seul allèle est muté", "les parents sont malades", "l'enfant est un garçon"], "Des parents sains peuvent être porteurs."],
      ["Un cancer résulte…", "de l'accumulation de mutations entraînant une division cellulaire incontrôlée", ["d'une infection bactérienne uniquement", "d'un manque de vitamines", "d'une seule mutation toujours héréditaire"], "Facteurs : tabac, UV, alcool, certains virus…"],
      ["Le tabac augmente le risque de cancer car…", "il contient des substances mutagènes", ["il apporte des vitamines", "il tue les bactéries", "il protège des UV"], "Notamment des goudrons."],
      ["Une thérapie génique consiste à…", "introduire un allèle fonctionnel dans des cellules malades", ["supprimer tous les gènes", "transfuser du sang", "prendre des antibiotiques"], "Encore expérimentale pour beaucoup de maladies."],
    ],
    [["Deux parents sains peuvent avoir un enfant atteint de mucoviscidose.", true, "S'ils sont tous deux porteurs sains (hétérozygotes) : 1 risque sur 4."]],
  ),
  "svt-t-brassage": bank(
    [
      ["La méiose produit…", "4 cellules haploïdes génétiquement différentes", ["2 cellules diploïdes identiques", "4 cellules diploïdes", "1 cellule haploïde"], "Ce sont les gamètes (ou spores)."],
      ["Le brassage interchromosomique a lieu…", "en anaphase I, par la répartition aléatoire des chromosomes homologues", ["en prophase I uniquement", "pendant la fécondation", "en anaphase II"], "Pour 23 paires : 2²³ combinaisons possibles."],
      ["Le brassage intrachromosomique résulte…", "des crossing-over entre chromosomes homologues en prophase I", ["de la réplication", "de la mitose", "de la fécondation"], "Il produit des chromosomes recombinés."],
      ["Un test-cross consiste à croiser un individu avec…", "un individu homozygote récessif", ["un individu identique", "un individu hétérozygote", "une autre espèce"], "Les phénotypes des descendants révèlent les gamètes du premier."],
      ["Dans un test-cross, des phénotypes recombinés minoritaires indiquent que les gènes sont…", "liés (sur le même chromosome)", ["indépendants", "absents", "dominants"], "Les recombinés viennent de crossing-over."],
      ["Une cellule humaine diploïde contient…", "46 chromosomes (2n = 46)", ["23 chromosomes", "92 chromosomes", "44 chromosomes"], "Les gamètes en ont 23 (n)."],
      ["Une trisomie 21 peut résulter…", "d'une mauvaise séparation des chromosomes lors de la méiose", ["d'une mutation par substitution", "d'un virus", "d'un crossing-over normal"], "Le gamète porte deux chromosomes 21."],
    ],
    [
      ["La fécondation rétablit la diploïdie.", true, "n + n = 2n."],
      ["Les gamètes d'un même individu sont tous génétiquement identiques.", false, "Les brassages de la méiose les rendent différents."],
    ],
  ),
  "svt-t-datation": bank(
    [
      ["Le principe de superposition indique que…", "une couche sédimentaire est plus récente que celle qu'elle recouvre", ["les couches du bas sont les plus récentes", "toutes les couches ont le même âge", "les fossiles sont toujours en surface"], "Sauf si les couches ont été renversées."],
      ["Le principe de recoupement indique qu'une faille est…", "plus récente que les couches qu'elle recoupe", ["plus ancienne que les couches qu'elle recoupe", "du même âge que les couches", "toujours horizontale"], "Idem pour un filon qui traverse des roches."],
      ["Le principe d'inclusion indique qu'un fragment inclus dans une roche est…", "plus ancien que la roche qui l'inclut", ["plus récent", "du même âge", "toujours d'origine volcanique"], "Il existait avant d'être englobé."],
      ["Un fossile stratigraphique est un fossile…", "d'une espèce ayant vécu peu de temps mais très répandue", ["très rare", "toujours marin", "vivant actuellement"], "Il permet de dater et corréler des couches (ammonites)."],
      ["Le carbone 14 permet de dater des restes…", "organiques de moins de 50 000 ans environ", ["de roches de plusieurs milliards d'années", "de minéraux volcaniques", "de météorites"], "Sa demi-vie est d'environ 5 730 ans."],
      ["L'âge de la Terre est d'environ…", "4,6 milliards d'années", ["6 000 ans", "65 millions d'années", "13,8 milliards d'années"], "Obtenu par datation radiométrique des météorites."],
      ["La crise biologique de la fin du Crétacé (−66 Ma) a vu disparaître…", "les dinosaures non aviens et les ammonites", ["les mammifères", "les insectes", "les plantes à fleurs"], "Elle marque la limite Mésozoïque/Cénozoïque."],
    ],
    [
      ["La datation absolue utilise la désintégration d'éléments radioactifs.", true, "Couples rubidium-strontium, potassium-argon, uranium-plomb…"],
      ["La datation relative donne un âge en années.", false, "Elle ordonne les événements les uns par rapport aux autres."],
    ],
  ),
  "svt-t-climat": bank(
    [
      ["L'effet de serre est dû à des gaz qui…", "absorbent le rayonnement infrarouge émis par la Terre", ["réfléchissent la lumière du Soleil", "détruisent la couche d'ozone", "bloquent les rayons UV"], "Sans lui, la température moyenne serait d'environ −18 °C."],
      ["Les principaux gaz à effet de serre sont…", "la vapeur d'eau, le CO₂ et le méthane", ["le dioxygène et l'azote", "l'argon et l'hélium", "l'ozone uniquement"], "Le CO₂ est le principal gaz émis par les activités humaines."],
      ["Les carottes de glace permettent de reconstituer…", "les températures et la composition de l'atmosphère passées", ["l'âge de la Terre", "les séismes anciens", "les mouvements des plaques"], "Bulles d'air piégées et rapport isotopique de l'oxygène."],
      ["L'albédo, c'est…", "la fraction du rayonnement solaire réfléchie par une surface", ["la quantité de CO₂", "la température moyenne", "la vitesse du vent"], "La neige a un albédo élevé, l'océan un albédo faible."],
      ["La fonte de la banquise accentue le réchauffement car…", "elle diminue l'albédo (l'océan sombre absorbe plus)", ["elle libère du dioxygène", "elle refroidit l'océan", "elle augmente l'albédo"], "C'est une rétroaction positive."],
      ["Un puits de carbone est…", "un réservoir qui absorbe plus de carbone qu'il n'en émet", ["une centrale à charbon", "un volcan", "une source de méthane"], "Océans, forêts, sols."],
      ["De combien la température moyenne mondiale a-t-elle augmenté depuis l'ère préindustrielle ?", "de plus de 1 °C", ["de 0,1 °C", "de 5 °C", "de 10 °C"], "Selon les rapports du GIEC."],
    ],
    [
      ["Les variations de l'orbite terrestre expliquent l'alternance des glaciations sur le long terme.", true, "Cycles de Milanković."],
      ["L'océan absorbe une partie du CO₂ émis par les humains.", true, "Ce qui l'acidifie."],
    ],
  ),
  "svt-t-nerveux": bank(
    [
      ["Le réflexe myotatique est…", "la contraction d'un muscle en réponse à son propre étirement", ["un mouvement volontaire", "une réaction à la douleur uniquement", "un réflexe appris"], "Exemple : le réflexe rotulien."],
      ["L'arc réflexe myotatique comprend…", "récepteur, neurone sensitif, centre nerveux (moelle épinière), neurone moteur, muscle", ["l'œil, le cerveau et la main", "le cœur et les vaisseaux", "les hormones et le sang"], "C'est un réflexe monosynaptique."],
      ["Le message nerveux le long d'un neurone est codé…", "en fréquence de potentiels d'action", ["en amplitude des potentiels d'action", "par la couleur", "par la taille du neurone"], "Plus la stimulation est forte, plus la fréquence augmente."],
      ["Au niveau d'une synapse chimique, le message est transmis par…", "un neurotransmetteur", ["un anticorps", "une hormone sexuelle", "un globule rouge"], "Libéré dans la fente synaptique."],
      ["Le neurotransmetteur de la jonction neuromusculaire est…", "l'acétylcholine", ["la dopamine", "l'adrénaline", "l'insuline"], "Elle déclenche la contraction de la fibre musculaire."],
      ["La plasticité cérébrale désigne…", "la capacité du cerveau à se réorganiser selon l'apprentissage", ["la rigidité des neurones", "la perte de neurones", "un trouble mental"], "Elle permet la rééducation après un AVC."],
      ["Le mouvement volontaire est commandé par…", "le cortex moteur", ["la moelle épinière seule", "le cœur", "le cervelet uniquement"], "Organisation somatotopique (« homonculus »)."],
    ],
    [
      ["Dans un réflexe myotatique, le muscle antagoniste se relâche.", true, "Grâce à un interneurone inhibiteur."],
      ["Un potentiel d'action peut avoir une amplitude plus grande si le stimulus est plus fort.", false, "Son amplitude est constante (« tout ou rien »)."],
    ],
  ),
  "svt-t-plantes": bank(
    [
      ["Une plante à vie fixée échange avec son milieu grâce à…", "de grandes surfaces d'échange (feuilles, racines)", ["des déplacements rapides", "un système nerveux", "des poumons"], "Surface foliaire et poils absorbants."],
      ["Les stomates permettent…", "les échanges gazeux et la transpiration", ["l'absorption de l'eau du sol", "la reproduction", "la défense contre les herbivores"], "Ils sont surtout sur la face inférieure des feuilles."],
      ["La sève brute circule dans…", "le xylème, des racines vers les feuilles", ["le phloème, des feuilles vers les racines", "les stomates", "les fleurs"], "Elle contient eau et ions minéraux."],
      ["La sève élaborée circule dans…", "le phloème", ["le xylème", "les stomates", "le pollen"], "Elle transporte les sucres produits par la photosynthèse."],
      ["La pollinisation est…", "le transport du pollen vers le pistil", ["la fécondation de l'ovule", "la germination de la graine", "la chute des feuilles"], "Souvent assurée par des insectes (mutualisme)."],
      ["Après la fécondation, l'ovule devient…", "la graine, et l'ovaire devient le fruit", ["le fruit, et l'ovaire la graine", "une fleur", "une feuille"], "Le fruit protège et aide à disperser les graines."],
      ["La domestication des plantes a commencé il y a environ…", "10 000 ans", ["100 ans", "1 million d'années", "100 000 ans"], "Au Néolithique (blé, orge au Proche-Orient)."],
    ],
    [["Les plantes peuvent se défendre chimiquement contre les herbivores.", true, "Tanins, alcaloïdes…"]],
  ),
  "svt-t-muscle": bank(
    [
      ["La contraction d'une fibre musculaire repose sur…", "le glissement des filaments d'actine et de myosine", ["la division des cellules", "l'allongement de l'ADN", "la circulation du sang dans la fibre"], "Le sarcomère se raccourcit."],
      ["Le déclenchement de la contraction nécessite la libération d'ions…", "calcium (Ca²⁺)", ["sodium uniquement", "fer", "chlorure"], "Libérés par le réticulum sarcoplasmique."],
      ["La source d'énergie directement utilisée par la myosine est…", "l'ATP", ["le glucose", "les lipides", "le dioxygène"], "Il doit être régénéré en permanence."],
      ["La respiration produit par molécule de glucose environ…", "32 à 36 ATP", ["2 ATP", "100 ATP", "1 ATP"], "La fermentation n'en produit que 2."],
      ["En effort intense, la fermentation lactique produit…", "de l'acide lactique (lactate) et peu d'ATP", ["beaucoup d'ATP", "du CO₂ et de l'alcool", "du dioxygène"], "Elle ne nécessite pas de dioxygène."],
      ["La glycolyse se déroule…", "dans le cytoplasme", ["dans la mitochondrie", "dans le noyau", "dans le sang"], "Elle est commune à la respiration et à la fermentation."],
      ["Le cycle de Krebs se déroule…", "dans la matrice mitochondriale", ["dans le cytoplasme", "dans le noyau", "dans le chloroplaste"], "Il produit du CO₂ et des transporteurs réduits."],
    ],
    [
      ["La respiration cellulaire consomme du dioxygène.", true, "Il est l'accepteur final des électrons."],
      ["La phosphocréatine permet de régénérer rapidement l'ATP au début d'un effort.", true, "Voie anaérobie alactique."],
    ],
  ),
  "svt-t-stress": bank(
    [
      ["En situation de stress aigu, la première hormone libérée est…", "l'adrénaline", ["le cortisol", "l'insuline", "la mélatonine"], "Sécrétée en quelques secondes par la médullosurrénale."],
      ["L'adrénaline provoque notamment…", "une accélération du rythme cardiaque et une libération de glucose", ["une baisse du rythme cardiaque", "le sommeil", "la digestion"], "Préparation à la fuite ou au combat."],
      ["L'axe corticotrope comprend…", "hypothalamus (CRH), hypophyse (ACTH) et corticosurrénale (cortisol)", ["pancréas et foie", "thyroïde et ovaires", "cœur et poumons"], "Il libère le cortisol en quelques minutes."],
      ["Le cortisol exerce un rétrocontrôle négatif sur…", "l'hypothalamus et l'hypophyse", ["le cœur", "les muscles", "le pancréas"], "Ce qui limite sa propre sécrétion."],
      ["Un stress chronique peut entraîner…", "un affaiblissement du système immunitaire et des troubles divers", ["une meilleure immunité", "une croissance plus rapide", "aucun effet"], "Le cortisol en excès a des effets immunosuppresseurs."],
      ["Les anxiolytiques de la famille des benzodiazépines agissent sur…", "les récepteurs du GABA, un neurotransmetteur inhibiteur", ["les globules rouges", "l'ADN", "les muscles directement"], "Ils peuvent créer une dépendance."],
    ],
    [
      ["Le stress aigu est une réponse adaptative de l'organisme.", true, "Il permet de faire face à une situation."],
      ["Le cortisol est sécrété par la médullosurrénale.", false, "Par la corticosurrénale ; la médullosurrénale sécrète l'adrénaline."],
    ],
  ),
};
