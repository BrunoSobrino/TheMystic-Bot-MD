/* rvo / readviewonce con el Baileys OFICIAL del bot ("baileys" ^7.0.0-rc14).
 * Fusión (2026-11-25) del plugin que le pasaron a Bruno (comando rvo, importaba
 * de @rexxhayanasi/elaina-baileys) con el plugins/tools-readviewonce.js
 * que YA existe en master: mismo comando, mismas claves i18n
 * (herramientas_readviewonce texto1/2/3), sin fork y sin dependencia nueva.
 * Lo nuevo frente al plugin actual: alias `rvo`, desenvuelve
 * viewOnceMessageV2/V2Extension, lee view-once de TEXTO, y soporta
 * documento y sticker (además de imagen/vídeo/audio que ya tenía).
 * NO se sube como plugin aparte: su regex pisaría a readviewonce
 * (.readviewonce dispararía los dos plugins). Reemplaza a
 * plugins/tools-readviewonce.js.
 *
 * Fix 2026-11-26: la cita de un view-once NO trae las claves del medio
 * (WhatsApp quita mediaKey/directPath de la copia citada), así que la
 * descarga desde la cita devolvía vacío y el comando fallaba con
 * "Error al procesar el archivo viewOnce" aunque el mensaje sí era
 * view-once. Ahora, si la cita no trae con qué descargar, se lee el
 * mensaje ORIGINAL guardado por el bot (m.getQuotedObj, que usa
 * conn.loadMessage sobre el store) y se descarga desde ahí.
 */

import {extractMessageContent, downloadContentFromMessage} from 'baileys';

const VIEW_ONCE_WRAPPERS = ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'];

function unwrapViewOnce(message) {
  let content = message;
  const wrappers = [];
  for (let depth = 0; content && typeof content === 'object' && depth < 8; depth++) {
    const key = Object.keys(content).find((k) => VIEW_ONCE_WRAPPERS.includes(k));
    if (!key) break;
    wrappers.push(key);
    content = content[key]?.message;
  }
  return {content, wrappers};
}

function pickContentType(content) {
  if (!content || typeof content !== 'object') return null;
  if (typeof content.conversation === 'string') return 'conversation';
  return (
    Object.keys(content).find(
      (k) => k.endsWith('Message') && k !== 'senderKeyDistributionMessage' && k !== 'messageContextInfo',
    ) || null
  );
}

function textOf(type, body) {
  if (type === 'conversation') return typeof body === 'string' ? body : '';
  return body?.text || body?.caption || '';
}

async function downloadMedia(conn, body, type) {
  if (typeof conn?.downloadM === 'function') return conn.downloadM(body, type);
  const stream = await downloadContentFromMessage(body, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

// Candidatos view-once, en orden: primero la copia citada (rápida) y
// luego el mensaje original guardado por el bot. La cita de un view-once
// no trae mediaKey/directPath, así que para medios solo sirve el
// candidato que traiga con qué descargar; para texto sirve cualquiera.
function resolveViewOnceCandidates(m) {
  const sources = [];
  const rawQuoted = m.msg?.contextInfo?.quotedMessage;
  if (rawQuoted) sources.push(rawQuoted);
  try {
    const orig = m.getQuotedObj?.();
    if (orig?.message) sources.push(orig.message);
  } catch {}
  const candidates = [];
  for (const src of sources) {
    const {content: unwrapped, wrappers} = unwrapViewOnce(src);
    const content = extractMessageContent(unwrapped) || unwrapped;
    const type = pickContentType(content);
    if (!type) continue;
    const body = type !== 'conversation' ? content[type] : content?.conversation;
    const isViewOnce = wrappers.length > 0 || body?.viewOnce === true;
    if (!isViewOnce) continue;
    candidates.push({content, type, body, wrappers});
  }
  return candidates;
}

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.herramientas_readviewonce;

  if (!m.quoted) throw tradutor.texto1;

  const candidates = resolveViewOnceCandidates(m);
  if (!candidates.length) throw tradutor.texto2;

  const first = candidates[0];
  const type = first.type;

  if (type === 'conversation' || type === 'extendedTextMessage') {
    const text = candidates.map((c) => textOf(c.type, c.body)).find((t) => t) || '';
    if (!text) throw tradutor.texto3;
    return conn.sendMessage(m.chat, {text: `*View-Once (${first.wrappers[0] || 'viewOnce'})*\n\n${text}`}, {quoted: m});
  }

  const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
  if (mediaTypes.includes(type)) {
    let buffer;
    let used;
    for (const c of candidates) {
      if (c.type !== type) continue;
      if (!(c.body?.directPath || c.body?.url)) continue;
      try {
        const b = await downloadMedia(conn, c.body, type.replace('Message', ''));
        if (b?.length) {
          buffer = b;
          used = c;
          break;
        }
      } catch (e) {
        console.error('[rvo] download falló:', e);
      }
    }
    if (!buffer || !buffer.length) throw tradutor.texto3;

    const caption = textOf(type, used.body) || '';
    const body = used.body;
    const payload =
      type === 'imageMessage'
        ? {image: buffer, caption}
        : type === 'videoMessage'
          ? {video: buffer, caption, mimetype: body.mimetype || 'video/mp4'}
          : type === 'audioMessage'
            ? {audio: buffer, mimetype: body.mimetype || 'audio/ogg; codecs=opus', ptt: !!body.ptt}
            : type === 'stickerMessage'
              ? {sticker: buffer}
              : {
                  document: buffer,
                  mimetype: body.mimetype || 'application/octet-stream',
                  fileName: body.fileName || `viewonce-${Date.now()}`,
                  caption,
                };
    return conn.sendMessage(m.chat, payload, {quoted: m});
  }

  const inner = JSON.parse(JSON.stringify(first.content));
  const innerType = pickContentType(inner);
  if (innerType && inner[innerType] && typeof inner[innerType] === 'object') delete inner[innerType].viewOnce;
  try {
    return await conn.relayMessage(m.chat, inner, {});
  } catch (e) {
    console.error('[rvo] relay falló:', e);
    throw tradutor.texto3;
  }
};

handler.help = ['readvo', 'rvo'];
handler.tags = ['tools'];
handler.command = /^(readviewonce|read|revelar|readvo|rvo)$/i;
export default handler;
