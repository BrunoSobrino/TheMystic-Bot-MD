
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*[❗𝐈𝐍𝐅𝐎❗] 𝚄𝚂𝙾 𝙳𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾*\n\n*${usedPrefix + command}* hola @${m.sender.split`@`[0]} a`, null, { mentions: [m.sender] })
  let cm = copy(m)
  let who
  if (text.includes('@0')) who = '0@s.whatsapp.net'
  else if (m.isGroup) who = cm.participant = m.mentionedJid[0]
  else who = m.chat
  if (!who) return m.reply(`*[❗𝐈𝐍𝐅𝐎❗] 𝚄𝚂𝙾 𝙳𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾*\n\n*${usedPrefix + command}* hola @${m.sender.split`@`[0]} a`, null, { mentions: [m.sender] })
  cm.key.fromMe = false 
  cm.message[m.mtype] = copy(m.msg)
  let sp = '@' + who.split`@`[0]
  let [fake, ...real] = text.split(sp)
  conn.fakeReply(m.chat, real.join(sp).trimStart(), who, fake.trimEnd(), m.isGroup ? m.chat : false, {
    contextInfo: {
      mentionedJid: conn.parseMention(real.join(sp).trim())
    }
  })
}
handler.help = ['fake <text> @user <text2>']
handler.tags = ['tools']
handler.command = /^(fitnah|fakereply|fake)$/

export default handler

function copy(obj) {
  return JSON.parse(JSON.stringify(obj))
}
