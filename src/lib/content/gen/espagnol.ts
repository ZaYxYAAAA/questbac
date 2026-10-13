/** Générateurs de questions — Espagnol (programmes de lycée 2025 : axes culturels + grammaire). */
import { chrono } from "./histoire";
import { type Generator, type Pair, claims, int, mcq, pairs, pick, tf } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ───────────── Conjugaison régulière ─────────────

const PERSONS = ["yo", "tú", "él / ella / usted", "nosotros", "vosotros", "ellos / ellas / ustedes"];
type Group = "ar" | "er" | "ir";
type Tense = "presente" | "indefinido" | "imperfecto" | "futuro" | "condicional" | "subjuntivo";

const ENDINGS: Record<Tense, Record<Group, string[]>> = {
  presente: { ar: ["o", "as", "a", "amos", "áis", "an"], er: ["o", "es", "e", "emos", "éis", "en"], ir: ["o", "es", "e", "imos", "ís", "en"] },
  indefinido: { ar: ["é", "aste", "ó", "amos", "asteis", "aron"], er: ["í", "iste", "ió", "imos", "isteis", "ieron"], ir: ["í", "iste", "ió", "imos", "isteis", "ieron"] },
  imperfecto: { ar: ["aba", "abas", "aba", "ábamos", "abais", "aban"], er: ["ía", "ías", "ía", "íamos", "íais", "ían"], ir: ["ía", "ías", "ía", "íamos", "íais", "ían"] },
  futuro: { ar: ["é", "ás", "á", "emos", "éis", "án"], er: ["é", "ás", "á", "emos", "éis", "án"], ir: ["é", "ás", "á", "emos", "éis", "án"] },
  condicional: { ar: ["ía", "ías", "ía", "íamos", "íais", "ían"], er: ["ía", "ías", "ía", "íamos", "íais", "ían"], ir: ["ía", "ías", "ía", "íamos", "íais", "ían"] },
  subjuntivo: { ar: ["e", "es", "e", "emos", "éis", "en"], er: ["a", "as", "a", "amos", "áis", "an"], ir: ["a", "as", "a", "amos", "áis", "an"] },
};
const TENSE_NAMES: Record<Tense, string> = {
  presente: "présent de l'indicatif", indefinido: "pretérito indefinido (passé simple)", imperfecto: "pretérito imperfecto (imparfait)",
  futuro: "futur", condicional: "conditionnel", subjuntivo: "présent du subjonctif",
};

/** Verbes réguliers sans changement orthographique. */
const VERBS: Array<[string, string]> = [
  ["hablar", "parler"], ["trabajar", "travailler"], ["estudiar", "étudier"], ["cantar", "chanter"], ["bailar", "danser"], ["viajar", "voyager"],
  ["comprar", "acheter"], ["escuchar", "écouter"], ["mirar", "regarder"], ["ayudar", "aider"], ["comer", "manger"], ["beber", "boire"],
  ["aprender", "apprendre"], ["vender", "vendre"], ["correr", "courir"], ["comprender", "comprendre"], ["vivir", "vivre"], ["escribir", "écrire"],
  ["recibir", "recevoir"], ["decidir", "décider"], ["subir", "monter"], ["compartir", "partager"],
];

function conj(verb: string, tense: Tense, p: number) {
  const group = verb.slice(-2) as Group;
  const base = tense === "futuro" || tense === "condicional" ? verb : verb.slice(0, -2);
  return base + ENDINGS[tense][group][p];
}

/** Formes ambiguës (même forme à deux temps) exclues des questions « quel temps ? ». */
const ambiguous = (verb: string, tense: Tense, p: number) => {
  const form = conj(verb, tense, p);
  return (Object.keys(ENDINGS) as Tense[]).some((t) => t !== tense && [0, 1, 2, 3, 4, 5].some((q) => conj(verb, t, q) === form));
};

const conjugate = (tenses: Tense[]): Generator => (r) => {
  const [verb, fr] = pick(r, VERBS), tense = pick(r, tenses), p = int(r, 0, 5);
  const answer = conj(verb, tense, p);
  const wrongs = [conj(verb, tense, (p + 1) % 6), conj(verb, tense, (p + 3) % 6), ...(Object.keys(ENDINGS) as Tense[]).filter((t) => t !== tense).map((t) => conj(verb, t, p))];
  return mcq(r, `**${cap(verb)}** (${fr}) au ${TENSE_NAMES[tense]}, personne « ${PERSONS[p]} » ?`, answer, wrongs, `${cap(verb)} → ${PERSONS[p]} ${answer}.`);
};

