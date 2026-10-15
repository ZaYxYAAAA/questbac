/**
 * Culture générale — matière à part, hors programme, ouverte à tous les niveaux.
 * Chaque thème est rangé en 3 niveaux : 1 Basique (ce que tout le monde a
 * entendu), 2 Intermédiaire (bonne culture générale), 3 Expert (pour les pointus).
 * Les tables de correspondances donnent question directe, inverse et vrai/faux
 * (voir `pairs`) ; les leurres sont piochés dans tous les niveaux du thème.
 */
import { type Card, type Claim, type Generator, type Pair, type PairOptions, cards, claims, pairs } from "./kit";

export type Tier = 1 | 2 | 3;
export const TIERS: readonly Tier[] = [1, 2, 3];
type Tiers<T> = Record<Tier, readonly T[]>;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** « de » élidé devant un nom propre à initiale vocalique ou h muet : d'Éros, d'Héra. */
const dn = (x: string) => (/^[aeiouyhàâéèêëîïôûœ]/i.test(x) ? `d'${x}` : `de ${x}`);

/** « de » contracté devant l'article : du Japon, des États-Unis, de la France, de l'Inde, du Mans. */
export function de(x: string): string {
  if (/^le /i.test(x)) return `du ${x.slice(3)}`;
  if (/^les /i.test(x)) return `des ${x.slice(4)}`;
  return `de ${x}`;
}

// ───────────── Géographie ─────────────

const CAPITALES: Tiers<Pair> = {
  1: [
    ["la France", "Paris"], ["l'Allemagne", "Berlin"], ["l'Espagne", "Madrid"], ["l'Italie", "Rome"], ["le Portugal", "Lisbonne"], ["le Royaume-Uni", "Londres"],
    ["la Belgique", "Bruxelles"], ["les Pays-Bas", "Amsterdam"], ["la Grèce", "Athènes"], ["la Russie", "Moscou"], ["les États-Unis", "Washington"], ["la Chine", "Pékin"],
    ["le Japon", "Tokyo"], ["l'Égypte", "Le Caire"], ["le Maroc", "Rabat"], ["l'Algérie", "Alger"], ["la Tunisie", "Tunis"], ["le Sénégal", "Dakar"],
    ["l'Irlande", "Dublin"], ["l'Autriche", "Vienne"], ["l'Argentine", "Buenos Aires"], ["le Mexique", "Mexico"], ["Cuba", "La Havane"], ["le Danemark", "Copenhague"],
    ["la Suède", "Stockholm"], ["la Norvège", "Oslo"], ["la Pologne", "Varsovie"], ["l'Inde", "New Delhi"], ["la Corée du Sud", "Séoul"], ["la Thaïlande", "Bangkok"],
    ["le Pérou", "Lima"], ["le Chili", "Santiago"], ["la Hongrie", "Budapest"], ["la Tchéquie", "Prague"],
  ],
  2: [
    ["la Suisse", "Berne"], ["le Canada", "Ottawa"], ["le Brésil", "Brasilia"], ["l'Australie", "Canberra"], ["la Turquie", "Ankara"], ["la Finlande", "Helsinki"],
    ["l'Islande", "Reykjavik"], ["la Roumanie", "Bucarest"], ["la Bulgarie", "Sofia"], ["la Croatie", "Zagreb"], ["la Serbie", "Belgrade"], ["l'Ukraine", "Kyiv (Kiev)"],
    ["la Colombie", "Bogota"], ["le Venezuela", "Caracas"], ["l'Équateur", "Quito"], ["l'Uruguay", "Montevideo"], ["le Viêt Nam", "Hanoï"], ["les Philippines", "Manille"],
    ["la Malaisie", "Kuala Lumpur"], ["l'Iran", "Téhéran"], ["l'Irak", "Bagdad"], ["l'Arabie saoudite", "Riyad"], ["le Liban", "Beyrouth"], ["la Syrie", "Damas"],
    ["le Kenya", "Nairobi"], ["l'Éthiopie", "Addis-Abeba"], ["le Mali", "Bamako"], ["le Cameroun", "Yaoundé"], ["Madagascar", "Antananarivo"], ["la Nouvelle-Zélande", "Wellington"],
    ["la Corée du Nord", "Pyongyang"], ["l'Afghanistan", "Kaboul"], ["le Pakistan", "Islamabad"], ["le Qatar", "Doha"], ["la Jordanie", "Amman"], ["la Côte d'Ivoire", "Yamoussoukro"],
    ["le Nigeria", "Abuja"], ["le Gabon", "Libreville"], ["la Jamaïque", "Kingston"],
  ],
  3: [
    ["la Slovaquie", "Bratislava"], ["la Slovénie", "Ljubljana"], ["l'Estonie", "Tallinn"], ["la Lettonie", "Riga"], ["la Lituanie", "Vilnius"], ["l'Albanie", "Tirana"],
    ["Malte", "La Valette"], ["Chypre", "Nicosie"], ["le Paraguay", "Asuncion"], ["le Bangladesh", "Dacca"], ["le Népal", "Katmandou"], ["la Mongolie", "Oulan-Bator"],
    ["les Émirats arabes unis", "Abou Dabi"], ["le Kazakhstan", "Astana"], ["le Ghana", "Accra"], ["la République démocratique du Congo", "Kinshasa"], ["le Burkina Faso", "Ouagadougou"],
    ["le Niger", "Niamey"], ["le Tchad", "N'Djamena"], ["la Guinée", "Conakry"], ["le Rwanda", "Kigali"], ["l'Angola", "Luanda"], ["le Myanmar", "Naypyidaw"],
    ["la Tanzanie", "Dodoma"], ["le Kirghizistan", "Bichkek"], ["l'Ouzbékistan", "Tachkent"], ["la Géorgie", "Tbilissi"], ["l'Arménie", "Erevan"], ["l'Azerbaïdjan", "Bakou"],
    ["la Moldavie", "Chisinau"], ["le Monténégro", "Podgorica"], ["la Macédoine du Nord", "Skopje"], ["la Bosnie-Herzégovine", "Sarajevo"], ["le Laos", "Vientiane"],
    ["le Cambodge", "Phnom Penh"], ["le Bhoutan", "Thimphou"], ["le Mozambique", "Maputo"], ["la Zambie", "Lusaka"], ["le Zimbabwe", "Harare"], ["l'Ouganda", "Kampala"],
    ["le Togo", "Lomé"], ["la Mauritanie", "Nouakchott"], ["le Honduras", "Tegucigalpa"], ["le Nicaragua", "Managua"], ["le Costa Rica", "San José"], ["Haïti", "Port-au-Prince"],
    ["Oman", "Mascate"],
  ],
};

const PIEGES_CAPITALES: Tiers<Claim> = {
  1: [
    ["La capitale de l'Espagne est Barcelone.", false, "C'est Madrid ; Barcelone est la capitale de la Catalogne."],
    ["La capitale de l'Italie est Rome.", true, "Rome est aussi la ville qui entoure le Vatican."],
    ["La capitale des États-Unis est New York.", false, "C'est Washington."],
    ["La capitale du Japon est Tokyo.", true, "Kyoto l'était avant 1868."],
    ["La capitale de la Russie est Saint-Pétersbourg.", false, "C'est Moscou ; Saint-Pétersbourg l'a été de 1712 à 1918."],
  ],
  2: [
    ["La capitale de l'Australie est Sydney.", false, "C'est Canberra ; Sydney est la plus grande ville."],
    ["La capitale du Canada est Ottawa.", true, "Et non Toronto ni Montréal."],
    ["La capitale de la Turquie est Istanbul.", false, "C'est Ankara depuis 1923."],
    ["La capitale du Brésil est Rio de Janeiro.", false, "C'est Brasilia depuis 1960."],
    ["La capitale officielle de la Côte d'Ivoire est Yamoussoukro.", true, "Abidjan reste la capitale économique."],
    ["La capitale du Maroc est Casablanca.", false, "C'est Rabat ; Casablanca est la plus grande ville."],
    ["La capitale de la Suisse est Berne.", true, "Zurich et Genève sont plus peuplées."],
    ["La capitale du Nigeria est Lagos.", false, "C'est Abuja depuis 1991."],
    ["La capitale de la Nouvelle-Zélande est Wellington.", true, "Auckland est plus peuplée."],
    ["La capitale du Viêt Nam est Hô Chi Minh-Ville.", false, "C'est Hanoï ; Hô Chi Minh-Ville (ex-Saïgon) est la plus grande ville."],
  ],
  3: [
    ["La capitale de la Tanzanie est Dar es Salaam.", false, "C'est Dodoma ; Dar es Salaam reste la plus grande ville."],
    ["La capitale du Kazakhstan est Almaty.", false, "C'est Astana depuis 1997."],
    ["La capitale du Myanmar est Rangoun.", false, "C'est Naypyidaw depuis 2005."],
    ["La capitale officielle du Bénin est Porto-Novo.", true, "Cotonou est le siège du gouvernement."],
    ["La capitale du Pakistan est Karachi.", false, "C'est Islamabad, ville construite dans les années 1960."],
    ["La capitale de la Bolivie est Montevideo.", false, "Montevideo est la capitale de l'Uruguay ; la Bolivie a Sucre (constitutionnelle) et La Paz (gouvernement)."],
    ["La capitale du Kirghizistan est Bichkek.", true, "Elle s'est appelée Frounzé à l'époque soviétique."],
  ],
};

const RECORDS_GEO: Tiers<Card> = {
  1: [
    ["Plus haut sommet du monde ?", "l'Everest", ["le K2", "le Kilimandjaro", "le Mont Blanc"], "L'Everest (Himalaya) culmine à environ 8 849 m."],
    ["Plus grand océan du monde ?", "l'océan Pacifique", ["l'océan Atlantique", "l'océan Indien", "l'océan Arctique"], "Il couvre près d'un tiers de la surface du globe."],
    ["Plus grand désert chaud du monde ?", "le Sahara", ["le désert de Gobi", "le Kalahari", "l'Atacama"], "Le Sahara couvre environ 9 millions de km²."],
    ["Plus grand pays du monde par la superficie ?", "la Russie", ["le Canada", "la Chine", "les États-Unis"], "Environ 17 millions de km²."],
    ["Plus petit pays du monde ?", "le Vatican", ["Monaco", "Saint-Marin", "le Liechtenstein"], "Environ 0,44 km², enclavé dans Rome."],
    ["Continent le plus peuplé ?", "l'Asie", ["l'Afrique", "l'Europe", "l'Amérique"], "Près de 60 % de la population mondiale."],
    ["Plus haut sommet des Alpes ?", "le Mont Blanc", ["le Cervin", "le mont Rose", "l'Everest"], "Environ 4 806 m, entre la France et l'Italie."],
    ["Montagnes qui séparent la France de l'Espagne ?", "les Pyrénées", ["les Alpes", "le Jura", "les Vosges"], "Le pic d'Aneto (3 404 m) en est le point culminant."],
    ["Pays en forme de botte ?", "l'Italie", ["la Grèce", "le Chili", "le Portugal"], "La péninsule italienne."],
    ["Sur quel continent se trouve l'Égypte ?", "l'Afrique", ["l'Asie", "l'Europe", "l'Océanie"], "Le Sinaï, lui, est en Asie."],
    ["Océan qui borde la côte ouest de la France ?", "l'océan Atlantique", ["l'océan Indien", "l'océan Pacifique", "l'océan Arctique"], "La Méditerranée borde le sud-est."],
    ["Combien de continents compte-t-on habituellement en France ?", "5 (ou 6 avec l'Antarctique)", ["3", "8", "10"], "Afrique, Amérique, Asie, Europe, Océanie (+ Antarctique)."],
  ],
  2: [
    ["Pays le plus peuplé du monde depuis 2023 ?", "l'Inde", ["la Chine", "les États-Unis", "l'Indonésie"], "L'Inde a dépassé la Chine en 2023 (plus de 1,4 milliard d'habitants)."],
    ["Plus grande île du monde ?", "le Groenland", ["Madagascar", "Bornéo", "la Grande-Bretagne"], "L'Australie est considérée comme un continent."],
    ["Plus haut sommet d'Afrique ?", "le Kilimandjaro", ["le mont Kenya", "le Mont Blanc", "l'Aconcagua"], "Environ 5 895 m, en Tanzanie."],
    ["Fleuve au plus grand débit du monde ?", "l'Amazone", ["le Nil", "le Mississippi", "le Yangtsé"], "Il déverse environ 200 000 m³ d'eau par seconde."],
    ["Plus grande forêt tropicale du monde ?", "l'Amazonie", ["la forêt du bassin du Congo", "la taïga", "la forêt de Bornéo"], "Elle s'étend sur 9 pays d'Amérique du Sud."],
    ["Canal qui relie la Méditerranée à la mer Rouge ?", "le canal de Suez", ["le canal de Panama", "le canal de Corinthe", "le canal du Midi"], "Inauguré en 1869, en Égypte."],
    ["Canal qui relie l'Atlantique au Pacifique ?", "le canal de Panama", ["le canal de Suez", "le détroit de Magellan", "le canal de Kiel"], "Ouvert en 1914."],
    ["Détroit qui sépare l'Espagne du Maroc ?", "le détroit de Gibraltar", ["le Bosphore", "le pas de Calais", "le détroit de Béring"], "Environ 14 km au plus étroit."],
    ["Montagnes qui marquent la limite entre l'Europe et l'Asie ?", "l'Oural", ["le Caucase", "les Carpates", "l'Himalaya"], "En Russie."],
    ["Plus longue chaîne de montagnes continentale ?", "la cordillère des Andes", ["l'Himalaya", "les Rocheuses", "l'Oural"], "Environ 7 000 km le long de l'Amérique du Sud."],
    ["Pays le plus long et étroit d'Amérique du Sud ?", "le Chili", ["l'Argentine", "le Pérou", "la Colombie"], "Plus de 4 000 km de long pour environ 180 km de large."],
    ["Point le plus profond des océans ?", "la fosse des Mariannes", ["la fosse de Porto Rico", "le golfe du Mexique", "la mer Morte"], "Près de 11 000 m dans le Pacifique."],
    ["Plus haut sommet d'Amérique ?", "l'Aconcagua", ["le Denali", "le Chimborazo", "le Kilimandjaro"], "Environ 6 961 m, dans les Andes argentines."],
    ["Plus long fleuve d'Europe ?", "la Volga", ["le Danube", "le Rhin", "la Loire"], "Environ 3 530 km, en Russie."],
    ["Plus grand lac d'Afrique ?", "le lac Victoria", ["le lac Tanganyika", "le lac Tchad", "le lac Malawi"], "Partagé entre l'Ouganda, le Kenya et la Tanzanie."],
    ["Détroit qui sépare l'Asie de l'Amérique ?", "le détroit de Béring", ["le détroit de Gibraltar", "le Bosphore", "le détroit d'Ormuz"], "Entre la Russie et l'Alaska."],
  ],
  3: [
    ["Lac le plus profond du monde ?", "le lac Baïkal", ["le lac Tanganyika", "le lac Supérieur", "la mer Caspienne"], "Environ 1 640 m de profondeur, en Sibérie."],
    ["Plus grande étendue d'eau fermée du monde ?", "la mer Caspienne", ["le lac Supérieur", "le lac Victoria", "le lac Baïkal"], "Environ 370 000 km², entre l'Europe et l'Asie."],
    ["Détroit qui traverse Istanbul ?", "le Bosphore", ["les Dardanelles", "le détroit d'Ormuz", "le détroit de Messine"], "Il relie la mer Noire à la mer de Marmara."],
    ["Détroit stratégique entre l'Iran et la péninsule arabique ?", "le détroit d'Ormuz", ["le détroit de Bab-el-Mandeb", "le Bosphore", "le détroit de Malacca"], "Une grande part du pétrole mondial y transite."],
    ["Point le plus bas des terres émergées ?", "les rives de la mer Morte", ["la vallée de la Mort", "la dépression de Qattara", "le lac Assal"], "Environ 430 m sous le niveau de la mer."],
    ["Désert le plus aride du monde (hors pôles) ?", "l'Atacama", ["le Sahara", "le Namib", "le Gobi"], "Au Chili : certaines stations n'ont jamais enregistré de pluie."],
    ["Deuxième plus haut sommet du monde ?", "le K2", ["le Kangchenjunga", "le Lhotse", "le Makalu"], "Environ 8 611 m, entre la Chine et le Pakistan."],
    ["Pays qui compte le plus de fuseaux horaires, territoires compris ?", "la France", ["la Russie", "les États-Unis", "le Royaume-Uni"], "12 fuseaux grâce à l'outre-mer."],
    ["Plus long fleuve d'Asie ?", "le Yangtsé", ["le Mékong", "le Gange", "l'Indus"], "Environ 6 300 km, en Chine."],
    ["Plus haute chute d'eau du monde ?", "le Salto Ángel", ["les chutes Victoria", "les chutes du Niagara", "les chutes d'Iguaçu"], "Environ 979 m, au Venezuela."],
    ["Pays d'Amérique du Sud sans accès à la mer ?", "la Bolivie", ["le Pérou", "le Chili", "la Colombie"], "Elle a perdu son littoral lors de la guerre du Pacifique (1879-1884)."],
    ["Seul pays traversé à la fois par l'équateur et le tropique du Capricorne ?", "le Brésil", ["l'Australie", "l'Indonésie", "la République démocratique du Congo"], "L'équateur passe au nord, le tropique au sud, vers São Paulo."],
  ],
};

