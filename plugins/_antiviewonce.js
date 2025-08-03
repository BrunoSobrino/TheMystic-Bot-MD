const {downloadContentFromMessage} = (await import("baileys"));

export async function before(m, {isAdmin, isBotAdmin}) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins._antiviewonce
  
  const chat = db.data.chats[m.chat];
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
  if (!chat?.antiviewonce || chat?.isBanned) return;
  
  // Detectar viewOnce de diferentes maneras según la versión de WhatsApp
  if (m.viewOnce || m.message?.viewOnceMessage || m.message?.viewOnceMessageV2 || 
      (m.message && (m.message.imageMessage?.viewOnce || m.message.videoMessage?.viewOnce || m.message.audioMessage?.viewOnce))) {
    
    let msg, type;
    
    // Determinar la estructura del mensaje según el tipo
    if (m.message?.viewOnceMessage) {
      msg = m.message.viewOnceMessage.message;
      type = Object.keys(msg)[0];
    } else if (m.message?.viewOnceMessageV2) {
      msg = m.message.viewOnceMessageV2.message;
      type = Object.keys(msg)[0];
    } else if (m.message?.imageMessage?.viewOnce) {
      msg = m.message;
      type = 'imageMessage';
    } else if (m.message?.videoMessage?.viewOnce) {
      msg = m.message;
      type = 'videoMessage';
    } else if (m.message?.audioMessage?.viewOnce) {
      msg = m.message;
      type = 'audioMessage';
    } else {
      // Fallback al método original
      msg = m;
      type = m.mtype;
    }
    
    try {
      const mediaType = type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'audio';
      const media = await downloadContentFromMessage(msg[type] || msg, mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      const cap = tradutor.texto1;
      const originalCaption = msg[type]?.caption || msg?.caption || '';
      
      if (mediaType === 'video') {
        return await mconn.conn.sendMessage(m.chat, { 
          video: buffer, 
          caption: `${originalCaption ? originalCaption + '\n\n' + cap : cap}`,
          mimetype: 'video/mp4'
        }, { quoted: m });
      } else if (mediaType === 'image') {
        return await mconn.conn.sendMessage(m.chat, { 
          image: buffer, 
          caption: `${originalCaption ? originalCaption + '\n\n' + cap : cap}`,
          mimetype: 'image/jpeg'
        }, { quoted: m });
      } else if (mediaType === 'audio') {
        return await mconn.conn.sendMessage(m.chat, { 
          audio: buffer, 
          ptt: true,
          mimetype: 'audio/ogg; codecs=opus'
        }, { quoted: m });
      }
    } catch (error) {
      console.error('Error en antiviewonce:', error);
      
      // Método alternativo si falla el primero
      try {
        const mediaType = type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'audio';
        const media = await downloadContentFromMessage(m, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        const cap = tradutor.texto1;
        
        if (mediaType === 'video') {
          return await mconn.conn.sendMessage(m.chat, { 
            video: buffer, 
            caption: cap,
            mimetype: 'video/mp4'
          }, { quoted: m });
        } else if (mediaType === 'image') {
          return await mconn.conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: cap,
            mimetype: 'image/jpeg'
          }, { quoted: m });
        } else if (mediaType === 'audio') {
          return await mconn.conn.sendMessage(m.chat, { 
            audio: buffer, 
            ptt: true,
            mimetype: 'audio/ogg; codecs=opus'
          }, { quoted: m });
        }
      } catch (secondError) {
        console.error('Error en método alternativo:', secondError);
        return;
      }
    }
  }
}
