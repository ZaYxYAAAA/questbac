/**
 * SVT — notions, définitions et affirmations supplémentaires
 * (programmes de Seconde, Première et Terminale, enseignement de spécialité).
 */
import { type Claim, type Generator, type Pair, claims, pairs } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });
const bank = (t: readonly Pair[], c: readonly Claim[]): Generator[] => [...terms(t), claims(c)];

export const EXTRA_SVT: Record<string, Generator[]> = {
  "svt-2-metabolisme": bank(
    [["métabolisme", "l'ensemble des réactions chimiques d'une cellule"], ["enzyme", "une protéine qui catalyse une réaction chimique"], ["substrat", "la molécule transformée par une enzyme"],
     ["site actif", "la région de l'enzyme où se fixe le substrat"], ["respiration cellulaire", "l'oxydation complète du glucose avec du dioxygène, produisant de l'ATP"], ["fermentation", "la dégradation incomplète du glucose sans dioxygène"],
     ["photosynthèse", "la production de matière organique à partir de CO₂, d'eau et de lumière"], ["chloroplaste", "l'organite de la photosynthèse"], ["mitochondrie", "l'organite de la respiration cellulaire"],
     ["autotrophe", "un organisme qui produit sa matière organique à partir de matière minérale"], ["hétérotrophe", "un organisme qui se nourrit de matière organique"], ["ATP", "la molécule qui fournit l'énergie utilisable par la cellule"]],
    [["Une enzyme est consommée au cours de la réaction qu'elle catalyse.", false, "Elle est retrouvée intacte."], ["L'activité d'une enzyme dépend de la température et du pH.", true, "Il existe un optimum."],
     ["La respiration produit plus d'ATP que la fermentation.", true, "Environ 36 ATP contre 2 par glucose."], ["Les végétaux ne respirent pas.", false, "Ils respirent jour et nuit et font la photosynthèse à la lumière."]],
  ),
  "svt-2-sols": bank(
    [["humus", "la matière organique décomposée du sol"], ["horizon", "une couche du sol de composition homogène"], ["roche mère", "la roche à partir de laquelle se forme le sol"],
     ["agrosystème", "un écosystème cultivé et géré par l'homme"], ["intrant", "un apport extérieur au champ (engrais, pesticides, eau…)"], ["engrais", "un apport d'éléments minéraux pour favoriser la croissance des plantes"],
     ["érosion", "l'usure et le transport des sols par l'eau ou le vent"], ["lessivage", "l'entraînement d'éléments du sol en profondeur par l'eau"], ["complexe argilo-humique", "l'association d'argiles et d'humus qui retient les ions du sol"],
     ["rotation des cultures", "l'alternance des cultures sur une même parcelle"], ["agroécologie", "une agriculture qui s'appuie sur les fonctionnements écologiques"], ["eutrophisation", "l'enrichissement excessif d'un milieu aquatique en nutriments"]],
    [["Un sol fertile se forme en quelques semaines.", false, "Il faut des siècles, voire des millénaires."], ["Les vers de terre participent à l'aération et au brassage du sol.", true, "Bioturbation."],
     ["Les légumineuses enrichissent le sol en azote grâce à des bactéries symbiotiques.", true, "Nodosités des racines."], ["Une récolte exporte une partie des éléments minéraux du sol.", true, "D'où l'apport d'engrais."]],
  ),
  "svt-2-procreation": bank(
    [["gonade", "un organe qui produit les gamètes (testicule ou ovaire)"], ["spermatozoïde", "le gamète mâle"], ["ovocyte", "le gamète femelle"], ["testostérone", "l'hormone produite par les testicules"],
     ["œstrogènes", "des hormones produites par les ovaires"], ["ovulation", "la libération d'un ovocyte par l'ovaire"], ["cycle menstruel", "le cycle d'environ 28 jours de l'appareil reproducteur féminin"],
     ["hypophyse", "la glande qui sécrète FSH et LH"], ["contraception", "les méthodes qui empêchent une grossesse"], ["IST", "une infection sexuellement transmissible"],
     ["puberté", "la période où les organes reproducteurs deviennent fonctionnels"], ["fécondation", "la fusion d'un spermatozoïde et d'un ovocyte"]],
    [["Le préservatif protège à la fois des grossesses et des IST.", true, "Seule contraception protégeant des IST."], ["La pilule contraceptive bloque l'ovulation.", true, "Par rétrocontrôle sur l'hypophyse."],
     ["Le sexe génétique est déterminé par la paire XX ou XY.", true, "Le gène SRY sur le Y oriente vers le sexe masculin."], ["Les spermatozoïdes sont produits uniquement pendant l'adolescence.", false, "Production continue de la puberté à la fin de la vie."]],
  ),
  "svt-2-microorganismes": bank(
    [["micro-organisme", "un être vivant visible seulement au microscope"], ["microbiote", "l'ensemble des micro-organismes vivant dans un milieu (intestin, peau…)"], ["bactérie", "un être vivant unicellulaire sans noyau"],
     ["virus", "un agent infectieux qui ne se reproduit qu'à l'intérieur d'une cellule"], ["antibiotique", "une molécule qui tue ou bloque les bactéries"], ["antibiorésistance", "la capacité de bactéries à résister aux antibiotiques"],
     ["pathogène", "un agent capable de provoquer une maladie"], ["vecteur", "un organisme qui transmet un pathogène (moustique, tique…)"], ["épidémie", "la propagation rapide d'une maladie dans une population"],
     ["pandémie", "une épidémie qui s'étend à plusieurs continents"], ["symbiose", "une association durable et bénéfique entre deux espèces"], ["asepsie", "l'ensemble des mesures empêchant l'introduction de microbes"]],
    [["Les antibiotiques sont efficaces contre les virus.", false, "Ils n'agissent que sur les bactéries."], ["Le microbiote intestinal participe à la digestion.", true, "Et à la protection contre des pathogènes."],
     ["Le paludisme est transmis par des moustiques.", true, "Anophèles femelles."], ["Se laver les mains limite la transmission de nombreuses maladies.", true, "Mesure d'hygiène essentielle."]],
  ),
  "svt-2-paysages": bank(
    [["érosion", "l'enlèvement de matériaux à la surface de la Terre"], ["altération", "la transformation chimique ou physique des roches en surface"], ["sédimentation", "le dépôt de particules transportées"],
     ["roche sédimentaire", "une roche formée par l'accumulation de sédiments"], ["roche magmatique", "une roche issue du refroidissement d'un magma"], ["granite", "une roche magmatique grenue de la croûte continentale"],
     ["basalte", "une roche volcanique de la croûte océanique"], ["calcaire", "une roche sédimentaire faite de carbonate de calcium"], ["moraine", "un dépôt de roches transporté par un glacier"],
     ["vallée en U", "une vallée creusée par un glacier"], ["vallée en V", "une vallée creusée par une rivière"], ["karst", "un relief formé par la dissolution du calcaire"]],
    [["Le calcaire fait effervescence avec l'acide chlorhydrique.", true, "Dégagement de CO₂."], ["Les paysages sont figés et ne changent jamais.", false, "Ils évoluent sous l'effet de l'érosion et de la tectonique."],
     ["Les grains d'un granite sont visibles à l'œil nu.", true, "Refroidissement lent en profondeur."], ["L'eau est le principal agent d'érosion sur les continents.", true, "Ruissellement, rivières, gel…"]],
  ),
  "svt-1-genetique-sante": bank(
    [["mutation", "une modification de la séquence de l'ADN"], ["allèle", "une version d'un gène"], ["génotype", "l'ensemble des allèles d'un individu"], ["phénotype", "l'ensemble des caractères observables d'un individu"],
     ["allèle dominant", "un allèle qui s'exprime même à l'état hétérozygote"], ["allèle récessif", "un allèle qui ne s'exprime qu'à l'état homozygote"], ["mucoviscidose", "une maladie génétique récessive touchant les poumons et le pancréas"],
     ["oncogène", "un gène dont la mutation favorise la cancérisation"], ["agent mutagène", "un facteur qui augmente la fréquence des mutations (UV, tabac…)"], ["thérapie génique", "un traitement qui introduit un gène fonctionnel dans des cellules"],
     ["médecine personnalisée", "un traitement adapté au profil génétique du patient ou de sa tumeur"], ["hétérozygote", "un individu portant deux allèles différents d'un gène"]],
    [["Toutes les mutations provoquent des maladies.", false, "Beaucoup sont neutres, certaines bénéfiques."], ["Le tabac et les UV sont des agents mutagènes.", true, "Ils favorisent les cancers."],
     ["Un cancer résulte souvent de l'accumulation de plusieurs mutations.", true, "Dans une même lignée cellulaire."], ["Une mutation dans une cellule de la peau se transmet aux enfants.", false, "Seules les mutations des cellules germinales sont héréditaires."]],
  ),
  "svt-1-immunite": bank(
    [["immunité innée", "la défense rapide et non spécifique présente dès la naissance"], ["immunité adaptative", "la défense spécifique d'un antigène, plus lente à se mettre en place"], ["antigène", "une molécule reconnue comme étrangère par le système immunitaire"],
     ["anticorps", "une protéine produite par les plasmocytes qui se fixe sur un antigène"], ["lymphocyte B", "une cellule qui produit les anticorps après différenciation en plasmocyte"], ["lymphocyte T CD8", "une cellule qui détruit les cellules infectées"],
     ["lymphocyte T CD4", "une cellule qui coordonne la réponse adaptative"], ["phagocytose", "l'ingestion et la digestion d'un élément étranger par une cellule"], ["inflammation", "la réaction locale (rougeur, chaleur, gonflement, douleur) à une infection"],
     ["mémoire immunitaire", "la capacité à répondre plus vite lors d'un second contact"], ["vaccin", "une préparation qui déclenche une mémoire immunitaire sans maladie"], ["séropositivité", "la présence dans le sang d'anticorps dirigés contre un agent"]],
    [["Le VIH détruit les lymphocytes T CD4.", true, "D'où l'immunodéficience (sida)."], ["La vaccination protège aussi les personnes non vaccinées quand la couverture est élevée.", true, "Immunité de groupe."],
     ["Les anticorps détruisent directement les cellules infectées.", false, "Ils neutralisent les antigènes ; ce sont les LT CD8 qui tuent les cellules infectées."], ["La réponse secondaire est plus rapide et plus forte que la réponse primaire.", true, "Grâce aux cellules mémoire."]],
  ),
  "svt-t-plantes": bank(
    [["stomate", "un orifice des feuilles permettant les échanges gazeux"], ["sève brute", "l'eau et les ions minéraux qui montent des racines"], ["sève élaborée", "la sève riche en sucres produite par les feuilles"],
     ["xylème", "le tissu conducteur de la sève brute"], ["phloème", "le tissu conducteur de la sève élaborée"], ["mycorhize", "l'association symbiotique entre racines et champignons"],
     ["pollinisation", "le transport du pollen vers le pistil"], ["domestication", "la sélection par l'homme d'espèces sauvages pour les cultiver"], ["méristème", "une zone de cellules qui se divisent et assurent la croissance"],
     ["amidon", "la forme de stockage des glucides chez les plantes"], ["cellulose", "le constituant principal de la paroi des cellules végétales"], ["phytohormone", "une hormone végétale comme l'auxine"]],
    [["Les plantes à fleurs peuvent se reproduire de façon asexuée (bouturage, stolons…).", true, "Multiplication végétative."], ["Le maïs a été domestiqué à partir d'une plante sauvage, la téosinte.", true, "Au Mexique, il y a ~9 000 ans."],
     ["Une plante peut se déplacer pour fuir un prédateur.", false, "Elle est fixée mais se défend par des molécules (toxines, épines…)."], ["Les racines absorbent l'eau grâce aux poils absorbants.", true, "Grande surface d'échange."]],
  ),
  "svt-t-stress": bank(
    [["stress aigu", "la réponse rapide de l'organisme à une situation perçue comme menaçante"], ["stress chronique", "un stress prolongé qui peut nuire à la santé"], ["cortisol", "l'hormone du stress sécrétée par la corticosurrénale"],
     ["adrénaline", "l'hormone libérée par la médullosurrénale lors d'un stress aigu"], ["axe hypothalamo-hypophyso-surrénalien", "la chaîne hormonale qui aboutit à la sécrétion de cortisol"], ["résilience", "la capacité à surmonter un choc"],
     ["système limbique", "un ensemble de structures cérébrales impliquées dans les émotions"], ["amygdale", "une structure du cerveau qui détecte le danger"], ["hippocampe", "une structure du cerveau impliquée dans la mémoire et la régulation du stress"],
     ["plasticité cérébrale", "la capacité du cerveau à se modifier"], ["anxiolytique", "un médicament qui diminue l'anxiété"], ["rétrocontrôle négatif", "un mécanisme qui freine une sécrétion quand son effet est atteint"]],
    [["Le cortisol augmente la glycémie.", true, "Il mobilise les réserves d'énergie."], ["Le stress n'a aucun effet sur le système immunitaire.", false, "Un stress chronique l'affaiblit."],
     ["Le sport et le sommeil aident à limiter les effets du stress chronique.", true, "Hygiène de vie."], ["Le cortisol exerce un rétrocontrôle négatif sur l'hypothalamus et l'hypophyse.", true, "Ce qui limite sa propre sécrétion."]],
  ),
};