const FLEUVES: Tiers<Pair> = {
  1: [["Paris", "la Seine"], ["Londres", "la Tamise"], ["Rome", "le Tibre"], ["Le Caire", "le Nil"], ["Lyon", "le Rhône"], ["Bordeaux", "la Garonne"], ["Nantes", "la Loire"], ["Strasbourg", "le Rhin"]],
  2: [["Budapest", "le Danube"], ["Lisbonne", "le Tage"], ["New York", "l'Hudson"], ["Prague", "la Vltava"], ["Moscou", "la Moskova"], ["Bagdad", "le Tigre"], ["Berlin", "la Spree"], ["Varsovie", "la Vistule"]],
  3: [
    ["Saint-Pétersbourg", "la Neva"], ["Calcutta", "le Gange (Hooghly)"], ["Shanghai", "le Yangtsé (Huangpu)"], ["Florence", "l'Arno"], ["Séville", "le Guadalquivir"],
    ["Turin", "le Pô"], ["Bangkok", "la Chao Phraya"], ["Montréal", "le Saint-Laurent"], ["Dresde", "l'Elbe"], ["Porto", "le Douro"], ["Kyiv", "le Dniepr"],
  ],
};

const MONNAIES: Tiers<Pair> = {
  1: [["le Japon", "le yen"], ["le Royaume-Uni", "la livre sterling"], ["les États-Unis", "le dollar américain"], ["l'Allemagne", "l'euro"], ["la Suisse", "le franc suisse"], ["la Chine", "le yuan (renminbi)"]],
  2: [
    ["l'Inde", "la roupie indienne"], ["la Russie", "le rouble"], ["le Brésil", "le réal"], ["le Mexique", "le peso mexicain"], ["la Corée du Sud", "le won"],
    ["le Maroc", "le dirham"], ["le Sénégal", "le franc CFA"], ["la Suède", "la couronne suédoise"], ["la Turquie", "la livre turque"],
  ],
  3: [
    ["la Pologne", "le złoty"], ["l'Afrique du Sud", "le rand"], ["la Hongrie", "le forint"], ["la Thaïlande", "le baht"], ["Israël", "le shekel"], ["le Viêt Nam", "le dong"],
    ["la Malaisie", "le ringgit"], ["le Nigeria", "le naira"], ["la Tchéquie", "la couronne tchèque"], ["l'Arabie saoudite", "le riyal"], ["l'Ukraine", "la hryvnia"],
  ],
};

// ───────────── France ─────────────

const REGIONS: Tiers<Pair> = {
  1: [["Île-de-France", "Paris"], ["Provence-Alpes-Côte d'Azur", "Marseille"], ["Auvergne-Rhône-Alpes", "Lyon"], ["Occitanie", "Toulouse"], ["Nouvelle-Aquitaine", "Bordeaux"], ["Hauts-de-France", "Lille"], ["Bretagne", "Rennes"]],
  2: [["Grand Est", "Strasbourg"], ["Pays de la Loire", "Nantes"], ["Normandie", "Rouen"], ["Bourgogne-Franche-Comté", "Dijon"], ["Centre-Val de Loire", "Orléans"], ["Corse", "Ajaccio"]],
  3: [],
};

const PREFECTURES: Tiers<Pair> = {
  1: [],
  2: [],
  3: [
    ["le Calvados", "Caen"], ["la Marne", "Châlons-en-Champagne"], ["la Savoie", "Chambéry"], ["la Haute-Savoie", "Annecy"], ["le Var", "Toulon"],
    ["les Pyrénées-Orientales", "Perpignan"], ["la Somme", "Amiens"], ["le Puy-de-Dôme", "Clermont-Ferrand"], ["la Moselle", "Metz"], ["le Vaucluse", "Avignon"],
    ["le Gard", "Nîmes"], ["le Doubs", "Besançon"], ["la Vienne", "Poitiers"], ["l'Indre-et-Loire", "Tours"], ["la Sarthe", "Le Mans"], ["le Haut-Rhin", "Colmar"],
    ["l'Aveyron", "Rodez"], ["le Finistère", "Quimper"], ["la Charente-Maritime", "La Rochelle"],
  ],
};

const DEPARTEMENTS: Tiers<Pair> = {
  1: [["75", "Paris"], ["13", "les Bouches-du-Rhône"], ["69", "le Rhône"], ["59", "le Nord"], ["33", "la Gironde"], ["974", "La Réunion"], ["971", "la Guadeloupe"], ["972", "la Martinique"]],
  2: [
    ["06", "les Alpes-Maritimes"], ["31", "la Haute-Garonne"], ["67", "le Bas-Rhin"], ["44", "la Loire-Atlantique"], ["2A", "la Corse-du-Sud"], ["973", "la Guyane"],
    ["976", "Mayotte"], ["35", "l'Ille-et-Vilaine"], ["34", "l'Hérault"], ["92", "les Hauts-de-Seine"], ["93", "la Seine-Saint-Denis"],
  ],
  3: [
    ["38", "l'Isère"], ["62", "le Pas-de-Calais"], ["64", "les Pyrénées-Atlantiques"], ["29", "le Finistère"], ["01", "l'Ain"], ["2B", "la Haute-Corse"], ["74", "la Haute-Savoie"],
    ["83", "le Var"], ["57", "la Moselle"], ["63", "le Puy-de-Dôme"], ["21", "la Côte-d'Or"], ["45", "le Loiret"], ["76", "la Seine-Maritime"], ["14", "le Calvados"], ["84", "le Vaucluse"],
  ],
};

const FRANCE: Tiers<Card> = {
  1: [
    ["Plus haut sommet de France ?", "le Mont Blanc", ["le pic du Midi", "le Puy de Dôme", "la Meije"], "Environ 4 806 m, dans le massif du Mont-Blanc."],
    ["Plus long fleuve de France ?", "la Loire", ["la Seine", "le Rhône", "la Garonne"], "Environ 1 000 km, du mont Gerbier-de-Jonc à l'Atlantique."],
    ["Combien de régions compte la France métropolitaine depuis 2016 ?", "13", ["22", "18", "9"], "18 avec les 5 régions d'outre-mer."],
    ["Deuxième ville la plus peuplée de France ?", "Marseille", ["Lyon", "Toulouse", "Nice"], "Environ 870 000 habitants."],
    ["Plus grande île française de Méditerranée ?", "la Corse", ["l'île de Ré", "Belle-Île", "Porquerolles"], "Surnommée l'île de Beauté."],
    ["Ville surnommée la « Ville rose » ?", "Toulouse", ["Lyon", "Bordeaux", "Nice"], "Pour la couleur de ses briques."],
    ["Dans quelle région se trouve le Mont-Saint-Michel ?", "en Normandie (Manche)", ["en Bretagne (Finistère)", "en Vendée", "dans le Nord"], "La baie est à la limite de la Bretagne."],
  ],
  2: [
    ["Combien de départements compte la France ?", "101", ["95", "96", "110"], "96 en métropole et 5 en outre-mer."],
    ["Fleuve qui se jette dans la Méditerranée ?", "le Rhône", ["la Seine", "la Loire", "la Garonne"], "Par le delta de Camargue."],
    ["Volcan le plus célèbre de la chaîne des Puys ?", "le Puy de Dôme", ["le mont Gerbier-de-Jonc", "le Vésuve", "le Cantal"], "Environ 1 465 m, près de Clermont-Ferrand."],
    ["Département d'outre-mer situé en Amérique du Sud ?", "la Guyane", ["la Martinique", "La Réunion", "Mayotte"], "Le centre spatial de Kourou s'y trouve."],
    ["Océan où se trouve La Réunion ?", "l'océan Indien", ["l'océan Atlantique", "l'océan Pacifique", "la mer des Caraïbes"], "À l'est de Madagascar."],
    ["Ville surnommée la « capitale des Gaules » ?", "Lyon", ["Paris", "Reims", "Nîmes"], "Lugdunum était la grande ville de la Gaule romaine."],
    ["Ville où l'on sacrait les rois de France ?", "Reims", ["Paris", "Saint-Denis", "Orléans"], "Dans la cathédrale Notre-Dame de Reims."],
  ],
  3: [
    ["Point culminant du Massif central ?", "le puy de Sancy", ["le Puy de Dôme", "le Plomb du Cantal", "le mont Aigoual"], "Environ 1 886 m."],
    ["Sur quel plateau la Seine prend-elle sa source ?", "le plateau de Langres", ["le Morvan", "le plateau de Millevaches", "le Jura"], "À Source-Seine, en Côte-d'Or."],
    ["Plus grande commune de France métropolitaine par la superficie ?", "Arles", ["Marseille", "Paris", "Toulouse"], "Environ 759 km², grâce à la Camargue."],
    ["Collectivité d'outre-mer dont le chef-lieu est Papeete ?", "la Polynésie française", ["la Nouvelle-Calédonie", "Wallis-et-Futuna", "Saint-Pierre-et-Miquelon"], "Sur l'île de Tahiti."],
    ["Chef-lieu de la Nouvelle-Calédonie ?", "Nouméa", ["Papeete", "Mamoudzou", "Cayenne"], "Dans le Pacifique Sud."],
    ["Chef-lieu de Mayotte ?", "Mamoudzou", ["Saint-Denis", "Cayenne", "Fort-de-France"], "Dans l'archipel des Comores."],
    ["Plus grand lac naturel entièrement français ?", "le lac du Bourget", ["le lac d'Annecy", "le Léman", "le lac de Serre-Ponçon"], "Le Léman est partagé avec la Suisse ; Serre-Ponçon est artificiel."],
  ],
};

// ───────────── Histoire ─────────────

const DATES: Tiers<Pair> = {
  1: [
    ["la prise de la Bastille", "1789"], ["la chute du mur de Berlin", "1989"], ["les premiers pas de l'homme sur la Lune", "1969"], ["l'arrivée de Christophe Colomb en Amérique", "1492"],
    ["le début de la Première Guerre mondiale", "1914"], ["l'armistice de la Première Guerre mondiale", "1918"], ["le début de la Seconde Guerre mondiale", "1939"],
    ["le débarquement de Normandie", "1944"], ["les attentats du 11 Septembre aux États-Unis", "2001"], ["la mise en circulation des pièces et billets en euros", "2002"],
  ],
  2: [
    ["le couronnement de Charlemagne comme empereur", "800"], ["la bataille d'Hastings", "1066"], ["la création de l'ONU", "1945"], ["la révolution d'Octobre en Russie", "1917"],
    ["la déclaration d'indépendance des États-Unis", "1776"], ["la bataille de Waterloo", "1815"], ["le sacre de Napoléon Ier", "1804"], ["l'abolition définitive de l'esclavage en France", "1848"],
    ["la prise de Constantinople par les Ottomans", "1453"], ["la bataille de Marignan", "1515"], ["la naissance de la Ve République", "1958"], ["Mai 68", "1968"],
    ["l'indépendance de l'Algérie", "1962"], ["la mort de Jeanne d'Arc", "1431"], ["le krach boursier de Wall Street", "1929"], ["la loi de séparation des Églises et de l'État", "1905"],
    ["l'abolition de la peine de mort en France", "1981"], ["l'élection de Nelson Mandela", "1994"], ["la réunification de l'Allemagne", "1990"], ["la fin de l'URSS", "1991"],
    ["la construction du mur de Berlin", "1961"], ["l'assassinat de John F. Kennedy", "1963"], ["le naufrage du Titanic", "1912"], ["le droit de vote des femmes en France", "1944"],
  ],
  3: [
    ["la chute de l'Empire romain d'Occident", "476"], ["l'édit de Nantes", "1598"], ["la mort de Louis XIV", "1715"], ["la Commune de Paris", "1871"],
    ["le lancement de Spoutnik, premier satellite artificiel", "1957"], ["le premier vol motorisé des frères Wright", "1903"], ["l'assassinat de Jules César", "44 av. J.-C."],
    ["la bataille d'Alésia", "52 av. J.-C."], ["la bataille de Poitiers (Charles Martel)", "732"], ["la révocation de l'édit de Nantes", "1685"], ["la révolution de Juillet", "1830"],
    ["l'arrivée de la peste noire en Europe", "1347"], ["la découverte du vaccin contre la rage", "1885"], ["le traité de Verdun, partage de l'empire carolingien", "843"],
    ["la bataille de Bouvines", "1214"], ["le début de la guerre de Cent Ans", "1337"], ["la proclamation de la IIIe République", "1870"], ["l'arrestation du capitaine Dreyfus", "1894"],
    ["le traité de Versailles", "1919"], ["la prise de Jérusalem par les croisés", "1099"], ["la découverte de la tombe de Toutânkhamon", "1922"], ["le Front populaire", "1936"],
    ["l'appel du 18 Juin du général de Gaulle", "1940"], ["la Déclaration universelle des droits de l'homme", "1948"], ["le massacre de la Saint-Barthélemy", "1572"],
  ],
};

