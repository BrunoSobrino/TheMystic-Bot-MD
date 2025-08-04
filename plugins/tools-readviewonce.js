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
  
  try {
    const media = await downloadContentFromMessage(msg, type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
    let buffer = Buffer.from([]);
    for await (const chunk of media) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    if (/video/.test(type)) {
      return await conn.sendMessage(m.chat, { 
        video: buffer, 
        caption: msg?.caption || '',
        mimetype: 'video/mp4'
      }, { quoted: m });
    } else if (/image/.test(type)) {
      return await conn.sendMessage(m.chat, { 
        image: buffer, 
        caption: msg?.caption || '',
        mimetype: 'image/jpeg'
      }, { quoted: m });
    } else if (/audio/.test(type)) {
      return await conn.sendMessage(m.chat, { 
        audio: buffer, 
        ptt: true,
        mimetype: 'audio/ogg; codecs=opus'
      }, { quoted: m });
    }
  } catch (error) {
    console.error('Error en readviewonce:', error);
    throw 'Error al procesar el archivo viewOnce';
  }
};
handler.help = ['readvo'];
handler.tags = ['tools'];
handler.command = /^(readviewonce|read|revelar|readvo)$/i;
export default handler;
