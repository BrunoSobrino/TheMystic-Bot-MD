import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/Yamete-kudasai.mp3'
conn.sendFile(m.chat, vn, 'Yamete-kudasai.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true
})
}
handler.customPrefix = /Yamete|yamete|Yamete kudasai|yamete kudasai/
handler.command = new RegExp
export default handler


