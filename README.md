# Atelier Révisions

Un catalogue scolaire statique et des activités autonomes, en français. Le **lot 1** propose une seule activité : **Maths → Numération → Changements de base**, intitulée **Mission binaire — Répétition de maths**.

## Contenu livré

- Accueil général construit à partir des métadonnées de `js/catalogue.js`.
- Accueil du module, six exercices de la série 1, navigation libre, essais illimités, deux indices par exercice et corrigé détaillé après confirmation.
- Fiches interactives **Méthodes** et **Pixels**, accessibles sans perdre ses réponses ; fermeture par bouton ou Échap et restitution du focus.
- Pixels initialement indéterminés, puis noir/blanc au clic ou au clavier. Toutes les sous-questions sont obligatoires pour réussir un exercice.
- Sauvegarde locale des réponses, essais, indices et réussites ; repli en mémoire si le navigateur bloque le stockage et remise à zéro confirmée. Il s’agit d’un support minimal de reprise, pas du bilan complet prévu ensuite.

Les séries 2 et 3 sont uniquement annoncées « à venir ». Les activités ASCII, RGB et IPv4, le bilan des 18 exercices et les finitions du lot 3 restent hors de cette livraison. Les exemples hexadécimaux de la fiche Méthodes font partie de la fiche demandée. Aucun site n’est publié par ce dépôt ou par les tests.

La [spécification fonctionnelle V1.2](maths/numeration/changements-de-base/specification.md) fait autorité ; seule la section **lot 1** est implémentée.

## Prévisualiser

**Sans installer quoi que ce soit :** télécharger le dossier complet, puis ouvrir `index.html` dans un navigateur récent. Le catalogue et le dossier de l’activité fonctionnent via `file://`, même hors ligne. Le dossier `maths/numeration/changements-de-base/` peut aussi être copié seul et son `index.html` ouvert directement. Garder ensemble son HTML, son CSS et ses six scripts.

**Avec un serveur statique local**, depuis la racine du dépôt :

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrir l’adresse locale affichée par Python, puis « Ouvrir l’activité ». Arrêter le serveur avec `Ctrl+C`. Sur son propre ordinateur, pour vérifier depuis un téléphone sur le même réseau, utiliser `python3 -m http.server 8000 --bind 0.0.0.0` puis l’adresse réseau de l’ordinateur et le port 8000. Le serveur sert uniquement des fichiers statiques.

Les chemins relatifs permettent également un hébergement sous un préfixe, par exemple `/revisions-scolaires/`. Aucune publication n’est requise pour utiliser l’application ; aucune procédure automatique de déploiement n’est ajoutée.

## Architecture

```text
index.html                         Catalogue Atelier Révisions
css/site.css                       Styles du catalogue
js/catalogue.js                    Métadonnées et rendu matière → thème → activité
maths/numeration/changements-de-base/
  index.html                       Application autonome
  specification.md                 Référence pédagogique approuvée
  css/styles.css                   Styles du module
  js/data.js                       Six énoncés, champs, réponses et indices
  js/conversions.js                Conversions et lecture stricte des entiers
  js/exercises.js                  Correction, solutions calculées et statuts
  js/guides.js                     Fiches et interactions sans score
  js/storage.js                    État local validé et repli en mémoire
  js/app.js                        Écrans, formulaires et navigation
tests/                             Tests réservés au développement
```

HTML/CSS/JavaScript natifs, scripts classiques avec `defer` dans l’ordre indiqué par la spécification. Un espace global par interface : `AtelierRevisions` pour le catalogue et `MissionBinaire` pour l’activité. Aucun framework, backend, `fetch()`, import de module, police distante, CDN ou dépendance d’exécution. Pas de compilation.

Pour ajouter une activité plus tard : créer son dossier autonome et ajouter ses métadonnées au catalogue. Le troisième segment du chemin nomme l’activité ; matière et thème sont les deux niveaux de classification. Ne pas ajouter de liens vers des activités absentes.

## Tests

Node.js **20 ou plus récent** est nécessaire uniquement au développement.

```sh
npm test
```

Cette commande n’exige aucune installation de paquet. Elle exécute les tests unitaires et d’architecture avec `node:test` : conversions et aller-retour de tous les octets, entiers invalides, zéros de tête, huit bits obligatoires, six corrigés de référence, sous-questions, pixels, sauvegarde et restrictions de stockage, chemins locaux, catalogue et ordre des scripts.

Pour les tests navigateur, installer la dépendance **de développement** Playwright et Chromium :

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Si Chromium est déjà installé à `/usr/bin/chromium`, le test l’utilise automatiquement et son téléchargement est inutile. Pour un autre chemin, définir `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Les installations Linux minimales peuvent nécessiter les bibliothèques système documentées par Playwright (`npx playwright install --with-deps chromium`).

```sh
npm run test:all
```

Les tests navigateur démarrent et arrêtent leur propre serveur sur un port libre. Ils vérifient les six exercices sur ordinateur (1440 px) et mobile (375 px), un écran à 320 px, les indices et confirmations, les pixels au clavier, les fiches et le focus, la reprise après rechargement HTTP, le stockage bloqué, les chemins sous un préfixe et l’ouverture `file://` hors ligne d’une copie indépendante du module. Ils produisent des captures dans `artifacts/` (ignoré par Git) :

- `catalogue-desktop.png`, `catalogue-mobile.png` ;
- `mission-desktop.png`, `mission-mobile.png` ;
- `pixels-mobile.png`, `fiche-pixels-mobile.png`.

Validation du lot 1 dans l’environnement cloud : **18 tests unitaires/d’architecture et 8 tests navigateur réussis**, aucun échec. Le contrôle `file://` est **non exécuté** ici : la politique du Chromium fourni renvoie `ERR_BLOCKED_BY_ADMINISTRATOR`. Ce cas reste automatisé pour un navigateur local autorisant les fichiers ; l’autonomie du dossier copié a été vérifiée séparément en HTTP. Les captures générées ont été inspectées sur ordinateur et mobile.

Les tests automatisés ne constituent pas un audit exhaustif d’accessibilité ou une validation sur tous les navigateurs. La sauvegarde `file://` dépend du navigateur ; la reprise persistante est vérifiée en HTTP.

## Confidentialité et distribution

La clé de stockage est `mission-binaire:v1`, propre à ce module. Aucun nom, compte, identifiant personnel, suivi ou appel réseau n’est utilisé. La progression reste sur le même navigateur et sous la même URL ; elle ne se synchronise pas entre appareils.

Pour distribuer les pages, seuls le HTML, le CSS et le JavaScript locaux sont requis. `node_modules/`, `tests/`, les fichiers npm et `artifacts/` ne font pas partie des ressources de l’application. Télécharger tous les fichiers permet de travailler hors ligne ; une visite HTTP ne rend pas le site disponible hors connexion (pas de service worker en V1.2).
