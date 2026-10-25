(function () {
  'use strict';
  const app = window.MissionBinaire = {};
  app.data = [
    { id: 's1e1', title: 'Du décimal au binaire', label: 'Conversion décimal → binaire',
      statement: 'Convertis 23₁₀ (23 en base dix) en base 2. Tu peux procéder par divisions successives par 2.',
      fields: [{ id: 'binary', label: '23 en binaire', type: 'binary', expected: 23 }], guide: 'methodes',
      hints: ['Décompose 23 en puissances de deux ou divise successivement par 2.', 'Note le reste de chaque division par 2, puis lis les restes du bas vers le haut.'] },
    { id: 's1e2', title: 'Déchiffrer les bits', label: 'Conversion binaire → décimal',
      statement: 'Convertis 101101₂ (101101 en base deux) en base 10 à l’aide des puissances de 2.',
      fields: [{ id: 'decimal', label: 'Valeur décimale', type: 'decimal', expected: 45 }], guide: 'methodes',
      hints: ['Les poids de droite à gauche sont 1, 2, 4, 8, 16, 32.', 'Additionne seulement les poids des positions où tu lis un 1.'] },
    { id: 's1e3', title: 'Un nombre, un octet', label: 'Écrire sur exactement huit bits',
      statement: 'Un ordinateur doit stocker le nombre décimal 86 sur exactement huit bits. Quelle séquence faut-il écrire ?',
      fields: [{ id: 'binary', label: '86 en binaire sur exactement 8 bits', type: 'binary', width: 8, expected: 86 }], guide: 'methodes',
      hints: ['Commence avec un zéro à gauche si tu n’utilises que sept bits.', 'Teste les poids 128, 64, 32, 16, 8, 4, 2 et 1 dans cet ordre.'] },
    { id: 's1e4', title: 'Le thermomètre numérique', label: 'Lire la valeur d’un capteur',
      statement: 'Un capteur de température transmet 00110101₂ (en base deux) sur un octet. Dans cet exercice, sa valeur est directement exprimée en degrés Celsius. Quelle température décimale indique-t-il ?',
      fields: [{ id: 'decimal', label: 'Température en °C (nombre entier)', type: 'decimal', expected: 53 }], guide: 'methodes',
      hints: ['Additionne les poids des positions contenant 1.', 'Les zéros de gauche ne changent pas la valeur du nombre.'] },
    { id: 's1e5', title: 'Dessiner avec des bits', label: 'Une ligne de huit pixels',
      statement: 'Un ordinateur enregistre une ligne de huit pixels sous la valeur décimale 45. Ici, 0 = pixel noir et 1 = pixel blanc. Le premier bit à gauche décrit le premier pixel à gauche.',
      fields: [{ id: 'binary', label: 'a. 45 en binaire sur exactement 8 bits', type: 'binary', width: 8, expected: 45 },
        { id: 'pixels', label: 'b. Colorie les huit pixels selon ton code', type: 'pixels', expected: [0, 0, 1, 0, 1, 1, 0, 1] },
        { id: 'white', label: 'c. Combien de pixels sont blancs ?', type: 'decimal', expected: 4 }], guide: 'pixels',
      hints: ['Écris d’abord les huit bits ; ensuite, chaque 1 devient blanc.', 'Lis ton code de gauche à droite et compte uniquement les pixels correspondant aux 1.'] },
    { id: 's1e6', title: 'Combien de possibilités ?', label: 'Combinaisons d’interrupteurs',
      statement: 'Cinq interrupteurs peuvent chacun valoir 0 ou 1. Combien de configurations différentes sont possibles ? Et avec huit interrupteurs ?',
      fields: [{ id: 'five', label: 'Avec 5 interrupteurs', type: 'decimal', expected: 32 }, { id: 'eight', label: 'Avec 8 interrupteurs', type: 'decimal', expected: 256 }], guide: 'methodes',
      hints: ['Chaque interrupteur double le nombre de configurations.', 'Pour n interrupteurs, multiplie 2 par lui-même n fois : c’est 2 à la puissance n.'] }
  ];
}());
