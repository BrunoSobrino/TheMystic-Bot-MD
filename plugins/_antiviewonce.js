const { downloadContentFromMessage } = (await import("baileys"));
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

// Cache para almacenar mensajes viewOnce
const viewOnceCache = new Map();
const processedMessages = new Set();

// Crear directorio para backup si no existe
const backupDir = './src/tmp/viewonce_backup';
if (!existsSync(backupDir)) {
  mkdirSync(backupDir, { recursive: true });
}

// Interceptor principal - DEBE ejecutarse ANTES de cualquier otro plugin
export async function before(m, { isAdmin, isBotAdmin }) {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins._antiviewonce;
  
  const chat = db.data.chats[m.chat];
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
  if (!chat?.antiviewonce || chat?.isBanned) return;
  
  const messageId = `${m.key.remoteJid}_${m.key.id}`;
  
  // Evitar procesamiento duplicado
  if (processedMessages.has(messageId)) return;
  
  // ESTRATEGIA 1: Interceptar mensaje RAW antes del procesamiento
  if (m.message && !m.messageStubType) {
    const result = await interceptViewOnceMessage(m, tradutor);
    if (result) {
      processedMessages.add(messageId);
      return result;
    }
  }
  
  // ESTRATEGIA 2: Interceptar usando eventos de WebSocket
  if (mconn.conn.ws && typeof mconn.conn.ws.on === 'function') {
    setupWebSocketInterception(mconn.conn, tradutor);
  }
  
  // ESTRATEGIA 3: Monitorear cambios en el objeto mensaje
  if (m.message) {
    setupMessageWatcher(m, tradutor);
  }
}

// Función principal de interceptación
async function interceptViewOnceMessage(m, tradutor) {
  try {
    let isViewOnce = false;
    let msgContent = null;
    let mediaType = null;
    let messageType = null;
    
    // Detectar diferentes tipos de viewOnce
    if (m.message.viewOnceMessage) {
      isViewOnce = true;
      msgContent = m.message.viewOnceMessage.message;
      const type = Object.keys(msgContent)[0];
      mediaType = getMediaTypeFromMessage(type);
      messageType = type;
    } else if (m.message.viewOnceMessageV2) {
      isViewOnce = true;
      msgContent = m.message.viewOnceMessageV2.message;
      const type = Object.keys(msgContent)[0];
      mediaType = getMediaTypeFromMessage(type);
      messageType = type;
    } else if (m.message.viewOnceMessageV2Extension) {
      isViewOnce = true;
      msgContent = m.message.viewOnceMessageV2Extension.message;
      const type = Object.keys(msgContent)[0];
      mediaType = getMediaTypeFromMessage(type);
      messageType = type;
    } else {
      // Verificar viewOnce en mensajes directos
      for (const [key, value] of Object.entries(m.message)) {
        if (value && typeof value === 'object' && value.viewOnce === true) {
          isViewOnce = true;
          msgContent = m.message;
          mediaType = getMediaTypeFromMessage(key);
          messageType = key;
          break;
        }
      }
    }
    
    if (isViewOnce && msgContent) {
      console.log('🔍 ViewOnce detectado, intentando interceptar...');
      
      // Intentar múltiples métodos de descarga
      const buffer = await attemptMultipleDownloadMethods(msgContent, messageType, mediaType, m);
      
      if (buffer && buffer.length > 0) {
        // Guardar backup del archivo
        const filename = `${Date.now()}_${m.key.id}.${getFileExtension(mediaType)}`;
        const filepath = path.join(backupDir, filename);
        writeFileSync(filepath, buffer);
        
        // Enviar el contenido interceptado
        return await sendInterceptedContent(buffer, msgContent, messageType, mediaType, tradutor, m);
      } else {
        // Si no se pudo descargar, intentar método de URL directa
        return await attemptDirectUrlMethod(msgContent, messageType, mediaType, tradutor, m);
      }
    }
  } catch (error) {
    console.error('Error en interceptViewOnceMessage:', error);
    return await sendFailureNotification(tradutor, m);
  }
  
  return false;
}