const whichTense = (tenses: Tense[]): Generator => (r) => {
  for (let guard = 0; guard < 30; guard++) {
    const [verb] = pick(r, VERBS), tense = pick(r, tenses), p = int(r, 0, 5);
    if (ambiguous(verb, tense, p)) continue;
    return mcq(r, `À quel temps est « ${PERSONS[p].split(" / ")[0]} ${conj(verb, tense, p)} » ?`, TENSE_NAMES[tense], Object.values(TENSE_NAMES), `Terminaison du ${TENSE_NAMES[tense]}.`);
  }
  return tf("« Hablamos » peut être un présent ou un passé simple.", true, "À la 1re personne du pluriel, les verbes en -ar ont la même forme au présent et au pretérito indefinido.");
};

// ───────────── Irréguliers ─────────────

const IRREG: Array<[string, string, string, string, string, string]> = [
  // infinitif, sens, présent yo, présent él, indefinido yo, indefinido él
  ["ser", "être", "soy", "es", "fui", "fue"], ["estar", "être (état, lieu)", "estoy", "está", "estuve", "estuvo"], ["tener", "avoir", "tengo", "tiene", "tuve", "tuvo"],
  ["ir", "aller", "voy", "va", "fui", "fue"], ["hacer", "faire", "hago", "hace", "hice", "hizo"], ["poder", "pouvoir", "puedo", "puede", "pude", "pudo"],
  ["querer", "vouloir, aimer", "quiero", "quiere", "quise", "quiso"], ["decir", "dire", "digo", "dice", "dije", "dijo"], ["venir", "venir", "vengo", "viene", "vine", "vino"],
  ["saber", "savoir", "sé", "sabe", "supe", "supo"], ["poner", "mettre", "pongo", "pone", "puse", "puso"], ["salir", "sortir", "salgo", "sale", "salí", "salió"],
  ["dormir", "dormir", "duermo", "duerme", "dormí", "durmió"], ["pedir", "demander", "pido", "pide", "pedí", "pidió"], ["traer", "apporter", "traigo", "trae", "traje", "trajo"],
  ["conocer", "connaître", "conozco", "conoce", "conocí", "conoció"], ["jugar", "jouer", "juego", "juega", "jugué", "jugó"], ["volver", "revenir", "vuelvo", "vuelve", "volví", "volvió"],
];

const irregular = (past: boolean): Generator => (r) => {
  const [inf, fr, py, pe, iy, ie] = pick(r, IRREG);
  const third = r() < 0.5;
  const ans = past ? (third ? ie : iy) : third ? pe : py;
  const others = IRREG.filter(([v]) => v !== inf).map((x) => (past ? (third ? x[5] : x[4]) : third ? x[3] : x[2]));
  const regular = third ? (past ? inf.slice(0, -2) + (inf.endsWith("ar") ? "ó" : "ió") : inf.slice(0, -2) + (inf.endsWith("ar") ? "a" : "e")) : past ? inf.slice(0, -2) + (inf.endsWith("ar") ? "é" : "í") : inf.slice(0, -2) + "o";
  return mcq(r, `**${cap(inf)}** (${fr}) au ${past ? "pretérito indefinido" : "présent"}, personne « ${third ? "él / ella" : "yo"} » ?`, ans, [regular === "pedo" ? "pidó" : regular, past ? (third ? iy : ie) : third ? py : pe, ...others.slice(0, 1)], `${cap(inf)} est irrégulier : ${third ? "él" : "yo"} ${ans}.`, () => pick(r, others));
};

// ───────────── Ser / estar, gustar, por / para ─────────────

