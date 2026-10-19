/** Générateurs de questions — Histoire-Géographie (Seconde, Première, Terminale). */
import { type Generator, type Pair, cards, claims, int, mcq, numeric, pairs, pick, sample, tf, withFact } from "./kit";

type Event = readonly [string, number];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const year = (y: number) => (y < 0 ? `${-y} av. J.-C.` : String(y));
/** « Événement : année. », sans doubler le point après « av. J.-C. ». */
const dated = (e: string, y: number) => `${e} : ${year(y)}${y < 0 ? "" : "."}`;

/** Les six ordres de trois éléments ; le premier est l'ordre trié (la bonne réponse). */
const ORDERS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]] as const;

/**
 * Cinq générateurs à partir d'une frise d'événements : trouver l'année,
 * l'événement d'une année, le plus ancien (ou le plus récent) parmi quatre,
 * l'ordre chronologique de trois événements, et vrai/faux sur une date.
 * Les leurres sont pris parmi les événements les plus proches dans le temps,
 * pour qu'on ne puisse pas répondre en éliminant les anachronismes évidents.
 */
export function chrono(events: readonly Event[]): Generator[] {
  const uniqueYears = events.filter(([, y]) => events.filter(([, z]) => z === y).length === 1);
  const oneByYear = events.filter((x, i) => events.findIndex((z) => z[1] === x[1]) === i);
  return [
    (r) => {
      const [e, y] = pick(r, events);
      return withFact(mcq(r, `En quelle année : **${e}** ?`, year(y), [y - int(r, 1, 4), y + int(r, 1, 4), y + pick(r, [-15, -10, 10, 12, 20]), y - pick(r, [5, 6, 7, 8])].map(year),
        dated(e, y), () => year(y + int(r, -25, 25))), e);
    },
    (r) => {
      const [e, y] = pick(r, uniqueYears.length >= 4 ? uniqueYears : events);
      // Les quatre événements d'autres années les plus proches (le QCM en garde trois).
      const near = events.filter(([, z]) => z !== y).sort((a, b) => Math.abs(a[1] - y) - Math.abs(b[1] - y)).slice(0, 4);
      return withFact(mcq(r, `Que s'est-il passé en **${year(y)}** ?`, e, near.map(([x]) => x), `${year(y)} : ${e}.`, undefined, 2), e);
    },
    (r) => {
      // Un seul événement par année, pour qu'il y ait toujours un plus ancien (ou récent) sans ambiguïté.
      const four = sample(r, oneByYear, 4);
      const latest = r() < 0.35;
      const target = four.reduce((m, x) => ((latest ? x[1] > m[1] : x[1] < m[1]) ? x : m));
      return withFact(
        mcq(r, `Lequel de ces événements est le **plus ${latest ? "récent" : "ancien"}** ?`, target[0], four.map(([x]) => x), [...four].sort((a, b) => a[1] - b[1]).map(([x, y]) => `${x} (${year(y)})`).join(" · "), undefined, 2),
        target[0],
      );
    },
    (r) => {
      const three = sample(r, oneByYear, 3);
      const sorted = [...three].sort((a, b) => a[1] - b[1]);
      const label = (order: readonly number[]) => order.map((i) => "ABC"[three.indexOf(sorted[i])]).join(" → ");
      return withFact(
        mcq(r, `Du plus ancien au plus récent : **A.** ${three[0][0]} ; **B.** ${three[1][0]} ; **C.** ${three[2][0]}`, label(ORDERS[0]), ORDERS.slice(1).map(label),
          sorted.map(([x, y]) => `${x} (${year(y)})`).join(" → "), undefined, 2),
        ...sorted.map(([x]) => x),
      );
    },
    (r) => {
      const [e, y] = pick(r, events);
      const right = r() < 0.5;
      const shown = right ? y : y + pick(r, [-20, -10, -5, -3, -2, -1, 1, 2, 3, 5, 10, 20]);
      return withFact(tf(dated(e, shown), right, dated(e, y)), e);
    },
  ];
}

/** Définitions : terme ↔ définition, dans les deux sens, plus vrai/faux. */
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });

