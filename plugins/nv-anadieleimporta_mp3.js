import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/dylan1.mp3'
conn.sendFile(m.chat, vn, 'dylan1.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})
}
handler.customPrefix = /anadieleimporta|a nadie le importa/i
handler.command = new RegExp

handler.fail = null
handler.exp = 100
export default handler



