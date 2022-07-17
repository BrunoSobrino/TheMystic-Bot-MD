let handler = async (m, { conn, text }) => {

let [nomor, pesan, jumlah] = text.split('|')
if (!nomor) throw '*[ ⚠️ ] 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙽𝚄𝙼𝙴𝚁𝙾 𝙰𝙻 𝙲𝚄𝙰𝙻 𝚂𝙴 𝙻𝙴 𝙷𝙰𝚁𝙰 𝙴𝙻 𝚂𝙿𝙰𝙼 𝙳𝙴 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂!*\n*𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:*\n*—◉ #spamwa numero|texto|cantidad*\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*—◉ #spamwa 5219999999999|responde :v|25*'
if (!pesan) throw '*[ ⚠️ ] 𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙴𝙻 𝙼𝙴𝙽𝚂𝙰𝙹𝙴 𝙿𝙰𝚁𝙰 𝙷𝙰𝙲𝙴𝚁 𝙴𝙻 𝚂𝙿𝙰𝙼!*\n*𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:*\n*—◉ #spamwa numero|texto|cantidad*\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*—◉ #spamwa 5219999999999|responde :v|25*'
if (jumlah && isNaN(jumlah)) throw '*[ ⚠️ ] 𝙻𝙰 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙳𝙴𝙱𝙴 𝚂𝙴𝚁 𝚄𝙽 𝙽𝚄𝙼𝙴𝚁𝙾!*\n*𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:*\n*—◉ #spamwa numero|texto|cantidad*\n*𝙴𝙹𝙴𝙼𝙿𝙻𝙾:*\n*—◉ #spamwa 5219999999999|responde :v|25*'

let fixedNumber = nomor.replace(/[-+<>@]/g, '').replace(/ +/g, '').replace(/^[0]/g, '62') + '@s.whatsapp.net'
let fixedJumlah = jumlah ? jumlah * 1 : 10
if (fixedJumlah > 50) throw '*[ ⚠️ ] 𝙳𝙴𝙼𝙰𝚂𝙸𝙰𝙳𝙾𝚂 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂! 𝙻𝙰 𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙳𝙴𝙱𝙴 𝚂𝙴𝚁 𝙼𝙴𝙽𝙾𝚁 𝙰 𝟻0 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂*️'
await m.reply(`*[❗] 𝙴𝙻 𝚂𝙿𝙰𝙼 𝙳𝙴 𝙼𝙴𝙽𝚂𝙰𝙹𝙴𝚂 𝙰𝙻 𝙽𝚄𝙼𝙴𝚁𝙾 ${nomor} 𝙵𝚄𝙴 𝚁𝙴𝙰𝙻𝙸𝚉𝙰𝙳𝙾 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾*\n*𝙲𝙰𝙽𝚃𝙸𝙳𝙰𝙳 𝙴𝙽𝚅𝙸𝙰𝙳𝙰:*\n*—◉ ${fixedJumlah} 𝚟𝚎𝚌𝚎𝚜!*`)
for (let i = fixedJumlah; i > 1; i--) {
if (i !== 0) conn.reply(fixedNumber, pesan.trim(), m)
}}
handler.help = ['spamwa <number>|<mesage>|<no of messages>']
handler.tags = ['General']
handler.command = /^spam(wa)?$/i
handler.group = false
handler.premium = false
handler.private = true
handler.limit = true
export default handler
