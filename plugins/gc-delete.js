/* Creditos a https://github.com/FG98F */


const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.gc_delete

  if (!m.quoted) throw tradutor.texto1;
  try {
    const delet = m.message.extendedTextMessage.contextInfo.participant;
    const bang = m.message.extendedTextMessage.contextInfo.stanzaId;
    return conn.sendMessage(m.chat, {delete: {remoteJid: m.chat, fromMe: false, id: bang, participant: delet}});
  } catch {
    return conn.sendMessage(m.chat, {delete: m.quoted.vM.key});
  }
};
handler.help = ['del', 'delete'];
handler.tags = ['group'];
handler.command = /^del(ete)?$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;

/* let handler = function (m) {
if (!m.quoted) throw false
let { chat, fromMe, isBaileys } = m.quoted
if (!fromMe) throw false
if (!isBaileys) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚂𝙴 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙽𝙾 𝙵𝚄𝙴 𝙴𝙽𝚅𝙸𝙰𝙳𝙾 𝙿𝙾𝚁 𝙼𝙸, 𝙽𝙾 𝙻𝙾 𝙿𝚄𝙴𝙳𝙾 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝚁*'
conn.sendMessage(chat, { delete: m.quoted.vM.key })
}
handler.help = ['del', 'delete']
handler.tags = ['tools']
handler.command = /^del(ete)?$/i
handler.group = true
handler.admin = true
export default handler*/
