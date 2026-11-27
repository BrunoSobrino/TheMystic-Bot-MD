
const handler = async (m, { conn }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_grouplist

  let txt = '';
  // En grupos con LID la entrada del bot tiene id=@lid y decodeJid no lo
  // resuelve: se comparan todas las formas conocidas de su id.
  const botIds = [conn.user.id, conn.decodeJid(conn.user.id), conn.user.jid, conn.user.lid].filter(Boolean);
  const isBot = (u) => botIds.includes(conn.decodeJid(u.id)) || botIds.includes(u.id);
try {    
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
  const totalGroups = groups.length;
  for (let i = 0; i < groups.length; i++) {
    const [jid, chat] = groups[i];
    const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
    const participants = groupMetadata.participants || [];
    const bot = participants.find(isBot) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some(isBot);
    const participantStatus = isParticipant ? tradutor.texto1[0] : tradutor.texto1[1];
    const totalParticipants = participants.length;
    txt += `${tradutor.texto2[0]} ${i + 1}
    ${tradutor.texto2[1]} ${await conn.getName(jid)}
    ${tradutor.texto2[2]} ${jid}
    ${tradutor.texto2[3]} ${isBotAdmin ? '✔ Sí' : '❌ No'}
    ${tradutor.texto2[4]} ${participantStatus}
    ${tradutor.texto2[5]} ${totalParticipants}
    ${tradutor.texto2[6]} ${isBotAdmin ? `https://chat.whatsapp.com/${await conn.groupInviteCode(jid) || '--- (Error) ---'}` : '--- (No admin) ---'}\n\n`;
  }
  m.reply(`${tradutor.texto3} ${totalGroups}\n\n${txt}`.trim());
} catch {
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
  const totalGroups = groups.length;
  for (let i = 0; i < groups.length; i++) {
    const [jid, chat] = groups[i];
    const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
    const participants = groupMetadata.participants || [];
    const bot = participants.find(isBot) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some(isBot);
    const participantStatus = isParticipant ? tradutor.texto1[0] : tradutor.texto1[1];
    const totalParticipants = participants.length;    
    txt += `${tradutor.texto2[0]} ${i + 1}
    ${tradutor.texto2[1]} ${await conn.getName(jid)}
    ${tradutor.texto2[2]} ${jid}
    ${tradutor.texto2[3]} ${isBotAdmin ? '✔ Sí' : '❌ No'}
    ${tradutor.texto2[4]} ${participantStatus}
    ${tradutor.texto2[5]} ${totalParticipants}
    ${tradutor.texto2[6]} ${isBotAdmin ? '--- (Error) ---' : '--- (No admin) ---'}\n\n`;
  }
  m.reply(`${tradutor.texto3} ${totalGroups}\n\n${txt}`.trim());
 }    
};
handler.help = ['groups', 'grouplist'];
handler.tags = ['info'];
handler.command = /^(groups|grouplist|listadegrupo|gruposlista|listagrupos|listgroup)$/i;
handler.rowner = true;
handler.private = true
export default handler;
