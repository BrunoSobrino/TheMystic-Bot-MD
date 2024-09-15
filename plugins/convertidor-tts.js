import * as googleTTS from '@sefinek/google-tts-api'
import {readFileSync, unlinkSync} from 'fs';
import {join} from 'path';
const defaultLang = 'es';

const handler = async (m, {conn, args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_tts

  let lang = args[0];
  let text = args.slice(1).join(' ');
  if ((args[0] || '').length !== 2) {
    lang = defaultLang;
    text = args.join(' ');
  }
  if (!text && m.quoted?.text) text = m.quoted.text;
  let res;
  try {
    res = googleTTS.getAudioUrl(text, { lang: lang || 'es', slow: false, host: 'https://translate.google.com' });
  } catch (e) {
    m.reply(e + '');
    text = args.join(' ');
    if (!text) throw `*${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}*`;
    res = await tts(text, defaultLang);
  } finally {
    if (res) {
        conn.sendPresenceUpdate('recording', m.chat);
        conn.sendMessage(m.chat, {audio: {url: res}, fileName: 'tts.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
    }
  }
};
handler.help = ['tts <lang> <teks>'];
handler.tags = ['tools'];
handler.command = /^g?tts$/i;
export default handler;

function tts(text, lang = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const tts = gtts(lang);
      const filePath = join(global.__dirname(import.meta.url), '../src/tmp', (1 * new Date) + '.wav');
      tts.save(filePath, text, () => {
        resolve(readFileSync(filePath));
        unlinkSync(filePath);
      });
    } catch (e) {
      reject(e);
    }
  });
}
