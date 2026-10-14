# ⚔️ QuestBac — révise le lycée comme un jeu

Application de révision gamifiée pour la **Seconde**, la **Première** et la **Terminale** (voie générale) :
missions par chapitre, combos, étoiles, niveaux, rangs, boss chronométrés, quêtes du jour,
mode **classé** en parties à 3 en direct, duels entre amis et **labos de maths interactifs**.
Aucune IA payante : toutes les questions sont générées par l'application elle-même.

## Démarrage

```bash
npm install
cp .env.example .env.local   # facultatif : base Redis, secret de session
npm run dev                  # http://localhost:3000
```

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm test` | Tests unitaires (Vitest) |
| `npm run lint` | Vérification TypeScript |

## Fonctionnalités

| Module | Ce qu'il fait |
|---|---|
| 🗺️ **Carte** | 149 chapitres alignés sur les programmes officiels, dont ceux de 2026 (9 matières dont l'espagnol × 3 niveaux), chemin de progression, étoiles |
| 🎯 **Missions** | Questions **générées à chaque partie** pour les 149 chapitres (valeurs tirées au hasard en sciences, grandes banques de connaissances ailleurs), sans retomber sur une question déjà vue ; QCM / vrai-faux / réponse numérique, combos, explications |
| 💀 **Boss** | 18 boss (un par matière/niveau, plus El Toro Gramático en espagnol) : PV, 3 cœurs, chrono, coups critiques, phase « enragé », déblocage par chapitres |
| 🏆 **Progression** | XP & niveaux, rangs Bronze → Légende avec divisions (gagnés en classé), séries de jours, 19 succès, 3 quêtes du jour + coffre |
| ⚔️ **Classé** | Parties à 3 en direct (matchmaking 3 s puis bots de ton niveau), vote du chapitre, classement général des rangs et de l'XP, anti-triche |
| 🧪 **Labo** | 10 labos : traceur universel (paramètres animables, dérivée), affine, vecteurs & produit scalaire, second degré, sécante → tangente, cercle trigo, suites (toile d'araignée), exp/ln, intégrales (Riemann), loi binomiale |
| 👤 **Profil** | Radar de maîtrise, réussite par matière, XP sur 14 jours, succès, compte & sauvegarde, réglages |
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
│   ├── api/auth, me, save    Comptes, session, sauvegarde en ligne
│   ├── api/leaderboard       GET  → vrais joueurs du classement
│   └── api/status            GET  → type de stockage
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
    ├── server/               Stockage clé/valeur (Upstash Redis ou fichiers), mots de passe, sessions, comptes
    └── store/                Zustand (sauvegarde locale), synchronisation serveur, notifications
```

**Principe clé** : toutes les règles du jeu sont dans `lib/game/state.ts` sous forme de
fonctions pures (`applySession`, `applyActivity`). Le store ne fait que les appeler : elles
pourront tourner telles quelles côté serveur.

## Prochaines étapes conseillées

1. **Multijoueur** : exécuter `applySession` côté serveur (anti-triche), ajouter
   classes/groupes d'amis, réinitialisation de mot de passe.
2. **Contenu** : enrichir la banque de questions, faire relire par des enseignants.
3. **Répétition espacée** : reprogrammer automatiquement les questions ratées.
4. **Production** : limiteur de débit partagé (Redis), PWA hors-ligne.

## Jouer avec des amis

- Chaque joueur connecté a un **code d'ami** (`QB-XXXXXX`) sur la page **Amis**.
- **Inviter** partage un lien `/invite/QB-XXXXXX` : la personne qui l'ouvre devient ton amie
  dès qu'elle est connectée (même si elle crée son compte à ce moment-là).
- On peut aussi saisir le code d'un ami. Connaître le code suffit : pas de demande à accepter.
- L'onglet **Classé → Classements**, filtre **Amis**, compare rangs et XP totale entre amis.
- Données serveur : `friends:<id>` (liste symétrique, 100 amis max) et l'index `friendcodes`.

## Duels entre amis

- Page **Duels** (ou bouton **⚔️ Défier** sur un ami) : choisis un ami et un thème éclair
  (calcul mental, fractions & puissances, fonctions express, physique flash, dates clés,
  culture bac, English flash ou grand mélange).
- **10 questions à faire de tête, 15 s chacune** (chrono visible ; à zéro, la question compte
  comme ratée). Maths et physique sont générées au hasard (`lib/content/duel-themes.ts`), les
  autres matières tirent dans des banques de repères : chaque duel est différent.
- Les questions sont générées à la création et enregistrées : mêmes questions, même ordre pour les deux.
- Chacun joue quand il veut, dans les 72 h. Le serveur **recalcule le score** à partir des
  réponses envoyées : plus de bonnes réponses gagne, puis le temps total le plus court.