const PERSONNAGES: Tiers<Pair> = {
  1: [
    ["le premier président de la Ve République", "Charles de Gaulle"], ["l'empereur sacré à Notre-Dame en 1804", "Napoléon Ier"], ["le « Roi-Soleil »", "Louis XIV"],
    ["la « Pucelle d'Orléans »", "Jeanne d'Arc"], ["le leader de la lutte non violente pour l'indépendance de l'Inde", "Gandhi"],
    ["le pasteur auteur du discours « I have a dream »", "Martin Luther King"], ["le premier président noir de l'Afrique du Sud", "Nelson Mandela"],
    ["le roi de France guillotiné en 1793", "Louis XVI"], ["la reine guillotinée en 1793", "Marie-Antoinette"],
  ],
  2: [
    ["le premier empereur romain", "Auguste"], ["le pharaon dont la tombe intacte a été découverte en 1922", "Toutânkhamon"], ["le navigateur qui a dirigé le premier tour du monde (1519)", "Magellan"],
    ["le Premier ministre britannique pendant la Seconde Guerre mondiale", "Winston Churchill"], ["le chef de l'URSS pendant la Seconde Guerre mondiale", "Staline"],
    ["le roi franc baptisé à Reims vers 496", "Clovis"], ["le roi assassiné par Ravaillac en 1610", "Henri IV"], ["le conquérant macédonien mort en 323 av. J.-C.", "Alexandre le Grand"],
    ["la reine d'Égypte alliée de César puis de Marc Antoine", "Cléopâtre"], ["le chef gaulois vaincu à Alésia", "Vercingétorix"], ["la ministre qui a porté la loi sur l'IVG en 1975", "Simone Veil"],
    ["le président américain qui a aboli l'esclavage pendant la guerre de Sécession", "Abraham Lincoln"], ["la reine du Royaume-Uni de 1952 à 2022", "Élisabeth II"],
  ],
  3: [
    ["le ministre de Louis XIV qui a développé le commerce et les manufactures", "Colbert"], ["le cardinal, principal ministre de Louis XIII", "Richelieu"],
    ["l'« Incorruptible », figure de la Terreur", "Robespierre"], ["le navigateur portugais arrivé en Inde par la mer en 1498", "Vasco de Gama"],
    ["le conquistador qui a renversé l'Empire aztèque", "Hernán Cortés"], ["le conquistador qui a renversé l'Empire inca", "Francisco Pizarro"],
    ["le général carthaginois qui a franchi les Alpes avec des éléphants", "Hannibal"], ["l'écrivain auteur de « J'accuse… ! » (1898)", "Émile Zola"],
    ["le président du Conseil surnommé « le Tigre », artisan de la victoire de 1918", "Georges Clemenceau"], ["l'unificateur de la Résistance, mort en 1943", "Jean Moulin"],
    ["le dirigeant qui proclame la République populaire de Chine en 1949", "Mao Zedong"], ["le dirigeant soviétique de la perestroïka", "Mikhaïl Gorbatchev"],
  ],
};

const HISTOIRE_CLAIMS: Tiers<Claim> = {
  1: [
    ["La Révolution française a commencé en 1789.", true, "Prise de la Bastille le 14 juillet 1789."],
    ["Jeanne d'Arc a vécu au XVIIIe siècle.", false, "Au XVe siècle (1412-1431)."],
    ["La Seconde Guerre mondiale s'est terminée en 1945.", true, "Capitulation allemande en mai, japonaise en septembre."],
    ["Le mur de Berlin séparait Berlin-Est et Berlin-Ouest.", true, "De 1961 à 1989."],
  ],
  2: [
    ["Napoléon Ier est mort en exil à Sainte-Hélène.", true, "En 1821, dans l'Atlantique Sud."],
    ["Les Vikings venaient de Scandinavie.", true, "Danemark, Norvège, Suède actuels."],
    ["Christophe Colomb cherchait une nouvelle route vers les Indes.", true, "Il pensait avoir atteint l'Asie."],
    ["La guerre de Cent Ans a duré exactement cent ans.", false, "De 1337 à 1453, soit 116 ans."],
    ["La bataille de Waterloo a eu lieu en France.", false, "En Belgique, au sud de Bruxelles."],
  ],
  3: [
    ["Charlemagne a été couronné empereur à Rome.", true, "Par le pape Léon III, le 25 décembre 800."],
    ["Louis XIV a régné plus de 70 ans.", true, "72 ans (1643-1715), record en Europe."],
    ["L'Empire byzantin a pris fin en 1453.", true, "Avec la prise de Constantinople par les Ottomans."],
    ["Le traité de Versailles a mis fin à la Seconde Guerre mondiale.", false, "Il clôt la Première Guerre mondiale (1919)."],
    ["Le Front populaire a instauré les premiers congés payés en France.", true, "En 1936 : deux semaines par an."],
  ],
};

// ───────────── Arts ─────────────

const OEUVRES_ART: Tiers<Pair> = {
  1: [
    ["La Joconde", "Léonard de Vinci"], ["La Nuit étoilée", "Vincent van Gogh"], ["Les Tournesols", "Vincent van Gogh"], ["Guernica", "Pablo Picasso"], ["Le Cri", "Edvard Munch"],
    ["Le Penseur", "Auguste Rodin"], ["La Liberté guidant le peuple", "Eugène Delacroix"], ["Les Nymphéas", "Claude Monet"], ["La Création d'Adam (chapelle Sixtine)", "Michel-Ange"],
  ],
  2: [
    ["La Cène", "Léonard de Vinci"], ["Les Demoiselles d'Avignon", "Pablo Picasso"], ["La Persistance de la mémoire (les montres molles)", "Salvador Dalí"],
    ["La Jeune Fille à la perle", "Johannes Vermeer"], ["Impression, soleil levant", "Claude Monet"], ["La Naissance de Vénus", "Sandro Botticelli"], ["le David de marbre de Florence", "Michel-Ange"],
    ["L'École d'Athènes", "Raphaël"], ["Le Radeau de La Méduse", "Théodore Géricault"], ["Le Déjeuner sur l'herbe", "Édouard Manet"], ["La Grande Vague de Kanagawa", "Hokusai"],
    ["Campbell's Soup Cans", "Andy Warhol"], ["La Trahison des images (« Ceci n'est pas une pipe »)", "René Magritte"], ["Le Sacre de Napoléon", "Jacques-Louis David"],
    ["Bal du moulin de la Galette", "Auguste Renoir"],
  ],
  3: [
    ["Les Glaneuses", "Jean-François Millet"], ["La Ronde de nuit", "Rembrandt"], ["Les Ménines", "Diego Vélasquez"], ["Le Tres de Mayo", "Francisco de Goya"], ["American Gothic", "Grant Wood"],
    ["Les Joueurs de cartes", "Paul Cézanne"], ["Le Jardin des délices", "Jérôme Bosch"], ["Les Époux Arnolfini", "Jan van Eyck"], ["Un dimanche après-midi à l'île de la Grande Jatte", "Georges Seurat"],
    ["Composition en rouge, jaune et bleu", "Piet Mondrian"], ["Fontaine (l'urinoir)", "Marcel Duchamp"], ["Nighthawks", "Edward Hopper"], ["Le Baiser (tableau doré, 1908)", "Gustav Klimt"],
    ["Le Fils de l'homme (la pomme devant le visage)", "René Magritte"], ["Le Bain turc", "Jean-Auguste-Dominique Ingres"], ["Le Serment des Horaces", "Jacques-Louis David"],
    ["L'Angélus", "Jean-François Millet"], ["Olympia", "Édouard Manet"],
  ],
};

const MONUMENTS: Tiers<Pair> = {
  1: [["la tour Eiffel", "Paris"], ["le Colisée", "Rome"], ["la statue de la Liberté", "New York"], ["Big Ben", "Londres"], ["la tour penchée", "Pise"], ["le Christ Rédempteur", "Rio de Janeiro"]],
  2: [
    ["le Taj Mahal", "Agra"], ["le Parthénon", "Athènes"], ["la Sagrada Família", "Barcelone"], ["le Kremlin", "Moscou"], ["l'Opéra aux voiles blanches", "Sydney"], ["le Burj Khalifa", "Dubaï"],
    ["la Cité interdite", "Pékin"], ["la porte de Brandebourg", "Berlin"], ["la basilique Saint-Pierre", "le Vatican"], ["le Golden Gate Bridge", "San Francisco"], ["l'Alhambra", "Grenade"],
  ],
  3: [
    ["Sainte-Sophie", "Istanbul"], ["l'Atomium", "Bruxelles"], ["la Petite Sirène", "Copenhague"], ["le pont Charles", "Prague"], ["la Giralda", "Séville"],
    ["le dôme de Brunelleschi", "Florence"], ["le palais des Doges", "Venise"], ["la tour de Belém", "Lisbonne"], ["la cathédrale Saint-Basile", "Moscou"],
  ],
};

const ARCHITECTES: Tiers<Pair> = {
  1: [],
  2: [["la tour Eiffel", "Gustave Eiffel"], ["la Sagrada Família", "Antoni Gaudí"], ["l'Opéra Garnier", "Charles Garnier"], ["les jardins de Versailles", "André Le Nôtre"]],
  3: [
    ["la pyramide du Louvre", "Ieoh Ming Pei"], ["le Centre Pompidou", "Renzo Piano et Richard Rogers"], ["le musée Guggenheim de Bilbao", "Frank Gehry"], ["la Cité radieuse de Marseille", "Le Corbusier"],
    ["la coupole de la cathédrale de Florence", "Filippo Brunelleschi"], ["la galerie des Glaces de Versailles", "Jules Hardouin-Mansart"], ["le Louvre Abou Dabi", "Jean Nouvel"],
  ],
};

const ARTS_CARDS: Tiers<Card> = {
  1: [
    ["Musée parisien où est exposée La Joconde ?", "le Louvre", ["le musée d'Orsay", "le Centre Pompidou", "le Grand Palais"], "Le musée le plus visité du monde."],
    ["Peintre qui s'est coupé une partie de l'oreille ?", "Vincent van Gogh", ["Paul Gauguin", "Claude Monet", "Pablo Picasso"], "En 1888, à Arles."],
    ["Les trois couleurs primaires du peintre ?", "rouge, jaune, bleu", ["vert, orange, violet", "noir, blanc, gris", "rouge, vert, noir"], "En les mélangeant, on obtient les autres couleurs."],
  ],
  2: [
    ["Courant de Monet, Renoir et Degas ?", "l'impressionnisme", ["le cubisme", "le surréalisme", "le romantisme"], "Le nom vient d'Impression, soleil levant (1872)."],
    ["Courant de Picasso et Braque, avec des formes géométriques ?", "le cubisme", ["l'impressionnisme", "le pop art", "le fauvisme"], "Début du XXe siècle."],
    ["Courant de Dalí et Magritte, inspiré des rêves ?", "le surréalisme", ["le réalisme", "le baroque", "le cubisme"], "Lancé par André Breton en 1924."],
    ["Musée parisien installé dans une ancienne gare ?", "le musée d'Orsay", ["le Louvre", "le Petit Palais", "le musée Rodin"], "Spécialisé dans l'art de 1848 à 1914."],
    ["Mouvement artistique d'Andy Warhol ?", "le pop art", ["le cubisme", "l'art nouveau", "le fauvisme"], "Années 1960, inspiré de la publicité."],
    ["Période de la redécouverte de l'Antiquité en Italie (XVe-XVIe siècles) ?", "la Renaissance", ["le Moyen Âge", "les Lumières", "le baroque"], "Léonard de Vinci, Michel-Ange, Raphaël."],
    ["Style des cathédrales de Chartres et de Notre-Dame de Paris ?", "le gothique", ["le roman", "le baroque", "le classique"], "Arcs brisés, croisées d'ogives et grands vitraux."],
  ],
  3: [
    ["Courant de Matisse et Derain, aux couleurs pures et violentes ?", "le fauvisme", ["le cubisme", "l'expressionnisme", "le pointillisme"], "Révélé au Salon d'automne de 1905."],
    ["Technique de peinture sur un enduit encore frais ?", "la fresque", ["l'aquarelle", "la gouache", "le pastel"], "Utilisée par Michel-Ange dans la chapelle Sixtine."],
    ["Technique de Seurat, faite de petites touches de couleurs pures ?", "le pointillisme", ["le sfumato", "le clair-obscur", "le fauvisme"], "L'œil mélange les couleurs à distance."],
    ["Pionnier de l'art abstrait, auteur de « Du spirituel dans l'art » ?", "Vassily Kandinsky", ["Paul Klee", "Kazimir Malevitch", "Piet Mondrian"], "Ses premières œuvres abstraites datent des années 1910."],
    ["Sculpteur de « La Petite Danseuse de quatorze ans » ?", "Edgar Degas", ["Auguste Rodin", "Camille Claudel", "Aristide Maillol"], "Présentée en cire en 1881, avec un vrai tutu."],
    ["Musée de Madrid où sont exposées Les Ménines ?", "le Prado", ["le musée Reina Sofía", "le musée Thyssen", "le Louvre"], "Guernica, lui, est au musée Reina Sofía."],
    ["Technique de Léonard de Vinci aux contours fondus, comme dans La Joconde ?", "le sfumato", ["le pointillisme", "la fresque", "le ténébrisme"], "De l'italien « fumo », la fumée."],
  ],
};

// ───────────── Littérature ─────────────

const LIVRES: Tiers<Pair> = {
  1: [
    ["Les Misérables", "Victor Hugo"], ["Notre-Dame de Paris", "Victor Hugo"], ["Le Petit Prince", "Antoine de Saint-Exupéry"], ["Les Fables", "Jean de La Fontaine"], ["Harry Potter", "J. K. Rowling"],
    ["Le Seigneur des anneaux", "J. R. R. Tolkien"], ["Roméo et Juliette", "William Shakespeare"], ["Les Trois Mousquetaires", "Alexandre Dumas"], ["Vingt Mille Lieues sous les mers", "Jules Verne"],
    ["Le Tour du monde en quatre-vingts jours", "Jules Verne"], ["Le Petit Nicolas", "René Goscinny"], ["Les Aventures de Tintin", "Hergé"], ["Les Contes de ma mère l'Oye", "Charles Perrault"],
    ["Alice au pays des merveilles", "Lewis Carroll"],
  ],
  2: [
    ["L'Étranger", "Albert Camus"], ["La Peste", "Albert Camus"], ["Madame Bovary", "Gustave Flaubert"], ["Germinal", "Émile Zola"], ["Le Père Goriot", "Honoré de Balzac"],
    ["Les Fleurs du mal", "Charles Baudelaire"], ["Candide", "Voltaire"], ["Le Rouge et le Noir", "Stendhal"], ["Le Comte de Monte-Cristo", "Alexandre Dumas"], ["Bel-Ami", "Guy de Maupassant"],
    ["Tartuffe", "Molière"], ["L'Avare", "Molière"], ["Le Cid", "Pierre Corneille"], ["Cyrano de Bergerac", "Edmond Rostand"], ["Hamlet", "William Shakespeare"],
    ["Don Quichotte", "Miguel de Cervantes"], ["1984", "George Orwell"], ["La Ferme des animaux", "George Orwell"], ["L'Odyssée", "Homère"], ["Frankenstein", "Mary Shelley"],
    ["Dracula", "Bram Stoker"], ["Les Aventures de Tom Sawyer", "Mark Twain"],
  ],
  3: [
    ["À la recherche du temps perdu", "Marcel Proust"], ["Phèdre", "Jean Racine"], ["Guerre et Paix", "Léon Tolstoï"], ["Crime et Châtiment", "Fiodor Dostoïevski"], ["La Divine Comédie", "Dante"],
    ["Orgueil et Préjugés", "Jane Austen"], ["Le Vieil Homme et la Mer", "Ernest Hemingway"], ["Cent ans de solitude", "Gabriel García Márquez"], ["Le Meilleur des mondes", "Aldous Huxley"],
    ["Fahrenheit 451", "Ray Bradbury"], ["L'Alchimiste", "Paulo Coelho"], ["En attendant Godot", "Samuel Beckett"], ["Rhinocéros", "Eugène Ionesco"], ["Les Liaisons dangereuses", "Choderlos de Laclos"],
    ["Voyage au bout de la nuit", "Louis-Ferdinand Céline"], ["La Princesse de Clèves", "Madame de La Fayette"], ["Gargantua", "François Rabelais"], ["Les Essais", "Michel de Montaigne"],
    ["Ulysse (1922)", "James Joyce"], ["La Métamorphose", "Franz Kafka"], ["Les Raisins de la colère", "John Steinbeck"],
  ],
};

