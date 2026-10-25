# Rapport de validation — lot 2

## Périmètre

Les trois séries de six exercices sont disponibles, avec les cinq fiches Méthodes, Pixels, ASCII, RGB et adresses IP. Les séries 2 et 3 sont accessibles sans terminer les précédentes. La spécification V1.2 approuvée est conservée inchangée.

Le bilan dédié et les finitions du lot 3 ne font pas partie de cette livraison. Aucun site n’a été publié et aucune fusion dans `main` n’a été effectuée.

## Résultats

Commande : `npm run test:all` (Node.js 24, Playwright 1.58.2 et Chromium système).

| Vérification | Résultat |
| --- | --- |
| Tests unitaires et d’architecture | 36 réussis, 0 échec |
| Tests navigateur | 13 réussis, 0 échec |
| Ouverture `file://` hors ligne | 1 test non exécuté : restriction du navigateur cloud |

Les réponses de référence dans `references.cjs` sont indépendantes des données de l’application et correspondent à la section 4 de la spécification. Pour chaque exercice, les tests vérifient la bonne réponse, une réponse fausse et l’absence de chaque sous-question obligatoire. Les corrigés des douze nouveaux exercices sont également contrôlés.

## Contrôles effectués

- Parcours des **18 exercices** en HTTP sous le préfixe `/revisions-scolaires/`, sur ordinateur **1440 px** et mobile **375 px** ; contrôles complémentaires de largeur à **320 px**.
- Accès direct aux séries 2 et 3, passage à la question suivante sans réponse, retour aux séries et reprise à la dernière question consultée dans chacune.
- Conversions d’octets, zéros initiaux, huit bits obligatoires, entiers invalides, hexadécimal en minuscules/majuscules, couleurs mal formées, format canonique `#RRGGBB`.
- Pixels et portes indéterminés au départ ; utilisation au clavier et ordre gauche/droite. Vérification des deux octets de portes `01001010` et `01101010`, porte 1 = bit 0 à droite.
- Erreurs sans divulgation du corrigé, deux indices progressifs, annulation/confirmation de la solution pour chacun des douze nouveaux exercices, puis résolution après aide.
- Fiches : ASCII standard 7 bits/128 codes, conversion d’une lettre, rejet d’un caractère étendu ; RGB manipulable au clavier, trois intensités, couleurs `#FF8040` et `#7F00FF`, exemples rouge/vert/bleu/noir/blanc ; IPv4 avec champs 0–255, conversions et erreurs de plage.
- Fermeture des fiches par bouton/Échap, restitution du focus, conservation des réponses de l’exercice.
- Reprise HTTP, stockage bloqué et repli en mémoire, remise à zéro confirmée ; conservation d’une ancienne sauvegarde du lot 1 et des nouveaux états de portes.
- Copie du dossier de l’activité hors du dépôt puis ouverture en HTTP : chargement des ressources, correction et interaction d’une fiche.
- Aucun import, chargement de données distant ou dépendance d’exécution ajouté ; aucune erreur JavaScript observée pendant les parcours.

## Aperçus et limites

Les captures sont produites dans `artifacts/` par les tests, puis inspectées visuellement : `mission-desktop.png`, `mission-mobile.png`, `ascii-desktop.png`, `ascii-mobile.png`, `rgb-desktop.png`, `rgb-mobile.png`, `ip-desktop.png`, `ip-mobile.png`, `portes-desktop.png`, `portes-mobile.png`. Elles sont générées localement et ignorées par Git. Les instructions de prévisualisation sans publication figurent dans `README.md`.

La politique du Chromium cloud interdit les URL `file://` et renvoie `ERR_BLOCKED_BY_ADMINISTRATOR`. Le test hors ligne reste dans la suite, mais ce comportement n’est **pas validé dans cet environnement**. Le dossier est autonome et ses ressources locales sont vérifiées ; le contrôle hors ligne doit être exécuté dans un navigateur autorisant l’ouverture locale. Le test ne masque aucune autre erreur de navigation.

Ces vérifications utilisent Chromium et une émulation de dimensions mobiles, pas un téléphone physique. Elles ne constituent pas un audit exhaustif d’accessibilité ou une validation Safari/Firefox. La sauvegarde persistante est vérifiée en HTTP ; son comportement `file://` varie selon le navigateur.
