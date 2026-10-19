/** Histoire-Géographie — thèmes complémentaires des programmes de lycée (2019). */
import { chrono } from "./histoire";
import { type Generator, type Pair, claims, int, mcq, numeric, pairs, pick, tex } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });
const people = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Qui était ${a} ?`, reverse: (b) => `Qui était ${b} ?`, claim: (a, b) => `${a} était ${b}.`, explain: (a, b) => `${a} : ${b}.` });

// ───────────── Seconde — L'État à l'époque moderne (France, Angleterre) ─────────────

const etatModerne: Generator[] = [
  ...chrono([
    ["Ordonnance de Villers-Cotterêts (le français, langue des actes officiels)", 1539], ["Création de l'Académie française par Richelieu", 1635], ["Début de la Fronde", 1648],
    ["Exécution du roi Charles Ier d'Angleterre", 1649], ["Début du règne personnel de Louis XIV", 1661], ["Installation de la cour à Versailles", 1682],
    ["Révocation de l'édit de Nantes (édit de Fontainebleau)", 1685], ["Débarquement de Guillaume d'Orange en Angleterre, début de la Glorieuse Révolution", 1688], ["Mort de Louis XIV", 1715],
  ]),
  ...people([
    ["Louis XIV", "le « Roi-Soleil », symbole de la monarchie absolue"], ["Richelieu", "le principal ministre de Louis XIII"], ["Colbert", "le contrôleur général des finances du mercantilisme"],
    ["Mazarin", "le ministre qui gouverne pendant la minorité de Louis XIV"], ["Oliver Cromwell", "le Lord Protecteur de la République anglaise"], ["Guillaume III d'Orange", "le roi installé par la Glorieuse Révolution"],
  ]),
  ...terms([
    ["monarchie absolue", "un régime où le roi concentre tous les pouvoirs, de droit divin"], ["mercantilisme", "une politique économique qui enrichit l'État par les exportations"],
    ["intendant", "le représentant du roi dans une généralité"], ["Fronde", "la révolte des nobles et des parlements contre le pouvoir royal (1648-1653)"],
    ["monarchie parlementaire", "un régime où le pouvoir du roi est limité par le Parlement"], ["Bill of Rights", "la déclaration de 1689 qui garantit les droits du Parlement anglais"],
    ["étiquette", "les règles de cérémonial qui organisent la vie de la cour"],
  ]),
];

// ───────────── Seconde — Des mobilités généralisées ─────────────

const mobilites: Generator[] = [
  ...terms([
    ["migrant international", "une personne qui vit dans un autre pays que son pays de naissance"], ["réfugié", "une personne qui fuit des persécutions et obtient une protection"],
    ["déplacé interne", "une personne forcée de fuir mais restée dans son propre pays"], ["remises (transferts de fonds)", "l'argent envoyé par les migrants à leur famille restée au pays"],
    ["brain drain (fuite des cerveaux)", "l'émigration de personnes diplômées"], ["tourisme international", "les déplacements de loisirs d'au moins une nuit hors de son pays"],
    ["mobilité pendulaire", "les trajets quotidiens entre domicile et travail"], ["pays d'accueil", "le pays où s'installent les migrants"], ["frontière", "la limite entre deux territoires souverains"],
  ]),
  (r) => {
    const [what, value, wrongs] = pick(r, [
      ["Nombre de migrants internationaux dans le monde (2020)", "281 millions", ["28 millions", "1,4 milliard", "2,8 milliards"]],
      ["Arrivées de touristes internationaux dans le monde (2019)", "1,5 milliard", ["150 millions", "15 milliards", "500 millions"]],
      ["Premier pays d'accueil des migrants internationaux", "les États-Unis", ["l'Allemagne", "l'Arabie saoudite", "la Russie"]],
      ["Pays le plus visité au monde par les touristes internationaux", "la France", ["l'Espagne", "les États-Unis", "l'Italie"]],
    ] as const);
    return mcq(r, `${what} ?`, value, [...wrongs], `${what} : ${value}.`);
  },
  (r) => {
    const pop = pick(r, [5, 10, 20, 50]), pct = pick(r, [2, 3, 4, 10, 12, 15]);
    return numeric(`Un pays de $${pop}$ millions d'habitants compte $${pct}\\,\\%$ d'immigrés. Combien (en millions) ?`, (pop * pct) / 100, `$${pop} \\times ${tex(pct / 100)}$.`, "M", 0.01);
  },
  claims([
    ["Les migrations Sud-Sud sont aussi nombreuses que les migrations Sud-Nord.", true, "Environ un tiers des migrants internationaux chacune (ONU)."],
    ["Les migrants représentent environ 3,5 % de la population mondiale.", true, "Environ 281 millions de personnes en 2020."],
    ["La majorité des migrants internationaux sont des réfugiés.", false, "Les réfugiés (environ 35 millions en 2022) ne représentent qu'une minorité des quelque 281 millions de migrants : la plupart migrent pour le travail ou la famille."],
    ["La Méditerranée est l'une des routes migratoires les plus meurtrières.", true, "Des dizaines de milliers de morts depuis 2014."],
  ]),
];

// ───────────── Seconde — L'Afrique australe ─────────────

const afrique: Generator[] = [
  ...pairs(
    [["l'Afrique du Sud", "Pretoria (capitale administrative)"], ["la Namibie", "Windhoek"], ["le Botswana", "Gaborone"], ["le Zimbabwe", "Harare"], ["le Mozambique", "Maputo"], ["la Zambie", "Lusaka"], ["l'Angola", "Luanda"], ["Madagascar", "Antananarivo"]],
    { ask: (a) => `Capitale de ${a} ?`, reverse: (b) => `${b} est la capitale de…`, claim: (a, b) => `La capitale de ${a} est ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...chrono([
    ["Victoire électorale du Parti national, qui instaure l'apartheid", 1948], ["Massacre de Sharpeville", 1960], ["Condamnation de Nelson Mandela à la prison à vie (procès de Rivonia)", 1964], ["Émeutes de Soweto", 1976],
    ["Libération de Nelson Mandela", 1990], ["Abolition des dernières lois de l'apartheid", 1991], ["Élection de Nelson Mandela à la présidence", 1994], ["Coupe du monde de football en Afrique du Sud", 2010],
  ]),
  ...terms([
    ["apartheid", "la ségrégation raciale institutionnalisée en Afrique du Sud (1948-1991)"], ["township", "un quartier périphérique pauvre créé pour les populations noires"],
    ["nation arc-en-ciel", "l'image d'une Afrique du Sud multiculturelle réconciliée"], ["SADC", "la communauté de développement de l'Afrique australe"], ["rente minière", "les revenus tirés de l'exploitation des ressources du sous-sol"],
    ["stress hydrique", "un manque d'eau par rapport aux besoins"],
  ]),
  claims([
    ["L'Afrique du Sud est la première puissance économique d'Afrique australe.", true, "Elle fait partie des BRICS."],
    ["L'Afrique du Sud est l'un des pays les plus inégalitaires au monde.", true, "Héritage de l'apartheid."],
    ["Le Botswana tire une grande partie de ses revenus des diamants.", true, "C'est l'un des premiers producteurs mondiaux."],
  ]),
];

