import fs from 'fs';
import path from 'path';

/**
 * Interceptor global para resolver LIDs en mensajes con almacenamiento local
 */
class LidResolver {
  constructor(conn) {
    this.conn = conn;
    this.processingQueue = new Map();
    this.cacheFile = path.join(process.cwd(), 'src', 'lidsresolve.json');
    this.cache = new Map();
    this.isDirty = false;
    this.saveTimeout = null;
    this.maxCacheSize = 1000; // Máximo de entradas en caché
    this.maxAge = 1000 * 60 * 60 * 24; // 24 horas
    
    // Asegurar que el directorio existe
    this.ensureDirectoryExists();
    
    // Cargar caché desde archivo
    this.loadCache();
    
    // Configurar auto-guardado
    this.setupAutoSave();
  }

  /**
   * Asegurar que el directorio src existe
   */
  ensureDirectoryExists() {
    const srcDir = path.dirname(this.cacheFile);
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
  }

  /**
   * Cargar caché desde archivo JSON
   */
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        const parsed = JSON.parse(data);
        
        // Verificar estructura y limpiar entradas expiradas
        const now = Date.now();
        let validEntries = 0;
        
        for (const [key, entry] of Object.entries(parsed)) {
          if (entry && typeof entry === 'object' && entry.jid && entry.timestamp) {
            // Verificar si no está expirado
            if (now - entry.timestamp < this.maxAge) {
              this.cache.set(key, entry);
              validEntries++;
            }
          }
        }
                
