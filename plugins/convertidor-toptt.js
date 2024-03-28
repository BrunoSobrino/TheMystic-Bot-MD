import {toPTT} from '../lib/converter.js';


const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_toptt

  const q = m.quoted ? m.quoted : m;
  const mime = (m.quoted ? m.quoted : m.msg).mimetype || '';
  if (!/video|audio/.test(mime)) throw `*${tradutor.texto1}*`;
  const media = await q.download?.();
  if (!media && !/video/.test(mime)) throw `*${tradutor.texto2}*`;
  if (!media && !/audio/.test(mime)) throw `*${tradutor.texto3}*`;
  const audio = await toPTT(media, 'mp4');
  if (!audio.data && !/audio/.test(mime)) throw `*${tradutor.texto4}*`;
  if (!audio.data && !/video/.test(mime)) throw `*${tradutor.texto5}*`;
  const aa = conn.sendFile(m.chat, audio.data, 'error.mp3', '', m, true, {mimetype: 'audio/mpeg'});
  if (!aa) return conn.sendMessage(m.chat, {audio: {url: media}, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true}, {quoted: m});
};
handler.help = ['tovn (reply)'];
handler.tags = ['audio'];
handler.command = /^to(vn|(ptt)?)$/i;
export default handler;
