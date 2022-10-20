import util from 'util'
import path from 'path'

let handler = async (m, { conn }) => {
if (!db.data.chats[m.chat].audios && m.isGroup) throw 0
let vn = './media/no-digas-mamadas.mp3'
conn.sendFile(m.chat, vn, 'no-digas-mamadas.mp3', null, m, true, {
type: 'audioMessage', 
ptt: true 
})
}
handler.customPrefix = /No digas mamadas|no digas mamadas|No digas mamadas meriyein|no digas mamadas meriyein|Nodigasmamadas|nodigasmamadas/i
handler.command = new RegExp
export default handler


