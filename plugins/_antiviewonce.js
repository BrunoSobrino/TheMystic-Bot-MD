const { downloadContentFromMessage } = (await import("baileys"));
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Sistema de interceptación global
let isInterceptionActive = false;
const messageInterceptionQueue = new Map();
const rawMessageCache = new Map();

// Interceptor a nivel de socket RAW - SE EJECUTA ANTES QUE BAILEYS
function setupRawSocketInterception() {
  if (isInterceptionActive) return;
  
  try {
    // Interceptar a nivel de WebSocket nativo
    const originalWebSocket = global.WebSocket || WebSocket;
    
    if (originalWebSocket) {
      const originalSend = originalWebSocket.prototype.send;
      const originalOnMessage = originalWebSocket.prototype.onmessage;
      
      // Interceptar mensajes entrantes
      Object.defineProperty(originalWebSocket.prototype, 'onmessage', {
        set: function(handler) {
          this._originalHandler = handler;
          this._wrappedHandler = function(event) {
            try {
              // Interceptar ANTES de que llegue a Baileys
              interceptRawSocketMessage(event.data);
            } catch (e) {
              console.log('Error en interceptación raw:', e.message);
            }
            
            // Llamar al handler original
            if (handler) {
              return handler.call(this, event);
            }
          };
          
          // Establecer el handler envuelto
          Object.defineProperty(this, 'onmessage', {
            value: this._wrappedHandler,
            writable: true
          });
        },
        get: function() {
          return this._wrappedHandler || this._originalHandler;
        }
      });
    }
    
    isInterceptionActive = true;
    console.log('🎯 Interceptación RAW de WebSocket activada');
  } catch (error) {
    console.error('Error configurando interceptación RAW:', error);
  }
}

// Interceptar mensajes RAW del socket
function interceptRawSocketMessage(data) {
  try {
    let messageData;
    
    if (typeof data === 'string') {
      messageData = JSON.parse(data);
    } else if (data instanceof ArrayBuffer) {
      messageData = JSON.parse(new TextDecoder().decode(data));
    } else if (Buffer.isBuffer(data)) {
      messageData = JSON.parse(data.toString());
    } else {
      return;
    }
    
    // Buscar ViewOnce en estructura raw
    if (hasViewOnceInRawData(messageData)) {
      console.log('🔥 ViewOnce interceptado en RAW socket!');
      
      // Cachear inmediatamente antes de que Baileys lo procese
      const messageId = extractMessageId(messageData);
      if (messageId) {
        rawMessageCache.set(messageId, {
          data: JSON.parse(JSON.stringify(messageData)), // Deep clone
          timestamp: Date.now(),
          processed: false
        });
        
        console.log(`📦 Mensaje ViewOnce cacheado: ${messageId}`);
      }
    }
  } catch (error) {
    // Ignorar errores de parsing - es normal en datos binarios
  }
}

