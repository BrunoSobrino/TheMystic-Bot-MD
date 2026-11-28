/**
 * RE-JD — comando de prueba para TheMystic-Bot-MD.
 * Adaptado de https://github.com/ReyEndymion/RE-JD (GPL-3.0, idea de Rey).
 *
 * Flujo:
 *   1. Usuario: .jd <nombre o enlace>
 *   2. El bot le pide a JDownloader 2 (por HTTP) que analice el enlace.
 *   3. El servidor responde con los formatos disponibles.
 *   4. El bot pregunta en WhatsApp qué archivo quiere y en qué calidad.
 *   5. El usuario responde con el número; el bot descarga y envía el
 *      archivo por WhatsApp, y borra el temporal.
 *
 * JDownloader 2 es Java y corre en un proceso aparte del bot, en el MISMO
 * servidor (el bot lee el archivo descargado del disco con fs). El bot
 * solo habla con él por HTTP (ver src/libraries/jdownloader.js).
 *
 * Configuración (variables de entorno del panel; sin .env en este bot):
 *   JD_API_URL       por defecto http://127.0.0.1:3129 (JD2 en la misma máquina)
 *   JD_API_USER / JD_API_PASSWORD   solo si JD2 pide autenticación
 *   DOWNLOAD_DIR     carpeta de descarga de JD2 (por defecto ./downloads)
 *   MAX_FILE_MB      límite por archivo (por defecto 500)
 *
 * Sin un JD2 corriendo, el comando responde que el servidor no responde.
 * La elección pendiente vive en memoria: se pierde si el bot reinicia.
 */
import fs from 'fs';
import { JDownloaderClient } from '../src/libraries/jdownloader.js';
import { normalizeVariants, variantsText } from '../src/libraries/jd-formats.js';

const jd = new JDownloaderClient();
const pendingChoices = new Map(); // sender -> { variants, chatId }

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_jd;

  const input = (text || '').trim();
  if (!input) {
    return conn.reply(m.chat, `${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}`, m);
  }

  const health = await jd.health();
  if (!health.ok) {
    return conn.reply(m.chat, tradutor.texto2[0], m);
  }

  await conn.reply(m.chat, tradutor.texto3[0], m);
  let result;
  try {
    result = await jd.ask(input, { chatId: m.chat });
  } catch (err) {
    return conn.reply(m.chat, `${tradutor.texto4[0]}${err.message}`, m);
  }

  const variants = normalizeVariants(result.links);
  if (variants.length === 0) {
    return conn.reply(m.chat, tradutor.texto5[0], m);
  }

  if (variants.length === 1) {
    // Un solo formato: no hay nada que preguntar, se descarga directo.
    return downloadAndSend(conn, m, variants[0], tradutor);
  }

  pendingChoices.set(m.sender, { variants, chatId: m.chat });
  return conn.reply(m.chat, `${tradutor.texto6[0]}\n\n${variantsText(variants)}`, m);
};

handler.before = async (m, { conn }) => {
  const pending = pendingChoices.get(m.sender);
  if (!pending || !m.text) return false;
  const choice = Number((m.text || '').trim());
  if (!Number.isInteger(choice) || choice < 1 || choice > pending.variants.length) return false;
  pendingChoices.delete(m.sender);
  const variant = pending.variants[choice - 1];
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_jd;
  await downloadAndSend(conn, m, variant, tradutor);
  return true;
};

async function downloadAndSend(conn, m, variant, tradutor) {
  await conn.reply(m.chat, `${tradutor.texto7[0]} ${variant.nombre} (${variant.tamanoTexto})...`, m);
  try {
    const { filePath } = await jd.download(m.chat, {
      linkIds: [variant.variantId],
      fileName: variant.nombre,
    });
    // El archivo está en el disco del servidor donde corre JD2; el bot lo
    // lee de ahí, por eso JD2 debe correr en la misma máquina que el bot.
    const file = filePath && fs.existsSync(filePath) ? filePath : null;
    if (!file) {
      return conn.reply(m.chat, tradutor.texto8[0], m);
    }
    await conn.sendFile(m.chat, file, variant.nombre, '', m);
    // Limpieza del temporal: el archivo ya se envió, no se guarda.
    try {
      fs.unlinkSync(file);
    } catch {}
  } catch (err) {
    await conn.reply(m.chat, `${tradutor.texto9[0]}${err.message}`, m);
  }
}

handler.help = ['jd <nombre o enlace>'];
handler.tags = ['downloader'];
handler.command = ['jd', 'jdownloader'];
export default handler;
