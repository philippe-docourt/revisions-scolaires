'use strict';
// Copie de distribution facultative : aucune compilation, aucun déploiement.
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const activity = 'maths/numeration/changements-de-base';
const files = [
  'index.html', 'css/site.css', 'js/catalogue.js',
  `${activity}/index.html`, `${activity}/css/styles.css`,
  ...['data', 'conversions', 'exercises', 'guides', 'storage', 'app'].map(name => `${activity}/js/${name}.js`)
];
async function exportSite(destination) {
  // Do not remove destination: preserve any pre-existing user files.
  await fs.mkdir(destination, { recursive: true });
  for (const file of files) {
    const target = path.join(destination, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(path.join(root, file), target);
  }
  return files;
}
if (require.main === module) {
  exportSite(path.join(root, 'artifacts/site')).then(files => {
    console.log(`${files.length} fichiers web copiés dans artifacts/site. Aucun site publié.`);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { exportSite, files };
