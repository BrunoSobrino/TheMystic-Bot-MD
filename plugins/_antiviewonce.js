const { downloadContentFromMessage } = (await import("baileys"));
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Cache para mensajes interceptados
const viewOnceCache = new Map();
const processedMessages = new Set();
let baileysPatchApplied = false;

// Interceptar a nivel de Baileys - ANTES del procesamiento de mensajes
function setupBaileysInterception() {
  if (baileysPatchApplied) return;
  
  try {
    const conn = global.conn;
    if (!conn) return;
    
    // Interceptar el evento de mensajes RAW de Baileys
    const originalUpsertMessage = conn.upsertMessage;
    if (originalUpsertMessage) {
      conn.upsertMessage = async function(message) {
        try {
          // Interceptar ANTES de upsert
          await interceptBaileysMessage(message);
        } catch (error) {
          console.log('Error en interceptación Baileys:', error.message);
        }
        
        // Llamar función original
        return originalUpsertMessage.call(this, message);
      };
    }
    
    // Interceptar el procesamiento de mensajes
    const originalProcessMessage = conn.ev?.process;
    if (originalProcessMessage) {
      const originalEmit = conn.ev.emit;
      conn.ev.emit = function(event, ...args) {
        if (event === 'messages.upsert') {
          const messageUpdate = args[0];
          if (messageUpdate?.messages) {
            for (const msg of messageUpdate.messages) {
              interceptBaileysMessage(msg);
            }
          }
        }
        return originalEmit.call(this, event, ...args);
      };
    }
    
    // Interceptar a nivel de WebSocket de Baileys
    if (conn.ws) {
      const originalOnMessage = conn.ws.onmessage;
      conn.ws.onmessage = function(event) {
        try {
          interceptWebSocketMessage(event.data);
        } catch (error) {
          // Ignorar errores
        }
        
        if (originalOnMessage) {
          return originalOnMessage.call(this, event);
        }
      };
      
      // También interceptar eventos
      if (conn.ws.addEventListener) {
        conn.ws.addEventListener('message', (event) => {
          try {
            interceptWebSocketMessage(event.data);
          } catch (error) {
            // Ignorar errores
          }
        });
      }
    }
    
    baileysPatchApplied = true;
    console.log('✅ Interceptación de Baileys configurada correctamente');
  } catch (error) {
    console.error('Error configurando interceptación de Baileys:', error);
  }
}

// Interceptar mensajes de WebSocket
function interceptWebSocketMessage(data) {
  try {
    let parsedData;
    
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else if (Buffer.isBuffer(data)) {
      parsedData = JSON.parse(data.toString());
    } else {
      return;
    }
    
    if (hasViewOnceContent(parsedData)) {
      console.log('🎯 ViewOnce detectado en WebSocket de Baileys');
      
      const messageId = extractMessageId(parsedData);
      if (messageId) {
        viewOnceCache.set(`ws_${messageId}`, {
          data: JSON.parse(JSON.stringify(parsedData)),
          timestamp: Date.now(),
          source: 'websocket'
        });
        console.log(`📦 ViewOnce cacheado desde WebSocket: ${messageId}`);
      }
    }
  } catch (error) {
    // Ignorar errores de parsing
  }
}

// Interceptar mensajes de Baileys
async function interceptBaileysMessage(message) {
  try {
    if (!message || !message.message) return;
    
    if (hasViewOnceContent(message)) {
      console.log('🔥 ViewOnce interceptado en mensaje de Baileys');
      
      const messageId = message.key?.id;
      if (messageId) {
        viewOnceCache.set(`baileys_${messageId}`, {
          data: JSON.parse(JSON.stringify(message)),
          timestamp: Date.now(),
          source: 'baileys'
        });
        console.log(`📦 ViewOnce cacheado desde Baileys: ${messageId}`);
      }
    }
  } catch (error) {
    console.log('Error interceptando mensaje de Baileys:', error.message);
  }
}

// Detectar contenido ViewOnce
function hasViewOnceContent(data) {
  if (!data || typeof data !== 'object') return false;
  
  const searchViewOnce = (obj, depth = 0) => {
    if (depth > 6) return false;
    
    for (const [key, value] of Object.entries(obj)) {
      // Búsqueda directa de ViewOnce
      if (key === 'viewOnceMessage' || key === 'viewOnceMessageV2' || key === 'viewOnceMessageV2Extension') {
        return true;
      }
      
      // Búsqueda de propiedades viewOnce
      if (key === 'viewOnce' && value === true) {
        return true;
      }
      
      // Búsqueda recursiva
      if (typeof value === 'object' && value !== null) {
        if (searchViewOnce(value, depth + 1)) return true;
      }
    }
    
    return false;
  };
  
  return searchViewOnce(data);
}

