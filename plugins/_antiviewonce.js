const {downloadContentFromMessage} = (await import("baileys"));

export async function before(m, {isAdmin, isBotAdmin}) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins._antiviewonce
  
  const chat = db.data.chats[m.chat];
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
  if (!chat?.antiviewonce || chat?.isBanned) return;
  
  if (m.viewOnce) {
    const msg = m;
    const type = msg.mtype;
    
    try {
      const media = await downloadContentFromMessage(msg, type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      const cap = tradutor.texto1
      
      if (/video/.test(type)) {
        return await mconn.conn.sendMessage(m.chat, { 
          video: buffer, 
          caption: `${msg?.caption ? msg?.caption + '\n\n' + cap : cap}`,
          mimetype: 'video/mp4'
        }, { quoted: m });
      } else if (/image/.test(type)) {
        return await mconn.conn.sendMessage(m.chat, { 
          image: buffer, 
          caption: `${msg?.caption ? msg?.caption + '\n\n' + cap : cap}`,
          mimetype: 'image/jpeg'
        }, { quoted: m });
      } else if (/audio/.test(type)) {
        return await mconn.conn.sendMessage(m.chat, { 
          audio: buffer, 
          ptt: true,
          mimetype: 'audio/ogg; codecs=opus'
        }, { quoted: m });
      }
    } catch (error) {
      console.error('Error en antiviewonce:', error);
      return;
    }
  }
}
