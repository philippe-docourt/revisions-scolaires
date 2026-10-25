'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const syncFs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const references = require('./references.cjs');
const { exportSite } = require('../scripts/export.cjs');
const { root, moduleRoot } = require('./helpers.cjs');
let browser, server, base, standaloneRoot, distributionRoot;
const activityPath = 'maths/numeration/changements-de-base/';
const errors = [];
const contexts = [];
async function context(options = {}) {
  const ctx = await browser.newContext(options); contexts.push(ctx);
  ctx.on('page', page => { page.on('pageerror', error => errors.push(error.message)); });
  return ctx;
}
async function visible(page, selector) { return page.locator(selector).isVisible(); }
async function exercise(page, number) {
  const series = Math.floor((number - 1) / 6) + 1;
  await page.getByRole('button', { name: `Série ${series}`, exact: true }).click();
  await page.getByRole('button', { name: new RegExp(`^Exercice ${(number - 1) % 6 + 1} :`) }).click();
}
async function noOverflow(page) { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Aucun débordement horizontal'); }
async function answerSeries(page) {
  const answers = [['binary', '10111'], ['decimal', '45'], ['binary', '01010110'], ['decimal', '53']];
  for (let i = 0; i < answers.length; i += 1) {
    await exercise(page, i + 1); await page.locator(`#answer-${answers[i][0]}`).fill(answers[i][1]);
    await page.getByRole('button', { name: 'Vérifier ma réponse' }).click(); assert.match(await page.locator('#feedback').innerText(), /Bien joué/);
    await noOverflow(page);
  }
  await exercise(page, 5); await page.locator('#answer-binary').fill('00101101');
  const bits = [0, 0, 1, 0, 1, 1, 0, 1];
  for (let i = 0; i < 8; i += 1) {
    const pixel = page.getByRole('button', { name: `Pixel ${i + 1} :`, exact: false });
    assert.match(await pixel.getAttribute('aria-label'), /indéterminé/);
    await pixel.click(); if (bits[i]) await pixel.click();
  }
  await page.locator('#answer-white').fill('4'); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  assert.match(await page.locator('#feedback').innerText(), /Bien joué/); await noOverflow(page);
  await exercise(page, 6); await page.locator('#answer-five').fill('32'); await page.locator('#answer-eight').fill('256');
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click(); assert.match(await page.locator('#feedback').innerText(), /Bien joué/);
  assert.match(await page.locator('.progress-summary').innerText(), /6 \/ 18/);
  await page.getByRole('button', { name: 'Terminer la série' }).click();
  assert.equal(await page.locator('.status').filter({ hasText: 'Réussi sans aide' }).count(), 6);
  await page.getByRole('button', { name: 'Retour aux séries' }).click();
}
async function fillAnswers(page, answers) {
  for (const [id, value] of Object.entries(answers)) {
    const field = page.locator(`#answer-${id}`);
    if (Array.isArray(value)) {
      const buttons = field.locator('.pixel');
      for (let i = 0; i < value.length; i += 1) {
        const item = buttons.nth(i);
        if ((await item.innerText()) === '?') await item.click();
        if ((await item.innerText()) !== String(value[i])) await item.click();
      }
    } else if (await field.evaluate(node => node.tagName === 'SELECT')) await field.selectOption(value);
    else await field.fill(value);
  }
}
async function answerNewSeries(page, series) {
  await page.getByRole('button', { name: `Commencer la série ${series}` }).click();
  for (let position = 1; position <= 6; position += 1) {
    const index = (series - 1) * 6 + position - 1;
    await exercise(page, index + 1);
    assert.equal(await visible(page, '#solution'), false);
    await fillAnswers(page, references[index]);
    await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
    assert.match(await page.locator('#feedback').innerText(), /Bien joué/);
    if (index === 11) assert.match(await page.locator('#feedback').innerText(), /#FF8040/);
    if (index === 13) assert.match(await page.locator('.derived-address').innerText(), /11000000\.10101000\.00000001\.00100101/);
    await noOverflow(page);
  }
  await page.getByRole('button', { name: 'Terminer la série' }).click();
  assert.match(await page.locator('.progress-summary').innerText(), new RegExp(`${series * 6} / 18`));
  assert.equal(await page.locator('.status').filter({ hasText: 'Réussi sans aide' }).count(), series * 6);
  await page.getByRole('button', { name: 'Retour aux séries' }).click();
}
before(async () => {
  await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (syncFs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  standaloneRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-binaire-http-'));
  await fs.cp(moduleRoot, standaloneRoot, { recursive: true });
  distributionRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'atelier-site-'));
  await exportSite(distributionRoot);
  server = http.createServer(async (req, res) => {
    try {
      let relative = decodeURIComponent(new URL(req.url, 'http://local.test').pathname);
      const standalone = relative.startsWith('/standalone/');
      const prefixed = relative.startsWith('/revisions-scolaires/');
      relative = relative.slice(standalone ? '/standalone/'.length : prefixed ? '/revisions-scolaires/'.length : 1);
      const documentRoot = standalone ? standaloneRoot : prefixed ? root : distributionRoot;
      let file = path.resolve(documentRoot, relative || '.');
      if (file !== documentRoot && !file.startsWith(documentRoot + path.sep)) { res.writeHead(403).end(); return; }
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(await fs.readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/revisions-scolaires/`;
});
after(async () => {
  await Promise.all(contexts.map(ctx => ctx.close()));
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (standaloneRoot) await fs.rm(standaloneRoot, { recursive: true, force: true });
  if (distributionRoot) await fs.rm(distributionRoot, { recursive: true, force: true });
});
test('Desktop : catalogue sous un préfixe, navigation et 18 exercices complets', async () => {
  const ctx = await context({ viewport: { width: 1440, height: 1000 } }); const page = await ctx.newPage();
  const failures = []; page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('favicon.ico')) failures.push(response.url()); });
  await page.goto(base); assert.equal(await page.locator('.activity-card').count(), 1);
  assert.equal(await page.getByRole('heading', { name: 'Maths', exact: true }).count(), 1); assert.equal(await page.getByRole('heading', { name: 'Numération', exact: true }).count(), 1);
  await noOverflow(page); await page.screenshot({ path: path.join(root, 'artifacts/catalogue-desktop.png'), fullPage: true });
  await page.getByRole('link', { name: 'Ouvrir l’activité' }).click(); assert.equal(page.url(), base + activityPath);
  assert.match(await page.locator('main').innerText(), /18 exercices · 3 séries · 5 fiches/);
  assert.equal(await page.locator('.series-card button').count(), 3);
  await page.screenshot({ path: path.join(root, 'artifacts/mission-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Commencer la série 1' }).click(); await answerSeries(page); await answerNewSeries(page, 2); await answerNewSeries(page, 3);
  assert.deepEqual(failures, []);
});
test('Erreurs, indices gradués, confirmations et statuts d’aide', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + activityPath);
  await page.getByRole('button', { name: 'Commencer la série 1' }).click();
  await page.locator('#answer-binary').fill('102'); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  assert.equal(await page.locator('#answer-binary').inputValue(), '102'); assert.equal(await visible(page, '#solution'), false);
  assert.equal(await page.locator('#answer-binary').getAttribute('aria-invalid'), 'true');
  await page.getByRole('button', { name: 'Un indice', exact: true }).click(); assert.equal(await page.locator('.hints p').count(), 1);
  await page.getByRole('button', { name: 'Un autre indice' }).click(); assert.equal(await page.locator('.hints p').count(), 2);
  assert.equal(await page.getByRole('button', { name: 'Les deux indices sont affichés' }).isDisabled(), true);
  await page.getByRole('button', { name: 'Voir la méthode', exact: true }).click(); assert.equal(await visible(page, '#solution'), false);
  await page.getByRole('button', { name: 'Annuler', exact: true }).click(); assert.equal(await visible(page, '#solution'), false);
  assert.equal(await page.getByRole('button', { name: 'Voir la méthode', exact: true }).evaluate(node => node === document.activeElement), true);
  await page.getByRole('button', { name: 'Voir la méthode', exact: true }).click(); await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await page.locator('#solution').waitFor({ state: 'visible' }); assert.match(await page.locator('#solution').innerText(), /10111/);
  await page.getByRole('button', { name: 'Retour aux séries' }).click(); assert.equal(await page.locator('.status').first().innerText(), 'Solution consultée');
  await page.getByRole('button', { name: 'Reprendre la série 1' }).click(); await page.locator('#answer-binary').fill('10111'); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await page.getByRole('button', { name: 'Retour aux séries' }).click(); assert.equal(await page.locator('.status').first().innerText(), 'Réussi après aide ou tentative');
});
test('Fiches accessibles : interaction, Échap, focus, réponses préservées et pixels au clavier', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + activityPath); await page.getByRole('button', { name: 'Commencer la série 1' }).click();
  await page.locator('#answer-binary').fill('101');
  const guide = page.locator('.help-card').getByRole('button', { name: 'Guide des méthodes' }); await guide.click();
  assert.equal(await visible(page, '#guide-dialog'), true);
  await page.getByRole('button', { name: 'Bit 7, poids 128 : 0', exact: true }).click(); assert.match(await page.locator('.bit-output').innerText(), /128₁₀/);
  await page.keyboard.press('Escape'); assert.equal(await visible(page, '#guide-dialog'), false); assert.equal(await guide.evaluate(node => node === document.activeElement), true);
  assert.equal(await page.locator('#answer-binary').inputValue(), '101');
  await exercise(page, 5); assert.equal(await page.locator('.pixel-grid .pixel').allTextContents().then(values => values.join('')), '????????');
  const firstPixel = page.locator('.pixel-grid .pixel').first(); await firstPixel.focus(); await page.keyboard.press('Space');
  assert.equal(await firstPixel.getAttribute('aria-label'), 'Pixel 1 : noir, 0'); await page.keyboard.press('Enter'); assert.equal(await firstPixel.getAttribute('aria-label'), 'Pixel 1 : blanc, 1');
  await page.getByRole('button', { name: 'Comprendre les pixels' }).click();
  await page.locator('#guide-dialog').getByRole('button', { name: 'Pixel 1 : noir, 0', exact: true }).click(); assert.match(await page.locator('.bit-output').innerText(), /10000000₂ = 128₁₀/);
  await page.getByRole('button', { name: 'Retour à mon exercice', exact: true }).click();
  assert.equal(await page.locator('.pixel-grid .pixel').first().getAttribute('aria-label'), 'Pixel 1 : blanc, 1');
  await page.getByRole('button', { name: 'Vérifier ma réponse' }).click(); assert.match(await page.locator('#error-pixels').innerText(), /chacun des huit/);
});
test('Rechargement HTTP, réponse partielle, progression et remise à zéro confirmée', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + activityPath); await page.getByRole('button', { name: 'Commencer la série 1' }).click();
  await page.locator('#answer-binary').fill('10111'); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click(); await exercise(page, 5);
  await page.locator('#answer-binary').fill('0010'); await page.getByRole('button', { name: 'Pixel 3 : indéterminé', exact: true }).click();
  await page.reload(); assert.match(await page.locator('.progress-summary').innerText(), /1 \/ 18/); await page.getByRole('button', { name: 'Reprendre la série 1' }).click();
  assert.equal(await page.locator('#answer-binary').inputValue(), '0010'); assert.equal(await page.getByRole('button', { name: 'Pixel 3 : noir, 0', exact: true }).count(), 1);
  await page.getByRole('button', { name: 'Retour aux séries' }).click(); await page.getByRole('button', { name: 'Recommencer ma progression' }).click(); await page.keyboard.press('Escape');
  assert.match(await page.locator('.progress-summary').innerText(), /1 \/ 18/);
  await page.getByRole('button', { name: 'Recommencer ma progression' }).click(); await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await page.reload(); assert.match(await page.locator('.progress-summary').innerText(), /0 \/ 18/); assert.equal(await page.getByRole('button', { name: 'Commencer la série 1' }).count(), 1);
});
test('Stockage bloqué : notice et parcours fonctionnel en mémoire', async () => {
  const ctx = await context(); await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }); });
  const page = await ctx.newPage(); await page.goto(base + activityPath); assert.equal(await visible(page, '#storage-notice'), true);
  await page.getByRole('button', { name: 'Commencer la série 1' }).click(); await page.locator('#answer-binary').fill('10111'); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await page.getByRole('button', { name: 'Retour aux séries' }).click(); assert.match(await page.locator('.progress-summary').innerText(), /1 \/ 18/);
});
test('Mobile 375 px : catalogue, 18 exercices, fiche et captures', async () => {
  const ctx = await context({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
  await page.goto(base); await noOverflow(page); await page.screenshot({ path: path.join(root, 'artifacts/catalogue-mobile.png'), fullPage: true });
  await page.getByRole('link', { name: 'Ouvrir l’activité' }).click(); await noOverflow(page); await page.screenshot({ path: path.join(root, 'artifacts/mission-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Commencer la série 1' }).click(); await answerSeries(page); await answerNewSeries(page, 2); await answerNewSeries(page, 3); await page.getByRole('button', { name: 'Reprendre la série 1' }).click();
  await exercise(page, 5); await noOverflow(page); await page.screenshot({ path: path.join(root, 'artifacts/pixels-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Comprendre les pixels' }).click();
  assert.equal(await page.locator('#guide-dialog').evaluate(node => node.scrollWidth <= node.clientWidth), true);
  await page.screenshot({ path: path.join(root, 'artifacts/fiche-pixels-mobile.png') });
  await page.keyboard.press('Escape'); await page.setViewportSize({ width: 320, height: 740 }); await noOverflow(page);
});
test('Module autonome copié hors du dépôt : ressources, correction et fiche en HTTP', async () => {
  const ctx = await context(); const page = await ctx.newPage(); const failures = [];
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('favicon.ico')) failures.push(response.url()); });
  await page.goto(new URL('/standalone/', base).href);
  await page.getByRole('button', { name: 'Commencer la série 1' }).click();
  await page.locator('#answer-binary').fill('10111'); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  assert.match(await page.locator('#feedback').innerText(), /Bien joué/);
  await exercise(page, 5); await page.getByRole('button', { name: 'Comprendre les pixels' }).click();
  await page.locator('#guide-dialog .pixel').first().click(); assert.match(await page.locator('.bit-output').innerText(), /128₁₀/);
  assert.deepEqual(failures, []);
});
test('file:// hors ligne : catalogue et dossier du module copié ailleurs', async t => {
  const ctx = await context(); await ctx.setOffline(true); const page = await ctx.newPage(); const remote = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) remote.push(request.url()); });
  try { await page.goto('file://' + path.join(root, 'index.html')); } catch (error) {
    if (String(error.message).includes('ERR_BLOCKED_BY_ADMINISTRATOR')) {
      t.skip('La politique du navigateur cloud interdit file:// ; contrôle à effectuer dans un navigateur local.');
      return;
    }
    throw error;
  }
  await page.getByRole('link', { name: 'Ouvrir l’activité' }).click();
  await page.getByRole('button', { name: /^(Commencer|Reprendre) la série 1/ }).click();
  await answerSeries(page); await answerNewSeries(page, 2); await answerNewSeries(page, 3);
  for (const name of ['Guide des méthodes', 'Comprendre les pixels', 'Comprendre ASCII', 'Comprendre RGB', 'Comprendre les adresses IP']) {
    await page.locator('.home-bottom').getByRole('button', { name }).click();
    assert.equal(await visible(page, '#guide-dialog'), true); await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: 'Mon bilan', exact: true }).click();
  assert.equal(await page.locator('[data-category="independent"] dd').innerText(), '18');
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-binaire-'));
  try {
    await fs.cp(moduleRoot, path.join(temporary, 'activite'), { recursive: true });
    await page.goto('file://' + path.join(temporary, 'activite/index.html'));
    await page.getByRole('button', { name: /^(Commencer|Reprendre) la série 1/ }).click(); await exercise(page, 5);
    await page.getByRole('button', { name: 'Comprendre les pixels' }).click(); await page.locator('#guide-dialog .pixel').first().click();
    assert.match(await page.locator('.bit-output').innerText(), /128₁₀/); assert.deepEqual(remote, []);
  } finally { await fs.rm(temporary, { recursive: true, force: true }); }
});
test('Accès direct aux séries 2 et 3, navigation sans réponse et reprise par série', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + activityPath);
  await page.getByRole('button', { name: 'Commencer la série 3' }).click();
  assert.match(await page.locator('.exercise-card>.eyebrow').innerText(), /SÉRIE 3 · EXERCICE 1\/6/);
  await page.getByRole('button', { name: 'Exercice suivant' }).click();
  assert.match(await page.locator('.exercise-card>.eyebrow').innerText(), /EXERCICE 2\/6/);
  assert.equal(await page.locator('.derived-address').innerText().then(text => text.includes('????????.????????.????????.????????')), true);
  await page.locator('#answer-octet1').fill('11000000');
  await exercise(page, 10); await page.locator('#answer-word').fill('WE');
  await page.getByRole('button', { name: 'Série 3', exact: true }).click();
  assert.equal(await page.locator('#answer-octet1').inputValue(), '11000000');
  await page.reload(); await page.getByRole('button', { name: 'Reprendre la série 2' }).click();
  assert.equal(await page.locator('#answer-word').inputValue(), 'WE');
  assert.equal(await page.locator('.progress-summary').innerText(), '0 / 18 réussis');
});
for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 375, height: 812 }]]) {
  test(`Fiches ASCII, RGB et IPv4 sur ${device} : valeurs, clavier, erreurs et focus`, async () => {
    const ctx = await context({ viewport }); const page = await ctx.newPage(); await page.goto(base + activityPath);
    await page.getByRole('button', { name: 'Commencer la série 2' }).click(); await exercise(page, 9);
    await page.locator('#answer-letter').fill('C');
    const ascii = page.locator('.help-card').getByRole('button', { name: 'Comprendre ASCII' }); await ascii.click();
    assert.match(await page.locator('#guide-content').innerText(), /128 codes, de 0 à 127, sur 7 bits/);
    await page.locator('#ascii-character').fill('B'); assert.match(await page.locator('#ascii-result').innerText(), /66.*01000010/);
    await page.locator('#ascii-character').fill('é'); assert.equal(await page.locator('#ascii-character').getAttribute('aria-invalid'), 'true');
    await page.screenshot({ path: path.join(root, `artifacts/ascii-${device}.png`) });
    await page.keyboard.press('Escape'); assert.equal(await ascii.evaluate(node => node === document.activeElement), true);
    assert.equal(await page.locator('#answer-letter').inputValue(), 'C');
    await exercise(page, 12); await page.locator('#answer-red').fill('f');
    assert.equal(await page.locator('form input[type=range]').count(), 0);
    await page.locator('.help-card').getByRole('button', { name: 'Comprendre RGB' }).click();
    const red = page.locator('#rgb-0'); await red.focus(); await page.keyboard.press('End');
    assert.match(await page.locator('.guide-output').innerText(), /#FF0000/);
    for (const [id, value] of [['rgb-1', 128], ['rgb-2', 64]]) await page.locator('#' + id).evaluate((node, value) => { node.value = String(value); node.dispatchEvent(new Event('input', { bubbles: true })); }, value);
    assert.match(await page.locator('.guide-output').innerText(), /#FF8040/);
    assert.match(await page.locator('label[for="rgb-1"]').innerText(), /128 \/ 255 \(80\)/);
    assert.equal(await page.locator('.color-swatch').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 128, 64)');
    await page.screenshot({ path: path.join(root, `artifacts/rgb-${device}.png`) });
    for (const [id, value] of [['rgb-0', 127], ['rgb-1', 0], ['rgb-2', 255]]) await page.locator('#' + id).evaluate((node, value) => { node.value = String(value); node.dispatchEvent(new Event('input', { bubbles: true })); }, value);
    assert.match(await page.locator('.guide-output').innerText(), /#7F00FF/);
    for (const [name, code] of [['Rouge', '#FF0000'], ['Vert', '#00FF00'], ['Bleu', '#0000FF'], ['Noir', '#000000'], ['Blanc', '#FFFFFF']]) {
      await page.locator('.color-presets').getByRole('button', { name, exact: true }).click(); assert.ok((await page.locator('.guide-output').innerText()).includes(code));
    }
    await page.getByRole('button', { name: 'Retour à mon exercice', exact: true }).click();
    assert.equal(await page.locator('#answer-red').inputValue(), 'f');
    await page.screenshot({ path: path.join(root, `artifacts/exercice-rgb-${device}.png`), fullPage: true });
    await exercise(page, 14); await page.getByRole('button', { name: 'Comprendre les adresses IP' }).click();
    assert.match(await page.locator('.guide-output').innerText(), /192.168.1.37 → 11000000\.10101000\.00000001\.00100101/);
    await page.locator('#ip-3').fill('44'); assert.match(await page.locator('.guide-output').innerText(), /00101100$/);
    for (const invalid of ['256', '-1', '1e2', '']) {
      await page.locator('#ip-3').fill(invalid); assert.equal(await page.locator('#ip-3').getAttribute('aria-invalid'), 'true');
      assert.match(await page.locator('.guide-output').innerText(), /0 à 255/);
    }
    await page.locator('#ip-3').fill('37');
    assert.equal(await page.locator('#guide-dialog').evaluate(node => node.scrollWidth <= node.clientWidth), true);
    await page.screenshot({ path: path.join(root, `artifacts/ip-${device}.png`) });
    await page.keyboard.press('Escape'); await exercise(page, 15);
    const doors = page.locator('#answer-doors .pixel');
    assert.equal(await doors.allTextContents().then(text => text.join('')), '????????');
    assert.match(await doors.first().getAttribute('aria-label'), /Porte 8, bit 7/);
    assert.match(await doors.last().getAttribute('aria-label'), /Porte 1, bit 0/);
    await doors.last().focus(); await page.keyboard.press('Space'); await page.keyboard.press('Enter');
    assert.match(await doors.last().getAttribute('aria-label'), /autorisée, 1/);
    await fillAnswers(page, references[14]); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
    assert.match(await page.locator('#feedback').innerText(), /Bien joué/); await noOverflow(page);
    await page.screenshot({ path: path.join(root, `artifacts/portes-${device}.png`), fullPage: true });
    if (device === 'mobile') {
      await page.setViewportSize({ width: 320, height: 740 }); await noOverflow(page);
      await exercise(page, 12); await page.getByRole('button', { name: 'Comprendre RGB' }).click();
      assert.equal(await page.locator('#guide-dialog').evaluate(node => node.scrollWidth <= node.clientWidth), true);
    }
  });
}
test('Séries 2 et 3 : erreurs sans solution, indices et corrigés sur demande pour les 12 exercices', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + activityPath);
  await page.getByRole('button', { name: 'Commencer la série 2' }).click();
  for (let number = 7; number <= 18; number += 1) {
    await exercise(page, number); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
    assert.match(await page.locator('#feedback').innerText(), /Pas encore/); assert.equal(await visible(page, '#solution'), false);
    await page.getByRole('button', { name: 'Un indice', exact: true }).click(); await page.getByRole('button', { name: 'Un autre indice' }).click();
    assert.equal(await page.locator('.hints p').count(), 2);
    await page.getByRole('button', { name: 'Voir la méthode', exact: true }).click(); await page.getByRole('button', { name: 'Annuler', exact: true }).click();
    assert.equal(await visible(page, '#solution'), false);
    await page.getByRole('button', { name: 'Voir la méthode', exact: true }).click(); await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
    await page.locator('#solution').waitFor({ state: 'visible' }); assert.ok(await page.locator('#solution li').count() >= 2);
    await fillAnswers(page, references[number - 1]); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
    assert.match(await page.locator('#feedback').innerText(), /Bien joué/);
  }
  await page.getByRole('button', { name: 'Retour aux séries' }).click();
  assert.equal(await page.locator('.status').filter({ hasText: 'Réussi après aide ou tentative' }).count(), 12);
});
test('Reprise HTTP des portes et migration d’une sauvegarde du lot 1', async () => {
  const ctx = await context(); const old = { version: 1, current: 4, records: { s1e1: { answers: { binary: '10111' }, attempts: 1, hints: 0, solved: true, solutionViewed: false } } };
  const page = await ctx.newPage(); await page.goto(base + activityPath);
  await page.evaluate(raw => localStorage.setItem('mission-binaire:v1', JSON.stringify(raw)), old); await page.reload();
  assert.match(await page.locator('.progress-summary').innerText(), /1 \/ 18/);
  await page.getByRole('button', { name: 'Commencer la série 3' }).click(); await exercise(page, 15);
  await fillAnswers(page, references[14]); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await page.reload(); await page.getByRole('button', { name: 'Reprendre la série 3' }).click();
  assert.equal(await page.locator('#answer-doors .pixel').allTextContents().then(values => values.join('')), '01001010');
  assert.equal(await page.locator('#answer-newDoors .pixel').allTextContents().then(values => values.join('')), '01101010');
  assert.match(await page.locator('.progress-summary').innerText(), /2 \/ 18/);
  await page.getByRole('button', { name: 'Retour aux séries' }).click();
  assert.equal(await page.locator('.series-card[data-series="1"] .series-progress').innerText(), '1 / 6 exercices réussis');
  assert.equal(await page.locator('.series-card[data-series="3"] .series-progress').innerText(), '1 / 6 exercices réussis');
});
test('Bilan : 18 exercices, quatre statuts, conseils, reprise et confirmation de fin de série', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + activityPath);
  await page.getByRole('button', { name: 'Mon bilan', exact: true }).click();
  assert.equal(await page.locator('.review-item').count(), 18);
  assert.equal(await page.locator('[data-category="unfinished"] dd').innerText(), '18');
  await page.getByRole('button', { name: 'Retour aux séries' }).click();
  await page.getByRole('button', { name: 'Commencer la série 1' }).click();
  await fillAnswers(page, references[0]); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await exercise(page, 2); await page.locator('#answer-decimal').fill('1'); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  assert.equal(await page.locator('#answer-decimal').evaluate(node => node === document.activeElement), true);
  await fillAnswers(page, references[1]); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await exercise(page, 3); await page.getByRole('button', { name: 'Voir la méthode', exact: true }).click(); await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  await page.locator('#solution').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#solution').evaluate(node => node === document.activeElement), true);
  await exercise(page, 4); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  await page.getByRole('button', { name: 'Mon bilan', exact: true }).click();
  assert.match(await page.locator('.review-counts').innerText(), /3 \/ 18 exercices tentés · 2 \/ 18 réussis/);
  for (const [category, count] of [['independent', '1'], ['supported', '1'], ['revealed', '1'], ['unfinished', '15']]) assert.equal(await page.locator(`[data-category="${category}"] dd`).innerText(), count);
  const supported = page.locator('[data-exercise="s1e2"]'); assert.match(await supported.locator('.status').innerText(), /Réussi après indice ou tentative/);
  const guide = supported.getByRole('button', { name: 'Guide des méthodes', exact: true }); await guide.click(); await page.keyboard.press('Escape');
  assert.equal(await guide.evaluate(node => node === document.activeElement), true);
  await supported.locator('.review-jump').click(); assert.equal(await page.locator('#answer-decimal').inputValue(), '45');
  await exercise(page, 6); await page.getByRole('button', { name: 'Terminer la série' }).click();
  assert.equal(await page.getByRole('heading', { name: 'Mon bilan', exact: true }).count(), 1);
  await noOverflow(page); await page.screenshot({ path: path.join(root, 'artifacts/bilan-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 }); await noOverflow(page);
  await page.screenshot({ path: path.join(root, 'artifacts/bilan-mobile.png'), fullPage: true });
});
test('Sauvegardes corrompues ou partiellement malformées : avis et application utilisable', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base + activityPath);
  await page.evaluate(() => localStorage.setItem('mission-binaire:v1', '{cassé')); await page.reload();
  assert.equal(await visible(page, '#storage-recovery'), true);
  await page.getByRole('button', { name: 'Commencer la série 1' }).click(); await exercise(page, 5);
  assert.equal(await page.locator('#answer-pixels .pixel').count(), 8);
  const invalid = { version: 1, current: 14, records: { s1e5: { answers: { pixels: '00101101' } }, s3e3: { answers: { doors: '01001010', newDoors: [1] } } } };
  await page.evaluate(state => localStorage.setItem('mission-binaire:v1', JSON.stringify(state)), invalid); await page.reload();
  await page.getByRole('button', { name: 'Reprendre la série 3' }).click();
  assert.equal(await page.locator('#answer-doors .pixel').allTextContents().then(values => values.join('')), '????????');
  assert.equal(await page.locator('#answer-newDoors .pixel').allTextContents().then(values => values.join('')), '????????');
  await page.getByRole('button', { name: 'Mon bilan', exact: true }).click(); assert.equal(await page.locator('.review-item').count(), 18);
});
test('Persistance après fermeture et redémarrage du navigateur', async () => {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-profile-'));
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (syncFs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  let ctx;
  try {
    ctx = await chromium.launchPersistentContext(profile, { executablePath, headless: true, args: ['--no-sandbox'] });
    let page = await ctx.newPage(); await page.goto(base + activityPath);
    await page.getByRole('button', { name: 'Commencer la série 3' }).click(); await exercise(page, 18);
    await fillAnswers(page, references[17]); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
    await ctx.close(); ctx = null;
    ctx = await chromium.launchPersistentContext(profile, { executablePath, headless: true, args: ['--no-sandbox'] });
    page = await ctx.newPage(); await page.goto(base + activityPath);
    await page.getByRole('button', { name: 'Reprendre la série 3' }).click();
    assert.equal(await page.locator('#answer-binary').inputValue(), '10101111');
    await page.getByRole('button', { name: 'Mon bilan', exact: true }).click();
    assert.equal(await page.locator('[data-exercise="s3e6"] .status').innerText(), 'Réussi sans aide');
    await page.getByRole('button', { name: 'Retour aux séries' }).click();
    await page.getByRole('button', { name: 'Recommencer ma progression' }).click();
    await page.getByRole('button', { name: 'Annuler', exact: true }).click();
    assert.match(await page.locator('.progress-summary').innerText(), /1 \/ 18/);
    await page.getByRole('button', { name: 'Recommencer ma progression' }).click();
    await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
    await page.getByRole('button', { name: 'Mon bilan', exact: true }).click();
    assert.equal(await page.locator('[data-category="unfinished"] dd').innerText(), '18');
    await ctx.close(); ctx = null;
  } finally { if (ctx) await ctx.close(); await fs.rm(profile, { recursive: true, force: true }); }
});
async function audit(page, name) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  await fs.writeFile(path.join(root, `artifacts/accessibilite-${name}.json`), JSON.stringify(result, null, 2));
  assert.deepEqual(result.violations.map(item => ({ id: item.id, help: item.help, count: item.nodes.length, first: { target: item.nodes[0].target, detail: item.nodes[0].failureSummary } })), []);
  // Check contrast cases axe cannot resolve (glyphs and some top-layer dialogues),
  // without excluding any element or disabling a rule in the audit.
  for (const item of result.incomplete) {
    assert.equal(item.id, 'color-contrast', `Vérification complémentaire requise : ${item.id}`);
    for (const node of item.nodes) {
      const glyph = node.any.every(check => check.data?.messageKey === 'nonBmp');
      assert.ok(node.any.every(check => ['nonBmp', 'elmPartiallyObscuring'].includes(check.data?.messageKey)), node.failureSummary);
      const inspection = await page.locator(node.target[0]).evaluate((element, glyph) => {
        const rgb = color => color.match(/[\d.]+/g).map(Number);
        const luminance = channels => channels.slice(0, 3).map(value => {
          const component = value / 255;
          return component <= 0.04045 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
        const foreground = rgb(getComputedStyle(element).color);
        let background; let ancestor = element;
        while (ancestor) {
          const channels = rgb(getComputedStyle(ancestor).backgroundColor);
          if (channels.length === 3 || channels[3] === 1) { background = channels; break; }
          if (channels[3] !== 0) throw Error('Fond translucide : inspection complémentaire nécessaire.');
          ancestor = ancestor.parentElement;
        }
        if (!background) throw Error('Fond indéterminé.');
        const first = luminance(foreground); const second = luminance(background);
        const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
        let unobscured = true;
        if (!glyph) {
          const range = document.createRange(); range.selectNodeContents(element);
          unobscured = [...range.getClientRects()].every(rect => {
            const front = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
            return front && (element === front || element.contains(front));
          });
        }
        return { ratio, unobscured };
      }, glyph);
      assert.ok(inspection.unobscured, `Texte masqué : ${node.target}`);
      const threshold = glyph ? 3 : 4.5;
      assert.ok(inspection.ratio >= threshold, `Contraste ${node.target}: ${inspection.ratio.toFixed(2)} < ${threshold}:1`);
    }
  }
}
test('Accessibilité automatisée : catalogue, 18 exercices, cinq fiches, confirmation et bilan', async () => {
  const ctx = await context(); const page = await ctx.newPage(); await page.goto(base); await audit(page, 'catalogue');
  await page.getByRole('link', { name: 'Ouvrir l’activité' }).click(); await audit(page, 'accueil');
  await page.getByRole('button', { name: 'Commencer la série 1' }).click();
  for (let number = 1; number <= 18; number += 1) { await exercise(page, number); await audit(page, `exercice-${number}`); }
  await page.getByRole('button', { name: 'Voir la méthode', exact: true }).click(); await audit(page, 'confirmation'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Retour aux séries' }).click();
  for (const [id, name] of [['methodes', 'Guide des méthodes'], ['pixels', 'Comprendre les pixels'], ['ascii', 'Comprendre ASCII'], ['rgb', 'Comprendre RGB'], ['ip', 'Comprendre les adresses IP']]) {
    await page.locator('.home-bottom').getByRole('button', { name }).click(); await audit(page, `fiche-${id}`); await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: 'Mon bilan', exact: true }).click(); await audit(page, 'bilan');
});
test('Clavier : lien d’évitement, focus, dialogues et agrandissement du texte', async () => {
  const ctx = await context({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); const page = await ctx.newPage();
  await page.goto(base + activityPath); await page.keyboard.press('Tab'); assert.equal(await page.locator('.skip-link').evaluate(node => node === document.activeElement), true);
  await page.keyboard.press('Enter'); assert.equal(await page.locator('main').evaluate(node => node === document.activeElement), true);
  const guide = page.locator('[data-guide="methodes"]'); await guide.focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#close-guide').evaluate(node => node === document.activeElement), true);
  await page.keyboard.press('Shift+Tab'); assert.equal(await page.locator('#return-guide').evaluate(node => node === document.activeElement), true);
  await page.keyboard.press('Tab'); assert.equal(await page.locator('#close-guide').evaluate(node => node === document.activeElement), true);
  const focusStyle = await page.locator('#close-guide').evaluate(node => ({ width: getComputedStyle(node).outlineWidth, style: getComputedStyle(node).outlineStyle }));
  assert.equal(focusStyle.style, 'solid'); assert.ok(parseFloat(focusStyle.width) >= 2);
  await page.keyboard.press('Escape'); assert.equal(await guide.evaluate(node => node === document.activeElement), true);
  await page.getByRole('button', { name: 'Commencer la série 1' }).click(); await exercise(page, 5);
  // Reflow equivalent to 400% browser zoom on a 1280 px viewport.
  await page.setViewportSize({ width: 320, height: 740 }); await noOverflow(page);
  await page.getByRole('button', { name: 'Mon bilan', exact: true }).click(); await noOverflow(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => {
    const original = [...document.querySelectorAll('body, body *')].map(node => [node, parseFloat(getComputedStyle(node).fontSize)]);
    original.forEach(([node, size]) => { node.style.fontSize = `${size * 2}px`; });
  });
  await noOverflow(page);
});
test('Distribution à la racine du domaine : catalogue, ressources locales, activité et bilan', async () => {
  const ctx = await context(); const page = await ctx.newPage(); const external = []; const failures = [];
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(base).origin) external.push(request.url()); });
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('favicon.ico')) failures.push(response.url()); });
  await page.goto(new URL('/', base).href); await page.getByRole('link', { name: 'Ouvrir l’activité' }).click();
  assert.equal(new URL(page.url()).pathname, '/' + activityPath);
  await page.getByRole('button', { name: 'Commencer la série 2' }).click(); await exercise(page, 12);
  await fillAnswers(page, references[11]); await page.getByRole('button', { name: 'Vérifier ma réponse' }).click();
  assert.match(await page.locator('#feedback').innerText(), /#FF8040/);
  await page.locator('.help-card').getByRole('button', { name: 'Comprendre RGB' }).click(); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Mon bilan', exact: true }).click();
  assert.equal(await page.locator('[data-exercise="s2e6"] .status').innerText(), 'Réussi sans aide');
  assert.deepEqual(failures, []); assert.deepEqual(external, []);
});
test('Aucune erreur JavaScript pendant les parcours', () => { assert.deepEqual(errors, []); });