/** Personnages : nom ↔ rôle. */
const people = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Qui était ${a} ?`, reverse: (b) => `Qui était ${b} ?`, claim: (a, b) => `${a} était ${b}.`, explain: (a, b) => `${a} : ${b}.` });

// ───────────── Seconde ─────────────

const antiquite: Generator[] = [
  ...chrono([
    ["Fondation légendaire de Rome", -753], ["Victoire grecque de Salamine sur les Perses", -480], ["Bataille de Marathon", -490], ["Début de la guerre du Péloponnèse", -431],
    ["Mort de Périclès", -429], ["Procès et mort de Socrate", -399], ["Assassinat de Jules César", -44], ["Bataille d'Actium", -31], ["Octave reçoit le titre d'Auguste", -27],
    ["Édit de Caracalla : citoyenneté pour tous les hommes libres de l'Empire", 212], ["Édit de Milan : liberté de culte pour les chrétiens", 313], ["Fin de l'Empire romain d'Occident", 476],
  ]),
  ...terms([
    ["ecclésia", "l'assemblée des citoyens athéniens qui vote les lois"], ["boulè", "le conseil qui prépare les lois à Athènes"], ["métèque", "un étranger libre résidant à Athènes, sans droits politiques"],
    ["stratège", "un magistrat athénien élu chargé de l'armée"], ["ostracisme", "le bannissement d'un citoyen par vote pour dix ans"], ["Sénat romain", "l'assemblée des anciens magistrats de Rome"],
    ["consul", "l'un des deux magistrats principaux de la République romaine"], ["romanisation", "la diffusion du mode de vie romain dans l'Empire"], ["misthos", "l'indemnité versée aux citoyens pauvres pour participer à la vie politique"],
    ["Forum", "la place publique, centre de la vie politique d'une cité romaine"],
  ]),
  ...people([
    ["Périclès", "le stratège symbole de l'apogée de la démocratie athénienne"], ["Clisthène", "le réformateur à l'origine de la démocratie athénienne"], ["Auguste", "le premier empereur romain"],
    ["Caracalla", "l'empereur qui étend la citoyenneté à tous les hommes libres"], ["Constantin", "le premier empereur romain converti au christianisme"], ["Claude", "l'empereur qui ouvre le Sénat aux notables gaulois (table claudienne)"],
  ]),
  claims([
    ["À Athènes, les femmes étaient citoyennes et votaient à l'ecclésia.", false, "Seuls les hommes libres nés de parents athéniens étaient citoyens."],
    ["Les esclaves étaient exclus de la citoyenneté athénienne.", true, "Comme les femmes et les métèques."],
    ["La citoyenneté romaine pouvait être accordée à des non-Romains.", true, "Elle s'étend progressivement jusqu'à l'édit de Caracalla (212)."],
    ["Depuis la loi de Périclès (451 av. J.-C.), il suffit d'avoir un père athénien pour être citoyen.", false, "Il faut désormais être né d'un père citoyen et d'une mère elle-même fille de citoyen."],
  ]),
];

const moyenAge: Generator[] = [
  ...chrono([
    ["Hégire : départ de Mahomet de La Mecque pour Médine", 622], ["Mort de Mahomet", 632], ["Bataille de Poitiers (date traditionnelle)", 732], ["Fondation de Bagdad", 762], ["Couronnement impérial de Charlemagne", 800],
    ["Schisme entre les Églises de Rome et de Constantinople", 1054], ["Prise de Tolède par Alphonse VI", 1085], ["Appel à la croisade d'Urbain II", 1095], ["Prise de Jérusalem par les croisés", 1099],
    ["Sac de Constantinople par la quatrième croisade", 1204], ["Prise de Constantinople par les Ottomans", 1453], ["Prise de Grenade, fin de la Reconquista", 1492],
  ]),
  ...terms([
    ["califat", "un territoire dirigé par un calife, successeur du Prophète"], ["croisade", "une expédition militaire chrétienne vers la Terre sainte"], ["Reconquista", "la reconquête chrétienne de la péninsule Ibérique"],
    ["dhimmi", "un non-musulman protégé en terre d'islam moyennant un impôt"], ["schisme", "une séparation entre deux Églises"], ["Empire byzantin", "l'Empire romain d'Orient, capitale Constantinople"],
    ["chrétienté", "l'ensemble des territoires et peuples chrétiens"], ["pèlerinage", "un voyage vers un lieu saint"], ["comptoir", "un établissement commercial installé à l'étranger"],
  ]),
  ...pairs(
    [["Constantinople", "l'Empire byzantin"], ["Bagdad", "le califat abbasside"], ["Cordoue", "le califat omeyyade d'al-Andalus"], ["Rome", "la papauté"], ["Venise", "une puissante république marchande"]],
    { ask: (a) => `${a} était le centre de…`, reverse: (b) => `Quelle ville était le centre de ${b} ?`, claim: (a, b) => `${a} était le centre de ${b}.`, explain: (a, b) => `${a} : ${b}.` },
  ),
  claims([
    ["Venise et Gênes contrôlent une grande partie du commerce méditerranéen au Moyen Âge.", true, "Grâce à leurs comptoirs."],
    ["Les croisés conservent un royaume en Terre sainte jusqu'à la fin du Moyen Âge.", false, "Saint-Jean-d'Acre, dernière place des croisés, tombe en 1291 face aux Mamelouks."],
    ["Les savants arabes ont transmis des textes grecs à l'Occident.", true, "Traductions à Tolède notamment."],
  ]),
];

const renaissance: Generator[] = [
  ...chrono([
    ["Prise de Constantinople par les Ottomans", 1453], ["Christophe Colomb atteint l'Amérique", 1492], ["Traité de Tordesillas", 1494], ["Vasco de Gama atteint l'Inde", 1498],
    ["Les 95 thèses de Luther", 1517], ["Départ de l'expédition de Magellan", 1519], ["Prise de Tenochtitlan par Cortés", 1521], ["Calvin publie l'Institution de la religion chrétienne (première édition, en latin)", 1536],
    ["Copernic publie sa théorie héliocentrique", 1543], ["Ouverture du concile de Trente", 1545], ["Massacre de la Saint-Barthélemy", 1572], ["Édit de Nantes", 1598],
  ]),
  ...people([
    ["Érasme", "un humaniste néerlandais, auteur de l'Éloge de la folie"], ["Léonard de Vinci", "un artiste et ingénieur, peintre de la Joconde"], ["Michel-Ange", "le peintre du plafond de la chapelle Sixtine"],
    ["Martin Luther", "le moine allemand à l'origine de la Réforme protestante"], ["Jean Calvin", "le réformateur protestant installé à Genève"], ["Nicolas Copernic", "l'astronome polonais auteur du De revolutionibus (1543)"],
    ["Galilée", "le savant condamné pour avoir défendu l'héliocentrisme"], ["Gutenberg", "l'inventeur de l'imprimerie à caractères mobiles"], ["Magellan", "le navigateur dont l'expédition réalise le premier tour du monde"],
    ["Hernán Cortés", "le conquistador qui soumet l'Empire aztèque"], ["Henri IV", "le roi qui signe l'édit de Nantes"],
  ]),
  ...terms([
    ["humanisme", "un mouvement qui place l'homme et l'étude des textes antiques au centre"], ["Réforme", "le mouvement religieux qui donne naissance au protestantisme"],
    ["Contre-Réforme", "la réaction de l'Église catholique face au protestantisme"], ["mécène", "une personne riche qui finance artistes et savants"], ["conquistador", "un conquérant espagnol en Amérique"],
    ["héliocentrisme", "la théorie qui place le Soleil au centre"],
  ]),
];

const lumieres: Generator[] = [
  ...chrono([
    ["Habeas Corpus en Angleterre", 1679], ["Débarquement de Guillaume d'Orange en Angleterre, début de la Glorieuse Révolution", 1688], ["Bill of Rights anglais", 1689], ["Montesquieu publie De l'esprit des lois", 1748],
    ["Premier volume de l'Encyclopédie", 1751], ["Rousseau publie Du contrat social", 1762], ["Voltaire publie le Traité sur la tolérance", 1763], ["Déclaration d'indépendance des États-Unis", 1776],
    ["Traité de Paris : indépendance américaine reconnue", 1783], ["Signature de la Constitution des États-Unis (convention de Philadelphie)", 1787], ["Début de la révolte des esclaves de Saint-Domingue", 1791],
  ]),
  ...people([
    ["Montesquieu", "l'auteur de De l'esprit des lois (1748)"], ["Voltaire", "l'auteur du Traité sur la tolérance, défenseur de Jean Calas"], ["Jean-Jacques Rousseau", "l'auteur du Contrat social, théoricien de la volonté générale"],
    ["Denis Diderot", "le directeur de l'Encyclopédie avec d'Alembert"], ["John Locke", "le philosophe anglais des droits naturels"], ["George Washington", "le premier président des États-Unis"],
    ["Thomas Jefferson", "le principal rédacteur de la Déclaration d'indépendance"], ["Toussaint Louverture", "le chef de la révolte des esclaves de Saint-Domingue"],
  ]),
  ...terms([
    ["monarchie parlementaire", "un régime où le roi partage le pouvoir avec un Parlement"], ["séparation des pouvoirs", "le partage des pouvoirs législatif, exécutif et judiciaire"],
    ["despotisme éclairé", "un pouvoir absolu inspiré par certaines idées des Lumières"], ["salon", "un lieu de discussion des idées tenu par une hôtesse"], ["fédéralisme", "le partage du pouvoir entre un État central et des États fédérés"],
  ]),
];

const environnement: Generator[] = [
  ...terms([
    ["développement durable", "un développement qui répond aux besoins présents sans compromettre ceux des générations futures"], ["aléa", "un phénomène naturel ou technologique potentiellement dangereux"],
    ["vulnérabilité", "la fragilité d'une société face à un aléa"], ["risque", "la combinaison d'un aléa et d'une vulnérabilité"], ["résilience", "la capacité d'une société à se relever après une catastrophe"],
    ["ressource renouvelable", "une ressource qui se reconstitue à l'échelle humaine"], ["transition énergétique", "le passage des énergies fossiles vers des énergies décarbonées"],
    ["empreinte écologique", "la surface nécessaire pour produire ce qu'une population consomme et absorber ses déchets"], ["stress hydrique", "une situation où la demande en eau dépasse les ressources disponibles"],
    ["énergie fossile", "une énergie issue de la décomposition ancienne d'êtres vivants (pétrole, gaz, charbon)"],
  ]),
  (r) => {
    const [src, renew] = pick(r, [["le solaire", true], ["l'éolien", true], ["l'hydroélectricité", true], ["la biomasse", true], ["la géothermie", true], ["le pétrole", false], ["le charbon", false], ["le gaz naturel", false], ["l'uranium (nucléaire)", false]] as const);
    return tf(`${cap(src)} est une énergie renouvelable.`, renew, `${cap(src)} : énergie ${renew ? "renouvelable" : "non renouvelable (stock limité)"}.`);
  },
  (r) => {
    const [ev, kind] = pick(r, [["un séisme", "naturel"], ["une crue", "naturel"], ["un cyclone", "naturel"], ["l'explosion d'une usine chimique", "technologique"], ["une marée noire", "technologique"], ["un accident nucléaire", "technologique"], ["une éruption volcanique", "naturel"], ["la rupture d'un barrage", "technologique"], ["une épidémie de choléra", "sanitaire"], ["un glissement de terrain", "naturel"], ["une pandémie de grippe", "sanitaire"], ["la fuite d'un gazoduc", "technologique"],
      ["l'accident nucléaire de Fukushima causé par un tsunami", "naturel et technologique à la fois"], ["une fuite de produits toxiques causée par l'inondation d'une usine", "naturel et technologique à la fois"]] as const);
    return mcq(r, `${cap(ev)} relève d'un risque…`, kind, ["naturel", "technologique", "sanitaire", "naturel et technologique à la fois"].filter((k) => k !== kind), `${cap(ev)} : risque ${kind}${kind.includes("à la fois") ? " (un aléa naturel déclenche un accident technologique : on parle de risque « natech »)" : ""}.`);
  },
  (r) => {
    const pop = pick(r, [2, 5, 10, 20, 50]), conso = pick(r, [50, 100, 150, 200, 250]);
    return numeric(`Une ville de $${pop}$ millions d'habitants consomme $${conso}$ L d'eau par habitant et par jour. Consommation quotidienne (millions de litres) ?`, pop * conso, `$${pop} \\times ${conso}$.`, "ML");
  },
];

