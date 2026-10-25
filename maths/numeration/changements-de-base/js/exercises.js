(function () {
  'use strict';
  const app = window.MissionBinaire;
  const c = app.conversions;
  function check(exercise, answers) {
    const errors = {};
    exercise.fields.forEach(field => {
      const answer = answers[field.id];
      if (field.type === 'pixels') {
        if (!Array.isArray(answer) || answer.length !== 8 || Array.from(answer).some(value => value !== 0 && value !== 1)) {
          errors[field.id] = 'Choisis une couleur pour chacun des huit pixels.';
        } else if (!answer.every((value, i) => value === field.expected[i])) {
          errors[field.id] = 'Pas encore : vérifie l’ordre de gauche à droite, avec 0 = noir et 1 = blanc.';
        }
        return;
      }
      const value = field.type === 'binary' ? c.fromBinary(answer, field.width) : c.parseDecimal(answer);
      if (value === null) {
        errors[field.id] = field.type === 'binary'
          ? `Écris uniquement des 0 et des 1${field.width ? ', sur exactement ' + field.width + ' bits' : ''}. Les espaces entre groupes sont permis.`
          : 'Écris un entier avec les chiffres 0 à 9, sans signe, unité ni exposant.';
      } else if (value !== field.expected) {
        errors[field.id] = exercise.id === 's1e6'
          ? 'Pas encore : chaque interrupteur double le nombre de configurations.'
          : 'Pas encore : vérifie les poids des bits et ta conversion.';
      }
    });
    return { correct: Object.keys(errors).length === 0, errors };
  }
  function decomposition(value) {
    return Array.from(c.toBinary(value)).map((bit, i, bits) => bit === '1' ? 2 ** (bits.length - 1 - i) : 0).filter(Boolean).join(' + ') || '0';
  }
  function divisions(value) {
    const rows = [];
    do { const quotient = Math.floor(value / 2); rows.push(`${value} ÷ 2 = ${quotient}, reste ${value % 2}`); value = quotient; } while (value > 0);
    return rows;
  }
  function solution(exercise) {
    switch (exercise.id) {
      case 's1e1': return [...divisions(23), `Lis les restes de bas en haut : ${c.toBinary(23)}₂. Vérification : 23 = ${decomposition(23)}.`];
      case 's1e2': return ['Les six poids, de gauche à droite : 32, 16, 8, 4, 2, 1.', `101101₂ = ${decomposition(45)} = ${c.fromBinary('101101')}₁₀.`];
      case 's1e3': return [`86 = ${decomposition(86)}. On obtient ${c.toBinary(86)} sur sept bits.`, `Complète à gauche par un zéro : ${c.toBinary(86, 8)}. Ce zéro ne change pas la valeur.`];
      case 's1e4': return [`00110101₂ = ${decomposition(53)} = ${c.fromBinary('00110101')}₁₀.`, 'Le capteur indique donc 53 °C, selon la convention donnée dans cet exercice.'];
      case 's1e5': return [`45 = ${decomposition(45)}, donc ${c.toBinary(45, 8)} sur huit bits.`, 'De gauche à droite : noir, noir, blanc, noir, blanc, blanc, noir, blanc.', 'Les quatre bits à 1 correspondent à 4 pixels blancs.'];
      case 's1e6': return [`Avec cinq interrupteurs : 2 × 2 × 2 × 2 × 2 = 2⁵ = ${2 ** 5} configurations.`, `Avec huit interrupteurs : 2⁸ = ${2 ** 8} configurations. Chaque interrupteur a deux choix indépendants.`];
      default: throw new Error('Exercice inconnu');
    }
  }
  function status(record) {
    if (record.solved) return record.hints > 0 || record.attempts > 1 || record.solutionViewed ? 'Réussi après aide ou tentative' : 'Réussi sans aide';
    if (record.solutionViewed) return 'Solution consultée';
    return record.attempts ? 'En cours' : 'À explorer';
  }
  app.exercises = { check, solution, decomposition, divisions, status };
}());