const SER_ESTAR: Array<[string, string, string]> = [
  ["Madrid ___ la capital de España.", "es", "Identité, définition → ser."], ["Hoy ___ muy cansado.", "estoy", "État passager → estar."],
  ["Mi hermana ___ médica.", "es", "Profession → ser."], ["El libro ___ encima de la mesa.", "está", "Localisation → estar."],
  ["Nosotros ___ franceses.", "somos", "Nationalité → ser."], ["La sopa ___ fría.", "está", "État → estar."],
  ["¿Dónde ___ los niños?", "están", "Localisation → estar."], ["La fiesta ___ en casa de Ana.", "es", "Lieu d'un événement → ser."],
  ["Mis abuelos ___ muy simpáticos.", "son", "Caractère → ser."], ["Ya ___ las diez de la noche.", "son", "Heure → ser."],
  ["Esta mesa ___ de madera.", "es", "Matière → ser."], ["Tú ___ enfermo hoy.", "estás", "État passager → estar."],
  ["Mi padre ___ trabajando.", "está", "Estar + gérondif : action en cours."], ["Vosotros ___ de Sevilla.", "sois", "Origine → ser."],
  ["El museo ___ cerrado los lunes.", "está", "Résultat d'une action → estar."], ["Ella ___ alta y morena.", "es", "Description physique durable → ser."],
];
const SER_FORMS = ["soy", "eres", "es", "somos", "sois", "son"], ESTAR_FORMS = ["estoy", "estás", "está", "estamos", "estáis", "están"];

const GUSTAR_PRON: Array<[string, string]> = [["A mí", "me"], ["A ti", "te"], ["A él", "le"], ["A ella", "le"], ["A nosotros", "nos"], ["A vosotros", "os"], ["A ellos", "les"], ["A mis padres", "les"]];
const GUSTAR_THINGS: Array<[string, boolean]> = [["el chocolate", false], ["los deportes", true], ["la música", false], ["las películas de terror", true], ["viajar", false], ["los gatos", true], ["el fútbol", false], ["las matemáticas", true], ["leer", false], ["los videojuegos", true]];

const POR_PARA: Array<[string, string, string]> = [
  ["Este regalo es ___ ti.", "para", "Destinataire → para."], ["Paseamos ___ el parque.", "por", "Lieu traversé → por."], ["Estudio ___ aprobar el examen.", "para", "But → para."],
  ["Gracias ___ tu ayuda.", "por", "Cause → por."], ["Salimos ___ Madrid mañana.", "para", "Destination → para."], ["Te llamo ___ teléfono.", "por", "Moyen → por."],
  ["Lo compré ___ diez euros.", "por", "Échange, prix → por."], ["___ mí, es la mejor película.", "Para", "Point de vue → para."], ["Trabajo ___ la mañana.", "por", "Moment de la journée → por."],
  ["El trabajo es ___ el lunes.", "para", "Échéance → para."],
];

const presente: Generator[] = [
  conjugate(["presente"]),
  irregular(false),
  (r) => {
    const [s, a, e] = pick(r, SER_ESTAR);
    const isSer = SER_FORMS.includes(a);
    const idx = (isSer ? SER_FORMS : ESTAR_FORMS).indexOf(a);
    return mcq(r, `Complète : « ${s} »`, a, [(isSer ? ESTAR_FORMS : SER_FORMS)[idx], (isSer ? SER_FORMS : ESTAR_FORMS)[(idx + 1) % 6], (isSer ? ESTAR_FORMS : SER_FORMS)[(idx + 2) % 6]], e);
  },
  (r) => {
    const [who, pron] = pick(r, GUSTAR_PRON), [thing, plural] = pick(r, GUSTAR_THINGS);
    return r() < 0.5
      ? mcq(r, `« ${who} ___ gusta${plural ? "n" : ""} ${thing}. »`, pron, ["me", "te", "le", "nos", "os", "les"].filter((x) => x !== pron), `${who} → ${pron}.`)
      : mcq(r, `« ${who} ${pron} ___ ${thing}. »`, plural ? "gustan" : "gusta", ["gusta", "gustan", "gusto", "gustamos"], plural ? "Sujet pluriel (ce qui plaît) → gustan." : "Sujet singulier ou infinitif → gusta.");
  },
  (r) => {
    const [s, a, e] = pick(r, POR_PARA);
    return mcq(r, `Por ou para ? « ${s} »`, a, a === "Para" ? ["Por", "Con", "De"] : [a === "por" ? "para" : "por", "con", "de"], e);
  },
  claims([
    ["« Ser » s'emploie pour les caractéristiques essentielles, « estar » pour les états et la localisation.", true, "Règle de base."],
    ["Avec « gustar », le verbe s'accorde avec la personne qui aime.", false, "Il s'accorde avec ce qui plaît : me gustan los gatos."],
    ["« Usted » se conjugue à la 3e personne du singulier.", true, "Vouvoiement : usted habla."],
    ["« Estar + gérondif » exprime une action en cours.", true, "Estoy estudiando : je suis en train d'étudier."],
  ]),
];

