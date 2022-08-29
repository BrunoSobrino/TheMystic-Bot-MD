let handler = async (m, { conn, usedPrefix, text, command }) => {
let hash = text
if (m.quoted && m.quoted.fileSha256) hash = m.quoted.fileSha256.toString('hex')
if (!hash) throw `Solo puedes eliminar comandos asignados de stickers`
let sticker = global.db.data.sticker
if (sticker[hash] && sticker[hash].locked) throw 'No tienes permiso para eliminar este comando de sticker'
delete sticker[hash]
m.reply(`*[ ✔ ] Hecho!*`)}
handler.command = ['delcmd']
handler.rowner = true
export default handler
