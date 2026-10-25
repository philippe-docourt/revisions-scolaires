# Atelier Révisions

Un catalogue scolaire statique et des activités autonomes, en français. Les **lots 1 à 3** proposent une seule activité : **Maths → Numération → Changements de base**, intitulée **Mission binaire — Répétition de maths**.

## Contenu livré

- Accueil général construit à partir des métadonnées de `js/catalogue.js`.
- **18 exercices en trois séries de six**, navigation libre, essais illimités, deux indices par exercice et corrigé détaillé après confirmation.
- **Cinq fiches interactives : Méthodes, Pixels, ASCII, RGB et adresses IP**, sans perte des réponses ; fermeture par bouton ou Échap et restitution du focus.
- Pixels et portes initialement indéterminés, puis choix au clic ou au clavier. Toutes les sous-questions obligatoires doivent être correctes.
- **Bilan des 18 exercices** : quatre statuts descriptifs, nombre d’exercices tentés/réussis, liens pour reprendre et fiches pour les notions à consolider. Accessible par « Mon bilan » et à la fin d’une série.
- Reprise locale des réponses, essais, indices et réussites, avec position conservée pour chaque série ; repli en mémoire si le stockage est bloqué et remise à zéro confirmée. Les sauvegardes du lot 1 sont conservées.

**Les séries 2 et 3 sont accessibles immédiatement**, même si la série 1 n’est pas terminée. Depuis l’accueil, choisir « Commencer la série 2 » ou « Commencer la série 3 ». Dans un exercice, utiliser les boutons de série puis les numéros 01 à 06. « Exercice suivant » ne demande aucune réponse préalable.

Les exercices respectent la [spécification fonctionnelle V1.2](maths/numeration/changements-de-base/specification.md). Choix de présentation des questions multiparties :

- Exercice 10 : les trois conversions décimales **et** le mot sont obligatoires, comme annoncé dans l’énoncé.
- Exercice 11 : l’explication de la limite est complétée par le nombre de configurations et les bornes minimale/maximale ; le corrigé explique pourquoi zéro occupe l’une des configurations.
- Exercice 14 : les quatre octets sont saisis ; l’adresse pointée est reconstituée à partir de ces réponses et n’ajoute aucune question à valider. Le dernier octet décimal reste obligatoire.
- Exercice 15 : deux panneaux de portes neutres représentent les états initial et modifié ; chaque porte doit être renseignée. Leur correspondance avec les octets saisis est vérifiée, porte 1 = bit 0 à droite.
- Les lettres/mots ASCII et les codes hexadécimaux acceptent les minuscules et majuscules. Les composantes RGB ont exactement deux chiffres hexadécimaux ; le code complet est affiché dans le corrigé sous la forme canonique `#RRGGBB`.

Le bilan distingue **réussi sans aide**, **réussi après indice ou tentative**, **solution consultée** et **pas encore terminé**. Une consultation de solution ne compte pas comme réussite ; une validation correcte ultérieure compte comme réussite après aide. « Tenté » signifie qu’au moins une validation a eu lieu. Les résultats ne sont ni une note ni un classement.

Les illustrations supplémentaires des séries 2 et 3 restent un chantier séparé. Aucun site n’est publié par ce dépôt ou les tests ; aucun déploiement automatique n’est configuré.

## Prévisualiser

**Sans installer quoi que ce soit :** télécharger le dossier complet, puis ouvrir `index.html` dans un navigateur récent. Le catalogue et le dossier de l’activité utilisent uniquement des fichiers locaux et sont conçus pour fonctionner via `file://`, même hors ligne. Ce mode doit encore être validé dans un navigateur local autorisant ces URL ; le navigateur cloud le bloque. Le dossier `maths/numeration/changements-de-base/` peut aussi être copié seul et son `index.html` ouvert directement. Garder ensemble son HTML, son CSS et ses six scripts.

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
  js/data.js                       18 énoncés, champs, réponses et indices
  js/conversions.js                Conversions et lecture stricte des entiers
  js/exercises.js                  Correction, solutions calculées et statuts
  js/guides.js                     Fiches et interactions sans score
  js/storage.js                    État local validé et repli en mémoire
  js/app.js                        Écrans, formulaires et navigation