// ───────────── Première ─────────────

const revolution: Generator[] = [
  ...chrono([
    ["Ouverture des États généraux", 1789], ["Fuite du roi à Varennes", 1791], ["Proclamation de la Ire République", 1792], ["Exécution de Louis XVI", 1793],
    ["Chute de Robespierre (9 thermidor)", 1794], ["Coup d'État du 18 brumaire de Bonaparte", 1799], ["Signature du Concordat avec le pape", 1801], ["Code civil", 1804],
    ["Bataille d'Austerlitz", 1805], ["Campagne de Russie", 1812], ["Bataille de Waterloo", 1815],
  ]),
  ...people([
    ["Maximilien de Robespierre", "le chef montagnard du Comité de salut public, renversé le 9 thermidor"], ["Georges Danton", "le tribun de la patrie en danger (« De l'audace… », 1792), chef des Indulgents"], ["Louis XVI", "le roi guillotiné en 1793"],
    ["l'abbé Sieyès", "l'auteur de « Qu'est-ce que le tiers état ? »"], ["La Fayette", "le héros de la guerre d'Amérique, commandant de la garde nationale"], ["Olympe de Gouges", "l'autrice de la Déclaration des droits de la femme et de la citoyenne"],
    ["Napoléon Bonaparte", "le général devenu Premier consul puis empereur"], ["Marat", "le journaliste de L'Ami du peuple, assassiné en 1793"],
  ]),
  ...terms([
    ["tiers état", "l'ordre de ceux qui ne sont ni nobles ni membres du clergé"], ["monarchie constitutionnelle", "un régime où le pouvoir du roi est limité par une constitution"],
    ["Terreur", "la période de répression des opposants (1793-1794)"], ["sans-culottes", "les révolutionnaires parisiens issus du peuple"], ["suffrage censitaire", "un vote réservé à ceux qui paient un certain impôt"],
    ["Code civil", "le recueil des lois civiles de 1804 (égalité devant la loi, propriété)"], ["privilèges", "les avantages juridiques et fiscaux de la noblesse et du clergé"],
  ]),
  (r) => {
    const [e, d] = pick(r, [["la prise de la Bastille", "14 juillet 1789"], ["l'abolition des privilèges", "4 août 1789"], ["la Déclaration des droits de l'homme et du citoyen", "26 août 1789"], ["le serment du Jeu de paume", "20 juin 1789"], ["la fête de la Fédération", "14 juillet 1790"]] as const);
    return mcq(r, `Date de ${e} ?`, d, ["14 juillet 1789", "4 août 1789", "26 août 1789", "20 juin 1789", "14 juillet 1790", "5 mai 1789"], `${cap(e)} : ${d}.`);
  },
];