- Récompenses (une seule fois par joueur, tous appareils confondus) : victoire +120 XP,
  égalité +60 XP, défaite +30 XP (le rang ne se gagne qu'en classé). Expiré avec un seul joueur : victoire par forfait.
- Une pastille ⚔️ dans l'en-tête signale les duels où c'est ton tour.
- Données serveur : `duel:<id>` et `duels:<id de compte>` (40 derniers duels).

## Mode classé

- Navigation à 5 onglets : Accueil, **Entraînement** (Carte, Boss, Labo : XP
  seulement), **Classé** au centre, Social (Amis, Duels, fil d'actu), Profil.
- Le rang (points de rang, Bronze III → Légende) ne se gagne qu'en classé. `RANK_EPOCH`
  (src/lib/game/ranked.ts) : l'augmenter remet tous les rangs à zéro, sans toucher à l'XP.
  Époque 3 : passage aux parties à 3.
- **Matchmaking** : on choisit une matière ; une file par matière et par niveau. Dès 3 joueurs,
  la partie se lance ; au bout de 3 s, les places vides sont prises par des **bots** du rang du
  joueur (réussite et vitesse selon le palier, temps de réponse « humains » : lecture, réflexion
  log-normale, hésitations, séries, distractions). Les bots sont signalés par une étiquette.
- **Vote** : 2 chapitres tirés au hasard dans la matière, 10 s pour voter, la majorité gagne.
- **Partie** : 10 questions en même temps pour les 3 joueurs (20 s, 30 s en réponse libre),
  tirées, chronométrées et corrigées par le serveur ; les questions déjà vues sont évitées.
  Classement : bonnes réponses d'abord, puis temps total (une question sans réponse compte
  le temps maximum). Le téléphone interroge le serveur chaque seconde.
- **Points de rang** : 1re place +30 (Bronze) → +20 (Légende), 2e +9 → +2, 3e −6 → −27 ;
  10/10 : +5. XP : 12 par bonne réponse + 80 / 40 / 15 selon la place.
- **Classements** (onglet Classé) : général des rangs avec l'évolution de la semaine (▲▼ depuis
  lundi, heure de Paris) et général de l'XP totale ; filtre Amis.
- Anti-triche : sortie de l'appli (`visibilitychange`, `pagehide`, `sendBeacon`) pendant une
  question = question perdue ; texte non copiable ; la réponse n'est envoyée qu'après validation.
- Stockage : hash `rank3` (profil de rang), `mmq:<matière>:<niveau>` (file), `mmt:<id>`
  (ticket), `match:<id>` (partie), `match:settled:<id>` (points distribués une seule fois).
  Le serveur recopie le rang dans la sauvegarde (`rp`), et fait foi.

## Calculatrice

- Proposée seulement sur les questions de calcul pas faisables de tête (`needsCalculator`,
  src/lib/game/calculator.ts) : résultat décimal avec 3 chiffres significatifs ou plus à partir
  de données décimales, 3 décimales ou plus, grands nombres, mantisse d'écriture scientifique,
  valeur « arrondie ». Jamais pour une question de cours ni un calcul simple (`7!`, `5 × 2`,
  `0,7 × 0,9`). Le drapeau `calc` est posé à la génération et reste sur la question publique du
  classé (environ 3 % des questions, surtout en physique-chimie).
- Calculatrice scientifique intégrée (feuille en bas d'écran) : + − × ÷, puissances, racine,
  sin/cos/tan (degrés ou radians), ln, log, π, ×10ⁿ, parenthèses ; évaluation sans `eval`.
  « Mettre … en réponse » remplit la réponse libre. En classé, elle évite de sortir de l'appli
  (ce qui ferait perdre la question).

## Questions générées

- `src/lib/content/gen/` : un fichier par matière (maths 2nde / 1re / Tle, physique-chimie, SVT,
  histoire-géo, lettres et philo, SES, anglais et espagnol, plus des fichiers « 2 » d'extension :
  `histoire2`, `sciences2`, `humanites2`, `maths-2026`). Chaque chapitre a plusieurs **générateurs** :
  calculs aux valeurs tirées au hasard, ou tables de connaissances déclinées en question directe,
  question inverse et vrai/faux.
- Chaque question porte une empreinte `fact` : la même pour la question directe, la question
  inverse et le vrai/faux sur une même information. `src/lib/content/generated.ts` tire les
  questions sans jamais répéter une information dans une partie, écarte celles déjà vues
  (mémoire locale `questbac-seen`, 3 000 dernières, tous chapitres confondus ; côté serveur pour
  le classé) et, quand un chapitre est épuisé, réautorise d'abord les plus anciennes.
- Banques supplémentaires : `gen/extra-*.ts` (philo, histoire-géo, français, SVT, SES, langues),
  fusionnées aux chapitres. Chaque chapitre compte au moins 35 informations différentes.
- Les boss et le mode « Mélange de tout le niveau » utilisent ces générateurs.
- Tests : aucune information répétée dans une mission, ni sur 4 missions de 8 questions d'affilée.

## Notifications push

- L'appli est une **PWA** (`app/manifest.ts`, icônes dans `public/`, service worker `public/sw.js`).
- Le joueur connecté active les notifications depuis l'accueil ou le profil. Sur iPhone (iOS 16.4+),
  il faut d'abord ajouter l'appli à l'écran d'accueil depuis Safari et l'ouvrir depuis l'icône.
- Envois automatiques : nouveau défi, adversaire qui a joué son tour ou résultat de duel disponible,
  nouvel ami, et chaque soir (Vercel Cron, `vercel.json`, 17 h UTC) rappel si la série de jours va se
  perdre ou si des duels attendent. Un seul rappel par joueur et par jour.
- Clés VAPID : `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` si définies, sinon dérivées du secret de session
  (rien à configurer). `CRON_SECRET` (facultatif) protège la route `/api/cron/reminders`.
- Données serveur : hash `pushsubs` (abonnements par compte, 5 appareils max), `reminded:<id>`.
