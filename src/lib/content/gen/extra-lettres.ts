/**
 * Français — œuvres, auteurs, notions d'analyse et de méthode supplémentaires
 * (programmes de Seconde et de Première).
 */
import { type Claim, type Generator, type Pair, claims, pairs } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });
const works = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Qui a écrit *${a}* ?`, reverse: (b) => `Quelle œuvre a été écrite par ${b} ?`, claim: (a, b) => `*${a}* est une œuvre de ${b}.`, explain: (a, b) => `*${a}* : ${b}.` });
const bank = (w: readonly Pair[], t: readonly Pair[], c: readonly Claim[] = []): Generator[] => [
  ...(w.length ? works(w) : []),
  ...(t.length ? terms(t) : []),
  ...(c.length ? [claims(c)] : []),
];

export const EXTRA_LETTRES: Record<string, Generator[]> = {
  "fr-2-poesie": bank(
    [["Les Fleurs du mal", "Baudelaire"], ["Les Contemplations", "Victor Hugo"], ["Alcools", "Apollinaire"], ["Les Regrets", "Joachim du Bellay"], ["Poèmes saturniens", "Verlaine"],
     ["Une saison en enfer", "Rimbaud"], ["Paroles", "Jacques Prévert"], ["Le Parti pris des choses", "Francis Ponge"], ["Cahier d'un retour au pays natal", "Aimé Césaire"], ["Les Châtiments", "Victor Hugo"],
     ["Odes", "Ronsard"], ["Calligrammes", "Apollinaire"]],
    [["alexandrin", "un vers de douze syllabes"], ["octosyllabe", "un vers de huit syllabes"], ["décasyllabe", "un vers de dix syllabes"], ["sonnet", "un poème de quatorze vers : deux quatrains et deux tercets"],
     ["rime embrassée", "une disposition des rimes en ABBA"], ["rime croisée", "une disposition des rimes en ABAB"], ["rime suivie", "une disposition des rimes en AABB"], ["enjambement", "le débordement d'une phrase sur le vers suivant"],
     ["césure", "la pause à l'intérieur d'un vers, à l'hémistiche pour l'alexandrin"], ["diérèse", "la prononciation en deux syllabes de voyelles normalement réunies"], ["vers libre", "un vers sans mètre ni rime réguliers"], ["poème en prose", "un poème écrit sans vers"]],
    [["Le sonnet se termine par deux tercets.", true, "Deux quatrains, deux tercets."], ["L'alexandrin compte quatorze syllabes.", false, "Douze syllabes."], ["Le e muet se prononce devant une consonne à l'intérieur d'un vers.", true, "Il compte alors comme une syllabe."]],
  ),
  "fr-2-roman": bank(
    [["Le Rouge et le Noir", "Stendhal"], ["Madame Bovary", "Flaubert"], ["Germinal", "Zola"], ["Le Père Goriot", "Balzac"], ["Bel-Ami", "Maupassant"], ["Les Misérables", "Victor Hugo"],
     ["L'Étranger", "Albert Camus"], ["La Princesse de Clèves", "Madame de La Fayette"], ["Candide", "Voltaire"], ["Le Horla", "Maupassant"], ["Thérèse Raquin", "Zola"], ["Voyage au bout de la nuit", "Céline"]],
    [["narrateur interne", "un narrateur qui est aussi un personnage de l'histoire"], ["focalisation zéro", "un point de vue omniscient qui sait tout des personnages"], ["focalisation interne", "le récit vu à travers les yeux d'un personnage"],
     ["focalisation externe", "le récit vu de l'extérieur, sans accès aux pensées"], ["incipit", "le début d'un roman"], ["excipit", "la fin d'un roman"], ["analepse", "un retour en arrière dans le récit"],
     ["prolepse", "une anticipation dans le récit"], ["ellipse narrative", "un passage sous silence d'une période de l'histoire"], ["discours indirect libre", "des paroles ou pensées rapportées sans verbe introducteur ni guillemets"],
     ["roman épistolaire", "un roman composé de lettres"], ["roman d'apprentissage", "un roman qui suit la formation d'un jeune héros"]],
    [["Dans une focalisation externe, le lecteur connaît les pensées des personnages.", false, "Il ne voit que l'extérieur."], ["Les Rougon-Macquart sont un cycle de vingt romans de Zola.", true, "« Histoire naturelle et sociale d'une famille sous le Second Empire »."]],
  ),
  "fr-2-theatre": bank(
    [["Le Cid", "Corneille"], ["Phèdre", "Racine"], ["Andromaque", "Racine"], ["Le Misanthrope", "Molière"], ["Tartuffe", "Molière"], ["L'Avare", "Molière"], ["Le Mariage de Figaro", "Beaumarchais"],
     ["Ruy Blas", "Victor Hugo"], ["Lorenzaccio", "Musset"], ["En attendant Godot", "Samuel Beckett"], ["Rhinocéros", "Ionesco"], ["Juste la fin du monde", "Jean-Luc Lagarce"]],
    [["tirade", "une longue réplique d'un personnage"], ["monologue", "un discours d'un personnage seul sur scène"], ["aparté", "une réplique dite à part, que les autres personnages sont censés ne pas entendre"],
     ["stichomythie", "un échange de répliques très courtes, vers à vers"], ["didascalie", "une indication de mise en scène écrite par l'auteur"], ["exposition", "la première scène qui présente les personnages et l'intrigue"],
     ["dénouement", "la résolution finale de l'intrigue"], ["double énonciation", "le fait que les répliques s'adressent aux personnages et au public"], ["quiproquo", "un malentendu qui fait prendre une personne ou une chose pour une autre"],
     ["règle des trois unités", "l'unité de temps, de lieu et d'action du théâtre classique"], ["coup de théâtre", "un rebondissement inattendu qui change la situation"], ["catharsis", "la purgation des passions par la tragédie"]],
    [["La tragédie classique se termine généralement par la mort d'un personnage.", true, "Le héros est écrasé par la fatalité."], ["Le drame romantique respecte strictement les trois unités.", false, "Hugo les rejette (préface de Cromwell)."]],
  ),
  "fr-2-figures": pairs(
    [["« Je meurs de soif auprès de la fontaine »", "une antithèse"], ["« Cette obscure clarté qui tombe des étoiles »", "un oxymore"], ["« Va, je ne te hais point »", "une litote"],
     ["« Il est mort de rire »", "une hyperbole"], ["« Boire un verre »", "une métonymie"], ["« Une voile à l'horizon » pour un bateau", "une synecdoque"], ["« La Terre est bleue comme une orange »", "une comparaison"],
     ["« Ma jeunesse ne fut qu'un ténébreux orage »", "une métaphore"], ["« Il nous a quittés » pour « il est mort »", "un euphémisme"], ["« Le vent hurle dans la nuit »", "une personnification"],
     ["« Je suis venu, j'ai vu, j'ai vaincu »", "une gradation"], ["« Pour qui sont ces serpents qui sifflent sur vos têtes ? »", "une allitération en [s]"],
     ["« Rome, l'unique objet de mon ressentiment ! Rome… »", "une anaphore"], ["« Ce n'est pas une ville, c'est un monde »", "une correction (épanorthose)"], ["« Bonnet blanc et blanc bonnet »", "un chiasme"]],
    { ask: (a) => `Quelle figure de style : ${a} ?`, reverse: (b) => `Quel exemple contient ${b} ?`, claim: (a, b) => `${a} contient ${b}.`, explain: (a, b) => `${a} : ${b}.` },
  ),
  "fr-2-litterature-idees": bank(
    [["Les Essais", "Montaigne"], ["Discours de la servitude volontaire", "La Boétie"], ["Les Lettres persanes", "Montesquieu"], ["Traité sur la tolérance", "Voltaire"], ["Discours sur l'origine de l'inégalité", "Rousseau"],
     ["J'accuse… !", "Émile Zola"], ["Discours sur l'abolition de la peine de mort", "Victor Hugo"], ["Les Caractères", "La Bruyère"], ["Fables", "La Fontaine"], ["Supplément au voyage de Bougainville", "Diderot"],
     ["Déclaration des droits de la femme et de la citoyenne", "Olympe de Gouges"], ["Discours sur le colonialisme", "Aimé Césaire"]],
    [["argumentation directe", "une argumentation qui expose explicitement une thèse"], ["argumentation indirecte", "une argumentation qui passe par un récit, une fable ou un conte"], ["thèse", "l'opinion défendue par l'auteur"],
     ["argument", "une idée qui justifie la thèse"], ["exemple", "un fait concret qui illustre un argument"], ["concession", "le fait d'admettre une part de la thèse adverse pour mieux la réfuter"],
     ["réfutation", "le fait de démontrer la fausseté d'une thèse adverse"], ["apologue", "un court récit dont on tire une leçon morale"], ["éditorial", "un article qui exprime l'opinion d'un journal"],
     ["essai", "un texte en prose où l'auteur développe sa réflexion personnelle"], ["persuader", "toucher les sentiments du destinataire pour obtenir son adhésion"], ["convaincre", "faire appel à la raison par des arguments logiques"]],
    [["Une fable est un exemple d'argumentation indirecte.", true, "La morale découle du récit."], ["Persuader, c'est s'adresser uniquement à la raison.", false, "Persuader joue sur les émotions ; convaincre, sur la raison."]],
  ),
  "fr-1-mouvements": pairs(
    [["l'humanisme", "XVIe siècle (Rabelais, Montaigne, Du Bellay)"], ["le baroque", "fin XVIe – début XVIIe siècle (goût du mouvement et de l'illusion)"], ["le classicisme", "XVIIe siècle (Racine, Molière, La Fontaine)"],
     ["les Lumières", "XVIIIe siècle (Voltaire, Diderot, Rousseau)"], ["le romantisme", "début du XIXe siècle (Hugo, Lamartine, Musset)"], ["le réalisme", "milieu du XIXe siècle (Balzac, Flaubert)"],
     ["le naturalisme", "fin du XIXe siècle (Zola, Maupassant)"], ["le Parnasse", "seconde moitié du XIXe siècle (« l'art pour l'art », Gautier)"], ["le symbolisme", "fin du XIXe siècle (Mallarmé, Verlaine)"],
     ["le surréalisme", "années 1920 (Breton, Éluard, Aragon)"], ["l'existentialisme", "milieu du XXe siècle (Sartre, Beauvoir)"], ["le Nouveau Roman", "années 1950 (Robbe-Grillet, Sarraute)"],
     ["le théâtre de l'absurde", "années 1950 (Beckett, Ionesco)"], ["la Pléiade", "XVIe siècle (Ronsard, Du Bellay)"], ["la négritude", "années 1930 (Césaire, Senghor, Damas)"]],
    { ask: (a) => `À quelle époque et avec quels auteurs associer ${a} ?`, reverse: (b) => `Quel mouvement : ${b} ?`, claim: (a, b) => `${cap(a)} : ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  "fr-1-commentaire": pairs(
    [["le projet de lecture", "la question qui guide l'étude d'un texte"], ["un axe de lecture", "une grande partie du commentaire, centrée sur une idée"], ["une citation analysée", "un extrait cité puis commenté pour en tirer un sens"],
     ["un procédé d'écriture", "un moyen stylistique repérable (figure, rythme, lexique…)"], ["le champ lexical", "l'ensemble des mots qui renvoient à un même thème"], ["la tonalité (ou registre)", "l'effet produit sur le lecteur : comique, tragique, lyrique…"],
     ["le registre lyrique", "l'expression des sentiments personnels"], ["le registre pathétique", "un registre qui cherche à émouvoir et à faire pitié"], ["le registre polémique", "un registre qui attaque et dénonce avec virulence"],
     ["le registre épique", "un registre qui amplifie les exploits héroïques"], ["le registre satirique", "un registre qui se moque pour critiquer"], ["la paraphrase", "le défaut qui consiste à répéter le texte sans l'analyser"],
     ["l'ouverture", "l'élargissement final vers une autre œuvre ou réflexion"], ["la situation du texte", "la présentation de l'auteur, de l'œuvre et du passage"], ["l'explication linéaire", "l'étude d'un texte mouvement par mouvement, dans l'ordre"],
     ["un mouvement du texte", "une étape cohérente de la progression d'un extrait"], ["l'énonciation", "la façon dont le locuteur s'inscrit dans son discours"], ["la modalisation", "les marques du jugement ou du degré de certitude du locuteur"]],
    { ask: (a) => `En méthode du commentaire, que désigne ${a} ?`, reverse: (b) => `Quelle notion de méthode désigne : ${b} ?`, claim: (a, b) => `${cap(a)} : ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  "fr-1-oeuvres-bac": [claims([
    ["Le Cahier de Douai réunit des poèmes de jeunesse de Rimbaud écrits en 1870.", true, "Il les confie à Paul Demeny."],
    ["Dans Le Menteur, le héros Dorante invente sans cesse des récits fictifs.", true, "Comédie de Corneille (1644)."],
    ["Pot-Bouille se déroule dans un immeuble bourgeois parisien.", true, "Zola dévoile l'hypocrisie bourgeoise."],
    ["Le Chevalier de la charrette met en scène Lancelot.", true, "Roman de Chrétien de Troyes (XIIe siècle)."],
    ["Les Lettres d'une Péruvienne sont un roman épistolaire.", true, "Graffigny, 1747 : Zilia écrit à Aza."],
    ["Les Entretiens sur la pluralité des mondes mettent en scène un philosophe et une marquise.", true, "Fontenelle vulgarise l'astronomie (1686)."],
    ["Le Discours de la servitude volontaire défend le pouvoir absolu du tyran.", false, "La Boétie montre que le peuple consent à sa servitude."],
    ["Pluie et vent sur Télumée Miracle se déroule en Guadeloupe.", true, "Roman de Simone Schwarz-Bart (1972)."],
    ["La Rage de l'expression rassemble des textes où Ponge montre le travail d'écriture en train de se faire.", true, "Parcours « Dans l'atelier du poète »."],
    ["Mes forêts est un recueil d'Hélène Dorion.", true, "Poétesse québécoise (2021)."],
    ["Pour un oui ou pour un non est une pièce de Nathalie Sarraute.", true, "Deux amis se disputent pour une intonation."],
    ["On ne badine pas avec l'amour est un drame de Musset.", true, "1834, Perdican et Camille."],
  ])],
};