const PERSONNAGES_LIVRES: Tiers<Pair> = {
  1: [
    ["Jean Valjean", "Les Misérables"], ["Quasimodo", "Notre-Dame de Paris"], ["d'Artagnan", "Les Trois Mousquetaires"], ["Sherlock Holmes", "les romans d'Arthur Conan Doyle"],
    ["Frodon Sacquet", "Le Seigneur des anneaux"], ["Phileas Fogg", "Le Tour du monde en quatre-vingts jours"], ["le capitaine Nemo", "Vingt Mille Lieues sous les mers"],
  ],
  2: [
    ["Meursault", "L'Étranger"], ["Emma Bovary", "Madame Bovary"], ["Edmond Dantès", "Le Comte de Monte-Cristo"], ["Harpagon", "L'Avare"], ["Rodrigue et Chimène", "Le Cid"],
    ["Big Brother", "1984"], ["Julien Sorel", "Le Rouge et le Noir"], ["Gavroche", "Les Misérables"],
  ],
  3: [
    ["Rastignac", "Le Père Goriot"], ["Pangloss", "Candide"], ["Étienne Lantier", "Germinal"], ["Bardamu", "Voyage au bout de la nuit"], ["Raskolnikov", "Crime et Châtiment"],
    ["Elizabeth Bennet", "Orgueil et Préjugés"], ["Gregor Samsa", "La Métamorphose"], ["Vladimir et Estragon", "En attendant Godot"], ["la marquise de Merteuil", "Les Liaisons dangereuses"],
  ],
};

const LITTERATURE_CLAIMS: Tiers<Claim> = {
  1: [
    ["Le Petit Prince a été écrit par un aviateur.", true, "Antoine de Saint-Exupéry était pilote."],
    ["Shakespeare était un dramaturge espagnol.", false, "Il était anglais (1564-1616)."],
    ["Jules Verne est célèbre pour ses romans d'aventures et d'anticipation.", true, "Les Voyages extraordinaires."],
  ],
  2: [
    ["Molière est le nom de scène de Jean-Baptiste Poquelin.", true, "Le français est parfois appelé « la langue de Molière »."],
    ["Victor Hugo a écrit Les Fleurs du mal.", false, "C'est Charles Baudelaire (1857)."],
    ["Le prix Goncourt récompense chaque année un roman en langue française.", true, "Créé en 1903."],
    ["Les Fables de La Fontaine sont écrites en prose.", false, "Elles sont en vers."],
  ],
  3: [
    ["Victor Hugo a vécu en exil à Guernesey.", true, "Opposé à Napoléon III, il y reste de 1855 à 1870."],
    ["Albert Camus a reçu le prix Nobel de littérature.", true, "En 1957, à 44 ans."],
    ["Balzac a réuni ses romans sous le titre La Comédie humaine.", true, "Plus de 90 œuvres où reviennent les mêmes personnages."],
    ["Stendhal est le pseudonyme d'Henri Beyle.", true, "Il a publié Le Rouge et le Noir en 1830."],
    ["Madame Bovary a valu un procès à Flaubert.", true, "Pour « outrage à la morale publique » en 1857 ; il est acquitté."],
  ],
};

// ───────────── Musique ─────────────

const CLASSIQUE: Tiers<Pair> = {
  1: [["Les Quatre Saisons", "Antonio Vivaldi"], ["l'« Hymne à la joie » (Symphonie n° 9)", "Ludwig van Beethoven"], ["La Lettre à Élise", "Ludwig van Beethoven"], ["La Marseillaise", "Rouget de Lisle"], ["La Flûte enchantée", "Wolfgang Amadeus Mozart"]],
  2: [
    ["Les Noces de Figaro", "Wolfgang Amadeus Mozart"], ["Le Boléro", "Maurice Ravel"], ["Carmen", "Georges Bizet"], ["Le Lac des cygnes", "Piotr Ilitch Tchaïkovski"],
    ["Casse-Noisette", "Piotr Ilitch Tchaïkovski"], ["Clair de lune", "Claude Debussy"], ["Toccata et fugue en ré mineur", "Jean-Sébastien Bach"], ["Le Beau Danube bleu", "Johann Strauss fils"],
    ["Pierre et le Loup", "Sergueï Prokofiev"], ["Le Carnaval des animaux", "Camille Saint-Saëns"],
  ],
  3: [
    ["La Traviata", "Giuseppe Verdi"], ["La Walkyrie", "Richard Wagner"], ["Le Sacre du printemps", "Igor Stravinsky"], ["Les Gymnopédies", "Erik Satie"], ["Rhapsody in Blue", "George Gershwin"],
    ["Les Planètes", "Gustav Holst"], ["la Polonaise « héroïque »", "Frédéric Chopin"], ["la Symphonie du Nouveau Monde", "Antonín Dvořák"], ["Le Messie (« Alléluia »)", "Georg Friedrich Haendel"],
    ["Madame Butterfly", "Giacomo Puccini"], ["la Symphonie fantastique", "Hector Berlioz"], ["Les Contes d'Hoffmann", "Jacques Offenbach"],
  ],
};

const CHANSONS: Tiers<Pair> = {
  1: [
    ["Thriller", "Michael Jackson"], ["Imagine", "John Lennon"], ["Bohemian Rhapsody", "Queen"], ["La Vie en rose", "Édith Piaf"], ["Shape of You", "Ed Sheeran"],
    ["Alors on danse", "Stromae"], ["Get Lucky", "Daft Punk"], ["Djadja", "Aya Nakamura"], ["Hey Jude", "The Beatles"],
  ],
  2: [
    ["Ne me quitte pas", "Jacques Brel"], ["Comme d'habitude", "Claude François"], ["La Bohème", "Charles Aznavour"], ["Les Champs-Élysées", "Joe Dassin"], ["Smells Like Teen Spirit", "Nirvana"],
    ["(I Can't Get No) Satisfaction", "The Rolling Stones"], ["Rolling in the Deep", "Adele"], ["Hotel California", "Eagles"], ["Purple Rain", "Prince"], ["L'Aventurier", "Indochine"],
    ["Je te promets", "Johnny Hallyday"], ["Les Lacs du Connemara", "Michel Sardou"],
  ],
  3: [
    ["Stairway to Heaven", "Led Zeppelin"], ["Like a Rolling Stone", "Bob Dylan"], ["Respect", "Aretha Franklin"], ["Le Déserteur", "Boris Vian"], ["La Javanaise", "Serge Gainsbourg"],
    ["Les Copains d'abord", "Georges Brassens"], ["Mistral gagnant", "Renaud"], ["Born to Run", "Bruce Springsteen"], ["Heroes", "David Bowie"], ["What a Wonderful World", "Louis Armstrong"],
    ["Le Sud", "Nino Ferrer"],
  ],
};

const MUSIQUE_CARDS: Tiers<Card> = {
  1: [
    ["Combien de cordes a une guitare classique ?", "6", ["4", "5", "12"], "Mi, la, ré, sol, si, mi."],
    ["Combien de cordes a un violon ?", "4", ["3", "5", "6"], "Sol, ré, la, mi."],
    ["Combien de notes dans la gamme de do majeur (sans répéter le do) ?", "7", ["5", "8", "12"], "Do, ré, mi, fa, sol, la, si."],
    ["Instrument de la famille des cuivres ?", "la trompette", ["la clarinette", "le violoncelle", "la harpe"], "Comme le trombone et le cor."],
    ["Fête de la musique en France : quelle date ?", "le 21 juin", ["le 14 juillet", "le 1er mai", "le 21 mars"], "Créée en 1982, jour du solstice d'été."],
    ["Style musical né en Jamaïque, rendu célèbre par Bob Marley ?", "le reggae", ["le blues", "la salsa", "le jazz"], "Années 1960-1970."],
  ],
  2: [
    ["Combien de touches a un piano standard ?", "88", ["64", "76", "100"], "52 blanches et 36 noires."],
    ["Instrument à vent de la famille des bois, malgré son métal ?", "le saxophone", ["la trompette", "le tuba", "le cor"], "Il a une anche, comme la clarinette."],
    ["Compositeur devenu sourd, auteur de 9 symphonies ?", "Ludwig van Beethoven", ["Mozart", "Bach", "Chopin"], "La 9e date de 1824."],
    ["Enfant prodige qui composait dès 5 ans, né à Salzbourg ?", "Wolfgang Amadeus Mozart", ["Beethoven", "Vivaldi", "Haydn"], "1756-1791."],
    ["Style musical né à La Nouvelle-Orléans au début du XXe siècle ?", "le jazz", ["le rap", "le reggae", "le rock"], "Louis Armstrong en est une figure."],
    ["Combien de lignes compte une portée musicale ?", "5", ["4", "6", "7"], "Les notes se placent sur les lignes et dans les interlignes."],
    ["Opéra où l'on chante « L'amour est un oiseau rebelle » ?", "Carmen", ["La Traviata", "La Flûte enchantée", "Aida"], "De Georges Bizet (1875)."],
  ],
  3: [
    ["Terme italien qui signifie « très lent » ?", "largo", ["presto", "allegro", "forte"], "Presto signifie très rapide."],
    ["Formation de deux violons, un alto et un violoncelle ?", "le quatuor à cordes", ["le trio", "le quintette", "l'orchestre de chambre"], "Haydn en a fixé le modèle."],
    ["Combien de demi-tons dans une octave ?", "12", ["7", "8", "10"], "Les 7 touches blanches et les 5 noires du piano."],
    ["Nuance qui signifie « très fort » ?", "fortissimo (ff)", ["pianissimo (pp)", "mezzo forte (mf)", "crescendo"], "Pianissimo signifie très doux."],
    ["Compositeur polonais surnommé « le poète du piano » ?", "Frédéric Chopin", ["Franz Liszt", "Robert Schumann", "Sergueï Rachmaninov"], "Il a vécu à Paris de 1831 à sa mort en 1849."],
    ["Instrument de Django Reinhardt, roi du jazz manouche ?", "la guitare", ["le violon", "le piano", "la contrebasse"], "Il jouait avec seulement deux doigts valides à la main gauche."],
    ["Festival mythique de 1969, près de New York ?", "Woodstock", ["Coachella", "Glastonbury", "les Vieilles Charrues"], "Jimi Hendrix y a joué l'hymne américain à la guitare."],
  ],
};

// ───────────── Cinéma ─────────────

const FILMS: Tiers<Pair> = {
  1: [
    ["Titanic", "James Cameron"], ["Avatar", "James Cameron"], ["Jurassic Park", "Steven Spielberg"], ["E.T. l'extra-terrestre", "Steven Spielberg"], ["Star Wars (1977)", "George Lucas"],
    ["Intouchables", "Olivier Nakache et Éric Toledano"], ["Bienvenue chez les Ch'tis", "Dany Boon"], ["Les Visiteurs", "Jean-Marie Poiré"], ["Retour vers le futur", "Robert Zemeckis"],
    ["Le Seigneur des anneaux (trilogie)", "Peter Jackson"],
  ],
  2: [
    ["Les Dents de la mer", "Steven Spielberg"], ["Pulp Fiction", "Quentin Tarantino"], ["Kill Bill", "Quentin Tarantino"], ["Le Parrain", "Francis Ford Coppola"], ["Psychose", "Alfred Hitchcock"],
    ["Inception", "Christopher Nolan"], ["Interstellar", "Christopher Nolan"], ["Oppenheimer", "Christopher Nolan"], ["Le Fabuleux Destin d'Amélie Poulain", "Jean-Pierre Jeunet"],
    ["Les Temps modernes", "Charlie Chaplin"], ["Forrest Gump", "Robert Zemeckis"], ["Le Voyage de Chihiro", "Hayao Miyazaki"], ["Mon voisin Totoro", "Hayao Miyazaki"],
    ["Gladiator", "Ridley Scott"], ["Alien", "Ridley Scott"], ["Barbie (2023)", "Greta Gerwig"], ["Le Grand Bleu", "Luc Besson"], ["La Haine", "Mathieu Kassovitz"],
  ],
  3: [
    ["Le Voyage dans la Lune (1902)", "Georges Méliès"], ["2001 : l'Odyssée de l'espace", "Stanley Kubrick"], ["Shining", "Stanley Kubrick"], ["Parasite", "Bong Joon-ho"],
    ["Les Quatre Cents Coups", "François Truffaut"], ["À bout de souffle", "Jean-Luc Godard"], ["Taxi Driver", "Martin Scorsese"], ["Citizen Kane", "Orson Welles"],
    ["Metropolis (1927)", "Fritz Lang"], ["La Grande Illusion", "Jean Renoir"], ["Les Enfants du paradis", "Marcel Carné"], ["Le Septième Sceau", "Ingmar Bergman"],
    ["La dolce vita", "Federico Fellini"], ["Anatomie d'une chute", "Justine Triet"],
  ],
};

const CINEMA_CARDS: Tiers<Card> = {
  1: [
    ["Studio créateur de Mickey Mouse ?", "Disney", ["Pixar", "Warner Bros.", "DreamWorks"], "Mickey apparaît en 1928."],
    ["Acteur qui joue Jack dans Titanic ?", "Leonardo DiCaprio", ["Brad Pitt", "Tom Cruise", "Johnny Depp"], "Face à Kate Winslet."],
    ["Personnage de cinéma qui dit « Je suis ton père » ?", "Dark Vador", ["Yoda", "Obi-Wan Kenobi", "Han Solo"], "Dans L'Empire contre-attaque (1980)."],
    ["Quartier de Los Angeles symbole du cinéma américain ?", "Hollywood", ["Broadway", "Manhattan", "Beverly Hills"], "Les grands studios s'y sont installés dans les années 1910."],
  ],
  2: [
    ["Récompense suprême du Festival de Cannes ?", "la Palme d'or", ["l'Ours d'or", "le Lion d'or", "l'Oscar"], "L'Ours d'or est à Berlin, le Lion d'or à Venise."],
    ["Récompenses annuelles du cinéma français ?", "les César", ["les Oscars", "les Molières", "les Victoires"], "Créés en 1976 ; les Molières récompensent le théâtre."],
    ["Inventeurs du cinématographe en 1895 ?", "les frères Lumière", ["les frères Wright", "les frères Pathé", "Georges Méliès"], "Première projection publique à Paris, le 28 décembre 1895."],
    ["Premier long métrage entièrement en images de synthèse (1995) ?", "Toy Story", ["Shrek", "Le Roi lion", "Cars"], "Produit par Pixar."],
    ["Nombre d'images par seconde au cinéma traditionnel ?", "24", ["12", "30", "60"], "Standard depuis l'arrivée du parlant."],
  ],
  3: [
    ["Récompense suprême de la Mostra de Venise ?", "le Lion d'or", ["la Palme d'or", "l'Ours d'or", "la Coquille d'or"], "La Mostra (1932) est le plus ancien grand festival."],
    ["Mouvement de Truffaut et Godard à la fin des années 1950 ?", "la Nouvelle Vague", ["le néoréalisme", "le réalisme poétique", "le Dogme95"], "Tournages légers, en décors réels."],
    ["Premier long métrage parlant (1927) ?", "Le Chanteur de jazz", ["Les Lumières de la ville", "Metropolis", "Autant en emporte le vent"], "Avec Al Jolson."],
    ["Réalisatrice de « Titane », Palme d'or 2021 ?", "Julia Ducournau", ["Justine Triet", "Céline Sciamma", "Agnès Varda"], "Deuxième femme Palme d'or, après Jane Campion."],
    ["Courant italien d'après-guerre (Rossellini, De Sica) ?", "le néoréalisme", ["la Nouvelle Vague", "l'expressionnisme", "le western spaghetti"], "Tournages dans la rue, acteurs souvent amateurs."],
    ["Film français muet, Oscar du meilleur film en 2012 ?", "The Artist", ["Intouchables", "Amour", "La Môme"], "De Michel Hazanavicius, avec Jean Dujardin."],
  ],
};

// ───────────── Sport ─────────────

