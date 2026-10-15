/**
 * Français, anglais, espagnol : questions supplémentaires (notions d'analyse
 * littéraire, méthode, grammaire, civilisation), en complément des banques existantes.
 */
import { type Card, type Claim, type Generator, cards, claims } from "./kit";

const bank = (c: Card[], v: Claim[] = []): Generator[] => (v.length ? [cards(c), claims(v)] : [cards(c)]);

export const LETTRES_LANGUES_PLUS: Record<string, Generator[]> = {
  // ───────────── Français ─────────────
  "fr-2-figures": bank(
    [
      ["« Paris est une fête » : figure de style ?", "une métaphore", ["une comparaison", "une litote", "une anaphore"], "Rapprochement sans outil de comparaison."],
      ["« Rome, l'unique objet de mon ressentiment ! Rome à qui vient ton bras d'immoler mon amant ! » : figure de style ?", "une anaphore", ["un chiasme", "un oxymore", "une périphrase"], "Répétition d'un mot en début de vers (Corneille, Horace)."],
      ["« Le roi des animaux » pour « le lion » : figure de style ?", "une périphrase", ["une métonymie", "une hyperbole", "une antithèse"], "On remplace un mot par une expression qui le décrit."],
      ["« Je vis, je meurs ; je me brûle et me noie » (Louise Labé) : figure de style principale ?", "une antithèse", ["une litote", "une métonymie", "une gradation"], "Opposition d'idées dans une même phrase."],
      ["« Il faut manger pour vivre et non pas vivre pour manger » : figure de style ?", "un chiasme", ["une anaphore", "une hyperbole", "une comparaison"], "Structure en miroir ABBA."],
      ["L'allégorie consiste à…", "représenter une idée abstraite par un personnage ou une image concrète", ["exagérer une idée", "atténuer une idée", "répéter un mot"], "Exemple : la Mort avec sa faux."],
      ["« Ce n'est pas mauvais » pour dire « c'est très bon » est…", "une litote", ["un euphémisme", "une hyperbole", "un oxymore"], "Dire moins pour suggérer plus."],
      ["« Il s'est éteint » pour « il est mort » est…", "un euphémisme", ["une litote", "une hyperbole", "une métaphore filée"], "Atténuer une réalité pénible."],
    ],
    [
      ["Une métaphore filée prolonge une même métaphore sur plusieurs mots ou phrases.", true, "Elle développe un réseau d'images cohérent."],
      ["L'hyperbole atténue la réalité.", false, "Elle l'exagère ; c'est la litote ou l'euphémisme qui atténue."],
    ],
  ),
  "fr-2-poesie": bank(
    [
      ["Une rime riche partage…", "au moins trois sons identiques", ["un seul son", "deux sons", "uniquement des voyelles"], "Rime pauvre : 1 son ; suffisante : 2 sons."],
      ["Un enjambement, c'est…", "une phrase qui continue sur le vers suivant", ["la répétition d'un vers", "une rime intérieure", "une strophe de quatre vers"], "Le rejet et le contre-rejet en sont des variantes."],
      ["La césure d'un alexandrin classique se place…", "après la 6e syllabe", ["après la 4e syllabe", "après la 8e syllabe", "à la fin du vers"], "Elle sépare deux hémistiches."],
      ["Une diérèse consiste à…", "prononcer en deux syllabes deux voyelles qui se suivent", ["supprimer un e muet", "réunir deux syllabes en une", "inverser deux mots"], "« Li-on » au lieu de « lion »."],
      ["Le vers libre est un vers…", "sans mètre fixe ni rime obligatoire", ["de douze syllabes", "toujours rimé", "réservé au théâtre"], "Développé à la fin du XIXe siècle."],
      ["Le poème en prose est associé notamment à…", "Baudelaire (Le Spleen de Paris)", ["Racine", "Molière", "La Fontaine"], "Aussi Aloysius Bertrand, Rimbaud."],
      ["Une allitération est…", "la répétition d'un même son consonne", ["la répétition d'un son voyelle", "une rime pauvre", "une figure d'opposition"], "La répétition d'une voyelle est une assonance."],
      ["Le mouvement poétique de Rimbaud, Verlaine et Mallarmé est souvent rattaché au…", "symbolisme", ["classicisme", "réalisme", "surréalisme"], "Fin du XIXe siècle."],
    ],
    [
      ["Un sonnet compte quatorze vers.", true, "Deux quatrains et deux tercets."],
      ["Une rime féminine se termine par un e muet.", true, "Les autres rimes sont masculines."],
    ],
  ),
  "fr-2-theatre": bank(
    [
      ["Une didascalie est…", "une indication scénique de l'auteur (gestes, décor, ton)", ["une réplique très longue", "un personnage secondaire", "la fin d'une pièce"], "Souvent en italique."],
      ["Un aparté est…", "une réplique que le personnage dit pour lui-même, entendue du public mais pas des autres personnages", ["un dialogue entre deux personnages", "une scène sans paroles", "un changement de décor"], "Convention théâtrale."],
      ["Un monologue est…", "une réplique d'un personnage seul en scène", ["un dialogue rapide", "une indication de mise en scène", "la scène d'exposition"], "Il révèle souvent ses pensées ou ses hésitations."],
      ["La stichomythie est…", "un échange de répliques très courtes, vers à vers", ["un long monologue", "une tirade", "une didascalie"], "Elle traduit souvent l'affrontement."],
      ["La règle des trois unités du théâtre classique impose…", "une seule action, un seul lieu, une seule journée", ["trois actes, trois lieux, trois personnages", "trois jours de représentation", "trois genres mélangés"], "Avec la bienséance et la vraisemblance."],
      ["La scène d'exposition a pour fonction…", "de présenter les personnages, la situation et l'intrigue", ["de conclure l'histoire", "de résoudre le conflit", "d'annoncer l'entracte"], "Elle se trouve au début."],
      ["Un quiproquo est…", "un malentendu où un personnage est pris pour un autre ou une chose pour une autre", ["un monologue", "un dénouement tragique", "un décor"], "Ressort fréquent de la comédie."],
      ["La « double énonciation » au théâtre signifie que…", "les personnages se parlent, mais l'auteur s'adresse aussi au public", ["deux acteurs disent la même réplique", "la pièce a deux auteurs", "la pièce est jouée deux fois"], "Le spectateur sait parfois ce que les personnages ignorent."],
    ],
    [
      ["Une tirade est une longue réplique ininterrompue.", true, "Exemple : la tirade du nez dans Cyrano de Bergerac."],
      ["Molière est surtout un auteur de tragédies.", false, "Il est surtout l'auteur de comédies."],
    ],
  ),
  "fr-2-roman": bank(
    [
      ["En focalisation interne, le lecteur…", "voit l'histoire à travers les yeux et les pensées d'un personnage", ["sait tout sur tous les personnages", "ne connaît rien des pensées", "lit une pièce de théâtre"], "Point de vue limité à un personnage."],
      ["En focalisation zéro (point de vue omniscient), le narrateur…", "sait tout : pensées, passé et avenir des personnages", ["ne voit que l'extérieur", "est un personnage", "ignore la fin"], "Fréquent chez Balzac."],
      ["En focalisation externe, le narrateur…", "décrit de l'extérieur sans accès aux pensées", ["connaît toutes les pensées", "raconte à la première personne", "s'adresse au lecteur"], "Comme une caméra."],
      ["Un récit à la première personne où le narrateur est le héros a un narrateur…", "homodiégétique (personnage)", ["extérieur à l'histoire", "omniscient obligatoirement", "absent"], "Le narrateur fait partie de l'histoire."],
      ["Le schéma narratif comprend…", "situation initiale, élément perturbateur, péripéties, résolution, situation finale", ["introduction, développement, conclusion", "thèse, antithèse, synthèse", "exposition, tirade, dénouement"], "Structure classique d'un récit."],
      ["Une ellipse narrative consiste à…", "passer sous silence une période de l'histoire", ["ralentir le récit", "revenir en arrière", "répéter un événement"], "Le récit accélère fortement."],
      ["Un retour en arrière dans le récit s'appelle…", "une analepse", ["une prolepse", "une ellipse", "une pause"], "La prolepse anticipe la suite."],
      ["Le réalisme cherche à…", "représenter fidèlement la réalité, y compris sociale", ["peindre un monde merveilleux", "exprimer uniquement des sentiments", "suivre les règles classiques"], "Balzac, Flaubert, Maupassant."],
    ],
    [
      ["Le narrateur et l'auteur sont toujours la même personne.", false, "Le narrateur est une instance du texte, sauf dans l'autobiographie."],
      ["Le roman épistolaire est composé de lettres.", true, "Exemple : Les Liaisons dangereuses."],
    ],
  ),
  "fr-2-litterature-idees": bank(
    [
      ["Un apologue est…", "un récit court qui illustre une leçon morale", ["un essai scientifique", "une pièce de théâtre", "un poème lyrique"], "Fable, conte philosophique, parabole…"],
      ["Un conte philosophique, comme Candide, est…", "un récit fictif qui critique la société et transmet des idées", ["une biographie", "un traité de science", "une lettre ouverte"], "Genre très utilisé par Voltaire."],
      ["Un pamphlet est…", "un écrit court et violent qui attaque une personne ou une institution", ["un poème d'amour", "un roman d'aventures", "un éloge"], "Ton polémique."],
      ["La concession dans une argumentation consiste à…", "reconnaître en partie la valeur de l'argument adverse avant de le réfuter", ["donner un exemple", "conclure", "insulter l'adversaire"], "Connecteurs : certes, il est vrai que… mais."],
      ["Un argument d'autorité s'appuie sur…", "l'avis d'une personne reconnue", ["une expérience personnelle", "un chiffre", "un raisonnement logique"], "À manier avec prudence."],
      ["L'ironie consiste à…", "dire le contraire de ce que l'on pense pour le faire comprendre", ["exagérer une idée", "répéter un mot", "parler en vers"], "Arme favorite de Voltaire."],
      ["Un éditorial est…", "un article qui exprime la position d'un journal, souvent signé par un responsable", ["une publicité", "un fait divers", "une lettre de lecteur"], "Il commente l'actualité."],
    ],
    [
      ["Convaincre, c'est s'adresser à la raison ; persuader, c'est s'adresser aux sentiments.", true, "Distinction classique de l'argumentation."],
      ["Une thèse est l'opinion défendue dans un texte argumentatif.", true, "Elle est soutenue par des arguments et des exemples."],
    ],
  ),
  "fr-1-mouvements": bank(
    [
      ["Le classicisme correspond principalement au…", "XVIIe siècle", ["XVIe siècle", "XIXe siècle", "XXe siècle"], "Règles, raison, bienséance (Racine, Molière, La Fontaine)."],
      ["Le romantisme valorise surtout…", "l'expression des sentiments, du moi et de la nature", ["la raison et les règles", "la description scientifique de la société", "l'absurde"], "Hugo, Lamartine, Musset (1820-1850)."],
      ["Le naturalisme, mené par Zola, cherche à…", "étudier scientifiquement l'influence du milieu et de l'hérédité", ["exprimer les rêves", "imiter les Anciens", "célébrer la monarchie"], "Prolonge le réalisme."],
      ["Le surréalisme, fondé par André Breton, s'intéresse…", "au rêve, à l'inconscient et à l'écriture automatique", ["aux règles classiques", "à la description sociale", "à la religion"], "Premier Manifeste en 1924."],
      ["La « Préface de Cromwell » (1827) est le manifeste…", "du drame romantique, par Victor Hugo", ["du classicisme", "du surréalisme", "du naturalisme"], "Hugo y refuse les trois unités."],
      ["Le Nouveau Roman (années 1950) remet en cause…", "le personnage et l'intrigue traditionnels", ["la poésie en vers", "le théâtre classique", "la langue française"], "Robbe-Grillet, Sarraute."],
      ["L'humanisme est le mouvement du…", "XVIe siècle", ["XVIIIe siècle", "XIXe siècle", "Moyen Âge"], "Érasme, Rabelais, Montaigne."],
    ],
    [
      ["Les Lumières sont un mouvement du XVIIIe siècle.", true, "Voltaire, Diderot, Rousseau, Montesquieu."],
      ["Le baroque privilégie l'ordre, la mesure et la stabilité.", false, "Il privilégie le mouvement, l'illusion et l'instabilité."],
    ],
  ),
  "fr-1-commentaire": bank(
    [
      ["Dans un commentaire, un axe de lecture est…", "une grande idée d'interprétation du texte, développée en sous-parties", ["un résumé du texte", "la biographie de l'auteur", "une liste de figures de style"], "On en propose deux ou trois."],
      ["Une citation dans le commentaire doit être…", "courte, entre guillemets, et analysée", ["la plus longue possible", "placée seulement en conclusion", "recopiée sans commentaire"], "Citer, analyser, interpréter."],
      ["L'introduction d'un commentaire comprend notamment…", "une présentation du texte, une problématique et l'annonce du plan", ["la conclusion", "toutes les citations", "un résumé ligne à ligne"], "On commence par une amorce."],
      ["Un procédé d'écriture doit toujours être…", "relié à un effet de sens", ["simplement nommé", "évité", "placé en introduction"], "Identifier ne suffit pas : il faut interpréter."],
      ["Le registre pathétique cherche à…", "susciter la pitié et l'émotion", ["faire rire", "faire peur uniquement", "démontrer une thèse"], "Le registre comique fait rire, le tragique montre la fatalité."],
      ["Le registre lyrique exprime…", "les sentiments personnels du locuteur", ["une critique sociale", "un combat épique", "une démonstration"], "Souvent à la première personne."],
    ],
    [["Le commentaire suit l'ordre du texte ligne à ligne.", false, "C'est l'explication linéaire ; le commentaire est organisé en axes."]],
  ),
  "fr-1-dissertation": bank(
    [
      ["Le plan dialectique suit le schéma…", "thèse, antithèse, synthèse (ou dépassement)", ["introduction, conclusion", "chronologique uniquement", "un seul argument"], "Adapté aux sujets qui appellent un débat."],
      ["Un paragraphe argumentatif contient…", "un argument, un exemple précis et une analyse", ["seulement une citation", "un résumé de l'œuvre", "une question"], "L'exemple doit venir des œuvres étudiées."],
      ["La problématique d'une dissertation…", "reformule la question du sujet en faisant apparaître son enjeu", ["répond directement au sujet", "résume le plan", "cite l'auteur"], "Elle guide tout le développement."],
      ["Une transition entre deux parties sert à…", "faire le bilan de la partie et annoncer la suivante", ["répéter l'introduction", "conclure définitivement", "citer un auteur"], "Elle montre la progression du raisonnement."],
      ["La conclusion d'une dissertation comprend…", "un bilan qui répond à la problématique et une ouverture", ["de nouveaux arguments", "la recopie de l'introduction", "uniquement une citation"], "L'ouverture élargit la réflexion."],
    ],
    [["Dans une dissertation sur œuvre, les exemples doivent venir en priorité de l'œuvre au programme.", true, "Et de son parcours associé."]],
  ),
  "fr-1-grammaire": bank(
    [
      ["Dans « Je sais que tu viendras », la proposition « que tu viendras » est…", "une subordonnée complétive", ["une subordonnée relative", "une subordonnée circonstancielle", "une proposition indépendante"], "Elle complète le verbe « savoir »."],
      ["Dans « Le livre que je lis est passionnant », « que je lis » est…", "une subordonnée relative", ["une complétive", "une circonstancielle de cause", "une interrogative"], "Elle complète le nom « livre »."],
      ["Dans « Il est parti parce qu'il était fatigué », la subordonnée exprime…", "la cause", ["la conséquence", "le but", "la concession"], "Introduite par « parce que »."],
      ["Dans « Bien qu'il pleuve, nous sortons », la subordonnée exprime…", "la concession", ["la cause", "le temps", "la condition"], "« Bien que » + subjonctif."],
      ["« Ne… guère » exprime…", "une négation partielle (pas beaucoup)", ["une négation totale", "une affirmation", "une interrogation"], "« Ne… jamais », « ne… plus » sont aussi partielles."],
      ["Une interrogation totale appelle une réponse…", "par oui ou par non", ["développée", "par un chiffre", "impossible"], "« Viens-tu ? » L'interrogation partielle porte sur un élément (« Où vas-tu ? »)."],
      ["Dans « Je me demande s'il viendra », on a…", "une interrogation indirecte", ["une interrogation directe", "une subordonnée relative", "une négation"], "Pas de point d'interrogation."],
    ],
    [["« Afin que » est suivi du subjonctif.", true, "Subordonnée de but."]],
  ),
  // ───────────── Anglais ─────────────
  "en-2-past": bank(
    [
      ["« I have lived here since 2015. » Ce present perfect exprime…", "une action commencée dans le passé qui dure encore", ["une action terminée", "une habitude passée", "un futur proche"], "Avec since (point de départ) ou for (durée)."],
      ["Quel marqueur de temps s'emploie avec le prétérit ?", "yesterday", ["since", "already", "ever"], "Une date passée et révolue : yesterday, last year, ago, in 2010."],
      ["« She ___ (go) to London last summer. »", "went", ["has gone", "goes", "was go"], "Last summer : moment passé et révolu → prétérit."],
      ["« I ___ never ___ sushi. » (expérience jusqu'à maintenant)", "have… eaten", ["did… eat", "was… eating", "had… ate"], "Present perfect pour une expérience de vie."],
      ["« I was reading when the phone ___. »", "rang", ["was ringing", "has rung", "rings"], "Action longue au be + -ing interrompue par une action brève au prétérit."],
      ["Prétérit du verbe « to bring » ?", "brought", ["bringed", "brang", "brung"], "Verbe irrégulier : bring, brought, brought."],
    ],
    [["« For » indique une durée et « since » un point de départ.", true, "For three years / since 2021."]],
  ),
  "en-1-modals": bank(
    [
      ["« You mustn't smoke here. » exprime…", "une interdiction", ["une absence d'obligation", "un conseil", "une capacité"], "« You don't have to » = ce n'est pas obligatoire."],
      ["« You should see a doctor. » exprime…", "un conseil", ["une obligation légale", "une interdiction", "une certitude"], "Should = conseil, recommandation."],
      ["« He might be late. » exprime…", "une faible probabilité", ["une certitude", "une obligation", "une capacité"], "Might < may < must en degré de certitude."],
      ["« She must be tired, she worked all night. » exprime…", "une forte probabilité (déduction)", ["une obligation", "une interdiction", "un souhait"], "Must peut exprimer une quasi-certitude."],
      ["« I could swim when I was five. » exprime…", "une capacité dans le passé", ["une permission", "un reproche", "un futur"], "Could = prétérit de can."],
      ["« You should have told me! » exprime…", "un reproche sur une action passée", ["un conseil pour l'avenir", "une capacité", "une certitude"], "Modal + have + participe passé."],
    ],
  ),
  "en-1-passive": bank(
    [
      ["Forme passive de « They built this bridge in 1900. » ?", "This bridge was built in 1900.", ["This bridge is built in 1900.", "This bridge has built in 1900.", "This bridge built in 1900."], "Be (au temps de l'actif) + participe passé."],
      ["Forme passive de « People speak English here. » ?", "English is spoken here.", ["English was spoken here.", "English is speak here.", "English speaks here."], "Présent simple → is + participe passé."],
      ["Discours indirect de « I am tired, » she said. ?", "She said she was tired.", ["She said she is tired.", "She said I am tired.", "She said she has been tired."], "Concordance des temps : present → past."],
      ["Discours indirect de « Where do you live? » he asked. ?", "He asked where I lived.", ["He asked where do I live.", "He asked where did I live.", "He asked where I live?"], "Pas d'inversion ni d'auxiliaire do dans l'interrogative indirecte."],
    ],
  ),
  "en-1-grammar": bank(
    [
      ["Comparatif de « good » ?", "better", ["gooder", "more good", "best"], "Good, better, the best."],
      ["« This is the girl ___ father is a doctor. »", "whose", ["who", "which", "whom"], "Whose = dont (possession)."],
      ["« I'm looking forward to ___ you. »", "seeing", ["see", "to see", "saw"], "Look forward to + V-ing (to est une préposition)."],
      ["Question tag : « You like pizza, ___? »", "don't you", ["do you", "aren't you", "isn't it"], "Phrase affirmative → tag négatif avec l'auxiliaire do."],
      ["« He stopped ___ » (il a arrêté de fumer).", "smoking", ["to smoke", "smoke", "smoked"], "Stop to smoke = s'arrêter pour fumer."],
      ["Superlatif de « interesting » ?", "the most interesting", ["the interestingest", "the more interesting", "most interestinger"], "Adjectifs longs : the most + adjectif."],
    ],
  ),
  "en-1-civilisation": bank(
    [
      ["Le Parlement britannique siège à…", "Westminster", ["Buckingham Palace", "Downing Street", "la Tour de Londres"], "10 Downing Street est la résidence du Premier ministre."],
      ["Le Congrès américain est composé…", "du Sénat et de la Chambre des représentants", ["de la Chambre des lords et des communes", "de la Cour suprême et du président", "des 50 gouverneurs"], "Il vote les lois."],
      ["Le « Civil Rights Act », qui interdit la ségrégation aux États-Unis, date de…", "1964", ["1865", "1945", "1989"], "Sous la présidence de Lyndon Johnson."],
      ["Le Brexit a été voté par référendum en…", "2016", ["2010", "2020", "2005"], "Sortie effective le 31 janvier 2020."],
      ["Le Commonwealth est…", "une association de pays, pour la plupart anciennes colonies britanniques", ["un parti politique", "l'armée britannique", "une monnaie"], "Plus de 50 pays membres."],
      ["Thanksgiving, aux États-Unis, est célébré…", "le quatrième jeudi de novembre", ["le 4 juillet", "le 31 octobre", "le 25 décembre"], "Le 4 juillet est l'Independence Day."],
    ],
    [["Le Royaume-Uni est une monarchie constitutionnelle.", true, "Le souverain règne mais ne gouverne pas."]],
  ),
  "en-t-conditionals": bank(
    [
      ["« If it rains, I ___ stay at home. » (situation réelle, futur)", "will", ["would", "would have", "had"], "Premier conditionnel : if + présent, will + base verbale."],
      ["« If I were rich, I ___ travel the world. »", "would", ["will", "would have", "am"], "Deuxième conditionnel : situation imaginaire au présent."],
      ["« If I had known, I ___ come. »", "would have", ["would", "will", "had"], "Troisième conditionnel : regret sur le passé."],
      ["« I wish I ___ taller. » (regret présent)", "were", ["am", "will be", "have been"], "Wish + prétérit pour un regret au présent."],
      ["« I wish I ___ harder last year. » (regret passé)", "had studied", ["studied", "study", "would study"], "Wish + past perfect pour un regret sur le passé."],
    ],
  ),
  "en-t-essay": bank(
    [
      ["Connecteur pour ajouter un argument ?", "moreover", ["however", "therefore", "although"], "Aussi : furthermore, in addition."],
      ["Connecteur d'opposition ?", "however", ["moreover", "thus", "firstly"], "Aussi : nevertheless, on the other hand."],
      ["Connecteur de conséquence ?", "therefore", ["although", "besides", "whereas"], "Aussi : thus, as a result, consequently."],
      ["Pour conclure un essay, on peut écrire…", "to sum up", ["first of all", "for instance", "on the contrary"], "Aussi : in conclusion, all in all."],
      ["« For instance » sert à…", "introduire un exemple", ["conclure", "s'opposer", "ajouter une condition"], "Synonyme : for example."],
    ],
  ),
  "en-2-vocab": bank(
    [
      ["« Actually » signifie…", "en fait", ["actuellement", "activement", "à la fin"], "Faux ami : « actuellement » se dit nowadays / currently."],
      ["« Eventually » signifie…", "finalement", ["éventuellement", "évidemment", "souvent"], "Faux ami : « éventuellement » = possibly."],
      ["« A library » est…", "une bibliothèque", ["une librairie", "un livre", "un libraire"], "Une librairie se dit a bookshop."],
      ["« Sensible » en anglais signifie…", "raisonnable", ["sensible", "sensuel", "sensationnel"], "« Sensible » en français = sensitive."],
    ],
  ),
  "en-2-axes": bank(
    [
      ["« Gap year » désigne…", "une année de pause avant ou pendant les études", ["un trou de mémoire", "une année bissextile", "un écart de salaire"], "Souvent pour voyager ou travailler."],
      ["« Heritage » signifie…", "le patrimoine (culturel)", ["l'héritage d'argent uniquement", "l'histoire ancienne", "le héros"], "Cultural heritage."],
      ["« Climate change » se traduit par…", "le changement climatique", ["le changement de climat local", "la météo", "la pollution de l'air"], "Global warming = réchauffement climatique."],
    ],
  ),
  // ───────────── Espagnol ─────────────
  "es-2-presente": bank(
    [
      ["« Estar » s'emploie pour…", "la localisation et les états passagers", ["les caractéristiques essentielles", "l'heure et la date", "la profession"], "Estoy en casa, estoy cansado."],
      ["« Ser » s'emploie pour…", "l'identité, la nationalité, la profession et les caractéristiques", ["les états passagers", "la localisation d'un objet", "le gérondif"], "Soy francés, es médico."],
      ["« Me gusta ___ chocolate. »", "el", ["un", "lo", "la"], "Gustar s'accorde avec ce qui plaît : me gusta el chocolate, me gustan los libros."],
      ["Présent de « tener » à la 1re personne ?", "tengo", ["teno", "tienes", "tiengo"], "Verbe irrégulier en -go (tengo, pongo, salgo)."],
      ["Présent de « poder » à la 3e personne du singulier ?", "puede", ["pode", "pude", "podé"], "Diphtongue o → ue."],
    ],
  ),
  "es-1-passe": bank(
    [
      ["Le pretérito indefinido s'emploie pour…", "une action ponctuelle et terminée dans le passé", ["une description ou une habitude passée", "une action future", "un ordre"], "Ayer fui al cine."],
      ["Le pretérito imperfecto s'emploie pour…", "une description ou une habitude dans le passé", ["une action ponctuelle", "un ordre", "un souhait futur"], "Cuando era niño, jugaba al fútbol."],
      ["Indefinido de « ir » à la 1re personne ?", "fui", ["iba", "fue", "fuí"], "Ir et ser ont le même indefinido."],
      ["Imperfecto de « ser » à la 1re personne ?", "era", ["fui", "soy", "sería"], "Verbe irrégulier à l'imparfait."],
      ["« Ayer ___ (comer, yo) paella. »", "comí", ["comía", "comeré", "como"], "Ayer : action ponctuelle → indefinido."],
    ],
  ),
  "es-1-subjonctif": bank(
    [
      ["« Quiero que ___ (venir, tú). »", "vengas", ["vienes", "vendrás", "venir"], "Querer que + subjonctif présent."],
      ["« Cuando ___ (tener, yo) dinero, viajaré. »", "tenga", ["tengo", "tendré", "tener"], "Cuando + subjonctif pour une action future."],
      ["« Es importante que ___ (estudiar, vosotros). »", "estudiéis", ["estudiáis", "estudiaréis", "estudiar"], "Expression impersonnelle + que + subjonctif."],
      ["Impératif affirmatif de « hablar » (tú) ?", "habla", ["hables", "hablas", "habló"], "À la forme négative : no hables (subjonctif)."],
      ["« Si tuviera tiempo, ___ (ir) al cine. »", "iría", ["iré", "voy", "fuera"], "Si + subjonctif imparfait, conditionnel dans la principale."],
    ],
  ),
  "es-1-monde-hispanique": bank(
    [
      ["Écrivain colombien, auteur de « Cent ans de solitude » ?", "Gabriel García Márquez", ["Pablo Neruda", "Jorge Luis Borges", "Mario Vargas Llosa"], "Prix Nobel 1982, réalisme magique."],
      ["Peintre mexicaine célèbre pour ses autoportraits ?", "Frida Kahlo", ["Diego Rivera", "Fernando Botero", "Pablo Picasso"], "Épouse de Diego Rivera."],
      ["Poète chilien, prix Nobel 1971 ?", "Pablo Neruda", ["Octavio Paz", "Gabriela Mistral", "Julio Cortázar"], "Canto general."],
      ["Langue indigène la plus parlée en Amérique du Sud ?", "le quechua", ["le nahuatl", "le maya", "le guarani"], "Langue des Incas, au Pérou et en Bolivie notamment."],
      ["Fête mexicaine des morts, début novembre ?", "el Día de Muertos", ["la Tomatina", "las Fallas", "San Fermín"], "Inscrite au patrimoine immatériel de l'UNESCO."],
    ],
  ),
  "es-t-memoire": bank(
    [
      ["La guerre civile espagnole a lieu de…", "1936 à 1939", ["1914 à 1918", "1975 à 1978", "1898 à 1902"], "Elle oppose républicains et nationalistes de Franco."],
      ["Franco meurt en…", "1975", ["1939", "1982", "1964"], "Début de la Transition démocratique."],
      ["La Constitution démocratique espagnole date de…", "1978", ["1975", "1931", "1986"], "Monarchie parlementaire."],
      ["« Guernica » de Picasso dénonce…", "le bombardement de la ville basque en 1937", ["la conquête de l'Amérique", "la dictature argentine", "la guerre d'indépendance"], "Bombardée par l'aviation allemande alliée de Franco."],
      ["Les « Mères de la place de Mai » réclament la vérité sur…", "les disparus de la dictature argentine (1976-1983)", ["la guerre civile espagnole", "la conquête espagnole", "la révolution cubaine"], "Elles manifestent à Buenos Aires."],
      ["Le coup d'État de Pinochet au Chili a lieu en…", "1973", ["1936", "1989", "1959"], "Contre le président Salvador Allende."],
    ],
  ),
  "es-t-argumenter": bank(
    [
      ["Connecteur espagnol pour exprimer l'opposition ?", "sin embargo", ["además", "por eso", "en primer lugar"], "« Cependant »."],
      ["« Por lo tanto » signifie…", "par conséquent", ["cependant", "de plus", "par exemple"], "Connecteur de conséquence."],
      ["« Creo que » est suivi…", "de l'indicatif", ["du subjonctif", "de l'infinitif", "du gérondif"], "Mais « No creo que » + subjonctif."],
      ["Pour donner son opinion : « En mi ___ … »", "opinión", ["opinar", "opino", "pienso"], "En mi opinión / A mi parecer."],
    ],
  ),
  "es-2-vocabulaire": bank(
    [
      ["« Embarazada » signifie…", "enceinte", ["embarrassée", "embrassée", "fatiguée"], "Faux ami classique."],
      ["« Constipado » signifie…", "enrhumé", ["constipé", "fâché", "occupé"], "Faux ami."],
      ["« La carpeta » signifie…", "la chemise (dossier)", ["la carpette", "la carpe", "le tapis"], "Faux ami."],
    ],
  ),
  "es-2-cliches": bank(
    [
      ["Langue co-officielle parlée à Barcelone ?", "le catalan", ["le basque", "le galicien", "le portugais"], "Le basque (euskera) se parle au Pays basque."],
      ["Fête de Pampelune avec des lâchers de taureaux ?", "San Fermín", ["las Fallas", "la Feria de Abril", "la Tomatina"], "En juillet, rendue célèbre par Hemingway."],
      ["Architecte de la Sagrada Família ?", "Antoni Gaudí", ["Santiago Calatrava", "Frank Gehry", "Joan Miró"], "Construction commencée en 1882."],
    ],
  ),
};
