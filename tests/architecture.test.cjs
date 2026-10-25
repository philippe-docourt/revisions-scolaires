'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { root, moduleRoot, load } = require('./helpers.cjs');
function files(directory) { return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]); }
test('Chemins HTML : toutes les ressources sont locales et existent', () => {
  for (const file of [path.join(root, 'index.html'), path.join(moduleRoot, 'index.html')]) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /<html lang="fr">/);
    for (const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
      const target = match[1]; assert.doesNotMatch(target, /^(?:[a-z]+:|\/)/i);
      assert.equal(fs.existsSync(path.resolve(path.dirname(file), target)), true, target);
    }
    for (const script of html.matchAll(/<script\b([^>]*)>/g)) {
      assert.match(script[1], /\bdefer\b/); assert.doesNotMatch(script[1], /type\s*=/);
    }
  }
});
test('Ordre des scripts classiques et autonomie du module', () => {
  const html = fs.readFileSync(path.join(moduleRoot, 'index.html'), 'utf8');
  assert.deepEqual([...html.matchAll(/<script defer src="js\/([^\"]+)"/g)].map(match => match[1]), ['data.js', 'conversions.js', 'exercises.js', 'guides.js', 'storage.js', 'app.js']);
  for (const file of files(moduleRoot).filter(file => /\.(js|css|html)$/.test(file))) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /(?:fetch\s*\(|XMLHttpRequest|https?:\/\/|\.\.\/|\bimport\s)/, file);
  }
  assert.equal(load().data.length, 18);
  assert.deepEqual(Object.keys(load().storage.empty().records), Array.from({ length: 18 }, (_, i) => `s${Math.floor(i / 6) + 1}e${i % 6 + 1}`));
});
test('Catalogue : une seule activité réelle, classée Maths → Numération', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); assert.match(html, /Atelier Révisions/);
  const source = fs.readFileSync(path.join(root, 'js/catalogue.js'), 'utf8').split("  const container =")[0] + '}());';
  const context = vm.createContext({ window: {} }); vm.runInContext(source, context);
  const catalogue = context.window.AtelierRevisions.catalogue; assert.equal(catalogue.length, 1);
  const activity = catalogue[0];
  for (const key of ['id', 'titre', 'matiere', 'theme', 'niveau', 'tags', 'chemin']) assert.ok(activity[key]);
  assert.equal(activity.matiere, 'Maths'); assert.equal(activity.theme, 'Numération');
  assert.equal(activity.nombreExercices, 18); assert.equal(activity.chemin, 'maths/numeration/changements-de-base/');
  assert.ok(fs.existsSync(path.join(root, activity.chemin, 'index.html')));
  assert.doesNotMatch(source, /expected|solution|answers/);
});
