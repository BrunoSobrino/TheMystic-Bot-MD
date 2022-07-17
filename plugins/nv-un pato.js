import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/pato.mp3'
conn.sendFile(m.chat, vn, 'pato.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true
})
}
handler.customPrefix = /un Pato| un pato|un pato que va caminando alegremente|Un pato|Un Pato/
handler.command = new RegExp
export default handler