const SPORT_CARDS: Tiers<Card> = {
  1: [
    ["Combien de joueurs sur le terrain dans une équipe de football ?", "11", ["9", "10", "15"], "Gardien compris."],
    ["Combien de joueurs par équipe sur un terrain de basket-ball ?", "5", ["6", "7", "4"], "Plus les remplaçants sur le banc."],
    ["Combien d'anneaux sur le drapeau olympique ?", "5", ["4", "6", "7"], "Ils symbolisent l'union des continents."],
    ["Tous les combien d'années ont lieu les Jeux olympiques d'été ?", "4 ans", ["2 ans", "3 ans", "5 ans"], "Une olympiade."],
    ["Combien de cases sur un échiquier ?", "64", ["36", "49", "100"], "8 × 8."],
    ["Course cycliste la plus célèbre au monde ?", "le Tour de France", ["le Giro", "la Vuelta", "Paris-Roubaix"], "Créé en 1903."],
    ["Sprinteur recordman du monde du 100 m (9,58 s) ?", "Usain Bolt", ["Carl Lewis", "Tyson Gay", "Christian Coleman"], "Berlin, 2009."],
  ],
  2: [
    ["Combien de joueurs dans une équipe de rugby à XV sur le terrain ?", "15", ["11", "13", "7"], "Le rugby à XIII en compte 13."],
    ["Combien de joueurs par équipe sur un terrain de handball ?", "7", ["5", "6", "11"], "Dont un gardien."],
    ["Combien de joueurs par équipe sur un terrain de volley-ball ?", "6", ["5", "7", "4"], "Trois devant, trois derrière."],
    ["Longueur d'un marathon ?", "42,195 km", ["40 km", "42 km", "50 km"], "Distance officielle depuis 1921."],
    ["Hauteur d'un panier de basket ?", "3,05 m", ["2,50 m", "3,50 m", "2,80 m"], "10 pieds."],
    ["Combien de points vaut un essai au rugby à XV ?", "5", ["3", "4", "7"], "La transformation rapporte 2 points de plus."],
    ["Combien de trous sur un parcours de golf complet ?", "18", ["9", "12", "24"], "Certains petits parcours en ont 9."],
    ["Tournoi de tennis du Grand Chelem joué sur terre battue ?", "Roland-Garros", ["Wimbledon", "l'US Open", "l'Open d'Australie"], "Wimbledon se joue sur gazon."],
    ["Course de voile en solitaire autour du monde, sans escale ni assistance ?", "le Vendée Globe", ["la Route du Rhum", "la Coupe de l'America", "la Transat Jacques Vabre"], "Départ des Sables-d'Olonne."],
    ["Nageur aux 23 médailles d'or olympiques ?", "Michael Phelps", ["Usain Bolt", "Léon Marchand", "Ian Thorpe"], "Record absolu."],
    ["Longueur d'un bassin olympique ?", "50 m", ["25 m", "100 m", "33 m"], "Les bassins de 25 m servent aux compétitions en petit bassin."],
  ],
  3: [
    ["Combien de joueurs par équipe dans l'eau au water-polo ?", "7", ["6", "5", "11"], "Gardien compris."],
    ["Hauteur du filet de tennis en son centre ?", "0,914 m", ["1,07 m", "1 m", "0,80 m"], "3 pieds au centre, 1,07 m aux poteaux."],
    ["Sport inventé par James Naismith en 1891 ?", "le basket-ball", ["le volley-ball", "le handball", "le baseball"], "Avec des paniers à pêches accrochés en hauteur."],
    ["Combien de sets faut-il gagner en simple messieurs en Grand Chelem ?", "3", ["2", "4", "5"], "Matchs en 5 sets maximum."],
    ["Pays organisateur et vainqueur de la première Coupe du monde (1930) ?", "l'Uruguay", ["le Brésil", "l'Italie", "la France"], "Battant l'Argentine en finale, 4-2."],
    ["Discipline qui combine ski de fond et tir à la carabine ?", "le biathlon", ["le combiné nordique", "le skeleton", "le pentathlon"], "Le combiné nordique associe ski de fond et saut à ski."],
    ["Nageur français, quatre titres olympiques individuels à Paris 2024 ?", "Léon Marchand", ["Florent Manaudou", "Maxime Grousset", "Yannick Agnel"], "200 m papillon, 200 m brasse, 200 m et 400 m 4 nages."],
  ],
};

const SPORT_TERMES: Tiers<Pair> = {
  1: [
    ["Roland-Garros", "le tennis"], ["le maillot jaune", "le cyclisme"], ["un essai", "le rugby"], ["un panier à trois points", "le basket-ball"], ["échec et mat", "les échecs"],
    ["le Ballon d'or", "le football"], ["le crawl", "la natation"],
  ],
  2: [
    ["un birdie", "le golf"], ["un home run", "le baseball"], ["un touchdown", "le football américain"], ["un ippon", "le judo"], ["la pole position", "la Formule 1"],
    ["le slalom géant", "le ski alpin"], ["la Stanley Cup", "le hockey sur glace"], ["le fleuret, l'épée et le sabre", "l'escrime"], ["le Vendée Globe", "la voile"], ["un uppercut", "la boxe"],
  ],
  3: [
    ["un spare et un strike", "le bowling"], ["un double axel", "le patinage artistique"], ["la Ryder Cup", "le golf"], ["la coupe Davis", "le tennis"], ["le Super Bowl", "le football américain"],
    ["le Dakar", "le rallye-raid"], ["la Copa América", "le football"], ["le Tour des Flandres", "le cyclisme"], ["la Coupe de l'America", "la voile"], ["le tournoi des Candidats", "les échecs"],
  ],
};

const JO: Tiers<Pair> = {
  1: [["2024", "Paris"]],
  2: [["2016", "Rio de Janeiro"], ["2012", "Londres"], ["2008", "Pékin"], ["2020 (disputés en 2021)", "Tokyo"], ["2028", "Los Angeles"], ["2004", "Athènes"]],
  3: [["2000", "Sydney"], ["1996", "Atlanta"], ["1992", "Barcelone"], ["1924", "Paris"], ["1936", "Berlin"], ["1968", "Mexico"], ["1972", "Munich"], ["1988", "Séoul"], ["1980", "Moscou"], ["1896", "Athènes"]],
};

const COUPE_DU_MONDE: Tiers<Pair> = {
  1: [["2018", "la France"], ["1998", "la France"], ["2022", "l'Argentine"]],
  2: [["2014", "l'Allemagne"], ["2010", "l'Espagne"], ["2006", "l'Italie"], ["2002", "le Brésil"]],
  3: [["1994", "le Brésil"], ["1990", "la RFA (Allemagne de l'Ouest)"], ["1986", "l'Argentine"], ["1982", "l'Italie"], ["1970", "le Brésil"], ["1966", "l'Angleterre"], ["1930", "l'Uruguay"]],
};

// ───────────── Sciences ─────────────

const INVENTIONS: Tiers<Pair> = {
  1: [
    ["le téléphone", "Graham Bell"], ["le vaccin contre la rage", "Louis Pasteur"], ["la théorie de la relativité", "Albert Einstein"], ["la gravitation universelle", "Isaac Newton"],
    ["l'ampoule électrique commercialisée", "Thomas Edison"], ["le cinématographe", "les frères Lumière"], ["le premier vol motorisé (1903)", "les frères Wright"],
    ["l'imprimerie à caractères mobiles en Europe", "Gutenberg"],
  ],
  2: [
    ["la pénicilline", "Alexander Fleming"], ["la radioactivité naturelle", "Henri Becquerel"], ["le polonium et le radium", "Marie et Pierre Curie"], ["l'héliocentrisme moderne", "Nicolas Copernic"],
    ["l'évolution par sélection naturelle", "Charles Darwin"], ["la dynamite", "Alfred Nobel"], ["la machine à vapeur perfectionnée", "James Watt"], ["la radio (TSF)", "Guglielmo Marconi"],
    ["le paratonnerre", "Benjamin Franklin"], ["le World Wide Web", "Tim Berners-Lee"], ["le tableau périodique des éléments", "Dmitri Mendeleïev"], ["l'écriture pour les aveugles", "Louis Braille"],
    ["la pile électrique", "Alessandro Volta"], ["la montgolfière", "les frères Montgolfier"], ["les observations de la Lune à la lunette (1609)", "Galilée"], ["les rayons X", "Wilhelm Röntgen"],
  ],
  3: [
    ["les lois de l'hérédité", "Gregor Mendel"], ["le stéthoscope", "René Laennec"], ["la première photographie", "Nicéphore Niépce"], ["le premier vaccin (variole)", "Edward Jenner"],
    ["la structure en double hélice de l'ADN", "Watson et Crick"], ["la Pascaline (machine à calculer)", "Blaise Pascal"], ["la poussée des fluides (« Eurêka ! »)", "Archimède"],
    ["la circulation sanguine (1628)", "William Harvey"], ["la nomenclature binominale des espèces", "Carl von Linné"], ["la conservation de la masse en chimie", "Antoine Lavoisier"],
    ["le principe d'incertitude", "Werner Heisenberg"], ["la dérive des continents", "Alfred Wegener"], ["la mise en évidence des ondes électromagnétiques", "Heinrich Hertz"],
    ["le premier algorithme destiné à une machine (1843)", "Ada Lovelace"],
  ],
};

const ELEMENTS: Tiers<Pair> = {
  1: [["O", "l'oxygène"], ["H", "l'hydrogène"], ["C", "le carbone"], ["Fe", "le fer"], ["Au", "l'or"]],
  2: [["Ag", "l'argent"], ["Na", "le sodium"], ["Cu", "le cuivre"], ["He", "l'hélium"], ["N", "l'azote"], ["Cl", "le chlore"], ["Ca", "le calcium"], ["Pb", "le plomb"]],
  3: [["K", "le potassium"], ["Hg", "le mercure"], ["Sn", "l'étain"], ["W", "le tungstène"], ["Sb", "l'antimoine"], ["Zn", "le zinc"], ["Pt", "le platine"], ["Si", "le silicium"], ["U", "l'uranium"], ["Mn", "le manganèse"]],
};

const SCIENCES_CARDS: Tiers<Card> = {
  1: [
    ["Température d'ébullition de l'eau au niveau de la mer ?", "100 °C", ["90 °C", "120 °C", "80 °C"], "À la pression atmosphérique normale."],
    ["Formule chimique de l'eau ?", "H₂O", ["CO₂", "O₂", "NaCl"], "Deux atomes d'hydrogène, un d'oxygène."],
    ["Organe qui pompe le sang ?", "le cœur", ["les poumons", "le foie", "les reins"], "Environ 100 000 battements par jour."],
    ["Température de fusion de la glace ?", "0 °C", ["−10 °C", "4 °C", "10 °C"], "À la pression atmosphérique normale."],
  ],
  2: [
    ["Vitesse de la lumière dans le vide (environ) ?", "300 000 km/s", ["30 000 km/s", "3 000 km/s", "340 m/s"], "340 m/s, c'est le son dans l'air."],
    ["Gaz le plus abondant dans l'air ?", "le diazote", ["le dioxygène", "le dioxyde de carbone", "l'argon"], "Environ 78 % ; le dioxygène environ 21 %."],
    ["Combien d'os dans le corps d'un adulte ?", "206", ["150", "300", "412"], "Le bébé en a davantage, certains fusionnent."],
    ["Plus grand organe du corps humain ?", "la peau", ["le foie", "le cerveau", "l'intestin"], "Environ 2 m² chez l'adulte."],
    ["Groupe sanguin « donneur universel » ?", "O négatif", ["AB positif", "A positif", "B négatif"], "AB positif est receveur universel."],
    ["Unité de mesure de la fréquence ?", "le hertz", ["le watt", "le volt", "le joule"], "1 Hz = une oscillation par seconde."],
    ["Unité de l'énergie dans le Système international ?", "le joule", ["le newton", "le watt", "le pascal"], "Le watt mesure une puissance."],
    ["Formule célèbre d'Einstein ?", "E = mc²", ["F = ma", "U = RI", "PV = nRT"], "Équivalence masse-énergie."],
    ["Savante deux fois prix Nobel (physique et chimie) ?", "Marie Curie", ["Rosalind Franklin", "Irène Joliot-Curie", "Ada Lovelace"], "1903 et 1911."],
  ],
  3: [
    ["Nombre de chromosomes d'une cellule humaine (hors gamètes) ?", "46", ["23", "44", "48"], "23 paires, dont une paire de chromosomes sexuels."],
    ["Élément chimique le plus abondant dans l'Univers ?", "l'hydrogène", ["l'hélium", "l'oxygène", "le carbone"], "Environ trois quarts de la matière ordinaire."],
    ["Température du zéro absolu ?", "−273,15 °C", ["−100 °C", "−459 °C", "0 °C"], "C'est 0 kelvin : la température la plus basse possible."],
    ["Plus petit os du corps humain ?", "l'étrier", ["le marteau", "l'enclume", "la phalange"], "Dans l'oreille moyenne, environ 3 mm."],
    ["Seul métal liquide à température ambiante ?", "le mercure", ["le plomb", "l'étain", "le sodium"], "Symbole Hg."],
    ["Constante qui vaut environ 6,02 × 10²³ par mole ?", "la constante d'Avogadro", ["la constante de Planck", "la constante de gravitation", "la charge élémentaire"], "Le nombre d'entités dans une mole."],
    ["Organite qui fournit l'énergie de la cellule ?", "la mitochondrie", ["le noyau", "le ribosome", "l'appareil de Golgi"], "Elle réalise la respiration cellulaire."],
  ],
};

// ───────────── Espace ─────────────

const ESPACE_CARDS: Tiers<Card> = {
  1: [
    ["Plus grosse planète du Système solaire ?", "Jupiter", ["Saturne", "Neptune", "la Terre"], "Plus de 1 300 fois le volume de la Terre."],
    ["Planète la plus proche du Soleil ?", "Mercure", ["Vénus", "Mars", "la Terre"], "Une année y dure 88 jours."],
    ["Planète surnommée la planète rouge ?", "Mars", ["Vénus", "Jupiter", "Mercure"], "À cause de l'oxyde de fer de son sol."],
    ["Planète célèbre pour ses anneaux spectaculaires ?", "Saturne", ["Jupiter", "Uranus", "Mars"], "Faits de glace et de poussières."],
    ["Combien de planètes compte le Système solaire ?", "8", ["7", "9", "10"], "Pluton a été reclassée planète naine en 2006."],
    ["Notre galaxie ?", "la Voie lactée", ["Andromède", "le Grand Nuage de Magellan", "la galaxie du Triangle"], "Plus de 100 milliards d'étoiles."],
    ["Premier homme à marcher sur la Lune ?", "Neil Armstrong", ["Buzz Aldrin", "Youri Gagarine", "Michael Collins"], "Le 21 juillet 1969 (heure française), mission Apollo 11."],
    ["Premier homme dans l'espace (1961) ?", "Youri Gagarine", ["Neil Armstrong", "Alan Shepard", "John Glenn"], "À bord de Vostok 1."],
    ["Astronaute français de l'Agence spatiale européenne, deux séjours dans l'ISS ?", "Thomas Pesquet", ["Jean-Loup Chrétien", "Patrick Baudry", "Philippe Perrin"], "En 2016-2017 et 2021."],
  ],
  2: [
    ["Planète la plus chaude du Système solaire ?", "Vénus", ["Mercure", "Mars", "Jupiter"], "Effet de serre extrême : environ 465 °C."],
    ["Première femme dans l'espace ?", "Valentina Terechkova", ["Sally Ride", "Claudie Haigneré", "Samantha Cristoforetti"], "En 1963."],
    ["Temps mis par la lumière du Soleil pour atteindre la Terre ?", "environ 8 minutes", ["environ 8 secondes", "environ 1 heure", "environ 1 jour"], "Distance d'environ 150 millions de km."],
    ["Planète naine ex-neuvième planète ?", "Pluton", ["Cérès", "Éris", "Titan"], "Reclassée en 2006."],
    ["Plus grand volcan connu du Système solaire ?", "Olympus Mons", ["l'Etna", "le Mauna Kea", "le Vésuve"], "Sur Mars, environ 22 km de haut."],
    ["Télescope spatial lancé en 2021, successeur de Hubble ?", "James Webb", ["Kepler", "Gaia", "Spitzer"], "Il observe dans l'infrarouge."],
    ["Comète qui revient environ tous les 76 ans ?", "la comète de Halley", ["la comète Hale-Bopp", "la comète de Encke", "la comète Shoemaker-Levy"], "Prochain passage vers 2061."],
    ["Plus gros satellite naturel du Système solaire ?", "Ganymède", ["la Lune", "Titan", "Europe"], "Satellite de Jupiter."],
    ["Étoile qui indique le nord ?", "l'étoile Polaire", ["Sirius", "Bételgeuse", "Vega"], "Dans la constellation de la Petite Ourse."],
  ],
  3: [
    ["Étoile la plus proche du Soleil ?", "Proxima du Centaure", ["Sirius", "Bételgeuse", "Vega"], "Environ 4,2 années-lumière."],
    ["Grande galaxie la plus proche de la Voie lactée ?", "Andromède", ["la galaxie du Triangle", "M87", "la galaxie du Sombrero"], "Environ 2,5 millions d'années-lumière."],
    ["Zone de petits corps entre Mars et Jupiter ?", "la ceinture d'astéroïdes", ["la ceinture de Kuiper", "le nuage d'Oort", "les anneaux de Saturne"], "Cérès en est le plus gros objet."],
    ["Âge approximatif de l'Univers ?", "13,8 milliards d'années", ["4,6 milliards d'années", "1 milliard d'années", "100 milliards d'années"], "4,6 milliards d'années, c'est l'âge du Système solaire."],
    ["Planète qui tourne « couchée » sur le côté ?", "Uranus", ["Neptune", "Vénus", "Saturne"], "Son axe est incliné d'environ 98°."],
    ["Satellite de Saturne doté d'une épaisse atmosphère ?", "Titan", ["Encelade", "Europe", "Io"], "La sonde Huygens s'y est posée en 2005."],
    ["Dernière mission habitée à s'être posée sur la Lune (1972) ?", "Apollo 17", ["Apollo 13", "Apollo 11", "Artemis I"], "Eugene Cernan est le dernier homme à y avoir marché."],
  ],
};

