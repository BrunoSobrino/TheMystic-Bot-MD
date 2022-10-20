import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/legiovirgen.mp3'
conn.sendFile(m.chat, vn, 'legiovirgen.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})
}
handler.customPrefix = /legiovirgo|Legiovirgo|legiovirgen|legionario|pendejada|pendejadas|virgen/
handler.command = new RegExp
export default handler