// ───────────── Vocabulaire ─────────────

const VOCAB: Pair[] = [
  ["la casa", "la maison"], ["el coche", "la voiture"], ["la ciudad", "la ville"], ["el pueblo", "le village"], ["la playa", "la plage"], ["el trabajo", "le travail"],
  ["el dinero", "l'argent"], ["la semana", "la semaine"], ["el año", "l'année"], ["la gente", "les gens"], ["el mundo", "le monde"], ["la vida", "la vie"],
  ["el hermano", "le frère"], ["la abuela", "la grand-mère"], ["el sueño", "le rêve"], ["la calle", "la rue"], ["el árbol", "l'arbre"], ["la comida", "le repas"],
  ["el desayuno", "le petit-déjeuner"], ["la cena", "le dîner"], ["el ordenador", "l'ordinateur"], ["el móvil", "le téléphone portable"], ["la empresa", "l'entreprise"],
  ["el paro", "le chômage"], ["la vivienda", "le logement"], ["el medio ambiente", "l'environnement"], ["la sequía", "la sécheresse"], ["el esfuerzo", "l'effort"],
  ["la libertad", "la liberté"], ["la lucha", "la lutte"], ["despertarse", "se réveiller"], ["acostarse", "se coucher"], ["llegar", "arriver"], ["buscar", "chercher"],
  ["encontrar", "trouver"], ["empezar", "commencer"], ["olvidar", "oublier"], ["ganar", "gagner"], ["perder", "perdre"], ["llevar", "porter, emmener"],
  ["sin embargo", "cependant"], ["todavía", "encore, toujours"], ["ya", "déjà"], ["nunca", "jamais"], ["siempre", "toujours"], ["pronto", "bientôt, tôt"],
];
const FALSE_FRIENDS: Array<[string, string, string]> = [
  ["embarazada", "enceinte", "embarrassée"], ["constipado", "enrhumé", "constipé"], ["el éxito", "le succès", "la sortie"], ["salir", "sortir", "salir"],
  ["largo", "long", "large"], ["la carpeta", "le classeur, la chemise", "la carpette"], ["exquisito", "délicieux", "exquis (raffiné)"], ["contestar", "répondre", "contester"],
  ["presumir", "se vanter", "présumer"], ["la firma", "la signature", "la firme"], ["el suceso", "le fait divers", "le succès"], ["la ropa", "les vêtements", "la robe"],
  ["discutir", "se disputer, débattre", "discuter calmement"], ["el polvo", "la poussière", "le poulpe"], ["la oficina", "le bureau", "l'officine"], ["el vaso", "le verre", "le vase"],
];
const DAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const DAYS_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const UNITS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const TENS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const HUNDREDS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

/** Nombre en toutes lettres (0 à 999). */
export function numberEs(n: number): string {
  if (n === 100) return "cien";
  const h = Math.floor(n / 100), rest = n % 100;
  const restText = rest < 30 ? (rest === 0 && h ? "" : UNITS[rest]) : `${TENS[Math.floor(rest / 10)]}${rest % 10 ? ` y ${UNITS[rest % 10]}` : ""}`;
  return [HUNDREDS[h], restText].filter(Boolean).join(" ");
}