const industrie: Generator[] = [
  ...chrono([
    ["Brevet de la machine à vapeur perfectionnée de James Watt", 1769], ["Loi Le Chapelier interdisant les coalitions ouvrières et patronales", 1791], ["Inauguration de la ligne de chemin de fer Liverpool-Manchester", 1830],
    ["Manifeste du parti communiste de Marx et Engels", 1848], ["Exposition universelle de Londres (Crystal Palace)", 1851], ["Droit de grève en France", 1864], ["Commune de Paris", 1871],
    ["Loi Waldeck-Rousseau autorisant les syndicats", 1884], ["Inauguration de la tour Eiffel", 1889], ["Encyclique Rerum Novarum", 1891], ["Création de la CGT", 1895],
  ]),
  ...terms([
    ["prolétariat", "la classe des ouvriers qui ne possèdent que leur force de travail"], ["bourgeoisie", "la classe qui possède les moyens de production et le capital"],
    ["exode rural", "le départ massif des habitants des campagnes vers les villes"], ["capitalisme", "un système économique fondé sur la propriété privée et la recherche du profit"],
    ["syndicat", "une association qui défend les intérêts des travailleurs"], ["socialisme", "une doctrine qui veut abolir l'exploitation des ouvriers"], ["urbanisation", "l'augmentation de la part de la population vivant en ville"],
    ["libéralisme économique", "une doctrine favorable à la libre concurrence et à un État peu interventionniste"], ["société anonyme", "une entreprise dont le capital est divisé en actions"],
  ]),
  ...people([
    ["Karl Marx", "le penseur du communisme, auteur du Capital"], ["James Watt", "l'ingénieur qui perfectionne la machine à vapeur"], ["Jules Ferry", "le ministre qui rend l'école gratuite, laïque et obligatoire"],
    ["Émile Zola", "le romancier de Germinal, sur la condition des mineurs"], ["Gustave Eiffel", "l'ingénieur de la tour construite pour l'Exposition de 1889"],
  ]),
];

