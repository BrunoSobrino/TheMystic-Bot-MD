import * as googleTTS from '@sefinek/google-tts-api';
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
 if (!text) throw `*${tradutor.texto1[0]} ${usedPrefix + command} ${tradutor.texto1[1]}*`;
 let res;
 try {
   res = googleTTS.getAudioUrl(text, { lang: lang || 'es', slow: false, host: 'https://translate.google.com' });
 } catch (e) {
   // Si el idioma pedido falla, reintentar con el idioma por defecto
   // (antes el respaldo llamaba a gtts(), que nunca se importó).
   try {
     res = googleTTS.getAudioUrl(text, { lang: defaultLang, slow: false, host: 'https://translate.google.com' });
   } catch (e2) {
     return m.reply(e2 + '');
   }
 }
 if (res) {
  conn.sendPresenceUpdate('recording', m.chat);
  conn.sendMessage(m.chat, { audio: { url: res }, fileName: 'tts.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
 }
};

handler.help = ['tts'];
handler.tags = ['converter'];
handler.command = ['tts'];

export default handler;