const vocabulaire: Generator[] = [
  ...pairs(VOCAB, { ask: (a) => `Que veut dire **${a}** ?`, reverse: (b) => `Comment dit-on **${b}** en espagnol ?`, claim: (a, b) => `**${a}** signifie « ${b} ».`, explain: (a, b) => `*${a}* = ${b}.` }),
  (r) => {
    const [es, right, trap] = pick(r, FALSE_FRIENDS);
    return r() < 0.5
      ? mcq(r, `Faux ami ! Que veut dire **${es}** ?`, right, [trap, ...FALSE_FRIENDS.filter(([e]) => e !== es).map(([, x]) => x)].slice(0, 3), `*${es}* = ${right} (et non « ${trap} »).`)
      : tf(`**${es}** veut dire « ${trap} ».`, trap === right, `*${es}* = ${right}.`);
  },
  (r) => {
    const n = pick(r, [int(r, 11, 29), int(r, 31, 99), int(r, 101, 999), 100, int(r, 2, 9) * 100]);
    const right = numberEs(n);
    return mcq(r, `Comment s'écrit **${n}** en espagnol ?`, right, [numberEs(n + 1), numberEs(Math.max(0, n - 10)), numberEs(n + 100 > 999 ? n - 100 : n + 100)], `${n} = ${right}.`);
  },
  (r) => {
    const i = int(r, 0, 6), j = int(r, 0, 11);
    return r() < 0.5
      ? mcq(r, `Comment dit-on « ${DAYS_FR[i]} » ?`, DAYS[i], DAYS.filter((_, k) => k !== i), `${DAYS_FR[i]} = ${DAYS[i]} (sans majuscule en espagnol).`)
      : mcq(r, `Quel mois vient après **${MONTHS[j]}** ?`, MONTHS[(j + 1) % 12], MONTHS.filter((_, k) => k !== (j + 1) % 12), `${MONTHS[j]} → ${MONTHS[(j + 1) % 12]} (${MONTHS_FR[(j + 1) % 12]}).`);
  },
];

// ───────────── L'Espagne au-delà des clichés ─────────────