// Múltiples métodos de descarga
async function attemptMultipleDownloadMethods(msgContent, messageType, mediaType, m) {
  const methods = [
    // Método 1: downloadContentFromMessage con mensaje completo
    async () => {
      const media = await downloadContentFromMessage(msgContent[messageType] || msgContent, mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    },
    
    // Método 2: downloadContentFromMessage con configuración específica
    async () => {
      const messageData = msgContent[messageType] || msgContent;
      const media = await downloadContentFromMessage(messageData, mediaType, {
        reuploadRequest: mconn.conn.updateMediaMessage
      });
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    },
    
    // Método 3: Usar función download del mensaje
    async () => {
      if (m.download && typeof m.download === 'function') {
        return await m.download();
      }
      return null;
    },
    
    // Método 4: Clonar mensaje y descargar
    async () => {
      const clonedMessage = JSON.parse(JSON.stringify(msgContent));
      if (clonedMessage[messageType]) {
        const media = await downloadContentFromMessage(clonedMessage[messageType], mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      }
      return null;
    },
    
    // Método 5: Acceso directo a través de conn.getFile
    async () => {
      const messageData = msgContent[messageType] || msgContent;
      if (messageData.url) {
        const fileData = await mconn.conn.getFile(messageData.url);
        return fileData.data;
      }
      return null;
    }
  ];
  
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Intentando método ${i + 1}...`);
      const result = await methods[i]();
      if (result && result.length > 0) {
        console.log(`✅ Método ${i + 1} exitoso`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Método ${i + 1} falló:`, error.message);
    }
  }
  
  return null;
}

// Método de URL directa como último recurso
async function attemptDirectUrlMethod(msgContent, messageType, mediaType, tradutor, m) {
  try {
    const messageData = msgContent[messageType] || msgContent;
    if (messageData.url) {
      console.log('🔗 Intentando método de URL directa...');
      
      // Construir mensaje con URL y datos disponibles
      const mediaInfo = {
        url: messageData.url,
        mimetype: messageData.mimetype,
        fileLength: messageData.fileLength,
        seconds: messageData.seconds,
        caption: messageData.caption || '',
        mediaKey: messageData.mediaKey,
        directPath: messageData.directPath
      };
      
      const cap = `${tradutor.texto1}\n\n📎 **Información del medio:**\n🔗 URL: ${mediaInfo.url}\n📄 Tipo: ${mediaInfo.mimetype}\n📏 Tamaño: ${mediaInfo.fileLength} bytes${mediaInfo.seconds ? `\n⏱️ Duración: ${mediaInfo.seconds}s` : ''}${mediaInfo.caption ? `\n💬 Caption: ${mediaInfo.caption}` : ''}`;
      
      return await mconn.conn.sendMessage(m.chat, { 
        text: cap
      }, { quoted: m });
    }
  } catch (error) {
    console.error('Error en método de URL directa:', error);
  }
  
  return false;
}

// Enviar contenido interceptado
async function sendInterceptedContent(buffer, msgContent, messageType, mediaType, tradutor, m) {
  try {
    const cap = tradutor.texto1;
    const originalCaption = (msgContent[messageType]?.caption || msgContent.caption || '');
    const finalCaption = originalCaption ? `${originalCaption}\n\n${cap}` : cap;
    
    const options = { quoted: m };
    
    switch (mediaType) {
      case 'video':
        return await mconn.conn.sendMessage(m.chat, { 
          video: buffer, 
          caption: finalCaption,
          mimetype: msgContent[messageType]?.mimetype || 'video/mp4'
        }, options);
        
      case 'image':
        return await mconn.conn.sendMessage(m.chat, { 
          image: buffer, 
          caption: finalCaption,
          mimetype: msgContent[messageType]?.mimetype || 'image/jpeg'
        }, options);
        
      case 'audio':
        return await mconn.conn.sendMessage(m.chat, { 
          audio: buffer, 
          ptt: msgContent[messageType]?.ptt || true,
          mimetype: msgContent[messageType]?.mimetype || 'audio/ogg; codecs=opus',
          seconds: msgContent[messageType]?.seconds
        }, options);
        
      default:
        return await mconn.conn.sendMessage(m.chat, { 
          document: buffer,
          fileName: `intercepted_viewonce.${getFileExtension(mediaType)}`,
          caption: finalCaption,
          mimetype: msgContent[messageType]?.mimetype || 'application/octet-stream'
        }, options);
    }
  } catch (error) {
    console.error('Error enviando contenido interceptado:', error);
    return await sendFailureNotification(tradutor, m);
  }
}

