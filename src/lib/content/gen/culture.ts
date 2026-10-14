/**
 * Culture générale — matière à part, hors programme, ouverte à tous les niveaux.
 * Chaque thème est une grande banque de connaissances déclinée en question
 * directe, question inverse et vrai/faux (voir `pairs`), plus des questions de cours.
 */
import { type Card, type Claim, type Generator, type Pair, cards, claims, pairs } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** « de » contracté devant l'article : du Japon, des États-Unis, de la France, de l'Inde, du Mans. */
export function de(x: string): string {
  if (/^le /i.test(x)) return `du ${x.slice(3)}`;
  if (/^les /i.test(x)) return `des ${x.slice(4)}`;
  return `de ${x}`;
}

// ───────────── Géographie ─────────────

const CAPITALES: Pair[] = [
  ["la France", "Paris"], ["l'Allemagne", "Berlin"], ["l'Espagne", "Madrid"], ["l'Italie", "Rome"], ["le Portugal", "Lisbonne"], ["le Royaume-Uni", "Londres"],
  ["l'Irlande", "Dublin"], ["la Belgique", "Bruxelles"], ["les Pays-Bas", "Amsterdam"], ["la Suisse", "Berne"], ["l'Autriche", "Vienne"], ["la Pologne", "Varsovie"],
  ["la Tchéquie", "Prague"], ["la Slovaquie", "Bratislava"], ["la Hongrie", "Budapest"], ["la Roumanie", "Bucarest"], ["la Bulgarie", "Sofia"], ["la Grèce", "Athènes"],
  ["la Croatie", "Zagreb"], ["la Serbie", "Belgrade"], ["la Slovénie", "Ljubljana"], ["le Danemark", "Copenhague"], ["la Suède", "Stockholm"], ["la Norvège", "Oslo"],
  ["la Finlande", "Helsinki"], ["l'Islande", "Reykjavik"], ["l'Estonie", "Tallinn"], ["la Lettonie", "Riga"], ["la Lituanie", "Vilnius"], ["l'Ukraine", "Kyiv (Kiev)"],
  ["la Russie", "Moscou"], ["la Turquie", "Ankara"], ["l'Albanie", "Tirana"], ["Malte", "La Valette"], ["Chypre", "Nicosie"],
  ["les États-Unis", "Washington"], ["le Canada", "Ottawa"], ["le Mexique", "Mexico"], ["le Brésil", "Brasilia"], ["l'Argentine", "Buenos Aires"], ["le Chili", "Santiago"],
  ["le Pérou", "Lima"], ["la Colombie", "Bogota"], ["le Venezuela", "Caracas"], ["l'Équateur", "Quito"], ["l'Uruguay", "Montevideo"], ["le Paraguay", "Asuncion"],
  ["Cuba", "La Havane"], ["la Jamaïque", "Kingston"], ["la Chine", "Pékin"], ["le Japon", "Tokyo"], ["la Corée du Sud", "Séoul"], ["la Corée du Nord", "Pyongyang"],
  ["l'Inde", "New Delhi"], ["le Pakistan", "Islamabad"], ["le Bangladesh", "Dacca"], ["la Thaïlande", "Bangkok"], ["le Viêt Nam", "Hanoï"], ["les Philippines", "Manille"],
  ["la Malaisie", "Kuala Lumpur"], ["l'Iran", "Téhéran"], ["l'Irak", "Bagdad"], ["l'Arabie saoudite", "Riyad"], ["le Liban", "Beyrouth"], ["la Syrie", "Damas"],
  ["la Jordanie", "Amman"], ["l'Afghanistan", "Kaboul"], ["le Népal", "Katmandou"], ["la Mongolie", "Oulan-Bator"], ["le Qatar", "Doha"], ["les Émirats arabes unis", "Abou Dabi"],
  ["le Kazakhstan", "Astana"], ["l'Égypte", "Le Caire"], ["le Maroc", "Rabat"], ["l'Algérie", "Alger"], ["la Tunisie", "Tunis"], ["le Sénégal", "Dakar"],
  ["le Mali", "Bamako"], ["la Côte d'Ivoire", "Yamoussoukro"], ["le Nigeria", "Abuja"], ["le Kenya", "Nairobi"], ["l'Éthiopie", "Addis-Abeba"], ["Madagascar", "Antananarivo"],
  ["le Cameroun", "Yaoundé"], ["le Ghana", "Accra"], ["la République démocratique du Congo", "Kinshasa"], ["le Burkina Faso", "Ouagadougou"], ["le Niger", "Niamey"],
  ["le Tchad", "N'Djamena"], ["la Guinée", "Conakry"], ["le Gabon", "Libreville"], ["le Rwanda", "Kigali"], ["l'Angola", "Luanda"], ["l'Australie", "Canberra"],
  ["la Nouvelle-Zélande", "Wellington"],
];

const PIEGES_CAPITALES: Claim[] = [
  ["La capitale de l'Australie est Sydney.", false, "C'est Canberra ; Sydney est la plus grande ville."],
  ["La capitale du Canada est Ottawa.", true, "Et non Toronto ni Montréal."],
  ["La capitale de la Turquie est Istanbul.", false, "C'est Ankara depuis 1923."],
  ["La capitale du Brésil est Rio de Janeiro.", false, "C'est Brasilia depuis 1960."],
  ["La capitale officielle de la Côte d'Ivoire est Yamoussoukro.", true, "Abidjan reste la capitale économique."],
  ["La capitale du Maroc est Casablanca.", false, "C'est Rabat ; Casablanca est la plus grande ville."],
  ["La capitale de la Suisse est Berne.", true, "Zurich et Genève sont plus peuplées."],
  ["La capitale du Nigeria est Lagos.", false, "C'est Abuja depuis 1991."],
  ["La capitale de la Nouvelle-Zélande est Wellington.", true, "Auckland est plus peuplée."],
  ["La capitale des États-Unis est New York.", false, "C'est Washington."],
];

const RECORDS_GEO: Card[] = [
  ["Plus haut sommet du monde ?", "l'Everest", ["le K2", "le Kilimandjaro", "le Mont Blanc"], "L'Everest (Himalaya) culmine à environ 8 849 m."],
  ["Plus grand océan du monde ?", "l'océan Pacifique", ["l'océan Atlantique", "l'océan Indien", "l'océan Arctique"], "Il couvre près d'un tiers de la surface du globe."],
  ["Plus grand désert chaud du monde ?", "le Sahara", ["le désert de Gobi", "le Kalahari", "l'Atacama"], "Le Sahara couvre environ 9 millions de km²."],
  ["Plus grand pays du monde par la superficie ?", "la Russie", ["le Canada", "la Chine", "les États-Unis"], "Environ 17 millions de km²."],
  ["Pays le plus peuplé du monde depuis 2023 ?", "l'Inde", ["la Chine", "les États-Unis", "l'Indonésie"], "L'Inde a dépassé la Chine en 2023 (plus de 1,4 milliard d'habitants)."],
  ["Plus grande île du monde ?", "le Groenland", ["Madagascar", "Bornéo", "la Grande-Bretagne"], "L'Australie est considérée comme un continent."],
  ["Plus petit pays du monde ?", "le Vatican", ["Monaco", "Saint-Marin", "le Liechtenstein"], "Environ 0,44 km², enclavé dans Rome."],
  ["Continent le plus peuplé ?", "l'Asie", ["l'Afrique", "l'Europe", "l'Amérique"], "Près de 60 % de la population mondiale."],
  ["Plus haut sommet d'Afrique ?", "le Kilimandjaro", ["le mont Kenya", "le Mont Blanc", "l'Aconcagua"], "Environ 5 895 m, en Tanzanie."],
  ["Plus haut sommet d'Amérique ?", "l'Aconcagua", ["le Denali", "le Chimborazo", "le Kilimandjaro"], "Environ 6 961 m, dans les Andes argentines."],
  ["Plus haut sommet des Alpes ?", "le Mont Blanc", ["le Cervin", "le mont Rose", "l'Everest"], "Environ 4 806 m, entre la France et l'Italie."],
  ["Point le plus profond des océans ?", "la fosse des Mariannes", ["la fosse de Porto Rico", "le golfe du Mexique", "la mer Morte"], "Près de 11 000 m dans le Pacifique."],
  ["Fleuve au plus grand débit du monde ?", "l'Amazone", ["le Nil", "le Mississippi", "le Yangtsé"], "Il déverse environ 200 000 m³ d'eau par seconde."],
  ["Plus long fleuve d'Europe ?", "la Volga", ["le Danube", "le Rhin", "la Loire"], "Environ 3 530 km, en Russie."],
  ["Plus grande forêt tropicale du monde ?", "l'Amazonie", ["la forêt du bassin du Congo", "la taïga", "la forêt de Bornéo"], "Elle s'étend sur 9 pays d'Amérique du Sud."],
  ["Plus grand lac d'Afrique ?", "le lac Victoria", ["le lac Tanganyika", "le lac Tchad", "le lac Malawi"], "Partagé entre l'Ouganda, le Kenya et la Tanzanie."],
  ["Canal qui relie la Méditerranée à la mer Rouge ?", "le canal de Suez", ["le canal de Panama", "le canal de Corinthe", "le canal du Midi"], "Inauguré en 1869, en Égypte."],
  ["Canal qui relie l'Atlantique au Pacifique ?", "le canal de Panama", ["le canal de Suez", "le détroit de Magellan", "le canal de Kiel"], "Ouvert en 1914."],
  ["Détroit qui sépare l'Espagne du Maroc ?", "le détroit de Gibraltar", ["le Bosphore", "le pas de Calais", "le détroit de Béring"], "Environ 14 km au plus étroit."],
  ["Détroit qui sépare l'Asie de l'Amérique ?", "le détroit de Béring", ["le détroit de Gibraltar", "le Bosphore", "le détroit d'Ormuz"], "Entre la Russie et l'Alaska."],
  ["Montagnes qui séparent la France de l'Espagne ?", "les Pyrénées", ["les Alpes", "le Jura", "les Vosges"], "Le pic d'Aneto (3 404 m) en est le point culminant."],
  ["Montagnes qui marquent la limite entre l'Europe et l'Asie ?", "l'Oural", ["le Caucase", "les Carpates", "l'Himalaya"], "En Russie."],
  ["Plus longue chaîne de montagnes continentale ?", "la cordillère des Andes", ["l'Himalaya", "les Rocheuses", "l'Oural"], "Environ 7 000 km le long de l'Amérique du Sud."],
  ["Pays en forme de botte ?", "l'Italie", ["la Grèce", "le Chili", "le Portugal"], "La péninsule italienne."],
  ["Pays le plus long et étroit d'Amérique du Sud ?", "le Chili", ["l'Argentine", "le Pérou", "la Colombie"], "Plus de 4 000 km de long pour environ 180 km de large."],
  ["Sur quel continent se trouve l'Égypte ?", "l'Afrique", ["l'Asie", "l'Europe", "l'Océanie"], "Le Sinaï, lui, est en Asie."],
  ["Océan qui borde la côte ouest de la France ?", "l'océan Atlantique", ["l'océan Indien", "l'océan Pacifique", "l'océan Arctique"], "La Méditerranée borde le sud-est."],
  ["Combien de continents compte-t-on habituellement en France ?", "5 (ou 6 avec l'Antarctique)", ["3", "8", "10"], "Afrique, Amérique, Asie, Europe, Océanie (+ Antarctique)."],
];