const ORDRE_PLANETES: Tiers<Pair> = {
  1: [],
  2: [["Mercure", "1re"], ["Vénus", "2e"], ["la Terre", "3e"], ["Mars", "4e"], ["Jupiter", "5e"], ["Saturne", "6e"], ["Uranus", "7e"], ["Neptune", "8e"]],
  3: [],
};

const SATELLITES: Tiers<Pair> = {
  1: [],
  2: [["la Lune", "la Terre"], ["Titan", "Saturne"], ["Europe", "Jupiter"], ["Io", "Jupiter"], ["Phobos", "Mars"], ["Charon", "Pluton"]],
  3: [["Encelade", "Saturne"], ["Ganymède", "Jupiter"], ["Callisto", "Jupiter"], ["Deimos", "Mars"], ["Triton", "Neptune"], ["Miranda", "Uranus"]],
};

const MISSIONS: Tiers<Pair> = {
  1: [],
  2: [
    ["Spoutnik 1 (1957), premier satellite artificiel", "l'URSS"], ["Apollo 11 (1969), premiers pas sur la Lune", "les États-Unis"], ["Vostok 1 (1961), premier vol habité", "l'URSS"],
    ["la fusée Ariane", "l'Agence spatiale européenne"], ["le rover Curiosity sur Mars (2012)", "les États-Unis"],
  ],
  3: [
    ["Rosetta et son atterrisseur Philae (comète, 2014)", "l'Agence spatiale européenne"], ["Chang'e 4, premier alunissage sur la face cachée (2019)", "la Chine"],
    ["Chandrayaan-3, alunissage près du pôle Sud (2023)", "l'Inde"], ["Voyager 1, objet humain le plus lointain", "les États-Unis"],
  ],
};

const ESPACE_CLAIMS: Tiers<Claim> = {
  1: [
    ["La Lune produit sa propre lumière.", false, "Elle réfléchit la lumière du Soleil."],
    ["Le Soleil est une étoile.", true, "Une étoile naine jaune."],
    ["La Terre met environ 365 jours à faire le tour du Soleil.", true, "365,25 jours, d'où les années bissextiles."],
  ],
  2: [
    ["On voit toujours la même face de la Lune depuis la Terre.", true, "Rotation synchrone."],
    ["Il n'y a pas de gravité dans la Station spatiale internationale.", false, "Les astronautes flottent car ils sont en chute libre permanente autour de la Terre."],
    ["Une année-lumière est une durée.", false, "C'est une distance : celle parcourue par la lumière en un an."],
    ["Les saisons sont dues à la distance variable entre la Terre et le Soleil.", false, "Elles viennent de l'inclinaison de l'axe de la Terre (environ 23°)."],
  ],
  3: [
    ["Vénus tourne sur elle-même dans le sens inverse de la plupart des planètes.", true, "Rotation rétrograde : un jour vénusien dure 243 jours terrestres."],
    ["Mars possède deux satellites naturels.", true, "Phobos et Deimos."],
    ["Le Soleil représente plus de 99 % de la masse du Système solaire.", true, "Environ 99,86 %."],
    ["Une étoile à neutrons est plus grande que le Soleil.", false, "Environ 20 km de diamètre, pour une masse supérieure à celle du Soleil."],
  ],
};

// ───────────── Nature ─────────────

const PETITS: Tiers<Pair> = {
  1: [
    ["le cheval", "le poulain"], ["la vache", "le veau"], ["le mouton", "l'agneau"], ["le chien", "le chiot"], ["le chat", "le chaton"], ["la poule", "le poussin"],
    ["le lion", "le lionceau"], ["l'ours", "l'ourson"], ["le cochon", "le porcelet"], ["la grenouille", "le têtard"],
  ],
  2: [
    ["la chèvre", "le chevreau"], ["le lapin", "le lapereau"], ["le canard", "le caneton"], ["la biche", "le faon"], ["l'aigle", "l'aiglon"], ["l'éléphant", "l'éléphanteau"],
    ["le renard", "le renardeau"], ["le loup", "le louveteau"], ["la baleine", "le baleineau"],
  ],
  3: [["l'oie", "l'oison"], ["le sanglier", "le marcassin"], ["le lièvre", "le levraut"], ["le pigeon", "le pigeonneau"], ["l'âne", "l'ânon"], ["le dindon", "le dindonneau"], ["la perdrix", "le perdreau"], ["le corbeau", "le corbillat"]],
};

const CRIS: Tiers<Pair> = {
  1: [["le chien", "aboie"], ["le chat", "miaule"], ["la vache", "meugle"], ["le cheval", "hennit"], ["le mouton", "bêle"], ["le lion", "rugit"], ["le loup", "hurle"], ["le serpent", "siffle"]],
  2: [["le corbeau", "croasse"], ["la grenouille", "coasse"], ["l'éléphant", "barrit"], ["l'âne", "brait"], ["le cochon", "grogne"], ["la poule", "caquette"], ["le pigeon", "roucoule"], ["le hibou", "hulule"], ["le cerf", "brame"], ["l'abeille", "bourdonne"]],
  3: [["le chameau", "blatère"], ["la pie", "jacasse"], ["le canard", "cancane"], ["le tigre", "feule"], ["le crocodile", "vagit"], ["la cigogne", "craquette"], ["la chouette", "chuinte"], ["le renard", "glapit"]],
};

const NATURE_CARDS: Tiers<Card> = {
  1: [
    ["Plus grand animal du monde ?", "la baleine bleue", ["l'éléphant d'Afrique", "le requin-baleine", "le calmar géant"], "Jusqu'à 30 m de long."],
    ["Animal terrestre le plus rapide ?", "le guépard", ["le lion", "l'antilope", "le lévrier"], "Plus de 100 km/h en pointe."],
    ["Combien de pattes a une araignée ?", "8", ["6", "10", "4"], "Les insectes en ont 6."],
    ["Combien de pattes a un insecte ?", "6", ["8", "4", "10"], "Trois paires."],
    ["Nourriture principale du panda géant ?", "le bambou", ["l'eucalyptus", "le poisson", "les fourmis"], "Jusqu'à 12 heures par jour à manger."],
    ["Le dauphin est…", "un mammifère", ["un poisson", "un reptile", "un amphibien"], "Il respire de l'air et allaite ses petits."],
    ["Animal emblème de l'Australie qui porte ses petits dans une poche ?", "le kangourou", ["le koala", "le wombat", "l'ornithorynque"], "C'est un marsupial (comme le koala)."],
    ["Plus grand oiseau du monde ?", "l'autruche", ["le condor", "l'albatros", "l'émeu"], "Elle ne vole pas."],
  ],
  2: [
    ["Seul mammifère capable de vraiment voler ?", "la chauve-souris", ["l'écureuil volant", "le colugo", "le ptéranodon"], "Les autres ne font que planer."],
    ["Combien de cœurs a une pieuvre ?", "3", ["1", "2", "8"], "Deux pour les branchies, un pour le corps."],
    ["Chez l'hippocampe, qui porte les petits ?", "le mâle", ["la femelle", "les deux", "aucun"], "Dans une poche ventrale."],
    ["Nourriture principale du koala ?", "les feuilles d'eucalyptus", ["le bambou", "les insectes", "les fruits"], "Il dort environ 20 h par jour."],
    ["Arbre le plus haut du monde ?", "le séquoia", ["le baobab", "le chêne", "l'eucalyptus"], "Un séquoia à feuilles d'if dépasse 115 m."],
    ["Mammifère qui pond des œufs ?", "l'ornithorynque", ["le kangourou", "la chauve-souris", "le hérisson"], "Avec l'échidné, ce sont des monotrèmes."],
    ["Animal qui change de couleur pour communiquer ou se camoufler ?", "le caméléon", ["l'iguane", "la tortue", "le gecko"], "Grâce à des cristaux dans sa peau."],
    ["Gaz rejeté par les plantes lors de la photosynthèse ?", "le dioxygène", ["le dioxyde de carbone", "le méthane", "l'azote"], "Elles absorbent le CO₂."],
    ["Combien de poches compte l'estomac de la vache ?", "4", ["1", "2", "6"], "Panse, bonnet, feuillet et caillette : c'est un ruminant."],
  ],
  3: [
    ["Oiseau capable de voler en arrière ?", "le colibri", ["le martin-pêcheur", "l'hirondelle", "le faucon"], "Ses ailes battent jusqu'à 80 fois par seconde."],
    ["Animal le plus rapide en piqué ?", "le faucon pèlerin", ["l'aigle royal", "le martinet", "le guépard"], "Plus de 300 km/h."],
    ["Durée de gestation d'une éléphante ?", "environ 22 mois", ["environ 9 mois", "environ 12 mois", "environ 36 mois"], "Record chez les mammifères terrestres."],
    ["Minuscule animal capable de survivre au vide spatial ?", "le tardigrade", ["la fourmi", "le cafard", "le scorpion"], "Moins d'un millimètre de long."],
    ["Groupe des baleines, dauphins et orques ?", "les cétacés", ["les pinnipèdes", "les siréniens", "les squales"], "Les phoques sont des pinnipèdes."],
    ["Vertébré à la plus longue durée de vie connue ?", "le requin du Groenland", ["la tortue géante", "la baleine boréale", "l'éléphant"], "Il pourrait vivre plusieurs siècles."],
    ["Plante carnivore qui referme ses feuilles comme un piège ?", "la dionée (attrape-mouche)", ["le népenthès", "la sarracénie", "le rossolis"], "Le népenthès, lui, piège ses proies dans une urne."],
  ],
};

// ───────────── Mythologie ─────────────

const DIEUX: Tiers<Pair> = {
  1: [["Zeus", "Jupiter"], ["Poséidon", "Neptune"], ["Aphrodite", "Vénus"], ["Arès", "Mars"], ["Hadès", "Pluton"]],
  2: [["Héra", "Junon"], ["Athéna", "Minerve"], ["Hermès", "Mercure"], ["Artémis", "Diane"], ["Éros", "Cupidon"], ["Dionysos", "Bacchus"]],
  3: [["Héphaïstos", "Vulcain"], ["Déméter", "Cérès"], ["Cronos", "Saturne"], ["Hestia", "Vesta"], ["Perséphone", "Proserpine"], ["Éos", "Aurore"], ["Létô", "Latone"]],
};

const DOMAINES: Tiers<Pair> = {
  1: [["Zeus", "le ciel et la foudre"], ["Poséidon", "les mers et les océans"], ["Hadès", "les Enfers"], ["Aphrodite", "l'amour et la beauté"], ["Arès", "la guerre"]],
  2: [["Athéna", "la sagesse et la stratégie"], ["Hermès", "les messages, le commerce et les voyageurs"], ["Dionysos", "le vin et la fête"], ["Héphaïstos", "le feu et la forge"], ["Artémis", "la chasse"], ["Apollon", "la lumière, la musique et la poésie"]],
  3: [["Déméter", "l'agriculture et les moissons"], ["Hestia", "le foyer"], ["Héra", "le mariage"], ["Nyx", "la nuit"], ["Hypnos", "le sommeil"], ["Némésis", "la vengeance divine"], ["Hécate", "la magie et les carrefours"], ["Éole", "les vents"]],
};

const HEROS: Tiers<Pair> = {
  1: [["Ulysse", "rentre à Ithaque après un voyage de dix ans"], ["Achille", "n'est vulnérable qu'au talon"], ["Héraclès", "accomplit douze travaux"], ["Icare", "vole trop près du Soleil avec des ailes de cire"]],
  2: [
    ["Thésée", "tue le Minotaure dans le Labyrinthe"], ["Persée", "tranche la tête de Méduse"], ["Prométhée", "vole le feu aux dieux pour le donner aux hommes"],
    ["Pandore", "ouvre la jarre qui libère les maux du monde"], ["Orphée", "descend aux Enfers chercher Eurydice"], ["Jason", "part à la recherche de la Toison d'or"],
    ["Narcisse", "tombe amoureux de son propre reflet"], ["Midas", "change en or tout ce qu'il touche"],
  ],
  3: [
    ["Œdipe", "résout l'énigme du Sphinx"], ["Sisyphe", "pousse éternellement un rocher en haut d'une colline"], ["Tantale", "souffre d'une faim et d'une soif éternelles, nourriture et eau hors de portée"],
    ["Ariane", "donne un fil à Thésée pour sortir du Labyrinthe"], ["Cassandre", "prédit l'avenir sans que personne ne la croie"], ["Pénélope", "défait chaque nuit la toile tissée le jour en attendant son époux"],
    ["Antigone", "enterre son frère Polynice malgré l'interdiction de Créon"], ["Bellérophon", "chevauche Pégase pour tuer la Chimère"], ["Atlas", "porte la voûte céleste sur ses épaules"],
  ],
};