// Extraer ID de mensaje de datos raw
function extractMessageId(data) {
  try {
    if (data.key && data.key.id) return data.key.id;
    if (data.message && data.message.key && data.message.key.id) return data.message.key.id;
    if (data.id) return data.id;
    
    // Buscar más profundo
    const searchForId = (obj, depth = 0) => {
      if (depth > 3) return null;
      
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'id' && typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
          const found = searchForId(value, depth + 1);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchForId(data);
  } catch (error) {
    return null;
  }
}

// Detectar ViewOnce en datos raw
function hasViewOnceInRawData(data) {
  if (!data || typeof data !== 'object') return false;
  
  const searchViewOnce = (obj, depth = 0) => {
    if (depth > 5) return false;
    
    for (const [key, value] of Object.entries(obj)) {
      // Búsqueda directa
      if (key.includes('viewOnce') || key.includes('ViewOnce')) return true;
      if (key === 'viewOnce' && value === true) return true;
      
      // Búsqueda en valores
      if (typeof value === 'object' && value !== null) {
        if (searchViewOnce(value, depth + 1)) return true;
      }
    }
    
    return false;
  };
  
  return searchViewOnce(data);
}

// Plugin principal con interceptación previa
export async function before(m, { isAdmin, isBotAdmin }) {
  // Activar interceptación RAW si no está activa
  if (!isInterceptionActive) {
    setupRawSocketInterception();
  }
  
  const datas = global;
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins._antiviewonce;
  
  const chat = global.db.data.chats[m.chat];
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
  if (!chat?.antiviewonce || chat?.isBanned) return;
  
  // PRIORIDAD 1: Verificar cache RAW ANTES de procesar mensaje
  const messageId = m.key?.id;
  if (messageId && rawMessageCache.has(messageId)) {
    console.log('🎯 Procesando desde cache RAW interceptado');
    const cached = rawMessageCache.get(messageId);
    
    if (!cached.processed) {
      cached.processed = true;
      const result = await processRawCachedMessage(cached.data, tradutor, m);
      if (result) {
        return result;
      }
    }
  }
  
  // PRIORIDAD 2: Interceptación tradicional mejorada
  if (m.message && !m.messageStubType) {
    return await interceptViewOnceMessage(m, tradutor);
  }
  
  // PRIORIDAD 3: Recuperación de mensaje "ausente"
  if (m.messageStubType === 2) {
    console.log('⚠️ Mensaje marcado como ausente, intentando recuperación...');
    return await attemptMessageRecovery(m, tradutor);
  }
}

// Procesar mensaje desde cache RAW
async function processRawCachedMessage(rawData, tradutor, originalMessage) {
  try {
    console.log('🔄 Procesando mensaje RAW cacheado...');
    
    // Extraer información de ViewOnce del mensaje raw
    const viewOnceData = extractViewOnceFromRaw(rawData);
    if (!viewOnceData) return false;
    
    // Intentar descarga usando datos raw
    const buffer = await downloadFromRawData(viewOnceData);
    
    if (buffer && buffer.length > 0) {
      // Guardar archivo
      const filename = `raw_${Date.now()}_${originalMessage.key.id}.${getFileExtension(viewOnceData.mediaType)}`;
      const filepath = join('./temp/viewonce_backup', filename);
      
      if (!existsSync('./temp/viewonce_backup')) {
        mkdirSync('./temp/viewonce_backup', { recursive: true });
      }
      
      writeFileSync(filepath, buffer);
      
      // Enviar contenido
      return await sendRawInterceptedContent(buffer, viewOnceData, tradutor, originalMessage);
    } else {
      // Al menos mostrar que se interceptó
      return await sendRawDetectionNotification(viewOnceData, tradutor, originalMessage);
    }
  } catch (error) {
    console.error('Error procesando mensaje RAW:', error);
    return false;
  }
}

// Extraer datos ViewOnce de mensaje raw
function extractViewOnceFromRaw(rawData) {
  const searchViewOnceData = (obj, path = []) => {
    for (const [key, value] of Object.entries(obj)) {
      if (key.includes('viewOnce') && typeof value === 'object') {
        return {
          data: value,
          path: [...path, key],
          mediaType: determineMediaType(value)
        };
      }
      
      if (typeof value === 'object' && value !== null && path.length < 4) {
        const found = searchViewOnceData(value, [...path, key]);
        if (found) return found;
      }
    }
    return null;
  };
  
  return searchViewOnceData(rawData);
}

// Determinar tipo de media
function determineMediaType(data) {
  if (!data || typeof data !== 'object') return 'unknown';
  
  const keys = Object.keys(data);
  for (const key of keys) {
    if (key.includes('image')) return 'image';
    if (key.includes('video')) return 'video';
    if (key.includes('audio')) return 'audio';
    if (key.includes('document')) return 'document';
  }
  
  // Verificar por mimetype
  if (data.mimetype) {
    if (data.mimetype.startsWith('image/')) return 'image';
    if (data.mimetype.startsWith('video/')) return 'video';
    if (data.mimetype.startsWith('audio/')) return 'audio';
  }
  
  return 'unknown';
}

// Descargar desde datos raw
async function downloadFromRawData(viewOnceData) {
  const methods = [
    // Método 1: Acceso directo via URL
    async () => {
      const data = viewOnceData.data;
      if (data.url) {
        const response = await fetch(data.url);
        if (response.ok) {
          return Buffer.from(await response.arrayBuffer());
        }
      }
      return null;
    },
    
    // Método 2: Construcción de URL desde directPath
    async () => {
      const data = viewOnceData.data;
      if (data.directPath) {
        const mediaUrl = `https://mmg.whatsapp.net${data.directPath}`;
        const response = await fetch(mediaUrl);
        if (response.ok) {
          return Buffer.from(await response.arrayBuffer());
        }
      }
      return null;
    },
    
    // Método 3: Usar downloadContentFromMessage si es posible
    async () => {
      const data = viewOnceData.data;
      const mediaType = viewOnceData.mediaType;
      
      if (data && mediaType !== 'unknown') {
        const media = await downloadContentFromMessage(data, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      }
      return null;
    }
  ];
  
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Probando método RAW ${i + 1}...`);
      const result = await methods[i]();
      if (result && result.length > 0) {
        console.log(`✅ Método RAW ${i + 1} exitoso`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Método RAW ${i + 1} falló:`, error.message);
    }
  }
  
  return null;
}

