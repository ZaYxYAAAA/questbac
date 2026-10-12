# ⚔️ QuestBac — révise le lycée comme un jeu

Application de révision gamifiée pour la **Seconde**, la **Première** et la **Terminale** (voie générale) :
missions par chapitre, combos, étoiles, niveaux, rangs, boss chronométrés, quêtes du jour,
classements, **labos de maths interactifs**, **Prof IA** qui rédige des fiches, et **Forge**
qui transforme une photo de cours en fiche + QCM.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigne ANTHROPIC_API_KEY (facultatif)
npm run dev                  # http://localhost:3000
```

Sans clé API, l'application est entièrement utilisable en **mode démo** : les fiches et
missions IA sont remplacées par du contenu d'exemple (badge « Mode démo » dans l'interface).

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm test` | Tests unitaires (Vitest) |
| `npm run lint` | Vérification TypeScript |

## Fonctionnalités

| Module | Ce qu'il fait |
|---|---|
| 🗺️ **Carte** | ~100 chapitres alignés sur les programmes (8 matières × 3 niveaux), chemin de progression, étoiles |
| 🎯 **Missions** | Quiz QCM / vrai-faux / réponse numérique (accepte `3,5`, `7/2`, `20 g/L`), combos jusqu'à ×2, explications, raccourcis clavier |
| 💀 **Boss** | 17 boss (un par matière/niveau) : PV, 3 cœurs, chrono, coups critiques, phase « enragé », déblocage par chapitres |
| 🏆 **Progression** | XP & niveaux, rangs Bronze → Légende avec divisions, séries de jours, 19 succès, 3 quêtes du jour + coffre |
| 📊 **Classement** | Hebdomadaire, global (RP) et par classe |
| 🧪 **Labo** | 10 labos : traceur universel (paramètres animables, dérivée), affine, vecteurs & produit scalaire, second degré, sécante → tangente, cercle trigo, suites (toile d'araignée), exp/ln, intégrales (Riemann), loi binomiale |
| 🎓 **Prof IA** | Fiche complète, express ou méthode sur n'importe quelle notion, en streaming, avec LaTeX ; bibliothèque, impression PDF, « Créer un QCM » depuis la fiche |
| ⚒️ **Forge** | Photos du cours (appareil photo ou import, compressées côté client), texte collé, sujet ou création manuelle → fiche + questions ; éditeur complet des questions |
| 👤 **Profil** | Radar de maîtrise, réussite par matière, XP sur 14 jours, échelle des rangs, succès, réglages |

## Architecture

```
src/
├── app/                      Pages (App Router) + routes API
│   ├── api/fiche             POST → fiche Markdown en streaming
│   ├── api/missions          POST → mission (sortie JSON structurée, images acceptées)
│   └── api/status            GET  → IA connectée ou mode démo
├── components/
│   ├── math/Graph.tsx        Moteur de graphes SVG maison (pan, zoom, pincement, points déplaçables)
│   ├── math/labs/            Les 10 labos (chargés à la demande)
│   ├── game/                 QuestionCard, QuizRunner, BossFight, RewardScreen, graphiques…
│   └── ui/                   Boutons, cartes, Markdown + KaTeX, curseurs…
└── lib/
    ├── types.ts              Types du domaine
    ├── content/              Programme, banque de questions (~200), boss, labos
    ├── game/                 Règles du jeu en fonctions pures (XP, rangs, quêtes, succès, état)
    ├── math/parser.ts        Parseur d'expressions sûr (sans eval) + dérivée/intégrale numériques
    ├── ai/                   Client Claude, prompts, schémas Zod, mode démo, limiteur de débit
    └── store/                Zustand (sauvegarde locale) + notifications
```

**Principe clé** : toutes les règles du jeu sont dans `lib/game/state.ts` sous forme de
fonctions pures (`applySession`, `applyActivity`). Le store ne fait que les appeler : elles
pourront tourner telles quelles côté serveur.

### IA (Claude)

- Modèle par défaut `claude-opus-5-5` (modifiable via `ANTHROPIC_MODEL`), réflexion adaptative,
  effort `medium` par défaut (`ANTHROPIC_EFFORT`).
- Repli automatique côté serveur (`fallbacks: "default"`) si le modèle décline une requête.
- Forge : sortie JSON contrainte par schéma, puis validation tolérante question par question
  (une question incohérente est écartée, pas toute la mission).
- Le contenu des photos est traité comme du matériel de cours (les consignes qu'il contiendrait sont ignorées).
- Limiteur de débit en mémoire par IP (10 fiches / 6 missions par 10 min).

## Prochaines étapes conseillées

1. **Comptes & multijoueur** : ajouter une base (ex. Postgres/Supabase) et une authentification,
   exécuter `applySession` côté serveur (anti-triche), remplacer les rivaux simulés de
   `lib/game/leaderboard.ts` par de vrais classements, ajouter classes/groupes d'amis.
2. **Contenu** : enrichir la banque de questions (les chapitres sans questions locales sont déjà
   jouables via « Mission IA »), faire relire par des enseignants.
3. **Répétition espacée** : reprogrammer automatiquement les questions ratées.
4. **Production** : limiteur de débit partagé (Redis), quotas par compte, suivi des coûts IA,
   PWA hors-ligne.
