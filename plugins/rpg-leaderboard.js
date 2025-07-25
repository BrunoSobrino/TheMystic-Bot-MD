import fs from 'fs';

const groupMetadataCache = new Map();
const lidCache = new Map();

const handler = async (m, {conn, args, participants}) => {
  try {
    const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje;
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
    const tradutor = _translate.plugins.rpg_leaderboard;

    // Obtener metadata del grupo
    let groupMetadata;
    try {
      groupMetadata = await conn.groupMetadata(m.chat);
      groupMetadataCache.set(m.chat, groupMetadata);
    } catch (e) {
      groupMetadata = groupMetadataCache.get(m.chat) || {participants: []};
    }

    // Obtener usuarios y resolver LIDs
    const users = Object.entries(global.db.data.users).map(([key, value]) => {
      return {...value, jid: key};
    });

    // Función para resolver JIDs
    const resolveJid = async (jid) => {
      if (!jid.endsWith('@lid')) return jid;
      if (lidCache.has(jid)) return lidCache.get(jid);
      
      try {
        const resolved = await resolveLidToRealJid(jid, conn, m.chat);
        lidCache.set(jid, resolved);
        return resolved;
      } catch (e) {
        console.error('Error resolving JID:', e);
        return jid;
      }
    };

    // Resolver todos los JIDs
    const resolvedUsers = await Promise.all(users.map(async (user) => {
      const realJid = await resolveJid(user.jid);
      return {...user, jid: realJid};
    }));

    // Procesar datos
    const sortedExp = resolvedUsers.map(toNumber('exp')).sort(sort('exp'));
    const sortedLim = resolvedUsers.map(toNumber('limit')).sort(sort('limit'));
    const sortedLevel = resolvedUsers.map(toNumber('level')).sort(sort('level'));

    const usersExp = sortedExp.map(enumGetKey);
    const usersLim = sortedLim.map(enumGetKey);
    const usersLevel = sortedLevel.map(enumGetKey);

    const len = args[0] && args[0].length > 0 ? Math.min(100, Math.max(parseInt(args[0]), 10) : Math.min(10, sortedExp.length);
    const adventurePhrases = tradutor.texto1;
    const randomAdventurePhrase = adventurePhrases[Math.floor(Math.random() * adventurePhrases.length)];

    // Función para formatear entradas
    const formatEntry = async (user, i, type) => {
      try {
        const realJid = await resolveJid(user.jid);
        const number = realJid.split('@')[0];
        const isParticipant = participants.some(p => p.jid === realJid);
        
        let name = '';
        try {
          name = isParticipant ? `(${await conn.getName(realJid)})` : '';
        } catch (e) {
          console.error('Error getting name:', e);
        }

        const mention = isParticipant ? `wa.me/${number}` : `@${number}`;

        switch (type) {
          case 'exp':
            return `${i + 1}. ${name} ${mention} *${user.exp} ${tradutor.texto2[6]}*`;
          case 'limit':
            return `${i + 1}. ${name} ${mention} *${user.limit} ${tradutor.texto2[7]}*`;
          case 'level':
            return `${i + 1}. ${name} ${mention} *${tradutor.texto2[8]} ${user.level}*`;
          default:
            return '';
        }
      } catch (e) {
        console.error('Error formatting entry:', e);
        return `${i + 1}. [Error al mostrar usuario]`;
      }
    };

    // Generar secciones del leaderboard
    const expSection = await Promise.all(sortedExp.slice(0, len).map((user, i) => formatEntry(user, i, 'exp')));
    const limSection = await Promise.all(sortedLim.slice(0, len).map((user, i) => formatEntry(user, i, 'limit')));
    const levelSection = await Promise.all(sortedLevel.slice(0, len).map((user, i) => formatEntry(user, i, 'level')));

    // Construir mensaje final
    const texto = `
${tradutor.texto2[0]}
    
${tradutor.texto2[1]} ${len} ${tradutor.texto2[2]}
${tradutor.texto2[3]} ${usersExp.indexOf(m.sender) + 1} ${tradutor.texto2[4]} ${usersExp.length}

${expSection.join('\n')}

${tradutor.texto2[9]}
${tradutor.texto2[3]} ${usersLim.indexOf(m.sender) + 1} ${tradutor.texto2[5]} ${usersLim.length}

${limSection.join('\n')}

${tradutor.texto2[10]}
${tradutor.texto2[3]} ${usersLevel.indexOf(m.sender) + 1} ${tradutor.texto2[6]} ${usersLevel.length}

${levelSection.join('\n')}

*⚔️ ${randomAdventurePhrase} ⚔️*`.trim();

    // Enviar mensaje
    await conn.sendMessage(m.chat, {
      text: texto, 
      mentions: conn.parseMention(texto)
    }, {
      quoted: m
    });

  } catch (error) {
    console.error('Error en el handler:', error);
    await conn.sendMessage(m.chat, {text: 'Ocurrió un error al generar el leaderboard. Por favor intenta nuevamente.'}, {quoted: m});
  }
};

handler.help = ['top'];
handler.tags = ['xp'];
handler.command = ['leaderboard', 'lb'];
export default handler;

// Funciones auxiliares
function sort(property, ascending = true) {
  return (a, b) => ascending ? a[property] - b[property] : b[property] - a[property];
}

function toNumber(property, _default = 0) {
  return (user) => {
    return {...user, [property]: user[property] === undefined ? _default : Number(user[property])};
  };
}

function enumGetKey(user) {
  return user.jid;
}

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 1000) {
  const inputJid = lid.toString();
  
  if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) {
    return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`;
  }

  if (lidCache.has(inputJid)) {
    return lidCache.get(inputJid);
  }

  const lidToFind = inputJid.split("@")[0];
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const metadata = await conn.groupMetadata(groupChatId);
      const participants = metadata?.participants || [];
      
      for (const participant of participants) {
        if (!participant?.jid) continue;
        
        try {
          const contactDetails = await conn.onWhatsApp(participant.jid);
          if (contactDetails?.[0]?.lid) {
            const possibleLid = contactDetails[0].lid.split("@")[0];
            if (possibleLid === lidToFind) {
              lidCache.set(inputJid, participant.jid);
              return participant.jid;
            }
          }
        } catch (e) {
          continue;
        }
      }

      lidCache.set(inputJid, inputJid);
      return inputJid;

    } catch (e) {
      attempts++;
      if (attempts >= maxRetries) {
        lidCache.set(inputJid, inputJid);
        return inputJid;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  return inputJid;
}
