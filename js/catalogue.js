(function () {
  'use strict';
  const site = window.AtelierRevisions = {};
  site.catalogue = [{
    id: 'changements-de-base', titre: 'Changements de base', matiere: 'Maths', theme: 'Numération',
    niveau: 'Scolarité obligatoire · Découverte', tags: ['Binaire', 'Conversions', 'Pixels'],
    chemin: 'maths/numeration/changements-de-base/', nombreExercices: 18,
    description: 'Entre dans Mission binaire : apprends à lire les 0 et les 1, convertis des nombres et dessine avec des pixels.'
  }];
  const container = document.getElementById('catalogue');
  const text = (tag, value, className) => {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    return element;
  };
  const subjects = new Map();
  site.catalogue.forEach(activity => {
    if (!subjects.has(activity.matiere)) subjects.set(activity.matiere, new Map());
    const themes = subjects.get(activity.matiere);
    if (!themes.has(activity.theme)) themes.set(activity.theme, []);
    themes.get(activity.theme).push(activity);
  });
  subjects.forEach((themes, subject) => {
    const section = document.createElement('section');
    section.className = 'subject';
    section.append(text('h3', subject, 'subject-title'));
    themes.forEach((activities, theme) => {
      section.append(text('h4', theme, 'theme-title'));
      activities.forEach(activity => {
        const card = document.createElement('article'); card.className = 'activity-card';
        const art = text('div', '01', 'card-art'); art.setAttribute('aria-hidden', 'true');
        const content = text('div', '', 'card-content');
        content.append(text('p', activity.niveau, 'eyebrow'), text('h5', activity.titre), text('p', activity.description));
        const tags = text('ul', '', 'tags');
        activity.tags.forEach(tag => tags.append(text('li', tag)));
        content.append(tags);
        const action = text('div', '', 'card-action');
        action.append(text('p', `${activity.nombreExercices} exercices · 3 séries`));
        const link = text('a', 'Ouvrir l’activité →', 'button'); link.href = activity.chemin;
        action.append(link); card.append(art, content, action); section.append(card);
      });
    });
    container.append(section);
  });
}());
