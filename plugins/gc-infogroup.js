
const handler = async (m, {conn, participants, groupMetadata}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.gc_infogroup

  const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || './src/avatar_contact.png';
  const {antiToxic, antiTraba, antidelete, antiviewonce, isBanned, welcome, detect, detect2, sWelcome, sBye, sPromote, sDemote, antiLink, antiLink2, modohorny, autosticker, modoadmin, audios, delete: del} = global.db.data.chats[m.chat];
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
  const text = `${tradutor.texto1[0]}\n
  ${tradutor.texto1[1]}* 
${groupMetadata.id}

${tradutor.texto1[2]}
${groupMetadata.subject}

${tradutor.texto1[3]} 
${groupMetadata.desc?.toString() || tradutor.texto1[22]}


${tradutor.texto1[4]} 
${participants.length} ${tradutor.texto1[5]} 

${tradutor.texto1[6]}  
@${owner.split('@')[0]}

${tradutor.texto1[7]}  
${listAdmin}

${tradutor.texto1[8]} 
${tradutor.texto1[9]}  ${welcome ? '✅' : '❌'}
${tradutor.texto1[10]}  ${detect ? '✅' : '❌'} 
${tradutor.texto1[11]}  ${detect2 ? '✅' : '❌'} 
${tradutor.texto1[12]}  ${antiLink ? '✅' : '❌'} 
${tradutor.texto1[13]}  ${antiLink2 ? '✅' : '❌'} 
${tradutor.texto1[14]}  ${modohorny ? '✅' : '❌'} 
${tradutor.texto1[15]}  ${autosticker ? '✅' : '❌'} 
${tradutor.texto1[16]}  ${audios ? '✅' : '❌'} 
${tradutor.texto1[17]}  ${antiviewonce ? '✅' : '❌'} 
${tradutor.texto1[18]}  ${antidelete ? '✅' : '❌'} 
${tradutor.texto1[19]}  ${antiToxic ? '✅' : '❌'} 
${tradutor.texto1[20]}  ${antiTraba ? '✅' : '❌'} 
${tradutor.texto1[21]}  ${modoadmin ? '✅' : '❌'} 
`.trim();
  conn.sendFile(m.chat, pp, 'error.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner]});
};
handler.help = ['infogrup'];
handler.tags = ['group'];
handler.command = /^(infogrupo|gro?upinfo|info(gro?up|gc))$/i;
handler.group = true;
export default handler;
