/* Fix de seguridad (2026-11-25) para plugins/owner-saveimage.js.
 * Problema: `const path = `src/${text}`` — el owner escribe el nombre y
 * `../../config.js` (o cualquier ruta con `../`) sale de src/ y
 * sobrescribe archivos del bot. Además `await fs.writeFileSync` (sync con await).
 * Fix: solo el nombre base, caracteres seguros, y verificación de que la
 * ruta resuelta sigue dentro de src/. Sin cambios de comando ni de claves i18n.
 */
import fs from 'fs';
import path from 'path';

let handler = async (m, {text}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.owner_saveimage;

  if (!text) throw tradutor.texto1;
  if (!m.quoted || !m.quoted.fileSha256) throw tradutor.texto2;
  let media = await m.quoted.download();

  // Solo el nombre del archivo, sin carpetas ni caracteres de ruta.
  const name = path.basename(text.trim()).replace(/[^A-Za-z0-9._-]/g, '');
  if (!name || name === '.' || name === '..') throw tradutor.texto1;
  const filePath = path.join('src', name);
  const resolved = path.resolve(filePath);
  const srcDir = path.resolve('src');
  if (resolved !== srcDir && !resolved.startsWith(srcDir + path.sep)) throw tradutor.texto1;

  fs.writeFileSync(filePath, media);
  m.reply(`${tradutor.texto3} ${filePath}`);
};

handler.help = ['saveimage <nome>'];
handler.tags = ['tools'];
handler.command = /^(saveimage|sp)$/i;
handler.owner = true;

export default handler;
