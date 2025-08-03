import fs from 'fs';
import path from 'path';

/**
 * Global interceptor to resolve LIDs in messages with local storage
 */
class LidResolver {
  constructor(conn) {
    this.conn = conn;
    this.processingQueue = new Map();
    this.cacheFile = path.join(process.cwd(), 'src', 'lidsresolve.json');
    this.cache = new Map();
    this.isDirty = false;
    this.saveTimeout = null;
    this.maxCacheSize = 1000; // Maximum cache entries
    this.maxAge = 1000 * 60 * 60 * 24; // 24 hours

    // Ensure the directory exists
    this.ensureDirectoryExists();

    // Load cache from file
    this.loadCache();

    // Set up autosave
    this.setupAutoSave();
  }

  /**
   * Ensure the src directory exists
   */
  ensureDirectoryExists() {
    const srcDir = path.dirname(this.cacheFile);
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
  }

  /**
   * Load cache from JSON file
   */
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        const parsed = JSON.parse(data);

        // Verify structure and clean expired entries
        const now = Date.now();
        let validEntries = 0;

        for (const [key, entry] of Object.entries(parsed)) {
          if (entry && typeof entry === 'object' && entry.jid && entry.timestamp) {
            // Check if not expired
            if (now - entry.timestamp < this.maxAge) {
              this.cache.set(key, entry);
              validEntries++;
            }
          }
        }

        console.log(`📂 LID Cache loaded: ${validEntries} valid entries`);

        // If there are many expired entries, save the clean cache
        if (validEntries !== Object.keys(parsed).length) {
          this.saveCache();
        }
      } else {
        console.log('📂 LID cache file does not exist, creating a new one...');
        this.saveCache();
      }
    } catch (error) {
      console.error('❌ Error loading LID cache:', error.message);
      this.cache = new Map();
      this.saveCache();
    }
  }

  /**
   * Save cache to JSON file
   */
  saveCache() {
    try {
      const data = {};
      for (const [key, value] of this.cache.entries()) {
        data[key] = value;
      }

      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2), 'utf8');
      this.isDirty = false;
      console.log(`💾 LID Cache saved: ${this.cache.size} entries`);
    } catch (error) {
      console.error('❌ Error saving LID cache:', error.message);
    }
  }

  /**
   * Set up autosave when there are changes
   */
  setupAutoSave() {
    // Save every 30 seconds if there are changes
    setInterval(() => {
      if (this.isDirty) {
        this.saveCache();
      }
    }, 30000);

    // Save on process exit
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
   * Mark for deferred saving
   */
  markDirty() {
    this.isDirty = true;

    // Deferred save to avoid excessive I/O
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      if (this.isDirty) {
        this.saveCache();
      }
    }, 5000); // Save after 5 seconds of inactivity
  }

  /**
   * Clean expired entries from the cache
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
      console.log(`🧹 Automatic cleanup: ${removed} expired LID entries`);
      this.markDirty();
    }
  }

  /**
   * Clean cache if it exceeds the maximum size
   */
  enforceMaxSize() {
    if (this.cache.size > this.maxCacheSize) {
      // Get entries sorted by timestamp (oldest first)
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove the oldest until at the limit
      const toRemove = this.cache.size - this.maxCacheSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }

      console.log(`📊 LID Cache: Removed ${toRemove} old entries (limit: ${this.maxCacheSize})`);
      this.markDirty();
    }
  }

  async resolveLid(lidJid, groupChatId, maxRetries = 3) {
    if (!lidJid.endsWith('@lid') || !groupChatId?.endsWith('@g.us')) {
      return lidJid.includes('@') ? lidJid : `${lidJid}@s.whatsapp.net`;
    }

    const cacheKey = `${lidJid}_${groupChatId}`;

    // Check local cache
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey);
      const now = Date.now();

      // Check if not expired
      if (now - entry.timestamp < this.maxAge) {
        return entry.jid;
      } else {
        // Remove expired entry
        this.cache.delete(cacheKey);
        this.markDirty();
      }
    }

    // Check if it's already being processed
    if (this.processingQueue.has(cacheKey)) {
      return await this.processingQueue.get(cacheKey);
    }

    const lidToFind = lidJid.split('@')[0];

    const resolvePromise = (async () => {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const metadata = await this.conn?.groupMetadata(groupChatId);
          if (!metadata?.participants) throw new Error('Could not get participants');

          for (const participant of metadata.participants) {
            try {
              if (!participant?.jid) continue;

              const contactDetails = await this.conn?.onWhatsApp(participant.jid);
              if (!contactDetails?.[0]?.lid) continue;

              const possibleLid = contactDetails[0].lid.split('@')[0];
              if (possibleLid === lidToFind) {
                // Save to local cache
                this.cache.set(cacheKey, {
                  jid: participant.jid,
                  timestamp: Date.now(),
                  groupId: groupChatId,
                  lid: lidJid
                });
                this.markDirty();

                // Clean processing queue
                this.processingQueue.delete(cacheKey);

                // Apply cleanup and limits
                this.enforceMaxSize();

                return participant.jid;
              }
            } catch (e) {
              continue;
            }
          }

          // Not found, save negative result for a shorter time
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
      console.error('Error processing message to resolve LIDs:', error);
      return message;
    }
  }

  /**
   * Maintain compatibility with the previous interface
   * Simulates a Map for external access
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
        // If only JID is passed, create a complete entry
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
   * Manually clean expired entries
   */
  clearCache() {
    const now = Date.now();
    const maxAge = 1000 * 60 * 30; // 30 minutes for manual cleanup
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Manual cleanup: ${removed} LID entries removed`);
      this.markDirty();
    }

    // Also run automatic cleanup
    this.cleanExpiredEntries();
  }

  /**
   * Get cache statistics
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
   * Force immediate save
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