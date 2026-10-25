'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const moduleRoot = path.join(root, 'maths/numeration/changements-de-base');
function load() {
  const context = vm.createContext({ window: {} });
  ['data', 'conversions', 'exercises', 'storage'].forEach(name => vm.runInContext(fs.readFileSync(path.join(moduleRoot, 'js', name + '.js'), 'utf8'), context));
  return context.window.MissionBinaire;
}
module.exports = { root, moduleRoot, load };
