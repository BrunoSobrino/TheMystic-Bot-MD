import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_bcgc2
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.


const handler = async (m, {conn, text, participants, isAdmin, isOwner, usedPrefix, command}) => {
  const users = participants.map((u) => u.id).filter((v) => v !== conn.user.jid);
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map((v) => v[0]);
  const fproducto = {key: {fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? {remoteJid: '17608914335@s.whatsapp.net'} : {})}, message: {'productMessage': {'product': {'productImage': {'mimetype': 'image/jpeg', 'jpegThumbnail': imagen1}, 'title': `ᴄᴏᴍᴜɴɪᴄᴀᴅᴏ ᴏғɪᴄɪᴀʟ ᴀ ɢʀᴜᴘᴏs`, 'description': 'ʙʏ ᴛʜᴇ ᴍʏsᴛɪᴄ ﹣ ʙᴏᴛ', 'currencyCode': 'USD', 'priceAmount1000': '1000000000', 'retailerId': 'Ghost', 'productImageCount': 1}, 'businessOwnerJid': `0@s.whatsapp.net`}}};
  if (!m.quoted) throw `${tradutor.texto1[0]} *${usedPrefix + command}* ${traduto.texto1[1]}`;
  for (const id of groups) {
    await conn.sendMessage(id, {forward: m.quoted.fakeObj, mentions: (await conn.groupMetadata(`${id}`)).participants.map((v) => v.id)}, {quoted: fproducto});
  }
  m.reply(`${tradutor.texto2[0]} ${groups.length} ${tradutor.texto2[1]}`);
};
handler.help = ['bcgc2'];
handler.tags = ['owner'];
handler.command = /^(bcgc2)$/i;
handler.owner = true;
export default handler;
