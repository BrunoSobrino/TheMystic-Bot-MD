const {downloadContentFromMessage} = (await import("baileys"));

const handler = async (m, {conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_readviewonce

  if (!m.quoted) throw tradutor.texto1;
  if (!m.quoted.viewOnce) throw tradutor.texto2;
  const msg = m.quoted;
  const type = msg.mtype 
  const media = await downloadContentFromMessage(msg, type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
  let buffer = Buffer.from([]);
  for await (const chunk of media) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  if (/video/.test(type)) {
    return conn.sendMessage(m.chat, { video: buffer, caption: msg?.caption ? msg?.caption : '' }, { quoted: m });
  } else if (/image/.test(type)) {
    return conn.sendMessage(m.chat, { image: buffer, caption: msg?.caption ? msg?.caption : '' }, { quoted: m });
  } else if (/audio/.test(type)) {
    return conn.sendMessage(m.chat, { audio: buffer, ptt: true }, { quoted: m });
  }
};
handler.help = ['readvo'];
handler.tags = ['tools'];
handler.command = /^(readviewonce|read|revelar|readvo)$/i;
export default handler;