const MYTHO_CARDS: Tiers<Card> = {
  1: [
    ["Montagne où vivent les dieux grecs ?", "l'Olympe", ["le Parnasse", "l'Etna", "le mont Ida"], "Plus haut sommet de Grèce."],
    ["Dieu nordique du tonnerre, armé d'un marteau ?", "Thor", ["Odin", "Loki", "Freyr"], "Son marteau s'appelle Mjöllnir."],
    ["Cheval ailé de la mythologie grecque ?", "Pégase", ["Bucéphale", "le Centaure", "Cerbère"], "Né du sang de Méduse."],
    ["Ruse d'Ulysse pour entrer dans la ville de Troie ?", "le cheval de Troie", ["la boîte de Pandore", "le talon d'Achille", "le fil d'Ariane"], "Aujourd'hui aussi un logiciel malveillant."],
    ["Créature mi-homme mi-taureau enfermée dans le Labyrinthe ?", "le Minotaure", ["le Centaure", "le Cyclope", "la Méduse"], "Le Labyrinthe a été construit par Dédale."],
  ],
  2: [
    ["Dieu principal de la mythologie nordique ?", "Odin", ["Thor", "Loki", "Baldr"], "Il a sacrifié un œil pour la sagesse."],
    ["Dieu égyptien du soleil ?", "Râ", ["Anubis", "Osiris", "Seth"], "Souvent représenté avec une tête de faucon."],
    ["Dieu égyptien à tête de chacal, lié aux morts ?", "Anubis", ["Horus", "Râ", "Thot"], "Il préside à la momification."],
    ["Chien à trois têtes gardien des Enfers ?", "Cerbère", ["Pégase", "l'Hydre", "le Minotaure"], "Héraclès le capture lors de son 12e travail."],
    ["Dieu nordique de la ruse et des tours ?", "Loki", ["Thor", "Odin", "Tyr"], "Il est le père du loup Fenrir."],
  ],
  3: [
    ["Arbre-monde de la mythologie nordique ?", "Yggdrasil", ["Asgard", "le Valhalla", "Bifröst"], "Un frêne géant qui relie les neuf mondes."],
    ["Séjour des guerriers morts au combat chez les Vikings ?", "le Valhalla", ["Asgard", "Midgard", "Hel"], "Ils y sont accueillis par Odin."],
    ["Déesse égyptienne, épouse d'Osiris et mère d'Horus ?", "Isis", ["Hathor", "Bastet", "Nout"], "Elle reconstitue le corps d'Osiris."],
    ["Fleuve des Enfers dans lequel Achille a été plongé enfant ?", "le Styx", ["le Léthé", "le Nil", "le Cocyte"], "Seul son talon, tenu par sa mère, n'y a pas trempé."],
    ["Muse de l'histoire ?", "Clio", ["Calliope", "Thalie", "Uranie"], "Calliope : poésie épique ; Thalie : comédie ; Uranie : astronomie."],
  ],
};

// ───────────── Langue française ─────────────

const EXPRESSIONS: Tiers<Pair> = {
  1: [
    ["poser un lapin", "ne pas venir à un rendez-vous"], ["coûter les yeux de la tête", "coûter très cher"], ["tomber dans les pommes", "s'évanouir"], ["être dans la lune", "être distrait, rêveur"],
    ["il pleut des cordes", "il pleut très fort"], ["faire la grasse matinée", "se lever tard"], ["donner sa langue au chat", "renoncer à trouver la réponse"], ["avoir un chat dans la gorge", "être enroué"],
    ["raconter des salades", "raconter des mensonges"], ["être une poule mouillée", "être peureux"],
  ],
  2: [
    ["avoir le cafard", "être triste, déprimé"], ["avoir un poil dans la main", "être paresseux"], ["mettre les pieds dans le plat", "aborder maladroitement un sujet délicat"],
    ["casser les pieds", "ennuyer, importuner quelqu'un"], ["prendre ses jambes à son cou", "s'enfuir en courant"], ["se mettre le doigt dans l'œil", "se tromper complètement"],
    ["être au pied du mur", "ne plus pouvoir reculer"], ["mettre la puce à l'oreille", "éveiller un soupçon"], ["tirer les vers du nez", "faire avouer quelqu'un petit à petit"],
    ["couper la poire en deux", "faire un compromis"], ["être sur son trente-et-un", "être très bien habillé"], ["les carottes sont cuites", "il n'y a plus d'espoir"],
    ["faire d'une pierre deux coups", "obtenir deux résultats en une seule action"], ["jeter l'éponge", "abandonner"], ["avoir du pain sur la planche", "avoir beaucoup de travail"],
    ["tourner autour du pot", "ne pas aller droit au but"], ["avoir les yeux plus gros que le ventre", "vouloir plus qu'on ne peut avaler ou faire"], ["avoir la main verte", "être doué pour le jardinage"],
    ["avoir le cœur sur la main", "être très généreux"],
  ],
  3: [
    ["avoir les dents longues", "être très ambitieux"], ["chercher la petite bête", "chercher le moindre défaut"], ["mettre son grain de sel", "donner son avis sans y être invité"],
    ["se faire rouler dans la farine", "se faire tromper"], ["revenir à ses moutons", "revenir au sujet de la conversation"], ["prendre la mouche", "se vexer pour peu de chose"],
    ["tenir la chandelle", "assister en trop à un tête-à-tête amoureux"], ["faire chou blanc", "échouer, ne rien obtenir"], ["tirer le diable par la queue", "avoir du mal à vivre avec peu d'argent"],
    ["être le dindon de la farce", "être la dupe d'une tromperie"], ["avoir maille à partir avec quelqu'un", "avoir un différend avec quelqu'un"], ["payer en monnaie de singe", "payer en belles paroles, ne pas payer"],
    ["se mettre martel en tête", "se faire beaucoup de souci"], ["c'est la croix et la bannière", "c'est très compliqué"],
  ],
};

const LANGUE_CARDS: Tiers<Card> = {
  1: [
    ["Pluriel de « cheval » ?", "chevaux", ["chevals", "chevaus", "chevaux ou chevals"], "Les noms en -al font -aux (sauf bal, carnaval, festival…)."],
    ["Pluriel de « bijou » ?", "bijoux", ["bijous", "bijoues", "bijou"], "Comme caillou, chou, genou, hibou, joujou, pou."],
    ["Pluriel de « œil » ?", "yeux", ["œils", "œuils", "yeuxs"], "« Œils » existe seulement dans des mots composés (œils-de-bœuf)."],
    ["Synonyme de « rapide » ?", "véloce", ["lent", "lourd", "paisible"], "Du latin velox."],
    ["Un palindrome, c'est…", "un mot qui se lit dans les deux sens", ["un mot très long", "un mot d'origine grecque", "un mot qui rime avec lui-même"], "Exemples : kayak, radar, été."],
    ["Un anagramme de « chien » ?", "niche", ["chêne", "chaîne", "chine"], "Mêmes lettres dans un autre ordre."],
  ],
  2: [
    ["Pluriel de « festival » ?", "festivals", ["festivaux", "festivaus", "festivales"], "Exception au pluriel en -aux."],
    ["Pluriel de « travail » (au sens d'ouvrages) ?", "travaux", ["travails", "travaus", "travailles"], "Comme corail, émail, vitrail."],
    ["Mot bien orthographié ?", "développement", ["dévelopement", "développemment", "dévellopement"], "Deux p, un l."],
    ["Mot bien orthographié ?", "rythme", ["rhytme", "rythm", "ritme"], "Du grec rhuthmos."],
    ["Mot bien orthographié ?", "accueil", ["acceuil", "aqueil", "accueuil"], "Après « cc », on écrit « ueil »."],
    ["Contraire de « éphémère » ?", "durable", ["passager", "bref", "fugace"], "Éphémère : qui ne dure qu'un jour, très peu de temps."],
    ["Que signifie « procrastiner » ?", "remettre à plus tard", ["travailler sans relâche", "se plaindre sans cesse", "exagérer"], "Du latin cras, « demain »."],
    ["Quelle figure de style dans « Je meurs de soif » ?", "une hyperbole", ["une litote", "un oxymore", "une anaphore"], "Une exagération pour frapper les esprits."],
  ],
  3: [
    ["Mot bien orthographié ?", "parallèle", ["paralèle", "parralèle", "parallelle"], "Deux l au milieu, un seul à la fin."],
    ["Quelle figure de style dans « Cette obscure clarté » ?", "un oxymore", ["une métaphore", "une hyperbole", "une litote"], "Deux mots de sens contraire rapprochés (Corneille)."],
    ["« Va, je ne te hais point » est…", "une litote", ["une hyperbole", "un oxymore", "une métonymie"], "Dire moins pour suggérer plus (Corneille, Le Cid)."],
    ["« Boire un verre » : quelle figure de style ?", "une métonymie", ["une métaphore", "une périphrase", "une antithèse"], "Le contenant désigne le contenu."],
    ["Mot bien orthographié ?", "occurrence", ["occurence", "ocurrence", "occurrance"], "Deux c et deux r."],
    ["Pluriel de « chou-fleur » ?", "choux-fleurs", ["chou-fleurs", "choux-fleur", "chous-fleurs"], "Nom + nom : les deux prennent la marque du pluriel."],
    ["Quel accord est correct ?", "les fleurs qu'il a cueillies", ["les fleurs qu'il a cueilli", "les fleurs qu'il a cueillis", "les fleurs qu'il a cueillie"], "Avec avoir, on accorde avec le COD placé avant (« que », mis pour « les fleurs »)."],
    ["Que signifie « sibyllin » ?", "obscur, énigmatique", ["très clair", "prétentieux", "bruyant"], "Comme les oracles de la Sibylle."],
    ["Que signifie « pusillanime » ?", "qui manque de courage", ["très généreux", "minuscule", "très patient"], "Du latin pusillus animus, « petit esprit »."],
  ],
};

// ───────────── Institutions et monde ─────────────

const SIGLES: Tiers<Pair> = {
  1: [
    ["ONU", "Organisation des Nations unies"], ["UE", "Union européenne"], ["SNCF", "Société nationale des chemins de fer français"], ["SAMU", "service d'aide médicale urgente"],
    ["TVA", "taxe sur la valeur ajoutée"], ["BAC", "baccalauréat"], ["SDF", "sans domicile fixe"], ["RER", "réseau express régional"], ["CDI", "contrat à durée indéterminée"],
  ],
  2: [
    ["OMS", "Organisation mondiale de la santé"], ["OTAN", "Organisation du traité de l'Atlantique Nord"], ["FMI", "Fonds monétaire international"], ["BCE", "Banque centrale européenne"],
    ["ONG", "organisation non gouvernementale"], ["PIB", "produit intérieur brut"], ["SMIC", "salaire minimum interprofessionnel de croissance"], ["UNICEF", "Fonds des Nations unies pour l'enfance"],
    ["ESA", "Agence spatiale européenne"], ["GIEC", "Groupe d'experts intergouvernemental sur l'évolution du climat"], ["UNESCO", "Organisation des Nations unies pour l'éducation, la science et la culture"],
  ],
  3: [
    ["OMC", "Organisation mondiale du commerce"], ["CNIL", "Commission nationale de l'informatique et des libertés"], ["CNRS", "Centre national de la recherche scientifique"],
    ["INSEE", "Institut national de la statistique et des études économiques"], ["OCDE", "Organisation de coopération et de développement économiques"], ["OPEP", "Organisation des pays exportateurs de pétrole"],
    ["CJUE", "Cour de justice de l'Union européenne"], ["CEDH", "Cour européenne des droits de l'homme"], ["AOC", "appellation d'origine contrôlée"], ["CNES", "Centre national d'études spatiales"],
    ["OIT", "Organisation internationale du travail"],
  ],
};

const INSTITUTIONS: Tiers<Card> = {
  1: [
    ["Devise de la République française ?", "Liberté, Égalité, Fraternité", ["Travail, Famille, Patrie", "Unité, Progrès, Justice", "Paix et Liberté"], "Inscrite dans la Constitution de 1958."],
    ["Figure féminine symbole de la République française ?", "Marianne", ["Jeanne", "Athéna", "Europe"], "Coiffée d'un bonnet phrygien."],
    ["Hymne national français ?", "La Marseillaise", ["Le Chant des partisans", "L'Internationale", "La Madelon"], "Composée par Rouget de Lisle en 1792."],
    ["Résidence officielle du président de la République ?", "le palais de l'Élysée", ["l'hôtel Matignon", "le palais Bourbon", "le palais du Luxembourg"], "Matignon est celle du Premier ministre."],
    ["Âge de la majorité et du droit de vote en France ?", "18 ans", ["16 ans", "20 ans", "21 ans"], "Depuis 1974 (21 ans avant)."],
    ["Monnaie de la zone euro depuis 2002 (pièces et billets) ?", "l'euro", ["l'écu", "le franc", "le mark"], "Utilisé par 20 pays de l'UE."],
    ["Durée du mandat du président de la République ?", "5 ans", ["4 ans", "6 ans", "7 ans"], "Le quinquennat depuis 2002 (septennat avant)."],
  ],
  2: [
    ["Ville siège de l'ONU ?", "New York", ["Genève", "Paris", "Washington"], "Genève accueille son office européen."],
    ["Ville siège de la Commission européenne ?", "Bruxelles", ["Strasbourg", "Luxembourg", "Francfort"], "Le Parlement européen siège officiellement à Strasbourg."],
    ["Ville siège officiel du Parlement européen ?", "Strasbourg", ["Bruxelles", "Luxembourg", "Paris"], "Il se réunit aussi à Bruxelles."],
    ["Combien de pays dans l'Union européenne (depuis 2020) ?", "27", ["25", "28", "30"], "Le Royaume-Uni est sorti en 2020."],
    ["Nombre de députés à l'Assemblée nationale ?", "577", ["348", "500", "650"], "Le Sénat compte 348 sénateurs."],
    ["Lieu où siège l'Assemblée nationale ?", "le palais Bourbon", ["le palais du Luxembourg", "l'Élysée", "Versailles"], "Le Sénat siège au palais du Luxembourg."],
    ["Ville où est remis le prix Nobel de la paix ?", "Oslo", ["Stockholm", "Genève", "La Haye"], "Les autres prix Nobel sont remis à Stockholm."],
    ["Organisation qui classe des sites au patrimoine mondial ?", "l'UNESCO", ["l'OMS", "l'OTAN", "le FMI"], "Plus de 1 100 sites dans le monde."],
  ],
  3: [
    ["Combien de membres permanents au Conseil de sécurité de l'ONU ?", "5", ["3", "10", "15"], "Chine, États-Unis, France, Royaume-Uni et Russie, avec droit de veto."],
    ["Article de la Constitution qui permet d'adopter un texte sans vote des députés ?", "l'article 49.3", ["l'article 16", "l'article 89", "l'article 11"], "Sauf si une motion de censure est adoptée."],
    ["Institution qui vérifie que les lois respectent la Constitution ?", "le Conseil constitutionnel", ["le Conseil d'État", "la Cour de cassation", "le Sénat"], "9 membres nommés pour 9 ans."],
    ["Durée du mandat d'un sénateur ?", "6 ans", ["5 ans", "9 ans", "4 ans"], "Le Sénat est renouvelé par moitié tous les 3 ans."],
    ["Juridiction suprême de l'ordre judiciaire en France ?", "la Cour de cassation", ["le Conseil d'État", "la cour d'appel", "le Conseil constitutionnel"], "Le Conseil d'État est au sommet de l'ordre administratif."],
    ["Ville siège de la Cour internationale de justice ?", "La Haye", ["Genève", "New York", "Strasbourg"], "C'est l'organe judiciaire de l'ONU."],
    ["Ville siège de la Banque centrale européenne ?", "Francfort", ["Bruxelles", "Luxembourg", "Paris"], "En Allemagne."],
    ["Traité qui a créé l'Union européenne (1992) ?", "le traité de Maastricht", ["le traité de Rome", "le traité de Lisbonne", "le traité de Nice"], "Il prévoit aussi la monnaie unique."],
  ],
};

// ───────────── Gastronomie ─────────────

const PLATS_MONDE: Tiers<Pair> = {
  1: [["la paella", "l'Espagne"], ["les sushis", "le Japon"], ["la pizza margherita", "l'Italie"], ["les tacos", "le Mexique"], ["le fish and chips", "le Royaume-Uni"]],
  2: [
    ["la moussaka", "la Grèce"], ["le goulasch", "la Hongrie"], ["le bortsch", "l'Ukraine"], ["la poutine", "le Canada (Québec)"], ["le kimchi", "la Corée"], ["le pad thaï", "la Thaïlande"],
    ["le couscous", "le Maghreb"], ["le pastel de nata", "le Portugal"], ["le houmous", "le Proche-Orient"], ["la currywurst", "l'Allemagne"],
  ],
  3: [
    ["la feijoada", "le Brésil"], ["le ceviche", "le Pérou"], ["le phở", "le Viêt Nam"], ["les pierogi", "la Pologne"], ["le haggis", "l'Écosse"], ["le smørrebrød", "le Danemark"],
    ["l'injera", "l'Éthiopie"], ["le mafé", "l'Afrique de l'Ouest"], ["le dal bhat", "le Népal"], ["le khachapuri", "la Géorgie"],
  ],
};

