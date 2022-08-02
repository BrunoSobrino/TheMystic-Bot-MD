let handler = m => m
handler.before = async function (m) {
this.suit = this.suit ? this.suit : {}
if (db.data.users[m.sender].suit < 0) db.data.users[m.sender].suit = 0
let room = Object.values(this.suit).find(room => room.id && room.status && [room.p, room.p2].includes(m.sender))
if (room) {
let win = ''
let tie = false
if (m.sender == room.p2 && /^(acc(ept)?|terima|aceptar|gas|aceptare?|nao|gamau|rechazar|ga(k.)?bisa)/i.test(m.text) && m.isGroup && room.status == 'wait') {
if (/^(tolak|gamau|rechazar|ga(k.)?bisa)/i.test(m.text)) {
let textno = `*[❗] @${room.p2.split`@`[0]} 𝚁𝙴𝙲𝙷𝙰𝚉𝙾 𝙴𝙻 𝙿𝚅𝙿, 𝙴𝙻 𝙹𝚄𝙴𝙶𝙾 𝚂𝙴 𝙲𝙰𝙽𝙲𝙴𝙻𝙰*`
m.reply(textno, null, {mentions: this.parseMention(textno)})
delete this.suit[room.id]
return !0 }
room.status = 'play'
room.asal = m.chat
clearTimeout(room.waktu)
let textplay = `🎮 𝙶𝙰𝙼𝙴𝚂 - 𝙿𝚅𝙿 - 𝙶𝙰𝙼𝙴𝚂 🎮\n\n—◉ 𝙴𝙻 𝙹𝚄𝙴𝙶𝙾 𝙲𝙾𝙼𝙸𝙴𝙽𝚉𝙰, 𝙻𝙰𝚂 𝙾𝙿𝙲𝙸𝙾𝙽𝙴𝚂 𝙷𝙰𝙽 𝚂𝙸𝙳𝙾 𝙴𝙽𝚅𝙸𝙰𝙳𝙾𝚂 𝙰 𝙻𝙾𝚂 𝙲𝙷𝙰𝚃𝚂 𝙿𝚁𝙸𝚅𝙰𝙳𝙾𝚂 𝙳𝙴 @${room.p.split`@`[0]} 𝚈 @${room.p2.split`@`[0]}\n\n◉ 𝚂𝙴𝙻𝙴𝙲𝙲𝙸𝙾𝙽𝙴𝙽 𝚄𝙽𝙰 𝙾𝙿𝙲𝙸𝙾𝙽 𝙴𝙽 𝚂𝚄𝚂 𝙲𝙷𝙰𝚃𝚂 𝙿𝚁𝙸𝚅𝙰𝙳𝙾𝚂, 𝚁𝙴𝚂𝙿𝙴𝙲𝚃𝙸𝚅𝙰𝙼𝙴𝙽𝚃𝙴\n*◉ 𝙴𝙻𝙴𝙶𝙸𝚁 𝙾𝙿𝙲𝙸𝙾𝙽 𝙴𝙽 wa.me/${conn.user.jid.split`@`[0]}*`
m.reply(textplay, m.chat, {mentions: this.parseMention(textplay)})
let imgplay = `https://www.merca2.es/wp-content/uploads/2020/05/Piedra-papel-o-tijera-0003318_1584-825x259.jpeg`    
if (!room.pilih) this.sendHydrated(room.p, '𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚂𝙴𝙻𝙴𝙲𝙲𝙸𝙾𝙽𝙴 𝚄𝙽𝙰 𝙳𝙴 𝙻𝙰𝚂 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴𝚂 𝙾𝙿𝙲𝙸𝙾𝙽𝙴𝚂', `𝙶𝙰𝙽𝙰𝙳𝙾𝚁 +${room.poin}𝚇𝙿\n𝙿𝙴𝚁𝙳𝙴𝙳𝙾𝚁 ${room.poin_lose}𝚇𝙿`, imgplay, null, null, null, null, [['PIEDRA 🗿', 'Piedra'], ['PAPEL 📄', 'Papel'], ['TIJERA ✂️', 'Tijera']], m)
if (!room.pilih2) this.sendHydrated(room.p2, '𝙿𝙾𝚁 𝙵𝙰𝚅𝙾𝚁 𝚂𝙴𝙻𝙴𝙲𝙲𝙸𝙾𝙽𝙴 𝚄𝙽𝙰 𝙳𝙴 𝙻𝙰𝚂 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴𝚂 𝙾𝙿𝙲𝙸𝙾𝙽𝙴𝚂', `𝙶𝙰𝙽𝙰𝙳𝙾𝚁 +${room.poin}𝚇𝙿\n𝙿𝙴𝚁𝙳𝙴𝙳𝙾𝚁 ${room.poin_lose}𝚇𝙿`, imgplay, null, null, null, null, [['PIEDRA 🗿', 'Piedra'], ['PAPEL 📄', 'Papel'], ['TIJERA ✂️', 'Tijera']], m)                             
room.waktu_milih = setTimeout(() => {
if (!room.pilih && !room.pilih2) this.sendButton(m.chat, `[❗] 𝙽𝙸𝙽𝙶𝚄𝙽 𝙹𝚄𝙶𝙰𝙳𝙾𝚁 𝚃𝙾𝙼𝙾 𝙻𝙰 𝙸𝙽𝙸𝙲𝙸𝙰𝚃𝙸𝚅𝙰 𝙳𝙴 𝙴𝙼𝙴𝙿𝙴𝚉𝙰𝚁 𝙴𝙻 𝙹𝚄𝙴𝙶𝙾, 𝙴𝙻 𝙿𝚅𝙿 𝚂𝙴 𝙰𝙷 𝙲𝙰𝙽𝙲𝙴𝙻𝙰𝙳𝙾`, wm, null, [['𝙼𝙴𝙽𝚄 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻', '#menu']], m)
else if (!room.pilih || !room.pilih2) {
win = !room.pilih ? room.p2 : room.p 
let textnull = `*[❗] @${(room.pilih ? room.p2 : room.p).split`@`[0]} 𝙽𝙾 𝙴𝙻𝙴𝙶𝙸𝚂𝚃𝙴 𝙽𝙸𝙽𝙶𝚄𝙽𝙰 𝙾𝙿𝙲𝙸𝙾𝙽, 𝙵𝙸𝙽 𝙳𝙴𝙻 𝙿𝚅𝙿*`
this.sendButton(m.chat, textnull, wm, null, [['𝙼𝙴𝙽𝚄 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻', '#menu']], m, { mentions: this.parseMention(textnull)})
db.data.users[win == room.p ? room.p : room.p2].exp += room.poin
db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot
db.data.users[win == room.p ? room.p2 : room.p].exp -= room.poin_lose
}
delete this.suit[room.id]
return !0
}, room.timeout)}
let jwb = m.sender == room.p
let jwb2 = m.sender == room.p2
let g = /tijera/i
let b = /piedra/i
let k = /papel/i
let reg = /^(tijera|piedra|papel)/i
if (jwb && reg.test(m.text) && !room.pilih && !m.isGroup) {
room.pilih = reg.exec(m.text.toLowerCase())[0]
room.text = m.text
m.reply(`*[ ✔ ] 𝙷𝙰𝚂 𝙴𝙻𝙴𝙶𝙸𝙳𝙾 ${m.text}, 𝚁𝙴𝙶𝚁𝙴𝚂𝙰 𝙰𝙻 𝙶𝚁𝚄𝙿𝙾 𝚈 ${room.pilih2 ? `𝚁𝙴𝚅𝙸𝚂𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*` : '𝙴𝚂𝙿𝙴𝚁𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*'}`)
if (!room.pilih2) this.reply(room.p2, '*[❗] 𝙴𝙻 𝙾𝙿𝙾𝙽𝙴𝙽𝚃𝙴 𝙰𝙷 𝙴𝙻𝙴𝙶𝙸𝙳𝙾, 𝙴𝚂 𝚃𝚄 𝚃𝚄𝚁𝙽𝙾 𝙳𝙴 𝙴𝙻𝙴𝙶𝙸𝚁!!*', 0)}
if (jwb2 && reg.test(m.text) && !room.pilih2 && !m.isGroup) {
room.pilih2 = reg.exec(m.text.toLowerCase())[0]
room.text2 = m.text
m.reply(`*[ ✔ ] 𝙷𝙰𝚂 𝙴𝙻𝙴𝙶𝙸𝙳𝙾 ${m.text}, 𝚁𝙴𝙶𝚁𝙴𝚂𝙰 𝙰𝙻 𝙶𝚁𝚄𝙿𝙾 𝚈 ${room.pilih ? `𝚁𝙴𝚅𝙸𝚂𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*` : '𝙴𝚂𝙿𝙴𝚁𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*'}`)
if (!room.pilih) this.reply(room.p, '*[❗] 𝙴𝙻 𝙾𝙿𝙾𝙽𝙴𝙽𝚃𝙴 𝙰𝙷 𝙴𝙻𝙴𝙶𝙸𝙳𝙾, 𝙴𝚂 𝚃𝚄 𝚃𝚄𝚁𝙽𝙾 𝙳𝙴 𝙴𝙻𝙴𝙶𝙸𝚁!!*', 0)}
let stage = room.pilih
let stage2 = room.pilih2
if (room.pilih && room.pilih2) {
clearTimeout(room.waktu_milih)
if (b.test(stage) && g.test(stage2)) win = room.p
else if (b.test(stage) && k.test(stage2)) win = room.p2
else if (g.test(stage) && k.test(stage2)) win = room.p
else if (g.test(stage) && b.test(stage2)) win = room.p2
else if (k.test(stage) && b.test(stage2)) win = room.p
else if (k.test(stage) && g.test(stage2)) win = room.p2
else if (stage == stage2) tie = true 
this.reply(room.asal, `
*👑 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙳𝙴𝙻 𝙿𝚅𝙿 👑*${tie ? '\n*—◉ 𝙴𝙼𝙿𝙰𝚃𝙴!!*' : ''}

*@${room.p.split`@`[0]} (${room.text}) ${tie ? '' : room.p == win ? ` 𝙶𝙰𝙽𝙾 🥳 +${room.poin}XP*` : ` 𝙿𝙴𝚁𝙳𝙸𝙾 🤡 ${room.poin_lose}XP*`}
*@${room.p2.split`@`[0]} (${room.text2}) ${tie ? '' : room.p2 == win ? ` 𝙶𝙰𝙽𝙾 🥳 +${room.poin}XP*` : ` 𝙿𝙴𝚁𝙳𝙸𝙾 🤡 ${room.poin_lose}XP*`}
`.trim(), m, { mentions: [room.p, room.p2] } )
if (!tie) {
db.data.users[win == room.p ? room.p : room.p2].exp += room.poin
db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot
db.data.users[win == room.p ? room.p2 : room.p].exp += room.poin_lose
}
delete this.suit[room.id]}}
return !0
}
handler.exp = 0
export default handler
function random(arr) {
return arr[Math.floor(Math.random() * arr.length)]}
