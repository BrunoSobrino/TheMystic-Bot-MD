import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/chica lgante.mp3'
conn.sendFile(m.chat, vn, 'chica lgante.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true
})
}
handler.customPrefix = /chica lgante|Chica lgante|Chicalgante|chicalgante|chical gante|Chical gante/
handler.command = new RegExp
export default handler