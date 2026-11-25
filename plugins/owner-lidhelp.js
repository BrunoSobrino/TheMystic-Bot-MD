import fs from 'fs';

let handler = async (m, { conn, text, command, usedPrefix }) => {    
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_lidhelp
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
          cacheFile: conn.lid?.getStats ? conn.lid.getStats().cacheFile : tradutor.texto18
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

      let response = tradutor.texto1;
      response += tradutor.texto2;
      response += `${tradutor.texto3}${info.lidResolverStatus.resolverExists ? '✅' : '❌'}\n`;
      response += `${tradutor.texto4}${info.lidResolverStatus.cacheSize}${tradutor.texto4_1}\n`;
      response += `${tradutor.texto5}${info.lidResolverStatus.jidMappingSize}${tradutor.texto4_1}\n`;
      response += `${tradutor.texto6}${info.lidResolverStatus.isDirty ? '⏳' : '✅'}\n`;
      response += `${tradutor.texto7}${info.lidResolverStatus.cacheFile.split('/').pop()}\n\n`;
      
      response += tradutor.texto8;
      response += `${tradutor.texto9}${info.messageInfo.chat}\n`;
      response += `${tradutor.texto10}${info.messageInfo.isGroup ? '✅' : '❌'}\n`;
      response += `${tradutor.texto11}${info.messageInfo.sender}\n`;
      response += `${tradutor.texto12}${info.lidsInMessage}\n\n`;
      
      response += tradutor.texto13;
      response += `${tradutor.texto14}${info.messageProcessed.participantEndsWithLid ? '❌' : '✅'}\n`;
      response += `${tradutor.texto15}${info.messageProcessed.keyParticipantEndsWithLid ? '❌' : '✅'}\n`;
      response += `${tradutor.texto16}${info.messageProcessed.mentionedJids.length}\n`;

      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en testlid:', error);
      await conn.reply(m.chat, `${tradutor.texto17}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidcache - Estadísticas del caché
  // ========================================
  if (command === 'lidcache') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
      }
      
      const stats = conn.lid.getStats();
      
      let response = tradutor.texto20;
      response += tradutor.texto21;
      response += `${tradutor.texto22}${stats.total}\n`;
      response += `${tradutor.texto23}${stats.valid}\n`;
      response += `${tradutor.texto24}${stats.notFound}\n`;
      response += `${tradutor.texto25}${stats.errors}\n`;
      response += `${tradutor.texto26}${stats.jidMappings}\n`;
      response += `${tradutor.texto27}${stats.fileExists ? '✅' : '❌'}\n`;
      response += `${tradutor.texto6}${stats.isDirty ? '⏳' : '✅'}\n\n`;
      
      response += tradutor.texto28;
      response += `${tradutor.texto7}${stats.cacheFile.split('/').pop()}\n`;
      response += tradutor.texto29;
      
      if (stats.total > 0) {
        response += tradutor.texto30;
        const users = conn.lid.getAllUsers().slice(0, 5);
        users.forEach((user, index) => {
          const lidShort = user.lid.split('@')[0].slice(-4);
          const jidShort = user.jid.split('@')[0].slice(-4);
          const nameShort = user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name;
          response += `${index + 1}${tradutor.texto31}${lidShort}${tradutor.texto31_1}${jidShort}${tradutor.texto31_2}${nameShort})\n`;
        });
        
        if (stats.total > 5) {
          response += `${tradutor.texto32}${stats.total - 5}${tradutor.texto32_1}\n`;
        }
      } else {
        response += tradutor.texto33;
      }
      
      await conn.reply(m.chat, response, m);
    } catch (error) {
      console.error('[TEST-LID] Error en lidcache:', error);
      await conn.reply(m.chat, `${tradutor.texto34}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: clearcache - Limpiar todo el caché
  // ========================================
  if (command === 'clearcache') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
      }
      
      const oldStats = conn.lid.getStats();
      
      // Limpiar usando conn.lid (que internamente maneja el caché)
      if (typeof conn.lid.forceSave === 'function') {
        // Si existe una función para limpiar, úsala
        // Como no hay una función clear directa en conn.lid, necesitaremos acceder internamente
        // Esto requiere modificación en la implementación
      }
      
      let response = tradutor.texto35;
      response += `${tradutor.texto36}${oldStats.total}\n`;
      response += `${tradutor.texto37}${oldStats.valid}\n`;
      response += `${tradutor.texto24}${oldStats.notFound}\n`;
      response += `${tradutor.texto25}${oldStats.errors}\n`;
      response += `${tradutor.texto38}${oldStats.jidMappings}\n`;
      response += tradutor.texto39;
      
      await conn.reply(m.chat, tradutor.texto40, m);
    } catch (error) {
      console.error('[TEST-LID] Error en clearcache:', error);
      await conn.reply(m.chat, `${tradutor.texto34}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidstats - Estadísticas detalladas
  // ========================================
  if (command === 'lidstats') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
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
      
      let response = tradutor.texto41;
      response += tradutor.texto42;
      response += `${tradutor.texto43}${stats.cacheFile}\n`;
      response += `${tradutor.texto3}${stats.fileExists ? '✅' : '❌'}\n`;
      response += `${tradutor.texto44}${(fileSize / 1024).toFixed(2)}${tradutor.texto44_1}\n`;
      response += `${tradutor.texto45}${stats.isDirty ? '⏳' : '✅'}\n\n`;
      
      response += tradutor.texto46;
      response += `${tradutor.texto47}${stats.total}${tradutor.texto4_1}\n`;
      response += `${tradutor.texto37}${stats.valid}\n`;
      response += `${tradutor.texto24}${stats.notFound}\n`;
      response += `${tradutor.texto25}${stats.errors}\n`;
      response += `${tradutor.texto26}${stats.jidMappings}\n\n`;
      
      const efficiency = stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : 0;
      response += `${tradutor.texto48}${efficiency}${tradutor.texto48_1}\n`;
      
      const memoryEstimate = stats.total * 200; // ~200 bytes por entrada
      response += `${tradutor.texto49}${(memoryEstimate / 1024).toFixed(2)}${tradutor.texto44_1}\n`;
      
      await conn.reply(m.chat, response, m);
    } catch (error) {
      console.error('[TEST-LID] Error en lidstats:', error);
      await conn.reply(m.chat, `${tradutor.texto34}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: forcesave - Forzar guardado
  // ========================================
  if (command === 'forcesave') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
      }
      
      const beforeStats = conn.lid.getStats();
      
      if (!beforeStats.isDirty) {
        return await conn.reply(m.chat, tradutor.texto50, m);
      }
      
      const saveResult = conn.lid.forceSave();
      
      let response = tradutor.texto51;
      response += `${tradutor.texto52}${beforeStats.total}\n`;
      response += `${tradutor.texto37}${beforeStats.valid}\n`;
      response += `${tradutor.texto26}${beforeStats.jidMappings}\n`;
      response += tradutor.texto53;
      response += `${tradutor.texto54}${saveResult ? tradutor.texto54_1 : tradutor.texto54_2}\n`;
      
      await conn.reply(m.chat, response, m);
    } catch (error) {
      console.error('[TEST-LID] Error en forcesave:', error);
      await conn.reply(m.chat, `${tradutor.texto55}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidtest - Test manual con participantes
  // ========================================
  if (command === 'lidtest') {
    if (!m.isGroup) {
      return await conn.reply(m.chat, tradutor.texto56, m);
    }
    
    try {
      // Obtener metadatos del grupo
      const metadata = await conn.groupMetadata(m.chat);
      const participants = metadata.participants;
      
      let response = tradutor.texto57;
      response += `${tradutor.texto58}${metadata.subject}\n`;
      response += `${tradutor.texto59}${participants.length}\n\n`;
      
      // Verificar algunos participantes para testing
      const testCount = Math.min(3, participants.length);
      let resolvedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < testCount; i++) {
        const participant = participants[i];
        try {
          const contactInfo = await conn.onWhatsApp(participant.jid || participant.id);
          const lid = contactInfo[0]?.lid;
          
          response += `${tradutor.texto60}${i + 1}${tradutor.texto60_1}\n`;
          response += `${tradutor.texto61}${(participant.jid || participant.id).split('@')[0].slice(-6)}\n`;
          
          if (lid) {
            response += `${tradutor.texto62}${lid.split('@')[0].slice(-6)}\n`;
            
            // Test resolver usando conn.lid
            const startTime = Date.now();
            const resolved = await conn.lid.resolveLid(lid, m.chat);
            const resolveTime = Date.now() - startTime;
            
            const success = resolved === (participant.jid || participant.id);
            response += `${tradutor.texto63}${success ? '✅' : '❌'}${tradutor.texto63_1}${resolveTime}${tradutor.texto63_2}\n`;
            
            if (success) resolvedCount++;
          } else {
            response += tradutor.texto64;
            response += tradutor.texto65;
          }
          response += `\n`;
          
        } catch (error) {
          response += `${tradutor.texto66}${i + 1}${tradutor.texto66_1}${error.message}\n\n`;
          errorCount++;
        }
      }
      
      response += tradutor.texto67;
      response += `${tradutor.texto68}${resolvedCount}${tradutor.texto68_1}${testCount}\n`;
      response += `${tradutor.texto25}${errorCount}\n`;
      response += `${tradutor.texto69}${conn.lid.getStats().total}${tradutor.texto4_1}\n`;
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en lidtest:', error);
      await conn.reply(m.chat, `${tradutor.texto70}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidinfo - Información de un LID específico
  // ========================================
  if (command === 'lidinfo') {
    if (!text) {
      return await conn.reply(m.chat, `${tradutor.texto71}${usedPrefix}${tradutor.texto71_1}${usedPrefix}${tradutor.texto71_2}`, m);
    }
    
    if (!m.isGroup) {
      return await conn.reply(m.chat, tradutor.texto72, m);
    }
    
    try {
      const numberToSearch = text.replace(/[^0-9]/g, '');
      if (!numberToSearch) {
        return await conn.reply(m.chat, tradutor.texto73, m);
      }
      
      const lidJid = `${numberToSearch}@lid`;
      
      let response = tradutor.texto74;
      response += `${tradutor.texto75}${numberToSearch}\n`;
      response += `${tradutor.texto76}${lidJid}\n`;
      response += `${tradutor.texto77}${m.chat}\n\n`;
      
      // Verificar en caché usando conn.lid
      const userInfo = conn.lid.getUserInfo(numberToSearch);
      if (userInfo) {
        response += tradutor.texto78;
        response += `${tradutor.texto79}${userInfo.jid}\n`;
        response += `${tradutor.texto80}${userInfo.name}\n`;
        response += `${tradutor.texto81}${new Date(userInfo.timestamp).toLocaleString()}\n`;
        
        if (userInfo.notFound) {
          response += tradutor.texto82;
        } else if (userInfo.error) {
          response += tradutor.texto83;
        } else {
          response += tradutor.texto84;
        }
      } else {
        response += tradutor.texto85;
        
        // Intentar resolver
        response += tradutor.texto86;
        
        const startTime = Date.now();
        const resolved = await conn.lid.resolveLid(lidJid, m.chat);
        const resolveTime = Date.now() - startTime;
        
        response += `${tradutor.texto87}${resolveTime}${tradutor.texto87_1}\n`;
        response += `${tradutor.texto88}${resolved}\n`;
        response += `${tradutor.texto89}${resolved !== lidJid ? tradutor.texto89_1 : tradutor.texto89_2}\n`;
        
        // Mostrar información actualizada del caché
        const updatedInfo = conn.lid.getUserInfo(numberToSearch);
        if (updatedInfo) {
          response += `${tradutor.texto90}${updatedInfo.name}\n`;
        }
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en lidinfo:', error);
      await conn.reply(m.chat, `${tradutor.texto91}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: listallusers - Listar todos los usuarios en caché
  // ========================================
  if (command === 'listallusers') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
      }
      
      const users = conn.lid.getAllUsers();
      
      if (users.length === 0) {
        return await conn.reply(m.chat, tradutor.texto92, m);
      }
      
      let response = `${tradutor.texto93}${users.length}${tradutor.texto93_1}`;
      
      const maxShow = 20; // Mostrar máximo 20 usuarios
      const usersToShow = users.slice(0, maxShow);
      
      usersToShow.forEach((user, index) => {
        const lidShort = user.lid.split('@')[0].slice(-6);
        const jidShort = user.jid.split('@')[0].slice(-6);
        const nameShort = user.name.length > 20 ? user.name.substring(0, 20) + '...' : user.name;
        response += `${index + 1}${tradutor.texto94}${nameShort}${tradutor.texto94_1}\n`;
        response += `${tradutor.texto95}${lidShort}${tradutor.texto95_1}${jidShort}\n`;
        response += `${tradutor.texto96}${user.timestamp}\n\n`;
      });
      
      if (users.length > maxShow) {
        response += `${tradutor.texto32}${users.length - maxShow}${tradutor.texto97}\n\n`;
        response += `${tradutor.texto98}${usedPrefix}${tradutor.texto98_1}`;
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en listallusers:', error);
      await conn.reply(m.chat, `${tradutor.texto99}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: searchuser - Buscar usuario por nombre
  // ========================================
  if (command === 'searchuser') {
    if (!text) {
      return await conn.reply(m.chat, `${tradutor.texto71}${usedPrefix}${tradutor.texto100}${usedPrefix}${tradutor.texto100_1}`, m);
    }
    
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
      }
      
      const searchTerm = text.toLowerCase();
      const users = conn.lid.getAllUsers();
      
      const matches = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.jid.includes(searchTerm) ||
        user.lid.includes(searchTerm)
      );
      
      if (matches.length === 0) {
        return await conn.reply(m.chat, `${tradutor.texto101}${text}${tradutor.texto101_1}`, m);
      }
      
      let response = `${tradutor.texto102}${text}${tradutor.texto102_1}${matches.length}${tradutor.texto102_2}`;
      
      const maxShow = 10;
      const matchesToShow = matches.slice(0, maxShow);
      
      matchesToShow.forEach((user, index) => {
        const lidShort = user.lid.split('@')[0].slice(-6);
        const jidShort = user.jid.split('@')[0].slice(-6);
        response += `${index + 1}${tradutor.texto94}${user.name}${tradutor.texto94_1}\n`;
        response += `${tradutor.texto95}${lidShort}${tradutor.texto95_1}${jidShort}\n`;
        response += `${tradutor.texto96}${user.timestamp}\n\n`;
      });
      
      if (matches.length > maxShow) {
        response += `${tradutor.texto32}${matches.length - maxShow}${tradutor.texto103}`;
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en searchuser:', error);
      await conn.reply(m.chat, `${tradutor.texto104}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: phonevalidation - Validar números telefónicos
  // ========================================
  if (command === 'phonevalidation') {
    if (!text) {
      return await conn.reply(m.chat, `${tradutor.texto71}${usedPrefix}${tradutor.texto105}${usedPrefix}${tradutor.texto105_1}`, m);
    }
    
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
      }
      
      const phoneNumber = text.trim();
      const isValid = conn.lid.validatePhoneNumber(phoneNumber);
      const detection = conn.lid.detectPhoneInLid(phoneNumber.replace(/[^0-9]/g, ''));
      
      let response = tradutor.texto106;
      response += `${tradutor.texto75}${phoneNumber}\n`;
      response += `${tradutor.texto107}${isValid ? tradutor.texto89_1 : tradutor.texto89_2}\n`;
      response += `${tradutor.texto108}${detection.isPhone ? tradutor.texto89_1 : tradutor.texto89_2}\n`;
      
      if (detection.isPhone) {
        response += `${tradutor.texto109}${detection.phoneNumber}\n`;
        response += `${tradutor.texto110}${detection.jid}\n`;
      }
      
      await conn.reply(m.chat, response, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en phonevalidation:', error);
      await conn.reply(m.chat, `${tradutor.texto111}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: phonecorrection - Corrección automática de teléfonos
  // ========================================
  if (command === 'phonecorrection') {
    try {
      if (!conn.lid) {
        return await conn.reply(m.chat, tradutor.texto19, m);
      }
      
      const result = conn.lid.forcePhoneCorrection();
      await conn.reply(m.chat, result, m);
      
    } catch (error) {
      console.error('[TEST-LID] Error en phonecorrection:', error);
      await conn.reply(m.chat, `${tradutor.texto112}${error.message}`, m);
    }
  }
  
  // ========================================
  // COMANDO: lidhelp - Ayuda completa
  // ========================================
  if (command === 'lidhelp') {
    let response = tradutor.texto113;
    
    response += tradutor.texto114;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto115_1}\n`;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto116_1}\n`;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto117_1}\n`;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto118_1}\n`;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto119_1}\n`;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto120_1}\n\n`;
    
    response += tradutor.texto121;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto122_1}\n`;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto123_1}\n\n`;
    
    response += tradutor.texto124;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto125_1}\n\n`;
    
    response += tradutor.texto126;
    response += `${tradutor.texto115}${usedPrefix}${tradutor.texto127_1}\n\n`;
    
    response += tradutor.texto128;
    response += tradutor.texto129;
    response += tradutor.texto130;
    response += tradutor.texto131;
    response += tradutor.texto132;
    response += tradutor.texto133;
    
    await conn.reply(m.chat, response, m);
  }
};

handler.command = /^(testlid|lidcache|clearcache|lidstats|forcesave|lidtest|lidinfo|lidhelp|listallusers|searchuser|phonevalidation|phonecorrection)$/i;
handler.rowner = true;
export default handler;
