/* Fix de seguridad (2026-11-25) para plugins/owner-cleartmp.js.
 * Problema: borraba TODO tmpdir() del sistema (archivos de otros
 * procesos/usuarios del servidor), no solo el tmp del bot; además
 * unlinkSync sobre carpetas revienta (EISDIR) y `fs.readFileSync` se
 * usaba sin importar `fs` (solo funciona por el global.fs de api.js).
 * Fix: solo src/tmp del bot, solo archivos (se saltan carpetas), cada
 * borrado con su propio try/catch, y readFileSync importado y usado
 * directamente. Sin cambios de comando ni de claves i18n.
 */
import path, {join} from 'path';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
} from 'fs';

const handler = async (m, {conn, usedPrefix: _p, __dirname, args}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.owner_cleartmp;

  conn.reply(m.chat, tradutor.texto1, m);

  // Solo la carpeta tmp del bot. Ya no se toca tmpdir() del sistema.
  const dir = join(__dirname, '../src/tmp');
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    const full = join(dir, file);
    try {
      if (statSync(full).isFile()) unlinkSync(full);
    } catch (e) {
      console.error('[cleartmp] no se pudo borrar', full, e.message);
    }
  }
};
handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(cleartmp|cleartemp)$/i;
handler.rowner = true;
export default handler;
