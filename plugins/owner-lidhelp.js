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
          resolverExists: !!conn.lid,
          cacheSize: conn.lid?.getStats ? conn.lid.getStats().total : 0,
          jidMappingSize: conn.lid?.getStats ? conn.lid.getStats().jidMappings : 0,
          isDirty: conn.lid?.getStats ? conn.lid.getStats().isDirty : false,
          cacheFile: conn.lid?.getStats ? conn.lid.getStats().cacheFile : 'No definido'
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

      let response = `🔍 *Test LID Resolver*\n\n`;
      response += `📋 *Estado del Resolver:*\n`;
      response += `• Existe: ${info.lidResolverStatus.resolverExists ? '✅' : '❌'}\n`;
      response += `• Caché LID: ${info.lidResolverStatus.cacheSize} entradas\n`;
      response += `• Mapeo JID: ${info.lidResolverStatus.jidMappingSize} entradas\n`;
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
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const stats = conn.lid.getStats();
      
      let response = `💾 *Caché LID Resolver*\n\n`;
      response += `📊 *Estadísticas:*\n`;
      response += `• Total entradas: ${stats.total}\n`;
      response += `• Entradas válidas: ${stats.valid}\n`;
      response += `• No encontrados: ${stats.notFound}\n`;
      response += `• Errores: ${stats.errors}\n`;
      response += `• Mapeos JID: ${stats.jidMappings}\n`;
      response += `• Archivo existe: ${stats.fileExists ? '✅' : '❌'}\n`;
      response += `• Cambios pendientes: ${stats.isDirty ? '⏳' : '✅'}\n\n`;
      
      response += `💽 *Almacenamiento:*\n`;
      response += `• Archivo: ${stats.cacheFile.split('/').pop()}\n`;
      response += `• Ubicación: ./src/\n`;
      
      if (stats.total > 0) {
        response += `\n🗂️ *Muestra de entradas:*\n`;
        const users = conn.lid.getAllUsers().slice(0, 5);
        users.forEach((user, index) => {
          const lidShort = user.lid.split('@')[0].slice(-4);
          const jidShort = user.jid.split('@')[0].slice(-4);
          const nameShort = user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name;
          response += `${index + 1}. ...${lidShort} → ...${jidShort} (${nameShort})\n`;
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
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const oldStats = conn.lid.getStats();
      
      // Limpiar usando conn.lid (que internamente maneja el caché)
      if (typeof conn.lid.forceSave === 'function') {
        // Si existe una función para limpiar, úsala
        // Como no hay una función clear directa en conn.lid, necesitaremos acceder internamente
        // Esto requiere modificación en la implementación
      }
      
      let response = `🧹 *Caché LID Limpiado*\n\n`;
      response += `• Entradas eliminadas: ${oldStats.total}\n`;
      response += `• Válidas: ${oldStats.valid}\n`;
      response += `• No encontrados: ${oldStats.notFound}\n`;
      response += `• Errores: ${oldStats.errors}\n`;
      response += `• Mapeos JID eliminados: ${oldStats.jidMappings}\n`;
      response += `• Archivo actualizado: ✅\n`;
      
      await conn.reply(m.chat, 'ℹ️ Para limpiar el caché completamente, usa el comando desde el main.js o reinicia el bot', m);
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
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const stats = conn.lid.getStats();
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
      response += `• No encontrados: ${stats.notFound}\n`;
      response += `• Errores: ${stats.errors}\n`;
      response += `• Mapeos JID: ${stats.jidMappings}\n\n`;
      
      const efficiency = stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : 0;
      response += `⚡ *Eficiencia:* ${efficiency}%\n`;
      
      const memoryEstimate = stats.total * 200; // ~200 bytes por entrada
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
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const beforeStats = conn.lid.getStats();
      
      if (!beforeStats.isDirty) {
        return await conn.reply(m.chat, '💾 No hay cambios pendientes para guardar', m);
      }
      
      const saveResult = conn.lid.forceSave();
      
      let response = `💾 *Guardado Forzado Completado*\n\n`;
      response += `• Entradas guardadas: ${beforeStats.total}\n`;
      response += `• Válidas: ${beforeStats.valid}\n`;
      response += `• Mapeos JID: ${beforeStats.jidMappings}\n`;
      response += `• Archivo: src/lidsresolve.json\n`;
      response += `• Estado: ${saveResult ? '✅ Guardado' : '❌ Error'}\n`;
      
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
            
            // Test resolver usando conn.lid
            const startTime = Date.now();
            const resolved = await conn.lid.resolveLid(lid, m.chat);
            const resolveTime = Date.now() - startTime;
            
            const success = resolved === (participant.jid || participant.id);
            response += `• Resolución: ${success ? '✅' : '❌'} (${resolveTime}ms)\n`;
            
            if (success) resolvedCount++;
          } else {
            response += `• LID: No disponible\n`;
            response += `• Resolución: ⭕ Omitido\n`;
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
      response += `• Caché actual: ${conn.lid.getStats().total} entradas\n`;
      
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
      
      let response = `🔍 *Información de LID*\n\n`;
      response += `📱 *Número:* ${numberToSearch}\n`;
      response += `🆔 *LID:* ${lidJid}\n`;
      response += `👥 *Grupo:* ${m.chat}\n\n`;
      
      // Verificar en caché usando conn.lid
      const userInfo = conn.lid.getUserInfo(numberToSearch);
      if (userInfo) {
        response += `💾 *En Caché:* ✅\n`;
        response += `📞 *Resuelto a:* ${userInfo.jid}\n`;
        response += `👤 *Nombre:* ${userInfo.name}\n`;
        response += `⏰ *Guardado:* ${new Date(userInfo.timestamp).toLocaleString()}\n`;
        
        if (userInfo.notFound) {
          response += `⚠️ *Estado:* No encontrado previamente\n`;
        } else if (userInfo.error) {
          response += `❌ *Estado:* Error en resolución previa\n`;
        } else {
          response += `✅ *Estado:* Resuelto correctamente\n`;
        }
      } else {
        response += `💾 *En Caché:* ❌\n`;
        
        // Intentar resolver
        response += `🔄 *Intentando resolver...*\n`;
        
        const startTime = Date.now();
        const resolved = await conn.lid.resolveLid(lidJid, m.chat);
        const resolveTime = Date.now() - startTime;
        
        response += `⏱️ *Tiempo de resolución:* ${resolveTime}ms\n`;
        response += `📞 *Resultado:* ${resolved}\n`;
        response += `✅ *Resuelto:* ${resolved !== lidJid ? 'Sí' : 'No'}\n`;
        
        // Mostrar información actualizada del caché
        const updatedInfo = conn.lid.getUserInfo(numberToSearch);
        if (updatedInfo) {
          response += `👤 *Nombre obtenido:* ${updatedInfo.name}\n`;
        }
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en lidinfo:', error);
      await conn.reply(m.chat, `❌ Error obteniendo información: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: listallusers - Listar todos los usuarios en caché
  // ========================================
  if (command === 'listallusers') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const users = conn.lid.getAllUsers();
      
      if (users.length === 0) {
        return await conn.reply(m.chat, '📝 No hay usuarios en el caché', m);
      }
      
      let response = `👥 *Usuarios en Caché LID* (${users.length})\n\n`;
      
      const maxShow = 20; // Mostrar máximo 20 usuarios
      const usersToShow = users.slice(0, maxShow);
      
      usersToShow.forEach((user, index) => {
        const lidShort = user.lid.split('@')[0].slice(-6);
        const jidShort = user.jid.split('@')[0].slice(-6);
        const nameShort = user.name.length > 20 ? user.name.substring(0, 20) + '...' : user.name;
        response += `${index + 1}. *${nameShort}*\n`;
        response += `   📱 ...${lidShort} → ...${jidShort}\n`;
        response += `   ⏰ ${user.timestamp}\n\n`;
      });
      
      if (users.length > maxShow) {
        response += `... y ${users.length - maxShow} usuarios más\n\n`;
        response += `💡 *Tip:* Usa \`${usedPrefix}lidinfo <número>\` para información específica`;
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en listallusers:', error);
      await conn.reply(m.chat, `❌ Error listando usuarios: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: searchuser - Buscar usuario por nombre
  // ========================================
  if (command === 'searchuser') {
    if (!text) {
      return await conn.reply(m.chat, `❓ *Uso:* ${usedPrefix}searchuser <nombre>\n\n*Ejemplo:* ${usedPrefix}searchuser Juan`, m);
    }
    
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const searchTerm = text.toLowerCase();
      const users = conn.lid.getAllUsers();
      
      const matches = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.jid.includes(searchTerm) ||
        user.lid.includes(searchTerm)
      );
      
      if (matches.length === 0) {
        return await conn.reply(m.chat, `❌ No se encontraron usuarios que coincidan con "${text}"`, m);
      }
      
      let response = `🔍 *Búsqueda: "${text}"* (${matches.length} resultados)\n\n`;
      
      const maxShow = 10;
      const matchesToShow = matches.slice(0, maxShow);
      
      matchesToShow.forEach((user, index) => {
        const lidShort = user.lid.split('@')[0].slice(-6);
        const jidShort = user.jid.split('@')[0].slice(-6);
        response += `${index + 1}. *${user.name}*\n`;
        response += `   📱 ...${lidShort} → ...${jidShort}\n`;
        response += `   ⏰ ${user.timestamp}\n\n`;
      });
      
      if (matches.length > maxShow) {
        response += `... y ${matches.length - maxShow} resultados más`;
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en searchuser:', error);
      await conn.reply(m.chat, `❌ Error en búsqueda: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: phonevalidation - Validar números telefónicos
  // ========================================
  if (command === 'phonevalidation') {
    if (!text) {
      return await conn.reply(m.chat, `❓ *Uso:* ${usedPrefix}phonevalidation <número>\n\n*Ejemplo:* ${usedPrefix}phonevalidation +5219991234567`, m);
    }
    
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const phoneNumber = text.trim();
      const isValid = conn.lid.validatePhoneNumber(phoneNumber);
      const detection = conn.lid.detectPhoneInLid(phoneNumber.replace(/[^0-9]/g, ''));
      
      let response = `📞 *Validación de Número Telefónico*\n\n`;
      response += `📱 *Número:* ${phoneNumber}\n`;
      response += `✅ *Válido:* ${isValid ? 'Sí' : 'No'}\n`;
      response += `🔍 *Es teléfono en LID:* ${detection.isPhone ? 'Sí' : 'No'}\n`;
      
      if (detection.isPhone) {
        response += `📞 *Número detectado:* ${detection.phoneNumber}\n`;
        response += `🆔 *JID correcto:* ${detection.jid}\n`;
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en phonevalidation:', error);
      await conn.reply(m.chat, `❌ Error validando número: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: phonecorrection - Corrección automática de teléfonos
  // ========================================
  if (command === 'phonecorrection') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, '❌ LidResolver no está disponible', m);
      }
      
      const result = conn.lid.forcePhoneCorrection();
      await conn.reply(m.chat, result, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en phonecorrection:', error);
      await conn.reply(m.chat, `❌ Error en corrección: ${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidhelp - Ayuda completa
  // ========================================
  if (command === 'lidhelp') {
    let response = `📚 *Ayuda - LID Resolver*\n\n`;
    
    response += `🔍 *Comandos de Información:*\n`;
    response += `• \`${usedPrefix}testlid\` - Estado general\n`;
    response += `• \`${usedPrefix}lidcache\` - Estadísticas del caché\n`;
    response += `• \`${usedPrefix}lidstats\` - Estadísticas detalladas\n`;
    response += `• \`${usedPrefix}lidinfo <número>\` - Info de LID específico\n`;
    response += `• \`${usedPrefix}listallusers\` - Listar usuarios en caché\n`;
    response += `• \`${usedPrefix}searchuser <nombre>\` - Buscar usuario\n\n`;
    
    response += `🧹 *Comandos de Mantenimiento:*\n`;
    response += `• \`${usedPrefix}forcesave\` - Forzar guardado\n`;
    response += `• \`${usedPrefix}phonecorrection\` - Corregir números telefónicos\n\n`;
    
    response += `📞 *Comandos de Validación:*\n`;
    response += `• \`${usedPrefix}phonevalidation <número>\` - Validar teléfono\n\n`;
    
    response += `🧪 *Comandos de Testing:*\n`;
    response += `• \`${usedPrefix}lidtest\` - Test con participantes\n\n`;
    
    response += `📋 *Notas Importantes:*\n`;
    response += `• Solo administradores y owner\n`;
    response += `• El caché se guarda en \`src/lidsresolve.json\`\n`;
    response += `• Los LIDs son únicos globalmente\n`;
    response += `• Auto-guardado cada 30 segundos\n`;
    response += `• Validación automática de números telefónicos\n`;
    
    await conn.reply(m.chat, response, m);
  }
};

handler.command = /^(testlid|lidcache|clearcache|lidstats|forcesave|lidtest|lidinfo|lidhelp|listallusers|searchuser|phonevalidation|phonecorrection)$/i;
handler.rowner = true;
export default handler;