scripts/export.cjs                 Copie facultative des fichiers de distribution
tests/                             Tests réservés au développement
```

HTML/CSS/JavaScript natifs, scripts classiques avec `defer` dans l’ordre indiqué par la spécification. Un espace global par interface : `AtelierRevisions` pour le catalogue et `MissionBinaire` pour l’activité. Aucun framework, backend, `fetch()`, import de module, police distante, CDN ou dépendance d’exécution. Pas de compilation.

Pour ajouter une activité plus tard : créer son dossier autonome et ajouter ses métadonnées au catalogue. Le troisième segment du chemin nomme l’activité ; matière et thème sont les deux niveaux de classification. Ne pas ajouter de liens vers des activités absentes.

## Tests

Node.js **20 ou plus récent** est nécessaire uniquement au développement.

```sh
npm test
```

Cette commande n’exige aucune installation de paquet. Elle exécute les tests unitaires et d’architecture avec `node:test` : conversions et aller-retour de tous les octets, entiers invalides, zéros de tête, huit bits obligatoires, 18 corrigés de référence, sous-questions, pixels et portes, sauvegarde et restrictions de stockage, chemins locaux, catalogue et ordre des scripts.

Pour les tests navigateur, installer les dépendances **de développement** Playwright/axe-core et Chromium :

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Si Chromium est déjà installé à `/usr/bin/chromium`, le test l’utilise automatiquement et son téléchargement est inutile. Pour un autre chemin, définir `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Les installations Linux minimales peuvent nécessiter les bibliothèques système documentées par Playwright (`npx playwright install --with-deps chromium`).

```sh
npm run test:all
```

Les tests navigateur démarrent et arrêtent leur propre serveur sur un port libre. Ils vérifient les 18 exercices sur ordinateur (1440 px) et mobile (375 px), un écran à 320 px, les indices et confirmations, les pixels au clavier, les fiches et le focus, le bilan, le redémarrage complet d’un navigateur à profil persistant, les sauvegardes corrompues et le stockage bloqué, les chemins sous un préfixe et l’ouverture `file://` hors ligne d’une copie indépendante du module. Ils produisent des captures dans `artifacts/` (ignoré par Git) :

- `catalogue-desktop.png`, `catalogue-mobile.png` ;
- `mission-desktop.png`, `mission-mobile.png` ;
- `pixels-mobile.png`, `fiche-pixels-mobile.png` ;
- `ascii-desktop.png`, `ascii-mobile.png`, `rgb-desktop.png`, `rgb-mobile.png`, `ip-desktop.png`, `ip-mobile.png` ;
- `exercice-rgb-desktop.png`, `exercice-rgb-mobile.png`, `portes-desktop.png`, `portes-mobile.png` ;
- `bilan-desktop.png`, `bilan-mobile.png`.

Le [rapport du lot 3](tests/rapport-lot-3.md) détaille les résultats et les limites actuelles ; le [rapport du lot 2](tests/rapport-lot-2.md) décrit la livraison précédente. Le contrôle `file://` reste automatisé, mais la politique du Chromium cloud peut l’interdire (`ERR_BLOCKED_BY_ADMINISTRATOR`) : il est alors signalé **non exécuté**, jamais réussi. L’autonomie du dossier copié est également vérifiée séparément en HTTP.

L’audit axe-core (règles WCAG A/AA 2.0, 2.1 et 2.2 prises en charge) couvre le catalogue, les 18 exercices, les cinq fiches, une confirmation et le bilan. Ses rapports JSON sont générés dans `artifacts/accessibilite-*.json`. Les contrôles clavier, le reflow à 320 px et l’agrandissement du texte complètent cet audit. Cela ne constitue pas une certification d’accessibilité, une session avec un lecteur d’écran humain ou une validation sur tous les navigateurs. La sauvegarde `file://` dépend du navigateur ; la reprise persistante est vérifiée en HTTP.