const ww1: Generator[] = [
  ...chrono([
    ["Attentat de Sarajevo", 1914], ["Première bataille de la Marne", 1914], ["Début du génocide des Arméniens (rafle des élites arméniennes d'Istanbul)", 1915], ["Bataille de Verdun", 1916], ["Entrée en guerre des États-Unis", 1917],
    ["Révolution bolchevique en Russie", 1917], ["Armistice du 11 novembre", 1918], ["Traité de Versailles", 1919], ["Entrée en vigueur du pacte de la Société des Nations", 1920],
  ]),
  ...terms([
    ["guerre totale", "une guerre qui mobilise toutes les ressources humaines, économiques et morales d'un pays"], ["poilu", "le surnom du soldat français de la Grande Guerre"],
    ["guerre de position", "une guerre où les armées s'enterrent dans des tranchées"], ["Union sacrée", "le rassemblement de toutes les forces politiques françaises en 1914"],
    ["mutineries", "les refus collectifs d'obéir des soldats en 1917"], ["génocide", "l'extermination planifiée d'un peuple"], ["Société des Nations", "l'organisation créée pour maintenir la paix après 1918"],
    ["Diktat", "le nom donné par les Allemands au traité de Versailles"],
  ]),
  (r) => {
    const [c, camp] = pick(r, [["la France", "Entente"], ["le Royaume-Uni", "Entente"], ["la Russie", "Entente"], ["l'Allemagne", "Empires centraux"], ["l'Autriche-Hongrie", "Empires centraux"], ["l'Empire ottoman", "Empires centraux"], ["l'Italie (à partir de 1915)", "Entente"]] as const);
    return tf(`En 1914-1918, ${c} combat dans le camp de l'Entente.`, camp === "Entente", `${cap(c)} : ${camp}.`);
  },
];