// ───────────── Première — La France dans l'Europe des nationalités (1848-1871) ─────────────

const nationalites: Generator[] = [
  ...chrono([
    ["Révolution de février et proclamation de la IIe République", 1848], ["Coup d'État de Louis-Napoléon Bonaparte", 1851], ["Proclamation du Second Empire", 1852],
    ["Proclamation du royaume d'Italie", 1861], ["Défaite de Sedan et chute du Second Empire", 1870], ["Proclamation de l'Empire allemand à Versailles", 1871],
    ["Commune de Paris", 1871], ["Transfert de la capitale de l'Italie à Rome", 1871],
  ]),
  ...people([
    ["Napoléon III", "l'empereur des Français de 1852 à 1870"], ["Bismarck", "le chancelier prussien artisan de l'unité allemande"], ["Cavour", "le ministre piémontais artisan de l'unité italienne"],
    ["Garibaldi", "le chef de l'expédition des Mille en Sicile"], ["le baron Haussmann", "le préfet qui transforme Paris sous le Second Empire"], ["Victor Schœlcher", "l'artisan de l'abolition de l'esclavage en 1848"],
    ["Adolphe Thiers", "le chef du gouvernement qui écrase la Commune"], ["Louise Michel", "l'institutrice communarde déportée en Nouvelle-Calédonie"],
  ]),
  ...terms([
    ["nationalité (principe des)", "l'idée que chaque peuple doit former un État"], ["suffrage universel masculin", "le droit de vote accordé à tous les hommes adultes (1848)"],
    ["plébiscite", "un vote par lequel le peuple approuve le pouvoir d'un homme"], ["Printemps des peuples", "la vague de révolutions européennes de 1848"],
    ["Alsace-Moselle", "les territoires annexés par l'Allemagne en 1871"], ["Commune de Paris", "l'insurrection parisienne écrasée lors de la Semaine sanglante (1871)"],
  ]),
];

// ───────────── Première — La IIIe République et l'empire colonial ─────────────

