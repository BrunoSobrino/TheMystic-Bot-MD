const {downloadContentFromMessage} = (await import("baileys"));

// Cache para almacenar mensajes viewOnce antes de que sean procesados
const viewOnceCache = new Map();

export async function before(m, {isAdmin, isBotAdmin}) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins._antiviewonce
  
  const chat = db.data.chats[m.chat];
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
  if (!chat?.antiviewonce || chat?.isBanned) return;
  
  // Método 1: Interceptar ANTES del procesamiento usando el mensaje raw
  if (m.message && !m.messageStubType) {
    // Verificar si es viewOnce en diferentes estructuras
    let isViewOnce = false;
    let msgContent = null;
    let mediaType = null;
    
    if (m.message.viewOnceMessage) {
      isViewOnce = true;
      msgContent = m.message.viewOnceMessage.message;
      const type = Object.keys(msgContent)[0];
      mediaType = type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'audio';
    } else if (m.message.viewOnceMessageV2) {
      isViewOnce = true;
      msgContent = m.message.viewOnceMessageV2.message;
      const type = Object.keys(msgContent)[0];
      mediaType = type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'audio';
    } else if (m.message.imageMessage?.viewOnce) {
      isViewOnce = true;
      msgContent = m.message;
      mediaType = 'image';
    } else if (m.message.videoMessage?.viewOnce) {
      isViewOnce = true;
      msgContent = m.message;
      mediaType = 'video';
    } else if (m.message.audioMessage?.viewOnce) {
      isViewOnce = true;
      msgContent = m.message;
      mediaType = 'audio';
    }
    
    if (isViewOnce && msgContent) {
      try {
        // Obtener el tipo de mensaje correcto
        const messageType = mediaType === 'image' ? 'imageMessage' : 
                           mediaType === 'video' ? 'videoMessage' : 'audioMessage';
        
        // Intentar descargar usando diferentes métodos
        let buffer = null;
        
        // Método A: downloadContentFromMessage con mensaje original
        try {
          const media = await downloadContentFromMessage(msgContent[messageType] || msgContent, mediaType);
          buffer = Buffer.from([]);
          for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
          }
        } catch (error1) {
          console.log('Método A falló, intentando método B...');
          
          // Método B: Usar función download si existe
          try {
            if (m.download && typeof m.download === 'function') {
              buffer = await m.download();
            }
          } catch (error2) {
            console.log('Método B falló, intentando método C...');
            
            // Método C: Cachear y procesar después
            const cacheKey = `${m.key.remoteJid}_${m.key.id}`;
            viewOnceCache.set(cacheKey, {
              msgContent,
              mediaType,
              messageType,
              chat: m.chat,
              sender: m.sender,
              caption: msgContent[messageType]?.caption || msgContent.caption
            });
            
            // Programar procesamiento después de un pequeño delay
            setTimeout(async () => {
              const cached = viewOnceCache.get(cacheKey);
              if (cached) {
                await processViewOnceFromCache(cached, tradutor, mconn.conn, m);
                viewOnceCache.delete(cacheKey);
              }
            }, 100);
            
            return;
          }
        }
        
        if (buffer && buffer.length > 0) {
          const cap = tradutor.texto1;
          const originalCaption = msgContent[messageType]?.caption || msgContent.caption || '';
          
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
              ptt: msgContent[messageType]?.ptt || true,
              mimetype: msgContent[messageType]?.mimetype || 'audio/ogg; codecs=opus'
            }, { quoted: m });
          }
        }
      } catch (error) {
        console.error('Error procesando viewOnce:', error);
        
        // Método de último recurso: Notificar que se detectó viewOnce
        try {
          const cap = tradutor.texto1;
          await mconn.conn.sendMessage(m.chat, { 
            text: `🔍 ${cap}\n\n_El contenido viewOnce fue detectado pero no pudo ser recuperado._`
          }, { quoted: m });
        } catch (notifyError) {
          console.error('Error enviando notificación:', notifyError);
        }
      }
    }
  }
}

// Función auxiliar para procesar desde cache
async function processViewOnceFromCache(cached, tradutor, conn, originalMsg) {
  try {
    const media = await downloadContentFromMessage(cached.msgContent[cached.messageType] || cached.msgContent, cached.mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of media) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    const cap = tradutor.texto1;
    const originalCaption = cached.caption || '';
    
    if (cached.mediaType === 'video') {
      return await conn.sendMessage(cached.chat, { 
        video: buffer, 
        caption: `${originalCaption ? originalCaption + '\n\n' + cap : cap}`,
        mimetype: 'video/mp4'
      }, { quoted: originalMsg });
    } else if (cached.mediaType === 'image') {
      return await conn.sendMessage(cached.chat, { 
        image: buffer, 
        caption: `${originalCaption ? originalCaption + '\n\n' + cap : cap}`,
        mimetype: 'image/jpeg'
      }, { quoted: originalMsg });
    } else if (cached.mediaType === 'audio') {
      return await conn.sendMessage(cached.chat, { 
        audio: buffer, 
        ptt: true,
        mimetype: 'audio/ogg; codecs=opus'
      }, { quoted: originalMsg });
    }
  } catch (error) {
    console.error('Error procesando desde cache:', error);
  }
}
