/**
 * Contenu de démonstration renvoyé quand aucune clé API n'est configurée,
 * pour que toute l'application reste explorable hors-ligne.
 */
import { CHAPTERS, levelLabel, subjectMeta } from "@/lib/content/curriculum";
import { questionsForChapter } from "@/lib/content/questions";
import { prepareQuestions } from "@/lib/game/session";
import type { Level, Question, SubjectId } from "@/lib/types";

const NOTICE =
  "> 🧪 **Mode démo** — le Prof IA n'est pas encore connecté. Ajoute `ANTHROPIC_API_KEY` dans `.env.local` pour obtenir une vraie fiche sur ce sujet.";

export function demoFiche(level: Level, subject: SubjectId, topic: string) {
  if (subject === "maths" && /second|degr|discriminant|parabole/i.test(topic)) return SECOND_DEGRE_FICHE;
  return `# ${topic}

${NOTICE}

## 🎯 L'essentiel
- Cette fiche de **${subjectMeta(subject).name}** (${levelLabel(level)}) serait structurée en sections claires.
- Les **définitions** et **propriétés** clés seraient encadrées.
- Les **méthodes** seraient détaillées étape par étape, avec un **exemple corrigé**.

## 📚 Exemple de rendu mathématique
> **Formule** — Les formules s'affichent proprement : $\\Delta = b^2 - 4ac$, $\\int_a^b f(x)\\,dx$, $e^{i\\pi} + 1 = 0$.

## 🔁 Teste-toi
1. Essaie la fiche « Second degré » en Maths pour voir un exemple complet.
`;
}

const SECOND_DEGRE_FICHE = `# Le second degré

${NOTICE}

> Savoir étudier une fonction $f(x) = ax^2 + bx + c$ (avec $a \\neq 0$) : ses racines, son signe et sa courbe, la parabole.

## 🎯 L'essentiel
- La courbe d'un trinôme est une **parabole**, tournée vers le haut si $a > 0$, vers le bas si $a < 0$.
- **Forme canonique** : $f(x) = a(x - \\alpha)^2 + \\beta$ avec $\\alpha = -\\frac{b}{2a}$ et $\\beta = f(\\alpha)$.
- Le **sommet** de la parabole est $S(\\alpha\\,;\\,\\beta)$.
- Le **discriminant** $\\Delta = b^2 - 4ac$ donne le nombre de racines.
- Un trinôme est **du signe de $a$**, sauf entre ses racines.

## 📚 Le cours
> **Racines selon $\\Delta$**
> - Si $\\Delta > 0$ : deux racines $x_1 = \\frac{-b - \\sqrt\\Delta}{2a}$ et $x_2 = \\frac{-b + \\sqrt\\Delta}{2a}$.
> - Si $\\Delta = 0$ : une racine double $x_0 = -\\frac{b}{2a}$.
> - Si $\\Delta < 0$ : aucune racine réelle.

> **Forme factorisée** — Si $\\Delta > 0$ : $f(x) = a(x - x_1)(x - x_2)$.

| Signe de $\\Delta$ | Racines | Signe de $f(x)$ |
|---|---|---|
| $\\Delta > 0$ | $x_1$ et $x_2$ | signe de $a$ à l'extérieur des racines |
| $\\Delta = 0$ | $x_0$ | signe de $a$, nul en $x_0$ |
| $\\Delta < 0$ | aucune | toujours du signe de $a$ |

## 🛠️ Méthode : résoudre $ax^2 + bx + c = 0$
1. Identifier $a$, $b$ et $c$ (attention aux signes !).
2. Calculer $\\Delta = b^2 - 4ac$.
3. Conclure selon le signe de $\\Delta$ et calculer les racines.

## ✏️ Exemple corrigé
Résoudre $2x^2 - 3x + 1 = 0$.
- $a = 2$, $b = -3$, $c = 1$ donc $\\Delta = 9 - 8 = 1 > 0$.
- $x_1 = \\frac{3 - 1}{4} = \\frac12$ et $x_2 = \\frac{3 + 1}{4} = 1$.

**Solutions :** $\\mathcal{S} = \\left\\{\\frac12\\,;\\,1\\right\\}$.

## ⚠️ Pièges fréquents
- Oublier que $b^2$ est toujours positif : $(-3)^2 = 9$, pas $-9$.
- Diviser par $a$ au lieu de $2a$ dans la formule des racines.

## 🧠 Mémo
« **Delta décide** » : positif → deux, nul → une, négatif → aucune.

## 🔁 Teste-toi
1. Combien de racines a $x^2 + x + 1$ ?
2. Donne le sommet de $y = (x - 2)^2 + 3$.
3. Factorise $x^2 - 5x + 6$.

### Réponses
1. $\\Delta = -3 < 0$ : aucune. 2. $S(2\\,;\\,3)$. 3. $(x - 2)(x - 3)$.
`;

export function demoMission(level: Level, subject: SubjectId, count: number, topic?: string) {
  const pool: Question[] = CHAPTERS.filter((c) => c.subject === subject && c.level === level).flatMap((c) =>
    questionsForChapter(c.id),
  );
  const fallback = pool.length ? pool : CHAPTERS.filter((c) => c.subject === subject).flatMap((c) => questionsForChapter(c.id));
  const questions = prepareQuestions(fallback, Math.min(count, fallback.length)).map((q, i) => ({ ...q, id: `demo-${Date.now()}-${i}` }));
  return {
    title: topic ? `Démo · ${topic.slice(0, 40)}` : `Démo · ${subjectMeta(subject).name}`,
    summary: "Mission de démonstration construite à partir de la banque de questions locale.",
    fiche: `# Mission de démonstration\n\n${NOTICE.replace("une vraie fiche sur ce sujet", "des questions et une fiche tirées de ton propre cours")}\n\nLes questions ci-dessous proviennent de la banque locale de QuestBac (${subjectMeta(subject).name}, ${levelLabel(level)}).`,
    questions,
  };
}