const troisieme: Generator[] = [
  ...chrono([
    ["Proclamation de la IIIe République", 1870], ["Loi sur la liberté de la presse", 1881], ["Loi Ferry : école laïque et obligatoire", 1882], ["Loi autorisant les syndicats", 1884],
    ["Acte général de la conférence de Berlin sur l'Afrique", 1885], ["Début de l'affaire Dreyfus", 1894], ["« J'accuse… ! » de Zola", 1898], ["Loi sur les associations", 1901],
    ["Loi de séparation des Églises et de l'État", 1905], ["Réhabilitation du capitaine Dreyfus", 1906], ["Assassinat de Jean Jaurès", 1914],
  ]),
  ...people([
    ["Jules Ferry", "le ministre des lois scolaires, partisan de l'expansion coloniale"], ["Alfred Dreyfus", "l'officier juif injustement condamné pour trahison"], ["Jean Jaurès", "le leader socialiste pacifiste"],
    ["Georges Clemenceau", "le chef radical qui combat la politique coloniale de Jules Ferry"], ["Émile Zola", "l'écrivain auteur de « J'accuse… ! »"], ["Léon Gambetta", "le fondateur républicain qui proclame la République en 1870"],
  ]),
  ...pairs(
    [["l'Algérie", "1830 (début de la conquête)"], ["la Tunisie", "1881 (protectorat)"], ["Madagascar", "1896 (colonie)"], ["le Maroc", "1912 (protectorat)"], ["l'Indochine", "1887 (Union indochinoise)"]],
    { ask: (a) => `Date de la domination française sur ${a} ?`, reverse: (b) => `Quel territoire passe sous domination française en ${b} ?`, claim: (a, b) => `La domination française sur ${a} date de ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...terms([
    ["laïcité", "la séparation des Églises et de l'État et la neutralité religieuse de l'État"], ["Code de l'indigénat", "le régime juridique discriminatoire imposé aux colonisés"],
    ["protectorat", "un territoire dominé qui conserve en apparence ses institutions"], ["antisémitisme", "l'hostilité envers les Juifs"], ["République opportuniste", "les républicains modérés au pouvoir dans les années 1880"],
  ]),
];

// ───────────── Terminale — Décolonisation et monde bipolaire ─────────────

const decolonisation: Generator[] = [
  ...chrono([
    ["Création de l'ONU", 1945], ["Indépendance de l'Inde et du Pakistan", 1947], ["Création de l'État d'Israël", 1948], ["Proclamation de la République populaire de Chine", 1949],
    ["Défaite française de Diên Biên Phu", 1954], ["Début de la guerre d'Algérie", 1954], ["Conférence de Bandung", 1955], ["Crise de Suez", 1956],
    ["« Année de l'Afrique » : 17 indépendances", 1960], ["Indépendance de l'Algérie", 1962],
  ]),
  ...people([
    ["Gandhi", "le leader de la non-violence pour l'indépendance de l'Inde"], ["Nehru", "le premier Premier ministre de l'Inde, figure du non-alignement"], ["Hô Chi Minh", "le leader indépendantiste vietnamien"],
    ["Nasser", "le dirigeant égyptien qui nationalise le canal de Suez"], ["Mao Zedong", "le fondateur de la République populaire de Chine"], ["Ben Bella", "un chef du FLN, premier président de l'Algérie"],
    ["Patrice Lumumba", "le premier Premier ministre du Congo indépendant"], ["Léopold Sédar Senghor", "le premier président du Sénégal"],
  ]),
  ...terms([
    ["décolonisation", "le processus d'accès à l'indépendance des colonies"], ["Tiers-Monde", "l'ensemble des pays pauvres et sous-développés, « ignoré, exploité, méprisé comme le tiers état » (A. Sauvy, 1952)"],
    ["non-alignement", "le refus de choisir entre les deux blocs"], ["FLN", "le Front de libération nationale algérien"], ["harkis", "les supplétifs algériens de l'armée française"],
    ["pieds-noirs", "les Français d'Algérie rapatriés en 1962"], ["néocolonialisme", "la domination économique persistante des anciennes métropoles"],
  ]),
];

// ───────────── Terminale — La construction européenne et l'UE ─────────────

const europe: Generator[] = [
  ...chrono([
    ["Déclaration Schuman", 1950], ["Signature du traité de Paris créant la CECA", 1951], ["Signature des traités de Rome (CEE, Euratom)", 1957], ["Traité de l'Élysée franco-allemand", 1963],
    ["Premières élections du Parlement européen au suffrage universel", 1979], ["Signature des accords de Schengen", 1985], ["Signature de l'Acte unique européen", 1986], ["Signature du traité de Maastricht (Union européenne)", 1992],
    ["Élargissement à dix nouveaux pays", 2004], ["Signature du traité de Lisbonne", 2007], ["Sortie du Royaume-Uni (Brexit)", 2020],
  ]),
  ...pairs(
    [["la Commission européenne", "propose les lois et veille à l'application des traités"], ["le Parlement européen", "vote les lois et le budget avec le Conseil de l'UE"], ["le Conseil européen", "réunit les chefs d'État ou de gouvernement et fixe les grandes orientations"], ["la Cour de justice de l'UE", "veille au respect du droit européen"], ["la Banque centrale européenne", "conduit la politique monétaire de la zone euro"], ["le Conseil de l'Union européenne", "réunit les ministres des États membres et vote les lois"]],
    { ask: (a) => `Rôle de ${a} ?`, reverse: (b) => `Quelle institution ${b} ?`, claim: (a, b) => `${cap(a)} ${b}.`, explain: (a, b) => `${cap(a)} ${b}.` },
  ),
  ...people([["Robert Schuman", "le ministre français de la déclaration du 9 mai 1950"], ["Jean Monnet", "le premier président de la Haute Autorité de la CECA (1952), ancien commissaire général au Plan"], ["Konrad Adenauer", "le chancelier ouest-allemand de la réconciliation"], ["Jacques Delors", "le président de la Commission de l'Acte unique et de Maastricht"]]),
  (r) => {
    const n = int(r, 0, 2);
    const q = [["Nombre d'États membres de l'UE (depuis 2020)", "27", ["25", "28", "30"]], ["Nombre de pays de la zone euro (2026)", "21", ["12", "27", "17"]], ["Siège du Parlement européen (sessions plénières)", "Strasbourg", ["Bruxelles", "Luxembourg", "Francfort"]]] as const;
    const [p, a, w] = q[n];
    return mcq(r, `${p} ?`, a, [...w], `${p} : ${a}.`);
  },
];

// ───────────── Terminale — Le monde depuis les années 1990 ─────────────

const monde1990: Generator[] = [
  ...chrono([
    ["Réunification allemande", 1990], ["Début des guerres de Yougoslavie", 1991], ["Génocide des Tutsi au Rwanda", 1994], ["Massacre de Srebrenica", 1995],
    ["Attentats du 11 septembre", 2001], ["Invasion de l'Irak par les États-Unis", 2003], ["Faillite de la banque Lehman Brothers (crise financière mondiale)", 2008], ["Chute de Ben Ali et de Moubarak (Printemps arabes)", 2011],
    ["Adoption de l'accord de Paris sur le climat (COP21)", 2015], ["Déclaration de la pandémie de Covid-19 par l'OMS", 2020], ["Invasion de l'Ukraine par la Russie", 2022],
  ]),
  ...terms([
    ["multilatéralisme", "la coopération entre de nombreux États au sein d'organisations internationales"], ["gouvernance mondiale", "l'ensemble des règles et institutions qui régulent le monde"],
    ["BRICS", "le groupe de puissances émergentes autour du Brésil, de la Russie, de l'Inde, de la Chine et de l'Afrique du Sud"], ["hyperpuissance", "une puissance dominante dans tous les domaines (les États-Unis des années 1990)"],
    ["terrorisme", "l'usage de la violence contre des civils pour des objectifs politiques"], ["Cour pénale internationale", "la juridiction qui juge les génocides et crimes contre l'humanité depuis 2002"],
  ]),
  claims([
    ["Le génocide des Tutsi au Rwanda a fait environ 800 000 morts en 1994.", true, "En une centaine de jours."],
    ["L'Accord de Paris vise à limiter le réchauffement bien en dessous de 2 °C.", true, "Si possible 1,5 °C."],
    ["Les Printemps arabes ont débuté en Tunisie.", true, "Fin 2010 - début 2011."],
    ["Le Conseil de sécurité de l'ONU compte 5 membres permanents avec droit de veto.", true, "États-Unis, Russie, Chine, France, Royaume-Uni."],
    ["L'Inde est membre permanent du Conseil de sécurité de l'ONU.", false, "Elle le réclame, comme le Brésil, l'Allemagne ou le Japon, mais les cinq membres permanents n'ont pas changé depuis 1945."],
    ["Les États-Unis ont ratifié le statut de la Cour pénale internationale.", false, "Ils l'ont signé en 2000 sans jamais le ratifier ; la Chine et l'Inde ne l'ont pas signé."],
  ]),
];

export const HISTOIRE2: Record<string, Generator[]> = {
  "hg-2-etat-moderne": etatModerne,
  "hg-2-mobilites": mobilites,
  "hg-2-afrique-australe": afrique,
  "hg-1-nationalites": nationalites,
  "hg-1-troisieme-republique": troisieme,
  "hg-t-decolonisation": decolonisation,
  "hg-t-europe": europe,
  "hg-t-monde-1990": monde1990,
};
