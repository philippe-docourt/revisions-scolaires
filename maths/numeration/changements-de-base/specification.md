# Spécification fonctionnelle V1.2 — Révisions scolaires / Mathématiques / Numération / Changements de base

**Date :** 25 octobre 2026  
**Statut :** contenu pédagogique approuvé ; architecture multi-matières et multi-modules approuvée ; cible Codex Cloud  
**Public :** élève de scolarité obligatoire, débutant en informatique  
**Produit visé :** site de révisions scolaires statique extensible, comprenant un catalogue racine et des applications pédagogiques autonomes, dont un premier module sur les changements de base

## 1. Objet et périmètre

Créer, dans un site générique de révisions scolaires, un premier entraînement ludique et rigoureux aux changements de base, axé essentiellement sur les conversions **décimal ↔ binaire**. Le contexte informatique (pixels, ASCII, adresses IPv4, capteurs, bits d'autorisation, données audio) sert à donner du sens aux calculs, sans nécessiter des connaissances informatiques préalables.

- **18 exercices en trois séries de six**, progressives ; **16** sont axés sur la base 2 et **2** sont consacrés à l'hexadécimal (RGB).
- **5 fiches d'aide** : conversions de bases (transversale), ASCII, RGB, adresses IP et pixels.
- Pour chaque exercice : énoncé clair, saisie de réponse, validation automatique, indice facultatif et solution méthodologique sur demande.
- Aucun compte, aucune collecte nominative, aucun serveur applicatif, aucune API ni connexion réseau requise pour apprendre.
- Le dossier livré fonctionne **hors ligne après téléchargement intégral**, en ouvrant `index.html` depuis ce dossier, sans ressource distante. Les tests et les outils de développement restent hors du dossier de distribution.

### 1.1 Organisation du site (nouveauté V1.2)

- **Dépôt :** `revisions-scolaires`.
- **Deux niveaux de classification :** matière, puis domaine/thème. Exemples : `maths/numeration/`, `maths/geometrie/`, `physique/electricite/`, `francais/grammaire/`, `anglais/vocabulaire/`, `allemand/grammaire/`.
- **Troisième segment :** nom de l'activité, et non troisième niveau de classification. Première activité : `maths/numeration/changements-de-base/`.
- **Racine :** `index.html` est un catalogue de modules ; chaque activité possède son propre `index.html` et ses ressources indépendantes.
- **Métadonnées transversales :** un catalogue central local (`js/catalogue.js`) décrit les modules avec `id`, `titre`, `matiere`, `theme`, `niveau`, `tags`, `chemin` et éventuellement `nombreExercices`. Ce sont les **métadonnées de découverte**, pas les contenus ni les réponses des exercices.
- **Publication :** chaque module et la racine doivent fonctionner sur un hébergement statique déployé à la racine d'un domaine ou dans un sous-chemin (ex. GitHub Pages). Les liens restent **relatifs** et les modules ne dépendent pas de l'URL du domaine.
- **Terminologie :** repository `revisions-scolaires` ; titre public provisoire **« Atelier Révisions »** ; premier module **« Mission binaire — Répétition de maths »**.

### 1.2 Objectifs d'apprentissage

1. Décomposer un entier décimal en puissances de 2 et l'écrire en binaire.
2. Décomposer un entier binaire en puissances de 2 et en trouver la valeur décimale.
3. Travailler sur **8 bits**, comprendre le zéro de remplissage à gauche, les combinaisons `2^n` et la plage 0–255 d'un octet non signé.
4. Traduire une suite de bits dans des contextes simples (ASCII, pixels, capteurs, réseau, accès).
5. Comprendre les bases de la représentation hexadécimale et convertir deux couleurs RGB.

### 1.3 Hors périmètre

- Nombres binaires négatifs, complément à deux, flottants, opérations binaires complexes.
- Endianness, adressage IPv4 et masques de sous-réseaux, protocoles réseau, détails de fichiers image/audio.
- Unicode avancé, apprentissage par cœur de la table ASCII.
- Comptes utilisateurs, classements en ligne, synchronisation entre appareils, télémétrie, publicité.

## 2. Parcours et interface

### 2.1 Accueil général du site (nouveauté V1.2)

- Titre : **« Atelier Révisions »** ; présentation courte du catalogue d'exercices scolaires.
- Navigation par matière, puis par thème, générée à partir des entrées du `catalogue.js`.
- Pour la V1 : n'afficher **qu'un module réel**, classé sous **Maths → Numération → Changements de base**, sans inventer de liens vers des modules fictifs.
- Chaque entrée affiche : titre, niveau, courte description, tags utiles, nombre d'exercices si fourni et lien **« Ouvrir l'activité »**.
- Le catalogue est une simple interface de découverte : aucun compte, aucun back-office, aucune recherche serveur. Un filtrage en JavaScript peut être ajouté ultérieurement.
- Il est acceptable qu'à la V1 les autres matières soient mentionnées uniquement dans la documentation de l'architecture et non présentées comme disponibles.

### 2.2 Écran d'accueil du module

- Titre : **« Mission binaire — Répétition de maths »**.
- Sous-titre : « 18 exercices · 3 séries · 5 fiches pour t'aider ».
- Trois cartes de série : **1. Les fondamentaux**, **2. L'informatique au quotidien**, **3. Défis et situations concrètes**. En **lot 1**, seule la série 1 est active ; les séries 2 et 3 peuvent être affichées avec la mention « à venir », sans lien inactif trompeur et sans annoncer 18 exercices déjà utilisables.
- Pour chaque série : nombre d'exercices terminés, bouton « Commencer » ou « Reprendre ».
- Progression globale (nombre réussi/terminé sur 18) et accès au **« Guide des méthodes »**.
- Bouton « Recommencer ma progression » protégé par une confirmation explicite.

### 2.3 Écran d'exercice

- Barre indiquant **Série N, exercice M/6** et progression globale.
- Énoncé en français, avec notations lisibles `23₁₀`, `101101₂`, et équivalent textuel accessible.
- Une ou plusieurs sous-questions présentées progressivement lorsque cela améliore la clarté.
- Types de réponse : champ décimal, champ binaire, champ hexadécimal, lettre/mot court, cases de pixels ou interrupteurs de portes.
- Boutons : **« Vérifier »**, **« Un indice »**, **« Voir la méthode »**, **« Exercice suivant »**, **« Retour aux séries »**.
- Une fiche contextuelle accessible à proximité : **« Comprendre les pixels / ASCII / RGB / adresses IP »**.
- Validation sans navigation ni effacement involontaire de la réponse ; affichage d'un message spécifique au problème.
- Droit de réessayer sans limite ; la solution détaillée n'est jamais montrée automatiquement après une erreur.

### 2.4 Écran de bilan

- Affiche les 18 exercices : **réussi sans aide**, **réussi après indice ou tentative**, **solution consultée**, **pas encore terminé**.
- Permet de retourner à n'importe quel exercice ; les résultats sont descriptifs et encourageants, pas de classement ni note punitive.
- Rappel des difficultés et liens vers les fiches pertinentes.
- Les données ne sont conservées que dans le stockage local du navigateur, sur cet appareil et dans ce navigateur.

## 3. Conventions mathématiques et règles de correction

- On manipule des **entiers non signés** ; les conversions demandées n'utilisent pas de nombres négatifs.
- **Bit 0 = bit de poids faible, à droite**, puis 1, 2, etc. En 8 bits, de gauche à droite : bits 7 à 0 ; poids `128, 64, 32, 16, 8, 4, 2, 1`.
- Ne pas enseigner Little/Big Endian ici. Le positionnement d'une porte dans un octet est une **convention propre à l'exercice** : porte n ↔ bit n−1.
- Quand l'énoncé dit **« sur exactement 8 bits »**, exiger huit chiffres, y compris les zéros à gauche.
- Pour un autre binaire numérique, accepter les zéros initiaux superflus si la valeur est correcte et s'il n'y a pas de longueur imposée.
- Ignorer espaces extérieurs ; accepter des espaces entre groupes de bits lorsque la saisie est textuelle et que le contexte s'y prête. Ne pas accepter d'autres symboles dans une réponse binaire.
- Décimal : chiffres 0–9 uniquement, entier sans signe et sans notation exponentielle.
- Hexadécimal : lettres majuscules/minuscules équivalentes ; pour une composante RGB demander exactement **deux caractères hexadécimaux** ; pour le code couleur demander `#` suivi de six chiffres (accepter éventuellement l'absence de `#` mais montrer le format canonique).
- ASCII : utiliser uniquement les caractères de **l'ASCII standard** (7 bits, 0–127), représentés ici avec un zéro initial sur un octet lorsque demandé. Ne **pas** affirmer que la table ASCII elle-même comprend 256 caractères : un octet offre 256 combinaisons, mais ASCII standard comprend 128 codes.
- Une réponse multipartie n'est marquée réussie que lorsque toutes ses sous-questions obligatoires sont correctement renseignées.
- Aucune comparaison fragile uniquement de chaînes lorsque des représentations équivalentes sont admises ; parser et comparer de façon sûre, mais respecter les contraintes de longueur.

### 3.1 Politique d'aide et de progression

1. Après une réponse correcte : confirmer et expliquer brièvement pourquoi (p. ex. décomposition en puissances de 2).
2. Après une réponse fausse : « Pas encore : vérifie les poids des bits… » et possibilité de recommencer ; ne pas divulguer directement la solution.
3. « Un indice » montre une aide graduée et contextuelle (maximum deux indices si possible), sans donner directement le résultat complet.
4. « Voir la méthode » montre un corrigé calculé et expliqué, avec une confirmation volontaire ; l'exercice est alors marqué « solution consultée » tant que l'élève ne le résout pas de lui-même ultérieurement.
5. « Suivant » est toujours disponible, pour ne pas bloquer l'apprentissage ; les exercices peuvent être repris librement.
6. Le bilan distingue les exercices tentés, réussis et ceux dont la solution a été révélée.

## 4. Banque définitive des 18 exercices

Les énoncés ci-dessous font autorité pour la première implémentation. Les réponses constituent les **tests de référence** que Codex doit respecter. Les formulaires multiparties peuvent être répartis en champs distincts.

### Série 1 — Les fondamentaux

**1. Conversion décimal → binaire**  
*Énoncé.* Convertis `23₁₀` en base 2. Montre, grâce à l'aide méthodologique si nécessaire, comment procéder par divisions successives par 2.  
*Réponse attendue.* `10111₂` (23 = 16 + 4 + 2 + 1).  
*Indice.* Décompose 23 en puissances de deux ou divise successivement par 2.  
*Fiche.* Méthodes.

**2. Conversion binaire → décimal**  
*Énoncé.* Convertis `101101₂` en base 10 à l'aide des puissances de 2.  
*Réponse attendue.* `45` (32 + 8 + 4 + 1).  
*Indice.* Les poids de droite à gauche sont 1, 2, 4, 8, 16, 32.  
*Fiche.* Méthodes.

**3. Écrire un nombre sur un octet**  
*Énoncé.* Un ordinateur doit stocker le nombre décimal 86 sur **exactement huit bits**. Quelle séquence faut-il écrire ?  
*Réponse attendue.* `01010110` (86 = 64 + 16 + 4 + 2).  
*Indice.* Commence avec un zéro à gauche si tu n'utilises que sept bits.  
*Fiche.* Méthodes.

**4. Un thermomètre numérique**  
*Énoncé.* Un capteur de température transmet `00110101` en binaire sur un octet. Dans cet exercice, sa valeur est directement exprimée en degrés Celsius. Quelle température décimale indique-t-il ?  
*Réponse attendue.* `53 °C` (32 + 16 + 4 + 1).  
*Indice.* Additionne les poids des positions contenant 1.  
*Fiche.* Méthodes.

**5. Dessiner une ligne de pixels**  
*Contexte.* Une ligne d'image a huit pixels. `0 = pixel noir` et `1 = pixel blanc`. Le premier bit à gauche décrit le premier pixel à gauche.  
*Énoncé.* Un ordinateur enregistre cette ligne sous la valeur décimale **45**. (a) Convertis 45 en binaire sur exactement huit bits. (b) Colorie virtuellement les huit pixels selon le code obtenu. (c) Combien de pixels sont blancs ?  
*Réponses attendues.* (a) `00101101`. (b) de gauche à droite : noir, noir, blanc, noir, blanc, blanc, noir, blanc. (c) **4**.  
*Interaction.* Huit boutons carrés initialement **indéterminés** ; clic ou clavier pour choisir noir/blanc. Ne pas pré-afficher les réponses !  
*Indice.* Écris d'abord les huit bits ; ensuite `1` devient blanc.  
*Fiche.* Pixels.

**6. Combinaisons d'interrupteurs**  
*Énoncé.* Cinq interrupteurs peuvent chacun valoir 0 ou 1. Combien de configurations différentes sont possibles ? Et avec huit interrupteurs ?  
*Réponses attendues.* **32** et **256** (`2⁵`, `2⁸`).  
*Indice.* Chaque interrupteur double le nombre de configurations.  
*Fiche.* Méthodes.

### Série 2 — L'informatique au quotidien

**7. Un octet un peu plus grand**  
*Énoncé.* Convertis `173₁₀` en base 2 sur exactement huit bits.  
*Réponse attendue.* `10101101`.  
*Indice.* Commence par 128.  
*Fiche.* Méthodes.

**8. Lire un octet**  
*Énoncé.* Convertis `11001010₂` en décimal et retrouve les puissances de 2 utiles.  
*Réponse attendue.* **202** (`128 + 64 + 8 + 2`).  
*Indice.* Additionne les colonnes de poids non nul.  
*Fiche.* Méthodes.

**9. Coder et décoder une lettre ASCII**  
*Contexte.* Dans l'ASCII standard, les lettres `A`, `B`, `C` ont respectivement les valeurs décimales 65, 66, 67.  
*Énoncé.* (a) Quel code binaire de huit bits représente `B` ? (b) Quelle lettre représente `01000011` ?  
*Réponses attendues.* (a) `01000010`. (b) `C` ; le code vaut 67 en décimal.  
*Indice.* Convertis 66 ou 01000011 ; compare ensuite avec la mini-table.  
*Fiche.* ASCII.

**10. Un message ASCII**  
*Contexte.* Une mini-table indique `W = 87`, `E = 69` et `B = 66`.  
*Énoncé.* Décoder, en expliquant les conversions, les trois octets `01010111 01000101 01000010`. Quel mot obtient-on ?  
*Réponse attendue.* `WEB` ; décimaux 87, 69, 66.  
*Interaction.* Trois champs décimaux facultatifs pour détailler + un champ « Mot » obligatoire. Si les décimaux sont affichés comme sous-questions à vérifier, les rendre obligatoires ou expliciter clairement leur statut.  
*Indice.* Convertis chaque octet séparément, puis utilise la table ASCII.  
*Fiche.* ASCII.

**11. Limite d'un compteur huit bits**  
*Énoncé.* Un compteur non signé sur huit bits affiche `11111110`. (a) Combien vaut-il en décimal ? (b) Quel sera son code après l'arrivée d'un objet supplémentaire ? (c) Pourquoi ne peut-il pas représenter 256 avec ses seuls huit bits ?  
*Réponses attendues.* (a) **254**. (b) `11111111`. (c) valeur maximale = **255** car `2⁸ = 256` combinaisons couvrent **0 à 255**.  
*Indice.* Tous les bits à 1 produisent la plus grande valeur possible sur 8 bits.  
*Fiche.* Méthodes.

**12. Composer une couleur RGB (hexadécimal 1/2)**  
*Introduction visible avant la question.* Un écran mélange trois lumières **R** = rouge, **G** = vert, **B** = bleu. Chaque intensité est comprise entre **0** (éteinte) et **255** (maximum). Un code de couleur tel que `#FF0000` contient, dans cet ordre, deux chiffres hexadécimaux pour chaque lumière : `RR GG BB`. En base 16, les chiffres sont `0…9, A…F`, et `FF₁₆ = 255₁₀`. Prévoir trois curseurs de démonstration dans la fiche, pas dans la réponse.  
*Énoncé.* Un graphiste choisit rouge = **255**, vert = **128**, bleu = **64**. Convertis chacune des intensités en base 16 sur deux chiffres, puis écris la couleur au format `#RRGGBB`.  
*Réponses attendues.* `FF`, `80`, `40`, puis `#FF8040`.  
*Indice.* Divise chaque valeur par 16 ; utilise le quotient et le reste.  
*Fiche.* RGB et Méthodes.

### Série 3 — Défis et situations concrètes

**13. Un nombre qui dépasse l'octet**  
*Énoncé.* Convertis `300₁₀` en binaire. Peut-on l'écrire sur huit bits ? Quel est le nombre minimal de bits nécessaires ?  
*Réponses attendues.* `100101100`, **non**, **9 bits**.  
*Indice.* `2⁸ = 256` ; compare 300 et 255.  
*Fiche.* Méthodes.

**14. Une adresse IPv4**  
*Introduction.* Une adresse IPv4 est ici représentée par quatre nombres décimaux compris entre 0 et 255, chacun stocké dans un octet, séparés par des points.  
*Énoncé.* L'adresse d'un ordinateur est `192.168.1.37`. (a) Convertis **chacun des quatre nombres** sur huit bits. (b) Réécris l'adresse complète en binaire en conservant les points. (c) Le dernier octet d'un deuxième ordinateur est `00101100` ; combien vaut-il en décimal ?  
*Réponses attendues.* (a) `11000000`, `10101000`, `00000001`, `00100101` ; (b) `11000000.10101000.00000001.00100101` ; (c) **44**.  
*Interaction.* Quatre champs binaires de huit chiffres ; l'adresse reconstituée est soit saisie et contrôlée, soit constituée automatiquement **sans être comptée comme un exercice supplémentaire**. Le champ décimal final est obligatoire.  
*Indice.* Chaque nombre est converti séparément sur huit bits.  
*Fiche.* Adresse IP.

**15. Autoriser certaines portes**  
*Contexte.* Huit portes numérotées 1 à 8. Par convention dans cet exercice, **porte 1 ↔ bit 0 à droite** ; porte 8 ↔ bit 7 à gauche. `1 = porte autorisée`, `0 = porte interdite`.  
*Énoncé.* (a) Autorise uniquement les portes **2, 4 et 7**. Écris l'octet correspondant. (b) Quelle est sa valeur décimale ? (c) On autorise également la porte **6** : donne le nouvel octet et sa valeur décimale.  
*Réponses attendues.* (a) `01001010`. (b) **74**. (c) `01101010`, **106**.  
*Interaction.* Éventuelle visualisation de portes **neutres au départ** ; les autorisations ne doivent pas être pré-renseignées. Un contrôle de correspondance portes ↔ bits est obligatoire.  
*Indice.* La porte n correspond au poids `2^(n−1)`.  
*Fiche.* Méthodes.

**16. Une erreur de transmission**  
*Énoncé.* Un capteur devait envoyer `10110110`, mais l'ordinateur a reçu `10100110`. Numérote les bits de **0 (à droite)** à **7 (à gauche)**. (a) Quel bit a changé ? (b) Convertis les deux octets en décimal. (c) De combien ces valeurs diffèrent-elles ?  
*Réponses attendues.* (a) **bit 4**. (b) **182** et **166**. (c) **16**.  
*Indice.* Les deux octets ne diffèrent que sur le poids 16.  
*Fiche.* Méthodes.

**17. Retrouver une couleur (hexadécimal 2/2)**  
*Contexte.* RGB utilise `#RRGGBB`, deux chiffres hexadécimaux par composante.  
*Énoncé.* Un graphiste utilise `#7F00FF`. Retrouve séparément les composantes décimales rouge, vert et bleu.  
*Réponses attendues.* **R = 127**, **V = 0**, **B = 255**.  
*Indice.* `7F₁₆ = 7×16 + 15`, `FF₁₆ = 15×16 + 15`.  
*Fiche.* RGB et Méthodes.

**18. Modifier un échantillon sonore**  
*Contexte.* Dans cette représentation **simplifiée** du son, une valeur d'échantillon non signée est stockée sur huit bits.  
*Énoncé.* L'échantillon vaut `10100101`. Un programme augmente sa valeur de **10 unités décimales**. (a) Combien valait-il en décimal ? (b) Quelle est la nouvelle valeur décimale ? (c) Quel est le nouveau code binaire sur huit bits ?  
*Réponses attendues.* (a) **165**. (b) **175**. (c) `10101111`.  
*Indice.* Convertis, ajoute 10, puis reconvertis sur huit bits.  
*Fiche.* Méthodes.

## 5. Fiches pédagogiques interactives

Les fiches doivent être ouvertes **sans quitter** l'exercice, sous forme de panneau ou fenêtre accessible ; fermeture par bouton, `Échap` et retour de focus correct. Chaque fiche contient : une explication courte (niveau scolaire), un exemple entièrement résolu, une petite interaction **sans enjeu de score**, puis un bouton « Retour à mon exercice ».

**Fiche A — Les conversions de base.** Tableau interactif des poids `128…1` avec boutons 0/1, somme décimale mise à jour, exemple `23₁₀ → 10111₂`, méthode des divisions successives par 2, conversion inverse par somme de puissances de 2, zéro initial pour remplir un octet ; courte aide base 16 avec `A=10…F=15`, `FF₁₆=255₁₀`, et exemples de composants RGB. Mentionner la plage 0–255, `2⁸ = 256` combinaisons.

**Fiche B — ASCII.** Expliquer qu'un caractère peut être associé à un code, distinguer **ASCII standard sur 7 bits** et **octet de 8 bits** qui peut le contenir avec un zéro initial. Afficher une mini-table des lettres majuscules utiles et un champ de lettre ASCII simple : montrer le code décimal et son écriture en binaire sur huit bits. Sans supposer la mémorisation des tables.

**Fiche C — RGB.** Présenter clairement les lumières Rouge/Vert/Bleu, trois curseurs entiers 0–255, aperçu de couleur mis à jour, valeurs décimales et code hexadécimal correspondant. Expliquer les positions de `#RRGGBB` et les conversions décimal↔hexadécimal de chaque composante. Prévoir quelques exemples rouge, vert, bleu, noir, blanc.

**Fiche D — Adresse IP.** Quatre champs 0–255 avec conversion en huit bits pour chacun et affichage de l'adresse pointée décimale/binaire. Exemple `192.168.1.37`. Ne pas enseigner les masques, les réseaux ni les plages réservées.

**Fiche E — Pixels.** Huit cases binaires manipulables, lecture de la séquence de gauche à droite, valeur décimale calculée. Montrer que la même séquence peut être interprétée comme un motif et comme une quantité ; ne pas confondre couleur d'un pixel avec un code RGB complet.

## 6. Sauvegarde et confidentialité

- Utiliser `localStorage` en priorité et sauvegarder l'état dès qu'une interaction pertinente intervient ; exemple de clé `mission-binaire:v1`.
- Conserver pour chaque exercice : réponses saisies, nombre de validations, nombre d'indices révélés, indicateur « solution vue », statut de réussite. Ne pas enregistrer le nom, l'adresse e-mail ni aucune donnée personnelle.
- Recharger l'application doit restaurer la progression **sur le même navigateur**, lorsque le stockage local est autorisé ; l'ouverture sous une autre URL ou sur un autre appareil ne transfère pas la progression.
- Offrir une remise à zéro par confirmation ; gérer proprement les restrictions de stockage (navigation privée, blocage de localStorage), avec fonctionnement en mémoire pour la session.

## 7. Technique et qualité

### 7.1 Livraison et architecture autonome (amendement V1.2)

- **Livrable : un dépôt statique autonome**, avec un `index.html` de catalogue à la racine et un **dossier autonome par activité**, comprenant un `index.html`, un fichier CSS local et plusieurs petits scripts JavaScript locaux. Aucun backend, API, compte utilisateur, base de données distante, CDN, police ou bibliothèque externe nécessaire à l'exécution.
- Le HTML charge les scripts depuis le `<head>` avec `defer` (scripts classiques, non `type="module"`) dans un ordre déterministe. Les scripts définissent un **seul espace de noms global** (p. ex. `window.MissionBinaire`) pour limiter les collisions et garder les responsabilités séparées.
- L'application doit fonctionner **en ouvrant `index.html` via `file://`**, une fois l'ensemble des fichiers téléchargés localement. Cela exclut l'utilisation à l'exécution de `fetch()` pour charger JSON, templates ou données d'exercices, ainsi que les imports ES Modules qui peuvent être bloqués sur `file://`. Les données des exercices sont contenues dans un fichier JS local.
- L'application doit également être utilisable depuis un **serveur HTTP statique** (GitHub Pages, Netlify, Cloudflare Pages ou simple serveur HTTP de développement), sans modification de code.
- **Ne pas confondre deux propriétés distinctes :** une archive téléchargée peut fonctionner hors ligne via `file://` ; un site visité une seule fois en ligne ne devient pas forcément accessible sans connexion Internet. Le mode hors ligne d'un site déjà visité via HTTP (service worker/PWA) reste hors périmètre de cette V1.2.
- La progression utilise `localStorage` lorsque disponible. Pour `file://`, les comportements de stockage peuvent varier selon les navigateurs ; en cas de blocage, l'application fonctionne malgré tout pour la session, et la sauvegarde doit être testée sur la version hébergée via HTTP.
- Utiliser HTML/CSS/JavaScript natifs, sans transpilation ni étape de build nécessaire à la livraison. Les dépendances réservées aux **tests de développement** ne doivent pas être requises pour l'application finale.

**Arborescence cible** (créer uniquement les dossiers utiles à la première activité ; ne pas multiplier les dossiers vides) :

```text
revisions-scolaires/
├── index.html                              # Catalogue général
├── css/
│   └── site.css                            # Style du catalogue uniquement
├── js/
│   └── catalogue.js                        # Métadonnées des activités disponibles
├── maths/
│   └── numeration/
│       └── changements-de-base/
│           ├── index.html                  # Application Mission binaire
│           ├── specification.md            # Source de vérité pédagogique V1.2
│           ├── css/
│           │   └── styles.css
│           └── js/
│               ├── data.js
│               ├── conversions.js
│               ├── exercises.js
│               ├── guides.js
│               ├── storage.js
│               └── app.js
├── tests/                                   # Tests de développement (facultatifs à l'exécution)
│   └── ...
├── AGENTS.md                                # Règles stables de contribution à destination de Codex
└── README.md                                # Architecture, tests, utilisation et publication
```

**Spécification versionnée :** conserver le présent document dans `maths/numeration/changements-de-base/specification.md`. Les autres modules pourront avoir leur propre `specification.md`. Le fichier `AGENTS.md` est facultatif pour l'exécution web mais recommandé pour que Codex garde les invariants techniques et pédagogiques à travers plusieurs tâches.

**Catalogue attendu en V1 :** une seule entrée, avec une URL relative depuis la racine `maths/numeration/changements-de-base/`. Éviter une dépendance descendante du module au catalogue : chaque module doit fonctionner même extrait du dépôt, avec l'ensemble de ses fichiers.

**Chargement attendu dans `<head>`** (ordre de référence) :

```html
<link rel="stylesheet" href="css/styles.css">
<script defer src="js/data.js"></script>
<script defer src="js/conversions.js"></script>
<script defer src="js/exercises.js"></script>
<script defer src="js/guides.js"></script>
<script defer src="js/storage.js"></script>
<script defer src="js/app.js"></script>
```

Les chemins du bloc précédent sont **relatifs au `index.html` du module**, non au `index.html` du catalogue. Les scripts chargés avec `defer` conservent l'ordre indiqué et s'exécutent après analyse du document HTML. Le HTML, le CSS et les JS doivent employer des chemins relatifs au répertoire de l'application. Vérifier que **tous les chemins restent valides** lors d'une publication dans un sous-répertoire (par exemple GitHub Pages pour un dépôt de projet).

### 7.2 Ergonomie et accessibilité

- Interface en français ; notations mathématiques lisibles et termes techniques explicités.
- Contraste suffisant, taille de texte confortable, boutons tactiles, navigation clavier, focus visible, libellés des champs, messages d'erreur annoncés sans dépendance à une couleur.
- Interactions RGB et pixels utilisables aussi au clavier ; alternative textuelle pour tous les pixels et changements de couleurs.
- Une sous-question à la fois si nécessaire ; ne pas masquer le contexte ni imposer des animations inutiles.
- Éviter que l'interface fournisse visuellement la réponse avant toute conversion.

### 7.3 Vérifications spécifiques à l'architecture globale

- Le catalogue expose **un seul module réel** (`maths/numeration/changements-de-base/`) avec la classification **Maths → Numération**.
- L'ouverture du module depuis le catalogue marche en racine de domaine et sous un préfixe de chemin ; aucune URL codée en dur avec un domaine.
- Le module reste autonome lorsqu'on copie son dossier ailleurs ; ses ressources sont chargées localement.
- Les identifiants de stockage de progression sont propres au module, pour éviter des collisions futures avec d'autres modules.
- Les nouveaux modules devront seulement ajouter leur entrée dans `js/catalogue.js` et disposer de leur propre dossier autonome.

### 7.4 Tests automatisés minimaux

Créer des tests unitaires hors distribution pour :

1. Convertisseurs de nombres 10→2, 2→10, 10→16, 16→10 et gestion des zéros de tête.
2. Correcteurs des **18 exercices**, incluant toutes les sous-questions, avec les réponses de la section 4.
3. Réponses invalides : champ vide, chiffre `2` en binaire, saisie `256` sur un octet, octet à sept chiffres là où huit sont requis, caractère hex invalide, `#RRGGBB` mal formé.
4. Compatibilité minuscules/majuscules pour les codes hexadécimaux ; gestion des espaces autorisés.
5. Reprise de progression après rechargement, état local absent/corrompu, remise à zéro.
6. Contrôles d'interaction : pixels et portes, ordre gauche/droite, indices, affichage sur demande des méthodes.

### 7.5 Tests manuels minimaux

- Parcours complet des 18 exercices sur ordinateur et sur écran mobile étroit.
- Validation de mauvaises réponses puis reprise, avec solution toujours masquée tant que non demandée.
- Ouverture et fermeture de chacune des cinq fiches sans perte de réponse.
- Redémarrage du navigateur, restauration de progression si stockage permis.
- Téléchargement du **dossier complet** puis ouverture locale de `index.html` en mode avion : l’interface, les exercices et les fiches doivent fonctionner sans requête réseau. Tester également la version servie par HTTP local.
- Contrôle de navigation clavier, du focus et des labels.
- Vérification des couleurs RGB `#FF8040`, `#7F00FF` et des huit pixels de l'exercice 5.

## 8. Critères d'acceptation de la V1.2

La V1 est acceptable si, et seulement si :

- la page d’accueil générale répertorie correctement l’unique premier module sous Maths → Numération et son lien fonctionne ;
- les 18 exercices ci-dessus sont disponibles, correctement regroupés, et leurs corrigés de référence sont validés ;
- les conversions et contraintes de taille sont respectées, y compris le **bit 0 à droite** ;
- les cinq fiches sont réellement interactives et contextualisées ;
- l'utilisateur peut obtenir un indice puis accéder sur demande à une solution détaillée ;
- les réponses et la progression restent disponibles après rechargement si le navigateur permet `localStorage` ;
- l’application fonctionne sans serveur applicatif, peut être publiée sur un hébergement statique et fonctionne hors ligne après téléchargement du dossier complet ;
- une batterie de tests automatisés démontre les cas corrects, incorrects et limites ;
- l'affichage mobile, l'accessibilité de base et la navigation ont été vérifiés manuellement.

## 9. Ordre de réalisation recommandé dans Codex

**Lot 1 — Prototype :** arborescence du dépôt extensible, catalogue racine avec une seule activité, module autonome, accueil du module, navigation, moteur d’exercices, série 1, fiches Méthodes et Pixels, validations et tests de la série 1. Fournir une capture d’écran ou une URL de prévisualisation pour validation ergonomique.

**Lot 2 — Contenu :** séries 2 et 3, fiches ASCII/RGB/IPv4, solutions et tests complets. Présenter la preview et un rapport de tests.

**Lot 3 — Finitions :** progression persistante, bilan, accessibilité, tests mobiles/hors ligne, vérification de tous les fichiers locaux, README de publication et déploiement de démonstration si un service est connecté.

### Instruction de transfert à Codex Cloud (première tâche, à copier)

> Tu travailles dans le dépôt GitHub `revisions-scolaires`. Lis en entier `maths/numeration/changements-de-base/specification.md`, qui constitue la spécification fonctionnelle V1.2 approuvée. Implémente **uniquement le lot 1** de la section 9 : (1) le catalogue du site statique à la racine, titre « Atelier Révisions », avec une seule entrée sous Maths → Numération → Changements de base ; (2) le module indépendant `maths/numeration/changements-de-base/` avec les six exercices de la série 1, leurs validations correctes, la navigation et les fiches « Méthodes » et « Pixels ». Adopte les fichiers locaux HTML/CSS/JavaScript natifs décrits en section 7, `defer`, chemins relatifs ; aucune API, aucun backend, CDN, framework, `fetch()` de données ni build nécessaire à l'exécution. Les fichiers peuvent être répartis pour rendre l'entretien du code simple. Crée un `AGENTS.md` minimal contenant les règles stables du dépôt et un `README.md` avec instructions de tests et d'aperçu local. Écris et exécute les tests unitaires des conversions et validations du lot 1, plus un contrôle des chemins du catalogue et des scripts. Si le navigateur automatisé est disponible, teste la version desktop et mobile et produis des captures d'écran ; sinon explique comment prévisualiser via un serveur statique local. **Arrête-toi au lot 1**, signale les limites éventuelles et présente les changements ainsi que les résultats des tests. Ne publie aucun site sur Internet et ne modifie pas la branche principale sans validation.

**Avant cette tâche**, le dépôt doit contenir au minimum le fichier `maths/numeration/changements-de-base/specification.md`, c'est-à-dire le présent document. Si tu utilises une autre localisation pour la spécification, adapte le chemin du prompt pour correspondre au dépôt réel.

### Prévisualisation et contrôles dans Codex Cloud

- Utiliser le dépôt GitHub existant ; ajouter la présente spécification versionnée au chemin prévu et préparer un environnement Codex Cloud avec accès à ce dépôt.
- Pour chaque lot, demander : changements de code, résultat des tests, éventuelles captures d'écran, points à vérifier manuellement.
- Pour une prévisualisation interactive partageable, créer un déploiement **de test** (branche / aperçu de déploiement) sur un hébergement de site statique. Les possibilités de preview intégrée varient selon les outils et permissions du compte ; ne pas présumer qu'une URL de preview sera fournie automatiquement par Codex Cloud.
- Faire valider le prototype de la série 1 avant de poursuivre les lots 2 et 3.
- Ne pas assimiler l'URL de prévisualisation à une publication finale autorisée.
