'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const app = load();
const c = app.conversions;
const references = require('./references.cjs');
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
  test(`Série ${ex.series}, exercice ${ex.position} : référence approuvée et sous-questions obligatoires`, () => {
    assert.equal(app.exercises.check(ex, references[index]).correct, true);
    assert.equal(app.exercises.check(ex, {}).correct, false);
    ex.fields.forEach(field => {
      const incomplete = { ...references[index] }; delete incomplete[field.id];
      assert.equal(app.exercises.check(ex, incomplete).correct, false, field.id);
      const wrong = { ...references[index], [field.id]: ['pixels', 'doors'].includes(field.type) ? [1, 0, 1, 1, 0, 1, 0, 0] : '999' };
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
    const state = store.load(); assert.equal(state.current, 0); assert.equal(Object.keys(state.records).length, 18);
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

test('Hexadécimal et couleurs : casse, longueur, format canonique et erreurs', () => {
  assert.equal(c.parseColor(' ff8040 '), '#FF8040');
  assert.equal(c.parseColor('#7f00ff'), '#7F00FF');
  for (const value of ['', '#FFF', '##FF8040', 'FF 8040', '#FF80400', '#FF80G0', '#RRGGBB', null]) assert.equal(c.parseColor(value), null);
  const ex = app.data[11]; const reference = references[11];
  assert.equal(app.exercises.check(ex, { ...reference, red: ' ff ', color: 'ff8040' }).correct, true);
  for (const red of ['F', 'FFF', '256', 'G0', '#FF']) assert.equal(app.exercises.check(ex, { ...reference, red }).correct, false);
  for (const color of ['#FF804', '#FF80400', '#FF804G', '#8040FF']) assert.equal(app.exercises.check(ex, { ...reference, color }).correct, false);
  assert.equal(app.exercises.solution(ex).at(-1), 'Dans l’ordre RR GG BB : #FF8040.');
});
test('ASCII : codes standard, lettres et mots ; aucun caractère étendu', () => {
  assert.equal(c.asciiCode('A'), 65); assert.equal(c.asciiCode(' '), 32);
  for (const input of ['é', '😀', 'AB', '', '\n', '\x7f']) assert.equal(c.asciiCode(input), null);
  assert.equal(app.exercises.check(app.data[8], { binary: '0100 0010', letter: ' c ' }).correct, true);
  assert.equal(app.exercises.check(app.data[9], { ...references[9], word: 'web' }).correct, true);
  for (const word of ['W E B', 'WÉB', 'WEB1']) assert.equal(app.exercises.check(app.data[9], { ...references[9], word }).correct, false);
  assert.equal(app.exercises.check(app.data[9], { word: 'WEB' }).correct, false);
});
test('Portes : huit états requis, porte 1 à droite et correspondance octet obligatoire', () => {
  const ex = app.data[14]; const reference = references[14];
  assert.equal(c.fromBinary(reference.doors.join('')), 74);
  assert.equal(c.fromBinary(reference.newDoors.join('')), 106);
  for (const doors of [Array(8), Array(8).fill(null), reference.doors.slice(0, 7), [...reference.doors].reverse()]) assert.equal(app.exercises.check(ex, { ...reference, doors }).correct, false);
  const mismatch = app.exercises.check(ex, { ...reference, binary: '01101010' });
  assert.match(mismatch.errors.doors, /correspondance portes/);
  assert.equal(app.exercises.check(ex, { ...reference, newDoors: reference.doors }).correct, false);
});
test('IPv4 : tous les octets et le dernier décimal sont obligatoires', () => {
  const ex = app.data[13]; const reference = references[13];
  for (const octet3 of ['1', '000000001', '256', '00000002']) assert.equal(app.exercises.check(ex, { ...reference, octet3 }).correct, false);
  assert.equal(app.exercises.check(ex, { ...reference, octet3: '0000 0001' }).correct, true);
  assert.equal(app.exercises.check(ex, { ...reference, decimal: '' }).correct, false);
  assert.match(app.exercises.solution(ex).join(' '), /11000000\.10101000\.00000001\.00100101/);
});
test('Migration du lot 1 : progression conservée, nouvelles séries disponibles sans verrou', () => {
  const old = { version: 1, current: 4, records: { s1e1: { answers: { binary: '10111' }, attempts: 1, hints: 0, solutionViewed: false, solved: true } } };
  const state = app.storage.sanitize(old);
  assert.equal(state.records.s1e1.solved, true);
  assert.equal(Object.keys(state.records).length, 18);
  assert.equal(state.positions[1], 4); assert.equal(state.positions[2], 6); assert.equal(state.positions[3], 12);
  state.positions[2] = 11; state.positions[3] = 14;
  state.records.s3e3.answers = references[14]; state.records.s3e3.attempts = 1; state.records.s3e3.solved = true;
  const restored = app.storage.sanitize(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.positions[2], 11); assert.equal(restored.positions[3], 14); assert.equal(restored.records.s3e3.solved, true);
});
test('Tous les corrigés restituent les résultats approuvés des séries 2 et 3', () => {
  const tokens = [ ['10101101'], ['202', '128 + 64 + 8 + 2'], ['01000010', '67', 'C'], ['87', '69', '66', 'WEB'], ['254', '11111111', '256', '255'], ['FF', '80', '40', '#FF8040'], ['100101100', '9 bits', 'Non'], ['11000000.10101000.00000001.00100101', '44'], ['01001010', '74', '01101010', '106'], ['bit 4', '182', '166', '16'], ['127', '0', '255'], ['165', '175', '10101111'] ];
  tokens.forEach((results, i) => { const solution = app.exercises.solution(app.data[i + 6]).join(' '); results.forEach(value => assert.ok(solution.includes(value), `${app.data[i + 6].id} : ${value}`)); });
});

test('Bilan : quatre catégories exclusives, tentatives et réussites distinctes', () => {
  const state = app.storage.empty();
  Object.assign(state.records.s1e1, { attempts: 1, solved: true });
  Object.assign(state.records.s1e2, { attempts: 2, solved: true });
  Object.assign(state.records.s1e3, { attempts: 0, solutionViewed: true });
  Object.assign(state.records.s1e4, { attempts: 1, solved: false });
  const result = app.exercises.review(state);
  assert.deepEqual(JSON.parse(JSON.stringify(result.totals)), { independent: 1, supported: 1, revealed: 1, unfinished: 15, attempted: 3, solved: 2 });
  assert.equal(result.items.length, 18);
  assert.equal(result.items[0].needsPractice, false);
  for (const index of [1, 2, 3]) assert.equal(result.items[index].needsPractice, true);
  assert.equal(result.items[4].needsPractice, false);
});
test('Bilan : un indice seul ne compte pas comme validation, une solution résolue devient réussite avec aide', () => {
  const state = app.storage.empty(); state.records.s1e1.hints = 1;
  let result = app.exercises.review(state);
  assert.equal(result.totals.attempted, 0); assert.equal(result.items[0].category, 'unfinished'); assert.equal(result.items[0].needsPractice, true);
  Object.assign(state.records.s1e2, { attempts: 1, solved: true, solutionViewed: true });
  result = app.exercises.review(state); assert.equal(result.items[1].category, 'supported'); assert.equal(result.totals.revealed, 0);
});
test('Bilan complet : 18 réussites distinctes et aucune note calculée', () => {
  const state = app.storage.empty();
  Object.values(state.records).forEach(record => { record.attempts = 1; record.solved = true; });
  const result = app.exercises.review(state);
  assert.equal(result.totals.independent, 18); assert.equal(result.totals.unfinished, 0);
  assert.equal(new Set(result.items.map(item => item.exercise.id)).size, 18);
});
test('Sauvegarde partielle : une chaîne ne remplace jamais les tableaux de pixels ou portes', () => {
  for (const value of ['01001010', {}, [1, 0], 42, null]) {
    const raw = { version: 1, records: { s1e5: { answers: { pixels: value } }, s3e3: { answers: { doors: value, newDoors: value } } } };
    const state = app.storage.sanitize(raw);
    assert.equal(state.records.s1e5.answers.pixels, undefined);
    assert.equal(state.records.s3e3.answers.doors, undefined);
    assert.equal(state.records.s3e3.answers.newDoors, undefined);
  }
});
test('Échec d’écriture : la reprise en mémoire ne recharge pas une ancienne sauvegarde', () => {
  const old = app.storage.empty(); old.records.s1e1.answers = { binary: '10' };
  const store = app.storage.createStore({ getItem: () => JSON.stringify(old), setItem() { throw Error('Quota dépassé'); } });
  const state = store.load(); state.records.s1e1.answers.binary = '10111'; store.save(state);
  assert.equal(store.persistent, false);
  assert.equal(store.load().records.s1e1.answers.binary, '10111');
  store.reset(); assert.equal(Object.keys(store.load().records.s1e1.answers).length, 0);
});
test('Une sauvegarde illisible ou incompatible déclenche un avis, une sauvegarde absente non', () => {
  for (const value of ['{cassé', 'null', '{"version":99}', '{"version":1,"records":null}']) {
    let notifications = 0;
    const store = app.storage.createStore({ getItem: () => value, setItem() {} }, () => {}, () => { notifications += 1; });
    assert.equal(Object.keys(store.load().records).length, 18); assert.equal(notifications, 1);
  }
  let notices = 0; app.storage.createStore({ getItem: () => null, setItem() {} }, () => {}, () => { notices += 1; }).load(); assert.equal(notices, 0);
});