const FLEUVES: Pair[] = [
  ["Paris", "la Seine"], ["Londres", "la Tamise"], ["Rome", "le Tibre"], ["Budapest", "le Danube"], ["Bordeaux", "la Garonne"], ["Nantes", "la Loire"],
  ["Le Caire", "le Nil"], ["New York", "l'Hudson"], ["Berlin", "la Spree"], ["Moscou", "la Moskova"], ["Saint-Pétersbourg", "la Neva"], ["Lisbonne", "le Tage"],
  ["Prague", "la Vltava"], ["Lyon", "le Rhône"], ["Strasbourg", "le Rhin"], ["Bagdad", "le Tigre"], ["Calcutta", "le Gange (Hooghly)"], ["Shanghai", "le Yangtsé (Huangpu)"],
];

const MONNAIES: Pair[] = [
  ["le Japon", "le yen"], ["le Royaume-Uni", "la livre sterling"], ["les États-Unis", "le dollar américain"], ["la Chine", "le yuan (renminbi)"], ["l'Inde", "la roupie indienne"],
  ["la Russie", "le rouble"], ["la Suisse", "le franc suisse"], ["le Brésil", "le réal"], ["le Mexique", "le peso mexicain"], ["la Corée du Sud", "le won"],
  ["la Pologne", "le złoty"], ["la Turquie", "la livre turque"], ["l'Afrique du Sud", "le rand"], ["la Suède", "la couronne suédoise"], ["le Maroc", "le dirham"],
  ["l'Allemagne", "l'euro"], ["le Sénégal", "le franc CFA"],
];

// ───────────── France ─────────────

const REGIONS: Pair[] = [
  ["Auvergne-Rhône-Alpes", "Lyon"], ["Bourgogne-Franche-Comté", "Dijon"], ["Bretagne", "Rennes"], ["Centre-Val de Loire", "Orléans"], ["Corse", "Ajaccio"],
  ["Grand Est", "Strasbourg"], ["Hauts-de-France", "Lille"], ["Île-de-France", "Paris"], ["Normandie", "Rouen"], ["Nouvelle-Aquitaine", "Bordeaux"],
  ["Occitanie", "Toulouse"], ["Pays de la Loire", "Nantes"], ["Provence-Alpes-Côte d'Azur", "Marseille"],
];

const DEPARTEMENTS: Pair[] = [
  ["75", "Paris"], ["13", "les Bouches-du-Rhône"], ["69", "le Rhône"], ["33", "la Gironde"], ["59", "le Nord"], ["06", "les Alpes-Maritimes"],
  ["31", "la Haute-Garonne"], ["67", "le Bas-Rhin"], ["44", "la Loire-Atlantique"], ["2A", "la Corse-du-Sud"], ["974", "La Réunion"], ["971", "la Guadeloupe"],
  ["972", "la Martinique"], ["973", "la Guyane"], ["976", "Mayotte"], ["35", "l'Ille-et-Vilaine"], ["34", "l'Hérault"], ["38", "l'Isère"],
  ["62", "le Pas-de-Calais"], ["64", "les Pyrénées-Atlantiques"], ["29", "le Finistère"], ["92", "les Hauts-de-Seine"], ["93", "la Seine-Saint-Denis"], ["01", "l'Ain"],
];

const FRANCE: Card[] = [
  ["Plus haut sommet de France ?", "le Mont Blanc", ["le pic du Midi", "le Puy de Dôme", "la Meije"], "Environ 4 806 m, dans le massif du Mont-Blanc."],
  ["Plus long fleuve de France ?", "la Loire", ["la Seine", "le Rhône", "la Garonne"], "Environ 1 000 km, du mont Gerbier-de-Jonc à l'Atlantique."],
  ["Combien de régions compte la France métropolitaine depuis 2016 ?", "13", ["22", "18", "9"], "18 avec les 5 régions d'outre-mer."],
  ["Combien de départements compte la France ?", "101", ["95", "96", "110"], "96 en métropole et 5 en outre-mer."],
  ["Deuxième ville la plus peuplée de France ?", "Marseille", ["Lyon", "Toulouse", "Nice"], "Environ 870 000 habitants."],
  ["Fleuve qui se jette dans la Méditerranée ?", "le Rhône", ["la Seine", "la Loire", "la Garonne"], "Par le delta de Camargue."],
  ["Volcan le plus célèbre de la chaîne des Puys ?", "le Puy de Dôme", ["le mont Gerbier-de-Jonc", "le Vésuve", "le Cantal"], "Environ 1 465 m, près de Clermont-Ferrand."],
  ["Plus grande île française de Méditerranée ?", "la Corse", ["l'île de Ré", "Belle-Île", "Porquerolles"], "Surnommée l'île de Beauté."],
  ["Département d'outre-mer situé en Amérique du Sud ?", "la Guyane", ["la Martinique", "La Réunion", "Mayotte"], "Le centre spatial de Kourou s'y trouve."],
  ["Océan où se trouve La Réunion ?", "l'océan Indien", ["l'océan Atlantique", "l'océan Pacifique", "la mer des Caraïbes"], "À l'est de Madagascar."],
  ["Dans quelle région se trouve le Mont-Saint-Michel ?", "en Normandie (Manche)", ["en Bretagne (Finistère)", "en Vendée", "dans le Nord"], "La baie est à la limite de la Bretagne."],
  ["Ville surnommée la « Ville rose » ?", "Toulouse", ["Lyon", "Bordeaux", "Nice"], "Pour la couleur de ses briques."],
  ["Ville surnommée la « capitale des Gaules » ?", "Lyon", ["Paris", "Reims", "Nîmes"], "Lugdunum était la grande ville de la Gaule romaine."],
  ["Ville où l'on sacrait les rois de France ?", "Reims", ["Paris", "Saint-Denis", "Orléans"], "Dans la cathédrale Notre-Dame de Reims."],
];

// ───────────── Histoire ─────────────

const DATES: Pair[] = [
  ["la prise de la Bastille", "1789"], ["la chute du mur de Berlin", "1989"], ["les premiers pas de l'homme sur la Lune", "1969"], ["l'arrivée de Christophe Colomb en Amérique", "1492"],
  ["le couronnement de Charlemagne comme empereur", "800"], ["la bataille d'Hastings", "1066"], ["le début de la Première Guerre mondiale", "1914"], ["l'armistice de la Première Guerre mondiale", "1918"],
  ["le début de la Seconde Guerre mondiale", "1939"], ["le débarquement de Normandie", "1944"], ["la création de l'ONU", "1945"], ["les attentats du 11 Septembre aux États-Unis", "2001"],
  ["la révolution d'Octobre en Russie", "1917"], ["la déclaration d'indépendance des États-Unis", "1776"], ["la bataille de Waterloo", "1815"], ["le sacre de Napoléon Ier", "1804"],
  ["l'abolition définitive de l'esclavage en France", "1848"], ["la chute de l'Empire romain d'Occident", "476"], ["la prise de Constantinople par les Ottomans", "1453"], ["la bataille de Marignan", "1515"],
  ["l'édit de Nantes", "1598"], ["la mort de Louis XIV", "1715"], ["la naissance de la Ve République", "1958"], ["Mai 68", "1968"],
  ["la mise en circulation des pièces et billets en euros", "2002"], ["l'indépendance de l'Algérie", "1962"], ["la mort de Jeanne d'Arc", "1431"], ["le krach boursier de Wall Street", "1929"],
  ["la Commune de Paris", "1871"], ["la loi de séparation des Églises et de l'État", "1905"], ["l'abolition de la peine de mort en France", "1981"], ["l'élection de Nelson Mandela", "1994"],
  ["la réunification de l'Allemagne", "1990"], ["la fin de l'URSS", "1991"], ["le lancement de Spoutnik, premier satellite artificiel", "1957"], ["la construction du mur de Berlin", "1961"],
  ["l'assassinat de John F. Kennedy", "1963"], ["le premier vol motorisé des frères Wright", "1903"], ["le naufrage du Titanic", "1912"], ["l'assassinat de Jules César", "44 av. J.-C."],
  ["la bataille d'Alésia", "52 av. J.-C."], ["la bataille de Poitiers (Charles Martel)", "732"], ["la révocation de l'édit de Nantes", "1685"], ["le droit de vote des femmes en France", "1944"],
  ["le traité de Rome (naissance de la CEE)", "1957"], ["la révolution de Juillet", "1830"], ["l'arrivée de la peste noire en Europe", "1347"], ["la découverte du vaccin contre la rage", "1885"],
];

const PERSONNAGES: Pair[] = [
  ["le premier président de la Ve République", "Charles de Gaulle"], ["l'empereur sacré à Notre-Dame en 1804", "Napoléon Ier"], ["le « Roi-Soleil »", "Louis XIV"],
  ["la « Pucelle d'Orléans »", "Jeanne d'Arc"], ["le premier empereur romain", "Auguste"], ["le pharaon dont la tombe intacte a été découverte en 1922", "Toutânkhamon"],
  ["le navigateur qui a dirigé le premier tour du monde (1519)", "Magellan"], ["le leader de la lutte non violente pour l'indépendance de l'Inde", "Gandhi"],
  ["le pasteur auteur du discours « I have a dream »", "Martin Luther King"], ["le premier président noir de l'Afrique du Sud", "Nelson Mandela"],
  ["le roi de France guillotiné en 1793", "Louis XVI"], ["la reine guillotinée en 1793", "Marie-Antoinette"], ["le Premier ministre britannique pendant la Seconde Guerre mondiale", "Winston Churchill"],
  ["le chef de l'URSS pendant la Seconde Guerre mondiale", "Staline"], ["le roi franc baptisé à Reims vers 496", "Clovis"], ["le roi assassiné par Ravaillac en 1610", "Henri IV"],
  ["le conquérant macédonien mort en 323 av. J.-C.", "Alexandre le Grand"], ["la reine d'Égypte alliée de César puis de Marc Antoine", "Cléopâtre"],
  ["le chef gaulois vaincu à Alésia", "Vercingétorix"], ["la ministre qui a porté la loi sur l'IVG en 1975", "Simone Veil"],
];

