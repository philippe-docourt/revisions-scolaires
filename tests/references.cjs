'use strict';
// Réponses de référence indépendantes des données de l’application (spécification §4).
module.exports = [
  { binary: '10111' }, { decimal: '45' }, { binary: '01010110' }, { decimal: '53' },
  { binary: '00101101', pixels: [0, 0, 1, 0, 1, 1, 0, 1], white: '4' }, { five: '32', eight: '256' },
  { binary: '10101101' }, { decimal: '202' }, { binary: '01000010', letter: 'C' },
  { first: '87', second: '69', third: '66', word: 'WEB' },
  { decimal: '254', next: '11111111', combinations: '256', minimum: '0', maximum: '255' },
  { red: 'FF', green: '80', blue: '40', color: '#FF8040' },
  { binary: '100101100', fits: 'non', bits: '9' },
  { octet1: '11000000', octet2: '10101000', octet3: '00000001', octet4: '00100101', decimal: '44' },
  { doors: [0, 1, 0, 0, 1, 0, 1, 0], binary: '01001010', decimal: '74', newDoors: [0, 1, 1, 0, 1, 0, 1, 0], newBinary: '01101010', newDecimal: '106' },
  { bit: '4', sent: '182', received: '166', difference: '16' }, { red: '127', green: '0', blue: '255' },
  { original: '165', updated: '175', binary: '10101111' }
];
