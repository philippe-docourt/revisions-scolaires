# Conventions du dépôt

- Lire intégralement la spécification de l’activité avant de la modifier : `maths/numeration/changements-de-base/specification.md`. C’est la référence pédagogique approuvée. Respecter le lot demandé. Les lots 1 à 3 livrent les trois séries, les cinq fiches et le bilan. Les illustrations supplémentaires restent un chantier séparé.
- Utiliser le checkout existant. Les tâches cloud sont isolées ; ne pas créer de worktree sans demande explicite. Travailler dans une branche dédiée, sans fusionner dans `main` ni publier de site sans autorisation.
- Livrer un site statique natif, sans backend, framework, dépendance d’exécution ou build. Aucune ressource distante, `fetch()` de données ni ES Module : l’ouverture `file://` doit fonctionner.
- Charger les scripts classiques avec `defer` depuis le `<head>`, dans l’ordre `data`, `conversions`, `exercises`, `guides`, `storage`, `app`. Un seul espace global pour le module : `window.MissionBinaire`.
- Garder le catalogue (`window.AtelierRevisions`, `js/catalogue.js`) séparé du contenu pédagogique. Classification matière → thème ; le troisième segment désigne l’activité. Ne répertorier que des activités disponibles.
- Tous les chemins web sont relatifs. Une activité reste autonome quand son dossier est copié ailleurs ; elle ne charge rien depuis le catalogue ou la racine du dépôt.
- Interface et retours pédagogiques en français. Entiers non signés, bit 0 à droite, huit chiffres obligatoires quand huit bits sont demandés. Accepter uniquement les formats et espaces prévus par la spécification ; toutes les sous-questions obligatoires doivent être correctes.
- Ne jamais préremplir les réponses, notamment les pixels. Une erreur ne révèle pas la solution. Deux indices progressifs au maximum ; le corrigé demande une confirmation. Distinguer réussite sans aide, réussite après aide/tentative et solution consultée.
- Préserver les réponses pendant la navigation et l’ouverture des fiches. Le stockage local n’est pas garanti : prévoir le fonctionnement en mémoire. Ne collecter aucune donnée personnelle.
- Prévoir labels, focus visible, messages annoncés, boutons clavier/tactiles, fermeture des dialogues par Échap et restitution du focus. Les pixels comportent une alternative textuelle noir/blanc/indéterminé.
- Tester avec `npm test` ; après modification des interactions ou styles, exécuter aussi `npm run test:browser` si Chromium est disponible. Les dépendances de développement sont réservées aux tests ; les captures générées dans `artifacts/` et `node_modules/` restent ignorées par Git.
- Documenter les commandes et limites dans `README.md`. Conserver la spécification approuvée inchangée. Ne pas publier de site ou implémenter un nouveau lot sans demande.

- Les séries et exercices restent librement accessibles, sans condition de réussite préalable. Conserver les sauvegardes `mission-binaire:v1` du lot 1 lors de l’ajout de contenu. Les tests de référence dans `tests/references.cjs` proviennent de la spécification et restent indépendants des réponses de `data.js`.

- Le bilan utilise les quatre catégories de la spécification ; une solution consultée ne devient une réussite qu’après validation correcte. Ne pas confondre un exercice tenté avec un exercice réussi. Préserver les anciens formats de sauvegarde et traiter les états partiellement malformés.
- Après une modification d’interface, conserver les contrôles axe-core, clavier, reflow et reprise après redémarrage. Signaler honnêtement les contrôles non exécutés (notamment `file://` bloqué par une politique navigateur), sans désactiver les règles ou contourner la politique. `npm run export` prépare uniquement des fichiers statiques ; il ne publie rien.