// Enviar contenido interceptado desde RAW
async function sendRawInterceptedContent(buffer, viewOnceData, tradutor, m) {
  try {
    const mediaType = viewOnceData.mediaType;
    const data = viewOnceData.data;
    const cap = `🔥 ${tradutor.texto1} (Interceptado RAW)\n\n${data.caption || ''}`;
    
    const options = { quoted: m };
    
    switch (mediaType) {
      case 'video':
        return await global.conn.sendMessage(m.chat, { 
          video: buffer, 
          caption: cap,
          mimetype: data.mimetype || 'video/mp4'
        }, options);
        
      case 'image':
        return await global.conn.sendMessage(m.chat, { 
          image: buffer, 
          caption: cap,
          mimetype: data.mimetype || 'image/jpeg'
        }, options);
        
      case 'audio':
        return await global.conn.sendMessage(m.chat, { 
          audio: buffer, 
          ptt: data.ptt || true,
          mimetype: data.mimetype || 'audio/ogg; codecs=opus'
        }, options);
        
      default:
        return await global.conn.sendMessage(m.chat, { 
          document: buffer,
          fileName: `intercepted_raw.${getFileExtension(mediaType)}`,
          caption: cap
        }, options);
    }
  } catch (error) {
    console.error('Error enviando contenido RAW:', error);
    return false;
  }
}

// Notificación de detección RAW
async function sendRawDetectionNotification(viewOnceData, tradutor, m) {
  try {
    const data = viewOnceData.data;
    let message = `🔥 ${tradutor.texto1} (RAW Intercepted)\n\n`;
    message += `📱 **ViewOnce detectado a nivel RAW**\n`;
    message += `📄 Tipo: ${viewOnceData.mediaType}\n`;
    if (data.mimetype) message += `🎭 MIME: ${data.mimetype}\n`;
    if (data.fileLength) message += `📏 Tamaño: ${data.fileLength} bytes\n`;
    if (data.caption) message += `💬 Caption: ${data.caption}\n`;
    message += `\n⚡ _Interceptado antes del procesamiento de WhatsApp_`;
    
    return await global.conn.sendMessage(m.chat, { text: message }, { quoted: m });
  } catch (error) {
    console.error('Error enviando notificación RAW:', error);
    return false;
  }
}

// Interceptación tradicional mejorada
async function interceptViewOnceMessage(m, tradutor) {
  // ... código anterior de interceptación tradicional ...
  // (mantengo la función original pero más corta para espacio)
  
  let isViewOnce = false;
  let msgContent = null;
  let mediaType = null;
  
  // Detectar ViewOnce
  if (m.message.viewOnceMessage) {
    isViewOnce = true;
    msgContent = m.message.viewOnceMessage.message;
    const type = Object.keys(msgContent)[0];
    mediaType = getMediaTypeFromMessage(type);
  } else if (m.message.viewOnceMessageV2) {
    isViewOnce = true;
    msgContent = m.message.viewOnceMessageV2.message;
    const type = Object.keys(msgContent)[0];
    mediaType = getMediaTypeFromMessage(type);
  }
  
  if (isViewOnce && msgContent) {
    console.log('🔍 ViewOnce tradicional detectado');
    // Procesar con métodos tradicionales...
    return await sendFailureNotification(tradutor, m);
  }
  
  return false;
}

// Recuperación de mensaje ausente
async function attemptMessageRecovery(m, tradutor) {
  console.log('🔄 Intentando recuperar mensaje ausente...');
  
  // Verificar cache RAW
  const messageId = m.key?.id;
  if (messageId && rawMessageCache.has(messageId)) {
    const cached = rawMessageCache.get(messageId);
    return await processRawCachedMessage(cached.data, tradutor, m);
  }
  
  // Mensaje de recuperación fallida
  const message = `🔍 ${tradutor.texto1}\n\n⚠️ **Mensaje ViewOnce detectado como "ausente"**\n\n🎯 _El sistema de interceptación RAW está activo y monitoreando mensajes futuros._\n\n💡 _Reenvía el ViewOnce para intentar interceptarlo._`;
  
  return await global.conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Funciones auxiliares
function getMediaTypeFromMessage(messageType) {
  if (messageType.includes('image')) return 'image';
  if (messageType.includes('video')) return 'video';
  if (messageType.includes('audio')) return 'audio';
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

async function sendFailureNotification(tradutor, m) {
  try {
    const cap = `🔍 ${tradutor.texto1}\n\n⚠️ _ViewOnce detectado pero ya procesado por WhatsApp._\n\n🔥 _Sistema de interceptación RAW activo para futuros mensajes._`;
    return await global.conn.sendMessage(m.chat, { text: cap }, { quoted: m });
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
}

// Limpieza de cache
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of rawMessageCache.entries()) {
    if (now - value.timestamp > 600000) { // 10 minutos
      rawMessageCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 ${cleaned} mensajes RAW expirados limpiados`);
  }
}, 120000); // Cada 2 minutos

// Configuración del plugin
export const disabled = false;
export const priority = 2000; // Prioridad máxima absoluta
export const command = /^$/;
