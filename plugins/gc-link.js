import fs from 'fs';

const handler = async (m, {conn, args}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.gc_link

  const group = m.chat;
  conn.reply(m.chat, 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group), m, {
    contextInfo: {externalAdReply: {mediaUrl: null, mediaType: 1, description: null,
      title: tradutor.texto1[0],
      body: '𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝',
      previewType: 0, thumbnail: fs.readFileSync('./sample_eaa5aab8e81a981182abd4a7c37f106796a2a475.jpg'),
      sourceUrl: `https://chat.whatsapp.com/KT4Ct4CyUbGHxcRxzNu7hX`}}});
};
handler.help = ['linkgroup'];
handler.tags = ['group'];
handler.command = /^link(gro?up)?$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;