## Confidentialité et distribution

La clé de stockage est `mission-binaire:v1`, propre à ce module. Aucun nom, compte, identifiant personnel, suivi ou appel réseau n’est utilisé. La progression reste sur le même navigateur et sous la même URL ; elle ne se synchronise pas entre appareils.

Pour distribuer les pages, seuls le HTML, le CSS et le JavaScript locaux sont requis. `node_modules/`, `tests/`, les fichiers npm et les rapports/captures de `artifacts/` ne font pas partie des ressources de l’application. Télécharger tous les fichiers permet de travailler hors ligne ; une visite HTTP ne rend pas le site disponible hors connexion (pas de service worker en V1.2).


## Préparer une copie à distribuer

Depuis la racine du dépôt, avec Node.js (aucun paquet à installer pour cette commande) :

```sh
npm run export
```

La commande copie les **11 fichiers HTML/CSS/JS nécessaires** dans `artifacts/site/`, avec les chemins d’origine. Ce n’est pas une compilation : les fichiers sont identiques aux sources. Les tests, dépendances de développement et rapports ne sont pas copiés. Les fichiers personnels déjà présents dans ce dossier ne sont pas supprimés : pour préparer une distribution, vérifier que le dossier ne contient que les fichiers web attendus.

Ouvrir `artifacts/site/index.html`, ou prévisualiser par HTTP :

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory artifacts/site
```

La progression dépend de l’URL. Une copie ou un changement de chemin/domaine peut donc avoir une sauvegarde distincte. Une copie du seul dossier de l’activité fonctionne indépendamment du catalogue.

## Hébergement statique, uniquement après autorisation de publication

Le dépôt n’active aucun hébergement. Quand la publication est décidée :

1. Exécuter les tests et préparer `artifacts/site/`.
2. Envoyer **le contenu de ce dossier** à l’hébergeur statique choisi. Ne pas envoyer le dossier `artifacts/` entier, les rapports, les tests ou `node_modules/`.
3. Pour GitHub Pages, placer cette copie dans une branche de publication dédiée, à sa racine, puis sélectionner cette branche et `/ (root)` dans les réglages Pages. Aucune commande du projet ne crée cette branche ni n’active Pages. Pour un hébergeur acceptant un dossier statique, sélectionner directement la copie `site/`.
4. Vérifier le catalogue, son lien vers l’activité, les cinq fiches et la sauvegarde depuis l’URL réellement publiée. Les liens relatifs supportent un domaine racine ou un sous-chemin tel que `/revisions-scolaires/`.

Aucune variable d’environnement, secret, serveur applicatif, API, installation npm ou commande de build n’est nécessaire à l’exécution des fichiers publiés.

## Vérification hors ligne sur son ordinateur

Le test automatisé hors ligne est prévu dans `tests/browser.test.cjs`. Sur un ordinateur dont Chromium autorise `file://`, exécuter `npm run test:browser` : ce test doit réussir, et non être ignoré. Il ouvre le catalogue, effectue les 18 exercices, ouvre les cinq fiches et consulte le bilan sans accès réseau, puis vérifie une copie autonome de l’activité.

Contrôle manuel complémentaire : télécharger tous les fichiers de `site/`, couper le réseau, ouvrir son `index.html` dans le navigateur, naviguer dans les trois séries, essayer les cinq fiches, afficher une solution après confirmation et consulter le bilan. Recharger pour vérifier la reprise lorsque le navigateur autorise le stockage local. En cas de blocage du stockage, la notice doit apparaître et les exercices doivent rester utilisables pour la session. Une visite HTTP précédente ne remplace pas ce téléchargement (pas de PWA/service worker).
