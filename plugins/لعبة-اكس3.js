import MessageType from '@adiwajshing/baileys'
let handler = async (m, { conn, usedPrefix, command }) => {
let room = Object.values(conn.game).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender))
if (room == undefined) return conn.sendButton(m.chat, '*[❗] انت لست في لعبه تيك تاك تو (اكس او)*', wm, null, [['ابدأ غرفه جديدة', `${usedPrefix}ttt مباراه جديدة`]], m)
delete conn.game[room.id]
await m.reply('*[ ✔ ] تمت ازاله الغرفه*')}
handler.command = /^(delttt|deltt|delxo|deltictactoe)$/i
handler.fail = null
export default handler