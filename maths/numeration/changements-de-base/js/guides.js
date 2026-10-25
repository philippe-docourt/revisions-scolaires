(function () {
  'use strict';
  const app = window.MissionBinaire;
  const dialog = document.getElementById('guide-dialog');
  const content = document.getElementById('guide-content');
  const titles = { methodes: 'Guide des méthodes', pixels: 'Comprendre les pixels', ascii: 'Comprendre ASCII', rgb: 'Comprendre RGB', ip: 'Comprendre les adresses IP' };
  let returnFocus;
  function trapFocus(modal) {
    modal.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...modal.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')]
        .filter(node => node.getClientRects().length > 0);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
  trapFocus(dialog);
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
  function asciiGuide() {
    const section = text('section', '');
    section.append(text('p', 'Un caractère peut être associé à un nombre : son code. L’ASCII standard contient 128 codes, de 0 à 127, sur 7 bits. Un octet offre 256 combinaisons : il peut contenir un code ASCII avec un zéro initial, mais ASCII standard ne contient pas 256 caractères.'),
      text('h3', 'Une mini-table pour décoder'));
    const table = document.createElement('table'); table.className = 'ascii-table';
    table.append(text('caption', 'Quelques lettres de l’ASCII standard'));
    const head = document.createElement('thead'); const row = document.createElement('tr');
    ['Lettre', 'Décimal', 'Binaire sur 8 bits'].forEach(label => { const cell = text('th', label); cell.scope = 'col'; row.append(cell); }); head.append(row); table.append(head);
    const body = document.createElement('tbody');
    ['A', 'B', 'C', 'E', 'W'].forEach(letter => {
      const row = document.createElement('tr'); const code = app.conversions.asciiCode(letter);
      [letter, String(code), app.conversions.toBinary(code, 8)].forEach(value => row.append(text('td', value))); body.append(row);
    });
    table.append(body); section.append(table, text('p', 'Exemple résolu : A a le code 65 = 64 + 1. Sur un octet : 01000001. Inversement, 01000001₂ vaut 65, donc représente A.'), text('h3', 'Essaie un caractère'));
    const label = text('label', 'Un caractère ASCII imprimable'); label.htmlFor = 'ascii-character';
    const input = document.createElement('input'); input.id = label.htmlFor; input.type = 'text'; input.value = 'A'; input.autocomplete = 'off'; input.spellcheck = false;
    const output = document.createElement('output'); output.className = 'guide-output'; output.setAttribute('aria-live', 'polite');
    input.setAttribute('aria-describedby', 'ascii-result'); output.id = 'ascii-result';
    function update() {
      const code = app.conversions.asciiCode(input.value);
      input.setAttribute('aria-invalid', String(code === null));
      output.textContent = code === null ? 'Entre exactement un caractère ASCII imprimable (espace, lettre sans accent, chiffre ou ponctuation simple).' : `Code décimal : ${code} · Sur 8 bits : ${app.conversions.toBinary(code, 8)}`;
    }
    input.addEventListener('input', update); update(); section.append(label, input, output); return section;
  }
  function rgbGuide() {
    const section = text('section', '');
    section.append(text('p', 'Un écran additionne trois lumières : Rouge (R), Vert (G) et Bleu (B). Chaque intensité va de 0 à 255. Dans #RRGGBB, les deux premiers chiffres décrivent le rouge, les deux suivants le vert, les deux derniers le bleu.'),
      text('p', 'Exemple résolu : #336699 correspond à 33₁₆ = 3×16 + 3 = 51, 66₁₆ = 102 et 99₁₆ = 153. Pour convertir 51 en hexadécimal : 51 ÷ 16 = 3, reste 3, donc 33.'), text('h3', 'Mélange les trois lumières'));
    const values = [0, 0, 0]; const inputs = []; const labels = [];
    const swatch = text('div', '', 'color-swatch'); swatch.setAttribute('role', 'img');
    const output = document.createElement('output'); output.className = 'guide-output'; output.setAttribute('aria-live', 'polite');
    function update() {
      const code = '#' + values.map(value => app.conversions.toHex(value, 2)).join('');
      inputs.forEach((input, i) => {
        input.value = values[i]; input.setAttribute('aria-valuetext', `${values[i]} sur 255`);
        labels[i].textContent = `${['Rouge', 'Vert', 'Bleu'][i]} · ${values[i]} / 255 (${app.conversions.toHex(values[i], 2)})`;
      });
      output.textContent = `R = ${values[0]}, G = ${values[1]}, B = ${values[2]} · ${code}`;
      swatch.style.backgroundColor = code; swatch.setAttribute('aria-label', `Aperçu : ${code}, rouge ${values[0]}, vert ${values[1]}, bleu ${values[2]}`);
    }
    ['Rouge', 'Vert', 'Bleu'].forEach((name, i) => {
      const label = text('label', name); label.htmlFor = `rgb-${i}`;
      const input = document.createElement('input'); input.id = label.htmlFor; input.type = 'range'; input.min = 0; input.max = 255; input.step = 1; input.value = 0;
      input.addEventListener('input', () => { values[i] = Number(input.value); update(); });
      section.append(label, input); inputs.push(input); labels.push(label);
    });
    const presets = text('div', '', 'actions color-presets');
    [['Rouge', [255, 0, 0]], ['Vert', [0, 255, 0]], ['Bleu', [0, 0, 255]], ['Noir', [0, 0, 0]], ['Blanc', [255, 255, 255]]].forEach(([label, channels]) => {
      const button = text('button', label, 'button secondary'); button.type = 'button';
      button.addEventListener('click', () => { channels.forEach((value, i) => { values[i] = value; }); update(); }); presets.append(button);
    });
    update(); section.append(swatch, output, presets); return section;
  }
  function ipGuide() {
    const section = text('section', '');
    section.append(text('p', 'Une adresse IPv4 est représentée ici par quatre nombres de 0 à 255, séparés par des points. Chaque nombre se code séparément sur huit bits : un octet.'),
      text('p', 'Exemple résolu : 192.168.1.37 devient 11000000.10101000.00000001.00100101. Pour le dernier nombre : 37 = 32 + 4 + 1, donc 00100101 sur huit bits.'), text('h3', 'Convertis une adresse'));
    const inputs = []; const grid = text('div', '', 'ip-inputs');
    const output = document.createElement('output'); output.className = 'guide-output'; output.setAttribute('aria-live', 'polite');
    output.id = 'ip-result';
    function update() {
      const values = inputs.map(input => app.conversions.parseDecimal(input.value));
      const valid = values.every(value => value !== null && value <= 255);
      inputs.forEach((input, i) => input.setAttribute('aria-invalid', String(values[i] === null || values[i] > 255)));
      output.textContent = valid ? `${values.join('.')} → ${values.map(value => app.conversions.toBinary(value, 8)).join('.')}` : 'Chaque nombre doit être un entier de 0 à 255, sans signe ni exposant.';
    }
    [192, 168, 1, 37].forEach((value, i) => {
      const group = text('div', ''); const label = text('label', `Octet ${i + 1}`); label.htmlFor = `ip-${i}`;
      const input = document.createElement('input'); input.id = label.htmlFor; input.type = 'text'; input.inputMode = 'numeric'; input.value = String(value); input.setAttribute('aria-describedby', 'ip-result');
      input.addEventListener('input', update); inputs.push(input); group.append(label, input); grid.append(group);
    });
    update(); section.append(grid, output); return section;
  }
  function open(name, trigger) {
    returnFocus = trigger || document.activeElement;
    content.replaceChildren();
    document.getElementById('guide-title').textContent = titles[name] || titles.methodes;
    if (name === 'ascii') content.append(asciiGuide());
    else if (name === 'rgb') content.append(rgbGuide());
    else if (name === 'ip') content.append(ipGuide());
    else if (name === 'pixels') {
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
        text('p', 'Pour une composante RGB sur deux chiffres : 255 → FF, 128 → 80, 64 → 40. Tu retrouveras ces conversions dans les activités RGB.'));
    }
    dialog.showModal();
    document.getElementById('close-guide').focus();
  }
  function close() { dialog.close(); }
  document.getElementById('close-guide').addEventListener('click', close);
  document.getElementById('return-guide').addEventListener('click', close);
  dialog.addEventListener('close', () => { if (returnFocus && returnFocus.isConnected) returnFocus.focus(); });
  app.guides = { open, titles, trapFocus };
}());
