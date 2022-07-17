import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/vete a la verga.mp3'
conn.sendFile(m.chat, vn, 'vete a la verga.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})
}
handler.customPrefix = /vetealavrg|vete a la vrg|vete a la verga/i
handler.command = new RegExp
handler.fail = null
handler.exp = 100
export default handler