const PLATS_FRANCE: Tiers<Pair> = {
  1: [["la bouillabaisse", "Marseille"], ["la choucroute", "l'Alsace"], ["la quiche", "la Lorraine"], ["la tartiflette", "la Savoie"]],
  2: [
    ["la salade niçoise", "Nice"], ["le cassoulet", "Castelnaudary"], ["le kouign-amann", "la Bretagne"], ["le bœuf bourguignon", "la Bourgogne"], ["le canelé", "Bordeaux"],
    ["la madeleine", "Commercy"], ["les rillettes", "Le Mans"], ["la galette-saucisse", "Rennes"], ["l'aligot", "l'Aubrac"],
  ],
  3: [
    ["le calisson", "Aix-en-Provence"], ["la garbure", "la Gascogne"], ["les bêtises", "Cambrai"], ["les quenelles", "Lyon"], ["la piperade", "le Pays basque"], ["le nougat", "Montélimar"],
    ["les berlingots", "Carpentras"], ["le pain d'épices", "Dijon"], ["la potée", "l'Auvergne"], ["le tourteau fromager", "le Poitou"],
  ],
};

const GASTRO_CLAIMS: Tiers<Claim> = {
  1: [
    ["Le champagne ne peut porter ce nom que s'il est produit en Champagne.", true, "Appellation d'origine protégée."],
    ["Le chocolat est fabriqué à partir des fèves du cacaoyer.", true, "Originaire d'Amérique centrale et du Sud."],
    ["La pizza margherita a été créée à Naples.", true, "En 1889, selon la tradition, en l'honneur de la reine Marguerite."],
  ],
  2: [
    ["Le roquefort est fabriqué avec du lait de brebis.", true, "Affiné dans les caves de Roquefort-sur-Soulzon."],
    ["Le camembert vient de Normandie.", true, "Lait de vache."],
    ["Le croissant est né en Italie.", false, "Il viendrait de Vienne (le kipferl), popularisé à Paris au XIXe siècle."],
    ["La tomate vient d'Amérique.", true, "Rapportée en Europe au XVIe siècle."],
  ],
  3: [
    ["La pomme de terre a été popularisée en France par Parmentier.", true, "Au XVIIIe siècle, notamment pour lutter contre les famines."],
    ["Le comté est un fromage au lait de chèvre.", false, "Il est fait au lait cru de vache, dans le massif du Jura."],
    ["La vanille est le fruit d'une orchidée.", true, "Une gousse originaire du Mexique."],
    ["Le safran provient du pistil d'une fleur de crocus.", true, "C'est l'épice la plus chère du monde."],
    ["Le wasabi est une plante de la même famille que la moutarde.", true, "Les brassicacées, comme le chou et le raifort."],
  ],
};

// ───────────── Assemblage des thèmes ─────────────

/** Titre entre guillemets, sauf s'il est déjà décrit (« l'Hymne à la joie », « la Polonaise… »). */
const title = (a: string) => (/^[a-zà-ÿ]/.test(a) ? a : `« ${a} »`);

const all = <T,>(t: Tiers<T>): T[] => [...t[1], ...t[2], ...t[3]];

/** Questions d'une table au niveau `t` ; les leurres viennent de tous les niveaux. */
const knows = (table: Tiers<Pair>, t: Tier, ask: (a: string) => string, reverse: (b: string) => string, claim: (a: string, b: string) => string, explain?: (a: string, b: string) => string) =>
  table[t].length ? pairs(table[t], { ask, reverse, claim, explain, pool: all(table) } satisfies PairOptions) : [];
const cardsAt = (table: Tiers<Card>, t: Tier) => (table[t].length ? [cards(table[t])] : []);
const claimsAt = (table: Tiers<Claim>, t: Tier) => (table[t].length ? [claims(table[t])] : []);

const THEMES: Record<string, (t: Tier) => Generator[]> = {
  "cg-capitales": (t) => [
    ...knows(CAPITALES, t, (a) => `Capitale ${de(a)} ?`, (b) => `${b} est la capitale de…`, (a, b) => `La capitale ${de(a)} est ${b}.`, (a, b) => `${cap(b)} est la capitale ${de(a)}.`),
    ...claimsAt(PIEGES_CAPITALES, t),
  ],
  "cg-geo-monde": (t) => [
    ...cardsAt(RECORDS_GEO, t),
    ...knows(FLEUVES, t, (a) => `Quel fleuve traverse ${a} ?`, (b) => `Quelle ville est traversée par ${b} ?`, (a, b) => `${cap(b)} traverse ${a}.`, (a, b) => `${cap(b)} traverse ${a}.`),
    ...knows(MONNAIES, t, (a) => `Monnaie ${de(a)} ?`, (b) => `Quel pays utilise ${b} ?`, (a, b) => `La monnaie ${de(a)} est ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
  ],
  "cg-france": (t) => [
    ...cardsAt(FRANCE, t),
    ...knows(REGIONS, t, (a) => `Chef-lieu de la région ${a} ?`, (b) => `${b} est le chef-lieu de quelle région ?`, (a, b) => `${b} est le chef-lieu de la région ${a}.`, (a, b) => `${a} : chef-lieu ${b}.`),
    ...knows(PREFECTURES, t, (a) => `Préfecture du département suivant : ${a} ?`, (b) => `${b} est la préfecture de quel département ?`, (a, b) => `${b} est la préfecture du département suivant : ${a}.`, (a, b) => `${cap(a)} : préfecture ${b}.`),
    ...knows(DEPARTEMENTS, t, (a) => `Quel département porte le numéro ${a} ?`, (b) => `Quel numéro porte le département suivant : ${b} ?`, (a, b) => `Le département n° ${a} est ${b}.`, (a, b) => `${a} : ${b}.`),
  ],
  "cg-histoire": (t) => [
    ...knows(DATES, t, (a) => `En quelle année : ${a} ?`, (b) => `Quel événement a eu lieu en ${b} ?`, (a, b) => `${b} : ${a}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(PERSONNAGES, t, (a) => `Qui est ${a} ?`, (b) => `Qui était ${b} ?`, (a, b) => `${cap(a)} est ${b}.`, (a, b) => `${b} : ${a}.`),
    ...claimsAt(HISTOIRE_CLAIMS, t),
  ],
  "cg-arts": (t) => [
    ...knows(OEUVRES_ART, t, (a) => `Qui a réalisé « ${a} » ?`, (b) => `Quelle œuvre est de ${b} ?`, (a, b) => `« ${a} » est une œuvre de ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    ...knows(MONUMENTS, t, (a) => `Dans quelle ville se trouve ${a} ?`, (b) => `Quel monument se trouve à ${b} ?`, (a, b) => `${cap(a)} se trouve à ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(ARCHITECTES, t, (a) => `Qui a conçu ${a} ?`, (b) => `Quelle réalisation doit-on à ${b} ?`, (a, b) => `${cap(a)} a été conçu(e) par ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...cardsAt(ARTS_CARDS, t),
  ],
  "cg-litterature": (t) => [
    ...knows(LIVRES, t, (a) => `Qui a écrit « ${a} » ?`, (b) => `Quelle œuvre a écrite ${b} ?`, (a, b) => `« ${a} » a été écrit par ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    ...knows(PERSONNAGES_LIVRES, t, (a) => `Dans quelle œuvre trouve-t-on ${a} ?`, (b) => `Quel personnage apparaît dans ${b.startsWith("les romans") ? b : `« ${b} »`} ?`, (a, b) => `${cap(a)} est un personnage de ${b.startsWith("les romans") ? b : `« ${b} »`}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...claimsAt(LITTERATURE_CLAIMS, t),
  ],
  "cg-musique": (t) => [
    ...knows(CLASSIQUE, t, (a) => `Qui a composé ${title(a)} ?`, (b) => `Quelle œuvre a composée ${b} ?`, (a, b) => `${b} a composé ${title(a)}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(CHANSONS, t, (a) => `Qui interprète « ${a} » ?`, (b) => `Quelle chanson est interprétée par ${b} ?`, (a, b) => `« ${a} » est une chanson de ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    ...cardsAt(MUSIQUE_CARDS, t),
  ],
  "cg-cinema": (t) => [
    ...knows(FILMS, t, (a) => `Qui a réalisé « ${a} » ?`, (b) => `Quel film a réalisé ${b} ?`, (a, b) => `« ${a} » a été réalisé par ${b}.`, (a, b) => `« ${a} » : ${b}.`),
    ...cardsAt(CINEMA_CARDS, t),
  ],
  "cg-sport": (t) => [
    ...cardsAt(SPORT_CARDS, t),
    ...knows(SPORT_TERMES, t, (a) => `À quel sport associe-t-on ${a} ?`, (b) => `Quel terme est associé au sport suivant : ${b} ?`, (a, b) => `${cap(a)} est associé(e) à ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(JO, t, (a) => `Ville des Jeux olympiques d'été de ${a} ?`, (b) => `En quelle année ${b} a-t-elle accueilli les JO d'été ?`, (a, b) => `Les JO d'été de ${a} ont eu lieu à ${b}.`, (a, b) => `JO ${a} : ${b}.`),
    ...knows(COUPE_DU_MONDE, t, (a) => `Vainqueur de la Coupe du monde de football ${a} ?`, (b) => `Quelle Coupe du monde a gagnée ${b} ?`, (a, b) => `${cap(b)} a gagné la Coupe du monde ${a}.`, (a, b) => `Coupe du monde ${a} : ${b}.`),
  ],
  "cg-sciences": (t) => [
    ...knows(INVENTIONS, t, (a) => `À qui doit-on ${a} ?`, (b) => `Qu'a inventé ou découvert ${b} ?`, (a, b) => `On doit ${a} à ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(ELEMENTS, t, (a) => `Quel élément chimique a pour symbole ${a} ?`, (b) => `Symbole chimique de ${b} ?`, (a, b) => `${a} est le symbole de ${b}.`, (a, b) => `${a} : ${b}.`),
    ...cardsAt(SCIENCES_CARDS, t),
  ],
  "cg-espace": (t) => [
    ...cardsAt(ESPACE_CARDS, t),
    ...claimsAt(ESPACE_CLAIMS, t),
    ...knows(ORDRE_PLANETES, t, (a) => `Rang de ${a} en partant du Soleil ?`, (b) => `Quelle planète est la ${b} en partant du Soleil ?`, (a, b) => `${cap(a)} est la ${b} planète en partant du Soleil.`, (a, b) => `${cap(a)} : ${b} planète depuis le Soleil.`),
    ...knows(SATELLITES, t, (a) => `Autour de quel astre tourne ${a} ?`, (b) => `Quel satellite tourne autour de ${b} ?`, (a, b) => `${cap(a)} est un satellite de ${b}.`, (a, b) => `${cap(a)} tourne autour de ${b}.`),
    ...knows(MISSIONS, t, (a) => `Quel pays ou agence a réalisé ${a} ?`, (b) => `Quelle réussite spatiale doit-on à ${b} ?`, (a, b) => `${cap(a)} : ${b}.`, (a, b) => `${cap(a)} : ${b}.`),
  ],
  "cg-nature": (t) => [
    ...cardsAt(NATURE_CARDS, t),
    ...knows(PETITS, t, (a) => `Comment s'appelle le petit ${de(a)} ?`, (b) => `${cap(b)} est le petit de…`, (a, b) => `Le petit ${de(a)} s'appelle ${b}.`, (a, b) => `${cap(a)} → ${b}.`),
    ...knows(CRIS, t, (a) => `${cap(a)}…`, (b) => `Quel animal ${b} ?`, (a, b) => `${cap(a)} ${b}.`, (a, b) => `${cap(a)} ${b}.`),
  ],
  "cg-mythologie": (t) => [
    ...knows(DIEUX, t, (a) => `Nom romain ${dn(a)} ?`, (b) => `Nom grec ${dn(b)} ?`, (a, b) => `${a} s'appelle ${b} chez les Romains.`, (a, b) => `${a} (grec) = ${b} (romain).`),
    ...knows(DOMAINES, t, (a) => `Domaine ${dn(a)} ?`, (b) => `Quelle divinité grecque règne sur ${b} ?`, (a, b) => `${a} est la divinité de ${b}.`, (a, b) => `${a} : ${b}.`),
    ...knows(HEROS, t, (a) => `Que fait ${a} dans la mythologie ?`, (b) => `Quel personnage ${b} ?`, (a, b) => `${a} ${b}.`, (a, b) => `${a} ${b}.`),
    ...cardsAt(MYTHO_CARDS, t),
  ],
  "cg-langue": (t) => [
    ...knows(EXPRESSIONS, t, (a) => `Que signifie « ${a} » ?`, (b) => `Quelle expression signifie : ${b} ?`, (a, b) => `« ${cap(a)} » signifie ${b}.`, (a, b) => `« ${cap(a)} » : ${b}.`),
    ...cardsAt(LANGUE_CARDS, t),
  ],
  "cg-institutions": (t) => [
    ...knows(SIGLES, t, (a) => `Que signifie le sigle ${a} ?`, (b) => `Quel sigle désigne : ${b} ?`, (a, b) => `${a} signifie « ${b} ».`, (a, b) => `${a} : ${b}.`),
    ...cardsAt(INSTITUTIONS, t),
  ],
  "cg-gastronomie": (t) => [
    ...knows(PLATS_MONDE, t, (a) => `D'où vient ${a} ?`, (b) => `Quelle spécialité vient ${de(b)} ?`, (a, b) => `${cap(a)} est une spécialité ${de(b)}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...knows(PLATS_FRANCE, t, (a) => `De quelle ville ou région française vient ${a} ?`, (b) => `Quelle spécialité est associée ${b.startsWith("Le ") ? `au ${b.slice(3)}` : `à ${b}`} ?`, (a, b) => `${cap(a)} est une spécialité ${de(b)}.`, (a, b) => `${cap(a)} : ${b}.`),
    ...claimsAt(GASTRO_CLAIMS, t),
  ],
};

/** Le niveau devient la difficulté de la question (temps de réponse, affichage). */
const tagged = (g: Generator, d: Tier): Generator => Object.assign((r: Parameters<Generator>[0]) => ({ ...g(r), difficulty: d }), g.memo ? { memo: g.memo } : {});

/** Générateurs de chaque thème, niveau par niveau. */
export const CULTURE_TIERS: Record<string, Record<Tier, Generator[]>> = Object.fromEntries(
  Object.entries(THEMES).map(([id, build]) => [id, { 1: build(1).map((g) => tagged(g, 1)), 2: build(2).map((g) => tagged(g, 2)), 3: build(3).map((g) => tagged(g, 3)) }]),
);

/** Tous niveaux confondus (cartes mémoire, mélanges, mode démo). */
export const CULTURE: Record<string, Generator[]> = Object.fromEntries(Object.entries(CULTURE_TIERS).map(([id, t]) => [id, [...t[1], ...t[2], ...t[3]]]));

/** Nombre d'informations par thème et par niveau (pour l'affichage et les tests). */
export const CULTURE_FACTS: Record<string, Record<Tier, number>> = Object.fromEntries(
  Object.entries(CULTURE_TIERS).map(([id, t]) => [id, { 1: count(t[1]), 2: count(t[2]), 3: count(t[3]) }]),
);
function count(gens: Generator[]): number {
  return new Set(gens.flatMap((g) => (g.memo ?? []).map((m) => m.front))).size;
}