const HISTOIRE_CLAIMS: Claim[] = [
  ["La Révolution française a commencé en 1789.", true, "Prise de la Bastille le 14 juillet 1789."],
  ["Napoléon Ier est mort en exil à Sainte-Hélène.", true, "En 1821, dans l'Atlantique Sud."],
  ["Jeanne d'Arc a vécu au XVIIIe siècle.", false, "Au XVe siècle (1412-1431)."],
  ["La Seconde Guerre mondiale s'est terminée en 1945.", true, "Capitulation allemande en mai, japonaise en septembre."],
  ["Les Vikings venaient de Scandinavie.", true, "Danemark, Norvège, Suède actuels."],
  ["Le mur de Berlin séparait Berlin-Est et Berlin-Ouest.", true, "De 1961 à 1989."],
  ["Christophe Colomb cherchait une nouvelle route vers les Indes.", true, "Il pensait avoir atteint l'Asie."],
  ["La guerre de Cent Ans a duré exactement cent ans.", false, "De 1337 à 1453, soit 116 ans."],
];

// ───────────── Arts ─────────────

const OEUVRES_ART: Pair[] = [
  ["La Joconde", "Léonard de Vinci"], ["La Cène", "Léonard de Vinci"], ["La Nuit étoilée", "Vincent van Gogh"], ["Les Tournesols", "Vincent van Gogh"], ["Guernica", "Pablo Picasso"],
  ["Les Demoiselles d'Avignon", "Pablo Picasso"], ["Le Cri", "Edvard Munch"], ["La Persistance de la mémoire (les montres molles)", "Salvador Dalí"], ["La Jeune Fille à la perle", "Johannes Vermeer"],
  ["Impression, soleil levant", "Claude Monet"], ["Les Nymphéas", "Claude Monet"], ["Le Penseur", "Auguste Rodin"], ["La Naissance de Vénus", "Sandro Botticelli"],
  ["La Création d'Adam (chapelle Sixtine)", "Michel-Ange"], ["le David de marbre de Florence", "Michel-Ange"], ["L'École d'Athènes", "Raphaël"], ["La Liberté guidant le peuple", "Eugène Delacroix"],
  ["Le Radeau de La Méduse", "Théodore Géricault"], ["Le Déjeuner sur l'herbe", "Édouard Manet"], ["Les Glaneuses", "Jean-François Millet"], ["Bal du moulin de la Galette", "Auguste Renoir"],
  ["La Ronde de nuit", "Rembrandt"], ["Les Ménines", "Diego Vélasquez"], ["Le Tres de Mayo", "Francisco de Goya"], ["La Grande Vague de Kanagawa", "Hokusai"],
  ["Campbell's Soup Cans", "Andy Warhol"], ["La Trahison des images (« Ceci n'est pas une pipe »)", "René Magritte"], ["American Gothic", "Grant Wood"], ["Les Joueurs de cartes", "Paul Cézanne"],
  ["Le Sacre de Napoléon", "Jacques-Louis David"], ["Le Jardin des délices", "Jérôme Bosch"], ["Les Époux Arnolfini", "Jan van Eyck"], ["Un dimanche après-midi à l'île de la Grande Jatte", "Georges Seurat"],
  ["Composition en rouge, jaune et bleu", "Piet Mondrian"], ["Fontaine (l'urinoir)", "Marcel Duchamp"], ["Nighthawks", "Edward Hopper"],
];

const MONUMENTS: Pair[] = [
  ["le Taj Mahal", "Agra"], ["le Colisée", "Rome"], ["le Parthénon", "Athènes"], ["Big Ben", "Londres"], ["la statue de la Liberté", "New York"], ["le Christ Rédempteur", "Rio de Janeiro"],
  ["l'Alhambra", "Grenade"], ["le Kremlin", "Moscou"], ["l'Opéra aux voiles blanches", "Sydney"], ["le Burj Khalifa", "Dubaï"], ["la tour penchée", "Pise"], ["la Sagrada Família", "Barcelone"],
  ["la Cité interdite", "Pékin"], ["la porte de Brandebourg", "Berlin"], ["la basilique Saint-Pierre", "le Vatican"], ["le Golden Gate Bridge", "San Francisco"], ["Sainte-Sophie", "Istanbul"],
  ["l'Atomium", "Bruxelles"], ["le Manneken-Pis", "Bruxelles"], ["la tour Eiffel", "Paris"],
];

const ARCHITECTES: Pair[] = [
  ["la tour Eiffel", "Gustave Eiffel"], ["la Sagrada Família", "Antoni Gaudí"], ["la pyramide du Louvre", "Ieoh Ming Pei"], ["le Centre Pompidou", "Renzo Piano et Richard Rogers"],
  ["le musée Guggenheim de Bilbao", "Frank Gehry"], ["la Cité radieuse de Marseille", "Le Corbusier"], ["l'Opéra Garnier", "Charles Garnier"], ["les jardins de Versailles", "André Le Nôtre"],
];

const ARTS_CARDS: Card[] = [
  ["Courant de Monet, Renoir et Degas ?", "l'impressionnisme", ["le cubisme", "le surréalisme", "le romantisme"], "Le nom vient d'Impression, soleil levant (1872)."],
  ["Courant de Picasso et Braque, avec des formes géométriques ?", "le cubisme", ["l'impressionnisme", "le pop art", "le fauvisme"], "Début du XXe siècle."],
  ["Courant de Dalí et Magritte, inspiré des rêves ?", "le surréalisme", ["le réalisme", "le baroque", "le cubisme"], "Lancé par André Breton en 1924."],
  ["Musée parisien où est exposée La Joconde ?", "le Louvre", ["le musée d'Orsay", "le Centre Pompidou", "le Grand Palais"], "Le musée le plus visité du monde."],
  ["Musée parisien installé dans une ancienne gare ?", "le musée d'Orsay", ["le Louvre", "le Petit Palais", "le musée Rodin"], "Spécialisé dans l'art de 1848 à 1914."],
  ["Peintre qui s'est coupé une partie de l'oreille ?", "Vincent van Gogh", ["Paul Gauguin", "Claude Monet", "Pablo Picasso"], "En 1888, à Arles."],
  ["Mouvement artistique d'Andy Warhol ?", "le pop art", ["le cubisme", "l'art nouveau", "le fauvisme"], "Années 1960, inspiré de la publicité."],
  ["Période de la redécouverte de l'Antiquité en Italie (XVe-XVIe siècles) ?", "la Renaissance", ["le Moyen Âge", "les Lumières", "le baroque"], "Léonard de Vinci, Michel-Ange, Raphaël."],
];

// ───────────── Littérature ─────────────

const LIVRES: Pair[] = [
  ["Les Misérables", "Victor Hugo"], ["Notre-Dame de Paris", "Victor Hugo"], ["Le Petit Prince", "Antoine de Saint-Exupéry"], ["L'Étranger", "Albert Camus"], ["La Peste", "Albert Camus"],
  ["Madame Bovary", "Gustave Flaubert"], ["Germinal", "Émile Zola"], ["Le Père Goriot", "Honoré de Balzac"], ["Les Fleurs du mal", "Charles Baudelaire"], ["Candide", "Voltaire"],
  ["Le Rouge et le Noir", "Stendhal"], ["Les Trois Mousquetaires", "Alexandre Dumas"], ["Le Comte de Monte-Cristo", "Alexandre Dumas"], ["Vingt Mille Lieues sous les mers", "Jules Verne"],
  ["Le Tour du monde en quatre-vingts jours", "Jules Verne"], ["Bel-Ami", "Guy de Maupassant"], ["À la recherche du temps perdu", "Marcel Proust"], ["Les Fables", "Jean de La Fontaine"],
  ["Tartuffe", "Molière"], ["L'Avare", "Molière"], ["Le Cid", "Pierre Corneille"], ["Phèdre", "Jean Racine"], ["Cyrano de Bergerac", "Edmond Rostand"],
  ["Roméo et Juliette", "William Shakespeare"], ["Hamlet", "William Shakespeare"], ["Don Quichotte", "Miguel de Cervantes"], ["1984", "George Orwell"], ["La Ferme des animaux", "George Orwell"],
  ["Harry Potter", "J. K. Rowling"], ["Le Seigneur des anneaux", "J. R. R. Tolkien"], ["Guerre et Paix", "Léon Tolstoï"], ["Crime et Châtiment", "Fiodor Dostoïevski"],
  ["L'Odyssée", "Homère"], ["La Divine Comédie", "Dante"], ["Orgueil et Préjugés", "Jane Austen"], ["Frankenstein", "Mary Shelley"], ["Dracula", "Bram Stoker"],
  ["Le Vieil Homme et la Mer", "Ernest Hemingway"], ["Cent ans de solitude", "Gabriel García Márquez"], ["Alice au pays des merveilles", "Lewis Carroll"], ["Les Aventures de Tom Sawyer", "Mark Twain"],
  ["Le Meilleur des mondes", "Aldous Huxley"], ["Fahrenheit 451", "Ray Bradbury"], ["L'Alchimiste", "Paulo Coelho"], ["En attendant Godot", "Samuel Beckett"], ["Rhinocéros", "Eugène Ionesco"],
  ["Les Liaisons dangereuses", "Choderlos de Laclos"], ["Le Petit Nicolas", "René Goscinny"], ["Les Aventures de Tintin", "Hergé"], ["Les Contes de ma mère l'Oye", "Charles Perrault"],
];

const PERSONNAGES_LIVRES: Pair[] = [
  ["Jean Valjean", "Les Misérables"], ["Quasimodo", "Notre-Dame de Paris"], ["Meursault", "L'Étranger"], ["Emma Bovary", "Madame Bovary"], ["Rastignac", "Le Père Goriot"],
  ["d'Artagnan", "Les Trois Mousquetaires"], ["Edmond Dantès", "Le Comte de Monte-Cristo"], ["le capitaine Nemo", "Vingt Mille Lieues sous les mers"], ["Phileas Fogg", "Le Tour du monde en quatre-vingts jours"],
  ["Julien Sorel", "Le Rouge et le Noir"], ["Harpagon", "L'Avare"], ["Rodrigue et Chimène", "Le Cid"], ["Big Brother", "1984"], ["Frodon Sacquet", "Le Seigneur des anneaux"],
  ["Sherlock Holmes", "les romans d'Arthur Conan Doyle"], ["Gavroche", "Les Misérables"], ["Pangloss", "Candide"], ["Étienne Lantier", "Germinal"],
];

