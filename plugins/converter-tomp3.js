import {toAudio} from '../src/libraries/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
 const datas = global
 const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.convertidor_tomp3

 const q = m.quoted ? m.quoted : m;
 const mime = (q || q.msg).mimetype || q.mediaType || '';
 if (!/video|audio/.test(mime)) throw `*${tradutor.texto1}*`;
 const media = await q.download();
 if (!media) throw `*${tradutor.texto2}*`;
 const audio = await toAudio(media, 'mp4');
 if (!audio.data) throw `*${tradutor.texto3}*`;
 conn.sendMessage(m.chat, { audio: audio.data, mimetype: 'audio/mpeg' }, { quoted: m });
};

handler.help = ['tomp3'];
handler.tags = ['converter'];
handler.command = ['tomp3', 'toaudio'];

export default handler;