// Extraer ID de mensaje
function extractMessageId(data) {
  if (data.key?.id) return data.key.id;
  if (data.id) return data.id;
  
  // Búsqueda más profunda
  const findId = (obj, depth = 0) => {
    if (depth > 3) return null;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'id' && typeof value === 'string' && value.length > 10) {
        return value;
      }
      if (typeof value === 'object' && value !== null) {
        const found = findId(value, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findId(data);
}

// Plugin principal
export async function before(m, { isAdmin, isBotAdmin }) {
  // Configurar interceptación si no está activa
  setupBaileysInterception();
  
  const datas = global;
  const idioma = datas.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins._antiviewonce;
  
  const chat = global.db.data.chats[m.chat];
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
  if (!chat?.antiviewonce || chat?.isBanned) return;
  
  const messageId = m.key?.id;
  if (!messageId) return;
  
  // Evitar procesamiento duplicado
  if (processedMessages.has(messageId)) return;
  processedMessages.add(messageId);
  
  // PRIORIDAD 1: Verificar cache antes de procesar
  for (const [cacheKey, cached] of viewOnceCache.entries()) {
    if (cacheKey.includes(messageId)) {
      console.log('🎯 Procesando desde cache interceptado');
      const result = await processCachedViewOnce(cached, tradutor, m);
      if (result) {
        viewOnceCache.delete(cacheKey);
        return result;
      }
    }
  }
  
  // PRIORIDAD 2: Interceptación directa del mensaje actual
  if (m.message && !m.messageStubType) {
    const result = await processCurrentMessage(m, tradutor);
    if (result) return result;
  }
  
  // PRIORIDAD 3: Manejo de mensaje "ausente"
  if (m.messageStubType === 2) {
    console.log('⚠️ Mensaje ausente detectado, buscando en cache...');
    return await handleAbsentMessage(m, tradutor, messageId);
  }
}

// Procesar mensaje desde cache
async function processCachedViewOnce(cached, tradutor, originalMessage) {
  try {
    const data = cached.data;
    console.log(`🔄 Procesando ViewOnce desde ${cached.source}...`);
    
    // Extraer datos de ViewOnce
    const viewOnceContent = extractViewOnceContent(data);
    if (!viewOnceContent) return false;
    
    // Intentar descarga
    const buffer = await downloadViewOnceContent(viewOnceContent, data);
    
    if (buffer && buffer.length > 0) {
      // Guardar backup
      const filename = `cached_${Date.now()}_${originalMessage.key.id}.${getFileExtension(viewOnceContent.mediaType)}`;
      await saveBackup(buffer, filename);
      
      // Enviar contenido
      return await sendViewOnceContent(buffer, viewOnceContent, tradutor, originalMessage);
    } else {
      // Enviar información disponible
      return await sendViewOnceInfo(viewOnceContent, tradutor, originalMessage, cached.source);
    }
  } catch (error) {
    console.error('Error procesando desde cache:', error);
    return false;
  }
}

// Extraer contenido ViewOnce de diferentes estructuras
function extractViewOnceContent(data) {
  const structures = [
    // ViewOnce directo
    () => data.message?.viewOnceMessage?.message,
    () => data.message?.viewOnceMessageV2?.message,
    () => data.message?.viewOnceMessageV2Extension?.message,
    
    // ViewOnce en mensaje
    () => data.viewOnceMessage?.message,
    () => data.viewOnceMessageV2?.message,
    () => data.viewOnceMessageV2Extension?.message,
    
    // Mensaje directo con viewOnce
    () => {
      const msg = data.message || data;
      for (const [key, value] of Object.entries(msg)) {
        if (value && typeof value === 'object' && value.viewOnce === true) {
          return { [key]: value };
        }
      }
      return null;
    }
  ];
  
  for (const extract of structures) {
    try {
      const content = extract();
      if (content) {
        const messageType = Object.keys(content)[0];
        const mediaType = getMediaTypeFromMessage(messageType);
        
        return {
          content,
          messageType,
          mediaType,
          data: content[messageType]
        };
      }
    } catch (error) {
      continue;
    }
  }
  
  return null;
}

// Descargar contenido ViewOnce
async function downloadViewOnceContent(viewOnceContent, originalData) {
  const methods = [
    // Método 1: downloadContentFromMessage estándar
    async () => {
      const media = await downloadContentFromMessage(viewOnceContent.data, viewOnceContent.mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    },
    
    // Método 2: downloadContentFromMessage con mensaje completo
    async () => {
      const media = await downloadContentFromMessage(viewOnceContent.content, viewOnceContent.mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    },
    
    // Método 3: Acceso directo por URL
    async () => {
      const data = viewOnceContent.data;
      if (data.url) {
        const response = await fetch(data.url);
        if (response.ok) {
          return Buffer.from(await response.arrayBuffer());
        }
      }
      return null;
    },
    
    // Método 4: Construcción de URL desde directPath
    async () => {
      const data = viewOnceContent.data;
      if (data.directPath) {
        const mediaUrl = `https://mmg.whatsapp.net${data.directPath}`;
        const response = await fetch(mediaUrl);
        if (response.ok) {
          return Buffer.from(await response.arrayBuffer());
        }
      }
      return null;
    },
    
    // Método 5: Usar conn.getFile si está disponible
    async () => {
      const data = viewOnceContent.data;
      if (data.url && global.conn.getFile) {
        const fileData = await global.conn.getFile(data.url);
        return fileData.data;
      }
      return null;
    }
  ];
  
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Probando método de descarga ${i + 1}...`);
      const result = await methods[i]();
      if (result && result.length > 0) {
        console.log(`✅ Método ${i + 1} exitoso (${result.length} bytes)`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Método ${i + 1} falló:`, error.message);
    }
  }
  
  return null;
}

// Procesar mensaje actual
async function processCurrentMessage(m, tradutor) {
  if (!hasViewOnceContent(m)) return false;
  
  console.log('🔍 ViewOnce detectado en mensaje actual');
  
  const viewOnceContent = extractViewOnceContent(m);
  if (!viewOnceContent) return false;
  
  const buffer = await downloadViewOnceContent(viewOnceContent, m);
  
  if (buffer && buffer.length > 0) {
    const filename = `current_${Date.now()}_${m.key.id}.${getFileExtension(viewOnceContent.mediaType)}`;
    await saveBackup(buffer, filename);
    return await sendViewOnceContent(buffer, viewOnceContent, tradutor, m);
  }
  
  return false;
}

// Manejar mensaje ausente
async function handleAbsentMessage(m, tradutor, messageId) {
  // Buscar en todos los caches
  for (const [cacheKey, cached] of viewOnceCache.entries()) {
    if (cacheKey.includes(messageId)) {
      console.log('📦 Encontrado en cache, procesando...');
      const result = await processCachedViewOnce(cached, tradutor, m);
      if (result) {
        viewOnceCache.delete(cacheKey);
        return result;
      }
    }
  }
  
  // Mensaje de fallo
  const message = `🔍 ${tradutor.texto1}\n\n⚠️ **ViewOnce detectado como mensaje ausente**\n\n🎯 _Sistema de interceptación activo_\n💡 _Reenvía el ViewOnce para intentar interceptarlo_\n\n📊 _Cache actual: ${viewOnceCache.size} mensajes_`;
  
  return await global.conn.sendMessage(m.chat, { text: message }, { quoted: m });
}

// Enviar contenido ViewOnce
async function sendViewOnceContent(buffer, viewOnceContent, tradutor, m) {
  try {
    const cap = `🔥 ${tradutor.texto1}\n\n${viewOnceContent.data?.caption || ''}`;
    const options = { quoted: m };
    
    switch (viewOnceContent.mediaType) {
      case 'video':
        return await global.conn.sendMessage(m.chat, { 
          video: buffer, 
          caption: cap,
          mimetype: viewOnceContent.data?.mimetype || 'video/mp4'
        }, options);
        
      case 'image':
        return await global.conn.sendMessage(m.chat, { 
          image: buffer, 
          caption: cap,
          mimetype: viewOnceContent.data?.mimetype || 'image/jpeg'
        }, options);
        
      case 'audio':
        return await global.conn.sendMessage(m.chat, { 
          audio: buffer, 
          ptt: viewOnceContent.data?.ptt || true,
          mimetype: viewOnceContent.data?.mimetype || 'audio/ogg; codecs=opus'
        }, options);
        
      default:
        return await global.conn.sendMessage(m.chat, { 
          document: buffer,
          fileName: `viewonce.${getFileExtension(viewOnceContent.mediaType)}`,
          caption: cap
        }, options);
    }
  } catch (error) {
    console.error('Error enviando contenido:', error);
    return false;
  }
}

// Enviar información de ViewOnce
async function sendViewOnceInfo(viewOnceContent, tradutor, m, source) {
  try {
    const data = viewOnceContent.data;
    let message = `🔍 ${tradutor.texto1} (${source})\n\n`;
    message += `📱 **ViewOnce Interceptado**\n`;
    message += `📄 Tipo: ${viewOnceContent.mediaType}\n`;
    if (data.mimetype) message += `🎭 MIME: ${data.mimetype}\n`;
    if (data.fileLength) message += `📏 Tamaño: ${data.fileLength} bytes\n`;
    if (data.seconds) message += `⏱️ Duración: ${data.seconds}s\n`;
    if (data.caption) message += `💬 Caption: ${data.caption}\n`;
    message += `\n⚡ _Contenido no disponible para descarga_`;
    
    return await global.conn.sendMessage(m.chat, { text: message }, { quoted: m });
  } catch (error) {
    console.error('Error enviando información:', error);
    return false;
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

async function saveBackup(buffer, filename) {
  try {
    const backupDir = './temp/viewonce_backup';
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    const filepath = join(backupDir, filename);
    writeFileSync(filepath, buffer);
    console.log(`💾 Backup guardado: ${filename}`);
  } catch (error) {
    console.error('Error guardando backup:', error);
  }
}

// Limpieza periódica
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of viewOnceCache.entries()) {
    if (now - value.timestamp > 300000) { // 5 minutos
      viewOnceCache.delete(key);
      cleaned++;
    }
  }
  
  if (processedMessages.size > 1000) {
    processedMessages.clear();
  }
  
  if (cleaned > 0) {
    console.log(`🧹 ${cleaned} entradas de cache limpiadas`);
  }
}, 60000);

// Configuración del plugin
export const disabled = false;
export const priority = 1000;
export const command = /^$/;