const metropoles: Generator[] = [
  ...terms([
    ["métropolisation", "la concentration des populations et des activités dans les grandes villes"], ["ville mondiale", "une ville qui concentre des fonctions de commandement à l'échelle mondiale"],
    ["mégalopole", "un ensemble de métropoles reliées formant un axe urbain continu"], ["périurbanisation", "l'installation de citadins dans des communes rurales proches des villes, où ils continuent de travailler"],
    ["gentrification", "l'embourgeoisement d'un quartier populaire"], ["étalement urbain", "l'extension de la surface urbanisée plus rapide que la population"],
    ["CBD", "le quartier central des affaires"], ["fragmentation urbaine", "la séparation socio-spatiale des quartiers d'une ville"], ["aire d'attraction", "l'espace dont une ville attire quotidiennement les travailleurs"],
    ["mégapole", "une très grande agglomération de plus de 10 millions d'habitants"],
  ]),
  cards([
    ["Quelle ville, première place financière mondiale, est le cœur de la mégalopole du Nord-Est des États-Unis (BosWash) ?", "New York", ["Boston", "Philadelphie", "Washington"], "La BosWash associe la finance et les médias (New York), le pouvoir politique (Washington) et les grandes universités (Boston)."],
    ["La mégalopole japonaise s'étire surtout…", "sur la façade Pacifique, de Tokyo au nord de Kyushu", ["sur la façade de la mer du Japon, de Niigata à Fukuoka", "dans l'île d'Hokkaido, autour de Sapporo", "dans les montagnes du centre de Honshu"], "Tokyo, Nagoya, Osaka, Kobe, Hiroshima, Fukuoka : un littoral industriel et portuaire très densément peuplé."],
    ["Laquelle de ces métropoles n'appartient pas à la dorsale européenne (la « banane bleue » de Roger Brunet) ?", "Paris", ["Francfort", "Milan", "Strasbourg"], "La dorsale va du sud de l'Angleterre à l'Italie du Nord par le Benelux, la vallée du Rhin et la Suisse : Paris reste à l'écart."],
    ["Quel fleuve forme l'axe central de la dorsale européenne ?", "le Rhin", ["le Danube", "le Rhône", "l'Elbe"], "Le Rhin relie la Suisse à Rotterdam, premier port d'Europe."],
    ["La mégalopole ChiPitts, ancien cœur industriel aujourd'hui en partie « Rust Belt », s'étend…", "autour des Grands Lacs", ["le long du golfe du Mexique", "en Nouvelle-Angleterre", "dans les Grandes Plaines"], "De Chicago à Pittsburgh par Detroit et Cleveland : sidérurgie et automobile, puis désindustrialisation."],
    ["La mégalopole californienne (SanSan) appartient à…", "la Sun Belt", ["la Rust Belt", "la Corn Belt", "la Manufacturing Belt"], "Le Sud et l'Ouest ensoleillés, dynamiques depuis les années 1970 (Silicon Valley, Los Angeles)."],
    ["Quelle région urbaine chinoise s'organise autour de Hong Kong, Shenzhen et Canton ?", "le delta de la rivière des Perles", ["le delta du Yangzi", "la région de Pékin-Tianjin", "le bassin du Sichuan"], "Le delta du Yangzi s'organise autour de Shanghai ; Pékin-Tianjin est la région de la capitale."],
  ]),
  (r) => {
    const urb = pick(r, [30, 40, 57, 68, 75]);
    return tf(`Environ ${urb} % de la population mondiale vit aujourd'hui en ville.`, urb === 57, `Un peu plus de la moitié : environ 57 % (ONU, années 2020).`);
  },
];

// ───────────── Terminale ─────────────

const totalitarismes: Generator[] = [
  ...chrono([
    ["Marche sur Rome de Mussolini", 1922], ["Mort de Lénine", 1924], ["Krach de Wall Street", 1929], ["Hitler devient chancelier", 1933], ["Lancement du New Deal", 1933],
    ["Nuit des longs couteaux", 1934], ["Lois de Nuremberg", 1935], ["Victoire électorale du Front populaire en France", 1936], ["Début de la guerre d'Espagne", 1936], ["Nuit de Cristal", 1938], ["Accords de Munich", 1938],
  ]),
  ...terms([
    ["totalitarisme", "un régime qui contrôle toute la société par la terreur et la propagande"], ["Goulag", "le système des camps de travail forcé en URSS"], ["culte de la personnalité", "la glorification excessive d'un dirigeant"],
    ["collectivisation", "la mise en commun forcée des terres agricoles en URSS"], ["propagande", "l'action de diffuser des idées pour embrigader la population"], ["fascisme", "le régime nationaliste et autoritaire de Mussolini"],
    ["New Deal", "la politique de relance de Roosevelt face à la crise"], ["Gestapo", "la police politique du régime nazi"], ["NKVD", "la police politique soviétique"], ["déflation", "une baisse générale et durable des prix"],
  ]),
  ...people([
    ["Benito Mussolini", "le dirigeant fasciste de l'Italie"], ["Adolf Hitler", "le dirigeant du régime nazi"], ["Joseph Staline", "le dirigeant de l'URSS de la fin des années 1920 à 1953"],
    ["Franklin D. Roosevelt", "le président américain du New Deal"], ["Léon Blum", "le chef du gouvernement du Front populaire"],
  ]),
];

