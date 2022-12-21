let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽 𝚃𝙴𝚇𝚃𝙾 𝙿𝙰𝚁𝙰 𝙴𝙽𝚅𝙸𝙰𝚁 𝙰 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝚂𝚄𝙿𝙿𝙾𝚁𝚃*\n\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*${usedPrefix + command} me fui a soporte necesito ayuda, número: +54##########*`
if (text.length < 10) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝚃𝙴𝚇𝚃𝙾 𝙳𝙴𝙱𝙴 𝚂𝙴𝚁 𝙳𝙴 𝙼𝙸𝙽𝙸𝙼𝙾 𝟷0 𝙲𝙰𝚁𝙰𝙲𝚃𝙴𝚁𝙴𝚂!*`
if (text.length > 1000) throw `*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝚃𝙴𝚇𝚃𝙾 𝙳𝙴𝙱𝙴 𝚂𝙴𝚁 𝙳𝙴 𝙼𝙰𝚇𝙸𝙼𝙾 𝟷000 𝙲𝙰𝚁𝙰𝙲𝚃𝙴𝚁𝙴𝚂!*`
let teks = `${text}`
conn.reply('15517868031@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, { contextInfo: { mentionedJid: [m.sender] }})
m.reply(`*[ ✅ ] 𝚃𝙴𝚇𝚃𝙾 𝙴𝙽𝚅𝙸𝙰𝙳𝙾 𝙰 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝚂𝚄𝙿𝙿𝙾𝚁𝚃, 𝙴𝙻 𝙱𝙾𝚃 𝙽𝙾 𝙻𝙴 𝙴𝙽𝚅𝙸𝙰𝚁𝙰 𝙻𝙰 𝚁𝙴𝚂𝙿𝚄𝙴𝚂𝚃𝙰 𝙳𝙴 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝚂𝚄𝙿𝙿𝙾𝚁𝚃*`)
}
handler.help = ['supportwa', 'request'].map(v => v + ' <teks>')
handler.tags = ['info']
handler.command = /^(supportwa|soportewhatsapp|ayudawhatsapp|salirdesoportewa|salirdesoportewhatsapp)$/i
export default handler
