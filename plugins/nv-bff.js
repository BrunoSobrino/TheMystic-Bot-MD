import util from 'util'
import path from 'path'
let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/bff.mp3'
conn.sendFile(m.chat, vn, 'bff.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})}
handler.customPrefix = /bebito fiu fiu|bff|Bebito Fiu Fiu|Bff/i
handler.command = new RegExp
handler.fail = null
export default handler
