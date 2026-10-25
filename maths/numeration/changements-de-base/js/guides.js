(function () {
  'use strict';
  const app = window.MissionBinaire;
  const dialog = document.getElementById('guide-dialog');
  const content = document.getElementById('guide-content');
  let returnFocus;
  const text = (tag, value, className) => {
    const node = document.createElement(tag); node.textContent = value;
    if (className) node.className = className;
    return node;
  };
  function bitPlayground(pixels) {
    const section = document.createElement('section'); section.className = 'playground';
    section.append(text('h3', pixels ? 'À toi de dessiner' : 'Manipule les poids'),
      text('p', 'Cette zone est un bac à sable : elle ne change ni tes réponses ni ta progression.'));
    const grid = document.createElement('div'); grid.className = 'bit-grid';
    const bits = Array(8).fill(0);
    const output = document.createElement('output'); output.className = 'bit-output'; output.setAttribute('aria-live', 'polite');
    const buttons = [];
    const update = () => {
      buttons.forEach((button, i) => {
        button.textContent = String(bits[i]); button.classList.toggle('on', bits[i] === 1);
        button.setAttribute('aria-pressed', String(bits[i] === 1));
        button.setAttribute('aria-label', pixels ? `Pixel ${i + 1} : ${bits[i] ? 'blanc, 1' : 'noir, 0'}` : `Bit ${7 - i}, poids ${2 ** (7 - i)} : ${bits[i]}`);
      });
      const binary = bits.join('');
      output.textContent = `${binary}₂ = ${app.conversions.fromBinary(binary)}₁₀${pixels ? ` · ${bits.filter(Boolean).length} pixel(s) blanc(s)` : ''}`;
    };
    bits.forEach((_, i) => {
      const column = document.createElement('div'); column.className = 'bit-column';
      const button = document.createElement('button'); button.type = 'button'; button.className = pixels ? 'pixel demo-pixel' : 'bit-toggle';
      button.addEventListener('click', () => { bits[i] = 1 - bits[i]; update(); });
      column.append(text('span', pixels ? String(i + 1) : String(2 ** (7 - i)), 'bit-weight'), button);
      grid.append(column); buttons.push(button);
    });
    update(); section.append(grid, output);
    return section;
  }
  function open(name, trigger) {
    returnFocus = trigger || document.activeElement;
    content.replaceChildren();
    const pixels = name === 'pixels';
    document.getElementById('guide-title').textContent = pixels ? 'Comprendre les pixels' : 'Guide des méthodes';
    if (pixels) {
      content.append(text('p', 'Un pixel est un petit point d’une image. Dans nos lignes à huit pixels, 0 signifie noir et 1 signifie blanc. Le premier bit à gauche représente le pixel le plus à gauche.'),
        text('h3', 'Un motif et un nombre'),
        text('p', 'Exemple résolu : 10000001₂ représente blanc, noir, noir, noir, noir, noir, noir, blanc. Comme nombre, il vaut 128 + 1 = 129₁₀.'),
        text('p', 'Une même suite de bits peut donc décrire un dessin ou une quantité. Ici, un bit décrit seulement noir ou blanc : ce n’est pas un code couleur RGB complet.'), bitPlayground(true));
    } else {
      content.append(text('p', 'En base 2, on utilise seulement 0 et 1. Le bit 0, tout à droite, a le poids 1. Vers la gauche, chaque poids double : 1, 2, 4, 8, 16, 32, 64, 128.'),
        text('h3', 'Du décimal au binaire : diviser par 2'), text('p', 'Exemple résolu : 23₁₀ → 10111₂. Divise par 2 jusqu’à obtenir un quotient nul et conserve chaque reste.'));
      const list = document.createElement('ol'); app.exercises.divisions(23).forEach(row => list.append(text('li', row))); content.append(list,
        text('p', 'Lis les restes du bas vers le haut : 10111₂. Autre méthode : 23 = 16 + 4 + 2 + 1.'),
        text('h3', 'Du binaire au décimal : additionner les poids'),
        text('p', '10111₂ = 1×16 + 0×8 + 1×4 + 1×2 + 1×1 = 23₁₀. Seules les positions contenant 1 contribuent à la somme.'),
        text('h3', 'Huit bits font un octet'),
        text('p', '10111 devient 00010111 sur exactement huit bits : les zéros ajoutés à gauche ne changent pas sa valeur. Un octet non signé a 2⁸ = 256 combinaisons, de 0 à 255.'),
        bitPlayground(false),
        text('h3', 'Un aperçu de la base 16'),
        text('p', 'Les chiffres hexadécimaux sont 0 à 9 puis A=10, B=11, C=12, D=13, E=14, F=15. Exemple : FF₁₆ = 15×16 + 15 = 255₁₀. Inversement, 255 ÷ 16 donne 15, reste 15 : FF.'),
        text('p', 'Pour une composante RGB sur deux chiffres : 255 → FF, 128 → 80, 64 → 40. Ce sont des exemples de méthode ; les activités RGB viendront dans une prochaine série.'));
    }
    dialog.showModal();
    document.getElementById('close-guide').focus();
  }
  function close() { dialog.close(); }
  document.getElementById('close-guide').addEventListener('click', close);
  document.getElementById('return-guide').addEventListener('click', close);
  dialog.addEventListener('close', () => { if (returnFocus && returnFocus.isConnected) returnFocus.focus(); });
  app.guides = { open };
}());
