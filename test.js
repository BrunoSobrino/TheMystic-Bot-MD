import fs from 'fs';
import path, {dirname} from 'path';
import assert from 'assert';
import syntaxError from 'syntax-error';
import {fileURLToPath} from 'url';
import {createRequire} from 'module';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(__dirname);
// Se revisan la raíz y las carpetas de package.json.directories de forma
// RECURSIVA. Antes solo se leía el primer nivel de cada carpeta y
// src/libraries/ (y cualquier subcarpeta de plugins/) quedaba fuera.
const folders = ['.', ...Object.keys(require(path.join(__dirname, './package.json')).directories)];
const files = new Set();
function collect(folder) {
  for (const entry of fs.readdirSync(folder, {withFileTypes: true})) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      collect(full);
    } else if (entry.name.endsWith('.js')) {
      files.add(path.resolve(full));
    }
  }
}
for (const folder of folders) collect(folder);
for (const file of files) {
  if (file == __filename) continue;
  console.error('Checking', file);
  const error = syntaxError(fs.readFileSync(file, 'utf8'), file, {
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
  });
  if (error) assert.ok(error.length < 1, file + '\n\n' + error);
  assert.ok(file);
  console.log('Done', file);
}
