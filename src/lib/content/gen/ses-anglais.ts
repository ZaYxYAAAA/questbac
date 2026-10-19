/** Générateurs de questions — SES et Anglais. */
import type { Difficulty } from "@/lib/types";
import { type Card, type Generator, type Pair, cards, claims, fr, int, mcq, numeric, pairs, pick, sample, tex, tf } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Fixe la difficulté de toutes les questions d'un générateur, sans perdre ses cartes mémoire. */
const level = (d: Difficulty, g: Generator): Generator =>
  Object.assign((r: Parameters<Generator>[0]) => ({ ...g(r), difficulty: d }), g.memo ? { memo: g.memo } : {});
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });

// ───────────── SES ─────────────

const richesses: Generator[] = [
  (r) => {
    const ca = int(r, 20, 200) * 10, ci = int(r, 5, Math.floor(ca / 20)) * 10;
    return numeric(`Une entreprise vend pour $${ca}$ k€ et achète pour $${ci}$ k€ de consommations intermédiaires. Valeur ajoutée (k€) ?`, ca - ci, `VA = production − consommations intermédiaires = $${ca} - ${ci}$.`, "k€");
  },
  (r) => {
    const p0 = int(r, 100, 3000), g = pick(r, [-3, -1.5, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
    const p1 = Math.round(p0 * (1 + g / 100) * 10) / 10;
    return numeric(`Le PIB passe de $${tex(p0)}$ à $${tex(p1)}$ milliards. Taux de croissance (en %, au dixième) ?`, Math.round(((p1 - p0) / p0) * 1000) / 10, `$\\dfrac{${tex(p1)} - ${tex(p0)}}{${tex(p0)}} \\times 100$.`, "%", 0.11);
  },
  (r) => {
    const base = int(r, 50, 500), v = Math.round(base * pick(r, [0.8, 0.9, 1.1, 1.25, 1.5, 2]));
    return numeric(`Une grandeur vaut $${base}$ l'année de base (indice 100) et $${v}$ ensuite. Indice ?`, Math.round((v / base) * 1000) / 10, `$\\dfrac{${v}}{${base}} \\times 100$.`, undefined, 0.11);
  },
  (r) => {
    // Piège classique : un écart d'indices (en points) n'est pas un taux de variation.
    const i0 = pick(r, [110, 120, 125, 130, 150, 160, 200]), i1 = i0 + pick(r, [-20, -10, 10, 15, 20, 30, 40, 50]);
    return numeric(`Base 100 en 2015 : l'indice des prix passe de $${i0}$ en 2022 à $${i1}$ en 2024. Taux de variation entre 2022 et 2024 (en %, au dixième) ?`, Math.round(((i1 - i0) / i0) * 1000) / 10,
      `$\\dfrac{${i1} - ${i0}}{${i0}} \\times 100$ : l'indice ${i1 > i0 ? "gagne" : "perd"} $${Math.abs(i1 - i0)}$ points, mais la ${i1 > i0 ? "hausse" : "baisse"} n'est pas de $${Math.abs(i1 - i0)}\\,\\%$ car l'indice de départ n'est pas 100.`, "%", 0.11, 3);
  },
  ...terms([
    ["PIB", "la somme des valeurs ajoutées produites sur un territoire en un an"], ["valeur ajoutée", "la richesse créée par une organisation (production − consommations intermédiaires)"],
    ["consommations intermédiaires", "les biens et services détruits ou transformés pendant la production"], ["production non marchande", "des services fournis gratuitement ou presque par les administrations"],
    ["facteurs de production", "le travail et le capital utilisés pour produire"], ["productivité", "le rapport entre la production et les facteurs utilisés"], ["entreprise", "une organisation qui produit des biens et services marchands"],
    ["administration publique", "une organisation qui produit des services non marchands financés par les prélèvements obligatoires"], ["économie sociale et solidaire", "les associations, coopératives et mutuelles"],
  ]),
  claims([
    ["Le PIB mesure aussi le bien-être de la population.", false, "Il ne prend pas en compte les inégalités, le bénévolat ou l'environnement."],
    ["Le travail domestique n'est pas comptabilisé dans le PIB.", true, "Il n'est ni marchand ni produit par une administration."],
    ["Une association peut produire des richesses.", true, "Sa production est généralement non marchande."],
  ]),
];

const marche: Generator[] = [
  (r) => {
    const b = int(r, 1, 5), c = int(r, 1, 5), e = pick(r, [0, 10, 20]), p = int(r, Math.ceil((e + 10) / c), 40);
    const a = (b + c) * p - e, q = c * p - e, k = (n: number) => (n === 1 ? "" : `${n}`);
    const offre = `${k(c)}p${e ? ` - ${e}` : ""}`;
    const solve = `$${a} - ${k(b)}p = ${offre} \\iff ${b + c}p = ${a + e} \\iff p = ${p}$`;
    return r() < 0.5
      ? numeric(`Demande : $D = ${a} - ${k(b)}p$ ; offre : $O = ${offre}$. Prix d'équilibre ?`, p, `À l'équilibre, $D = O$ : ${solve}.`)
      : numeric(`Demande : $D = ${a} - ${k(b)}p$ ; offre : $O = ${offre}$. Quantité échangée à l'équilibre ?`, q, `À l'équilibre, $D = O$ : ${solve}, puis $Q = ${k(c)}${c === 1 ? "" : " \\times "}${p}${e ? ` - ${e}` : ""} = ${q}$.`, undefined, undefined, 2);
  },
  (r) => {
    const shift = pick(r, [
      ["une hausse du revenu des consommateurs (bien normal)", "la demande augmente : le prix et la quantité d'équilibre augmentent"],
      ["une hausse du coût des matières premières", "l'offre diminue : le prix augmente, la quantité baisse"],
      ["un progrès technique qui réduit les coûts", "l'offre augmente : le prix baisse, la quantité augmente"],
      ["une baisse de la popularité du produit", "la demande baisse : le prix et la quantité baissent"],
      ["l'arrivée de nombreux nouveaux producteurs", "l'offre augmente : le prix baisse, la quantité augmente"],
    ] as const);
    const outcomes = ["la demande augmente : le prix et la quantité d'équilibre augmentent", "l'offre diminue : le prix augmente, la quantité baisse", "l'offre augmente : le prix baisse, la quantité augmente", "la demande baisse : le prix et la quantité baissent"];
    return mcq(r, `Effet de ${shift[0]} sur le marché ?`, shift[1], outcomes, `Raisonnement offre/demande : ${shift[1]}.`);
  },
  ...terms([
    ["marché", "le lieu de rencontre entre l'offre et la demande"], ["prix d'équilibre", "le prix pour lequel l'offre égale la demande"], ["concurrence parfaite", "un marché avec atomicité, homogénéité, transparence, libre entrée"],
    ["monopole", "un marché avec un seul offreur"], ["oligopole", "un marché avec quelques offreurs"], ["preneur de prix", "un agent qui ne peut pas influencer le prix"], ["surplus du consommateur", "l'écart entre le prix qu'il était prêt à payer et le prix payé"],
    ["défaillance du marché", "une situation où le marché ne conduit pas à une allocation efficace"], ["externalité", "l'effet d'une activité sur un tiers sans compensation monétaire"],
  ]),
  claims([
    ["Quand le prix augmente, la quantité demandée diminue en général.", true, "La courbe de demande est décroissante."],
    ["Quand le prix augmente, les producteurs souhaitent offrir moins.", false, "La courbe d'offre est croissante."],
    ["La pollution est un exemple d'externalité négative.", true, "Elle impose un coût aux tiers."],
  ]),
];

const financement: Generator[] = [
  (r) => {
    const c = int(r, 1, 50) * 1000, t = pick(r, [1, 2, 3, 4, 5]), n = int(r, 1, 5);
    return numeric(`Un prêt de $${tex(c)}$ € à $${t}\\,\\%$ d'intérêts simples sur $${n}$ an(s). Intérêts totaux (€) ?`, (c * t * n) / 100, `$${tex(c)} \\times ${tex(t / 100)} \\times ${n}$.`, "€", 0.5);
  },
  (r) => {
    const rev = int(r, 15, 60) * 100, s = pick(r, [5, 10, 12, 15, 20, 25]);
    return numeric(`Un ménage gagne $${tex(rev)}$ € et épargne $${s}\\,\\%$ de son revenu disponible. Épargne (€) ?`, (rev * s) / 100, `$${tex(rev)} \\times ${tex(s / 100)}$.`, "€", 0.5);
  },
  ...terms([
    ["épargne", "la part du revenu disponible qui n'est pas consommée"], ["financement direct", "le financement par émission de titres sur les marchés financiers"], ["financement indirect", "le financement par crédit bancaire"],
    ["autofinancement", "le financement d'un investissement par ses propres ressources"], ["taux d'intérêt", "le prix de l'argent emprunté"], ["monnaie scripturale", "la monnaie inscrite sur des comptes bancaires"],
    ["création monétaire", "la création de monnaie par les banques lorsqu'elles accordent des crédits"], ["action", "un titre de propriété d'une part du capital d'une entreprise"], ["obligation", "un titre de créance rémunéré par des intérêts"],
    ["Banque centrale européenne", "l'institution qui conduit la politique monétaire de la zone euro"],
  ]),
  claims([
    ["« Les crédits font les dépôts. »", true, "Une banque crée de la monnaie en accordant un crédit."],
    ["Un actionnaire est un créancier de l'entreprise.", false, "Il en est copropriétaire ; l'obligataire est créancier."],
    ["Une hausse des taux directeurs vise en général à freiner l'inflation.", true, "Elle renchérit le crédit."],
  ]),
];

const socialisation: Generator[] = [
  cards([
    ["Quelle instance relève avant tout de la socialisation primaire ?", "la famille", ["l'entreprise", "le syndicat", "le parti politique"], "La socialisation primaire, celle de l'enfance, passe surtout par la famille, l'école et les pairs."],
    ["Quelle instance relève avant tout de la socialisation secondaire ?", "le milieu professionnel", ["la famille d'origine", "l'école maternelle", "la crèche"], "La socialisation secondaire se poursuit à l'âge adulte : travail, couple, syndicat, association…"],
    ["Le groupe de pairs intervient…", "dans la socialisation primaire comme dans la socialisation secondaire", ["uniquement pendant l'enfance", "uniquement à l'âge adulte", "seulement à l'école"], "Camarades de classe, puis amis et collègues : les pairs socialisent à tout âge."],
    ["Un jeune salarié qui adopte les goûts et la façon de parler des cadres qu'il espère rejoindre illustre…", "la socialisation anticipatrice", ["la socialisation primaire", "la déviance", "la socialisation différenciée"], "Merton : on intériorise par avance les normes du groupe de référence."],
    ["Offrir des poupées aux filles et des voitures aux garçons illustre…", "une socialisation différenciée selon le genre", ["une socialisation anticipatrice", "une socialisation secondaire", "une sanction négative"], "Les jouets transmettent des rôles sexués."],
    ["Un regard réprobateur après une impolitesse est…", "une sanction négative informelle", ["une sanction positive formelle", "une sanction négative formelle", "une norme juridique"], "Formelle : prévue par une institution (amende, exclusion) ; informelle : diffuse (moquerie, regard)."],
    ["Pour Durkheim, la socialisation sert d'abord à…", "transmettre les normes et valeurs qui assurent la cohésion sociale", ["rendre chaque individu totalement unique", "former uniquement des travailleurs", "supprimer les différences de milieu social"], "L'éducation est une « socialisation méthodique de la jeune génération »."],
  ]),
  ...terms([
    ["socialisation", "le processus d'apprentissage des normes et valeurs d'une société"], ["norme", "une règle de conduite dans une situation donnée"], ["valeur", "un idéal collectif qui oriente les comportements"],
    ["socialisation primaire", "la socialisation de l'enfance"], ["socialisation secondaire", "la socialisation à l'âge adulte"], ["socialisation anticipatrice", "l'intériorisation des normes d'un groupe que l'on souhaite rejoindre"],
    ["socialisation différenciée", "une socialisation qui varie selon le genre ou le milieu social"], ["habitus", "un ensemble de dispositions durables acquises (Bourdieu)"], ["pairs", "les individus de même âge ou de même statut"],
    ["déviance", "la transgression d'une norme"],
  ]),
  claims([
    ["La socialisation s'arrête à la fin de l'enfance.", false, "Elle se poursuit toute la vie (socialisation secondaire)."],
    ["Les jouets peuvent participer à une socialisation différenciée selon le genre.", true, "Ils transmettent des rôles sexués."],
    ["L'individu est passif dans sa socialisation.", false, "Il participe activement et peut réinterpréter les normes."],
  ]),
  (r) => {
    const n = int(r, 5, 40) * 10, k = int(r, 1, Math.floor(n / 10)) * 5;
    return numeric(`Sur $${n}$ enfants interrogés, $${k}$ pratiquent la même activité que leurs parents. Proportion (%) ?`, Math.round((k / n) * 1000) / 10, `$\\dfrac{${k}}{${n}} \\times 100$.`, "%", 0.11);
  },
];

const croissance: Generator[] = [
  (r) => {
    const g = pick(r, [1, 2, 3, 4, 5, 7, 10]), n = pick(r, [5, 10, 20]);
    return numeric(`Une économie croît de $${g}\\,\\%$ par an pendant $${n}$ ans. Coefficient multiplicateur global (au centième) ?`, Math.round((1 + g / 100) ** n * 100) / 100, `$(1 + ${tex(g / 100)})^{${n}}$.`, undefined, 0.011);
  },
  (r) => {
    const g = pick(r, [1, 2, 3.5, 5, 7, 10, 14]);
    return numeric(`Avec une croissance annuelle de $${tex(g)}\\,\\%$, en combien d'années environ le PIB double-t-il ? (règle de 70)`, Math.round((70 / g) * 10) / 10, `$70 / ${tex(g)} \\approx ${tex(70 / g, 1)}$ ans.`, "ans", 0.11);
  },
  ...terms([
    ["croissance économique", "l'augmentation durable de la production d'un pays"], ["productivité globale des facteurs", "la part de la croissance non expliquée par la quantité de travail et de capital"],
    ["progrès technique", "l'ensemble des innovations qui améliorent la production"], ["innovation de produit", "la création d'un bien ou service nouveau"], ["innovation de procédé", "une nouvelle manière de produire"],
    ["destruction créatrice", "le remplacement d'activités anciennes par des activités innovantes (Schumpeter)"], ["capital humain", "les compétences et connaissances accumulées par un individu"],
    ["institutions", "les règles qui encadrent l'activité économique (droits de propriété…)"], ["croissance endogène", "une croissance entretenue par le progrès technique issu de l'activité économique"],
  ]),
  claims([
    ["La croissance économique se mesure par la variation du PIB réel.", true, "Corrigé de l'inflation."],
    ["La croissance est toujours compatible avec la préservation de l'environnement.", false, "Elle peut épuiser les ressources et polluer : c'est un enjeu de soutenabilité."],
    ["Les droits de propriété favorisent l'investissement et l'innovation.", true, "Ils sécurisent les gains."],
  ]),
];

const chomage: Generator[] = [
  (r) => {
    const act = int(r, 20, 35) * 1000, ch = int(r, 5, 12) * act / 100;
    return numeric(`$${tex(ch)}$ chômeurs pour $${tex(act)}$ actifs. Taux de chômage (%) ?`, Math.round((ch / act) * 1000) / 10, `Chômeurs / population active $\\times 100$.`, "%", 0.11);
  },
  (r) => {
    const t0 = pick(r, [4, 5, 8, 10, 12, 16, 20]), d = pick(r, [1, 2, 3, 4]), v = (d / t0) * 100, rate = fr(v, 1);
    // « point » reste au singulier en dessous de 2 (« +1 point », « 1,5 point »).
    const pts = (x: number) => `${fr(x, 1)} point${Math.abs(x) < 2 ? "" : "s"} de pourcentage`;
    const exact = Math.abs(Math.round(v * 10) / 10 - v) < 1e-9;
    return mcq(r, `Le taux de chômage passe de $${t0}\\,\\%$ à $${t0 + d}\\,\\%$. Comment décrire correctement cette évolution ?`,
      `+${pts(d)}, soit une hausse de ${rate} %`,
      [`+${d} %, soit une hausse de ${pts(d)}`, `+${pts(v)}, soit une hausse de ${d} %`, `+${rate} %, soit une hausse de ${pts(v)}`],
      `L'écart entre deux taux s'exprime en points ($${t0 + d} - ${t0} = ${d}$) ; la variation relative est $\\dfrac{${d}}{${t0}} \\times 100 ${exact ? "=" : "\\approx"} ${rate.replace(",", "{,}")}\\,\\%$.`, undefined, 2);
  },
  (r) => {
    const emp = int(r, 20, 30), ch = int(r, 2, 4);
    return numeric(`$${emp}$ millions d'actifs occupés et $${ch}$ millions de chômeurs. Population active (millions) ?`, emp + ch, `Population active = actifs occupés + chômeurs.`, "M");
  },
  ...terms([
    ["chômeur au sens du BIT", "une personne sans emploi, disponible et qui cherche activement un emploi"], ["population active", "les actifs occupés et les chômeurs"], ["halo du chômage", "les personnes proches du chômage sans en remplir tous les critères"],
    ["chômage structurel", "un chômage durable lié au fonctionnement du marché du travail"], ["chômage conjoncturel", "un chômage lié à un ralentissement de l'activité"], ["sous-emploi", "les personnes qui travaillent moins qu'elles ne le souhaitent"],
    ["appariement", "la mise en relation des offres et des demandes d'emploi"], ["salaire minimum", "le salaire plancher fixé par la loi (SMIC)"], ["flexibilité", "la capacité d'adapter l'emploi ou les salaires à l'activité"],
  ]),
  claims([
    ["Une personne qui ne cherche pas d'emploi est comptée comme chômeuse au sens du BIT.", false, "Il faut rechercher activement un emploi."],
    ["Les politiques de relance de la demande visent surtout le chômage conjoncturel.", true, "Elles soutiennent l'activité."],
    ["La formation peut réduire le chômage lié aux problèmes d'appariement.", true, "Elle adapte les qualifications aux emplois."],
  ]),
];

// ───────────── Anglais ─────────────

/** [base, prétérit, participe passé, sens, complément naturel de la phrase]. */
const IRREG: Array<[string, string, string, string, string]> = [
  ["go", "went", "gone", "aller", "to London"], ["see", "saw", "seen", "voir", "a great film"], ["take", "took", "taken", "prendre", "the night bus"], ["write", "wrote", "written", "écrire", "a long letter"],
  ["eat", "ate", "eaten", "manger", "sushi"], ["drink", "drank", "drunk", "boire", "too much coffee"], ["begin", "began", "begun", "commencer", "a new job"], ["buy", "bought", "bought", "acheter", "a new bike"],
  ["bring", "brought", "brought", "apporter", "a cake"], ["think", "thought", "thought", "penser", "about the problem"], ["teach", "taught", "taught", "enseigner", "maths"], ["catch", "caught", "caught", "attraper", "a cold"],
  ["find", "found", "found", "trouver", "a wallet in the street"], ["give", "gave", "given", "donner", "a speech"], ["speak", "spoke", "spoken", "parler", "to the manager"], ["break", "broke", "broken", "casser", "a window"],
  ["choose", "chose", "chosen", "choisir", "a new phone"], ["drive", "drove", "driven", "conduire", "a truck"], ["fly", "flew", "flown", "voler (en avion)", "a plane"], ["forget", "forgot", "forgotten", "oublier", "the password"],
  ["leave", "left", "left", "partir, quitter", "the house early"], ["lose", "lost", "lost", "perdre", "the match"], ["meet", "met", "met", "rencontrer", "the new neighbours"], ["sell", "sold", "sold", "vendre", "the old car"],
  ["tell", "told", "told", "dire, raconter", "a funny story"], ["understand", "understood", "understood", "comprendre", "the lesson"], ["swim", "swam", "swum", "nager", "across the lake"], ["sing", "sang", "sung", "chanter", "a song in Spanish"],
  ["steal", "stole", "stolen", "voler (dérober)", "a painting"], ["wear", "wore", "worn", "porter (un vêtement)", "a suit"],
];
const SUBJECTS = ["I", "You", "She", "He", "We", "They", "My brother", "Our teacher"];
const third = (s: string) => ["She", "He", "My brother", "Our teacher"].includes(s);
/** Forme en -ing bien orthographiée (e muet, consonne doublée). */
const DOUBLE = new Set(["swim", "begin", "forget", "get", "run", "sit", "stop", "win", "put", "cut", "shop"]);
const ing = (v: string) => (DOUBLE.has(v) ? `${v}${v.slice(-1)}ing` : /ie$/.test(v) ? `${v.slice(0, -2)}ying` : /[^e]e$/.test(v) ? `${v.slice(0, -1)}ing` : `${v}ing`);
/** Forme « régularisée » fautive (erreur typique : *goed*, *buyed*, *flied*). */
const ed = (v: string) => (/e$/.test(v) ? `${v}d` : /[^aeiou]y$/.test(v) ? `${v.slice(0, -1)}ied` : `${v}ed`);
/** 3e personne du singulier du présent. */
const s3 = (v: string) => (/(s|sh|ch|x|o)$/.test(v) ? `${v}es` : /[^aeiou]y$/.test(v) ? `${v.slice(0, -1)}ies` : `${v}s`);

/**
 * Leurres des verbes dont le prétérit et le participe sont identiques : formes d'un verbe voisin
 * (brought et bought, taught et thought, founded, lived), participe en -en par analogie
 * (*forgotten*, *eaten*) ou prétérit irrégulier inventé.
 */
const LOOKALIKE: Record<string, string[]> = {
  buy: ["brought – brought", "bought – brought", "brought – bought"],
  bring: ["bought – bought", "brang – brung", "brought – brung"],
  think: ["taught – taught", "thought – taught", "taught – thought"],
  teach: ["thought – thought", "taught – thought", "thought – taught"],
  catch: ["cought – cought", "caught – caughten", "catched – caughten"],
  find: ["founded – founded", "found – founded", "fond – found"],
  leave: ["lived – lived", "left – lived", "lived – left"],
  lose: ["loosed – loosed", "lost – losen", "lose – lost"],
  meet: ["mat – met", "met – meeten", "mat – mat"],
  sell: ["selt – selt", "sold – solden", "sealed – sealed"],
  tell: ["telt – telt", "told – tolden", "tolled – tolled"],
  understand: ["understud – understud", "understood – understooden", "understanded – understanden"],
};

const past: Generator[] = [
  (r) => {
    const [base, pret, pp, , rest] = pick(r, IRREG);
    const s = pick(r, SUBJECTS), when = pick(r, ["yesterday", "last week", "two days ago", "in 2019", "last summer", "when I was ten"]);
    return mcq(r, `${s} ___ (${base}) ${rest} ${when}.`, pret, [`${third(s) ? "has" : "have"} ${pp}`, base, ed(base)], `Marqueur de temps passé et daté (*${when}*) → prétérit : *${pret}*.`);
  },
  (r) => {
    const [base, pret, pp, , rest] = pick(r, IRREG);
    const s = pick(r, SUBJECTS), marker = pick(r, ["already", "never", "just", "ever"]);
    const aux = third(s) ? "has" : "have";
    const sentence = marker === "ever" ? `${cap(aux)} ${s === "I" ? "you" : s.charAt(0).toLowerCase() + s.slice(1)} ever ___ (${base}) ${rest}?` : `${s} ${aux} ${marker} ___ (${base}) ${rest}.`;
    return mcq(r, sentence, pp, [pret === pp ? ed(base) : pret, base, ing(base)], `*${aux} + participe passé* (present perfect) : *${pp}*.`);
  },
  (r) => {
    const [base, pret, pp, fr] = pick(r, IRREG);
    return pick(r, [
      () => mcq(r, `Prétérit de **to ${base}** (${fr}) ?`, pret, [pp === pret ? `${pret}ed` : pp, ed(base), base], `to ${base} – ${pret} – ${pp}.`),
      () => mcq(r, `Participe passé de **to ${base}** (${fr}) ?`, pp, [pret === pp ? `${pp}ed` : pret, ed(base), base], `to ${base} – ${pret} – ${pp}.`),
      // Les deux formes à la fois : on ne peut pas répondre en devinant une seule forme.
      () => mcq(r, `Prétérit et participe passé de **to ${base}** (${fr}) ?`, `${pret} – ${pp}`,
        // Deux leurres irréguliers (formes inversées ou d'un verbe voisin) et un seul en -ed, trop facile à écarter.
        [...sample(r, pret === pp ? LOOKALIKE[base] : [`${pp} – ${pret}`, `${pret} – ${pret}`, `${pp} – ${pp}`], 2),
          pick(r, [`${ed(base)} – ${ed(base)}`, `${pret} – ${ed(base)}`, `${ed(base)} – ${pp}`])],
        `to ${base} – ${pret} – ${pp}${pret === pp ? " (prétérit et participe passé identiques)" : ""}.`,
        () => pick(r, [`${ed(base)} – ${ed(base)}`, `${pret} – ${ed(base)}`, `${ed(base)} – ${pp}`, ...(LOOKALIKE[base] ?? [])]), 2),
      () => mcq(r, `Que veut dire **to ${base}** ?`, fr, [pick(r, IRREG)[3], pick(r, IRREG)[3], pick(r, IRREG)[3]], `to ${base} = ${fr}.`, () => pick(r, IRREG)[3]),
    ])();
  },
  (r) => {
    const n = int(r, 2, 15), unit = pick(r, ["years", "months", "weeks", "days"]);
    const y = pick(r, [2005, 2010, 2015, 2018, 2020, 2022]);
    return pick(r, [
      () => mcq(r, `I have lived here ___ ${n} ${unit}.`, "for", ["since", "ago", "during"], `*for* + durée.`),
      () => mcq(r, `I have lived here ___ ${y}.`, "since", ["for", "ago", "during"], `*since* + point de départ.`),
      () => mcq(r, `I moved here ${n} ${unit} ___.`, "ago", ["for", "since", "during"], `*ago* (« il y a ») se place après la durée, avec le prétérit.`),
      () => mcq(r, `She ___ for this company since ${y}.`, "has worked", ["works", "worked", "is working"], `*since* + point de départ : l'action dure encore → present perfect (le français dit « elle travaille depuis »).`),
    ])();
  },
  claims([
    ["Le present perfect s'emploie avec un moment passé précis (yesterday, in 2010).", false, "Avec un moment daté, on emploie le prétérit."],
    ["« I have just finished » signifie « je viens de finir ».", true, "*have just + participe passé*."],
    ["« ago » se place après la durée : « three years ago ».", true, "Il signifie « il y a »."],
    ["« Je travaille ici depuis trois ans » se traduit par « I work here for three years ».", false, "On dit *I have worked (I have been working) here for three years* : l'action commencée dans le passé dure encore."],
    ["« Did you see him yesterday? » emploie correctement le prétérit.", true, "*yesterday* : moment passé et révolu."],
  ]),
];

const VOCAB_VERBS: Pair[] = [
  ["to achieve", "accomplir, réaliser"], ["to attend", "assister à"], ["to improve", "améliorer"], ["to require", "exiger, nécessiter"], ["to threaten", "menacer"], ["to struggle", "lutter, avoir du mal"],
  ["to own", "posséder"], ["to borrow", "emprunter"], ["to lend", "prêter"], ["to fail", "échouer"], ["to succeed", "réussir"], ["to warn", "avertir"], ["to grow up", "grandir"],
  ["to give up", "abandonner"], ["to find out", "découvrir"], ["to deny", "nier"], ["to rely on", "compter sur"], ["to look forward to", "avoir hâte de"], ["to be aware of", "avoir conscience de"],
  ["to pretend", "faire semblant"], ["to overcome", "surmonter"], ["to tackle", "s'attaquer à (un problème)"], ["to undermine", "fragiliser, saper"], ["to foster", "favoriser, encourager"], ["to enforce", "faire appliquer (une loi)"],
];
/** Adverbes, connecteurs et adjectifs. */
const VOCAB_LINKS: Pair[] = [
  ["actually", "en fait"], ["eventually", "finalement"], ["currently", "actuellement"], ["however", "cependant"], ["although", "bien que"], ["whereas", "tandis que"], ["meanwhile", "pendant ce temps"],
  ["sensible", "raisonnable"], ["likely", "probable"], ["nevertheless", "néanmoins"],
];
const VOCAB_WORDS: Pair[] = [
  ["a library", "une bibliothèque"], ["a skill", "une compétence"], ["wealth", "la richesse"], ["poverty", "la pauvreté"], ["growth", "la croissance"], ["a law", "une loi"], ["a trial", "un procès"],
  ["the weather", "le temps (météo)"], ["knowledge", "la connaissance, le savoir"], ["behaviour", "le comportement"], ["a journey", "un voyage, un trajet"], ["a novel", "un roman"], ["a lecture", "un cours magistral, une conférence"],
  ["a grade", "une note (scolaire)"], ["a coin", "une pièce de monnaie"], ["the countryside", "la campagne"], ["a shortage", "une pénurie"], ["a threat", "une menace"], ["an issue", "un problème, une question (à débattre)"],
  ["the workforce", "la main-d'œuvre"],
];
const VOCAB = [...VOCAB_VERBS, ...VOCAB_LINKS, ...VOCAB_WORDS];
/** Liste de même nature qu'un mot (pour des leurres homogènes). */
const sameKind = (en: string) => [VOCAB_VERBS, VOCAB_LINKS, VOCAB_WORDS].find((l) => l.some(([a]) => a === en))!;
const FALSE_FRIENDS: Pair[] = [
  ["actually", "actuellement"], ["eventually", "éventuellement"], ["a library", "une librairie"], ["sensible", "sensible"], ["to attend", "attendre"], ["a lecture", "une lecture"], ["a journey", "une journée"],
  ["a novel", "une nouvelle"], ["to pretend", "prétendre"], ["a coin", "un coin"], ["to achieve", "achever"], ["a grade", "un grade"],
];
const vocabOptions = { ask: (a: string) => `Que veut dire **${a}** ?`, reverse: (b: string) => `Comment dit-on **${b}** en anglais ?`, claim: (a: string, b: string) => `**${a}** signifie « ${b} ».`, explain: (a: string, b: string) => `*${a}* = ${b}.` };
/** Quasi-synonymes : l'un ne doit jamais servir de leurre (ni de faux « vrai/faux ») pour l'autre. */
const NEAR: ReadonlyArray<readonly string[]> = [["to achieve", "to succeed"], ["however", "nevertheless"]];
const near = (a: string, b: string) => NEAR.some((g) => g.includes(a) && g.includes(b));
/** Un générateur de vocabulaire qui retire les tirages où deux quasi-synonymes se font face (mot ou traduction). */
const noNear = (g: Generator): Generator =>
  Object.assign((r: Parameters<Generator>[0]) => {
    let d = g(r);
    for (let guard = 0; guard < 30; guard++) {
      const text = [d.prompt, ...(d.type === "mcq" ? d.choices : [])].join("\n");
      if (!NEAR.some((grp) => grp.filter((w) => text.includes(w) || text.includes(VOCAB.find(([a]) => a === w)![1])).length > 1)) break;
      d = g(r);
    }
    return d;
  }, g.memo ? { memo: g.memo } : {});

const vocab: Generator[] = [
  // Verbes, mots invariables et noms séparés : les leurres sont de la même nature que la réponse.
  ...pairs(VOCAB_VERBS, vocabOptions).map(noNear),
  ...pairs(VOCAB_LINKS, vocabOptions).map(noNear),
  ...pairs(VOCAB_WORDS, vocabOptions),
  (r) => {
    const [en, trap] = pick(r, FALSE_FRIENDS);
    const right = VOCAB.find(([a]) => a === en)![1];
    return pick(r, [
      () => tf(`**${en}** veut dire « ${trap} ».`, false, `Faux ami ! *${en}* = ${right}.`),
      () => tf(`**${en}** veut dire « ${right} ».`, true, `Attention au faux ami : *${en}* ne veut pas dire « ${trap} ».`),
      // Le piège est toujours proposé ; les autres leurres excluent les quasi-synonymes.
      () => mcq(r, `Faux ami : que veut dire **${en}** ?`, right, [trap, ...sample(r, sameKind(en).filter(([e, m]) => e !== en && m !== trap && !near(e, en)), 2).map(([, m]) => m)], `*${en}* = ${right} (et non « ${trap} »).`),
    ])();
  },
];

const MODALS: Pair[] = [
  ["You must wear a helmet.", "obligation"], ["You mustn't smoke here.", "interdiction"], ["You should see a doctor.", "conseil"], ["She can speak three languages.", "capacité"],
  ["It might rain tomorrow.", "faible probabilité"], ["He must be tired after that run.", "forte probabilité (déduction)"], ["You don't have to come.", "absence d'obligation"], ["Can I open the window?", "demande de permission"],
  ["You'd better leave now.", "conseil"], ["I could swim when I was five.", "capacité"], ["They may be late.", "probabilité moyenne"], ["You needn't worry.", "absence d'obligation"],
  ["She can't be at home: her car isn't here.", "impossibilité (déduction négative)"], ["You should have told me!", "reproche"],
];

const modals: Generator[] = [
  (r) => {
    const [s, m] = pick(r, MODALS);
    return mcq(r, `Qu'exprime le modal dans « ${s} » ?`, m, [...new Set(MODALS.map(([, x]) => x))].filter((x) => x !== m), `« ${s} » : ${m}.`);
  },
  ...pairs(
    [["must", "obligation ou forte probabilité"], ["should", "conseil"], ["can", "capacité ou permission"], ["might", "faible probabilité"], ["mustn't", "interdiction"], ["needn't", "absence de nécessité"], ["would", "conditionnel ou habitude passée"]],
    { ask: (a) => `Valeur principale de **${a}** ?`, reverse: (b) => `Quel modal exprime : ${b} ?`, claim: (a, b) => `**${a}** exprime : ${b}.`, explain: (a, b) => `*${a}* : ${b}.` },
  ),
  (r) => {
    const s = pick(r, SUBJECTS), v = pick(r, ["go", "work", "study", "leave", "call", "finish"]);
    return mcq(r, `${s} ${pick(r, ["must", "can", "should", "might"])} ___ now.`, v, [`to ${v}`, s3(v), ing(v)], `Après un modal : base verbale sans *to* ni *-s*.`);
  },
  level(2, cards([
    ["Yesterday, I ___ leave early because of a meeting.", "had to", ["must", "should", "have to"], "*must* n'a pas de passé : l'obligation passée s'exprime avec *had to*."],
    ["Next year, students ___ wear a uniform.", "will have to", ["will must", "must to", "will can"], "Pas de futur de *must* : *will have to*."],
    ["She ___ be at home: the lights are off.", "can't", ["mustn't", "needn't", "doesn't have to"], "Déduction négative (« elle ne peut pas être chez elle ») : *can't*."],
    ["When I was a child, I ___ swim very fast.", "could", ["can", "must", "should"], "*could* : capacité dans le passé."],
    ["You ___ bring anything: we have everything we need.", "don't have to", ["mustn't", "can't", "shouldn't have"], "Absence d'obligation : *don't have to* / *needn't* (et non *mustn't*, qui interdit)."],
    ["I ___ rather stay at home tonight.", "would", ["should", "will", "must"], "*I would rather* (*I'd rather*) + base verbale : préférence."],
  ])),
  // Modaux au passé (modal + have + participe passé) : niveau B2.
  level(3, cards([
    ["He ___ have left already: his coat isn't here.", "must", ["needn't", "shouldn't", "can't"], "*must have + participe passé* : déduction sur le passé (« il a dû partir »)."],
    ["You ___ have called me, I was so worried!", "should", ["must", "can", "will"], "*should have + participe passé* : reproche sur une action passée non réalisée."],
    ["She ___ have seen us: she was looking the other way.", "can't", ["mustn't", "shouldn't", "needn't"], "*can't have + participe passé* : déduction négative sur le passé (« elle n'a pas pu nous voir »)."],
    ["You ___ have bought bread: there was plenty at home, but thanks anyway!", "needn't", ["mustn't", "can't", "couldn't"], "*needn't have + participe passé* : action faite alors qu'elle était inutile."],
  ])),
];

/** [sujet actif, base verbale, prétérit, objet, participe passé, sujet du passif, sujet du passif pluriel ?] */
const PASSIVES: Array<[string, string, string, string, string, string, boolean]> = [
  ["Shakespeare", "write", "wrote", "Hamlet", "written", "Hamlet", false], ["The police", "arrest", "arrested", "the thief", "arrested", "The thief", false],
  ["Millions of people", "watch", "watched", "the match", "watched", "The match", false], ["A famous architect", "build", "built", "this bridge", "built", "This bridge", false],
  ["The teacher", "correct", "corrected", "the tests", "corrected", "The tests", true], ["Fleming", "discover", "discovered", "penicillin", "discovered", "Penicillin", false],
  ["The storm", "destroy", "destroyed", "the houses", "destroyed", "The houses", true], ["Our neighbours", "sell", "sold", "the car", "sold", "The car", false],
  ["Marie Curie", "win", "won", "two Nobel prizes", "won", "Two Nobel prizes", true], ["Thousands of fans", "sing", "sang", "the anthem", "sung", "The anthem", false],
];
/** Nom propre gardé tel quel, sinon minuscule (« the police »). */
const low = (s: string) => (/^(The|A|An|Our|My|Millions|Thousands)\b/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

const AGENTS = ["the children", "my mother", "the workers", "a robot", "the students", "the company", "our neighbours", "the chef"];
const PLURAL_AGENTS = new Set(["the children", "the workers", "the students", "our neighbours"]);
const P_VERBS: Array<[string, string, string, Array<[string, boolean]>]> = [
  ["cleans", "cleaned", "cleaned", [["the room", false], ["the windows", true], ["the kitchen", false]]],
  ["paints", "painted", "painted", [["the walls", true], ["the fence", false], ["the door", false]]],
  ["builds", "built", "built", [["the house", false], ["the bridges", true], ["a new school", false]]],
  ["writes", "wrote", "written", [["the letter", false], ["the reports", true], ["a poem", false]]],
  ["cooks", "cooked", "cooked", [["the dinner", false], ["the vegetables", true], ["a cake", false]]],
  ["repairs", "repaired", "repaired", [["the bike", false], ["the computers", true], ["the roof", false]]],
  ["sells", "sold", "sold", [["the car", false], ["the tickets", true], ["fresh bread", false]]],
  ["delivers", "delivered", "delivered", [["the parcels", true], ["the pizza", false], ["the newspapers", true]]],
  ["takes", "took", "taken", [["the pictures", true], ["the decision", false], ["the photos", true]]],
  ["washes", "washed", "washed", [["the dishes", true], ["the car", false], ["the clothes", true]]],
];

const passive: Generator[] = [
  (r) => {
    const agent = pick(r, AGENTS), [pres, pret, pp, objs] = pick(r, P_VERBS), [obj, plural] = pick(r, objs), past = r() < 0.5;
    const base = pres.replace(/es$/, (m) => (/(sh|ch|x|s)es$/.test(pres) ? "" : m)).replace(/s$/, "");
    const verb = past ? pret : PLURAL_AGENTS.has(agent) ? base : pres;
    const be = past ? (plural ? "were" : "was") : plural ? "are" : "is";
    const wrongBe = past ? (plural ? "are" : "is") : plural ? "were" : "was";
    const O = cap(obj);
    return mcq(r, `Mets à la voix passive : « ${cap(agent)} ${verb} ${obj}. »`, `${O} ${be} ${pp} by ${agent}.`, [`${O} ${wrongBe} ${pp} by ${agent}.`, `${O} ${be} ${ing(base)} by ${agent}.`, `${cap(agent)} ${be} ${pp} by ${obj}.`], `*be* au ${past ? "prétérit" : "présent"} (${be}) + participe passé (*${pp}*) + *by*.`);
  },
  (r) => {
    const [subj, base, pret, obj, pp, S, plural] = pick(r, PASSIVES);
    const be = plural ? "were" : "was", by = low(subj);
    const ans = `${S} ${be} ${pp} by ${by}.`;
    const wrongs = [`${S} ${plural ? "are" : "is"} ${pp} by ${by}.`, `${S} ${be} ${ing(base)} by ${by}.`, `${S} has ${pp} ${by}.`, `${cap(by)} ${be} ${pp} by ${low(obj)}.`, ...(pret === pp ? [] : [`${S} ${be} ${pret} by ${by}.`])];
    return mcq(r, `Mets à la voix passive : « ${subj} ${pret} ${obj}. »`, ans, wrongs, `Passif : *be* au temps de la phrase active (prétérit : *${be}*) + participe passé (*${pp}*) + *by* complément d'agent.`);
  },
  (r) => {
    const [direct, ans, w1, w2, w3] = pick(r, [
      ["« I am tired », she said.", "She said (that) she was tired.", "She said (that) she is tired.", "She said (that) I was tired.", "She told (that) she was tired."],
      ["« I like pizza », he said.", "He said (that) he liked pizza.", "He said (that) he likes pizza.", "He said (that) I liked pizza.", "He told (that) he liked pizza."],
      ["« We will come », they said.", "They said (that) they would come.", "They said (that) they will come.", "They said (that) we would come.", "They said (that) they will have come."],
      ["« I can swim », Tom said.", "Tom said (that) he could swim.", "Tom said (that) he can swim.", "Tom said (that) I could swim.", "Tom said (that) he could swum."],
      ["« I have finished », she said.", "She said (that) she had finished.", "She said (that) she has finished.", "She said (that) I had finished.", "She told (that) she had finished."],
      ["« I am working », he said.", "He said (that) he was working.", "He said (that) he is working.", "He said (that) I was working.", "He said (that) he worked."],
      ["« Where do you live? », she asked me.", "She asked me where I lived.", "She asked me where did I live.", "She asked me where do I live.", "She asked me where I live?"],
      ["« Don't touch it! », he told me.", "He told me not to touch it.", "He told me to not touching it.", "He told me don't touch it.", "He said me not to touch it."],
    ] as const);
    return mcq(r, `Discours indirect : ${direct}`, ans, [w1, w2, w3], `Concordance des temps : on recule d'un temps, on adapte les pronoms ; pas d'inversion dans une question indirecte ; un ordre devient *tell someone (not) to + base*.`);
  },
  ...pairs(
    [["present simple", "am / is / are + participe passé"], ["prétérit", "was / were + participe passé"], ["present perfect", "has / have been + participe passé"], ["futur avec will", "will be + participe passé"], ["present continuous", "am / is / are being + participe passé"]],
    { ask: (a) => `Passif au ${a} ?`, reverse: (b) => `À quel temps est le passif « ${b} » ?`, claim: (a, b) => `Le passif au ${a} se forme avec ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
];

const COND: Card[] = [
  ["If it rains tomorrow, we ___ at home.", "will stay", ["would stay", "stayed", "would have stayed"], "If + présent → will + base (réel/probable)."],
  ["If you heat ice, it ___.", "melts", ["would melt", "melted", "will have melted"], "Vérité générale : if + présent → présent."],
  ["If I ___ rich, I would travel the world.", "were", ["am", "will be", "would be"], "If + prétérit (were) → would + base (hypothèse irréelle)."],
  ["If she had more time, she ___ a novel.", "would write", ["will write", "writes", "would have written"], "If + prétérit → would + base."],
  ["If I had studied, I ___ the exam.", "would have passed", ["will pass", "would pass", "had passed"], "If + past perfect → would have + participe passé (regret)."],
  ["If they ___ earlier, they would have caught the train.", "had left", ["left", "would leave", "have left"], "If + past perfect pour un passé irréel."],
  ["I wish I ___ taller.", "were", ["am", "will be", "would have been"], "*wish* + prétérit : souhait irréel au présent."],
  ["I wish I ___ harder last year.", "had worked", ["worked", "would work", "have worked"], "*wish* + past perfect : regret sur le passé."],
  ["Unless you hurry, you ___ the bus.", "will miss", ["would miss", "missed", "would have missed"], "*unless* = *if… not* : type 1."],
  ["If only I ___ the answer now!", "knew", ["know", "will know", "would know"], "*if only* + prétérit : souhait irréel présent."],
];
/** Structures B2 : conditionnels mixtes, inversion, it's high time, I'd rather + sujet. */
const COND_B2: Card[] = [
  ["If I had studied medicine, I ___ a doctor now.", "would be", ["would have been", "will be", "am"], "Conditionnel mixte : condition passée (past perfect), conséquence présente (*now*) → would + base."],
  ["If she weren't so shy, she ___ to the party yesterday.", "would have come", ["would come", "will come", "came"], "Conditionnel mixte : trait présent, conséquence passée (*yesterday*) → would have + participe passé."],
  ["___ I known, I would have helped you.", "Had", ["If", "Have", "Did"], "Inversion soutenue : *Had I known* = *If I had known*."],
  ["It's high time we ___.", "left", ["leave", "will leave", "have left"], "*It's (high) time* + prétérit : il est grand temps de…"],
  ["I'd rather you ___ smoke in here.", "didn't", ["don't", "won't", "not"], "*I'd rather* + sujet + prétérit : préférence portant sur quelqu'un d'autre."],
];

const conditionals: Generator[] = [
  (r) => {
    const s = pick(r, ["I", "we", "they", "you"]), [v, pp, rest] = pick(r, [["call", "called", "you"], ["go", "gone", "to the beach"], ["buy", "bought", "a new phone"], ["win", "won", "the match"], ["help", "helped", "them"], ["leave", "left", "earlier"]] as const);
    const type = int(r, 1, 3);
    const sentence = type === 1 ? `If ${s} have time, ${s} will ${v} ${rest}.` : type === 2 ? `If ${s} had time, ${s} would ${v} ${rest}.` : `If ${s} had had time, ${s} would have ${pp} ${rest}.`;
    const label = ["", "Type 1 (réel, probable)", "Type 2 (hypothèse irréelle au présent)", "Type 3 (irréel du passé, regret)"];
    return mcq(r, `Quel type de conditionnel : « ${sentence} » ?`, label[type], label.slice(1).concat(["Ce n'est pas un conditionnel"]), `${label[type]}.`);
  },
  cards(COND),
  level(3, cards(COND_B2)),
  level(2, cards([
    ["As long as you ___ hard, you will succeed.", "work", ["will work", "worked", "would work"], "*as long as* (« pourvu que ») se construit comme *if* : présent dans la subordonnée."],
    ["Provided that it ___ sunny, we'll have a picnic.", "is", ["will be", "would be", "was"], "*provided (that)* (« à condition que ») : comme *if*, jamais *will* dans la subordonnée."],
    ["I'll lend you my car on condition that you ___ it back tonight.", "bring", ["will bring", "would bring", "brought"], "*on condition that* + présent pour une condition future."],
  ])),
  (r) => {
    const s = pick(r, ["I", "she", "we", "they", "he", "you"]), v = pick(r, [["buy", "bought", "a house"], ["learn", "learned", "Chinese"], ["visit", "visited", "Japan"], ["help", "helped", "the poor"], ["travel", "travelled", "around the world"], ["stop", "stopped", "working"], ["open", "opened", "a restaurant"], ["give", "given", "money to charity"], ["build", "built", "a school"], ["move", "moved", "to Canada"]] as const);
    const type = int(r, 1, 3);
    const ifc = type === 1 ? `If ${s} ${s === "she" || s === "he" ? "wins" : "win"} the lottery` : type === 2 ? `If ${s} won the lottery` : `If ${s} had won the lottery`;
    const main = type === 1 ? `will ${v[0]}` : type === 2 ? `would ${v[0]}` : `would have ${v[1]}`;
    return mcq(r, `${ifc}, ${s} ___ ${v[2]}.`, main, [`will ${v[0]}`, `would ${v[0]}`, `would have ${v[1]}`, v[1]].filter((x) => x !== main), `Type ${type} : ${["", "if + présent → will", "if + prétérit → would", "if + past perfect → would have + participe passé"][type]}.`);
  },
  claims([
    ["Dans une phrase en « if », on met « will » dans la subordonnée.", false, "Jamais *will* après *if* (sauf cas très particuliers)."],
    ["« If I were you » s'emploie pour donner un conseil.", true, "*were* à toutes les personnes au conditionnel irréel."],
    ["« I wish I had known » exprime un regret sur le passé.", true, "*wish* + past perfect."],
    ["« Had I known » équivaut à « If I had known ».", true, "Inversion du registre soutenu, sans *if*."],
  ]),
];

/** Valeurs des connecteurs ; opposition et concession regroupées pour éviter toute ambiguïté. */
const CONNECT: Pair[] = [
  ["however", "opposition / concession"], ["nevertheless", "opposition / concession"], ["whereas", "opposition / concession"], ["although", "opposition / concession"], ["even though", "opposition / concession"], ["on the other hand", "opposition / concession"],
  ["therefore", "conséquence"], ["thus", "conséquence"], ["as a result", "conséquence"], ["consequently", "conséquence"], ["because of", "cause"], ["due to", "cause"], ["owing to", "cause"],
  ["moreover", "addition"], ["furthermore", "addition"], ["in addition", "addition"], ["for instance", "exemple"], ["such as", "exemple"], ["to sum up", "conclusion"], ["in conclusion", "conclusion"], ["all in all", "conclusion"],
  ["firstly", "énumération"], ["secondly", "énumération"],
];
const RELATIONS = [...new Set(CONNECT.map(([, x]) => x))];

const essay: Generator[] = [
  (r) => {
    const [c, rel] = pick(r, CONNECT);
    return mcq(r, `Quelle relation exprime **${c}** ?`, rel, RELATIONS.filter((x) => x !== rel), `*${c}* : ${rel}.`);
  },
  (r) => {
    const [c, rel] = pick(r, CONNECT);
    const right = r() < 0.5;
    const shown = right ? rel : pick(r, RELATIONS.filter((x) => x !== rel));
    return tf(`**${cap(c)}** introduit : ${shown}.`, right, `*${c}* : ${rel}.`);
  },
  ...pairs(
    [["the introduction", "présente le sujet et annonce la problématique"], ["the body", "développe les arguments en paragraphes"], ["the conclusion", "résume et donne un avis ou une ouverture"], ["a topic sentence", "annonce l'idée principale d'un paragraphe"]],
    { ask: (a) => `Dans un essay, ${a}…`, reverse: (b) => `Quel élément d'un essay ${b} ?`, claim: (a, b) => `Dans un essay, ${a} ${b}.`, explain: (a, b) => `${cap(a)} ${b}.` },
  ),
  level(2, cards([
    ["« ___ the rain, we went out. »", "Despite", ["Although", "However", "Because"], "*Despite* / *in spite of* + nom ou V-ing ; *although* + proposition."],
    ["« ___ it was raining, we went out. »", "Although", ["Despite", "However", "Because of"], "*Although* + sujet + verbe ; *despite* + nom."],
    ["« The plan is expensive. ___, it could create many jobs. »", "However", ["Although", "Despite", "Because of"], "*However*, en tête de phrase et suivi d'une virgule, oppose deux phrases."],
    ["« Prices rose sharply. ___, sales fell. »", "As a result", ["Although", "Despite", "Such as"], "*As a result* introduit une conséquence."],
    ["« Many young people, ___ my cousin, work during their studies. »", "such as", ["as a result", "although", "whereas"], "*such as* introduit un exemple au milieu de la phrase."],
    ["Dans un essay au registre soutenu, on évite…", "les contractions comme « don't » ou « can't »", ["les connecteurs logiques", "les phrases d'introduction", "les exemples précis"], "On écrit *do not*, *cannot*."],
    ["Une consigne « To what extent… ? » demande…", "de peser le pour et le contre et de nuancer sa réponse", ["de raconter une anecdote personnelle", "de décrire un document sans le commenter", "de résumer le texte ligne à ligne"], "« Dans quelle mesure… ? » appelle une réponse nuancée."],
    ["« On the one hand…, on the other hand… » sert à…", "présenter deux points de vue opposés", ["donner un exemple", "conclure", "ajouter une idée de même sens"], "Structure typique d'un essay argumenté."],
  ])),
];

export const SES_ANGLAIS: Record<string, Generator[]> = {
  "ses-2-richesses": richesses,
  "ses-2-marche": marche,
  "ses-1-financement": financement,
  "ses-1-socialisation": socialisation,
  "ses-t-croissance": croissance,
  "ses-t-chomage": chomage,
  "en-2-past": past,
  "en-2-vocab": vocab,
  "en-1-modals": modals,
  "en-1-passive": passive,
  "en-t-conditionals": conditionals,
  "en-t-essay": essay,
};
