let handler = async (m, { conn, text, usedPrefix, command }) => {
global.db.data.sticker = global.db.data.sticker || {}
if (!m.quoted) throw 'Asigna un comando para un sticker usando .setcmd + el comando '
if (!m.quoted.fileSha256) throw 'Solo puedes asignar un comando a stickers/fotos'
if (!text) throw `Uso:\n${usedPrefix + coommand} <texto>\n\nEjemplo:\n${usedPrefix + command} prueba`
let sticker = db.data.sticker
let hash = m.quoted.fileSha256.toString('base64')
if (sticker[hash] && sticker[hash].locked) throw 'No tienes permiso para modificar este comando de stickers.'
sticker[hash] = { text, mentionedJid: m.mentionedJid, creator: m.sender, at: + new Date, locked: false, }
m.reply(`✅Hecho!`)}
handler.command = ['setcmd']
handler.rowner = true
export default handler