const LITTERATURE_CLAIMS: Claim[] = [
  ["Molière est le nom de scène de Jean-Baptiste Poquelin.", true, "Le français est parfois appelé « la langue de Molière »."],
  ["Victor Hugo a écrit Les Fleurs du mal.", false, "C'est Charles Baudelaire (1857)."],
  ["Le prix Goncourt récompense chaque année un roman en langue française.", true, "Créé en 1903."],
  ["Le Petit Prince a été écrit par un aviateur.", true, "Antoine de Saint-Exupéry était pilote."],
  ["Shakespeare était un dramaturge espagnol.", false, "Il était anglais (1564-1616)."],
  ["Jules Verne est célèbre pour ses romans d'aventures et d'anticipation.", true, "Les Voyages extraordinaires."],
];

// ───────────── Musique ─────────────

const CLASSIQUE: Pair[] = [
  ["Les Quatre Saisons", "Antonio Vivaldi"], ["La Flûte enchantée", "Wolfgang Amadeus Mozart"], ["Les Noces de Figaro", "Wolfgang Amadeus Mozart"], ["l'« Hymne à la joie » (Symphonie n° 9)", "Ludwig van Beethoven"],
  ["La Lettre à Élise", "Ludwig van Beethoven"], ["Le Boléro", "Maurice Ravel"], ["Carmen", "Georges Bizet"], ["Le Lac des cygnes", "Piotr Ilitch Tchaïkovski"], ["Casse-Noisette", "Piotr Ilitch Tchaïkovski"],
  ["Clair de lune", "Claude Debussy"], ["La Traviata", "Giuseppe Verdi"], ["La Walkyrie", "Richard Wagner"], ["Le Sacre du printemps", "Igor Stravinsky"], ["Les Gymnopédies", "Erik Satie"],
  ["Toccata et fugue en ré mineur", "Jean-Sébastien Bach"], ["Le Beau Danube bleu", "Johann Strauss fils"], ["Rhapsody in Blue", "George Gershwin"], ["La Marseillaise", "Rouget de Lisle"],
  ["Pierre et le Loup", "Sergueï Prokofiev"], ["Le Carnaval des animaux", "Camille Saint-Saëns"], ["Les Planètes", "Gustav Holst"], ["la Polonaise « héroïque »", "Frédéric Chopin"],
];

const CHANSONS: Pair[] = [
  ["Thriller", "Michael Jackson"], ["Imagine", "John Lennon"], ["Bohemian Rhapsody", "Queen"], ["La Vie en rose", "Édith Piaf"], ["Ne me quitte pas", "Jacques Brel"],
  ["Comme d'habitude", "Claude François"], ["La Bohème", "Charles Aznavour"], ["Les Champs-Élysées", "Joe Dassin"], ["Smells Like Teen Spirit", "Nirvana"], ["Hey Jude", "The Beatles"],
  ["(I Can't Get No) Satisfaction", "The Rolling Stones"], ["Alors on danse", "Stromae"], ["Shape of You", "Ed Sheeran"], ["Rolling in the Deep", "Adele"], ["Hotel California", "Eagles"],
  ["Stairway to Heaven", "Led Zeppelin"], ["Purple Rain", "Prince"], ["Get Lucky", "Daft Punk"], ["Djadja", "Aya Nakamura"], ["L'Aventurier", "Indochine"],
  ["Je te promets", "Johnny Hallyday"], ["Les Lacs du Connemara", "Michel Sardou"], ["Like a Rolling Stone", "Bob Dylan"], ["Respect", "Aretha Franklin"],
];

const MUSIQUE_CARDS: Card[] = [
  ["Combien de cordes a une guitare classique ?", "6", ["4", "5", "12"], "Mi, la, ré, sol, si, mi."],
  ["Combien de cordes a un violon ?", "4", ["3", "5", "6"], "Sol, ré, la, mi."],
  ["Combien de touches a un piano standard ?", "88", ["64", "76", "100"], "52 blanches et 36 noires."],
  ["Combien de notes dans la gamme de do majeur (sans répéter le do) ?", "7", ["5", "8", "12"], "Do, ré, mi, fa, sol, la, si."],
  ["Instrument de la famille des cuivres ?", "la trompette", ["la clarinette", "le violoncelle", "la harpe"], "Comme le trombone et le cor."],
  ["Instrument à vent de la famille des bois, malgré son métal ?", "le saxophone", ["la trompette", "le tuba", "le cor"], "Il a une anche, comme la clarinette."],
  ["Compositeur devenu sourd, auteur de 9 symphonies ?", "Ludwig van Beethoven", ["Mozart", "Bach", "Chopin"], "La 9e date de 1824."],
  ["Enfant prodige qui composait dès 5 ans, né à Salzbourg ?", "Wolfgang Amadeus Mozart", ["Beethoven", "Vivaldi", "Haydn"], "1756-1791."],
  ["Fête de la musique en France : quelle date ?", "le 21 juin", ["le 14 juillet", "le 1er mai", "le 21 mars"], "Créée en 1982, jour du solstice d'été."],
  ["Style musical né à La Nouvelle-Orléans au début du XXe siècle ?", "le jazz", ["le rap", "le reggae", "le rock"], "Louis Armstrong en est une figure."],
  ["Style musical né en Jamaïque, rendu célèbre par Bob Marley ?", "le reggae", ["le blues", "la salsa", "le jazz"], "Années 1960-1970."],
];

// ───────────── Cinéma ─────────────

const FILMS: Pair[] = [
  ["Titanic", "James Cameron"], ["Avatar", "James Cameron"], ["Jurassic Park", "Steven Spielberg"], ["E.T. l'extra-terrestre", "Steven Spielberg"], ["Les Dents de la mer", "Steven Spielberg"],
  ["Pulp Fiction", "Quentin Tarantino"], ["Kill Bill", "Quentin Tarantino"], ["Le Parrain", "Francis Ford Coppola"], ["Psychose", "Alfred Hitchcock"], ["Inception", "Christopher Nolan"],
  ["Interstellar", "Christopher Nolan"], ["Oppenheimer", "Christopher Nolan"], ["Star Wars (1977)", "George Lucas"], ["Le Fabuleux Destin d'Amélie Poulain", "Jean-Pierre Jeunet"],
  ["Intouchables", "Olivier Nakache et Éric Toledano"], ["La Haine", "Mathieu Kassovitz"], ["Le Voyage dans la Lune (1902)", "Georges Méliès"], ["Les Temps modernes", "Charlie Chaplin"],
  ["Le Seigneur des anneaux (trilogie)", "Peter Jackson"], ["Retour vers le futur", "Robert Zemeckis"], ["Forrest Gump", "Robert Zemeckis"], ["Le Voyage de Chihiro", "Hayao Miyazaki"],
  ["Mon voisin Totoro", "Hayao Miyazaki"], ["2001 : l'Odyssée de l'espace", "Stanley Kubrick"], ["Shining", "Stanley Kubrick"], ["Parasite", "Bong Joon-ho"],
  ["Les Quatre Cents Coups", "François Truffaut"], ["À bout de souffle", "Jean-Luc Godard"], ["Le Grand Bleu", "Luc Besson"], ["Taxi Driver", "Martin Scorsese"],
  ["Gladiator", "Ridley Scott"], ["Alien", "Ridley Scott"], ["Barbie (2023)", "Greta Gerwig"], ["Bienvenue chez les Ch'tis", "Dany Boon"], ["Les Visiteurs", "Jean-Marie Poiré"],
];

const CINEMA_CARDS: Card[] = [
  ["Récompense suprême du Festival de Cannes ?", "la Palme d'or", ["l'Ours d'or", "le Lion d'or", "l'Oscar"], "L'Ours d'or est à Berlin, le Lion d'or à Venise."],
  ["Récompenses annuelles du cinéma français ?", "les César", ["les Oscars", "les Molières", "les Victoires"], "Créés en 1976 ; les Molières récompensent le théâtre."],
  ["Inventeurs du cinématographe en 1895 ?", "les frères Lumière", ["les frères Wright", "les frères Pathé", "Georges Méliès"], "Première projection publique à Paris, le 28 décembre 1895."],
  ["Quartier de Los Angeles symbole du cinéma américain ?", "Hollywood", ["Broadway", "Manhattan", "Beverly Hills"], "Les grands studios s'y sont installés dans les années 1910."],
  ["Studio créateur de Mickey Mouse ?", "Disney", ["Pixar", "Warner Bros.", "DreamWorks"], "Mickey apparaît en 1928."],
  ["Premier long métrage entièrement en images de synthèse (1995) ?", "Toy Story", ["Shrek", "Le Roi lion", "Cars"], "Produit par Pixar."],
  ["Acteur qui joue Jack dans Titanic ?", "Leonardo DiCaprio", ["Brad Pitt", "Tom Cruise", "Johnny Depp"], "Face à Kate Winslet."],
  ["Personnage de cinéma qui dit « Je suis ton père » ?", "Dark Vador", ["Yoda", "Obi-Wan Kenobi", "Han Solo"], "Dans L'Empire contre-attaque (1980)."],
];

// ───────────── Sport ─────────────

