'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const app = load();
const c = app.conversions;
const references = [
  { binary: '10111' }, { decimal: '45' }, { binary: '01010110' }, { decimal: '53' },
  { binary: '00101101', pixels: [0, 0, 1, 0, 1, 1, 0, 1], white: '4' }, { five: '32', eight: '256' }
];
test('10↔2 et 10↔16 : tous les octets, avec remplissage et aller-retour', () => {
  for (let value = 0; value <= 255; value += 1) {
    assert.equal(c.fromBinary(c.toBinary(value)), value);
    assert.equal(c.toBinary(value, 8).length, 8);
    assert.equal(c.fromBinary(c.toBinary(value, 8), 8), value);
    assert.equal(c.toHex(value, 2).length, 2);
    assert.equal(c.fromHex(c.toHex(value, 2), 2), value);
  }
  assert.equal(c.toBinary(23), '10111');
  assert.equal(c.toBinary(86, 8), '01010110');
  assert.equal(c.toBinary(45, 8), '00101101');
  assert.equal(c.fromBinary(' 000 10111 '), 23);
  assert.equal(c.fromBinary(' 0101 0110 ', 8), 86);
  assert.equal(c.fromHex(' fF ', 2), 255);
  assert.equal(c.toHex(128, 2), '80');
  assert.equal(c.fromHex('7f'), 127);
  assert.equal(c.toBinary(0, 8), '00000000');
});
test('Formats invalides et bornes : aucune troncature ni approximation', () => {
  for (const value of ['', ' ', '10201', '-1', '+1', '0b101', '1e1', '1.0', '①', null, 101]) assert.equal(c.fromBinary(value), null);
  for (const value of ['', '-1', '+45', '4 5', '45°C', '1e2', '2.0', '0xFF', '9007199254740992']) assert.equal(c.parseDecimal(value), null);
  assert.equal(c.parseDecimal(' 00045 '), 45);
  assert.equal(c.fromBinary('1010110', 8), null);
  assert.equal(c.fromBinary('100000000', 8), null);
  assert.equal(c.fromBinary('010101100', 8), null);
  for (const value of ['', 'GG', '#FF', '#RRGGBB', 'f f', 'FF804', 'FF804Z']) assert.equal(c.fromHex(value, 2), null);
  assert.equal(c.fromHex('f', 2), null);
  assert.equal(c.fromBinary('1'.repeat(54)), null);
  assert.equal(c.fromHex('FFFFFFFFFFFFFF'), null);
  assert.equal(c.fromBinary('0'.repeat(80) + '1'), 1);
  assert.equal(c.fromBinary('1'.repeat(53)), Number.MAX_SAFE_INTEGER);
  for (const value of [-1, 1.5, NaN, Infinity, '23', Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => c.toBinary(value)); assert.throws(() => c.toHex(value));
  }
  assert.throws(() => c.toBinary(256, 8));
  assert.throws(() => c.toBinary(1, 0));
  assert.throws(() => c.toHex(256, 2));
});
app.data.forEach((ex, index) => {
  test(`Série 1, exercice ${index + 1} : référence approuvée et sous-questions obligatoires`, () => {
    assert.equal(app.exercises.check(ex, references[index]).correct, true);
    assert.equal(app.exercises.check(ex, {}).correct, false);
    ex.fields.forEach(field => {
      const incomplete = { ...references[index] }; delete incomplete[field.id];
      assert.equal(app.exercises.check(ex, incomplete).correct, false, field.id);
      const wrong = { ...references[index], [field.id]: field.type === 'pixels' ? [1, 0, 1, 1, 0, 1, 0, 0] : '999' };
      const result = app.exercises.check(ex, wrong);
      assert.equal(result.correct, false, field.id); assert.ok(result.errors[field.id]);
    });
    assert.ok(app.exercises.solution(ex).length >= 2);
    assert.equal(ex.hints.length, 2);
  });
});
test('Équivalences autorisées et longueur imposée dans le correcteur', () => {
  assert.equal(app.exercises.check(app.data[0], { binary: ' 0001 0111 ' }).correct, true);
  assert.equal(app.exercises.check(app.data[2], { binary: ' 0101 0110 ' }).correct, true);
  for (const binary of ['1010110', '001010110', '01010112', '256']) assert.equal(app.exercises.check(app.data[2], { binary }).correct, false);
  assert.equal(app.exercises.check(app.data[1], { decimal: ' 00045 ' }).correct, true);
  assert.equal(app.exercises.check(app.data[3], { decimal: '53 °C' }).correct, false);
});
test('Pixels : pas de préremplissage, huit couleurs requises et ordre gauche/droite', () => {
  const ex = app.data[4]; const correct = references[4];
  for (const pixels of [Array(8), Array(8).fill(null), Array(8).fill(0), [0, 0, 1], [0, 0, 1, 0, 1, 1, 0, '1'], [...correct.pixels].reverse()]) {
    assert.equal(app.exercises.check(ex, { ...correct, pixels }).correct, false);
  }
  assert.equal(c.fromBinary(correct.pixels.join(''), 8), 45);
});
test('État absent, corrompu ou incompatible : initialisation sûre', () => {
  for (const raw of [null, '', '{oops', 'null', '[]', '{"version":99}', '{"version":1,"records":null}']) {
    const store = app.storage.createStore({ getItem: () => raw, setItem() {} });
    const state = store.load(); assert.equal(state.current, 0); assert.equal(Object.keys(state.records).length, 6);
    assert.equal(state.records.s1e1.solved, false);
  }
});
test('Sauvegarde et reprise des réponses, essais, indices, solution et position', () => {
  const values = new Map(); const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const store = app.storage.createStore(storage); const state = store.load(); state.current = 4;
  Object.assign(state.records.s1e1, { answers: references[0], attempts: 2, hints: 1, solutionViewed: true, solved: true });
  state.records.s1e5.answers = references[4]; store.save(state);
  const restored = app.storage.createStore(storage).load();
  assert.equal(JSON.stringify(restored), JSON.stringify(state));
  assert.equal(app.exercises.status(restored.records.s1e1), 'Réussi après aide ou tentative');
  const reset = store.reset(); assert.equal(reset.records.s1e1.attempts, 0);
  assert.equal(app.storage.createStore(storage).load().records.s1e1.solved, false);
});
test('Stockage bloqué et quota dépassé : fonctionnement en mémoire', () => {
  let notices = 0;
  const store = app.storage.createStore({ getItem() { throw Error('Blocked'); }, setItem() { throw Error('Quota'); } }, () => { notices += 1; });
  const state = store.load(); state.records.s1e2.answers = { decimal: '45' }; store.save(state);
  assert.equal(store.load().records.s1e2.answers.decimal, '45'); assert.equal(store.persistent, false); assert.equal(notices, 1);
  const quota = app.storage.createStore({ getItem() { return null; }, setItem() { throw Error('Quota'); } });
  quota.save(quota.load()); assert.equal(quota.persistent, false); assert.equal(quota.reset().current, 0);
});
test('État partiellement malformé : réussite et valeurs non valides ne sont pas restaurées', () => {
  const raw = { version: 1, current: 99, records: { s1e1: { solved: true, attempts: -1, hints: 99, answers: { binary: 'faux' } }, s1e5: { answers: { pixels: ['1', false, null, 0, 1, {}, 0, 1] } } } };
  const state = app.storage.sanitize(raw);
  assert.equal(state.current, 0); assert.equal(state.records.s1e1.solved, false); assert.equal(state.records.s1e1.attempts, 0); assert.equal(state.records.s1e1.hints, 2);
  assert.equal(state.records.s1e5.answers.pixels[0], null);
});
test('Statuts : essais, indices, solution consultée, puis résolution autonome', () => {
  const record = app.storage.empty().records.s1e1;
  assert.equal(app.exercises.status(record), 'À explorer'); record.attempts = 1;
  assert.equal(app.exercises.status(record), 'En cours'); record.solved = true;
  assert.equal(app.exercises.status(record), 'Réussi sans aide'); record.hints = 1;
  assert.equal(app.exercises.status(record), 'Réussi après aide ou tentative'); record.solved = false; record.solutionViewed = true;
  assert.equal(app.exercises.status(record), 'Solution consultée'); record.solved = true;
  assert.equal(app.exercises.status(record), 'Réussi après aide ou tentative');
});
