/* By https://github.com/ALBERTO9883/NyanCatBot-MD */
import fetch from 'node-fetch';
import {sticker} from '../src/libraries/sticker.js';


const handler = async (m, {conn, text, usedPrefix, command}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.downloader_stickerpack;

  if (!text) throw `${tradutor.texto1} ${usedPrefix + command}* https://getstickerpack.com/stickers/flork-memes-4-1`;
  try {
    const url = text;
    const res = await fetch(`https://api.akuari.my.id/downloader/stickerpack?link=${url}`);
    const json = await res.json();
    for (const data of (json.result || json)) {
      const stikers = await sticker(false, data, global.packname, global.author);
      conn.sendFile(m.chat, stikers, null, {asSticker: true}, m, true, {contextInfo: {'forwardingScore': 200, 'isForwarded': true}}, {quoted: m});
      // await delay(1500)
    }
  } catch {
    await m.reply(`${tradutor.texto2}`);
  }
};
handler.command = /^stickerpack$/i;
export default handler;
// const delay = time => new Promise(res => setTimeout(res, time))