const ww2: Generator[] = [
  ...chrono([
    ["Pacte germano-soviétique", 1939], ["Défaite française et armistice", 1940], ["Opération Barbarossa", 1941], ["Attaque de Pearl Harbor", 1941], ["Conférence de Wannsee", 1942],
    ["Victoire soviétique à Stalingrad", 1943], ["Débarquement en Normandie", 1944], ["Capitulation de l'Allemagne", 1945], ["Bombardement atomique d'Hiroshima", 1945],
  ]),
  ...terms([
    ["Shoah", "le génocide des Juifs d'Europe par les nazis"], ["collaboration", "la coopération avec l'occupant allemand"], ["Résistance", "le combat contre l'occupant et le régime de Vichy"],
    ["régime de Vichy", "le régime autoritaire de Pétain (1940-1944)"], ["Einsatzgruppen", "les unités mobiles de tuerie nazies à l'Est"], ["centre de mise à mort", "un camp conçu pour l'assassinat de masse (Auschwitz-Birkenau)"],
    ["STO", "le Service du travail obligatoire en Allemagne"], ["guerre d'anéantissement", "une guerre visant la destruction totale de l'ennemi, civils compris"], ["CNR", "le Conseil national de la Résistance"],
  ]),
  ...people([
    ["Charles de Gaulle", "le chef de la France libre"], ["Philippe Pétain", "le chef de l'État français de Vichy"], ["Jean Moulin", "l'unificateur de la Résistance intérieure"],
    ["Winston Churchill", "le Premier ministre britannique pendant la guerre"], ["Pierre Laval", "le chef du gouvernement de Vichy à partir de 1942, qui « souhaite la victoire de l'Allemagne »"],
  ]),
  (r) => {
    const [e, d] = pick(r, [["l'appel du général de Gaulle", "18 juin 1940"], ["le débarquement en Normandie", "6 juin 1944"], ["la capitulation allemande", "8 mai 1945"], ["la rafle du Vél d'Hiv", "16 juillet 1942"], ["l'invasion de la Pologne", "1er septembre 1939"], ["l'attaque de Pearl Harbor", "7 décembre 1941"]] as const);
    return mcq(r, `Date de ${e} ?`, d, ["18 juin 1940", "6 juin 1944", "8 mai 1945", "16 juillet 1942", "1er septembre 1939", "7 décembre 1941"], `${cap(e)} : ${d}.`);
  },
];

const guerreFroide: Generator[] = [
  ...chrono([
    ["Discours de Churchill sur le « rideau de fer »", 1946], ["Doctrine Truman et annonce du plan Marshall", 1947], ["Début du blocus de Berlin", 1948], ["Création de l'OTAN", 1949],
    ["Début de la guerre de Corée", 1950], ["Pacte de Varsovie", 1955], ["Insurrection de Budapest", 1956], ["Construction du mur de Berlin", 1961], ["Crise des missiles de Cuba", 1962],
    ["Printemps de Prague", 1968], ["Invasion de l'Afghanistan par l'URSS", 1979], ["Chute du mur de Berlin", 1989], ["Dislocation de l'URSS", 1991],
  ]),
  ...terms([
    ["endiguement", "la politique américaine visant à contenir l'expansion communiste"], ["dissuasion nucléaire", "l'équilibre de la terreur qui empêche l'emploi de l'arme atomique"],
    ["bipolarisation", "la division du monde en deux blocs rivaux"], ["rideau de fer", "la frontière qui sépare l'Europe de l'Ouest et l'Europe de l'Est"], ["détente", "la période d'apaisement entre les deux Grands (années 1960-1970)"],
    ["non-alignement", "le refus de choisir l'un des deux blocs"], ["perestroïka", "la restructuration de l'économie soviétique lancée par Gorbatchev"], ["OTAN", "l'alliance militaire du bloc occidental"],
    ["démocratie populaire", "un régime communiste d'Europe de l'Est contrôlé par l'URSS"],
  ]),
  ...people([
    ["Harry Truman", "le président américain de la doctrine de l'endiguement"], ["Nikita Khrouchtchev", "le dirigeant soviétique de la crise de Cuba"], ["John F. Kennedy", "le président américain lors de la crise de Cuba"],
    ["Mikhaïl Gorbatchev", "le dernier dirigeant de l'URSS"], ["Ronald Reagan", "le président américain de la relance de la course aux armements"],
  ]),
];

