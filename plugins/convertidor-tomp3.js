import {toAudio} from '../lib/converter.js';
import _translate from "./_translate.js"
const tradutor = _translate.plugins.convertidor_tomp3
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn, usedPrefix, command}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';
  if (!/video|audio/.test(mime)) throw `*${tradutor.texto1}*`;
  const media = await q.download();
  if (!media) throw `*${tradutor.texto2}*`;
  const audio = await toAudio(media, 'mp4');
  if (!audio.data) throw `*${tradutor.texto3}*`;
  conn.sendMessage(m.chat, {audio: audio.data, mimetype: 'audio/mpeg'}, {quoted: m});
};
handler.alias = ['tomp3', 'toaudio'];
handler.command = /^to(mp3|audio)$/i;
export default handler;
