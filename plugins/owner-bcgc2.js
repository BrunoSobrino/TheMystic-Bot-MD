


const handler = async (m, {conn, text, participants, isAdmin, isOwner, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.owner_bcgc2

  const users = participants.map((u) => u.id).filter((v) => v !== conn.user.id);
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map((v) => v[0]);
  if (!m.quoted) throw `${tradutor.texto1[0]} *${usedPrefix + command}* ${tradutor.texto1[1]}`;
  for (const id of groups) {
    // Antes el aviso se enviaba citado a una tarjeta de producto falsa
    // (productMessage de catálogo Business): en varios dispositivos la cita
    // no se veía. Ahora se reenvía sin cita.
    await conn.sendMessage(id, {forward: m.quoted.fakeObj, mentions: (await conn.groupMetadata(`${id}`)).participants.map((v) => v.id)});
  }
  m.reply(`${tradutor.texto2[0]} ${groups.length} ${tradutor.texto2[1]}`);
};
handler.help = ['bcgc2'];
handler.tags = ['owner'];
handler.command = /^(bcgc2)$/i;
handler.owner = true;
export default handler;