const veRepublique: Generator[] = [
  ...chrono([
    ["Adoption de la Constitution de la Ve République", 1958], ["Élection du président au suffrage universel direct (référendum)", 1962], ["Révolte étudiante et grève générale de mai", 1968], ["Démission du général de Gaulle", 1969],
    ["Majorité abaissée à 18 ans", 1974], ["Promulgation de la loi Veil sur l'IVG", 1975], ["Abolition de la peine de mort", 1981], ["Première cohabitation", 1986], ["Signature du traité de Maastricht", 1992],
    ["Quinquennat adopté par référendum", 2000], ["Loi ouvrant le mariage aux couples de même sexe", 2013],
  ]),
  ...pairs(
    [["Charles de Gaulle", "1959"], ["Georges Pompidou", "1969"], ["Valéry Giscard d'Estaing", "1974"], ["François Mitterrand", "1981"], ["Jacques Chirac", "1995"], ["Nicolas Sarkozy", "2007"], ["François Hollande", "2012"], ["Emmanuel Macron", "2017"]],
    { ask: (a) => `En quelle année ${a} devient-il président de la République ?`, reverse: (b) => `Quel président entre à l'Élysée en ${b} ?`, claim: (a, b) => `${a} devient président de la République en ${b}.`, explain: (a, b) => `${a} : président à partir de ${b}${b === "1959" ? " (élu en décembre 1958, il entre en fonctions en janvier 1959)" : ""}.` },
  ),
  ...terms([
    ["cohabitation", "la coexistence d'un président et d'un gouvernement de bords opposés"], ["motion de censure", "le vote par lequel l'Assemblée peut renverser le gouvernement"],
    ["article 49.3", "l'adoption d'un texte sans vote, sauf motion de censure"], ["référendum", "un vote direct des citoyens sur une question"], ["Conseil constitutionnel", "l'institution qui contrôle la conformité des lois à la Constitution"],
    ["quinquennat", "un mandat de cinq ans"], ["alternance", "le passage du pouvoir d'un camp politique à l'autre"], ["article 16", "les pouvoirs exceptionnels du président en cas de crise grave"],
  ]),
];

const mers: Generator[] = [
  ...terms([
    ["ZEE", "la zone économique exclusive, jusqu'à 200 milles marins des côtes"], ["mer territoriale", "la bande de 12 milles marins où l'État est souverain"], ["haute mer", "l'espace maritime hors de toute juridiction nationale"],
    ["conteneurisation", "le transport des marchandises dans des boîtes standardisées"], ["littoralisation", "la concentration des hommes et des activités sur les littoraux"], ["façade maritime", "un littoral aménagé regroupant plusieurs grands ports"],
    ["hub portuaire", "un port de redistribution des marchandises vers d'autres ports"], ["détroit", "un passage maritime resserré entre deux terres"], ["Convention de Montego Bay", "le texte de l'ONU (1982) qui définit le droit de la mer"],
  ]),
  ...pairs(
    [["Ormuz", "le golfe Persique et la mer d'Oman"], ["Malacca", "l'océan Indien et la mer de Chine méridionale"], ["Gibraltar", "l'Atlantique et la Méditerranée"], ["Bab el-Mandeb", "la mer Rouge et le golfe d'Aden"], ["le Pas-de-Calais", "la Manche et la mer du Nord"], ["le Bosphore", "la mer Noire et la mer de Marmara"]],
    { ask: (a) => `Le détroit ${a.startsWith("le ") ? "du " + a.slice(3) : "de " + a} relie…`, reverse: (b) => `Quel détroit relie ${b} ?`, claim: (a, b) => `Le détroit ${a.startsWith("le ") ? "du " + a.slice(3) : "de " + a} relie ${b}.`, explain: (a, b) => `${cap(a)} : entre ${b}.` },
  ),
  (r) => {
    const m = pick(r, [12, 24, 100, 200, 350]);
    return numeric(`$${m}$ milles marins, c'est combien de km ? (1 mille marin = 1,852 km)`, m * 1.852, `$${m} \\times 1{,}852$.`, "km", 0.05);
  },
  (r) => {
    const [canal, sea] = pick(r, [["de Suez", "la Méditerranée et la mer Rouge"], ["de Panama", "l'Atlantique et le Pacifique"]] as const);
    return mcq(r, `Le canal ${canal} relie…`, sea, ["la Méditerranée et la mer Rouge", "l'Atlantique et le Pacifique", "la mer du Nord et la Baltique", "la mer Noire et la Méditerranée"], `Canal ${canal} : ${sea}.`);
  },
  claims([
    ["Plus de 80 % du commerce mondial de marchandises (en volume) passe par la mer.", true, "Le transport maritime est le moins cher (CNUCED)."],
    ["La France possède la deuxième ZEE du monde grâce à ses territoires ultramarins.", true, "Environ 10 millions de km²."],
    ["Shanghai est le premier port à conteneurs du monde.", true, "Les grands ports mondiaux sont surtout asiatiques."],
    ["La haute mer commence dès la limite de la mer territoriale (12 milles marins).", false, "Elle commence au-delà des ZEE (200 milles) : la haute mer n'appartient à aucun État."],
  ]),
];

export const HISTOIRE: Record<string, Generator[]> = {
  "hg-2-antiquite": antiquite,
  "hg-2-moyen-age": moyenAge,
  "hg-2-renaissance": renaissance,
  "hg-2-lumieres": lumieres,
  "hg-2-environnement": environnement,
  "hg-1-revolution": revolution,
  "hg-1-industrie": industrie,
  "hg-1-ww1": ww1,
  "hg-1-metropoles": metropoles,
  "hg-t-totalitarismes": totalitarismes,
  "hg-t-ww2": ww2,
  "hg-t-guerre-froide": guerreFroide,
  "hg-t-ve-republique": veRepublique,
  "hg-t-mers": mers,
};
