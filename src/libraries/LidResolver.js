import fs from 'fs';
import path from 'path';
import PhoneValidator from './PhoneValidator.js';

/**
 * Interceptor global para resolver LIDs en mensajes con almacenamiento local
 * Incluye validación de números telefónicos para detectar LIDs que son números válidos
 */
class LidResolver {
  constructor(conn) {
    this.conn = conn;
    this.processingQueue = new Map();
    this.cacheFile = path.join(process.cwd(), 'src', 'lidsresolve.json');
    this.cache = new Map(); // Ahora almacena por LID directamente
    this.jidToLidMap = new Map(); // Mapeo inverso JID -> LID para búsquedas rápidas
    this.isDirty = false;
    this.saveTimeout = null;
    this.maxCacheSize = 1000; // Máximo de entradas en caché
    
    // Inicializar validador de números telefónicos
    this.phoneValidator = new PhoneValidator();
    
    // Asegurar que el directorio existe
    this.ensureDirectoryExists();
    
    // Cargar caché desde archivo
    this.loadCache();
    
    // Configurar auto-guardado
    this.setupAutoSave();

    // Limpiar entradas problemáticas al inicializar
    this.cleanupPhoneNumbers();
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
        
        // Verificar estructura
        let validEntries = 0;
        
        for (const [key, entry] of Object.entries(parsed)) {
          if (entry && typeof entry === 'object' && entry.jid && entry.lid && entry.timestamp) {
            this.cache.set(key, entry);
            // Crear mapeo inverso
            if (entry.jid && entry.jid.includes('@s.whatsapp.net')) {
              this.jidToLidMap.set(entry.jid, entry.lid);
            }
            validEntries++;
          }
        }
        
        // Guardar cache si hay cambios en la estructura
      } else {
        this.saveCache();
      }
    } catch (error) {
      console.error('❌ Error cargando caché LID:', error.message);
      this.cache = new Map();
      this.jidToLidMap = new Map();
      this.saveCache();
    }
  }

  /**
   * Limpia números telefónicos mal categorizados como LIDs
   */
  cleanupPhoneNumbers() {
    let cleanupCount = 0;
    const toCleanup = [];

    for (const [lidKey, entry] of this.cache.entries()) {
      // Detectar si el lidKey es realmente un número de teléfono
      const phoneDetection = this.phoneValidator.detectPhoneInLid(lidKey);
      
      if (phoneDetection.isPhone) {
        // Si es un número de teléfono y está marcado como "no encontrado"
        if (entry.notFound) {
          const correctJid = phoneDetection.jid;
          const countryInfo = this.phoneValidator.getCountryInfo(phoneDetection.phoneNumber);
          
          // Crear nueva entrada correcta
          const correctedEntry = {
            jid: correctJid,
            lid: `${lidKey}@lid`, // Mantener el LID original por compatibilidad
            name: phoneDetection.phoneNumber,
            timestamp: Date.now(),
            corrected: true,
            country: countryInfo?.country,
            phoneNumber: phoneDetection.phoneNumber
          };
          
          toCleanup.push({
            oldKey: lidKey,
            newEntry: correctedEntry,
            correctJid: correctJid
          });
          
          cleanupCount++;
        }
      }
    }

    // Aplicar las correcciones
    for (const cleanup of toCleanup) {
      // Remover entrada antigua
      this.cache.delete(cleanup.oldKey);
      
      // Agregar entrada corregida
      this.cache.set(cleanup.oldKey, cleanup.newEntry);
      this.jidToLidMap.set(cleanup.correctJid, `${cleanup.oldKey}@lid`);
    }

    if (cleanupCount > 0) {
      this.markDirty();
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
   * Marcar para guardado inmediato
   */
  markDirty() {
    this.isDirty = true;
    
    // Guardado inmediato
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Guardar inmediatamente
    this.saveCache();
  }

  /**
   * Verificar si ya existe un JID o LID en el caché para evitar duplicados
   */
  isDuplicate(lidKey, jid) {
    // Verificar si ya existe el LID
    if (this.cache.has(lidKey)) {
      return true;
    }
    
    // Verificar si ya existe el JID
    if (this.jidToLidMap.has(jid)) {
      return true;
    }
    
    return false;
  }

  /**
   * Obtener nombre de usuario usando onWhatsApp
   */
  async getUserName(jid) {
    try {
      const contactDetails = await this.conn?.onWhatsApp(jid);
      if (contactDetails?.[0]?.name) {
        return contactDetails[0].name;
      }
      
      // Fallback: intentar obtener del pushName si está disponible
      const cleanJid = jid.replace('@s.whatsapp.net', '');
      return cleanJid; // Si no hay nombre, usar el número
    } catch (error) {
      console.error('Error obteniendo nombre de usuario:', error);
      return jid.replace('@s.whatsapp.net', ''); // Fallback al número
    }
  }

  /**
   * Resolver LID a JID real con validación de números telefónicos
   */
  async resolveLid(lidJid, groupChatId, maxRetries = 3) {
    if (!lidJid.endsWith('@lid')) {
      return lidJid.includes('@') ? lidJid : `${lidJid}@s.whatsapp.net`;
    }

    if (!groupChatId?.endsWith('@g.us')) {
      return lidJid;
    }

    const lidKey = lidJid.split('@')[0];
    
    // NUEVA FUNCIONALIDAD: Verificar si el LID es realmente un número de teléfono
    const phoneDetection = this.phoneValidator.detectPhoneInLid(lidKey);
    if (phoneDetection.isPhone) {
      const countryInfo = this.phoneValidator.getCountryInfo(phoneDetection.phoneNumber);
      
      // Actualizar caché con información correcta
      const phoneEntry = {
        jid: phoneDetection.jid,
        lid: lidJid,
        name: phoneDetection.phoneNumber,
        timestamp: Date.now(),
        phoneDetected: true,
        country: countryInfo?.country,
        phoneNumber: phoneDetection.phoneNumber
      };
      
      this.cache.set(lidKey, phoneEntry);
      this.jidToLidMap.set(phoneDetection.jid, lidJid);
      this.markDirty();
      
      return phoneDetection.jid;
    }
    
    // Verificar caché local por LID
    if (this.cache.has(lidKey)) {
      const entry = this.cache.get(lidKey);
      return entry.jid;
    }

    // Verificar si ya se está procesando
    if (this.processingQueue.has(lidKey)) {
      return await this.processingQueue.get(lidKey);
    }

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
              
              const participantLid = contactDetails[0].lid.split('@')[0];
              if (participantLid === lidKey) {
                // Verificar duplicados antes de guardar
                if (this.isDuplicate(lidKey, participant.jid)) {
                  this.processingQueue.delete(lidKey);
                  return this.cache.get(lidKey)?.jid || participant.jid;
                }
                
                // Obtener nombre del usuario
                const userName = await this.getUserName(participant.jid);
                
                // Guardar en caché global
                const cacheEntry = {
                  jid: participant.jid,
                  lid: lidJid,
                  name: userName,
                  timestamp: Date.now()
                };
                
                this.cache.set(lidKey, cacheEntry);
                this.jidToLidMap.set(participant.jid, lidJid);
                this.markDirty(); // Guardado inmediato
                
                // Limpiar cola de procesamiento
                this.processingQueue.delete(lidKey);
                
                return participant.jid;
              }
            } catch (e) {
              continue;
            }
          }
          
          // No encontrado, guardar resultado negativo por menos tiempo
          const notFoundEntry = {
            jid: lidJid,
            lid: lidJid,
            name: 'Usuario no encontrado',
            timestamp: Date.now(),
            notFound: true
          };
          
          this.cache.set(lidKey, notFoundEntry);
          this.markDirty();
          this.processingQueue.delete(lidKey);
          
          return lidJid;
          
        } catch (e) {
          if (++attempts >= maxRetries) {
            const errorEntry = {
              jid: lidJid,
              lid: lidJid,
              name: 'Error al resolver',
              timestamp: Date.now(),
              error: true
            };
            
            this.cache.set(lidKey, errorEntry);
            this.markDirty();
            this.processingQueue.delete(lidKey);
            
            console.error(`❌ Error resolviendo LID ${lidKey}:`, e.message);
            return lidJid;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      return lidJid;
    })();

    this.processingQueue.set(lidKey, resolvePromise);
    return await resolvePromise;
  }

  /**
   * Buscar LID por JID (búsqueda inversa)
   */
  findLidByJid(jid) {
    return this.jidToLidMap.get(jid) || null;
  }

  /**
   * Obtener información completa de un usuario por LID
   */
  getUserInfo(lidKey) {
    return this.cache.get(lidKey) || null;
  }

  /**
   * Obtener información completa de un usuario por JID
   */
  getUserInfoByJid(jid) {
    const lid = this.findLidByJid(jid);
    if (lid) {
      const lidKey = lid.split('@')[0];
      return this.cache.get(lidKey) || null;
    }
    return null;
  }

  /**
   * Analizar y reportar números telefónicos mal categorizados
   */
  analyzePhoneNumbers() {
    const phoneNumbers = [];
    const realLids = [];
    const problematic = [];

    for (const [lidKey, entry] of this.cache.entries()) {
      const phoneDetection = this.phoneValidator.detectPhoneInLid(lidKey);
      
      if (phoneDetection.isPhone) {
        const countryInfo = this.phoneValidator.getCountryInfo(phoneDetection.phoneNumber);
        phoneNumbers.push({
          lidKey,
          phoneNumber: phoneDetection.phoneNumber,
          correctJid: phoneDetection.jid,
          currentJid: entry.jid,
          country: countryInfo?.country,
          isProblematic: entry.notFound || entry.error || entry.jid.includes('@lid'),
          entry
        });
      } else {
        realLids.push({
          lidKey,
          entry
        });
      }

      // Detectar entradas problemáticas adicionales
      if (entry.jid && entry.jid.includes('@lid')) {
        problematic.push({
          lidKey,
          issue: 'JID contiene @lid',
          entry
        });
      }
    }

    return {
      phoneNumbers,
      realLids,
      problematic,
      stats: {
        totalEntries: this.cache.size,
        phoneNumbersDetected: phoneNumbers.length,
        realLids: realLids.length,
        problematicEntries: problematic.length,
        phoneNumbersProblematic: phoneNumbers.filter(p => p.isProblematic).length
      }
    };
  }

  /**
   * Corregir automáticamente números telefónicos mal categorizados
   */
  autoCorrectPhoneNumbers() {
    const analysis = this.analyzePhoneNumbers();
    let correctionCount = 0;

    for (const phoneEntry of analysis.phoneNumbers) {
      if (phoneEntry.isProblematic) {
        // Crear entrada corregida
        const correctedEntry = {
          jid: phoneEntry.correctJid,
          lid: `${phoneEntry.lidKey}@lid`,
          name: phoneEntry.phoneNumber,
          timestamp: Date.now(),
          corrected: true,
          country: phoneEntry.country,
          phoneNumber: phoneEntry.phoneNumber,
          originalEntry: phoneEntry.entry
        };

        // Actualizar caché
        this.cache.set(phoneEntry.lidKey, correctedEntry);
        
        // Actualizar mapeo inverso
        if (phoneEntry.entry.jid && this.jidToLidMap.has(phoneEntry.entry.jid)) {
          this.jidToLidMap.delete(phoneEntry.entry.jid);
        }
        this.jidToLidMap.set(phoneEntry.correctJid, `${phoneEntry.lidKey}@lid`);
        
        correctionCount++;
      }
    }

    if (correctionCount > 0) {
      this.markDirty();
    }

    return {
      corrected: correctionCount,
      analysis
    };
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
      has: (key) => {
        // Soporte para clave antigua (lidJid_groupChatId) y nueva (lidKey)
        const lidKey = key.includes('_') ? key.split('_')[0].replace('@lid', '') : key.replace('@lid', '');
        return this.cache.has(lidKey);
      },
      get: (key) => {
        // Soporte para clave antigua (lidJid_groupChatId) y nueva (lidKey)
        const lidKey = key.includes('_') ? key.split('_')[0].replace('@lid', '') : key.replace('@lid', '');
        const entry = this.cache.get(lidKey);
        return entry ? entry.jid : undefined;
      },
      set: (key, value) => {
        // Soporte para clave antigua
        const lidKey = key.includes('_') ? key.split('_')[0].replace('@lid', '') : key.replace('@lid', '');
        
        if (typeof value === 'string') {
          // Verificar duplicados antes de agregar
          const existingLid = this.findLidByJid(value);
          
          if (existingLid) {
            return; // No agregar duplicado
          }
          
          if (this.cache.has(lidKey)) {
            return; // No agregar duplicado
          }
          
          // Si se pasa solo el JID, crear entrada completa
          this.cache.set(lidKey, {
            jid: value,
            lid: `${lidKey}@lid`,
            name: 'Nombre pendiente',
            timestamp: Date.now()
          });
          this.jidToLidMap.set(value, `${lidKey}@lid`);
        } else {
          // Verificar duplicados para objetos completos
          
          if (value.jid) {
            const existingLid = this.findLidByJid(value.jid);
            if (existingLid && existingLid !== value.lid) {
              return; // No agregar duplicado
            }
          }
          
          if (this.cache.has(lidKey)) {
            const existing = this.cache.get(lidKey);
            if (existing.jid !== value.jid) {
              return; // No agregar duplicado
            }
          }
          
          this.cache.set(lidKey, value);
          if (value.jid) {
            this.jidToLidMap.set(value.jid, value.lid);
          }
        }
        this.markDirty();
      },
      delete: (key) => {
        const lidKey = key.includes('_') ? key.split('_')[0].replace('@lid', '') : key.replace('@lid', '');
        const entry = this.cache.get(lidKey);
        if (entry && entry.jid && this.jidToLidMap.has(entry.jid)) {
          this.jidToLidMap.delete(entry.jid);
        }
        const result = this.cache.delete(lidKey);
        if (result) this.markDirty();
        return result;
      },
      clear: () => {
        this.cache.clear();
        this.jidToLidMap.clear();
        this.markDirty();
      },
      entries: () => {
        const entries = [];
        for (const [key, entry] of this.cache.entries()) {
          entries.push([`${key}@lid`, entry.jid]);
        }
        return entries;
      },
      forEach: (callback) => {
        for (const [key, entry] of this.cache.entries()) {
          callback(entry.jid, `${key}@lid`, this);
        }
      }
    };
  }

  /**
   * Obtener estadísticas del caché con información de números telefónicos
   */
  getStats() {
    let notFound = 0;
    let errors = 0;
    let valid = 0;
    let phoneNumbers = 0;
    let corrected = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.phoneDetected || entry.corrected) {
        phoneNumbers++;
      }
      if (entry.corrected) {
        corrected++;
      }
      if (entry.notFound) {
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
      notFound,
      errors,
      phoneNumbers,
      corrected,
      processing: this.processingQueue.size,
      cacheFile: this.cacheFile,
      fileExists: fs.existsSync(this.cacheFile),
      isDirty: this.isDirty,
      jidMappings: this.jidToLidMap.size
    };
  }

  /**
   * Listar todos los usuarios en caché con información adicional
   */
  getAllUsers() {
    const users = [];
    for (const [lidKey, entry] of this.cache.entries()) {
      if (!entry.notFound && !entry.error) {
        users.push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          country: entry.country,
          phoneNumber: entry.phoneNumber,
          isPhoneDetected: entry.phoneDetected || entry.corrected,
          timestamp: new Date(entry.timestamp).toLocaleString()
        });
      }
    }
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtener usuarios por país
   */
  getUsersByCountry() {
    const countries = {};
    
    for (const [lidKey, entry] of this.cache.entries()) {
      if (!entry.notFound && !entry.error && entry.country) {
        if (!countries[entry.country]) {
          countries[entry.country] = [];
        }
        
        countries[entry.country].push({
          lid: entry.lid,
          jid: entry.jid,
          name: entry.name,
          phoneNumber: entry.phoneNumber
        });
      }
    }
    
    // Ordenar usuarios dentro de cada país
    for (const country of Object.keys(countries)) {
      countries[country].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return countries;
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
