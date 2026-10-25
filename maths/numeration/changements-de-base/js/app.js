(function () {
  'use strict';
  const app = window.MissionBinaire;
  const screen = document.getElementById('screen');
  const main = document.getElementById('contenu');
  const notice = document.getElementById('storage-notice');
  const store = app.storage.createStore({
    getItem: key => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value)
  }, () => { notice.hidden = false; }, () => { document.getElementById('storage-recovery').hidden = false; });
  let state = store.load();
  let view = 'home';
  const confirmDialog = document.getElementById('confirm-dialog');
  app.guides.trapFocus(confirmDialog);
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
    wrapper.append(el('span', `${successes()} / ${app.data.length} réussis`, 'progress-label'));
    const meter = document.createElement('progress'); meter.max = app.data.length; meter.value = successes(); meter.setAttribute('aria-label', 'Exercices réussis dans les trois séries');
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
    const action = confirmedAction;
    confirmedAction = null; confirmTrigger = null;
    confirmDialog.close();
    // Save/reset immediately, even if the page is reloaded before the close event.
    if (action) action();
  });
  confirmDialog.addEventListener('close', () => {
    if (confirmDialog.open) return;
    if (confirmTrigger && confirmTrigger.isConnected) confirmTrigger.focus();
    confirmTrigger = null; confirmedAction = null;
  });
  document.getElementById('open-review').addEventListener('click', () => review());
  document.querySelectorAll('[data-guide]').forEach(node => node.addEventListener('click', () => app.guides.open(node.dataset.guide, node)));
  function home(moveFocus = true) {
    view = 'home'; document.title = 'Mission binaire — Répétition de maths'; screen.replaceChildren();
    const hero = el('section', undefined, 'module-hero');
    const copy = el('div');
    copy.append(el('p', 'BIENVENUE DANS L’ATELIER DES 0 ET DES 1', 'eyebrow'), el('h1', 'Mission binaire'), el('p', 'Répétition de maths', 'subtitle'), el('p', 'Et si tu apprenais à parler le langage des ordinateurs ? Des nombres aux pixels, explore ce que cachent les bits.', 'intro'));
    const stamp = el('div', undefined, 'hero-stamp'); stamp.setAttribute('aria-hidden', 'true');
    stamp.append(el('span', '0 1', 'stamp-bits'), el('span', 'LE DÉCLIC COMMENCE ICI'));
    hero.append(copy, stamp); screen.append(hero);
    const summary = el('div', undefined, 'home-summary');
    summary.append(el('p', '18 exercices · 3 séries · 5 fiches pour t’aider'), progress()); screen.append(summary);
    const heading = el('div', undefined, 'section-heading'); heading.append(el('h2', 'Une mission à la fois'), el('span', 'LES PREMIERS PAS', 'eyebrow')); screen.append(heading);
    const cards = el('div', undefined, 'series-grid');
    app.series.forEach(series => {
      const exercises = app.data.filter(ex => ex.series === series.number);
      const card = el('article', undefined, 'series-card active-series');
      card.dataset.series = series.number;
      const solved = exercises.filter(ex => state.records[ex.id].solved).length;
      const started = state.positions[series.number] !== (series.number - 1) * 6 || exercises.some(ex => {
        const record = state.records[ex.id];
        return Object.keys(record.answers).length || record.attempts || record.hints || record.solutionViewed;
      });
      card.append(el('span', String(series.number).padStart(2, '0'), 'series-number'),
        el('span', 'ACCÈS LIBRE', 'eyebrow'), el('h3', series.title), el('p', series.description),
        el('p', `${solved} / ${exercises.length} exercices réussis`, 'series-progress'),
        button(`${started ? 'Reprendre' : 'Commencer'} la série ${series.number} →`, () => exercise(state.positions[series.number])));
      cards.append(card);
    });
    screen.append(cards);
    screen.append(el('p', 'Toutes les séries sont accessibles : choisis ton point de départ, puis avance dans l’ordre qui te convient.', 'privacy'));
    app.series.forEach(series => {
      const map = el('section', undefined, 'exercise-map');
      map.append(el('h2', `Série ${series.number} — ${series.title}`));
      const list = el('ol', undefined, 'exercise-list');
      app.data.forEach((ex, i) => {
        if (ex.series !== series.number) return;
        const item = el('li'); const jump = button('', () => exercise(i), 'exercise-link');
        jump.append(el('span', String(ex.position).padStart(2, '0'), 'list-number'), el('span', ex.title),
          el('span', app.exercises.status(state.records[ex.id]), 'status'));
        item.append(jump); list.append(item);
      });
      map.append(list); screen.append(map);
    });
    const bottom = el('section', undefined, 'home-bottom');
    const tools = el('div'); tools.append(el('h2', 'Un coup de pouce ?'), el('p', 'Les fiches sont là pour manipuler et comprendre, sans enjeu de score.'));
    const actions = el('div', undefined, 'actions');
    Object.entries(app.guides.titles).forEach(([id, title]) => actions.append(button(`${title} →`, event => app.guides.open(id, event.currentTarget), 'button secondary')));
    tools.append(actions); bottom.append(tools);
    bottom.append(button('Recommencer ma progression', event => ask('Recommencer la progression ?', 'Tes réponses, tes indices et tes réussites des trois séries seront effacés sur ce navigateur.', () => { state = store.reset(); home(); }, event.currentTarget), 'text-button reset-button')); screen.append(bottom);
    screen.append(el('p', 'Tes réponses restent sur cet appareil et dans ce navigateur. Aucune donnée personnelle n’est collectée.', 'privacy'));
    if (moveFocus) focusScreen();
  }
  function review() {
    view = 'review'; document.title = 'Mon bilan — Mission binaire'; screen.replaceChildren();
    const result = app.exercises.review(state);
    const top = el('div', undefined, 'exercise-top');
    top.append(button('← Retour aux séries', () => home(), 'text-button'), progress()); screen.append(top);
    const hero = el('section', undefined, 'review-hero');
    hero.append(el('p', 'CHAQUE ESSAI FAIT AVANCER', 'eyebrow'), el('h1', 'Mon bilan'),
      el('p', 'Regarde le chemin parcouru, puis choisis ce que tu veux explorer ou revoir. Tu peux reprendre chaque exercice, à tout moment.', 'intro'),
      el('p', `${result.totals.attempted} / ${app.data.length} exercices tentés · ${result.totals.solved} / ${app.data.length} réussis`, 'review-counts'));
    screen.append(hero);
    const summary = el('dl', undefined, 'review-summary');
    Object.entries(app.exercises.reviewLabels).forEach(([category, label]) => {
      const tile = el('div', undefined, `review-tile ${category}`); tile.dataset.category = category;
      tile.append(el('dt', label), el('dd', String(result.totals[category]))); summary.append(tile);
    }); screen.append(summary);
    app.series.forEach(series => {
      const section = el('section', undefined, 'review-series');
      section.append(el('h2', `Série ${series.number} — ${series.title}`));
      const list = el('ol', undefined, 'review-list');
      result.items.filter(item => item.exercise.series === series.number).forEach(item => {
        const ex = item.exercise; const record = state.records[ex.id];
        const row = el('li', undefined, 'review-item'); row.dataset.exercise = ex.id;
        const copy = el('div', undefined, 'review-item-copy');
        const jump = button(`${ex.position}. ${ex.title}`, () => exercise(app.data.indexOf(ex)), 'text-button review-jump');
        const counts = el('p', `${record.attempts} validation(s) · ${record.hints} indice(s)${record.solutionViewed ? ' · solution déjà consultée' : ''}`, 'review-details');
        copy.append(jump, counts);
        if (item.needsPractice) {
          const advice = el('div', undefined, 'review-advice');
          advice.append(el('p', `À consolider : ${ex.label.toLocaleLowerCase('fr')}.`));
          [ex.guide, ...(ex.extraGuides || [])].forEach(id => advice.append(button(app.guides.titles[id], event => app.guides.open(id, event.currentTarget), 'guide-link')));
          copy.append(advice);
        }
        row.append(copy, el('span', item.label, `status ${item.category}`)); list.append(row);
      });
      section.append(list); screen.append(section);
    });
    screen.append(el('p', 'Les résultats restent dans ce navigateur, sur cet appareil. Ils ne sont ni envoyés ni synchronisés. Pour tout effacer, utilise « Recommencer ma progression » sur l’accueil.', 'privacy'));
    focusScreen();
  }
  function exercise(index) {
    view = 'exercise'; state.current = index;
    const ex = app.data[index]; const record = state.records[ex.id];
    document.title = `Série ${ex.series}, exercice ${ex.position} — Mission binaire`;
    state.positions[ex.series] = index; save(); screen.replaceChildren();
    const top = el('div', undefined, 'exercise-top');
    top.append(button('← Retour aux séries', () => home(), 'text-button'), progress()); screen.append(top);
    const tabs = el('nav', undefined, 'series-tabs'); tabs.setAttribute('aria-label', 'Choisir une série');
    app.series.forEach(series => {
      const tab = button(`Série ${series.number}`, () => exercise(state.positions[series.number]), 'series-tab');
      if (series.number === ex.series) tab.setAttribute('aria-current', 'true');
      tabs.append(tab);
    });
    screen.append(tabs);
    const navigation = el('nav', undefined, 'step-nav'); navigation.setAttribute('aria-label', `Exercices de la série ${ex.series}`);
    app.data.forEach((item, i) => {
      if (item.series !== ex.series) return;
      const step = button(String(item.position), () => exercise(i), 'step');
      step.setAttribute('aria-label', `Exercice ${item.position} : ${item.title}${state.records[item.id].solved ? ', réussi' : ''}`);
      if (i === index) step.setAttribute('aria-current', 'step');
      if (state.records[item.id].solved) step.classList.add('complete'); navigation.append(step);
    }); screen.append(navigation);
    const layout = el('div', undefined, 'exercise-layout'); const card = el('section', undefined, 'exercise-card');
    card.append(el('p', `SÉRIE ${ex.series} · EXERCICE ${ex.position}/6`, 'eyebrow'), el('h1', ex.title), el('p', ex.label, 'exercise-subtitle'), el('p', ex.statement, 'statement'));
    if (ex.introduction) card.insertBefore(el('p', ex.introduction, 'introduction'), card.querySelector('.statement'));
    const form = document.createElement('form'); form.noValidate = true;
    const fieldNodes = {};
    let updateDerived = () => {};
    const feedback = el('div', '', 'feedback'); feedback.id = 'feedback'; feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
    function edited() {
      record.solved = false; feedback.textContent = ''; feedback.className = 'feedback';
      Object.values(fieldNodes).forEach(({ error, input }) => { error.textContent = ''; input.removeAttribute('aria-invalid'); });
      updateDerived(); save(); refreshProgress();
    }
    ex.fields.forEach(field => {
      const group = el('div', undefined, 'field-group'); const error = el('p', '', 'field-error'); error.id = `error-${field.id}`;
      let input;
      if (field.type === 'pixels' || field.type === 'doors') {
        const doors = field.type === 'doors';
        input = document.createElement('fieldset'); input.className = 'pixel-fieldset';
        input.append(el('legend', field.label), el('p', doors ? 'Chaque porte commence indéterminée (?). Clique : ? → interdite (0) → autorisée (1) → interdite. Clavier : Tab puis Entrée ou Espace.' : 'Chaque case commence indéterminée (?). Clique : ? → noir (0) → blanc (1) → noir. Au clavier : Tab puis Entrée ou Espace.', 'field-help'));
        const grid = el('div', undefined, doors ? 'pixel-grid door-grid' : 'pixel-grid');
        if (!record.answers[field.id]) record.answers[field.id] = Array(8).fill(null);
        const pixels = record.answers[field.id];
        pixels.forEach((_, i) => {
          const column = el('div', undefined, 'pixel-column');
          const pixel = button('', () => { pixels[i] = pixels[i] === null ? 0 : 1 - pixels[i]; update(); edited(); }, 'pixel');
          function update() {
            const value = pixels[i]; pixel.textContent = value === null ? '?' : String(value);
            pixel.classList.toggle('white', value === 1); pixel.classList.toggle('black', value === 0);
            pixel.setAttribute('aria-describedby', error.id);
            pixel.setAttribute('aria-label', doors ? `Porte ${8 - i}, bit ${7 - i} : ${value === null ? 'indéterminée' : value ? 'autorisée, 1' : 'interdite, 0'}` : `Pixel ${i + 1} : ${value === null ? 'indéterminé' : value ? 'blanc, 1' : 'noir, 0'}`);
          }
          update(); column.append(pixel, el('span', doors ? `P${8 - i}` : String(i + 1), 'pixel-index')); grid.append(column);
        });
        input.append(grid, el('p', doors ? 'Gauche → droite : portes 8 à 1 · 0 = interdite · 1 = autorisée' : 'Gauche → droite · 0 = noir · 1 = blanc', 'field-help')); group.append(input);
      } else {
        const label = el('label', field.label); label.htmlFor = `answer-${field.id}`;
        input = document.createElement(field.type === 'choice' ? 'select' : 'input');
        if (field.type === 'choice') {
          const placeholder = el('option', 'Choisis une réponse'); placeholder.value = ''; input.append(placeholder);
          field.options.forEach(value => { const option = el('option', value); option.value = value; input.append(option); });
        } else {
          input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
          input.inputMode = ['decimal', 'binary'].includes(field.type) ? 'numeric' : 'text';
        }
        input.id = label.htmlFor; input.name = field.id; input.value = record.answers[field.id] || '';
        input.addEventListener(field.type === 'choice' ? 'change' : 'input', () => { record.answers[field.id] = input.value; edited(); });
        const helpText = field.type === 'binary' ? `${field.width ? 'Exactement 8 bits. ' : ''}Seulement 0 et 1 ; espaces entre groupes autorisés.`
          : field.type === 'hex' ? 'Deux caractères : 0 à 9 ou A à F. Majuscules et minuscules acceptées.'
          : field.type === 'color' ? 'Format #RRGGBB ; le # est facultatif. Majuscules et minuscules acceptées.'
          : field.type === 'word' ? 'Une lettre ou un mot, sans espace intérieur. Majuscules et minuscules acceptées.'
          : field.type === 'choice' ? 'Choisis dans la liste.' : 'Un nombre entier, sans unité.';
        const help = el('p', helpText, 'field-help'); help.id = `help-${field.id}`;
        input.setAttribute('aria-describedby', `${help.id} ${error.id}`); group.append(label, input, help);
      }
      if (field.type === 'pixels' || field.type === 'doors') { input.id = `answer-${field.id}`; input.setAttribute('aria-describedby', error.id); }
      group.append(error); fieldNodes[field.id] = { input, error }; form.append(group);
    });
    if (ex.id === 's3e2') {
      const derived = el('output', '', 'derived-address'); derived.setAttribute('aria-live', 'polite');
      updateDerived = () => {
        const octets = ['octet1', 'octet2', 'octet3', 'octet4'].map(id => {
          const value = app.conversions.fromBinary(record.answers[id], 8);
          return value === null ? '????????' : app.conversions.toBinary(value, 8);
        });
        derived.textContent = `b. Ton adresse binaire : ${octets.join('.')} (reconstituée, sans validation supplémentaire)`;
      };
      updateDerived(); form.append(derived);
    }
    const verify = el('button', 'Vérifier ma réponse ✓', 'button'); verify.type = 'submit'; form.append(verify, feedback);
    form.addEventListener('submit', event => {
      event.preventDefault(); record.attempts += 1;
      const result = app.exercises.check(ex, record.answers); record.solved = result.correct; save();
      Object.entries(fieldNodes).forEach(([id, nodes]) => {
        nodes.error.textContent = result.errors[id] || ''; nodes.input.setAttribute('aria-invalid', String(Boolean(result.errors[id])));
      });
      feedback.className = `feedback ${result.correct ? 'success' : 'retry'}`;
      feedback.textContent = result.correct ? `Bien joué ! ${app.exercises.solution(ex).at(-1)}`
        : `Pas encore. Vérifie les indications sous tes réponses, puis réessaie.${record.solutionViewed ? '' : ' La solution reste masquée.'}`;
      if (!result.correct) {
        const firstError = fieldNodes[Object.keys(result.errors)[0]].input;
        (firstError.querySelector('button') || firstError).focus();
      }
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
    divider.append(el('p', 'POUR COMPRENDRE', 'eyebrow'));
    [ex.guide, ...(ex.extraGuides || [])].forEach(id => divider.append(button(`${app.guides.titles[id]} →`, event => app.guides.open(id, event.currentTarget), 'guide-link')));
    aside.append(divider); layout.append(card, aside); screen.append(layout);
    const bottom = el('div', undefined, 'exercise-bottom');
    const previous = button('← Exercice précédent', () => exercise(index - 1), 'text-button'); previous.disabled = ex.position === 1;
    bottom.append(previous, button(ex.position === 6 ? 'Terminer la série →' : 'Exercice suivant →', () => ex.position === 6 ? review() : exercise(index + 1), 'button secondary')); screen.append(bottom);
    screen.append(el('p', 'Tu peux passer un exercice et y revenir à tout moment. Ici, pas de course au score.', 'privacy'));
    focusScreen();
  }
  function refreshProgress() {
    document.querySelectorAll('.progress-summary').forEach(node => node.replaceWith(progress()));
    if (view === 'exercise') {
      const series = app.data[state.current].series;
      const exercises = app.data.filter(ex => ex.series === series);
      document.querySelectorAll('.step-nav .step').forEach((node, i) => {
        const ex = exercises[i];
        node.classList.toggle('complete', state.records[ex.id].solved);
        node.setAttribute('aria-label', `Exercice ${ex.position} : ${ex.title}${state.records[ex.id].solved ? ', réussi' : ''}`);
      });
    }
  }
  home(false);
}());