const SPORT_CARDS: Card[] = [
  ["Combien de joueurs sur le terrain dans une équipe de football ?", "11", ["9", "10", "15"], "Gardien compris."],
  ["Combien de joueurs dans une équipe de rugby à XV sur le terrain ?", "15", ["11", "13", "7"], "Le rugby à XIII en compte 13."],
  ["Combien de joueurs par équipe sur un terrain de basket-ball ?", "5", ["6", "7", "4"], "Plus les remplaçants sur le banc."],
  ["Combien de joueurs par équipe sur un terrain de handball ?", "7", ["5", "6", "11"], "Dont un gardien."],
  ["Combien de joueurs par équipe sur un terrain de volley-ball ?", "6", ["5", "7", "4"], "Trois devant, trois derrière."],
  ["Longueur d'un marathon ?", "42,195 km", ["40 km", "42 km", "50 km"], "Distance officielle depuis 1921."],
  ["Combien d'anneaux sur le drapeau olympique ?", "5", ["4", "6", "7"], "Ils symbolisent l'union des continents."],
  ["Tous les combien d'années ont lieu les Jeux olympiques d'été ?", "4 ans", ["2 ans", "3 ans", "5 ans"], "Une olympiade."],
  ["Hauteur d'un panier de basket ?", "3,05 m", ["2,50 m", "3,50 m", "2,80 m"], "10 pieds."],
  ["Combien de points vaut un essai au rugby à XV ?", "5", ["3", "4", "7"], "La transformation rapporte 2 points de plus."],
  ["Combien de cases sur un échiquier ?", "64", ["36", "49", "100"], "8 × 8."],
  ["Combien de trous sur un parcours de golf complet ?", "18", ["9", "12", "24"], "Certains petits parcours en ont 9."],
  ["Tournoi de tennis du Grand Chelem joué sur terre battue ?", "Roland-Garros", ["Wimbledon", "l'US Open", "l'Open d'Australie"], "Wimbledon se joue sur gazon."],
  ["Course cycliste la plus célèbre au monde ?", "le Tour de France", ["le Giro", "la Vuelta", "Paris-Roubaix"], "Créé en 1903."],
  ["Course de voile en solitaire autour du monde, sans escale ni assistance ?", "le Vendée Globe", ["la Route du Rhum", "la Coupe de l'America", "la Transat Jacques Vabre"], "Départ des Sables-d'Olonne."],
  ["Nageur aux 23 médailles d'or olympiques ?", "Michael Phelps", ["Usain Bolt", "Léon Marchand", "Ian Thorpe"], "Record absolu."],
  ["Sprinteur recordman du monde du 100 m (9,58 s) ?", "Usain Bolt", ["Carl Lewis", "Tyson Gay", "Christian Coleman"], "Berlin, 2009."],
];

const SPORT_TERMES: Pair[] = [
  ["Roland-Garros", "le tennis"], ["le maillot jaune", "le cyclisme"], ["un essai", "le rugby"], ["un panier à trois points", "le basket-ball"], ["un birdie", "le golf"],
  ["échec et mat", "les échecs"], ["un home run", "le baseball"], ["un touchdown", "le football américain"], ["un ippon", "le judo"], ["le Ballon d'or", "le football"],
  ["la NBA", "le basket-ball"], ["le Tournoi des Six Nations", "le rugby"], ["la pole position", "la Formule 1"], ["le slalom géant", "le ski alpin"], ["la Stanley Cup", "le hockey sur glace"],
  ["le fleuret, l'épée et le sabre", "l'escrime"], ["le crawl", "la natation"], ["Wimbledon", "le tennis"], ["le Vendée Globe", "la voile"], ["un uppercut", "la boxe"],
];

const JO: Pair[] = [
  ["2024", "Paris"], ["2016", "Rio de Janeiro"], ["2012", "Londres"], ["2008", "Pékin"], ["2004", "Athènes"], ["2000", "Sydney"], ["1996", "Atlanta"], ["1992", "Barcelone"],
  ["2020 (disputés en 2021)", "Tokyo"], ["2028", "Los Angeles"], ["1924", "Paris"], ["1936", "Berlin"],
];

const COUPE_DU_MONDE: Pair[] = [["2022", "l'Argentine"], ["2018", "la France"], ["2014", "l'Allemagne"], ["2010", "l'Espagne"], ["2006", "l'Italie"], ["2002", "le Brésil"], ["1998", "la France"]];

// ───────────── Sciences ─────────────

const INVENTIONS: Pair[] = [
  ["le téléphone", "Graham Bell"], ["l'imprimerie à caractères mobiles en Europe", "Gutenberg"], ["le vaccin contre la rage", "Louis Pasteur"], ["la pénicilline", "Alexander Fleming"],
  ["la radioactivité naturelle", "Henri Becquerel"], ["le polonium et le radium", "Marie et Pierre Curie"], ["la théorie de la relativité", "Albert Einstein"], ["la gravitation universelle", "Isaac Newton"],
  ["l'héliocentrisme moderne", "Nicolas Copernic"], ["l'évolution par sélection naturelle", "Charles Darwin"], ["les lois de l'hérédité", "Gregor Mendel"], ["la dynamite", "Alfred Nobel"],
  ["la machine à vapeur perfectionnée", "James Watt"], ["le cinématographe", "les frères Lumière"], ["le premier vol motorisé (1903)", "les frères Wright"], ["la radio (TSF)", "Guglielmo Marconi"],
  ["le paratonnerre", "Benjamin Franklin"], ["le World Wide Web", "Tim Berners-Lee"], ["le tableau périodique des éléments", "Dmitri Mendeleïev"], ["l'écriture pour les aveugles", "Louis Braille"],
  ["le stéthoscope", "René Laennec"], ["la pile électrique", "Alessandro Volta"], ["la première photographie", "Nicéphore Niépce"], ["le premier vaccin (variole)", "Edward Jenner"],
  ["la structure en double hélice de l'ADN", "Watson et Crick"], ["les rayons X", "Wilhelm Röntgen"], ["la Pascaline (machine à calculer)", "Blaise Pascal"], ["la montgolfière", "les frères Montgolfier"],
  ["l'ampoule électrique commercialisée", "Thomas Edison"], ["les observations de la Lune à la lunette (1609)", "Galilée"],
];

const ELEMENTS: Pair[] = [
  ["Au", "l'or"], ["Ag", "l'argent"], ["Fe", "le fer"], ["Na", "le sodium"], ["K", "le potassium"], ["Pb", "le plomb"], ["Hg", "le mercure"], ["Cu", "le cuivre"],
  ["O", "l'oxygène"], ["C", "le carbone"], ["He", "l'hélium"], ["Sn", "l'étain"], ["H", "l'hydrogène"], ["N", "l'azote"], ["Cl", "le chlore"], ["Ca", "le calcium"],
];

const SCIENCES_CARDS: Card[] = [
  ["Température d'ébullition de l'eau au niveau de la mer ?", "100 °C", ["90 °C", "120 °C", "80 °C"], "À la pression atmosphérique normale."],
  ["Vitesse de la lumière dans le vide (environ) ?", "300 000 km/s", ["30 000 km/s", "3 000 km/s", "340 m/s"], "340 m/s, c'est le son dans l'air."],
  ["Formule chimique de l'eau ?", "H₂O", ["CO₂", "O₂", "NaCl"], "Deux atomes d'hydrogène, un d'oxygène."],
  ["Gaz le plus abondant dans l'air ?", "le diazote", ["le dioxygène", "le dioxyde de carbone", "l'argon"], "Environ 78 % ; le dioxygène environ 21 %."],
  ["Combien d'os dans le corps d'un adulte ?", "206", ["150", "300", "412"], "Le bébé en a davantage, certains fusionnent."],
  ["Plus grand organe du corps humain ?", "la peau", ["le foie", "le cerveau", "l'intestin"], "Environ 2 m² chez l'adulte."],
  ["Organe qui pompe le sang ?", "le cœur", ["les poumons", "le foie", "les reins"], "Environ 100 000 battements par jour."],
  ["Groupe sanguin « donneur universel » ?", "O négatif", ["AB positif", "A positif", "B négatif"], "AB positif est receveur universel."],
  ["Unité de mesure de la fréquence ?", "le hertz", ["le watt", "le volt", "le joule"], "1 Hz = une oscillation par seconde."],
  ["Unité de l'énergie dans le Système international ?", "le joule", ["le newton", "le watt", "le pascal"], "Le watt mesure une puissance."],
  ["Formule célèbre d'Einstein ?", "E = mc²", ["F = ma", "U = RI", "PV = nRT"], "Équivalence masse-énergie."],
  ["Savante deux fois prix Nobel (physique et chimie) ?", "Marie Curie", ["Rosalind Franklin", "Irène Joliot-Curie", "Ada Lovelace"], "1903 et 1911."],
];

// ───────────── Espace ─────────────

const ESPACE_CARDS: Card[] = [
  ["Plus grosse planète du Système solaire ?", "Jupiter", ["Saturne", "Neptune", "la Terre"], "Plus de 1 300 fois le volume de la Terre."],
  ["Planète la plus proche du Soleil ?", "Mercure", ["Vénus", "Mars", "la Terre"], "Une année y dure 88 jours."],
  ["Planète surnommée la planète rouge ?", "Mars", ["Vénus", "Jupiter", "Mercure"], "À cause de l'oxyde de fer de son sol."],
  ["Planète célèbre pour ses anneaux spectaculaires ?", "Saturne", ["Jupiter", "Uranus", "Mars"], "Faits de glace et de poussières."],
  ["Combien de planètes compte le Système solaire ?", "8", ["7", "9", "10"], "Pluton a été reclassée planète naine en 2006."],
  ["Planète la plus chaude du Système solaire ?", "Vénus", ["Mercure", "Mars", "Jupiter"], "Effet de serre extrême : environ 465 °C."],
  ["Notre galaxie ?", "la Voie lactée", ["Andromède", "le Grand Nuage de Magellan", "la galaxie du Triangle"], "Plus de 100 milliards d'étoiles."],
  ["Premier homme dans l'espace (1961) ?", "Youri Gagarine", ["Neil Armstrong", "Alan Shepard", "John Glenn"], "À bord de Vostok 1."],
  ["Premier homme à marcher sur la Lune ?", "Neil Armstrong", ["Buzz Aldrin", "Youri Gagarine", "Michael Collins"], "Le 21 juillet 1969 (heure française), mission Apollo 11."],
  ["Première femme dans l'espace ?", "Valentina Terechkova", ["Sally Ride", "Claudie Haigneré", "Samantha Cristoforetti"], "En 1963."],
  ["Astronaute français de l'Agence spatiale européenne, deux séjours dans l'ISS ?", "Thomas Pesquet", ["Jean-Loup Chrétien", "Patrick Baudry", "Philippe Perrin"], "En 2016-2017 et 2021."],
  ["Temps mis par la lumière du Soleil pour atteindre la Terre ?", "environ 8 minutes", ["environ 8 secondes", "environ 1 heure", "environ 1 jour"], "Distance d'environ 150 millions de km."],
  ["Planète naine ex-neuvième planète ?", "Pluton", ["Cérès", "Éris", "Titan"], "Reclassée en 2006."],
  ["Plus grand volcan connu du Système solaire ?", "Olympus Mons", ["l'Etna", "le Mauna Kea", "le Vésuve"], "Sur Mars, environ 22 km de haut."],
  ["Télescope spatial lancé en 2021, successeur de Hubble ?", "James Webb", ["Kepler", "Gaia", "Spitzer"], "Il observe dans l'infrarouge."],
  ["Comète qui revient environ tous les 76 ans ?", "la comète de Halley", ["la comète Hale-Bopp", "la comète de Encke", "la comète Shoemaker-Levy"], "Prochain passage vers 2061."],
  ["Plus gros satellite naturel du Système solaire ?", "Ganymède", ["la Lune", "Titan", "Europe"], "Satellite de Jupiter."],
  ["Étoile qui indique le nord ?", "l'étoile Polaire", ["Sirius", "Bételgeuse", "Vega"], "Dans la constellation de la Petite Ourse."],
];

