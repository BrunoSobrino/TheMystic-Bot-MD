let handler = async (m, { conn, text, command, usedPrefix }) => {    
  if (command === 'testlid') {
    try {
      const info = {
        messageInfo: {
          key: m.key,
          participant: m.participant,
          sender: m.sender,
          chat: m.chat,
          isGroup: m.isGroup
        },
        lidResolverStatus: {
          resolverExists: !!global.lidResolver,
          cacheSize: global.lidResolver?.lidCache?.size || 0,
          processingQueueSize: global.lidResolver?.processingQueue?.size || 0,
          isDirty: global.lidResolver?.isDirty || false,
          cacheFile: global.lidResolver?.cacheFile || 'No definido'
        }
      };

      // Verificar si hay LIDs en el mensaje
      const messageStr = JSON.stringify(m);
      const lidMatches = messageStr.match(/@lid/g);
      info.lidsInMessage = lidMatches ? lidMatches.length : 0;
      
      // Verificar si el mensaje fue procesado
      info.messageProcessed = {
        hasParticipant: !!m.participant,
        participantEndsWithLid: m.participant?.endsWith('@lid'),
        keyParticipantEndsWithLid: m.key?.participant?.endsWith('@lid'),
        mentionedJids: m.message?.[Object.keys(m.message)[0]]?.contextInfo?.mentionedJid || []
      };

      let response = `🔍 *Test LID Resolver Local*\n\n`;
      response += `📋 *Estado del Resolver:*\n`;
      response += `• Existe: ${info.lidResolverStatus.resolverExists ? '✅' : '❌'}\n`;
      response += `• Caché: ${info.lidResolverStatus.cacheSize} entradas\n`;
      response += `• Cola procesamiento: ${info.lidResolverStatus.processingQueueSize}\n`;
      response += `• Cambios pendientes: ${info.lidResolverStatus.isDirty ? '⏳' : '✅'}\n`;
      response += `• Archivo: ${info.lidResolverStatus.cacheFile.split('/').pop()}\n\n`;
      
      response += `📨 *Mensaje actual:*\n`;
      response += `• Chat: ${info.messageInfo.chat}\n`;
      response += `• Es grupo: ${info.messageInfo.isGroup ? '✅' : '❌'}\n`;
      response += `• Sender: ${info.messageInfo.sender}\n`;
      response += `• LIDs detectados: ${info.lidsInMessage}\n\n`;
      
      response += `🔄 *Procesamiento:*\n`;
      response += `• Participant con @lid: ${info.messageProcessed.participantEndsWithLid ? '❌' : '✅'}\n`;
      response += `• Key.participant con @lid: ${info.messageProcessed.keyParticipantEndsWithLid ? '❌' : '✅'}\n`;
      response += `• Menciones: ${info.messageProcessed.mentionedJids.length}\n`;

      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en testlid:', error);
      await conn.reply(m.chat, `❌ Error en test: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidcache - Estadísticas del caché
  // ========================================
  if (command === 'lidcache') {
    try {
      if (!global.lidResolver) {
        return await conn.reply(m.chat, '❌ LidResolver no está inicializado', m);
      }
      
      const stats = global.lidResolver.getStats();
      
      let response = `💾 *Caché LID Resolver Local*\n\n`;
      response += `📊 *Estadísticas:*\n`;
      response += `• Total entradas: ${stats.total}\n`;
      response += `• Entradas válidas: ${stats.valid}\n`;
      response += `• Entradas expiradas: ${stats.expired}\n`;
      response += `• No encontrados: ${stats.notFound}\n`;
      response += `• Errores: ${stats.errors}\n`;
      response += `• Procesando: ${stats.processing}\n`;
      response += `• Archivo existe: ${stats.fileExists ? '✅' : '❌'}\n`;
      response += `• Cambios pendientes: ${stats.isDirty ? '⏳' : '✅'}\n\n`;
      
      response += `💽 *Almacenamiento:*\n`;
      response += `• Archivo: ${stats.cacheFile.split('/').pop()}\n`;
      response += `• Ubicación: ./src/\n`;
      
      if (stats.total > 0) {
        response += `\n🗂️ *Muestra de entradas:*\n`;
        const entries = Array.from(global.lidResolver.lidCache.entries()).slice(0, 5);
        entries.forEach(([key, jid], index) => {
          const [lid, groupId] = key.split('_');
          const lidShort = lid.split('@')[0].slice(-4);
          const jidShort = jid.split('@')[0].slice(-4);
          response += `${index + 1}. ...${lidShort} → ...${jidShort}\n`;
        });
        
        if (stats.total > 5) {
          response += `... y ${stats.total - 5} más\n`;
        }
      } else {
        response += `\n📝 *Caché vacío*\n`;
      }
      
      await conn.reply(m.chat, response, m);
    } catch (error) {
      console.error('[TEST-LID] Error en lidcache:', error);
      await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: clearcache - Limpiar todo el caché
  // ========================================
  if (command === 'clearcache') {
    try {
      if (!global.lidResolver) {
        return await conn.reply(m.chat, '❌ LidResolver no está inicializado', m);
      }
      
      const oldStats = global.lidResolver.getStats();
      global.lidResolver.lidCache.clear();
      global.lidResolver.processingQueue.clear();
      
      // Forzar guardado del caché vacío
      if (global.lidResolver.forceSave) {
        global.lidResolver.forceSave();
      }
      
      let response = `🧹 *Caché LID Limpiado*\n\n`;
      response += `• Entradas eliminadas: ${oldStats.total}\n`;
      response += `• Válidas: ${oldStats.valid}\n`;
      response += `• Expiradas: ${oldStats.expired}\n`;
      response += `• Archivo actualizado: ✅\n`;
      
      await conn.reply(m.chat, response, m);
    } catch (error) {
      console.error('[TEST-LID] Error en clearcache:', error);
      await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidstats - Estadísticas detalladas
  // ========================================
  if (command === 'lidstats') {
    try {
      if (!global.lidResolver) {
        return await conn.reply(m.chat, '❌ LidResolver no está inicializado', m);
      }
      
      const stats = global.lidResolver.getStats();
      const fs = await import('fs');
      
      let fileSize = 0;
      try {
        if (stats.fileExists) {
          const fileStat = fs.statSync(stats.cacheFile);
          fileSize = fileStat.size;
        }
      } catch (e) {
        fileSize = 0;
      }
      
      let response = `📈 *Estadísticas Detalladas LID*\n\n`;
      response += `🗄️ *Archivo:*\n`;
      response += `• Ruta: ${stats.cacheFile}\n`;
      response += `• Existe: ${stats.fileExists ? '✅' : '❌'}\n`;
      response += `• Tamaño: ${(fileSize / 1024).toFixed(2)} KB\n`;
      response += `• Guardado pendiente: ${stats.isDirty ? '⏳' : '✅'}\n\n`;
      
      response += `📊 *Caché en Memoria:*\n`;
      response += `• Total: ${stats.total} entradas\n`;
      response += `• Válidas: ${stats.valid}\n`;
      response += `• Expiradas: ${stats.expired}\n`;
      response += `• No encontrados: ${stats.notFound}\n`;
      response += `• Errores: ${stats.errors}\n`;
      response += `• Procesando: ${stats.processing}\n\n`;
      
      const efficiency = stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : 0;
      response += `⚡ *Eficiencia:* ${efficiency}%\n`;
      
      const memoryEstimate = stats.total * 150; // ~150 bytes por entrada
      response += `💾 *Memoria estimada:* ${(memoryEstimate / 1024).toFixed(2)} KB\n`;
      
      await conn.reply(m.chat, response, m);
    } catch (error) {
      console.error('[TEST-LID] Error en lidstats:', error);
      await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: forcesave - Forzar guardado
  // ========================================
  if (command === 'forcesave') {
    try {
      if (!global.lidResolver) {
        return await conn.reply(m.chat, '❌ LidResolver no está inicializado', m);
      }
      
      const beforeStats = global.lidResolver.getStats();
      
      if (!beforeStats.isDirty) {
        return await conn.reply(m.chat, '💾 No hay cambios pendientes para guardar', m);
      }
      
      if (global.lidResolver.forceSave) {
        global.lidResolver.forceSave();
      }
      
      let response = `💾 *Guardado Forzado Completado*\n\n`;
      response += `• Entradas guardadas: ${beforeStats.total}\n`;
      response += `• Archivo: src/lidsresolve.json\n`;
      response += `• Estado: ✅ Guardado\n`;
      
      await conn.reply(m.chat, response, m);
    } catch (error) {
      console.error('[TEST-LID] Error en forcesave:', error);
      await conn.reply(m.chat, `❌ Error guardando: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidtest - Test manual con participantes
  // ========================================
  if (command === 'lidtest') {
    if (!m.isGroup) {
      return await conn.reply(m.chat, '❌ Este test solo funciona en grupos', m);
    }
    
    try {
      // Obtener metadatos del grupo
      const metadata = await conn.groupMetadata(m.chat);
      const participants = metadata.participants;
      
      let response = `🧪 *Test Manual LID Resolver*\n\n`;
      response += `👥 *Grupo:* ${metadata.subject}\n`;
      response += `📊 *Participantes:* ${participants.length}\n\n`;
      
      // Verificar algunos participantes para testing
      const testCount = Math.min(3, participants.length);
      let resolvedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < testCount; i++) {
        const participant = participants[i];
        try {
          const contactInfo = await conn.onWhatsApp(participant.jid || participant.id);
          const lid = contactInfo[0]?.lid;
          
          response += `👤 *Participante ${i + 1}:*\n`;
          response += `• JID: ...${(participant.jid || participant.id).split('@')[0].slice(-6)}\n`;
          
          if (lid) {
            response += `• LID: ...${lid.split('@')[0].slice(-6)}\n`;
            
            // Test resolver
            const startTime = Date.now();
            const resolved = await global.lidResolver.resolveLid(lid, m.chat);
            const resolveTime = Date.now() - startTime;
            
            const success = resolved === (participant.jid || participant.id);
            response += `• Resolución: ${success ? '✅' : '❌'} (${resolveTime}ms)\n`;
            
            if (success) resolvedCount++;
          } else {
            response += `• LID: No disponible\n`;
            response += `• Resolución: ⏭️ Omitido\n`;
          }
          response += `\n`;
          
        } catch (error) {
          response += `❌ Error con participante ${i + 1}: ${error.message}\n\n`;
          errorCount++;
        }
      }
      
      response += `📈 *Resumen del Test:*\n`;
      response += `• Exitosos: ${resolvedCount}/${testCount}\n`;
      response += `• Errores: ${errorCount}\n`;
      response += `• Caché actual: ${global.lidResolver.lidCache.size} entradas\n`;
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en lidtest:', error);
      await conn.reply(m.chat, `❌ Error en test manual: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidinfo - Información de un LID específico
  // ========================================
  if (command === 'lidinfo') {
    if (!text) {
      return await conn.reply(m.chat, `❓ *Uso:* ${usedPrefix}lidinfo <número>\n\n*Ejemplo:* ${usedPrefix}lidinfo 1234567890`, m);
    }
    
    if (!m.isGroup) {
      return await conn.reply(m.chat, '❌ Este comando solo funciona en grupos', m);
    }
    
    try {
      const numberToSearch = text.replace(/[^0-9]/g, '');
      if (!numberToSearch) {
        return await conn.reply(m.chat, '❌ Ingresa un número válido', m);
      }
      
      const lidJid = `${numberToSearch}@lid`;
      const cacheKey = `${lidJid}_${m.chat}`;
      
      let response = `🔍 *Información de LID*\n\n`;
      response += `📱 *Número:* ${numberToSearch}\n`;
      response += `🆔 *LID:* ${lidJid}\n`;
      response += `👥 *Grupo:* ${m.chat}\n\n`;
      
      // Verificar en caché
      const cached = global.lidResolver.lidCache.get(cacheKey);
      if (cached) {
        response += `💾 *En Caché:* ✅\n`;
        response += `📞 *Resuelto a:* ${cached}\n`;
      } else {
        response += `💾 *En Caché:* ❌\n`;
        
        // Intentar resolver
        response += `🔄 *Intentando resolver...*\n`;
        
        const startTime = Date.now();
        const resolved = await global.lidResolver.resolveLid(lidJid, m.chat);
        const resolveTime = Date.now() - startTime;
        
        response += `⏱️ *Tiempo de resolución:* ${resolveTime}ms\n`;
        response += `📞 *Resultado:* ${resolved}\n`;
        response += `✅ *Resuelto:* ${resolved !== lidJid ? 'Sí' : 'No'}\n`;
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en lidinfo:', error);
      await conn.reply(m.chat, `❌ Error obteniendo información: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidhelp - Ayuda completa
  // ========================================
  if (command === 'lidhelp') {
    let response = `📚 *Ayuda - LID Resolver Local*\n\n`;
    
    response += `🔍 *Comandos de Información:*\n`;
    response += `• \`${usedPrefix}testlid\` - Estado general\n`;
    response += `• \`${usedPrefix}lidcache\` - Estadísticas del caché\n`;
    response += `• \`${usedPrefix}lidstats\` - Estadísticas detalladas\n`;
    response += `• \`${usedPrefix}lidinfo <número>\` - Info de LID específico\n\n`;
    
    response += `🧹 *Comandos de Mantenimiento:*\n`;
    response += `• \`${usedPrefix}clearcache\` - Limpiar todo\n`;
    response += `• \`${usedPrefix}forcesave\` - Forzar guardado\n\n`;
    
    response += `🧪 *Comandos de Testing:*\n`;
    response += `• \`${usedPrefix}lidtest\` - Test con participantes\n\n`;
    
    response += `📋 *Notas:*\n`;
    response += `• Solo administradores y owner\n`;
    response += `• El caché se guarda en \`src/lidsresolve.json\`\n`;
    response += `• Las entradas expiran en 24 horas\n`;
    response += `• Máximo 1000 entradas en caché\n`;
    
    await conn.reply(m.chat, response, m);
  }
};

handler.command = /^(testlid|lidcache|clearcache|lidstats|forcesave|lidtest|lidinfo|lidhelp)$/i;
handler.rowner = true
export default handler;
