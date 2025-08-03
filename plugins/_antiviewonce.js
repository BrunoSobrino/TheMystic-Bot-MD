/*const { downloadContentFromMessage } = (await import("baileys"));
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Cache global para ViewOnce
const viewOnceInterceptCache = new Map();
const processedMessageIds = new Set();
let isInitialized = false;

// Texto por defecto si no hay traducción
const defaultTexts = {
  texto1: "🔍 ViewOnce Anti-Delete - Contenido interceptado"
};

// Interceptar mensajes a nivel más profundo
function initializeInterception() {
  if (isInitialized) return;
  
  try {
    // Interceptar el flujo de mensajes antes del procesamiento
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      // Buscar mensajes ViewOnce en los logs de Baileys
      const logString = args.join(' ');
      if (logString.includes('viewOnce') || logString.includes('ViewOnce')) {
        console.warn('🎯 ViewOnce detectado en logs:', logString);
      }
      return originalConsoleLog.apply(console, arguments);
    };
    
    isInitialized = true;
    console.log('🎯 Interceptación inicializada');
  } catch (error) {
    console.error('Error inicializando interceptación:', error);
  }
}

// Función principal del plugin
export async function before(m, { isAdmin, isBotAdmin }) {
  try {
    // Inicializar interceptación
    initializeInterception();
    
    // Obtener traductor de forma segura
    let tradutor = defaultTexts;
    try {
      const datas = global;
      const idioma = datas.db?.data?.users?.[m.sender]?.language || global.defaultLenguaje || 'es';
      const translatePath = `./src/languages/${idioma}.json`;
      
      if (existsSync(translatePath)) {
        const _translate = JSON.parse(readFileSync(translatePath));
        tradutor = _translate.plugins?._antiviewonce || defaultTexts;
      }
    } catch (error) {
      console.log('Usando textos por defecto para antiviewonce');
    }
    
    const chat = global.db?.data?.chats?.[m.chat];
    if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
    if (!chat?.antiviewonce || chat?.isBanned) return;
    
    const messageId = m.key?.id;
    if (!messageId || processedMessageIds.has(messageId)) return;
    
    processedMessageIds.add(messageId);
    
    console.log('🔍 Analizando mensaje:', {
      messageStubType: m.messageStubType,
      hasMessage: !!m.message,
      messageId: messageId,
      keys: m.message ? Object.keys(m.message) : []
    });
    
    // ESTRATEGIA 1: Interceptar mensaje normal con ViewOnce
    if (m.message && !m.messageStubType) {
      const result = await processViewOnceMessage(m, tradutor);
      if (result) return result;
    }
    
    // ESTRATEGIA 2: Interceptar desde quoted si existe
    if (m.quoted && m.quoted.message) {
      console.log('📋 Verificando mensaje quoted...');
      const quotedResult = await processViewOnceFromQuoted(m, tradutor);
      if (quotedResult) return quotedResult;
    }
    
    // ESTRATEGIA 3: Analizar mensaje "ausente" y buscar datos residuales
    if (m.messageStubType === 2) {
      console.log('⚠️ Mensaje ausente - analizando estructura completa...');
      return await analyzeAbsentMessage(m, tradutor);
    }
    
    // ESTRATEGIA 4: Interceptar cualquier estructura que contenga ViewOnce
    const viewOnceResult = await deepScanForViewOnce(m, tradutor);
    if (viewOnceResult) return viewOnceResult;
  } catch (error) {
    console.error('Error en función before:', error);
    return false;
  }
}

// Procesar mensaje ViewOnce normal
async function processViewOnceMessage(m, tradutor) {
  try {
    const viewOnceData = extractViewOnceFromMessage(m.message);
    if (!viewOnceData) return false;
    
    console.log('🔥 ViewOnce encontrado en mensaje normal');
    console.log('📊 Estructura ViewOnce:', {
      type: viewOnceData.messageType,
      mediaType: viewOnceData.mediaType,
      hasData: !!viewOnceData.data
    });
    
    // Intentar descarga inmediata
    const buffer = await attemptDownload(viewOnceData, m);
    
    if (buffer && buffer.length > 0) {
      await saveToBackup(buffer, viewOnceData.mediaType, m.key?.id);
      return await sendInterceptedMedia(buffer, viewOnceData, tradutor, m);
    } else {
      return await sendViewOnceDetectionInfo(viewOnceData, tradutor, m, 'normal');
    }
  } catch (error) {
    console.error('Error procesando ViewOnce normal:', error);
    return false;
  }
}

// Procesar ViewOnce desde quoted
async function processViewOnceFromQuoted(m, tradutor) {
  try {
    const quotedMessage = m.quoted.message;
    const viewOnceData = extractViewOnceFromMessage(quotedMessage);
    
    if (!viewOnceData) return false;
    
    console.log('📋 ViewOnce encontrado en quoted');
    
    // Crear mensaje simulado para descarga
    const simulatedMessage = {
      key: m.quoted.key || m.key,
      message: quotedMessage
    };
    
    const buffer = await attemptDownload(viewOnceData, simulatedMessage);
    
    if (buffer && buffer.length > 0) {
      await saveToBackup(buffer, viewOnceData.mediaType, m.quoted.key?.id || m.key?.id);
      return await sendInterceptedMedia(buffer, viewOnceData, tradutor, m);
    } else {
      return await sendViewOnceDetectionInfo(viewOnceData, tradutor, m, 'quoted');
    }
  } catch (error) {
    console.error('Error procesando quoted ViewOnce:', error);
    return false;
  }
}

// Analizar mensaje ausente - VERSIÓN CORREGIDA
async function analyzeAbsentMessage(m, tradutor) {
  try {
    console.log('🔍 Analizando mensaje ausente completo...');
    console.log('📊 Estructura completa del mensaje:', JSON.stringify(m, null, 2));
    
    // Buscar pistas de ViewOnce en cualquier parte del objeto
    const viewOnceHints = findViewOnceHints(m);
    
    let message = `🔍 ${tradutor.texto1}\n\n`;
    
    if (viewOnceHints.length > 0) {
      message += `⚠️ **ViewOnce Detectado (Mensaje Ausente)**\n\n`;
      message += `🔎 **Pistas encontradas:**\n`;
      
      viewOnceHints.forEach((hint, index) => {
        message += `${index + 1}. ${hint}\n`;
      });
      
      message += `\n💡 _El contenido fue marcado como ausente antes de poder interceptarlo_`;
      message += `\n🔧 _Sistema de interceptación activo para futuros mensajes_`;
    } else {
      message += `⚠️ **Mensaje ViewOnce Ausente**\n\n`;
      message += `📱 **Información detectada:**\n`;
      message += `🆔 ID: ${m.key?.id || 'N/A'}\n`;
      message += `👤 De: ${m.pushName || 'Usuario'}\n`;
      message += `⏰ Timestamp: ${new Date(parseInt(m.messageTimestamp) * 1000).toLocaleString()}\n`;
      message += `🔄 Tipo: ${m.messageStubType || 'N/A'}\n`;
      
      if (m.messageStubParameters && m.messageStubParameters.length > 0) {
        message += `📋 Parámetros: ${m.messageStubParameters.join(', ')}\n`;
      }
      
      message += `\n💡 _No se encontraron pistas suficientes para recuperar el contenido_`;
      message += `\n🔧 _El mensaje llegó ya procesado como "ausente"_`;
    }
    
    // Usar método más seguro para enviar mensaje
    return await safeSendMessage(m.chat, message, m);
    
  } catch (error) {
    console.error('Error analizando mensaje ausente:', error);
    const errorMessage = `🔍 ${tradutor.texto1}\n\n❌ _Error analizando mensaje ausente: ${error.message}_`;
    return await safeSendMessage(m.chat, errorMessage, m);
  }
}

// Función segura para enviar mensajes
async function safeSendMessage(chatId, text, quotedMessage = null) {
  try {
    const options = {};
    if (quotedMessage) {
      options.quoted = quotedMessage;
    }
    
    return await global.conn.sendMessage(chatId, { text }, options);
  } catch (error) {
    console.error('Error enviando mensaje seguro:', error);
    
    // Intentar sin quoted si falla
    if (quotedMessage) {
      try {
        return await global.conn.sendMessage(chatId, { text });
      } catch (secondError) {
        console.error('Error enviando mensaje sin quoted:', secondError);
      }
    }
    
    // Último intento con mensaje simplificado
    try {
      const simpleMessage = "🔍 ViewOnce detectado pero no se pudo procesar completamente";
      return await global.conn.sendMessage(chatId, { text: simpleMessage });
    } catch (finalError) {
      console.error('Error en último intento de envío:', finalError);
      return false;
    }
  }
}

// Escaneo profundo por ViewOnce
async function deepScanForViewOnce(m, tradutor) {
  try {
    const deepScan = (obj, path = '', depth = 0) => {
      if (depth > 5) return null;
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Buscar palabras clave
        if (key.toLowerCase().includes('viewonce') || key.toLowerCase().includes('view_once')) {
          return { path: currentPath, value, key };
        }
        
        // Buscar propiedades viewOnce
        if (key === 'viewOnce' && value === true) {
          return { path: currentPath, value, key, parent: obj };
        }
        
        // Recursión
        if (typeof value === 'object' && value !== null) {
          const found = deepScan(value, currentPath, depth + 1);
          if (found) return found;
        }
      }
      return null;
    };
    
    const found = deepScan(m);
    if (found) {
      console.log(`🎯 ViewOnce encontrado en escaneo profundo: ${found.path}`);
      
      const message = `🔍 ${tradutor.texto1}\n\n🎯 **ViewOnce Detectado (Escaneo Profundo)**\n\n📍 **Ubicación:** ${found.path}\n🔑 **Clave:** ${found.key}\n📊 **Tipo:** ${typeof found.value}\n\n⚡ _Detectado mediante análisis profundo de estructura_`;
      
      return await safeSendMessage(m.chat, message, m);
    }
  } catch (error) {
    console.error('Error en escaneo profundo:', error);
  }
  
  return false;
}

// Extraer ViewOnce de mensaje
function extractViewOnceFromMessage(message) {
  if (!message) return null;
  
  // Diferentes estructuras de ViewOnce
  const extractors = [
    // ViewOnce estándar
    () => {
      if (message.viewOnceMessage?.message) {
        const content = message.viewOnceMessage.message;
        const messageType = Object.keys(content)[0];
        return {
          content,
          messageType,
          mediaType: getMediaType(messageType),
          data: content[messageType]
        };
      }
      return null;
    },
    
    // ViewOnceV2
    () => {
      if (message.viewOnceMessageV2?.message) {
        const content = message.viewOnceMessageV2.message;
        const messageType = Object.keys(content)[0];
        return {
          content,
          messageType,
          mediaType: getMediaType(messageType),
          data: content[messageType]
        };
      }
      return null;
    },
    
    // ViewOnce directo en propiedades
    () => {
      for (const [key, value] of Object.entries(message)) {
        if (value && typeof value === 'object' && value.viewOnce === true) {
          return {
            content: message,
            messageType: key,
            mediaType: getMediaType(key),
            data: value
          };
        }
      }
      return null;
    }
  ];
  
  for (const extractor of extractors) {
    try {
      const result = extractor();
      if (result) return result;
    } catch (error) {
      continue;
    }
  }
  
  return null;
}

// Intentar descarga con múltiples métodos
async function attemptDownload(viewOnceData, messageContext) {
  const methods = [
    // Método 1: downloadContentFromMessage
    async () => {
      const media = await downloadContentFromMessage(viewOnceData.data, viewOnceData.mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    },
    
    // Método 2: downloadContentFromMessage con contenido completo
    async () => {
      const media = await downloadContentFromMessage(viewOnceData.content, viewOnceData.mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    },
    
    // Método 3: Usando función download si existe
    async () => {
      if (messageContext.download && typeof messageContext.download === 'function') {
        return await messageContext.download();
      }
      return null;
    },
    
    // Método 4: Acceso directo por URL
    async () => {
      const data = viewOnceData.data;
      if (data.url) {
        const response = await fetch(data.url);
        if (response.ok) {
          return Buffer.from(await response.arrayBuffer());
        }
      }
      return null;
    }
  ];
  
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`🔄 Probando método de descarga ${i + 1}...`);
      const result = await methods[i]();
      if (result && result.length > 0) {
        console.log(`✅ Descarga exitosa con método ${i + 1} (${result.length} bytes)`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Método ${i + 1} falló:`, error.message);
    }
  }
  
  return null;
}

// Buscar pistas de ViewOnce
function findViewOnceHints(obj, hints = [], path = '', depth = 0) {
  if (depth > 4 || !obj || typeof obj !== 'object') return hints;
  
  try {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Pistas directas
      if (key.toLowerCase().includes('viewonce')) {
        hints.push(`ViewOnce encontrado en: ${currentPath}`);
      }
      
      if (key === 'viewOnce') {
        hints.push(`Propiedad viewOnce: ${value} en ${currentPath}`);
      }
      
      // Pistas de contenido media
      if (key.includes('Message') && value && typeof value === 'object') {
        hints.push(`Mensaje de tipo: ${key} en ${currentPath}`);
      }
      
      // Pistas de parámetros
      if (key === 'messageStubParameters' && Array.isArray(value)) {
        hints.push(`Parámetros: ${value.join(', ')}`);
      }
      
      // Pistas de stub type
      if (key === 'messageStubType' && value) {
        hints.push(`Tipo de stub: ${value}`);
      }
      
      // Recursión controlada
      if (typeof value === 'object' && value !== null && depth < 3) {
        findViewOnceHints(value, hints, currentPath, depth + 1);
      }
    }
  } catch (error) {
    console.error('Error buscando pistas:', error);
  }
  
  return hints;
}

// Enviar media interceptada
async function sendInterceptedMedia(buffer, viewOnceData, tradutor, m) {
  try {
    const caption = `🔥 ${tradutor.texto1}\n\n${viewOnceData.data?.caption || ''}`;
    const options = { quoted: m };
    
    switch (viewOnceData.mediaType) {
      case 'image':
        return await global.conn.sendMessage(m.chat, {
          image: buffer,
          caption,
          mimetype: viewOnceData.data?.mimetype || 'image/jpeg'
        }, options);
        
      case 'video':
        return await global.conn.sendMessage(m.chat, {
          video: buffer,
          caption,
          mimetype: viewOnceData.data?.mimetype || 'video/mp4'
        }, options);
        
      case 'audio':
        return await global.conn.sendMessage(m.chat, {
          audio: buffer,
          ptt: viewOnceData.data?.ptt || true,
          mimetype: viewOnceData.data?.mimetype || 'audio/ogg; codecs=opus'
        }, options);
        
      default:
        return await global.conn.sendMessage(m.chat, {
          document: buffer,
          fileName: `viewonce.${getFileExtension(viewOnceData.mediaType)}`,
          caption
        }, options);
    }
  } catch (error) {
    console.error('Error enviando media:', error);
    return await safeSendMessage(m.chat, `🔥 ${tradutor.texto1}\n\n❌ Error enviando contenido interceptado`, m);
  }
}

// Enviar información de detección
async function sendViewOnceDetectionInfo(viewOnceData, tradutor, m, source) {
  try {
    const data = viewOnceData.data;
    let message = `🔍 ${tradutor.texto1} (${source})\n\n`;
    message += `📱 **ViewOnce Detectado**\n`;
    message += `📄 Tipo: ${viewOnceData.mediaType}\n`;
    message += `🎭 Mensaje: ${viewOnceData.messageType}\n`;
    
    if (data.mimetype) message += `🎭 MIME: ${data.mimetype}\n`;
    if (data.fileLength) message += `📏 Tamaño: ${data.fileLength} bytes\n`;
    if (data.seconds) message += `⏱️ Duración: ${data.seconds}s\n`;
    if (data.caption) message += `💬 Caption: ${data.caption}\n`;
    
    message += `\n⚠️ _Contenido no disponible para descarga_`;
    message += `\n🔧 _Pero se detectó la estructura ViewOnce_`;
    
    return await safeSendMessage(m.chat, message, m);
  } catch (error) {
    console.error('Error enviando información:', error);
    return await safeSendMessage(m.chat, `🔍 ${tradutor.texto1}\n\n❌ Error procesando información de ViewOnce`, m);
  }
}

// Funciones auxiliares
function getMediaType(messageType) {
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

async function saveToBackup(buffer, mediaType, messageId) {
  try {
    const backupDir = './temp/viewonce_backup';
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    const filename = `${Date.now()}_${messageId}.${getFileExtension(mediaType)}`;
    const filepath = join(backupDir, filename);
    writeFileSync(filepath, buffer);
    console.log(`💾 Backup guardado: ${filename}`);
  } catch (error) {
    console.error('Error guardando backup:', error);
  }
}

// Limpieza
setInterval(() => {
  if (processedMessageIds.size > 1000) {
    processedMessageIds.clear();
  }
}, 300000);

// Configuración
export const disabled = false;
export const priority = 1000;
export const command = /^$/;
*/