// Configurar interceptación de WebSocket
function setupWebSocketInterception(conn, tradutor) {
  if (conn._wsInterceptionSetup) return; // Evitar múltiples configuraciones
  
  const originalOn = conn.ws.on;
  conn.ws.on = function(event, handler) {
    if (event === 'message') {
      const wrappedHandler = (data) => {
        try {
          // Intentar interceptar datos de viewOnce antes del procesamiento
          const parsed = JSON.parse(data);
          if (parsed && parsed.message && isViewOnceInRawData(parsed)) {
            console.log('🎯 ViewOnce detectado en WebSocket');
            // Cachear para procesamiento posterior
            viewOnceCache.set(`ws_${Date.now()}`, parsed);
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
        return handler(data);
      };
      return originalOn.call(this, event, wrappedHandler);
    }
    return originalOn.call(this, event, handler);
  };
  
  conn._wsInterceptionSetup = true;
}

// Configurar observador de cambios en mensajes
function setupMessageWatcher(m, tradutor) {
  // Usar Proxy para detectar cambios en el objeto mensaje
  const handler = {
    set(target, property, value) {
      if (property === 'messageStubType' && value === 2) {
        console.log('⚠️ Mensaje marcado como ausente, intentando recuperar del cache');
        attemptCacheRecovery(m, tradutor);
      }
      target[property] = value;
      return true;
    }
  };
  
  if (typeof Proxy !== 'undefined') {
    return new Proxy(m, handler);
  }
}

// Funciones auxiliares
function getMediaTypeFromMessage(messageType) {
  if (messageType.includes('image')) return 'image';
  if (messageType.includes('video')) return 'video';
  if (messageType.includes('audio')) return 'audio';
  if (messageType.includes('document')) return 'document';
  return 'unknown';
}

function getFileExtension(mediaType) {
  const extensions = {
    'image': 'jpg',
    'video': 'mp4',
    'audio': 'ogg',
    'document': 'bin'
  };
  return extensions[mediaType] || 'bin';
}

function isViewOnceInRawData(data) {
  if (!data || !data.message) return false;
  
  const message = data.message;
  return !!(
    message.viewOnceMessage || 
    message.viewOnceMessageV2 || 
    message.viewOnceMessageV2Extension ||
    Object.values(message).some(v => v && typeof v === 'object' && v.viewOnce === true)
  );
}

async function attemptCacheRecovery(m, tradutor) {
  // Intentar recuperar desde cache o backup
  const messageId = `${m.key.remoteJid}_${m.key.id}`;
  
  for (const [key, value] of viewOnceCache.entries()) {
    if (key.includes(m.key.id)) {
      console.log('📦 Recuperando desde cache...');
      // Procesar desde cache
      break;
    }
  }
}

async function sendFailureNotification(tradutor, m) {
  try {
    const cap = `🔍 ${tradutor.texto1}\n\n⚠️ _El contenido ViewOnce fue detectado pero no pudo ser recuperado completamente._\n\n💡 _Esto puede deberse a que WhatsApp procesó el mensaje antes de poder interceptarlo._`;
    return await mconn.conn.sendMessage(m.chat, { text: cap }, { quoted: m });
  } catch (error) {
    console.error('Error enviando notificación de fallo:', error);
  }
}

// Función de limpieza periódica
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of viewOnceCache.entries()) {
    if (now - value.timestamp > 300000) { // 5 minutos
      viewOnceCache.delete(key);
    }
  }
  
  // Limpiar mensajes procesados después de 10 minutos
  if (processedMessages.size > 1000) {
    processedMessages.clear();
  }
}, 60000); // Cada minuto
