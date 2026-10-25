(function () {
  'use strict';
  const app = window.MissionBinaire;
  const c = app.conversions;
  function check(exercise, answers) {
    const errors = {};
    exercise.fields.forEach(field => {
      const answer = answers[field.id];
      if (field.type === 'pixels' || field.type === 'doors') {
        if (!Array.isArray(answer) || answer.length !== 8 || Array.from(answer).some(value => value !== 0 && value !== 1)) {
          errors[field.id] = field.type === 'doors' ? 'Choisis un état pour chacune des huit portes.' : 'Choisis une couleur pour chacun des huit pixels.';
        } else if (!answer.every((value, i) => value === field.expected[i])) {
          errors[field.id] = field.type === 'doors' ? 'Pas encore : vérifie les portes demandées, avec porte 1 = bit 0 à droite.' : 'Pas encore : vérifie l’ordre de gauche à droite, avec 0 = noir et 1 = blanc.';
        }
        if (field.type === 'doors' && !errors[field.id] && c.fromBinary(answers[field.binaryField], 8) !== c.fromBinary(answer.join(''), 8)) errors[field.id] = 'Vérifie la correspondance portes ↔ octet : porte n = bit n−1, porte 1 à droite.';
        return;
      }
      let value;
      switch (field.type) {
        case 'binary': value = c.fromBinary(answer, field.width); break;
        case 'hex': value = c.fromHex(answer, field.width); break;
        case 'color': value = c.parseColor(answer); break;
        case 'word': value = typeof answer === 'string' && /^[a-z]+$/i.test(answer.trim()) ? answer.trim().toUpperCase() : null; break;
        case 'choice': value = field.options.includes(answer) ? answer : null; break;
        default: value = c.parseDecimal(answer);
      }
      if (value === null) {
        errors[field.id] = field.type === 'binary'
          ? `Écris uniquement des 0 et des 1${field.width ? ', sur exactement ' + field.width + ' bits' : ''}. Les espaces entre groupes sont permis.`
          : field.type === 'hex' ? 'Écris exactement deux chiffres hexadécimaux : 0 à 9 ou A à F.'
          : field.type === 'color' ? 'Écris # suivi de six chiffres hexadécimaux (0 à 9, A à F).'
          : field.type === 'word' ? 'Écris la lettre ou le mot décodé, sans chiffre ni espace intérieur.'
          : field.type === 'choice' ? 'Choisis oui ou non.'
          : 'Écris un entier avec les chiffres 0 à 9, sans signe, unité ni exposant.';
      } else if (value !== field.expected) {
        errors[field.id] = exercise.id === 's1e6'
          ? 'Pas encore : chaque interrupteur double le nombre de configurations.'
          : field.type === 'hex' || field.type === 'color' ? 'Pas encore : vérifie les paires hexadécimales et l’ordre rouge, vert, bleu.'
          : field.type === 'word' ? 'Pas encore : convertis chaque octet, puis compare avec la mini-table ASCII.'
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
      case 's2e1': return [`173 = ${decomposition(173)}.`, `En plaçant ces poids sur huit bits : ${c.toBinary(173, 8)}₂.`];
      case 's2e2': return ['Les poids des 1 sont 128, 64, 8 et 2.', `11001010₂ = ${decomposition(202)} = ${c.fromBinary('11001010')}₁₀.`];
      case 's2e3': return [`B a le code 66 : 66 = ${decomposition(66)}, donc ${c.toBinary(66, 8)} sur huit bits.`, `01000011₂ = ${decomposition(67)} = 67 : la mini-table donne C.`];
      case 's2e4': return [...['01010111', '01000101', '01000010'].map(bits => { const value = c.fromBinary(bits); return `${bits}₂ = ${decomposition(value)} = ${value} → ${String.fromCharCode(value)}.`; }), 'Les lettres, dans l’ordre, donnent WEB.'];
      case 's2e5': return [`11111110₂ = ${decomposition(254)} = 254.`, `Un objet supplémentaire donne 255 = ${c.toBinary(255, 8)}₂.`, 'Huit bits offrent 2⁸ = 256 configurations, mais elles comprennent zéro : de 0 à 255. 256 s’écrit 100000000₂ et nécessite neuf bits.'];
      case 's2e6': return [...[255, 128, 64].map((value, i) => `${['Rouge', 'Vert', 'Bleu'][i]} : ${value} ÷ 16 = ${Math.floor(value / 16)}, reste ${value % 16}. En hexadécimal : ${c.toHex(value, 2)}.`), `Dans l’ordre RR GG BB : #${[255, 128, 64].map(value => c.toHex(value, 2)).join('')}.`];
      case 's3e1': return [`300 = ${decomposition(300)}, donc ${c.toBinary(300)}₂.`, 'Non : huit bits représentent au maximum 255. Il faut 9 bits, car 256 ≤ 300 < 512.'];
      case 's3e2': return [...[192, 168, 1, 37].map(value => `${value} = ${decomposition(value)} → ${c.toBinary(value, 8)}.`), `L’adresse binaire est ${[192, 168, 1, 37].map(value => c.toBinary(value, 8)).join('.')}.`, `Pour le deuxième ordinateur : 00101100₂ = ${decomposition(44)} = 44.`];
      case 's3e3': return ['Porte 2 → bit 1 → poids 2 ; porte 4 → bit 3 → poids 8 ; porte 7 → bit 6 → poids 64.', `On obtient 64 + 8 + 2 = 74, soit ${c.toBinary(74, 8)}₂. La porte 1 est à droite.`, `La porte 6 ajoute le poids 32 : 74 + 32 = 106, soit ${c.toBinary(106, 8)}₂.`];
      case 's3e4': return ['En partant de la droite avec le bit 0, la différence est au bit 4, de poids 2⁴ = 16.', `10110110₂ = ${decomposition(182)} = 182.`, `10100110₂ = ${decomposition(166)} = 166. La différence vaut 182 − 166 = 16.`];
      case 's3e5': return ['Sépare #7F00FF en 7F, 00 et FF : rouge, vert, bleu.', `Rouge : 7×16 + 15 = ${c.fromHex('7F')}. Vert : 0×16 + 0 = ${c.fromHex('00')}. Bleu : 15×16 + 15 = ${c.fromHex('FF')}.`];
      case 's3e6': return [`10100101₂ = ${decomposition(165)} = 165.`, 'Ajoute les 10 unités décimales : 165 + 10 = 175.', `175 = ${decomposition(175)}, donc ${c.toBinary(175, 8)} sur huit bits.`];
      default: throw new Error('Exercice inconnu');
    }
  }
  function status(record) {
    if (record.solved) return record.hints > 0 || record.attempts > 1 || record.solutionViewed ? 'Réussi après aide ou tentative' : 'Réussi sans aide';
    if (record.solutionViewed) return 'Solution consultée';
    return record.attempts ? 'En cours' : 'À explorer';
  }
  const reviewLabels = {
    independent: 'Réussi sans aide',
    supported: 'Réussi après indice ou tentative',
    revealed: 'Solution consultée',
    unfinished: 'Pas encore terminé'
  };
  function review(state) {
    const totals = { independent: 0, supported: 0, revealed: 0, unfinished: 0, attempted: 0, solved: 0 };
    const items = app.data.map(exercise => {
      const record = state.records[exercise.id];
      const category = record.solved
        ? (record.hints || record.attempts > 1 || record.solutionViewed ? 'supported' : 'independent')
        : (record.solutionViewed ? 'revealed' : 'unfinished');
      totals[category] += 1;
      if (record.attempts > 0) totals.attempted += 1;
      if (record.solved) totals.solved += 1;
      const needsPractice = category === 'supported' || category === 'revealed' ||
        (!record.solved && (record.attempts > 0 || record.hints > 0));
      return { exercise, category, label: reviewLabels[category], needsPractice };
    });
    return { items, totals };
  }
  app.exercises = { check, solution, decomposition, divisions, status, review, reviewLabels };
}());
