import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/Fiesta1.mp3'
conn.sendFile(m.chat, vn, 'Fiesta1.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})
}
handler.customPrefix = /fiesta del admin 3|atención grupo|atencion grupo|aviso importante|fiestadeladmin3|fiesta en casa de uriel/i
handler.command = new RegExp
handler.fail = null
handler.exp = 100
export default handler

