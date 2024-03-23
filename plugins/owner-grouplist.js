import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_grouplist
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, { conn }) => {
  let txt = '';
try {    
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
  const totalGroups = groups.length;
  for (let i = 0; i < groups.length; i++) {
    const [jid, chat] = groups[i];
    const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
    const participants = groupMetadata.participants || [];
    const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
    const participantStatus = isParticipant ? tradutor.texto1[0] : tradutor.texto1[1] ;
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
    const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
    const participantStatus = isParticipant ? tradutor.texto1[0] : tradutor.texto1[1] ;
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
