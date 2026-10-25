(function () {
  'use strict';
  const app = window.MissionBinaire;
  const screen = document.getElementById('screen');
  const main = document.getElementById('contenu');
  const notice = document.getElementById('storage-notice');
  const store = app.storage.createStore({
    getItem: key => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value)
  }, () => { notice.hidden = false; });
  let state = store.load();
  let view = 'home';
  const confirmDialog = document.getElementById('confirm-dialog');
  let confirmedAction;
  let confirmTrigger;
  const el = (tag, value, className) => {
    const node = document.createElement(tag); if (value !== undefined) node.textContent = value;
    if (className) node.className = className; return node;
  };
  const button = (label, action, className = 'button') => {
    const node = el('button', label, className); node.type = 'button'; node.addEventListener('click', action); return node;
  };
  const save = () => store.save(state);
  const successes = () => app.data.filter(ex => state.records[ex.id].solved).length;
  function focusScreen() { main.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function progress() {
    const wrapper = el('div', undefined, 'progress-summary');
    wrapper.append(el('span', `${successes()} / 6 réussis`, 'progress-label'));
    const meter = document.createElement('progress'); meter.max = 6; meter.value = successes(); meter.setAttribute('aria-label', 'Exercices réussis dans la série 1');
    wrapper.append(meter); return wrapper;
  }
  function ask(title, description, action, trigger) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-description').textContent = description;
    confirmedAction = action; confirmTrigger = trigger || document.activeElement;
    confirmDialog.showModal(); document.getElementById('cancel-confirm').focus();
  }
  document.getElementById('cancel-confirm').addEventListener('click', () => confirmDialog.close());
  document.getElementById('accept-confirm').addEventListener('click', () => {
    const action = confirmedAction; confirmDialog.close(); confirmedAction = null; if (action) action();
  });
  confirmDialog.addEventListener('close', () => { if (confirmTrigger && confirmTrigger.isConnected) confirmTrigger.focus(); });
  document.querySelectorAll('[data-guide]').forEach(node => node.addEventListener('click', () => app.guides.open(node.dataset.guide, node)));
  function home(moveFocus = true) {
    view = 'home'; screen.replaceChildren();
    const hero = el('section', undefined, 'module-hero');
    const copy = el('div');
    copy.append(el('p', 'BIENVENUE DANS L’ATELIER DES 0 ET DES 1', 'eyebrow'), el('h1', 'Mission binaire'), el('p', 'Répétition de maths', 'subtitle'), el('p', 'Et si tu apprenais à parler le langage des ordinateurs ? Des nombres aux pixels, explore ce que cachent les bits.', 'intro'));
    const stamp = el('div', undefined, 'hero-stamp'); stamp.setAttribute('aria-hidden', 'true');
    stamp.append(el('span', '0 1', 'stamp-bits'), el('span', 'LE DÉCLIC COMMENCE ICI'));
    hero.append(copy, stamp); screen.append(hero);
    const summary = el('div', undefined, 'home-summary');
    summary.append(el('p', '6 exercices disponibles · 1 série · 2 fiches pour t’aider'), progress()); screen.append(summary);
    const heading = el('div', undefined, 'section-heading'); heading.append(el('h2', 'Une mission à la fois'), el('span', 'LES PREMIERS PAS', 'eyebrow')); screen.append(heading);
    const cards = el('div', undefined, 'series-grid');
    const first = el('article', undefined, 'series-card active-series');
    first.append(el('span', '01', 'series-number'), el('span', 'À EXPLORER', 'eyebrow'), el('h3', 'Les fondamentaux'), el('p', 'Convertir, lire un octet, dessiner en pixels. Pose les premières briques.'), el('p', `${successes()} / 6 exercices réussis`, 'series-progress'));
    const started = state.current > 0 || app.data.some(ex => Object.keys(state.records[ex.id].answers).length || state.records[ex.id].attempts || state.records[ex.id].hints || state.records[ex.id].solutionViewed);
    first.append(button(started ? 'Reprendre la série →' : 'Commencer la série →', () => exercise(state.current))); cards.append(first);
    [['02', 'L’informatique au quotidien'], ['03', 'Défis et situations concrètes']].forEach(([number, title]) => {
      const card = el('article', undefined, 'series-card coming');
      card.append(el('span', number, 'series-number'), el('span', 'À VENIR', 'eyebrow'), el('h3', title), el('p', 'Cette série sera disponible plus tard. Pour le moment, place aux fondamentaux.')); cards.append(card);
    });
    screen.append(cards);
    const map = el('section', undefined, 'exercise-map'); map.append(el('h2', 'Ton parcours dans la série 1'));
    const list = el('ol', undefined, 'exercise-list');
    app.data.forEach((ex, i) => {
      const item = el('li'); const jump = button('', () => exercise(i), 'exercise-link');
      jump.append(el('span', String(i + 1).padStart(2, '0'), 'list-number'), el('span', ex.title), el('span', app.exercises.status(state.records[ex.id]), 'status')); item.append(jump); list.append(item);
    });
    map.append(list); screen.append(map);
    const bottom = el('section', undefined, 'home-bottom');
    const tools = el('div'); tools.append(el('h2', 'Un coup de pouce ?'), el('p', 'Les fiches sont là pour manipuler et comprendre, sans enjeu de score.'));
    const actions = el('div', undefined, 'actions'); actions.append(button('Guide des méthodes →', event => app.guides.open('methodes', event.currentTarget), 'button secondary'), button('Comprendre les pixels →', event => app.guides.open('pixels', event.currentTarget), 'button secondary')); tools.append(actions); bottom.append(tools);
    bottom.append(button('Recommencer ma progression', event => ask('Recommencer la progression ?', 'Tes réponses, tes indices et tes réussites de la série 1 seront effacés sur ce navigateur.', () => { state = store.reset(); home(); }, event.currentTarget), 'text-button reset-button')); screen.append(bottom);
    screen.append(el('p', 'Tes réponses restent sur cet appareil et dans ce navigateur. Aucune donnée personnelle n’est collectée.', 'privacy'));
    if (moveFocus) focusScreen();
  }
  function exercise(index) {
    view = 'exercise'; state.current = index; save(); screen.replaceChildren();
    const ex = app.data[index]; const record = state.records[ex.id];
    const top = el('div', undefined, 'exercise-top');
    top.append(button('← Retour aux séries', () => home(), 'text-button'), progress()); screen.append(top);
    const navigation = el('nav', undefined, 'step-nav'); navigation.setAttribute('aria-label', 'Exercices de la série 1');
    app.data.forEach((item, i) => {
      const step = button(String(i + 1).padStart(2, '0'), () => exercise(i), 'step');
      step.setAttribute('aria-label', `Exercice ${i + 1} : ${item.title}${state.records[item.id].solved ? ', réussi' : ''}`);
      if (i === index) step.setAttribute('aria-current', 'step');
      if (state.records[item.id].solved) step.classList.add('complete'); navigation.append(step);
    }); screen.append(navigation);
    const layout = el('div', undefined, 'exercise-layout'); const card = el('section', undefined, 'exercise-card');
    card.append(el('p', `SÉRIE 1 · EXERCICE ${index + 1}/6`, 'eyebrow'), el('h1', ex.title), el('p', ex.label, 'exercise-subtitle'), el('p', ex.statement, 'statement'));
    const form = document.createElement('form'); form.noValidate = true;
    const fieldNodes = {};
    const feedback = el('div', '', 'feedback'); feedback.id = 'feedback'; feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
    function edited() {
      record.solved = false; feedback.textContent = ''; feedback.className = 'feedback';
      Object.values(fieldNodes).forEach(({ error, input }) => { error.textContent = ''; input.removeAttribute('aria-invalid'); });
      save(); refreshProgress();
    }
    ex.fields.forEach(field => {
      const group = el('div', undefined, 'field-group'); const error = el('p', '', 'field-error'); error.id = `error-${field.id}`;
      let input;
      if (field.type === 'pixels') {
        input = document.createElement('fieldset'); input.className = 'pixel-fieldset';
        input.append(el('legend', field.label), el('p', 'Chaque case commence indéterminée (?). Clique : ? → noir (0) → blanc (1) → noir. Au clavier : Tab puis Entrée ou Espace.', 'field-help'));
        const grid = el('div', undefined, 'pixel-grid');
        if (!record.answers.pixels) record.answers.pixels = Array(8).fill(null);
        const pixels = record.answers.pixels;
        pixels.forEach((_, i) => {
          const column = el('div', undefined, 'pixel-column');
          const pixel = button('', () => { pixels[i] = pixels[i] === null ? 0 : 1 - pixels[i]; update(); edited(); }, 'pixel');
          function update() {
            const value = pixels[i]; pixel.textContent = value === null ? '?' : String(value);
            pixel.classList.toggle('white', value === 1); pixel.classList.toggle('black', value === 0);
            pixel.setAttribute('aria-label', `Pixel ${i + 1} : ${value === null ? 'indéterminé' : value ? 'blanc, 1' : 'noir, 0'}`);
          }
          update(); column.append(pixel, el('span', String(i + 1), 'pixel-index')); grid.append(column);
        });
        input.append(grid, el('p', 'Gauche → droite · 0 = noir · 1 = blanc', 'field-help')); group.append(input);
      } else {
        const label = el('label', field.label); label.htmlFor = `answer-${field.id}`;
        input = document.createElement('input'); input.type = 'text'; input.id = label.htmlFor; input.name = field.id;
        input.autocomplete = 'off'; input.spellcheck = false; input.inputMode = 'numeric'; input.value = record.answers[field.id] || '';
        input.addEventListener('input', () => { record.answers[field.id] = input.value; edited(); });
        const help = el('p', field.type === 'binary' ? `${field.width ? 'Exactement 8 bits. ' : ''}Seulement 0 et 1 ; espaces entre groupes autorisés.` : 'Un nombre entier, sans unité.', 'field-help'); help.id = `help-${field.id}`;
        input.setAttribute('aria-describedby', `${help.id} ${error.id}`); group.append(label, input, help);
      }
      if (field.type === 'pixels') input.setAttribute('aria-describedby', error.id);
      group.append(error); fieldNodes[field.id] = { input, error }; form.append(group);
    });
    const verify = el('button', 'Vérifier ma réponse ✓', 'button'); verify.type = 'submit'; form.append(verify, feedback);
    form.addEventListener('submit', event => {
      event.preventDefault(); record.attempts += 1;
      const result = app.exercises.check(ex, record.answers); record.solved = result.correct; save();
      Object.entries(fieldNodes).forEach(([id, nodes]) => {
        nodes.error.textContent = result.errors[id] || ''; nodes.input.setAttribute('aria-invalid', String(Boolean(result.errors[id])));
      });
      feedback.className = `feedback ${result.correct ? 'success' : 'retry'}`;
      feedback.textContent = result.correct ? `Bien joué ! ${app.exercises.solution(ex).at(-1)}` : 'Pas encore. Vérifie les indications sous tes réponses, puis réessaie. La solution reste masquée.';
      refreshProgress();
    });
    card.append(form);
    const solutionPanel = el('section', undefined, 'solution-panel'); solutionPanel.hidden = true; solutionPanel.id = 'solution';
    function showSolution() {
      solutionPanel.replaceChildren(el('h2', 'La méthode, pas à pas'));
      const steps = el('ol'); app.exercises.solution(ex).forEach(line => steps.append(el('li', line))); solutionPanel.append(steps, el('p', 'Tu peux toujours résoudre l’exercice toi-même et vérifier ta réponse.')); solutionPanel.hidden = false;
    }
    // Revealed content is restored only when it was explicitly requested before.
    if (record.solutionViewed) showSolution(); card.append(solutionPanel);
    const aside = el('aside', undefined, 'help-card'); aside.append(el('span', '✦', 'help-star'), el('p', 'CHERCHER, C’EST APPRENDRE', 'eyebrow'), el('h2', 'Un petit coup de pouce'), el('p', 'Prends ton temps. Tu peux essayer autant de fois que tu veux.'));
    const hints = el('div', undefined, 'hints'); hints.setAttribute('aria-live', 'polite');
    const hintButton = button('Un indice', () => { if (record.hints < ex.hints.length) record.hints += 1; save(); renderHints(); }, 'button secondary');
    function renderHints() {
      hints.replaceChildren(); ex.hints.slice(0, record.hints).forEach((hint, i) => hints.append(el('p', `Indice ${i + 1}. ${hint}`)));
      hintButton.disabled = record.hints >= ex.hints.length; hintButton.textContent = record.hints >= ex.hints.length ? 'Les deux indices sont affichés' : record.hints ? 'Un autre indice' : 'Un indice';
    }
    renderHints(); aside.append(hintButton, hints);
    const methodButton = button('Voir la méthode', event => ask('Afficher la solution détaillée ?', 'Le corrigé de cet exercice sera révélé. Il sera indiqué « solution consultée » jusqu’à ce que tu le résolves toi-même.', () => {
      record.solutionViewed = true; record.solved = false; save(); showSolution(); refreshProgress(); solutionPanel.setAttribute('tabindex', '-1'); solutionPanel.focus();
    }, event.currentTarget), 'text-button'); methodButton.setAttribute('aria-controls', 'solution'); aside.append(methodButton);
    const divider = el('div', undefined, 'help-divider');
    divider.append(el('p', 'POUR COMPRENDRE', 'eyebrow'), button(ex.guide === 'pixels' ? 'Comprendre les pixels →' : 'Guide des méthodes →', event => app.guides.open(ex.guide, event.currentTarget), 'guide-link'));
    aside.append(divider); layout.append(card, aside); screen.append(layout);
    const bottom = el('div', undefined, 'exercise-bottom');
    const previous = button('← Exercice précédent', () => exercise(index - 1), 'text-button'); previous.disabled = index === 0;
    bottom.append(previous, button(index === 5 ? 'Terminer la série →' : 'Exercice suivant →', () => index === 5 ? home() : exercise(index + 1), 'button secondary')); screen.append(bottom);
    screen.append(el('p', 'Tu peux passer un exercice et y revenir à tout moment. Ici, pas de course au score.', 'privacy'));
    focusScreen();
  }
  function refreshProgress() {
    document.querySelectorAll('.progress-summary').forEach(node => node.replaceWith(progress()));
    if (view === 'exercise') {
      document.querySelectorAll('.step-nav .step').forEach((node, i) => {
        node.classList.toggle('complete', state.records[app.data[i].id].solved);
        node.setAttribute('aria-label', `Exercice ${i + 1} : ${app.data[i].title}${state.records[app.data[i].id].solved ? ', réussi' : ''}`);
      });
    }
  }
  home(false);
}());