const ORDRE_PLANETES: Pair[] = [
  ["Mercure", "1re"], ["Vénus", "2e"], ["la Terre", "3e"], ["Mars", "4e"], ["Jupiter", "5e"], ["Saturne", "6e"], ["Uranus", "7e"], ["Neptune", "8e"],
];

const SATELLITES: Pair[] = [
  ["Titan", "Saturne"], ["Encelade", "Saturne"], ["Europe", "Jupiter"], ["Io", "Jupiter"], ["Ganymède", "Jupiter"], ["Callisto", "Jupiter"],
  ["Phobos", "Mars"], ["Deimos", "Mars"], ["Triton", "Neptune"], ["Charon", "Pluton"], ["la Lune", "la Terre"], ["Miranda", "Uranus"],
];

const MISSIONS: Pair[] = [
  ["Spoutnik 1 (1957), premier satellite artificiel", "l'URSS"], ["Apollo 11 (1969), premiers pas sur la Lune", "les États-Unis"], ["Vostok 1 (1961), premier vol habité", "l'URSS"],
  ["Rosetta et son atterrisseur Philae (comète, 2014)", "l'Agence spatiale européenne"], ["Chang'e 4, premier alunissage sur la face cachée (2019)", "la Chine"],
  ["Chandrayaan-3, alunissage près du pôle Sud (2023)", "l'Inde"], ["le rover Curiosity sur Mars (2012)", "les États-Unis"], ["la fusée Ariane", "l'Agence spatiale européenne"],
];

const ESPACE_CLAIMS: Claim[] = [
  ["La Lune produit sa propre lumière.", false, "Elle réfléchit la lumière du Soleil."],
  ["Le Soleil est une étoile.", true, "Une étoile naine jaune."],
  ["La Terre met environ 365 jours à faire le tour du Soleil.", true, "365,25 jours, d'où les années bissextiles."],
  ["On voit toujours la même face de la Lune depuis la Terre.", true, "Rotation synchrone."],
  ["Il n'y a pas de gravité dans la Station spatiale internationale.", false, "Les astronautes flottent car ils sont en chute libre permanente autour de la Terre."],
  ["Une année-lumière est une durée.", false, "C'est une distance : celle parcourue par la lumière en un an."],
];

// ───────────── Nature ─────────────

const PETITS: Pair[] = [
  ["le cheval", "le poulain"], ["la vache", "le veau"], ["le mouton", "l'agneau"], ["la chèvre", "le chevreau"], ["le cochon", "le porcelet"], ["le lapin", "le lapereau"],
  ["le lion", "le lionceau"], ["l'ours", "l'ourson"], ["le canard", "le caneton"], ["l'oie", "l'oison"], ["la biche", "le faon"], ["le chien", "le chiot"],
  ["le chat", "le chaton"], ["la poule", "le poussin"], ["la grenouille", "le têtard"], ["l'aigle", "l'aiglon"], ["la baleine", "le baleineau"], ["l'éléphant", "l'éléphanteau"],
  ["le renard", "le renardeau"], ["le loup", "le louveteau"],
];

const CRIS: Pair[] = [
  ["le chien", "aboie"], ["le chat", "miaule"], ["la vache", "meugle"], ["le cheval", "hennit"], ["le mouton", "bêle"], ["le loup", "hurle"], ["le lion", "rugit"],
  ["le serpent", "siffle"], ["l'abeille", "bourdonne"], ["le corbeau", "croasse"], ["la grenouille", "coasse"], ["l'éléphant", "barrit"], ["l'âne", "brait"],
  ["le cochon", "grogne"], ["la poule", "caquette"], ["le pigeon", "roucoule"], ["le hibou", "hulule"], ["le cerf", "brame"],
];

const NATURE_CARDS: Card[] = [
  ["Plus grand animal du monde ?", "la baleine bleue", ["l'éléphant d'Afrique", "le requin-baleine", "le calmar géant"], "Jusqu'à 30 m de long."],
  ["Animal terrestre le plus rapide ?", "le guépard", ["le lion", "l'antilope", "le lévrier"], "Plus de 100 km/h en pointe."],
  ["Plus grand oiseau du monde ?", "l'autruche", ["le condor", "l'albatros", "l'émeu"], "Elle ne vole pas."],
  ["Seul mammifère capable de vraiment voler ?", "la chauve-souris", ["l'écureuil volant", "le colugo", "le pteranodon"], "Les autres ne font que planer."],
  ["Combien de pattes a une araignée ?", "8", ["6", "10", "4"], "Les insectes en ont 6."],
  ["Combien de pattes a un insecte ?", "6", ["8", "4", "10"], "Trois paires."],
  ["Combien de cœurs a une pieuvre ?", "3", ["1", "2", "8"], "Deux pour les branchies, un pour le corps."],
  ["Chez l'hippocampe, qui porte les petits ?", "le mâle", ["la femelle", "les deux", "aucun"], "Dans une poche ventrale."],
  ["Nourriture principale du panda géant ?", "le bambou", ["l'eucalyptus", "le poisson", "les fourmis"], "Jusqu'à 12 heures par jour à manger."],
  ["Nourriture principale du koala ?", "les feuilles d'eucalyptus", ["le bambou", "les insectes", "les fruits"], "Il dort environ 20 h par jour."],
  ["Arbre le plus haut du monde ?", "le séquoia", ["le baobab", "le chêne", "l'eucalyptus"], "Un séquoia à feuilles d'if dépasse 115 m."],
  ["Le dauphin est…", "un mammifère", ["un poisson", "un reptile", "un amphibien"], "Il respire de l'air et allaite ses petits."],
  ["Animal emblème de l'Australie qui porte ses petits dans une poche ?", "le kangourou", ["le koala", "le wombat", "l'ornithorynque"], "C'est un marsupial (comme le koala)."],
  ["Mammifère qui pond des œufs ?", "l'ornithorynque", ["le kangourou", "la chauve-souris", "le hérisson"], "Avec l'échidné, ce sont des monotrèmes."],
  ["Animal qui change de couleur pour communiquer ou se camoufler ?", "le caméléon", ["l'iguane", "la tortue", "le gecko"], "Grâce à des cristaux dans sa peau."],
  ["Gaz rejeté par les plantes lors de la photosynthèse ?", "le dioxygène", ["le dioxyde de carbone", "le méthane", "l'azote"], "Elles absorbent le CO₂."],
];

// ───────────── Mythologie ─────────────

const DIEUX: Pair[] = [
  ["Zeus", "Jupiter"], ["Héra", "Junon"], ["Poséidon", "Neptune"], ["Hadès", "Pluton"], ["Arès", "Mars"], ["Aphrodite", "Vénus"], ["Athéna", "Minerve"],
  ["Hermès", "Mercure"], ["Artémis", "Diane"], ["Héphaïstos", "Vulcain"], ["Dionysos", "Bacchus"], ["Déméter", "Cérès"], ["Cronos", "Saturne"], ["Éros", "Cupidon"], ["Hestia", "Vesta"],
];

const DOMAINES: Pair[] = [
  ["Zeus", "le ciel et la foudre"], ["Poséidon", "les mers et les océans"], ["Hadès", "les Enfers"], ["Arès", "la guerre"], ["Aphrodite", "l'amour et la beauté"],
  ["Athéna", "la sagesse et la stratégie"], ["Hermès", "les messages, le commerce et les voyageurs"], ["Dionysos", "le vin et la fête"], ["Héphaïstos", "le feu et la forge"],
  ["Déméter", "l'agriculture et les moissons"], ["Artémis", "la chasse"], ["Apollon", "la lumière, la musique et la poésie"], ["Hestia", "le foyer"],
];

const HEROS: Pair[] = [
  ["Ulysse", "rentre à Ithaque après un voyage de dix ans"], ["Achille", "n'est vulnérable qu'au talon"], ["Héraclès", "accomplit douze travaux"], ["Thésée", "tue le Minotaure dans le Labyrinthe"],
  ["Persée", "tranche la tête de Méduse"], ["Icare", "vole trop près du Soleil avec des ailes de cire"], ["Prométhée", "vole le feu aux dieux pour le donner aux hommes"],
  ["Pandore", "ouvre la jarre qui libère les maux du monde"], ["Œdipe", "résout l'énigme du Sphinx"], ["Orphée", "descend aux Enfers chercher Eurydice"], ["Jason", "part à la recherche de la Toison d'or"],
  ["Narcisse", "tombe amoureux de son propre reflet"], ["Sisyphe", "pousse éternellement un rocher en haut d'une colline"], ["Midas", "change en or tout ce qu'il touche"],
];

const MYTHO_CARDS: Card[] = [
  ["Montagne où vivent les dieux grecs ?", "l'Olympe", ["le Parnasse", "l'Etna", "le mont Ida"], "Plus haut sommet de Grèce."],
  ["Dieu nordique du tonnerre, armé d'un marteau ?", "Thor", ["Odin", "Loki", "Freyr"], "Son marteau s'appelle Mjöllnir."],
  ["Dieu principal de la mythologie nordique ?", "Odin", ["Thor", "Loki", "Baldr"], "Il a sacrifié un œil pour la sagesse."],
  ["Dieu égyptien du soleil ?", "Râ", ["Anubis", "Osiris", "Seth"], "Souvent représenté avec une tête de faucon."],
  ["Dieu égyptien à tête de chacal, lié aux morts ?", "Anubis", ["Horus", "Râ", "Thot"], "Il préside à la momification."],
  ["Cheval ailé de la mythologie grecque ?", "Pégase", ["Bucéphale", "le Centaure", "Cerbère"], "Né du sang de Méduse."],
  ["Chien à trois têtes gardien des Enfers ?", "Cerbère", ["Pégase", "l'Hydre", "le Minotaure"], "Héraclès le capture lors de son 12e travail."],
  ["Mot né du cheval de bois rusé d'Ulysse ?", "le cheval de Troie", ["la boîte de Pandore", "le talon d'Achille", "le fil d'Ariane"], "Aujourd'hui aussi un logiciel malveillant."],
];

// ───────────── Langue française ─────────────

