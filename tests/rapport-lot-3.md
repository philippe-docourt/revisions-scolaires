# Rapport de validation — lot 3

## Livraison

Le bilan dédié rassemble les 18 exercices et les quatre statuts de la spécification V1.2. Il distingue les exercices tentés et réussis, permet de reprendre chaque question et propose les fiches pertinentes pour les notions à consolider. Il est accessible à tout moment par « Mon bilan » et à la fin d’une série. Aucune série n’exige de terminer une précédente.

La progression reste locale et compatible avec les sauvegardes précédentes. Les états de pixels/portes malformés sont écartés sans faire planter l’application ; une sauvegarde illisible déclenche une notice. Si une écriture échoue, la session conserve les réponses en mémoire au lieu de recharger des données anciennes. La remise à zéro confirmée est enregistrée immédiatement, même si la page est aussitôt rechargée.

Les confirmations et fiches conservent le focus dans le dialogue au clavier. Les erreurs renvoient le focus au premier champ concerné, les titres de page indiquent l’écran courant et les libellés accessibles des étapes incluent leur numéro visible. Le contraste des numéros du parcours a été renforcé. L’illustration du catalogue dispose d’un rôle et d’une alternative explicites.

Les illustrations supplémentaires des séries 2 et 3 restent hors de ce lot. La spécification approuvée est inchangée. Aucun site publié, aucun déploiement automatique ajouté, aucune fusion dans `main` effectuée par cette tâche.

## Résultats

Environnement : Node.js 24, Playwright 1.58.2, Chromium système ; audit avec `@axe-core/playwright` 4.11.0 (dépendance de développement compatible avec la cible Node.js 20 du dépôt).

| Commande / contrôle | Résultat |
| --- | --- |
| `npm test` | 43 tests réussis, aucun échec |
| `npm run test:browser` | 19 tests réussis, aucun échec ; 1 test non exécuté |
| Audit axe-core | 27 écrans/états, aucune violation détectée parmi les règles exécutées |
| `npm run export` | 11 fichiers web copiés ; aucune publication |
| Ouverture `file://` hors ligne | Bloquée par la politique du Chromium cloud ; reste à valider localement |

La suite complète s’exécute avec `npm run test:all`. Le journal de cette exécution est généré dans `artifacts/tests-lot-3.log`. Le contrôle d’accessibilité a également été rejoué après la correction de l’alternative de l’illustration du catalogue : `artifacts/tests-lot-3-accessibilite.log`.

## Couverture

- Les 18 corrigés de référence et toutes les sous-questions obligatoires, conversions de tous les octets, formats invalides et limites, ASCII, RGB, IPv4, pixels et correspondance portes/bits.
- Parcours des 18 exercices sur ordinateur (1440 px) et mobile simulé (375 px), ouverture/fermeture des cinq fiches, indices gradués et solutions uniquement sur confirmation.
- Bilan vide puis progression mixte : réussite sans aide, réussite après tentative, solution consultée et exercice non terminé ; vérification des compteurs, conseils, fiches contextuelles et reprise sans perte de réponse. Un bilan complet est également vérifié dans les tests unitaires.
- Rechargement HTTP, migration d’une sauvegarde du lot 1, états corrompus/partiels, stockage indisponible et quota dépassé ; fermeture puis **redémarrage réel de Chromium avec le même profil** ; annulation puis confirmation de la remise à zéro.
- Navigation au clavier : lien d’évitement, focus visible, Tab/Maj+Tab dans une fiche, Échap et retour du focus, manipulation des pixels, portes et curseurs RGB. Reflow à 320 px (largeur correspondant à 400 % sur un viewport de 1280 px) et doublement des tailles de texte calculées.
- Audit axe-core sur le catalogue, l’accueil du module, chacun des 18 exercices, les cinq fiches, une confirmation et le bilan. Règles A/AA prises en charge de WCAG 2.0, 2.1 et 2.2. Aucun élément n’est exclu et aucune règle de cet ensemble n’est désactivée. Les cas de contraste indéterminés sont contrôlés séparément : calcul des couleurs (minimum de 3:1 pour les symboles seuls, 4,5:1 pour le texte) et contrôle de visibilité par hit-testing pour les paragraphes de dialogue que l’outil signale comme potentiellement recouverts. Les résultats bruts restent conservés.
- Distribution testée en HTTP à la racine du domaine, développement sous `/revisions-scolaires/` et activité copiée hors du dépôt. Vérification des ressources relatives et de l’absence d’appel vers une origine externe sur le parcours de distribution.
- L’export conserve l’arborescence et copie les sources à l’identique. Ses tests vérifient les liens locaux et l’absence de tests, dépendances et documentation de développement dans une copie neuve. Aucun fichier personnel préexistant n’est supprimé par une nouvelle copie.

## Aperçus et documentation

Les captures sont générées dans `artifacts/` et ignorées par Git. Le bilan a été inspecté visuellement sur ordinateur et mobile : `bilan-desktop.png` et `bilan-mobile.png`. Les autres captures montrent le catalogue, les exercices et les fiches. Les rapports détaillés axe-core se trouvent dans `artifacts/accessibilite-*.json`.

Le README explique l’aperçu local, la préparation de `artifacts/site/`, l’utilisation sous un sous-chemin et les étapes manuelles d’hébergement statique. Les commandes du dépôt ne créent ni branche de publication ni déploiement.

## Limites et contrôle restant

La politique du navigateur cloud interdit `file://` et renvoie `ERR_BLOCKED_BY_ADMINISTRATOR`. Le test hors ligne n’est donc **pas validé** ici. Le test est conservé : dans un navigateur local autorisant les fichiers, il doit effectuer les 18 exercices, les cinq fiches et le bilan avec le réseau désactivé, puis ouvrir une copie autonome de l’activité. Le README fournit aussi un parcours manuel. La politique n’a pas été modifiée ou contournée.

Le stockage persistant est vérifié en HTTP. Les règles de stockage `file://` peuvent varier selon les navigateurs ; le fonctionnement en mémoire reste prévu si ce stockage est interdit.

Les dimensions mobiles sont émulées dans Chromium ; aucun téléphone physique, Safari/Firefox ou lecteur d’écran humain n’a été utilisé. L’audit automatisé, les contrôles clavier et les inspections visuelles ne constituent pas une certification complète de conformité WCAG. Une validation locale hors ligne et, avant une diffusion large, un essai sur les navigateurs/appareils visés restent recommandés.
