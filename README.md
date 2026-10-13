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
| 👤 **Profil** | Radar de maîtrise, réussite par matière, XP sur 14 jours, échelle des rangs, succès, compte & sauvegarde, réglages |
| ☁️ **Comptes** | Pseudo + mot de passe, progression sauvegardée en ligne et retrouvée sur tous les appareils, export / import JSON |

## Sauvegarde et comptes

Chaque joueur crée un compte (pseudo unique + mot de passe) ; sa progression est gardée
sur l'appareil **et** envoyée au serveur quelques secondes après chaque changement (et dès
que l'appli passe en arrière-plan). Sur un autre appareil, « J'ai déjà un compte » la récupère.
Le jeu reste jouable hors ligne : l'envoi reprend au retour du réseau. Il est aussi possible
de « Jouer sans compte » (stockage local uniquement) puis de créer un compte plus tard
depuis le profil, qui propose également d'exporter / importer sa sauvegarde en fichier JSON.

### Activer la base de données sur Vercel (3 clics)

1. Projet Vercel → onglet **Storage** → **Create Database** → **Upstash for Redis** (offre gratuite).
2. Choisir la région la plus proche (ex. Paris / Francfort) puis **Connect** au projet
   (environnements Production + Preview). Vercel ajoute `KV_REST_API_URL` et `KV_REST_API_TOKEN`.
3. **Settings → Environment Variables** : ajouter `SESSION_SECRET` (longue chaîne aléatoire,
   ex. `openssl rand -hex 32`), puis **Redeploy**.

Vérification : `https://<ton-projet>.vercel.app/api/status` doit afficher `"storage": "redis"`.
Sans base, il affiche `"ephemeral"` : les comptes sont alors rangés dans `/tmp` et **effacés
à chaque redémarrage** du serveur (un avertissement s'affiche dans le profil). En local, ils
sont rangés dans `.data/` (`"storage": "file"`).

> 💡 Utilise toujours l'adresse de **production** (`questbac….vercel.app`, celle du domaine
> principal du projet) et pas les URL de prévisualisation (`questbac-git-…` ou
> `questbac-abc123…vercel.app`) : chaque adresse a son propre stockage dans le navigateur et
> ses propres cookies. Sur iPhone, ajoute l'appli à l'écran d'accueil depuis cette adresse puis
> connecte-toi une fois dedans (l'appli de l'écran d'accueil a un stockage séparé de Safari).

**Sécurité** : mots de passe hachés avec scrypt (sel aléatoire), session dans un cookie
`httpOnly` signé HMAC (180 jours), limiteur de tentatives de connexion. En cas de conflit
entre deux appareils, la sauvegarde la plus récente (`updatedAt`) gagne.

| Route | Rôle |
|---|---|
| `POST /api/auth/register` | Crée le compte avec la progression actuelle |
| `POST /api/auth/login` / `logout` | Ouvre / ferme la session |
| `GET /api/me` | Joueur connecté + sauvegarde serveur (401 sinon ; `?optional=1` → `{ user: null }`) |
| `PUT /api/save` | Enregistre la progression (2 Mo max, 409 si le serveur a plus récent) |
| `GET /api/leaderboard` | Profils publics des joueurs inscrits (200 max) |

## Architecture

```
src/
├── app/                      Pages (App Router) + routes API
│   ├── api/fiche             POST → fiche Markdown en streaming
│   ├── api/missions          POST → mission (sortie JSON structurée, images acceptées)
│   ├── api/auth, me, save    Comptes, session, sauvegarde en ligne
│   ├── api/leaderboard       GET  → vrais joueurs du classement
│   └── api/status            GET  → IA connectée ou mode démo, type de stockage
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
    ├── server/               Stockage clé/valeur (Upstash Redis ou fichiers), mots de passe, sessions, comptes
    └── store/                Zustand (sauvegarde locale), synchronisation serveur, notifications
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

1. **Multijoueur** : exécuter `applySession` côté serveur (anti-triche), ajouter
   classes/groupes d'amis, réinitialisation de mot de passe.
2. **Contenu** : enrichir la banque de questions (les chapitres sans questions locales sont déjà
   jouables via « Mission IA »), faire relire par des enseignants.
3. **Répétition espacée** : reprogrammer automatiquement les questions ratées.
4. **Production** : limiteur de débit partagé (Redis), quotas par compte, suivi des coûts IA,
   PWA hors-ligne.

## Jouer avec des amis

- Chaque joueur connecté a un **code d'ami** (`QB-XXXXXX`) sur la page **Amis**.
- **Inviter** partage un lien `/invite/QB-XXXXXX` : la personne qui l'ouvre devient ton amie
  dès qu'elle est connectée (même si elle crée son compte à ce moment-là).
- On peut aussi saisir le code d'un ami. Connaître le code suffit : pas de demande à accepter.
- L'onglet **Classement → Amis** compare la semaine (XP) et le rang (RP) entre amis.
- Données serveur : `friends:<id>` (liste symétrique, 100 amis max) et l'index `friendcodes`.