const EXPRESSIONS: Pair[] = [
  ["poser un lapin", "ne pas venir à un rendez-vous"], ["coûter les yeux de la tête", "coûter très cher"], ["avoir le cafard", "être triste, déprimé"], ["tomber dans les pommes", "s'évanouir"],
  ["avoir un poil dans la main", "être paresseux"], ["mettre les pieds dans le plat", "aborder maladroitement un sujet délicat"], ["casser les pieds", "ennuyer, importuner quelqu'un"],
  ["être dans la lune", "être distrait, rêveur"], ["raconter des salades", "raconter des mensonges"], ["donner sa langue au chat", "renoncer à trouver la réponse"],
  ["prendre ses jambes à son cou", "s'enfuir en courant"], ["se mettre le doigt dans l'œil", "se tromper complètement"], ["il pleut des cordes", "il pleut très fort"],
  ["faire la grasse matinée", "se lever tard"], ["être au pied du mur", "ne plus pouvoir reculer"], ["mettre la puce à l'oreille", "éveiller un soupçon"],
  ["tirer les vers du nez", "faire avouer quelqu'un petit à petit"], ["avoir un chat dans la gorge", "être enroué"], ["couper la poire en deux", "faire un compromis"],
  ["être sur son trente-et-un", "être très bien habillé"], ["les carottes sont cuites", "il n'y a plus d'espoir"], ["faire d'une pierre deux coups", "obtenir deux résultats en une seule action"],
  ["avoir les dents longues", "être très ambitieux"], ["chercher la petite bête", "chercher le moindre défaut"], ["mettre son grain de sel", "donner son avis sans y être invité"],
  ["jeter l'éponge", "abandonner"], ["avoir du pain sur la planche", "avoir beaucoup de travail"], ["se faire rouler dans la farine", "se faire tromper"],
  ["tourner autour du pot", "ne pas aller droit au but"], ["avoir les yeux plus gros que le ventre", "vouloir plus qu'on ne peut avaler ou faire"], ["être une poule mouillée", "être peureux"],
  ["revenir à ses moutons", "revenir au sujet de la conversation"], ["avoir la main verte", "être doué pour le jardinage"], ["prendre la mouche", "se vexer pour peu de chose"],
  ["avoir le cœur sur la main", "être très généreux"], ["tenir la chandelle", "assister en trop à un tête-à-tête amoureux"],
];

const LANGUE_CARDS: Card[] = [
  ["Pluriel de « cheval » ?", "chevaux", ["chevals", "chevaus", "chevaux ou chevals"], "Les noms en -al font -aux (sauf bal, carnaval, festival…)."],
  ["Pluriel de « festival » ?", "festivals", ["festivaux", "festivaus", "festivales"], "Exception au pluriel en -aux."],
  ["Pluriel de « bijou » ?", "bijoux", ["bijous", "bijoues", "bijou"], "Comme caillou, chou, genou, hibou, joujou, pou."],
  ["Pluriel de « œil » ?", "yeux", ["œils", "œuils", "yeuxs"], "« Œils » existe seulement dans des mots composés (œils-de-bœuf)."],
  ["Pluriel de « travail » (au sens d'ouvrages) ?", "travaux", ["travails", "travaus", "travailles"], "Comme corail, émail, vitrail."],
  ["Mot bien orthographié ?", "développement", ["dévelopement", "développemment", "dévellopement"], "Deux p, un l."],
  ["Mot bien orthographié ?", "rythme", ["rhytme", "rythm", "ritme"], "Du grec rhuthmos."],
  ["Mot bien orthographié ?", "parallèle", ["paralèle", "parralèle", "parallelle"], "Deux l au milieu, un seul à la fin."],
  ["Mot bien orthographié ?", "accueil", ["acceuil", "aqueil", "accueuil"], "Après « cc », on écrit « ueil »."],
  ["Synonyme de « rapide » ?", "véloce", ["lent", "lourd", "paisible"], "Du latin velox."],
  ["Contraire de « éphémère » ?", "durable", ["passager", "bref", "fugace"], "Éphémère : qui ne dure qu'un jour, très peu de temps."],
  ["Un palindrome, c'est…", "un mot qui se lit dans les deux sens", ["un mot très long", "un mot d'origine grecque", "un mot qui rime avec lui-même"], "Exemples : kayak, radar, été."],
  ["Un anagramme de « chien » ?", "niche", ["chêne", "chaîne", "chine"], "Mêmes lettres dans un autre ordre."],
  ["Quelle figure de style dans « Cette obscure clarté » ?", "un oxymore", ["une métaphore", "une hyperbole", "une litote"], "Deux mots de sens contraire rapprochés (Corneille)."],
  ["« Va, je ne te hais point » est…", "une litote", ["une hyperbole", "un oxymore", "une métonymie"], "Dire moins pour suggérer plus (Corneille, Le Cid)."],
];

// ───────────── Institutions et monde ─────────────

const SIGLES: Pair[] = [
  ["ONU", "Organisation des Nations unies"], ["OMS", "Organisation mondiale de la santé"], ["OTAN", "Organisation du traité de l'Atlantique Nord"], ["UE", "Union européenne"],
  ["FMI", "Fonds monétaire international"], ["OMC", "Organisation mondiale du commerce"], ["BCE", "Banque centrale européenne"], ["ONG", "organisation non gouvernementale"],
  ["PIB", "produit intérieur brut"], ["SMIC", "salaire minimum interprofessionnel de croissance"], ["SNCF", "Société nationale des chemins de fer français"], ["CNIL", "Commission nationale de l'informatique et des libertés"],
  ["UNICEF", "Fonds des Nations unies pour l'enfance"], ["ESA", "Agence spatiale européenne"], ["CNRS", "Centre national de la recherche scientifique"], ["INSEE", "Institut national de la statistique et des études économiques"],
  ["TVA", "taxe sur la valeur ajoutée"], ["SAMU", "service d'aide médicale urgente"], ["GIEC", "Groupe d'experts intergouvernemental sur l'évolution du climat"], ["UNESCO", "Organisation des Nations unies pour l'éducation, la science et la culture"],
  ["RER", "réseau express régional"], ["BAC", "baccalauréat"], ["CDI", "contrat à durée indéterminée"], ["SDF", "sans domicile fixe"],
];

const INSTITUTIONS: Card[] = [
  ["Ville siège de l'ONU ?", "New York", ["Genève", "Paris", "Washington"], "Genève accueille son office européen."],
  ["Ville siège de la Commission européenne ?", "Bruxelles", ["Strasbourg", "Luxembourg", "Francfort"], "Le Parlement européen siège officiellement à Strasbourg."],
  ["Ville siège officiel du Parlement européen ?", "Strasbourg", ["Bruxelles", "Luxembourg", "Paris"], "Il se réunit aussi à Bruxelles."],
  ["Combien de pays dans l'Union européenne (depuis 2020) ?", "27", ["25", "28", "30"], "Le Royaume-Uni est sorti en 2020."],
  ["Devise de la République française ?", "Liberté, Égalité, Fraternité", ["Travail, Famille, Patrie", "Unité, Progrès, Justice", "Paix et Liberté"], "Inscrite dans la Constitution de 1958."],
  ["Durée du mandat du président de la République ?", "5 ans", ["4 ans", "6 ans", "7 ans"], "Le quinquennat depuis 2002 (septennat avant)."],
  ["Nombre de députés à l'Assemblée nationale ?", "577", ["348", "500", "650"], "Le Sénat compte 348 sénateurs."],
  ["Résidence officielle du président de la République ?", "le palais de l'Élysée", ["l'hôtel Matignon", "le palais Bourbon", "le palais du Luxembourg"], "Matignon est celle du Premier ministre."],
  ["Lieu où siège l'Assemblée nationale ?", "le palais Bourbon", ["le palais du Luxembourg", "l'Élysée", "Versailles"], "Le Sénat siège au palais du Luxembourg."],
  ["Âge de la majorité et du droit de vote en France ?", "18 ans", ["16 ans", "20 ans", "21 ans"], "Depuis 1974 (21 ans avant)."],
  ["Figure féminine symbole de la République française ?", "Marianne", ["Jeanne", "Athéna", "Europe"], "Coiffée d'un bonnet phrygien."],
  ["Hymne national français ?", "La Marseillaise", ["Le Chant des partisans", "L'Internationale", "La Madelon"], "Composée par Rouget de Lisle en 1792."],
  ["Monnaie de la zone euro depuis 2002 (pièces et billets) ?", "l'euro", ["l'écu", "le franc", "le mark"], "Utilisé par 20 pays de l'UE."],
  ["Ville où est remis le prix Nobel de la paix ?", "Oslo", ["Stockholm", "Genève", "La Haye"], "Les autres prix Nobel sont remis à Stockholm."],
  ["Organisation qui classe des sites au patrimoine mondial ?", "l'UNESCO", ["l'OMS", "l'OTAN", "le FMI"], "Plus de 1 100 sites dans le monde."],
];

// ───────────── Gastronomie ─────────────

const PLATS_MONDE: Pair[] = [
  ["la paella", "l'Espagne"], ["les sushis", "le Japon"], ["la pizza margherita", "l'Italie"], ["les tacos", "le Mexique"], ["la moussaka", "la Grèce"],
  ["le goulasch", "la Hongrie"], ["le bortsch", "l'Ukraine"], ["le fish and chips", "le Royaume-Uni"], ["la poutine", "le Canada (Québec)"], ["le kimchi", "la Corée"],
  ["le pad thaï", "la Thaïlande"], ["la feijoada", "le Brésil"], ["le ceviche", "le Pérou"], ["le phở", "le Viêt Nam"], ["la currywurst", "l'Allemagne"],
  ["le couscous", "le Maghreb"], ["le tiramisu", "l'Italie"], ["le pastel de nata", "le Portugal"], ["le houmous", "le Proche-Orient"],
];

const PLATS_FRANCE: Pair[] = [
  ["la bouillabaisse", "Marseille"], ["la salade niçoise", "Nice"], ["le cassoulet", "Castelnaudary"], ["la choucroute", "l'Alsace"], ["le kouign-amann", "la Bretagne"],
  ["la tartiflette", "la Savoie"], ["la quiche", "la Lorraine"], ["le bœuf bourguignon", "la Bourgogne"], ["l'aligot", "l'Aubrac"], ["le canelé", "Bordeaux"],
  ["le calisson", "Aix-en-Provence"], ["la madeleine", "Commercy"], ["les rillettes", "Le Mans"], ["la galette-saucisse", "Rennes"], ["le far breton", "la Bretagne"],
];