const cliches: Generator[] = [
  ...pairs(
    [["Cataluña", "Barcelona"], ["Andalucía", "Sevilla"], ["el País Vasco", "Vitoria-Gasteiz"], ["Galicia", "Santiago de Compostela"], ["la Comunidad Valenciana", "Valencia"], ["Castilla y León", "Valladolid"], ["Aragón", "Zaragoza"], ["Asturias", "Oviedo"], ["Navarra", "Pamplona"], ["Extremadura", "Mérida"]],
    { ask: (a) => `Capitale de la communauté autonome : ${a} ?`, reverse: (b) => `${b} est la capitale de quelle communauté autonome ?`, claim: (a, b) => `${b} est la capitale de ${a}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    [["las Fallas", "Valencia"], ["San Fermín", "Pamplona"], ["la Tomatina", "Buñol"], ["la Feria de Abril", "Sevilla"], ["la Mercè", "Barcelona"], ["el Carnaval", "Santa Cruz de Tenerife"]],
    { ask: (a) => `Où se déroule la fête de ${a} ?`, reverse: (b) => `Quelle fête célèbre a lieu à ${b} ?`, claim: (a, b) => `${cap(a)} se fête à ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    [["Picasso", "Guernica"], ["Velázquez", "Las Meninas"], ["Goya", "El tres de mayo de 1808"], ["Dalí", "La persistencia de la memoria"], ["Gaudí", "la Sagrada Familia"], ["Cervantes", "Don Quijote de la Mancha"], ["Federico García Lorca", "La casa de Bernarda Alba"], ["Pedro Almodóvar", "Todo sobre mi madre"], ["Rosalía", "El mal querer"], ["Joan Miró", "El carnaval de Arlequín"]],
    { ask: (a) => `Œuvre célèbre de ${a} ?`, reverse: (b) => `Qui est l'auteur de *${b}* ?`, claim: (a, b) => `*${b}* est une œuvre de ${a}.`, explain: (a, b) => `${a} : *${b}*.` },
  ),
  ...pairs(
    [["la paella", "Valence"], ["le gazpacho", "l'Andalousie"], ["le pulpo a la gallega", "la Galice"], ["les pintxos", "le Pays basque"], ["la fabada", "les Asturies"], ["le cocido madrileño", "Madrid"]],
    { ask: (a) => `De quelle région est originaire ${a} ?`, claim: (a, b) => `${cap(a)} est une spécialité de ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["En Espagne, le catalan, le basque (euskera) et le galicien sont co-officiels dans leurs régions.", true, "Le castillan est la langue officielle de tout l'État."],
    ["L'Espagne compte 17 communautés autonomes.", true, "Plus deux villes autonomes : Ceuta et Melilla."],
    ["Le flamenco est né en Catalogne.", false, "Il est né en Andalousie (patrimoine immatériel de l'UNESCO depuis 2010)."],
    ["L'Espagne est une monarchie parlementaire.", true, "Constitution de 1978 ; roi actuel : Felipe VI."],
    ["La sieste est pratiquée chaque jour par la majorité des Espagnols.", false, "C'est un cliché : la majorité des Espagnols ne font pas la sieste en semaine."],
    ["L'espagnol est la deuxième langue maternelle la plus parlée au monde.", true, "Environ 500 millions de locuteurs natifs, après le mandarin."],
    ["L'Espagne est un leader européen des énergies renouvelables (éolien, solaire).", true, "Une réalité loin des clichés touristiques."],
  ]),
];

// ───────────── Le passé ─────────────

const MARKERS: Array<[string, Tense]> = [
  ["Ayer", "indefinido"], ["El año pasado", "indefinido"], ["En 1992", "indefinido"], ["Anoche", "indefinido"], ["Hace dos días", "indefinido"],
  ["Cuando era niño, siempre", "imperfecto"], ["Antes, todos los días", "imperfecto"], ["De pequeña, a menudo", "imperfecto"], ["En aquella época, normalmente", "imperfecto"],
];

const passe: Generator[] = [
  conjugate(["indefinido", "imperfecto"]),
  irregular(true),
  whichTense(["presente", "indefinido", "imperfecto", "futuro"]),
  (r) => {
    const [marker, tense] = pick(r, MARKERS), [verb] = pick(r, VERBS), p = pick(r, [0, 2, 5]);
    const ans = conj(verb, tense, p), other = conj(verb, tense === "indefinido" ? "imperfecto" : "indefinido", p);
    return mcq(r, `« ${marker}, ${PERSONS[p].split(" / ")[0]} ___ (${verb}). »`, ans, [other, conj(verb, "presente", p), conj(verb, "futuro", p)],
      tense === "indefinido" ? "Action ponctuelle et datée → pretérito indefinido." : "Habitude ou description dans le passé → imperfecto.");
  },
  claims([
    ["Le pretérito indefinido exprime une action achevée et datée.", true, "Ayer comí paella."],
    ["L'imperfecto sert à décrire et à exprimer l'habitude dans le passé.", true, "Cuando era niño, jugaba al fútbol."],
    ["« Fui » peut venir de « ser » ou de « ir ».", true, "Ser et ir ont le même pretérito indefinido."],
    ["« Hace dos años » signifie « dans deux ans ».", false, "Hace + durée = il y a."],
  ]),
];

// ───────────── Subjonctif et conditionnel ─────────────

const TRIGGERS = ["Es importante que", "Quiero que", "Espero que", "Es necesario que", "Ojalá", "No creo que", "Es posible que", "Me alegra que"];

const subjonctif: Generator[] = [
  (r) => {
    const t = pick(r, TRIGGERS), [verb] = pick(r, VERBS), p = int(r, 0, 5);
    const subject = PERSONS[p].split(" / ")[0];
    return mcq(r, `« ${t} ${subject} ___ (${verb}). »`, conj(verb, "subjuntivo", p), [conj(verb, "presente", p), conj(verb, "futuro", p), conj(verb, "indefinido", p)],
      `« ${t} » entraîne le subjonctif : ${conj(verb, "subjuntivo", p)}.`);
  },
  conjugate(["subjuntivo", "condicional", "futuro"]),
  (r) => {
    const [verb, fr] = pick(r, VERBS);
    const tu = conj(verb, "presente", 2), usted = conj(verb, "subjuntivo", 2), neg = `no ${conj(verb, "subjuntivo", 1)}`;
    return pick(r, [
      () => mcq(r, `Impératif, « tú » : **${verb}** (${fr}) !`, `¡${cap(tu)}!`, [`¡${cap(usted)}!`, `¡${cap(conj(verb, "presente", 1))}!`, `¡${cap(verb)}!`], `Impératif tú = 3e personne du présent : ${tu}.`),
      () => mcq(r, `Impératif, « usted » : **${verb}** (${fr}) !`, `¡${cap(usted)}!`, [`¡${cap(tu)}!`, `¡${cap(conj(verb, "subjuntivo", 5))}!`, `¡${cap(verb)}!`], `Usted → subjonctif présent : ${usted}.`),
      () => mcq(r, `Défense, « tú » : ne pas **${verb}** !`, `¡${cap(neg)}!`, [`¡No ${tu}!`, `¡No ${verb}!`, `¡No ${conj(verb, "presente", 1)}!`], `La défense se forme avec no + subjonctif : ${neg}.`),
    ])();
  },
  (r) => {
    const [verb, fr] = pick(r, VERBS), p = int(r, 0, 5);
    return mcq(r, `« Si tuviera dinero, ${PERSONS[p].split(" / ")[0]} ___ (${verb}) más. »`, conj(verb, "condicional", p), [conj(verb, "futuro", p), conj(verb, "imperfecto", p), conj(verb, "subjuntivo", p)],
      `Si + subjonctif imparfait → conditionnel : ${conj(verb, "condicional", p)} (${fr}).`);
  },
  claims([
    ["« Cuando » + futur exige le subjonctif en espagnol : « Cuando llegues, llámame ».", true, "Contrairement au français (quand tu arriveras)."],
    ["« Creo que » est suivi du subjonctif.", false, "Creo que + indicatif ; no creo que + subjonctif."],
    ["« Ojalá » exprime un souhait et se construit avec le subjonctif.", true, "¡Ojalá ganemos!"],
  ]),
];

// ───────────── Le monde hispanique ─────────────

const monde: Generator[] = [
  ...pairs(
    [["México", "Ciudad de México"], ["Argentina", "Buenos Aires"], ["Colombia", "Bogotá"], ["Perú", "Lima"], ["Chile", "Santiago"], ["Venezuela", "Caracas"], ["Cuba", "La Habana"], ["Ecuador", "Quito"], ["Uruguay", "Montevideo"], ["Paraguay", "Asunción"], ["Costa Rica", "San José"], ["Honduras", "Tegucigalpa"], ["Nicaragua", "Managua"], ["República Dominicana", "Santo Domingo"], ["Guatemala", "Ciudad de Guatemala"]],
    { ask: (a) => `Capitale : ${a} ?`, reverse: (b) => `${b} est la capitale de quel pays ?`, claim: (a, b) => `La capitale de ${a} est ${b}.`, explain: (a, b) => `${a} : ${b}.` },
  ),
  ...pairs(
    [["Gabriel García Márquez", "Cien años de soledad"], ["Pablo Neruda", "Canto general"], ["Jorge Luis Borges", "Ficciones"], ["Isabel Allende", "La casa de los espíritus"], ["Frida Kahlo", "Las dos Fridas"], ["Diego Rivera", "les grandes fresques murales mexicaines"], ["Mario Vargas Llosa", "La ciudad y los perros"], ["Julio Cortázar", "Rayuela"], ["Octavio Paz", "El laberinto de la soledad"], ["Gabriela Mistral", "Desolación"]],
    { ask: (a) => `Œuvre célèbre de ${a} ?`, reverse: (b) => `Qui est l'auteur de ${b.startsWith("les ") ? b : `*${b}*`} ?`, claim: (a, b) => `${b.startsWith("les ") ? cap(b) + " sont" : `*${b}* est`} une œuvre de ${a}.`, explain: (a, b) => `${a} : ${b}.` },
  ),
  ...pairs(
    [["el Machu Picchu", "Perú"], ["el lago Titicaca", "Perú y Bolivia"], ["el desierto de Atacama", "Chile"], ["las cataratas del Iguazú", "Argentina y Brasil"], ["Chichén Itzá", "México"], ["las islas Galápagos", "Ecuador"], ["la Patagonia", "Argentina y Chile"]],
    { ask: (a) => `Où se trouve ${a} ?`, reverse: (b) => `Quel site célèbre se trouve en ${b} ?`, claim: (a, b) => `On trouve ${a} en ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["Le Brésil est un pays hispanophone.", false, "On y parle portugais."],
    ["L'espagnol est langue officielle dans 20 pays (et à Porto Rico).", true, "Surtout en Amérique latine."],
    ["Les Mayas, les Aztèques et les Incas sont des civilisations précolombiennes.", true, "Antérieures à l'arrivée des Européens."],
    ["Le quechua est encore parlé par des millions de personnes dans les Andes.", true, "Langue des Incas, co-officielle au Pérou et en Bolivie."],
  ]),
];

// ───────────── Mémoire et histoire ─────────────

const memoire: Generator[] = [
  ...chrono([
    ["Llegada de Cristóbal Colón a América", 1492], ["Conquista de Tenochtitlan por Hernán Cortés", 1521], ["Inicio de la independencia de México (Grito de Dolores)", 1810],
    ["Inicio de la Guerra Civil española", 1936], ["Bombardeo de Guernica", 1937], ["Fin de la Guerra Civil y comienzo de la dictadura de Franco", 1939],
    ["Revolución cubana", 1959], ["Golpe de Estado de Pinochet en Chile", 1973], ["Muerte de Franco", 1975], ["Golpe militar en Argentina", 1976],
    ["Constitución española", 1978], ["Intento de golpe de Estado del 23-F", 1981], ["Entrada de España en la CEE", 1986], ["Juegos Olímpicos de Barcelona", 1992], ["Ley de Memoria Histórica en España", 2007],
  ]),
  ...pairs(
    [
      ["el franquismo", "la dictature du général Franco (1939-1975)"], ["la Transición", "le passage de la dictature à la démocratie en Espagne"], ["los desaparecidos", "les opposants enlevés et assassinés par les dictatures"],
      ["las Madres de Plaza de Mayo", "les mères argentines qui réclament leurs enfants disparus"], ["el exilio", "le départ forcé hors de son pays"], ["el mestizaje", "le métissage né de la colonisation"],
      ["la conquista", "la colonisation espagnole de l'Amérique"], ["la memoria histórica", "le travail de mémoire sur les victimes de la guerre civile et du franquisme"], ["los conquistadores", "les conquérants espagnols du Nouveau Monde"],
    ],
    { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
];

// ───────────── Argumenter ─────────────

const argumenter: Generator[] = [
  ...pairs(
    [["sin embargo", "cependant"], ["además", "de plus"], ["por lo tanto", "par conséquent"], ["aunque", "bien que, même si"], ["mientras que", "tandis que"], ["por eso", "c'est pourquoi"], ["en cambio", "en revanche"], ["es decir", "c'est-à-dire"], ["a pesar de", "malgré"], ["por un lado", "d'un côté"], ["en primer lugar", "en premier lieu"], ["para concluir", "pour conclure"], ["ya que", "puisque"], ["en cuanto a", "quant à"]],
    { ask: (a) => `Que veut dire le connecteur **${a}** ?`, reverse: (b) => `Comment dit-on « ${b} » en espagnol ?`, claim: (a, b) => `**${a}** signifie « ${b} ».`, explain: (a, b) => `*${a}* = ${b}.` },
  ),
  ...pairs(
    [["Creo que…", "je crois que…"], ["En mi opinión…", "à mon avis…"], ["Estoy de acuerdo con…", "je suis d'accord avec…"], ["Me parece que…", "il me semble que…"], ["No estoy seguro de que…", "je ne suis pas sûr que…"], ["Hay que…", "il faut…"], ["Vale la pena…", "cela vaut la peine…"]],
    { ask: (a) => `Que veut dire « ${a} » ?`, reverse: (b) => `Comment dire « ${b} » en espagnol ?`, explain: (a, b) => `${a} = ${b}.` },
  ),
  conjugate(["futuro", "condicional"]),
  claims([
    ["« Hay que » + infinitif exprime une obligation impersonnelle.", true, "Hay que proteger el planeta."],
    ["« Tener que » + infinitif exprime une obligation personnelle.", true, "Tengo que estudiar."],
    ["Dans un essai, « para concluir » introduit l'introduction.", false, "Il introduit la conclusion."],
  ]),
];

export const ESPAGNOL: Record<string, Generator[]> = {
  "es-2-presente": presente,
  "es-2-vocabulaire": vocabulaire,
  "es-2-cliches": cliches,
  "es-1-passe": passe,
  "es-1-subjonctif": subjonctif,
  "es-1-monde-hispanique": monde,
  "es-t-memoire": memoire,
  "es-t-argumenter": argumenter,
};