        // Si hay muchas entradas expiradas, guardar el caché limpio
        if (validEntries !== Object.keys(parsed).length) {
          this.saveCache();
        }
      } else {
        this.saveCache();
      }
    } catch (error) {
      console.error('❌ Error cargando caché LID:', error.message);
      this.cache = new Map();
      this.saveCache();
    }
  }

  /**
   * Guardar caché a archivo JSON
   */
  saveCache() {
    try {
      const data = {};
      for (const [key, value] of this.cache.entries()) {
        data[key] = value;
      }
      
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2), 'utf8');
      this.isDirty = false;
    } catch (error) {
      console.error('❌ Error guardando caché LID:', error.message);
    }
  }

  /**
   * Configurar auto-guardado cuando hay cambios
   */
  setupAutoSave() {
    // Guardar cada 30 segundos si hay cambios
    setInterval(() => {
      if (this.isDirty) {
        this.saveCache();
      }
    }, 30000);

    // Guardar al salir del proceso
    process.on('SIGINT', () => {
      if (this.isDirty) {
        this.saveCache();
      }
    });

    process.on('SIGTERM', () => {
      if (this.isDirty) {
        this.saveCache();
      }
    });
  }

  /**
   * Marcar para guardado diferido
   */
  markDirty() {
    this.isDirty = true;
    
    // Guardado diferido para evitar I/O excesivo
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      if (this.isDirty) {
        this.saveCache();
      }
    }, 5000); // Guardar después de 5 segundos de inactividad
  }

  /**
   * Limpiar entradas expiradas del caché
   */
  cleanExpiredEntries() {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      this.markDirty();
    }
  }

  /**
   * Limpiar caché si excede el tamaño máximo
   */
  enforceMaxSize() {
    if (this.cache.size > this.maxCacheSize) {
      // Obtener entradas ordenadas por timestamp (más antiguas primero)
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Eliminar las más antiguas hasta llegar al límite
      const toRemove = this.cache.size - this.maxCacheSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
      
      this.markDirty();
    }
  }

  async resolveLid(lidJid, groupChatId, maxRetries = 3) {
    if (!lidJid.endsWith('@lid') || !groupChatId?.endsWith('@g.us')) {
      return lidJid.includes('@') ? lidJid : `${lidJid}@s.whatsapp.net`;
    }

    const cacheKey = `${lidJid}_${groupChatId}`;
    
    // Verificar caché local
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey);
      const now = Date.now();
      
      // Verificar si no está expirado
      if (now - entry.timestamp < this.maxAge) {
        return entry.jid;
      } else {
        // Eliminar entrada expirada
        this.cache.delete(cacheKey);
        this.markDirty();
      }
    }

    // Verificar si ya se está procesando
    if (this.processingQueue.has(cacheKey)) {
      return await this.processingQueue.get(cacheKey);
    }

    const lidToFind = lidJid.split('@')[0];
    
    const resolvePromise = (async () => {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const metadata = await this.conn?.groupMetadata(groupChatId);
          if (!metadata?.participants) throw new Error('No se obtuvieron participantes');

          for (const participant of metadata.participants) {
            try {
              if (!participant?.jid) continue;
              
              const contactDetails = await this.conn?.onWhatsApp(participant.jid);
              if (!contactDetails?.[0]?.lid) continue;
              
              const possibleLid = contactDetails[0].lid.split('@')[0];
              if (possibleLid === lidToFind) {
                // Guardar en caché local
                this.cache.set(cacheKey, {
                  jid: participant.jid,
                  timestamp: Date.now(),
                  groupId: groupChatId,
                  lid: lidJid
                });
                this.markDirty();
                
                // Limpiar cola de procesamiento
                this.processingQueue.delete(cacheKey);
                
                // Aplicar limpieza y límites
                this.enforceMaxSize();
                
                return participant.jid;
              }
            } catch (e) {
              continue;
            }
          }
          
          // No encontrado, guardar resultado negativo por menos tiempo
          this.cache.set(cacheKey, {
            jid: lidJid,
            timestamp: Date.now(),
            groupId: groupChatId,
            lid: lidJid,
            notFound: true
          });
          this.markDirty();
          this.processingQueue.delete(cacheKey);
          return lidJid;
          
        } catch (e) {
          if (++attempts >= maxRetries) {
            this.cache.set(cacheKey, {
              jid: lidJid,
              timestamp: Date.now(),
              groupId: groupChatId,
              lid: lidJid,
              error: true
            });
            this.markDirty();
            this.processingQueue.delete(cacheKey);
            return lidJid;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      return lidJid;
    })();

    this.processingQueue.set(cacheKey, resolvePromise);
    return await resolvePromise;
  }

  async processObject(obj, groupChatId) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      const results = [];
      for (const item of obj) {
        results.push(await this.processObject(item, groupChatId));
      }
      return results;
    }

    const processed = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.endsWith('@lid') && groupChatId) {
        processed[key] = await this.resolveLid(value, groupChatId);
      } else if (typeof value === 'object' && value !== null) {
        processed[key] = await this.processObject(value, groupChatId);
      } else {
        processed[key] = value;
      }
    }
    return processed;
  }

  async processMessage(message) {
    try {
      if (!message || !message.key) return message;

      const groupChatId = message.key.remoteJid?.endsWith('@g.us') ? message.key.remoteJid : null;
      if (!groupChatId) return message;

      const processedMessage = JSON.parse(JSON.stringify(message));

      if (processedMessage.key?.participant?.endsWith('@lid')) {
        processedMessage.key.participant = await this.resolveLid(
          processedMessage.key.participant, 
          groupChatId
        );
      }

      if (processedMessage.participant?.endsWith('@lid')) {
        processedMessage.participant = await this.resolveLid(
          processedMessage.participant, 
          groupChatId
        );
      }

      if (processedMessage.message) {
        const messageTypes = Object.keys(processedMessage.message);
        for (const msgType of messageTypes) {
          const msgContent = processedMessage.message[msgType];
          if (msgContent?.contextInfo?.mentionedJid) {
            const resolvedMentions = [];
            for (const jid of msgContent.contextInfo.mentionedJid) {
              if (typeof jid === 'string' && jid.endsWith('@lid')) {
                resolvedMentions.push(await this.resolveLid(jid, groupChatId));
              } else {
                resolvedMentions.push(jid);
              }
            }
            msgContent.contextInfo.mentionedJid = resolvedMentions;
          }

          if (msgContent?.contextInfo?.quotedMessage) {
            if (msgContent.contextInfo.participant?.endsWith('@lid')) {
              msgContent.contextInfo.participant = await this.resolveLid(
                msgContent.contextInfo.participant, 
                groupChatId
              );
            }
          }
        }
      }

      return processedMessage;
    } catch (error) {
      console.error('Error procesando mensaje para resolver LIDs:', error);
      return message;
    }
  }

  /**
   * Mantener compatibilidad con la interfaz anterior
   * Simula un Map para acceso externo
   */
  get lidCache() {
    return {
      size: this.cache.size,
      has: (key) => this.cache.has(key),
      get: (key) => {
        const entry = this.cache.get(key);
        return entry ? entry.jid : undefined;
      },
      set: (key, value) => {
        // Si se pasa solo el JID, crear entrada completa
        if (typeof value === 'string') {
          this.cache.set(key, {
            jid: value,
            timestamp: Date.now(),
            groupId: key.split('_')[1] || '',
            lid: key.split('_')[0] || ''
          });
        } else {
          this.cache.set(key, value);
        }
        this.markDirty();
        this.enforceMaxSize();
      },
      delete: (key) => {
        const result = this.cache.delete(key);
        if (result) this.markDirty();
        return result;
      },
      clear: () => {
        this.cache.clear();
        this.markDirty();
      },
      entries: () => {
        const entries = [];
        for (const [key, entry] of this.cache.entries()) {
          entries.push([key, entry.jid]);
        }
        return entries;
      },
      forEach: (callback) => {
        for (const [key, entry] of this.cache.entries()) {
          callback(entry.jid, key, this);
        }
      }
    };
  }

  /**
   * Limpiar entradas expiradas manualmente
   */
  clearCache() {
    const now = Date.now();
    const maxAge = 1000 * 60 * 30; // 30 minutos para limpieza manual
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      this.markDirty();
    }
    
    // También ejecutar limpieza automática
    this.cleanExpiredEntries();
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const now = Date.now();
    let notFound = 0;
    let errors = 0;
    let valid = 0;
    let expired = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        expired++;
      } else if (entry.notFound) {
        notFound++;
      } else if (entry.error) {
        errors++;
      } else {
        valid++;
      }
    }
    
    return {
      total: this.cache.size,
      valid,
      expired,
      notFound,
      errors,
      processing: this.processingQueue.size,
      cacheFile: this.cacheFile,
      fileExists: fs.existsSync(this.cacheFile),
      isDirty: this.isDirty
    };
  }

  /**
   * Forzar guardado inmediato
   */
  forceSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.saveCache();
  }
}

export default LidResolver;