const GASTRO_CLAIMS: Claim[] = [
  ["Le roquefort est fabriqué avec du lait de brebis.", true, "Affiné dans les caves de Roquefort-sur-Soulzon."],
  ["Le camembert vient de Normandie.", true, "Lait de vache."],
  ["Le champagne ne peut porter ce nom que s'il est produit en Champagne.", true, "Appellation d'origine protégée."],
  ["Le croissant est né en Italie.", false, "Il viendrait de Vienne (le kipferl), popularisé à Paris au XIXe siècle."],
  ["La tomate vient d'Amérique.", true, "Rapportée en Europe au XVIe siècle."],
  ["Le chocolat est fabriqué à partir des fèves du cacaoyer.", true, "Originaire d'Amérique centrale et du Sud."],
];

// ───────────── Assemblage des thèmes ─────────────

/** Titre entre guillemets, sauf s'il est déjà décrit (« l'Hymne à la joie », « la Polonaise… »). */
const title = (a: string) => (/^[a-zà-ÿ]/.test(a) ? a : `« ${a} »`);

const knows = (items: readonly Pair[], ask: (a: string) => string, reverse: (b: string) => string, claim: (a: string, b: string) => string, explain?: (a: string, b: string) => string) =>
  pairs(items, { ask, reverse, claim, explain });

export const CULTURE: Record<string, Generator[]> = {
  "cg-capitales": [
    ...knows(CAPITALES, (a) => `Capitale ${de(a)} ?`, (b) => `${b} est la capitale de…`, (a, b) => `La capitale ${de(a)} est ${b}.`, (a, b) => `${cap(b)} est la capitale ${de(a)}.`),
    claims(PIEGES_CAPITALES),
  ],
  "cg-geo-monde": [
    cards(RECORDS_GEO),
    ...knows(FLEUVES, (a) => `Quel fleuve traverse ${a} ?`, (b) => `Quelle ville est traversée par ${b} ?`, (a, b) => `${cap(b)} traverse ${a}.`, (a, b) => `${cap(b)} traverse ${a}.`),
    ...knows(MONNAIES, (a) => `Monnaie ${de(a)} ?`, (b) => `Quel pays utilise ${b} ?`, (a, b) => `La monnaie ${de(a)} est ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
  ],
  "cg-france": [
    cards(FRANCE),
    ...knows(REGIONS, (a) => `Chef-lieu de la région ${a} ?`, (b) => `${b} est le chef-lieu de quelle région ?`, (a, b) => `${b} est le chef-lieu de la région ${a}.`, (a, b) => `${a} : chef-lieu ${b}.`),
    ...knows(DEPARTEMENTS, (a) => `Quel département porte le numéro ${a} ?`, (b) => `Quel numéro porte le département suivant : ${b} ?`, (a, b) => `Le département n° ${a} est ${b}.`, (a, b) => `${a} : ${b}.`),
  ],
  "cg-histoire": [
    ...knows(DATES, (a) => `En quelle année : ${a} ?`, (b) => `Quel événement a eu lieu en ${b} ?`, (a, b) => `${b} : ${a}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(PERSONNAGES, (a) => `Qui est ${a} ?`, (b) => `Qui était ${b} ?`, (a, b) => `${cap(a)} est ${b}.`, (a, b) => `${b} : ${a}.`),
    claims(HISTOIRE_CLAIMS),
  ],
  "cg-arts": [
    ...knows(OEUVRES_ART, (a) => `Qui a réalisé « ${a} » ?`, (b) => `Quelle œuvre est de ${b} ?`, (a, b) => `« ${a} » est une œuvre de ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    ...knows(MONUMENTS, (a) => `Dans quelle ville se trouve ${a} ?`, (b) => `Quel monument se trouve à ${b} ?`, (a, b) => `${cap(a)} se trouve à ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(ARCHITECTES, (a) => `Qui a conçu ${a} ?`, (b) => `Quelle réalisation doit-on à ${b} ?`, (a, b) => `${cap(a)} a été conçu(e) par ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    cards(ARTS_CARDS),
  ],
  "cg-litterature": [
    ...knows(LIVRES, (a) => `Qui a écrit « ${a} » ?`, (b) => `Quelle œuvre a écrite ${b} ?`, (a, b) => `« ${a} » a été écrit par ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    ...knows(PERSONNAGES_LIVRES, (a) => `Dans quelle œuvre trouve-t-on ${a} ?`, (b) => `Quel personnage apparaît dans ${b.startsWith("les romans") ? b : `« ${b} »`} ?`, (a, b) => `${cap(a)} est un personnage de ${b.startsWith("les romans") ? b : `« ${b} »`}.`, (a, b) => `${cap(a)} : ${b}.`),
    claims(LITTERATURE_CLAIMS),
  ],
  "cg-musique": [
    ...knows(CLASSIQUE, (a) => `Qui a composé ${title(a)} ?`, (b) => `Quelle œuvre a composée ${b} ?`, (a, b) => `${b} a composé ${title(a)}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(CHANSONS, (a) => `Qui interprète « ${a} » ?`, (b) => `Quelle chanson est interprétée par ${b} ?`, (a, b) => `« ${a} » est une chanson de ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    cards(MUSIQUE_CARDS),
  ],
  "cg-cinema": [
    ...knows(FILMS, (a) => `Qui a réalisé « ${a} » ?`, (b) => `Quel film a réalisé ${b} ?`, (a, b) => `« ${a} » a été réalisé par ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    cards(CINEMA_CARDS),
  ],
  "cg-sport": [
    cards(SPORT_CARDS),
    ...knows(SPORT_TERMES, (a) => `À quel sport associe-t-on ${a} ?`, (b) => `Quel terme est associé au sport suivant : ${b} ?`, (a, b) => `${cap(a)} est associé(e) à ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(JO, (a) => `Ville des Jeux olympiques d'été de ${a} ?`, (b) => `En quelle année ${b} a-t-elle accueilli les JO d'été ?`, (a, b) => `Les JO d'été de ${a} ont eu lieu à ${b}.`, (a, b) => `JO ${a} : ${b}.`),
    ...knows(COUPE_DU_MONDE, (a) => `Vainqueur de la Coupe du monde de football ${a} ?`, (b) => `Quelle Coupe du monde a gagnée ${b} ?`, (a, b) => `${cap(b)} a gagné la Coupe du monde ${a}.`, (a, b) => `Coupe du monde ${a} : ${b}.`),
  ],
  "cg-sciences": [
    ...knows(INVENTIONS, (a) => `À qui doit-on ${a} ?`, (b) => `Qu'a inventé ou découvert ${b} ?`, (a, b) => `On doit ${a} à ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(ELEMENTS, (a) => `Quel élément chimique a pour symbole ${a} ?`, (b) => `Symbole chimique de ${b} ?`, (a, b) => `${a} est le symbole de ${b}.`, (a, b) => `${a} : ${b}.`),
    cards(SCIENCES_CARDS),
  ],
  "cg-espace": [
    cards(ESPACE_CARDS),
    claims(ESPACE_CLAIMS),
    ...knows(ORDRE_PLANETES, (a) => `Rang de ${a} en partant du Soleil ?`, (b) => `Quelle planète est la ${b} en partant du Soleil ?`, (a, b) => `${cap(a)} est la ${b} planète en partant du Soleil.`, (a, b) => `${cap(a)} : ${b} planète depuis le Soleil.`),
    ...knows(SATELLITES, (a) => `Autour de quel astre tourne ${a} ?`, (b) => `Quel satellite tourne autour de ${b} ?`, (a, b) => `${cap(a)} est un satellite de ${b}.`, (a, b) => `${cap(a)} tourne autour de ${b}.`),
    ...knows(MISSIONS, (a) => `Quel pays ou agence a réalisé ${a} ?`, (b) => `Quelle réussite spatiale doit-on à ${b} ?`, (a, b) => `${cap(a)} : ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
  ],
  "cg-nature": [
    cards(NATURE_CARDS),
    ...knows(PETITS, (a) => `Comment s'appelle le petit ${de(a)} ?`, (b) => `${cap(b)} est le petit de…`, (a, b) => `Le petit ${de(a)} s'appelle ${b}.`, (a, b) => `${cap(a)} → ${b}.`),
    ...knows(CRIS, (a) => `${cap(a)}…`, (b) => `Quel animal ${b} ?`, (a, b) => `${cap(a)} ${b}.`, (a, b) => `${cap(a)} ${b}.`),
  ],
  "cg-mythologie": [
    ...knows(DIEUX, (a) => `Nom romain de ${a} ?`, (b) => `Nom grec de ${b} ?`, (a, b) => `${a} s'appelle ${b} chez les Romains.`, (a, b) => `${a} (grec) = ${b} (romain).`),
    ...knows(DOMAINES, (a) => `Domaine de ${a} ?`, (b) => `Quelle divinité grecque règne sur ${b} ?`, (a, b) => `${a} est la divinité de ${b}.`, (a, b) => `${a} : ${b}.`),
    ...knows(HEROS, (a) => `Que fait ${a} dans la mythologie ?`, (b) => `Quel personnage ${b} ?`, (a, b) => `${a} ${b}.`, (a, b) => `${a} ${b}.`),
    cards(MYTHO_CARDS),
  ],
  "cg-langue": [
    ...knows(EXPRESSIONS, (a) => `Que signifie « ${a} » ?`, (b) => `Quelle expression signifie : ${b} ?`, (a, b) => `« ${cap(a)} » signifie ${b}.`, (a, b) => `« ${cap(a)} » : ${b}.`),
    cards(LANGUE_CARDS),
  ],
  "cg-institutions": [
    ...knows(SIGLES, (a) => `Que signifie le sigle ${a} ?`, (b) => `Quel sigle désigne : ${b} ?`, (a, b) => `${a} signifie « ${b} ».`, (a, b) => `${a} : ${b}.`),
    cards(INSTITUTIONS),
  ],
  "cg-gastronomie": [
    ...knows(PLATS_MONDE, (a) => `D'où vient ${a} ?`, (b) => `Quelle spécialité vient ${de(b)} ?`, (a, b) => `${cap(a)} est une spécialité ${de(b)}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(PLATS_FRANCE, (a) => `De quelle ville ou région française vient ${a} ?`, (b) => `Quelle spécialité est associée ${b.startsWith("Le ") ? `au ${b.slice(3)}` : `à ${b}`} ?`, (a, b) => `${cap(a)} est une spécialité ${de(b)}.`, (a, b) => `${cap(a)} : ${b}.`),
    claims(GASTRO_CLAIMS),
  ],
};
