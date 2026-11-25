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

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.herramientas_readviewonce;

  if (!m.quoted) throw tradutor.texto1;

  const rawQuoted = m.msg?.contextInfo?.quotedMessage || null;

  // Sin mensaje crudo (o sin envoltura view-once V2): camino actual del plugin,
  // que ya funciona en master para imagen/vídeo/audio.
  if (!rawQuoted) {
    if (!m.quoted.viewOnce) throw tradutor.texto2;
    const msg = m.quoted;
    const type = msg.mtype;
    try {
      const media = await downloadContentFromMessage(msg, type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      if (/video/.test(type)) {
        return await conn.sendMessage(m.chat, {video: buffer, caption: msg?.caption || '', mimetype: 'video/mp4'}, {quoted: m});
      } else if (/image/.test(type)) {
        return await conn.sendMessage(m.chat, {image: buffer, caption: msg?.caption || '', mimetype: 'image/jpeg'}, {quoted: m});
      } else if (/audio/.test(type)) {
        return await conn.sendMessage(m.chat, {audio: buffer, ptt: true, mimetype: 'audio/ogg; codecs=opus'}, {quoted: m});
      }
    } catch (error) {
      console.error('Error en readviewonce:', error);
      throw tradutor.texto3;
    }
    throw tradutor.texto3;
  }

  const {content: unwrapped, wrappers} = unwrapViewOnce(rawQuoted);
  const content = extractMessageContent(unwrapped) || unwrapped;
  const type = pickContentType(content);
  const body = type && type !== 'conversation' ? content[type] : content?.conversation;
  const isViewOnce = wrappers.length > 0 || body?.viewOnce === true || m.quoted?.viewOnce === true;

  if (!type) throw tradutor.texto3;
  if (!isViewOnce) throw tradutor.texto2;

  if (type === 'conversation' || type === 'extendedTextMessage') {
    const text = textOf(type, body);
    if (!text) throw tradutor.texto3;
    return conn.sendMessage(m.chat, {text: `*View-Once (${wrappers[0] || 'viewOnce'})*\n\n${text}`}, {quoted: m});
  }

  const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
  if (mediaTypes.includes(type)) {
    let buffer;
    try {
      buffer = await downloadMedia(conn, body, type.replace('Message', ''));
    } catch (e) {
      console.error('[rvo] download falló:', e);
    }
    if (!buffer || !buffer.length) throw tradutor.texto3;

    const caption = textOf(type, body) || '';
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

  const inner = JSON.parse(JSON.stringify(content));
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
